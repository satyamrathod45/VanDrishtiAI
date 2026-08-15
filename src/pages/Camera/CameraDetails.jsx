/*
|--------------------------------------------------------------------------
| VanDrishti - Camera Details
|--------------------------------------------------------------------------
|
| PURPOSE
| -------
| Shows the complete operational and data history of one camera trap.
|
| IMPORTANT:
| ----------
| This is NOT a live CCTV page.
|
| It represents:
|
| Camera
|   ↓
| Collections
|   ↓
| Datasets
|   ↓
| Processing
|   ↓
| Captures
|   ↓
| Tiger intelligence
|
|--------------------------------------------------------------------------
*/

import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Archive,
  ArrowLeft,
  Camera as CameraIcon,
  CheckCircle2,
  Clock3,
  Database,
  MapPin,
  ScanLine,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  cameraService,
} from "../../services/cameraService";


export default function CameraDetails() {

  const {
    cameraId,
  } = useParams();

  const navigate =
    useNavigate();


  const [camera, setCamera] =
    useState(null);

  const [collections, setCollections] =
    useState([]);

  const [captures, setCaptures] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /*
  |--------------------------------------------------------------------------
  | LOAD CAMERA DETAILS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const loadData =
      async () => {

        try {

          const [
            cameraResponse,
            collectionResponse,
            captureResponse,
          ] = await Promise.all([

            cameraService.getCamera(
              cameraId
            ),

            cameraService.getCollections(
              cameraId
            ),

            cameraService.getCaptures(
              cameraId
            ),

          ]);


          if (
            cameraResponse.success
          ) {

            setCamera(
              cameraResponse.data
            );

          }


          if (
            collectionResponse.success
          ) {

            setCollections(
              collectionResponse.data
            );

          }


          if (
            captureResponse.success
          ) {

            setCaptures(
              captureResponse.data
            );

          }

        } catch (error) {

          console.error(
            "Failed to load camera details:",
            error
          );

        } finally {

          setLoading(false);

        }

      };


    loadData();

  }, [cameraId]);


  if (loading) {
    return <CameraDetailsSkeleton />;
  }


  if (!camera) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">

        <div className="text-center">

          <p className="text-[15px] font-semibold">
            Camera not found
          </p>

          <button
            onClick={() =>
              navigate(
                "/cameras"
              )
            }
            className="mt-3 text-[10px] font-semibold text-[#e97813]"
          >
            Back to Cameras
          </button>

        </div>

      </main>

    );

  }


  return (

    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1200px]">


        {/* ===================================================== */}
        {/* BACK */}
        {/* ===================================================== */}

        <button
          onClick={() =>
            navigate(
              "/cameras"
            )
          }
          className="mb-5 flex items-center gap-2 text-[10px] font-semibold text-[#777] hover:text-[#e97813]"
        >

          <ArrowLeft
            size={14}
          />

          Back to Cameras

        </button>


        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">


            {/* CAMERA VISUAL */}

            <div className="relative min-h-[300px] bg-[#e5e4df]">

              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#deddd7] via-[#f1f0eb] to-[#d1d0ca]">

                <CameraIcon
                  size={85}
                  strokeWidth={1}
                  className="text-[#171717]/10"
                />

              </div>


              <div className="absolute left-5 top-5 rounded-full bg-[#171717]/90 px-4 py-2 text-[9px] font-semibold text-white backdrop-blur-md">
                {camera.id}
              </div>


              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 backdrop-blur-xl">

                <span className="h-2 w-2 rounded-full bg-[#63a66a]" />

                <span className="text-[9px] font-semibold text-[#555]">
                  {camera.status ===
                  "deployed"
                    ? "Deployed"
                    : "Collection Due"}
                </span>

              </div>

            </div>


            {/* INFORMATION */}

            <div className="p-7 sm:p-9">

              <p className="text-[10px] font-semibold tracking-[0.4px] text-[#e97813]">
                CAMERA TRAP
              </p>

              <h1 className="mt-1 text-[30px] font-semibold tracking-[-1.2px]">
                {camera.name}
              </h1>

              <p className="mt-1 text-[10px] text-[#999]">
                {camera.id}
                {" · "}
                {camera.model}
              </p>


              <div className="mt-6 grid grid-cols-2 gap-5">

                <Info
                  icon={MapPin}
                  label="Location"
                  value={
                    camera.location
                  }
                />

                <Info
                  icon={Clock3}
                  label="Last collection"
                  value={formatDate(
                    camera.lastCollectionDate
                  )}
                />

                <Info
                  icon={Archive}
                  label="Collections"
                  value={
                    camera.totalCollections
                  }
                />

                <Info
                  icon={Database}
                  label="Total images"
                  value={
                    camera.totalImagesCaptured.toLocaleString()
                  }
                />

              </div>


              <p className="mt-6 text-[10px] leading-5 text-[#999]">
                {camera.notes}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================== */}
        {/* STATISTICS */}
        {/* ===================================================== */}

        <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            label="Latest images"
            value={
              camera.latestImageCount.toLocaleString()
            }
          />

          <StatCard
            label="Processed"
            value={
              camera.processedImages.toLocaleString()
            }
          />

          <StatCard
            label="Tiger detections"
            value={
              camera.tigerDetections
            }
          />

          <StatCard
            label="Re-ID matches"
            value={
              camera.reidMatches
            }
            accent
          />

        </section>


        {/* ===================================================== */}
        {/* CURRENT DATASET */}
        {/* ===================================================== */}

        <section className="mt-3 rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#999]">
                DATA PIPELINE
              </p>

              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.6px]">
                Latest collection
              </h2>

            </div>

            <Database
              size={17}
              className="text-[#e97813]"
            />

          </div>


          {collections.length >
          0 ? (

            <CollectionCard
              collection={
                collections[0]
              }
            />

          ) : (

            <p className="mt-5 text-[10px] text-[#999]">
              No collection data available.
            </p>

          )}

        </section>


        {/* ===================================================== */}
        {/* COLLECTION HISTORY */}
        {/* ===================================================== */}

        <section className="mt-3 rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#999]">
              FIELD COLLECTIONS
            </p>

            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.6px]">
              Collection history
            </h2>

          </div>


          <div className="mt-5 space-y-2">

            {collections.map(
              (collection) => (

                <CollectionRow
                  key={
                    collection.id
                  }
                  collection={
                    collection
                  }
                />

              )
            )}

          </div>

        </section>


        {/* ===================================================== */}
        {/* RECENT CAPTURES */}
        {/* ===================================================== */}

        <section className="mt-3 rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#999]">
                PROCESSED OBSERVATIONS
              </p>

              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.6px]">
                Recent captures
              </h2>

            </div>

            <ScanLine
              size={17}
              className="text-[#888]"
            />

          </div>


          <div className="mt-5 space-y-2">

            {captures.map(
              (capture) => (

                <CaptureRow
                  key={
                    capture.id
                  }
                  capture={
                    capture
                  }
                />

              )
            )}

          </div>

        </section>

      </div>

    </main>

  );

}


