/**
 * Sports Workspaces — Film Room V2 data for Workspaces, Cutups, Assignments, Notes.
 * RBAC-gated via VideoSection keys.
 */

import type { VideoSection } from '@/utils/sports-rbac';

// =============================================================================
// TYPES
// =============================================================================

export type WorkspaceStatus = 'active' | 'archived' | 'draft';

export interface Workspace {
  id: string;
  title: string;
  status: WorkspaceStatus;
  owner: string;
  ownerInitials: string;
  participants: { initials: string; color: string }[];
  linkedObjects: string[];
  clipCount: number;
  lastActivity: string;
  colorStrip: string;
  rbacSection: VideoSection;
}

export interface CutupTemplate {
  id: string;
  category: string;
  description: string;
  icon: string;
  clipCount: number;
  tags: string[];
  rbacSection: VideoSection;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface FilmAssignment {
  id: string;
  title: string;
  assignedTo: { name: string; initials: string; color: string }[];
  dueDate: string;
  isOverdue: boolean;
  completedClips: number;
  totalClips: number;
  status: AssignmentStatus;
  rbacSection: VideoSection;
}

export type FilmNoteType = 'timestamp' | 'clip' | 'series';

export interface FilmNote {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  type: FilmNoteType;
  timestamp?: string;
  clipRef?: string;
  isLocked: boolean;
  createdAt: string;
  rbacSection: VideoSection;
}

// =============================================================================
// HELPERS
// =============================================================================

export function getWorkspaceStatusColor(status: WorkspaceStatus): string {
  switch (status) {
    case 'active': return '#22C55E';
    case 'draft': return '#F59E0B';
    case 'archived': return '#6B7280';
  }
}

export function getWorkspaceStatusLabel(status: WorkspaceStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'draft': return 'Draft';
    case 'archived': return 'Archived';
  }
}

export function getAssignmentStatusColor(status: AssignmentStatus): string {
  switch (status) {
    case 'not_started': return '#6B7280';
    case 'in_progress': return '#3B82F6';
    case 'completed': return '#22C55E';
    case 'overdue': return '#EF4444';
  }
}

export function getAssignmentStatusLabel(status: AssignmentStatus): string {
  switch (status) {
    case 'not_started': return 'Not Started';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'overdue': return 'Overdue';
  }
}

export function getNoteTypeLabel(type: FilmNoteType): string {
  switch (type) {
    case 'timestamp': return 'Timestamp';
    case 'clip': return 'Clip Note';
    case 'series': return 'Series Note';
  }
}

export function getNoteTypeColor(type: FilmNoteType): string {
  switch (type) {
    case 'timestamp': return '#3B82F6';
    case 'clip': return '#8B5CF6';
    case 'series': return '#F59E0B';
  }
}

// =============================================================================
// DATA — WORKSPACES (8)
// =============================================================================

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    title: 'Next Opponent Scout',
    status: 'active',
    owner: 'Coach Kalejaiye',
    ownerInitials: 'SK',
    participants: [
      { initials: 'SK', color: '#1E3A5F' },
      { initials: 'LC', color: '#2D1B69' },
      { initials: 'DW', color: '#3D1A1A' },
    ],
    linkedObjects: ['Lincoln Christian', 'Feb 21 Game'],
    clipCount: 34,
    lastActivity: '2h ago',
    colorStrip: '#EF4444',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-2',
    title: 'Last Game Review',
    status: 'active',
    owner: 'Coach Kalejaiye',
    ownerInitials: 'SK',
    participants: [
      { initials: 'SK', color: '#1E3A5F' },
      { initials: 'MT', color: '#1A3D2A' },
      { initials: 'JC', color: '#3D2A1A' },
    ],
    linkedObjects: ['vs SW Assemblies', 'W 78-65'],
    clipCount: 48,
    lastActivity: '6h ago',
    colorStrip: '#22C55E',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-3',
    title: 'Install: Offense',
    status: 'active',
    owner: 'Coach Lincoln',
    ownerInitials: 'CL',
    participants: [
      { initials: 'CL', color: '#2D1B69' },
      { initials: 'SK', color: '#1E3A5F' },
    ],
    linkedObjects: ['Motion v2', 'Horns Entry'],
    clipCount: 22,
    lastActivity: '1d ago',
    colorStrip: '#3B82F6',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-4',
    title: 'Install: Defense',
    status: 'active',
    owner: 'Coach Davis',
    ownerInitials: 'CD',
    participants: [
      { initials: 'CD', color: '#3D1A1A' },
      { initials: 'SK', color: '#1E3A5F' },
      { initials: 'CL', color: '#2D1B69' },
    ],
    linkedObjects: ['2-3 Zone', 'Switch Rules'],
    clipCount: 18,
    lastActivity: '1d ago',
    colorStrip: '#8B5CF6',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-5',
    title: 'Player: Carter Development',
    status: 'active',
    owner: 'Coach Lincoln',
    ownerInitials: 'CL',
    participants: [
      { initials: 'CL', color: '#2D1B69' },
      { initials: 'JC', color: '#3D2A1A' },
    ],
    linkedObjects: ['Jaylen Carter', 'Finishing'],
    clipCount: 15,
    lastActivity: '2d ago',
    colorStrip: '#F59E0B',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-6',
    title: 'Transition Package',
    status: 'draft',
    owner: 'Coach Kalejaiye',
    ownerInitials: 'SK',
    participants: [
      { initials: 'SK', color: '#1E3A5F' },
    ],
    linkedObjects: ['Fast Break', 'Secondary Break'],
    clipCount: 8,
    lastActivity: '3d ago',
    colorStrip: '#6B7280',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-7',
    title: 'Press Break Install',
    status: 'active',
    owner: 'Coach Davis',
    ownerInitials: 'CD',
    participants: [
      { initials: 'CD', color: '#3D1A1A' },
      { initials: 'SK', color: '#1E3A5F' },
    ],
    linkedObjects: ['2-2-1 Break', '1-2-2 Break'],
    clipCount: 12,
    lastActivity: '4d ago',
    colorStrip: '#EC4899',
    rbacSection: 'filmroom_workspaces',
  },
  {
    id: 'ws-8',
    title: 'End of Game Situations',
    status: 'archived',
    owner: 'Coach Kalejaiye',
    ownerInitials: 'SK',
    participants: [
      { initials: 'SK', color: '#1E3A5F' },
      { initials: 'CL', color: '#2D1B69' },
      { initials: 'CD', color: '#3D1A1A' },
    ],
    linkedObjects: ['ATO', 'SLOB', 'BLOB'],
    clipCount: 28,
    lastActivity: '1w ago',
    colorStrip: '#6B7280',
    rbacSection: 'filmroom_workspaces',
  },
];

