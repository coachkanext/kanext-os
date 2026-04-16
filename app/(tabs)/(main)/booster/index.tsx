/**
 * Booster — role-based redirect.
 * Coach → dashboard | Fan/Player → my-nil
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useDemoRole } from '@/utils/demo-role-store';

export default function BoosterIndex() {
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('sports:booster');
  const isCoach = role === roleCycles[0];

  useEffect(() => {
    router.replace(
      isCoach
        ? '/(tabs)/(main)/booster/dashboard'
        : '/(tabs)/(main)/booster/my-nil' as any);
  }, [isCoach, router]);

  return null;
}
