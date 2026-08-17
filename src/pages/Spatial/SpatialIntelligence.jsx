// ============================================================
// VanDrishti
// Spatial Intelligence
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Camera,
  Crosshair,
  Grid3X3,
  Layers3,
  MapPin,
  Navigation,
  Radio,
  Target,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  penchMapConfig,
  spatialTigers,
  spatialCameras,
  tigerObservations,
  tigerRanges,
  movementSequences,
  settlements,
  territoryOverlap,
  managementZones,
} from "../../mock/spatialMockData";


// ============================================================
// MAIN PAGE
// ============================================================

export default function SpatialIntelligence() {

  const [
    selectedTigerId,
    setSelectedTigerId,
  ] = useState("P-017");


  const [
    mapMode,
    setMapMode,
  ] = useState("current");


  const [
    selectedGrid,
    setSelectedGrid,
  ] = useState(null);


  const [
    selectedCamera,
    setSelectedCamera,
  ] = useState(null);


  const [
    selectedObservation,
    setSelectedObservation,
  ] = useState(null);


  const [
    showGrid,
    setShowGrid,
  ] = useState(true);


  const [
    showCameras,
    setShowCameras,
  ] = useState(true);


  const [
    showObservations,
    setShowObservations,
  ] = useState(true);


  const [
    showRange,
    setShowRange,
  ] = useState(true);


  const [
    showManagement,
    setShowManagement,
  ] = useState(true);


  const [
    showMovement,
    setShowMovement,
  ] = useState(false);


  const selectedTiger =
    spatialTigers.find(
      (tiger) =>
        tiger.id ===
        selectedTigerId
    );


  const selectedRange =
    tigerRanges[
      selectedTigerId
    ];


  const observations =
    useMemo(
      () =>
        tigerObservations.filter(
          (item) =>
            item.tigerId ===
            selectedTigerId
        ),
      [selectedTigerId]
    );


  const movement =
    movementSequences[
      selectedTigerId
    ] || [];


  const overlap =
    territoryOverlap[
      selectedTigerId
    ];


  const selectedCameraData =
    spatialCameras.find(
      (camera) =>
        camera.id ===
        selectedCamera
    );


  return (

    <div className="min-h-screen bg-[#f5f5f2] pb-32 text-zinc-900">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-zinc-200/70">

        <div className="mx-auto max-w-[1600px] px-5 py-6 md:px-8">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e97813]/10">

                  <Navigation
                    size={15}
                    className="text-[#d86b0e]"
                  />

                </div>

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d86b0e]">
                  Spatial Intelligence
                </span>

              </div>


              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Territory & Monitoring
              </h1>


              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                Recorded observations, monitoring
                grids and tiger territory intelligence
                across Pench.
              </p>

            </div>


            {/* TIGER SELECTOR */}

            <div className="flex items-center gap-3">

              <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2">

                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Tiger
                </p>

                <select
                  value={
                    selectedTigerId
                  }
                  onChange={(event) => {

                    setSelectedTigerId(
                      event.target.value
                    );

                    setSelectedGrid(
                      null
                    );

                    setSelectedCamera(
                      null
                    );

                    setSelectedObservation(
                      null
                    );

                  }}
                  className="mt-1 min-w-[150px] bg-transparent text-sm font-semibold outline-none"
                >

                  {spatialTigers.map(
                    (tiger) => (

                      <option
                        key={tiger.id}
                        value={tiger.id}
                      >
                        {tiger.id} ·{" "}
                        {tiger.sex}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="hidden rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:block">

                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Latest evidence
                </p>

                <p className="mt-1 text-xs font-semibold">
                  {selectedTiger.latestCamera}
                  {" · "}
                  {selectedTiger.lastDetection}
                </p>

              </div>

            </div>

          </div>


          {/* MODE */}

          <div className="mt-6 flex w-fit items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1.5">

            {[
              ["current", "Current"],
              ["historical", "Historical"],
              ["compare", "Compare"],
            ].map(
              ([value, label]) => (

                <button
                  key={value}
                  onClick={() =>
                    setMapMode(
                      value
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-[10px] font-semibold transition ${
                    mapMode === value
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  {label}
                </button>

              )
            )}

          </div>

        </div>

      </header>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-5 md:px-8">

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">


          {/* ==================================================
              MAP
          ================================================== */}

          <section className="relative overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">

            <MapContainer
              center={
                penchMapConfig.center
              }

              zoom={
                penchMapConfig.defaultZoom
              }

              minZoom={
                penchMapConfig.minZoom
              }

              maxZoom={
                penchMapConfig.maxZoom
              }

              maxBounds={
                penchMapConfig.bounds
              }

              maxBoundsViscosity={1}

              scrollWheelZoom

              className="h-[650px] w-full md:h-[720px]"
            >

              {/* ==================================================
                  REAL OPEN STREET MAP BASE
              ================================================== */}

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              {/* ==================================================
                  ADAPTIVE GRID
              ================================================== */}

              {showGrid && (

                <AdaptiveForestGrid
                  selectedTigerId={
                    selectedTigerId
                  }

                  selectedGrid={
                    selectedGrid
                  }

                  onGridSelect={
                    setSelectedGrid
                  }
                />

              )}


              {/* ==================================================
                  MANAGEMENT ZONES
              ================================================== */}

              {showManagement && (

                <>

                  <Polygon
                    positions={
                      managementZones.buffer
                    }
                    pathOptions={{
                      color: "#94a3b8",
                      fillColor: "#94a3b8",
                      fillOpacity: 0.04,
                      weight: 1,
                      dashArray: "8 8",
                    }}
                  />

                  <Polygon
                    positions={
                      managementZones.core
                    }
                    pathOptions={{
                      color: "#71717a",
                      fillColor: "#71717a",
                      fillOpacity: 0.06,
                      weight: 1,
                    }}
                  />

                </>

              )}


              {/* ==================================================
                  TIGER RANGE
              ================================================== */}

              {showRange &&
                selectedRange &&
                mapMode !== "historical" && (

                  <Polygon
                    positions={
                      selectedRange.current
                    }
                    pathOptions={{
                      color: "#e97813",
                      fillColor: "#e97813",
                      fillOpacity: 0.12,
                      weight: 2,
                    }}
                  >

                    <Tooltip sticky>

                      Estimated current range

                    </Tooltip>

                  </Polygon>

                )}


              {/* HISTORICAL */}

              {showRange &&
                selectedRange &&
                mapMode !== "current" && (

                  <Polygon
                    positions={
                      selectedRange.historical
                    }
                    pathOptions={{
                      color: "#71717a",
                      fillColor: "#71717a",
                      fillOpacity: 0.04,
                      weight: 1.5,
                      dashArray: "7 6",
                    }}
                  >

                    <Tooltip sticky>

                      Historical estimated range

                    </Tooltip>

                  </Polygon>

                )}


              {/* ==================================================
                  CENTROID
              ================================================== */}

              {showRange &&
                selectedRange && (

                  <Marker
                    position={
                      selectedRange.centroid
                    }
                    icon={
                      createCentroidIcon()
                    }
                  >

                    <Popup>

                      <div className="min-w-[180px]">

                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                          Activity centroid
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedTigerId}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-500">
                          Derived from recorded
                          observations.
                        </p>

                      </div>

                    </Popup>

                  </Marker>

                )}


              {/* ==================================================
                  CAMERAS
              ================================================== */}

              {showCameras &&
                spatialCameras.map(
                  (camera) => (

                    <Marker
                      key={
                        camera.id
                      }
                      position={
                        camera.position
                      }
                      icon={
                        createCameraIcon(
                          camera.status
                        )
                      }
                      eventHandlers={{
                        click: () => {

                          setSelectedCamera(
                            camera.id
                          );

                          setSelectedGrid(
                            camera.gridId
                          );

                          setSelectedObservation(
                            null
                          );

                        },
                      }}
                    >

                      <Tooltip>

                        <strong>
                          {camera.id}
                        </strong>

                        <br />

                        {camera.gridId}

                      </Tooltip>

                    </Marker>

                  )
                )}


              {/* ==================================================
                  TIGER OBSERVATIONS
              ================================================== */}

              {showObservations &&
                observations.map(
                  (observation) => (

                    <Marker
                      key={
                        observation.id
                      }
                      position={
                        observation.position
                      }
                      icon={
                        createTigerIcon()
                      }
                      eventHandlers={{
                        click: () => {

                          setSelectedObservation(
                            observation.id
                          );

                          setSelectedCamera(
                            observation.cameraId
                          );

                          setSelectedGrid(
                            observation.gridId
                          );

                        },
                      }}
                    >

                      <Tooltip>

                        {observation.tigerId}
                        {" · "}
                        {observation.gridId}

                      </Tooltip>

                    </Marker>

                  )
                )}


              {/* ==================================================
                  MOVEMENT
              ================================================== */}

              {showMovement &&
                movement.length > 1 && (

                  <Polyline
                    positions={
                      movement
                        .map(
                          (step) => {

                            const found =
                              tigerObservations.find(
                                (item) =>
                                  item.tigerId ===
                                    selectedTigerId &&
                                  item.gridId ===
                                    step.grid
                              );

                            return found
                              ?.position;

                          }
                        )
                        .filter(Boolean)
                    }
                    pathOptions={{
                      color: "#18181b",
                      weight: 3,
                      dashArray: "8 7",
                    }}
                  />

                )}


              {/* ==================================================
                  SETTLEMENTS
              ================================================== */}

              {settlements.map(
                (settlement) => (

                  <Marker
                    key={
                      settlement.id
                    }
                    position={
                      settlement.position
                    }
                    icon={
                      createSettlementIcon()
                    }
                  >

                    <Tooltip>

                      {settlement.name}

                    </Tooltip>

                  </Marker>

                )
              )}


              <MapControls />

            </MapContainer>


            {/* ==================================================
                MAP HEADER
            ================================================== */}

            <div className="pointer-events-none absolute left-5 top-5 z-[500]">

              <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-xl">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#e97813]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                    Pench Tiger Reserve
                  </span>

                </div>

                <p className="mt-1 text-[9px] text-zinc-400">
                  Forest monitoring workspace
                </p>

              </div>

            </div>


            {/* ==================================================
                LAYERS
            ================================================== */}

            <div className="absolute right-5 top-5 z-[500] w-[190px]">

              <div className="rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl backdrop-blur-xl">

                <div className="mb-2 flex items-center gap-2">

                  <Layers3
                    size={13}
                    className="text-zinc-400"
                  />

                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    Layers
                  </p>

                </div>


                <Layer
                  icon={Grid3X3}
                  label="Monitoring grid"
                  active={showGrid}
                  onClick={() =>
                    setShowGrid(
                      !showGrid
                    )
                  }
                />

                <Layer
                  icon={Camera}
                  label="Camera stations"
                  active={showCameras}
                  onClick={() =>
                    setShowCameras(
                      !showCameras
                    )
                  }
                />

                <Layer
                  icon={Target}
                  label="Tiger observations"
                  active={showObservations}
                  onClick={() =>
                    setShowObservations(
                      !showObservations
                    )
                  }
                />

                <Layer
                  icon={Crosshair}
                  label="Estimated range"
                  active={showRange}
                  onClick={() =>
                    setShowRange(
                      !showRange
                    )
                  }
                />

                <Layer
                  icon={Navigation}
                  label="Core / buffer"
                  active={showManagement}
                  onClick={() =>
                    setShowManagement(
                      !showManagement
                    )
                  }
                />

                <Layer
                  icon={Navigation}
                  label="Observation trail"
                  active={showMovement}
                  onClick={() =>
                    setShowMovement(
                      !showMovement
                    )
                  }
                />

              </div>

            </div>


            {/* ==================================================
                DATA NOTE
            ================================================== */}

            <div className="absolute bottom-5 left-5 z-[500] max-w-[300px]">

              <div className="rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur-xl">

                <p className="text-[9px] font-semibold text-zinc-600">
                  Spatial demo layer
                </p>

                <p className="mt-0.5 text-[8px] leading-4 text-zinc-400">
                  Grid and camera locations are simulated.
                  Replace them with authoritative GIS and
                  field data before deployment.
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              SIDE PANEL
          ================================================== */}

          <aside className="space-y-4">


            {/* TIGER */}

            <div className="rounded-[26px] border border-zinc-200 bg-white p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e97813]/10 text-lg">
                    🐅
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      {selectedTiger.id}
                    </p>

                    <p className="text-[9px] text-zinc-400">
                      {selectedTiger.sex}
                      {" · "}
                      {selectedTiger.age}
                    </p>

                  </div>

                </div>


                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                  {selectedTiger.status}
                </span>

              </div>


              <div className="mt-5 grid grid-cols-2 gap-2">

                <Metric
                  label="Estimated area"
                  value={
                    selectedTiger.currentArea
                  }
                />

                <Metric
                  label="Observations"
                  value={
                    selectedTiger.observations
                  }
                />

                <Metric
                  label="Cameras"
                  value={
                    selectedTiger.cameraStations
                  }
                />

                <Metric
                  label="Re-ID confidence"
                  value={
                    `${selectedTiger.confidence}%`
                  }
                />

              </div>

            </div>


            {/* WHAT CHANGED */}

            <div className="rounded-[26px] border border-amber-200 bg-[#fffaf4] p-5">

              <div className="flex items-center gap-2">

                <AlertTriangle
                  size={15}
                  className="text-amber-600"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">
                  What changed
                </p>

              </div>


              <div className="mt-4 space-y-3">

                <Change
                  title="Range shift"
                  value={
                    `Estimated centroid moved ${selectedRange.change}.`
                  }
                />

                <Change
                  title="Latest grid"
                  value={
                    `${selectedTiger.latestGrid} · ${selectedTiger.latestCamera}`
                  }
                />

                {selectedTiger.trend ===
                  "buffer_activity" && (

                  <Change
                    title="Buffer activity"
                    value="Recent observation occurred toward the buffer area."
                    warning
                  />

                )}

              </div>

            </div>


            {/* SELECTED CAMERA */}

            {selectedCameraData && (

              <CameraCard
                camera={
                  selectedCameraData
                }
              />

            )}


            {/* SELECTED GRID */}

            {selectedGrid && (

              <GridCard
                gridId={
                  selectedGrid
                }
              />

            )}


            {/* MOVEMENT */}

            <div className="rounded-[26px] border border-zinc-200 bg-white p-5">

              <div className="flex items-center gap-2">

                <Navigation
                  size={15}
                  className="text-zinc-400"
                />

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    Recent observations
                  </p>

                  <p className="mt-1 text-[9px] text-zinc-400">
                    Recorded sequence
                  </p>

                </div>

              </div>


              <div className="mt-5">

                {movement.map(
                  (item, index) => (

                    <div
                      key={`${item.grid}-${index}`}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >

                      {index <
                        movement.length - 1 && (

                        <div className="absolute left-[5px] top-3 h-full w-px bg-zinc-200" />

                      )}


                      <div className="relative z-10 mt-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e97813]" />


                      <div>

                        <p className="text-xs font-semibold">
                          {item.grid}
                        </p>

                        <p className="mt-0.5 text-[9px] text-zinc-400">
                          {item.camera}
                          {" · "}
                          {item.date}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* SETTLEMENT */}

            <div className="rounded-[26px] border border-zinc-200 bg-white p-5">

              <div className="flex items-center gap-2">

                <MapPin
                  size={15}
                  className="text-zinc-400"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                  Settlement proximity
                </p>

              </div>


              <div className="mt-4">

                <p className="text-sm font-semibold">
                  Khursapar
                </p>

                <p className="mt-1 text-[9px] text-zinc-400">
                  Nearby settlement context
                </p>

              </div>

            </div>


            {/* OVERLAP */}

            {overlap && (

              <div className="rounded-[26px] border border-zinc-200 bg-white p-5">

                <div className="flex items-center justify-between">

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    Territory overlap
                  </p>

                  <span className="text-[9px] font-semibold text-[#d86b0e]">
                    {overlap.trend}
                  </span>

                </div>


                <p className="mt-4 text-lg font-semibold">
                  {overlap.area}
                </p>

                <p className="mt-1 text-[9px] text-zinc-400">
                  Estimated overlap with{" "}
                  {overlap.with}
                </p>

              </div>

            )}


            {/* NOTE */}

            <div className="rounded-[26px] bg-zinc-100/70 p-5">

              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                Interpretation
              </p>

              <p className="mt-3 text-[10px] leading-5 text-zinc-500">

                Tiger positions represent recorded
                observations from camera stations.
                Estimated range is an analytical
                inference and is not a live GPS location.

              </p>

            </div>

          </aside>

        </div>

      </main>

    </div>

  );

}


// ============================================================
// ADAPTIVE FOREST GRID
// ============================================================
//
// This is the important part.
//
// The grid changes its visual resolution according to
// the map zoom level.
//
// Zoom 10:
//   large operational cells
//
// Zoom 11:
//   medium cells
//
// Zoom 12+:
//   finer monitoring cells
//
// The grid is generated from geographic coordinates,
// NOT from screen pixels.
//
// This means it remains geographically stable while
// the map is zoomed.
// ============================================================

function AdaptiveForestGrid({
  selectedGrid,
  onGridSelect,
}) {

  const [
    zoom,
    setZoom,
  ] = useState(11);


  useMapEvents({

    zoomend(event) {

      setZoom(
        event.target.getZoom()
      );

    },

  });


  const cells =
    useMemo(
      () =>
        generateAdaptiveGrid(
          zoom
        ),
      [zoom]
    );


  return (

    <>

      {cells.map(
        (cell) => {

          const isSelected =
            cell.id ===
            selectedGrid;


          return (

            <Polygon
              key={
                cell.id
              }
              positions={
                cell.bounds
              }
              pathOptions={{

                color:
                  isSelected
                    ? "#e97813"
                    : "#737373",

                weight:
                  isSelected
                    ? 2
                    : zoom >= 13
                      ? 0.7
                      : 1,

                opacity:
                  zoom >= 13
                    ? 0.32
                    : 0.48,

                fillColor:
                  isSelected
                    ? "#e97813"
                    : "#ffffff",

                fillOpacity:
                  isSelected
                    ? 0.13
                    : 0.015,

              }}

              eventHandlers={{
                click: () =>
                  onGridSelect(
                    cell.id
                  ),
              }}
            >

              {zoom >= 11 && (

                <Tooltip
                  direction="center"
                  className="grid-label"
                >

                  <span className="font-semibold">
                    {cell.id}
                  </span>

                </Tooltip>

              )}

            </Polygon>

          );

        }
      )}

    </>

  );

}


// ============================================================
// GRID GENERATOR
// ============================================================

function generateAdaptiveGrid(
  zoom
) {

  // Geographic Pench viewport.
  //
  // This is intentionally a prototype extent.
  // Replace with actual reserve GeoJSON later.

  const south =
    21.47;

  const north =
    21.81;

  const west =
    79.06;

  const east =
    79.42;


  // Cell sizes are geographic degrees.
  //
  // Higher zoom = smaller cells.
  //
  // This makes the grid feel like a GIS tool rather
  // than a fixed HTML overlay.

  let cellLat;
  let cellLng;

  if (zoom <= 10) {

    cellLat = 0.08;
    cellLng = 0.10;

  }

  else if (zoom === 11) {

    cellLat = 0.045;
    cellLng = 0.055;

  }

  else if (zoom === 12) {

    cellLat = 0.025;
    cellLng = 0.032;

  }

  else {

    cellLat = 0.014;
    cellLng = 0.018;

  }


  const cells = [];


  let row = 0;


  for (
    let lat = south;
    lat < north;
    lat += cellLat
  ) {

    let col = 0;


    for (
      let lng = west;
      lng < east;
      lng += cellLng
    ) {

      const bottom =
        lat;

      const top =
        Math.min(
          lat + cellLat,
          north
        );

      const left =
        lng;

      const right =
        Math.min(
          lng + cellLng,
          east
        );


      cells.push({

        id:
          createGridId(
            row,
            col,
            zoom
          ),

        bounds: [

          [bottom, left],

          [bottom, right],

          [top, right],

          [top, left],

        ],

      });


      col++;

    }


    row++;

  }


  return cells;

}


// ============================================================
// GRID ID
// ============================================================

function createGridId(
  row,
  col,
  zoom
) {

  const base =
    row * 100 +
    col +
    1;


  if (zoom <= 10) {

    return `G-${String(
      base
    ).padStart(3, "0")}`;

  }


  if (zoom === 11) {

    return `G-${String(
      base
    ).padStart(3, "0")}`;

  }


  if (zoom === 12) {

    return `G-${String(
      base
    ).padStart(3, "0")}`;

  }


  return `G-${String(
    base
  ).padStart(3, "0")}`;

}


// ============================================================
// MAP CONTROLS
// ============================================================

function MapControls() {

  const map =
    useMap();


  return (

    <div className="absolute bottom-5 right-5 z-[1000] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">

      <button
        onClick={() =>
          map.zoomIn()
        }
        className="flex h-9 w-9 items-center justify-center border-b border-zinc-100 text-zinc-500 hover:bg-zinc-50"
      >

        <ZoomIn
          size={15}
        />

      </button>


      <button
        onClick={() =>
          map.zoomOut()
        }
        className="flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-50"
      >

        <ZoomOut
          size={15}
        />

      </button>

    </div>

  );

}


// ============================================================
// LAYER
// ============================================================

function Layer({
  icon: Icon,
  label,
  active,
  onClick,
}) {

  return (

    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-2 py-2 hover:bg-zinc-50"
    >

      <div className="flex items-center gap-2">

        <Icon
          size={12}
          className={
            active
              ? "text-[#d86b0e]"
              : "text-zinc-300"
          }
        />

        <span className="text-[9px] font-medium text-zinc-600">
          {label}
        </span>

      </div>


      <div
        className={`h-3.5 w-6 rounded-full p-[2px] ${
          active
            ? "bg-[#e97813]"
            : "bg-zinc-200"
        }`}
      >

        <div
          className={`h-2.5 w-2.5 rounded-full bg-white transition ${
            active
              ? "translate-x-2.5"
              : ""
          }`}
        />

      </div>

    </button>

  );

}


// ============================================================
// METRIC
// ============================================================

function Metric({
  label,
  value,
}) {

  return (

    <div className="rounded-2xl bg-zinc-50 p-3">

      <p className="text-[9px] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>

    </div>

  );

}


// ============================================================
// CHANGE
// ============================================================

function Change({
  title,
  value,
  warning = false,
}) {

  return (

    <div className="flex gap-3">

      <div
        className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
          warning
            ? "bg-amber-600"
            : "bg-zinc-400"
        }`}
      />

      <div>

        <p className="text-xs font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-zinc-500">
          {value}
        </p>

      </div>

    </div>

  );

}


// ============================================================
// CAMERA CARD
// ============================================================

function CameraCard({
  camera,
}) {

  return (

    <div className="rounded-[26px] border border-zinc-200 bg-white p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900">

          <Camera
            size={15}
            className="text-white"
          />

        </div>

        <div>

          <p className="text-sm font-semibold">
            {camera.id}
          </p>

          <p className="text-[9px] text-zinc-400">
            {camera.gridId}
          </p>

        </div>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-2">

        <Metric
          label="Images"
          value={
            camera.images.toLocaleString()
          }
        />

        <Metric
          label="Tiger detections"
          value={
            camera.tigerDetections
          }
        />

      </div>


      <div className="mt-3 rounded-2xl bg-zinc-50 p-3">

        <p className="text-[9px] text-zinc-400">
          Latest detection
        </p>

        <p className="mt-1 text-xs font-semibold">
          {camera.lastDetection}
        </p>

      </div>

    </div>

  );

}


// ============================================================
// GRID CARD
// ============================================================
//
// Because the adaptive grid is generated visually,
// this card intentionally shows the selected grid as
// an operational reference rather than pretending the
// mock dataset has official survey statistics.
// ============================================================

function GridCard({
  gridId,
}) {

  const hash =
    hashString(
      gridId
    );


  const cameras =
    1 + (hash % 4);


  const observations =
    4 + (hash % 24);


  return (

    <div className="rounded-[26px] border border-[#e97813]/20 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
            Monitoring grid
          </p>

          <p className="mt-1 text-lg font-semibold">
            {gridId}
          </p>

        </div>

        <Grid3X3
          size={18}
          className="text-[#d86b0e]"
        />

      </div>


      <div className="mt-4 grid grid-cols-2 gap-2">

        <Metric
          label="Cameras"
          value={cameras}
        />

        <Metric
          label="Observations"
          value={observations}
        />

      </div>


      <p className="mt-4 text-[9px] leading-4 text-zinc-400">

        Grid statistics shown here are
        simulated until the actual survey-grid
        dataset is connected.

      </p>

    </div>

  );

}


// ============================================================
// STABLE HASH
// ============================================================

function hashString(
  string
) {

  let hash = 0;


  for (
    let i = 0;
    i < string.length;
    i++
  ) {

    hash =
      (
        hash * 31 +
        string.charCodeAt(i)
      ) | 0;

  }


  return Math.abs(
    hash
  );

}


// ============================================================
// LEAFLET ICONS
// ============================================================

function createCameraIcon(
  status
) {

  const background =
    status === "review"
      ? "#dc2626"
      : status === "offline"
        ? "#71717a"
        : "#18181b";


  return L.divIcon({

    className:
      "vandrishti-camera-marker",

    html: `

      <div
        style="
          width:28px;
          height:28px;

          border-radius:10px;

          background:${background};

          border:2px solid white;

          box-shadow:
            0 5px 15px
            rgba(0,0,0,.24);

          display:flex;

          align-items:center;

          justify-content:center;

          color:white;

          font-size:12px;
        "
      >
        ▣
      </div>

    `,

    iconSize: [
      28,
      28,
    ],

    iconAnchor: [
      14,
      14,
    ],

  });

}


function createTigerIcon() {

  return L.divIcon({

    className:
      "vandrishti-tiger-marker",

    html: `

      <div
        style="
          width:23px;
          height:23px;

          border-radius:50%;

          background:#e97813;

          border:3px solid white;

          box-shadow:
            0 4px 12px
            rgba(0,0,0,.24);

          display:flex;

          align-items:center;

          justify-content:center;

          font-size:11px;
        "
      >
        🐅
      </div>

    `,

    iconSize: [
      23,
      23,
    ],

    iconAnchor: [
      11.5,
      11.5,
    ],

  });

}


function createCentroidIcon() {

  return L.divIcon({

    className:
      "vandrishti-centroid-marker",

    html: `

      <div
        style="
          width:24px;
          height:24px;

          border-radius:50%;

          border:
            3px solid
            #e97813;

          background:white;

          box-shadow:
            0 3px 12px
            rgba(0,0,0,.18);
        "
      ></div>

    `,

    iconSize: [
      24,
      24,
    ],

    iconAnchor: [
      12,
      12,
    ],

  });

}


function createSettlementIcon() {

  return L.divIcon({

    className:
      "vandrishti-settlement-marker",

    html: `

      <div
        style="
          width:23px;
          height:23px;

          border-radius:8px;

          background:white;

          border:
            1px solid
            #d4d4d8;

          box-shadow:
            0 3px 10px
            rgba(0,0,0,.12);

          display:flex;

          align-items:center;

          justify-content:center;

          font-size:11px;
        "
      >
        🏠
      </div>

    `,

    iconSize: [
      23,
      23,
    ],

    iconAnchor: [
      11.5,
      11.5,
    ],

  });

}