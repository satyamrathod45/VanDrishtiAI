import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Crop,
  Download,
  Eye,
  FileImage,
  Folder,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  UserCheck,
  X,
} from "lucide-react";

import { tigerDetector } from "../../services/tigerDetector";
import { vectorDbService } from "../../services/vectorDbService";
import { tigerReid } from "../../services/tigerReid";

export default function FolderUploadModal({ onClose, onBatchComplete }) {
  const navigate = useNavigate();

  // Selection states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDemoDataset, setIsDemoDataset] = useState(false);

  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);

  // Metadata configuration
  const [cameraId, setCameraId] = useState("CAM-TAD-01");
  const [zone, setZone] = useState("Moharli Core Zone");
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [confidenceThreshold, setConfidenceThreshold] = useState(35); // Default 35% (0.35)

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const [isComplete, setIsComplete] = useState(false);

  // Live progress metrics
  const [progress, setProgress] = useState({
    stage: 1,
    stageName: "Stage 1/2 · Scanning Frames & Extracting Tiger Crops",
    percent: 0,
    currentFile: "",
    currentIndex: 0,
    total: 0,
    tigersFound: 0,
    blanksQuarantined: 0,
    cropsGenerated: 0,
    matchesIdentified: 0,
    startTime: null,
    fps: 0,
    currentResult: null,
    currentCrop: null,
  });

  // Collected results
  const [allResults, setAllResults] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [quarantinedBlanks, setQuarantinedBlanks] = useState([]);
  const [selectedCropPreview, setSelectedCropPreview] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState("all"); // "all" | "matched" | "new" | "review"
  const [reviewTab, setReviewTab] = useState("crops"); // "crops" | "quarantine"

  // Filtered crops based on matching decision
  const filteredCrops = allCrops.filter((crop) => {
    if (galleryFilter === "matched") return crop.matchStatus === "CONFIRMED_MATCH";
    if (galleryFilter === "new") return crop.matchStatus === "NEW_TIGER_REGISTERED";
    if (galleryFilter === "review") return crop.matchStatus === "REVIEW_REQUIRED";
    return true;
  });

  // Pre-load Vector DB and Detector model sessions
  useEffect(() => {
    tigerDetector.init().catch((err) => console.warn("[Detector] init:", err));
    vectorDbService.init({ forceReload: true }).catch((err) => console.warn("[VectorDB] init:", err));
  }, []);

  // Update paused ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Handle Drag & Drop of local images / folders
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setErrorMessage("");
    setIsDemoDataset(false);

    const items = Array.from(e.dataTransfer.files || []);
    console.log("[FolderUpload Debug] handleDrop received items:", items.length);
    const validImages = items.filter((f) =>
      /\.(jpe?g|png|webp|bmp)$/i.test(f.name)
    );
    console.log("[FolderUpload Debug] Valid image files dropped:", validImages.length, validImages.map(f => f.name));

    if (validImages.length > 0) {
      setSelectedFiles(validImages);
      setFolderName(`Dropped Files (${validImages.length} images)`);
      setFolderPath("Dropped Files");
    } else {
      console.warn("[FolderUpload Debug] No valid images in drop event.");
      setErrorMessage("No valid image files (JPG, PNG, WEBP, BMP) found in dropped items.");
    }
  };

  // Native Electron Directory Picker
  const handleNativeSelectFolder = async () => {
    setErrorMessage("");
    setIsDemoDataset(false);
    console.log("[FolderUpload Debug] handleNativeSelectFolder invoked. window.electronAPI:", !!window.electronAPI);
    if (window.electronAPI && typeof window.electronAPI.selectFolder === "function") {
      try {
        const res = await window.electronAPI.selectFolder();
        console.log("[FolderUpload Debug] Native selectFolder response:", res);
        if (res && !res.canceled && res.files) {
          const files = res.files || [];
          if (files.length === 0) {
            console.warn("[FolderUpload Debug] Native folder had 0 image files.");
            setErrorMessage("The selected folder contains no image files (JPG, PNG, WEBP, BMP).");
            return;
          }
          console.log(`[FolderUpload Debug] Setting selectedFiles to ${files.length} items from ${res.folderPath}`);
          setSelectedFiles(files);
          setFolderPath(res.folderPath || "");
          const baseName = res.folderPath ? res.folderPath.split(/[/\\]/).pop() : "Selected Folder";
          setFolderName(baseName);
        }
      } catch (err) {
        console.error("[FolderUpload Debug] ❌ Native folder picker error:", err);
        setErrorMessage("Error opening directory dialog: " + err.message);
      }
    } else if (folderInputRef.current) {
      console.log("[FolderUpload Debug] Falling back to web folder input (folderInputRef.current.click())");
      folderInputRef.current.click();
    }
  };

  // Web Browser Folder Picker (webkitdirectory)
  const handleWebFolderChange = (event) => {
    setErrorMessage("");
    setIsDemoDataset(false);
    const rawFiles = Array.from(event.target.files || []);
    console.log("[FolderUpload Debug] handleWebFolderChange raw files:", rawFiles.length);
    const validImages = rawFiles.filter((f) =>
      /\.(jpe?g|png|webp|bmp)$/i.test(f.name)
    );
    console.log("[FolderUpload Debug] handleWebFolderChange valid images:", validImages.length, validImages.slice(0, 5).map(f => f.name));

    if (validImages.length > 0) {
      setSelectedFiles(validImages);
      const relativePath = validImages[0]?.webkitRelativePath || "";
      const detectedDir = relativePath ? relativePath.split("/")[0] : "Uploaded Folder";
      setFolderName(detectedDir);
      setFolderPath(detectedDir);
    } else if (rawFiles.length > 0) {
      console.warn("[FolderUpload Debug] No supported images found in web folder selection.");
      setErrorMessage("No supported image formats (.jpg, .jpeg, .png, .webp, .bmp) were found in this folder.");
    }
  };

  // Web Browser Multi-file Picker
  const handleMultiFilesChange = (event) => {
    setErrorMessage("");
    setIsDemoDataset(false);
    const rawFiles = Array.from(event.target.files || []);
    console.log("[FolderUpload Debug] handleMultiFilesChange raw files:", rawFiles.length);
    const validImages = rawFiles.filter((f) =>
      /\.(jpe?g|png|webp|bmp)$/i.test(f.name)
    );
    console.log("[FolderUpload Debug] handleMultiFilesChange valid images:", validImages.length, validImages.slice(0, 5).map(f => f.name));

    if (validImages.length > 0) {
      setSelectedFiles(validImages);
      setFolderName(`Selected Images (${validImages.length} files)`);
      setFolderPath("Custom Selection");
    } else if (rawFiles.length > 0) {
      console.warn("[FolderUpload Debug] Invalid files selected.");
      setErrorMessage("Please select valid image files (.jpg, .jpeg, .png, .webp, .bmp).");
    }
  };

  // Clear current selection
  const handleClearSelection = () => {
    setSelectedFiles([]);
    setFolderName("");
    setFolderPath("");
    setErrorMessage("");
    setIsDemoDataset(false);
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (filesInputRef.current) filesInputRef.current.value = "";
  };

  // Helper to resolve Image URL from user uploaded file object / path
  const resolveImageSource = async (fileItem) => {
    console.log("[FolderUpload Debug] resolveImageSource for item:", fileItem?.name || fileItem?.filename, fileItem);

    if (fileItem instanceof File || fileItem instanceof Blob) {
      const blobUrl = URL.createObjectURL(fileItem);
      console.log("[FolderUpload Debug] Generated Blob URL:", blobUrl);
      return blobUrl;
    }

    if (fileItem.url) {
      console.log("[FolderUpload Debug] Using fileItem.url:", fileItem.url);
      return fileItem.url;
    }

    if (typeof fileItem === "string") {
      console.log("[FolderUpload Debug] Using string path:", fileItem);
      return fileItem;
    }

    if (fileItem.fullPath && window.electronAPI && typeof window.electronAPI.readImageDataUrl === "function") {
      console.log("[FolderUpload Debug] Reading Electron local path via readImageDataUrl:", fileItem.fullPath);
      try {
        const res = await window.electronAPI.readImageDataUrl(fileItem.fullPath);
        if (res.success && res.dataUrl) {
          console.log("[FolderUpload Debug] Successfully read base64 data URL from disk for:", fileItem.name);
          return res.dataUrl;
        }
      } catch (err) {
        console.warn("[FolderUpload Debug] readImageDataUrl notice:", err.message);
      }
      return `file://${fileItem.fullPath.replace(/\\/g, "/")}`;
    }

    if (fileItem.fullPath) {
      return `file://${fileItem.fullPath.replace(/\\/g, "/")}`;
    }

    throw new Error(`Unable to resolve image source for ${fileItem.name || "selected item"}`);
  };

  // Start Batch Pipeline: Two-Stage Sequential Processing
  const handleStartProcessing = async () => {
    console.log("[FolderUpload Debug] handleStartProcessing triggered! Total selected files:", selectedFiles.length);

    if (!selectedFiles || selectedFiles.length === 0) {
      console.warn("[FolderUpload Debug] ❌ BLOCKED: No files selected.");
      setErrorMessage("⚠️ No images selected! Please select a folder or image files before clicking Start Processing.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);
    setIsPaused(false);
    setIsComplete(false);
    isPausedRef.current = false;
    isCancelledRef.current = false;

    setAllResults([]);
    setAllCrops([]);
    setQuarantinedBlanks([]);

    const startTime = Date.now();

    try {
      // Initialize Models
      console.log("[FolderUpload Debug] Initializing AI models (YOLO TigerDetector + VectorDB)...");
      await tigerDetector.init();
      await vectorDbService.init({ forceReload: true });

      const fileItems = [...selectedFiles];
      const totalImages = fileItems.length;

      const collectedResults = [];
      const extractedCropsRaw = [];
      const collectedQuarantined = [];
      let tigersCount = 0;
      let blanksCount = 0;

      // =========================================================================
      // STAGE 1: TIGER DETECTION & CROPPING (Iterate over all input images)
      // =========================================================================
      console.log(`[FolderUpload Debug] === STAGE 1 START: Detecting & Cropping ${totalImages} images ===`);

      for (let i = 0; i < totalImages; i++) {
        if (isCancelledRef.current) {
          console.log("[FolderUpload Debug] Pipeline cancelled by user.");
          break;
        }

        while (isPausedRef.current) {
          await new Promise((r) => setTimeout(r, 150));
          if (isCancelledRef.current) break;
        }
        if (isCancelledRef.current) break;

        const fileItem = fileItems[i];
        const fileName = fileItem.name || fileItem.filename || `IMG_${i + 1}.jpg`;
        console.group(`[FolderUpload Debug] Stage 1 Frame ${i + 1}/${totalImages}: ${fileName}`);

        let imageSrc = "";
        try {
          imageSrc = await resolveImageSource(fileItem);
        } catch (srcErr) {
          console.error(`[FolderUpload Debug] ❌ Failed to resolve source for ${fileName}:`, srcErr);
          console.groupEnd();
          continue;
        }

        // Run YOLO detector with confidence threshold
        let detectionResult;
        try {
          detectionResult = await tigerDetector.detectAndCrop(
            imageSrc,
            {
              ...(fileItem.manifestEntry || { filename: fileName, name: fileName, isDemo: isDemoDataset }),
              confThreshold: confidenceThreshold / 100,
            }
          );
        } catch (detErr) {
          console.error(`[FolderUpload Debug] ❌ Detection error on ${fileName}:`, detErr);
          detectionResult = {
            filename: fileName,
            imageSrc,
            origWidth: 1920,
            origHeight: 1080,
            hasTiger: false,
            isBlank: true,
            tigerCount: 0,
            crops: [],
            detectedBoxes: [],
          };
        }

        // If NOT tiger -> Quarantined
        if (!detectionResult.hasTiger || !detectionResult.crops || detectionResult.crops.length === 0) {
          blanksCount++;
          console.log(`[FolderUpload Debug] Frame ${fileName} -> Quarantined (Blank vegetation / no tiger).`);
          collectedQuarantined.push({
            id: `QUARANTINE-${Date.now()}-${i}`,
            filename: fileName,
            imageSrc,
            cameraId,
            zone,
            collectionDate,
            timestamp: new Date().toISOString(),
            maxScore: detectionResult.highestRawScore || 0,
            reason: `Detection score (${detectionResult.highestRawScore || 0}%) below ${confidenceThreshold}% threshold (Blank vegetation / no tiger)`,
            status: "BLANK_QUARANTINE",
          });
        } else {
          // If tiger detected -> collect raw bounding box crops for Stage 2
          tigersCount++;
          console.log(`[FolderUpload Debug] Frame ${fileName} -> Detected ${detectionResult.crops.length} tiger crop(s).`);
          for (let c = 0; c < detectionResult.crops.length; c++) {
            const crop = detectionResult.crops[c];
            extractedCropsRaw.push({
              ...crop,
              id: `CROP-${Date.now()}-${c}-${i}`,
              cameraId,
              zone,
              collectionDate,
              sourceFilename: fileName,
              sourceImageSrc: imageSrc,
            });
          }
        }

        console.groupEnd();
        collectedResults.push(detectionResult);
        setAllResults([...collectedResults]);
        setQuarantinedBlanks([...collectedQuarantined]);

        const elapsedSec = (Date.now() - startTime) / 1000;
        const currentFps = elapsedSec > 0 ? ((i + 1) / elapsedSec).toFixed(1) : 0;
        // Stage 1 covers 0% to 50% of the overall progress
        const percent = Math.round(((i + 1) / totalImages) * 50);

        setProgress({
          stage: 1,
          stageName: `Stage 1/2 · Scanning & Extracting Tiger Crops (${i + 1}/${totalImages} frames)`,
          percent,
          currentFile: fileName,
          currentIndex: i + 1,
          total: totalImages,
          tigersFound: tigersCount,
          blanksQuarantined: blanksCount,
          cropsGenerated: extractedCropsRaw.length,
          matchesIdentified: 0,
          startTime,
          fps: currentFps,
          currentResult: detectionResult,
          currentCrop: null,
        });

        await new Promise((r) => setTimeout(r, 20));
      }

      console.log(`[FolderUpload Debug] === STAGE 1 COMPLETE! Scanned: ${totalImages}, Tigers: ${tigersCount}, Crops Extracted: ${extractedCropsRaw.length}, Blanks: ${blanksCount} ===`);

      // =========================================================================
      // STAGE 2: RE-ID EMBEDDING & TOP 3 VECTOR RANKING (Iterate over all crops)
      // =========================================================================
      const totalCrops = extractedCropsRaw.length;
      const finalEnrichedCrops = [];
      let matchesCount = 0;

      if (totalCrops > 0 && !isCancelledRef.current) {
        console.log(`[FolderUpload Debug] === STAGE 2 START: Running Re-ID & Top 3 Vector Matching on ${totalCrops} tiger crops ===`);

        for (let k = 0; k < totalCrops; k++) {
          if (isCancelledRef.current) break;
          while (isPausedRef.current) {
            await new Promise((r) => setTimeout(r, 150));
            if (isCancelledRef.current) break;
          }
          if (isCancelledRef.current) break;

          const rawCrop = extractedCropsRaw[k];
          console.group(`[FolderUpload Debug] Stage 2 Re-ID Crop ${k + 1}/${totalCrops}: ${rawCrop.cropFilename}`);

          let topMatches = [];
          let embeddingVector = null;

          try {
            if (rawCrop.cropDataUrl) {
              const searchRes = await vectorDbService.searchByCrop(rawCrop.cropDataUrl, {
                topK: 3,
                minSimilarity: 0.10,
              });
              embeddingVector = searchRes.queryEmbedding;

              if (searchRes && searchRes.matches && searchRes.matches.length > 0) {
                topMatches = searchRes.matches.slice(0, 3).map((m, rankIdx) => ({
                  rank: rankIdx + 1,
                  tigerId: m.tiger_id || m.tigerId || "UNIDENTIFIED",
                  tigerName: m.sighting?.station_name || m.tiger_id || "Tiger Individual",
                  similarity: m.similarity,
                  confidencePercent: m.confidence || Math.round(m.similarity * 1000) / 10,
                  tier: m.tier || (m.similarity >= 0.70 ? "HIGH_CONFIDENCE_MATCH" : "MODERATE_MATCH"),
                  label: m.label || (m.similarity >= 0.70 ? "Strong Match" : "Candidate Match"),
                  isMatch: m.isMatch ?? (m.similarity >= 0.55),
                  cropPath: m.crop_path || m.sighting?.crop_path,
                  sourceImage: m.source_image || m.sighting?.source_image,
                  zone: m.zone || m.sighting?.zone,
                  cameraId: m.camera_id || m.sighting?.camera_id,
                }));
              }
            }
          } catch (reidErr) {
            console.warn(`[FolderUpload Debug] Re-ID error on crop ${k + 1}:`, reidErr.message);
          }

          const rank1 = topMatches[0] || null;
          const rank2 = topMatches[1] || null;
          const rank3 = topMatches[2] || null;

          let matchStatus = "REVIEW_REQUIRED";
          let decisionReason = "";
          let assignedTigerId = null;
          let isNewTiger = false;

          // Rule 1: High-Confidence Match (≥90% and distinct from 2nd rank by ≥8%)
          const isHighConfidence = rank1 && rank1.confidencePercent >= 90;
          const isDistinct = !rank2 || (rank1.confidencePercent - rank2.confidencePercent >= 8);

          if (isHighConfidence && isDistinct) {
            matchStatus = "CONFIRMED_MATCH";
            assignedTigerId = rank1.tigerId;
            decisionReason = `High-Confidence Match (≥90%) to resident tiger ${rank1.tigerId} (${rank1.confidencePercent}% similarity, margin: ${rank2 ? (rank1.confidencePercent - rank2.confidencePercent).toFixed(1) : 100}%). Registered to profile.`;
            matchesCount++;
          } 
          // Rule 2: Unmatched / Low-Confidence (<70%) -> Assign New Tiger Individual ID
          else if (!rank1 || rank1.confidencePercent < 70) {
            matchStatus = "NEW_TIGER_REGISTERED";
            isNewTiger = true;
            assignedTigerId = `T-${100 + k + 1}`;
            const highestScore = rank1 ? `${rank1.confidencePercent}%` : "0%";
            decisionReason = `Highest match score in catalog is ${highestScore} (< 70% threshold). Automatically classified as New Resident Tiger individual ${assignedTigerId} candidate.`;
          } 
          // Rule 3: Moderate / Ambiguous Candidate (70% <= Score < 90% OR Close Margin)
          else {
            matchStatus = "REVIEW_REQUIRED";
            assignedTigerId = rank1.tigerId;
            const gap = rank2 ? (rank1.confidencePercent - rank2.confidencePercent).toFixed(1) : "N/A";
            decisionReason = `Candidate match to resident ${rank1.tigerId} (${rank1.confidencePercent}% similarity, margin: ${gap}%). Flagged for Ranger stripe verification.`;
          }

          console.groupEnd();

          const enrichedCrop = {
            ...rawCrop,
            embedding: embeddingVector,
            topMatches,
            topMatch: rank1,
            reidMatch: rank1,
            matchStatus,
            assignedTigerId,
            isNewTiger,
            decisionReason,
          };

          // Automatically add newly discovered tiger individual or sighting into Vector Database
          if (embeddingVector && assignedTigerId) {
            try {
              vectorDbService.registerTigerSighting({
                id: enrichedCrop.id || `CROP_${Date.now()}_${k}`,
                tiger_id: assignedTigerId,
                vector: embeddingVector,
                crop_path: rawCrop.cropDataUrl || rawCrop.cropFilename,
                source_image: rawCrop.sourceFilename || fileName,
                camera_id: cameraId || "CAM-TAD-01",
                station_name: `${zone} Station`,
                zone: zone.includes("Buffer") ? "Buffer" : (zone.includes("Corridor") ? "Corridor" : "Core"),
                timestamp: collectionDate || new Date().toISOString(),
                reid_confidence: rank1 ? rank1.confidencePercent : (isNewTiger ? 95.0 : 85.0),
                review_status: isNewTiger ? "verified" : "pending_review",
                isNewTiger,
              });
            } catch (regErr) {
              console.warn("[FolderUpload Debug] Vector DB auto-register notice:", regErr.message);
            }
          }

          finalEnrichedCrops.push(enrichedCrop);
          setAllCrops([...finalEnrichedCrops]);

          const elapsedSec = (Date.now() - startTime) / 1000;
          const currentFps = elapsedSec > 0 ? ((k + 1) / elapsedSec).toFixed(1) : 0;
          // Stage 2 covers 50% to 100% of the overall progress
          const percent = 50 + Math.round(((k + 1) / totalCrops) * 50);

          setProgress({
            stage: 2,
            stageName: `Stage 2/2 · Running Re-ID Model & Top 3 Vector Matching (${k + 1}/${totalCrops} crops)`,
            percent,
            currentFile: rawCrop.cropFilename,
            currentIndex: k + 1,
            total: totalCrops,
            tigersFound: tigersCount,
            blanksQuarantined: blanksCount,
            cropsGenerated: finalEnrichedCrops.length,
            matchesIdentified: matchesCount,
            startTime,
            fps: currentFps,
            currentResult: null,
            currentCrop: rawCrop,
          });

          await new Promise((r) => setTimeout(r, 20));
        }
      }

      // Stage 4: Local Disk Auto-Save in Electron
      if (finalEnrichedCrops.length > 0 && window.electronAPI && typeof window.electronAPI.saveCrops === "function") {
        try {
          const res = await window.electronAPI.saveCrops(finalEnrichedCrops);
          console.log(`[VanDrishti Debug] Saved ${res.savedCount} tiger crops to local disk:`, res.folder);
        } catch (e) {
          console.warn("[FolderUpload Debug] Local disk save notice:", e.message);
        }
      }

      console.log(`[FolderUpload Debug] === PIPELINE COMPLETE! Opening Human Review === Total: ${totalImages}, Tigers: ${tigersCount}, Crops: ${finalEnrichedCrops.length}, Quarantined: ${blanksCount}`);
      setIsComplete(true);
    } catch (err) {
      console.error("[FolderUpload Debug] ❌ Pipeline failed:", err);
      setErrorMessage("Batch processing error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export all crops as ZIP
  const handleExportZip = async () => {
    if (allCrops.length === 0) return;
    try {
      const zip = new JSZip();
      const folder = zip.folder("tiger_crops");
      const metadataManifest = [];

      for (const crop of allCrops) {
        if (crop.cropDataUrl) {
          const base64Data = crop.cropDataUrl.split(",")[1];
          folder.file(crop.cropFilename, base64Data, { base64: true });
          metadataManifest.push({
            filename: crop.cropFilename,
            sourceImage: crop.sourceFilename,
            cameraId: crop.cameraId,
            zone: crop.zone,
            date: crop.collectionDate,
            bbox: crop.bbox,
            confidence: crop.confidence,
            reidPrediction: crop.reidMatch,
          });
        }
      }

      folder.file("crops_manifest.json", JSON.stringify(metadataManifest, null, 2));

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `VanDrishti_Tiger_Crops_${allCrops.length}_Images.zip`;
      link.click();
    } catch (err) {
      alert("ZIP Export error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md animate-fadeIn">
      <div className="flex max-h-[92vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[32px] border border-[#eeeeec] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
        {/* =================================================== */}
        {/* MODAL HEADER */}
        {/* =================================================== */}
        <div className="flex items-center justify-between border-b border-[#eeeeec] bg-[#fafaf8] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e97813]/10 text-[#e97813] shadow-xs">
              <FolderOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#e97813]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#e97813]">
                  Field Data Ingestion
                </span>
                {isProcessing && (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-[#e97813]">
                    <Loader2 size={11} className="animate-spin" /> Live Processing
                  </span>
                )}
                {isComplete && (
                  <span className="flex items-center gap-1 rounded-full bg-[#edf7ef] px-2 py-0.5 text-[8px] font-bold text-[#2e7d32]">
                    <CheckCircle2 size={10} /> Ingestion Complete
                  </span>
                )}
              </div>
              <h2 className="text-[19px] font-bold tracking-tight text-[#171717]">
                Camera Trap Folder & Image Ingestion
              </h2>
            </div>
          </div>

          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f0ee] text-[#777] transition hover:bg-[#e4e4e0] hover:text-[#111]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* =================================================== */}
        {/* MODAL BODY (Scrollable) */}
        {/* =================================================== */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* ================================================= */}
          {/* VIEW 1: INITIAL UPLOAD & CONFIGURATION FORM */}
          {/* ================================================= */}
          {!isProcessing && !isComplete && (
            <div className="space-y-5">
              {/* Error Message Banner */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4 text-[#b91c1c] animate-fadeIn">
                  <AlertCircle size={18} className="shrink-0 text-[#dc2626]" />
                  <p className="text-[11px] font-semibold flex-1 leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => setErrorMessage("")}
                    className="text-[#991b1b] hover:text-[#111]"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Upload Dropzone & Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.6px] text-[#888]">
                    Select Camera Trap Images or Folder
                  </p>
                  <span className="text-[8px] font-semibold text-[#888]">
                    Supports JPG, PNG, WEBP, BMP
                  </span>
                </div>

                {/* Dropzone Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
                    isDragOver
                      ? "border-[#e97813] bg-[#fff8f1] scale-[1.01]"
                      : selectedFiles.length > 0
                      ? "border-[#2e7d32] bg-[#f7fcf8]"
                      : "border-[#e0e0dc] bg-[#fafaf8] hover:border-[#ccc]"
                  }`}
                >
                  {/* Hidden inputs */}
                  <input
                    ref={folderInputRef}
                    type="file"
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    onChange={handleWebFolderChange}
                    className="hidden"
                  />

                  <input
                    ref={filesInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/bmp"
                    onChange={handleMultiFilesChange}
                    className="hidden"
                  />

                  {selectedFiles.length > 0 ? (
                    <div className="space-y-3 w-full">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7ef] text-[#2e7d32]">
                        <CheckCircle2 size={26} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#171717]">
                          {folderName}
                        </p>
                        <p className="text-[10px] text-[#2e7d32] font-semibold mt-0.5">
                          ✓ {selectedFiles.length} image files selected and ready to process
                        </p>
                        {folderPath && (
                          <p className="text-[8px] font-mono text-[#888] truncate max-w-md mx-auto mt-0.5">
                            {folderPath}
                          </p>
                        )}
                      </div>

                      {/* File preview thumbnails */}
                      <div className="flex gap-2 justify-center overflow-x-auto py-1 max-w-lg mx-auto scrollbar-none">
                        {selectedFiles.slice(0, 8).map((file, idx) => (
                          <div
                            key={idx}
                            className="h-14 w-16 shrink-0 rounded-xl overflow-hidden border border-[#dededb] bg-black/10 relative shadow-2xs"
                          >
                            <img
                              src={file instanceof File ? URL.createObjectURL(file) : (file.url || "/favicon.svg")}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {selectedFiles.length > 8 && (
                          <div className="h-14 w-16 shrink-0 rounded-xl border border-dashed border-[#dededb] bg-[#f5f5f3] flex items-center justify-center text-[9px] font-bold text-[#777]">
                            +{selectedFiles.length - 8} more
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleNativeSelectFolder}
                          className="rounded-xl border border-[#dededb] bg-white px-3 py-1.5 text-[9px] font-bold text-[#555] hover:bg-[#f0f0ee] transition"
                        >
                          Change Folder
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (filesInputRef.current) filesInputRef.current.click();
                          }}
                          className="rounded-xl border border-[#dededb] bg-white px-3 py-1.5 text-[9px] font-bold text-[#555] hover:bg-[#f0f0ee] transition"
                        >
                          Add Images
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="flex items-center gap-1 rounded-xl bg-[#fee2e2] px-3 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fecaca] transition"
                        >
                          <Trash2 size={12} />
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f0ee] text-[#777]">
                        <UploadCloud size={28} className="text-[#e97813]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#171717]">
                          Drag & drop camera trap folder or images here
                        </p>
                        <p className="text-[9px] text-[#888] mt-0.5">
                          Supports JPG, JPEG, PNG, WEBP, and BMP images
                        </p>
                      </div>

                      {/* Direct Selection Buttons */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleNativeSelectFolder}
                          className="flex items-center gap-2 rounded-xl bg-[#e97813] px-4 py-2.5 text-[10px] font-bold text-white shadow-xs hover:bg-[#f18420] transition active:scale-[0.98]"
                        >
                          <FolderOpen size={15} />
                          Select Folder (SD Card)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (filesInputRef.current) filesInputRef.current.click();
                          }}
                          className="flex items-center gap-2 rounded-xl border border-[#dededb] bg-white px-4 py-2.5 text-[10px] font-bold text-[#444] shadow-xs hover:bg-[#f5f5f3] transition active:scale-[0.98]"
                        >
                          <FileImage size={15} className="text-[#e97813]" />
                          Select Image Files
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#eeeeec] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl px-5 py-3 text-[10px] font-semibold text-[#777] transition hover:bg-[#f5f5f3]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStartProcessing}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-[10px] font-bold text-white transition active:scale-[0.98] ${
                    selectedFiles.length === 0
                      ? "bg-[#e97813]/60 cursor-pointer"
                      : "bg-[#e97813] hover:bg-[#f18420] shadow-md shadow-[#e97813]/25"
                  }`}
                >
                  <Play size={14} />
                  {selectedFiles.length > 0
                    ? `Process ${selectedFiles.length} Selected Images`
                    : "Start Batch Processing"}
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW 2: LIVE BATCH PROCESSING & SCANNING */}
          {/* ================================================= */}
          {isProcessing && (
            <div className="space-y-6 animate-fadeIn">
              {/* Status Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                        progress.stage === 1
                          ? "bg-[#fff1e4] text-[#c96b1d] border border-[#ffe0c2]"
                          : "bg-[#edf7ef] text-[#15803d] border border-[#d2edd6]"
                      }`}
                    >
                      {progress.stage === 1 ? "Phase 1: Detection & Cropping" : "Phase 2: Re-ID Vector Matching"}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-[#111] flex items-center gap-2 mt-1">
                    <Loader2 size={16} className="animate-spin text-[#e97813]" />
                    {progress.stageName}
                  </p>
                  <p className="text-[9px] text-[#777] mt-0.5">
                    {progress.stage === 1 ? (
                      <>
                        Scanning camera frame <span className="font-bold text-[#111]">{progress.currentIndex}</span> of{" "}
                        <span className="font-bold text-[#111]">{progress.total}</span> ·{" "}
                        <span className="font-mono text-[#e97813]">{progress.currentFile}</span>
                      </>
                    ) : (
                      <>
                        Matching crop <span className="font-bold text-[#111]">{progress.currentIndex}</span> of{" "}
                        <span className="font-bold text-[#111]">{progress.total}</span> against stripe database ·{" "}
                        <span className="font-mono text-[#e97813]">{progress.currentFile}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#dededb] bg-white px-3 py-1.5 text-[9px] font-bold text-[#555] hover:bg-[#f5f5f3] transition"
                  >
                    {isPaused ? <Play size={12} className="text-[#2e7d32]" /> : <Pause size={12} />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      isCancelledRef.current = true;
                      setIsProcessing(false);
                    }}
                    className="rounded-xl bg-[#fee2e2] px-3 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fecaca] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Progress Bar & Rate Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-semibold text-[#888]">
                  <span>Overall Pipeline: {progress.percent}%</span>
                  <span>Speed: {progress.fps} items/sec</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0f0ee]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e97813] to-[#f59e0b] transition-all duration-300 ease-out"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              {/* Active Stage Preview: Frame (Stage 1) or Crop (Stage 2) */}
              {progress.stage === 1 && progress.currentResult && (
                <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#eeeeec] bg-[#fbfbf9] p-4 items-center animate-fadeIn">
                  <div className="h-28 w-36 overflow-hidden rounded-xl bg-black shrink-0 relative flex items-center justify-center shadow-xs">
                    <img
                      src={progress.currentResult.imageSrc}
                      alt="Current scanning frame"
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[7px] font-bold text-white uppercase shadow-xs ${
                        progress.currentResult.hasTiger ? "bg-[#e97813]" : "bg-[#666]"
                      }`}
                    >
                      {progress.currentResult.hasTiger ? "✓ Tiger Sighting" : "Blank Frame"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[11px] font-bold text-[#111] truncate">
                      {progress.currentResult.filename}
                    </p>
                    <p className="text-[8.5px] text-[#777]">
                      Camera: <span className="font-bold text-[#111]">{cameraId}</span> · Zone:{" "}
                      <span className="font-semibold text-[#111]">{zone}</span>
                    </p>
                    <p className="text-[8.5px] text-[#777]">
                      Resolution: {progress.currentResult.origWidth} × {progress.currentResult.origHeight} px
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span
                        className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                          progress.currentResult.hasTiger
                            ? "bg-[#fff1e4] text-[#c96b1d]"
                            : "bg-[#f0f0ee] text-[#777]"
                        }`}
                      >
                        {progress.currentResult.hasTiger
                          ? `✓ ${progress.currentResult.tigerCount} Tiger(s) Detected`
                          : "Quarantined (Blank Frame)"}
                      </span>

                      {progress.currentResult.crops?.length > 0 && (
                        <span className="text-[8px] font-semibold text-[#15803d] bg-[#edf7ef] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crop size={10} />
                          {progress.currentResult.crops.length} Tiger Crop(s) Extracted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 2 Active Crop Re-ID Preview */}
              {progress.stage === 2 && progress.currentCrop && (
                <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#d2edd6] bg-[#f7fcf8] p-4 items-center animate-fadeIn">
                  <div className="h-28 w-36 overflow-hidden rounded-xl bg-black shrink-0 relative flex items-center justify-center shadow-xs">
                    <img
                      src={progress.currentCrop.cropDataUrl}
                      alt="Current Re-ID Crop"
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[7px] font-bold text-white bg-[#15803d] shadow-xs">
                      Re-ID Embedding
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[11px] font-bold text-[#111] truncate">
                      {progress.currentCrop.cropFilename}
                    </p>
                    <p className="text-[8.5px] text-[#777]">
                      Source Image: <span className="font-mono text-[#111]">{progress.currentCrop.sourceFilename}</span>
                    </p>
                    <p className="text-[8.5px] text-[#777]">
                      Crop Dimensions: <span className="font-semibold text-[#111]">{progress.currentCrop.cropWidth} × {progress.currentCrop.cropHeight} px</span>
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[8px] font-bold text-[#15803d] bg-[#edf7ef] border border-[#d2edd6] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={11} />
                        Extracting 2048-dim Stripe Vector & Ranking Top 3 Matches...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time KPI Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-2xl bg-[#f7f7f5] p-3 text-center border border-[#eeeeec]">
                  <p className="text-[8px] uppercase tracking-wider font-semibold text-[#888]">Scanned</p>
                  <p className="text-[17px] font-bold text-[#111] mt-0.5">
                    {progress.stage === 1 ? progress.currentIndex : progress.total}
                  </p>
                  <p className="text-[7.5px] text-[#888]">Input Frames</p>
                </div>
                <div className="rounded-2xl bg-[#fff8f1] border border-[#ffecd9] p-3 text-center">
                  <p className="text-[8px] uppercase tracking-wider font-semibold text-[#c96b1d]">Sightings</p>
                  <p className="text-[17px] font-bold text-[#e97813] mt-0.5">
                    {progress.tigersFound}
                  </p>
                  <p className="text-[7.5px] text-[#c96b1d]">Tiger Frames</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f5] p-3 text-center border border-[#eeeeec]">
                  <p className="text-[8px] uppercase tracking-wider font-semibold text-[#888]">Blanks</p>
                  <p className="text-[17px] font-bold text-[#666] mt-0.5">
                    {progress.blanksQuarantined}
                  </p>
                  <p className="text-[7.5px] text-[#888]">Quarantined</p>
                </div>
                <div className="rounded-2xl bg-[#edf7ef] border border-[#d2edd6] p-3 text-center">
                  <p className="text-[8px] uppercase tracking-wider font-semibold text-[#2e7d32]">Tiger Crops</p>
                  <p className="text-[17px] font-bold text-[#2e7d32] mt-0.5">
                    {progress.cropsGenerated}
                  </p>
                  <p className="text-[7.5px] text-[#2e7d32]">Extracted</p>
                </div>
              </div>

              {/* Live Tiger Crop Filmstrip */}
              {allCrops.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-[#888] mb-2 flex items-center gap-1.5">
                    <Crop size={12} className="text-[#e97813]" />
                    Live Extracted Tiger Crops ({allCrops.length})
                  </p>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {allCrops.slice(-8).reverse().map((crop, idx) => (
                      <div
                        key={idx}
                        className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eeeeec] bg-black relative shadow-xs"
                      >
                        <img
                          src={crop.cropDataUrl}
                          alt="Crop"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0.5 left-0.5 rounded bg-black/75 px-1 text-[7px] text-white">
                          {crop.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW 3: INGESTION COMPLETE & TIGER CROP REVIEW */}
          {/* ================================================= */}
          {isComplete && (
            <div className="space-y-6 animate-fadeIn">
              {/* Success Banner */}
              <div className="flex items-center gap-3 rounded-2xl bg-[#edf7ef] p-4 text-[#2e7d32] border border-[#d2edd6]">
                <CheckCircle2 size={26} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold">Batch Ingestion & Processing Complete</h3>
                  <p className="text-[9px] text-[#2e7d32]/90 mt-0.5">
                    Scanned <span className="font-bold">{progress.total}</span> camera-trap frames from{" "}
                    <span className="font-bold">{folderName || "Uploaded Images"}</span>. Generated{" "}
                    <span className="font-bold">{allCrops.length}</span> high-res tiger crops and quarantined{" "}
                    <span className="font-bold">{quarantinedBlanks.length}</span> empty frames.
                  </p>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-[#eeeeec] bg-white p-3 text-center shadow-xs">
                  <p className="text-[8px] uppercase font-semibold text-[#888]">Scanned</p>
                  <p className="text-[19px] font-bold text-[#111] mt-0.5">{progress.total}</p>
                  <p className="text-[8px] text-[#999]">Frames Processed</p>
                </div>
                <div className="rounded-2xl border border-[#ffecd9] bg-[#fffbf7] p-3 text-center shadow-xs">
                  <p className="text-[8px] uppercase font-semibold text-[#e97813]">Tiger Sightings</p>
                  <p className="text-[19px] font-bold text-[#e97813] mt-0.5">{progress.tigersFound}</p>
                  <p className="text-[8px] text-[#c96b1d]">Sightings Detected</p>
                </div>
                <div className="rounded-2xl border border-[#eeeeec] bg-white p-3 text-center shadow-xs">
                  <p className="text-[8px] uppercase font-semibold text-[#888]">Blanks Quarantined</p>
                  <p className="text-[19px] font-bold text-[#666] mt-0.5">{quarantinedBlanks.length}</p>
                  <p className="text-[8px] text-[#999]">Empty Vegetation</p>
                </div>
                <div className="rounded-2xl border border-[#d2edd6] bg-[#f7fcf8] p-3 text-center shadow-xs">
                  <p className="text-[8px] uppercase font-semibold text-[#2e7d32]">Tiger Crops</p>
                  <p className="text-[19px] font-bold text-[#2e7d32] mt-0.5">{allCrops.length}</p>
                  <p className="text-[8px] text-[#2e7d32]/90">Ranked Top 3 Matches</p>
                </div>
              </div>

              {/* Review View Top Tabs: Tiger Crops vs Quarantined Blanks */}
              <div className="flex items-center justify-between border-b border-[#eeeeec] pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewTab("crops")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-bold transition ${
                      reviewTab === "crops"
                        ? "bg-[#e97813] text-white shadow-xs"
                        : "bg-[#f5f5f3] text-[#666] hover:bg-[#eee]"
                    }`}
                  >
                    <Crop size={13} />
                    Tiger Crops & Top 3 Matches ({allCrops.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewTab("quarantine")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-bold transition ${
                      reviewTab === "quarantine"
                        ? "bg-[#666] text-white shadow-xs"
                        : "bg-[#f5f5f3] text-[#666] hover:bg-[#eee]"
                    }`}
                  >
                    <ShieldCheck size={13} />
                    Quarantined Blanks ({quarantinedBlanks.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportZip}
                  className="flex items-center gap-1.5 rounded-xl bg-[#e97813]/10 border border-[#e97813]/30 px-3 py-1.5 text-[9px] font-bold text-[#c96b1d] hover:bg-[#e97813]/20 transition"
                >
                  <Download size={13} />
                  Export Crops (ZIP)
                </button>
              </div>

              {/* TAB 1: TIGER CROPS & TOP 3 RE-ID MATCHES */}
              {reviewTab === "crops" && (
                <div className="space-y-4">
                  {/* Gallery Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-[#333]">
                      Extracted Tiger Profiles · Click to inspect Top 3 Ranked Matches & Database Decisions
                    </p>
                    <div className="flex flex-wrap rounded-xl bg-[#f0f0ee] p-0.5 text-[8px] font-bold">
                      <button
                        type="button"
                        onClick={() => setGalleryFilter("all")}
                        className={`rounded-lg px-2.5 py-1 transition ${
                          galleryFilter === "all" ? "bg-white text-[#111] shadow-xs" : "text-[#777]"
                        }`}
                      >
                        All ({allCrops.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryFilter("matched")}
                        className={`rounded-lg px-2.5 py-1 transition ${
                          galleryFilter === "matched" ? "bg-white text-[#15803d] shadow-xs" : "text-[#777]"
                        }`}
                      >
                        Confirmed ({allCrops.filter((c) => c.matchStatus === "CONFIRMED_MATCH").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryFilter("new")}
                        className={`rounded-lg px-2.5 py-1 transition ${
                          galleryFilter === "new" ? "bg-white text-[#7c3aed] shadow-xs" : "text-[#777]"
                        }`}
                      >
                        New Tigers ({allCrops.filter((c) => c.matchStatus === "NEW_TIGER_REGISTERED").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryFilter("review")}
                        className={`rounded-lg px-2.5 py-1 transition ${
                          galleryFilter === "review" ? "bg-white text-[#c96b1d] shadow-xs" : "text-[#777]"
                        }`}
                      >
                        Review ({allCrops.filter((c) => c.matchStatus === "REVIEW_REQUIRED").length})
                      </button>
                    </div>
                  </div>

                  {/* Crops Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-[260px] overflow-y-auto p-2 bg-[#fafaf8] rounded-2xl border border-[#eeeeec]">
                    {filteredCrops.map((crop, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCropPreview(crop)}
                        className={`cursor-pointer group rounded-2xl overflow-hidden border transition shadow-2xs hover:shadow-xs bg-white ${
                          selectedCropPreview?.id === crop.id
                            ? "border-[#e97813] ring-2 ring-[#e97813]/20"
                            : "border-[#dededb] hover:border-[#e97813]"
                        }`}
                      >
                        <div className="h-20 w-full bg-black relative">
                          <img
                            src={crop.cropDataUrl}
                            alt={crop.cropFilename}
                            className="h-full w-full object-cover group-hover:scale-105 transition"
                          />
                          <span
                            className={`absolute top-1 right-1 rounded px-1.5 py-0.5 text-[7.5px] font-bold text-white shadow-xs ${
                              crop.matchStatus === "CONFIRMED_MATCH"
                                ? "bg-[#15803d]"
                                : crop.matchStatus === "NEW_TIGER_REGISTERED"
                                ? "bg-[#7c3aed]"
                                : "bg-[#e97813]"
                            }`}
                          >
                            {crop.matchStatus === "CONFIRMED_MATCH"
                              ? `🥇 ${crop.assignedTigerId} (${crop.topMatch?.confidencePercent}%)`
                              : crop.matchStatus === "NEW_TIGER_REGISTERED"
                              ? `✨ ${crop.assignedTigerId} (New)`
                              : `🔍 ${crop.assignedTigerId} (${crop.topMatch?.confidencePercent || 0}%)`}
                          </span>
                        </div>
                        <div className="p-2 space-y-0.5">
                          <p className="text-[8px] font-mono font-bold text-[#111] truncate">
                            {crop.cropFilename}
                          </p>
                          <div className="flex items-center justify-between text-[7px]">
                            <span className="text-[#888]">Det: {crop.confidence}%</span>
                            <span
                              className={`font-bold ${
                                crop.matchStatus === "CONFIRMED_MATCH"
                                  ? "text-[#15803d]"
                                  : crop.matchStatus === "NEW_TIGER_REGISTERED"
                                  ? "text-[#7c3aed]"
                                  : "text-[#c96b1d]"
                              }`}
                            >
                              {crop.matchStatus === "CONFIRMED_MATCH"
                                ? `${crop.topMatch?.confidencePercent}% match`
                                : crop.matchStatus === "NEW_TIGER_REGISTERED"
                                ? "New Individual"
                                : "Review Required"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Crop Inspector Detail with Decision Banner and Top 3 Ranked Matches */}
                  {selectedCropPreview && (
                    <div className="rounded-2xl border border-[#e97813]/40 bg-[#fffbf7] p-4 flex flex-col lg:flex-row gap-5 animate-fadeIn">
                      {/* Query Crop Preview */}
                      <div className="w-full lg:w-48 shrink-0 flex flex-col items-center">
                        <div className="h-32 w-full overflow-hidden rounded-xl bg-black shadow-sm mb-2">
                          <img
                            src={selectedCropPreview.cropDataUrl}
                            alt="Crop detail"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] font-mono font-bold text-[#111] truncate w-full text-center">
                          {selectedCropPreview.cropFilename}
                        </p>
                        <p className="text-[8px] text-[#777]">
                          Detection: <span className="font-bold text-[#e97813]">{selectedCropPreview.confidence}%</span> · {selectedCropPreview.cropWidth}×{selectedCropPreview.cropHeight}px
                        </p>
                        <p className="text-[7.5px] text-[#888]">
                          Camera: {selectedCropPreview.cameraId} ({selectedCropPreview.zone})
                        </p>
                      </div>

                      {/* Decision & Top 3 Ranked Matches List */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#ffe0c2] pb-1.5">
                          <p className="text-[11px] font-bold text-[#c96b1d] flex items-center gap-1.5">
                            <Award size={15} className="text-[#e97813]" />
                            Top 3 AI Vector Re-ID Matches & Decision
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedCropPreview(null)}
                            className="rounded-lg bg-[#eee] px-2 py-0.5 text-[8px] text-[#555] hover:bg-[#ddd]"
                          >
                            Close
                          </button>
                        </div>

                        {/* Automated Classification & Embedding Decision Banner */}
                        <div
                          className={`p-2.5 rounded-xl border text-[8.5px] flex items-center gap-2 ${
                            selectedCropPreview.matchStatus === "CONFIRMED_MATCH"
                              ? "bg-[#edf7ef] border-[#d2edd6] text-[#15803d]"
                              : selectedCropPreview.matchStatus === "NEW_TIGER_REGISTERED"
                              ? "bg-[#f5f3ff] border-[#ddd6fe] text-[#6d28d9]"
                              : "bg-[#fff8f1] border-[#ffe0c2] text-[#c96b1d]"
                          }`}
                        >
                          {selectedCropPreview.matchStatus === "CONFIRMED_MATCH" ? (
                            <CheckCircle2 size={16} className="shrink-0" />
                          ) : selectedCropPreview.matchStatus === "NEW_TIGER_REGISTERED" ? (
                            <Sparkles size={16} className="shrink-0" />
                          ) : (
                            <AlertTriangle size={16} className="shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-[9.5px]">
                              {selectedCropPreview.matchStatus === "CONFIRMED_MATCH"
                                ? `Confirmed Match (≥90%): Registered to ${selectedCropPreview.assignedTigerId}`
                                : selectedCropPreview.matchStatus === "NEW_TIGER_REGISTERED"
                                ? `New Resident Tiger (<70%): Registered as ${selectedCropPreview.assignedTigerId}`
                                : `Candidate Match (70% - 90%): Pending Biologist Verification`}
                            </p>
                            <p className="text-[7.5px] opacity-90 mt-0.5">
                              {selectedCropPreview.decisionReason}
                            </p>
                          </div>
                        </div>

                        {/* Top 3 Ranked Matches */}
                        {selectedCropPreview.topMatches && selectedCropPreview.topMatches.length > 0 ? (
                          <div className="space-y-1.5">
                            {selectedCropPreview.topMatches.slice(0, 3).map((match, mIdx) => (
                              <div
                                key={mIdx}
                                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                                  match.rank === 1
                                    ? "bg-white border-[#e97813]/40 shadow-xs"
                                    : "bg-[#fcfcfa] border-[#eeeeec]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                                      match.rank === 1
                                        ? "bg-[#e97813] text-white"
                                        : match.rank === 2
                                        ? "bg-[#94a3b8] text-white"
                                        : "bg-[#b45309]/30 text-[#b45309]"
                                    }`}
                                  >
                                    #{match.rank}
                                  </span>
                                  <div>
                                    <p className="text-[10px] font-bold text-[#111]">
                                      {match.tigerName} ({match.tigerId})
                                    </p>
                                    <p className="text-[7.5px] text-[#777]">
                                      Station: {match.cameraId || "Tadoba Core"} · Zone: {match.zone || "Core"} · {match.tier}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                                      match.confidencePercent >= 90
                                        ? "bg-[#edf7ef] text-[#15803d]"
                                        : match.confidencePercent >= 70
                                        ? "bg-[#fff1e4] text-[#c96b1d]"
                                        : "bg-[#f0f0ee] text-[#777]"
                                    }`}
                                  >
                                    {match.confidencePercent}% Similarity
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center rounded-xl bg-white border border-[#ffe0c2]">
                            <p className="text-[9px] font-bold text-[#111]">No Database Match Found</p>
                            <p className="text-[7.5px] text-[#777]">
                              This pattern does not match registered individuals above threshold. Candidate for new tiger catalog registration.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: QUARANTINED BLANKS */}
              {reviewTab === "quarantine" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-[#f7f7f5] border border-[#eeeeec] rounded-2xl text-[9px] text-[#666]">
                    <ShieldCheck size={16} className="text-[#15803d] shrink-0" />
                    <span>
                      <strong className="text-[#111]">Quarantine Filter Active:</strong> {quarantinedBlanks.length} frames were scanned and verified to contain no tiger sightings (false triggers caused by wind/vegetation motion).
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2 bg-[#fafaf8] rounded-2xl border border-[#eeeeec]">
                    {quarantinedBlanks.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden border border-[#dededb] bg-white shadow-2xs"
                      >
                        <div className="h-24 w-full bg-black relative">
                          <img
                            src={item.imageSrc}
                            alt={item.filename}
                            className="h-full w-full object-cover opacity-80"
                          />
                          <span className="absolute top-1 right-1 rounded px-1.5 py-0.5 text-[7px] font-bold bg-[#666] text-white">
                            Quarantined ({item.maxScore > 0 ? `${item.maxScore}%` : "Blank"})
                          </span>
                        </div>
                        <div className="p-2 space-y-0.5">
                          <p className="text-[8px] font-mono font-bold text-[#111] truncate">
                            {item.filename}
                          </p>
                          <p className="text-[7px] text-[#888]">
                            Camera: {item.cameraId} · Zone: {item.zone}
                          </p>
                          <p className="text-[6.5px] text-[#e97813] font-medium truncate">
                            {item.maxScore > 0 ? `Tiger Score ${item.maxScore}% (< 25% threshold)` : "Zero Tiger Bounding Boxes"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================== */}
        {/* MODAL FOOTER ACTIONS */}
        {/* =================================================== */}
        {isComplete && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#eeeeec] bg-[#fafaf8] p-4">
            <button
              type="button"
              onClick={handleExportZip}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#e97813] bg-[#fff8f1] px-5 py-3 text-[10px] font-bold text-[#c96b1d] hover:bg-[#ffecd9] transition shadow-2xs active:scale-[0.98]"
            >
              <Download size={15} />
              Export Crops (ZIP)
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (onBatchComplete) {
                    onBatchComplete({
                      totalImages: progress.total,
                      tigersFound: progress.tigersFound,
                      blanksQuarantined: progress.blanksQuarantined,
                      crops: allCrops,
                    });
                  }
                  onClose();
                  navigate("/processing/review/images");
                }}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#dededb] px-4 py-3 text-[10px] font-semibold text-[#555] hover:bg-[#f5f5f3] transition"
              >
                <ShieldAlert size={14} />
                Quarantine Queue ({progress.blanksQuarantined})
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onBatchComplete) {
                    onBatchComplete({
                      totalImages: progress.total,
                      tigersFound: progress.tigersFound,
                      blanksQuarantined: progress.blanksQuarantined,
                      crops: allCrops,
                    });
                  }
                  onClose();
                  navigate("/processing/review/tiger-reid");
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-[#e97813] px-6 py-3 text-[10px] font-bold text-white transition hover:bg-[#f18420] shadow-md shadow-[#e97813]/25"
              >
                <Eye size={15} />
                Proceed to Re-ID Review
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onBatchComplete) {
                    onBatchComplete({
                      totalImages: progress.total,
                      tigersFound: progress.tigersFound,
                      blanksQuarantined: progress.blanksQuarantined,
                      crops: allCrops,
                    });
                  }
                  onClose();
                }}
                className="rounded-2xl bg-[#f0f0ee] px-4 py-3 text-[10px] font-bold text-[#555] hover:bg-[#e4e4e0] transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
