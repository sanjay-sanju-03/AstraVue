"use client";

interface HeroProps {
  onAnalyze: () => void;
  onExplore: () => void;
}

export function Hero({ onAnalyze, onExplore }: HeroProps) {
  return (
    <section className="mx-auto max-w-[1120px] px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.08em] text-primary">ASTRAVUE</p>
        <p className="mt-3 text-sm font-medium text-muted">
          AI visual intelligence for space &amp; Earth imagery
        </p>
        <h1 className="text-gradient-hero mt-7 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-7xl">
          Understand the story inside every image.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted md:text-xl">
          Explore NASA imagery or upload your own. AstraVue detects visible
          features, highlights them directly on the image, and explains what
          you&apos;re seeing in plain language.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onAnalyze}
            className="pressable w-full whitespace-nowrap rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0b625c] sm:w-auto"
          >
            Start with an image
          </button>
          <button
            type="button"
            onClick={onExplore}
            className="pressable w-full whitespace-nowrap rounded-md border border-panel-border-strong bg-panel px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/[0.04] sm:w-auto"
          >
            Browse NASA imagery
          </button>
        </div>

        <dl className="mt-16 grid max-w-2xl grid-cols-3 border-y border-panel-border py-5">
          {[
            { k: "3–6", v: "visible features" },
            { k: "NASA", v: "imagery used" },
            { k: "0", v: "images stored", support: "Privacy-first processing" },
          ].map((s) => (
            <div key={s.v} className="border-r border-panel-border px-4 last:border-r-0 first:pl-0">
              <dd className="value-tech text-lg font-semibold text-foreground">{s.k}</dd>
              <dt className="mt-1 text-xs text-muted">{s.v}</dt>
              {s.support && <p className="mt-1 text-[11px] text-faint">{s.support}</p>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
