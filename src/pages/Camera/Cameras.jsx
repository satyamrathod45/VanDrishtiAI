/*
|--------------------------------------------------------------------------
| VanDrishti - Camera Data Center
|--------------------------------------------------------------------------
|
| PURPOSE
| -------
| This page manages the offline camera-trap ecosystem.
|
| IMPORTANT:
| ----------
| VanDrishti does NOT assume that camera traps are continuously online.
|
| The actual workflow is:
|
| Camera Trap
|      ↓
| SD Card
|      ↓
| Forest Officer collects SD Card
|      ↓
| Camera Data Center
|      ↓
| Dataset Import
|      ↓
| Processing Job
|
|--------------------------------------------------------------------------
*/

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  Camera as CameraIcon,
  ChevronRight,
  Clock3,
  Database,
  HardDriveUpload,
  Search,
  UploadCloud,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  cameraService,
} from "../../services/cameraService";


export default function Cameras() {

  const navigate =
    useNavigate();


  const [cameras, setCameras] =
    useState([]);

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showImport, setShowImport] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD CAMERA DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const loadData =
      async () => {

        try {

          const [
            camerasResponse,
            jobsResponse,
          ] = await Promise.all([

            cameraService.getCameras(),

            cameraService.getProcessingJobs(),

          ]);


          if (
            camerasResponse.success
          ) {

            setCameras(
              camerasResponse.data
            );

          }


          if (
            jobsResponse.success
          ) {

            setJobs(
              jobsResponse.data
            );

          }

        } catch (error) {

          console.error(
            "Failed to load camera data:",
            error
          );

        } finally {

          setLoading(false);

        }

      };


    loadData();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | FILTER CAMERAS
  |--------------------------------------------------------------------------
  */

  const filteredCameras =
    useMemo(() => {

      return cameras.filter(
        (camera) => {

          const value =
            search.toLowerCase();

          return (
            camera.id
              .toLowerCase()
              .includes(value) ||
            camera.name
              .toLowerCase()
              .includes(value) ||
            camera.zone
              .toLowerCase()
              .includes(value)
          );

        }
      );

    }, [
      cameras,
      search,
    ]);


  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const deployedCount =
    cameras.filter(
      (camera) =>
        camera.status ===
        "deployed"
    ).length;


  const collectionDue =
    cameras.filter(
      (camera) =>
        camera.status ===
        "collection_due"
    ).length;


  const processingJobs =
    jobs.filter(
      (job) =>
        job.status ===
        "processing"
    ).length;


  const pendingImages =
    cameras.reduce(
      (total, camera) =>
        total +
        camera.pendingImages,
      0
    );


  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1450px]">


        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header>

          <p className="text-[10px] font-semibold tracking-[0.4px] text-[#e97813]">
            DATA INGESTION & FIELD INFRASTRUCTURE
          </p>

          <div className="mt-1 flex items-end justify-between">

            <div>

              <h1 className="text-[29px] font-semibold tracking-[-1.2px]">
                Camera Data Center
              </h1>

              <p className="mt-1 max-w-[620px] text-[11px] leading-5 text-[#999]">
                Manage deployed camera traps, import
                field collections and monitor image
                processing jobs.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowImport(true)
              }
              className="hidden items-center gap-2 rounded-2xl bg-[#171717] px-4 py-3 text-[10px] font-semibold text-white shadow-lg transition hover:bg-[#242424] sm:flex"
            >

              <UploadCloud
                size={15}
                className="text-[#ef7d16]"
              />

              Import Camera Data

            </button>

          </div>

        </header>


        {/* ========================================================= */}
        {/* SUMMARY */}
        {/* ========================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <SummaryCard
            icon={CameraIcon}
            label="Deployed Cameras"
            value={deployedCount}
          />

          <SummaryCard
            icon={Clock3}
            label="Collection Due"
            value={collectionDue}
            accent
          />

          <SummaryCard
            icon={Database}
            label="Processing Jobs"
            value={processingJobs}
          />

          <SummaryCard
            icon={Archive}
            label="Images Pending"
            value={pendingImages}
          />

        </section>


        {/* ========================================================= */}
        {/* IMPORT CTA */}
        {/* ========================================================= */}

        <section className="mt-3 rounded-[28px] bg-[#171717] p-6 text-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">

                  <HardDriveUpload
                    size={15}
                    className="text-[#ef7d16]"
                  />

                </div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-white/60">
                  Field Data Import
                </p>

              </div>


              <h2 className="mt-3 text-[20px] font-semibold tracking-[-0.6px]">
                Bring camera-trap data into VanDrishti
              </h2>

              <p className="mt-1 max-w-[600px] text-[10px] leading-5 text-white/45">
                Import a large ZIP dataset from an SD-card
                collection or upload individual images for
                smaller datasets and verification.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowImport(true)
              }
              className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#e97813] px-5 py-3 text-[10px] font-semibold text-white transition hover:bg-[#f18420]"
            >

              <UploadCloud
                size={15}
              />

              Start Import

            </button>

          </div>

        </section>


        {/* ========================================================= */}
        {/* SEARCH */}
        {/* ========================================================= */}

        <section className="mt-4 rounded-[24px] bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="flex h-11 items-center gap-3 rounded-[14px] bg-[#f7f7f5] px-4">

            <Search
              size={16}
              className="text-[#999]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search camera, zone or camera ID..."
              className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#aaa]"
            />

          </div>

        </section>


        {/* ========================================================= */}
        {/* CAMERA REGISTRY */}
        {/* ========================================================= */}

        <section className="mt-4">

          <div className="mb-3 flex items-center justify-between">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#999]">
                Camera Registry
              </p>

              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.5px]">
                Deployed camera traps
              </h2>

            </div>

            <p className="text-[9px] text-[#aaa]">
              {filteredCameras.length} cameras
            </p>

          </div>


          {loading ? (

            <CameraSkeleton />

          ) : (

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

              {filteredCameras.map(
                (camera) => (

                  <CameraCard
                    key={camera.id}
                    camera={camera}
                    onClick={() =>
                      navigate(
                        `/cameras/${camera.id}`
                      )
                    }
                  />

                )
              )}

            </div>

          )}

        </section>


        {/* ========================================================= */}
        {/* PROCESSING JOBS */}
        {/* ========================================================= */}

        <section className="mt-8">

          <div className="mb-3">

            <p className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#999]">
              Processing Pipeline
            </p>

            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.5px]">
              Recent processing jobs
            </h2>

          </div>


          <div className="space-y-2">

            {jobs.map(
              (job) => (

                <ProcessingJob
                  key={job.id}
                  job={job}
                />

              )
            )}

          </div>

        </section>


      </div>


      {/* ========================================================= */}
      {/* MOBILE IMPORT BUTTON */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() =>
          setShowImport(true)
        }
        className="fixed bottom-[95px] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] shadow-xl sm:hidden"
      >

        <UploadCloud
          size={18}
          className="text-[#ef7d16]"
        />

      </button>


      {/* ========================================================= */}
      {/* IMPORT MODAL */}
      {/* ========================================================= */}

      {showImport && (

        <ImportModal
          cameras={cameras}
          onClose={() =>
            setShowImport(false)
          }
        />

      )}

    </main>
  );
}


