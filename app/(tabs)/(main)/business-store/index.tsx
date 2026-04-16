import { Redirect } from 'expo-router';

export default function BusinessStoreIndex() {
  return <Redirect href={'/(tabs)/(main)/business-store/store' as any} />;
}
