"use client";

import { useCallback, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { UploadZone } from "@/components/upload-zone";
import { NasaGallery, NasaItem } from "@/components/nasa-gallery";
import { AnalysisWorkspace } from "@/components/analysis-workspace";
import { AnalysisError, AnalysisLoading } from "@/components/status-states";
import { AnalysisResultData } from "@/lib/schemas";
import { AnalysisSource } from "@/types/analysis";
import { featureColor, featureNumber, toDisplayUrl } from "@/lib/feature-theme";
import { apiUrl } from "@/lib/api";

type AppState = "home" | "input" | "loading" | "error" | "result";

type PendingSelection = {
  previewUrl: string;
  title: string;
  nasaId?: string;
  date?: string;
  sourceType: "nasa" | "upload";
  formData: FormData;
};

const MAX_MB = parseInt(process.env.NEXT_PUBLIC_MAX_IMAGE_MB || "8", 10);

function mapNasaItem(item: Record<string, unknown>): NasaItem {
  const data = (item.data as Record<string, unknown>[])?.[0] ?? {};
  const links = (item.links as Record<string, unknown>[])?.[0];
  const nasaId = typeof data.nasa_id === "string" && data.nasa_id ? data.nasa_id : null;
  const title = typeof data.title === "string" && data.title ? data.title : "NASA image";
  return {
    id: nasaId ?? String(item.href ?? title),
    nasaId,
    title,
    date: data.date_created ? String(data.date_created).slice(0, 10) : "",
    thumb: (links?.href as string) ?? null,
    raw: item,
  };
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("home");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"nasa" | "upload">("nasa");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [sourceData, setSourceData] = useState<AnalysisSource | null>(null);
  const [modelUsed, setModelUsed] = useState("");

  const [nasaItems, setNasaItems] = useState<NasaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("earth from space");
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [clickedFeature, setClickedFeature] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  /* ---------------- data ---------------- */

  const searchNasa = async (q: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(apiUrl(`/api/nasa/search?q=${encodeURIComponent(q)}`));
      const data = await res.json();
      const items = (data.collection?.items ?? []) as Record<string, unknown>[];
      const uniqueItems = new Map<string, NasaItem>();
      items.map(mapNasaItem).forEach((item) => uniqueItems.set(item.id, item));
      setNasaItems(Array.from(uniqueItems.values()));
    } catch {
      setNasaItems([]);
    } finally {
      setIsSearching(false);
    }
  };

  const runAnalysis = async (formData: FormData) => {
    setAppState("loading");
    setHoveredFeature(null);
    setClickedFeature(null);
    try {
      const res = await fetch(apiUrl("/api/analyze"), { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error?.message || "Analysis failed");
      setAnalysisResult(data.analysis);
      setSourceData(data.source);
      setModelUsed(data.model || "");
      setAppState("result");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Analysis failed");
      setAppState("error");
    }
  };

  const handleNasaSelect = (item: NasaItem) => {
    const imgUrl = (item.raw.links as Record<string, unknown>[])?.[0]?.href as string;
    if (!imgUrl) return;
    setImagePreview(imgUrl);

    const formData = new FormData();
    formData.append("imgUrl", imgUrl);
    formData.append("sourceType", "nasa");
    formData.append("sourceTitle", item.title);
    formData.append("sourceUrl", imgUrl);
    if (item.nasaId) formData.append("nasaId", item.nasaId);
    setSourceData({ type: "nasa", title: item.title, url: imgUrl, nasaId: item.id });
    setPendingSelection({
      previewUrl: imgUrl,
      title: item.title,
      nasaId: item.nasaId ?? undefined,
      date: item.date,
      sourceType: "nasa",
      formData,
    });
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`That file is larger than ${MAX_MB} MB.`);
      setAppState("error");
      return;
    }
    if (pendingSelection?.sourceType === "upload") {
      URL.revokeObjectURL(pendingSelection.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceType", "upload");
    setImagePreview(previewUrl);
    setSourceData({ type: "upload", title: file.name });
    setPendingSelection({
      previewUrl,
      title: file.name,
      sourceType: "upload",
      formData,
    });
  };

  const analyzeSelection = () => {
    if (pendingSelection) void runAnalysis(pendingSelection.formData);
  };

  const clearSelection = () => {
    if (pendingSelection?.sourceType === "upload") {
      URL.revokeObjectURL(pendingSelection.previewUrl);
    }
    setPendingSelection(null);
    setImagePreview(null);
    setSourceData(null);
  };

  const handleDownload = useCallback(async () => {
    if (!imagePreview || !analysisResult || !imgRef.current) return;
    setIsDownloading(true);
    try {
      const img = imgRef.current;
      const naturalW = img.naturalWidth || 800;
      const naturalH = img.naturalHeight || 600;

      const canvas = document.createElement("canvas");
      canvas.width = naturalW;
      canvas.height = naturalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Re-fetch through the proxy (or the local blob:) so the canvas stays untainted.
      const drawUrl = toDisplayUrl(imagePreview);
      if (!drawUrl) return;
      const blob = await fetch(drawUrl).then((r) => r.blob());
      const bmp = await createImageBitmap(blob);
      ctx.drawImage(bmp, 0, 0, naturalW, naturalH);

      analysisResult.features.forEach((feature, i) => {
        const [ymin, xmin, ymax, xmax] = feature.box_2d;
        const x = (xmin / 1000) * naturalW;
        const y = (ymin / 1000) * naturalH;
        const w = ((xmax - xmin) / 1000) * naturalW;
        const h = ((ymax - ymin) / 1000) * naturalH;
        const color = featureColor(i);

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, naturalW / 300);
        ctx.strokeRect(x, y, w, h);

        const fontSize = Math.max(15, naturalW / 46);
        ctx.font = `600 ${fontSize}px ui-monospace, Menlo, monospace`;
        const label = `${featureNumber(i)} ${feature.label.toUpperCase()}`;
        const textW = ctx.measureText(label).width + 22;
        const labelH = fontSize + 14;
        const labelY = ymin > 60 ? y - labelH - 6 : Math.min(y + h + 6, naturalH - labelH);

        ctx.fillStyle = "rgba(5, 9, 20, 0.85)";
        ctx.fillRect(x, labelY, textW, labelH);
        ctx.fillStyle = color;
        ctx.fillRect(x, labelY, 4, labelH);
        ctx.fillStyle = "#e2e8f0";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + 13, labelY + labelH / 2);
        ctx.textBaseline = "alphabetic";
      });

      // Attribution footer
      const footerH = Math.max(34, naturalH / 16);
      ctx.fillStyle = "rgba(5, 9, 20, 0.88)";
      ctx.fillRect(0, naturalH - footerH, naturalW, footerH);
      ctx.fillStyle = "#94a3b8";
      ctx.font = `${Math.max(11, footerH * 0.34)}px ui-monospace, Menlo, monospace`;
      ctx.fillText(
        "ASTRAVUE  ·  AI-INTERPRETED FEATURES  ·  BASED ON VISIBLE IMAGE EVIDENCE",
        16,
        naturalH - footerH / 2
      );

      canvas.toBlob((b) => {
        if (!b) return;
        const href = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = href;
        a.download = "astravue-annotated.png";
        a.click();
        // Revoke on a later tick — revoking synchronously after click() can
        // cancel the download before the browser has read the blob.
        setTimeout(() => URL.revokeObjectURL(href), 10_000);
        setIsDownloading(false);
      }, "image/png");
    } catch {
      setIsDownloading(false);
    }
  }, [imagePreview, analysisResult]);

  /* ---------------- navigation ---------------- */

  const openInput = () => {
    if (appState === "result") clearSelection();
    setAppState("input");
    if (nasaItems.length === 0) void searchNasa(searchQuery);
  };

  const reset = () => {
    setAppState("home");
    setAnalysisResult(null);
    clearSelection();
    setErrorMsg("");
  };

  return (
    <>
      <div className="space-backdrop" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#04121f]"
      >
        Skip to content
      </a>

      <Navbar
        onAnalyze={openInput}
        analysisActive={appState === "result" || appState === "loading"}
      />

      <main id="main">
        {appState === "home" && (
          <Hero
            onAnalyze={openInput}
            onExplore={() => {
              openInput();
              setActiveTab("nasa");
            }}
          />
        )}

        {appState === "input" && (
          <section id="explore" className="mx-auto max-w-[1120px] px-5 pb-20 md:px-8">
            <div className="pt-12 md:pt-16">
              <header className="mb-8">
                <p className="label-tech text-primary">Your next view</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.025em] md:text-5xl">
                  Choose an image to begin.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                  Start with a NASA image or upload a JPG, PNG, or WEBP from your computer.
                </p>
              </header>

              <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                <ModeCard
                  active={activeTab === "nasa"}
                  title="NASA LIBRARY"
                  subtitle="Explore NASA space & Earth imagery"
                  action="Explore NASA"
                  onClick={() => {
                    clearSelection();
                    setActiveTab("nasa");
                  }}
                />
                <ModeCard
                  active={activeTab === "upload"}
                  title="UPLOAD IMAGE"
                  subtitle="Analyze an image from your computer"
                  action="Upload image · JPG · PNG · WEBP"
                  onClick={() => {
                    clearSelection();
                    setActiveTab("upload");
                  }}
                />
              </div>

              <div className="mt-8">
                {activeTab === "nasa" ? (
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                    <NasaGallery
                      query={searchQuery}
                      onQueryChange={setSearchQuery}
                      onSearch={searchNasa}
                      items={nasaItems}
                      isSearching={isSearching}
                      selectedId={pendingSelection?.sourceType === "nasa" ? pendingSelection.nasaId ?? null : null}
                      onSelect={handleNasaSelect}
                    />
                    <SelectionPreview
                      selection={pendingSelection}
                      onAnalyze={analyzeSelection}
                      onClear={clearSelection}
                    />
                  </div>
                ) : (
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                    <div>
                      <UploadZone onFile={handleFile} maxMb={MAX_MB} />
                      <p className="mt-4 text-xs text-muted">
                        Privacy: images are processed in memory and not stored.
                      </p>
                    </div>
                    <SelectionPreview
                      selection={pendingSelection}
                      onAnalyze={analyzeSelection}
                      onClear={clearSelection}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {appState === "loading" && (
          <section className="px-5 py-20 md:px-8">
            <AnalysisLoading imageSrc={imagePreview} />
          </section>
        )}

        {appState === "error" && (
          <section className="px-5 py-20 md:px-8">
            <AnalysisError message={errorMsg} onRetry={openInput} />
          </section>
        )}

        {appState === "result" && analysisResult && (
          <section className="pb-20 pt-10">
            <AnalysisWorkspace
              imageSrc={imagePreview}
              analysis={analysisResult}
              source={sourceData}
              modelUsed={modelUsed}
              hoveredFeature={hoveredFeature}
              clickedFeature={clickedFeature}
              isDownloading={isDownloading}
              onHover={setHoveredFeature}
              onSelect={(i) => setClickedFeature(clickedFeature === i ? null : i)}
              onDownload={handleDownload}
              onReset={reset}
              imageRef={imgRef}
            />
          </section>
        )}

        {appState === "home" && (
          <section id="how-it-works" className="mx-auto max-w-[1120px] px-5 pb-24 md:px-8">
            <HowItWorks />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

function ModeCard({
  active,
  title,
  subtitle,
  action,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`card-hover rounded-xl border p-5 text-left transition-colors ${
        active
          ? "border-primary bg-primary/[0.06]"
          : "border-panel-border bg-panel hover:border-panel-border-strong"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary">{title}</p>
        {active && <span className="text-xs font-semibold text-primary">✓ Selected</span>}
      </div>
      <p className="mt-5 max-w-[16rem] text-base font-semibold leading-6 text-foreground">{subtitle}</p>
      <p className={`mt-6 text-xs font-semibold ${active ? "text-primary" : "text-muted"}`}>
        {action} →
      </p>
    </button>
  );
}

function SelectionPreview({
  selection,
  onAnalyze,
  onClear,
}: {
  selection: PendingSelection | null;
  onAnalyze: () => void;
  onClear: () => void;
}) {
  const displayUrl = toDisplayUrl(selection?.previewUrl ?? null);

  return (
    <aside className="h-fit rounded-xl border border-panel-border bg-panel p-5 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Selected image</p>
      {selection && displayUrl ? (
        <>
          <div className="mt-4 aspect-[4/3] overflow-hidden rounded-lg bg-[#e9ece7]">
            <img src={displayUrl} alt={selection.title} className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-4 line-clamp-3 text-base font-semibold leading-6">{selection.title}</h2>
          <p className="mt-2 text-xs text-muted">
            {selection.sourceType === "nasa" ? "NASA Image and Video Library" : "User-provided image"}
          </p>
          {selection.nasaId && (
            <p className="value-tech mt-2 text-[11px] text-faint">NASA ID · {selection.nasaId}</p>
          )}
          {selection.date && <p className="mt-1 text-xs text-faint">{selection.date}</p>}
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              className="pressable rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b625c]"
            >
              Analyze image →
            </button>
            <button
              type="button"
              onClick={onClear}
              className="pressable rounded-md border border-panel-border-strong px-4 py-2.5 text-xs font-semibold text-muted hover:border-primary hover:text-primary"
            >
              Change image
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-panel-border-strong px-5 py-10 text-center">
          <p className="text-sm font-semibold">Choose an image to begin</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Select a NASA image or upload your own to see a preview here.
          </p>
        </div>
      )}
    </aside>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Select imagery",
      d: "Pick from the NASA Image and Video Library or upload your own Earth or space photograph.",
    },
    {
      n: "02",
      t: "AI visual analysis",
      d: "A vision model inspects the image and identifies distinct structures that are directly visible in it.",
    },
    {
      n: "03",
      t: "Spatial annotations",
      d: "Each detected feature is outlined in place with a colour-coded label tied to its region.",
    },
    {
      n: "04",
      t: "Plain-language reading",
      d: "A short explanation ties the detections together, grounded only in visible evidence.",
    },
  ];

  return (
    <>
      <h2 className="text-3xl font-semibold tracking-[-0.02em]">How it works</h2>
      <div className="relative mt-8">
        <div
          aria-hidden="true"
          className="absolute left-[12.5%] right-[12.5%] top-3 hidden h-px bg-panel-border lg:block"
        />
        <ol className="relative grid grid-cols-1 gap-8 lg:grid-cols-4">
          {steps.map((s, index) => (
            <li key={s.n} className="relative pr-4">
              <span className="relative z-10 grid h-6 w-6 place-items-center rounded-full border border-primary bg-background value-tech text-[11px] font-semibold text-primary">
                {s.n}
              </span>
            <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
            <p className="mt-2.5 text-sm leading-6 text-muted">{s.d}</p>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-8 h-[calc(100%+2rem)] w-px bg-panel-border lg:hidden"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-panel-border bg-panel/50"
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-5 py-9 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div>
          <p className="text-sm font-semibold">AstraVue</p>
          <p className="mt-1.5 text-sm text-muted">
            AI visual intelligence for space &amp; Earth imagery
          </p>
        </div>
        <p className="text-xs text-muted">
          Your images are processed in memory and not stored.
        </p>
      </div>
    </footer>
  );
}
