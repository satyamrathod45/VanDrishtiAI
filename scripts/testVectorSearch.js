import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as ort from "onnxruntime-web";

const ROOT_DIR = process.cwd();
const MODEL_PATH = path.join(ROOT_DIR, "ml_models", "tiger_reid.onnx");
const EMBEDDINGS_DATA_PATH = path.join(ROOT_DIR, "src", "mocks", "tiger_embeddings_data.json");
const CROPS_DIR = path.join(ROOT_DIR, "crops");

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
  return out;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.max(-1.0, Math.min(1.0, dot));
}

function similarityToConfidence(similarity) {
  const clampedSim = Math.max(0.0, Math.min(1.0, similarity));
  let confidencePercent;

  if (clampedSim >= 0.85) {
    confidencePercent = 90 + ((clampedSim - 0.85) / 0.15) * 9.9;
  } else if (clampedSim >= 0.70) {
    confidencePercent = 75 + ((clampedSim - 0.70) / 0.15) * 14.9;
  } else if (clampedSim >= 0.55) {
    confidencePercent = 50 + ((clampedSim - 0.55) / 0.15) * 24.9;
  } else {
    confidencePercent = Math.max(5.0, (clampedSim / 0.55) * 49.9);
  }

  confidencePercent = Math.round(confidencePercent * 10) / 10;

  let tier = "NEW_INDIVIDUAL_CANDIDATE";
  let label = "Unmatched / Potential New Tiger";
  let isMatch = false;

  if (confidencePercent >= 85.0) {
    tier = "HIGH_CONFIDENCE_MATCH";
    label = "Confirmed Match (High Confidence)";
    isMatch = true;
  } else if (confidencePercent >= 65.0) {
    tier = "PROBABLE_MATCH";
    label = "Probable Match (Pending Verification)";
    isMatch = true;
  }

  return { confidencePercent, tier, label, isMatch };
}

async function extractEmbedding(session, inputImagePath) {
  const { data } = await sharp(inputImagePath)
    .resize(MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

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

  const inputName = session.inputNames[0] || "input_image";
  const outputName = session.outputNames[0] || "features";
  const inputTensor = new ort.Tensor("float32", float32Data, [1, 3, H, W]);

  const inferenceResult = await session.run({ [inputName]: inputTensor });
  const outputTensor = inferenceResult[outputName];

  return l2Normalize(outputTensor.data);
}

async function main() {
  const args = process.argv.slice(2);
  const queryImagePath = args[0] || path.join(CROPS_DIR, "IMG_001_0337_crop_1.jpg");
  const topK = parseInt(args[1], 10) || 5;

  console.log("\n========================================================");
  console.log("🔍 [VanDrishti AI] Vector Database Similarity Search Test");
  console.log("========================================================\n");

  if (!fs.existsSync(EMBEDDINGS_DATA_PATH)) {
    console.log(`Embeddings dataset not found at ${EMBEDDINGS_DATA_PATH}.`);
    console.log("Please run: node scripts/generateEmbeddings.js first to generate embeddings for the 90 crops.\n");
    process.exit(1);
  }

  if (!fs.existsSync(queryImagePath)) {
    console.error(`Error: Query image not found at ${queryImagePath}`);
    process.exit(1);
  }

  // 1. Load Vector Database Dataset
  console.log("⏳ Loading vector embeddings database...");
  const rawData = JSON.parse(fs.readFileSync(EMBEDDINGS_DATA_PATH, "utf8"));
  const dataset = rawData.map(item => ({
    ...item,
    vector: new Float32Array(item.vector)
  }));
  console.log(`✓ Vector database loaded (${dataset.length} sightings indexed).\n`);

  // 2. Load Re-ID Model & Embed Query Image
  console.log(`⏳ Extracting 2048-dim embedding for query crop: ${path.basename(queryImagePath)}...`);
  const modelBuffer = fs.readFileSync(MODEL_PATH);
  const session = await ort.InferenceSession.create(modelBuffer.buffer);

  const t0 = performance.now();
  const queryVector = await extractEmbedding(session, queryImagePath);
  const embedTime = (performance.now() - t0).toFixed(2);
  console.log(`✓ Embedding generated in ${embedTime} ms.\n`);

  // 3. Perform Cosine Similarity Search
  console.log(`⏳ Executing vector search across ${dataset.length} embeddings (Top-${topK})...`);
  const searchStart = performance.now();

  const scoredResults = [];
  for (const record of dataset) {
    const similarity = cosineSimilarity(queryVector, record.vector);
    const conf = similarityToConfidence(similarity);

    scoredResults.push({
      id: record.id,
      tiger_id: record.tiger_id,
      crop_filename: record.crop_filename,
      station_name: record.station_name,
      zone: record.zone,
      timestamp: record.timestamp,
      similarity,
      confidence: conf.confidencePercent,
      tier: conf.tier,
      label: conf.label,
      isMatch: conf.isMatch
    });
  }

  scoredResults.sort((a, b) => b.similarity - a.similarity);
  const topMatches = scoredResults.slice(0, topK);
  const searchTime = (performance.now() - searchStart).toFixed(3);

  // 4. Output Results
  console.log(`✓ Vector search completed in ${searchTime} ms!\n`);
  console.log("================================ TOP MATCHES ================================");

  topMatches.forEach((m, idx) => {
    const icon = idx === 0 ? "🥇" : (idx === 1 ? "🥈" : (idx === 2 ? "🥉" : `[#${idx + 1}]`));
    console.log(`${icon} Rank ${idx + 1}: ${m.crop_filename} | Tiger: ${m.tiger_id}`);
    console.log(`   • Similarity:     ${(m.similarity * 100).toFixed(2)}% (Cosine: ${m.similarity.toFixed(4)})`);
    console.log(`   • Confidence:     ${m.confidence}% [${m.label}]`);
    console.log(`   • Station & Zone: ${m.station_name} (${m.zone})`);
    console.log(`   • Sighting Time:  ${m.timestamp}`);
    console.log(`   • Match Verdict:  ${m.isMatch ? "✅ MATCH VERIFIED" : "❌ DIFFERENT INDIVIDUAL"}`);
    console.log("-----------------------------------------------------------------------------");
  });

  // 5. Metadata Filter Demonstration
  console.log("\n======================== METADATA FILTER TEST ========================");
  console.log("Filter: Zone === 'Buffer' only (Top 3)");
  const bufferMatches = scoredResults.filter(r => r.zone === "Buffer").slice(0, 3);
  bufferMatches.forEach((m, i) => {
    console.log(` [Buffer #${i + 1}] ${m.crop_filename} → Tiger: ${m.tiger_id} | Similarity: ${(m.similarity * 100).toFixed(2)}% | Station: ${m.station_name}`);
  });
  console.log("======================================================================\n");
}

main().catch(err => {
  console.error("Vector search test failed:", err);
  process.exit(1);
});
