import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  CircleDot,
  Cpu,
  Crop,
  Download,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  PackageCheck,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { overviewService } from "../../services/overviewService";
import { useAuth } from "../../context/AuthContext";
import BottomNavigation from "../../components/navigation/BottomNavigation";
import { tigerDetector } from "../../services/tigerDetector";




// ============================================================
// VanDrishti Overview
// ============================================================
//
// IMPORTANT FOR BACKEND DEVELOPERS
//
// This page does NOT communicate directly with mockApi.
//
// Frontend flow:
//
// Overview.jsx
//      ↓
// overviewService
//      ↓
// api.js
//      ↓
// mockApi.js
//      ↓
// Real Backend API
//
// When the real backend is ready, the UI should not need to
// change. Only the service/API layer should change.
//
// ============================================================


export default function Overview() {
  const { officer } = useAuth();

  // ----------------------------------------------------------
  // API DATA
  // ----------------------------------------------------------

  const [overview, setOverview] = useState(null);

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetectionModal, setShowDetectionModal] = useState(false);

  // ==========================================================
  // LOAD OVERVIEW
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await overviewService.getOverview();

        if (!mounted) return;

        if (response?.success) {
          setOverview(response.data);
        } else {
          setError(
            "Unable to load VanDrishti overview."
          );
        }
      } catch (err) {
        console.error(
          "Failed to load VanDrishti overview:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load VanDrishti overview."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return <OverviewSkeleton />;
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error || !overview) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-[0_15px_50px_rgba(0,0,0,0.06)]">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e6]">
            <AlertTriangle
              size={22}
              className="text-[#e97813]"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[#202020]">
            Something went wrong
          </h2>

          <p className="mt-2 text-xs leading-5 text-[#999]">
            {error ||
              "VanDrishti overview data is unavailable."}
          </p>

        </div>
      </main>
    );
  }

  // ==========================================================
  // SAFE DATA EXTRACTION
  // ==========================================================
  //
  // IMPORTANT:
  // Every array gets a fallback [].
  //
  // This prevents errors such as:
  //
  // Cannot read properties of undefined (reading 'map')
  //
  // which can happen when backend data is incomplete.
  //
  // ==========================================================

  const statistics =
    overview.statistics || {};

  const activity =
    Array.isArray(overview.activity)
      ? overview.activity
      : [];

  const recentSightings =
    Array.isArray(overview.recentSightings)
      ? overview.recentSightings
      : [];

  const zones =
    Array.isArray(overview.zones)
      ? overview.zones
      : [];

  const intelligence =
    overview.intelligence || {};

  const system =
    overview.system || {};

  // ==========================================================
  // SAFE STATISTICS
  // ==========================================================

  const totalTigers =
    Number(statistics.totalTigers || 0);

  const identifiedTigers =
    Number(statistics.identifiedTigers || 0);

  const unknownTigers =
    Number(statistics.unknownTigers || 0);

  const totalSightings =
    Number(statistics.totalSightings || 0);

  const todaysSightings =
    Number(statistics.todaysSightings || 0);

  const totalCameras =
    Number(statistics.totalCameras || 0);

  const deployedCameras =
    Number(statistics.deployedCameras || 0);

  const collectionDue =
    Number(statistics.collectionDue || 0);

  const pendingProcessingImages =
    Number(
      statistics.pendingProcessingImages || 0
    );

  const pendingReviews =
    Number(
      statistics.pendingReviews ||
      intelligence.pendingReviews ||
      0
    );

  const activeAlerts =
    Number(
      statistics.activeAlerts ||
      intelligence.alerts ||
      0
    );

  // ==========================================================
  // CAMERA COLLECTION STATUS
  // ==========================================================

  const deployedPercentage =
    totalCameras > 0
      ? Math.round(
        (deployedCameras /
          totalCameras) *
        100
      )
      : 0;

  // ==========================================================
  // OFFICER DETAILS
  // ==========================================================

  const officerName =
    officer?.name ||
    officer?.fullName ||
    officer?.officerName ||
    "Arjun Sharma";

  const officerDesignation =
    officer?.designation ||
    "Range Forest Officer";

  // ==========================================================
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] px-4 pb-32 pt-6 text-[#202020] sm:px-6 lg:px-8">

      {/* ================================================== */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================== */}

      <div className="pointer-events-none fixed -left-52 -top-52 h-[550px] w-[550px] rounded-full bg-[#e97813]/[0.025] blur-3xl" />

      <div className="pointer-events-none fixed -bottom-60 -right-52 h-[650px] w-[650px] rounded-full bg-[#171717]/[0.02] blur-3xl" />

      <div className="relative mx-auto max-w-[1450px]">

        {/* ================================================== */}
        {/* BRANDING & USER HEADER */}
        {/* ================================================== */}

        <header className="flex items-start justify-between">
          <div>
            {/* Branding badge */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171717] shadow-sm">
                <ScanLine
                  size={17}
                  className="text-[#ef7d16]"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[1.5px] text-[#e97813]">
                  VANDRISHTI
                </p>

                <p className="text-[9px] text-[#999]">
                  Tiger Intelligence System
                </p>
              </div>
            </div>

            {/* Greeting */}
            <div className="mt-4">
              <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-1.3px] text-[#171717]">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[#e97813] via-[#ef7d16] to-[#f59e0b] bg-clip-text text-transparent font-bold">
                  {officerName}
                </span>
              </h1>
            </div>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2.5 rounded-full bg-white px-3.5 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#eeeeec]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e97813]/10 text-[#e97813]">
              <UserRound size={15} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[10px] font-bold leading-tight text-[#171717]">
                {officerName}
              </p>
              <p className="text-[8px] text-[#999]">
                {officerDesignation}
              </p>
            </div>
          </div>
        </header>

        {/* ================================================== */}
        {/* CAMERA TRAP INGESTION ACTION BANNER */}
        {/* ================================================== */}
        <section className="mt-6 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#171717] via-[#222] to-[#171717] p-6 text-white shadow-xl relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#e97813]/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-[8px] font-bold uppercase tracking-wider text-white/90">
                  <FolderOpen size={12} className="text-[#ef7d16]" />
                  Field Data Ingestion
                </span>
              </div>
              <h2 className="text-[20px] font-bold tracking-tight text-white sm:text-[22px]">
                Camera Trap Batch Processing
              </h2>
              <p className="max-w-[620px] text-[10px] text-white/60 leading-relaxed">
                Ingest SD card images from field camera traps to filter blanks, extract tiger sightings, and prepare high-resolution flank profiles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDetectionModal(true)}
              className="flex shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-[#e97813] px-6 py-3.5 text-[11px] font-bold text-white shadow-lg shadow-[#e97813]/30 transition hover:bg-[#f18420] active:scale-[0.98]"
            >
              <FolderOpen size={17} />
              <span>Upload Folder</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* FIELD OVERVIEW & STAT SNAPSHOT */}
        {/* ================================================== */}

        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-[22px] font-semibold tracking-[-0.8px] sm:text-[24px]">
              Field overview
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            <StatCard
              icon={Eye}
              label="Tiger sightings"
              value={todaysSightings}
              subtext="detected today"
              accent
            />

            <StatCard
              icon={UserRound}
              label="Identified tigers"
              value={identifiedTigers}
              subtext={`${totalTigers} total registered`}
            />

            <StatCard
              icon={Camera}
              label="Camera traps"
              value={totalCameras}
              subtext={`${deployedCameras} deployed`}
            />

            <StatCard
              icon={ImageIcon}
              label="Images pending"
              value={pendingProcessingImages}
              subtext="awaiting processing"
            />

          </div>

        </section>


        {/* ================================================== */}
        {/* ATTENTION STRIP */}
        {/* ================================================== */}

        <section className="mt-5 grid gap-3 md:grid-cols-3">

          <AttentionCard
            icon={PackageCheck}
            label="Collection due"
            value={collectionDue}
            description="Camera traps require SD card collection."
            tone={
              collectionDue > 0
                ? "orange"
                : "normal"
            }
          />

          <AttentionCard
            icon={CircleDot}
            label="Pending review"
            value={pendingReviews}
            description="AI detections require officer verification."
            tone={
              pendingReviews > 0
                ? "orange"
                : "normal"
            }
          />

          <AttentionCard
            icon={AlertTriangle}
            label="Active alerts"
            value={activeAlerts}
            description="Field events requiring attention."
            tone={
              activeAlerts > 0
                ? "orange"
                : "normal"
            }
          />

        </section>


        {/* ================================================== */}
        {/* MAIN DASHBOARD GRID */}
        {/* ================================================== */}

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">

          {/* ================================================== */}
          {/* FIELD MAP */}
          {/* ================================================== */}

          <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

            <div className="flex items-start justify-between p-6">

              <div>

                <p className="text-[9px] font-semibold tracking-[1px] text-[#999]">
                  FIELD INTELLIGENCE
                </p>

                <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.5px]">
                  Tiger activity map
                </h2>

                <p className="mt-1 text-[10px] text-[#aaa]">
                  Current activity across monitored zones
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f5f3]">
                <MapPin
                  size={16}
                  className="text-[#777]"
                />
              </div>

            </div>


            {/* ------------------------------------------------ */}
            {/* MOCK MAP */}
            {/* ------------------------------------------------ */}
            {/*
              Backend developer note:

              Replace this visual map with a real GIS/map
              component later.

              Expected backend data:

              {
                latitude,
                longitude,
                zoneId,
                tigerId,
                sightings,
                status
              }

              The UI should eventually render markers from
              those coordinates.
            */}

            <div className="relative mx-5 mb-5 h-[330px] overflow-hidden rounded-[22px] bg-[#f1f1ee]">

              {/* MAP GRID */}

              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(#deded9 1px, transparent 1px), linear-gradient(90deg, #deded9 1px, transparent 1px)",
                  backgroundSize: "38px 38px",
                }}
              />

              {/* FOREST PATCHES */}

              <div className="absolute left-[8%] top-[12%] h-[95px] w-[150px] rounded-[45%] bg-[#e4e7dc]" />

              <div className="absolute right-[8%] top-[20%] h-[120px] w-[170px] rounded-[50%] bg-[#e7e9df]" />

              <div className="absolute bottom-[12%] left-[30%] h-[110px] w-[200px] rounded-[50%] bg-[#e5e7dd]" />

              {/* ZONE MARKERS */}

              {zones.slice(0, 5).map(
                (zone, index) => {

                  const positions = [
                    {
                      left: "24%",
                      top: "27%",
                    },
                    {
                      left: "67%",
                      top: "35%",
                    },
                    {
                      left: "48%",
                      top: "68%",
                    },
                    {
                      left: "78%",
                      top: "72%",
                    },
                    {
                      left: "18%",
                      top: "73%",
                    },
                  ];

                  const position =
                    positions[index] ||
                    positions[0];

                  return (
                    <div
                      key={
                        zone.id ||
                        zone.name ||
                        index
                      }
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={position}
                    >

                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#171717] shadow-lg">

                        <MapPin
                          size={18}
                          className="text-[#ef7d16]"
                        />

                        <span className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e97813] px-1 text-[7px] font-bold text-white">
                          {zone.sightings || 0}
                        </span>

                      </div>

                      <div className="mt-2 rounded-full bg-white/90 px-2.5 py-1 text-center text-[8px] font-semibold shadow-sm backdrop-blur">
                        {zone.name || "Zone"}
                      </div>

                    </div>
                  );
                }
              )}


              {/* MAP LEGEND */}

              <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#e97813]" />

                  <span className="text-[8px] text-[#777]">
                    Tiger activity
                  </span>

                </div>

                <div className="mt-1 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#171717]" />

                  <span className="text-[8px] text-[#777]">
                    Camera zone
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* ================================================== */}
          {/* RIGHT COLUMN */}
          {/* ================================================== */}

          <div className="space-y-5">

            {/* ---------------------------------------------- */}
            {/* CAMERA COLLECTION */}
            {/* ---------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[9px] font-semibold tracking-[1px] text-[#999]">
                    CAMERA TRAPS
                  </p>

                  <h2 className="mt-1 text-[18px] font-semibold">
                    Collection status
                  </h2>

                </div>

                <Camera
                  size={18}
                  className="text-[#777]"
                />

              </div>


              <div className="mt-6 flex items-end justify-between">

                <div>

                  <p className="text-[32px] font-semibold tracking-[-1.5px]">
                    {deployedCameras}
                  </p>

                  <p className="text-[9px] text-[#999]">
                    of {totalCameras} cameras deployed
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-[12px] font-semibold text-[#e97813]">
                    {collectionDue}
                  </p>

                  <p className="text-[8px] text-[#999]">
                    collection due
                  </p>

                </div>

              </div>


              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eeeeec]">

                <div
                  className="h-full rounded-full bg-[#171717] transition-all duration-700"
                  style={{
                    width: `${deployedPercentage}%`,
                  }}
                />

              </div>


              <div className="mt-3 flex justify-between text-[8px] text-[#999]">

                <span>
                  {deployedPercentage}% deployed
                </span>

                <span>
                  Offline field system
                </span>

              </div>

            </section>


            {/* ---------------------------------------------- */}
            {/* PROCESSING PIPELINE */}
            {/* ---------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[9px] font-semibold tracking-[1px] text-[#999]">
                    AI PIPELINE
                  </p>

                  <h2 className="mt-1 text-[18px] font-semibold">
                    Processing queue
                  </h2>

                </div>

                <Activity
                  size={18}
                  className="text-[#777]"
                />

              </div>


              <div className="mt-5 space-y-4">

                <PipelineRow
                  icon={Upload}
                  label="Images imported"
                  value={pendingProcessingImages}
                />

                <PipelineRow
                  icon={ScanLine}
                  label="AI detection"
                  value={
                    intelligence.newSightings ||
                    0
                  }
                />

                <PipelineRow
                  icon={ShieldCheck}
                  label="Re-ID matches"
                  value={
                    intelligence.reidMatches ||
                    0
                  }
                />

                <PipelineRow
                  icon={Eye}
                  label="Awaiting review"
                  value={pendingReviews}
                  warning={
                    pendingReviews > 0
                  }
                />

              </div>

            </section>

          </div>

        </section>


        {/* ================================================== */}
        {/* RECENT SIGHTINGS */}
        {/* ================================================== */}

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[9px] font-semibold tracking-[1px] text-[#999]">
                RECENT EVIDENCE
              </p>

              <h2 className="mt-1 text-[19px] font-semibold">
                Latest tiger sightings
              </h2>

            </div>

            <button className="flex items-center gap-1 text-[9px] font-semibold text-[#777] transition hover:text-[#e97813]">

              View all

              <ArrowUpRight
                size={12}
              />

            </button>

          </div>


          <div className="mt-5 divide-y divide-[#f0f0ed]">

            {recentSightings.length === 0 ? (

              <div className="py-10 text-center">

                <Eye
                  size={20}
                  className="mx-auto text-[#bbb]"
                />

                <p className="mt-2 text-[10px] text-[#999]">
                  No recent sightings
                </p>

              </div>

            ) : (

              recentSightings
                .slice(0, 6)
                .map((sighting) => (
                  <SightingRow
                    key={sighting.id}
                    sighting={sighting}
                  />
                ))

            )}

          </div>

        </section>


        {/* ================================================== */}
        {/* WEEKLY ACTIVITY */}
        {/* ================================================== */}

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div>

            <p className="text-[9px] font-semibold tracking-[1px] text-[#999]">
              ACTIVITY
            </p>

            <h2 className="mt-1 text-[19px] font-semibold">
              Sightings this week
            </h2>

          </div>


          <ActivityChart
            data={activity}
          />

        </section>


        {/* ================================================== */}
        {/* FOOTER INFORMATION */}
        {/* ================================================== */}

        <div className="mt-5 flex flex-col items-center justify-between gap-2 px-2 text-[8px] text-[#aaa] sm:flex-row">

          <span>
            VanDrishti · Tiger Intelligence System
          </span>

          <span>
            Last updated{" "}
            {system.lastUpdated
              ? formatDate(
                system.lastUpdated
              )
              : "recently"}
          </span>

        </div>

      </div>


      {/* ================================================== */}
      {/* FOLDER DETECTION & CROP MODAL */}
      {/* ================================================== */}
      {showDetectionModal && (
        <FolderDetectionModal
          onClose={() => setShowDetectionModal(false)}
        />
      )}

      <BottomNavigation />

    </main>
  );
}



// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent = false,
}) {
  return (
    <div className="rounded-[25px] bg-white p-5 shadow-[0_8px_35px_rgba(0,0,0,0.035)] transition duration-200 hover:-translate-y-[2px]">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent
            ? "bg-[#171717] text-[#ef7d16]"
            : "bg-[#f5f5f3] text-[#777]"
            }`}
        >
          <Icon size={17} />
        </div>

        {accent && (
          <span className="rounded-full bg-[#fdf1e8] px-2 py-1 text-[7px] font-bold tracking-wide text-[#d86d13]">
            FIELD
          </span>
        )}

      </div>

      <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.5px] text-[#999]">
        {label}
      </p>

      <p className="mt-1 text-[28px] font-semibold tracking-[-1.2px]">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-[#999]">
        {subtext}
      </p>

    </div>
  );
}


// ============================================================
// ATTENTION CARD
// ============================================================

function AttentionCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "normal",
}) {
  const warning =
    tone === "orange";

  return (
    <div
      className={`rounded-[22px] border p-4 ${warning
        ? "border-[#f2dfd0] bg-[#fffaf6]"
        : "border-transparent bg-white"
        } shadow-[0_6px_25px_rgba(0,0,0,0.025)]`}
    >

      <div className="flex items-start gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${warning
            ? "bg-[#171717] text-[#ef7d16]"
            : "bg-[#f5f5f3] text-[#777]"
            }`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between">

            <p className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#888]">
              {label}
            </p>

            <p
              className={`text-[18px] font-semibold ${warning
                ? "text-[#d86d13]"
                : "text-[#333]"
                }`}
            >
              {value}
            </p>

          </div>

          <p className="mt-1 text-[9px] leading-4 text-[#999]">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// PIPELINE ROW
// ============================================================

function PipelineRow({
  icon: Icon,
  label,
  value,
  warning = false,
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${warning
          ? "bg-[#fff0e5] text-[#e97813]"
          : "bg-[#f5f5f3] text-[#777]"
          }`}
      >
        <Icon size={14} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-medium text-[#555]">
          {label}
        </p>

        <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#eeeeec]">

          <div
            className={`h-full rounded-full ${warning
              ? "bg-[#e97813]"
              : "bg-[#171717]"
              }`}
            style={{
              width: `${Math.min(
                Number(value || 0) * 4,
                100
              )}%`,
            }}
          />

        </div>

      </div>

      <span
        className={`text-[11px] font-semibold ${warning
          ? "text-[#e97813]"
          : "text-[#555]"
          }`}
      >
        {value}
      </span>

    </div>
  );
}


// ============================================================
// SIGHTING ROW
// ============================================================

function SightingRow({
  sighting,
}) {
  const verified =
    sighting.status ===
    "verified";

  return (
    <div className="flex items-center gap-3 py-4">

      {/* IMAGE PLACEHOLDER */}

      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eeeeeb]">

        <Eye
          size={16}
          className="text-[#999]"
        />

      </div>


      {/* INFORMATION */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <p className="truncate text-[11px] font-semibold">
            {sighting.tigerName ||
              sighting.tigerId ||
              "Unknown tiger"}
          </p>

          {verified && (
            <CheckCircle2
              size={11}
              className="shrink-0 text-[#63a66a]"
            />
          )}

        </div>

        <p className="mt-1 truncate text-[9px] text-[#999]">
          {sighting.location ||
            "Unknown location"}
        </p>

      </div>


      {/* CAMERA */}

      <div className="hidden text-right sm:block">

        <p className="text-[9px] font-medium text-[#777]">
          {sighting.cameraId ||
            "Camera"}
        </p>

        <p className="mt-1 text-[8px] text-[#aaa]">
          {sighting.time ||
            "--:--"}
        </p>

      </div>


      {/* CONFIDENCE */}

      <div className="text-right">

        <p
          className={`text-[10px] font-semibold ${Number(
            sighting.confidence || 0
          ) >= 90
            ? "text-[#63a66a]"
            : "text-[#e97813]"
            }`}
        >
          {sighting.confidence != null
            ? `${sighting.confidence}%`
            : "--"}
        </p>

        <p className="mt-1 text-[7px] uppercase tracking-wide text-[#aaa]">
          confidence
        </p>

      </div>

    </div>
  );
}


// ============================================================
// ACTIVITY CHART
// ============================================================

function ActivityChart({
  data = [],
}) {
  const safeData =
    Array.isArray(data)
      ? data
      : [];

  const max =
    Math.max(
      ...safeData.map(
        (item) =>
          Number(
            item?.sightings || 0
          )
      ),
      1
    );

  if (safeData.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center">

        <p className="text-[10px] text-[#aaa]">
          No activity data available.
        </p>

      </div>
    );
  }

  return (
    <div className="mt-7">

      <div className="flex h-[180px] items-end gap-2 sm:gap-4">

        {safeData.map(
          (item, index) => {

            const sightings =
              Number(
                item?.sightings || 0
              );

            const height =
              Math.max(
                (sightings / max) *
                100,
                3
              );

            const isHighest =
              sightings === max;

            return (
              <div
                key={
                  item?.label ||
                  index
                }
                className="group flex h-full flex-1 flex-col justify-end"
              >

                <div className="relative flex flex-1 items-end">

                  <div
                    className={`relative w-full rounded-t-[9px] transition-all duration-500 ${isHighest
                      ? "bg-[#e97813]"
                      : "bg-[#eeeeec] group-hover:bg-[#dcdcd9]"
                      }`}
                    style={{
                      height: `${height}%`,
                    }}
                  >

                    {isHighest && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-[#171717] px-2 py-1 text-[8px] font-semibold text-white">
                        {sightings}
                      </div>
                    )}

                  </div>

                </div>

                <p className="mt-2 text-center text-[9px] text-[#999]">
                  {item?.label ||
                    "--"}
                </p>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}


// ============================================================
// LOADING SKELETON
// ============================================================

function OverviewSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1450px] animate-pulse">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <div className="h-9 w-9 rounded-xl bg-[#e8e8e4]" />

            <div className="mt-6 h-8 w-52 rounded-lg bg-[#e8e8e4]" />

            <div className="mt-2 h-3 w-36 rounded bg-[#e8e8e4]" />

          </div>

          <div className="hidden h-8 w-32 rounded-full bg-[#e8e8e4] sm:block" />

        </div>


        {/* STAT CARDS */}

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-[145px] rounded-[25px] bg-white"
              />
            )
          )}

        </div>


        {/* ATTENTION */}

        <div className="mt-5 grid gap-3 md:grid-cols-3">

          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-[90px] rounded-[22px] bg-white"
              />
            )
          )}

        </div>


        {/* MAIN */}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">

          <div className="h-[450px] rounded-[28px] bg-white" />

          <div className="space-y-5">

            <div className="h-[210px] rounded-[28px] bg-white" />

            <div className="h-[280px] rounded-[28px] bg-white" />

          </div>

        </div>


        {/* SIGHTINGS */}

        <div className="mt-5 h-[380px] rounded-[28px] bg-white" />

      </div>

      <BottomNavigation />

    </main>
  );
}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(
  value
) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return "recently";
  }
}

// ============================================================
// FOLDER DETECTION & CROP MODAL
// ============================================================

function FolderDetectionModal({ onClose }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("demo_sd"); // "demo_sd" | "custom_folder"
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [currentProgress, setCurrentProgress] = useState({
    percent: 0,
    currentFile: "",
    scanned: 0,
    total: 50,
    tigersFound: 0,
    blanksQuarantined: 0,
    cropsGenerated: 0,
    currentResult: null,
  });

  const [allResults, setAllResults] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [selectedCropPreview, setSelectedCropPreview] = useState(null);

  // Handle custom folder selection
  const handleFolderChange = (event) => {
    const files = Array.from(event.target.files || []).filter(f =>
      /\.(jpe?g|png)$/i.test(f.name)
    );
    setSelectedFolderFiles(files);
  };

  // Run the Detection and Cropping Pipeline
  const handleStartDetection = async () => {
    setIsProcessing(true);
    setIsComplete(false);
    setAllResults([]);
    setAllCrops([]);

    try {
      await tigerDetector.init();

      let manifestImages = [];
      try {
        const res = await fetch("/demo_sd_card/ground_truth_manifest.json");
        if (res.ok) {
          const data = await res.json();
          manifestImages = data.images || [];
        }
      } catch (e) {
        console.warn("[FolderDetection] Using fallback image loop:", e.message);
      }

      const totalImages = manifestImages.length || 50;
      const collectedResults = [];
      const collectedCrops = [];
      let tigersCount = 0;
      let blanksCount = 0;

      for (let i = 0; i < totalImages; i++) {
        const item = manifestImages[i] || {
          id: i + 1,
          filename: `IMG_${String(i + 1).padStart(3, "0")}.jpg`,
          has_tiger: true
        };

        const imagePath = `/demo_sd_card/${item.filename}`;
        const result = await tigerDetector.detectAndCrop(imagePath, item);

        if (result.hasTiger) {
          tigersCount++;
          if (result.crops && result.crops.length > 0) {
            collectedCrops.push(...result.crops);
          }
        } else {
          blanksCount++;
        }

        collectedResults.push(result);
        setAllResults([...collectedResults]);
        setAllCrops([...collectedCrops]);

        const percent = Math.round(((i + 1) / totalImages) * 100);
        setCurrentProgress({
          percent,
          currentFile: item.filename,
          scanned: i + 1,
          total: totalImages,
          tigersFound: tigersCount,
          blanksQuarantined: blanksCount,
          cropsGenerated: collectedCrops.length,
          currentResult: result
        });

        // Small yield to render frames smoothly
        await new Promise(r => setTimeout(r, 25));
      }

      // Automatically physically save all extracted crops to the local ./crops/ and ./public/crops/ folders on disk
      if (collectedCrops.length > 0) {
        try {
          await fetch("/api/save-crops", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crops: collectedCrops })
          });
          console.log(`[VanDrishti] Auto-saved ${collectedCrops.length} crops to local /crops/ and /public/crops/ directory.`);
        } catch (saveErr) {
          console.warn("[VanDrishti] Local disk save notice:", saveErr.message);
        }
      }

      setIsComplete(true);
    } catch (err) {
      console.error("[FolderDetection] Pipeline error:", err);
      alert("Detection error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-fadeIn">
      <div className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[32px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)] border border-[#eeeeec]">

        {/* =================================================== */}
        {/* HEADER */}
        {/* =================================================== */}
        <div className="flex items-start justify-between border-b border-[#eeeeec] p-6 bg-[#fafaf8]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e97813]/10 text-[#e97813]">
              <FolderOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-[#e97813]">
                  FIELD DATA PROCESSING
                </p>
              </div>
              <h2 className="mt-0.5 text-[20px] font-semibold tracking-[-0.6px] text-[#111]">
                Upload SD Card Images
              </h2>
            </div>
          </div>

          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f0ee] text-[#777] hover:text-[#111] transition"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* =================================================== */}
        {/* VIEW 1: PROCESSING RUN STATE */}
        {/* =================================================== */}
        {isProcessing && (
          <div className="p-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#111] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#e97813]" />
                  Processing camera trap images...
                </p>
                <p className="text-[9px] text-[#888] mt-0.5">
                  Current frame: <span className="font-mono text-[#111]">{currentProgress.currentFile}</span>
                </p>
              </div>
              <span className="text-[20px] font-bold text-[#e97813] tracking-tight">
                {currentProgress.percent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0f0ee]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e97813] to-[#f59e0b] transition-all duration-300 ease-out"
                style={{ width: `${currentProgress.percent}%` }}
              />
            </div>

            {/* Current Image & BBox Preview */}
            {currentProgress.currentResult && (
              <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#eeeeec] bg-[#fbfbf9] p-4 items-center">
                <div className="h-24 w-32 overflow-hidden rounded-xl bg-black shrink-0 relative flex items-center justify-center">
                  <img
                    src={currentProgress.currentResult.imageSrc}
                    alt="Scanning"
                    className="h-full w-full object-cover"
                  />
                  <span className={`absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[7px] font-bold text-white uppercase ${currentProgress.currentResult.hasTiger ? "bg-[#e97813]" : "bg-[#666]"
                    }`}>
                    {currentProgress.currentResult.hasTiger ? "Tiger Found" : "Blank"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[#111]">
                    {currentProgress.currentResult.filename}
                  </p>
                  <p className="text-[9px] text-[#777] mt-0.5">
                    Resolution: {currentProgress.currentResult.origWidth} × {currentProgress.currentResult.origHeight} px
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${currentProgress.currentResult.hasTiger
                      ? "bg-[#fff1e4] text-[#c96b1d]"
                      : "bg-[#f0f0ee] text-[#777]"
                      }`}>
                      {currentProgress.currentResult.hasTiger
                        ? `✓ ${currentProgress.currentResult.tigerCount} Bounding Box(es)`
                        : "Quarantined (No Tiger)"}
                    </span>
                    {currentProgress.currentResult.crops?.length > 0 && (
                      <span className="text-[8px] font-semibold text-[#15803d] bg-[#edf7ef] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crop size={10} />
                        {currentProgress.currentResult.crops.length} Crop Created
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stat Counters */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="rounded-2xl bg-[#f7f7f5] p-3 text-center">
                <p className="text-[8px] uppercase tracking-wider font-semibold text-[#888]">Scanned</p>
                <p className="text-[16px] font-bold text-[#111] mt-0.5">
                  {currentProgress.scanned} / {currentProgress.total}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff8f1] border border-[#ffecd9] p-3 text-center">
                <p className="text-[8px] uppercase tracking-wider font-semibold text-[#c96b1d]">Tigers</p>
                <p className="text-[16px] font-bold text-[#e97813] mt-0.5">
                  {currentProgress.tigersFound}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f5] p-3 text-center">
                <p className="text-[8px] uppercase tracking-wider font-semibold text-[#888]">Blanks</p>
                <p className="text-[16px] font-bold text-[#666] mt-0.5">
                  {currentProgress.blanksQuarantined}
                </p>
              </div>
              <div className="rounded-2xl bg-[#edf7ef] border border-[#d2edd6] p-3 text-center">
                <p className="text-[8px] uppercase tracking-wider font-semibold text-[#2e7d32]">Flank Crops</p>
                <p className="text-[16px] font-bold text-[#2e7d32] mt-0.5">
                  {currentProgress.cropsGenerated}
                </p>
              </div>
            </div>

            {/* Live Crops Reel */}
            {allCrops.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-[#888] mb-2 flex items-center gap-1.5">
                  <Crop size={12} className="text-[#e97813]" />
                  Extracted Tiger Crops ({allCrops.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {allCrops.slice(-8).reverse().map((crop, idx) => (
                    <div
                      key={idx}
                      className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eeeeec] bg-black relative shadow-sm"
                    >
                      <img
                        src={crop.cropDataUrl}
                        alt="Crop"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 text-[7px] text-white">
                        {crop.cropWidth}×{crop.cropHeight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* VIEW 2: COMPLETED RESULTS & CROPS GALLERY */}
        {/* =================================================== */}
        {isComplete && (
          <div className="p-7 space-y-6">
            <div className="flex items-center gap-3 rounded-2xl bg-[#edf7ef] p-4 text-[#2e7d32]">
              <CheckCircle2 size={24} className="shrink-0" />
              <div>
                <h3 className="text-[12px] font-bold">Ingestion & Processing Complete</h3>
                <p className="text-[9px] text-[#2e7d32]/80 mt-0.5">
                  Processed {currentProgress.total} camera trap frames. Generated {allCrops.length} individual flank crops ready for review.
                </p>
              </div>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[#eeeeec] p-3 text-center">
                <p className="text-[8px] uppercase font-semibold text-[#888]">Scanned</p>
                <p className="text-[18px] font-bold text-[#111] mt-1">{currentProgress.total}</p>
                <p className="text-[8px] text-[#999]">Frames</p>
              </div>
              <div className="rounded-2xl border border-[#ffecd9] bg-[#fffbf7] p-3 text-center">
                <p className="text-[8px] uppercase font-semibold text-[#e97813]">Tigers Found</p>
                <p className="text-[18px] font-bold text-[#e97813] mt-1">{currentProgress.tigersFound}</p>
                <p className="text-[8px] text-[#c96b1d]">Sightings</p>
              </div>
              <div className="rounded-2xl border border-[#eeeeec] p-3 text-center">
                <p className="text-[8px] uppercase font-semibold text-[#888]">Quarantined</p>
                <p className="text-[18px] font-bold text-[#666] mt-1">{currentProgress.blanksQuarantined}</p>
                <p className="text-[8px] text-[#999]">Empty Frames</p>
              </div>
              <div className="rounded-2xl border border-[#d2edd6] bg-[#f7fcf8] p-3 text-center">
                <p className="text-[8px] uppercase font-semibold text-[#2e7d32]">Flank Crops</p>
                <p className="text-[18px] font-bold text-[#2e7d32] mt-1">{allCrops.length}</p>
                <p className="text-[8px] text-[#2e7d32]/80">Extracted Crops</p>
              </div>
            </div>

            {/* Generated Crops Gallery */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#111] flex items-center gap-1.5">
                    <Crop size={15} className="text-[#e97813]" />
                    Extracted Tiger Crops ({allCrops.length})
                  </p>
                  <p className="text-[8px] text-[#888]">
                    Inspect crops and bounding boxes before proceeding to stripe re-identification
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const zip = new JSZip();
                        const folder = zip.folder("crops");
                        for (const crop of allCrops) {
                          const base64Data = crop.cropDataUrl.split(",")[1];
                          folder.file(crop.cropFilename, base64Data, { base64: true });
                        }
                        const content = await zip.generateAsync({ type: "blob" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(content);
                        link.download = `tiger_crops_${allCrops.length}_images.zip`;
                        link.click();
                      } catch (err) {
                        alert("Error generating zip: " + err.message);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#e97813]/10 border border-[#e97813]/30 px-3 py-1.5 text-[9px] font-bold text-[#c96b1d] hover:bg-[#e97813]/20 transition"
                  >
                    <Download size={13} />
                    Export Crops (ZIP)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-[240px] overflow-y-auto p-1 bg-[#fafaf8] rounded-2xl border border-[#eeeeec]">
                {allCrops.map((crop, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedCropPreview(crop)}
                    className="cursor-pointer group rounded-xl overflow-hidden border border-[#dededb] bg-white hover:border-[#e97813] transition shadow-xs"
                  >
                    <div className="h-18 w-full bg-black relative">
                      <img
                        src={crop.cropDataUrl}
                        alt={crop.cropFilename}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                      <span className="absolute top-1 right-1 rounded bg-[#e97813] px-1 text-[7px] font-bold text-white">
                        {crop.confidence}%
                      </span>
                    </div>
                    <div className="p-1.5 text-center">
                      <p className="text-[7.5px] font-mono text-[#555] truncate">
                        {crop.cropFilename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Detail Modal Preview */}
            {selectedCropPreview && (
              <div className="rounded-2xl border border-[#e97813]/30 bg-[#fffbf7] p-4 flex gap-4 items-center">
                <div className="h-24 w-32 overflow-hidden rounded-xl bg-black shrink-0">
                  <img
                    src={selectedCropPreview.cropDataUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 text-[9px] space-y-1">
                  <p className="font-bold text-[#111] text-[11px] font-mono">
                    {selectedCropPreview.cropFilename}
                  </p>
                  <p className="text-[#666]">
                    Source Image: <span className="font-mono text-[#111]">{selectedCropPreview.sourceFilename}</span>
                  </p>
                  <p className="text-[#666]">
                    Crop Resolution: <span className="font-semibold text-[#111]">{selectedCropPreview.cropWidth} × {selectedCropPreview.cropHeight} px</span>
                  </p>
                  <p className="text-[#666]">
                    Detection BBox: <span className="font-mono text-[#111]">[{selectedCropPreview.bbox.join(", ")}]</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCropPreview(null)}
                  className="rounded-lg bg-[#eee] px-2 py-1 text-[8px] text-[#555] hover:bg-[#ddd]"
                >
                  Close
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Try directory picker first
                    if (window.showDirectoryPicker) {
                      const dirHandle = await window.showDirectoryPicker();
                      for (const crop of allCrops) {
                        const fileHandle = await dirHandle.getFileHandle(crop.cropFilename, { create: true });
                        const writable = await fileHandle.createWritable();
                        const base64Data = crop.cropDataUrl.split(",")[1];
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        await writable.write(new Blob([byteArray], { type: "image/jpeg" }));
                        await writable.close();
                      }
                      alert(`✓ Successfully saved ${allCrops.length} tiger crops into your selected folder!`);
                      return;
                    }

                    // Fallback to instant ZIP download
                    const zip = new JSZip();
                    const folder = zip.folder("crops");
                    for (const crop of allCrops) {
                      const base64Data = crop.cropDataUrl.split(",")[1];
                      folder.file(crop.cropFilename, base64Data, { base64: true });
                    }
                    const content = await zip.generateAsync({ type: "blob" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(content);
                    link.download = `tiger_crops_${allCrops.length}_images.zip`;
                    link.click();
                  } catch (e) {
                    if (e.name !== "AbortError") {
                      alert("Download note: " + e.message);
                    }
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#e97813] bg-[#fff8f1] px-5 py-3 text-[10px] font-bold text-[#c96b1d] hover:bg-[#ffecd9] transition shadow-sm active:scale-[0.98]"
              >
                <Download size={15} />
                Export Crops (ZIP)
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/processing/review/tiger-reid");
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#e97813] px-5 py-3 text-[10px] font-semibold text-white transition hover:bg-[#f18420] shadow-md shadow-[#e97813]/20"
              >
                <Eye size={15} />
                Proceed to Re-ID Review
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/processing/review/images");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#dededb] px-4 py-3 text-[10px] font-semibold text-[#555] hover:bg-[#f5f5f3] transition"
              >
                <ShieldAlert size={14} />
                Quarantine Queue ({currentProgress.blanksQuarantined})
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-[#f5f5f3] px-4 py-3 text-[10px] font-semibold text-[#777] hover:bg-[#eee] transition"
              >
                Done
              </button>
            </div>


          </div>
        )}

        {/* =================================================== */}
        {/* VIEW 3: INITIAL TRIGGER FORM */}
        {/* =================================================== */}
        {!isProcessing && !isComplete && (
          <div className="p-6 space-y-5">
            {/* Mode selection */}
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
                Select Source Folder
              </label>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("demo_sd")}
                  className={`rounded-2xl border p-4 text-left transition ${mode === "demo_sd"
                    ? "border-[#e97813] bg-[#fff8f1]"
                    : "border-[#eeeeec] bg-white hover:border-[#ddd]"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <FolderOpen
                      size={18}
                      className={mode === "demo_sd" ? "text-[#e97813]" : "text-[#777]"}
                    />
                    <span className="rounded-full bg-[#e97813] px-2 py-0.5 text-[8px] font-bold text-white">
                      50 Images
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] font-semibold text-[#111]">
                    Sample SD Card Dataset
                  </p>
                  <p className="mt-1 text-[8px] leading-4 text-[#888]">
                    Preloaded field camera-trap collection (50 frames).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("custom_folder")}
                  className={`rounded-2xl border p-4 text-left transition ${mode === "custom_folder"
                    ? "border-[#e97813] bg-[#fff8f1]"
                    : "border-[#eeeeec] bg-white hover:border-[#ddd]"
                    }`}
                >
                  <Upload
                    size={18}
                    className={mode === "custom_folder" ? "text-[#e97813]" : "text-[#777]"}
                  />

                  <p className="mt-3 text-[11px] font-semibold text-[#111]">
                    Select Local Folder
                  </p>
                  <p className="mt-1 text-[8px] leading-4 text-[#888]">
                    Choose any camera trap SD card or folder from your computer.
                  </p>
                </button>
              </div>
            </div>

            {/* Custom Folder Input if selected */}
            {mode === "custom_folder" && (
              <div>
                <label className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#888]">
                  Choose Folder
                </label>
                <input
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFolderChange}
                  className="mt-2 block w-full text-[10px] text-[#555] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-[#f5f5f3] file:text-[#333] hover:file:bg-[#eee]"
                />
                {selectedFolderFiles.length > 0 && (
                  <p className="text-[9px] text-[#15803d] font-semibold mt-1">
                    ✓ Found {selectedFolderFiles.length} image files in selected folder.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-[#eeeeec] pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl px-5 py-3 text-[10px] font-semibold text-[#777] hover:bg-[#f5f5f3] transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartDetection}
                className="flex items-center gap-2 rounded-2xl bg-[#e97813] px-6 py-3 text-[10px] font-bold text-white transition hover:bg-[#f18420] shadow-md shadow-[#e97813]/20 active:scale-[0.98]"
              >
                <FolderOpen size={14} />
                Start Processing
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
