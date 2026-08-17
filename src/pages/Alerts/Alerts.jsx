import { useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Crosshair,
  Eye,
  Filter,
  Info,
  MapPin,
  Search,
  ShieldAlert,
} from "lucide-react";

import {
  alerts,
  alertStats,
} from "../../mocks/alertsMockData.js";


// ============================================================
// ALERT PAGE
// ============================================================

export default function Alerts() {

  const [selectedAlertId, setSelectedAlertId] =
    useState(alerts[0]?.id);

  const [filter, setFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showFilters, setShowFilters] =
    useState(false);


  // ----------------------------------------------------------
  // FILTER ALERTS
  // ----------------------------------------------------------

  const filteredAlerts = useMemo(() => {

    return alerts.filter((alert) => {

      const matchesType =
        filter === "all" ||
        alert.type === filter;

      const matchesStatus =
        statusFilter === "all" ||
        alert.status === statusFilter;

      const query =
        search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        alert.id
          .toLowerCase()
          .includes(query) ||
        alert.title
          .toLowerCase()
          .includes(query) ||
        alert.tiger.name
          .toLowerCase()
          .includes(query) ||
        alert.location.cameraName
          .toLowerCase()
          .includes(query);

      return (
        matchesType &&
        matchesStatus &&
        matchesSearch
      );

    });

  }, [
    filter,
    statusFilter,
    search,
  ]);


  const selectedAlert =
    alerts.find(
      (alert) =>
        alert.id === selectedAlertId
    );


  return (

    <div className="min-h-screen bg-[#f7f7f4] text-zinc-900 pb-32">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="px-5 pt-7 md:px-8 lg:px-10">

        <div className="mx-auto max-w-[1500px]">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8892f]/10">

                  <ShieldAlert
                    size={17}
                    className="text-[#d87820]"
                  />

                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Intelligence Center
                </span>

              </div>


              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Alerts
              </h1>


              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Meaningful changes in tiger activity that may
                require investigation or field attention.
              </p>

            </div>


            <div className="flex items-center gap-2">

              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 shadow-sm">

                <div className="h-2 w-2 rounded-full bg-[#d87820]" />

                <span className="text-xs font-medium text-zinc-600">
                  Monitoring active
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <SummaryCard
              label="Total alerts"
              value={alertStats.total}
              icon={Bell}
            />

            <SummaryCard
              label="High priority"
              value={alertStats.highPriority}
              icon={ShieldAlert}
              accent="orange"
            />

            <SummaryCard
              label="Needs review"
              value={alertStats.needsReview}
              icon={Eye}
            />

            <SummaryCard
              label="Resolved"
              value={alertStats.resolved}
              icon={Check}
            />

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN WORKSPACE
      ===================================================== */}

      <main className="mx-auto mt-7 max-w-[1500px] px-5 md:px-8 lg:px-10">

        <div className="grid gap-5 xl:grid-cols-[minmax(400px,0.85fr)_minmax(600px,1.4fr)]">


          {/* =================================================
              LEFT: ALERT FEED
          ================================================= */}

          <section className="min-w-0">

            {/* Search / filter */}

            <div className="rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">

              <div className="flex gap-2">

                <div className="relative flex-1">

                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search alerts, tigers, cameras..."
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#e8892f] focus:bg-white"
                  />

                </div>


                <button
                  onClick={() =>
                    setShowFilters(!showFilters)
                  }
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
                    showFilters
                      ? "border-[#e8892f] bg-[#e8892f]/10 text-[#c96b19]"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                  }`}
                >
                  <Filter size={17} />
                </button>

              </div>


              {/* Filters */}

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">

                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  All
                </FilterButton>

                <FilterButton
                  active={filter === "buffer-movement"}
                  onClick={() =>
                    setFilter("buffer-movement")
                  }
                >
                  Buffer
                </FilterButton>

                <FilterButton
                  active={filter === "new-station"}
                  onClick={() =>
                    setFilter("new-station")
                  }
                >
                  New station
                </FilterButton>

                <FilterButton
                  active={filter === "range-shift"}
                  onClick={() =>
                    setFilter("range-shift")
                  }
                >
                  Range shift
                </FilterButton>

                <FilterButton
                  active={filter === "prolonged-absence"}
                  onClick={() =>
                    setFilter("prolonged-absence")
                  }
                >
                  Absence
                </FilterButton>

              </div>


              {showFilters && (

                <div className="mt-3 border-t border-zinc-100 pt-3">

                  <p className="mb-2 text-xs font-semibold text-zinc-400">
                    STATUS
                  </p>

                  <div className="flex gap-2">

                    {[
                      ["all", "All"],
                      ["new", "New"],
                      ["review", "Review"],
                      ["acknowledged", "Acknowledged"],
                    ].map(([value, label]) => (

                      <button
                        key={value}
                        onClick={() =>
                          setStatusFilter(value)
                        }
                        className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                          statusFilter === value
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {label}
                      </button>

                    ))}

                  </div>

                </div>

              )}

            </div>


            {/* Alert count */}

            <div className="flex items-center justify-between px-1 py-4">

              <span className="text-sm font-medium text-zinc-500">
                {filteredAlerts.length} alerts
              </span>

              <span className="text-xs text-zinc-400">
                Sorted by priority
              </span>

            </div>


            {/* Alert list */}

            <div className="space-y-3">

              {filteredAlerts.map((alert) => (

                <AlertCard
                  key={alert.id}
                  alert={alert}
                  selected={
                    selectedAlertId === alert.id
                  }
                  onClick={() =>
                    setSelectedAlertId(alert.id)
                  }
                />

              ))}


              {filteredAlerts.length === 0 && (

                <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">

                    <Search
                      size={20}
                      className="text-zinc-400"
                    />

                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    No alerts found
                  </h3>

                  <p className="mt-1 text-xs text-zinc-400">
                    Try changing your search or filters.
                  </p>

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              RIGHT: INVESTIGATION PANEL
          ================================================= */}

          <section className="hidden min-w-0 xl:block">

            {selectedAlert && (

              <InvestigationPanel
                alert={selectedAlert}
              />

            )}

          </section>

        </div>

      </main>


      {/* =====================================================
          MOBILE INVESTIGATION
      ===================================================== */}

      {selectedAlert && (

        <div className="mt-5 px-5 xl:hidden">

          <InvestigationPanel
            alert={selectedAlert}
          />

        </div>

      )}

    </div>

  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}) {

  return (

    <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(0,0,0,0.035)]">

      <div className="flex items-center justify-between">

        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          accent === "orange"
            ? "bg-[#e8892f]/10"
            : "bg-zinc-100"
        }`}>

          <Icon
            size={17}
            className={
              accent === "orange"
                ? "text-[#d87820]"
                : "text-zinc-500"
            }
          />

        </div>

        <ArrowUpRight
          size={15}
          className="text-zinc-300"
        />

      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-0.5 text-xs text-zinc-400">
        {label}
      </p>

    </div>

  );
}


