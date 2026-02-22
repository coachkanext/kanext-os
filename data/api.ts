/**
 * Mock API Layer
 * Provides a typed API interface that can later be connected to Airtable or other backends.
 * Currently returns mock data with simulated async behavior.
 */

import type {
  Mode,
  Role,
  SimulationResult,
  SavedSimulation,
  ActivityItem,
  SearchResult,
  AcademicTerm,
  AcademicCalendarEvent,
  FacultyMember,
  Department,
  Campus,
  Ministry,
  BoardMember,
  Domain,
  Document,
  ChurchMessage,
} from '@/types';

// Import mock data
import {
  INSTITUTION,
  PROGRAMS,
  INSTITUTION_LEADERSHIP,
  PLAYER_PROFILES,
  getPlayerProfile,
  getProgramById,
  getUpcomingGames,
  type ProgramData,
  type Staff,
  type PlayerProfile,
  type Game,
} from './mock-sports';
import {
  KANEXT_ORGANIZATION,
  BOARD_MEMBERS,
  LEADERSHIP_TEAM,
  DOMAINS,
  DOCUMENTS,
} from './mock-business-investor';
import {
  ICC_ORGANIZATION,
  CAMPUSES,
  MINISTRIES,
  MESSAGES,
  CHURCH_LEADERSHIP,
  type ChurchLeader,
} from './mock-church';
import {
  KANEXT_UNIVERSITY_ORGANIZATION,
  ACADEMIC_TERMS,
  ACADEMIC_CALENDAR,
  DEPARTMENTS,
  FACULTY_LEADERSHIP,
} from './mock-education';
import { SAMPLE_SIMULATIONS, SAVED_SIMULATIONS } from './mock-simulations';
import { getFilteredActivity } from './mock-activity';
import { searchInMode } from './mock-search';

// =============================================================================
// API CONFIGURATION
// =============================================================================

interface ApiConfig {
  baseUrl: string;
  mockDelay: number; // Simulated network delay in ms
  useMockData: boolean;
}

const config: ApiConfig = {
  baseUrl: '', // Would be Airtable API URL in production
  mockDelay: 100, // Small delay to simulate network
  useMockData: true, // Toggle for mock vs real API
};

// Helper to simulate async API calls
async function mockFetch<T>(data: T): Promise<T> {
  if (config.mockDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, config.mockDelay));
  }
  return data;
}

// =============================================================================
// ORGANIZATION API
// =============================================================================

export async function fetchSportsOrganization() {
  return mockFetch(INSTITUTION);
}

export async function fetchBusinessOrganization() {
  return mockFetch(KANEXT_ORGANIZATION);
}

export async function fetchChurchOrganization() {
  return mockFetch(ICC_ORGANIZATION);
}

export async function fetchEducationOrganization() {
  return mockFetch(KANEXT_UNIVERSITY_ORGANIZATION);
}

// =============================================================================
// SPORTS API
// =============================================================================

export async function fetchPrograms(): Promise<ProgramData[]> {
  return mockFetch(PROGRAMS);
}

export async function fetchProgram(programId: string): Promise<ProgramData | undefined> {
  const program = getProgramById(programId);
  return mockFetch(program);
}

export async function fetchPlayer(playerId: string): Promise<PlayerProfile | undefined> {
  const player = getPlayerProfile(playerId);
  return mockFetch(player);
}

export async function fetchPlayers(): Promise<PlayerProfile[]> {
  return mockFetch(Object.values(PLAYER_PROFILES));
}

export async function fetchSportsStaff(): Promise<Staff[]> {
  return mockFetch(INSTITUTION_LEADERSHIP);
}

export async function fetchSchedule(programId: string, limit = 10): Promise<Game[]> {
  const games = getUpcomingGames(programId, limit);
  return mockFetch(games);
}

// =============================================================================
// BUSINESS API
// =============================================================================

export async function fetchDocuments(role: Role): Promise<Document[]> {
  // Filter documents based on role visibility
  const filtered = DOCUMENTS.filter((doc) => {
    if (role === 'founder') return true;
    if (role === 'investor') return doc.visibility !== 'founder';
    return doc.visibility === 'public';
  });
  return mockFetch(filtered);
}

