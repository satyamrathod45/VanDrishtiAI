/*
|--------------------------------------------------------------------------
| VanDrishti AI — Tiger Embedding & Sighting Model
|--------------------------------------------------------------------------
| Represents a single camera trap detection crop with its 2048-dim Re-ID
| vector embedding, physical station origin, and GPS coordinates.
|--------------------------------------------------------------------------
*/

export class TigerEmbedding {
  /**
   * @param {Object} data
   * @param {string} data.id - Unique Sighting ID (e.g. "OBS_IMG001_CROP1")
   * @param {string} data.tiger_id - Associated Tiger ID (e.g. "TGR-024" or "UNASSIGNED")
   * @param {string} data.crop_path - Relative disk path to cropped image
   * @param {string} data.source_image - Original SD card image filename
   * @param {string} data.camera_id - Physical camera ID
   * @param {string} data.station_name - Landmark location name
   * @param {('Core'|'Buffer'|'Corridor')} [data.zone='Core'] - Forest zonation
   * @param {{ lat: number, lng: number }} data.gps - Geographical coordinates
   * @param {string} data.timestamp - Capture ISO datetime string
   * @param {number} [data.reid_confidence=0.0] - Match score (0 to 100)
   * @param {('verified'|'pending_review'|'rejected')} [data.review_status='pending_review']
   * @param {string|null} [data.verified_by=null]
   * @param {Float32Array|number[]} data.vector - 2048-dimensional feature embedding
   */
  constructor(data) {
    if (!data.id) throw new Error("TigerEmbedding.id is required");
    if (!data.tiger_id) throw new Error("TigerEmbedding.tiger_id is required");
    if (!data.vector) throw new Error("TigerEmbedding.vector is required");

    this.id = String(data.id).trim();
    this.tiger_id = String(data.tiger_id).trim();
    this.crop_path = data.crop_path || "";
    this.source_image = data.source_image || "";
    this.camera_id = data.camera_id || "UNKNOWN_CAM";
    this.station_name = data.station_name || "Unknown Station";
    this.zone = ["Core", "Buffer", "Corridor"].includes(data.zone) ? data.zone : "Core";
    this.gps = {
      lat: Number(data.gps?.lat ?? 0),
      lng: Number(data.gps?.lng ?? 0),
    };
    this.timestamp = data.timestamp || new Date().toISOString();
    this.reid_confidence = Number(data.reid_confidence) || 0.0;
    this.review_status = ["verified", "pending_review", "rejected"].includes(data.review_status)
      ? data.review_status
      : "pending_review";
    this.verified_by = data.verified_by || null;
    this.created_at = data.created_at || new Date().toISOString();

    // Convert vector to Float32Array and L2 normalize
    this.vector = TigerEmbedding.toNormalizedFloat32(data.vector);
  }

  /**
   * Helper to ensure vector is Float32Array with unit norm
   * @param {Float32Array|number[]|Buffer} rawVector
   * @returns {Float32Array}
   */
  static toNormalizedFloat32(rawVector) {
    let arr;
    if (rawVector instanceof Float32Array) {
      arr = new Float32Array(rawVector);
    } else if (Array.isArray(rawVector)) {
      arr = new Float32Array(rawVector);
    } else if (rawVector?.buffer) {
      arr = new Float32Array(rawVector.buffer, rawVector.byteOffset, rawVector.byteLength / 4);
    } else {
      throw new Error("Invalid vector data type. Expected Float32Array or Array<number>");
    }

    // Compute L2 norm
    let sumSq = 0;
    for (let i = 0; i < arr.length; i++) {
      sumSq += arr[i] * arr[i];
    }
    const norm = Math.sqrt(sumSq);

    if (norm > 1e-12) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] /= norm;
      }
    }
    return arr;
  }

  /**
   * Fast Dot-Product Cosine Similarity against another vector
   * @param {Float32Array|number[]} otherVector
   * @returns {number} Cosine similarity score between -1.0 and 1.0
   */
  cosineSimilarity(otherVector) {
    const v2 = TigerEmbedding.toNormalizedFloat32(otherVector);
    const len = Math.min(this.vector.length, v2.length);
    let dot = 0.0;
    for (let i = 0; i < len; i++) {
      dot += this.vector[i] * v2[i];
    }
    // Clamp to valid cosine similarity range [-1.0, 1.0] to prevent floating point inaccuracies
    return Math.max(-1.0, Math.min(1.0, dot));
  }

  /**
   * Serialize to plain JSON object
   */
  toJSON() {
    return {
      id: this.id,
      tiger_id: this.tiger_id,
      crop_path: this.crop_path,
      source_image: this.source_image,
      camera_id: this.camera_id,
      station_name: this.station_name,
      zone: this.zone,
      gps: { ...this.gps },
      timestamp: this.timestamp,
      reid_confidence: this.reid_confidence,
      review_status: this.review_status,
      verified_by: this.verified_by,
      vector: Array.from(this.vector),
      created_at: this.created_at,
    };
  }

  /**
   * Factory validator & creator
   */
  static fromJSON(json) {
    return new TigerEmbedding(json);
  }
}
