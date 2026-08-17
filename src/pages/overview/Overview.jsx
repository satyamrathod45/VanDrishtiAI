import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  CircleDot,
  Eye,
  Image as ImageIcon,
  MapPin,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import { overviewService } from "../../services/overviewService";
import { useAuth } from "../../context/AuthContext";
import BottomNavigation from "../../components/navigation/BottomNavigation";


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
  // OFFICER NAME
  // ==========================================================

  const officerName =
    officer?.name ||
    officer?.fullName ||
    officer?.officerName ||
    "Forest Officer";

  // ==========================================================
  // SYSTEM STATUS
  // ==========================================================

  const systemOperational =
    system.status === "operational";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] px-4 pb-32 pt-6 text-[#202020] sm:px-6 lg:px-8">

      {/* ================================================== */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================== */}

      <div className="pointer-events-none fixed -left-52 -top-52 h-[550px] w-[550px] rounded-full bg-[#e97813]/[0.025] blur-3xl" />

      <div className="pointer-events-none fixed -bottom-60 -right-52 h-[650px] w-[650px] rounded-full bg-[#171717]/[0.02] blur-3xl" />

      <div className="relative mx-auto max-w-[1450px]">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171717]">
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

            <h1 className="mt-6 text-[28px] font-semibold tracking-[-1.3px] sm:text-[34px]">
              Field overview
            </h1>

            <p className="mt-1 text-[11px] text-[#999]">
              Welcome back, {officerName}
            </p>

          </div>

          {/* SYSTEM STATUS */}

          <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_6px_25px_rgba(0,0,0,0.04)] sm:flex">

            <span
              className={`h-2 w-2 rounded-full ${
                systemOperational
                  ? "bg-[#62a36b]"
                  : "bg-[#e97813]"
              }`}
            />

            <span className="text-[9px] font-semibold text-[#666]">
              {systemOperational
                ? "SYSTEM OPERATIONAL"
                : "SYSTEM ATTENTION"}
            </span>

          </div>

        </header>


        {/* ================================================== */}
        {/* FIELD SNAPSHOT */}
        {/* ================================================== */}

        <section className="mt-7">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="text-[9px] font-semibold tracking-[1px] text-[#999]">
                FIELD SNAPSHOT
              </p>

              <h2 className="mt-1 text-[18px] font-semibold">
                What needs attention
              </h2>
            </div>

            <span className="text-[9px] text-[#aaa]">
              Updated recently
            </span>

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
      {/* BOTTOM NAVIGATION */}
      {/* ================================================== */}
      {/*
        Navigation intentionally lives in its own component.

        This keeps navigation independent from Overview and
        allows the same navigation to be reused across:

        Overview
        Tigers
        Processing
        Cameras
        Reviews
        etc.
      */}

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
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent
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
      className={`rounded-[22px] border p-4 ${
        warning
          ? "border-[#f2dfd0] bg-[#fffaf6]"
          : "border-transparent bg-white"
      } shadow-[0_6px_25px_rgba(0,0,0,0.025)]`}
    >

      <div className="flex items-start gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            warning
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
              className={`text-[18px] font-semibold ${
                warning
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
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          warning
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
            className={`h-full rounded-full ${
              warning
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
        className={`text-[11px] font-semibold ${
          warning
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
          className={`text-[10px] font-semibold ${
            Number(
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
                    className={`relative w-full rounded-t-[9px] transition-all duration-500 ${
                      isHighest
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