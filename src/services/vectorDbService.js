/*
|--------------------------------------------------------------------------
| VanDrishti AI — In-Memory & Persisted Vector Database Engine
|--------------------------------------------------------------------------
|
| Responsibilities:
| 1. Store, index, and query 2048-dimensional tiger stripe embeddings
| 2. Perform fast Top-K Cosine Similarity nearest neighbor search
| 3. Support multi-criteria metadata filtering (tiger_id, camera, zone, dates, status)
| 4. Seamlessly integrate with tigerReid for end-to-end image searches
| 5. Multi-tier persistence: Seed data fallback + Browser LocalStorage / IndexedDB
|--------------------------------------------------------------------------
*/

import { TigerEmbedding } from "../models/TigerEmbedding.js";
import { tigerReid } from "./tigerReid.js";

const STORAGE_KEY = "vandrishti_vector_store_v1";
const IDB_NAME = "VanDrishti_VectorDB";
const IDB_STORE = "user_sightings";

function openIDB() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) return resolve(null);
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

class VectorDbService {
  constructor() {
    /** @type {Map<string, TigerEmbedding>} Map of Sighting ID -> TigerEmbedding */
    this.store = new Map();
    this.isInitialized = false;
    this.isInitializing = false;
  }

  /**
   * 1. Initialize the Vector Store (loads ground truth seed data + merged local modifications)
   * @param {Object} [options]
   * @param {string} [options.seedUrl="/data/tiger_embeddings_data.json"]
   * @param {Array<Object>} [options.seedData]
   * @param {boolean} [options.persistLocally=true]
   * @param {boolean} [options.forceReload=false]
   * @returns {Promise<{ success: boolean, count: number }>}
   */
  async init(options = {}) {
    if (this.isInitialized && !options.forceReload && this.store.size > 0) {
      return { success: true, count: this.store.size };
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return { success: true, count: this.store.size };
    }

    this.isInitializing = true;

    try {
      this.store.clear();

      // 1. ALWAYS load baseline master catalog embeddings from /data/tiger_embeddings_data.json
      let seedRecords = [];
      if (options.seedData && Array.isArray(options.seedData)) {
        seedRecords = options.seedData;
      } else if (typeof window !== "undefined" && window.fetch) {
        const seedUrl = options.seedUrl || "/data/tiger_embeddings_data.json";
        try {
          const res = await fetch(seedUrl);
          if (res.ok) {
            seedRecords = await res.json();
            console.log(`[VectorDB] Loaded ${seedRecords.length} baseline embeddings from ${seedUrl}.`);
          }
        } catch (e) {
          console.warn(`[VectorDB] Notice on fetching ${seedUrl}:`, e.message);
        }

        // Fallback to master db if needed
        if (seedRecords.length === 0) {
          try {
            const masterRes = await fetch("/data/vandrishti_master_db.json");
            if (masterRes.ok) {
              const masterData = await masterRes.json();
              if (masterData && masterData.tigers) {
                for (const t of masterData.tigers) {
                  for (const s of (t.sightings || [])) {
                    if (s.vector) {
                      seedRecords.push({
                        id: s.id,
                        tiger_id: t.tiger_id,
                        crop_path: s.crop_path,
                        source_image: s.source_image || `${s.id}.jpg`,
                        camera_id: s.camera_id,
                        station_name: s.station_name,
                        zone: s.zone,
                        gps: s.gps,
                        timestamp: s.timestamp,
                        review_status: "verified",
                        vector: s.vector,
                      });
                    }
                  }
                }
              }
            }
          } catch (mErr) {
            console.warn("[VectorDB] Master DB fallback:", mErr.message);
          }
        }
      }

      for (const item of seedRecords) {
        try {
          const embedding = item instanceof TigerEmbedding ? item : new TigerEmbedding(item);
          this.store.set(embedding.id, embedding);
        } catch (err) {
          console.warn("[VectorDB] Skipping invalid embedding record:", err.message);
        }
      }

      // 2. Load and merge user sightings from IndexedDB (limitless storage)
      try {
        const db = await openIDB();
        if (db) {
          await new Promise((resolve) => {
            const tx = db.transaction(IDB_STORE, "readonly");
            const req = tx.objectStore(IDB_STORE).getAll();
            req.onsuccess = () => {
              if (Array.isArray(req.result)) {
                for (const uItem of req.result) {
                  try {
                    const emb = uItem instanceof TigerEmbedding ? uItem : new TigerEmbedding(uItem);
                    this.store.set(emb.id, emb);
                  } catch (uErr) {}
                }
              }
              resolve();
            };
            req.onerror = () => resolve();
          });
        }
      } catch (e) {
        // IDB fallback
      }

      this.isInitialized = true;
      console.log(`[VectorDB] Vector Database initialized with ${this.store.size} vector embeddings across all resident tigers.`);
      return { success: true, count: this.store.size };
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * 2. Insert a single TigerEmbedding
   * @param {Object|TigerEmbedding} data
   * @returns {TigerEmbedding}
   */
  insert(data) {
    const embedding = data instanceof TigerEmbedding ? data : new TigerEmbedding(data);
    embedding.isUserGenerated = true;
    this.store.set(embedding.id, embedding);
    this.persist(embedding);
    return embedding;
  }

  /**
   * Register a newly detected/confirmed tiger sighting and vector embedding into the database.
   * Automatically normalizes metadata, updates the in-memory map,
   * and persists to IndexedDB storage so all future searches recognize this tiger.
   * @param {Object} sightingData
   * @returns {TigerEmbedding}
   */
  registerTigerSighting(sightingData) {
    const id = sightingData.id || `USER_SIGHTING_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tigerId = sightingData.tiger_id || sightingData.assignedTigerId || sightingData.tigerId || "UNASSIGNED";
    
    const embedding = new TigerEmbedding({
      id,
      tiger_id: tigerId,
      vector: sightingData.vector || sightingData.embedding,
      crop_path: sightingData.crop_path || sightingData.cropDataUrl || sightingData.cropFilename || "",
      source_image: sightingData.source_image || sightingData.sourceFilename || sightingData.filename || "",
      camera_id: sightingData.camera_id || sightingData.cameraId || "CAM-TAD-01",
      station_name: sightingData.station_name || sightingData.zone || "Field Station",
      zone: sightingData.zone || "Core",
      gps: sightingData.gps || { lat: 20.25, lng: 79.35 },
      timestamp: sightingData.timestamp || sightingData.collectionDate || new Date().toISOString(),
      reid_confidence: Number(sightingData.reid_confidence || sightingData.confidence || 0),
      review_status: sightingData.review_status || (sightingData.isNewTiger ? "verified" : "pending_review"),
      verified_by: sightingData.verified_by || "VanDrishti AI Pipeline",
    });

    embedding.isUserGenerated = true;
    this.store.set(embedding.id, embedding);
    this.persist(embedding);
    console.log(`[VectorDB] 🐅 Registered Tiger Sighting: ${embedding.id} | Tiger ID: ${embedding.tiger_id} | Total in DB: ${this.store.size}`);
    return embedding;
  }

  /**
   * 3. Bulk Insert multiple embeddings
   * @param {Array<Object|TigerEmbedding>} items
   * @returns {number} Inserted count
   */
  bulkInsert(items = []) {
    let count = 0;
    for (const item of items) {
      try {
        const embedding = item instanceof TigerEmbedding ? item : new TigerEmbedding(item);
        this.store.set(embedding.id, embedding);
        count++;
      } catch (e) {
        console.warn("[VectorDB] Bulk insert error on item:", e.message);
      }
    }
    this.persist();
    return count;
  }

  /**
   * 4. Search Vector Database by 2048-dim Query Vector with Metadata Filtering
   * @param {Float32Array|number[]} queryVector - 2048-dim feature embedding
   * @param {Object} [options]
   * @param {number} [options.topK=5] - Number of top nearest matches to return
   * @param {number} [options.minSimilarity=0.0] - Minimum cosine similarity threshold (-1.0 to 1.0)
   * @param {Object} [options.filter={}] - Metadata filters
   * @param {string} [options.filter.tiger_id] - Filter by specific Tiger ID
   * @param {string} [options.filter.camera_id] - Filter by Camera Station ID
   * @param {string} [options.filter.zone] - Filter by Zone ('Core'|'Buffer'|'Corridor')
   * @param {string} [options.filter.review_status] - Filter by Status ('verified'|'pending_review')
   * @param {string} [options.filter.startDate] - ISO Date string for range start
   * @param {string} [options.filter.endDate] - ISO Date string for range end
   * @param {string} [options.filter.excludeId] - ID to exclude (e.g. self)
   * @returns {Array<{ sighting: TigerEmbedding, similarity: number, confidence: number, tier: string, label: string, isMatch: boolean }>}
   */
  searchByVector(queryVector, options = {}) {
    const topK = options.topK || 5;
    const minSimilarity = typeof options.minSimilarity === "number" ? options.minSimilarity : 0.0;
    const filter = options.filter || {};

    const normalizedQuery = TigerEmbedding.toNormalizedFloat32(queryVector);
    const results = [];

    for (const [id, sighting] of this.store.entries()) {
      // Exclude specific ID if requested (e.g. self-matching)
      if (filter.excludeId && id === filter.excludeId) continue;

      // Metadata Filters
      if (filter.tiger_id && sighting.tiger_id !== filter.tiger_id) continue;
      if (filter.camera_id && sighting.camera_id !== filter.camera_id) continue;
      if (filter.zone && sighting.zone !== filter.zone) continue;
      if (filter.review_status && sighting.review_status !== filter.review_status) continue;

      if (filter.startDate) {
        if (new Date(sighting.timestamp) < new Date(filter.startDate)) continue;
      }
      if (filter.endDate) {
        if (new Date(sighting.timestamp) > new Date(filter.endDate)) continue;
      }

      // Fast Cosine Dot-Product Similarity
      const similarity = sighting.cosineSimilarity(normalizedQuery);

      if (similarity >= minSimilarity) {
        const conf = tigerReid.similarityToConfidence(similarity);
        results.push({
          sighting: sighting.toJSON(),
          id: sighting.id,
          tiger_id: sighting.tiger_id,
          crop_path: sighting.crop_path,
          source_image: sighting.source_image,
          camera_id: sighting.camera_id,
          station_name: sighting.station_name,
          zone: sighting.zone,
          gps: sighting.gps,
          timestamp: sighting.timestamp,
          review_status: sighting.review_status,
          similarity: Math.round(similarity * 10000) / 10000,
          confidence: conf.confidencePercent,
          tier: conf.tier,
          label: conf.label,
          isMatch: conf.isMatch,
        });
      }
    }

    // Rank by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK);
  }

  /**
   * 5. End-to-End Search by Crop Image (Extracts embedding using tigerReid, then searches DB)
   * @param {string|HTMLImageElement|Blob} imageSource
   * @param {Object} [options]
   * @returns {Promise<{ queryEmbedding: Float32Array, matches: Array, inferenceTimeMs: number }>}
   */
  async searchByCrop(imageSource, options = {}) {
    await this.init();
    const extractRes = await tigerReid.extractEmbedding(imageSource);
    const matches = this.searchByVector(extractRes.vector, options);

    return {
      queryEmbedding: extractRes.vector,
      matches,
      inferenceTimeMs: extractRes.inferenceTimeMs,
    };
  }

  /**
   * 6. Query Sightings by Tiger ID
   * @param {string} tigerId
   * @returns {TigerEmbedding[]}
   */
  getByTigerId(tigerId) {
    const list = [];
    for (const sighting of this.store.values()) {
      if (sighting.tiger_id === tigerId) {
        list.push(sighting);
      }
    }
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 7. Query Sightings by Camera Station ID
   * @param {string} cameraId
   * @returns {TigerEmbedding[]}
   */
  getByCamera(cameraId) {
    const list = [];
    for (const sighting of this.store.values()) {
      if (sighting.camera_id === cameraId) {
        list.push(sighting);
      }
    }
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 8. Query Sightings by Zone
   * @param {('Core'|'Buffer'|'Corridor')} zone
   * @returns {TigerEmbedding[]}
   */
  getByZone(zone) {
    const list = [];
    for (const sighting of this.store.values()) {
      if (sighting.zone === zone) {
        list.push(sighting);
      }
    }
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 9. Get Single Sighting by ID
   * @param {string} id
   * @returns {TigerEmbedding|null}
   */
  getById(id) {
    return this.store.get(id) || null;
  }

  /**
   * 10. Get All Stored Embeddings
   * @returns {TigerEmbedding[]}
   */
  getAll() {
    return Array.from(this.store.values());
  }

  /**
   * 11. Update an Existing Sighting Record (e.g. verified identity or status)
   * @param {string} id
   * @param {Partial<TigerEmbedding>} updates
   * @returns {TigerEmbedding|null}
   */
  update(id, updates = {}) {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updatedData = {
      ...existing.toJSON(),
      ...updates,
      id: existing.id, // Preserve immutable ID
      vector: updates.vector || existing.vector,
    };

    const updatedEmbedding = new TigerEmbedding(updatedData);
    this.store.set(id, updatedEmbedding);
    this.persist();
    return updatedEmbedding;
  }

  /**
   * 12. Delete Sighting Record by ID
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const existed = this.store.delete(id);
    if (existed) this.persist();
    return existed;
  }

  /**
   * 13. Get Database Statistics
   * @returns {{ totalSightings: number, uniqueTigers: number, zoneCounts: Record<string, number>, statusCounts: Record<string, number>, cameraCounts: Record<string, number> }}
   */
  getStats() {
    const uniqueTigers = new Set();
    const zoneCounts = { Core: 0, Buffer: 0, Corridor: 0 };
    const statusCounts = { verified: 0, pending_review: 0, rejected: 0 };
    const cameraCounts = {};

    for (const sighting of this.store.values()) {
      uniqueTigers.add(sighting.tiger_id);
      if (zoneCounts[sighting.zone] !== undefined) {
        zoneCounts[sighting.zone]++;
      }
      if (statusCounts[sighting.review_status] !== undefined) {
        statusCounts[sighting.review_status]++;
      }
      cameraCounts[sighting.camera_id] = (cameraCounts[sighting.camera_id] || 0) + 1;
    }

    return {
      totalSightings: this.store.size,
      uniqueTigers: uniqueTigers.size,
      zoneCounts,
      statusCounts,
      cameraCounts,
    };
  }

  /**
   * 14. Persist In-Memory Index to IndexedDB Storage (Limitless storage)
   * @param {TigerEmbedding|Object} [customSighting=null]
   */
  async persist(customSighting = null) {
    try {
      const db = await openIDB();
      if (db) {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        if (customSighting) {
          const itemToSave = customSighting instanceof TigerEmbedding ? customSighting.toJSON() : customSighting;
          store.put(itemToSave);
        } else {
          for (const s of this.store.values()) {
            if (s.isUserGenerated || s.id.startsWith("SIGHTING") || s.id.startsWith("USER") || s.id.startsWith("CROP") || s.id.startsWith("REVIEW") || s.id.startsWith("NEW")) {
              store.put(s.toJSON());
            }
          }
        }
      }
    } catch (e) {
      console.warn("[VectorDB] Persistence notice:", e.message);
    }
  }

  /**
   * 15. Export Database as Plain JSON Array
   * @returns {string}
   */
  exportJSON() {
    const records = Array.from(this.store.values()).map((s) => s.toJSON());
    return JSON.stringify(records, null, 2);
  }

  /**
   * 16. Import JSON Array into Vector Database
   * @param {string|Array<Object>} jsonData
   * @param {boolean} [overwrite=false]
   * @returns {number}
   */
  importJSON(jsonData, overwrite = false) {
    const records = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    if (!Array.isArray(records)) {
      throw new Error("Invalid import data. Expected an array of embedding objects.");
    }

    if (overwrite) {
      this.store.clear();
    }

    const inserted = this.bulkInsert(records);
    return inserted;
  }

  /**
   * 17. Generate a unique new Tiger ID for newly detected individuals
   * @returns {string}
   */
  generateNewTigerId() {
    const existingIds = new Set();
    for (const sighting of this.store.values()) {
      if (sighting.tiger_id) existingIds.add(sighting.tiger_id);
    }

    let maxNum = 100;
    for (const id of existingIds) {
      const match = String(id).match(/T-(\d+)/i) || String(id).match(/TGR-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `T-${maxNum + 1}`;
  }

  /**
   * 18. Reset store to initial state
   */
  async clear() {
    this.store.clear();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem("vandrishti_user_sightings_v1");
    }
    try {
      const db = await openIDB();
      if (db) {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).clear();
      }
    } catch (e) {}
    this.isInitialized = false;
  }
}

export const vectorDbService = new VectorDbService();
