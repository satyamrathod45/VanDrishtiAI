/*
|--------------------------------------------------------------------------
| VanDrishti AI — Tiger Master Model
|--------------------------------------------------------------------------
| Represents individual resident tigers monitored within the reserve.
| Maintains demographic attributes, dominant territory, and sighting counters.
|--------------------------------------------------------------------------
*/

export class Tiger {
  /**
   * @param {Object} data
   * @param {string} data.tiger_id - Unique ID (e.g. "TGR-024")
   * @param {string} data.display_name - Readable name (e.g. "T-024 · Moharli Male")
   * @param {('Male'|'Female'|'Unknown')} [data.sex='Unknown'] - Biological sex
   * @param {('Cub'|'Sub-adult'|'Adult'|'Old')} [data.age_class='Adult'] - Age group
   * @param {('active'|'missing'|'deceased')} [data.status='active'] - Operational tracking status
   * @param {string} data.primary_zone - Dominant forest zone (e.g. "Moharli")
   * @param {string} [data.profile_image=''] - Avatar crop path
   * @param {string} [data.distinctive_marks=''] - Physical markings notes
   * @param {number} [data.total_sightings=0] - Sighting count
   * @param {string} [data.first_seen] - ISO datetime of earliest sighting
   * @param {string} [data.last_seen] - ISO datetime of most recent sighting
   */
  constructor(data) {
    if (!data.tiger_id) throw new Error("Tiger.tiger_id is required");
    if (!data.display_name) throw new Error("Tiger.display_name is required");

    this.tiger_id = String(data.tiger_id).trim();
    this.display_name = String(data.display_name).trim();
    this.sex = ["Male", "Female", "Unknown"].includes(data.sex) ? data.sex : "Unknown";
    this.age_class = ["Cub", "Sub-adult", "Adult", "Old"].includes(data.age_class) ? data.age_class : "Adult";
    this.status = ["active", "missing", "deceased"].includes(data.status) ? data.status : "active";
    this.primary_zone = data.primary_zone || "Core";
    this.profile_image = data.profile_image || "";
    this.distinctive_marks = data.distinctive_marks || "";
    this.total_sightings = Number(data.total_sightings) || 0;
    this.first_seen = data.first_seen || new Date().toISOString();
    this.last_seen = data.last_seen || this.first_seen;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  /**
   * Update counters when a new sighting is registered
   * @param {string} sightingTimestamp
   * @param {string} [zone]
   */
  recordSighting(sightingTimestamp, zone) {
    this.total_sightings += 1;
    this.updated_at = new Date().toISOString();

    const sightingDate = new Date(sightingTimestamp);
    if (!this.first_seen || sightingDate < new Date(this.first_seen)) {
      this.first_seen = sightingTimestamp;
    }
    if (!this.last_seen || sightingDate > new Date(this.last_seen)) {
      this.last_seen = sightingTimestamp;
    }
    if (zone && !this.primary_zone) {
      this.primary_zone = zone;
    }
  }

  /**
   * Serialize to plain JSON object
   */
  toJSON() {
    return {
      tiger_id: this.tiger_id,
      display_name: this.display_name,
      sex: this.sex,
      age_class: this.age_class,
      status: this.status,
      primary_zone: this.primary_zone,
      profile_image: this.profile_image,
      distinctive_marks: this.distinctive_marks,
      total_sightings: this.total_sightings,
      first_seen: this.first_seen,
      last_seen: this.last_seen,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  /**
   * Factory validator & creator
   */
  static fromJSON(json) {
    return new Tiger(json);
  }
}
