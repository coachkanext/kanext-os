/**
 * Roster — 3-page swipeable layout. Home grid position 3 (row 1 right).
 * Sports mode: Players / Management / Board.
 * Future modes: Team (business), Ministries (church), Community (education).
 */

import { useMode } from '@/context/app-context';
import { RosterContent } from '@/components/roster/roster-content';

export default function RosterScreen() {
  const mode = useMode();
  // Future: if (mode === 'business') return <TeamContent />;
  // Future: if (mode === 'education') return <CommunityContent />;
  // Future: if (mode === 'church') return <MinistriesContent />;
  return <RosterContent />;
}
