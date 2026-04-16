/**
 * Admissions index — role-based redirect.
 * President → pipeline, Student → my-application.
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useDemoRole } from '@/utils/demo-role-store';

export default function AdmissionsIndex() {
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('education:admissions');
  const isPresident = role === roleCycles[0];

  useEffect(() => {
    router.replace(
      isPresident
        ? '/(tabs)/(main)/admissions/pipeline'
        : '/(tabs)/(main)/admissions/my-application' as any
    );
  }, [isPresident, router]);

  return null;
}
