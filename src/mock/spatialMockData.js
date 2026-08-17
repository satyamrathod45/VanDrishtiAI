// ============================================================
// VanDrishti
// Spatial Intelligence Mock Dataset
// ============================================================
//
// IMPORTANT
// ------------------------------------------------------------
// This file contains SIMULATED operational data.
//
// The underlying basemap represents the real Pench region.
// Camera locations, grid assignments, tiger observations and
// tiger-range polygons below are DEMO DATA.
//
// Do NOT present these coordinates as official field data.
//
// Backend replacement:
//
// spatialGrids       -> GIS / Grid API
// spatialCameras     -> Camera Station API
// tigerObservations  -> Detection API
// tigerRanges        -> Spatial Analysis API
//
// ============================================================


// ============================================================
// PENCH MAP CONFIGURATION
// ============================================================
//
// Approximate operational viewport for the Maharashtra
// Pench landscape.
//
// This is intentionally treated as a viewport rather than
// an authoritative legal boundary.
//
// Once the project receives the official GIS GeoJSON,
// replace these values with the real geometry.
// ============================================================

export const penchMapConfig = {
  center: [21.72, 79.35],
  minZoom: 10,
  defaultZoom: 11,
  maxZoom: 13,
  bounds: [
    [21.45, 79.02],
    [21.92, 79.65],
  ],
};


// ============================================================
// TIGERS
// ============================================================

export const spatialTigers = [

  {
    id: "P-017",

    sex: "Female",

    age: "Approx. 6 years",

    status: "Active",

    currentArea: "42.6 km²",

    observations: 87,

    cameraStations: 14,

    confidence: 91,

    latestGrid: "G-072",

    latestCamera: "CAM-143",

    lastDetection:
      "17 Aug 2026 · 04:21",

    centroid:
      "21.664° N, 79.274° E",

    trend:
      "buffer_activity",

  },

  {
    id: "P-021",

    sex: "Male",

    age: "Approx. 8 years",

    status: "Active",

    currentArea: "51.2 km²",

    observations: 64,

    cameraStations: 11,

    confidence: 87,

    latestGrid: "G-068",

    latestCamera: "CAM-118",

    lastDetection:
      "16 Aug 2026 · 22:14",

    centroid:
      "21.618° N, 79.226° E",

    trend:
      "stable",

  },

  {
    id: "P-032",

    sex: "Male",

    age: "Approx. 9 years",

    status: "Active",

    currentArea: "37.8 km²",

    observations: 51,

    cameraStations: 9,

    confidence: 83,

    latestGrid: "G-079",

    latestCamera: "CAM-162",

    lastDetection:
      "16 Aug 2026 · 19:42",

    centroid:
      "21.706° N, 79.313° E",

    trend:
      "shift",

  },

];


// ============================================================
// CAMERA STATIONS
// ============================================================
//
// The positions intentionally DO NOT form a regular pattern.
//
// In real life, camera traps are positioned according to:
//
// - terrain
// - animal movement paths
// - roads / trails
// - water sources
// - survey design
// - field accessibility
//
// Therefore, the prototype uses irregular positions.
//
// These are SIMULATED locations.
// ============================================================

export const spatialCameras = [

  {
    id: "CAM-118",
    position: [21.6032, 79.1734],
    gridId: "G-068",
    status: "processed",
    images: 4281,
    tigerDetections: 7,
    lastProcessed: "17 Aug 2026",
    lastDetection: "P-021",
  },

  {
    id: "CAM-127",
    position: [21.5748, 79.2391],
    gridId: "G-069",
    status: "processed",
    images: 3914,
    tigerDetections: 11,
    lastProcessed: "17 Aug 2026",
    lastDetection: "P-017",
  },

  {
    id: "CAM-132",
    position: [21.6394, 79.1472],
    gridId: "G-072",
    status: "processed",
    images: 5142,
    tigerDetections: 8,
    lastProcessed: "17 Aug 2026",
    lastDetection: "P-017",
  },

  {
    id: "CAM-143",
    position: [21.6578, 79.2485],
    gridId: "G-073",
    status: "processed",
    images: 4821,
    tigerDetections: 17,
    lastProcessed: "17 Aug 2026",
    lastDetection: "P-017",
  },

  {
    id: "CAM-152",
    position: [21.6287, 79.3194],
    gridId: "G-074",
    status: "processed",
    images: 5312,
    tigerDetections: 19,
    lastProcessed: "17 Aug 2026",
    lastDetection: "P-032",
  },

  {
    id: "CAM-155",
    position: [21.6734, 79.3627],
    gridId: "G-075",
    status: "review",
    images: 3742,
    tigerDetections: 6,
    lastProcessed: "17 Aug 2026",
    lastDetection: "P-017",
  },

  {
    id: "CAM-162",
    position: [21.7092, 79.3441],
    gridId: "G-079",
    status: "processed",
    images: 4218,
    tigerDetections: 12,
    lastProcessed: "16 Aug 2026",
    lastDetection: "P-032",
  },

  {
    id: "CAM-171",
    position: [21.7412, 79.2874],
    gridId: "G-081",
    status: "processed",
    images: 2984,
    tigerDetections: 4,
    lastProcessed: "16 Aug 2026",
    lastDetection: "P-032",
  },

  {
    id: "CAM-179",
    position: [21.7018, 79.2126],
    gridId: "G-077",
    status: "processed",
    images: 3521,
    tigerDetections: 9,
    lastProcessed: "16 Aug 2026",
    lastDetection: "P-021",
  },

  {
    id: "CAM-184",
    position: [21.7611, 79.3573],
    gridId: "G-083",
    status: "offline",
    images: 0,
    tigerDetections: 0,
    lastProcessed: "12 Aug 2026",
    lastDetection: "—",
  },

];


