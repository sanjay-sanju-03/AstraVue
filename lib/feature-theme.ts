import { AnalysisResultData, FeatureData } from "./schemas";
import { apiUrl } from "./api";

/**
 * Fixed category palette. Index-stable so a given feature keeps the same colour
 * in the SVG overlay, the detection list, and the exported PNG.
 */
export const FEATURE_COLORS = [
  "#38bdf8", // cyan
  "#fbbf24", // amber
  "#34d399", // green
  "#a78bfa", // purple
  "#f87171", // red
  "#60a5fa", // blue
] as const;

export function featureColor(index: number): string {
  return FEATURE_COLORS[index % FEATURE_COLORS.length];
}

export function featureNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * NASA images live on a CDN that some networks and browsers cannot reach, so
 * remote images are served through our own proxy. Uploaded images are local
 * blob: URLs and must be used as-is.
 */
export function toDisplayUrl(src: string | null): string | null {
  if (!src) return null;
  if (!src.startsWith("http://") && !src.startsWith("https://")) return src;
  return apiUrl(`/api/proxy-image?url=${encodeURIComponent(src)}`);
}

export type { AnalysisResultData, FeatureData };
