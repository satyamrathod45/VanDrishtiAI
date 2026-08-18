import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Crosshair,
  Image as ImageIcon,
  Info,
  MapPin,
  Plus,
  UserRound,
  X,
} from "lucide-react";

import {
  tigerReidReviewQueue,
} from "../../mocks/reviewMockData.js";
import { vectorDbService } from "../../services/vectorDbService.js";
import { tigerReid } from "../../services/tigerReid.js";


export default function TigerReidReview() {

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedTiger, setSelectedTiger] =
    useState(null);

  const [decision, setDecision] =
    useState(null);

  const [quality, setQuality] =
    useState("good");

  const [flank, setFlank] =
    useState("left");

  const [note, setNote] =
    useState("");

  const [completed, setCompleted] =
    useState([]);


  const current =
    tigerReidReviewQueue[currentIndex];


  if (!current) {

    return (
      <CompleteScreen />
    );

  }


  const progress =
    ((currentIndex + 1) /
      tigerReidReviewQueue.length) *
    100;


  const confirmAndNext = async () => {

    if (!decision) return;

    // Automatically persist confirmed sighting / new tiger into Vector Database
    if (decision === "new" || decision === "existing") {
      const assignedId = decision === "existing" ? selectedTiger : (current.tigerId || `T-${Date.now().toString().slice(-4)}`);
      try {
        await vectorDbService.init();
        let vector = current.vector;
        if (!vector && (current.cropUrl || current.cropPath || current.image)) {
          const imgUrl = current.cropUrl || current.cropPath || current.image;
          const embRes = await tigerReid.extractEmbedding(imgUrl);
          vector = embRes.vector;
        }

        if (vector) {
          vectorDbService.registerTigerSighting({
            id: current.id || `REVIEW_${Date.now()}`,
            tiger_id: assignedId,
            vector: vector,
            crop_path: current.cropUrl || current.cropPath || current.image,
            source_image: current.sourceImage || current.image || "sighting.jpg",
            camera_id: current.camera || "CAM-01",
            station_name: current.location || "Field Review",
            zone: "Core",
            timestamp: current.timestamp || new Date().toISOString(),
            review_status: "verified",
            verified_by: "Wildlife Officer",
            isNewTiger: decision === "new",
          });
        }
      } catch (err) {
        console.warn("[TigerReidReview] Vector DB registration note:", err.message);
      }
    }

    setCompleted([
      ...completed,
      current.id,
    ]);


    if (
      currentIndex <
      tigerReidReviewQueue.length - 1
    ) {

      setCurrentIndex(
        currentIndex + 1
      );

    }


    setSelectedTiger(null);
    setDecision(null);
    setQuality("good");
    setFlank("left");
    setNote("");

  };


  const previous = () => {

    if (currentIndex > 0) {

      setCurrentIndex(
        currentIndex - 1
      );

      setSelectedTiger(null);
      setDecision(null);

    }

  };


  const nextWithoutDecision = () => {

    if (
      currentIndex <
      tigerReidReviewQueue.length - 1
    ) {

      setCurrentIndex(
        currentIndex + 1
      );

      setSelectedTiger(null);
      setDecision(null);

    }

  };


  return (

    <div className="min-h-screen bg-[#f7f7f4] pb-32 text-zinc-900">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-zinc-200/70 bg-white">

        <div className="mx-auto max-w-[1550px] px-5 py-5 md:px-8">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  window.history.back()
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
              >

                <ArrowLeft size={17} />

              </button>


              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8892f]/10">

                    <Crosshair
                      size={14}
                      className="text-[#c96b19]"
                    />

                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c96b19]">
                    Human Review
                  </span>

                </div>


                <h1 className="mt-1 text-xl font-semibold tracking-tight">
                  Tiger Re-ID Review
                </h1>

              </div>

            </div>


            <div className="text-right">

              <p className="text-sm font-semibold">

                {currentIndex + 1}

                <span className="font-normal text-zinc-400">
                  {" / "}
                  {tigerReidReviewQueue.length}
                </span>

              </p>

              <p className="text-[10px] text-zinc-400">
                identities requiring review
              </p>

            </div>

          </div>


          <div className="mt-5 h-1 overflow-hidden rounded-full bg-zinc-100">

            <div
              className="h-full rounded-full bg-[#d87820] transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1550px] px-5 py-6 md:px-8">

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_420px]">


          {/* =================================================
              IMAGE + REFERENCE AREA
          ================================================= */}

          <section className="space-y-5">


            {/* CURRENT IMAGE */}

            <div className="overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">

              <div className="relative flex min-h-[480px] items-center justify-center bg-zinc-950 p-3 md:min-h-[580px]">

                <img
                  src={current.imageUrl}
                  alt="Tiger under review"
                  className="max-h-[580px] w-full rounded-2xl object-contain"
                />


                <div className="absolute left-6 top-6 rounded-2xl border border-white/20 bg-black/60 px-3 py-2 backdrop-blur-xl">

                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                    AI top prediction
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {current.ai.topPrediction}
                    {" · "}
                    {current.ai.topConfidence}%
                  </p>

                </div>


                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-xl">

                  <button className="rounded-xl px-3 py-2 text-[10px] font-medium text-white/80 hover:bg-white/10">
                    Zoom
                  </button>

                  <button className="rounded-xl px-3 py-2 text-[10px] font-medium text-white/80 hover:bg-white/10">
                    Fullscreen
                  </button>

                </div>

              </div>


              <div className="flex items-center justify-between border-t border-zinc-100 p-3">

                <button
                  onClick={previous}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30"
                >

                  <ChevronLeft size={15} />

                  Previous

                </button>


                <span className="text-[10px] text-zinc-400">
                  {current.imageId}
                </span>


                <button
                  onClick={nextWithoutDecision}
                  disabled={
                    currentIndex ===
                    tigerReidReviewQueue.length - 1
                  }
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30"
                >

                  Next

                  <ChevronRight size={15} />

                </button>

              </div>

            </div>


            {/* REFERENCE CANDIDATES */}

            <div className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    Possible matches
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Select a candidate to compare its reference evidence.
                  </p>

                </div>

                <CircleHelp
                  size={16}
                  className="text-zinc-300"
                />

              </div>


              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {current.ai.candidates.map(
                  (candidate) => {

                    const selected =
                      selectedTiger ===
                      candidate.tigerId;


                    return (

                      <button
                        key={candidate.tigerId}
                        onClick={() => {

                          setSelectedTiger(
                            candidate.tigerId
                          );

                          setDecision(
                            candidate.tigerId ===
                              "UNKNOWN"
                              ? null
                              : "existing"
                          );

                        }}
                        className={`overflow-hidden rounded-2xl border text-left transition ${
                          selected
                            ? "border-[#d87820] bg-[#e8892f]/5 shadow-[0_8px_25px_rgba(216,120,32,0.10)]"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >

                        <div className="relative h-32 bg-zinc-100">

                          <img
                            src={candidate.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
                            {candidate.confidence}%
                          </div>

                        </div>


                        <div className="p-3">

                          <div className="flex items-center justify-between">

                            <p className="text-xs font-semibold">
                              {candidate.tigerId}
                            </p>

                            {selected && (

                              <Check
                                size={14}
                                className="text-[#d87820]"
                              />

                            )}

                          </div>


                          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-400">
                            {candidate.description}
                          </p>

                        </div>

                      </button>

                    );

                  }
                )}

              </div>

            </div>


            {/* REFERENCE DETAILS */}

            {selectedTiger &&
              current.referenceInfo[
                selectedTiger
              ] && (

                <div className="rounded-[28px] border border-zinc-200/80 bg-white p-5">

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    Reference profile
                  </p>


                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <ProfileMetric
                      label="Tiger"
                      value={selectedTiger}
                    />

                    <ProfileMetric
                      label="Last seen"
                      value={
                        current.referenceInfo[
                          selectedTiger
                        ].lastSeen
                      }
                    />

                    <ProfileMetric
                      label="Sightings"
                      value={
                        current.referenceInfo[
                          selectedTiger
                        ].knownSightings
                      }
                    />

                    <ProfileMetric
                      label="Sex"
                      value={
                        current.referenceInfo[
                          selectedTiger
                        ].sex
                      }
                    />

                  </div>

                </div>

              )}

          </section>


          {/* =================================================
              DECISION PANEL
          ================================================= */}

          <aside className="space-y-4">


            {/* AI ANALYSIS */}

            <div className="rounded-[26px] border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                    AI identification
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Model candidates for this image
                  </p>

                </div>

                <Crosshair
                  size={17}
                  className="text-[#d87820]"
                />

              </div>


              <div className="mt-4 space-y-2">

                {current.ai.candidates.map(
                  (candidate, index) => (

                    <div
                      key={candidate.tigerId}
                      className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3"
                    >

                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-semibold text-zinc-400">
                        {index + 1}
                      </span>


                      <div className="min-w-0 flex-1">

                        <p className="text-xs font-semibold">
                          {candidate.tigerId}
                        </p>

                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-200">

                          <div
                            className="h-full rounded-full bg-[#d87820]"
                            style={{
                              width: `${candidate.confidence}%`,
                            }}
                          />

                        </div>

                      </div>


                      <span className="text-xs font-semibold">
                        {candidate.confidence}%
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* CAPTURE INFO */}

            <div className="rounded-[26px] border border-zinc-200/80 bg-white p-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                Capture information
              </p>


              <div className="mt-4 space-y-3">

                <InfoRow
                  icon={MapPin}
                  label="Camera"
                  value={`${current.camera.id} · ${current.camera.name}`}
                />

                <InfoRow
                  icon={Clock3}
                  label="Captured"
                  value={current.capturedAt}
                />

                <InfoRow
                  icon={ImageIcon}
                  label="Image quality"
                  value={current.imageQuality}
                />

              </div>

            </div>


            {/* DECISION */}

            <div className="rounded-[26px] border border-zinc-200/80 bg-white p-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                Your decision
              </p>


              <div className="mt-4 space-y-2">

                {current.ai.candidates
                  .filter(
                    (candidate) =>
                      candidate.tigerId !==
                      "UNKNOWN"
                  )
                  .map((candidate) => (

                    <DecisionButton
                      key={candidate.tigerId}
                      active={
                        decision ===
                          "existing" &&
                        selectedTiger ===
                          candidate.tigerId
                      }
                      icon={Check}
                      label={
                        `Confirm ${candidate.tigerId}`
                      }
                      description="Match this image to an existing tiger"
                      onClick={() => {

                        setSelectedTiger(
                          candidate.tigerId
                        );

                        setDecision(
                          "existing"
                        );

                      }}
                    />

                  ))}


                <DecisionButton
                  active={
                    decision === "new"
                  }
                  icon={Plus}
                  label="New tiger candidate"
                  description="No existing tiger is a reliable match"
                  onClick={() => {

                    setDecision("new");
                    setSelectedTiger(null);

                  }}
                />


                <DecisionButton
                  active={
                    decision === "not-tiger"
                  }
                  icon={X}
                  label="Not a tiger"
                  description="AI detection is incorrect"
                  onClick={() => {

                    setDecision(
                      "not-tiger"
                    );

                    setSelectedTiger(
                      null
                    );

                  }}
                />


                <DecisionButton
                  active={
                    decision === "uncertain"
                  }
                  icon={CircleHelp}
                  label="Cannot determine"
                  description="Insufficient evidence"
                  onClick={() => {

                    setDecision(
                      "uncertain"
                    );

                    setSelectedTiger(
                      null
                    );

                  }}
                />

              </div>


              {/* Quality */}

              <div className="mt-5">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Image quality
                </p>

                <div className="mt-2 grid grid-cols-3 gap-2">

                  {[
                    "good",
                    "fair",
                    "poor",
                  ].map((value) => (

                    <button
                      key={value}
                      onClick={() =>
                        setQuality(value)
                      }
                      className={`rounded-xl py-2 text-[10px] font-semibold capitalize transition ${
                        quality === value
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      {value}
                    </button>

                  ))}

                </div>

              </div>


              {/* Flank */}

              <div className="mt-4">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Visible flank
                </p>

                <div className="mt-2 grid grid-cols-4 gap-1.5">

                  {[
                    ["left", "Left"],
                    ["right", "Right"],
                    ["both", "Both"],
                    ["unclear", "Unclear"],
                  ].map(
                    ([value, label]) => (

                      <button
                        key={value}
                        onClick={() =>
                          setFlank(value)
                        }
                        className={`rounded-xl px-1 py-2 text-[9px] font-semibold transition ${
                          flank === value
                            ? "bg-[#e8892f]/10 text-[#c96b19]"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {label}
                      </button>

                    )
                  )}

                </div>

              </div>


              {/* New tiger note */}

              {decision === "new" && (

                <div className="mt-4">

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                    Review note
                  </p>

                  <textarea
                    value={note}
                    onChange={(e) =>
                      setNote(e.target.value)
                    }
                    rows={3}
                    placeholder="Why does this appear to be a new individual?"
                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs outline-none focus:border-[#d87820]"
                  />

                </div>

              )}


              {/* Confirm */}

              <button
                disabled={!decision}
                onClick={confirmAndNext}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
              >

                Confirm & Next

                <ArrowRight size={15} />

              </button>

            </div>

          </aside>

        </div>

      </main>

    </div>

  );
}


// ============================================================
// COMPONENTS
// ============================================================

function InfoRow({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="flex items-start gap-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">

        <Icon
          size={13}
          className="text-zinc-500"
        />

      </div>

      <div className="min-w-0">

        <p className="text-[10px] text-zinc-400">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-medium text-zinc-700">
          {value}
        </p>

      </div>

    </div>

  );

}


function ProfileMetric({
  label,
  value,
}) {

  return (

    <div className="rounded-2xl bg-zinc-50 p-3">

      <p className="text-[10px] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-zinc-700">
        {value}
      </p>

    </div>

  );

}


function DecisionButton({
  active,
  icon: Icon,
  label,
  description,
  onClick,
}) {

  return (

    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
        active
          ? "border-[#e8892f]/40 bg-[#e8892f]/5"
          : "border-zinc-200 hover:bg-zinc-50"
      }`}
    >

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-[#e8892f]/10 text-[#c96b19]"
            : "bg-zinc-100 text-zinc-400"
        }`}
      >

        <Icon size={15} />

      </div>


      <div>

        <p className="text-xs font-semibold text-zinc-800">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] text-zinc-400">
          {description}
        </p>

      </div>

    </button>

  );

}


function CompleteScreen() {

  return (

    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-5">

      <div className="max-w-md rounded-[30px] border border-zinc-200 bg-white p-8 text-center shadow-xl">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">

          <Check
            size={24}
            className="text-emerald-600"
          />

        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Re-ID review complete
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          All pending tiger identification cases
          in this mock queue have been reviewed.
        </p>

        <button
          onClick={() =>
            window.history.back()
          }
          className="mt-6 rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-semibold text-white"
        >
          Return to Processing
        </button>

      </div>

    </div>

  );

}