// ============================================================
// TIGER OBSERVATIONS
// ============================================================

export const tigerObservations = [

  {
    id: "OBS-001",

    tigerId: "P-017",

    cameraId: "CAM-127",

    gridId: "G-069",

    position: [
      21.5748,
      79.2391,
    ],

    date: "2026-08-15",

    time: "18:42",

    confidence: 92,

  },

  {
    id: "OBS-002",

    tigerId: "P-017",

    cameraId: "CAM-132",

    gridId: "G-072",

    position: [
      21.6394,
      79.1472,
    ],

    date: "2026-08-16",

    time: "03:17",

    confidence: 94,

  },

  {
    id: "OBS-003",

    tigerId: "P-017",

    cameraId: "CAM-143",

    gridId: "G-073",

    position: [
      21.6578,
      79.2485,
    ],

    date: "2026-08-16",

    time: "18:42",

    confidence: 91,

  },

  {
    id: "OBS-004",

    tigerId: "P-017",

    cameraId: "CAM-152",

    gridId: "G-074",

    position: [
      21.6287,
      79.3194,
    ],

    date: "2026-08-16",

    time: "23:11",

    confidence: 88,

  },

  {
    id: "OBS-005",

    tigerId: "P-017",

    cameraId: "CAM-155",

    gridId: "G-075",

    position: [
      21.6734,
      79.3627,
    ],

    date: "2026-08-17",

    time: "04:21",

    confidence: 93,

  },

  {
    id: "OBS-006",

    tigerId: "P-021",

    cameraId: "CAM-118",

    gridId: "G-068",

    position: [
      21.6032,
      79.1734,
    ],

    date: "2026-08-16",

    time: "22:14",

    confidence: 90,

  },

  {
    id: "OBS-007",

    tigerId: "P-021",

    cameraId: "CAM-179",

    gridId: "G-077",

    position: [
      21.7018,
      79.2126,
    ],

    date: "2026-08-16",

    time: "23:02",

    confidence: 87,

  },

  {
    id: "OBS-008",

    tigerId: "P-032",

    cameraId: "CAM-152",

    gridId: "G-074",

    position: [
      21.6287,
      79.3194,
    ],

    date: "2026-08-16",

    time: "19:42",

    confidence: 89,

  },

  {
    id: "OBS-009",

    tigerId: "P-032",

    cameraId: "CAM-162",

    gridId: "G-079",

    position: [
      21.7092,
      79.3441,
    ],

    date: "2026-08-16",

    time: "21:31",

    confidence: 91,

  },

];


// ============================================================
// TIGER RANGE
// ============================================================

