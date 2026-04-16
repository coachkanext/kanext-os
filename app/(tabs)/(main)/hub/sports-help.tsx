/**
 * Sports Hub — Help. Sports-specific FAQ and support.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;

type FaqRow     = { icon: string; title: string; keywords: string };
type FaqSection = { header: string; rows: FaqRow[] };

const COACH_FAQ_SECTIONS: FaqSection[] = [
  {
    header: 'GETTING STARTED',
    rows: [
      { icon: 'trophy.fill',          title: 'Setting up your Program Profile',  keywords: 'setup profile program brand'         },
      { icon: 'person.badge.plus',    title: 'Adding your roster',               keywords: 'roster add player import'            },
      { icon: 'film.fill',            title: 'Importing film to Film Room',       keywords: 'film upload import hudl'             },
      { icon: 'figure.run',           title: 'Connecting to recruiting pipeline', keywords: 'recruiting pipeline pool prospects'  },
    ],
  },
  {
    header: 'GAME DAY',
    rows: [
      { icon: 'gamecontroller.fill',        title: 'Using KStat for live scoring',    keywords: 'kstat live score stats entry game'  },
      { icon: 'chart.bar.doc.horizontal',   title: 'Generating halftime packets',     keywords: 'halftime packet report dipson'      },
      { icon: 'doc.text.fill',              title: 'Publishing media game reports',   keywords: 'media report publish social'        },
    ],
  },
  {
    header: 'FILM ROOM',
    rows: [
      { icon: 'film.stack.fill',        title: 'Tagging possessions',          keywords: 'tag possession film label'          },
      { icon: 'scribble.variable',      title: 'Using telestration tools',     keywords: 'draw arrows highlight annotate'     },
      { icon: 'person.fill.checkmark',  title: 'Sharing film with players',    keywords: 'share playlist assign player'       },
    ],
  },
  {
    header: 'SCOUTING',
    rows: [
      { icon: 'doc.text.magnifyingglass', title: 'Running a scouting report',   keywords: 'scout opponent report dipson'      },
      { icon: 'person.3.fill',            title: 'Reading the matchup matrix',  keywords: 'matchup matrix advantage comparison'},
    ],
  },
];

const PLAYER_FAQ_SECTIONS: FaqSection[] = [
  {
    header: 'GETTING STARTED',
    rows: [
      { icon: 'person.crop.rectangle',     title: 'Setting up your player profile', keywords: 'setup profile photo'              },
      { icon: 'film.fill',                 title: 'Viewing coach-assigned film',    keywords: 'film watch assigned playlist'     },
      { icon: 'chart.line.uptrend.xyaxis', title: 'Understanding your KR',          keywords: 'kr rating klvn score archetype'   },
      { icon: 'graduationcap.fill',        title: 'Checking eligibility status',    keywords: 'eligibility academic gpa'         },
    ],
  },
  {
    header: 'MY DEVELOPMENT',
    rows: [
      { icon: 'target',         title: 'Understanding your development goals', keywords: 'goals progress target coach'       },
      { icon: 'chart.bar.fill', title: 'Reading your KR components',          keywords: 'okr dkr tkr iqkr component'        },
    ],
  },
  {
    header: 'MY FILM',
    rows: [
      { icon: 'star.fill',  title: 'Building your highlight reel',   keywords: 'highlights reel recruiting export' },
      { icon: 'note.text',  title: 'Adding personal film notes',     keywords: 'notes private film clip'           },
    ],
  },
];

type AllFaqRow = FaqRow & { sectionHeader: string };

const COACH_ALL_ROWS: AllFaqRow[] = COACH_FAQ_SECTIONS.flatMap(sec =>
  sec.rows.map(row => ({ ...row, sectionHeader: sec.header }))
);

const PLAYER_ALL_ROWS: AllFaqRow[] = PLAYER_FAQ_SECTIONS.flatMap(sec =>
  sec.rows.map(row => ({ ...row, sectionHeader: sec.header }))
);

const GET_HELP_ITEMS = [
  { icon: 'message.fill',   label: 'Contact Support',  sub: 'Chat with the KaNeXT team' },
  { icon: 'ant.fill',       label: 'Report a Bug',     sub: 'Something not working?'    },
  { icon: 'lightbulb.fill', label: 'Feature Request',  sub: 'Suggest an improvement'    },
  { icon: 'person.3.fill',  label: 'Community Forum',  sub: 'Ask other KaNeXT users'    },
];

function FaqRowItem({ row, C, s }: { row: FaqRow; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable
      style={({ pressed }) => [s.faqRow, pressed && { opacity: 0.7 }]}
      onPress={() => { Haptics.selectionAsync(); Alert.alert(row.title, 'Full article coming soon.'); }}
    >
      <IconSymbol name={row.icon as any} size={20} color={C.label} />
      <Text style={[s.faqRowTitle, { color: C.label }]}>{row.title}</Text>
      <IconSymbol name="chevron.right" size={13} color={C.secondary} />
    </Pressable>
  );
}

export default function SportsHelpScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];
  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const faqSections  = isCoach ? COACH_FAQ_SECTIONS  : PLAYER_FAQ_SECTIONS;
  const allRows      = isCoach ? COACH_ALL_ROWS       : PLAYER_ALL_ROWS;

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return allRows.filter(r => r.title.toLowerCase().includes(q) || r.keywords.toLowerCase().includes(q));
  }, [query, allRows]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
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
              <Text style={[s.titlePillText, { color: C.label }]}>Help</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search bar */}
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search for help..."
            placeholderTextColor={C.secondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Search results or full FAQ */}
        {searchResults !== null ? (
          <View style={[s.sectionCard, { backgroundColor: C.surface, marginBottom: 24 }]}>
            {searchResults.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={[s.emptyText, { color: C.secondary }]}>No results found</Text>
              </View>
            ) : searchResults.map((row, idx) => (
              <View key={row.title}>
                {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                <FaqRowItem row={row} C={C} s={s} />
              </View>
            ))}
          </View>
        ) : (
          <>
            {faqSections.map(section => (
              <View key={section.header} style={{ marginBottom: 24 }}>
                <Text style={[s.sectionHeader, { color: C.secondary }]}>{section.header}</Text>
                <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
                  {section.rows.map((row, idx) => (
                    <View key={row.title}>
                      {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                      <FaqRowItem row={row} C={C} s={s} />
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Get help actions */}
            <Text style={[s.sectionHeader, { color: C.secondary }]}>GET HELP</Text>
            <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
              {GET_HELP_ITEMS.map((item, idx) => (
                <View key={item.label}>
                  {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                  <Pressable
                    style={({ pressed }) => [s.actionRow, pressed && { opacity: 0.7 }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(item.label, item.sub); }}
                  >
                    <IconSymbol name={item.icon as any} size={20} color={C.label} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.actionLabel, { color: C.label }]}>{item.label}</Text>
                      <Text style={[s.actionSub, { color: C.secondary }]}>{item.sub}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={13} color={C.secondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end' },
  searchBar:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  searchInput:   { flex: 1, fontSize: 15, padding: 0 },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, marginBottom: 8 },
  sectionCard:   { borderRadius: 14, paddingHorizontal: 16 },
  faqRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  faqRowTitle:   { flex: 1, fontSize: 15, fontWeight: '500' },
  actionRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  actionLabel:   { fontSize: 15, fontWeight: '500' },
  actionSub:     { fontSize: 12, marginTop: 1 },
  rowSep:        { height: StyleSheet.hairlineWidth },
  emptyText:     { fontSize: 14 },
});
