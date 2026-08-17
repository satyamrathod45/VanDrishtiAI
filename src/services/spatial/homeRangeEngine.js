// ============================================================
// VanDrishti AI — Tiger Home Range & Utilization Engine
// ============================================================
// Integrates 2D Bivariate Gaussian KDE, Utilization Distribution (UD),
// 50% Core Territory & 95% Home Range polygon generation,
// territorial overlap and settlement proximity risk analysis.
// ============================================================

import * as turf from "@turf/turf";
import { projectPoint, unprojectPoint } from "./projection.js";
import { prepareDetections, calculateActivityProfile } from "./timeFilter.js";
import { calculateKDE } from "./kde.js";

/**
 * Converts a GeoJSON geometry (Polygon or MultiPolygon) into Leaflet-ready [lat, lng] array.
 * @param {Object} geometry GeoJSON geometry object
 * @returns {Array} Leaflet positions array
 */
export function geoJsonToLeafletPositions(geometry) {
  if (!geometry || !geometry.coordinates) return [];

  if (geometry.type === "Polygon") {
    // Polygon: coordinates = [ [ [lng, lat], ... ], [hole] ]
    return geometry.coordinates.map((ring) =>
      ring.map(([lng, lat]) => [lat, lng])
    );
  }

  if (geometry.type === "MultiPolygon") {
    // MultiPolygon: coordinates = [ [ [ [lng, lat], ... ] ] ]
    return geometry.coordinates.map((poly) =>
      poly.map((ring) => ring.map(([lng, lat]) => [lat, lng]))
    );
  }

  return [];
}

/**
 * Computes complete spatial intelligence for a tiger from detections.
 *
 * @param {string} tigerId Tiger ID identifier (e.g. "P-017")
 * @param {Array<Object>} rawDetections All detections for this individual
 * @param {Object} [options]
 * @param {number} [options.bandwidth=500] KDE bandwidth (h) in meters
 * @param {number} [options.gridSize=100] Grid resolution along each axis
 * @param {number} [options.minMinutes=30] Independence interval in minutes
 * @returns {Object} Comprehensive home range model, GeoJSON features, and analytics
 */
export function computeTigerHomeRange(tigerId, rawDetections, options = {}) {
  const bandwidth = options.bandwidth || 500;
  const gridSize = options.gridSize || 100;
  const minMinutes = options.minMinutes || 30;

  // 1. Time-independence filtering
  const independentDetections = prepareDetections(rawDetections, minMinutes);
  const activityProfile = calculateActivityProfile(independentDetections, rawDetections.length);

  if (independentDetections.length < 3) {
    return {
      tigerId,
      status: "insufficient_data",
      message: `Requires at least 3 independent detections (found ${independentDetections.length}).`,
      independentDetections,
      activityProfile,
      core50: null,
      range95: null,
      centroid: null,
      bounds: null,
      densityGrid: [],
      maxDensity: 0,
      geoJson: null,
    };
  }

  // 2. Metric Projection (UTM Zone 44N)
  const projectedPoints = independentDetections.map((detection) => {
    const projected = projectPoint(detection.latitude, detection.longitude);
    return {
      ...detection,
      x: projected.x,
      y: projected.y,
    };
  });

  // 3. 2D Gaussian Kernel Density Estimation
  const kde = calculateKDE(projectedPoints, bandwidth, gridSize);
  const cellArea = kde.cellWidth * kde.cellHeight;

  // 4. Utilization Distribution Probability Mass
  const cells = kde.grid.map((cell) => ({
    ...cell,
    probabilityMass: cell.density * cellArea,
  }));

  const totalMass = cells.reduce((sum, cell) => sum + cell.probabilityMass, 0);

  if (totalMass > 0) {
    cells.forEach((cell) => {
      cell.probability = cell.probabilityMass / totalMass;
    });
  } else {
    cells.forEach((cell) => {
      cell.probability = 0;
    });
  }

  // Sort descending by density to accumulate probability mass from densest core outwards
  cells.sort((a, b) => b.density - a.density);

  let cumulative = 0;
  for (const cell of cells) {
    cumulative += cell.probability;
    cell.cumulative = cumulative;
  }

  // 5. Extract Isopleths: 50% Core Area & 95% Home Range
  const selected50 = cells.filter((cell) => cell.cumulative <= 0.50);
  const selected95 = cells.filter((cell) => cell.cumulative <= 0.95);

  // 6. Generate Polygons
  const core50 = createUtilizationPolygon(tigerId, selected50, 50, bandwidth, independentDetections.length);
  const range95 = createUtilizationPolygon(tigerId, selected95, 95, bandwidth, independentDetections.length);

  // 7. Calculate Activity Centroid (Density-weighted mean)
  let sumWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const d of independentDetections) {
    const weight = (d.confidence || 90) / 100;
    weightedLat += d.latitude * weight;
    weightedLng += d.longitude * weight;
    sumWeight += weight;

    minLat = Math.min(minLat, d.latitude);
    maxLat = Math.max(maxLat, d.latitude);
    minLng = Math.min(minLng, d.longitude);
    maxLng = Math.max(maxLng, d.longitude);
  }

  const centroid = sumWeight > 0
    ? [Number((weightedLat / sumWeight).toFixed(6)), Number((weightedLng / sumWeight).toFixed(6))]
    : [independentDetections[0].latitude, independentDetections[0].longitude];

  // Bounding box with buffer for camera/view centering
  const bounds = [
    [minLat - 0.03, minLng - 0.03],
    [maxLat + 0.03, maxLng + 0.03],
  ];

  // 8. Bounding Envelope (Convex Hull polygon bounding all active station points)
  const pointsFeatureCollection = turf.featureCollection(
    independentDetections.map((d) => turf.point([d.longitude, d.latitude]))
  );
  let envelopePolygon;
  try {
    envelopePolygon = turf.convex(pointsFeatureCollection);
  } catch {
    envelopePolygon = null;
  }
  const envelopePositions = envelopePolygon ? geoJsonToLeafletPositions(envelopePolygon.geometry) : [];
  const envelopeAreaKm2 = envelopePolygon ? Number((turf.area(envelopePolygon) / 1000000).toFixed(2)) : 0;

  // 9. Density Raster / Heatmap cells for visualization (sample grid for UI performance)
  const densityGrid = kde.grid
    .filter((c) => c.density > kde.maxDensity * 0.08) // Filter lowest 8% for clean rendering
    .map((c) => {
      const geo = unprojectPoint(c.x, c.y);
      return {
        lat: geo.latitude,
        lng: geo.longitude,
        intensity: kde.maxDensity > 0 ? c.density / kde.maxDensity : 0,
        density: c.density,
      };
    });

  // 10. Standard GeoJSON FeatureCollection Output
  const geoJson = buildGeoJsonFeatureCollection(
    tigerId,
    core50,
    range95,
    envelopePolygon ? { ...envelopePolygon, properties: { tiger_id: tigerId, type: "bounding_envelope", area_km2: envelopeAreaKm2 } } : null,
    independentDetections,
    centroid,
    bandwidth
  );

  return {
    tigerId,
    status: "computed",
    bandwidth,
    gridSize,
    minMinutes,
    independentDetections,
    activityProfile,
    core50,
    range95,
    envelope: {
      positions: envelopePositions,
      area_km2: envelopeAreaKm2,
    },
    centroid,
    bounds,
    densityGrid,
    maxDensity: kde.maxDensity,
    geoJson,
  };
}

