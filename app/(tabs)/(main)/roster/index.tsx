/**
 * Roster — 3-page swipeable layout. Home grid position 3 (row 1 right).
 * Sports mode: Players / Management / Board.
 * Business mode: Members / Management / Hiring.
 * Education mode: Members / Organizations / Development.
 * Church mode: Serve / Connect / Management.
 */

import { useMode } from '@/context/app-context';
import { RosterContent } from '@/components/roster/roster-content';
import { TeamContent } from '@/components/team/team-content';
import { CommunityContent } from '@/components/community/community-content';
import { MinistriesContent } from '@/components/ministries/ministries-content';

export default function RosterScreen() {
  const mode = useMode();
  if (mode === 'business') return <TeamContent />;
  if (mode === 'education') return <CommunityContent />;
  if (mode === 'church') return <MinistriesContent />;
  return <RosterContent />;
}
