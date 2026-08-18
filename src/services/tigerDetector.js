/*
|--------------------------------------------------------------------------
| VanDrishti AI — Dedicated Tiger Detection & Cropping Service
|--------------------------------------------------------------------------
|
| Responsibilities:
| 1. Load tiger_detection.onnx offline via onnxruntime-web
| 2. Preprocess camera-trap images (Letterbox 640x640, RGB Float32 tensor)
| 3. Run detection inference + Non-Maximum Suppression (NMS)
| 4. Extract individual tiger crops from bounding boxes [x1, y1, x2, y2]
| 5. Return structured detection report with crop assets
|--------------------------------------------------------------------------
*/

import * as ortModule from "onnxruntime-web";

const getOrt = () => (typeof window !== "undefined" && window.ort ? window.ort : ortModule);

let detectionSession = null;
let isSessionLoading = false;

export const tigerDetector = {
  /*
  | 1. Load and initialize the detection model
  */
  async init() {
    if (detectionSession) {
      return { success: true, session: detectionSession };
    }

    if (isSessionLoading) {
      while (isSessionLoading) {
        await new Promise(r => setTimeout(r, 50));
      }
      return { success: true, session: detectionSession };
    }

    isSessionLoading = true;
    try {
      const ort = getOrt();
      if (ort?.env?.wasm) {
        ort.env.wasm.wasmPaths = "/wasm/";
        ort.env.wasm.numThreads = 1;
      }

      console.log("[TigerDetector] Loading tiger_detection.onnx...");
      detectionSession = await ort.InferenceSession.create("/models/tiger_detection.onnx", {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      console.log("[TigerDetector] Detection model loaded successfully.");
      return { success: true, session: detectionSession };
    } catch (err) {
      console.warn("[TigerDetector] Note on model loading:", err.message);
      return { success: true, fallback: true, error: err.message };
    } finally {
      isSessionLoading = false;
    }
  },

  /*
  | 2. Preprocess an image to 640x640 Float32Array Tensor
  | @param {string} imageSrc
  | @param {number} targetSize
  | @param {number} contextMargin - e.g. 0 for full-frame, 0.45 for padded context pass
  */
  async preprocessImage(imageSrc, targetSize = 640, contextMargin = 0) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (typeof imageSrc === "string" && (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"))) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Background color: #808080 (neutral gray) if contextual margin is applied, else black (#000000)
        ctx.fillStyle = contextMargin > 0 ? "#808080" : "#000000";
        ctx.fillRect(0, 0, targetSize, targetSize);

        const marginFactor = Math.max(0.1, 1 - contextMargin);
        const scale = Math.min((targetSize * marginFactor) / origWidth, (targetSize * marginFactor) / origHeight);
        const newWidth = Math.round(origWidth * scale);
        const newHeight = Math.round(origHeight * scale);
        const padX = Math.round((targetSize - newWidth) / 2);
        const padY = Math.round((targetSize - newHeight) / 2);

        ctx.drawImage(img, padX, padY, newWidth, newHeight);

        const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
        const pixels = imgData.data;

        // Convert RGBA -> NCHW Float32Array [0, 1]
        const floatArray = new Float32Array(3 * targetSize * targetSize);
        const channelSize = targetSize * targetSize;

        for (let i = 0; i < channelSize; i++) {
          floatArray[i] = pixels[i * 4] / 255.0;                         // R
          floatArray[channelSize + i] = pixels[i * 4 + 1] / 255.0;       // G
          floatArray[2 * channelSize + i] = pixels[i * 4 + 2] / 255.0;   // B
        }

        const ort = getOrt();
        const tensor = new ort.Tensor("float32", floatArray, [1, 3, targetSize, targetSize]);

        resolve({
          tensor,
          img,
          origWidth,
          origHeight,
          scale,
          padX,
          padY,
          targetSize,
          contextMargin
        });
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${imageSrc?.slice ? imageSrc.slice(0, 80) : imageSrc}`));
      img.src = imageSrc;
    });
  },

  /*
  | 3. Crop Tiger Bounding Box from Image
  */
  cropBoundingBox(imgElement, bbox, paddingPercent = 0.05) {
    const origW = imgElement.naturalWidth || imgElement.width;
    const origH = imgElement.naturalHeight || imgElement.height;

    let [x1, y1, x2, y2] = bbox;
    const w = x2 - x1;
    const h = y2 - y1;

    // Optional margin/padding around tiger flank
    const padW = Math.round(w * paddingPercent);
    const padH = Math.round(h * paddingPercent);

    x1 = Math.max(0, x1 - padW);
    y1 = Math.max(0, y1 - padH);
    x2 = Math.min(origW, x2 + padW);
    y2 = Math.min(origH, y2 + padH);

    // If box is invalid or collapsed, default to full image bounds
    if (x2 <= x1 || y2 <= y1) {
      x1 = 0;
      y1 = 0;
      x2 = origW;
      y2 = origH;
    }

    const cropW = Math.max(10, Math.min(origW - x1, x2 - x1));
    const cropH = Math.max(10, Math.min(origH - y1, y2 - y1));

    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(imgElement, x1, y1, cropW, cropH, 0, 0, cropW, cropH);

    return {
      cropDataUrl: canvas.toDataURL("image/jpeg", 0.95),
      cropWidth: cropW,
      cropHeight: cropH,
      adjustedBbox: [x1, y1, x1 + cropW, y1 + cropH]
    };
  },

  /*
  | 4. Calculate Non-Maximum Suppression (NMS)
  */
  applyNMS(boxes, iouThreshold = 0.45) {
    if (!boxes || boxes.length === 0) return [];
    boxes.sort((a, b) => b.confidence - a.confidence);

    const selected = [];
    const active = new Array(boxes.length).fill(true);

    for (let i = 0; i < boxes.length; i++) {
      if (!active[i]) continue;
      selected.push(boxes[i]);

      for (let j = i + 1; j < boxes.length; j++) {
        if (!active[j]) continue;
        const iou = this.calculateIoU(boxes[i].bbox, boxes[j].bbox);
        if (iou > iouThreshold) {
          active[j] = false;
        }
      }
    }
    return selected;
  },

  calculateIoU(boxA, boxB) {
    const [x1A, y1A, x2A, y2A] = boxA;
    const [x1B, y1B, x2B, y2B] = boxB;

    const xA = Math.max(x1A, x1B);
    const yA = Math.max(y1A, y1B);
    const xB = Math.min(x2A, x2B);
    const yB = Math.min(y2A, y2B);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = (x2A - x1A) * (y2A - y1A);
    const boxBArea = (x2B - x1B) * (y2B - y1B);

    const unionArea = boxAArea + boxBArea - interArea;
    return unionArea > 0 ? interArea / unionArea : 0;
  },

  /*
  | 5. Internal: Evaluate YOLO tensor output and return raw candidate boxes
  */
  async _evaluateTensor(prep, threshold) {
    let rawCandidates = [];
    let highestRawScore = 0;

    if (!detectionSession) {
      return { detectedBoxes: [], highestRawScore: 0 };
    }

    try {
      const feeds = {};
      const inputName = detectionSession.inputNames[0] || "images";
      feeds[inputName] = prep.tensor;

      const output = await detectionSession.run(feeds);
      const outTensor = output[detectionSession.outputNames[0]];

      if (outTensor && outTensor.data) {
        const data = outTensor.data;
        const dims = outTensor.dims || [1, 5, 8400];
        let numChannels = dims[1];
        let numAnchors = dims[2];
        let transposed = false;
        if (numChannels > numAnchors) {
          numAnchors = dims[1];
          numChannels = dims[2];
          transposed = true;
        }

        if (transposed) {
          for (let a = 0; a < numAnchors; a++) {
            let maxScore = 0;
            let classId = 0;
            for (let c = 4; c < numChannels; c++) {
              const score = data[a * numChannels + c];
              if (score > maxScore) {
                maxScore = score;
                classId = c - 4;
              }
            }

            if (maxScore > highestRawScore) {
              highestRawScore = maxScore;
            }

            if (maxScore >= threshold) {
              const cx = data[a * numChannels + 0];
              const cy = data[a * numChannels + 1];
              const w = data[a * numChannels + 2];
              const h = data[a * numChannels + 3];

              const x1 = Math.max(0, (cx - w / 2 - prep.padX) / prep.scale);
              const y1 = Math.max(0, (cy - h / 2 - prep.padY) / prep.scale);
              const x2 = Math.min(prep.origWidth, (cx + w / 2 - prep.padX) / prep.scale);
              const y2 = Math.min(prep.origHeight, (cy + h / 2 - prep.padY) / prep.scale);

              rawCandidates.push({
                bbox: [Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2)],
                confidence: maxScore,
                classId
              });
            }
          }
        } else {
          for (let a = 0; a < numAnchors; a++) {
            let maxScore = 0;
            let classId = 0;
            for (let c = 4; c < numChannels; c++) {
              const score = data[c * numAnchors + a];
              if (score > maxScore) {
                maxScore = score;
                classId = c - 4;
              }
            }

            if (maxScore > highestRawScore) {
              highestRawScore = maxScore;
            }

            if (maxScore >= threshold) {
              const cx = data[0 * numAnchors + a];
              const cy = data[1 * numAnchors + a];
              const w = data[2 * numAnchors + a];
              const h = data[3 * numAnchors + a];

              const x1 = Math.max(0, (cx - w / 2 - prep.padX) / prep.scale);
              const y1 = Math.max(0, (cy - h / 2 - prep.padY) / prep.scale);
              const x2 = Math.min(prep.origWidth, (cx + w / 2 - prep.padX) / prep.scale);
              const y2 = Math.min(prep.origHeight, (cy + h / 2 - prep.padY) / prep.scale);

              rawCandidates.push({
                bbox: [Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2)],
                confidence: maxScore,
                classId
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[TigerDetector] Detection tensor evaluation note:`, e.message);
    }

    const detectedBoxes = this.applyNMS(rawCandidates, 0.45);
    return { detectedBoxes, highestRawScore };
  },

  /*
  | 6. Run Detection & Generate Crops on a Single Image (Smart Multi-Pass)
  */
  async detectAndCrop(imageSrc, manifestOrOptions = null, confThreshold = 0.35) {
    await this.init();

    let filename = "image.jpg";
    let threshold = confThreshold;
    if (typeof manifestOrOptions === "string") {
      filename = manifestOrOptions;
    } else if (manifestOrOptions && typeof manifestOrOptions === "object") {
      filename = manifestOrOptions.filename || manifestOrOptions.name || filename;
      if (typeof manifestOrOptions.confThreshold === "number") {
        threshold = manifestOrOptions.confThreshold;
      }
    } else if (typeof imageSrc === "string" && !imageSrc.startsWith("data:") && !imageSrc.startsWith("blob:")) {
      filename = imageSrc.split("/").pop().split("?")[0] || filename;
    }

    const baseName = filename.replace(/\.[^/.]+$/, "");

    // Pass 1: Standard Full-Frame Evaluation
    let prep = await this.preprocessImage(imageSrc, 640, 0);
    let evalRes = await this._evaluateTensor(prep, threshold);
    let detectedBoxes = evalRes.detectedBoxes;
    let highestRawScore = evalRes.highestRawScore;

    // Pass 2 (Contextual Margin Pass):
    // If Pass 1 finds no tiger (or score is below threshold), evaluate with contextual margin padding.
    // This allows pre-cropped images (e.g. ATRW crops) and tight tiger close-ups to be recognized by YOLO without false blanks.
    if (detectedBoxes.length === 0) {
      try {
        const paddedPrep = await this.preprocessImage(imageSrc, 640, 0.45);
        const paddedEval = await this._evaluateTensor(paddedPrep, threshold);
        if (paddedEval.detectedBoxes.length > 0) {
          detectedBoxes = paddedEval.detectedBoxes;
          highestRawScore = paddedEval.highestRawScore;
          prep = paddedPrep; // use padded resolution references for crop coordinates
        } else if (paddedEval.highestRawScore > highestRawScore) {
          highestRawScore = paddedEval.highestRawScore;
        }
      } catch (paddedErr) {
        console.warn("[TigerDetector] Contextual pass note:", paddedErr.message);
      }
    }

    // Classification
    const hasTiger = detectedBoxes.length > 0;
    const isBlank = !hasTiger;
    const isMultipleTigers = detectedBoxes.length > 1;

    console.log(`[TigerDetector] ${filename} result: hasTiger=${hasTiger}, maxScore=${(highestRawScore * 100).toFixed(1)}%, detectedBoxes=${detectedBoxes.length}, threshold=${(threshold * 100)}%`);

    // Generate individual tiger crops from bounding boxes (empty if blank)
    const crops = [];
    if (hasTiger) {
      for (let i = 0; i < detectedBoxes.length; i++) {
        const { bbox, confidence } = detectedBoxes[i];
        const cropResult = this.cropBoundingBox(prep.img, bbox);

        const cropFilename = `${baseName}_crop_${i + 1}.jpg`;
        crops.push({
          cropIndex: i + 1,
          cropFilename,
          cropDataUrl: cropResult.cropDataUrl,
          cropWidth: cropResult.cropWidth,
          cropHeight: cropResult.cropHeight,
          bbox: cropResult.adjustedBbox,
          originalBbox: bbox,
          confidence: Math.round(confidence * 1000) / 10, // e.g. 94.2%
          sourceImage: imageSrc,
          sourceFilename: filename
        });
      }
    }

    return {
      filename,
      baseName,
      imageSrc,
      origWidth: prep.origWidth,
      origHeight: prep.origHeight,
      hasTiger,
      isBlank,
      tigerCount: crops.length,
      isMultipleTigers,
      highestRawScore: Math.round(highestRawScore * 1000) / 10,
      classification: isBlank
        ? "BLANK_QUARANTINE"
        : (isMultipleTigers ? "MULTIPLE_TIGERS_DETECTED" : "SINGLE_TIGER_DETECTED"),
      detectedBoxes,
      crops, // Array of cropped tiger images and coordinates
      processedAt: new Date().toISOString()
    };
  }
};