/**
 * Creates a GeoJSON single Polygon from selected grid cells using convex hulls.
 */
function createUtilizationPolygon(tigerId, selectedCells, percentage, bandwidth, detectionCount) {
  if (!selectedCells || selectedCells.length < 3) {
    return null;
  }

  // Convert grid cells to geographic points
  const points = selectedCells.map((cell) => {
    const geo = unprojectPoint(cell.x, cell.y);
    return turf.point([geo.longitude, geo.latitude]);
  });

  const collection = turf.featureCollection(points);

  let polygon;
  try {
    polygon = turf.convex(collection);
  } catch {
    polygon = null;
  }

  if (!polygon || polygon.geometry.type !== "Polygon") {
    return null;
  }

  // Calculate true geodesic area in km²
  const areaM2 = turf.area(polygon);
  const areaKm2 = Number((areaM2 / 1000000).toFixed(2));

  // Extract Leaflet-friendly positions array (single polygon ring: [ [lat, lng], ... ])
  const leafletPositions = polygon.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

  return {
    tigerId,
    type: percentage === 50 ? "core" : "range",
    utilization: percentage,
    area_km2: areaKm2,
    bandwidth_m: bandwidth,
    independent_detections: detectionCount,
    positions: leafletPositions,
    geoJsonFeature: {
      type: "Feature",
      geometry: polygon.geometry,
      properties: {
        tiger_id: tigerId,
        type: percentage === 50 ? "core" : "range",
        name: percentage === 50 ? "50% Core Territory" : "95% Home Range",
        utilization: percentage,
        area_km2: areaKm2,
        bandwidth_m: bandwidth,
        independent_detections: detectionCount,
      },
    },
  };
}

/**
 * Computes territory overlap between two tiger range models.
 */
