"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisResultData } from "@/lib/schemas";
import { featureColor, featureNumber, toDisplayUrl } from "@/lib/feature-theme";

interface ImageViewerProps {
  imageSrc: string | null;
  analysis: AnalysisResultData;
  hoveredFeature: number | null;
  clickedFeature: number | null;
  isDownloading: boolean;
  onDownload: () => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

/**
 * Corner-bracket annotation overlay.
 *
 * The SVG viewBox is fixed at 0 0 1000 1000 with preserveAspectRatio="none",
 * which stretches to the element's box. Because the wrapper is sized from the
 * image's own intrinsic aspect ratio (see the aspectRatio style below), the
 * 0-1000 model space maps exactly onto the rendered pixels — so boxes stay
 * locked to the image instead of drifting on non-square sources.
 */
function AnnotationOverlay({
  analysis,
  hoveredFeature,
  clickedFeature,
}: Pick<
  ImageViewerProps,
  "analysis" | "hoveredFeature" | "clickedFeature"
>) {
  // Chips are laid out in feature order and pushed down when they would collide,
  // so overlapping detections never stack unreadably on top of one another.
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {analysis.features.map((feature, i) => {
        const [ymin, xmin, ymax, xmax] = feature.box_2d;
        const isActive = hoveredFeature === i || clickedFeature === i;
        const color = featureColor(i);
        const w = Math.max(xmax - xmin, 1);
        const h = Math.max(ymax - ymin, 1);
        const arm = Math.min(Math.max(w, h) * 0.22, 30);
        // Labels are drawn in a second, screen-space layer (see AnnotationLabels)
        // so their type size does not shrink with the image on narrow viewports.

        return (
          <g key={i} opacity={isActive ? 1 : 0.82}>
            {/* Faint region fill on hover only */}
            {isActive && (
              <rect
                x={xmin}
                y={ymin}
                width={w}
                height={h}
                fill={color}
                opacity="0.1"
              />
            )}

            {/* Corner brackets */}
            <g
              stroke={color}
              strokeWidth={isActive ? 5 : 3}
              fill="none"
              strokeLinecap="round"
            >
              <path
                d={`M ${xmin} ${ymin + arm} L ${xmin} ${ymin} L ${xmin + arm} ${ymin}`}
              />
              <path
                d={`M ${xmax - arm} ${ymin} L ${xmax} ${ymin} L ${xmax} ${ymin + arm}`}
              />
              <path
                d={`M ${xmax} ${ymax - arm} L ${xmax} ${ymax} L ${xmax - arm} ${ymax}`}
              />
              <path
                d={`M ${xmin + arm} ${ymax} L ${xmin} ${ymax} L ${xmin} ${ymax - arm}`}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Labels are rendered in a second overlay that is NOT scaled by the 0-1000 model
 * space. Text therefore keeps a constant, legible pixel size at every viewport,
 * while the chip rectangles underneath stay locked to the image.
 */
function AnnotationLabels({
  analysis,
  width,
  height,
  hoveredFeature,
  clickedFeature,
}: Pick<
  ImageViewerProps,
  "analysis" | "hoveredFeature" | "clickedFeature"
> & { width: number; height: number }) {
  const placed: { x: number; y: number; w: number }[] = [];
  const fs = width < 520 ? 10 : 12;
  const labelH = fs + 9;
  const padX = 7;
  const labelW = (label: string) => Math.min(width - 8, (label.length * fs * 0.66) + padX * 2 + 10);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {analysis.features.map((feature, i) => {
        const [ymin, xmin, ymax] = feature.box_2d;
        const isActive = hoveredFeature === i || clickedFeature === i;
        const color = featureColor(i);
        const text = `${featureNumber(i)} ${feature.label.toUpperCase()}`;
        const w = labelW(text);

        // Convert model space (0-1000) to pixels for this overlay.
        const px = (xmin / 1000) * width;
        const above = ymin > (labelH / height) * 1000 + 20;
        let py = above
          ? (ymin / 1000) * height - labelH - 5
          : (ymax / 1000) * height + 5;

        for (const p of placed) {
          const ox = px < p.x + p.w && px + w > p.x;
          const oy = py < p.y + labelH && py + labelH > p.y;
          if (ox && oy) py = p.y + labelH + 3;
        }
        py = Math.max(0, Math.min(py, height - labelH));
        placed.push({ x: px, y: py, w });

        return (
          <g key={i}>
            <rect
              x={px}
              y={py}
              width={w}
              height={labelH}
              rx="4"
              fill="#050914"
              fillOpacity="0.82"
              stroke={color}
              strokeWidth={isActive ? 1.6 : 1}
            />
            <rect x={px} y={py} width="2.5" height={labelH} rx="1.25" fill={color} />
            <text
              x={px + padX}
              y={py + labelH / 2}
              dominantBaseline="central"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize={fs}
              fontWeight="600"
              letterSpacing="0.4"
              fill={isActive ? "#ffffff" : "#dbe4f0"}
            >
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ImageViewer({
  imageSrc,
  analysis,
  hoveredFeature,
  clickedFeature,
  isDownloading,
  onDownload,
  imageRef,
}: ImageViewerProps) {
  const [aspect, setAspect] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  // Pixel size of the image frame — lets the label layer use screen-space units.
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const displayUrl = toDisplayUrl(imageSrc);

  // Capture the intrinsic aspect ratio so the overlay box matches the image box
  // exactly. Without this, a wide image letterboxed by max-h would misalign boxes.
  const measure = useCallback(() => {
    const el = imageRef.current;
    if (el && el.naturalWidth && el.naturalHeight) {
      setAspect(el.naturalWidth / el.naturalHeight);
    }
  }, [imageRef]);

  // Reset measured state during render when the displayed image changes,
  // rather than in an effect (which the react-hooks rules disallow).
  const [lastSrc, setLastSrc] = useState(displayUrl);
  if (lastSrc !== displayUrl) {
    setLastSrc(displayUrl);
    setAspect(null);
    setLoadFailed(false);
  }

  useEffect(() => {
    const onResize = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onResize);
    return () => document.removeEventListener("fullscreenchange", onResize);
  }, []);

  // Track the rendered frame size so labels can be drawn in screen space.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        setFrameSize({ width: r.width, height: r.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect, displayUrl]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frameRef.current?.requestFullscreen();
    } catch {
      /* fullscreen unavailable — non-fatal */
    }
  };

  return (
    <figure
      ref={frameRef}
      className="overflow-hidden rounded-[20px] border border-panel-border bg-panel"
    >
      {/* Top HUD bar */}
      <div className="flex items-center justify-between gap-3 border-b border-panel-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="animate-blink h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="label-tech !text-muted">Live Analysis</span>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Toggle fullscreen" onClick={toggleFullscreen}>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" strokeLinecap="round" />
            </svg>
          </IconButton>
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading || loadFailed}
            className="pressable rounded-md border border-panel-border-strong px-3 py-1.5 text-[11px] font-semibold text-muted hover:border-primary/50 hover:text-foreground disabled:opacity-40"
          >
            {isDownloading ? "Saving…" : "Download PNG"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full bg-[#04070e]"
        style={aspect ? { aspectRatio: String(aspect) } : { minHeight: 260 }}
      >
        {loadFailed ? (
          <div className="grid aspect-[4/3] place-items-center px-6 py-16 text-center">
            <div>
              <p className="label-tech">Image unavailable</p>
              <p className="mt-2 max-w-xs text-sm text-muted">
                The source image could not be loaded from the NASA archive.
              </p>
            </div>
          </div>
        ) : (
          <>
            {!aspect && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-panel-border border-t-primary" />
              </div>
            )}
            <img
              ref={imageRef}
              src={displayUrl ?? ""}
              alt="Satellite image being analyzed"
              onLoad={() => {
                setLoadFailed(false);
                measure();
              }}
              onError={() => setLoadFailed(true)}
              className="block h-full w-full object-contain"
            />
            {aspect && !loadFailed && (
              <>
                <AnnotationOverlay
                  analysis={analysis}
                  hoveredFeature={hoveredFeature}
                  clickedFeature={clickedFeature}
                />
                <AnnotationLabels
                  analysis={analysis}
                  width={frameSize.width}
                  height={frameSize.height}
                  hoveredFeature={hoveredFeature}
                  clickedFeature={clickedFeature}
                />
              </>
            )}
            {isFullscreen && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="animate-pulse-r h-[70%] w-[70%] rounded-full border border-primary/20" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom HUD bar */}
      <figcaption className="flex items-center justify-between gap-3 border-t border-panel-border px-4 py-3">
        <span className="label-tech">NASA Image Library</span>
        <span className="value-tech text-[11px] text-faint">
          {analysis.features.length.toString().padStart(2, "0")} features ·{" "}
          {analysis.image_summary ? "AI interpreted" : "AI analyzed"}
        </span>
      </figcaption>
    </figure>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="pressable grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
    >
      {children}
    </button>
  );
}
