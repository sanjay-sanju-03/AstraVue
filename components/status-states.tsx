"use client";

import { useEffect, useState } from "react";
import { toDisplayUrl } from "@/lib/feature-theme";

const STAGES = [
  "Receiving image",
  "Examining visible structures",
  "Identifying visible features",
  "Generating explanation",
];

/** Presents the application's observable analysis workflow without inventing a percentage. */
export function AnalysisLoading({ imageSrc }: { imageSrc: string | null }) {
  const [stage, setStage] = useState(0);
  const displayUrl = toDisplayUrl(imageSrc);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-panel-border bg-panel"
    >
      <div className="px-6 pb-5 pt-7 text-center md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          AI visual analysis
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
          Looking closely at your image.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted md:text-base">
          AstraVue is examining visible structures, identifying features, and preparing a plain-language explanation.
        </p>
      </div>

      <div className="px-4 md:px-8">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-[#07121a]">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="NASA image being analyzed"
              className="absolute inset-0 h-full w-full object-contain opacity-90"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-white/60">
              Preparing image
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px animate-scan bg-primary shadow-[0_0_14px_2px_rgba(45,212,191,0.65)]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        </div>
      </div>

      <div className="px-6 py-7 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Analysis pipeline
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STAGES.map((s, i) => (
            <li
              key={s}
              aria-current={i === stage ? "step" : undefined}
              className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors duration-300 ${
                i === stage
                  ? "border-primary/40 bg-primary/[0.06] text-foreground"
                  : i < stage
                    ? "border-success/25 bg-success/[0.04] text-muted"
                    : "border-panel-border text-faint"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${
                  i < stage
                    ? "border-success/50 bg-success/15 text-success"
                    : i === stage
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-panel-border"
                }`}
              >
                {i < stage ? "✓" : i === stage ? "●" : String(i + 1).padStart(2, "0")}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          Vision model · Processing
        </p>
      </div>
    </div>
  );
}

/** Calm error surface. Technical detail hidden behind a disclosure, never a red banner. */
export function AnalysisError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-panel-border bg-panel px-7 py-12 text-center">
      <div
        aria-hidden="true"
        className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-error/25 bg-error/10 text-error"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 6v5M10 14h.01" strokeLinecap="round" />
          <circle cx="10" cy="10" r="7.5" />
        </svg>
      </div>

      <h2 className="mt-6 text-xl font-semibold">We couldn&apos;t finish that</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
        {message || "We couldn't analyze this image. Please try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="pressable mt-7 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-[#0b625c]"
      >
        Try again
      </button>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="text-xs text-muted transition-colors hover:text-primary"
        >
          {showDetails ? "Hide technical details" : "View technical details"}
        </button>
        {showDetails && (
          <p className="value-tech mt-3 break-words rounded-lg border border-panel-border bg-background/60 p-3 text-left text-[11px] leading-relaxed text-faint">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/** Shown before an image is chosen. */
export function SelectionEmptyState() {
  return (
    <div className="rounded-[20px] border border-panel-border bg-panel px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-panel-border-strong text-faint"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M4 17l5-4 4 3 3-2 4 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-6 text-lg font-semibold">Choose an image to begin</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
        Choose a NASA image or upload your own Earth or space photograph.
      </p>
    </div>
  );
}
