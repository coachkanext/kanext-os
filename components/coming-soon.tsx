import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function ComingSoon({ title }: { title: string }) {
  const C = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[s.headerTitle, { color: C.label }]}>{title}</Text>
      </View>
      <View style={s.body}>
        <IconSymbol name="hammer.fill" size={32} color={C.muted} />
        <Text style={[s.heading, { color: C.label }]}>Coming Soon</Text>
        <Text style={[s.sub, { color: C.secondary }]}>This section is under construction.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: 14 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 100 },
  heading: { fontSize: 20, fontWeight: '600' },
  sub: { fontSize: 14 },
});