// =============================================================================
// DATA — CUTUP TEMPLATES (8)
// =============================================================================

export const MOCK_CUTUP_TEMPLATES: CutupTemplate[] = [
  {
    id: 'ct-1',
    category: 'ATO (After Time Out)',
    description: 'Set plays run after called timeouts',
    icon: 'clock.fill',
    clipCount: 24,
    tags: ['Offense', 'Late Game', 'Set Play'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-2',
    category: 'PNR Defense',
    description: 'Pick-and-roll defensive coverages',
    icon: 'shield.fill',
    clipCount: 38,
    tags: ['Defense', 'PNR', 'Coverage'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-3',
    category: 'Transition',
    description: 'Fast break and secondary break clips',
    icon: 'arrow.right.circle.fill',
    clipCount: 31,
    tags: ['Transition', 'Fast Break', 'Secondary'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-4',
    category: 'BLOB',
    description: 'Baseline out-of-bounds plays',
    icon: 'rectangle.bottomhalf.filled',
    clipCount: 16,
    tags: ['Offense', 'BLOB', 'Set Play'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-5',
    category: 'SLOB',
    description: 'Sideline out-of-bounds plays',
    icon: 'rectangle.leadinghalf.filled',
    clipCount: 14,
    tags: ['Offense', 'SLOB', 'Set Play'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-6',
    category: 'Press Break',
    description: 'Breaking full-court and half-court presses',
    icon: 'arrow.up.circle.fill',
    clipCount: 18,
    tags: ['Offense', 'Press Break', 'Pressure'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-7',
    category: 'Zone Offense',
    description: 'Attacking zone defenses (2-3, 3-2, 1-3-1)',
    icon: 'square.grid.3x3.fill',
    clipCount: 22,
    tags: ['Offense', 'Zone', 'Motion'],
    rbacSection: 'filmroom_cutups',
  },
  {
    id: 'ct-8',
    category: 'Custom',
    description: 'User-created cutup collections',
    icon: 'folder.fill',
    clipCount: 9,
    tags: ['Custom', 'Misc'],
    rbacSection: 'filmroom_cutups',
  },
];

// =============================================================================
// DATA — FILM ASSIGNMENTS (6)
// =============================================================================

export const MOCK_FILM_ASSIGNMENTS: FilmAssignment[] = [
  {
    id: 'fa-1',
    title: 'Watch Lincoln Christian — Last 3 Games',
    assignedTo: [
      { name: 'Jaylen Carter', initials: 'JC', color: '#3D2A1A' },
      { name: 'Marcus Thompson', initials: 'MT', color: '#1A3D2A' },
    ],
    dueDate: 'Feb 19',
    isOverdue: false,
    completedClips: 8,
    totalClips: 15,
    status: 'in_progress',
    rbacSection: 'filmroom_assignments',
  },
  {
    id: 'fa-2',
    title: 'Review Own Defensive Possessions vs SWA',
    assignedTo: [
      { name: 'Devon Williams', initials: 'DW', color: '#1E3A5F' },
    ],
    dueDate: 'Feb 16',
    isOverdue: true,
    completedClips: 3,
    totalClips: 12,
    status: 'overdue',
    rbacSection: 'filmroom_assignments',
  },
  {
    id: 'fa-3',
    title: 'Motion Offense Install — Study 8 Clips',
    assignedTo: [
      { name: 'Chris Anderson', initials: 'CA', color: '#2D1B69' },
      { name: 'Isaiah Brooks', initials: 'IB', color: '#1A1A3D' },
      { name: 'Jaylen Carter', initials: 'JC', color: '#3D2A1A' },
    ],
    dueDate: 'Feb 18',
    isOverdue: false,
    completedClips: 8,
    totalClips: 8,
    status: 'completed',
    rbacSection: 'filmroom_assignments',
  },
  {
    id: 'fa-4',
    title: 'PNR Coverage Study — ICE vs Drop',
    assignedTo: [
      { name: 'Marcus Thompson', initials: 'MT', color: '#1A3D2A' },
      { name: 'Devon Williams', initials: 'DW', color: '#1E3A5F' },
    ],
    dueDate: 'Feb 20',
    isOverdue: false,
    completedClips: 0,
    totalClips: 10,
    status: 'not_started',
    rbacSection: 'filmroom_assignments',
  },
  {
    id: 'fa-5',
    title: 'BLOB Package — Memorize All 4 Sets',
    assignedTo: [
      { name: 'Chris Anderson', initials: 'CA', color: '#2D1B69' },
    ],
    dueDate: 'Feb 17',
    isOverdue: false,
    completedClips: 2,
    totalClips: 4,
    status: 'in_progress',
    rbacSection: 'filmroom_assignments',
  },
  {
    id: 'fa-6',
    title: 'Scout LC #3 Davis — Tendencies',
    assignedTo: [
      { name: 'Coach Lincoln', initials: 'CL', color: '#2D1B69' },
    ],
    dueDate: 'Feb 19',
    isOverdue: false,
    completedClips: 5,
    totalClips: 8,
    status: 'in_progress',
    rbacSection: 'filmroom_assignments',
  },
];

// =============================================================================
// DATA — FILM NOTES (10)
// =============================================================================

export const MOCK_FILM_NOTES: FilmNote[] = [
  {
    id: 'fn-1',
    author: 'Coach Kalejaiye',
    authorInitials: 'SK',
    content: 'LC runs 1-4 flat action after every timeout in Q4. Need to scout ATO package — minimum 3 sets identified.',
    type: 'series',
    isLocked: true,
    createdAt: '2h ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-2',
    author: 'Coach Lincoln',
    authorInitials: 'CL',
    content: 'Carter needs to finish through contact on the left side — 4/11 in last 3 games. Drill: Mikan + contact pad.',
    type: 'clip',
    clipRef: 'Carter Finishing Reel',
    isLocked: false,
    createdAt: '4h ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-3',
    author: 'Coach Davis',
    authorInitials: 'CD',
    content: 'SWA #24 always goes left off ball screen. ICE coverage worked well — 1/6 when forced left.',
    type: 'timestamp',
    timestamp: 'Q2 8:14',
    isLocked: false,
    createdAt: '6h ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-4',
    author: 'Coach Kalejaiye',
    authorInitials: 'SK',
    content: 'Transition D: we\'re giving up 14 fast break points per game. Need to sprint back before anything else.',
    type: 'series',
    isLocked: true,
    createdAt: '1d ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-5',
    author: 'Coach Lincoln',
    authorInitials: 'CL',
    content: 'Thompson\'s catch-and-shoot is much better when he gets his feet set. 52% set vs 28% off-balance.',
    type: 'clip',
    clipRef: 'Thompson 3PT Reel',
    isLocked: false,
    createdAt: '1d ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-6',
    author: 'Coach Kalejaiye',
    authorInitials: 'SK',
    content: 'Press break: Anderson needs to be the primary ball handler. Thompson as safety valve. Do NOT let the 5 touch it.',
    type: 'series',
    isLocked: true,
    createdAt: '2d ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-7',
    author: 'Coach Davis',
    authorInitials: 'CD',
    content: 'Brooks is late on help-side rotations. 3 open layups allowed in Q3. Need to drill gap positioning.',
    type: 'timestamp',
    timestamp: 'Q3 5:42',
    isLocked: false,
    createdAt: '2d ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-8',
    author: 'Coach Lincoln',
    authorInitials: 'CL',
    content: 'Zone offense: overload to the short corner is our best action. 8/12 when we swing to the corner 3.',
    type: 'series',
    isLocked: false,
    createdAt: '3d ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-9',
    author: 'Coach Kalejaiye',
    authorInitials: 'SK',
    content: 'End of game: need a lob play for Carter when they switch. He\'s 6/8 on lobs this season.',
    type: 'clip',
    clipRef: 'EOG Situations',
    isLocked: true,
    createdAt: '4d ago',
    rbacSection: 'filmroom_notes',
  },
  {
    id: 'fn-10',
    author: 'Coach Davis',
    authorInitials: 'CD',
    content: 'Opponent has 3-point percentage of 42% from left wing. Need to shade that way on closeouts.',
    type: 'timestamp',
    timestamp: 'Q1 3:22',
    isLocked: false,
    createdAt: '5d ago',
    rbacSection: 'filmroom_notes',
  },
];