// ============================================================
// FILTER BUTTON
// ============================================================

function FilterButton({
  active,
  onClick,
  children,
}) {

  return (

    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition ${
        active
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      }`}
    >
      {children}
    </button>

  );
}


// ============================================================
// ALERT CARD
// ============================================================

function AlertCard({
  alert,
  selected,
  onClick,
}) {

  const severity =
    getSeverityConfig(alert.severity);

  const Icon =
    getAlertIcon(alert.type);


  return (

    <button
      onClick={onClick}
      className={`group w-full rounded-3xl border p-4 text-left transition ${
        selected
          ? "border-[#e8892f]/40 bg-white shadow-[0_14px_45px_rgba(216,120,32,0.10)]"
          : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.05)]"
      }`}
    >

      <div className="flex gap-3.5">

        {/* Severity indicator */}

        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${severity.bg}`}
        >

          <Icon
            size={18}
            className={severity.text}
          />

        </div>


        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div>

              <div className="flex items-center gap-2">

                <span className={`text-[10px] font-bold uppercase tracking-[0.13em] ${severity.text}`}>
                  {severity.label}
                </span>

                {alert.status === "new" && (

                  <span className="rounded-full bg-[#e8892f]/10 px-2 py-0.5 text-[9px] font-semibold text-[#c96b19]">
                    NEW
                  </span>

                )}

              </div>

              <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                {alert.title}
              </h3>

            </div>


            <ChevronRight
              size={17}
              className={`shrink-0 text-zinc-300 transition ${
                selected
                  ? "translate-x-0.5 text-[#d87820]"
                  : "group-hover:translate-x-0.5"
              }`}
            />

          </div>


          <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
            {alert.description}
          </p>


          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

            <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">

              <Crosshair size={12} />

              {alert.tiger.id}

            </span>


            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">

              <MapPin size={12} />

              {alert.location.cameraId}

            </span>


            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">

              <Clock3 size={12} />

              {alert.timeAgo}

            </span>

          </div>

        </div>

      </div>

    </button>

  );
}


