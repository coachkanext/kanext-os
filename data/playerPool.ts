/**
 * National Player Pool — global truth directory.
 * ~25 placeholder players across levels.
 */

export type PoolLevel = 'NAIA' | 'NCAA D1' | 'NCAA D2' | 'NCAA D3' | 'JUCO' | 'International' | 'HS';
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
}

export const PLAYER_POOL: PoolPlayer[] = [
  { id: 'pp-01', firstName: 'Jayden', lastName: 'Carter', position: 'PG', height: '6\'1"', weight: 175, classYear: '2026', currentSchool: 'Oak Hill Academy', level: 'HS', conference: 'Prep', state: 'VA', keyStatLine: '18.2 PPG / 7.4 APG', hasFilm: true, lastUpdated: '2026-02-01' },
  { id: 'pp-02', firstName: 'Marcus', lastName: 'Thompson', position: 'SG', height: '6\'4"', weight: 190, classYear: '2025', currentSchool: 'Coffeyville CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '22.1 PPG / 4.8 RPG', hasFilm: true, lastUpdated: '2026-01-28' },
  { id: 'pp-03', firstName: 'DeAndre', lastName: 'Mitchell', position: 'SF', height: '6\'6"', weight: 205, classYear: '2026', currentSchool: 'Montverde Academy', level: 'HS', conference: 'Prep', state: 'FL', keyStatLine: '15.7 PPG / 6.2 RPG', hasFilm: true, lastUpdated: '2026-02-05' },
  { id: 'pp-04', firstName: 'Kofi', lastName: 'Mensah', position: 'C', height: '6\'10"', weight: 235, classYear: '2025', currentSchool: 'Accra Basketball Academy', level: 'International', conference: 'International', state: 'Ghana', keyStatLine: '12.4 PPG / 9.8 RPG / 2.1 BPG', hasFilm: false, lastUpdated: '2026-01-15' },
  { id: 'pp-05', firstName: 'Tyler', lastName: 'Brooks', position: 'PG', height: '5\'11"', weight: 165, classYear: '2027', currentSchool: 'Bishop Gorman', level: 'HS', conference: 'Prep', state: 'NV', keyStatLine: '14.5 PPG / 8.1 APG', hasFilm: true, lastUpdated: '2026-02-08' },
  { id: 'pp-06', firstName: 'Rashad', lastName: 'Williams', position: 'PF', height: '6\'8"', weight: 220, classYear: '2025', currentSchool: 'Northwest Florida State', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '16.3 PPG / 8.5 RPG', hasFilm: true, lastUpdated: '2026-01-30' },
  { id: 'pp-07', firstName: 'Emmanuel', lastName: 'Okafor', position: 'C', height: '6\'9"', weight: 230, classYear: '2026', currentSchool: 'Sunrise Christian', level: 'HS', conference: 'Prep', state: 'KS', keyStatLine: '13.8 PPG / 10.2 RPG / 3.0 BPG', hasFilm: true, lastUpdated: '2026-02-03' },
  { id: 'pp-08', firstName: 'Jordan', lastName: 'Davis', position: 'SG', height: '6\'3"', weight: 185, classYear: '2025', currentSchool: 'Vincennes', level: 'JUCO', conference: 'NJCAA Region XII', state: 'IN', keyStatLine: '19.6 PPG / 3.2 APG', hasFilm: true, lastUpdated: '2026-01-22' },
  { id: 'pp-09', firstName: 'Chris', lastName: 'Anderson', position: 'SF', height: '6\'5"', weight: 200, classYear: '2026', currentSchool: 'IMG Academy', level: 'HS', conference: 'Prep', state: 'FL', keyStatLine: '16.1 PPG / 5.5 RPG', hasFilm: true, lastUpdated: '2026-02-06' },
  { id: 'pp-10', firstName: 'Darius', lastName: 'Jackson', position: 'PG', height: '6\'0"', weight: 170, classYear: '2025', currentSchool: 'Lincoln Memorial', level: 'NCAA D2', conference: 'South Atlantic', state: 'TN', keyStatLine: '15.4 PPG / 6.8 APG', hasFilm: false, lastUpdated: '2026-01-18' },
  { id: 'pp-11', firstName: 'Mateo', lastName: 'Rodriguez', position: 'SG', height: '6\'2"', weight: 180, classYear: '2026', currentSchool: 'Life Center Academy', level: 'HS', conference: 'Prep', state: 'NJ', keyStatLine: '20.3 PPG / 3.5 APG', hasFilm: true, lastUpdated: '2026-02-07' },
  { id: 'pp-12', firstName: 'Ahmad', lastName: 'Hassan', position: 'PF', height: '6\'7"', weight: 215, classYear: '2025', currentSchool: 'South Plains College', level: 'JUCO', conference: 'WJCAC', state: 'TX', keyStatLine: '14.7 PPG / 7.9 RPG', hasFilm: true, lastUpdated: '2026-01-25' },
  { id: 'pp-13', firstName: 'Luka', lastName: 'Petrovic', position: 'SF', height: '6\'6"', weight: 200, classYear: '2025', currentSchool: 'KK Mega Basket U19', level: 'International', conference: 'International', state: 'Serbia', keyStatLine: '11.2 PPG / 4.8 RPG / 2.3 APG', hasFilm: true, lastUpdated: '2026-01-20' },
  { id: 'pp-14', firstName: 'Terrell', lastName: 'Washington', position: 'PG', height: '6\'2"', weight: 178, classYear: '2025', currentSchool: 'Central Arizona', level: 'JUCO', conference: 'ACCAC', state: 'AZ', keyStatLine: '17.8 PPG / 5.6 APG', hasFilm: true, lastUpdated: '2026-02-04' },
  { id: 'pp-15', firstName: 'Nate', lastName: 'Kim', position: 'SG', height: '6\'3"', weight: 182, classYear: '2026', currentSchool: 'Findlay Prep', level: 'HS', conference: 'Prep', state: 'NV', keyStatLine: '13.4 PPG / 4.1 RPG', hasFilm: false, lastUpdated: '2026-01-12' },
  { id: 'pp-16', firstName: 'Xavier', lastName: 'Patel', position: 'C', height: '6\'11"', weight: 240, classYear: '2025', currentSchool: 'Hutchinson CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '10.5 PPG / 8.7 RPG / 2.8 BPG', hasFilm: true, lastUpdated: '2026-01-29' },
  { id: 'pp-17', firstName: 'Isaiah', lastName: 'Green', position: 'PF', height: '6\'7"', weight: 210, classYear: '2027', currentSchool: 'Wheeler HS', level: 'HS', conference: 'GHSA', state: 'GA', keyStatLine: '12.9 PPG / 7.1 RPG', hasFilm: true, lastUpdated: '2026-02-02' },
  { id: 'pp-18', firstName: 'Cam', lastName: 'Butler', position: 'SF', height: '6\'5"', weight: 195, classYear: '2025', currentSchool: 'Barton CC', level: 'JUCO', conference: 'KJCCC', state: 'KS', keyStatLine: '18.0 PPG / 5.2 RPG', hasFilm: true, lastUpdated: '2026-01-27' },
  { id: 'pp-19', firstName: 'Jamal', lastName: 'Foster', position: 'PG', height: '5\'10"', weight: 160, classYear: '2026', currentSchool: 'St. Benedict\'s Prep', level: 'HS', conference: 'Prep', state: 'NJ', keyStatLine: '11.8 PPG / 9.2 APG', hasFilm: true, lastUpdated: '2026-02-08' },
  { id: 'pp-20', firstName: 'Oumar', lastName: 'Diallo', position: 'C', height: '6\'10"', weight: 225, classYear: '2025', currentSchool: 'INSEP Paris', level: 'International', conference: 'International', state: 'France', keyStatLine: '9.4 PPG / 7.6 RPG / 1.9 BPG', hasFilm: false, lastUpdated: '2026-01-10' },
  { id: 'pp-21', firstName: 'Devon', lastName: 'Price', position: 'SG', height: '6\'4"', weight: 188, classYear: '2025', currentSchool: 'Chipola College', level: 'JUCO', conference: 'Panhandle', state: 'FL', keyStatLine: '21.3 PPG / 3.8 RPG', hasFilm: true, lastUpdated: '2026-02-01' },
  { id: 'pp-22', firstName: 'Miguel', lastName: 'Santos', position: 'PF', height: '6\'8"', weight: 218, classYear: '2026', currentSchool: 'La Lumiere', level: 'HS', conference: 'Prep', state: 'IN', keyStatLine: '14.2 PPG / 8.0 RPG', hasFilm: true, lastUpdated: '2026-01-31' },
  { id: 'pp-23', firstName: 'Kwame', lastName: 'Asante', position: 'SF', height: '6\'5"', weight: 198, classYear: '2025', currentSchool: 'Ranger College', level: 'JUCO', conference: 'NTJCAC', state: 'TX', keyStatLine: '15.9 PPG / 6.0 RPG', hasFilm: true, lastUpdated: '2026-01-24' },
  { id: 'pp-24', firstName: 'Ryan', lastName: 'O\'Brien', position: 'PG', height: '6\'1"', weight: 172, classYear: '2025', currentSchool: 'Chaminade', level: 'NCAA D2', conference: 'Peach Belt', state: 'HI', keyStatLine: '13.1 PPG / 5.9 APG', hasFilm: false, lastUpdated: '2026-01-16' },
  { id: 'pp-25', firstName: 'Trevon', lastName: 'Bell', position: 'SG', height: '6\'3"', weight: 184, classYear: '2027', currentSchool: 'Prolific Prep', level: 'HS', conference: 'Prep', state: 'CA', keyStatLine: '16.7 PPG / 4.3 RPG', hasFilm: true, lastUpdated: '2026-02-09' },
];
