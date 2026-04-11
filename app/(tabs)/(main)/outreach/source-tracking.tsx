/**
 * Outreach — Source Tracking (Pastor only).
 * Member redirects to outreach/index.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';

// ── Mock data ─────────────────────────────────────────────────────────────────

type Source = {
  label: string;
  count: number;
  conversion: number;  // percentage
  last30: number;
};

const SOURCES: Source[] = [
  { label: 'Member Invite',    count: 14, conversion: 28, last30: 5 },
  { label: 'Website',          count: 8,  conversion: 12, last30: 3 },
  { label: 'Social Media',     count: 6,  conversion: 16, last30: 2 },
  { label: 'Walk-In',          count: 4,  conversion: 25, last30: 1 },
  { label: 'Community Event',  count: 2,  conversion: 50, last30: 2 },
  { label: 'Radio',            count: 0,  conversion: 0,  last30: 0 },
];

const MAX_COUNT = Math.max(...SOURCES.map(s => s.count), 1);

// ── Component ─────────────────────────────────────────────────────────────────

export default function SourceTrackingScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/outreach' as any);
    }
  }, [isPastor, router]));

  const topBarH = insets.top + TOP_BAR_H;

  if (!isPastor) return null;

  const totalProspects = SOURCES.reduce((sum, src) => sum + src.count, 0);
  const topSource      = SOURCES.reduce((best, src) => src.count > best.count ? src : best, SOURCES[0]);
  const avgConversion  = Math.round(
    SOURCES.filter(s => s.count > 0).reduce((sum, s) => sum + s.conversion, 0) /
    SOURCES.filter(s => s.count > 0).length,
  );

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topBarH + 12,
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: C.surface }]}>
            <Text style={[s.statValue, { color: C.label }]}>{SOURCES.length}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Total Sources</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: C.surface, flex: 2 }]}>
            <Text style={[s.statValue, { color: GAIN, fontSize: 14 }]} numberOfLines={1}>
              {topSource.label}
            </Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Top Source</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: C.surface }]}>
            <Text style={[s.statValue, { color: GAIN }]}>{avgConversion}%</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Avg Conversion</Text>
          </View>
        </View>

        {/* Source breakdown list */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Source Breakdown</Text>
        <View style={[s.breakdownCard, { backgroundColor: C.surface }]}>
          {SOURCES.map((src, idx) => {
            const barWidthPct = MAX_COUNT > 0 ? (src.count / MAX_COUNT) * 100 : 0;
            return (
              <View
                key={src.label}
                style={[
                  s.sourceRow,
                  idx < SOURCES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                ]}
              >
                {/* Source name + count */}
                <View style={s.sourceNameBlock}>
                  <Text style={[s.sourceName, { color: C.label }]}>{src.label}</Text>
                  <Text style={[s.sourceCount, { color: C.secondary }]}>
                    {src.count} prospects
                  </Text>
                </View>

                {/* Bar + stats */}
                <View style={s.sourceBarBlock}>
                  {/* Bar track */}
                  <View style={[s.barTrack, { backgroundColor: C.separator }]}>
                    <View
                      style={[
                        s.barFill,
                        {
                          width: `${barWidthPct}%` as any,
                          backgroundColor: src.count > 0 ? GAIN : C.separator,
                        },
                      ]}
                    />
                  </View>

                  {/* Conversion + last 30d */}
                  <View style={s.sourceStats}>
                    <Text style={[s.conversionText, { color: src.count > 0 ? C.label : C.secondary }]}>
                      {src.conversion}% conv.
                    </Text>
                    <Text style={[s.last30Text, { color: C.secondary }]}>
                      {src.last30} last 30d
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer note */}
        <Text style={[s.footerNote, { color: C.secondary }]}>
          Conversion rate = prospects who became members / total prospects from source
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Top bar — position absolute */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, height: topBarH, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidePanel();
              }}
              hitSlop={12}
            >
              <KMenuButton />
            </Pressable>
          </View>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titlePillText, { color: C.label }]}>Source Tracking</Text>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },
  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:     { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },
  titlePill: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  titlePillText: { fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:  { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  statLabel: { fontSize: 11, marginTop: 3, textAlign: 'center' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  breakdownCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },

  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  sourceNameBlock: { width: 120 },
  sourceName:  { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  sourceCount: { fontSize: 11 },

  sourceBarBlock: { flex: 1, gap: 5 },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  sourceStats:    { flexDirection: 'row', justifyContent: 'space-between' },
  conversionText: { fontSize: 11, fontWeight: '600' },
  last30Text:     { fontSize: 11 },

  footerNote: { fontSize: 11, lineHeight: 16, marginTop: 4, textAlign: 'center' },
});
