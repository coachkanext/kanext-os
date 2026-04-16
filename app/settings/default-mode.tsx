import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';

const MODES = [
  { id: 'sports',    label: 'Athletics' },
  { id: 'business',  label: 'Business' },
  { id: 'community', label: 'Community' },
  { id: 'education', label: 'Education' },
  { id: 'personal',  label: 'Personal' },
] as const;

export default function DefaultModeScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mode = useMode();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Default Mode</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {MODES.map((m, i) => {
            const isActive = mode === m.id;
            return (
              <React.Fragment key={m.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
                <Pressable
                  style={({ pressed }) => [styles.row, { backgroundColor: pressed ? C.separator : 'transparent' }]}
                >
                  <Text style={[styles.rowLabel, { color: C.label }]}>{m.label}</Text>
                  {isActive && <IconSymbol name="checkmark" size={16} color="#111" />}
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>
        <Text style={[styles.subtitle, { color: C.muted }]}>
          This is the mode KaNeXT opens in by default.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 24 },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 14, paddingHorizontal: 32 },
});
