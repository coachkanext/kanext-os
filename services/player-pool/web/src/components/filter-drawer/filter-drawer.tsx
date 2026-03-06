"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  LevelOption,
  TeamOption,
  AppliedFilters,
  DrawerScreen,
  SortConfig,
  StatView,
  TraditionalMode,
} from "@/types/filters";
import DrawerMain from "./drawer-main";
import DrawerLevel from "./drawer-level";
import {
  DEFAULT_TRADITIONAL_SORT,
  DEFAULT_KANEXT_SORT,
  TRADITIONAL_CATEGORIES,
  KANEXT_TOP_OPTIONS,
  KANEXT_CLUSTERS,
} from "./sort-options";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface Props {
  open: boolean;
  onClose: () => void;
  appliedFilters: AppliedFilters;
  onApply: (filters: AppliedFilters) => void;
  statView: StatView;
  onSwitchView: (view: StatView) => void;
  traditionalMode: TraditionalMode;
  onSwitchTraditionalMode: (mode: TraditionalMode) => void;
}

/* ------------------------------------------------------------------ */
/* Default filters                                                     */
/* ------------------------------------------------------------------ */

const EMPTY_FILTERS: Omit<AppliedFilters, "sort"> = {
  levelKey: null,
  teamIds: [],
  positions: [],
  archetypes: [],
};

const POSITIONS = ["PG", "CG", "SG", "SF", "PF", "C"];

const ARCHETYPES = [
  "Shooter",
  "Shot Creator",
  "Rim Pressure",
  "Playmaker",
  "Point-of-Attack Defender",
  "Help Defender",
  "Rim Protector",
  "Rebounder",
  "Stretch Big",
  "Connector",
];

export { DEFAULT_TRADITIONAL_SORT, DEFAULT_KANEXT_SORT } from "./sort-options";

/* ------------------------------------------------------------------ */
/* Sub-screen header (shared by conference & teams)                    */
/* ------------------------------------------------------------------ */

function SubHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
      <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded transition-colors">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className="flex-1 text-base font-bold text-slate-900">{title}</h2>
      <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Search input (shared by conference & teams)                         */
/* ------------------------------------------------------------------ */

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="px-5 py-3 border-b border-slate-100">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 pl-9 pr-3 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox row                                                        */
/* ------------------------------------------------------------------ */

