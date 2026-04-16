/**
 * Business Hub — Documents screen. CEO only.
 * Company file storage: Contracts, Proposals, Decks, Brand Assets, Templates.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

type DocType = 'Contract' | 'Proposal' | 'Deck' | 'Template' | 'Asset';
type BizDoc = { id: string; name: string; type: DocType; modified: string; owner: string; project?: string; size: string };

const DOCS: BizDoc[] = [
  { id: '1',  name: 'Nike Partnership Agreement',       type: 'Contract',  modified: 'Apr 10, 2026', owner: 'JD', project: 'Nike Partnership Deck',    size: '2.4 MB' },
  { id: '2',  name: 'KaNeXT OS v2.0 Proposal',          type: 'Proposal',  modified: 'Apr 8, 2026',  owner: 'AR', project: 'KaNeXT OS v2.0 Launch',     size: '1.1 MB' },
  { id: '3',  name: 'Investor Pitch Deck Q2 2026',       type: 'Deck',      modified: 'Apr 5, 2026',  owner: 'JD',                                       size: '8.7 MB' },
  { id: '4',  name: 'Brand Guidelines 2026',             type: 'Asset',     modified: 'Mar 28, 2026', owner: 'LM',                                       size: '14.2 MB' },
  { id: '5',  name: 'Gatorade Brand Refresh Brief',      type: 'Proposal',  modified: 'Mar 20, 2026', owner: 'AR', project: 'Brand Identity Refresh',    size: '0.8 MB' },
  { id: '6',  name: 'Standard SaaS Agreement',           type: 'Template',  modified: 'Mar 15, 2026', owner: 'MK',                                       size: '0.3 MB' },
  { id: '7',  name: 'Forbes Q1 Analytics Deliverable',   type: 'Deck',      modified: 'Mar 31, 2026', owner: 'MK', project: 'Q1 Analytics Report',       size: '5.2 MB' },
  { id: '8',  name: 'NDA Template',                      type: 'Template',  modified: 'Feb 1, 2026',  owner: 'JD',                                       size: '0.1 MB' },
];

const FILTERS: (DocType | 'All')[] = ['All', 'Contract', 'Proposal', 'Deck', 'Template', 'Asset'];

const TYPE_ICONS: Record<DocType, string> = {
  Contract: 'signature',
  Proposal: 'doc.text.fill',
  Deck:     'rectangle.stack.fill',
  Template: 'doc.on.doc.fill',
  Asset:    'photo.fill',
};

export default function BizDocumentsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/hub/business' as any);
  }, [isCEO]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState<DocType | 'All'>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let items = DOCS;
    if (filter !== 'All') items = items.filter(d => d.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(d => d.name.toLowerCase().includes(q));
    }
    return items;
  }, [query, filter]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Documents</Text>
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
        {/* Search + Upload row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={[s.searchBar, { flex: 1, backgroundColor: C.surface, borderColor: C.separator }]}>
            <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
            <TextInput
              style={[s.searchInput, { color: C.label }]}
              placeholder="Search documents..."
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
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[s.uploadBtn, { backgroundColor: C.label }]}
          >
            <IconSymbol name="arrow.up.doc.fill" size={15} color={C.bg} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>Upload</Text>
          </Pressable>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 7 }}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                style={[s.filterPill, active
                  ? { backgroundColor: C.activePill, borderColor: C.activePill }
                  : { backgroundColor: C.surface, borderColor: C.separator }
                ]}
                onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              >
                <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Count */}
        <Text style={[s.countLabel, { color: C.secondary }]}>{filtered.length} {filtered.length === 1 ? 'document' : 'documents'}</Text>

        {/* Document cards */}
        {filtered.map(doc => (
          <Pressable
            key={doc.id}
            style={({ pressed }) => [s.docCard, { backgroundColor: C.surface, opacity: pressed ? 0.75 : 1 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.docIcon, { backgroundColor: C.separator }]}>
              <IconSymbol name={TYPE_ICONS[doc.type] as any} size={18} color={C.label} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.docName, { color: C.label }]} numberOfLines={1}>{doc.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <View style={[s.typeBadge, { backgroundColor: C.separator }]}>
                  <Text style={[s.typeBadgeText, { color: C.secondary }]}>{doc.type}</Text>
                </View>
                {doc.project && (
                  <Text style={[s.docMeta, { color: C.secondary }]} numberOfLines={1}>{doc.project}</Text>
                )}
              </View>
              <Text style={[s.docSubMeta, { color: C.secondary }]}>Modified {doc.modified} · {doc.owner} · {doc.size}</Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Text style={[s.emptyText, { color: C.secondary }]}>No documents found</Text>
          </View>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  filterPill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  countLabel: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 8 },
  docIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docName: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 12, flex: 1 },
  docSubMeta: { fontSize: 11, marginTop: 3 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
