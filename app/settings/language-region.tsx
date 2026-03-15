import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

export default function LanguageRegionScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [dateFormat, setDateFormat] = useState<'MDY' | 'DMY'>('MDY');
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('12');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Language & Region</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: C.muted }]}>LANGUAGE</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Language</Text>
            <Text style={[styles.rowValue, { color: C.muted }]}>English</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: C.muted }]}>REGION</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Region</Text>
            <Text style={[styles.rowValue, { color: C.muted }]}>United States</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: C.muted }]}>TIMEZONE</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Timezone</Text>
            <View style={[styles.autoBadge, { backgroundColor: C.separator }]}>
              <Text style={[styles.autoText, { color: C.secondary }]}>Auto</Text>
            </View>
            <Text style={[styles.rowValue, { color: C.muted }]}>Eastern Time (ET)</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: C.muted }]}>FORMAT</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable
            style={styles.row}
            onPress={() => setDateFormat(dateFormat === 'MDY' ? 'DMY' : 'MDY')}
          >
            <Text style={[styles.rowLabel, { color: C.label }]}>Date Format</Text>
            <Text style={[styles.rowValue, { color: C.muted }]}>
              {dateFormat === 'MDY' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'}
            </Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <Pressable
            style={styles.row}
            onPress={() => setTimeFormat(timeFormat === '12' ? '24' : '12')}
          >
            <Text style={[styles.rowLabel, { color: C.label }]}>Time Format</Text>
            <Text style={[styles.rowValue, { color: C.muted }]}>
              {timeFormat === '12' ? '12-hour' : '24-hour'}
            </Text>
          </Pressable>
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
  content: { paddingTop: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.7, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 6,
  },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 8,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  autoBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  autoText: { fontSize: 11, fontWeight: '600' },
});
