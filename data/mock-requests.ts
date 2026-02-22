/**
 * Mock Requests Data
 * Types and mock data for the Requests surface.
 */

// =============================================================================
// TYPES
// =============================================================================

export type RequestType = 'recruit_inbound' | 'parent_inbound' | 'unknown_contact' | 'scout_inquiry';
export type RequestStatus = 'pending' | 'approved';

export interface RequestItem {
  id: string;
  type: RequestType;
  name: string;
  initials: string;
  context: string;
  message?: string;
  timestamp: Date;
  status: RequestStatus;
}

// =============================================================================
// HELPERS
// =============================================================================

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000);

function getRequestTypeLabel(type: RequestType): string {
  switch (type) {
    case 'recruit_inbound': return 'Recruit';
    case 'parent_inbound': return 'Parent';
    case 'unknown_contact': return 'Unknown';
    case 'scout_inquiry': return 'Scout';
  }
}

function getRequestTypeColor(type: RequestType): string {
  switch (type) {
    case 'recruit_inbound': return '#4CAF50';
    case 'parent_inbound': return '#2196F3';
    case 'unknown_contact': return '#6e6e6e';
    case 'scout_inquiry': return '#FFA500';
  }
}

export { getRequestTypeLabel, getRequestTypeColor };

// =============================================================================
// MOCK DATA
// =============================================================================

export const MOCK_PENDING_REQUESTS: RequestItem[] = [
  {
    id: 'req-1',
    type: 'recruit_inbound',
    name: 'Tre Washington',
    initials: 'TW',
    context: '2026 PG · Houston, TX',
    message: 'Coach, I saw the offer to Jaylen. Would love to learn more about the program.',
    timestamp: ago(45),
    status: 'pending',
  },
  {
    id: 'req-2',
    type: 'parent_inbound',
    name: 'Sandra Williams',
    initials: 'SW',
    context: 'Parent of Deon Williams',
    message: 'Hi Coach — I have a question about the spring schedule.',
    timestamp: ago(180),
    status: 'pending',
  },
  {
    id: 'req-3',
    type: 'unknown_contact',
    name: 'Mike Torres',
    initials: 'MT',
    context: 'Unknown · No affiliation',
    message: 'Hey coach, big fan of the program. Would love to connect.',
    timestamp: ago(720),
    status: 'pending',
  },
  {
    id: 'req-4',
    type: 'scout_inquiry',
    name: 'Rick Patterson',
    initials: 'RP',
    context: 'Scout · Southeast Region',
    message: 'Looking to get eval tape on Marcus Johnson for our upcoming draft board.',
    timestamp: ago(1440),
    status: 'pending',
  },
  {
    id: 'req-5',
    type: 'recruit_inbound',
    name: 'Amir Jackson',
    initials: 'AJ',
    context: '2027 SG · Nashville, TN',
    message: 'Coach Davis, my AAU coach said to reach out. I\'m interested in KaNeXT.',
    timestamp: ago(2880),
    status: 'pending',
  },
];

export const MOCK_APPROVED_REQUESTS: RequestItem[] = [
  {
    id: 'req-6',
    type: 'recruit_inbound',
    name: 'Jaylen Carter',
    initials: 'JC',
    context: '2026 SF · Charlotte, NC',
    timestamp: ago(4320),
    status: 'approved',
  },
  {
    id: 'req-7',
    type: 'parent_inbound',
    name: 'Sharon Johnson',
    initials: 'SJ',
    context: 'Parent of Marcus Johnson',
    timestamp: ago(10080),
    status: 'approved',
  },
  {
    id: 'req-8',
    type: 'parent_inbound',
    name: 'Robert Carter',
    initials: 'RC',
    context: 'Parent of Jaylen Carter',
    timestamp: ago(8640),
    status: 'approved',
  },
];
