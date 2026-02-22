/**
 * Mock Player Health & Availability — keyed by KaNeXT jersey number
 */

// =============================================================================
// TYPES
// =============================================================================

export type HealthStatus = 'available' | 'questionable' | 'doubtful' | 'out' | 'day_to_day';

export interface TimelineEvent {
  date: string;
  event: string;
  type: 'injury' | 'treatment' | 'cleared' | 'restriction' | 'note';
}

export interface ReturnCheckpoint {
  label: string;
  completed: boolean;
  date?: string;
}

export interface PracticeDay {
  day: string; // e.g. 'Mon', 'Tue'
  date: string;
  status: 'full' | 'limited' | 'out' | 'rest';
  note?: string;
}

export interface HealthRecord {
  status: HealthStatus;
  statusNote: string;
  timeline: TimelineEvent[];
  restrictions: string[];
  returnCheckpoints: ReturnCheckpoint[];
  practiceAvailability: PracticeDay[];
}

// =============================================================================
// DATA
// =============================================================================

const RECORDS: Record<string, HealthRecord> = {
  '10': {
    status: 'day_to_day',
    statusNote: 'Right ankle sprain — day-to-day',
    timeline: [
      { date: '2026-02-08', event: 'Right ankle sprain during practice', type: 'injury' },
      { date: '2026-02-09', event: 'MRI: Grade 1 sprain, no structural damage', type: 'note' },
      { date: '2026-02-10', event: 'Ice + compression protocol started', type: 'treatment' },
      { date: '2026-02-12', event: 'Light shooting — no lateral movement', type: 'restriction' },
      { date: '2026-02-14', event: 'Began lateral agility progression', type: 'treatment' },
    ],
    restrictions: ['No live contact', 'Limited lateral movement', 'No full-speed transition'],
    returnCheckpoints: [
      { label: 'Pain-free walking', completed: true, date: '2026-02-10' },
      { label: 'Light shooting', completed: true, date: '2026-02-12' },
      { label: 'Lateral agility drills', completed: true, date: '2026-02-14' },
      { label: 'Non-contact practice', completed: false },
      { label: 'Full contact cleared', completed: false },
    ],
    practiceAvailability: [
      { day: 'Mon', date: '2026-02-16', status: 'limited', note: 'Shooting only' },
      { day: 'Tue', date: '2026-02-17', status: 'limited', note: 'Non-contact drills' },
      { day: 'Wed', date: '2026-02-18', status: 'limited', note: 'Eval for contact' },
      { day: 'Thu', date: '2026-02-19', status: 'out', note: 'Rest day' },
      { day: 'Fri', date: '2026-02-20', status: 'limited', note: 'Reassess' },
      { day: 'Sat', date: '2026-02-21', status: 'out', note: 'Game day — TBD' },
      { day: 'Sun', date: '2026-02-22', status: 'rest' },
    ],
  },
  '20': {
    status: 'out',
    statusNote: 'Excused absence — personal leave',
    timeline: [
      { date: '2026-02-05', event: 'Excused absence granted', type: 'note' },
      { date: '2026-02-10', event: 'Expected return: TBD', type: 'note' },
    ],
    restrictions: ['Away from team'],
    returnCheckpoints: [
      { label: 'Return to campus', completed: false },
      { label: 'Medical clearance', completed: false },
      { label: 'Conditioning baseline', completed: false },
    ],
    practiceAvailability: [
      { day: 'Mon', date: '2026-02-16', status: 'out' },
      { day: 'Tue', date: '2026-02-17', status: 'out' },
      { day: 'Wed', date: '2026-02-18', status: 'out' },
      { day: 'Thu', date: '2026-02-19', status: 'out' },
      { day: 'Fri', date: '2026-02-20', status: 'out' },
      { day: 'Sat', date: '2026-02-21', status: 'out' },
      { day: 'Sun', date: '2026-02-22', status: 'out' },
    ],
  },
};

// Default healthy record
function makeHealthyRecord(): HealthRecord {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseDate = new Date(2026, 1, 16); // Feb 16, 2026
  return {
    status: 'available',
    statusNote: 'Fully available — no restrictions',
    timeline: [],
    restrictions: [],
    returnCheckpoints: [],
    practiceAvailability: days.map((day, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (day === 'Sun') return { day, date: dateStr, status: 'rest' as const };
      if (day === 'Sat') return { day, date: dateStr, status: 'full' as const, note: 'Game day' };
      return { day, date: dateStr, status: 'full' as const };
    }),
  };
}

// =============================================================================
// EXPORT
// =============================================================================

export function getPlayerHealth(jersey: string): HealthRecord {
  return RECORDS[jersey] ?? makeHealthyRecord();
}
