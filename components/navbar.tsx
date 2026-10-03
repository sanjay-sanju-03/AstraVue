"use client";

interface NavbarProps {
  onAnalyze: () => void;
  analysisActive: boolean;
}

const NAV_LINKS = [
  { href: "#explore", label: "Explore" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about", label: "About" },
];

export function Navbar({ onAnalyze, analysisActive }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-panel-border bg-background/85 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 md:px-8"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/10">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_2px_rgba(56,189,248,0.45)]" />
            <svg
              className="animate-orbit absolute inset-0 h-full w-full"
              viewBox="0 0 36 36"
              aria-hidden="true"
            >
              <ellipse
                cx="18"
                cy="18"
                rx="15"
                ry="6.5"
                fill="none"
                stroke="currentColor"
                className="text-primary/45"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="leading-none">
            <p className="text-[15px] font-semibold tracking-tight">SpaceSnap AI</p>
            <p className="label-tech mt-1 !text-[10px]">NASA · Earth Observation</p>
          </div>
        </div>

        {/* Centre nav (desktop) */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 lg:flex">
            <StatusPill label="NASA Data" value="Connected" tone="success" />
            <StatusPill label="AI" value="Ready" tone="primary" />
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            aria-label="Analyze an image"
            className="pressable rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-[#04121f] hover:bg-[#7dd3fc] disabled:opacity-50"
          >
            {analysisActive ? "New Analysis" : "Analyze Image"}
          </button>
        </div>
      </nav>
    </header>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "primary";
}) {
  const dot = tone === "success" ? "bg-success" : "bg-primary";
  return (
    <div className="flex items-center gap-2">
      <span className={cn("animate-blink h-1.5 w-1.5 rounded-full", dot)} />
      <span className="label-tech !text-[10px]">
        {label} <span className="text-muted">/</span>{" "}
        <span className={tone === "success" ? "text-success" : "text-primary"}>
          {value}
        </span>
      </span>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
