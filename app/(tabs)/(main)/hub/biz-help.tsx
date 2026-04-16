/**
 * Business Hub — Help. Business-specific FAQ and support.
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

const FAQ_SECTIONS: FaqSection[] = [
  {
    header: 'GETTING STARTED',
    rows: [
      { icon: 'building.2.fill',      title: 'Setting up your Business Profile', keywords: 'setup profile company brand'            },
      { icon: 'person.badge.plus',    title: 'Inviting team members',            keywords: 'team invite members add employee'       },
      { icon: 'folder.badge.plus',    title: 'Creating your first project',      keywords: 'project create new start'               },
      { icon: 'person.2.fill',        title: 'Adding your first client',         keywords: 'client add contact relationship'        },
    ],
  },
  {
    header: 'PROJECTS',
    rows: [
      { icon: 'chart.bar.doc.horizontal', title: 'Tracking project progress',    keywords: 'project progress milestone status'      },
      { icon: 'person.fill.checkmark',    title: 'Assigning tasks to team',      keywords: 'assign task team member todo'           },
      { icon: 'folder.fill',              title: 'Linking documents to projects', keywords: 'document file attach project link'     },
      { icon: 'checkmark.seal.fill',      title: 'Client deliverable approvals', keywords: 'approve deliverable client review'      },
    ],
  },
  {
    header: 'CLIENTS',
    rows: [
      { icon: 'person.crop.rectangle',  title: 'Managing client access',         keywords: 'client access portal login permission'  },
      { icon: 'doc.text.fill',          title: 'Sending invoices',               keywords: 'invoice send bill payment client'       },
      { icon: 'creditcard.fill',        title: 'Accepting payments via KPay',    keywords: 'payment kpay kaypay accept stripe'      },
    ],
  },
  {
    header: 'REPORTS',
    rows: [
      { icon: 'chart.line.uptrend.xyaxis', title: 'Reading your revenue report', keywords: 'revenue report chart analytics'         },
      { icon: 'arrow.up.doc.fill',         title: 'Exporting data (CSV / PDF)',  keywords: 'export csv pdf download data'           },
      { icon: 'person.3.sequence.fill',    title: 'Team utilization explained',  keywords: 'utilization team capacity workload'     },
    ],
  },
];

const ALL_ROWS = FAQ_SECTIONS.flatMap(sec => sec.rows.map(row => ({ ...row, sectionHeader: sec.header })));

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

export default function BizHelpScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];
  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return ALL_ROWS.filter(r => r.title.toLowerCase().includes(q) || r.keywords.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Help</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
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
        {/* Search */}
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

        {/* Search results */}
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
            {FAQ_SECTIONS.map(section => (
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
              {[
                { icon: 'message.fill',          label: 'Contact Support',    sub: 'Chat with the KaNeXT team' },
                { icon: 'ant.fill',              label: 'Report a Bug',       sub: 'Something not working?' },
                { icon: 'lightbulb.fill',        label: 'Feature Request',    sub: 'Suggest an improvement' },
                { icon: 'person.3.fill',         label: 'Community Forum',    sub: 'Ask other KaNeXT users' },
              ].map((item, idx) => (
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
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, marginBottom: 8 },
  sectionCard: { borderRadius: 14, paddingHorizontal: 16 },
  faqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  faqRowTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  actionLabel: { fontSize: 15, fontWeight: '500' },
  actionSub: { fontSize: 12, marginTop: 1 },
  rowSep: { height: StyleSheet.hairlineWidth },
  emptyText: { fontSize: 14 },
});
