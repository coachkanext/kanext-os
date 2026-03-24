import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const TOGGLES = [
  { id: 'messages',  label: 'Messages',        sub: 'New DMs and channel messages' },
  { id: 'mentions',  label: 'Mentions',         sub: '@mentions in channels' },
  { id: 'nexus',     label: 'Nexus Actions',    sub: 'When Nexus completes a task or needs approval' },
  { id: 'calendar',  label: 'Calendar',         sub: 'Agenda reminders and event changes' },
  { id: 'pipeline',  label: 'Pipeline',         sub: 'Prospect/lead status changes' },
  { id: 'kaypay',    label: 'KayPay',           sub: 'Transaction alerts and payments received' },
  { id: 'social',    label: 'Social',           sub: 'Likes, comments, follows' },
];

export default function PushNotificationsScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [master, setMaster] = useState(true);
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map(t => [t.id, true]))
  );

  const toggle = (id: string) => setStates(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Push Notifications</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Allow Push Notifications</Text>
            <Switch
              value={master}
              onValueChange={setMaster}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.muted }]}>NOTIFICATION TYPES</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {TOGGLES.map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
              <Pressable
                style={styles.row}
                onPress={() => master && toggle(t.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: master ? C.label : C.muted }]}>{t.label}</Text>
                  <Text style={[styles.rowSub, { color: C.muted }]}>{t.sub}</Text>
                </View>
                <Switch
                  value={master && states[t.id]}
                  onValueChange={() => master && toggle(t.id)}
                  disabled={!master}
                  trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
                  thumbColor="#FFF"
                />
              </Pressable>
            </React.Fragment>
          ))}
        </View>
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
  sectionLabel: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.7, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 6,
  },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 12, marginTop: 2 },
});
