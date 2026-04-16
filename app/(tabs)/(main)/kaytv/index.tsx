/**
 * KayTV entry point — Channel is always the default.
 * Redirect immediately so the tile always lands on the Channel screen.
 */
import { Redirect } from 'expo-router';

export default function KayTVIndex() {
  return <Redirect href={'/(tabs)/(main)/kaytv/my-channel' as any} />;
}