// ============================================================
// INVESTIGATION PANEL
// ============================================================

function InvestigationPanel({
  alert,
}) {

  const severity =
    getSeverityConfig(alert.severity);


  return (

    <div className="sticky top-6 overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">


      {/* =====================================================
          INVESTIGATION HEADER
      ===================================================== */}

      <div className="border-b border-zinc-100 p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${severity.bg}`}>

                <ShieldAlert
                  size={17}
                  className={severity.text}
                />

              </div>

              <div>

                <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${severity.text}`}>
                  {severity.label} priority
                </p>

                <h2 className="mt-0.5 text-lg font-semibold">
                  {alert.title}
                </h2>

              </div>

            </div>

          </div>


          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            {alert.status}
          </span>

        </div>


        {/* Tiger identity */}

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">

          <img
            src={alert.tiger.image}
            alt={alert.tiger.name}
            className="h-12 w-12 rounded-xl object-cover"
          />

          <div className="min-w-0 flex-1">

            <p className="text-sm font-semibold">
              {alert.tiger.name}
            </p>

            <p className="mt-0.5 text-xs text-zinc-400">
              {alert.tiger.sex} · {alert.tiger.age}
            </p>

          </div>


          <button className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900">

            View tiger

          </button>

        </div>

      </div>


      {/* =====================================================
          WHY THIS ALERT?
      ===================================================== */}

      <div className="border-b border-zinc-100 p-5">

        <SectionLabel>
          Why this alert?
        </SectionLabel>


        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {alert.analysis.reason}
        </p>


        <div className="mt-4 grid grid-cols-2 gap-3">

          <AnalysisMetric
            label="Confidence"
            value={`${alert.analysis.confidence}%`}
          />

          <AnalysisMetric
            label="Detections"
            value={alert.analysis.detectionCount}
          />

          <AnalysisMetric
            label="Stations"
            value={alert.analysis.affectedStations}
          />

          <AnalysisMetric
            label="Camera"
            value={alert.location.cameraId}
          />

        </div>

      </div>


      {/* =====================================================
          BASELINE VS CURRENT
      ===================================================== */}

      <div className="border-b border-zinc-100 p-5">

        <SectionLabel>
          Activity comparison
        </SectionLabel>


        <div className="mt-3 space-y-3">

          <ComparisonRow
            label="Historical baseline"
            text={alert.analysis.baseline}
          />

          <ComparisonRow
            label="Current observation"
            text={alert.analysis.currentObservation}
            highlighted
          />

        </div>

      </div>


      {/* =====================================================
          MAP
      ===================================================== */}

      <div className="border-b border-zinc-100 p-5">

        <div className="flex items-center justify-between">

          <SectionLabel>
            Location evidence
          </SectionLabel>

          <span className="text-[10px] text-zinc-400">
            {alert.location.zone}
          </span>

        </div>


        <div className="relative mt-3 h-52 overflow-hidden rounded-2xl bg-[#e9eee7]">

          {/* Decorative map grid */}

          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(80,90,70,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(80,90,70,.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />


          {/* Zone shapes */}

          <div className="absolute left-[8%] top-[16%] h-28 w-40 rounded-[45%] bg-[#b8c9a8]/50 blur-[1px]" />

          <div className="absolute bottom-[12%] right-[6%] h-24 w-44 rounded-[50%] bg-[#d9b58a]/40" />


          {/* Camera markers */}

          <MapMarker
            left="25%"
            top="35%"
            label="CAM-018"
            active
          />

          <MapMarker
            left="54%"
            top="51%"
            label="CAM-021"
          />

          <MapMarker
            left="72%"
            top="69%"
            label="CAM-022"
          />


          {/* Tiger path */}

          <div className="absolute left-[28%] top-[43%] h-[2px] w-[47%] rotate-[18deg] origin-left bg-[#d87820]/60" />


          {/* Map label */}

          <div className="absolute bottom-3 left-3 rounded-xl border border-white/70 bg-white/80 px-3 py-2 backdrop-blur-md">

            <p className="text-[10px] font-semibold text-zinc-700">
              {alert.location.cameraName}
            </p>

            <p className="mt-0.5 text-[9px] text-zinc-400">
              {alert.location.latitude.toFixed(4)}°
              {" · "}
              {alert.location.longitude.toFixed(4)}°
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          EVIDENCE
      ===================================================== */}

      <div className="border-b border-zinc-100 p-5">

        <div className="flex items-center justify-between">

          <SectionLabel>
            Evidence
          </SectionLabel>

          <span className="text-[10px] font-medium text-zinc-400">
            {alert.evidence.length} images
          </span>

        </div>


        {alert.evidence.length > 0 ? (

          <div className="mt-3 flex gap-2 overflow-hidden">

            {alert.evidence
              .slice(0, 3)
              .map((item) => (

                <div
                  key={item.id}
                  className="group relative h-20 flex-1 overflow-hidden rounded-xl bg-zinc-100"
                >

                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 backdrop-blur-sm">

                    <p className="truncate text-[8px] font-medium text-white">
                      {item.camera}
                    </p>

                  </div>

                </div>

              ))}

          </div>

        ) : (

          <div className="mt-3 rounded-2xl bg-zinc-50 p-4 text-center">

            <Info
              size={16}
              className="mx-auto text-zinc-400"
            />

            <p className="mt-2 text-xs text-zinc-400">
              No direct image evidence attached.
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          RECOMMENDATION
      ===================================================== */}

      <div className="p-5">

        <div className="rounded-2xl bg-[#e8892f]/[0.07] p-4">

          <div className="flex gap-3">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8892f]/10">

              <Info
                size={15}
                className="text-[#c96b19]"
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-zinc-800">
                Suggested next step
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {alert.recommendation}
              </p>

            </div>

          </div>

        </div>


        {/* Actions */}

        <div className="mt-4 flex gap-2">

          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800">

            <Check size={14} />

            Acknowledge

          </button>


          <button className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50">

            Resolve

          </button>

        </div>

      </div>

    </div>

  );
}


// ============================================================
// SMALL COMPONENTS
// ============================================================

function SectionLabel({
  children,
}) {

  return (

    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
      {children}
    </p>

  );

}


function AnalysisMetric({
  label,
  value,
}) {

  return (

    <div className="rounded-2xl bg-zinc-50 p-3">

      <p className="text-[10px] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-800">
        {value}
      </p>

    </div>

  );

}


function ComparisonRow({
  label,
  text,
  highlighted,
}) {

  return (

    <div className={`rounded-2xl p-3 ${
      highlighted
        ? "bg-[#e8892f]/[0.07]"
        : "bg-zinc-50"
    }`}>

      <div className="flex items-center gap-2">

        <div className={`h-1.5 w-1.5 rounded-full ${
          highlighted
            ? "bg-[#d87820]"
            : "bg-zinc-300"
        }`} />

        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          {label}
        </p>

      </div>

      <p className="mt-2 text-xs leading-5 text-zinc-600">
        {text}
      </p>

    </div>

  );

}


function MapMarker({
  left,
  top,
  label,
  active,
}) {

  return (

    <div
      className="absolute"
      style={{
        left,
        top,
      }}
    >

      <div className="relative">

        {active && (

          <div className="absolute -inset-2 animate-ping rounded-full bg-[#d87820]/20" />

        )}

        <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow ${
          active
            ? "bg-[#d87820]"
            : "bg-zinc-700"
        }`}>

          <MapPin
            size={11}
            className="text-white"
          />

        </div>


        <span className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/80 px-1.5 py-1 text-[8px] font-semibold text-zinc-500 shadow-sm backdrop-blur">
          {label}
        </span>

      </div>

    </div>

  );
}


// ============================================================
// ALERT CONFIG
// ============================================================

function getSeverityConfig(
  severity
) {

  switch (severity) {

    case "high":

      return {
        label: "High",
        bg: "bg-red-50",
        text: "text-red-600",
      };

    case "medium":

      return {
        label: "Medium",
        bg: "bg-[#e8892f]/10",
        text: "text-[#c96b19]",
      };

    default:

      return {
        label: "Information",
        bg: "bg-blue-50",
        text: "text-blue-600",
      };

  }

}


function getAlertIcon(type) {

  switch (type) {

    case "buffer-movement":
      return ShieldAlert;

    case "new-station":
      return MapPin;

    case "range-shift":
      return Crosshair;

    case "prolonged-absence":
      return Clock3;

    default:
      return AlertTriangle;

  }

}