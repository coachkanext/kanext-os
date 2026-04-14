/**
 * Portfolio — Projects (default screen).
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, useColorScheme, Image } from 'react-native';
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
import { PORTFOLIO_PROJECTS, type PortfolioProject, type ProjectType } from '@/data/mock-portfolio';

const TOP_BAR_H = 52;
const PILLS_H   = 48;

type FilterType = 'All' | ProjectType;
const FILTER_PILLS: FilterType[] = ['All', 'Sponsored', 'Self-produced', 'Collaboration', 'Article', 'Speaking'];

// ── Design tokens (light / dark) ──────────────────────────────────────────────
const ACCENT_L = '#2563EB';
const ACCENT_D = '#5B9FFF';
const SURF2_L  = '#E8EAF0';
const SURF2_D  = '#252830';
const TSEC_L   = '#6B7085';
const TSEC_D   = '#8A94A8';

// ── Cover helpers ─────────────────────────────────────────────────────────────

/** Short brand mark to display on the cover tile. */
function brandMark(client: string): string {
  if (client === 'Self-produced') return 'SK';
  const words = client.split(' ');
  return words.length === 1
    ? client.slice(0, 2).toUpperCase()
    : words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/** Rich cover palette derived from a hue. */
function cover(hue: number) {
  return {
    bg:      `hsl(${hue}, 60%, 16%)`,
    mid:     `hsl(${hue}, 55%, 26%)`,
    markBg:  `hsla(${hue}, 30%, 80%, 0.10)`,
    markTxt: `hsla(${hue}, 15%, 94%, 0.80)`,
    sampleBg:`hsl(${hue}, 50%, 22%)`,
    sampleTxt:`hsla(${hue}, 15%, 90%, 0.70)`,
  };
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProjectsScreen() {
  const C      = useColors();
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [expandedProj, setExpandedProj] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const ACCENT = dark ? ACCENT_D : ACCENT_L;
  const SURF2  = dark ? SURF2_D  : SURF2_L;
  const TSEC   = dark ? TSEC_D   : TSEC_L;

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return PORTFOLIO_PROJECTS;
    return PORTFOLIO_PROJECTS.filter(p => p.type === activeFilter);
  }, [activeFilter]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Top bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
            style={s.kBtn}
          >
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

      {/* ── List ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Filter pills ── */}
        <View style={[s.pillsRow, { borderBottomColor: C.separator, marginHorizontal: -16, marginBottom: 8 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsScroll}
          >
            {FILTER_PILLS.map(f => {
              const active = activeFilter === f;
              return (
                <Pressable
                  key={f}
                  style={[
                    s.pill,
                    active
                      ? { backgroundColor: C.activePill, borderColor: C.activePill }
                      : { backgroundColor: C.surface, borderColor: C.separator },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); setExpandedProj(null); }}
                >
                  <Text style={[s.pillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Section header */}
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionLabel, { color: TSEC }]}>
            {activeFilter === 'All' ? 'ALL PROJECTS' : activeFilter.toUpperCase()}
          </Text>
          {isOwner && (
            <Pressable
              style={s.addBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="plus" size={13} color={ACCENT} />
              <Text style={[s.addBtnText, { color: ACCENT }]}>Add</Text>
            </Pressable>
          )}
        </View>

        {filteredProjects.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 56, gap: 10 }}>
            <IconSymbol name="tray" size={36} color={C.secondary} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>No {activeFilter} projects</Text>
          </View>
        ) : (
          filteredProjects.map(proj => (
            <ProjectCard
              key={proj.id}
              proj={proj}
              expanded={expandedProj === proj.id}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedProj(p => p === proj.id ? null : proj.id);
              }}
              C={C}
              s={s}
              ACCENT={ACCENT}
              SURF2={SURF2}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({
  proj, expanded, onToggle, C, s, ACCENT, SURF2,
}: {
  proj: PortfolioProject;
  expanded: boolean;
  onToggle: () => void;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  ACCENT: string;
  SURF2: string;
}) {
  const cv      = cover(proj.coverHue);
  const mark    = brandMark(proj.client);

  return (
    <GlassView tier={1} style={[s.projCard, { marginBottom: 16 }]}>

      {/* ── Cover ── */}
      <View style={[s.projCover, { backgroundColor: cv.bg }]}>
        {proj.coverUri ? (
          <>
            <Image source={{ uri: proj.coverUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            {/* Subtle dark overlay so badges stay readable */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.28)' }]} />
          </>
        ) : (
          <>
            {/* Mid-tone overlay for depth */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cv.mid, opacity: 0.45 }]} />
            {/* Brand mark */}
            <View style={[s.brandMarkBg, { backgroundColor: cv.markBg }]}>
              <Text style={[s.brandMarkText, { color: cv.markTxt }]}>{mark}</Text>
            </View>
          </>
        )}

        {/* Type badge — frosted overlay on dark cover */}
        <View style={s.coverBadge}>
          <Text style={s.coverBadgeText}>{proj.type}</Text>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={s.projBody}>

        {/* Client pill + expand chevron */}
        <View style={s.projMeta}>
          <View style={[s.clientPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.clientPillText, { color: C.label }]}>{proj.client}</Text>
          </View>
          <Pressable onPress={onToggle} hitSlop={12}>
            <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
          </Pressable>
        </View>

        <Text style={[s.projTitle, { color: C.label }]}>{proj.title}</Text>
        <Text style={[s.projDesc, { color: C.secondary }]} numberOfLines={expanded ? undefined : 3}>
          {proj.description}
        </Text>

        {/* Metric pills */}
        <View style={s.resultsRow}>
          {proj.results.map(r => (
            <View key={r.label} style={[s.resultPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.resultValue, { color: ACCENT }]}>{r.value}</Text>
              <Text style={[s.resultLabel, { color: C.secondary }]}> {r.label}</Text>
            </View>
          ))}
        </View>

        {/* Expanded samples */}
        {expanded && proj.samples.length > 0 && (
          <>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginTop: 4 }} />
            <View style={s.samplesRow}>
              {proj.samples.map(sample => {
                const sc = cover(sample.thumbHue);
                return (
                  <Pressable
                    key={sample.id}
                    style={[s.sampleThumb, { backgroundColor: sc.sampleBg }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <IconSymbol
                      name={sample.type === 'reel' ? 'play.circle.fill' : sample.type === 'video' ? 'video.fill' : 'photo.fill'}
                      size={22}
                      color={sc.sampleTxt}
                    />
                    <Text style={[s.sampleLabel, { color: sc.sampleTxt }]}>
                      {sample.type === 'reel' ? 'Reel' : sample.type === 'video' ? 'Video' : 'Post'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </View>
    </GlassView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:         { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText:{ fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

  // Filter pills
  pillsRow: {
    height: PILLS_H, borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  pillsScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  pill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },

  // Section header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
  addBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText:       { fontSize: 13, fontWeight: '500' },

  // Card
  projCard:  { borderRadius: 14, overflow: 'hidden' },

  // Cover
  projCover:     { width: '100%', aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center' },
  brandMarkBg:   { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  coverBadge:    {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  coverBadgeText:{ fontSize: 11, fontWeight: '600', letterSpacing: 0.2, color: 'rgba(255,255,255,0.90)' },

  // Body
  projBody:   { padding: 14, gap: 8 },
  projMeta:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clientPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  clientPillText: { fontSize: 12, fontWeight: '500' },
  projTitle:  { fontSize: 16, fontWeight: '700', letterSpacing: -0.3, lineHeight: 22 },
  projDesc:   { fontSize: 14, lineHeight: 20 },

  // Metric pills
  resultsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  resultPill:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  resultValue: { fontSize: 12, fontWeight: '700' },
  resultLabel: { fontSize: 12 },

  // Samples
  samplesRow:  { flexDirection: 'row', gap: 8, paddingTop: 4 },
  sampleThumb: { flex: 1, aspectRatio: 4 / 3, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 4 },
  sampleLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
});
