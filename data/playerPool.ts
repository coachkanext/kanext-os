/**
 * National Player Pool — global truth directory.
 * ~25 placeholder players across levels.
 */

import type { Archetype } from '@/data/system-demand-profiles';

export type PoolLevel = 'NAIA' | 'NCAA' | 'NCAA D1' | 'NCAA D2' | 'NCAA D3' | 'JUCO' | 'JUCO D1' | 'JUCO D2' | 'JUCO D3' | 'USCAA' | 'NCCAA' | 'NCCAA D1' | 'NCCAA D2' | '3C2A' | 'International' | 'HS';
export type PoolPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface PoolPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: PoolPosition;
  height: string;
  weight?: number;
  classYear: string;
  currentSchool: string;
  level: PoolLevel;
  conference: string;
  state: string;
  keyStatLine: string;
  hasFilm: boolean;
  lastUpdated: string; // ISO date
  archetype: Archetype;
}

export const PLAYER_POOL: PoolPlayer[] = [
  { id: 'pp-01', firstName: 'Jayden', lastName: 'Carter', position: 'PG', height: '6\'1"', weight: 175, classYear: '2026', currentSchool: 'Oak Hill Academy', level: 'HS', conference: 'Prep', state: 'VA', keyStatLine: '18.2 PPG / 7.4 APG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'pick_and_roll_operator' },
  { id: 'pp-02', firstName: 'Marcus', lastName: 'Thompson', position: 'SG', height: '6\'4"', weight: 190, classYear: '2025', currentSchool: 'Coffeyville CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '22.1 PPG / 4.8 RPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'spot_up_specialist' },
  { id: 'pp-03', firstName: 'DeAndre', lastName: 'Mitchell', position: 'SF', height: '6\'6"', weight: 205, classYear: '2026', currentSchool: 'Montverde Academy', level: 'HS', conference: 'Prep', state: 'FL', keyStatLine: '15.7 PPG / 6.2 RPG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'two_way_wing' },
  { id: 'pp-04', firstName: 'Kofi', lastName: 'Mensah', position: 'C', height: '6\'10"', weight: 235, classYear: '2025', currentSchool: 'Accra Basketball Academy', level: 'International', conference: 'International', state: 'Ghana', keyStatLine: '12.4 PPG / 9.8 RPG / 2.1 BPG', hasFilm: false, lastUpdated: '2026-01-15', archetype: 'rim_protector_anchor' },
  { id: 'pp-05', firstName: 'Tyler', lastName: 'Brooks', position: 'PG', height: '5\'11"', weight: 165, classYear: '2027', currentSchool: 'Bishop Gorman', level: 'HS', conference: 'Prep', state: 'NV', keyStatLine: '14.5 PPG / 8.1 APG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'connector_guard_wing' },
  { id: 'pp-06', firstName: 'Rashad', lastName: 'Williams', position: 'PF', height: '6\'8"', weight: 220, classYear: '2025', currentSchool: 'Northwest Florida State', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '16.3 PPG / 8.5 RPG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-07', firstName: 'Emmanuel', lastName: 'Okafor', position: 'C', height: '6\'9"', weight: 230, classYear: '2026', currentSchool: 'Sunrise Christian', level: 'HS', conference: 'Prep', state: 'KS', keyStatLine: '13.8 PPG / 10.2 RPG / 3.0 BPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'rim_protector_anchor' },
  { id: 'pp-08', firstName: 'Jordan', lastName: 'Davis', position: 'SG', height: '6\'3"', weight: 185, classYear: '2025', currentSchool: 'Vincennes', level: 'JUCO', conference: 'NJCAA Region XII', state: 'IN', keyStatLine: '19.6 PPG / 3.2 APG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'off_ball_shooter' },
  { id: 'pp-09', firstName: 'Chris', lastName: 'Anderson', position: 'SF', height: '6\'5"', weight: 200, classYear: '2026', currentSchool: 'IMG Academy', level: 'HS', conference: 'Prep', state: 'FL', keyStatLine: '16.1 PPG / 5.5 RPG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'three_and_d_wing' },
  { id: 'pp-10', firstName: 'Darius', lastName: 'Jackson', position: 'PG', height: '6\'0"', weight: 170, classYear: '2025', currentSchool: 'Lincoln Memorial', level: 'NCAA D2', conference: 'South Atlantic', state: 'TN', keyStatLine: '15.4 PPG / 6.8 APG', hasFilm: false, lastUpdated: '2026-01-18', archetype: 'primary_ball_handler' },
  { id: 'pp-11', firstName: 'Mateo', lastName: 'Rodriguez', position: 'SG', height: '6\'2"', weight: 180, classYear: '2026', currentSchool: 'Life Center Academy', level: 'HS', conference: 'Prep', state: 'NJ', keyStatLine: '20.3 PPG / 3.5 APG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'spot_up_specialist' },
  { id: 'pp-12', firstName: 'Ahmad', lastName: 'Hassan', position: 'PF', height: '6\'7"', weight: 215, classYear: '2025', currentSchool: 'South Plains College', level: 'JUCO', conference: 'WJCAC', state: 'TX', keyStatLine: '14.7 PPG / 7.9 RPG', hasFilm: true, lastUpdated: '2026-01-25', archetype: 'stretch_big' },
  { id: 'pp-13', firstName: 'Luka', lastName: 'Petrovic', position: 'SF', height: '6\'6"', weight: 200, classYear: '2025', currentSchool: 'KK Mega Basket U19', level: 'International', conference: 'International', state: 'Serbia', keyStatLine: '11.2 PPG / 4.8 RPG / 2.3 APG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'connector_guard_wing' },
  { id: 'pp-14', firstName: 'Terrell', lastName: 'Washington', position: 'PG', height: '6\'2"', weight: 178, classYear: '2025', currentSchool: 'Central Arizona', level: 'JUCO', conference: 'ACCAC', state: 'AZ', keyStatLine: '17.8 PPG / 5.6 APG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'pick_and_roll_operator' },
  { id: 'pp-15', firstName: 'Nate', lastName: 'Kim', position: 'SG', height: '6\'3"', weight: 182, classYear: '2026', currentSchool: 'Findlay Prep', level: 'HS', conference: 'Prep', state: 'NV', keyStatLine: '13.4 PPG / 4.1 RPG', hasFilm: false, lastUpdated: '2026-01-12', archetype: 'three_and_d_wing' },
  { id: 'pp-16', firstName: 'Xavier', lastName: 'Patel', position: 'C', height: '6\'11"', weight: 240, classYear: '2025', currentSchool: 'Hutchinson CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '10.5 PPG / 8.7 RPG / 2.8 BPG', hasFilm: true, lastUpdated: '2026-01-29', archetype: 'rim_protector_anchor' },
  { id: 'pp-17', firstName: 'Isaiah', lastName: 'Green', position: 'PF', height: '6\'7"', weight: 210, classYear: '2027', currentSchool: 'Wheeler HS', level: 'HS', conference: 'GHSA', state: 'GA', keyStatLine: '12.9 PPG / 7.1 RPG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'vertical_spacer' },
  { id: 'pp-18', firstName: 'Cam', lastName: 'Butler', position: 'SF', height: '6\'5"', weight: 195, classYear: '2025', currentSchool: 'Barton CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '18.0 PPG / 5.2 RPG', hasFilm: true, lastUpdated: '2026-01-27', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-19', firstName: 'Jamal', lastName: 'Foster', position: 'PG', height: '5\'10"', weight: 160, classYear: '2026', currentSchool: 'St. Benedict\'s Prep', level: 'HS', conference: 'Prep', state: 'NJ', keyStatLine: '11.8 PPG / 9.2 APG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'connector_guard_wing' },
  { id: 'pp-20', firstName: 'Oumar', lastName: 'Diallo', position: 'C', height: '6\'10"', weight: 225, classYear: '2025', currentSchool: 'INSEP Paris', level: 'International', conference: 'International', state: 'France', keyStatLine: '9.4 PPG / 7.6 RPG / 1.9 BPG', hasFilm: false, lastUpdated: '2026-01-10', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-21', firstName: 'Devon', lastName: 'Price', position: 'SG', height: '6\'4"', weight: 188, classYear: '2025', currentSchool: 'Chipola College', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '21.3 PPG / 3.8 RPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'off_ball_shooter' },
  { id: 'pp-22', firstName: 'Miguel', lastName: 'Santos', position: 'PF', height: '6\'8"', weight: 218, classYear: '2026', currentSchool: 'La Lumiere', level: 'HS', conference: 'Prep', state: 'IN', keyStatLine: '14.2 PPG / 8.0 RPG', hasFilm: true, lastUpdated: '2026-01-31', archetype: 'stretch_big' },
  { id: 'pp-23', firstName: 'Kwame', lastName: 'Asante', position: 'SF', height: '6\'5"', weight: 198, classYear: '2025', currentSchool: 'Ranger College', level: 'JUCO', conference: 'NTJCAC', state: 'TX', keyStatLine: '15.9 PPG / 6.0 RPG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'two_way_wing' },
  { id: 'pp-24', firstName: 'Ryan', lastName: 'O\'Brien', position: 'PG', height: '6\'1"', weight: 172, classYear: '2025', currentSchool: 'Chaminade', level: 'NCAA D2', conference: 'Peach Belt', state: 'HI', keyStatLine: '13.1 PPG / 5.9 APG', hasFilm: false, lastUpdated: '2026-01-16', archetype: 'secondary_creator_wing' },
  { id: 'pp-25', firstName: 'Trevon', lastName: 'Bell', position: 'SG', height: '6\'3"', weight: 184, classYear: '2027', currentSchool: 'Prolific Prep', level: 'HS', conference: 'Prep', state: 'CA', keyStatLine: '16.7 PPG / 4.3 RPG', hasFilm: true, lastUpdated: '2026-02-09', archetype: 'slasher_rim_pressure_wing' },
  // ── Teammates (school overlap for Team Targets) ──
  { id: 'pp-26', firstName: 'Tre', lastName: 'Holloway', position: 'PG', height: '6\'0"', weight: 172, classYear: '2025', currentSchool: 'Chipola College', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '14.8 PPG / 6.2 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'pick_and_roll_operator' },
  { id: 'pp-27', firstName: 'Zion', lastName: 'Harmon', position: 'SF', height: '6\'5"', weight: 198, classYear: '2025', currentSchool: 'Chipola College', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '12.6 PPG / 5.8 RPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'two_way_wing' },
  { id: 'pp-28', firstName: 'AJ', lastName: 'Neal', position: 'PF', height: '6\'7"', weight: 215, classYear: '2025', currentSchool: 'Chipola College', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '10.4 PPG / 7.1 RPG', hasFilm: false, lastUpdated: '2026-01-28', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-29', firstName: 'Deon', lastName: 'Wright', position: 'SG', height: '6\'2"', weight: 180, classYear: '2025', currentSchool: 'Coffeyville CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '15.3 PPG / 3.4 APG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'off_ball_shooter' },
  { id: 'pp-30', firstName: 'Malik', lastName: 'Jones', position: 'PF', height: '6\'8"', weight: 222, classYear: '2025', currentSchool: 'Coffeyville CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '11.9 PPG / 8.3 RPG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'stretch_big' },
  { id: 'pp-31', firstName: 'Jaylen', lastName: 'Moore', position: 'PG', height: '6\'1"', weight: 175, classYear: '2025', currentSchool: 'Barton CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '13.5 PPG / 5.9 APG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'connector_guard_wing' },
  { id: 'pp-32', firstName: 'Noah', lastName: 'Clark', position: 'C', height: '6\'9"', weight: 230, classYear: '2025', currentSchool: 'Barton CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '9.2 PPG / 7.4 RPG / 2.3 BPG', hasFilm: false, lastUpdated: '2026-01-25', archetype: 'rim_protector_anchor' },
  { id: 'pp-33', firstName: 'Kobe', lastName: 'Sanders', position: 'SF', height: '6\'4"', weight: 192, classYear: '2025', currentSchool: 'Central Arizona', level: 'JUCO', conference: 'ACCAC', state: 'AZ', keyStatLine: '14.1 PPG / 4.7 RPG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'three_and_d_wing' },
  { id: 'pp-34', firstName: 'Jaden', lastName: 'Ellis', position: 'SG', height: '6\'3"', weight: 185, classYear: '2025', currentSchool: 'Vincennes', level: 'JUCO', conference: 'NJCAA Region XII', state: 'IN', keyStatLine: '16.2 PPG / 3.8 RPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'spot_up_specialist' },
  { id: 'pp-35', firstName: 'Marcus', lastName: 'White', position: 'PF', height: '6\'7"', weight: 210, classYear: '2025', currentSchool: 'Vincennes', level: 'JUCO', conference: 'NJCAA Region XII', state: 'IN', keyStatLine: '11.7 PPG / 6.5 RPG', hasFilm: true, lastUpdated: '2026-01-29', archetype: 'vertical_spacer' },
];

/** Pool player awards — keyed by player id */
export const POOL_PLAYER_AWARDS: Record<string, string[]> = {
  'pp-01': ['All-State 1st Team', 'Pangos Top 100'],
  'pp-02': ['KJCCC Player of the Year', 'All-Region VI 1st Team'],
  'pp-03': ['NIBC All-Tournament', 'Top 50 ESPN'],
  'pp-05': ['Pangos All-West', 'MaxPreps Sophomore POY'],
  'pp-06': ['All-Panhandle 1st Team', 'NJCAA Region VIII All-Tournament'],
  'pp-07': ['McDonald\'s All-American Nominee', 'All-State 1st Team'],
  'pp-08': ['NJCAA Region XII MVP', 'All-Conference 1st Team'],
  'pp-09': ['NIBC All-Conference', 'Hoop Hall Invitational MVP'],
  'pp-10': ['SAC Newcomer of the Year', 'D2 All-Region'],
  'pp-11': ['All-State 2nd Team', 'Hoop Group Showcase MVP'],
  'pp-14': ['ACCAC Player of the Year', 'All-Region I 1st Team'],
  'pp-16': ['KJCCC Defensive POY', 'All-Conference 1st Team'],
  'pp-17': ['GHSA All-State Honorable Mention'],
  'pp-18': ['KJCCC All-Conference 2nd Team'],
  'pp-21': ['Panhandle Conference POY', 'All-Region VIII 1st Team', 'NJCAA All-American HM'],
  'pp-22': ['NIBC All-Conference', 'Indiana All-Star Nominee'],
  'pp-23': ['NTJCAC All-Conference 1st Team'],
  'pp-25': ['Prep Circuit All-Star', 'MaxPreps Junior All-American'],
  'pp-26': ['Panhandle All-Conference 2nd Team'],
  'pp-29': ['KJCCC All-Conference 2nd Team'],
  'pp-31': ['KJCCC All-Freshman Team'],
  'pp-34': ['NJCAA Region XII All-Tournament'],
};
