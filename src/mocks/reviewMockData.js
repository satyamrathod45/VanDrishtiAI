// ============================================================
// VanDrishti - Human Review Mock Data
// ============================================================
//
// This file contains ONLY frontend mock data.
//
// We have two completely different human-review stages:
//
// 1. Blank / Image Classification Review
//    Question:
//    "Should this image continue through the pipeline?"
//
// 2. Tiger Re-ID Review
//    Question:
//    "Which individual tiger is present in this image?"
//
// Keeping these datasets separate makes the UI easier to develop.
// The real backend can later replace these objects with API data.
// ============================================================


// ============================================================
// BLANK / IMAGE CLASSIFICATION REVIEW
// ============================================================

export const blankReviewQueue = [

  {
    id: "BR-001",

    imageId: "IMG-82731",

    imageUrl:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1400&q=85",

    ai: {
      blankConfidence: 54,
      meaningfulConfidence: 46,

      reason:
        "Low visibility and possible subject detected near the center of the frame.",
    },

    camera: {
      id: "CAM-018",
      name: "Moharli Waterhole",
      zone: "Core Zone",
      location: "Moharli",
    },

    capturedAt: "16 Aug 2026 · 18:42:31",

    imageQuality: "fair",

    metadata: {
      imageSize: "5472 × 3648",
      fileSize: "5.8 MB",
      sequence: 127,
    },
  },


  {
    id: "BR-002",

    imageId: "IMG-82744",

    imageUrl:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=85",

    ai: {
      blankConfidence: 48,
      meaningfulConfidence: 52,

      reason:
        "Possible animal-like shape detected, but scene contains significant vegetation.",
    },

    camera: {
      id: "CAM-021",
      name: "Pench Central Trail",
      zone: "Core Zone",
      location: "Turia",
    },

    capturedAt: "16 Aug 2026 · 22:17:08",

    imageQuality: "poor",

    metadata: {
      imageSize: "5472 × 3648",
      fileSize: "4.9 MB",
      sequence: 231,
    },
  },


  {
    id: "BR-003",

    imageId: "IMG-82789",

    imageUrl:
      "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=1400&q=85",

    ai: {
      blankConfidence: 39,
      meaningfulConfidence: 61,

      reason:
        "Movement detected in the lower-right region of the frame.",
    },

    camera: {
      id: "CAM-034",
      name: "Pench North Trail",
      zone: "Core Zone",
      location: "Khursapar",
    },

    capturedAt: "17 Aug 2026 · 05:31:44",

    imageQuality: "good",

    metadata: {
      imageSize: "5472 × 3648",
      fileSize: "6.2 MB",
      sequence: 412,
    },
  },


  {
    id: "BR-004",

    imageId: "IMG-82821",

    imageUrl:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=85",

    ai: {
      blankConfidence: 67,
      meaningfulConfidence: 33,

      reason:
        "Scene contains environmental movement and low confidence subject detection.",
    },

    camera: {
      id: "CAM-041",
      name: "Village Edge Track",
      zone: "Buffer Zone",
      location: "Karma",
    },

    capturedAt: "17 Aug 2026 · 06:08:19",

    imageQuality: "fair",

    metadata: {
      imageSize: "5472 × 3648",
      fileSize: "5.1 MB",
      sequence: 89,
    },
  },


  {
    id: "BR-005",

    imageId: "IMG-82872",

    imageUrl:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1400&q=85",

    ai: {
      blankConfidence: 51,
      meaningfulConfidence: 49,

      reason:
        "Possible movement detected but image contains heavy vegetation.",
    },

    camera: {
      id: "CAM-052",
      name: "Karma Ridge",
      zone: "Core Zone",
      location: "Karma",
    },

    capturedAt: "17 Aug 2026 · 07:14:03",

    imageQuality: "fair",

    metadata: {
      imageSize: "5472 × 3648",
      fileSize: "5.5 MB",
      sequence: 145,
    },
  },

];


// ============================================================
// TIGER RE-ID REVIEW
// ============================================================

