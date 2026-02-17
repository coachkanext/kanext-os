/**
 * National Player Pool — global truth directory.
 * 200 players across all levels.
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
  // ── pp-01 through pp-35: Original players (unchanged) ──
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

  // ── pp-36 through pp-65: HS (High School) — 30 total (pp-01..pp-25 has ~14 HS, need ~16 more) ──
  { id: 'pp-36', firstName: 'Amari', lastName: 'Jefferson', position: 'PG', height: '6\'2"', weight: 178, classYear: '2026', currentSchool: 'DeMatha Catholic', level: 'HS', conference: 'Prep', state: 'MD', keyStatLine: '16.4 PPG / 6.8 APG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'pick_and_roll_operator' },
  { id: 'pp-37', firstName: 'Bryce', lastName: 'Caldwell', position: 'SG', height: '6\'4"', weight: 192, classYear: '2027', currentSchool: 'Link Academy', level: 'HS', conference: 'Prep', state: 'MO', keyStatLine: '17.1 PPG / 4.2 RPG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'off_ball_shooter' },
  { id: 'pp-38', firstName: 'Dominique', lastName: 'Harris', position: 'SF', height: '6\'6"', weight: 202, classYear: '2026', currentSchool: 'Brewster Academy', level: 'HS', conference: 'Prep', state: 'NH', keyStatLine: '14.8 PPG / 5.9 RPG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'two_way_wing' },
  { id: 'pp-39', firstName: 'Elijah', lastName: 'Tate', position: 'PF', height: '6\'8"', weight: 215, classYear: '2026', currentSchool: 'AZ Compass Prep', level: 'HS', conference: 'Prep', state: 'AZ', keyStatLine: '13.5 PPG / 7.8 RPG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'stretch_big' },
  { id: 'pp-40', firstName: 'Kendrick', lastName: 'Simmons', position: 'C', height: '6\'10"', weight: 232, classYear: '2026', currentSchool: 'Wasatch Academy', level: 'HS', conference: 'Prep', state: 'UT', keyStatLine: '11.6 PPG / 9.4 RPG / 2.4 BPG', hasFilm: false, lastUpdated: '2026-01-18', archetype: 'rim_protector_anchor' },
  { id: 'pp-41', firstName: 'Kai', lastName: 'Nakamura', position: 'PG', height: '6\'0"', weight: 168, classYear: '2027', currentSchool: 'Long Island Lutheran', level: 'HS', conference: 'Prep', state: 'NY', keyStatLine: '13.9 PPG / 7.5 APG', hasFilm: true, lastUpdated: '2026-02-12', archetype: 'connector_guard_wing' },
  { id: 'pp-42', firstName: 'Tavion', lastName: 'McCoy', position: 'SG', height: '6\'3"', weight: 186, classYear: '2026', currentSchool: 'Combine Academy', level: 'HS', conference: 'Prep', state: 'NC', keyStatLine: '19.2 PPG / 3.1 APG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'spot_up_specialist' },
  { id: 'pp-43', firstName: 'Desmond', lastName: 'Owens', position: 'SF', height: '6\'5"', weight: 198, classYear: '2027', currentSchool: 'Overtime Elite', level: 'HS', conference: 'Prep', state: 'GA', keyStatLine: '15.3 PPG / 5.1 RPG / 2.8 APG', hasFilm: true, lastUpdated: '2026-02-14', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-44', firstName: 'Marquis', lastName: 'Dixon', position: 'PF', height: '6\'7"', weight: 212, classYear: '2026', currentSchool: 'Paul VI', level: 'HS', conference: 'Prep', state: 'VA', keyStatLine: '12.7 PPG / 6.9 RPG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'vertical_spacer' },
  { id: 'pp-45', firstName: 'Zaire', lastName: 'Coleman', position: 'C', height: '6\'9"', weight: 228, classYear: '2026', currentSchool: 'Oak Hill Academy', level: 'HS', conference: 'Prep', state: 'VA', keyStatLine: '10.8 PPG / 8.6 RPG / 1.8 BPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-46', firstName: 'Landon', lastName: 'Reeves', position: 'PG', height: '5\'11"', weight: 166, classYear: '2027', currentSchool: 'Montverde Academy', level: 'HS', conference: 'Prep', state: 'FL', keyStatLine: '12.1 PPG / 8.8 APG', hasFilm: true, lastUpdated: '2026-02-09', archetype: 'primary_ball_handler' },
  { id: 'pp-47', firstName: 'Jaxon', lastName: 'Miles', position: 'SG', height: '6\'4"', weight: 190, classYear: '2026', currentSchool: 'IMG Academy', level: 'HS', conference: 'Prep', state: 'FL', keyStatLine: '15.5 PPG / 3.7 APG', hasFilm: false, lastUpdated: '2026-01-15', archetype: 'three_and_d_wing' },
  { id: 'pp-48', firstName: 'Tyree', lastName: 'Barksdale', position: 'SF', height: '6\'6"', weight: 204, classYear: '2026', currentSchool: 'Sunrise Christian', level: 'HS', conference: 'Prep', state: 'KS', keyStatLine: '14.0 PPG / 6.3 RPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'switchable_defender_wing' },
  { id: 'pp-49', firstName: 'Andre', lastName: 'Livingston', position: 'PG', height: '6\'1"', weight: 174, classYear: '2026', currentSchool: 'Milton HS', level: 'HS', conference: 'GHSA', state: 'GA', keyStatLine: '17.8 PPG / 5.4 APG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'pick_and_roll_operator' },
  { id: 'pp-50', firstName: 'Caleb', lastName: 'Houston', position: 'SG', height: '6\'3"', weight: 184, classYear: '2027', currentSchool: 'Duncanville HS', level: 'HS', conference: 'UIL', state: 'TX', keyStatLine: '21.4 PPG / 4.5 RPG', hasFilm: true, lastUpdated: '2026-02-11', archetype: 'off_ball_shooter' },
  { id: 'pp-51', firstName: 'Rasheed', lastName: 'Byrd', position: 'PF', height: '6\'8"', weight: 218, classYear: '2026', currentSchool: 'Sierra Canyon', level: 'HS', conference: 'CIF', state: 'CA', keyStatLine: '13.2 PPG / 8.1 RPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'small_ball_big' },

  // ── pp-52 through pp-65: JUCO D1 — additional to reach ~20 total ──
  { id: 'pp-52', firstName: 'Devin', lastName: 'Garrett', position: 'PG', height: '6\'1"', weight: 176, classYear: '2025', currentSchool: 'Independence CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '16.0 PPG / 5.8 APG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'primary_ball_handler' },
  { id: 'pp-53', firstName: 'Quinton', lastName: 'Bridges', position: 'SF', height: '6\'5"', weight: 200, classYear: '2026', currentSchool: 'Seward County CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '14.3 PPG / 5.4 RPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'three_and_d_wing' },
  { id: 'pp-54', firstName: 'Montez', lastName: 'Powell', position: 'C', height: '6\'10"', weight: 238, classYear: '2025', currentSchool: 'Shelton State', level: 'JUCO', conference: 'SWAC (JUCO)', state: 'AL', keyStatLine: '11.8 PPG / 9.1 RPG / 2.5 BPG', hasFilm: true, lastUpdated: '2026-01-25', archetype: 'rim_protector_anchor' },
  { id: 'pp-55', firstName: 'Brandon', lastName: 'Ford', position: 'SG', height: '6\'4"', weight: 189, classYear: '2025', currentSchool: 'New Mexico JC', level: 'JUCO', conference: 'WJCAC', state: 'NM', keyStatLine: '18.7 PPG / 3.6 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'spot_up_specialist' },
  { id: 'pp-56', firstName: 'Terrence', lastName: 'Mack', position: 'PF', height: '6\'7"', weight: 214, classYear: '2026', currentSchool: 'Moberly Area CC', level: 'JUCO', conference: 'Region XVI', state: 'MO', keyStatLine: '13.9 PPG / 7.2 RPG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'stretch_big' },
  { id: 'pp-57', firstName: 'Corey', lastName: 'Hampton', position: 'PG', height: '6\'0"', weight: 170, classYear: '2025', currentSchool: 'Odessa College', level: 'JUCO', conference: 'WJCAC', state: 'TX', keyStatLine: '15.1 PPG / 6.4 APG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'pick_and_roll_operator' },
  { id: 'pp-58', firstName: 'Lamar', lastName: 'Dunn', position: 'SF', height: '6\'6"', weight: 202, classYear: '2025', currentSchool: 'Pensacola State', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '13.5 PPG / 5.7 RPG', hasFilm: true, lastUpdated: '2026-01-29', archetype: 'two_way_wing' },
  { id: 'pp-59', firstName: 'Rico', lastName: 'Vega', position: 'SG', height: '6\'3"', weight: 183, classYear: '2026', currentSchool: 'Arizona Western', level: 'JUCO', conference: 'ACCAC', state: 'AZ', keyStatLine: '17.4 PPG / 3.9 APG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'off_ball_shooter' },

  // ── pp-60 through pp-67: JUCO D2 — 8 players ──
  { id: 'pp-60', firstName: 'Tyrell', lastName: 'Banks', position: 'PG', height: '6\'0"', weight: 172, classYear: '2025', currentSchool: 'Mott CC', level: 'JUCO D2', conference: 'MCCAC', state: 'MI', keyStatLine: '14.2 PPG / 5.9 APG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'connector_guard_wing' },
  { id: 'pp-61', firstName: 'Davon', lastName: 'Craig', position: 'SG', height: '6\'3"', weight: 185, classYear: '2025', currentSchool: 'Kalamazoo Valley CC', level: 'JUCO D2', conference: 'MCCAC', state: 'MI', keyStatLine: '16.8 PPG / 3.3 APG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'spot_up_specialist' },
  { id: 'pp-62', firstName: 'Kareem', lastName: 'Tillery', position: 'SF', height: '6\'5"', weight: 198, classYear: '2026', currentSchool: 'Genesee CC', level: 'JUCO D2', conference: 'Region XX', state: 'NY', keyStatLine: '13.1 PPG / 5.0 RPG', hasFilm: false, lastUpdated: '2026-01-16', archetype: 'three_and_d_wing' },
  { id: 'pp-63', firstName: 'Dwayne', lastName: 'Little', position: 'PF', height: '6\'7"', weight: 216, classYear: '2025', currentSchool: 'Muskegon CC', level: 'JUCO D2', conference: 'MCCAC', state: 'MI', keyStatLine: '11.5 PPG / 7.6 RPG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-64', firstName: 'Antoine', lastName: 'Sharp', position: 'C', height: '6\'9"', weight: 232, classYear: '2025', currentSchool: 'Monroe CC', level: 'JUCO D2', conference: 'Region XX', state: 'NY', keyStatLine: '10.2 PPG / 8.4 RPG / 2.0 BPG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'rim_protector_anchor' },
  { id: 'pp-65', firstName: 'Jaylin', lastName: 'Watts', position: 'PG', height: '5\'11"', weight: 164, classYear: '2026', currentSchool: 'Herkimer CC', level: 'JUCO D2', conference: 'Region XX', state: 'NY', keyStatLine: '12.9 PPG / 6.7 APG', hasFilm: true, lastUpdated: '2026-01-19', archetype: 'primary_ball_handler' },
  { id: 'pp-66', firstName: 'Shamar', lastName: 'Lewis', position: 'SG', height: '6\'2"', weight: 180, classYear: '2025', currentSchool: 'Lansing CC', level: 'JUCO D2', conference: 'MCCAC', state: 'MI', keyStatLine: '15.4 PPG / 3.0 APG', hasFilm: false, lastUpdated: '2026-01-12', archetype: 'off_ball_shooter' },
  { id: 'pp-67', firstName: 'Curtis', lastName: 'Ramirez', position: 'PF', height: '6\'8"', weight: 220, classYear: '2026', currentSchool: 'Dean College', level: 'JUCO D2', conference: 'NJCAA Region IV', state: 'MA', keyStatLine: '10.7 PPG / 6.8 RPG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'vertical_spacer' },

  // ── pp-68 through pp-73: JUCO D3 — 6 players ──
  { id: 'pp-68', firstName: 'Rodney', lastName: 'Frazier', position: 'PG', height: '5\'11"', weight: 166, classYear: '2025', currentSchool: 'Richland College', level: 'JUCO D3', conference: 'Region III', state: 'TX', keyStatLine: '12.4 PPG / 5.3 APG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'connector_guard_wing' },
  { id: 'pp-69', firstName: 'Clarence', lastName: 'Harper', position: 'SG', height: '6\'2"', weight: 178, classYear: '2026', currentSchool: 'Brookhaven College', level: 'JUCO D3', conference: 'Region III', state: 'TX', keyStatLine: '14.7 PPG / 3.5 APG', hasFilm: false, lastUpdated: '2026-01-17', archetype: 'spot_up_specialist' },
  { id: 'pp-70', firstName: 'Jeremiah', lastName: 'Riley', position: 'SF', height: '6\'5"', weight: 196, classYear: '2025', currentSchool: 'Hostos CC', level: 'JUCO D3', conference: 'NJCAA Region XV', state: 'NY', keyStatLine: '11.8 PPG / 4.9 RPG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'switchable_defender_wing' },
  { id: 'pp-71', firstName: 'Will', lastName: 'Parsons', position: 'PF', height: '6\'7"', weight: 210, classYear: '2026', currentSchool: 'SUNY Sullivan', level: 'JUCO D3', conference: 'NJCAA Region XV', state: 'NY', keyStatLine: '10.1 PPG / 6.4 RPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'stretch_big' },
  { id: 'pp-72', firstName: 'Darryl', lastName: 'Knox', position: 'C', height: '6\'9"', weight: 226, classYear: '2025', currentSchool: 'Eastfield College', level: 'JUCO D3', conference: 'Region III', state: 'TX', keyStatLine: '9.6 PPG / 7.2 RPG / 1.6 BPG', hasFilm: false, lastUpdated: '2026-01-10', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-73', firstName: 'Nolan', lastName: 'Whitfield', position: 'PG', height: '6\'0"', weight: 170, classYear: '2025', currentSchool: 'Fashion Institute (SUNY)', level: 'JUCO D3', conference: 'Region XXI', state: 'NY', keyStatLine: '11.0 PPG / 6.1 APG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'primary_ball_handler' },

  // ── pp-74 through pp-83: 3C2A (CCCAA) — 10 players (5 North, 5 South) ──
  { id: 'pp-74', firstName: 'Dante', lastName: 'Marshall', position: 'PG', height: '6\'1"', weight: 174, classYear: '2025', currentSchool: 'City College of SF', level: '3C2A', conference: '3C2A North', state: 'CA', keyStatLine: '15.6 PPG / 6.2 APG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'pick_and_roll_operator' },
  { id: 'pp-75', firstName: 'Jaylen', lastName: 'Cortez', position: 'SG', height: '6\'3"', weight: 184, classYear: '2026', currentSchool: 'Diablo Valley', level: '3C2A', conference: '3C2A North', state: 'CA', keyStatLine: '17.3 PPG / 3.4 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'spot_up_specialist' },
  { id: 'pp-76', firstName: 'Trent', lastName: 'Nakagawa', position: 'SF', height: '6\'5"', weight: 196, classYear: '2025', currentSchool: 'Sacramento City', level: '3C2A', conference: '3C2A North', state: 'CA', keyStatLine: '13.2 PPG / 5.1 RPG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'three_and_d_wing' },
  { id: 'pp-77', firstName: 'Kendall', lastName: 'Bishop', position: 'PF', height: '6\'7"', weight: 212, classYear: '2025', currentSchool: 'West Valley', level: '3C2A', conference: '3C2A North', state: 'CA', keyStatLine: '11.8 PPG / 7.0 RPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'vertical_spacer' },
  { id: 'pp-78', firstName: 'Adrian', lastName: 'Ruiz', position: 'C', height: '6\'9"', weight: 228, classYear: '2026', currentSchool: 'Fresno City', level: '3C2A', conference: '3C2A North', state: 'CA', keyStatLine: '10.4 PPG / 8.3 RPG / 1.7 BPG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'rim_protector_anchor' },
  { id: 'pp-79', firstName: 'Derrick', lastName: 'Tran', position: 'PG', height: '5\'11"', weight: 168, classYear: '2025', currentSchool: 'Mt. SAC', level: '3C2A', conference: '3C2A South', state: 'CA', keyStatLine: '14.9 PPG / 7.1 APG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'connector_guard_wing' },
  { id: 'pp-80', firstName: 'Ray', lastName: 'Hoffman', position: 'SG', height: '6\'4"', weight: 188, classYear: '2026', currentSchool: 'Santa Monica', level: '3C2A', conference: '3C2A South', state: 'CA', keyStatLine: '18.1 PPG / 4.0 RPG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'off_ball_shooter' },
  { id: 'pp-81', firstName: 'Cedric', lastName: 'Odom', position: 'SF', height: '6\'6"', weight: 200, classYear: '2025', currentSchool: 'LA Trade Tech', level: '3C2A', conference: '3C2A South', state: 'CA', keyStatLine: '12.5 PPG / 5.6 RPG', hasFilm: false, lastUpdated: '2026-01-18', archetype: 'two_way_wing' },
  { id: 'pp-82', firstName: 'Marco', lastName: 'Delgado', position: 'PF', height: '6\'8"', weight: 216, classYear: '2025', currentSchool: 'San Diego Mesa', level: '3C2A', conference: '3C2A South', state: 'CA', keyStatLine: '11.3 PPG / 6.9 RPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'stretch_big' },
  { id: 'pp-83', firstName: 'Jabari', lastName: 'Newton', position: 'C', height: '6\'10"', weight: 234, classYear: '2026', currentSchool: 'Riverside City', level: '3C2A', conference: '3C2A South', state: 'CA', keyStatLine: '9.8 PPG / 8.7 RPG / 2.2 BPG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'rebounding_interior_enforcer' },

  // ── pp-84 through pp-103: NCAA D1 — 20 portal transfers ──
  { id: 'pp-84', firstName: 'Cameron', lastName: 'Scott', position: 'PG', height: '6\'2"', weight: 180, classYear: '2025', currentSchool: 'TCU', level: 'NCAA D1', conference: 'Big 12', state: 'TX', keyStatLine: '11.8 PPG / 5.4 APG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'pick_and_roll_operator' },
  { id: 'pp-85', firstName: 'Jaylen', lastName: 'Rivers', position: 'SG', height: '6\'4"', weight: 192, classYear: '2025', currentSchool: 'Mississippi State', level: 'NCAA D1', conference: 'SEC', state: 'MS', keyStatLine: '14.2 PPG / 3.1 APG / 1.5 SPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'off_ball_shooter' },
  { id: 'pp-86', firstName: 'Marcus', lastName: 'Daniels', position: 'SF', height: '6\'6"', weight: 205, classYear: '2026', currentSchool: 'Wake Forest', level: 'NCAA D1', conference: 'ACC', state: 'NC', keyStatLine: '13.7 PPG / 5.8 RPG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'two_way_wing' },
  { id: 'pp-87', firstName: 'Aiden', lastName: 'Park', position: 'PF', height: '6\'8"', weight: 222, classYear: '2025', currentSchool: 'Xavier', level: 'NCAA D1', conference: 'Big East', state: 'OH', keyStatLine: '12.1 PPG / 6.9 RPG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'stretch_big' },
  { id: 'pp-88', firstName: 'Isaiah', lastName: 'Blackwell', position: 'C', height: '6\'10"', weight: 240, classYear: '2025', currentSchool: 'South Florida', level: 'NCAA D1', conference: 'AAC', state: 'FL', keyStatLine: '10.9 PPG / 7.4 RPG / 2.3 BPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'rim_protector_anchor' },
  { id: 'pp-89', firstName: 'Terrence', lastName: 'Gray', position: 'PG', height: '6\'1"', weight: 175, classYear: '2026', currentSchool: 'Boise State', level: 'NCAA D1', conference: 'MWC', state: 'ID', keyStatLine: '10.4 PPG / 4.8 APG', hasFilm: false, lastUpdated: '2026-01-16', archetype: 'primary_ball_handler' },
  { id: 'pp-90', firstName: 'Jalen', lastName: 'Cross', position: 'SG', height: '6\'5"', weight: 195, classYear: '2025', currentSchool: 'Saint Mary\'s', level: 'NCAA D1', conference: 'WCC', state: 'CA', keyStatLine: '15.6 PPG / 4.2 RPG', hasFilm: true, lastUpdated: '2026-02-09', archetype: 'three_and_d_wing' },
  { id: 'pp-91', firstName: 'Devon', lastName: 'Marshall', position: 'SF', height: '6\'7"', weight: 208, classYear: '2025', currentSchool: 'Dayton', level: 'NCAA D1', conference: 'A-10', state: 'OH', keyStatLine: '12.8 PPG / 5.5 RPG / 2.1 APG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-92', firstName: 'Elias', lastName: 'West', position: 'PF', height: '6\'9"', weight: 225, classYear: '2025', currentSchool: 'Cleveland State', level: 'NCAA D1', conference: 'Horizon', state: 'OH', keyStatLine: '14.5 PPG / 8.0 RPG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'vertical_spacer' },
  { id: 'pp-93', firstName: 'Nate', lastName: 'Carroll', position: 'C', height: '6\'11"', weight: 242, classYear: '2026', currentSchool: 'Siena', level: 'NCAA D1', conference: 'MAAC', state: 'NY', keyStatLine: '9.7 PPG / 7.8 RPG / 2.6 BPG', hasFilm: false, lastUpdated: '2026-01-12', archetype: 'rim_protector_anchor' },
  { id: 'pp-94', firstName: 'Keith', lastName: 'Langford', position: 'PG', height: '6\'0"', weight: 172, classYear: '2025', currentSchool: 'UCF', level: 'NCAA D1', conference: 'Big 12', state: 'FL', keyStatLine: '13.3 PPG / 6.1 APG', hasFilm: true, lastUpdated: '2026-02-11', archetype: 'connector_guard_wing' },
  { id: 'pp-95', firstName: 'Zach', lastName: 'Thornton', position: 'SG', height: '6\'3"', weight: 186, classYear: '2025', currentSchool: 'Missouri', level: 'NCAA D1', conference: 'SEC', state: 'MO', keyStatLine: '11.9 PPG / 3.5 APG / 1.8 SPG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'poa_defender_guard' },
  { id: 'pp-96', firstName: 'Dion', lastName: 'Fletcher', position: 'SF', height: '6\'6"', weight: 203, classYear: '2026', currentSchool: 'Georgia Tech', level: 'NCAA D1', conference: 'ACC', state: 'GA', keyStatLine: '10.5 PPG / 4.9 RPG / 2.4 APG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'switchable_defender_wing' },
  { id: 'pp-97', firstName: 'Travis', lastName: 'Coleman', position: 'PF', height: '6\'8"', weight: 218, classYear: '2025', currentSchool: 'Tulane', level: 'NCAA D1', conference: 'AAC', state: 'LA', keyStatLine: '13.0 PPG / 7.2 RPG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'small_ball_big' },
  { id: 'pp-98', firstName: 'Reggie', lastName: 'Vaughn', position: 'PG', height: '6\'2"', weight: 178, classYear: '2025', currentSchool: 'San Jose State', level: 'NCAA D1', conference: 'MWC', state: 'CA', keyStatLine: '12.6 PPG / 5.0 APG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'secondary_creator_wing' },
  { id: 'pp-99', firstName: 'Tyshawn', lastName: 'Burke', position: 'SG', height: '6\'4"', weight: 190, classYear: '2026', currentSchool: 'Loyola Marymount', level: 'NCAA D1', conference: 'WCC', state: 'CA', keyStatLine: '16.8 PPG / 3.8 RPG', hasFilm: true, lastUpdated: '2026-02-12', archetype: 'spot_up_specialist' },
  { id: 'pp-100', firstName: 'Damien', lastName: 'Hicks', position: 'C', height: '6\'10"', weight: 236, classYear: '2025', currentSchool: 'Vanderbilt', level: 'NCAA D1', conference: 'SEC', state: 'TN', keyStatLine: '8.9 PPG / 6.8 RPG / 1.9 BPG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-101', firstName: 'Miles', lastName: 'Freeman', position: 'SF', height: '6\'7"', weight: 206, classYear: '2025', currentSchool: 'Georgetown', level: 'NCAA D1', conference: 'Big East', state: 'DC', keyStatLine: '11.4 PPG / 5.3 RPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'two_way_wing' },
  { id: 'pp-102', firstName: 'Shane', lastName: 'Morton', position: 'PG', height: '6\'1"', weight: 174, classYear: '2026', currentSchool: 'St. Bonaventure', level: 'NCAA D1', conference: 'A-10', state: 'NY', keyStatLine: '14.0 PPG / 5.7 APG', hasFilm: true, lastUpdated: '2026-01-18', archetype: 'dho_handoff_hub' },
  { id: 'pp-103', firstName: 'Eric', lastName: 'Powers', position: 'PF', height: '6\'9"', weight: 224, classYear: '2025', currentSchool: 'Oklahoma State', level: 'NCAA D1', conference: 'Big 12', state: 'OK', keyStatLine: '13.6 PPG / 7.5 RPG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'post_hub_facilitator_big' },

  // ── pp-104 through pp-121: NCAA D2 — 18 players ──
  { id: 'pp-104', firstName: 'Deshawn', lastName: 'Cole', position: 'PG', height: '6\'1"', weight: 176, classYear: '2025', currentSchool: 'Lenoir-Rhyne', level: 'NCAA D2', conference: 'South Atlantic', state: 'NC', keyStatLine: '14.6 PPG / 6.0 APG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'primary_ball_handler' },
  { id: 'pp-105', firstName: 'Khalil', lastName: 'Mosley', position: 'SG', height: '6\'3"', weight: 184, classYear: '2026', currentSchool: 'Augusta', level: 'NCAA D2', conference: 'Peach Belt', state: 'GA', keyStatLine: '16.2 PPG / 3.4 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'off_ball_shooter' },
  { id: 'pp-106', firstName: 'Brayden', lastName: 'Tucker', position: 'SF', height: '6\'5"', weight: 200, classYear: '2025', currentSchool: 'Drury', level: 'NCAA D2', conference: 'GLVC', state: 'MO', keyStatLine: '12.8 PPG / 5.2 RPG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'three_and_d_wing' },
  { id: 'pp-107', firstName: 'Donovan', lastName: 'Pratt', position: 'PF', height: '6\'8"', weight: 218, classYear: '2025', currentSchool: 'West Texas A&M', level: 'NCAA D2', conference: 'Lone Star', state: 'TX', keyStatLine: '11.4 PPG / 7.3 RPG', hasFilm: false, lastUpdated: '2026-01-16', archetype: 'stretch_big' },
  { id: 'pp-108', firstName: 'Andre', lastName: 'Sampson', position: 'C', height: '6\'10"', weight: 235, classYear: '2025', currentSchool: 'Western Washington', level: 'NCAA D2', conference: 'GNAC', state: 'WA', keyStatLine: '10.1 PPG / 8.5 RPG / 2.1 BPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'rim_protector_anchor' },
  { id: 'pp-109', firstName: 'Lamont', lastName: 'Hayes', position: 'PG', height: '6\'0"', weight: 170, classYear: '2026', currentSchool: 'Virginia Union', level: 'NCAA D2', conference: 'CIAA', state: 'VA', keyStatLine: '13.7 PPG / 5.5 APG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'pick_and_roll_operator' },
  { id: 'pp-110', firstName: 'Tyreke', lastName: 'Simms', position: 'SG', height: '6\'4"', weight: 190, classYear: '2025', currentSchool: 'Miles College', level: 'NCAA D2', conference: 'SIAC', state: 'AL', keyStatLine: '15.0 PPG / 3.8 RPG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'spot_up_specialist' },
  { id: 'pp-111', firstName: 'Wes', lastName: 'Kimble', position: 'SF', height: '6\'6"', weight: 204, classYear: '2025', currentSchool: 'Delta State', level: 'NCAA D2', conference: 'Gulf South', state: 'MS', keyStatLine: '12.3 PPG / 5.7 RPG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'two_way_wing' },
  { id: 'pp-112', firstName: 'Quentin', lastName: 'Farmer', position: 'PF', height: '6\'7"', weight: 214, classYear: '2026', currentSchool: 'Catawba', level: 'NCAA D2', conference: 'South Atlantic', state: 'NC', keyStatLine: '10.8 PPG / 6.6 RPG', hasFilm: false, lastUpdated: '2026-01-10', archetype: 'vertical_spacer' },
  { id: 'pp-113', firstName: 'Roderick', lastName: 'Benson', position: 'C', height: '6\'9"', weight: 232, classYear: '2025', currentSchool: 'Flagler', level: 'NCAA D2', conference: 'Peach Belt', state: 'FL', keyStatLine: '9.6 PPG / 7.8 RPG / 1.8 BPG', hasFilm: true, lastUpdated: '2026-02-09', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-114', firstName: 'Jelani', lastName: 'Brown', position: 'PG', height: '6\'2"', weight: 178, classYear: '2025', currentSchool: 'Indianapolis', level: 'NCAA D2', conference: 'GLVC', state: 'IN', keyStatLine: '12.9 PPG / 6.3 APG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'connector_guard_wing' },
  { id: 'pp-115', firstName: 'Troy', lastName: 'Maxwell', position: 'SG', height: '6\'3"', weight: 182, classYear: '2026', currentSchool: 'Midwestern State', level: 'NCAA D2', conference: 'Lone Star', state: 'TX', keyStatLine: '17.4 PPG / 2.9 APG', hasFilm: true, lastUpdated: '2026-02-11', archetype: 'off_ball_shooter' },
  { id: 'pp-116', firstName: 'Warren', lastName: 'Finch', position: 'SF', height: '6\'5"', weight: 198, classYear: '2025', currentSchool: 'Bowie State', level: 'NCAA D2', conference: 'CIAA', state: 'MD', keyStatLine: '14.1 PPG / 4.5 RPG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-117', firstName: 'Marcel', lastName: 'Gaines', position: 'PF', height: '6\'8"', weight: 220, classYear: '2025', currentSchool: 'Tuskegee', level: 'NCAA D2', conference: 'SIAC', state: 'AL', keyStatLine: '11.7 PPG / 7.0 RPG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'small_ball_big' },
  { id: 'pp-118', firstName: 'Jermaine', lastName: 'Hobbs', position: 'C', height: '6\'10"', weight: 238, classYear: '2026', currentSchool: 'Northwest Nazarene', level: 'NCAA D2', conference: 'GNAC', state: 'ID', keyStatLine: '10.3 PPG / 8.0 RPG / 2.0 BPG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'rim_protector_anchor' },
  { id: 'pp-119', firstName: 'Nico', lastName: 'Espinoza', position: 'PG', height: '5\'11"', weight: 168, classYear: '2025', currentSchool: 'West Liberty', level: 'NCAA D2', conference: 'GLVC', state: 'WV', keyStatLine: '13.5 PPG / 5.8 APG', hasFilm: true, lastUpdated: '2026-01-18', archetype: 'secondary_creator_wing' },
  { id: 'pp-120', firstName: 'Garland', lastName: 'Mays', position: 'SG', height: '6\'4"', weight: 186, classYear: '2025', currentSchool: 'West Alabama', level: 'NCAA D2', conference: 'Gulf South', state: 'AL', keyStatLine: '15.8 PPG / 3.2 APG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'three_and_d_wing' },
  { id: 'pp-121', firstName: 'Pierre', lastName: 'Lucas', position: 'SF', height: '6\'6"', weight: 202, classYear: '2026', currentSchool: 'Shaw', level: 'NCAA D2', conference: 'CIAA', state: 'NC', keyStatLine: '11.0 PPG / 5.3 RPG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'switchable_defender_wing' },

  // ── pp-122 through pp-131: NCAA D3 — 10 players ──
  { id: 'pp-122', firstName: 'Colin', lastName: 'Fischer', position: 'PG', height: '6\'0"', weight: 170, classYear: '2026', currentSchool: 'Randolph-Macon', level: 'NCAA D3', conference: 'ODAC', state: 'VA', keyStatLine: '12.4 PPG / 5.6 APG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'pick_and_roll_operator' },
  { id: 'pp-123', firstName: 'Jason', lastName: 'Woodley', position: 'SG', height: '6\'3"', weight: 182, classYear: '2025', currentSchool: 'Pomona-Pitzer', level: 'NCAA D3', conference: 'SCIAC', state: 'CA', keyStatLine: '14.7 PPG / 3.0 APG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'off_ball_shooter' },
  { id: 'pp-124', firstName: 'Liam', lastName: 'Chen', position: 'SF', height: '6\'5"', weight: 196, classYear: '2026', currentSchool: 'WPI', level: 'NCAA D3', conference: 'NEWMAC', state: 'MA', keyStatLine: '11.6 PPG / 4.8 RPG', hasFilm: false, lastUpdated: '2026-01-16', archetype: 'two_way_wing' },
  { id: 'pp-125', firstName: 'Thomas', lastName: 'Grant', position: 'PF', height: '6\'7"', weight: 210, classYear: '2025', currentSchool: 'Wash U (St. Louis)', level: 'NCAA D3', conference: 'UAA', state: 'MO', keyStatLine: '10.9 PPG / 6.5 RPG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'stretch_big' },
  { id: 'pp-126', firstName: 'Patrick', lastName: 'Sullivan', position: 'C', height: '6\'9"', weight: 228, classYear: '2025', currentSchool: 'Haverford', level: 'NCAA D3', conference: 'Centennial', state: 'PA', keyStatLine: '9.2 PPG / 7.3 RPG / 1.4 BPG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-127', firstName: 'Evan', lastName: 'McKinley', position: 'PG', height: '5\'11"', weight: 166, classYear: '2026', currentSchool: 'Lynchburg', level: 'NCAA D3', conference: 'ODAC', state: 'VA', keyStatLine: '11.8 PPG / 6.2 APG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'connector_guard_wing' },
  { id: 'pp-128', firstName: 'Greg', lastName: 'Holden', position: 'SG', height: '6\'2"', weight: 180, classYear: '2025', currentSchool: 'Claremont-Mudd-Scripps', level: 'NCAA D3', conference: 'SCIAC', state: 'CA', keyStatLine: '13.5 PPG / 2.8 APG', hasFilm: false, lastUpdated: '2026-01-12', archetype: 'spot_up_specialist' },
  { id: 'pp-129', firstName: 'Avery', lastName: 'Jordan', position: 'SF', height: '6\'6"', weight: 200, classYear: '2025', currentSchool: 'MIT', level: 'NCAA D3', conference: 'NEWMAC', state: 'MA', keyStatLine: '10.4 PPG / 5.0 RPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'three_and_d_wing' },
  { id: 'pp-130', firstName: 'Brett', lastName: 'Saunders', position: 'PF', height: '6\'8"', weight: 216, classYear: '2026', currentSchool: 'Emory', level: 'NCAA D3', conference: 'UAA', state: 'GA', keyStatLine: '12.1 PPG / 7.0 RPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'vertical_spacer' },
  { id: 'pp-131', firstName: 'Owen', lastName: 'Kraft', position: 'C', height: '6\'9"', weight: 224, classYear: '2025', currentSchool: 'Gettysburg', level: 'NCAA D3', conference: 'Centennial', state: 'PA', keyStatLine: '8.7 PPG / 6.9 RPG / 1.6 BPG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'rim_protector_anchor' },

  // ── pp-132 through pp-146: NAIA — 15 players ──
  { id: 'pp-132', firstName: 'Trey', lastName: 'Howard', position: 'PG', height: '6\'1"', weight: 174, classYear: '2025', currentSchool: 'Oklahoma City', level: 'NAIA', conference: 'Sooner Athletic', state: 'OK', keyStatLine: '15.3 PPG / 5.8 APG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'primary_ball_handler' },
  { id: 'pp-133', firstName: 'Demetrius', lastName: 'Hayes', position: 'SG', height: '6\'4"', weight: 188, classYear: '2025', currentSchool: 'Bethel (KS)', level: 'NAIA', conference: 'KCAC', state: 'KS', keyStatLine: '17.1 PPG / 3.6 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'spot_up_specialist' },
  { id: 'pp-134', firstName: 'Austin', lastName: 'Mercer', position: 'SF', height: '6\'5"', weight: 200, classYear: '2026', currentSchool: 'Evangel', level: 'NAIA', conference: 'HAAC', state: 'MO', keyStatLine: '13.4 PPG / 5.1 RPG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'three_and_d_wing' },
  { id: 'pp-135', firstName: 'Kelvin', lastName: 'Andrews', position: 'PF', height: '6\'7"', weight: 214, classYear: '2025', currentSchool: 'Doane', level: 'NAIA', conference: 'GPAC', state: 'NE', keyStatLine: '11.8 PPG / 7.4 RPG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-136', firstName: 'Armani', lastName: 'Clarke', position: 'C', height: '6\'10"', weight: 236, classYear: '2025', currentSchool: 'Faulkner', level: 'NAIA', conference: 'SSAC', state: 'AL', keyStatLine: '10.2 PPG / 8.1 RPG / 2.2 BPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'rim_protector_anchor' },
  { id: 'pp-137', firstName: 'Lorenzo', lastName: 'Burton', position: 'PG', height: '6\'0"', weight: 168, classYear: '2026', currentSchool: 'Lindsey Wilson', level: 'NAIA', conference: 'Mid-South', state: 'KY', keyStatLine: '14.6 PPG / 6.5 APG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'pick_and_roll_operator' },
  { id: 'pp-138', firstName: 'Jayden', lastName: 'Norris', position: 'SG', height: '6\'3"', weight: 182, classYear: '2025', currentSchool: 'Southwestern (KS)', level: 'NAIA', conference: 'KCAC', state: 'KS', keyStatLine: '16.5 PPG / 3.2 APG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'off_ball_shooter' },
  { id: 'pp-139', firstName: 'Terrence', lastName: 'Webb', position: 'SF', height: '6\'6"', weight: 204, classYear: '2025', currentSchool: 'Mid-America Christian', level: 'NAIA', conference: 'Sooner Athletic', state: 'OK', keyStatLine: '12.9 PPG / 5.5 RPG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'two_way_wing' },
  { id: 'pp-140', firstName: 'Ricky', lastName: 'Stokes', position: 'PF', height: '6\'8"', weight: 218, classYear: '2026', currentSchool: 'Culver-Stockton', level: 'NAIA', conference: 'HAAC', state: 'MO', keyStatLine: '10.5 PPG / 6.7 RPG', hasFilm: false, lastUpdated: '2026-01-12', archetype: 'stretch_big' },
  { id: 'pp-141', firstName: 'Cameron', lastName: 'Payne', position: 'C', height: '6\'9"', weight: 230, classYear: '2025', currentSchool: 'Concordia (NE)', level: 'NAIA', conference: 'GPAC', state: 'NE', keyStatLine: '9.8 PPG / 7.5 RPG / 1.5 BPG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-142', firstName: 'Derek', lastName: 'Ray', position: 'PG', height: '6\'1"', weight: 172, classYear: '2025', currentSchool: 'Campbellsville', level: 'NAIA', conference: 'Mid-South', state: 'KY', keyStatLine: '13.1 PPG / 5.4 APG', hasFilm: true, lastUpdated: '2026-01-18', archetype: 'connector_guard_wing' },
  { id: 'pp-143', firstName: 'Vince', lastName: 'Harper', position: 'SG', height: '6\'4"', weight: 186, classYear: '2026', currentSchool: 'Oklahoma Wesleyan', level: 'NAIA', conference: 'KCAC', state: 'OK', keyStatLine: '18.2 PPG / 4.0 RPG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-144', firstName: 'Spencer', lastName: 'Lang', position: 'SF', height: '6\'5"', weight: 198, classYear: '2025', currentSchool: 'Mobile', level: 'NAIA', conference: 'SSAC', state: 'AL', keyStatLine: '11.6 PPG / 4.9 RPG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'switchable_defender_wing' },
  { id: 'pp-145', firstName: 'Davonte', lastName: 'Mathis', position: 'PF', height: '6\'7"', weight: 212, classYear: '2025', currentSchool: 'John Brown', level: 'NAIA', conference: 'Sooner Athletic', state: 'AR', keyStatLine: '12.4 PPG / 7.1 RPG', hasFilm: false, lastUpdated: '2026-01-16', archetype: 'vertical_spacer' },
  { id: 'pp-146', firstName: 'Alan', lastName: 'Freeman', position: 'C', height: '6\'10"', weight: 234, classYear: '2026', currentSchool: 'Hastings', level: 'NAIA', conference: 'GPAC', state: 'NE', keyStatLine: '9.4 PPG / 8.3 RPG / 2.0 BPG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'rim_protector_anchor' },

  // ── pp-147 through pp-152: USCAA — 6 players ──
  { id: 'pp-147', firstName: 'Nasir', lastName: 'Grant', position: 'PG', height: '5\'11"', weight: 164, classYear: '2025', currentSchool: 'Berkeley College', level: 'USCAA', conference: 'USCAA', state: 'NJ', keyStatLine: '13.8 PPG / 5.0 APG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'primary_ball_handler' },
  { id: 'pp-148', firstName: 'Jayon', lastName: 'Shaw', position: 'SG', height: '6\'2"', weight: 178, classYear: '2026', currentSchool: 'Bryant & Stratton', level: 'USCAA', conference: 'USCAA', state: 'NY', keyStatLine: '15.4 PPG / 3.2 APG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'spot_up_specialist' },
  { id: 'pp-149', firstName: 'Austin', lastName: 'Perry', position: 'SF', height: '6\'5"', weight: 194, classYear: '2025', currentSchool: 'Penn State Brandywine', level: 'USCAA', conference: 'USCAA', state: 'PA', keyStatLine: '11.2 PPG / 4.7 RPG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'three_and_d_wing' },
  { id: 'pp-150', firstName: 'Brandon', lastName: 'Hollis', position: 'PF', height: '6\'7"', weight: 210, classYear: '2025', currentSchool: 'SUNY Delhi', level: 'USCAA', conference: 'USCAA', state: 'NY', keyStatLine: '10.6 PPG / 6.8 RPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'vertical_spacer' },
  { id: 'pp-151', firstName: 'Logan', lastName: 'Stein', position: 'C', height: '6\'9"', weight: 226, classYear: '2026', currentSchool: 'Cleary University', level: 'USCAA', conference: 'USCAA', state: 'MI', keyStatLine: '9.0 PPG / 7.5 RPG / 1.3 BPG', hasFilm: false, lastUpdated: '2026-01-10', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-152', firstName: 'Malcolm', lastName: 'Drake', position: 'PG', height: '6\'0"', weight: 168, classYear: '2025', currentSchool: 'Fisher College', level: 'USCAA', conference: 'USCAA', state: 'MA', keyStatLine: '12.3 PPG / 6.1 APG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'connector_guard_wing' },

  // ── pp-153 through pp-158: NCCAA D1 — 6 players ──
  { id: 'pp-153', firstName: 'Caleb', lastName: 'Winters', position: 'PG', height: '6\'1"', weight: 174, classYear: '2025', currentSchool: 'Grace College', level: 'NCCAA D1', conference: 'NCCAA Central', state: 'IN', keyStatLine: '14.0 PPG / 5.3 APG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'pick_and_roll_operator' },
  { id: 'pp-154', firstName: 'Joshua', lastName: 'Freeman', position: 'SG', height: '6\'3"', weight: 182, classYear: '2026', currentSchool: 'Trinity International', level: 'NCCAA D1', conference: 'NCCAA Central', state: 'IL', keyStatLine: '15.8 PPG / 3.4 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'off_ball_shooter' },
  { id: 'pp-155', firstName: 'Ethan', lastName: 'Mills', position: 'SF', height: '6\'5"', weight: 198, classYear: '2025', currentSchool: 'Judson University', level: 'NCCAA D1', conference: 'NCCAA Central', state: 'IL', keyStatLine: '12.4 PPG / 5.0 RPG', hasFilm: false, lastUpdated: '2026-01-18', archetype: 'two_way_wing' },
  { id: 'pp-156', firstName: 'Marcus', lastName: 'Hale', position: 'PF', height: '6\'7"', weight: 212, classYear: '2025', currentSchool: 'MidAmerica Nazarene', level: 'NCCAA D1', conference: 'NCCAA Central', state: 'KS', keyStatLine: '11.1 PPG / 7.2 RPG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'stretch_big' },
  { id: 'pp-157', firstName: 'Darius', lastName: 'Ingram', position: 'C', height: '6\'9"', weight: 228, classYear: '2026', currentSchool: 'Oakland City', level: 'NCCAA D1', conference: 'NCCAA East', state: 'IN', keyStatLine: '9.5 PPG / 7.8 RPG / 1.7 BPG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'rim_protector_anchor' },
  { id: 'pp-158', firstName: 'Jacob', lastName: 'Moss', position: 'SG', height: '6\'4"', weight: 186, classYear: '2025', currentSchool: 'Southwestern Assemblies', level: 'NCCAA D1', conference: 'NCCAA East', state: 'TX', keyStatLine: '13.7 PPG / 4.1 RPG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'three_and_d_wing' },

  // ── pp-159 through pp-164: NCCAA D2 — 6 players ──
  { id: 'pp-159', firstName: 'Nathan', lastName: 'Cooper', position: 'PG', height: '6\'0"', weight: 168, classYear: '2025', currentSchool: 'Cairn University', level: 'NCCAA D2', conference: 'NCCAA North', state: 'PA', keyStatLine: '12.6 PPG / 5.4 APG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'primary_ball_handler' },
  { id: 'pp-160', firstName: 'Daniel', lastName: 'Cobb', position: 'SG', height: '6\'2"', weight: 178, classYear: '2026', currentSchool: 'Maranatha Baptist', level: 'NCCAA D2', conference: 'NCCAA North', state: 'WI', keyStatLine: '14.2 PPG / 2.9 APG', hasFilm: false, lastUpdated: '2026-01-12', archetype: 'spot_up_specialist' },
  { id: 'pp-161', firstName: 'Isaac', lastName: 'Hensley', position: 'SF', height: '6\'5"', weight: 196, classYear: '2025', currentSchool: 'Appalachian Bible', level: 'NCCAA D2', conference: 'NCCAA South', state: 'WV', keyStatLine: '10.8 PPG / 4.6 RPG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'switchable_defender_wing' },
  { id: 'pp-162', firstName: 'Joel', lastName: 'Pittman', position: 'PF', height: '6\'7"', weight: 210, classYear: '2025', currentSchool: 'Piedmont International', level: 'NCCAA D2', conference: 'NCCAA South', state: 'NC', keyStatLine: '9.7 PPG / 6.3 RPG', hasFilm: true, lastUpdated: '2026-01-16', archetype: 'vertical_spacer' },
  { id: 'pp-163', firstName: 'Micah', lastName: 'Graves', position: 'C', height: '6\'9"', weight: 224, classYear: '2026', currentSchool: 'God\'s Bible School', level: 'NCCAA D2', conference: 'NCCAA South', state: 'OH', keyStatLine: '8.4 PPG / 7.0 RPG / 1.2 BPG', hasFilm: false, lastUpdated: '2026-01-10', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-164', firstName: 'Samuel', lastName: 'Lane', position: 'PG', height: '5\'11"', weight: 164, classYear: '2025', currentSchool: 'Cincinnati Christian', level: 'NCCAA D2', conference: 'NCCAA North', state: 'OH', keyStatLine: '11.5 PPG / 5.7 APG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'connector_guard_wing' },

  // ── pp-165 through pp-179: International — 15 players ──
  { id: 'pp-165', firstName: 'Youssef', lastName: 'Adeyemi', position: 'PF', height: '6\'8"', weight: 220, classYear: '2025', currentSchool: 'Lagos Basketball Academy', level: 'International', conference: 'International', state: 'Nigeria', keyStatLine: '13.6 PPG / 8.2 RPG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'stretch_big' },
  { id: 'pp-166', firstName: 'Jack', lastName: 'Murray', position: 'PG', height: '6\'1"', weight: 176, classYear: '2026', currentSchool: 'Melbourne United Academy', level: 'International', conference: 'International', state: 'Australia', keyStatLine: '11.4 PPG / 6.3 APG', hasFilm: true, lastUpdated: '2026-02-05', archetype: 'pick_and_roll_operator' },
  { id: 'pp-167', firstName: 'Jamal', lastName: 'Thompson-Williams', position: 'SG', height: '6\'3"', weight: 184, classYear: '2025', currentSchool: 'Canada Basketball Academy', level: 'International', conference: 'International', state: 'Canada', keyStatLine: '16.9 PPG / 3.4 APG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'off_ball_shooter' },
  { id: 'pp-168', firstName: 'Pablo', lastName: 'Fernandez', position: 'SF', height: '6\'6"', weight: 202, classYear: '2025', currentSchool: 'Real Madrid Cantera', level: 'International', conference: 'International', state: 'Spain', keyStatLine: '12.1 PPG / 4.9 RPG / 2.6 APG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'two_way_wing' },
  { id: 'pp-169', firstName: 'Lucas', lastName: 'Silva', position: 'PG', height: '6\'0"', weight: 170, classYear: '2026', currentSchool: 'Flamengo Academy', level: 'International', conference: 'International', state: 'Brazil', keyStatLine: '10.8 PPG / 7.0 APG', hasFilm: false, lastUpdated: '2026-01-14', archetype: 'connector_guard_wing' },
  { id: 'pp-170', firstName: 'Lukas', lastName: 'Hoffmann', position: 'C', height: '6\'11"', weight: 238, classYear: '2025', currentSchool: 'Bayern Munich U19', level: 'International', conference: 'International', state: 'Germany', keyStatLine: '10.0 PPG / 8.4 RPG / 2.0 BPG', hasFilm: true, lastUpdated: '2026-01-30', archetype: 'rim_protector_anchor' },
  { id: 'pp-171', firstName: 'Ben', lastName: 'Clarke', position: 'SG', height: '6\'4"', weight: 190, classYear: '2025', currentSchool: 'London Lions Academy', level: 'International', conference: 'International', state: 'UK', keyStatLine: '14.3 PPG / 3.8 RPG', hasFilm: true, lastUpdated: '2026-02-08', archetype: 'spot_up_specialist' },
  { id: 'pp-172', firstName: 'Serge', lastName: 'Nkouandou', position: 'PF', height: '6\'8"', weight: 222, classYear: '2026', currentSchool: 'Cameroon Basketball Institute', level: 'International', conference: 'International', state: 'Cameroon', keyStatLine: '11.5 PPG / 7.6 RPG', hasFilm: false, lastUpdated: '2026-01-10', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-173', firstName: 'Kenji', lastName: 'Tanaka', position: 'PG', height: '5\'11"', weight: 166, classYear: '2025', currentSchool: 'B.League U18 All-Stars', level: 'International', conference: 'International', state: 'Japan', keyStatLine: '9.8 PPG / 5.9 APG', hasFilm: true, lastUpdated: '2026-02-03', archetype: 'primary_ball_handler' },
  { id: 'pp-174', firstName: 'Franco', lastName: 'Gutierrez', position: 'SF', height: '6\'5"', weight: 198, classYear: '2026', currentSchool: 'Obras Sanitarias U19', level: 'International', conference: 'International', state: 'Argentina', keyStatLine: '12.7 PPG / 4.5 RPG / 2.0 APG', hasFilm: true, lastUpdated: '2026-01-26', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-175', firstName: 'Moussa', lastName: 'Ndiaye', position: 'C', height: '6\'10"', weight: 230, classYear: '2025', currentSchool: 'Dakar Basketball Academy', level: 'International', conference: 'International', state: 'Senegal', keyStatLine: '10.6 PPG / 9.1 RPG / 2.4 BPG', hasFilm: false, lastUpdated: '2026-01-18', archetype: 'rim_protector_anchor' },
  { id: 'pp-176', firstName: 'Jean', lastName: 'Pierre', position: 'SG', height: '6\'3"', weight: 182, classYear: '2025', currentSchool: 'Santo Domingo Club', level: 'International', conference: 'International', state: 'Dominican Republic', keyStatLine: '15.5 PPG / 3.1 APG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'off_ball_shooter' },
  { id: 'pp-177', firstName: 'Nikola', lastName: 'Jovanovic', position: 'PF', height: '6\'9"', weight: 224, classYear: '2026', currentSchool: 'Partizan U19', level: 'International', conference: 'International', state: 'Serbia', keyStatLine: '11.9 PPG / 6.4 RPG', hasFilm: true, lastUpdated: '2026-01-20', archetype: 'short_roll_playmaker_big' },
  { id: 'pp-178', firstName: 'Samuel', lastName: 'Owusu', position: 'SF', height: '6\'6"', weight: 204, classYear: '2025', currentSchool: 'Accra Stars Academy', level: 'International', conference: 'International', state: 'Ghana', keyStatLine: '13.0 PPG / 5.3 RPG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'three_and_d_wing' },
  { id: 'pp-179', firstName: 'Hugo', lastName: 'Moreau', position: 'PG', height: '6\'2"', weight: 178, classYear: '2025', currentSchool: 'ASVEL Lyon Academy', level: 'International', conference: 'International', state: 'France', keyStatLine: '10.2 PPG / 5.8 APG', hasFilm: true, lastUpdated: '2026-01-24', archetype: 'dho_handoff_hub' },

  // ── pp-180 through pp-200: Additional mixed-level players ──
  // Additional HS
  { id: 'pp-180', firstName: 'Darrius', lastName: 'Whitmore', position: 'SF', height: '6\'7"', weight: 208, classYear: '2027', currentSchool: 'La Lumiere', level: 'HS', conference: 'Prep', state: 'IN', keyStatLine: '13.6 PPG / 6.4 RPG', hasFilm: true, lastUpdated: '2026-02-13', archetype: 'two_way_wing' },
  { id: 'pp-181', firstName: 'Jaylin', lastName: 'Pugh', position: 'C', height: '6\'10"', weight: 230, classYear: '2026', currentSchool: 'DeMatha Catholic', level: 'HS', conference: 'Prep', state: 'MD', keyStatLine: '11.2 PPG / 8.8 RPG / 2.6 BPG', hasFilm: true, lastUpdated: '2026-01-31', archetype: 'rim_protector_anchor' },
  { id: 'pp-182', firstName: 'Dontae', lastName: 'Knox', position: 'SG', height: '6\'4"', weight: 188, classYear: '2027', currentSchool: 'Centennial HS', level: 'HS', conference: 'CIF', state: 'CA', keyStatLine: '18.7 PPG / 3.5 APG', hasFilm: true, lastUpdated: '2026-02-09', archetype: 'off_ball_shooter' },

  // Additional JUCO D1
  { id: 'pp-183', firstName: 'Tye', lastName: 'Robinson', position: 'PF', height: '6\'8"', weight: 222, classYear: '2026', currentSchool: 'Kilgore College', level: 'JUCO', conference: 'NTJCAC', state: 'TX', keyStatLine: '12.7 PPG / 7.5 RPG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'small_ball_big' },
  { id: 'pp-184', firstName: 'Kenneth', lastName: 'Sims', position: 'C', height: '6\'10"', weight: 236, classYear: '2025', currentSchool: 'Tyler JC', level: 'JUCO', conference: 'NTJCAC', state: 'TX', keyStatLine: '10.3 PPG / 8.8 RPG / 2.1 BPG', hasFilm: true, lastUpdated: '2026-01-27', archetype: 'rim_protector_anchor' },
  { id: 'pp-185', firstName: 'Ramon', lastName: 'Vega', position: 'PG', height: '6\'1"', weight: 172, classYear: '2025', currentSchool: 'Gulf Coast State', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '15.4 PPG / 5.6 APG', hasFilm: true, lastUpdated: '2026-02-06', archetype: 'pick_and_roll_operator' },

  // Additional NCAA D2
  { id: 'pp-186', firstName: 'Terrance', lastName: 'Cooper', position: 'PG', height: '6\'0"', weight: 170, classYear: '2026', currentSchool: 'Tusculum', level: 'NCAA D2', conference: 'South Atlantic', state: 'TN', keyStatLine: '14.9 PPG / 5.2 APG', hasFilm: true, lastUpdated: '2026-02-02', archetype: 'primary_ball_handler' },

  // Additional NAIA
  { id: 'pp-187', firstName: 'Cornelius', lastName: 'Wallace', position: 'SG', height: '6\'3"', weight: 184, classYear: '2026', currentSchool: 'Wayland Baptist', level: 'NAIA', conference: 'Sooner Athletic', state: 'TX', keyStatLine: '16.0 PPG / 3.5 APG', hasFilm: true, lastUpdated: '2026-01-28', archetype: 'spot_up_specialist' },
  { id: 'pp-188', firstName: 'Toby', lastName: 'Christensen', position: 'PF', height: '6\'7"', weight: 214, classYear: '2025', currentSchool: 'Dakota Wesleyan', level: 'NAIA', conference: 'GPAC', state: 'SD', keyStatLine: '10.8 PPG / 6.9 RPG', hasFilm: false, lastUpdated: '2026-01-15', archetype: 'vertical_spacer' },

  // Additional NCAA D1
  { id: 'pp-189', firstName: 'Malik', lastName: 'Bridges', position: 'SF', height: '6\'7"', weight: 210, classYear: '2025', currentSchool: 'Temple', level: 'NCAA D1', conference: 'AAC', state: 'PA', keyStatLine: '12.3 PPG / 5.7 RPG', hasFilm: true, lastUpdated: '2026-02-10', archetype: 'switchable_defender_wing' },
  { id: 'pp-190', firstName: 'Aaron', lastName: 'Douglas', position: 'SG', height: '6\'5"', weight: 194, classYear: '2026', currentSchool: 'Cincinnati', level: 'NCAA D1', conference: 'Big 12', state: 'OH', keyStatLine: '14.8 PPG / 4.0 RPG', hasFilm: true, lastUpdated: '2026-01-25', archetype: 'three_and_d_wing' },

  // Additional International
  { id: 'pp-191', firstName: 'Theo', lastName: 'Laurent', position: 'PF', height: '6\'8"', weight: 218, classYear: '2026', currentSchool: 'Cholet Basket U21', level: 'International', conference: 'International', state: 'France', keyStatLine: '11.0 PPG / 6.7 RPG', hasFilm: true, lastUpdated: '2026-02-07', archetype: 'short_roll_playmaker_big' },

  // Additional NCAA D3
  { id: 'pp-192', firstName: 'Marcus', lastName: 'Chin', position: 'PG', height: '6\'1"', weight: 172, classYear: '2025', currentSchool: 'Guilford', level: 'NCAA D3', conference: 'ODAC', state: 'NC', keyStatLine: '11.3 PPG / 5.1 APG', hasFilm: true, lastUpdated: '2026-01-22', archetype: 'connector_guard_wing' },

  // Additional 3C2A
  { id: 'pp-193', firstName: 'Ronnie', lastName: 'Lyons', position: 'SG', height: '6\'3"', weight: 184, classYear: '2025', currentSchool: 'Mt. SAC', level: '3C2A', conference: '3C2A South', state: 'CA', keyStatLine: '16.5 PPG / 3.3 APG', hasFilm: true, lastUpdated: '2026-02-01', archetype: 'spot_up_specialist' },

  // Additional mixed fills
  { id: 'pp-194', firstName: 'Jalen', lastName: 'Monroe', position: 'PF', height: '6\'8"', weight: 220, classYear: '2026', currentSchool: 'Pensacola State', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '11.4 PPG / 7.3 RPG', hasFilm: true, lastUpdated: '2026-01-19', archetype: 'rebounding_interior_enforcer' },
  { id: 'pp-195', firstName: 'Christian', lastName: 'Osei', position: 'C', height: '6\'10"', weight: 234, classYear: '2026', currentSchool: 'Sunrise Christian', level: 'HS', conference: 'Prep', state: 'KS', keyStatLine: '10.5 PPG / 9.0 RPG / 2.2 BPG', hasFilm: true, lastUpdated: '2026-02-11', archetype: 'rim_protector_anchor' },
  { id: 'pp-196', firstName: 'Keon', lastName: 'Palmer', position: 'SG', height: '6\'4"', weight: 190, classYear: '2025', currentSchool: 'Clarendon College', level: 'JUCO', conference: 'WJCAC', state: 'TX', keyStatLine: '19.3 PPG / 4.1 RPG', hasFilm: true, lastUpdated: '2026-01-23', archetype: 'slasher_rim_pressure_wing' },
  { id: 'pp-197', firstName: 'Leo', lastName: 'Nowak', position: 'PF', height: '6\'9"', weight: 226, classYear: '2025', currentSchool: 'Alba Berlin U19', level: 'International', conference: 'International', state: 'Germany', keyStatLine: '10.8 PPG / 6.1 RPG', hasFilm: false, lastUpdated: '2026-01-11', archetype: 'stretch_big' },
  { id: 'pp-198', firstName: 'Tyrese', lastName: 'Lawson', position: 'PG', height: '6\'0"', weight: 170, classYear: '2025', currentSchool: 'USC Aiken', level: 'NCAA D2', conference: 'Peach Belt', state: 'SC', keyStatLine: '13.7 PPG / 5.6 APG', hasFilm: true, lastUpdated: '2026-02-04', archetype: 'poa_defender_guard' },
  { id: 'pp-199', firstName: 'Sean', lastName: 'Murphy', position: 'SF', height: '6\'6"', weight: 202, classYear: '2026', currentSchool: 'Brewster Academy', level: 'HS', conference: 'Prep', state: 'NH', keyStatLine: '14.5 PPG / 5.4 RPG', hasFilm: true, lastUpdated: '2026-02-14', archetype: 'energy_bench_spark' },
  { id: 'pp-200', firstName: 'Darian', lastName: 'Kemp', position: 'C', height: '6\'10"', weight: 238, classYear: '2025', currentSchool: 'Friends University', level: 'NAIA', conference: 'KCAC', state: 'KS', keyStatLine: '9.9 PPG / 8.0 RPG / 2.3 BPG', hasFilm: true, lastUpdated: '2026-01-29', archetype: 'rim_protector_anchor' },
];

/** Pool player awards — keyed by player id */
export const POOL_PLAYER_AWARDS: Record<string, string[]> = {
  // Original pp-01 through pp-35
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
  // ── New awards for pp-36+ (~40% of new players) ──
  'pp-36': ['WCAC All-Conference 1st Team', 'Pangos All-East'],
  'pp-37': ['MaxPreps Sophomore All-American'],
  'pp-39': ['Pangos All-West'],
  'pp-42': ['Prep Circuit All-Star'],
  'pp-43': ['OTE Season MVP', 'Top 75 ESPN'],
  'pp-46': ['Pangos Top 100', 'NIBC All-Freshman'],
  'pp-49': ['GHSA All-State 1st Team'],
  'pp-50': ['UIL All-State 2nd Team', 'MaxPreps Junior All-American'],
  'pp-51': ['CIF Open Division All-Tournament'],
  'pp-52': ['KJCCC All-Conference 2nd Team'],
  'pp-54': ['ACCC All-Conference 1st Team'],
  'pp-55': ['WJCAC All-Conference 1st Team'],
  'pp-57': ['WJCAC Newcomer of the Year'],
  'pp-60': ['MCCAC Player of the Year'],
  'pp-64': ['Region XX All-Tournament'],
  'pp-68': ['Region III All-Conference'],
  'pp-74': ['3C2A North All-Conference 1st Team'],
  'pp-79': ['3C2A South All-Conference 1st Team'],
  'pp-80': ['3C2A South All-Conference 2nd Team'],
  'pp-84': ['Big 12 All-Freshman Honorable Mention'],
  'pp-85': ['SEC All-Freshman Team'],
  'pp-88': ['AAC All-Conference 3rd Team'],
  'pp-90': ['WCC All-Conference 2nd Team'],
  'pp-91': ['A-10 Sixth Man of the Year'],
  'pp-92': ['Horizon League All-Conference 1st Team'],
  'pp-94': ['Big 12 All-Defensive Team'],
  'pp-99': ['WCC All-Conference 3rd Team'],
  'pp-100': ['SEC All-Defensive Honorable Mention'],
  'pp-103': ['Big 12 All-Conference Honorable Mention'],
  'pp-104': ['SAC All-Conference 1st Team'],
  'pp-105': ['Peach Belt Newcomer of the Year'],
  'pp-108': ['GNAC Defensive POY'],
  'pp-110': ['SIAC All-Conference 2nd Team'],
  'pp-114': ['GLVC All-Conference 1st Team'],
  'pp-115': ['Lone Star Conference POY'],
  'pp-122': ['ODAC All-Conference 2nd Team'],
  'pp-125': ['UAA All-Conference 1st Team'],
  'pp-130': ['UAA All-Conference 2nd Team'],
  'pp-132': ['Sooner Athletic All-Conference 1st Team'],
  'pp-133': ['KCAC All-Conference 1st Team'],
  'pp-136': ['SSAC Defensive POY'],
  'pp-137': ['Mid-South All-Conference 2nd Team'],
  'pp-143': ['KCAC Newcomer of the Year'],
  'pp-147': ['USCAA All-American 2nd Team'],
  'pp-152': ['USCAA All-Conference'],
  'pp-153': ['NCCAA Central All-Conference'],
  'pp-154': ['NCCAA Central Newcomer of the Year'],
  'pp-159': ['NCCAA North All-Conference'],
  'pp-165': ['FIBA Africa U18 All-Tournament'],
  'pp-166': ['NBL1 U18 All-Star'],
  'pp-168': ['ACB U19 All-Tournament'],
  'pp-170': ['NBBL All-Star'],
  'pp-175': ['FIBA Africa U18 MVP'],
  'pp-177': ['ABA League U19 All-Tournament'],
  'pp-180': ['NIBC All-Conference', 'Top 100 ESPN'],
  'pp-181': ['WCAC All-Conference 1st Team'],
  'pp-182': ['CIF All-State Honorable Mention'],
  'pp-185': ['Panhandle All-Conference 1st Team'],
  'pp-189': ['AAC All-Conference 2nd Team'],
  'pp-190': ['Big 12 Sixth Man of the Year'],
  'pp-193': ['3C2A South All-Conference 1st Team'],
  'pp-195': ['Prep Circuit All-Star', 'All-State 1st Team (KS)'],
  'pp-196': ['WJCAC All-Conference 2nd Team'],
  'pp-198': ['Peach Belt All-Conference 2nd Team'],
  'pp-200': ['KCAC All-Conference 2nd Team'],
};