function CheckRow({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
      />
      <span className="flex-1 min-w-0">
        <span className="text-sm text-slate-800 block truncate">{label}</span>
        {sublabel && (
          <span className="text-xs text-slate-400 block truncate">{sublabel}</span>
        )}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Teams sub-screen (grouped by conference)                            */
/* ------------------------------------------------------------------ */

const LEVEL_LABELS: Record<string, string> = {
  ncaa_d1: "NCAA D1",
  ncaa_d2: "NCAA D2",
  ncaa_d3: "NCAA D3",
  naia: "NAIA",
  njcaa_d1: "NJCAA D1",
  njcaa_d2: "NJCAA D2",
  njcaa_d3: "NJCAA D3",
  cccaa: "CCCAA",
};

interface ConferenceGroup {
  id: string | null;
  name: string;
  teams: TeamOption[];
}

interface LevelGroup {
  levelKey: string;
  label: string;
  conferences: ConferenceGroup[];
}

function TeamsScreen({
  levelKey,
  selectedIds,
  onToggle,
  onToggleAll,
  onBack,
  onClose,
}: {
  levelKey: string | null;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (levelKey) params.set("levelKey", levelKey);
    fetch(`/api/filters/teams?${params}`)
      .then((r) => r.json())
      .then((d) => setTeams(d.teams))
      .finally(() => setLoading(false));
  }, [levelKey]);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const allVisible = filtered.map((t) => t.id);
  const allChecked = allVisible.length > 0 && allVisible.every((id) => selectedIds.includes(id));

  const toggleExpand = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Build grouped structure: Level → Conference → Teams
  function buildGroups(teamList: TeamOption[]): LevelGroup[] {
    // Group teams by levelKey first
    const byLevel: Record<string, TeamOption[]> = {};
    for (const t of teamList) {
      (byLevel[t.levelKey] ??= []).push(t);
    }

    // For each level, group by conference
    const levelOrder = Object.keys(LEVEL_LABELS);
    const result: LevelGroup[] = [];

    for (const lk of levelOrder) {
      const lvlTeams = byLevel[lk];
      if (!lvlTeams || lvlTeams.length === 0) continue;

      const byConf: Record<string, TeamOption[]> = {};
      const noConf: TeamOption[] = [];

      for (const t of lvlTeams) {
        if (t.conferenceId && t.conferenceName) {
          (byConf[t.conferenceId] ??= []).push(t);
        } else {
          noConf.push(t);
        }
      }

      const conferences: ConferenceGroup[] = [];

      // Add conference groups sorted by name
      const confEntries = Object.entries(byConf).sort((a, b) => {
        const nameA = a[1][0]?.conferenceName ?? "";
        const nameB = b[1][0]?.conferenceName ?? "";
        return nameA.localeCompare(nameB);
      });
      for (const [confId, confTeams] of confEntries) {
        conferences.push({
          id: confId,
          name: confTeams[0].conferenceName ?? "Unknown",
          teams: confTeams.sort((a, b) => a.name.localeCompare(b.name)),
        });
      }

      // Add unaffiliated teams as a single group
      if (noConf.length > 0) {
        conferences.push({
          id: null,
          name: "Independent",
          teams: noConf.sort((a, b) => a.name.localeCompare(b.name)),
        });
      }

      result.push({
        levelKey: lk,
        label: LEVEL_LABELS[lk] ?? lk,
        conferences,
      });
    }

    return result;
  }

  // When a specific level is selected, just show conference accordion
  // When "All" is selected, show level → conference two-level accordion
  const groups = buildGroups(filtered);
  const isSingleLevel = levelKey !== null;

  return (
    <div className="flex flex-col h-full">
      <SubHeader title="Teams" onBack={onBack} onClose={onClose} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search teams..." />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            {teams.length === 0 ? "No teams available" : "No teams match your search"}
          </div>
        ) : (
          <>
            {/* Select All */}
            <label className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onToggleAll(allVisible, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
              />
              <span className="text-sm font-semibold text-slate-900">
                Select All ({filtered.length})
              </span>
            </label>

            {groups.map((lvlGroup) => {
              const hasConferences = lvlGroup.conferences.some((c) => c.id !== null);

              if (isSingleLevel && !hasConferences) {
                // Single level with no conferences — flat list
                return lvlGroup.conferences.map((confGroup) =>
                  confGroup.teams.map((t) => (
                    <CheckRow
                      key={t.id}
                      label={t.name}
                      checked={selectedIds.includes(t.id)}
                      onChange={() => onToggle(t.id)}
                    />
                  ))
                );
              }

              if (isSingleLevel && hasConferences) {
                // Single level with conferences — conference accordion
                return lvlGroup.conferences.map((confGroup) => {
                  const confKey = `conf-${confGroup.id ?? "ind"}`;
                  const confTeamIds = confGroup.teams.map((t) => t.id);
                  const confAllChecked = confTeamIds.length > 0 && confTeamIds.every((id) => selectedIds.includes(id));
                  return (
                    <div key={confKey}>
                      <button
                        onClick={() => toggleExpand(confKey)}
                        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 text-left"
                      >
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {confGroup.name} ({confGroup.teams.length})
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${expanded[confKey] ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expanded[confKey] && (
                        <>
                          {/* Conference-level select all */}
                          <label className="flex items-center gap-3 px-5 py-2.5 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100">
                            <input
                              type="checkbox"
                              checked={confAllChecked}
                              onChange={(e) => onToggleAll(confTeamIds, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                            />
                            <span className="text-xs font-semibold text-slate-600">
                              Select All ({confGroup.teams.length})
                            </span>
                          </label>
                          {confGroup.teams.map((t) => (
                            <CheckRow
                              key={t.id}
                              label={t.name}
                              checked={selectedIds.includes(t.id)}
                              onChange={() => onToggle(t.id)}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  );
                });
              }

              // Multi-level view — level header → conference accordion
              const lvlKey = `lvl-${lvlGroup.levelKey}`;
              const lvlTeamIds = lvlGroup.conferences.flatMap((c) => c.teams.map((t) => t.id));
              return (
                <div key={lvlKey}>
                  <button
                    onClick={() => toggleExpand(lvlKey)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-slate-100 border-b border-slate-200 text-left"
                  >
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {lvlGroup.label} ({lvlTeamIds.length})
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${expanded[lvlKey] ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expanded[lvlKey] && (
                    <>
                      {hasConferences ? (
                        // Conference sub-accordions
                        lvlGroup.conferences.map((confGroup) => {
                          const confKey = `${lvlKey}-conf-${confGroup.id ?? "ind"}`;
                          const confTeamIds = confGroup.teams.map((t) => t.id);
                          const confAllChecked = confTeamIds.length > 0 && confTeamIds.every((id) => selectedIds.includes(id));
                          return (
                            <div key={confKey}>
                              <button
                                onClick={() => toggleExpand(confKey)}
                                className="w-full flex items-center justify-between px-5 py-2.5 pl-8 bg-slate-50 border-b border-slate-100 text-left"
                              >
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  {confGroup.name} ({confGroup.teams.length})
                                </span>
                                <svg
                                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expanded[confKey] ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {expanded[confKey] && (
                                <>
                                  <label className="flex items-center gap-3 px-5 pl-8 py-2 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100">
                                    <input
                                      type="checkbox"
                                      checked={confAllChecked}
                                      onChange={(e) => onToggleAll(confTeamIds, e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                                    />
                                    <span className="text-xs font-semibold text-slate-600">
                                      Select All ({confGroup.teams.length})
                                    </span>
                                  </label>
                                  {confGroup.teams.map((t) => (
                                    <CheckRow
                                      key={t.id}
                                      label={t.name}
                                      checked={selectedIds.includes(t.id)}
                                      onChange={() => onToggle(t.id)}
                                    />
                                  ))}
                                </>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        // No conferences — flat team list under level
                        lvlGroup.conferences.flatMap((confGroup) =>
                          confGroup.teams.map((t) => (
                            <CheckRow
                              key={t.id}
                              label={t.name}
                              checked={selectedIds.includes(t.id)}
                              onChange={() => onToggle(t.id)}
                            />
                          ))
                        )
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Position sub-screen                                                 */
/* ------------------------------------------------------------------ */

function PositionScreen({
  selectedIds,
  onToggle,
  onToggleAll,
  onBack,
  onClose,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const allChecked = POSITIONS.length > 0 && POSITIONS.every((p) => selectedIds.includes(p));

  return (
    <div className="flex flex-col h-full">
      <SubHeader title="Position" onBack={onBack} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        {/* Select All */}
        <label className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => onToggleAll(POSITIONS, e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
          />
          <span className="text-sm font-semibold text-slate-900">
            Select All ({POSITIONS.length})
          </span>
        </label>
        {POSITIONS.map((p) => (
          <CheckRow
            key={p}
            label={p}
            checked={selectedIds.includes(p)}
            onChange={() => onToggle(p)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Archetype sub-screen                                                */
/* ------------------------------------------------------------------ */

function ArchetypeScreen({
  selectedIds,
  onToggle,
  onToggleAll,
  onBack,
  onClose,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = ARCHETYPES.filter((a) =>
    a.toLowerCase().includes(search.toLowerCase())
  );

  const allChecked = filtered.length > 0 && filtered.every((a) => selectedIds.includes(a));

  return (
    <div className="flex flex-col h-full">
      <SubHeader title="Archetype" onBack={onBack} onClose={onClose} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search archetypes..." />
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            No archetypes match your search
          </div>
        ) : (
          <>
            <label className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onToggleAll(filtered, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
              />
              <span className="text-sm font-semibold text-slate-900">
                Select All ({filtered.length})
              </span>
            </label>
            {filtered.map((a) => (
              <CheckRow
                key={a}
                label={a}
                checked={selectedIds.includes(a)}
                onChange={() => onToggle(a)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Updates sub-screen (placeholder)                                    */
/* ------------------------------------------------------------------ */

function UpdatesScreen({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <SubHeader title="Updates" onBack={onBack} onClose={onClose} />
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-slate-400">Coming soon</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sort sub-screen                                                     */
/* ------------------------------------------------------------------ */

function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        active ? "border-slate-900" : "border-slate-300"
      }`}
    >
      {active && <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
    </span>
  );
}

function SortScreen({
  sort,
  statView,
  traditionalMode,
  onSwitchView,
  onSwitchTraditionalMode,
  onSelectSort,
  onBack,
  onClose,
}: {
  sort: SortConfig;
  statView: StatView;
  traditionalMode: TraditionalMode;
  onSwitchView: (view: StatView) => void;
  onSwitchTraditionalMode: (mode: TraditionalMode) => void;
  onSelectSort: (sort: SortConfig) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSort = (key: string, defaultDir: "asc" | "desc") => {
    if (sort.key === key) {
      onSelectSort({ key, direction: sort.direction === "desc" ? "asc" : "desc" });
    } else {
      onSelectSort({ key, direction: defaultDir });
    }
  };

  const handleTraditionalSort = (categoryKey: TraditionalMode, sortKey: string, defaultDir: "asc" | "desc") => {
    if (statView !== "traditional") onSwitchView("traditional");
    if (traditionalMode !== categoryKey) {
      onSwitchTraditionalMode(categoryKey);
    }
    handleSort(sortKey, defaultDir);
  };

  const handleKanextSort = (key: string, defaultDir: "asc" | "desc") => {
    if (statView !== "kanext") onSwitchView("kanext");
    handleSort(key, defaultDir);
  };

  const traditionalExpanded = expandedSections["__traditional"] ?? false;
  const kanextExpanded = expandedSections["__kanext"] ?? false;

  // Check if any traditional sort is active
  const hasTraditionalSort = TRADITIONAL_CATEGORIES.some((cat) =>
    cat.options.some((o) => o.key === sort.key)
  );
  // Check if any kanext sort is active
  const hasKanextSort = !hasTraditionalSort && (
    KANEXT_TOP_OPTIONS.some((o) => o.key === sort.key) ||
    KANEXT_CLUSTERS.some((c) => c.key === sort.key || c.traits.some((t) => t.key === sort.key))
  );

  return (
    <div className="flex flex-col h-full">
      <SubHeader title="Sort By" onBack={onBack} onClose={onClose} />

      <div className="flex-1 overflow-y-auto">
        {/* ---- Traditional (expandable) ---- */}
        <button
          onClick={() => toggleSection("__traditional")}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
        >
          <span className={`text-sm font-semibold ${hasTraditionalSort ? "text-slate-900" : "text-slate-900"}`}>
            Traditional
            {hasTraditionalSort && statView === "traditional" && (
              <span className="ml-2 text-xs font-normal text-slate-400">Active</span>
            )}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${traditionalExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {traditionalExpanded && (
          <div>
            {TRADITIONAL_CATEGORIES.map((cat) => {
              const catExpanded = expandedSections[cat.key] ?? false;
              const hasActiveSortInCategory = cat.options.some((o) => o.key === sort.key);
              return (
                <div key={cat.key}>
                  <button
                    onClick={() => toggleSection(cat.key)}
                    className="w-full flex items-center justify-between pl-10 pr-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className={`text-sm ${hasActiveSortInCategory ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                      {cat.label}
                      {hasActiveSortInCategory && (
                        <span className="ml-2 text-xs text-slate-400">
                          {cat.options.find((o) => o.key === sort.key)?.label}
                        </span>
                      )}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${catExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {catExpanded && (
                    <div className="bg-slate-50 border-b border-slate-100">
                      {cat.options.map((opt) => {
                        const active = sort.key === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleTraditionalSort(cat.key, opt.key, opt.defaultDirection)}
                            className="w-full flex items-center gap-3 pl-16 pr-5 py-2.5 hover:bg-slate-100 transition-colors text-left"
                          >
                            <RadioDot active={active} />
                            <span className={`text-sm ${active ? "font-bold text-slate-900" : "text-slate-600"}`}>
                              {opt.label}
                              {active && (
                                <span className="ml-1 text-slate-400">
                                  {sort.direction === "desc" ? "\u2193" : "\u2191"}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ---- KaNeXT (expandable) ---- */}
        <button
          onClick={() => toggleSection("__kanext")}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
        >
          <span className="text-sm font-semibold text-slate-900">
            KaNeXT
            {hasKanextSort && statView === "kanext" && (
              <span className="ml-2 text-xs font-normal text-slate-400">Active</span>
            )}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${kanextExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {kanextExpanded && (
          <div>
            {/* KR top option */}
            {KANEXT_TOP_OPTIONS.map((opt) => {
              const active = sort.key === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleKanextSort(opt.key, opt.defaultDirection)}
                  className="w-full flex items-center gap-3 pl-10 pr-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
                >
                  <RadioDot active={active} />
                  <span className={`text-sm ${active ? "font-bold text-slate-900" : "text-slate-700"}`}>
                    {opt.label}
                    {active && (
                      <span className="ml-1 text-slate-400">
                        {sort.direction === "desc" ? "\u2193" : "\u2191"}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}

            {/* 8 Clusters */}
            {KANEXT_CLUSTERS.map((cluster) => {
              const active = sort.key === cluster.key;
              const clusterExpanded = expandedSections[cluster.key] ?? false;
              return (
                <div key={cluster.key}>
                  <div className="flex items-center border-b border-slate-100">
                    <button
                      onClick={() => handleKanextSort(cluster.key, cluster.defaultDirection)}
                      className="flex-1 flex items-center gap-3 pl-10 pr-5 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <RadioDot active={active} />
                      <span className={`text-sm ${active ? "font-bold text-slate-900" : "text-slate-700"}`}>
                        {cluster.label}
                        {active && (
                          <span className="ml-1 text-slate-400">
                            {sort.direction === "desc" ? "\u2193" : "\u2191"}
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => toggleSection(cluster.key)}
                      className="px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${clusterExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {clusterExpanded && (
                    <div className="bg-slate-50 border-b border-slate-100">
                      {cluster.traits.map((trait) => {
                        const traitActive = sort.key === trait.key;
                        return (
                          <button
                            key={trait.key}
                            onClick={() => handleKanextSort(trait.key, "desc")}
                            className="w-full flex items-center gap-3 pl-20 pr-5 py-2.5 hover:bg-slate-100 transition-colors text-left"
                          >
                            <RadioDot active={traitActive} />
                            <span className={`text-xs ${traitActive ? "font-bold text-slate-900" : "text-slate-500"}`}>
                              {trait.label}
                              {traitActive && (
                                <span className="ml-1 text-slate-400">
                                  {sort.direction === "desc" ? "\u2193" : "\u2191"}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FilterDrawer (root)                                                 */
/* ------------------------------------------------------------------ */

export default function FilterDrawer({ open, onClose, appliedFilters, onApply, statView, onSwitchView, traditionalMode, onSwitchTraditionalMode }: Props) {
  const [draft, setDraft] = useState<AppliedFilters>({ ...EMPTY_FILTERS, sort: appliedFilters.sort });
  const [screen, setScreen] = useState<DrawerScreen>("main");
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch levels once
  useEffect(() => {
    fetch("/api/filters/levels")
      .then((r) => r.json())
      .then((d) => setLevels(d.levels));
  }, []);

  // Reset draft & screen when drawer opens
  useEffect(() => {
    if (open) {
      setDraft({ ...appliedFilters });
      setScreen("main");
    }
  }, [open, appliedFilters]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Draft mutators */

  const selectLevel = useCallback((levelKey: string | null) => {
    setDraft((prev) => ({
      ...prev,
      levelKey,
      teamIds: [],
    }));
  }, []);

  const toggleTeam = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(id)
        ? prev.teamIds.filter((t) => t !== id)
        : [...prev.teamIds, id],
    }));
  }, []);

  const toggleAllTeams = useCallback((ids: string[], checked: boolean) => {
    setDraft((prev) => {
      if (checked) {
        const merged = new Set([...prev.teamIds, ...ids]);
        return { ...prev, teamIds: Array.from(merged) };
      } else {
        const remove = new Set(ids);
        return { ...prev, teamIds: prev.teamIds.filter((t) => !remove.has(t)) };
      }
    });
  }, []);

  const togglePosition = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      positions: prev.positions.includes(id)
        ? prev.positions.filter((p) => p !== id)
        : [...prev.positions, id],
    }));
  }, []);

  const toggleAllPositions = useCallback((ids: string[], checked: boolean) => {
    setDraft((prev) => {
      if (checked) {
        const merged = new Set([...prev.positions, ...ids]);
        return { ...prev, positions: Array.from(merged) };
      } else {
        const remove = new Set(ids);
        return { ...prev, positions: prev.positions.filter((p) => !remove.has(p)) };
      }
    });
  }, []);

  const toggleArchetype = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      archetypes: prev.archetypes.includes(id)
        ? prev.archetypes.filter((a) => a !== id)
        : [...prev.archetypes, id],
    }));
  }, []);

  const toggleAllArchetypes = useCallback((ids: string[], checked: boolean) => {
    setDraft((prev) => {
      if (checked) {
        const merged = new Set([...prev.archetypes, ...ids]);
        return { ...prev, archetypes: Array.from(merged) };
      } else {
        const remove = new Set(ids);
        return { ...prev, archetypes: prev.archetypes.filter((a) => !remove.has(a)) };
      }
    });
  }, []);

  const selectSort = useCallback((sort: SortConfig) => {
    setDraft((prev) => ({ ...prev, sort }));
  }, []);

  const resetDraft = useCallback(() => {
    const defaultSort = statView === "traditional" ? DEFAULT_TRADITIONAL_SORT : DEFAULT_KANEXT_SORT;
    setDraft({ ...EMPTY_FILTERS, sort: defaultSort });
  }, [statView]);

  const applyAndClose = useCallback(() => {
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  /* Render */

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed inset-y-0 left-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {screen === "main" && (
          <DrawerMain
            levelKey={draft.levelKey}
            teamIds={draft.teamIds}
            positions={draft.positions}
            archetypes={draft.archetypes}
            sort={draft.sort}
            statView={statView}
            levels={levels}
            onNavigate={setScreen}
            onReset={resetDraft}
            onApply={applyAndClose}
            onClose={onClose}
          />
        )}

        {screen === "level" && (
          <DrawerLevel
            levels={levels}
            selected={draft.levelKey}
            onSelect={(k) => {
              selectLevel(k);
              setScreen("main");
            }}
            onBack={() => setScreen("main")}
            onClose={onClose}
          />
        )}

        {screen === "teams" && (
          <TeamsScreen
            levelKey={draft.levelKey}
            selectedIds={draft.teamIds}
            onToggle={toggleTeam}
            onToggleAll={toggleAllTeams}
            onBack={() => setScreen("main")}
            onClose={onClose}
          />
        )}

        {screen === "position" && (
          <PositionScreen
            selectedIds={draft.positions}
            onToggle={togglePosition}
            onToggleAll={toggleAllPositions}
            onBack={() => setScreen("main")}
            onClose={onClose}
          />
        )}

        {screen === "archetype" && (
          <ArchetypeScreen
            selectedIds={draft.archetypes}
            onToggle={toggleArchetype}
            onToggleAll={toggleAllArchetypes}
            onBack={() => setScreen("main")}
            onClose={onClose}
          />
        )}

        {screen === "sort" && (
          <SortScreen
            sort={draft.sort}
            statView={statView}
            traditionalMode={traditionalMode}
            onSwitchView={(view) => {
              const defaultSort = view === "traditional" ? DEFAULT_TRADITIONAL_SORT : DEFAULT_KANEXT_SORT;
              selectSort(defaultSort);
              onSwitchView(view);
            }}
            onSwitchTraditionalMode={onSwitchTraditionalMode}
            onSelectSort={selectSort}
            onBack={() => setScreen("main")}
            onClose={onClose}
          />
        )}

        {screen === "updates" && (
          <UpdatesScreen
            onBack={() => setScreen("main")}
            onClose={onClose}
          />
        )}

      </div>
    </>
  );
}
