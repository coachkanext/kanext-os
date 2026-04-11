import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';

// ---------------------------------------------------------------------------
// Types & tabs (player-facing: no Film, no Medical, no coach notes)
// ---------------------------------------------------------------------------
type TabId = 'hero' | 'kr' | 'archetype' | 'stats' | 'development' | 'academic';

const TABS: { id: TabId; label: string }[] = [
  { id: 'hero',        label: 'Hero'        },
  { id: 'kr',          label: 'KR'          },
  { id: 'archetype',   label: 'Archetype'   },
  { id: 'stats',       label: 'Stats'       },
  { id: 'development', label: 'Development' },
  { id: 'academic',    label: 'Academic'    },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const PLAYER = {
  name: 'Jordan Hayes',
  initials: 'JH',
  number: 4,
  hue: '#6B8C7A',
  position: 'SF',
  classYear: 'Jr',
  heightFt: "6'7\"",
  weight: 210,
  hometown: 'Memphis, TN',
  isScholarship: true,
  isRedshirt: false,
  kr: { overall: 79, offensive: 81, defensive: 77, confidence: 74, trend: 'up' as const, delta: 2 },
  archetype: 'Two-Way Wing',
  gpa: 3.1,
  credits: 72,
  eligibility: { yearsUsed: 2, yearsRemaining: 2 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function krColor(score: number, C: ComponentColors): string {
  if (score >= 80) return '#B8943E';
  if (score >= 75) return '#5A8A6E';
  if (score >= 65) return C.secondary;
  return '#B85C5C';
}

function InfoCell({ label, value, C }: { label: string; value: string; C: ComponentColors }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
      <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{value}</Text>
    </View>
  );
}

function InfoDivider({ C }: { C: ComponentColors }) {
  return <View style={{ width: 1, height: 32, backgroundColor: C.separator, alignSelf: 'center' }} />;
}

function DetailRow({ label, value, C, last }: { label: string; value: string; C: ComponentColors; last?: boolean }) {
  return (
    <View style={[
      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
      !last && { borderBottomWidth: 1, borderBottomColor: C.separator },
    ]}>
      <Text style={{ fontSize: 13, color: C.secondary }}>{label}</Text>
      <Text style={{ fontSize: 13, color: C.label, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab components
// ---------------------------------------------------------------------------
function HeroTab({ C, s }: { C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const tierColor = krColor(PLAYER.kr.overall, C);
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[s.heroCard, { backgroundColor: C.label }]}>
        <View style={[s.initialsCircle, { backgroundColor: PLAYER.hue }]}>
          <Text style={[s.initialsText, { color: C.bg }]}>{PLAYER.initials}</Text>
        </View>
        <Text style={[s.heroName, { color: C.bg }]}>
          {PLAYER.name}{'  '}
          <Text style={[s.heroNumber, { color: C.bg }]}>#{PLAYER.number}</Text>
        </Text>
        <Text style={[s.heroMeta, { color: C.bg, opacity: 0.7 }]}>
          {PLAYER.position} · {PLAYER.classYear} · {PLAYER.hometown}
        </Text>
        <View style={[s.krBadgeLarge, { borderColor: tierColor }]}>
          <Text style={[s.krBadgeScore, { color: tierColor }]}>{PLAYER.kr.overall}</Text>
          <Text style={[s.krBadgeLabel, { color: tierColor }]}>KR</Text>
        </View>
      </View>
      <View style={[s.infoRow, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <InfoCell label="Height" value={PLAYER.heightFt} C={C} />
        <InfoDivider C={C} />
        <InfoCell label="Weight" value={`${PLAYER.weight} lbs`} C={C} />
        <InfoDivider C={C} />
        <InfoCell label="Scholarship" value={PLAYER.isScholarship ? 'Yes' : 'No'} C={C} />
        <InfoDivider C={C} />
        <InfoCell label="Redshirt" value={PLAYER.isRedshirt ? 'Yes' : 'No'} C={C} />
      </View>
    </ScrollView>
  );
}

function KRTab({ C, s }: { C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const kr = PLAYER.kr;
  const components = [
    { label: 'Offensive',  value: kr.offensive  },
    { label: 'Defensive',  value: kr.defensive  },
    { label: 'Confidence', value: kr.confidence },
    { label: 'Overall',    value: kr.overall    },
  ];
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator, alignItems: 'center', paddingVertical: 24 }]}>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 4 }}>Your KR Score</Text>
        <Text style={{ fontSize: 64, fontWeight: '800', color: krColor(kr.overall, C) }}>{kr.overall}</Text>
        <View style={[s.chip, { backgroundColor: krColor(kr.overall, C) + '22', borderColor: krColor(kr.overall, C) }]}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: krColor(kr.overall, C) }}>Green Tier · 75–79</Text>
        </View>
        <Text style={{ fontSize: 13, color: '#5A8A6E', marginTop: 8 }}>↑ +{kr.delta} last week</Text>
      </View>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        {components.map((comp, i) => {
          const color = krColor(comp.value, C);
          return (
            <View key={comp.label} style={[s.barRow, i < components.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.separator }]}>
              <Text style={[s.barLabel, { color: C.secondary }]}>{comp.label}</Text>
              <View style={[s.barTrack, { backgroundColor: C.separator }]}>
                <View style={[s.barFill, { width: `${comp.value}%` as any, backgroundColor: color }]} />
              </View>
              <Text style={[s.barValue, { color }]}>{comp.value}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ArchetypeTab({ C, s }: { C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const fits = [
    { label: 'Offensive System Fit', pct: 84 },
    { label: 'Defensive System Fit', pct: 91 },
  ];
  const skills = ['Perimeter Defense', 'Mid-Range', 'Ball Handling', 'Transition'];
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator, alignItems: 'center', paddingVertical: 24 }]}>
        <View style={[s.archetypeBadge, { backgroundColor: C.label }]}>
          <IconSymbol name="star.fill" size={28} color={C.bg} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: C.label, marginTop: 12 }}>{PLAYER.archetype}</Text>
        <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 16 }}>
          Balanced scorer and defender with versatile skill set
        </Text>
      </View>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>System Fit</Text>
        {fits.map((f, i) => (
          <View key={f.label} style={[s.barRow, i < fits.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.separator }]}>
            <Text style={[s.barLabel, { color: C.label, flex: 1.8 }]}>{f.label}</Text>
            <View style={[s.barTrack, { backgroundColor: C.separator }]}>
              <View style={[s.barFill, { width: `${f.pct}%` as any, backgroundColor: '#5A8A6E' }]} />
            </View>
            <Text style={[s.barValue, { color: '#5A8A6E' }]}>{f.pct}%</Text>
          </View>
        ))}
      </View>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>Primary Skills</Text>
        <View style={s.chipRow}>
          {skills.map(skill => (
            <View key={skill} style={[s.chip, { backgroundColor: C.label + '18', borderColor: C.separator }]}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.label }}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function StatsTab({ C, s }: { C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const seasonStats = [
    { label: 'PPG', value: '14.2' }, { label: 'RPG', value: '6.8' },
    { label: 'APG', value: '2.1'  }, { label: 'SPG', value: '1.4' },
    { label: 'BPG', value: '0.6'  }, { label: 'FG%', value: '47.3'},
    { label: '3P%', value: '38.1' }, { label: 'FT%', value: '82.0'},
  ];
  const last5 = [
    { date: 'Apr 2',  opp: 'Duke',      pts: 18, reb: 7, ast: 3 },
    { date: 'Mar 28', opp: 'UNC',       pts: 12, reb: 5, ast: 2 },
    { date: 'Mar 25', opp: 'Kentucky',  pts: 21, reb: 9, ast: 1 },
    { date: 'Mar 21', opp: 'Villanova', pts: 9,  reb: 6, ast: 4 },
    { date: 'Mar 18', opp: 'Gonzaga',   pts: 15, reb: 8, ast: 2 },
  ];
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>Season Averages</Text>
        <View style={s.statsGrid}>
          {seasonStats.map(stat => (
            <View key={stat.label} style={[s.statCell, { borderColor: C.separator }]}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>Last 5 Games</Text>
        <View style={[s.tableHeader, { borderBottomColor: C.separator }]}>
          {['Date', 'Opp', 'PTS', 'REB', 'AST'].map(h => (
            <Text key={h} style={[s.tableHeaderCell, { color: C.secondary }]}>{h}</Text>
          ))}
        </View>
        {last5.map((row, i) => (
          <View key={i} style={[s.tableRow, { borderBottomColor: C.separator }, i === last5.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={[s.tableCell, { color: C.secondary, flex: 1.2 }]}>{row.date}</Text>
            <Text style={[s.tableCell, { color: C.label, flex: 1.5 }]}>{row.opp}</Text>
            <Text style={[s.tableCell, { color: C.label }]}>{row.pts}</Text>
            <Text style={[s.tableCell, { color: C.label }]}>{row.reb}</Text>
            <Text style={[s.tableCell, { color: C.label }]}>{row.ast}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DevelopmentTab({ C, s }: { C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const goals = [
    { goal: 'Improve 3P% from 38% → 42%',        progress: 0.65 },
    { goal: 'Increase assists to 3.0+ APG',        progress: 0.40 },
    { goal: 'Reduce turnovers below 1.5 per game', progress: 0.75 },
  ];
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>Current Focus Areas</Text>
        {goals.map((goal, i) => (
          <View key={i} style={[{ paddingVertical: 12 }, i < goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.separator }]}>
            <Text style={{ fontSize: 13, color: C.label, marginBottom: 8 }}>{goal.goal}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[s.barTrack, { flex: 1, backgroundColor: C.separator }]}>
                <View style={[s.barFill, { width: `${goal.progress * 100}%` as any, backgroundColor: '#5A8A6E' }]} />
              </View>
              <Text style={{ fontSize: 12, color: '#5A8A6E', fontWeight: '600', width: 34, textAlign: 'right' }}>
                {Math.round(goal.progress * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable
        style={[s.requestButton, { backgroundColor: C.label }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="arrow.up.message.fill" size={16} color={C.bg} />
        <Text style={[s.requestButtonText, { color: C.bg }]}>Request Development Review</Text>
      </Pressable>
    </ScrollView>
  );
}

function AcademicTab({ C, s }: { C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const gpaColor = PLAYER.gpa >= 3.5 ? '#5A8A6E' : PLAYER.gpa >= 2.0 ? '#B8943E' : '#B85C5C';
  return (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>Academic Standing</Text>
        <View style={s.academicRow}>
          <View style={s.academicCell}>
            <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>GPA</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: gpaColor }}>{PLAYER.gpa.toFixed(1)}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: C.separator, marginHorizontal: 16 }} />
          <View style={s.academicCell}>
            <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>Credits</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: C.label }}>{PLAYER.credits}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>of 120</Text>
          </View>
        </View>
        <View style={[s.barTrack, { backgroundColor: C.separator, marginTop: 16 }]}>
          <View style={[s.barFill, { width: `${(PLAYER.credits / 120) * 100}%` as any, backgroundColor: '#5A8A6E' }]} />
        </View>
        <View style={[s.chip, { backgroundColor: '#5A8A6E22', borderColor: '#5A8A6E55', alignSelf: 'flex-start', marginTop: 12 }]}>
          <Text style={{ fontSize: 12, color: '#5A8A6E', fontWeight: '600' }}>On track to graduate</Text>
        </View>
      </View>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
        <Text style={[s.cardSectionTitle, { color: C.secondary }]}>Details</Text>
        <DetailRow label="Major" value="Business Administration" C={C} />
        <DetailRow label="Eligibility Used" value={`${PLAYER.eligibility.yearsUsed} years`} C={C} />
        <DetailRow label="Eligibility Remaining" value={`${PLAYER.eligibility.yearsRemaining} years`} C={C} last />
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function MyProfileScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const s = useMemo(() => makeStyles(C), [C]);
  const scrollFooter = useScrollFooter();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  function handleTabPress(id: TabId) {
    Haptics.selectionAsync();
    setActiveTab(id);
  }

  function renderTab() {
    switch (activeTab) {
      case 'hero':        return <HeroTab C={C} s={s} />;
      case 'kr':          return <KRTab C={C} s={s} />;
      case 'archetype':   return <ArchetypeTab C={C} s={s} />;
      case 'stats':       return <StatsTab C={C} s={s} />;
      case 'development': return <DevelopmentTab C={C} s={s} />;
      case 'academic':    return <AcademicTab C={C} s={s} />;
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top, backgroundColor: C.bg }]}>
      <View style={[s.topBar, { borderBottomColor: C.separator }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={s.topBarSide}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.titlePillText, { color: C.label }]} numberOfLines={1}>{PLAYER.name}</Text>
        </View>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          hitSlop={8}
          style={[s.topBarSide, { alignItems: 'flex-end' }]}
        >
          <IconSymbol name="square.and.arrow.up" size={20} color={C.label} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.tabBar, { borderBottomColor: C.separator }]}
        contentContainerStyle={s.tabBarContent}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              style={[s.tabPill, active ? { backgroundColor: C.activePill } : { backgroundColor: 'transparent' }]}
            >
              <Text style={[s.tabPillText, { color: active ? C.activePillText : C.secondary }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={s.tabBody}>{renderTab()}</View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBarSide: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, marginHorizontal: 8 },
    titlePillText: { fontSize: 15, fontWeight: '600' },
    tabBar: { maxHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth },
    tabBarContent: { paddingHorizontal: 12, alignItems: 'center', gap: 6, paddingVertical: 8 },
    tabPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16 },
    tabPillText: { fontSize: 13, fontWeight: '500' },
    tabBody: { flex: 1 },
    tabContent: { padding: 16, paddingBottom: 32, gap: 12 },
    heroCard: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 6 },
    initialsCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    initialsText: { fontSize: 28, fontWeight: '800' },
    heroName: { fontSize: 22, fontWeight: '700' },
    heroNumber: { fontSize: 18, fontWeight: '500' },
    heroMeta: { fontSize: 13 },
    krBadgeLarge: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    krBadgeScore: { fontSize: 26, fontWeight: '800', lineHeight: 28 },
    krBadgeLabel: { fontSize: 11, fontWeight: '600' },
    infoRow: { flexDirection: 'row', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
    cardSectionTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
    barRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
    barLabel: { fontSize: 13, width: 80 },
    barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },
    barValue: { fontSize: 13, fontWeight: '600', width: 28, textAlign: 'right' },
    chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    archetypeBadge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    statCell: { width: '25%', alignItems: 'center', paddingVertical: 12, borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
    tableHeader: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 8, marginBottom: 4 },
    tableHeaderCell: { flex: 1, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
    tableCell: { flex: 1, fontSize: 13 },
    requestButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 4 },
    requestButtonText: { fontSize: 15, fontWeight: '600' },
    academicRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    academicCell: { flex: 1, alignItems: 'center' },
  });
}
