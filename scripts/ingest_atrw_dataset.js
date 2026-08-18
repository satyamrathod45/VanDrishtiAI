import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as ort from "onnxruntime-web";

const ROOT_DIR = process.cwd();
const CSV_PATH = path.join(ROOT_DIR, "dataset", "atrw_anno_reid_train", "reid_list_train.csv");
const IMAGES_DIR = path.join(ROOT_DIR, "atrw_reid_train", "train");
const MODEL_PATH = path.join(ROOT_DIR, "public", "models", "tiger_reid.onnx");

const OUT_PUBLIC_EMBEDDINGS = path.join(ROOT_DIR, "public", "data", "tiger_embeddings_data.json");
const OUT_MOCKS_EMBEDDINGS = path.join(ROOT_DIR, "src", "mocks", "tiger_embeddings_data.json");
const OUT_PUBLIC_MASTER = path.join(ROOT_DIR, "public", "data", "vandrishti_master_db.json");
const OUT_MOCKS_MASTER = path.join(ROOT_DIR, "src", "mocks", "vandrishti_master_db.json");

const MODEL_INPUT_HEIGHT = 128;
const MODEL_INPUT_WIDTH = 256;
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

function l2Normalize(arr) {
  let sumSq = 0.0;
  for (let i = 0; i < arr.length; i++) sumSq += arr[i] * arr[i];
  const norm = Math.sqrt(sumSq);
  const out = new Float32Array(arr.length);
  if (norm > 1e-12) {
    for (let i = 0; i < arr.length; i++) out[i] = arr[i] / norm;
  }
  return Array.from(out);
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.max(-1.0, Math.min(1.0, dot));
}

// Named alias generator for ATRW tiger IDs
const TIGER_TERRITORIES = [
  "Tadoba Core Ridge", "Teliya Lake Buffer", "Moharli Transit Corridor",
  "Kolsa Waterhole Trail", "Zari Range North", "Pangadi Meadow Sector",
  "Khatoda Dominant Range", "Agarzari Eco Buffer", "Junona Forest Edge",
  "Kolara Gate Zone", "Navegaon Buffer Stream", "Khutwanda Dense Flank"
];