export const tigerReidReviewQueue = [

  {
    id: "TR-001",

    imageId: "IMG-90121",

    imageUrl:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1400&q=85",

    capturedAt: "16 Aug 2026 · 18:42:31",

    camera: {
      id: "CAM-018",
      name: "Moharli Waterhole",
      zone: "Core Zone",
      location: "Moharli",
    },

    ai: {
      topPrediction: "TGR-024",
      topConfidence: 62,

      candidates: [
        {
          tigerId: "TGR-024",
          confidence: 62,

          image:
            "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",

          description:
            "Strong similarity around shoulder and rear flank pattern.",
        },

        {
          tigerId: "TGR-011",
          confidence: 27,

          image:
            "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80",

          description:
            "Partial stripe similarity but weaker overall match.",
        },

        {
          tigerId: "UNKNOWN",
          confidence: 11,

          image:
            "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=600&q=80",

          description:
            "No strong match within the current reference catalogue.",
        },
      ],
    },

    imageQuality: "good",

    visibleFlank: "left",

    tigerDetection: {
      boundingBox: {
        x: 38,
        y: 27,
        width: 35,
        height: 52,
      },
    },

    referenceInfo: {
      "TGR-024": {
        lastSeen: "16 Aug 2026",
        knownSightings: 47,
        sex: "Female",
        age: "Approx. 6 years",
      },

      "TGR-011": {
        lastSeen: "14 Aug 2026",
        knownSightings: 32,
        sex: "Male",
        age: "Approx. 8 years",
      },
    },
  },


  {
    id: "TR-002",

    imageId: "IMG-90144",

    imageUrl:
      "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=1400&q=85",

    capturedAt: "16 Aug 2026 · 23:11:02",

    camera: {
      id: "CAM-021",
      name: "Pench Central Trail",
      zone: "Core Zone",
      location: "Turia",
    },

    ai: {
      topPrediction: "TGR-011",
      topConfidence: 68,

      candidates: [
        {
          tigerId: "TGR-011",
          confidence: 68,

          image:
            "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80",

          description:
            "Strong similarity in the visible right flank.",
        },

        {
          tigerId: "TGR-024",
          confidence: 21,

          image:
            "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",

          description:
            "Some stripe similarities but overall pattern differs.",
        },
      ],
    },

    imageQuality: "good",

    visibleFlank: "right",

    tigerDetection: {
      boundingBox: {
        x: 31,
        y: 30,
        width: 42,
        height: 49,
      },
    },

    referenceInfo: {
      "TGR-011": {
        lastSeen: "14 Aug 2026",
        knownSightings: 32,
        sex: "Male",
        age: "Approx. 8 years",
      },

      "TGR-024": {
        lastSeen: "16 Aug 2026",
        knownSightings: 47,
        sex: "Female",
        age: "Approx. 6 years",
      },
    },
  },


  {
    id: "TR-003",

    imageId: "IMG-90178",

    imageUrl:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=85",

    capturedAt: "17 Aug 2026 · 02:37:42",

    camera: {
      id: "CAM-022",
      name: "Sitaghat Corridor",
      zone: "Buffer Zone",
      location: "Sitaghat",
    },

    ai: {
      topPrediction: "UNKNOWN",
      topConfidence: 48,

      candidates: [
        {
          tigerId: "TGR-024",
          confidence: 48,

          image:
            "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",

          description:
            "Some pattern similarity but insufficient evidence.",
        },

        {
          tigerId: "TGR-032",
          confidence: 31,

          image:
            "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80",

          description:
            "Possible similarity in shoulder region.",
        },

        {
          tigerId: "UNKNOWN",
          confidence: 21,

          image:
            "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=600&q=80",

          description:
            "No reliable existing identity match.",
        },
      ],
    },

    imageQuality: "fair",

    visibleFlank: "unclear",

    tigerDetection: {
      boundingBox: {
        x: 42,
        y: 32,
        width: 29,
        height: 43,
      },
    },

    referenceInfo: {
      "TGR-024": {
        lastSeen: "16 Aug 2026",
        knownSightings: 47,
        sex: "Female",
        age: "Approx. 6 years",
      },

      "TGR-032": {
        lastSeen: "16 Aug 2026",
        knownSightings: 28,
        sex: "Male",
        age: "Approx. 9 years",
      },
    },
  },


  {
    id: "TR-004",

    imageId: "IMG-90202",

    imageUrl:
      "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=1400&q=85",

    capturedAt: "17 Aug 2026 · 04:12:12",

    camera: {
      id: "CAM-034",
      name: "Pench North Trail",
      zone: "Core Zone",
      location: "Khursapar",
    },

    ai: {
      topPrediction: "TGR-032",
      topConfidence: 59,

      candidates: [
        {
          tigerId: "TGR-032",
          confidence: 59,

          image:
            "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80",

          description:
            "Moderate similarity across the visible flank.",
        },

        {
          tigerId: "TGR-007",
          confidence: 28,

          image:
            "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=600&q=80",

          description:
            "Partial similarity in stripe arrangement.",
        },
      ],
    },

    imageQuality: "fair",

    visibleFlank: "left",

    tigerDetection: {
      boundingBox: {
        x: 35,
        y: 26,
        width: 38,
        height: 55,
      },
    },

    referenceInfo: {
      "TGR-032": {
        lastSeen: "16 Aug 2026",
        knownSightings: 28,
        sex: "Male",
        age: "Approx. 9 years",
      },

      "TGR-007": {
        lastSeen: "15 Aug 2026",
        knownSightings: 19,
        sex: "Male",
        age: "Approx. 5 years",
      },
    },
  },

];


// ============================================================
// REVIEW SUMMARY
// ============================================================

export const reviewSummary = {

  blankReview: {
    pending: 43,
    reviewedToday: 18,
    averageReviewTime: "14 sec",
  },

  tigerReidReview: {
    pending: 27,
    reviewedToday: 12,
    averageReviewTime: "31 sec",
  },

};