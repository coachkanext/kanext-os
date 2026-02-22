/**
 * Sports Library — RBAC-gated library records across 4 sections.
 * 20 records with access levels, tags, and workspace refs.
 */

import type { VideoSection } from '@/utils/sports-rbac';

// =============================================================================
// TYPES
// =============================================================================

export type LibrarySectionId =
  | 'official_games'
  | 'practices_install'
  | 'player_development'
  | 'public_media';

export type LibraryViewMode = 'date' | 'opponent' | 'player' | 'tag' | 'workspace';

export type AccessLevel = 'public' | 'team' | 'staff' | 'ad_only';

export type LibraryRecordType = 'game_film' | 'practice' | 'install' | 'dev_clip' | 'highlight' | 'interview' | 'graphic';

export interface LibraryRecord {
  id: string;
  title: string;
  section: LibrarySectionId;
  type: LibraryRecordType;
  accessLevel: AccessLevel;
  owner: string;
  date: string;
  opponent?: string;
  tags: string[];
  clipCount: number;
  duration: string;
  thumbnailColor: string;
  workspaceRef?: string;
  exportable: boolean;
  rbacSection: VideoSection;
  downloaded?: boolean;
  downloadSize?: string;
}

export interface LibrarySectionConfig {
  id: LibrarySectionId;
  title: string;
  rbacSection: VideoSection;
}

// =============================================================================
// HELPERS
// =============================================================================

export function getAccessLevelColor(level: AccessLevel): string {
  switch (level) {
    case 'public': return '#22C55E';
    case 'team': return '#1D9BF0';
    case 'staff': return '#F59E0B';
    case 'ad_only': return '#EF4444';
  }
}

export function getAccessLevelLabel(level: AccessLevel): string {
  switch (level) {
    case 'public': return 'Public';
    case 'team': return 'Team';
    case 'staff': return 'Staff';
    case 'ad_only': return 'AD Only';
  }
}

export function getRecordTypeLabel(type: LibraryRecordType): string {
  switch (type) {
    case 'game_film': return 'Game Film';
    case 'practice': return 'Practice';
    case 'install': return 'Install';
    case 'dev_clip': return 'Dev Clip';
    case 'highlight': return 'Highlight';
    case 'interview': return 'Interview';
    case 'graphic': return 'Graphic';
  }
}

// =============================================================================
// SECTION CONFIG
// =============================================================================

export const SPORTS_LIBRARY_SECTIONS: LibrarySectionConfig[] = [
  { id: 'official_games', title: 'Official Games', rbacSection: 'library_official_games' },
  { id: 'practices_install', title: 'Practices + Install', rbacSection: 'library_practices_install' },
  { id: 'player_development', title: 'Player Development', rbacSection: 'library_player_development' },
  { id: 'public_media', title: 'Public Media', rbacSection: 'library_public_media' },
];

// =============================================================================
// DATA — 20 LIBRARY RECORDS
// =============================================================================

