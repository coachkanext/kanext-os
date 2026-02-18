/**
 * Organization People Tab — Universal mock data
 * Adapts existing per-mode leadership/directory data into a common OrgPerson shape.
 */
import type { Mode } from '@/types';
import { INSTITUTION_LEADERSHIP } from '@/data/mock-sports';
import { CHURCH_LEADERSHIP } from '@/data/mock-church';
import { FACULTY_LEADERSHIP } from '@/data/mock-education';
import { DIRECTORY } from '@/data/mock-business';
import { K1_TEAMS, K1_DRIVERS } from '@/data/mock-community';

export interface OrgPerson {
  id: string;
  name: string;
  title: string;
  section: 'leadership' | 'staff' | 'members';
  department?: string;
  status?: 'active' | 'inactive';
}

function sportsAdapter(): OrgPerson[] {
  return [
    ...INSTITUTION_LEADERSHIP.map((s) => ({
      id: s.id,
      name: s.name,
      title: s.title,
      section: (s.role === 'director' ? 'leadership' : 'staff') as OrgPerson['section'],
      status: 'active' as const,
    })),
    // Extra coaching staff
    { id: 'sp-s1', name: 'Coach Dwayne Harris', title: 'Associate Head Coach', section: 'staff', status: 'active' },
    { id: 'sp-s2', name: 'Antoine Brooks', title: 'Director of Player Development', section: 'staff', status: 'active' },
    { id: 'sp-s3', name: 'Keisha Thompson', title: 'Athletic Trainer', section: 'staff', status: 'active' },
    { id: 'sp-m1', name: 'Daniel Lewis', title: 'Team Captain', section: 'members', status: 'active' },
    { id: 'sp-m2', name: 'Marcus Williams', title: 'Student-Athlete', section: 'members', status: 'active' },
  ];
}

function churchAdapter(): OrgPerson[] {
  return CHURCH_LEADERSHIP.map((l) => ({
    id: l.id,
    name: l.name,
    title: l.title,
    section: (['senior_pastor', 'associate_pastor'].includes(l.role) ? 'leadership' : l.role === 'staff' ? 'staff' : 'members') as OrgPerson['section'],
    status: 'active' as const,
  }));
}

function educationAdapter(): OrgPerson[] {
  return FACULTY_LEADERSHIP.map((f) => ({
    id: f.id,
    name: f.name,
    title: f.title,
    section: (['president', 'provost'].includes(f.role) ? 'leadership' : 'staff') as OrgPerson['section'],
    department: f.departmentId,
    status: 'active' as const,
  }));
}

function businessAdapter(): OrgPerson[] {
  return DIRECTORY.map((d) => ({
    id: d.id,
    name: d.name,
    title: d.role,
    section: (d.department === 'Executive' ? 'leadership' : 'staff') as OrgPerson['section'],
    department: d.department,
    status: d.status === 'active' ? 'active' as const : 'inactive' as const,
  }));
}

function communityAdapter(): OrgPerson[] {
  const leadership: OrgPerson[] = [
    { id: 'k1-rd', name: 'James Whitfield', title: 'Race Director', section: 'leadership', status: 'active' },
    { id: 'k1-cs', name: 'Maria Santos', title: 'Chief Steward', section: 'leadership', status: 'active' },
  ];
  const owners: OrgPerson[] = K1_TEAMS.map((t) => ({
    id: `owner-${t.id}`,
    name: t.owner,
    title: `Owner — ${t.name}`,
    section: 'staff' as const,
    status: 'active' as const,
  }));
  const drivers: OrgPerson[] = K1_DRIVERS.map((d) => ({
    id: d.id,
    name: d.name,
    title: `#${d.number} — ${d.teamName}`,
    section: 'members' as const,
    status: 'active' as const,
  }));
  return [...leadership, ...owners, ...drivers];
}

export function getOrgPeople(mode: Mode): OrgPerson[] {
  switch (mode) {
    case 'sports': return sportsAdapter();
    case 'church': return churchAdapter();
    case 'education': return educationAdapter();
    case 'business': return businessAdapter();
    case 'competition': return communityAdapter();
    default: return [];
  }
}
