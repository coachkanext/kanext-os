/**
 * Store / Give — grid position 6 (Row 2, right).
 * Sports/Business/Education: Store (products, orders, drops).
 * Church: Give (designations, history, campaigns).
 */

import { useMode } from '@/context/app-context';
import { StoreContent } from '@/components/store/store-content';
import { GiveContent } from '@/components/store/give-content';

export default function StoreScreen() {
  const mode = useMode();
  if (mode === 'church') return <GiveContent />;
  return <StoreContent />;
}