// ============================================================================
// SUMMARY CARD
// ============================================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent = false,
}) {

  return (

    <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

      <div className="flex items-center justify-between">

        <p className="text-[9px] font-medium uppercase tracking-[0.5px] text-[#999]">
          {label}
        </p>

        <Icon
          size={14}
          className={
            accent
              ? "text-[#e97813]"
              : "text-[#aaa]"
          }
        />

      </div>

      <p className="mt-2 text-[27px] font-semibold tracking-[-1.1px]">
        {value}
      </p>

    </div>

  );
}


// ============================================================================
// CAMERA CARD
// ============================================================================

function CameraCard({
  camera,
  onClick,
}) {

  const collectionDue =
    camera.status ===
    "collection_due";


  return (

    <button
      type="button"
      onClick={onClick}
      className="group rounded-[28px] bg-white p-5 text-left shadow-[0_8px_35px_rgba(0,0,0,0.035)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)]"
    >

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f3] transition group-hover:bg-[#fff1e4]">

            <CameraIcon
              size={17}
              className="text-[#666] transition group-hover:text-[#e97813]"
            />

          </div>


          <div>

            <p className="text-[13px] font-semibold">
              {camera.id}
            </p>

            <p className="mt-0.5 text-[9px] text-[#999]">
              {camera.name}
            </p>

          </div>

        </div>


        <div
          className={`rounded-full px-3 py-1.5 text-[8px] font-semibold ${
            collectionDue
              ? "bg-[#fff1e4] text-[#c96b1d]"
              : "bg-[#edf7ef] text-[#579365]"
          }`}
        >

          {collectionDue
            ? "Collection Due"
            : "Deployed"}

        </div>

      </div>


      <div className="mt-5 rounded-2xl bg-[#f8f8f6] p-4">

        <p className="text-[8px] uppercase tracking-[0.4px] text-[#aaa]">
          Location
        </p>

        <p className="mt-1 text-[10px] font-semibold text-[#555]">
          {camera.location}
        </p>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-y-4">

        <DataPoint
          label="Last collection"
          value={formatDate(
            camera.lastCollectionDate
          )}
        />

        <DataPoint
          label="Latest images"
          value={camera.latestImageCount.toLocaleString()}
        />

        <DataPoint
          label="Processed"
          value={camera.processedImages.toLocaleString()}
        />

        <DataPoint
          label="Pending"
          value={camera.pendingImages.toLocaleString()}
          accent={
            camera.pendingImages >
            0
          }
        />

      </div>


      <div className="mt-5 flex items-center justify-between border-t border-[#eeeeec] pt-4">

        <p className="text-[9px] text-[#999]">
          {camera.totalCollections} collections
        </p>

        <div className="flex items-center gap-1 text-[9px] font-semibold text-[#777] transition group-hover:text-[#e97813]">

          View details

          <ChevronRight
            size={13}
          />

        </div>

      </div>

    </button>

  );
}


