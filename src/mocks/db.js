/*
|--------------------------------------------------------------------------
| VanDrishti Mock Database
|--------------------------------------------------------------------------
|
| PURPOSE:
| This file represents the temporary data layer used while the real
| backend and ML pipeline are being developed.
|
| IMPORTANT FOR BACKEND DEVELOPERS:
| --------------------------------
| This is NOT the final database schema.
|
| It exists so the frontend can be developed independently from the
| backend and machine-learning pipeline.
|
| When the backend is ready, these collections should be replaced by
| real API responses.
|
|--------------------------------------------------------------------------
*/

export const mockDB = {
  /*
  |--------------------------------------------------------------------------
  | FOREST OFFICERS
  |--------------------------------------------------------------------------
  |
  | Used by:
  | POST /api/auth/login
  |
  */

  forestOfficers: [
    {
      id: "FO-1024",
      password: "forest123",

      name: "Arjun Sharma",
      designation: "Forest Officer",

      division: "Tadoba-Andhari",
      range: "Moharli",

      active: true,
    },

    {
      id: "FO-2048",
      password: "vandrishti123",

      name: "Priya Mehta",
      designation: "Forest Officer",

      division: "Pench",
      range: "Turia",

      active: true,
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | TIGERS
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | A tiger is one of the CORE entities of VanDrishti.
  |
  | Tiger ID should remain stable even when the system receives new
  | images/sightings for that tiger.
  |
  | Example:
  |
  | T-024
  |   ├── sightings
  |   ├── images
  |   ├── Re-ID matches
  |   └── movement history
  |
  */

  tigers: [
    {
      id: "TGR-024",

      displayId: "T-024",

      name: "T-024",

      sex: "Male",

      ageClass: "Adult",

      status: "identified",

      /*
       * Current geographic/forest zone.
       */
      currentZone: "Moharli",

      currentLocation:
        "Zone A · Moharli",

      /*
       * Re-identification confidence.
       *
       * This value should eventually come from the ML/Re-ID pipeline.
       */
      reidConfidence: 97.2,

      totalSightings: 42,

      firstSeen:
        "2026-01-12T08:42:00Z",

      lastSeen:
        "2026-08-15T18:42:00Z",

      lastCameraId: "CAM-018",

      /*
       * Main/reference image.
       *
       * Replace this with the real object-storage/CDN URL later.
       */
      profileImage:
        "/mock/tigers/tiger-024.jpg",

      description:
        "Adult male tiger frequently observed in the Moharli zone.",

      /*
       * Useful for displaying the identity quality.
       */
      identificationStatus: "confirmed",
    },


    {
      id: "TGR-011",

      displayId: "T-011",

      name: "T-011",

      sex: "Female",

      ageClass: "Adult",

      status: "identified",

      currentZone: "Navegaon",

      currentLocation:
        "Zone B · Navegaon",

      reidConfidence: 94.1,

      totalSightings: 31,

      firstSeen:
        "2026-02-04T10:22:00Z",

      lastSeen:
        "2026-08-15T17:56:00Z",

      lastCameraId: "CAM-042",

      profileImage:
        "/mock/tigers/tiger-011.jpg",

      description:
        "Adult female monitored across the Navegaon corridor.",

      identificationStatus: "confirmed",
    },


    {
      id: "TGR-037",

      displayId: "T-037",

      name: "T-037",

      sex: "Male",

      ageClass: "Adult",

      status: "identified",

      currentZone: "Tadoba",

      currentLocation:
        "Zone C · Tadoba",

      reidConfidence: 89.4,

      totalSightings: 18,

      firstSeen:
        "2026-04-18T07:15:00Z",

      lastSeen:
        "2026-08-15T17:21:00Z",

      lastCameraId: "CAM-031",

      profileImage:
        "/mock/tigers/tiger-037.jpg",

      description:
        "Adult male with recurring sightings around Tadoba.",

      identificationStatus: "confirmed",
    },


    {
      id: "TGR-006",

      displayId: "T-006",

      name: "T-006",

      sex: "Female",

      ageClass: "Sub-adult",

      status: "identified",

      currentZone: "Moharli",

      currentLocation:
        "Zone A · Moharli",

      reidConfidence: 96.3,

      totalSightings: 27,

      firstSeen:
        "2026-03-22T14:12:00Z",

      lastSeen:
        "2026-08-15T16:48:00Z",

      lastCameraId: "CAM-011",

      profileImage:
        "/mock/tigers/tiger-006.jpg",

      description:
        "Sub-adult female frequently detected near Moharli.",

      identificationStatus: "confirmed",
    },


    {
      id: "TGR-018",

      displayId: "T-018",

      name: "T-018",

      sex: "Male",

      ageClass: "Sub-adult",

      status: "identified",

      currentZone: "Pangdi",

      currentLocation:
        "Zone D · Pangdi",

      reidConfidence: 91.8,

      totalSightings: 16,

      firstSeen:
        "2026-05-11T09:31:00Z",

      lastSeen:
        "2026-08-14T19:22:00Z",

      lastCameraId: "CAM-057",

      profileImage:
        "/mock/tigers/tiger-018.jpg",

      description:
        "Sub-adult male detected along the Pangdi corridor.",

      identificationStatus: "confirmed",
    },


    {
      id: "TGR-029",

      displayId: "T-029",

      name: "T-029",

      sex: "Female",

      ageClass: "Adult",

      status: "identified",

      currentZone: "Navegaon",

      currentLocation:
        "Zone B · Navegaon",

      reidConfidence: 95.7,

      totalSightings: 36,

      firstSeen:
        "2026-01-29T12:18:00Z",

      lastSeen:
        "2026-08-14T16:42:00Z",

      lastCameraId: "CAM-046",

      profileImage:
        "/mock/tigers/tiger-029.jpg",

      description:
        "Adult female with a high-confidence identity history.",

      identificationStatus: "confirmed",
    },


    /*
     * This represents an unresolved tiger identity.
     *
     * IMPORTANT:
     * This is useful for the future Image Review workflow.
     */

    {
      id: "UNKNOWN-005",

      displayId: "Unknown #005",

      name: "Unknown #005",

      sex: "Unknown",

      ageClass: "Unknown",

      status: "pending",

      currentZone: "Unknown",

      currentLocation:
        "Zone E · Pending",

      reidConfidence: 61.4,

      totalSightings: 3,

      firstSeen:
        "2026-08-15T12:21:00Z",

      lastSeen:
        "2026-08-15T15:42:00Z",

      lastCameraId: "CAM-072",

      profileImage:
        "/mock/tigers/unknown-005.jpg",

      description:
        "Unresolved tiger detection awaiting manual verification.",

      identificationStatus: "pending",
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | TIGER SIGHTING HISTORY
  |--------------------------------------------------------------------------
  |
  | Endpoint:
  |
  | GET /api/tigers/:tigerId/sightings
  |
  */

  tigerSightings: [
    {
      id: "SIG-1024",

      tigerId: "TGR-024",

      cameraId: "CAM-018",

      zone: "Moharli",

      location:
        "Zone A · Moharli",

      timestamp:
        "2026-08-15T18:42:00Z",

      confidence: 97,

      status: "verified",

      imageUrl:
        "/mock/sightings/SIG-1024.jpg",
    },

    {
      id: "SIG-1008",

      tigerId: "TGR-024",

      cameraId: "CAM-011",

      zone: "Moharli",

      location:
        "Zone A · Moharli",

      timestamp:
        "2026-08-15T16:12:00Z",

      confidence: 95,

      status: "verified",

      imageUrl:
        "/mock/sightings/SIG-1008.jpg",
    },

    {
      id: "SIG-0972",

      tigerId: "TGR-024",

      cameraId: "CAM-021",

      zone: "Moharli",

      location:
        "Zone A · Moharli",

      timestamp:
        "2026-08-14T19:31:00Z",

      confidence: 93,

      status: "verified",

      imageUrl:
        "/mock/sightings/SIG-0972.jpg",
    },

    {
      id: "SIG-0911",

      tigerId: "TGR-024",

      cameraId: "CAM-031",

      zone: "Tadoba",

      location:
        "Zone C · Tadoba",

      timestamp:
        "2026-08-13T17:12:00Z",

      confidence: 88,

      status: "verified",

      imageUrl:
        "/mock/sightings/SIG-0911.jpg",
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | RE-ID HISTORY
  |--------------------------------------------------------------------------
  |
  | This represents candidate matches generated by the ML pipeline.
  |
  | Eventually:
  |
  | Image
  |   ↓
  | Detection
  |   ↓
  | Feature Extraction
  |   ↓
  | Embedding
  |   ↓
  | Similarity Search
  |   ↓
  | Candidate Tigers
  |
  */

  tigerReidMatches: [
    {
      id: "REID-1001",

      tigerId: "TGR-024",

      imageId: "IMG-2024",

      candidateConfidence: 97.2,

      decision: "confirmed",

      matchedAt:
        "2026-08-15T18:42:00Z",
    },

    {
      id: "REID-0997",

      tigerId: "TGR-024",

      imageId: "IMG-1987",

      candidateConfidence: 95.8,

      decision: "confirmed",

      matchedAt:
        "2026-08-15T16:12:00Z",
    },

    {
      id: "REID-0942",

      tigerId: "TGR-024",

      imageId: "IMG-1844",

      candidateConfidence: 88.7,

      decision: "confirmed",

      matchedAt:
        "2026-08-13T17:12:00Z",
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | CAMERAS
  |--------------------------------------------------------------------------
  */

  cameras: [
    {
      id: "CAM-018",
      name: "Camera Alpha",
      zone: "Moharli",
      status: "online",
      battery: 87,
    },

    {
      id: "CAM-042",
      name: "Camera Beta",
      zone: "Navegaon",
      status: "online",
      battery: 64,
    },

    {
      id: "CAM-031",
      name: "Camera Gamma",
      zone: "Tadoba",
      status: "online",
      battery: 72,
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | GENERAL SIGHTINGS
  |--------------------------------------------------------------------------
  */

  sightings: [
    {
      id: "SIG-1024",
      tigerId: "TGR-024",
      cameraId: "CAM-018",
      imageId: "IMG-2024",
      timestamp:
        "2026-08-15T18:42:00Z",
      confidence: 0.97,
      status: "verified",
    },

    {
      id: "SIG-1023",
      tigerId: "TGR-011",
      cameraId: "CAM-042",
      imageId: "IMG-2023",
      timestamp:
        "2026-08-15T17:56:00Z",
      confidence: 0.94,
      status: "verified",
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | ALERTS
  |--------------------------------------------------------------------------
  */

  alerts: [
    {
      id: "ALT-001",

      type: "low_confidence",

      severity: "medium",

      title:
        "Low confidence tiger identification",

      description:
        "A tiger detection requires manual verification.",

      status: "pending",

      createdAt:
        "2026-08-15T18:10:00Z",
    },

    {
      id: "ALT-002",

      type: "camera_offline",

      severity: "high",

      title:
        "Camera Gamma is offline",

      description:
        "No transmission received from Camera Gamma.",

      status: "pending",

      createdAt:
        "2026-08-15T17:50:00Z",
    },
  ],


  /*
  |--------------------------------------------------------------------------
  | IMAGE REVIEWS
  |--------------------------------------------------------------------------
  */

  reviews: [
    {
      id: "REV-001",

      imageId: "IMG-2024",

      status: "pending",

      candidateTigerIds: [
        "TGR-024",
        "TGR-011",
        "TGR-037",
      ],

      confidence: 0.68,

      createdAt:
        "2026-08-15T18:10:00Z",
    },
  ],
};