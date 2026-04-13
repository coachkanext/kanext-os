/**
 * Portfolio — Projects (default screen).
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '@/data/mock-portfolio';

const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

function hsl(hue: number, s = 35, l = 58, a = 1): string {
  return `hsla(${hue}, ${s}%, ${l}%, ${a})`;
}

export default function ProjectsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C), [C]);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [expandedProj, setExpandedProj] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Projects</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Section header row */}
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>ALL PROJECTS</Text>
          {isOwner && (
            <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus" size={13} color={C.secondary} />
              <Text style={[s.addBtnText, { color: C.secondary }]}>Add</Text>
            </Pressable>
          )}
        </View>

        {PORTFOLIO_PROJECTS.map(proj => (
          <ProjectCard
            key={proj.id}
            proj={proj}
            expanded={expandedProj === proj.id}
            onToggle={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedProj(p => p === proj.id ? null : proj.id); }}
            C={C}
            s={s}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ProjectCard({ proj, expanded, onToggle, C, s }: { proj: PortfolioProject; expanded: boolean; onToggle: () => void; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const isSelf = proj.client === 'Self-produced';
  return (
    <GlassView tier={1} style={[s.projCard, { marginBottom: 12 }]}>
      <View style={[s.projCover, { backgroundColor: hsl(proj.coverHue, 28, 62, 0.22) }]}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: hsl(proj.coverHue, 30, 40, 0.08) }]} />
        <View style={{ opacity: 0.7 }}>
          <IconSymbol name="photo.on.rectangle.angled" size={32} color={hsl(proj.coverHue, 40, 50, 0.5)} />
        </View>
        <View style={[s.coverBadge, { backgroundColor: isSelf ? C.surface + 'CC' : hsl(proj.coverHue, 30, 20, 0.7) }]}>
          <Text style={[s.coverBadgeText, { color: isSelf ? C.secondary : 'rgba(255,255,255,0.9)' }]}>
            {isSelf ? 'Self-produced' : 'Sponsored'}
          </Text>
        </View>
      </View>
      <View style={s.projBody}>
        <View style={s.projMeta}>
          <View style={[s.clientPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.clientPillText, { color: C.secondary }]}>{proj.client}</Text>
          </View>
          <Pressable onPress={onToggle} hitSlop={12}>
            <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
          </Pressable>
        </View>
        <Text style={[s.projTitle, { color: C.label }]}>{proj.title}</Text>
        <Text style={[s.projDesc, { color: C.secondary }]} numberOfLines={expanded ? undefined : 3}>{proj.description}</Text>
        <View style={s.resultsRow}>
          {proj.results.map((r, i) => (
            <View key={r.label} style={[s.resultPill, i === 0 ? { backgroundColor: GAIN + '18', borderColor: GAIN + '40' } : i === 1 ? { backgroundColor: CAUTION + '18', borderColor: CAUTION + '40' } : { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.resultValue, { color: i === 0 ? GAIN : i === 1 ? CAUTION : C.label }]}>{r.value}</Text>
              <Text style={[s.resultLabel, { color: C.secondary }]}> {r.label}</Text>
            </View>
          ))}
        </View>
        {expanded && proj.samples.length > 0 && (
          <>
            <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginTop: 4 }]} />
            <View style={s.samplesRow}>
              {proj.samples.map(sample => (
                <Pressable key={sample.id} style={[s.sampleThumb, { backgroundColor: hsl(sample.thumbHue, 28, 62, 0.15) }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name={sample.type === 'reel' ? 'play.circle.fill' : sample.type === 'video' ? 'video.fill' : 'photo.fill'} size={22} color={hsl(sample.thumbHue, 35, 45, 0.65)} />
                  <Text style={[{ fontSize: 10, fontWeight: '600', letterSpacing: 0.2 }, { color: hsl(sample.thumbHue, 30, 40, 0.7) }]}>{sample.type === 'reel' ? 'Reel' : sample.type === 'video' ? 'Video' : 'Post'}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </GlassView>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, fontWeight: '500' },
  projCard: { borderRadius: 14, overflow: 'hidden' },
  projCover: { width: '100%', aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center' },
  coverBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  coverBadgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  projBody: { padding: 14, gap: 8 },
  projMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clientPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  clientPillText: { fontSize: 12, fontWeight: '500' },
  projTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3, lineHeight: 22 },
  projDesc: { fontSize: 14, lineHeight: 20 },
  resultsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  resultPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  resultValue: { fontSize: 12, fontWeight: '700' },
  resultLabel: { fontSize: 12 },
  samplesRow: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  sampleThumb: { flex: 1, aspectRatio: 4 / 3, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
