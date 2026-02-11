/**
 * Sun Conference — NAIA Men's Basketball
 * STEP 2: Coaching Staff (Program Context)
 *
 * Source: Official athletics websites + web search verification
 * 9 programs — current staff as publicly listed
 */

import type { CoachingStaff } from './schema';

export const coachingStaff: CoachingStaff[] = [
  {
    program_id: 'ave-maria',
    head_coach_name: 'Jamon Copeland',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Frank O\'Brien', role: null },
      { name: 'Michael O\'Donnell', role: null },
      { name: 'Paul Matthews', role: null },
    ],
    staff_page_url: 'https://avemariagyrenes.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'coastal-georgia',
    head_coach_name: 'Tim MacAllister',
    head_coach_title: 'Head Coach',
    assistant_coaches: [
      { name: 'Keith Olive', role: 'Assistant Coach' },
      { name: 'Charles Pankey', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://coastalgeorgiasports.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'florida-memorial',
    head_coach_name: 'Delano Thomas',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Juan Urbina', role: 'Men\'s Basketball Assistant Coach' },
      { name: 'Jacob Shaw', role: 'Assistant Men\'s Basketball Coach' },
    ],
    staff_page_url: 'https://fmuathletics.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'keiser',
    head_coach_name: 'Marcus Bryant',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Max Spinner', role: 'Assistant Men\'s Basketball Coach/Recruiting Coordinator' },
      { name: 'Payton Hulsey', role: 'Assistant Men\'s Basketball Coach/Player Development' },
      { name: 'Matt Wargo', role: 'Assistant Men\'s Basketball Coach/Developmental Team Head Coach' },
    ],
    staff_page_url: 'https://kuseahawks.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'new-college-florida',
    head_coach_name: 'Andrew Wingreen',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Ty Brooks', role: 'Assistant Coach' },
      { name: 'Scott Townsend', role: 'Assistant Coach/Development Team Head Coach' },
      { name: 'Alex Sommers', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://gomightybanyans.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'southeastern',
    head_coach_name: 'Randy Lee',
    head_coach_title: 'Head Coach',
    assistant_coaches: [
      { name: 'Brandon Mayhan', role: 'Assistant Coach' },
      { name: 'Tyler Savage', role: 'Assistant Coach' },
      { name: 'Tanner Rubio', role: 'Assistant Coach' },
      { name: 'Douglas Peppers', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://fire.seu.edu/sports/mens-basketball/coaches',
  },
  {
    program_id: 'st-thomas',
    head_coach_name: 'Zach Moss',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Jacob Shaw', role: 'Associate Head Coach' },
      { name: 'Lorel Beckford', role: 'Assistant Coach' },
    ],
    staff_page_url: 'https://stubobcats.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'warner',
    head_coach_name: 'Matt Warren',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Donnie Arey', role: 'Men\'s Basketball Coach' },
      { name: 'Dylan Harvey', role: 'Men\'s Basketball Coach' },
    ],
    staff_page_url: 'https://warnerroyals.com/sports/mens-basketball/coaches',
  },
  {
    program_id: 'webber-international',
    head_coach_name: 'Gabriel Rutledge',
    head_coach_title: 'Head Men\'s Basketball Coach',
    assistant_coaches: [
      { name: 'Johnson Mesidor', role: 'Assistant Men\'s Basketball Coach' },
      { name: 'Jordan Counts', role: 'Assistant Men\'s Basketball Coach' },
    ],
    staff_page_url: 'https://webberathletics.com/sports/mens-basketball/coaches',
  },
];