export const SPORTS_LIBRARY_RECORDS: LibraryRecord[] = [
  // Official Games (8)
  {
    id: 'lr-1', title: 'Carroll College vs MSU-Northern Christian — Full Game', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Feb 14', opponent: 'MSU-Northern Christian',
    tags: ['Frontier Conference', 'Home', 'Win'], clipCount: 1, duration: '1:48:22',
    thumbnailColor: '#1D9BF0', workspaceRef: 'Last Game Review', exportable: true, rbacSection: 'library_official_games',
    downloaded: true, downloadSize: '1.8 GB',
  },
  {
    id: 'lr-2', title: 'Carroll College vs SW Assemblies — Full Game', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Feb 8', opponent: 'SW Assemblies',
    tags: ['Frontier Conference', 'Away', 'Win'], clipCount: 1, duration: '1:52:10',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_official_games',
    downloaded: true, downloadSize: '1.9 GB',
  },
  {
    id: 'lr-3', title: 'Carroll College vs Mid-America Nazarene', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Feb 1', opponent: 'Mid-America Nazarene',
    tags: ['Frontier Conference', 'Home', 'Win'], clipCount: 1, duration: '1:45:33',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_official_games',
  },
  {
    id: 'lr-4', title: 'Carroll College vs Oklahoma Panhandle', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Jan 25', opponent: 'Oklahoma Panhandle',
    tags: ['Non-Conference', 'Home', 'Win'], clipCount: 1, duration: '1:50:08',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_official_games',
  },
  {
    id: 'lr-5', title: 'Carroll College vs Central Christian', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Jan 18', opponent: 'Central Christian',
    tags: ['Frontier Conference', 'Away', 'Loss'], clipCount: 1, duration: '1:47:15',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_official_games',
  },
  {
    id: 'lr-6', title: 'Carroll College vs John Brown — Full Game', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Jan 11', opponent: 'John Brown',
    tags: ['Frontier Conference', 'Home', 'Win'], clipCount: 1, duration: '1:44:50',
    thumbnailColor: '#1D9BF0', exportable: true, rbacSection: 'library_official_games',
  },
  {
    id: 'lr-7', title: 'Carroll College vs Wayland Baptist', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Jan 4', opponent: 'Wayland Baptist',
    tags: ['Frontier Conference', 'Away', 'Win'], clipCount: 1, duration: '1:49:22',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_official_games',
  },
  {
    id: 'lr-8', title: 'Carroll College vs Science & Arts', section: 'official_games', type: 'game_film',
    accessLevel: 'team', owner: 'Carroll Athletics', date: 'Dec 14', opponent: 'Science & Arts',
    tags: ['Non-Conference', 'Home', 'Win'], clipCount: 1, duration: '1:46:18',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_official_games',
  },

  // Practices + Install (4)
  {
    id: 'lr-9', title: 'Practice — Feb 13: Transition D', section: 'practices_install', type: 'practice',
    accessLevel: 'staff', owner: 'Coach Carter', date: 'Feb 13',
    tags: ['Practice', 'Defense', 'Transition'], clipCount: 1, duration: '45:20',
    thumbnailColor: '#0B0F14', exportable: false, rbacSection: 'library_practices_install',
    downloaded: true, downloadSize: '420 MB',
  },
  {
    id: 'lr-10', title: 'Install: Motion Offense v2', section: 'practices_install', type: 'install',
    accessLevel: 'staff', owner: 'Coach Avery', date: 'Feb 11',
    tags: ['Install', 'Offense', 'Motion'], clipCount: 6, duration: '22:15',
    thumbnailColor: '#0B0F14', workspaceRef: 'Install: Offense', exportable: false, rbacSection: 'library_practices_install',
  },
  {
    id: 'lr-11', title: 'Install: Press Break vs 2-2-1', section: 'practices_install', type: 'install',
    accessLevel: 'staff', owner: 'Coach Davis', date: 'Feb 9',
    tags: ['Install', 'Press Break', 'Pressure'], clipCount: 4, duration: '15:42',
    thumbnailColor: '#0B0F14', workspaceRef: 'Press Break Install', exportable: false, rbacSection: 'library_practices_install',
  },
  {
    id: 'lr-12', title: 'Practice — Feb 6: Shooting Drills', section: 'practices_install', type: 'practice',
    accessLevel: 'staff', owner: 'Coach Avery', date: 'Feb 6',
    tags: ['Practice', 'Shooting', 'Drills'], clipCount: 1, duration: '38:10',
    thumbnailColor: '#1D9BF0', exportable: false, rbacSection: 'library_practices_install',
  },

  // Player Development (4)
  {
    id: 'lr-13', title: 'Carter: Finishing Through Contact', section: 'player_development', type: 'dev_clip',
    accessLevel: 'staff', owner: 'Coach Avery', date: 'Feb 12',
    tags: ['Development', 'Finishing', 'Carter'], clipCount: 8, duration: '4:18',
    thumbnailColor: '#0B0F14', workspaceRef: 'Player: Carter Development', exportable: false, rbacSection: 'library_player_development',
  },
  {
    id: 'lr-14', title: 'Thompson: Catch-and-Shoot Mechanics', section: 'player_development', type: 'dev_clip',
    accessLevel: 'staff', owner: 'Coach Avery', date: 'Feb 9',
    tags: ['Development', 'Shooting', 'Thompson'], clipCount: 6, duration: '3:45',
    thumbnailColor: '#1D9BF0', exportable: false, rbacSection: 'library_player_development',
  },
  {
    id: 'lr-15', title: 'Williams: Closeout Technique', section: 'player_development', type: 'dev_clip',
    accessLevel: 'staff', owner: 'Coach Davis', date: 'Feb 6',
    tags: ['Development', 'Defense', 'Williams'], clipCount: 5, duration: '5:10',
    thumbnailColor: '#0B0F14', exportable: false, rbacSection: 'library_player_development',
  },
  {
    id: 'lr-16', title: 'Anderson: Ball Screen Reads', section: 'player_development', type: 'dev_clip',
    accessLevel: 'staff', owner: 'Coach Avery', date: 'Feb 3',
    tags: ['Development', 'Playmaking', 'Anderson'], clipCount: 7, duration: '6:22',
    thumbnailColor: '#0B0F14', exportable: false, rbacSection: 'library_player_development',
  },

  // Public Media (4)
  {
    id: 'lr-17', title: 'Season Opener Highlights', section: 'public_media', type: 'highlight',
    accessLevel: 'public', owner: 'Carroll Athletics', date: 'Feb 14',
    tags: ['Highlights', 'Public', 'Social'], clipCount: 1, duration: '4:32',
    thumbnailColor: '#1D9BF0', exportable: true, rbacSection: 'library_public_media',
  },
  {
    id: 'lr-18', title: 'Media Day 2025-26 — Behind the Scenes', section: 'public_media', type: 'interview',
    accessLevel: 'public', owner: 'Carroll Media', date: 'Oct 3',
    tags: ['Media Day', 'Public', 'BTS'], clipCount: 1, duration: '12:15',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_public_media',
  },
  {
    id: 'lr-19', title: 'Dunk of the Week: Carter', section: 'public_media', type: 'highlight',
    accessLevel: 'public', owner: 'Frontier Conference', date: 'Feb 12',
    tags: ['Highlights', 'Public', 'Award'], clipCount: 1, duration: '0:48',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_public_media',
  },
  {
    id: 'lr-20', title: 'Postgame Interview: Coach Carter', section: 'public_media', type: 'interview',
    accessLevel: 'public', owner: 'Carroll Media', date: 'Feb 8',
    tags: ['Interview', 'Public', 'Postgame'], clipCount: 1, duration: '6:30',
    thumbnailColor: '#0B0F14', exportable: true, rbacSection: 'library_public_media',
  },
];
