/**
 * Recruits/Prospects — 3-page swipeable layout. Home grid position 4 (row 2 left).
 * Sports mode: Rankings / Discover / Schools.
 * Other modes: stub for now (Leads, Outreach, Admissions).
 */

import { useMode } from '@/context/app-context';
import { ProspectsContent } from '@/components/prospects/prospects-content';

export default function RecruitsScreen() {
  const mode = useMode();
  // Only sports mode has the full Prospects implementation for now
  return <ProspectsContent />;
}