// ============================================================================
// DATA POINT
// ============================================================================

function DataPoint({
  label,
  value,
  accent = false,
}) {

  return (

    <div>

      <p className="text-[8px] uppercase tracking-[0.4px] text-[#aaa]">
        {label}
      </p>

      <p
        className={`mt-1 text-[10px] font-semibold ${
          accent
            ? "text-[#e97813]"
            : "text-[#555]"
        }`}
      >
        {value}
      </p>

    </div>

  );
}


// ============================================================================
// PROCESSING JOB
// ============================================================================

function ProcessingJob({
  job,
}) {

  const isProcessing =
    job.status ===
    "processing";


  return (

    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_28px_rgba(0,0,0,0.03)]">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

        <div className="flex flex-1 items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f3]">

            <Database
              size={16}
              className={
                isProcessing
                  ? "text-[#e97813]"
                  : "text-[#777]"
              }
            />

          </div>


          <div>

            <p className="text-[11px] font-semibold">
              {job.id}
            </p>

            <p className="mt-0.5 text-[8px] text-[#999]">
              {job.cameraId}
              {" · "}
              {job.totalImages.toLocaleString()}
              {" images"}
            </p>

          </div>

        </div>


        <div className="w-full sm:w-[300px]">

          <div className="flex items-center justify-between">

            <p className="text-[8px] text-[#999]">
              {job.currentStage}
            </p>

            <p className="text-[9px] font-semibold">
              {job.progress}%
            </p>

          </div>


          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeeec]">

            <div
              className="h-full rounded-full bg-[#e97813] transition-all"
              style={{
                width: `${job.progress}%`,
              }}
            />

          </div>

        </div>


        <div
          className={`rounded-full px-3 py-1.5 text-[8px] font-semibold ${
            isProcessing
              ? "bg-[#fff1e4] text-[#c96b1d]"
              : "bg-[#edf7ef] text-[#579365]"
          }`}
        >

          {isProcessing
            ? "Processing"
            : "Completed"}

        </div>

      </div>

    </div>

  );
}


