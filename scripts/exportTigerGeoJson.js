// ============================================================
// VanDrishti AI — Tiger Spatial GeoJSON Exporter Script
// ============================================================
// Generates and saves standardized QGIS / ArcGIS GeoJSON
// FeatureCollections for all resident Pench tigers.
// ============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { computeTigerHomeRange } from "../src/services/spatial/homeRangeEngine.js";
import { masterTigerDetections } from "../src/services/spatial/tigerDetectionData.js";
import { spatialTigers } from "../src/mock/spatialMockData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "..", "data", "geojson");
const publicOutputDir = path.join(__dirname, "..", "public", "data", "geojson");

// Ensure directories exist
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publicOutputDir, { recursive: true });

console.log("🐅 VanDrishti AI — Exporting Spatial GeoJSON Datasets...\n");

const allFeatures = [];

for (const tiger of spatialTigers) {
  const rawDetections = masterTigerDetections.filter((d) => d.tiger_id === tiger.id);
  const homeRange = computeTigerHomeRange(tiger.id, rawDetections, {
    bandwidth: 500,
    gridSize: 100,
    minMinutes: 30,
  });

  if (homeRange?.geoJson) {
    const filename = `Pench_${tiger.id}_KDE_HomeRange_UD.geojson`;
    const filePath = path.join(outputDir, filename);
    const publicFilePath = path.join(publicOutputDir, filename);

    const jsonString = JSON.stringify(homeRange.geoJson, null, 2);
    fs.writeFileSync(filePath, jsonString, "utf8");
    fs.writeFileSync(publicFilePath, jsonString, "utf8");

    console.log(`✅ Saved: ${filename}`);
    console.log(`   - Features: ${homeRange.geoJson.features.length}`);
    console.log(`   - Core Area: ${homeRange.core50?.area_km2 || "—"} km²`);
    console.log(`   - Home Range: ${homeRange.range95?.area_km2 || "—"} km²`);
    console.log(`   - Bounding Envelope: ${homeRange.envelope?.area_km2 || "—"} km²`);
    console.log(`   - Independent Observations: ${homeRange.independentDetections?.length || 0}`);
    console.log(`   - Path: ${filePath}\n`);

    if (homeRange.geoJson.features) {
      allFeatures.push(...homeRange.geoJson.features);
    }
  }
}

// Master Combined FeatureCollection
const masterFeatureCollection = {
  type: "FeatureCollection",
  metadata: {
    title: "Pench Tiger Reserve — Master Tiger Spatial Intelligence",
    project: "VanDrishti AI",
    projection: "EPSG:4326 (WGS 84)",
    generated_at: new Date().toISOString(),
    total_features: allFeatures.length,
    tigers: spatialTigers.map((t) => t.id),
  },
  features: allFeatures,
};

const masterFile = path.join(outputDir, "Pench_Master_Tigers_Spatial_Intelligence.geojson");
const masterPublicFile = path.join(publicOutputDir, "Pench_Master_Tigers_Spatial_Intelligence.geojson");
const masterJsonStr = JSON.stringify(masterFeatureCollection, null, 2);

fs.writeFileSync(masterFile, masterJsonStr, "utf8");
fs.writeFileSync(masterPublicFile, masterJsonStr, "utf8");

console.log(`🌟 Master Combined Dataset Saved:`);
console.log(`   - File: Pench_Master_Tigers_Spatial_Intelligence.geojson`);
console.log(`   - Total Combined Features: ${allFeatures.length}`);
console.log(`   - Export Location: ${outputDir}\n`);
