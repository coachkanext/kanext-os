import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

export default function BusinessCreateScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingBottom: insets.bottom }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: C.secondary }}>Coming Soon</Text>
    </View>
  );
}
