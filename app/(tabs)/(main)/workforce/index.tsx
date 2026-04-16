import { Redirect } from 'expo-router';

export default function WorkforceIndex() {
  return <Redirect href={'/(tabs)/(main)/workforce/directory' as any} />;
}