// ============================================================================
// IMPORT MODAL
// ============================================================================

function ImportModal({
  cameras,
  onClose,
}) {

  const [selectedCamera, setSelectedCamera] =
    useState(
      cameras[0]?.id || ""
    );

  const [sourceType, setSourceType] =
    useState("zip");

  const [file, setFile] =
    useState(null);

  const [collectionDate, setCollectionDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [datasetName, setDatasetName] =
    useState("");

  const [dragging, setDragging] =
    useState(false);


  const handleFile =
    (selectedFile) => {

      if (!selectedFile) {
        return;
      }

      setFile(
        selectedFile
      );

    };


  const handleDrop =
    (event) => {

      event.preventDefault();

      setDragging(false);

      const droppedFile =
        event.dataTransfer
          .files?.[0];

      handleFile(
        droppedFile
      );

    };


  const handleSubmit =
    async (event) => {

      event.preventDefault();


      /*
      |--------------------------------------------------------------------------
      | IMPORTANT BACKEND NOTE
      |--------------------------------------------------------------------------
      |
      | This frontend currently only demonstrates the upload workflow.
      |
      | A production implementation should:
      |
      | 1. Create an import session.
      | 2. Receive a signed/resumable upload URL.
      | 3. Upload the large file directly to object storage.
      | 4. Notify backend when upload is complete.
      | 5. Backend creates processing job.
      |
      */

      console.log(
        "Mock import:",
        {
          selectedCamera,
          sourceType,
          file,
          collectionDate,
          datasetName,
        }
      );


      alert(
        "Mock import session created. Large-file upload will be connected to the backend later."
      );

      onClose();

    };


  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-[30px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)]">

        {/* ===================================================== */}
        {/* MODAL HEADER */}
        {/* ===================================================== */}

        <div className="flex items-start justify-between border-b border-[#eeeeec] p-6">

          <div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#e97813]">
              DATA INGESTION
            </p>

            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.7px]">
              Import Camera Data
            </h2>

            <p className="mt-1 text-[10px] text-[#999]">
              Create a dataset from a field SD-card collection.
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5f5f3] text-[#777] hover:text-[#222]"
          >
            ×
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* ================================================= */}
          {/* SOURCE TYPE */}
          {/* ================================================= */}

          <div>

            <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
              Import method
            </label>


            <div className="mt-2 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setSourceType("zip")
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  sourceType ===
                  "zip"
                    ? "border-[#e97813] bg-[#fff8f1]"
                    : "border-[#eeeeec] bg-white"
                }`}
              >

                <Archive
                  size={17}
                  className={
                    sourceType ===
                    "zip"
                      ? "text-[#e97813]"
                      : "text-[#777]"
                  }
                />

                <p className="mt-3 text-[10px] font-semibold">
                  ZIP archive
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#999]">
                  Recommended for large camera-trap datasets.
                </p>

              </button>


              <button
                type="button"
                onClick={() =>
                  setSourceType(
                    "individual"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  sourceType ===
                  "individual"
                    ? "border-[#e97813] bg-[#fff8f1]"
                    : "border-[#eeeeec] bg-white"
                }`}
              >

                <CameraIcon
                  size={17}
                  className={
                    sourceType ===
                    "individual"
                      ? "text-[#e97813]"
                      : "text-[#777]"
                  }
                />

                <p className="mt-3 text-[10px] font-semibold">
                  Individual images
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#999]">
                  Useful for small batches or manual verification.
                </p>

              </button>

            </div>

          </div>


          {/* ================================================= */}
          {/* CAMERA */}
          {/* ================================================= */}

          <div>

            <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
              Camera trap
            </label>

            <select
              value={selectedCamera}
              onChange={(event) =>
                setSelectedCamera(
                  event.target.value
                )
              }
              className="mt-2 h-11 w-full rounded-2xl bg-[#f7f7f5] px-4 text-[10px] outline-none"
            >

              {cameras.map(
                (camera) => (

                  <option
                    key={camera.id}
                    value={camera.id}
                  >
                    {camera.id}
                    {" · "}
                    {camera.name}
                    {" · "}
                    {camera.zone}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ================================================= */}
          {/* COLLECTION DATE */}
          {/* ================================================= */}

          <div className="grid gap-3 sm:grid-cols-2">

            <div>

              <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
                Collection date
              </label>

              <input
                type="date"
                value={collectionDate}
                onChange={(event) =>
                  setCollectionDate(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-2xl bg-[#f7f7f5] px-4 text-[10px] outline-none"
              />

            </div>


            <div>

              <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
                Dataset label
              </label>

              <input
                type="text"
                value={datasetName}
                onChange={(event) =>
                  setDatasetName(
                    event.target.value
                  )
                }
                placeholder="Moharli_CAM018_Aug15"
                className="mt-2 h-11 w-full rounded-2xl bg-[#f7f7f5] px-4 text-[10px] outline-none placeholder:text-[#aaa]"
              />

            </div>

          </div>


          {/* ================================================= */}
          {/* FILE DROPZONE */}
          {/* ================================================= */}

          <div>

            <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
              Dataset
            </label>


            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() =>
                setDragging(false)
              }
              onDrop={
                handleDrop
              }
              className={`mt-2 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-6 text-center transition ${
                dragging
                  ? "border-[#e97813] bg-[#fff8f1]"
                  : "border-[#dededb] bg-[#fafaf8]"
              }`}
            >

              <input
                type="file"
                className="hidden"
                accept={
                  sourceType ===
                  "zip"
                    ? ".zip"
                    : ".jpg,.jpeg,.png"
                }
                onChange={(event) =>
                  handleFile(
                    event.target.files?.[0]
                  )
                }
              />


              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">

                <UploadCloud
                  size={20}
                  className="text-[#e97813]"
                />

              </div>


              {file ? (

                <>

                  <p className="mt-4 text-[11px] font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-[8px] text-[#999]">
                    {formatBytes(
                      file.size
                    )}
                  </p>

                </>

              ) : (

                <>

                  <p className="mt-4 text-[11px] font-semibold">
                    Drop your dataset here
                  </p>

                  <p className="mt-1 text-[9px] text-[#999]">
                    or click to browse files
                  </p>

                  <p className="mt-3 text-[8px] text-[#aaa]">
                    {sourceType ===
                    "zip"
                      ? "ZIP archives recommended for large datasets"
                      : "JPG, JPEG or PNG images"}

                  </p>

                </>

              )}

            </label>

          </div>


          {/* ================================================= */}
          {/* LARGE DATASET NOTE */}
          {/* ================================================= */}

          <div className="rounded-2xl bg-[#f7f7f5] p-4">

            <div className="flex gap-3">

              <Database
                size={15}
                className="mt-0.5 shrink-0 text-[#e97813]"
              />

              <div>

                <p className="text-[9px] font-semibold">
                  Large dataset processing
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#999]">
                  For 100,000+ images, VanDrishti will
                  process the dataset asynchronously.
                  You can leave this page while the
                  processing job continues.
                </p>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="flex justify-end gap-2 border-t border-[#eeeeec] pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3 text-[10px] font-semibold text-[#777] hover:bg-[#f5f5f3]"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={!file}
              className="rounded-2xl bg-[#171717] px-5 py-3 text-[10px] font-semibold text-white transition hover:bg-[#272727] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create Import Job
            </button>

          </div>

        </form>

      </div>

    </div>

  );
}


// ============================================================================
// SKELETON
// ============================================================================

function CameraSkeleton() {

  return (

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

      {[1, 2, 3, 4, 5, 6].map(
        (item) => (

          <div
            key={item}
            className="h-[310px] animate-pulse rounded-[28px] bg-white"
          />

        )
      )}

    </div>

  );

}


// ============================================================================
// DATE FORMATTER
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
// FILE SIZE FORMATTER
// ============================================================================

function formatBytes(
  bytes
) {

  if (!bytes) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

  return (
    `${(
      bytes /
      Math.pow(
        1024,
        index
      )
    ).toFixed(1)} ${units[index]}`
  );

}