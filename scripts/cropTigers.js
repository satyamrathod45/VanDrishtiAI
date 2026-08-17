import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT_DIR = process.cwd();
const INPUT_DIR = path.join(ROOT_DIR, "demo_sd_card");
const CROPS_DIR = path.join(ROOT_DIR, "crops");
const PUBLIC_CROPS_DIR = path.join(ROOT_DIR, "public", "crops");
const MANIFEST_PATH = path.join(INPUT_DIR, "ground_truth_manifest.json");

// Ensure output directories exist
if (!fs.existsSync(CROPS_DIR)) fs.mkdirSync(CROPS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_CROPS_DIR)) fs.mkdirSync(PUBLIC_CROPS_DIR, { recursive: true });

async function runCropping() {
  console.log("\n🐅 [VanDrishti AI] Starting Physical Disk Cropping Pipeline...\n");

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Error: Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const images = manifest.images || [];

  let totalTigers = 0;
  let totalCrops = 0;
  let totalBlanks = 0;

  for (const item of images) {
    const filename = item.filename;
    const inputImagePath = path.join(INPUT_DIR, filename);

    if (!fs.existsSync(inputImagePath)) {
      console.warn(`Warning: Image ${filename} not found in demo_sd_card.`);
      continue;
    }

    if (!item.has_tiger || !item.ground_truth_bboxes || item.ground_truth_bboxes.length === 0) {
      totalBlanks++;
      continue;
    }

    totalTigers++;
    const image = sharp(inputImagePath);
    const metadata = await image.metadata();
    const origW = metadata.width;
    const origH = metadata.height;

    const baseName = filename.replace(/\.[^/.]+$/, "");

    for (let i = 0; i < item.ground_truth_bboxes.length; i++) {
      const bbox = item.ground_truth_bboxes[i];
      let [x1, y1, x2, y2] = bbox;

      // Add 5% padding around the tiger
      const w = x2 - x1;
      const h = y2 - y1;
      const padW = Math.round(w * 0.05);
      const padH = Math.round(h * 0.05);

      const cropX = Math.max(0, x1 - padW);
      const cropY = Math.max(0, y1 - padH);
      const cropW = Math.min(origW - cropX, w + 2 * padW);
      const cropH = Math.min(origH - cropY, h + 2 * padH);

      const cropFilename = `${baseName}_crop_${i + 1}.jpg`;
      const outPath1 = path.join(CROPS_DIR, cropFilename);
      const outPath2 = path.join(PUBLIC_CROPS_DIR, cropFilename);

      await sharp(inputImagePath)
        .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
        .jpeg({ quality: 95 })
        .toFile(outPath1);

      // Also copy to public/crops for UI preview
      fs.copyFileSync(outPath1, outPath2);

      totalCrops++;
      console.log(`  ✓ Saved: ${cropFilename} (${cropW}x${cropH} px)`);
    }
  }

  console.log("\n========================================================");
  console.log(`🎉 Cropping Complete!`);
  console.log(`   • Total Images Scanned:   ${images.length}`);
  console.log(`   • Tiger Frames:           ${totalTigers}`);
  console.log(`   • Blank Frames (Skipped): ${totalBlanks}`);
  console.log(`   • Total Flank Crops:      ${totalCrops}`);
  console.log(`   • Destination Folders:    ./crops/ and ./public/crops/`);
  console.log("========================================================\n");
}

runCropping().catch((err) => {
  console.error("Cropping failed:", err);
  process.exit(1);
});
