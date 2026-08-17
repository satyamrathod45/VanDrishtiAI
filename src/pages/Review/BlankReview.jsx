import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  ImageOff,
  Info,
  MapPin,
  RotateCcw,
  SkipForward,
  X,
} from "lucide-react";

import {
  blankReviewQueue,
} from "../../mocks/reviewMockData";


export default function BlankReview() {

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [decision, setDecision] =
    useState(null);

  const [reason, setReason] =
    useState("");

  const [completed, setCompleted] =
    useState([]);

  const current =
    blankReviewQueue[currentIndex];


  if (!current) {
    return (
      <ReviewComplete
        type="Image classification"
      />
    );
  }


  const progress =
    ((currentIndex + 1) /
      blankReviewQueue.length) *
    100;


  const goNext = () => {

    if (!completed.includes(current.id)) {

      setCompleted([
        ...completed,
        current.id,
      ]);

    }

    setDecision(null);
    setReason("");

    if (
      currentIndex <
      blankReviewQueue.length - 1
    ) {

      setCurrentIndex(
        currentIndex + 1
      );

    }

  };


  const goPrevious = () => {

    if (currentIndex > 0) {

      setCurrentIndex(
        currentIndex - 1
      );

      setDecision(null);
      setReason("");

    }

  };


  return (

    <div className="min-h-screen bg-[#f7f7f4] pb-32 text-zinc-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-zinc-200/70 bg-white">

        <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-8">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50"
                onClick={() =>
                  window.history.back()
                }
              >
                <ArrowLeft size={17} />
              </button>

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8892f]/10">

                    <ImageOff
                      size={14}
                      className="text-[#c96b19]"
                    />

                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c96b19]">
                    Human Review
                  </span>

                </div>

                <h1 className="mt-1 text-xl font-semibold tracking-tight">
                  Blank Image Review
                </h1>

              </div>

            </div>


            <div className="text-right">

              <p className="text-sm font-semibold">
                {currentIndex + 1}
                <span className="font-normal text-zinc-400">
                  {" / "}
                  {blankReviewQueue.length}
                </span>
              </p>

              <p className="text-[10px] text-zinc-400">
                images requiring review
              </p>

            </div>

          </div>


          {/* Progress */}

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

      <main className="mx-auto max-w-[1500px] px-5 py-6 md:px-8">

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_380px]">


          {/* =================================================
              IMAGE
          ================================================= */}

          <section>

            <div className="overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">

              <div className="relative flex min-h-[480px] items-center justify-center bg-zinc-950 p-3 md:min-h-[620px]">

                <img
                  src={current.imageUrl}
                  alt="Camera trap image under review"
                  className="max-h-[620px] w-full rounded-2xl object-contain"
                />


                {/* AI confidence badge */}

                <div className="absolute left-6 top-6 rounded-2xl border border-white/20 bg-black/60 px-3 py-2 backdrop-blur-xl">

                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                    AI confidence
                  </p>

                  <div className="mt-1 flex items-center gap-3">

                    <span className="text-sm font-semibold text-white">
                      Blank {current.ai.blankConfidence}%
                    </span>

                    <span className="h-1 w-1 rounded-full bg-white/30" />

                    <span className="text-sm font-semibold text-white">
                      Image {current.ai.meaningfulConfidence}%
                    </span>

                  </div>

                </div>

              </div>


              {/* Image controls */}

              <div className="flex items-center justify-between border-t border-zinc-100 p-3">

                <button
                  onClick={goPrevious}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>


                <span className="text-[10px] text-zinc-400">
                  {current.imageId}
                </span>


                <button
                  onClick={() =>
                    currentIndex <
                    blankReviewQueue.length - 1 &&
                    setCurrentIndex(
                      currentIndex + 1
                    )
                  }
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100"
                >
                  Next
                  <ChevronRight size={15} />
                </button>

              </div>

            </div>

          </section>


          {/* =================================================
              REVIEW PANEL
          ================================================= */}

          <aside className="space-y-4">


            {/* AI RESULT */}

            <div className="rounded-[26px] border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">

              <div className="flex items-center gap-2">

                <CircleAlert
                  size={16}
                  className="text-[#d87820]"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                  Why this needs review
                </p>

              </div>


              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {current.ai.reason}
              </p>


              <div className="mt-4 grid grid-cols-2 gap-2">

                <ConfidenceBox
                  label="Blank"
                  value={`${current.ai.blankConfidence}%`}
                />

                <ConfidenceBox
                  label="Meaningful"
                  value={`${current.ai.meaningfulConfidence}%`}
                />

              </div>

            </div>


            {/* CAMERA */}

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
                  icon={Eye}
                  label="Zone"
                  value={current.camera.zone}
                />

              </div>

            </div>


            {/* DECISION */}

            <div className="rounded-[26px] border border-zinc-200/80 bg-white p-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                Your decision
              </p>


              <div className="mt-4 space-y-2">

                <DecisionButton
                  active={decision === "blank"}
                  icon={X}
                  label="Blank image"
                  description="No meaningful subject"
                  onClick={() =>
                    setDecision("blank")
                  }
                  danger
                />

                <DecisionButton
                  active={decision === "meaningful"}
                  icon={Check}
                  label="Keep image"
                  description="Meaningful content detected"
                  onClick={() =>
                    setDecision("meaningful")
                  }
                  positive
                />

                <DecisionButton
                  active={decision === "uncertain"}
                  icon={Info}
                  label="Cannot determine"
                  description="Needs further review"
                  onClick={() =>
                    setDecision("uncertain")
                  }
                />

              </div>


              {decision && decision !== "uncertain" && (

                <div className="mt-4">

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                    Optional reason
                  </p>

                  <select
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs outline-none focus:border-[#d87820]"
                  >

                    <option value="">
                      Select reason
                    </option>

                    {decision === "blank" ? (

                      <>
                        <option>
                          Empty frame
                        </option>

                        <option>
                          Vegetation
                        </option>

                        <option>
                          Weather / environment
                        </option>

                        <option>
                          Light / heat trigger
                        </option>

                        <option>
                          Other
                        </option>
                      </>

                    ) : (

                      <>
                        <option>
                          Tiger
                        </option>

                        <option>
                          Other animal
                        </option>

                        <option>
                          Human
                        </option>

                        <option>
                          Multiple subjects
                        </option>

                        <option>
                          Other
                        </option>
                      </>

                    )}

                  </select>

                </div>

              )}


              <button
                disabled={!decision}
                onClick={goNext}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
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
// SMALL COMPONENTS
// ============================================================

function ConfidenceBox({
  label,
  value,
}) {

  return (

    <div className="rounded-2xl bg-zinc-50 p-3">

      <p className="text-[10px] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>

    </div>

  );

}


function InfoRow({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="flex items-start gap-3">

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">

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


function DecisionButton({
  active,
  icon: Icon,
  label,
  description,
  onClick,
  danger,
  positive,
}) {

  return (

    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
        active
          ? danger
            ? "border-red-200 bg-red-50"
            : positive
              ? "border-emerald-200 bg-emerald-50"
              : "border-[#e8892f]/30 bg-[#e8892f]/5"
          : "border-zinc-200 bg-white hover:bg-zinc-50"
      }`}
    >

      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
        active
          ? danger
            ? "bg-red-100 text-red-600"
            : positive
              ? "bg-emerald-100 text-emerald-600"
              : "bg-[#e8892f]/10 text-[#c96b19]"
          : "bg-zinc-100 text-zinc-400"
      }`}>

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


function ReviewComplete({
  type,
}) {

  return (

    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-5 pb-20">

      <div className="max-w-md rounded-[30px] border border-zinc-200 bg-white p-8 text-center shadow-xl">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">

          <Check
            size={24}
            className="text-emerald-600"
          />

        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Review queue complete
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          All pending {type.toLowerCase()} items
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