"use client";

import { ImageViewer } from "@/components/image-viewer";
import { DetectionList } from "@/components/detection-list";
import { ExplanationPanel, SourcePanel } from "@/components/analysis-panels";
import { AnalysisResultData } from "@/lib/schemas";
import { AnalysisSource } from "@/types/analysis";

interface WorkspaceProps {
  imageSrc: string | null;
  analysis: AnalysisResultData;
  source: AnalysisSource | null;
  modelUsed: string;
  hoveredFeature: number | null;
  clickedFeature: number | null;
  isDownloading: boolean;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
  onDownload: () => void;
  onReset: () => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

export function AnalysisWorkspace(props: WorkspaceProps) {
  const {
    imageSrc,
    analysis,
    source,
    modelUsed,
    hoveredFeature,
    clickedFeature,
    isDownloading,
    onHover,
    onSelect,
    onDownload,
    onReset,
    imageRef,
  } = props;

  return (
    <div className="mx-auto max-w-[1120px] px-5 md:px-8">
      <div className="flex flex-col gap-5 rounded-xl border border-panel-border bg-panel px-5 py-5 sm:flex-row sm:items-end sm:justify-between md:px-6">
        <div className="flex items-center gap-4">
          <span className="value-tech text-3xl font-semibold text-primary">
            {String(analysis.features.length).padStart(2, "0")}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              {analysis.features.length} Features Detected
            </h1>
            <p className="mt-1 text-sm text-muted">
              AI visual analysis of this {source?.type === "nasa" ? "NASA" : "uploaded"} image
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {modelUsed && (
            <span className="hidden text-xs font-medium uppercase tracking-[0.08em] text-muted sm:inline">
              AI analysis · <span className="text-foreground">{modelUsed}</span>
            </span>
          )}
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="pressable flex-1 rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#0b625c] disabled:opacity-50 sm:flex-none"
          >
            {isDownloading ? "Saving…" : "↓ Download Annotated PNG"}
          </button>
        </div>
      </div>

      {/* Two-column workspace.
          Mobile order: image → detections → explanation → source. */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ImageViewer
            imageSrc={imageSrc}
            analysis={analysis}
            hoveredFeature={hoveredFeature}
            clickedFeature={clickedFeature}
            imageRef={imageRef}
          />
        </div>

        <div className="space-y-5">
          <DetectionList
            analysis={analysis}
            hoveredFeature={hoveredFeature}
            clickedFeature={clickedFeature}
            onHover={onHover}
            onSelect={onSelect}
          />
          <ExplanationPanel explanation={analysis.explanation} />
          <SourcePanel source={source} imageUrl={imageSrc} />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="pressable rounded-md border border-panel-border-strong bg-panel px-5 py-2.5 text-[13px] font-semibold text-muted hover:border-primary hover:text-primary"
        >
          ← Analyze another image
        </button>
      </div>
    </div>
  );
}
