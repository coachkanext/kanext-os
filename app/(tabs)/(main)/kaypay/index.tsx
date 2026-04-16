import { Redirect } from 'expo-router';

export default function KPayIndex() {
  return <Redirect href={'/(tabs)/(main)/kaypay/wallet' as any} />;
}
