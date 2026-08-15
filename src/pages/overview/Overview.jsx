import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Camera,
  ChevronRight,
  CircleDot,
  Eye,
  MapPin,
  ScanLine,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

import { overviewService } from "../../services/overviewService";
import { useAuth } from "../../context/AuthContext";
import BottomNavigation from "../../components/navigation/BottomNavigation";


// ============================================================
// MAIN OVERVIEW
// ============================================================

export default function Overview() {
  const { officer } = useAuth();

  const [overview, setOverview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);

        const response =
          await overviewService.getOverview();

        if (response.success) {
          setOverview(response.data);
        }
      } catch (err) {
        console.error(
          "Failed to load overview:",
          err
        );

        setError(
          "Unable to load VanDrishti overview."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return <OverviewSkeleton />;
  }

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  if (error || !overview) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">

        <div className="rounded-[28px] bg-white px-8 py-7 text-center shadow-[0_15px_50px_rgba(0,0,0,0.05)]">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3e8]">
            <AlertTriangle
              size={20}
              className="text-[#e97813]"
            />
          </div>

          <h2 className="mt-4 text-[16px] font-semibold">
            Something went wrong
          </h2>

          <p className="mt-1 text-[12px] text-[#999]">
            {error}
          </p>

        </div>

      </main>
    );
  }

  const {
    statistics,
    activity,
    recentSightings,
    intelligence,
    zones,
    system,
  } = overview;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] px-4 pb-32 pt-6 text-[#202020] sm:px-6 lg:px-8">

      {/* ================================================== */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================== */}

      <div className="pointer-events-none fixed -left-52 -top-52 h-[550px] w-[550px] rounded-full bg-[#e97813]/[0.025] blur-3xl" />

      <div className="pointer-events-none fixed -bottom-60 -right-52 h-[650px] w-[650px] rounded-full bg-[#171717]/[0.018] blur-3xl" />

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="relative z-10 mx-auto flex max-w-[1450px] items-center justify-between px-1 pb-7">

        {/* Brand */}

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#171717] shadow-[0_7px_18px_rgba(0,0,0,0.09)]">

            <div className="relative">

              <ScanLine
                size={20}
                strokeWidth={1.8}
                className="text-[#ef7d16]"
              />

              <span className="absolute left-[6px] top-[6px] text-[8px]">
                🐅
              </span>

            </div>

          </div>

          <div>

            <h1 className="text-[20px] font-bold tracking-[-0.8px]">
              Van
              <span className="text-[#e97813]">
                Drishti
              </span>
            </h1>

            <p className="mt-0.5 text-[9px] text-[#999]">
              Forest Intelligence Command Center
            </p>

          </div>

        </div>

        {/* Right side */}

        <div className="flex items-center gap-3">

          {/* Monitoring status */}

          <div className="hidden items-center gap-2 rounded-full border border-[#e7e7e5] bg-white px-4 py-2.5 sm:flex">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#63a66a] opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#63a66a]" />

            </span>

            <span className="text-[10px] font-medium text-[#666]">
              Monitoring active
            </span>

          </div>

          {/* Officer */}

          <div className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-[0_5px_20px_rgba(0,0,0,0.035)]">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717] text-[9px] font-bold text-white">

              {officer?.name
                ? officer.name
                    .split(" ")
                    .map(
                      (part) =>
                        part[0]
                    )
                    .join("")
                    .slice(0, 2)
                : "FO"}

            </div>

            <div className="hidden sm:block">

              <p className="text-[10px] font-semibold">
                {officer?.name ||
                  "Forest Officer"}
              </p>

              <p className="text-[8px] text-[#999]">
                {officer?.id ||
                  "FO-1024"}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* ================================================== */}
      {/* CONTENT */}
      {/* ================================================== */}

      <div className="relative z-10 mx-auto max-w-[1450px]">

        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            icon={TigerIcon}
            label="Monitored Tigers"
            value={
              statistics.totalTigers
            }
            subtext={`${statistics.identifiedTigers} identified`}
            accent
          />

          <StatCard
            icon={Eye}
            label="Today's Sightings"
            value={
              statistics.todaysSightings
            }
            subtext={`${statistics.totalSightings.toLocaleString()} total observations`}
          />

          <StatCard
            icon={Camera}
            label="Camera Network"
            value={
              statistics.totalCameras
            }
            subtext={`${statistics.onlineCameras} cameras online`}
          />

          <StatCard
            icon={ShieldCheck}
            label="Re-ID Accuracy"
            value={`${intelligence.detectionAccuracy}%`}
            subtext="Detection confidence"
          />

        </section>

        {/* ================================================== */}
        {/* MAIN GRID */}
        {/* ================================================== */}

        <section className="mt-3 grid gap-3 lg:grid-cols-[1.8fr_1fr]">

          {/* ================================================= */}
          {/* LEFT COLUMN */}
          {/* ================================================= */}

          <div className="space-y-3">

            {/* --------------------------------------------- */}
            {/* ACTIVITY */}
            {/* --------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)] sm:p-7">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                    TIGER MONITORING
                  </p>

                  <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.7px]">
                    Wildlife activity
                  </h2>

                  <p className="mt-1 text-[10px] text-[#999]">
                    Tiger sightings across monitored zones
                  </p>

                </div>

                <div className="rounded-full bg-[#edf7ef] px-3 py-1.5 text-[9px] font-semibold text-[#579365]">
                  Live data
                </div>

              </div>

              <ActivityChart
                data={activity}
              />

            </section>

            {/* --------------------------------------------- */}
            {/* RECENT SIGHTINGS */}
            {/* --------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)] sm:p-7">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                    RECENT OBSERVATIONS
                  </p>

                  <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.6px]">
                    Latest tiger sightings
                  </h2>

                </div>

                <button className="flex items-center gap-1 text-[10px] font-semibold text-[#e97813] transition hover:text-[#c85f09]">

                  View all

                  <ArrowUpRight
                    size={13}
                  />

                </button>

              </div>

              <div className="space-y-1">

                {recentSightings.map(
                  (sighting) => (
                    <SightingRow
                      key={
                        sighting.id
                      }
                      sighting={
                        sighting
                      }
                    />
                  )
                )}

              </div>

            </section>

          </div>

          {/* ================================================= */}
          {/* RIGHT COLUMN */}
          {/* ================================================= */}

          <div className="space-y-3">

            {/* --------------------------------------------- */}
            {/* INTELLIGENCE */}
            {/* --------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                    INTELLIGENCE
                  </p>

                  <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.5px]">
                    System insights
                  </h2>

                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171717]">

                  <Activity
                    size={15}
                    className="text-[#ef7d16]"
                  />

                </div>

              </div>

              <div className="mt-6 space-y-5">

                <InsightRow
                  label="New sightings"
                  value={
                    intelligence.newSightings
                  }
                  icon={Eye}
                />

                <InsightRow
                  label="Re-ID matches"
                  value={
                    intelligence.reidMatches
                  }
                  icon={ScanLine}
                />

                <InsightRow
                  label="Pending reviews"
                  value={
                    intelligence.pendingReviews
                  }
                  icon={CircleDot}
                  warning
                />

                <InsightRow
                  label="Active alerts"
                  value={
                    intelligence.alerts
                  }
                  icon={
                    AlertTriangle
                  }
                  warning
                />

              </div>

            </section>

            {/* --------------------------------------------- */}
            {/* CAMERA STATUS */}
            {/* --------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                    CAMERA NETWORK
                  </p>

                  <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.5px]">
                    Field status
                  </h2>

                </div>

                <Camera
                  size={18}
                  className="text-[#777]"
                />

              </div>

              <div className="mt-6">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-[31px] font-semibold tracking-[-1.5px]">
                      {
                        statistics.onlineCameras
                      }
                    </p>

                    <p className="text-[10px] text-[#999]">
                      of{" "}
                      {
                        statistics.totalCameras
                      }{" "}
                      cameras online
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[12px] font-semibold text-[#d56e18]">
                      {
                        statistics.offlineCameras
                      }
                    </p>

                    <p className="text-[9px] text-[#999]">
                      offline
                    </p>

                  </div>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eeeeec]">

                  <div
                    className="h-full rounded-full bg-[#171717] transition-all duration-700"
                    style={{
                      width: `${
                        (statistics.onlineCameras /
                          statistics.totalCameras) *
                        100
                      }%`,
                    }}
                  />

                </div>

                <div className="mt-3 flex items-center justify-between text-[9px] text-[#999]">

                  <span className="flex items-center gap-1.5">

                    <Wifi
                      size={11}
                      className="text-[#63a66a]"
                    />

                    Online

                  </span>

                  <span className="flex items-center gap-1.5">

                    <WifiOff
                      size={11}
                      className="text-[#d87938]"
                    />

                    Offline

                  </span>

                </div>

              </div>

            </section>

            {/* --------------------------------------------- */}
            {/* ZONES */}
            {/* --------------------------------------------- */}

            <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                    FIELD ZONES
                  </p>

                  <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.5px]">
                    Activity by zone
                  </h2>

                </div>

                <MapPin
                  size={17}
                  className="text-[#888]"
                />

              </div>

              <div className="space-y-4">

                {zones.map(
                  (zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center gap-3"
                    >

                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5f5f3]">

                        <MapPin
                          size={14}
                          className="text-[#777]"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between">

                          <p className="truncate text-[11px] font-semibold">
                            {zone.name}
                          </p>

                          <p className="text-[10px] font-medium text-[#777]">
                            {
                              zone.sightings
                            }
                          </p>

                        </div>

                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#eeeeec]">

                          <div
                            className="h-full rounded-full bg-[#e97813]"
                            style={{
                              width: `${Math.min(
                                zone.sightings *
                                  2,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

          </div>

        </section>

      </div>

      {/* ================================================== */}
      {/* FLOATING GLASS BOTTOM NAVIGATION */}
      {/* ================================================== */}

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
    <div className="rounded-[25px] bg-white p-5 shadow-[0_8px_35px_rgba(0,0,0,0.035)] transition-transform duration-200 hover:-translate-y-[1px]">

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
          <span className="rounded-full bg-[#fdf1e8] px-2 py-1 text-[8px] font-semibold text-[#d86d13]">
            LIVE
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
// ACTIVITY CHART
// ============================================================

function ActivityChart({ data }) {
  const max =
    Math.max(
      ...data.map(
        (item) => item.sightings
      )
    ) || 1;

  return (
    <div className="mt-7">

      <div className="flex h-[180px] items-end gap-2 sm:gap-4">

        {data.map(
          (item) => {
            const height =
              (item.sightings /
                max) *
              100;

            const isHighest =
              item.sightings ===
              max;

            return (
              <div
                key={item.label}
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
                        {
                          item.sightings
                        }
                      </div>
                    )}

                  </div>

                </div>

                <p className="mt-2 text-center text-[9px] text-[#999]">
                  {item.label}
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
// SIGHTING ROW
// ============================================================

function SightingRow({
  sighting,
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#fafaf8]">

      {/* Image placeholder */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#171717]">

        <ScanLine
          size={17}
          className="text-[#ef7d16]"
        />

      </div>

      {/* Main */}
      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <p className="text-[11px] font-semibold">
            {sighting.tigerName}
          </p>

          <span
            className={`rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase ${
              sighting.status ===
              "verified"
                ? "bg-[#edf7ef] text-[#579365]"
                : "bg-[#fff3e8] text-[#d87938]"
            }`}
          >
            {
              sighting.status
            }
          </span>

        </div>

        <p className="mt-0.5 truncate text-[9px] text-[#999]">
          {sighting.location}{" "}
          ·{" "}
          {sighting.cameraId}
        </p>

      </div>

      {/* Confidence */}
      <div className="hidden text-right sm:block">

        <p className="text-[10px] font-semibold">
          {
            sighting.confidence
          }%
        </p>

        <p className="text-[8px] text-[#aaa]">
          {sighting.time}
        </p>

      </div>

      <ChevronRight
        size={14}
        className="text-[#c4c4c4] transition group-hover:text-[#e97813]"
      />

    </div>
  );
}


// ============================================================
// INSIGHT ROW
// ============================================================

function InsightRow({
  label,
  value,
  icon: Icon,
  warning = false,
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          warning
            ? "bg-[#fff4e9] text-[#d9782d]"
            : "bg-[#f5f5f3] text-[#777]"
        }`}
      >

        <Icon size={15} />

      </div>

      <p className="flex-1 text-[11px] font-medium text-[#555]">
        {label}
      </p>

      <p
        className={`text-[15px] font-semibold ${
          warning
            ? "text-[#d9782d]"
            : "text-[#222]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


// ============================================================
// TIGER ICON
// ============================================================

function TigerIcon() {
  return (
    <span className="text-[16px] leading-none">
      🐅
    </span>
  );
}


// ============================================================
// SKELETON
// ============================================================

function OverviewSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1450px]">

        {/* Header */}

        <div className="mb-7 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 animate-pulse rounded-[13px] bg-white" />

            <div>

              <div className="h-5 w-28 animate-pulse rounded bg-white" />

              <div className="mt-1 h-2.5 w-40 animate-pulse rounded bg-white" />

            </div>

          </div>

          <div className="h-10 w-32 animate-pulse rounded-full bg-white" />

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[25px] bg-white"
              />
            )
          )}

        </div>

        {/* Main */}

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.8fr_1fr]">

          <div className="space-y-3">

            <div className="h-[410px] animate-pulse rounded-[28px] bg-white" />

            <div className="h-[300px] animate-pulse rounded-[28px] bg-white" />

          </div>

          <div className="space-y-3">

            <div className="h-[250px] animate-pulse rounded-[28px] bg-white" />

            <div className="h-[210px] animate-pulse rounded-[28px] bg-white" />

            <div className="h-[200px] animate-pulse rounded-[28px] bg-white" />

          </div>

        </div>

      </div>

    </main>
  );
}