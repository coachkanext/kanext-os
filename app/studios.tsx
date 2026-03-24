import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function StudiosScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/(main)/kaystudios' as any);
  }, [router]);
  return null;
}
