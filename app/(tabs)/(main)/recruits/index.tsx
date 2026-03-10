/**
 * Recruits/Prospects — 3-page swipeable layout. Home grid position 4 (row 2 left).
 * Sports mode: Rankings / Discover / Schools.
 * Business mode: Pipeline / Contacts / Activity (Leads CRM).
 * Other modes: stub for now (Outreach, Admissions).
 */

import { useMode } from '@/context/app-context';
import { ProspectsContent } from '@/components/prospects/prospects-content';
import { LeadsContent } from '@/components/leads/leads-content';
import { AdmissionsContent } from '@/components/admissions/admissions-content';
import { OutreachContent } from '@/components/outreach/outreach-content';

export default function RecruitsScreen() {
  const mode = useMode();
  if (mode === 'business') return <LeadsContent />;
  if (mode === 'education') return <AdmissionsContent />;
  if (mode === 'church') return <OutreachContent />;
  return <ProspectsContent />;
}