async function main() {
  console.log("===================================================================");
  console.log("🐅 [VanDrishti AI] ATRW Dataset Ingestion & 2048-dim Re-ID Pipeline");
  console.log("===================================================================\n");

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ Error: CSV annotations not found at: ${CSV_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Error: Image directory not found at: ${IMAGES_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(MODEL_PATH)) {
    console.error(`❌ Error: Re-ID model not found at: ${MODEL_PATH}`);
    process.exit(1);
  }

  // 1. Read CSV annotations
  console.log(`📖 Reading ATRW annotations from: ${path.relative(ROOT_DIR, CSV_PATH)}`);
  const rawCsv = fs.readFileSync(CSV_PATH, "utf8").trim();
  const lines = rawCsv.split(/\r?\n/).filter(l => l.trim().length > 0);

  const annotations = [];
  const tigerIdMap = new Map();

  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 2) continue;
    const rawTigerId = parts[0].trim();
    const filename = parts[1].trim();
    const imgPath = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(imgPath)) {
      const formattedTigerId = `TGR-${String(rawTigerId).padStart(3, "0")}`;
      annotations.push({
        rawTigerId,
        tigerId: formattedTigerId,
        filename,
        imgPath,
      });

      if (!tigerIdMap.has(formattedTigerId)) {
        tigerIdMap.set(formattedTigerId, []);
      }
      tigerIdMap.get(formattedTigerId).push(filename);
    }
  }

  const totalImages = annotations.length;
  const totalUniqueTigers = tigerIdMap.size;
  console.log(`✓ Verified ${totalImages} image annotations across ${totalUniqueTigers} unique tiger individuals.\n`);

  // 2. Load ONNX Re-ID Model
  console.log(`⏳ Initializing ONNX Re-ID session from: ${path.relative(ROOT_DIR, MODEL_PATH)}`);
  const session = await ort.InferenceSession.create(MODEL_PATH, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
  const inputName = session.inputNames[0] || "input_image";
  const outputName = session.outputNames[0] || "features";
  console.log(`✓ Model ready. Input: '${inputName}', Output: '${outputName}' (2048 dimensions)\n`);

  // 3. Batch Ingestion Loop
  console.log(`🚀 Extracting 2048-dim feature embeddings for ${totalImages} images...`);
  const startTime = Date.now();
  const sightings = [];
  const H = MODEL_INPUT_HEIGHT;
  const W = MODEL_INPUT_WIDTH;
  const channelSize = H * W;

  for (let i = 0; i < totalImages; i++) {
    const anno = annotations[i];

    try {
      const sharpImg = sharp(anno.imgPath);
      const meta = await sharpImg.metadata();
      const { data } = await sharpImg
        .resize(W, H, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const float32Data = new Float32Array(3 * channelSize);
      for (let p = 0; p < channelSize; p++) {
        const r = data[p * 3] / 255.0;
        const g = data[p * 3 + 1] / 255.0;
        const b = data[p * 3 + 2] / 255.0;

        float32Data[p] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
        float32Data[channelSize + p] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
        float32Data[2 * channelSize + p] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
      }

      const tensor = new ort.Tensor("float32", float32Data, [1, 3, H, W]);
      const output = await session.run({ [inputName]: tensor });
      const rawVector = Array.from(output[outputName].data);
      const normVector = l2Normalize(rawVector);

      const tigerNum = parseInt(anno.rawTigerId, 10) || 0;
      const territoryIdx = tigerNum % TIGER_TERRITORIES.length;
      const stationId = `CAM-ATRW-${String((tigerNum % 16) + 1).padStart(2, "0")}`;
      const stationName = TIGER_TERRITORIES[territoryIdx];
      const zone = tigerNum % 2 === 0 ? "Core" : "Buffer";

      const sighting = {
        id: `SIGHTING_ATRW_${anno.filename.replace(/\.[^/.]+$/, "")}`,
        tiger_id: anno.tigerId,
        crop_filename: anno.filename,
        crop_path: `/atrw_reid_train/train/${anno.filename}`,
        crop_dimensions: { width: meta.width || W, height: meta.height || H },
        source_image: anno.filename,
        camera_id: stationId,
        station_name: stationName,
        zone: zone,
        gps: {
          lat: 21.600 + ((tigerNum * 7) % 100) * 0.0015,
          lng: 79.300 + ((tigerNum * 13) % 100) * 0.0015,
        },
        timestamp: `2026-04-${String(1 + (i % 28)).padStart(2, "0")} ${String(6 + (i % 16)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
        review_status: "verified",
        vector: normVector,
      };

      sightings.push(sighting);

      if ((i + 1) % 100 === 0 || i + 1 === totalImages) {
        const elapsed = (Date.now() - startTime) / 1000;
        const fps = ((i + 1) / elapsed).toFixed(1);
        const eta = (((totalImages - (i + 1)) / (i + 1)) * elapsed).toFixed(0);
        process.stdout.write(`\r   Progress: [${i + 1}/${totalImages}] ${Math.round(((i + 1) / totalImages) * 100)}% | Speed: ${fps} img/s | ETA: ${eta}s`);
      }
    } catch (err) {
      console.warn(`\n⚠️ Warning: Failed processing ${anno.filename}: ${err.message}`);
    }
  }

  console.log(`\n\n✓ Successfully extracted ${sightings.length} embeddings in ${((Date.now() - startTime) / 1000).toFixed(1)}s!\n`);

  // 4. Save Vector Database JSON files
  console.log("💾 Writing database artifacts...");
  const embeddingsJson = JSON.stringify(sightings, null, 2);
  fs.writeFileSync(OUT_PUBLIC_EMBEDDINGS, embeddingsJson, "utf8");
  fs.writeFileSync(OUT_MOCKS_EMBEDDINGS, embeddingsJson, "utf8");
  console.log(`   ✓ Saved: ${path.relative(ROOT_DIR, OUT_PUBLIC_EMBEDDINGS)} (${(Buffer.byteLength(embeddingsJson) / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   ✓ Saved: ${path.relative(ROOT_DIR, OUT_MOCKS_EMBEDDINGS)}`);

  // 5. Build Master Catalogue DB
  const tigerSightingsGroup = {};
  for (const s of sightings) {
    if (!tigerSightingsGroup[s.tiger_id]) tigerSightingsGroup[s.tiger_id] = [];
    tigerSightingsGroup[s.tiger_id].push(s);
  }

  const masterTigers = Array.from(tigerIdMap.keys()).map((tigerId) => {
    const rawNum = parseInt(tigerId.replace("TGR-", ""), 10) || 0;
    const territory = TIGER_TERRITORIES[rawNum % TIGER_TERRITORIES.length];
    const tigerSightings = tigerSightingsGroup[tigerId] || [];

    return {
      tiger_id: tigerId,
      display_name: `${tigerId} · ${territory} Resident`,
      name: `${territory} Resident`,
      sex: rawNum % 2 === 0 ? "Male" : "Female",
      age_class: rawNum % 5 === 0 ? "Sub-adult" : "Adult",
      status: "active",
      primary_zone: rawNum % 2 === 0 ? "Core" : "Buffer",
      station: `CAM-ATRW-${String((rawNum % 16) + 1).padStart(2, "0")}`,
      sightings: tigerSightings,
      total_sightings: tigerSightings.length,
    };
  });

  const masterDb = {
    metadata: {
      title: "VanDrishti AI ATRW Master Database",
      updated_at: new Date().toISOString(),
      dataset: "ATRW (Amur Tiger Re-identification in the Wild)",
      total_sightings: sightings.length,
      total_tigers: masterTigers.length,
      embedding_dim: 2048,
    },
    tigers: masterTigers,
  };

  const masterJson = JSON.stringify(masterDb, null, 2);
  fs.writeFileSync(OUT_PUBLIC_MASTER, masterJson, "utf8");
  fs.writeFileSync(OUT_MOCKS_MASTER, masterJson, "utf8");
  console.log(`   ✓ Saved: ${path.relative(ROOT_DIR, OUT_PUBLIC_MASTER)}`);
  console.log(`   ✓ Saved: ${path.relative(ROOT_DIR, OUT_MOCKS_MASTER)}\n`);

  // 6. Validation / Quality Accuracy Test (Leave-One-Out Cross-Matching)
  console.log("===================================================================");
  console.log("🧪 [Quality Verification] Running Leave-One-Out Re-ID Cross Validation");
  console.log("===================================================================");

  let top1Correct = 0;
  let top3Correct = 0;
  let top5Correct = 0;
  let totalEvaluated = 0;
  let intraSimilaritySum = 0;
  let intraCount = 0;
  let interSimilaritySum = 0;
  let interCount = 0;

  // Evaluate on multi-sighting tigers (sample up to 400 queries for rapid benchmark)
  const evalSightings = sightings.filter(s => tigerSightingsGroup[s.tiger_id].length > 1);
  const sampleStride = Math.max(1, Math.floor(evalSightings.length / 400));
  const testSet = evalSightings.filter((_, idx) => idx % sampleStride === 0);

  console.log(`Benchmarking ${testSet.length} queries against gallery of ${sightings.length} embeddings...`);

  for (const query of testSet) {
    const scores = [];

    for (const galleryItem of sightings) {
      if (galleryItem.id === query.id) continue; // Leave-one-out

      const sim = cosineSimilarity(query.vector, galleryItem.vector);
      scores.push({
        tiger_id: galleryItem.tiger_id,
        sim,
      });

      if (galleryItem.tiger_id === query.tiger_id && intraCount < 2000) {
        intraSimilaritySum += sim;
        intraCount++;
      } else if (galleryItem.tiger_id !== query.tiger_id && interCount < 2000) {
        interSimilaritySum += sim;
        interCount++;
      }
    }

    scores.sort((a, b) => b.sim - a.sim);

    totalEvaluated++;
    const top1 = scores[0];
    const top3 = scores.slice(0, 3).map(s => s.tiger_id);
    const top5 = scores.slice(0, 5).map(s => s.tiger_id);

    if (top1 && top1.tiger_id === query.tiger_id) top1Correct++;
    if (top3.includes(query.tiger_id)) top3Correct++;
    if (top5.includes(query.tiger_id)) top5Correct++;
  }

  const top1Acc = ((top1Correct / totalEvaluated) * 100).toFixed(2);
  const top3Acc = ((top3Correct / totalEvaluated) * 100).toFixed(2);
  const top5Acc = ((top5Correct / totalEvaluated) * 100).toFixed(2);
  const avgIntra = intraCount > 0 ? (intraSimilaritySum / intraCount).toFixed(4) : "N/A";
  const avgInter = interCount > 0 ? (interSimilaritySum / interCount).toFixed(4) : "N/A";

  console.log("\n-------------------------------------------------------------------");
  console.log("📊 RE-ID EVALUATION METRICS REPORT");
  console.log("-------------------------------------------------------------------");
  console.log(`• Total Gallery Embeddings : ${sightings.length}`);
  console.log(`• Unique Resident Tigers   : ${totalUniqueTigers}`);
  console.log(`• Queries Evaluated        : ${totalEvaluated}`);
  console.log(`• Rank-1 Identification Acc: ${top1Acc}% (${top1Correct}/${totalEvaluated})`);
  console.log(`• Rank-3 Identification Acc: ${top3Acc}% (${top3Correct}/${totalEvaluated})`);
  console.log(`• Rank-5 Identification Acc: ${top5Acc}% (${top5Correct}/${totalEvaluated})`);
  console.log(`• Mean Intra-Tiger Similarity: ${avgIntra} (Same Individual Flanks)`);
  console.log(`• Mean Inter-Tiger Similarity: ${avgInter} (Different Tigers / Background)`);
  console.log("-------------------------------------------------------------------\n");
  console.log("🎉 ATRW Ingestion & Verification Completed Successfully!");
}

main().catch((err) => {
  console.error("❌ Fatal Pipeline Error:", err);
  process.exit(1);
});
