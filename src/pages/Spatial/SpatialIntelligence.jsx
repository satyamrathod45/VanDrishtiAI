// ============================================================
// VanDrishti AI — Spatial Intelligence & Movement Ecology
// ============================================================
// Clean, modern GIS workspace integrating:
// - 2D Bivariate Gaussian Kernel Density Estimation (KDE)
// - 50% Core Territory & 95% Home Range Utilization Distributions
// - Time-Independence Filtering & Diurnal Activity Profiling
// - Multi-Tiger Overlap Matrix & Settlement Proximity Risk
// - Standard GIS GeoJSON Exporter for Forest Field Teams
// ============================================================

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Download,
  Eye,
  FileDown,
  Flame,
  Layers3,
  MapPin,
  Maximize2,
  Moon,
  Navigation,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Sparkles,
  SunMedium,
  Target,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  penchMapConfig,
  spatialTigers,
  spatialCameras,
  settlements,
  managementZones,
} from "../../mock/spatialMockData";

import { masterTigerDetections } from "../../services/spatial/tigerDetectionData";
import {
  computeTigerHomeRange,
  calculateTerritoryOverlap,
  calculateSettlementProximities,
  exportGeoJsonFile,
} from "../../services/spatial/homeRangeEngine";

// ============================================================
// TIGER COLOR PALETTES & GIS STYLING
// ============================================================
export const TIGER_PALETTES = {
  "P-017": {
    name: "P-017 (Adult Female)",
    rangeColor: "#ea580c", // Amber-Orange
    rangeFill: "#ea580c",
    coreColor: "#c2410c",
    coreFill: "#ea580c",
    pointColor: "#ea580c",
    badgeBg: "#9a3412",
    tagColor: "amber",
    offset: [0.0012, -0.0012], // Micro-offset for shared camera stations in ALL view
  },
  "P-021": {
    name: "P-021 (Adult Male)",
    rangeColor: "#059669", // Emerald Green
    rangeFill: "#059669",
    coreColor: "#047857",
    coreFill: "#059669",
    pointColor: "#059669",
    badgeBg: "#065f46",
    tagColor: "emerald",
    offset: [-0.0012, -0.0012],
  },
  "P-032": {
    name: "P-032 (Adult Male)",
    rangeColor: "#7c3aed", // Royal Purple / Indigo
    rangeFill: "#7c3aed",
    coreColor: "#6d28d9",
    coreFill: "#7c3aed",
    pointColor: "#7c3aed",
    badgeBg: "#581c87",
    tagColor: "purple",
    offset: [0.0012, 0.0012],
  },
};

// ============================================================
// MAIN SPATIAL INTELLIGENCE DASHBOARD
// ============================================================

