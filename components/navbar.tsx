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
    <header className="sticky top-0 z-50 border-b border-panel-border bg-background/95 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between gap-6 px-5 md:px-8"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-bold text-white">
            A
          </div>
          <div className="leading-none">
            <p className="text-[15px] font-semibold tracking-tight text-foreground">AstraVue</p>
            <p className="mt-1 text-xs text-muted">See more in every image</p>
          </div>
        </div>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onAnalyze}
          aria-label="Analyze an image"
          className="pressable rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#0b625c] disabled:opacity-50"
        >
          {analysisActive ? "New Analysis" : "Analyze Image"}
        </button>
      </nav>
    </header>
  );
}
