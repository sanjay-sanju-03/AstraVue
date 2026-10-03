"use client";

import { AnalysisResultData } from "@/lib/schemas";
import { featureColor, featureNumber } from "@/lib/feature-theme";

interface DetectionListProps {
  analysis: AnalysisResultData;
  hoveredFeature: number | null;
  clickedFeature: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
}

export function DetectionList({
  analysis,
  hoveredFeature,
  clickedFeature,
  onHover,
  onSelect,
}: DetectionListProps) {
  const total = analysis.features.length;

  return (
    <section aria-labelledby="detections-heading" className="rounded-[20px] border border-panel-border bg-panel">
      <header className="flex items-center justify-between border-b border-panel-border px-5 py-4">
        <h2 id="detections-heading" className="label-tech !text-muted">
          AI Detection
        </h2>
        <span className="value-tech text-[11px] text-primary">
          {String(total).padStart(2, "0")} features identified
        </span>
      </header>

      <ul className="divide-y divide-panel-border">
        {analysis.features.map((feature, i) => {
          const color = featureColor(i);
          const isActive = hoveredFeature === i || clickedFeature === i;
          return (
            <li key={i}>
              <button
                type="button"
                onMouseEnter={() => onHover(i)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(i)}
                onBlur={() => onHover(null)}
                onClick={() => onSelect(i)}
                aria-pressed={clickedFeature === i}
                className={`flex w-full gap-4 px-5 py-4 text-left transition-colors duration-200 ${
                  isActive ? "bg-primary/[0.06]" : "hover:bg-white/[0.02]"
                }`}
              >
                {/* Index rail */}
                <span
                  aria-hidden="true"
                  className="mt-0.5 h-full w-[2px] shrink-0 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: color,
                    opacity: isActive ? 1 : 0.35,
                    minHeight: 34,
                  }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="value-tech text-sm font-semibold" style={{ color }}>
                      {featureNumber(i)}
                    </span>
                    <h3 className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">
                      {feature.label}
                    </h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {feature.description}
                  </p>
                  {feature.evidence && (
                    <p className="mt-2.5 border-l border-panel-border-strong pl-3 text-[12px] italic leading-relaxed text-faint">
                      {feature.evidence}
                    </p>
                  )}
                </div>

                {/* Active indicator — not colour-only */}
                <span
                  className={`mt-1 shrink-0 self-start text-[10px] font-semibold tracking-widest ${
                    isActive ? "text-primary" : "text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ●
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
