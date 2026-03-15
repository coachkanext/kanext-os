import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const TOGGLES = [
  { id: 'badges',    label: 'Message badges on footer icons' },
  { id: 'banners',   label: 'Banner notifications' },
  { id: 'sounds',    label: 'Sound effects' },
  { id: 'haptics',   label: 'Vibration / Haptics' },
];

export default function InAppNotificationsScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map(t => [t.id, true]))
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>In-App Notifications</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {TOGGLES.map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label }]}>{t.label}</Text>
                <Switch
                  value={states[t.id]}
                  onValueChange={() => setStates(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                  trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
                  thumbColor="#FFF"
                />
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
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
});
