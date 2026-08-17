import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as ort from "onnxruntime-web";

const ROOT_DIR = process.cwd();
const CROPS_DIR = path.join(ROOT_DIR, "crops");
const MANIFEST_PATH = path.join(ROOT_DIR, "demo_sd_card", "ground_truth_manifest.json");
const MODEL_PATH = path.join(ROOT_DIR, "ml_models", "tiger_reid.onnx");

const OUTPUT_MOCK_EMBEDDINGS = path.join(ROOT_DIR, "src", "mocks", "tiger_embeddings_data.json");
const OUTPUT_PUBLIC_EMBEDDINGS = path.join(ROOT_DIR, "public", "data", "tiger_embeddings_data.json");
const OUTPUT_MOCK_MASTER = path.join(ROOT_DIR, "src", "mocks", "vandrishti_master_db.json");
const OUTPUT_PUBLIC_MASTER = path.join(ROOT_DIR, "public", "data", "vandrishti_master_db.json");

const MODEL_INPUT_HEIGHT = 128;
const MODEL_INPUT_WIDTH = 256;
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

// Ensure output directories exist
const publicDataDir = path.join(ROOT_DIR, "public", "data");
if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });
const mocksDir = path.join(ROOT_DIR, "src", "mocks");
if (!fs.existsSync(mocksDir)) fs.mkdirSync(mocksDir, { recursive: true });

/**
 * L2 Normalization
 */
function l2Normalize(arr) {
  let sumSq = 0.0;
  for (let i = 0; i < arr.length; i++) sumSq += arr[i] * arr[i];
  const norm = Math.sqrt(sumSq);
  const out = new Float32Array(arr.length);
  if (norm > 1e-12) {
    for (let i = 0; i < arr.length; i++) out[i] = arr[i] / norm;
  }
  return out;
}

/**
 * Cosine similarity between two unit vectors
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.max(-1.0, Math.min(1.0, dot));
}

/**
 * Master Tiger Catalogue Seed
 */
const TIGER_CATALOGUE = {
  "TGR-024": {
    tiger_id: "TGR-024",
    display_name: "T-024 · Collarwali Lineage Male",
    sex: "Male",
    age_class: "Adult",
    status: "active",
    primary_zone: "Core",
    distinctive_marks: "Double vertical stripe fork on left ribcage; distinct notch on right ear.",
  },
  "TGR-007": {
    tiger_id: "TGR-007",
    display_name: "T-007 · Teliya Dominant Tigress",
    sex: "Female",
    age_class: "Adult",
    status: "active",
    primary_zone: "Buffer",
    distinctive_marks: "Crown pattern above left eye; white tail-tip blaze.",
  },
  "TGR-015": {
    tiger_id: "TGR-015",
    display_name: "T-015 · Teliya Sub-adult Male",
    sex: "Male",
    age_class: "Sub-adult",
    status: "active",
    primary_zone: "Buffer",
    distinctive_marks: "Narrow flank stripes; fast dispersal behavior.",
  },
  "TGR-033": {
    tiger_id: "TGR-033",
    display_name: "T-033 · Mahadeo Ghat Resident Male",
    sex: "Male",
    age_class: "Adult",
    status: "active",
    primary_zone: "Core",
    distinctive_marks: "Broad flank banding, deep chest scar.",
  },
  "TGR-018": {
    tiger_id: "TGR-018",
    display_name: "T-018 · Kohka Buffer Female",
    sex: "Female",
    age_class: "Adult",
    status: "active",
    primary_zone: "Buffer",
    distinctive_marks: "Symmetrical inverted Y-stripes on right flank.",
  },
  "TGR-042": {
    tiger_id: "TGR-042",
    display_name: "T-042 · Awarghani Corridor Transiting Male",
    sex: "Male",
    age_class: "Adult",
    status: "active",
    primary_zone: "Corridor",
    distinctive_marks: "Long stride marks, broken flank stripe near hip.",
  }
};

