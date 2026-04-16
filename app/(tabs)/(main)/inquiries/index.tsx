import { Redirect } from 'expo-router';

export default function InquiriesIndex() {
  return <Redirect href={'/(tabs)/(main)/inquiries/pipeline' as any} />;
}