export default function SpatialIntelligence() {
  // Active Selected Tiger ("ALL" or specific ID)
  const [selectedTigerId, setSelectedTigerId] = useState("ALL");

  // Selected Entities
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedObservation, setSelectedObservation] = useState(null);

  // KDE Algorithm Parameters (Real-time Interactive Tuning)
  const [bandwidth, setBandwidth] = useState(500); // meters (h)
  const [gridSize, setGridSize] = useState(100); // N x N grid
  const [minMinutes, setMinMinutes] = useState(30); // Δt independence minutes
  const [showKdeDrawer, setShowKdeDrawer] = useState(false);

  // Visual Layer Toggles (Focused strictly on Tiger Territories & Detections)
  const [showCore50, setShowCore50] = useState(true);
  const [showRange95, setShowRange95] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSightings, setShowSightings] = useState(true);
  const [showCameras, setShowCameras] = useState(false);
  const [showReserveBoundaries, setShowReserveBoundaries] = useState(false);
  const [showSettlements, setShowSettlements] = useState(false);

  // ------------------------------------------------------------
  // 1. Calculate Live Spatial Intelligence for All Resident Tigers
  // ------------------------------------------------------------
  const allTigersData = useMemo(() => {
    return spatialTigers.map((t) => {
      const rawDets = masterTigerDetections.filter((d) => d.tiger_id === t.id);
      const computedRange = computeTigerHomeRange(t.id, rawDets, {
        bandwidth,
        gridSize,
        minMinutes,
      });

      // Group sightings by unique camera station point (with capture count badge)
      const stationMap = new Map();
      if (computedRange?.independentDetections) {
        for (const obs of computedRange.independentDetections) {
          const key = `${obs.camera_id || `${obs.latitude},${obs.longitude}`}`;
          if (!stationMap.has(key)) {
            stationMap.set(key, {
              id: `${t.id}-${obs.camera_id || key}`,
              camera_id: obs.camera_id,
              latitude: obs.latitude,
              longitude: obs.longitude,
              tiger_id: t.id,
              count: 1,
              sightings: [obs],
              maxConfidence: obs.confidence || 90,
              latestDate: obs.date,
              latestTime: obs.timeString,
              hasNight: obs.isNight,
              hasDay: !obs.isNight,
            });
          } else {
            const item = stationMap.get(key);
            item.count += 1;
            item.sightings.push(obs);
            if (obs.confidence > item.maxConfidence) item.maxConfidence = obs.confidence;
            if (obs.isNight) item.hasNight = true;
            if (!obs.isNight) item.hasDay = true;
            item.latestDate = obs.date;
            item.latestTime = obs.timeString;
          }
        }
      }

      const palette = TIGER_PALETTES[t.id] || {
        rangeColor: "#ea580c",
        rangeFill: "#ea580c",
        coreColor: "#c2410c",
        coreFill: "#ea580c",
        pointColor: "#ea580c",
        badgeBg: "#09090b",
        offset: [0, 0],
      };

      return {
        tiger: t,
        homeRange: computedRange,
        rawDetections: rawDets,
        stations: Array.from(stationMap.values()),
        palette,
      };
    });
  }, [bandwidth, gridSize, minMinutes]);

  // Primary active tiger (or first tiger if ALL selected)
  const activeTigerItem = useMemo(() => {
    if (selectedTigerId === "ALL") return allTigersData[0];
    return allTigersData.find((d) => d.tiger.id === selectedTigerId) || allTigersData[0];
  }, [allTigersData, selectedTigerId]);

  const selectedTiger = activeTigerItem?.tiger || spatialTigers[0];
  const homeRange = activeTigerItem?.homeRange;
  const rawDetectionsForSelectedTiger = activeTigerItem?.rawDetections || [];
  const groupedTigerStations = activeTigerItem?.stations || [];

  // Filter tigers to render on map
  const tigersToRender = useMemo(() => {
    if (selectedTigerId === "ALL") return allTigersData;
    return allTigersData.filter((d) => d.tiger.id === selectedTigerId);
  }, [allTigersData, selectedTigerId]);

  // Compute active map bounding box covering all rendered tigers
  const activeBounds = useMemo(() => {
    if (selectedTigerId !== "ALL") {
      return homeRange?.bounds || penchMapConfig.bounds;
    }
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    allTigersData.forEach((d) => {
      if (d.homeRange?.bounds) {
        minLat = Math.min(minLat, d.homeRange.bounds[0][0]);
        minLng = Math.min(minLng, d.homeRange.bounds[0][1]);
        maxLat = Math.max(maxLat, d.homeRange.bounds[1][0]);
        maxLng = Math.max(maxLng, d.homeRange.bounds[1][1]);
      }
    });
    if (minLat < maxLat && minLng < maxLng) {
      return [[minLat - 0.015, minLng - 0.015], [maxLat + 0.015, maxLng + 0.015]];
    }
    return penchMapConfig.bounds;
  }, [allTigersData, homeRange, selectedTigerId]);

  // ------------------------------------------------------------
  // 2. Compute Multi-Tiger Territorial Overlap Matrix
  // ------------------------------------------------------------
  const otherTigersComputed = useMemo(() => {
    const focusRange = homeRange;
    const others = allTigersData.filter((d) => d.tiger.id !== selectedTiger.id);
    return others.map((item) => {
      const overlap = calculateTerritoryOverlap(focusRange?.range95, item.homeRange?.range95);
      return {
        tiger: item.tiger,
        homeRange: item.homeRange,
        overlap,
      };
    });
  }, [allTigersData, homeRange, selectedTiger]);

  // ------------------------------------------------------------
  // 3. Compute Human Settlement Proximity & Conflict Risk
  // ------------------------------------------------------------
  const settlementProximities = useMemo(() => {
    if (!homeRange?.centroid) return [];
    return calculateSettlementProximities(homeRange.centroid, settlements);
  }, [homeRange]);

  // Active Camera Selection Data
  const selectedCameraData = spatialCameras.find((c) => c.id === selectedCamera);

  // GeoJSON Export Handler (Downloads individual or master dataset)
  const handleExportGeoJson = () => {
    if (selectedTigerId === "ALL") {
      const combinedFeatures = [];
      allTigersData.forEach((d) => {
        if (d.homeRange?.geoJson?.features) {
          combinedFeatures.push(...d.homeRange.geoJson.features);
        }
      });

      const masterGeoJson = {
        type: "FeatureCollection",
        metadata: {
          title: "Pench Tiger Reserve — Master Multi-Tiger Spatial Intelligence",
          project: "VanDrishti AI",
          bandwidth_m: bandwidth,
          generated_at: new Date().toISOString(),
          tigers: spatialTigers.map((t) => t.id),
        },
        features: combinedFeatures,
      };

      exportGeoJsonFile(masterGeoJson, "Pench_Master_All_Tigers_Spatial_Intelligence.geojson");
    } else if (homeRange?.geoJson) {
      exportGeoJsonFile(
        homeRange.geoJson,
        `Pench_${selectedTiger.id}_KDE_HomeRange_UD.geojson`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] pb-36 text-zinc-900 font-sans selection:bg-[#e97813]/20">
      {/* ======================================================
          TOP GIS COMMAND BAR
      ====================================================== */}
      <header className="sticky top-0 z-[600] border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
        <div className="mx-auto max-w-[1720px] px-5 py-3.5 md:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* BRANDING & REGION */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e97813]/10 text-[#d86b0e]">
                  <Navigation size={14} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#d86b0e]">
                  VanDrishti Spatial AI · Pench Tiger Reserve
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  UTM Zone 44N Active
                </span>
              </div>

              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-zinc-900 md:text-2xl flex items-center gap-3">
                Spatial Intelligence & Territory Analysis
                <span className="rounded-lg bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 font-mono">
                  h = {bandwidth}m · Δt = {minMinutes}m
                </span>
              </h1>
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* TIGER SELECTOR DROPDOWN */}
              <div className="flex items-center rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-1.5 shadow-xs">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Resident:
                </span>
                <select
                  value={selectedTigerId}
                  onChange={(e) => {
                    setSelectedTigerId(e.target.value);
                    setSelectedCamera(null);
                    setSelectedObservation(null);
                  }}
                  className="bg-transparent text-xs font-bold text-zinc-900 outline-none cursor-pointer"
                >
                  <option value="ALL">
                    🐾 ALL RESIDENT TIGERS (Multi-Territory View)
                  </option>
                  {spatialTigers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} · {t.sex} ({t.age})
                    </option>
                  ))}
                </select>
              </div>

              {/* KDE PARAMETERS DRAWER TOGGLE */}
              <button
                onClick={() => setShowKdeDrawer(!showKdeDrawer)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer ${
                  showKdeDrawer
                    ? "border-[#e97813] bg-[#fffaf3] text-[#d86b0e]"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <Sliders size={13} className={showKdeDrawer ? "text-[#d86b0e]" : "text-zinc-500"} />
                <span>KDE Tuning</span>
              </button>

              {/* EXPORT GIS GEOJSON BUTTON */}
              <button
                onClick={handleExportGeoJson}
                disabled={!homeRange?.geoJson}
                title="Download QGIS / ArcGIS GeoJSON FeatureCollection"
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <FileDown size={13} />
                <span>Export GeoJSON</span>
              </button>
            </div>
          </div>

          {/* LOWER STATUS STRIP */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-2.5">
            {/* ACTIVE TERRITORY BADGE */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-zinc-800">
                {selectedTigerId === "ALL"
                  ? "🐾 Multi-Tiger Territory Spatial Model (Live)"
                  : `🐅 ${selectedTiger.id} (${selectedTiger.sex}) · 2D Bivariate Gaussian KDE`}
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-500 font-mono">
                EPSG:32644 (UTM 44N)
              </span>
            </div>

            {/* LIVE KPI STATS */}
            <div className="flex items-center gap-4 text-[11px] text-zinc-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c2410c]" />
                <strong>50% Core:</strong>{" "}
                <span className="font-mono text-zinc-900 font-bold">
                  {homeRange?.core50?.area_km2 ? `${homeRange.core50.area_km2} km²` : "—"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e97813]/70 border border-[#e97813]" />
                <strong>95% Home Range:</strong>{" "}
                <span className="font-mono text-zinc-900 font-bold">
                  {homeRange?.range95?.area_km2 ? `${homeRange.range95.area_km2} km²` : "—"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <strong>Independent Sightings:</strong>{" "}
                <span className="font-mono text-zinc-900 font-bold">
                  {homeRange?.independentDetections?.length || 0} / {rawDetectionsForSelectedTiger.length}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
          INTERACTIVE KDE PARAMETER TUNING DRAWER (EXPANDABLE)
      ====================================================== */}
      {showKdeDrawer && (
        <section className="mx-auto max-w-[1720px] px-5 py-4 md:px-8 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-amber-200/80 bg-[#fffcf8] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#d86b0e]" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Real-time Bivariate Gaussian KDE Engine Controls
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                Adjusting parameters instantly recomputes the continuous probability surface
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* BANDWIDTH (h) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700">Kernel Bandwidth (h)</span>
                  <span className="font-mono font-bold text-[#d86b0e] bg-amber-100/70 px-2 py-0.5 rounded">
                    {bandwidth} meters
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1200"
                  step="50"
                  value={bandwidth}
                  onChange={(e) => setBandwidth(Number(e.target.value))}
                  className="w-full accent-[#e97813] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
                  <span>200m (Tight Local Core)</span>
                  <span>500m (Ecological Standard)</span>
                  <span>1200m (Broad Landscape)</span>
                </div>
              </div>

              {/* INDEPENDENCE INTERVAL (Δt) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700">Independence Threshold (Δt)</span>
                  <span className="font-mono font-bold text-[#d86b0e] bg-amber-100/70 px-2 py-0.5 rounded">
                    {minMinutes} minutes
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setMinMinutes(mins)}
                      className={`rounded-lg py-1.5 text-xs font-bold border transition cursor-pointer ${
                        minMinutes === mins
                          ? "border-[#e97813] bg-[#e97813] text-white shadow-xs"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-zinc-500">
                  Prunes camera trap burst detections to eliminate statistical autocorrelation.
                </p>
              </div>

              {/* GRID DISCRETIZATION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700">Grid Discretization (N×N)</span>
                  <span className="font-mono font-bold text-[#d86b0e] bg-amber-100/70 px-2 py-0.5 rounded">
                    {gridSize} × {gridSize} ({gridSize * gridSize} cells)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[60, 100, 140].map((size) => (
                    <button
                      key={size}
                      onClick={() => setGridSize(size)}
                      className={`rounded-lg py-1.5 text-xs font-bold border transition cursor-pointer ${
                        gridSize === size
                          ? "border-[#e97813] bg-[#e97813] text-white shadow-xs"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {size === 60 ? "Fast (60)" : size === 100 ? "Balanced (100)" : "HD (140)"}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-zinc-500">
                  Higher grid counts calculate smoother isopleths with exact geodesic surface area.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          MAIN WORKSPACE (MAP & ANALYTICS SIDEBAR)
      ====================================================== */}
      <main className="mx-auto max-w-[1720px] px-5 py-5 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* ==================================================
              LEAFLET GIS MAP CONTAINER
          ================================================== */}
          <section className="relative isolate z-0 overflow-hidden rounded-[26px] border border-zinc-200/90 bg-white shadow-sm">
            <MapContainer
              center={homeRange.centroid || penchMapConfig.center}
              zoom={penchMapConfig.defaultZoom}
              minZoom={penchMapConfig.minZoom}
              maxZoom={penchMapConfig.maxZoom}
              maxBounds={penchMapConfig.bounds}
              maxBoundsViscosity={1}
              scrollWheelZoom
              className="h-[700px] w-full md:h-[780px]"
            >
              {/* AUTO-CENTER CONTROLLER */}
              <MapCenterController
                bounds={activeBounds}
                centroid={selectedTigerId === "ALL" ? penchMapConfig.center : homeRange?.centroid}
              />

              {/* OFFLINE-FIRST PENCH RESERVE BASEMAP TILE LAYER */}
              <TileLayer
                attribution="&copy; OpenStreetMap contributors &bull; Pench Tiger Reserve"
                url="/tiles/{z}/{x}/{y}.png"
                minZoom={penchMapConfig.minZoom}
                maxZoom={penchMapConfig.maxZoom}
                bounds={penchMapConfig.bounds}
              />

              {/* 2. PENCH RESERVE BOUNDARY OUTLINES (MINIMAL & UNCLUTTERED) */}
              {showReserveBoundaries && (
                <>
                  {/* SUBTLE CORE BOUNDARY OUTLINE */}
                  {managementZones.nationalPark && (
                    <Polygon
                      positions={managementZones.nationalPark}
                      pathOptions={{
                        color: "#059669",
                        fillOpacity: 0.03,
                        fillColor: "#059669",
                        weight: 1.5,
                        dashArray: "5 5",
                      }}
                    >
                      <Tooltip sticky>
                        <strong className="text-emerald-800">Pench Core Zone Boundary</strong>
                      </Tooltip>
                    </Polygon>
                  )}

                  {/* SUBTLE BUFFER BOUNDARY OUTLINE */}
                  {managementZones.buffer && (
                    <Polygon
                      positions={managementZones.buffer}
                      pathOptions={{
                        color: "#71717a",
                        fillOpacity: 0,
                        weight: 1.2,
                        dashArray: "6 6",
                      }}
                    >
                      <Tooltip sticky>
                        <strong className="text-zinc-700">Pench Outer Buffer Boundary</strong>
                      </Tooltip>
                    </Polygon>
                  )}
                </>
              )}

              {/* ============================================================
                  MULTI-TIGER TERRITORY LAYERS & OBSERVATION POINTS
              ============================================================ */}
              {tigersToRender.map((item) => {
                const tId = item.tiger.id;
                const pal = item.palette;
                const hRange = item.homeRange;

                return (
                  <React.Fragment key={`tiger-layers-${tId}`}>
                    {/* 3. CONTINUOUS KDE DENSITY HEATMAP CELLS FOR THIS TIGER */}
                    {showHeatmap &&
                      hRange?.densityGrid &&
                      hRange.densityGrid.map((pt, i) => (
                        <CircleMarker
                          key={`density-${tId}-${bandwidth}-${i}`}
                          center={[pt.lat, pt.lng]}
                          radius={4 + pt.intensity * 9}
                          pathOptions={{
                            stroke: false,
                            fillColor: pt.intensity > 0.6 ? pal.coreColor : pal.rangeColor,
                            fillOpacity: pt.intensity * 0.48,
                          }}
                        >
                          <Tooltip>
                            <div className="text-[10px] font-sans">
                              <strong style={{ color: pal.coreColor }}>{tId}</strong> ({item.tiger.sex}) KDE Heatmap
                              <br />
                              <span className="text-zinc-500 font-mono">
                                Density Intensity: {(pt.intensity * 100).toFixed(0)}%
                              </span>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}

                    {/* 3.5. BOUNDING ENVELOPE (MINIMUM CONVEX BOUNDING BOX) */}
                    {showEnvelope &&
                      hRange?.envelope?.positions &&
                      hRange.envelope.positions.length > 0 && (
                        <Polygon
                          key={`envelope-${tId}`}
                          positions={hRange.envelope.positions}
                          pathOptions={{
                            color: pal.rangeColor,
                            fillColor: pal.rangeFill,
                            fillOpacity: 0.08,
                            weight: 1.6,
                            dashArray: "6 4",
                          }}
                        >
                          <Tooltip sticky>
                            <div className="text-xs p-1 font-sans">
                              <strong style={{ color: pal.rangeColor }}>
                                {tId} · Bounding Box Envelope
                              </strong>
                              <p className="mt-0.5 font-mono text-zinc-700">
                                Bounding Area: <strong>{hRange.envelope.area_km2} km²</strong>
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {item.tiger.sex} ({item.tiger.age})
                              </p>
                            </div>
                          </Tooltip>
                        </Polygon>
                      )}

                    {/* 4. 95% HOME RANGE SINGLE POLYGON (TOTAL UTILIZATION) */}
                    {showRange95 &&
                      hRange?.range95?.positions &&
                      hRange.range95.positions.length > 0 && (
                        <Polygon
                          key={`range95-${tId}-${bandwidth}-${gridSize}`}
                          positions={hRange.range95.positions}
                          pathOptions={{
                            color: pal.rangeColor,
                            fillColor: pal.rangeFill,
                            fillOpacity: 0.14,
                            weight: 2,
                          }}
                        >
                          <Tooltip sticky>
                            <div className="text-xs p-1 font-sans">
                              <strong style={{ color: pal.rangeColor }}>
                                {tId} · 95% Home Range
                              </strong>
                              <p className="mt-0.5 font-mono text-zinc-700">
                                Area: <strong>{hRange.range95.area_km2} km²</strong>
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {item.tiger.sex} · Bandwidth {bandwidth}m
                              </p>
                            </div>
                          </Tooltip>
                        </Polygon>
                      )}

                    {/* 5. 50% CORE TERRITORY SINGLE POLYGON (CORE OCCUPANCY) */}
                    {showCore50 &&
                      hRange?.core50?.positions &&
                      hRange.core50.positions.length > 0 && (
                        <Polygon
                          key={`core50-${tId}-${bandwidth}-${gridSize}`}
                          positions={hRange.core50.positions}
                          pathOptions={{
                            color: pal.coreColor,
                            fillColor: pal.coreFill,
                            fillOpacity: 0.32,
                            weight: 2.5,
                          }}
                        >
                          <Tooltip sticky>
                            <div className="text-xs p-1 font-sans">
                              <strong style={{ color: pal.coreColor }}>
                                {tId} · 50% Core Territory
                              </strong>
                              <p className="mt-0.5 font-mono text-zinc-700">
                                Core Area: <strong>{hRange.core50.area_km2} km²</strong>
                              </p>
                              <p className="text-[10px] text-zinc-400">50% Cumulative Probability Mass</p>
                            </div>
                          </Tooltip>
                        </Polygon>
                      )}

                    {/* 7. ACTIVITY CENTROID (WEIGHTED PROBABILITY CENTER) */}
                    {(showCore50 || showRange95 || showSightings) && hRange?.centroid && (
                      <Marker
                        key={`centroid-${tId}`}
                        position={hRange.centroid}
                        icon={createCentroidIcon(pal.coreColor)}
                      >
                        <Popup>
                          <div className="min-w-[190px] p-1 font-sans">
                            <p
                              className="text-[9px] font-bold uppercase tracking-wider"
                              style={{ color: pal.rangeColor }}
                            >
                              KDE Activity Centroid
                            </p>
                            <p className="mt-1 text-sm font-bold text-zinc-900">
                              {tId} ({item.tiger.sex})
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-zinc-600">
                              {hRange.centroid[0].toFixed(4)}° N, {hRange.centroid[1].toFixed(4)}° E
                            </p>
                            <p className="mt-1.5 text-[9px] text-zinc-400 leading-normal border-t border-zinc-100 pt-1.5">
                              Probability-weighted center of gravity calculated from {hRange.independentDetections?.length} verified independent sightings.
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* 8. OBSERVATION STATIONS (POINTS FOR EACH TIGER IN ITS DISTINCT COLOR) */}
                    {showSightings &&
                      item.stations.map((stn, idx) => {
                        const offsetLat = selectedTigerId === "ALL" && pal.offset ? stn.latitude + pal.offset[0] : stn.latitude;
                        const offsetLng = selectedTigerId === "ALL" && pal.offset ? stn.longitude + pal.offset[1] : stn.longitude;

                        return (
                          <Marker
                            key={`station-${tId}-${stn.camera_id || idx}`}
                            position={[offsetLat, offsetLng]}
                            icon={createTigerStationIcon(stn.count, stn.hasNight, stn.hasDay, pal.pointColor, pal.badgeBg)}
                            eventHandlers={{
                              click: () => {
                                setSelectedObservation(stn.id);
                                setSelectedCamera(stn.camera_id);
                              },
                            }}
                          >
                            <Popup>
                              <div className="min-w-[195px] p-1 text-xs font-sans">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: pal.pointColor }}
                                    />
                                    <strong className="text-zinc-900 font-bold">{stn.tiger_id}</strong>
                                    <span className="text-[10px] text-zinc-500">({item.tiger.sex})</span>
                                  </div>
                                  <span
                                    className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                                    style={{ backgroundColor: `${pal.rangeColor}18`, color: pal.coreColor }}
                                  >
                                    {stn.maxConfidence}% Re-ID
                                  </span>
                                </div>
                                <p className="mt-1.5 text-[11px] font-semibold text-zinc-800">
                                  Station: {stn.camera_id}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-mono">
                                  Latest: {stn.latestDate} · {stn.latestTime}
                                </p>
                                <div className="mt-1.5 flex items-center justify-between rounded bg-zinc-50 px-2 py-1 text-[9px]">
                                  <span className="font-semibold text-zinc-700">Captures at station:</span>
                                  <span className="font-bold font-mono" style={{ color: pal.coreColor }}>
                                    {stn.count} capture{stn.count > 1 ? "s" : ""}
                                  </span>
                                </div>
                                <p className="text-[9px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Verified Detection Station
                                </p>
                              </div>
                            </Popup>
                            <Tooltip>
                              <div className="text-xs font-sans">
                                <strong style={{ color: pal.coreColor }}>{stn.tiger_id}</strong> · {stn.camera_id}
                                <br />
                                <span className="text-zinc-600 text-[10px]">
                                  {stn.count} Sighting{stn.count > 1 ? "s" : ""} · {stn.latestDate} {stn.latestTime}
                                </span>
                              </div>
                            </Tooltip>
                          </Marker>
                        );
                      })}
                  </React.Fragment>
                );
              })}

              {/* 9. CAMERA TRAP STATIONS */}
              {showCameras &&
                spatialCameras.map((camera) => (
                  <Marker
                    key={camera.id}
                    position={camera.position}
                    icon={createCameraIcon(camera.status)}
                    eventHandlers={{
                      click: () => {
                        setSelectedCamera(camera.id);
                        setSelectedObservation(null);
                      },
                    }}
                  >
                    <Tooltip>
                      <strong className="font-sans">{camera.id}</strong> ({camera.gridId})
                      <br />
                      <span className="text-zinc-500 text-[10px] font-sans">
                        Tiger Detections: {camera.tigerDetections} · Status: {camera.status}
                      </span>
                    </Tooltip>
                  </Marker>
                ))}

              {/* 11. VILLAGE SETTLEMENTS (OPTIONAL OVERLAY) */}
              {showSettlements &&
                settlements.map((settlement) => (
                  <Marker
                    key={settlement.id}
                    position={settlement.position}
                    icon={createSettlementIcon()}
                  >
                    <Tooltip>
                      <span className="font-bold text-zinc-900 font-sans">{settlement.name} Village</span>
                      <br />
                      <span className="text-[10px] text-zinc-500 font-sans">Buffer fringe settlement</span>
                    </Tooltip>
                  </Marker>
                ))}

              {/* MAP CONTROLS */}
              <MapControls bounds={activeBounds} centroid={selectedTigerId === "ALL" ? penchMapConfig.center : homeRange?.centroid} />
            </MapContainer>

            {/* FLOATING STATUS PILL */}
            <div className="pointer-events-none absolute left-5 top-5 z-[500]">
              <div className="rounded-2xl border border-white/80 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e97813] animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-900">
                    Pench Forest GIS
                  </span>
                </div>
                <p className="mt-0.5 text-[9px] text-zinc-500 font-mono">
                  Bivariate KDE · EPSG:32644 (UTM 44N)
                </p>
              </div>
            </div>

            {/* FLOATING LAYER SWITCHER */}
            <div className="absolute right-5 top-5 z-[500] w-[215px]">
              <div className="rounded-2xl border border-white/80 bg-white/95 p-3 shadow-md backdrop-blur-xl space-y-1">
                <div className="mb-2 flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Layers3 size={13} className="text-zinc-600" />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-700">
                      GIS Layers
                    </p>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">Leaflet</span>
                </div>

                <Layer
                  icon={Crosshair}
                  label="Bounding Envelope"
                  active={showEnvelope}
                  color="#d97706"
                  onClick={() => setShowEnvelope(!showEnvelope)}
                />

                <Layer
                  icon={Crosshair}
                  label="50% Core Territory"
                  active={showCore50}
                  color="#c2410c"
                  onClick={() => setShowCore50(!showCore50)}
                />

                <Layer
                  icon={Crosshair}
                  label="95% Home Range"
                  active={showRange95}
                  color="#e97813"
                  onClick={() => setShowRange95(!showRange95)}
                />

                <Layer
                  icon={Flame}
                  label="KDE Density Heatmap"
                  active={showHeatmap}
                  color="#ea580c"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                />

                <Layer
                  icon={Target}
                  label="Tiger Sightings"
                  active={showSightings}
                  color="#e97813"
                  onClick={() => setShowSightings(!showSightings)}
                />

                <Layer
                  icon={Camera}
                  label="Camera Traps"
                  active={showCameras}
                  color="#18181b"
                  onClick={() => setShowCameras(!showCameras)}
                />

                <Layer
                  icon={Navigation}
                  label="Reserve Boundaries"
                  active={showReserveBoundaries}
                  color="#059669"
                  onClick={() => setShowReserveBoundaries(!showReserveBoundaries)}
                />

                <Layer
                  icon={MapPin}
                  label="Settlement Risk"
                  active={showSettlements}
                  color="#475569"
                  onClick={() => setShowSettlements(!showSettlements)}
                />
              </div>
            </div>

            {/* MULTI-TIGER TERRITORY LEGEND (ALWAYS VISIBLE WHEN TIGERS ARE ACTIVE) */}
            <div className="absolute bottom-5 left-5 z-[500] w-[270px]">
              <div className="rounded-2xl border border-zinc-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#e97813] animate-pulse" />
                    <span className="font-extrabold text-[10px] uppercase tracking-[0.18em] text-zinc-900">
                      Resident Territories
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 font-mono">
                    {tigersToRender.length} Active
                  </span>
                </div>

                <div className="mt-2 space-y-1.5 text-[11px]">
                  {allTigersData.map((d) => {
                    return (
                      <div
                        key={d.tiger.id}
                        onClick={() => setSelectedTigerId(d.tiger.id === selectedTigerId ? "ALL" : d.tiger.id)}
                        className={`flex items-center justify-between rounded-xl px-2 py-1.5 transition cursor-pointer ${
                          selectedTigerId === d.tiger.id
                            ? "bg-zinc-100 border border-zinc-300 shadow-xs"
                            : selectedTigerId === "ALL"
                            ? "hover:bg-zinc-50"
                            : "opacity-40 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: d.palette.rangeColor }}
                          />
                          <span className="font-bold text-zinc-900">{d.tiger.id}</span>
                          <span className="text-[10px] text-zinc-400">({d.tiger.sex})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="text-zinc-600 font-semibold">
                            {d.homeRange.range95?.area_km2 || "—"} km²
                          </span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[8.5px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: d.palette.badgeBg }}
                          >
                            {d.stations.length} stns
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              RIGHT SIDEBAR: SCIENTIFIC ANALYTICS & INSIGHTS
          ================================================== */}
          <aside className="space-y-4">
            {/* TIGER OCCUPANCY METRIC CARD */}
            <div className="rounded-[24px] border border-zinc-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e97813]/20 to-[#e97813]/5 text-xl border border-[#e97813]/20">
                    🐅
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-extrabold text-zinc-900">{selectedTiger.id}</h2>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-[#d86b0e] border border-amber-200/60">
                        {selectedTiger.sex}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      {selectedTiger.age} · Primary Zone: Core
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                  {selectedTiger.status}
                </span>
              </div>

              {/* CALCULATED GIS OCCUPANCY STATS */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Metric
                  label="50% Core Area"
                  value={homeRange?.core50?.area_km2 ? `${homeRange.core50.area_km2} km²` : "—"}
                  badge="Core UD"
                  highlight
                />
                <Metric
                  label="95% Home Range"
                  value={homeRange?.range95?.area_km2 ? `${homeRange.range95.area_km2} km²` : "—"}
                  badge="Territory"
                />
                <Metric
                  label="Independent Sightings"
                  value={`${homeRange?.independentDetections?.length || 0}`}
                  subtext={`Filtered from ${rawDetectionsForSelectedTiger.length} raw`}
                />
                <Metric
                  label="Autocorrelation Pruned"
                  value={`${homeRange?.activityProfile?.filterRate || 0}%`}
                  subtext="Burst pruned"
                />
              </div>
            </div>

            {/* DIURNAL ACTIVITY BREAKDOWN */}
            <div className="rounded-[24px] border border-zinc-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SunMedium size={15} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Activity Profile (Diurnal vs Nocturnal)
                  </h3>
                </div>
                <Moon size={14} className="text-indigo-500" />
              </div>

              <div className="mt-3.5">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-1 text-amber-600">
                    <SunMedium size={12} /> Day: {homeRange?.activityProfile?.dayPercent || 0}%
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    <Moon size={12} /> Night: {homeRange?.activityProfile?.nightPercent || 0}%
                  </span>
                </div>
                {/* DUAL PROGRESS BAR */}
                <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden flex">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${homeRange?.activityProfile?.dayPercent || 50}%` }}
                  />
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${homeRange?.activityProfile?.nightPercent || 50}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-[10px]">
                  <span className="text-zinc-500 font-medium">Peak Activity Window:</span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {homeRange?.activityProfile?.peakActivityHour || "20:00 - 23:00"}
                  </span>
                </div>
              </div>
            </div>

            {/* MULTI-TIGER TERRITORY OVERLAP MATRIX */}
            <div className="rounded-[24px] border border-zinc-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={15} className="text-[#d86b0e]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Territorial Overlap Matrix
                  </h3>
                </div>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                  Management Signal
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {otherTigersComputed.map(({ tiger, overlap }) => (
                  <div
                    key={tiger.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <span>{selectedTiger.id}</span>
                        <span className="text-zinc-400">✕</span>
                        <span>{tiger.id}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Shared: <strong>{overlap.overlapKm2} km²</strong> ({overlap.overlapPercentA}%)
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        overlap.overlapKm2 > 8
                          ? "bg-rose-100 text-rose-700"
                          : overlap.overlapKm2 > 3
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {overlap.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SETTLEMENT PROXIMITY & CONFLICT RISK */}
            <div className="rounded-[24px] border border-zinc-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Settlement Proximity Risk
                  </h3>
                </div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Buffer Fringe</span>
              </div>

              <div className="mt-3 space-y-2">
                {settlementProximities.map((settlement) => (
                  <div
                    key={settlement.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-zinc-800">{settlement.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-600 font-bold">{settlement.distanceKm} km</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          settlement.riskLevel === "Critical"
                            ? "bg-rose-100 text-rose-700"
                            : settlement.riskLevel === "Moderate"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {settlement.riskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SELECTED CAMERA DETAILS (IF CLICKED) */}
            {selectedCameraData && (
              <CameraCard camera={selectedCameraData} />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// MAP AUTO-CENTER & BOUNDS CONTROLLER
// ============================================================

function MapCenterController({ bounds, centroid }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, duration: 1 });
    } else if (centroid) {
      map.flyTo(centroid, 12, { duration: 1 });
    }
  }, [centroid, bounds, map]);

  return null;
}

// ============================================================
// MAP CONTROLS COMPONENT
// ============================================================

function MapControls({ bounds, centroid }) {
  const map = useMap();

  const handleFitBounds = () => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, duration: 0.8 });
    } else if (centroid) {
      map.flyTo(centroid, 12, { duration: 0.8 });
    }
  };

  return (
    <div className="absolute bottom-5 right-5 z-[1000] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md flex flex-col">
      <button
        onClick={() => map.zoomIn()}
        title="Zoom in"
        className="flex h-9 w-9 items-center justify-center border-b border-zinc-100 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
      >
        <ZoomIn size={15} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom out"
        className="flex h-9 w-9 items-center justify-center border-b border-zinc-100 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
      >
        <ZoomOut size={15} />
      </button>
      <button
        onClick={handleFitBounds}
        title="Fit tiger territory"
        className="flex h-9 w-9 items-center justify-center text-[#d86b0e] hover:bg-zinc-50 cursor-pointer"
      >
        <Maximize2 size={14} />
      </button>
    </div>
  );
}

// ============================================================
// REUSABLE UI COMPONENTS & CARDS
// ============================================================

function Layer({ icon: Icon, label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition hover:bg-zinc-50 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: active ? color || "#e97813" : "#a1a1aa" }} />
        <span className="text-[10px] font-semibold text-zinc-700">{label}</span>
      </div>
      <div
        className={`h-3.5 w-6 rounded-full p-[2px] transition ${
          active ? "bg-[#e97813]" : "bg-zinc-200"
        }`}
      >
        <div
          className={`h-2.5 w-2.5 rounded-full bg-white transition-transform ${
            active ? "translate-x-2.5" : ""
          }`}
        />
      </div>
    </button>
  );
}

function Metric({ label, value, subtext, badge, highlight }) {
  return (
    <div
      className={`rounded-2xl p-3 border transition ${
        highlight
          ? "border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/40 shadow-xs"
          : "border-zinc-100 bg-zinc-50/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
        {badge && (
          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-bold text-zinc-900">{value}</p>
      {subtext && <p className="mt-0.5 text-[9px] text-zinc-400 font-medium">{subtext}</p>}
    </div>
  );
}

function CameraCard({ camera }) {
  return (
    <div className="rounded-[24px] border border-zinc-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <Camera size={15} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{camera.id}</p>
          <p className="text-[10px] text-zinc-400 font-mono">{camera.gridId}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Metric label="Processed Images" value={camera.images.toLocaleString()} />
        <Metric label="Tiger Detections" value={camera.tigerDetections} />
      </div>
    </div>
  );
}

// ============================================================
// CUSTOM COMPACT LEAFLET DIV ICONS
// ============================================================

function createCameraIcon(status) {
  const bg = status === "review" ? "#dc2626" : status === "offline" ? "#64748b" : "#0f172a";
  return L.divIcon({
    className: "vandrishti-camera-marker",
    html: `
      <div style="
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${bg};
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function createTigerIcon(isNight = false) {
  const bg = isNight ? "#3730a3" : "#e97813";
  return L.divIcon({
    className: "vandrishti-tiger-marker",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${bg};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: white;
      ">
        ${isNight ? "🌙" : "🐾"}
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createTigerStationIcon(count = 1, hasNight = false, hasDay = true, pointColor = "#ea580c", badgeBg = "#09090b") {
  const bg = pointColor;
  return L.divIcon({
    className: "vandrishti-tiger-station-marker",
    html: `
      <div style="
        position: relative;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: ${bg};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        ${count > 1 ? `
          <span style="
            position: absolute;
            top: -6px;
            right: -8px;
            background: ${badgeBg};
            color: #ffffff;
            font-size: 7.5px;
            font-weight: 800;
            border-radius: 7px;
            padding: 0.5px 3.5px;
            border: 1.5px solid #ffffff;
            line-height: 1.1;
            box-shadow: 0 1px 4px rgba(0,0,0,0.35);
          ">${count}</span>
        ` : ''}
      </div>
    `,
    iconSize: [13, 13],
    iconAnchor: [6.5, 6.5],
  });
}

function createCentroidIcon(color = "#e97813") {
  return L.divIcon({
    className: "vandrishti-centroid-marker",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid ${color};
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 5px; height: 5px; border-radius: 50%; background: ${color};"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createSettlementIcon() {
  return L.divIcon({
    className: "vandrishti-settlement-marker",
    html: `
      <div style="
        width: 13px;
        height: 13px;
        border-radius: 3px;
        background: #475569;
        border: 1.5px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 7px;
      ">
        🏠
      </div>
    `,
    iconSize: [13, 13],
    iconAnchor: [6.5, 6.5],
  });
}