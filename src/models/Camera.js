/*
|--------------------------------------------------------------------------
| VanDrishti AI — Camera Trap Station Model
|--------------------------------------------------------------------------
| Represents physical camera trap deployments across forest compartments.
|--------------------------------------------------------------------------
*/

export class Camera {
  /**
   * @param {Object} data
   * @param {string} data.camera_id - Unique hardware ID (e.g. "PTR_BUFF_ST06")
   * @param {string} data.name - Station landmark name (e.g. "Teliya Buffer Lake")
   * @param {('Core'|'Buffer'|'Corridor')} [data.zone='Core'] - Forest zonation
   * @param {string} data.range - Administrative forest range (e.g. "Turia")
   * @param {{ lat: number, lng: number }} data.gps - GPS coordinates
   * @param {('active'|'maintenance'|'inactive')} [data.status='active']
   * @param {string} [data.last_active] - ISO datetime of last retrieval
   * @param {number} [data.total_photos=0] - Total images processed
   */
  constructor(data) {
    if (!data.camera_id) throw new Error("Camera.camera_id is required");
    if (!data.name) throw new Error("Camera.name is required");

    this.camera_id = String(data.camera_id).trim();
    this.name = String(data.name).trim();
    this.zone = ["Core", "Buffer", "Corridor"].includes(data.zone) ? data.zone : "Core";
    this.range = data.range || "General";
    this.gps = {
      lat: Number(data.gps?.lat ?? 0),
      lng: Number(data.gps?.lng ?? 0),
    };
    this.status = ["active", "maintenance", "inactive"].includes(data.status) ? data.status : "active";
    this.last_active = data.last_active || new Date().toISOString();
    this.total_photos = Number(data.total_photos) || 0;
  }

  /**
   * Record a new capture from this camera
   * @param {string} timestamp
   */
  recordCapture(timestamp) {
    this.total_photos += 1;
    if (timestamp && new Date(timestamp) > new Date(this.last_active)) {
      this.last_active = timestamp;
    }
  }

  /**
   * Serialize to plain JSON object
   */
  toJSON() {
    return {
      camera_id: this.camera_id,
      name: this.name,
      zone: this.zone,
      range: this.range,
      gps: { ...this.gps },
      status: this.status,
      last_active: this.last_active,
      total_photos: this.total_photos,
    };
  }

  /**
   * Factory validator & creator
   */
  static fromJSON(json) {
    return new Camera(json);
  }
}
