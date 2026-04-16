/**
 * Portfolio — Archive screen.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { PORTFOLIO_ARCHIVE, type PortfolioArchiveItem, type ArchiveType } from '@/data/mock-portfolio';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

const FILTERS: (ArchiveType | 'All')[] = ['All', 'Article', 'Newsletter', 'Essay'];

const BADGE_COLORS: Record<string, string> = {
  Article: GAIN,
  Newsletter: CAUTION,
  Essay: HEAT,
};

export default function ArchiveScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C), [C]);
  const router  = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];

  useEffect(() => {
    router.replace('/(tabs)/(main)/portfolio' as any);
  }, [isOwner]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ArchiveType | 'All'>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let items = PORTFOLIO_ARCHIVE;
    if (filter !== 'All') items = items.filter(a => a.type === filter);
    if (query.trim()) { const q = query.toLowerCase(); items = items.filter(a => a.title.toLowerCase().includes(q)); }
    return items;
  }, [query, filter]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Archive</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>WRITING ARCHIVE</Text>
          {isOwner && (
            <Pressable style={s.writeBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="square.and.pencil" size={13} color={C.secondary} />
              <Text style={[s.writeBtnText, { color: C.secondary }]}>Write</Text>
            </Pressable>
          )}
        </View>

        {/* Search */}
        <GlassView tier={2} style={s.searchBar}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search archive..."
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
        </GlassView>

        {/* Filter pills */}
        <View style={s.filterRow}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                style={[s.filterPill, active ? { backgroundColor: C.activePill, borderColor: C.activePill } : { backgroundColor: C.surface, borderColor: C.separator }]}
                onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              >
                <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>

        <GlassView tier={1} style={s.card}>
          {filtered.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={[s.emptyText, { color: C.secondary }]}>No results</Text>
            </View>
          ) : filtered.map((item, idx) => (
            <ArchiveRow key={item.id} item={item} isFirst={idx === 0} C={C} s={s} />
          ))}
        </GlassView>
      </ScrollView>
    </View>
  );
}

function ArchiveRow({ item, isFirst, C, s }: { item: PortfolioArchiveItem; isFirst: boolean; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const badgeColor = BADGE_COLORS[item.type] ?? C.secondary;
  return (
    <Pressable
      style={({ pressed }) => [
        s.archiveRow,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[s.archiveIcon, { backgroundColor: badgeColor + '18' }]}>
        <IconSymbol name={item.type === 'Article' ? 'doc.text.fill' : item.type === 'Newsletter' ? 'envelope.fill' : 'quote.bubble.fill'} size={15} color={badgeColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.archiveTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
        <View style={s.archiveMeta}>
          <Text style={[s.archiveMetaText, { color: C.secondary }]}>{item.date}</Text>
          <Text style={[s.archiveMetaText, { color: C.secondary }]}> · </Text>
          <Text style={[s.archiveMetaText, { color: C.secondary }]}>{item.readTime} read</Text>
          <Text style={[s.archiveMetaText, { color: C.secondary }]}> · </Text>
          <Text style={[s.archiveMetaText, { color: C.secondary }]}>{item.views} views</Text>
        </View>
      </View>
      <View style={[s.archiveBadge, { backgroundColor: badgeColor + '18', borderColor: badgeColor + '40' }]}>
        <Text style={[s.archiveBadgeText, { color: badgeColor }]}>{item.type}</Text>
      </View>
    </Pressable>
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
  writeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  writeBtnText: { fontSize: 13, fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 7, marginBottom: 12 },
  filterPill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  card: { borderRadius: 12, overflow: 'hidden' },
  archiveRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  archiveIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  archiveTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19, marginBottom: 4 },
  archiveMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  archiveMetaText: { fontSize: 12 },
  archiveBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, flexShrink: 0 },
  archiveBadgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  emptyRow: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
