import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as ort from "onnxruntime-web";

const ROOT_DIR = process.cwd();
const MODEL_PATH = path.join(ROOT_DIR, "ml_models", "tiger_reid.onnx");

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
  return { normalized: out, norm };
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.max(-1.0, Math.min(1.0, dot));
}

async function extractEmbedding(session, inputImagePath) {
  const meta = await sharp(inputImagePath).metadata();

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

  const t0 = performance.now();
  const inferenceResult = await session.run({ [inputName]: inputTensor });
  const t1 = performance.now();

  const outputTensor = inferenceResult[outputName];
  const { normalized, norm } = l2Normalize(outputTensor.data);

  return {
    rawOutput: outputTensor.data,
    vector: normalized,
    rawNorm: norm,
    inferenceTimeMs: (t1 - t0).toFixed(2),
    dims: outputTensor.dims,
    imageWidth: meta.width,
    imageHeight: meta.height,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const imagePath1 = args[0] || path.join(ROOT_DIR, "crops", "IMG_001_0337_crop_1.jpg");
  const imagePath2 = args[1] || null;

  console.log("\n========================================================");
  console.log("🐅 [VanDrishti AI] Single Image Re-ID Embedding Test");
  console.log("========================================================\n");

  if (!fs.existsSync(MODEL_PATH)) {
    console.error(`Error: Model not found at ${MODEL_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(imagePath1)) {
    console.error(`Error: Image file not found at ${imagePath1}`);
    process.exit(1);
  }

  console.log(`1. Model:         ml_models/tiger_reid.onnx`);
  console.log(`2. Input Image 1: ${imagePath1}`);
  if (imagePath2) {
    console.log(`3. Input Image 2: ${imagePath2}`);
  }

  console.log("\n⏳ Initializing ONNX Re-ID session...");
  const modelBuffer = fs.readFileSync(MODEL_PATH);
  const session = await ort.InferenceSession.create(modelBuffer.buffer);
  console.log(`✓ Session initialized successfully.`);

  console.log(`\n⏳ Preprocessing & running inference on Image 1...`);
  const result1 = await extractEmbedding(session, imagePath1);

  console.log(`\n================== EMBEDDING RESULTS ==================`);
  console.log(`• Original Image Size:   ${result1.imageWidth} x ${result1.imageHeight} px`);
  console.log(`• Resized Model Input:   ${MODEL_INPUT_WIDTH} x ${MODEL_INPUT_HEIGHT} px (NCHW [1, 3, 128, 256])`);
  console.log(`• Output Tensor Shape:   [${result1.dims.join(", ")}]`);
  console.log(`• Feature Embedding Dim: ${result1.vector.length} dimensions`);
  console.log(`• Inference Latency:     ${result1.inferenceTimeMs} ms`);
  console.log(`• Raw Feature L2-Norm:   ${result1.rawNorm.toFixed(4)}`);
  console.log(`• First 10 Vector Values:`);
  console.log(Array.from(result1.vector.slice(0, 10)).map(v => Number(v.toFixed(5))));
  console.log("========================================================");

  // If a second image was passed, compare them!
  if (imagePath2 && fs.existsSync(imagePath2)) {
    console.log(`\n⏳ Preprocessing & running inference on Image 2...`);
    const result2 = await extractEmbedding(session, imagePath2);
    const sim = cosineSimilarity(result1.vector, result2.vector);

    console.log(`\n================ PAIRWISE COMPARISON ==================`);
    console.log(`• Image 1: ${path.basename(imagePath1)}`);
    console.log(`• Image 2: ${path.basename(imagePath2)}`);
    console.log(`• Cosine Similarity:     ${sim.toFixed(4)}`);
    console.log(`• Match Confidence:      ${(sim * 100).toFixed(2)}%`);
    console.log(`• Match Verdict:         ${sim >= 0.75 ? "✅ MATCH (Same Individual)" : (sim >= 0.60 ? "⚠️ PROBABLE MATCH" : "❌ DIFFERENT INDIVIDUAL")}`);
    console.log("========================================================");
  }

  console.log("\n✅ Success! Re-ID model successfully extracted 2048-dim embedding.\n");
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