/**
 * Map filename prefix to known tiger ID for ground-truth clustering
 */
function inferTigerId(filename, cropIdx, stationId) {
  if (stationId === "PTR_CORE_ST01" || stationId === "PTR_CORE_ST02") {
    return "TGR-024";
  } else if (stationId === "PTR_BUFF_ST06") {
    return cropIdx === 1 ? "TGR-007" : "TGR-015";
  } else if (stationId === "PTR_CORE_ST04" || stationId === "PTR_CORE_ST05") {
    return "TGR-033";
  } else if (stationId === "PTR_BUFF_ST07") {
    return "TGR-018";
  } else if (stationId === "PTR_BUFF_ST08") {
    return "TGR-042";
  }
  return "TGR-024";
}

async function runEmbeddingGeneration() {
  console.log("\n========================================================");
  console.log("🐅 [VanDrishti AI] Complete Ingestion & Embedding Pipeline");
  console.log("========================================================\n");

  if (!fs.existsSync(MODEL_PATH)) {
    console.error(`Error: Re-ID model not found at ${MODEL_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(CROPS_DIR)) {
    console.error(`Error: Crops directory not found at ${CROPS_DIR}`);
    process.exit(1);
  }

  // 1. Load ONNX Re-ID Model Session
  console.log("⏳ Loading tiger_reid.onnx model...");
  const modelBuffer = fs.readFileSync(MODEL_PATH);
  const session = await ort.InferenceSession.create(modelBuffer.buffer);
  const inputName = session.inputNames[0] || "input_image";
  const outputName = session.outputNames[0] || "features";
  console.log(`✓ Model loaded. Input: '${inputName}', Output: '${outputName}'\n`);

  // 2. Load Manifest Metadata
  let manifestMap = {};
  let manifestList = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    manifestList = manifest.images || [];
    for (const img of manifestList) {
      const base = img.filename.replace(/\.[^/.]+$/, "");
      manifestMap[base] = img;
    }
  }

  // 3. Scan all Crop Images
  const cropFiles = fs.readdirSync(CROPS_DIR)
    .filter(f => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png"))
    .sort();

  console.log(`Found ${cropFiles.length} crops in ${CROPS_DIR}. Generating 2048-dim embeddings...\n`);

  const sightings = [];
  const cameraStats = {};
  const tigerSightingsMap = {};
  let processedCount = 0;
  const startTime = Date.now();

  for (const cropFilename of cropFiles) {
    const cropFilePath = path.join(CROPS_DIR, cropFilename);

    // Extract base image name (e.g. IMG_001_0337 from IMG_001_0337_crop_1.jpg)
    const match = cropFilename.match(/^(IMG_\d+_\d+)_crop_(\d+)\.jpg$/i);
    const baseImageName = match ? match[1] : cropFilename.replace(/\.[^/.]+$/, "");
    const cropIndex = match ? parseInt(match[2], 10) : 1;

    const manifestEntry = manifestMap[baseImageName] || {};
    const meta = manifestEntry.camera_trap_metadata || {};

    const stationId = meta.station_id || "PTR_CORE_ST01";
    const stationName = meta.station_name || "Touria Gate North";
    const zone = meta.zone || "Core";
    const latitude = meta.gps_latitude || 21.621;
    const longitude = meta.gps_longitude || 79.354;
    const timestamp = meta.timestamp || "2026-04-27 20:00:00";
    const triggerType = manifestEntry.trigger_type || "Tiger Detected (Subject Frame)";
    const groundTruthLabel = manifestEntry.ground_truth_label || "Tiger";
    const bboxes = manifestEntry.ground_truth_bboxes || [];
    const bbox = bboxes[cropIndex - 1] || null;

    const tigerId = inferTigerId(baseImageName, cropIndex, stationId);

    // Get original crop image dimensions and raw buffer with sharp
    const sharpImg = sharp(cropFilePath);
    const imgMetadata = await sharpImg.metadata();
    const cropWidth = imgMetadata.width || MODEL_INPUT_WIDTH;
    const cropHeight = imgMetadata.height || MODEL_INPUT_HEIGHT;

    // Resize to 256x128 Float32 RGB tensor
    const { data } = await sharpImg
      .resize(MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // ImageNet Normalization NCHW [1, 3, 128, 256]
    const H = MODEL_INPUT_HEIGHT;
    const W = MODEL_INPUT_WIDTH;
    const float32Data = new Float32Array(3 * H * W);

    for (let h = 0; h < H; h++) {
      for (let w = 0; w < W; w++) {
        const srcIdx = (h * W + w) * 3;
        const r = data[srcIdx] / 255.0;
        const g = data[srcIdx + 1] / 255.0;
        const b = data[srcIdx + 2] / 255.0;

        float32Data[0 * H * W + h * W + w] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
        float32Data[1 * H * W + h * W + w] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
        float32Data[2 * H * W + h * W + w] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
      }
    }

    // Run Inference on Re-ID model
    const inputTensor = new ort.Tensor("float32", float32Data, [1, 3, H, W]);
    const inferenceResult = await session.run({ [inputName]: inputTensor });
    const outputTensor = inferenceResult[outputName];

    // L2 Normalize Embedding
    const normalizedVector = l2Normalize(outputTensor.data);

    // Sighting Record with full relational metadata
    const sightingId = `SIGHTING_${baseImageName}_CROP_${cropIndex}`;

    const sightingRecord = {
      id: sightingId,
      tiger_id: tigerId,
      crop_filename: cropFilename,
      crop_path: `/crops/${cropFilename}`,
      crop_dimensions: {
        width: cropWidth,
        height: cropHeight
      },
      source_image: manifestEntry.filename || `${baseImageName}.jpg`,
      bbox: bbox,
      camera_id: stationId,
      station_name: stationName,
      zone,
      gps: {
        lat: latitude,
        lng: longitude
      },
      timestamp,
      trigger_type: triggerType,
      ground_truth_label: groundTruthLabel,
      reid_confidence: 94.5,
      review_status: "verified",
      verified_by: "FO-1024",
      vector: Array.from(normalizedVector),
      created_at: new Date().toISOString()
    };

    sightings.push(sightingRecord);
    processedCount++;

    // Track camera stats
    if (!cameraStats[stationId]) {
      cameraStats[stationId] = {
        camera_id: stationId,
        name: stationName,
        zone,
        range: zone === "Core" ? "Touria Core Range" : "Teliya Buffer Range",
        latitude,
        longitude,
        status: "active",
        total_photos: 0,
        total_tiger_crops: 0,
        last_active: timestamp
      };
    }
    cameraStats[stationId].total_tiger_crops++;
    if (new Date(timestamp) > new Date(cameraStats[stationId].last_active)) {
      cameraStats[stationId].last_active = timestamp;
    }

    // Track tiger stats
    if (!tigerSightingsMap[tigerId]) {
      tigerSightingsMap[tigerId] = [];
    }
    tigerSightingsMap[tigerId].push(sightingRecord);

    if (processedCount % 15 === 0 || processedCount === cropFiles.length) {
      console.log(`  Processed [${processedCount}/${cropFiles.length}] crops...`);
    }
  }

  // Count total photos per camera from manifest
  for (const img of manifestList) {
    const sId = img.camera_trap_metadata?.station_id;
    if (sId && cameraStats[sId]) {
      cameraStats[sId].total_photos++;
    }
  }

  // 4. Build Tiger Master Catalogue
  const tigers = [];
  for (const [tId, sList] of Object.entries(tigerSightingsMap)) {
    const baseProfile = TIGER_CATALOGUE[tId] || {
      tiger_id: tId,
      display_name: `Tiger ${tId}`,
      sex: "Unknown",
      age_class: "Adult",
      status: "active",
      primary_zone: sList[0]?.zone || "Core",
      distinctive_marks: ""
    };

    // Sort chronologically
    sList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const firstSeen = sList[0].timestamp;
    const lastSeen = sList[sList.length - 1].timestamp;
    const profileImage = sList[0].crop_path;

    tigers.push({
      ...baseProfile,
      profile_image: profileImage,
      total_sightings: sList.length,
      first_seen: firstSeen,
      last_seen: lastSeen,
      sightings: sList.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        station_name: s.station_name,
        camera_id: s.camera_id,
        zone: s.zone,
        crop_path: s.crop_path,
        gps: s.gps
      }))
    });
  }

  // 5. Build Cameras Catalogue
  const cameras = Object.values(cameraStats);

  // 6. Build Spatial Alerts
  const alerts = [
    {
      alert_id: "ALT-2026-001",
      tiger_id: "TGR-024",
      sighting_id: sightings.find(s => s.tiger_id === "TGR-024")?.id || sightings[0].id,
      alert_type: "corridor_crossing",
      severity: "high",
      title: "Core Male T-024 Approaching Buffer Edge",
      description: "T-024 detected near Touria North station heading towards Teliya agricultural corridor.",
      timestamp: "2026-04-27 22:05:00",
      is_resolved: false,
      evidence_crop_path: sightings[0].crop_path,
      created_at: new Date().toISOString()
    },
    {
      alert_id: "ALT-2026-002",
      tiger_id: "TGR-007",
      sighting_id: sightings.find(s => s.tiger_id === "TGR-007")?.id || sightings[1].id,
      alert_type: "territory_shift",
      severity: "medium",
      title: "Teliya Tigress T-007 Active Near Buffer Waterhole",
      description: "Frequent buffer sightings recorded over past 72 hours; sub-adult T-015 co-sighted.",
      timestamp: "2026-04-27 22:03:00",
      is_resolved: false,
      evidence_crop_path: sightings[1].crop_path,
      created_at: new Date().toISOString()
    }
  ];

  // Complete Master Bundle
  const masterDb = {
    metadata: {
      title: "VanDrishti AI Master Database",
      generated_at: new Date().toISOString(),
      total_embeddings: sightings.length,
      total_tigers: tigers.length,
      total_cameras: cameras.length,
      total_alerts: alerts.length
    },
    tigers,
    cameras,
    sightings,
    alerts
  };

  // 7. Save outputs
  console.log(`\n💾 Saving datasets to disk:`);
  console.log(`   1. Embeddings: ${OUTPUT_MOCK_EMBEDDINGS}`);
  console.log(`   2. Embeddings: ${OUTPUT_PUBLIC_EMBEDDINGS}`);
  console.log(`   3. Master DB:  ${OUTPUT_MOCK_MASTER}`);
  console.log(`   4. Master DB:  ${OUTPUT_PUBLIC_MASTER}`);

  const embeddingsJson = JSON.stringify(sightings, null, 2);
  fs.writeFileSync(OUTPUT_MOCK_EMBEDDINGS, embeddingsJson, "utf8");
  fs.writeFileSync(OUTPUT_PUBLIC_EMBEDDINGS, embeddingsJson, "utf8");

  const masterDbJson = JSON.stringify(masterDb, null, 2);
  fs.writeFileSync(OUTPUT_MOCK_MASTER, masterDbJson, "utf8");
  fs.writeFileSync(OUTPUT_PUBLIC_MASTER, masterDbJson, "utf8");

  console.log("\n========================================================");
  console.log(`🎉 Ingestion Complete!`);
  console.log(`   • Tiger Flank Embeddings: ${sightings.length} records (2048-dim vectors)`);
  console.log(`   • Resident Tigers:        ${tigers.length} individual profiles`);
  console.log(`   • Camera Stations:        ${cameras.length} active stations`);
  console.log(`   • Active Alerts:          ${alerts.length} spatial alerts`);
  console.log("========================================================\n");
}

runEmbeddingGeneration().catch(err => {
  console.error("Embedding generation failed:", err);
  process.exit(1);
});
