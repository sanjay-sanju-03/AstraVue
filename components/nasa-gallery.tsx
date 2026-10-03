"use client";

import { toDisplayUrl } from "@/lib/feature-theme";

export interface NasaItem {
  id: string;
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
  onSelect: (item: Record<string, unknown>) => void;
}

export function NasaGallery({
  query,
  onQueryChange,
  onSearch,
  items,
  isSearching,
  onSelect,
}: NasaGalleryProps) {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(query);
        }}
        className="relative"
        role="search"
      >
        <label htmlFor="nasa-search" className="label-tech">
          Search NASA Imagery
        </label>
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
            placeholder="Try &quot;hurricane from space&quot;"
            className="w-full rounded-xl border border-panel-border bg-panel py-3.5 pl-11 pr-24 text-sm text-foreground placeholder:text-faint focus:border-primary/50 focus:outline-none"
          />
          <button
            type="submit"
            className="pressable absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-[#04121f] hover:bg-[#7dd3fc]"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => {
              onQueryChange(c.q);
              onSearch(c.q);
            }}
            className="pressable rounded-full border border-panel-border px-3 py-1.5 text-[12px] text-muted hover:border-primary/45 hover:text-primary"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-7">
        {isSearching ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-xl border border-panel-border bg-panel"
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
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.raw)}
                  className="card-hover group block h-full w-full overflow-hidden rounded-xl border border-panel-border bg-panel text-left"
                >
                  <div className="relative h-28 overflow-hidden bg-white/[0.03]">
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
                    <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-primary/95 py-2 text-[11px] font-bold uppercase tracking-widest text-[#04121f] transition-transform duration-200 group-hover:translate-y-0">
                      Select image
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-[12.5px] font-medium leading-snug">
                      {item.title}
                    </h3>
                    <p className="value-tech mt-2 text-[10.5px] text-faint">
                      {item.date || "—"}
                    </p>
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
    <div className="rounded-xl border border-panel-border bg-panel px-6 py-14 text-center">
      <p className="label-tech">No imagery found</p>
      <p className="mt-2 text-sm text-muted">
        Try a broader term such as &quot;Earth&quot; or &quot;Moon&quot;.
      </p>
    </div>
  );
}
