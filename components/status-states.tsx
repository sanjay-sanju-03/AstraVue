"use client";

import { useEffect, useState } from "react";
import { toDisplayUrl } from "@/lib/feature-theme";

const STAGES = [
  "Receiving image…",
  "Examining visible structures…",
  "Identifying features…",
  "Generating explanation…",
];

/** Cinematic staged scan. Uses a timer for stage text and a CSS sweep for the line. */
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
      className="mx-auto w-full max-w-2xl rounded-xl border border-panel-border bg-panel"
    >
      <div className="relative grid min-h-56 place-items-center overflow-hidden rounded-t-xl bg-[#e9ece7] px-6 py-12">
        {displayUrl && (
          <img
            src={displayUrl}
            alt="Selected image being analyzed"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 animate-scan bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="relative z-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-panel-border border-t-primary" />
          <p className="mt-4 text-sm font-semibold text-foreground">Looking closely at your image</p>
          <p className="mt-1 text-sm text-muted">This usually takes a few seconds.</p>
        </div>
      </div>

      {/* Stage readout */}
      <div className="px-6 py-6">
        <ol className="space-y-2.5">
          {STAGES.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-3 text-[13px] transition-colors duration-300 ${
                i === stage ? "text-foreground" : i < stage ? "text-faint" : "text-faint/45"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[8px] ${
                  i < stage
                    ? "border-success/50 bg-success/15 text-success"
                    : i === stage
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-panel-border"
                }`}
              >
                {i < stage ? "✓" : i === stage ? "•" : ""}
              </span>
              {s}
            </li>
          ))}
        </ol>
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