export async function fetchBoardMembers(): Promise<BoardMember[]> {
  return mockFetch(BOARD_MEMBERS);
}

export async function fetchLeadershipTeam(): Promise<BoardMember[]> {
  return mockFetch(LEADERSHIP_TEAM);
}

export async function fetchDomains(): Promise<Domain[]> {
  return mockFetch(DOMAINS);
}

// =============================================================================
// CHURCH API
// =============================================================================

export async function fetchCampuses(): Promise<Campus[]> {
  return mockFetch(CAMPUSES);
}

export async function fetchCampus(campusId: string): Promise<Campus | null> {
  const campus = CAMPUSES.find((c) => c.id === campusId);
  return mockFetch(campus || null);
}

export async function fetchMinistries(): Promise<Ministry[]> {
  return mockFetch(MINISTRIES);
}

export async function fetchMinistry(ministryId: string): Promise<Ministry | null> {
  const ministry = MINISTRIES.find((m) => m.id === ministryId);
  return mockFetch(ministry || null);
}

export async function fetchChurchMessages(): Promise<ChurchMessage[]> {
  return mockFetch(MESSAGES);
}

export async function fetchChurchLeadership(): Promise<ChurchLeader[]> {
  return mockFetch(CHURCH_LEADERSHIP);
}

// =============================================================================
// EDUCATION API
// =============================================================================

export async function fetchAcademicTerms(): Promise<AcademicTerm[]> {
  return mockFetch(ACADEMIC_TERMS);
}

export async function fetchTerm(termId: string): Promise<AcademicTerm | null> {
  const term = ACADEMIC_TERMS.find((t) => t.id === termId);
  return mockFetch(term || null);
}

export async function fetchCalendarEvents(termId?: string): Promise<AcademicCalendarEvent[]> {
  if (termId) {
    const filtered = ACADEMIC_CALENDAR.filter((e) => e.termId === termId);
    return mockFetch(filtered);
  }
  return mockFetch(ACADEMIC_CALENDAR);
}

export async function fetchDepartments(): Promise<Department[]> {
  return mockFetch(DEPARTMENTS);
}

export async function fetchFacultyLeadership(): Promise<FacultyMember[]> {
  return mockFetch(FACULTY_LEADERSHIP);
}

export async function fetchFacultyMember(memberId: string): Promise<FacultyMember | null> {
  const faculty = FACULTY_LEADERSHIP.find((f) => f.id === memberId);
  return mockFetch(faculty || null);
}

// =============================================================================
// SIMULATION API
// =============================================================================

export async function fetchSimulations(): Promise<SimulationResult[]> {
  return mockFetch(SAMPLE_SIMULATIONS);
}

export async function fetchSimulation(simId: string): Promise<SimulationResult | null> {
  const sim = SAMPLE_SIMULATIONS.find((s) => s.id === simId);
  return mockFetch(sim || null);
}

export async function fetchSavedSimulations(): Promise<SavedSimulation[]> {
  return mockFetch(SAVED_SIMULATIONS);
}

export async function saveSimulation(
  simulation: SimulationResult,
  threadId: string,
  title: string
): Promise<SavedSimulation> {
  const saved: SavedSimulation = {
    ...simulation,
    threadId,
    savedAt: new Date(),
    title,
  };
  // In production, this would POST to the API
  return mockFetch(saved);
}

// =============================================================================
// ACTIVITY API
// =============================================================================

export async function fetchActivity(mode: Mode, role: Role): Promise<ActivityItem[]> {
  const activity = getFilteredActivity(mode, role);
  return mockFetch(activity);
}

// =============================================================================
// SEARCH API
// =============================================================================

export async function search(query: string, mode: Mode): Promise<SearchResult[]> {
  const results = searchInMode(query, mode);
  return mockFetch(results);
}

// =============================================================================
// API STATUS
// =============================================================================

export function isUsingMockData(): boolean {
  return config.useMockData;
}

export function getApiConfig(): Readonly<ApiConfig> {
  return { ...config };
}
