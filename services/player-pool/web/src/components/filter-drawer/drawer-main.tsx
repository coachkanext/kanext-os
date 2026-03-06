"use client";

import type { LevelOption, SortConfig, StatView, TraditionalMode, DrawerScreen } from "@/types/filters";
import {
  TRADITIONAL_CATEGORIES,
  KANEXT_TOP_OPTIONS,
  KANEXT_CLUSTERS,
} from "./sort-options";

interface Props {
  levelKey: string | null;
  teamIds: string[];
  positions: string[];
  archetypes: string[];
  sort: SortConfig;
  statView: StatView;
  levels: LevelOption[];
  onNavigate: (screen: DrawerScreen) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}

/* Build a human-readable label for the current sort */
function sortLabel(sort: SortConfig, statView: StatView): string {
  // Search Traditional categories
  for (const cat of TRADITIONAL_CATEGORIES) {
    const opt = cat.options.find((o) => o.key === sort.key);
    if (opt) return `${opt.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
  }
  // Search KaNeXT top options
  for (const opt of KANEXT_TOP_OPTIONS) {
    if (opt.key === sort.key) return `${opt.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
  }
  // Search KaNeXT clusters
  for (const cluster of KANEXT_CLUSTERS) {
    if (cluster.key === sort.key) return `${cluster.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
    for (const trait of cluster.traits) {
      if (trait.key === sort.key) return `${trait.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
    }
  }
  return sort.key;
}

export default function DrawerMain({
  levelKey,
  teamIds,
  positions,
  archetypes,
  sort,
  statView,
  levels,
  onNavigate,
  onReset,
  onApply,
  onClose,
}: Props) {
  const levelLabel = levelKey
    ? levels.find((l) => l.levelKey === levelKey)?.displayName ?? levelKey
    : "All";
  const teamLabel = teamIds.length === 0 ? "All" : `${teamIds.length} selected`;
  const posLabel = positions.length === 0 ? "All" : `${positions.length} selected`;
  const archLabel = archetypes.length === 0 ? "All" : `${archetypes.length} selected`;
  const sortValue = sortLabel(sort, statView);

  const rows: { label: string; value: string; screen: DrawerScreen }[] = [
    { label: "Level", value: levelLabel, screen: "level" },
    { label: "Teams", value: teamLabel, screen: "teams" },
    { label: "Position", value: posLabel, screen: "position" },
    { label: "Archetype", value: archLabel, screen: "archetype" },
    { label: "Sort By", value: sortValue, screen: "sort" },
    { label: "Updates", value: "\u2014", screen: "updates" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Filter &amp; Sort</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {rows.map((row) => (
          <button
            key={row.screen}
            onClick={() => onNavigate(row.screen)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
          >
            <span className="text-sm font-semibold text-slate-900">{row.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{row.value}</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-white">
        <button
          onClick={onReset}
          className="text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          Reset Filters
        </button>
        <button
          onClick={onApply}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
