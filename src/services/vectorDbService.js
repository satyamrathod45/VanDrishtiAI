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

class VectorDbService {
  constructor() {
    /** @type {Map<string, TigerEmbedding>} Map of Sighting ID -> TigerEmbedding */
    this.store = new Map();
    this.isInitialized = false;
    this.isInitializing = false;
  }

  /**
   * 1. Initialize the Vector Store (loads seed data + merged local modifications)
   * @param {Object} [options]
   * @param {string} [options.seedUrl="/data/tiger_embeddings_data.json"]
   * @param {Array<Object>} [options.seedData]
   * @param {boolean} [options.persistLocally=true]
   * @returns {Promise<{ success: boolean, count: number }>}
   */
  async init(options = {}) {
    if (this.isInitialized) {
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
      let loadedRecords = [];

      // A. Try loading persisted modifications from LocalStorage first (browser environment)
      if (typeof window !== "undefined" && window.localStorage && options.persistLocally !== false) {
        try {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedRecords = parsed;
              console.log(`[VectorDB] Loaded ${loadedRecords.length} records from localStorage cache.`);
            }
          }
        } catch (e) {
          console.warn("[VectorDB] Failed to read from localStorage:", e.message);
        }
      }

      // B. If no local cache, load from provided seedData or seedUrl
      if (loadedRecords.length === 0) {
        if (options.seedData && Array.isArray(options.seedData)) {
          loadedRecords = options.seedData;
        } else if (typeof window !== "undefined" && window.fetch) {
          const seedUrl = options.seedUrl || "/data/tiger_embeddings_data.json";
          try {
            const res = await fetch(seedUrl);
            if (res.ok) {
              loadedRecords = await res.json();
              console.log(`[VectorDB] Loaded ${loadedRecords.length} seed embeddings from ${seedUrl}.`);
            }
          } catch (e) {
            console.warn(`[VectorDB] Notice on fetching ${seedUrl}:`, e.message);
          }
        }
      }

      // Populate in-memory map
      this.store.clear();
      for (const item of loadedRecords) {
        try {
          const embedding = item instanceof TigerEmbedding ? item : new TigerEmbedding(item);
          this.store.set(embedding.id, embedding);
        } catch (err) {
          console.warn("[VectorDB] Skipping invalid embedding record:", err.message);
        }
      }

      this.isInitialized = true;
      console.log(`[VectorDB] Initialized with ${this.store.size} vector embeddings.`);
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
    this.store.set(embedding.id, embedding);
    this.persist();
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
   * 14. Persist In-Memory Index to Browser Storage
   */
  persist() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const records = Array.from(this.store.values()).map((s) => s.toJSON());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (e) {
        console.warn("[VectorDB] Persistence error:", e.message);
      }
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
   * 17. Reset store to initial state
   */
  clear() {
    this.store.clear();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    this.isInitialized = false;
  }
}

export const vectorDbService = new VectorDbService();
