/**
 * Biz Calendar V2 — Schedule Tab Wrapper
 *
 * Sub-pills: Agenda | Calendar
 * Agenda = chronological stream (day-level detail)
 * Calendar = month/week grid (visual time control)
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { BizAgendaView } from '@/components/biz-home/biz-agenda-view';
import { BizMonthCalendar } from '@/components/biz-home/biz-month-calendar';

const ACCENT = MODE_ACCENT.business;

type SubTab = 'Agenda' | 'Calendar';
const PILLS: SubTab[] = ['Agenda', 'Calendar'];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizCalendarV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<SubTab>('Agenda');

  return (
    <View style={s.container}>
      <View style={s.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[s.pill, activeTab === pill && { backgroundColor: ACCENT }]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(pill); }}
          >
            <ThemedText style={[s.pillText, { color: activeTab === pill ? '#000' : colors.textSecondary }]}>
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'Agenda' && <BizAgendaView colors={colors} accent={accent} />}
      {activeTab === 'Calendar' && <BizMonthCalendar colors={colors} accent={accent} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
