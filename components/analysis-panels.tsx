"use client";

import { AnalysisSource } from "@/types/analysis";

/** Editorial explanation panel. Uses hedged language — no false certainty. */
export function ExplanationPanel({ explanation }: { explanation: string }) {
  return (
    <section
      aria-labelledby="explanation-heading"
      className="rounded-[20px] border border-panel-border bg-panel p-6"
    >
      <div className="flex gap-5">
        {/* Vertical accent indicator */}
        <div aria-hidden="true" className="w-[2px] shrink-0 rounded-full bg-gradient-to-b from-primary via-primary/40 to-transparent" />
        <div className="min-w-0">
          <h2 id="explanation-heading" className="label-tech !text-muted">
            AI Visual Explanation
          </h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-foreground/95">
            {explanation}
          </p>
          <p className="label-tech mt-6 !text-[10px] !normal-case !tracking-wide italic">
            Based on visible image evidence · AI interpretation
          </p>
        </div>
      </div>
    </section>
  );
}

/** NASA attribution — intentional, not an afterthought. */
export function SourcePanel({
  source,
  imageUrl,
}: {
  source: AnalysisSource | null;
  imageUrl: string | null;
}) {
  const isNasa = source?.type === "nasa";

  return (
    <section
      aria-labelledby="source-heading"
      className="rounded-[20px] border border-panel-border bg-panel p-6"
    >
      <h2 id="source-heading" className="label-tech !text-muted">
        NASA Image Source
      </h2>

      <p className="mt-4 text-sm font-medium text-foreground">
        {isNasa ? "NASA Image and Video Library" : "User-provided image"}
      </p>

      {source?.title && (
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{source.title}</p>
      )}

      {source?.nasaId && (
        <p className="value-tech mt-2.5 text-[12px] text-faint">
          ID: {source.nasaId}
        </p>
      )}

      {imageUrl && isNasa && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable mt-5 inline-flex items-center gap-2 rounded-md border border-panel-border-strong px-3 py-2 text-[12px] font-semibold text-muted hover:border-primary/50 hover:text-primary"
        >
          View original
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M4 2h6v6M10 2L2 10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </section>
  );
}
