import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function QuietHoursScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [startTime] = useState('10:00 PM');
  const [endTime] = useState('7:00 AM');
  const [activeDays, setActiveDays] = useState(new Set(DAYS));
  const [allowStarred, setAllowStarred] = useState(false);
  const [allowNexus, setAllowNexus] = useState(true);

  const toggleDay = (d: string) => {
    setActiveDays(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Quiet Hours</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle */}
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Quiet Hours</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {enabled && (
          <>
            {/* Time */}
            <Text style={[styles.sectionLabel, { color: C.muted }]}>TIME</Text>
            <View style={[styles.group, { backgroundColor: C.surface }]}>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label }]}>Start</Text>
                <Text style={[styles.rowValue, { color: C.secondary }]}>{startTime}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: C.separator }]} />
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label }]}>End</Text>
                <Text style={[styles.rowValue, { color: C.secondary }]}>{endTime}</Text>
              </View>
            </View>

            {/* Days */}
            <Text style={[styles.sectionLabel, { color: C.muted }]}>DAYS</Text>
            <View style={[styles.group, { backgroundColor: C.surface }]}>
              <View style={styles.presetRow}>
                <Pressable
                  style={[styles.presetPill, { backgroundColor: activeDays.size === 7 ? '#111' : C.separator }]}
                  onPress={() => setActiveDays(new Set(DAYS))}
                >
                  <Text style={[styles.presetText, { color: activeDays.size === 7 ? '#FFF' : C.label }]}>Every day</Text>
                </Pressable>
                <Pressable
                  style={[styles.presetPill, {
                    backgroundColor: activeDays.size === 5 && !activeDays.has('Sat') && !activeDays.has('Sun') ? '#111' : C.separator
                  }]}
                  onPress={() => setActiveDays(new Set(['Mon','Tue','Wed','Thu','Fri']))}
                >
                  <Text style={[styles.presetText, {
                    color: activeDays.size === 5 && !activeDays.has('Sat') && !activeDays.has('Sun') ? '#FFF' : C.label
                  }]}>Weekdays only</Text>
                </Pressable>
              </View>
              <View style={styles.daysRow}>
                {DAYS.map(d => {
                  const active = activeDays.has(d);
                  return (
                    <Pressable
                      key={d}
                      style={[styles.dayChip, { backgroundColor: active ? '#111' : 'transparent', borderColor: active ? '#111' : C.divider }]}
                      onPress={() => toggleDay(d)}
                    >
                      <Text style={[styles.dayText, { color: active ? '#FFF' : C.label }]}>{d}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Exceptions */}
            <Text style={[styles.sectionLabel, { color: C.muted }]}>EXCEPTIONS</Text>
            <View style={[styles.group, { backgroundColor: C.surface }]}>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label, flex: 1 }]}>
                  Allow from starred contacts
                </Text>
                <Switch
                  value={allowStarred}
                  onValueChange={setAllowStarred}
                  trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
                  thumbColor="#FFF"
                />
              </View>
              <View style={[styles.divider, { backgroundColor: C.separator }]} />
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label, flex: 1 }]}>
                  Allow Nexus escalations
                </Text>
                <Switch
                  value={allowNexus}
                  onValueChange={setAllowNexus}
                  trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          </>
        )}
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
  rowValue: { fontSize: 15, fontWeight: '500' },
  presetRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  presetPill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  presetText: { fontSize: 14, fontWeight: '500' },
  daysRow: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 4, flexWrap: 'wrap' },
  dayChip: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center',
  },
  dayText: { fontSize: 13, fontWeight: '500' },
});
