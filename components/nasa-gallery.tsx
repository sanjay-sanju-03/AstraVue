"use client";

import { toDisplayUrl } from "@/lib/feature-theme";

export interface NasaItem {
  id: string;
  nasaId: string | null;
  title: string;
  date: string;
  thumb: string | null;
  raw: Record<string, unknown>;
}

const CATEGORIES = [
  { label: "Earth", q: "earth from space" },
  { label: "Storms", q: "hurricane satellite" },
  { label: "Fire", q: "wildfire earth" },
  { label: "Moon", q: "lunar surface crater" },
  { label: "Mars", q: "mars surface" },
  { label: "Oceans", q: "ocean satellite" },
  { label: "Clouds", q: "clouds earth observation" },
];

interface NasaGalleryProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (q: string) => void;
  items: NasaItem[];
  isSearching: boolean;
  selectedId: string | null;
  onSelect: (item: NasaItem) => void;
}

export function NasaGallery({
  query,
  onQueryChange,
  onSearch,
  items,
  isSearching,
  selectedId,
  onSelect,
}: NasaGalleryProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
        Explore NASA imagery
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(query);
        }}
        className="relative"
        role="search"
      >
        <div className="relative mt-3">
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            id="nasa-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search NASA imagery..."
            className="w-full rounded-md border border-panel-border bg-panel py-3.5 pl-11 pr-24 text-sm text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
          <button
            type="submit"
            className="pressable absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0b625c]"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-xs font-medium text-muted">Popular searches</p>
        <div className="mt-2 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => {
              onQueryChange(c.q);
              onSearch(c.q);
            }}
            className="pressable rounded-full border border-panel-border bg-panel px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary"
          >
            {c.label}
          </button>
        ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-7">
        {isSearching ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-lg border border-panel-border bg-panel"
              >
                <div className="h-28 bg-white/[0.03]" />
                <div className="space-y-2 p-3">
                  <div className="h-2.5 w-4/5 rounded bg-white/[0.05]" />
                  <div className="h-2.5 w-2/5 rounded bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyResults />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-pressed={selectedId === item.id}
                  className={`card-hover group block h-full w-full overflow-hidden rounded-lg border bg-panel text-left ${
                    selectedId === item.id
                      ? "border-primary ring-2 ring-primary/10"
                      : "border-panel-border"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e9ece7]">
                    {item.thumb ? (
                      <img
                        src={toDisplayUrl(item.thumb) ?? ""}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-faint">
                        <span className="label-tech">No preview</span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                      NASA image
                    </span>
                    {selectedId === item.id && (
                      <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                        Selected
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-primary/95 py-2.5 text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                      {selectedId === item.id ? "Selected" : "Select image →"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                      {item.title}
                    </h3>
                    <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.08em] text-faint">
                      <span>{item.date || "Date not available"}</span>
                      {item.nasaId && <span>NASA ID · {item.nasaId}</span>}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="rounded-lg border border-panel-border bg-panel px-6 py-14 text-center">
      <p className="text-sm font-semibold">No imagery found</p>
      <p className="mt-2 text-sm text-muted">
        Try a broader term such as &quot;Earth&quot; or &quot;Moon&quot;.
      </p>
    </div>
  );
}
