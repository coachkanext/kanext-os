"use client";

import type { LevelOption } from "@/types/filters";

interface Props {
  levels: LevelOption[];
  selected: string | null;
  onSelect: (levelKey: string | null) => void;
  onBack: () => void;
  onClose: () => void;
}

const LEVEL_ORDER: { key: string | null; label: string }[] = [
  { key: null, label: "All" },
  { key: "ncaa_d1", label: "NCAA D1" },
  { key: "ncaa_d2", label: "NCAA D2" },
  { key: "ncaa_d3", label: "NCAA D3" },
  { key: "naia", label: "NAIA" },
  { key: "njcaa_d1", label: "NJCAA D1" },
  { key: "njcaa_d2", label: "NJCAA D2" },
  { key: "njcaa_d3", label: "NJCAA D3" },
  { key: "cccaa", label: "CCCAA" },
];

export default function DrawerLevel({ levels, selected, onSelect, onBack, onClose }: Props) {
  // Only show levels that exist in the fetched data (plus "All")
  const availableKeys = new Set(levels.map((l) => l.levelKey));
  const options = LEVEL_ORDER.filter((o) => o.key === null || availableKeys.has(o.key));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="flex-1 text-base font-bold text-slate-900">Level</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Radio list */}
      <div className="flex-1 overflow-y-auto">
        {options.map((opt) => {
          const active = selected === opt.key;
          return (
            <button
              key={opt.key ?? "__all"}
              onClick={() => onSelect(opt.key)}
              className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  active ? "border-slate-900" : "border-slate-300"
                }`}
              >
                {active && <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
              </span>
              <span className={`text-sm ${active ? "font-bold text-slate-900" : "text-slate-700"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