// ============================================================================
// INFO
// ============================================================================

function Info({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="flex items-center gap-2.5">

      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5f5f3]">

        <Icon
          size={14}
          className="text-[#777]"
        />

      </div>

      <div>

        <p className="text-[8px] uppercase tracking-[0.4px] text-[#aaa]">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] font-semibold text-[#555]">
          {value}
        </p>

      </div>

    </div>

  );

}


// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({
  label,
  value,
  accent = false,
}) {

  return (

    <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

      <p className="text-[8px] uppercase tracking-[0.5px] text-[#aaa]">
        {label}
      </p>

      <p
        className={`mt-2 text-[24px] font-semibold tracking-[-1px] ${
          accent
            ? "text-[#e97813]"
            : ""
        }`}
      >
        {value}
      </p>

    </div>

  );

}


// ============================================================================
// COLLECTION CARD
// ============================================================================

function CollectionCard({
  collection,
}) {

  const processed =
    collection.validImages;


  const total =
    collection.imageCount;


  const percentage =
    total
      ? (
          (processed /
            total) *
          100
        ).toFixed(1)
      : 0;


  return (

    <div className="mt-5 rounded-[22px] bg-[#f8f8f6] p-5">

      <div className="flex flex-col justify-between gap-4 sm:flex-row">

        <div>

          <p className="text-[12px] font-semibold">
            {collection.datasetName}
          </p>

          <p className="mt-1 text-[9px] text-[#999]">
            {collection.fileName}
          </p>

        </div>


        <div className="rounded-full bg-[#edf7ef] px-3 py-1.5 text-[8px] font-semibold text-[#579365]">
          {collection.processingStatus}
        </div>

      </div>


      <div className="mt-5">

        <div className="flex items-center justify-between">

          <p className="text-[9px] text-[#999]">
            Dataset validation
          </p>

          <p className="text-[9px] font-semibold">
            {percentage}%
          </p>

        </div>


        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7e7e4]">

          <div
            className="h-full rounded-full bg-[#e97813]"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>


      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">

        <MiniStat
          label="Images"
          value={
            collection.imageCount
          }
        />

        <MiniStat
          label="Valid"
          value={
            collection.validImages
          }
        />

        <MiniStat
          label="Duplicates"
          value={
            collection.duplicateImages
          }
        />

        <MiniStat
          label="Invalid"
          value={
            collection.invalidImages
          }
        />

      </div>

    </div>

  );

}


