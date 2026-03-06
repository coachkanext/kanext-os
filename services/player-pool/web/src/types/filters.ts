export interface LevelOption {
  id: string;
  levelKey: string;
  displayName: string;
}

export interface ConferenceOption {
  id: string;
  name: string;
  levelKey: string;
  teamCount: number;
}

export interface TeamOption {
  id: string;
  name: string;
  conferenceId: string | null;
  conferenceName: string | null;
  levelKey: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface SortOption {
  key: string;
  label: string;
  defaultDirection: "asc" | "desc";
  traits?: string;
}

export interface AppliedFilters {
  levelKey: string | null;
  teamIds: string[];
  positions: string[];
  archetypes: string[];
  sort: SortConfig;
}

export type StatView = "traditional" | "kanext";

export type TraditionalMode = "per_game" | "totals" | "shooting" | "advanced" | "scoring" | "per40";

export type DrawerScreen = "main" | "level" | "teams" | "position" | "archetype" | "sort" | "updates";
