"use client";

interface HeroProps {
  onAnalyze: () => void;
  onExplore: () => void;
}

export function Hero({ onAnalyze, onExplore }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-32">
      {/* Orbital line graphic — restrained, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-8 -z-0 h-[520px] w-[820px] -translate-x-1/2 opacity-[0.5]"
      >
        <svg viewBox="0 0 820 520" className="animate-drift h-full w-full">
          <ellipse
            cx="410"
            cy="260"
            rx="380"
            ry="150"
            fill="none"
            stroke="currentColor"
            className="text-primary/12"
            strokeWidth="1"
          />
          <ellipse
            cx="410"
            cy="260"
            rx="300"
            ry="118"
            fill="none"
            stroke="currentColor"
            className="text-primary/10"
            strokeWidth="1"
          />
          <ellipse
            cx="410"
            cy="260"
            rx="215"
            ry="85"
            fill="none"
            stroke="currentColor"
            className="text-accent/10"
            strokeWidth="1"
          />
          <circle cx="410" cy="260" r="3" className="fill-primary/40" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="label-tech !text-primary/80">NASA × AI Visual Intelligence</p>

        <h1 className="text-gradient-hero mt-7 text-[clamp(2.5rem,7.2vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
          Understand what&apos;s
          <br />
          happening in space.
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-muted">
          Turn NASA and Earth-observation imagery into clear, visual AI insights —
          detected features, spatial annotations, and a plain-language reading of
          the scene.
        </p>

        <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAnalyze}
            className="pressable w-full rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-[#04121f] hover:bg-[#7dd3fc] sm:w-auto"
          >
            Analyze an Image
          </button>
          <button
            type="button"
            onClick={onExplore}
            className="pressable w-full rounded-lg border border-panel-border-strong px-7 py-3.5 text-sm font-semibold text-foreground hover:border-primary/45 hover:bg-primary/5 sm:w-auto"
          >
            Explore NASA Imagery
          </button>
        </div>

        {/* Capability strip */}
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-panel-border bg-panel-border/40">
          {[
            { k: "3–6", v: "Features detected" },
            { k: "<1s", v: "Typical analysis" },
            { k: "0", v: "Images stored" },
          ].map((s) => (
            <div key={s.v} className="bg-panel px-3 py-5">
              <dd className="value-tech text-lg font-semibold text-foreground">{s.k}</dd>
              <dt className="label-tech mt-1.5 !text-[10px]">{s.v}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
