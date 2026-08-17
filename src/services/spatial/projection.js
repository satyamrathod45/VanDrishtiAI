// ============================================================
// VanDrishti AI — Spatial Cartographic Projection Engine
// ============================================================
// Converts geographic WGS84 coordinates (EPSG:4326) to 
// Euclidean metric coordinates in UTM Zone 44N (EPSG:32644)
// and vice-versa.
//
// Essential for distance, area and 2D Gaussian KDE calculations
// in actual meters rather than distorted angular degrees.
// ============================================================

import proj4 from "proj4";

export const WGS84 = "EPSG:4326";

// UTM zone 44N covers Central India (Pench / Tadoba / Kanha landscape)
export const UTM44N = "+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs";

/**
 * Projects a WGS84 coordinate [Lat, Lng] into UTM Zone 44N metric [X, Y].
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {{x: number, y: number}} Coordinates in meters
 */
export function projectPoint(latitude, longitude) {
  try {
    const [x, y] = proj4(WGS84, UTM44N, [longitude, latitude]);
    return { x, y };
  } catch (err) {
    console.warn("Projection fallback triggered:", err);
    // Approximation if proj4 definition fails: 1 deg lat ~ 111,320m
    const x = longitude * 111320 * Math.cos((latitude * Math.PI) / 180);
    const y = latitude * 110574;
    return { x, y };
  }
}

/**
 * Unprojects UTM Zone 44N metric coordinates [X, Y] back to WGS84 [Lat, Lng].
 * @param {number} x Metric easting in meters
 * @param {number} y Metric northing in meters
 * @returns {{latitude: number, longitude: number}}
 */
export function unprojectPoint(x, y) {
  try {
    const [longitude, latitude] = proj4(UTM44N, WGS84, [x, y]);
    return { latitude, longitude };
  } catch (err) {
    console.warn("Unprojection fallback triggered:", err);
    const latitude = y / 110574;
    const longitude = x / (111320 * Math.cos((latitude * Math.PI) / 180));
    return { latitude, longitude };
  }
}