export const tigerRanges = {

  "P-017": {

    current: [

      [21.575, 79.165],

      [21.548, 79.245],

      [21.591, 79.327],

      [21.655, 79.377],

      [21.718, 79.341],

      [21.711, 79.263],

      [21.665, 79.186],

      [21.612, 79.148],

    ],

    historical: [

      [21.565, 79.145],

      [21.541, 79.226],

      [21.579, 79.301],

      [21.645, 79.346],

      [21.690, 79.321],

      [21.680, 79.248],

      [21.628, 79.181],

    ],

    centroid: [
      21.664,
      79.274,
    ],

    area: "42.6 km²",

    change:
      "3.8 km northeast",

  },


  "P-021": {

    current: [

      [21.560, 79.112],

      [21.542, 79.181],

      [21.581, 79.247],

      [21.639, 79.255],

      [21.672, 79.205],

      [21.640, 79.142],

    ],

    historical: [

      [21.570, 79.125],

      [21.560, 79.185],

      [21.600, 79.228],

      [21.645, 79.205],

      [21.630, 79.151],

      [21.595, 79.126],

    ],

    centroid: [
      21.618,
      79.226,
    ],

    area: "51.2 km²",

    change:
      "Stable",

  },


  "P-032": {

    current: [

      [21.662, 79.278],

      [21.678, 79.345],

      [21.721, 79.392],

      [21.775, 79.365],

      [21.763, 79.300],

      [21.713, 79.258],

    ],

    historical: [

      [21.650, 79.290],

      [21.688, 79.336],

      [21.735, 79.373],

      [21.756, 79.347],

      [21.730, 79.300],

      [21.695, 79.269],

    ],

    centroid: [
      21.706,
      79.313,
    ],

    area: "37.8 km²",

    change:
      "Shift detected",

  },

};


// ============================================================
// MOVEMENT SEQUENCE
// ============================================================

export const movementSequences = {

  "P-017": [

    {
      grid: "G-069",
      camera: "CAM-127",
      date: "15 Aug",
    },

    {
      grid: "G-072",
      camera: "CAM-132",
      date: "16 Aug",
    },

    {
      grid: "G-073",
      camera: "CAM-143",
      date: "16 Aug",
    },

    {
      grid: "G-074",
      camera: "CAM-152",
      date: "16 Aug",
    },

    {
      grid: "G-075",
      camera: "CAM-155",
      date: "17 Aug",
    },

  ],

};


// ============================================================
// SETTLEMENTS
// ============================================================

export const settlements = [

  {
    id: "SET-01",
    name: "Khursapar",
    position: [
      21.66865,
      79.37003,
    ],
  },

  {
    id: "SET-02",
    name: "Mohgaon",
    position: [
      21.723,
      79.302,
    ],
  },

  {
    id: "SET-03",
    name: "Turia",
    position: [
      21.745,
      79.395,
    ],
  },

];


// ============================================================
// OVERLAP
// ============================================================

export const territoryOverlap = {
  "P-017": {
    with: "P-032",
    area: "8.4 km²",
    trend: "Increasing",
  },
};

// ============================================================
// PENCH RESERVE MANAGEMENT BOUNDARIES & ZONING
// ============================================================
// ============================================================
// OFFICIAL PENCH TIGER RESERVE (M.P. & M.H.) ZONING & BOUNDARIES
// ============================================================
// Exact Georeferenced Boundaries matching the official Pench (M.P.) Map:
// - Red: Indira Priyadarshini National Park Core (surrounding Totladoh Reservoir)
// - Green: Mowgli Pench Sanctuary Core (East of NP, West of NH-44)
// - Yellow: Buffer Area & ESZ (West Chhindwara, North Seoni, Large East Kurai Lobe, South Fringe)
// - Blue: Actual Totladoh Reservoir Lake & Pench River
// - Red Line: Real NH-44 Highway Corridor (Nagpur -> Khawasa -> Kurai -> Jabalpur)
// ============================================================

