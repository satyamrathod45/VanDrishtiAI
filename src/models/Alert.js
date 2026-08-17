/*
|--------------------------------------------------------------------------
| VanDrishti AI — Spatial & Movement Alert Model
|--------------------------------------------------------------------------
| Represents automated behavioral and spatial alerts (territory deviations,
| buffer breaches, prolonged absence, uncatalogued tiger clusters).
|--------------------------------------------------------------------------
*/

export class Alert {
  /**
   * @param {Object} data
   * @param {string} data.alert_id - Unique Alert ID (e.g. "ALT-2026-084")
   * @param {string} data.tiger_id - Associated Tiger ID
   * @param {string} data.sighting_id - Triggering Sighting ID
   * @param {('territory_shift'|'corridor_crossing'|'long_absence'|'unknown_cluster')} data.alert_type
   * @param {('critical'|'high'|'medium'|'info')} [data.severity='medium']
   * @param {string} data.title - Headline
   * @param {string} data.description - Explanatory narrative
   * @param {string} [data.evidence_crop_path=''] - Evidence crop image path
   * @param {string} [data.timestamp] - Event occurrence timestamp
   * @param {boolean} [data.is_resolved=false] - Acknowledged/resolved flag
   */
  constructor(data) {
    if (!data.alert_id) throw new Error("Alert.alert_id is required");
    if (!data.tiger_id) throw new Error("Alert.tiger_id is required");
    if (!data.title) throw new Error("Alert.title is required");

    this.alert_id = String(data.alert_id).trim();
    this.tiger_id = String(data.tiger_id).trim();
    this.sighting_id = data.sighting_id || "";
    this.alert_type = [
      "territory_shift",
      "corridor_crossing",
      "long_absence",
      "unknown_cluster",
    ].includes(data.alert_type)
      ? data.alert_type
      : "territory_shift";
    this.severity = ["critical", "high", "medium", "info"].includes(data.severity)
      ? data.severity
      : "medium";
    this.title = String(data.title).trim();
    this.description = data.description || "";
    this.evidence_crop_path = data.evidence_crop_path || "";
    this.timestamp = data.timestamp || new Date().toISOString();
    this.is_resolved = Boolean(data.is_resolved);
    this.created_at = data.created_at || new Date().toISOString();
  }

  /**
   * Mark alert as resolved by forest staff
   */
  resolve() {
    this.is_resolved = true;
  }

  /**
   * Serialize to plain JSON object
   */
  toJSON() {
    return {
      alert_id: this.alert_id,
      tiger_id: this.tiger_id,
      sighting_id: this.sighting_id,
      alert_type: this.alert_type,
      severity: this.severity,
      title: this.title,
      description: this.description,
      evidence_crop_path: this.evidence_crop_path,
      timestamp: this.timestamp,
      is_resolved: this.is_resolved,
      created_at: this.created_at,
    };
  }

  /**
   * Factory validator & creator
   */
  static fromJSON(json) {
    return new Alert(json);
  }
}
