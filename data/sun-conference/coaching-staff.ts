/**
 * KaNeXT Conference — Men's Basketball
 * Coaching Staff (Program Context)
 * 9 programs — demo coaching staff
 */

import type { CoachingStaff } from './schema';

export const coachingStaff: CoachingStaff[] = [
  {
    program_id: 'ave-maria',
    head_coach_name: 'Kevin Morris',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Brian Palmer', role: null },
      { name: 'Chris Henderson', role: null },
      { name: 'Paul Matthews', role: null },
    ],
    staff_page_url: 'https://westfield.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'coastal-georgia',
    head_coach_name: 'Tim Parker',
    head_coach_title: 'Head Coach',
    assistant_coaches: [
      { name: 'Keith Oliver', role: 'Assistant Coach' },
      { name: 'Charles Banks', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://bayshore.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'kx-sports',
    head_coach_name: 'Marcus Williams',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Derek Johnson', role: 'Associate Head Coach' },
      { name: 'Tyler Brooks', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://athletics.kanext.edu/sports/mens-basketball/coaches',
  },
  {
    program_id: 'keiser',
    head_coach_name: 'Andre Bryant',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Max Spencer', role: 'Assistant Coach / Recruiting Coordinator' },
      { name: 'Jason Price', role: 'Assistant Coach / Player Development' },
      { name: 'Matt Walker', role: 'Assistant Coach / Development Team' },
    ],
    staff_page_url: 'https://lakewood.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'new-college-florida',
    head_coach_name: 'Andrew Green',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Ty Brooks', role: 'Assistant Coach' },
      { name: 'Scott Taylor', role: 'Assistant Coach / Development Team' },
      { name: 'Alex Summers', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://riverside.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'southeastern',
    head_coach_name: 'Randy Lewis',
    head_coach_title: 'Head Coach',
    assistant_coaches: [
      { name: 'Brandon May', role: 'Assistant Coach' },
      { name: 'Tyler Stevens', role: 'Assistant Coach' },
      { name: 'Tanner Rogers', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://summit.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'st-thomas',
    head_coach_name: 'Zach Morrison',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Jacob Shaw', role: 'Associate Head Coach' },
      { name: 'Lorel Beck', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://ridgemont.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'warner',
    head_coach_name: 'Matt Warren',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Donnie Archer', role: 'Assistant Coach' },
      { name: 'Dylan Harper', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://clearwater.edu/athletics/sports/mens-basketball/coaches',
  },
  {
    program_id: 'webber-international',
    head_coach_name: 'Gabriel Rhodes',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Johnson Mercer', role: 'Assistant Coach' },
      { name: 'Jordan Collins', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://pinecrest.edu/athletics/sports/mens-basketball/coaches',
  },
];