// ============================================================================
// COLLECTION ROW
// ============================================================================

function CollectionRow({
  collection,
}) {

  return (

    <div className="flex flex-col gap-3 rounded-2xl bg-[#fafaf8] p-4 sm:flex-row sm:items-center">

      <div className="flex flex-1 items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">

          <Archive
            size={14}
            className="text-[#777]"
          />

        </div>

        <div>

          <p className="text-[10px] font-semibold">
            {collection.datasetName}
          </p>

          <p className="mt-0.5 text-[8px] text-[#aaa]">
            {formatDate(
              collection.collectionDate
            )}
            {" · "}
            {collection.imageCount.toLocaleString()}
            {" images"}
          </p>

        </div>

      </div>


      <div className="flex items-center gap-4">

        <p className="text-[8px] text-[#999]">
          {collection.sourceType.toUpperCase()}
        </p>

        <span className="rounded-full bg-[#edf7ef] px-3 py-1.5 text-[8px] font-semibold text-[#579365]">
          {collection.processingStatus}
        </span>

      </div>

    </div>

  );

}


// ============================================================================
// CAPTURE ROW
// ============================================================================

function CaptureRow({
  capture,
}) {

  const isUnknown =
    capture.detectionType ===
    "unknown_tiger";


  return (

    <div className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#fafaf8]">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#171717]">

        <CameraIcon
          size={14}
          className="text-[#ef7d16]"
        />

      </div>


      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-semibold">

          {isUnknown
            ? "Unknown tiger detection"
            : capture.tigerId}

        </p>

        <p className="mt-0.5 text-[8px] text-[#aaa]">
          {capture.imageId}
          {" · "}
          {formatDate(
            capture.capturedAt
          )}
        </p>

      </div>


      <div className="text-right">

        <p className="text-[10px] font-semibold">
          {capture.confidence}%
        </p>

        <p
          className={`text-[8px] ${
            isUnknown
              ? "text-[#e97813]"
              : "text-[#63a66a]"
          }`}
        >
          {capture.reviewStatus}
        </p>

      </div>

    </div>

  );

}


// ============================================================================
// MINI STAT
// ============================================================================

function MiniStat({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-[8px] uppercase tracking-[0.4px] text-[#aaa]">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold">
        {value.toLocaleString()}
      </p>

    </div>

  );

}


// ============================================================================
// DATE FORMAT
// ============================================================================

function formatDate(
  value
) {

  if (!value) {
    return "Never";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


// ============================================================================
// SKELETON
// ============================================================================

function CameraDetailsSkeleton() {

  return (

    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1200px]">

        <div className="mb-5 h-4 w-28 animate-pulse rounded bg-white" />

        <div className="overflow-hidden rounded-[30px] bg-white">

          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">

            <div className="h-[300px] animate-pulse bg-[#eeeeec]" />

            <div className="space-y-6 p-9">

              <div className="h-6 w-40 animate-pulse rounded bg-[#eeeeec]" />

              <div className="h-3 w-32 animate-pulse rounded bg-[#eeeeec]" />

              <div className="grid grid-cols-2 gap-5">

                {[1, 2, 3, 4].map(
                  (item) => (

                    <div
                      key={item}
                      className="h-10 animate-pulse rounded bg-[#eeeeec]"
                    />

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

}