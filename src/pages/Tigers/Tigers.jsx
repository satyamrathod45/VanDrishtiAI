/*
|--------------------------------------------------------------------------
| VanDrishti - Tiger Intelligence
|--------------------------------------------------------------------------
|
| PURPOSE:
| Displays the monitored tiger population and provides navigation
| to individual Tiger Profiles.
|
| DATA SOURCE:
| tigerService.getTigers()
|
| BACKEND CONTRACT:
| GET /api/tigers
|
|--------------------------------------------------------------------------
*/

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  tigerService,
} from "../../services/tigerService";


export default function Tigers() {

  const navigate =
    useNavigate();

  const [tigers, setTigers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [zoneFilter, setZoneFilter] =
    useState("all");


  /*
  |--------------------------------------------------------------------------
  | LOAD TIGERS
  |--------------------------------------------------------------------------
  |
  | Backend developer:
  |
  | Replace the mock implementation behind tigerService.
  | The component should NOT need to change.
  |
  */

  useEffect(() => {

    const loadTigers =
      async () => {

        try {

          const response =
            await tigerService.getTigers();

          if (response.success) {
            setTigers(
              response.data
            );
          }

        } catch (error) {

          console.error(
            "Failed to load tigers:",
            error
          );

        } finally {

          setLoading(false);

        }
      };


    loadTigers();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | FILTER OPTIONS
  |--------------------------------------------------------------------------
  */

  const zones =
    useMemo(() => {

      return [
        "all",
        ...new Set(
          tigers
            .map(
              (tiger) =>
                tiger.currentZone
            )
            .filter(Boolean)
        ),
      ];

    }, [tigers]);


  /*
  |--------------------------------------------------------------------------
  | FILTER TIGERS
  |--------------------------------------------------------------------------
  */

  const filteredTigers =
    useMemo(() => {

      return tigers.filter(
        (tiger) => {

          const matchesSearch =
            tiger.displayId
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            tiger.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            tiger.status ===
              statusFilter;

          const matchesZone =
            zoneFilter ===
              "all" ||
            tiger.currentZone ===
              zoneFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesZone
          );

        }
      );

    }, [
      tigers,
      search,
      statusFilter,
      zoneFilter,
    ]);


  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const identifiedCount =
    tigers.filter(
      (tiger) =>
        tiger.status ===
        "identified"
    ).length;

  const pendingCount =
    tigers.filter(
      (tiger) =>
        tiger.status ===
        "pending"
    ).length;

  const averageConfidence =
    tigers.length
      ? (
          tigers.reduce(
            (sum, tiger) =>
              sum +
              tiger.reidConfidence,
            0
          ) / tigers.length
        ).toFixed(1)
      : "0.0";


  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="mx-auto max-w-[1450px]">

        <div className="flex items-end justify-between">

          <div>

            <p className="text-[10px] font-semibold tracking-[0.4px] text-[#e97813]">
              WILDLIFE INTELLIGENCE
            </p>

            <h1 className="mt-1 text-[29px] font-semibold tracking-[-1.2px]">
              Tiger Population
            </h1>

            <p className="mt-1 text-[11px] text-[#999]">
              Monitor identified tiger entities
              across protected zones.
            </p>

          </div>

          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_5px_20px_rgba(0,0,0,0.035)] sm:flex">

            <Activity
              size={14}
              className="text-[#e97813]"
            />

            <span className="text-[10px] font-medium text-[#666]">
              Live monitoring
            </span>

          </div>

        </div>

      </header>


      {/* ================================================== */}
      {/* SUMMARY */}
      {/* ================================================== */}

      <section className="mx-auto mt-6 grid max-w-[1450px] grid-cols-2 gap-3 lg:grid-cols-4">

        <SummaryCard
          label="Total Tigers"
          value={tigers.length}
        />

        <SummaryCard
          label="Identified"
          value={identifiedCount}
          accent
        />

        <SummaryCard
          label="Pending Identity"
          value={pendingCount}
        />

        <SummaryCard
          label="Avg. Re-ID Confidence"
          value={`${averageConfidence}%`}
        />

      </section>


      {/* ================================================== */}
      {/* FILTER BAR */}
      {/* ================================================== */}

      <section className="mx-auto mt-4 max-w-[1450px] rounded-[24px] bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}

          <div className="flex h-11 flex-1 items-center gap-3 rounded-[14px] bg-[#f7f7f5] px-4">

            <Search
              size={16}
              className="text-[#999]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search Tiger ID..."
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#aaa]"
            />

          </div>


          {/* Zone */}

          <div className="relative">

            <SlidersHorizontal
              size={14}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#888]"
            />

            <select
              value={zoneFilter}
              onChange={(event) =>
                setZoneFilter(
                  event.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-[14px] bg-[#f7f7f5] pl-10 pr-9 text-[11px] font-medium text-[#555] outline-none sm:w-[170px]"
            >

              {zones.map(
                (zone) => (
                  <option
                    key={zone}
                    value={zone}
                  >
                    {zone ===
                    "all"
                      ? "All zones"
                      : zone}
                  </option>
                )
              )}

            </select>

          </div>


          {/* Status */}

          <div className="relative">

            <Filter
              size={14}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#888]"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-[14px] bg-[#f7f7f5] pl-10 pr-9 text-[11px] font-medium text-[#555] outline-none sm:w-[170px]"
            >

              <option value="all">
                All status
              </option>

              <option value="identified">
                Identified
              </option>

              <option value="pending">
                Pending
              </option>

            </select>

          </div>

        </div>

      </section>


      {/* ================================================== */}
      {/* TIGER GRID */}
      {/* ================================================== */}

      <section className="mx-auto mt-4 max-w-[1450px]">

        {loading ? (

          <TigerSkeleton />

        ) : filteredTigers.length === 0 ? (

          <EmptyState />

        ) : (

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

            {filteredTigers.map(
              (tiger) => (

                <TigerCard
                  key={tiger.id}
                  tiger={tiger}
                  onClick={() =>
                    navigate(
                      `/tigers/${tiger.id}`
                    )
                  }
                />

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  accent = false,
}) {

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

      <p className="text-[9px] font-medium uppercase tracking-[0.5px] text-[#999]">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        <p className="text-[27px] font-semibold tracking-[-1.1px]">
          {value}
        </p>

        {accent && (
          <ShieldCheck
            size={15}
            className="text-[#e97813]"
          />
        )}

      </div>

    </div>
  );
}


// ============================================================
// TIGER CARD
// ============================================================

function TigerCard({
  tiger,
  onClick,
}) {

  const isPending =
    tiger.status ===
    "pending";


  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[28px] bg-white text-left shadow-[0_8px_35px_rgba(0,0,0,0.035)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)]"
    >

      {/* ================================================= */}
      {/* IMAGE AREA */}
      {/* ================================================= */}

      <div className="relative h-[230px] overflow-hidden bg-[#e9e9e6]">

        {/* Placeholder until real image storage is connected */}

        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e4e3de] via-[#f1f0ec] to-[#d8d7d1]">

          <span className="text-[75px] opacity-[0.15]">
            🐅
          </span>

        </div>


        {/* ID */}

        <div className="absolute left-4 top-4 rounded-full bg-[#171717]/90 px-3 py-1.5 text-[9px] font-semibold text-white backdrop-blur-md">
          {tiger.displayId}
        </div>


        {/* Status */}

        <div
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[8px] font-semibold backdrop-blur-md ${
            isPending
              ? "bg-[#fff1e4]/95 text-[#c96818]"
              : "bg-[#edf7ef]/95 text-[#579365]"
          }`}
        >
          {isPending
            ? "Pending"
            : "Identified"}
        </div>

      </div>


      {/* ================================================= */}
      {/* INFORMATION */}
      {/* ================================================= */}

      <div className="p-5">

        <div className="flex items-start justify-between">

          <div>

            <h3 className="text-[18px] font-semibold tracking-[-0.5px]">
              {tiger.displayId}
            </h3>

            <p className="mt-1 text-[10px] text-[#999]">
              {tiger.sex}
              {" · "}
              {tiger.ageClass}
            </p>

          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7f7f5] transition-colors group-hover:bg-[#fff1e4]">

            <ChevronRight
              size={15}
              className="text-[#888] transition-colors group-hover:text-[#e97813]"
            />

          </div>

        </div>


        {/* Location */}

        <div className="mt-5 flex items-center justify-between">

          <div>

            <p className="text-[8px] uppercase tracking-[0.5px] text-[#aaa]">
              Current zone
            </p>

            <p className="mt-1 text-[10px] font-semibold text-[#555]">
              {tiger.currentZone}
            </p>

          </div>

          <div className="text-right">

            <p className="text-[8px] uppercase tracking-[0.5px] text-[#aaa]">
              Sightings
            </p>

            <p className="mt-1 text-[10px] font-semibold text-[#555]">
              {tiger.totalSightings}
            </p>

          </div>

        </div>


        {/* Re-ID */}

        <div className="mt-5">

          <div className="flex items-center justify-between">

            <p className="text-[9px] text-[#999]">
              Re-ID confidence
            </p>

            <p className="text-[10px] font-semibold">
              {tiger.reidConfidence}%
            </p>

          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeeec]">

            <div
              className="h-full rounded-full bg-[#e97813]"
              style={{
                width: `${tiger.reidConfidence}%`,
              }}
            />

          </div>

        </div>

      </div>

    </button>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {

  return (
    <div className="rounded-[28px] bg-white px-6 py-20 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f3]">

        <Search
          size={19}
          className="text-[#999]"
        />

      </div>

      <h3 className="mt-4 text-[15px] font-semibold">
        No tigers found
      </h3>

      <p className="mt-1 text-[11px] text-[#999]">
        Try changing your search or filters.
      </p>

    </div>
  );
}


// ============================================================
// LOADING SKELETON
// ============================================================

function TigerSkeleton() {

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

      {[1, 2, 3, 4, 5, 6].map(
        (item) => (

          <div
            key={item}
            className="overflow-hidden rounded-[28px] bg-white"
          >

            <div className="h-[230px] animate-pulse bg-[#eeeeec]" />

            <div className="space-y-4 p-5">

              <div className="h-5 w-20 animate-pulse rounded bg-[#eeeeec]" />

              <div className="h-3 w-28 animate-pulse rounded bg-[#eeeeec]" />

              <div className="h-8 animate-pulse rounded bg-[#eeeeec]" />

              <div className="h-2 animate-pulse rounded bg-[#eeeeec]" />

            </div>

          </div>

        )
      )}

    </div>
  );
}