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
    <div className="mx-auto max-w-[1600px] px-4 md:px-8">
      {/* Page heading for assistive tech; the summary bar is the visual anchor. */}
      <h1 className="sr-only">
        Analysis result — {analysis.features.length} features detected
      </h1>

      {/* Result summary bar */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-panel-border bg-panel px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="value-tech text-2xl font-semibold text-primary">
            {String(analysis.features.length).padStart(2, "0")}
          </span>
          <div>
            <p className="text-sm font-semibold">Features detected</p>
            <p className="label-tech mt-1 !text-[10px]">
              AI identified visible structures and patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {modelUsed && (
            <span className="hidden label-tech !text-[10px] sm:inline">
              Model <span className="text-muted">{modelUsed}</span>
            </span>
          )}
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="pressable flex-1 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-[#04121f] hover:bg-[#7dd3fc] disabled:opacity-50 sm:flex-none"
          >
            {isDownloading ? "Saving…" : "Download annotated PNG"}
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
            isDownloading={isDownloading}
            onDownload={onDownload}
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
          className="pressable rounded-lg border border-panel-border-strong px-5 py-2.5 text-[13px] font-semibold text-muted hover:border-primary/45 hover:text-primary"
        >
          ← Analyze another image
        </button>
      </div>
    </div>
  );
}
