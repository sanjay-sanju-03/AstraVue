"use client";

import { AnalysisSource } from "@/types/analysis";

/** Editorial explanation panel. Uses hedged language — no false certainty. */
export function ExplanationPanel({ explanation }: { explanation: string }) {
  return (
    <section
      aria-labelledby="explanation-heading"
      className="rounded-xl border border-panel-border bg-panel p-6"
    >
      <div className="flex gap-5">
        {/* Vertical accent indicator */}
        <div aria-hidden="true" className="w-1 shrink-0 rounded-full bg-primary/70" />
        <div className="min-w-0">
          <h2 id="explanation-heading" className="text-sm font-semibold text-foreground">
            A plain-language read
          </h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-foreground/95">
            {explanation}
          </p>
          <p className="mt-6 text-xs italic text-muted">
            Based on what is visible in the image · AI interpretation
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
      className="rounded-xl border border-panel-border bg-panel p-6"
    >
      <h2 id="source-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
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
          NASA ID · {source.nasaId}
        </p>
      )}

      {imageUrl && isNasa && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable mt-5 inline-flex items-center gap-2 rounded-md border border-panel-border-strong px-3 py-2 text-xs font-semibold text-muted hover:border-primary hover:text-primary"
        >
          View original ↗
        </a>
      )}
    </section>
  );
}