export function calculateTerritoryOverlap(rangeA, rangeB) {
  if (!rangeA || !rangeB || !rangeA.geoJsonFeature || !rangeB.geoJsonFeature) {
    return {
      overlapKm2: 0,
      overlapAreaKm2: 0,
      overlapPercentA: 0,
      overlapPercentB: 0,
      percentageA: 0,
      percentageB: 0,
      trend: "None",
      hasOverlap: false,
    };
  }

  try {
    const polyA = turf.polygon(rangeA.geoJsonFeature.geometry.coordinates);
    const polyB = turf.polygon(rangeB.geoJsonFeature.geometry.coordinates);

    const intersection = turf.intersect(
      turf.featureCollection([polyA, polyB])
    );

    if (!intersection) {
      return {
        overlapKm2: 0,
        overlapAreaKm2: 0,
        overlapPercentA: 0,
        overlapPercentB: 0,
        percentageA: 0,
        percentageB: 0,
        trend: "Isolated",
        hasOverlap: false,
      };
    }

    const overlapAreaM2 = turf.area(intersection);
    const overlapKm2 = Number((overlapAreaM2 / 1000000).toFixed(2));

    const percentageA = rangeA.area_km2 > 0
      ? Number(((overlapKm2 / rangeA.area_km2) * 100).toFixed(1))
      : 0;

    const percentageB = rangeB.area_km2 > 0
      ? Number(((overlapKm2 / rangeB.area_km2) * 100).toFixed(1))
      : 0;

    let trend = "Stable";
    if (overlapKm2 > 8) trend = "High Conflict Risk";
    else if (overlapKm2 > 3) trend = "Moderate Overlap";

    return {
      overlapKm2,
      overlapAreaKm2: overlapKm2,
      overlapPercentA: percentageA,
      overlapPercentB: percentageB,
      percentageA,
      percentageB,
      trend,
      hasOverlap: overlapKm2 > 0,
    };
  } catch {
    return {
      overlapKm2: 0,
      overlapAreaKm2: 0,
      overlapPercentA: 0,
      overlapPercentB: 0,
      percentageA: 0,
      percentageB: 0,
      trend: "Error",
      hasOverlap: false,
    };
  }
}

/**
 * Computes proximity of tiger centroid to human settlements.
 */
export function calculateSettlementProximities(centroid, settlements) {
  if (!centroid || !settlements || settlements.length === 0) {
    return [];
  }

  const tigerPoint = turf.point([centroid[1], centroid[0]]);

  return settlements.map((settlement) => {
    const settlementPoint = turf.point([settlement.position[1], settlement.position[0]]);
    const distanceKm = Number(turf.distance(tigerPoint, settlementPoint, { units: "kilometers" }).toFixed(2));

    let riskLevel = "Low";
    if (distanceKm < 4.0) riskLevel = "Critical";
    else if (distanceKm < 7.0) riskLevel = "Moderate";

    return {
      ...settlement,
      distanceKm,
      riskLevel,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Assembles full GIS GeoJSON FeatureCollection with single Polygons and unique camera station Point features.
 */
function buildGeoJsonFeatureCollection(tigerId, core50, range95, envelopeFeature, detections, centroid, bandwidth) {
  const features = [];

  // 1. Single 95% Home Range Polygon
  if (range95?.geoJsonFeature) {
    features.push(range95.geoJsonFeature);
  }

  // 2. Single 50% Core Territory Polygon
  if (core50?.geoJsonFeature) {
    features.push(core50.geoJsonFeature);
  }

  // 3. Activity Centroid Point
  if (centroid) {
    features.push(
      turf.point([centroid[1], centroid[0]], {
        tiger_id: tigerId,
        type: "centroid",
        latitude: centroid[0],
        longitude: centroid[1],
        description: "Probability-weighted activity centroid",
      })
    );
  }

  // 4. Group detections by unique camera station (Single point per station with count badge)
  const stationMap = new Map();
  for (const d of detections) {
    const key = d.camera_id || `${d.latitude},${d.longitude}`;
    if (!stationMap.has(key)) {
      stationMap.set(key, {
        camera_id: d.camera_id,
        latitude: d.latitude,
        longitude: d.longitude,
        detection_count: 1,
        latest_timestamp: d.timestamp,
        confidence: d.confidence || 90,
        has_night: d.isNight || false,
        has_day: !d.isNight,
      });
    } else {
      const stn = stationMap.get(key);
      stn.detection_count += 1;
      stn.latest_timestamp = d.timestamp;
      if (d.confidence && d.confidence > stn.confidence) {
        stn.confidence = d.confidence;
      }
      if (d.isNight) stn.has_night = true;
      if (!d.isNight) stn.has_day = true;
    }
  }

  for (const stn of stationMap.values()) {
    features.push(
      turf.point([stn.longitude, stn.latitude], {
        tiger_id: tigerId,
        type: "camera_station_observation",
        camera_id: stn.camera_id,
        detection_count: stn.detection_count,
        latest_timestamp: stn.latest_timestamp,
        confidence: stn.confidence,
        diel_rhythm: stn.has_night && stn.has_day ? "Cathemeral (Day & Night)" : stn.has_night ? "Nocturnal" : "Diurnal",
        badge: `${stn.detection_count} capture${stn.detection_count > 1 ? "s" : ""}`,
      })
    );
  }

  return {
    type: "FeatureCollection",
    metadata: {
      generator: "VanDrishti AI Spatial Intelligence Engine",
      tiger_id: tigerId,
      bandwidth_m: bandwidth,
      generated_at: new Date().toISOString(),
      core_area_km2: core50?.area_km2 || null,
      total_range_km2: range95?.area_km2 || null,
      unique_camera_stations: stationMap.size,
      total_detections: detections.length,
    },
    features,
  };
}

/**
 * Downloads GeoJSON file in browser or Electron.
 * @param {Object} geoJson
 * @param {string} filename
 */
export function exportGeoJsonFile(geoJson, filename = "tiger_spatial_intelligence.geojson") {
  const blob = new Blob([JSON.stringify(geoJson, null, 2)], {
    type: "application/geo+json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
