/*
|--------------------------------------------------------------------------
| VanDrishti - Tiger Profile
|--------------------------------------------------------------------------
|
| PURPOSE:
| Detailed intelligence profile for a single tiger entity.
|
| DATA SOURCES:
|
| GET /api/tigers/:tigerId
| GET /api/tigers/:tigerId/sightings
| GET /api/tigers/:tigerId/reid
|
| IMPORTANT:
| This page represents the relationship between:
|
| Tiger
|   ├── Identity
|   ├── Re-ID results
|   ├── Sightings
|   ├── Cameras
|   └── Image evidence
|
|--------------------------------------------------------------------------
*/

import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  tigerService,
} from "../../services/tigerService";


export default function TigerProfile() {

  const navigate =
    useNavigate();

  const { tigerId } =
    useParams();


  const [tiger, setTiger] =
    useState(null);

  const [sightings, setSightings] =
    useState([]);

  const [reidHistory, setReidHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /*
  |--------------------------------------------------------------------------
  | LOAD TIGER PROFILE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          setLoading(true);

          const [
            tigerResponse,
            sightingsResponse,
            reidResponse,
          ] = await Promise.all([
            tigerService.getTiger(
              tigerId
            ),

            tigerService.getTigerSightings(
              tigerId
            ),

            tigerService.getTigerReidHistory(
              tigerId
            ),
          ]);


          if (
            tigerResponse.success
          ) {
            setTiger(
              tigerResponse.data
            );
          }


          if (
            sightingsResponse.success
          ) {
            setSightings(
              sightingsResponse.data
            );
          }


          if (
            reidResponse.success
          ) {
            setReidHistory(
              reidResponse.data
            );
          }

        } catch (error) {

          console.error(
            "Failed to load tiger profile:",
            error
          );

        } finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, [tigerId]);


  if (loading) {
    return (
      <ProfileSkeleton />
    );
  }


  if (!tiger) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">

        <div className="text-center">

          <p className="text-[15px] font-semibold">
            Tiger not found
          </p>

          <button
            onClick={() =>
              navigate(
                "/tigers"
              )
            }
            className="mt-4 text-[11px] font-semibold text-[#e97813]"
          >
            Return to Tigers
          </button>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1200px]">

        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        <button
          onClick={() =>
            navigate(
              "/tigers"
            )
          }
          className="mb-5 flex items-center gap-2 text-[10px] font-semibold text-[#777] transition hover:text-[#e97813]"
        >

          <ArrowLeft
            size={14}
          />

          Back to Tigers

        </button>


        {/* ================================================= */}
        {/* PROFILE HEADER */}
        {/* ================================================= */}

        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

            {/* IMAGE */}

            <div className="relative min-h-[340px] bg-[#e5e4df]">

              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#deddd7] via-[#f0efeb] to-[#d2d1cb]">

                <span className="text-[130px] opacity-[0.12]">
                  🐅
                </span>

              </div>


              <div className="absolute left-6 top-6 rounded-full bg-[#171717]/90 px-4 py-2 text-[9px] font-semibold text-white backdrop-blur-md">
                {tiger.displayId}
              </div>


              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 backdrop-blur-xl">

                <span className="h-2 w-2 rounded-full bg-[#63a66a]" />

                <span className="text-[9px] font-semibold text-[#555]">
                  {tiger.identificationStatus}
                </span>

              </div>

            </div>


            {/* IDENTITY */}

            <div className="p-7 sm:p-9">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold tracking-[0.4px] text-[#e97813]">
                    TIGER IDENTITY
                  </p>

                  <h1 className="mt-1 text-[31px] font-semibold tracking-[-1.2px]">
                    {tiger.displayId}
                  </h1>

                  <p className="mt-1 text-[11px] text-[#999]">
                    {tiger.sex}
                    {" · "}
                    {tiger.ageClass}
                  </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171717]">

                  <ShieldCheck
                    size={19}
                    className="text-[#ef7d16]"
                  />

                </div>

              </div>


              <p className="mt-6 max-w-[500px] text-[12px] leading-6 text-[#777]">
                {tiger.description}
              </p>


              {/* Identity data */}

              <div className="mt-7 grid grid-cols-2 gap-5">

                <InfoItem
                  label="Current zone"
                  value={
                    tiger.currentZone
                  }
                  icon={MapPin}
                />

                <InfoItem
                  label="Last camera"
                  value={
                    tiger.lastCameraId
                  }
                  icon={Camera}
                />

                <InfoItem
                  label="Total sightings"
                  value={
                    tiger.totalSightings
                  }
                  icon={Activity}
                />

                <InfoItem
                  label="Last detected"
                  value={formatDate(
                    tiger.lastSeen
                  )}
                  icon={Clock3}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* RE-ID + SIGHTING */}
        {/* ================================================= */}

        <section className="mt-3 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">

          {/* RE-ID */}

          <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                  RE-IDENTIFICATION
                </p>

                <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.6px]">
                  Identity confidence
                </h2>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1e4]">

                <ScanLine
                  size={16}
                  className="text-[#e97813]"
                />

              </div>

            </div>


            <div className="mt-7">

              <div className="flex items-end justify-between">

                <p className="text-[42px] font-semibold tracking-[-2px]">
                  {
                    tiger.reidConfidence
                  }
                  %
                </p>

                <span className="mb-2 rounded-full bg-[#edf7ef] px-3 py-1.5 text-[8px] font-semibold text-[#579365]">
                  High confidence
                </span>

              </div>


              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eeeeec]">

                <div
                  className="h-full rounded-full bg-[#e97813]"
                  style={{
                    width: `${tiger.reidConfidence}%`,
                  }}
                />

              </div>


              <p className="mt-3 text-[10px] leading-5 text-[#999]">
                Confidence represents the current
                model-supported probability that the
                observed tiger matches this identity.
              </p>

            </div>


            {/* Re-ID history */}

            <div className="mt-7 border-t border-[#eeeeec] pt-5">

              <p className="mb-4 text-[9px] font-semibold text-[#888]">
                RECENT RE-ID MATCHES
              </p>

              <div className="space-y-3">

                {reidHistory
                  .slice(0, 3)
                  .map(
                    (match) => (

                      <div
                        key={
                          match.id
                        }
                        className="flex items-center justify-between"
                      >

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f3]">

                            <CheckCircle2
                              size={13}
                              className="text-[#63a66a]"
                            />

                          </div>

                          <div>

                            <p className="text-[9px] font-semibold">
                              {match.imageId}
                            </p>

                            <p className="text-[8px] text-[#aaa]">
                              {formatDate(
                                match.matchedAt
                              )}
                            </p>

                          </div>

                        </div>

                        <p className="text-[10px] font-semibold">
                          {
                            match.candidateConfidence
                          }%
                        </p>

                      </div>

                    )
                  )}

              </div>

            </div>

          </section>


          {/* SIGHTINGS */}

          <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                  SIGHTING HISTORY
                </p>

                <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.6px]">
                  Recent observations
                </h2>

              </div>

              <Activity
                size={18}
                className="text-[#888]"
              />

            </div>


            <div className="mt-6 space-y-2">

              {sightings.map(
                (sighting) => (

                  <div
                    key={
                      sighting.id
                    }
                    className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#fafaf8]"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#171717]">

                      <Camera
                        size={14}
                        className="text-[#ef7d16]"
                      />

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="text-[10px] font-semibold">
                        {
                          sighting.location
                        }
                      </p>

                      <p className="mt-0.5 text-[8px] text-[#999]">
                        {
                          sighting.cameraId
                        }
                        {" · "}
                        {formatDate(
                          sighting.timestamp
                        )}
                      </p>

                    </div>


                    <div className="text-right">

                      <p className="text-[10px] font-semibold">
                        {
                          sighting.confidence
                        }%
                      </p>

                      <p className="text-[8px] text-[#aaa]">
                        {
                          sighting.status
                        }
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        </section>


        {/* ================================================= */}
        {/* IMAGE EVIDENCE */}
        {/* ================================================= */}

        <section className="mt-3 rounded-[28px] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                IMAGE EVIDENCE
              </p>

              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.6px]">
                Identity evidence
              </h2>

            </div>

            <button className="flex items-center gap-1 text-[9px] font-semibold text-[#e97813]">
              View all
            </button>

          </div>


          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

            {sightings.map(
              (sighting) => (

                <div
                  key={
                    sighting.id
                  }
                  className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#e8e7e2]"
                >

                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#deddd7] to-[#f0efeb]">

                    <span className="text-[50px] opacity-[0.13]">
                      🐅
                    </span>

                  </div>


                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3">

                    <p className="text-[8px] font-semibold text-white">
                      {sighting.id}
                    </p>

                    <p className="mt-0.5 text-[7px] text-white/70">
                      {
                        sighting.cameraId
                      }
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </div>

    </main>
  );
}


// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
  icon: Icon,
}) {

  return (
    <div className="flex items-center gap-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f3]">

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


// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(
  dateString
) {

  if (!dateString) {
    return "Unknown";
  }

  const date =
    new Date(dateString);

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


// ============================================================
// PROFILE LOADING SKELETON
// ============================================================

function ProfileSkeleton() {

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1200px]">

        <div className="mb-5 h-4 w-24 animate-pulse rounded bg-white" />

        <div className="overflow-hidden rounded-[30px] bg-white">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

            <div className="h-[340px] animate-pulse bg-[#eeeeec]" />

            <div className="space-y-6 p-9">

              <div className="h-7 w-32 animate-pulse rounded bg-[#eeeeec]" />

              <div className="h-3 w-52 animate-pulse rounded bg-[#eeeeec]" />

              <div className="h-16 animate-pulse rounded bg-[#eeeeec]" />

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