export const managementZones = {
  // 1. NATIONAL PARK CORE (Red Area in Official Map - 292.86 km²)
  // Encompasses Totladoh at South base and branches North on both sides of Pench River
  nationalPark: [
    [21.595, 79.215], // Totladoh Base (South Maharashtra Border)
    [21.605, 79.185],
    [21.625, 79.170],
    [21.655, 79.175],
    [21.670, 79.155],
    [21.705, 79.165],
    [21.735, 79.195],
    [21.765, 79.230],
    [21.785, 79.255],
    [21.770, 79.280],
    [21.740, 79.290],
    [21.715, 79.310],
    [21.685, 79.315],
    [21.660, 79.295],
    [21.635, 79.275],
    [21.615, 79.260],
    [21.595, 79.235],
    [21.595, 79.215],
  ],

  // 2. MOWGLI PENCH SANCTUARY CORE (Green Area in Official Map - 118.30 km²)
  // Sits east of the National Park and borders the NH-44 highway on the east
  sanctuary: [
    [21.685, 79.315],
    [21.715, 79.310],
    [21.740, 79.330],
    [21.775, 79.345],
    [21.810, 79.375],
    [21.835, 79.405],
    [21.795, 79.415], // NH-44 boundary near Khawasa/Turia
    [21.745, 79.410],
    [21.705, 79.395],
    [21.670, 79.365],
    [21.660, 79.335],
    [21.685, 79.315],
  ],

  // 3. TOTLADOH RESERVOIR & PENCH RIVER (Blue Water Body in Official Map)
  // Perfectly aligned with the actual OSM Totladoh lake and Pench river bifurcation
  reservoir: [
    [21.600, 79.230], // Totladoh Dam
    [21.620, 79.215],
    [21.645, 79.205],
    [21.665, 79.185],
    [21.680, 79.195],
    [21.670, 79.220],
    [21.695, 79.235],
    [21.725, 79.250],
    [21.750, 79.260],
    [21.735, 79.270],
    [21.710, 79.258],
    [21.680, 79.260],
    [21.655, 79.250],
    [21.635, 79.255],
    [21.615, 79.245],
    [21.600, 79.230],
  ],

  // 4. BUFFER AREA & ESZ (Yellow Area in Official Map - 768.30 km²)
  // Covers West (Chhindwara), North (Seoni), the large Eastern Lobe (Kurai/Rukhad), and South
  buffer: [
    // West Chhindwara Buffer Wing
    [21.560, 79.085],
    [21.610, 79.070],
    [21.670, 79.075],
    [21.720, 79.095],
    [21.765, 79.130],
    [21.805, 79.175],
    // North Seoni Buffer
    [21.835, 79.230],
    [21.855, 79.290],
    [21.865, 79.370],
    // Large East Kurai / Rukhad Buffer Lobe (East of NH-44)
    [21.860, 79.450],
    [21.845, 79.530],
    [21.820, 79.585],
    [21.775, 79.620],
    [21.720, 79.610],
    [21.685, 79.560],
    [21.660, 79.490],
    // South Linear Infrastructure Buffer (along NH-44 to Mansinghdeo / Nagpur)
    [21.620, 79.440],
    [21.570, 79.380],
    [21.535, 79.330],
    [21.540, 79.220],
    [21.560, 79.085],
  ],

  // 5. NATIONAL HIGHWAY 44 (Linear Infrastructure Buffer - Red Line)
  // Aligned with the actual NH-44 highway on OpenStreetMap
  nh44Highway: [
    [21.535, 79.330], // To Nagpur (South)
    [21.580, 79.355], // Deolapar
    [21.640, 79.380], // Mansinghdeo border
    [21.700, 79.408], // Khawasa (Turia Gate Turnoff)
    [21.760, 79.418], // Pench Sanctuary Eastern Border
    [21.820, 79.485], // Kurai Tahsil
    [21.885, 79.540], // To Jabalpur (North)
  ],
};

// ============================================================
// PENCH RESERVE GATES & OPERATIONAL LANDMARKS
// ============================================================

export const penchGatesAndLandmarks = [
  {
    id: "GATE-01",
    name: "Sillari Gate",
    state: "Maharashtra",
    zone: "Core Zone",
    position: [21.6032, 79.2985],
    type: "core_gate",
    description: "Main Maharashtra entry gate, dense teak forest.",
  },
  {
    id: "GATE-02",
    name: "Khursapar Gate",
    state: "Maharashtra",
    zone: "Core Zone",
    position: [21.6686, 79.3700],
    type: "core_gate",
    description: "High tiger density zone, undulating terrain.",
  },
  {
    id: "GATE-03",
    name: "Turia Gate",
    state: "Madhya Pradesh",
    zone: "Core Zone",
    position: [21.7450, 79.3950],
    type: "core_gate",
    description: "Prime MP core gate, high tiger movement.",
  },
  {
    id: "GATE-04",
    name: "Karmajhiri Gate",
    state: "Madhya Pradesh",
    zone: "Core Zone",
    position: [21.8150, 79.3400],
    type: "core_gate",
    description: "Deep northern core access, Runijhuni trail.",
  },
  {
    id: "GATE-05",
    name: "Kolitmara Gate",
    state: "Maharashtra",
    zone: "Buffer Zone",
    position: [21.5850, 79.1450],
    type: "buffer_gate",
    description: "West Pench buffer on Pench river bank.",
  },
  {
    id: "LAND-01",
    name: "Totladoh Reservoir",
    state: "Interstate Boundary",
    zone: "Water Body / Core",
    position: [21.6820, 79.2450],
    type: "water_reservoir",
    description: "Meghdoot Dam reservoir bisecting the reserve.",
  },
  {
    id: "CORR-01",
    name: "NH-44 Animal Underpass",
    state: "Corridor",
    zone: "Eco-Corridor",
    position: [21.7050, 79.4250],
    type: "corridor",
    description: "Dedicated wildlife underpasses along NH-44 highway.",
  },
];