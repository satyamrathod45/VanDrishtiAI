// ============================================================
// VanDrishti - Alerts Mock Data
// ============================================================
// PURPOSE:
// This file is ONLY for frontend UI development.
//
// We are intentionally keeping Alert mock data separate from
// the main mockApi.js so that the project remains manageable.
//
// Later, when the real backend is ready, this file can simply
// be replaced by API responses.
//
// ============================================================

export const alertStats = {
  total: 6,
  highPriority: 2,
  needsReview: 3,
  resolved: 8,
};


// ============================================================
// ALERT TYPES
// ============================================================
//
// buffer-movement
// new-station
// range-shift
// prolonged-absence
//
// ============================================================

export const alerts = [
  {
    id: "ALT-001",

    type: "buffer-movement",

    title: "Buffer Movement",

    description:
      "TGR-024 has been detected repeatedly near the buffer boundary.",

    severity: "high",

    status: "new",

    createdAt: "2026-08-17T08:42:00",

    timeAgo: "42 min ago",

    tiger: {
      id: "TGR-024",
      name: "TGR-024",
      sex: "Female",
      age: "Approx. 6 years",
      image:
        "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",
    },

    location: {
      cameraId: "CAM-018",
      cameraName: "Moharli Waterhole",
      zone: "Buffer Zone",
      latitude: 20.9124,
      longitude: 79.1981,
    },

    analysis: {
      confidence: 87,

      reason:
        "The individual has been detected at three buffer-adjacent stations within the last two nights.",

      baseline:
        "TGR-024 has historically been observed primarily inside the core monitoring area.",

      currentObservation:
        "Current detections indicate repeated activity toward the buffer boundary.",

      detectionCount: 3,

      affectedStations: 3,
    },

    evidence: [
      {
        id: "IMG-82731",
        camera: "CAM-018",
        date: "16 Aug 2026",
        time: "18:42",
        image:
          "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "IMG-82762",
        camera: "CAM-021",
        date: "16 Aug 2026",
        time: "23:11",
        image:
          "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "IMG-82801",
        camera: "CAM-022",
        date: "17 Aug 2026",
        time: "02:37",
        image:
          "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=1000&q=80",
      },
    ],

    recommendation:
      "Review recent sightings and monitor further activity near the buffer boundary.",
  },

  {
    id: "ALT-002",

    type: "new-station",

    title: "New Station Detection",

    description:
      "TGR-011 has been detected at a camera station not previously associated with this individual.",

    severity: "medium",

    status: "new",

    createdAt: "2026-08-17T07:25:00",

    timeAgo: "1 hr ago",

    tiger: {
      id: "TGR-011",
      name: "TGR-011",
      sex: "Male",
      age: "Approx. 8 years",
      image:
        "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80",
    },

    location: {
      cameraId: "CAM-034",
      cameraName: "Pench North Trail",
      zone: "Core Zone",
      latitude: 21.0341,
      longitude: 79.3112,
    },

    analysis: {
      confidence: 81,

      reason:
        "The individual was identified at CAM-034, a station where no previous verified sighting exists.",

      baseline:
        "TGR-011 has historically been associated with the northern monitoring cluster.",

      currentObservation:
        "The new detection extends the currently known activity area.",

      detectionCount: 1,

      affectedStations: 1,
    },

    evidence: [
      {
        id: "IMG-73012",
        camera: "CAM-034",
        date: "17 Aug 2026",
        time: "06:18",
        image:
          "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=1000&q=80",
      },
    ],

    recommendation:
      "Review the image and compare the station with the tiger's historical movement pattern.",
  },

  {
    id: "ALT-003",

    type: "range-shift",

    title: "Activity Range Shift",

    description:
      "A significant shift in TGR-007's activity centroid has been detected.",

    severity: "medium",

    status: "review",

    createdAt: "2026-08-16T19:20:00",

    timeAgo: "Yesterday",

    tiger: {
      id: "TGR-007",
      name: "TGR-007",
      sex: "Male",
      age: "Approx. 5 years",
      image:
        "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=600&q=80",
    },

    location: {
      cameraId: "CAM-012",
      cameraName: "Turia Ridge",
      zone: "Core Zone",
      latitude: 21.0112,
      longitude: 79.2271,
    },

    analysis: {
      confidence: 78,

      reason:
        "The current activity centroid is approximately 5.8 km from the historical centroid.",

      baseline:
        "Historical activity has been concentrated around the Turia monitoring cluster.",

      currentObservation:
        "Recent detections indicate a gradual eastward shift.",

      detectionCount: 7,

      affectedStations: 5,
    },

    evidence: [
      {
        id: "IMG-61001",
        camera: "CAM-012",
        date: "15 Aug 2026",
        time: "21:14",
        image:
          "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "IMG-61044",
        camera: "CAM-015",
        date: "16 Aug 2026",
        time: "03:22",
        image:
          "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=1000&q=80",
      },
    ],

    recommendation:
      "Compare the recent activity map against the historical occupancy area.",
  },

  {
    id: "ALT-004",

    type: "prolonged-absence",

    title: "Prolonged Absence",

    description:
      "TGR-018 has not been detected during its expected monitoring interval.",

    severity: "info",

    status: "review",

    createdAt: "2026-08-16T11:10:00",

    timeAgo: "Yesterday",

    tiger: {
      id: "TGR-018",
      name: "TGR-018",
      sex: "Female",
      age: "Approx. 7 years",
      image:
        "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",
    },

    location: {
      cameraId: "CAM-007",
      cameraName: "Sitaghat Corridor",
      zone: "Core Zone",
      latitude: 20.9742,
      longitude: 79.1634,
    },

    analysis: {
      confidence: 72,

      reason:
        "No verified detection has been recorded for 31 days despite historically regular activity.",

      baseline:
        "TGR-018 was previously detected approximately every 4–7 days.",

      currentObservation:
        "No verified sightings have been recorded during the current observation period.",

      detectionCount: 0,

      affectedStations: 4,
    },

    evidence: [],

    recommendation:
      "Check camera availability and survey effort before interpreting the absence as a movement change.",
  },

  {
    id: "ALT-005",

    type: "buffer-movement",

    title: "Repeated Buffer Activity",

    description:
      "TGR-032 has shown repeated activity around the village-facing monitoring boundary.",

    severity: "high",

    status: "new",

    createdAt: "2026-08-16T15:48:00",

    timeAgo: "Yesterday",

    tiger: {
      id: "TGR-032",
      name: "TGR-032",
      sex: "Male",
      age: "Approx. 9 years",
      image:
        "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80",
    },

    location: {
      cameraId: "CAM-041",
      cameraName: "Village Edge Track",
      zone: "Buffer Zone",
      latitude: 20.8912,
      longitude: 79.2763,
    },

    analysis: {
      confidence: 91,

      reason:
        "Five verified detections have occurred at village-facing stations during the last three nights.",

      baseline:
        "TGR-032 has historically remained within the central core monitoring cluster.",

      currentObservation:
        "Repeated detections indicate increased activity toward the village-facing boundary.",

      detectionCount: 5,

      affectedStations: 4,
    },

    evidence: [
      {
        id: "IMG-92111",
        camera: "CAM-041",
        date: "15 Aug 2026",
        time: "20:12",
        image:
          "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "IMG-92182",
        camera: "CAM-043",
        date: "16 Aug 2026",
        time: "01:42",
        image:
          "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80",
      },
    ],

    recommendation:
      "Prioritize review of recent sightings and monitor the village-facing stations.",
  },

  {
    id: "ALT-006",

    type: "new-station",

    title: "New Station Detection",

    description:
      "TGR-014 has been identified at a newly active camera station.",

    severity: "medium",

    status: "acknowledged",

    createdAt: "2026-08-15T16:05:00",

    timeAgo: "2 days ago",

    tiger: {
      id: "TGR-014",
      name: "TGR-014",
      sex: "Female",
      age: "Approx. 4 years",
      image:
        "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=600&q=80",
    },

    location: {
      cameraId: "CAM-052",
      cameraName: "Karma Ridge",
      zone: "Core Zone",
      latitude: 20.9442,
      longitude: 79.2211,
    },

    analysis: {
      confidence: 84,

      reason:
        "The tiger was verified at a station where no previous individual-level sighting exists.",

      baseline:
        "TGR-014 has been associated primarily with southern stations.",

      currentObservation:
        "The new station lies outside the individual's previous known cluster.",

      detectionCount: 2,

      affectedStations: 1,
    },

    evidence: [
      {
        id: "IMG-51128",
        camera: "CAM-052",
        date: "15 Aug 2026",
        time: "17:32",
        image:
          "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=1000&q=80",
      },
    ],

    recommendation:
      "Continue monitoring the station to determine whether this is an isolated detection or a developing pattern.",
  },
];


// ============================================================
// HELPERS
// ============================================================

export const getAlertById = (id) => {
  return alerts.find((alert) => alert.id === id);
};


export const getAlertsByType = (type) => {
  if (type === "all") {
    return alerts;
  }

  return alerts.filter(
    (alert) => alert.type === type
  );
};


export const getAlertsBySeverity = (severity) => {
  if (severity === "all") {
    return alerts;
  }

  return alerts.filter(
    (alert) => alert.severity === severity
  );
};


export const getAlertsByStatus = (status) => {
  if (status === "all") {
    return alerts;
  }

  return alerts.filter(
    (alert) => alert.status === status
  );
};