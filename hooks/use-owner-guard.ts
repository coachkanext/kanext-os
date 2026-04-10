/**
 * useOwnerGuard — wraps cycleRole so that switching from Owner → Follower
 * automatically navigates to the Follower's default screen for that tile.
 *
 * Usage:
 *   const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/agenda');
 *   <RolePill role={role} onPress={guardedCycle} ... />
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';

export function useOwnerGuard(
  role: string,
  roleCycles: string[],
  cycleRole: () => void,
  followerDefault: string,
): () => void {
  const router = useRouter();

  return useCallback(() => {
    const switchingToFollower = role === roleCycles[0];
    cycleRole();
    if (switchingToFollower) {
      router.replace(followerDefault as any);
    }
  }, [role, roleCycles, cycleRole, followerDefault, router]);
}
