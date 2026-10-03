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

type AppState = "home" | "input" | "loading" | "error" | "result";

const MAX_MB = parseInt(process.env.NEXT_PUBLIC_MAX_IMAGE_MB || "8", 10);

function mapNasaItem(item: Record<string, unknown>): NasaItem {
  const data = (item.data as Record<string, unknown>[])?.[0] ?? {};
  const links = (item.links as Record<string, unknown>[])?.[0];
  return {
    id: String(data.nasa_id ?? item.href ?? Math.random()),
    title: String(data.title ?? "Untitled NASA image"),
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
      const res = await fetch(`/api/nasa/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const items = (data.collection?.items ?? []) as Record<string, unknown>[];
      setNasaItems(items.map(mapNasaItem));
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
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
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

  const handleNasaSelect = (item: Record<string, unknown>) => {
    const imgUrl = (item.links as Record<string, unknown>[])?.[0]?.href as string;
    if (!imgUrl) return;
    setImagePreview(imgUrl);

    const data = (item.data as Record<string, unknown>[])?.[0];
    const formData = new FormData();
    formData.append("imgUrl", imgUrl);
    formData.append("sourceType", "nasa");
    formData.append("sourceTitle", (data?.title as string) || "");
    formData.append("sourceUrl", imgUrl);
    formData.append("nasaId", (data?.nasa_id as string) || "");
    void runAnalysis(formData);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`That file is larger than ${MAX_MB} MB.`);
      setAppState("error");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceType", "upload");
    void runAnalysis(formData);
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
    setAppState("input");
    if (nasaItems.length === 0) void searchNasa(searchQuery);
  };

  const reset = () => {
    setAppState("home");
    setAnalysisResult(null);
    setImagePreview(null);
    setSourceData(null);
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
          <section id="explore" className="mx-auto max-w-[1600px] px-4 pb-20 md:px-8">
            <div className="pt-14">
              <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Start your analysis
                </h1>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                  Upload an Earth or space image, or explore imagery from the NASA
                  Image and Video Library.
                </p>
              </header>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ModeCard
                  active={activeTab === "nasa"}
                  title="NASA Library"
                  subtitle="Explore NASA imagery"
                  onClick={() => setActiveTab("nasa")}
                />
                <ModeCard
                  active={activeTab === "upload"}
                  title="Upload Image"
                  subtitle="JPG / PNG / WEBP"
                  onClick={() => setActiveTab("upload")}
                />
              </div>

              <div className="mt-8">
                {activeTab === "nasa" ? (
                  <NasaGallery
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    onSearch={searchNasa}
                    items={nasaItems}
                    isSearching={isSearching}
                    onSelect={handleNasaSelect}
                  />
                ) : (
                  <div className="max-w-2xl">
                    <UploadZone onFile={handleFile} maxMb={MAX_MB} />
                    <p className="label-tech mt-4 !text-[10px]">
                      Images are processed in memory and not stored
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {appState === "loading" && (
          <section className="px-4 py-20">
            <AnalysisLoading />
          </section>
        )}

        {appState === "error" && (
          <section className="px-4 py-20">
            <AnalysisError message={errorMsg} onRetry={openInput} />
          </section>
        )}

        {appState === "result" && analysisResult && (
          <section className="pt-10">
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
          <section id="how-it-works" className="mx-auto max-w-[1600px] px-4 pb-24 md:px-8">
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
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`card-hover rounded-[20px] border p-6 text-left transition-colors ${
        active
          ? "border-primary/55 bg-primary/[0.07]"
          : "border-panel-border bg-panel hover:border-panel-border-strong"
      }`}
    >
      <p className="label-tech">{title}</p>
      <p className="mt-2.5 text-sm font-medium text-foreground">{subtitle}</p>
      <p
        className={`label-tech mt-4 !text-[10px] ${active ? "!text-primary" : "!text-faint"}`}
      >
        {active ? "● Selected" : "○ Select"}
      </p>
    </button>
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
      <h2 className="label-tech">How it works</h2>
      <ol className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-panel-border bg-panel-border/40 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="bg-panel p-6">
            <span className="value-tech text-xs font-semibold text-primary">{s.n}</span>
            <h3 className="mt-3 text-sm font-semibold">{s.t}</h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{s.d}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-panel-border bg-panel/40"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-9 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div>
          <p className="text-sm font-semibold">AstraVue</p>
          <p className="label-tech mt-1.5 !text-[10px]">
            AI visual intelligence for space &amp; Earth imagery
          </p>
        </div>
        <p className="label-tech !text-[10px]">
          Images processed in memory · Not stored
        </p>
      </div>
    </footer>
  );
}
