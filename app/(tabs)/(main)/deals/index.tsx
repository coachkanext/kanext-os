/**
 * Personal Deals — Pipedrive-style creator CRM.
 * Owner view: Pipeline/Contacts/Insights tabs.
 * Subscriber view: Collaborate (rate card + service categories + submissions).
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, SectionList, Pressable, StyleSheet, Platform,
  ActionSheetIOS, Animated, PanResponder, TextInput,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useDemoRole } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  PERSONAL_DEALS, CRM_CONTACTS, CRM_STAGES, MONTHLY_REVENUE, INSIGHT_STATS,
  SOURCE_BREAKDOWN, PRIORITY_COLORS,
  type PersonalDeal, type CRMContact, type CRMStage, type Priority,
  getContactById, getDealsByStage, formatDealValue, formatDealValueFull,
  formatActivityType, formatRelativeDate, formatCloseDate, isClosingSoon,
} from '@/data/mock-personal-deals';

// ── Constants ─────────────────────────────────────────────────────────────────

type Tab = 'Pipeline' | 'Contacts' | 'Insights';
const TABS: Tab[] = ['Pipeline', 'Contacts', 'Insights'];
const TOP_BAR_H = 52;
const PILL_ROW_H = 48;
const SWIPE_W = 132;

const TAB_PILLS: Record<Tab, string[]> = {
  Pipeline: ['All', 'Hot', 'Warm', 'Cold', 'Closing Soon'],
  Contacts: [],   // filtering is internal to ContactsTab
  Insights: ['All Time', 'This Month', 'This Quarter'],
};

const CONTACTS_PILLS = ['All', 'Active Deals', 'Past Deals', 'New This Month', 'Highest Value'];

const CLOSING_SOON = PERSONAL_DEALS.filter(d => isClosingSoon(d) && d.stage !== 'Won' && d.stage !== 'Lost');
const OVERDUE_TASKS = PERSONAL_DEALS.flatMap(d =>
  d.tasks.filter(t => !t.completed && t.dueDate.getTime() < Date.now())
    .map(t => ({ task: t, deal: d }))
);

const STAGE_COLORS: Record<CRMStage, string> = {
  Lead:        'rgba(45,30,18,0.30)',
  Contacted:   '#1A1714',
  Proposal:    '#5A8A6E',
  Negotiation: '#1A1714',
  Won:         '#5A8A6E',
  Lost:        '#B85C5C',
};

type PipelineSection = {
  stage: CRMStage;
  data: PersonalDeal[];
  allDeals: PersonalDeal[];
};

type EnrichedContact = CRMContact & {
  allDeals: PersonalDeal[];
  active: PersonalDeal[];
  past: PersonalDeal[];
  total: number;
  isNew: boolean;
};

type ContactSection = {
  title: string;
  data: EnrichedContact[];
  allData: EnrichedContact[];
};

// ── Shared sub-components ─────────────────────────────────────────────────────

function Avatar({ initials, hue, size = 36 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${hue},35%,75%)`,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: '#fff' }}>{initials}</Text>
    </View>
  );
}

function PriorityDot({ priority }: { priority: Priority }) {
  return (
    <View style={{
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: PRIORITY_COLORS[priority], flexShrink: 0,
      marginTop: 3,
    }} />
  );
}

// ── Pipeline Card ─────────────────────────────────────────────────────────────

function PipelineCard({
  deal, onPress, onLongPress, onMoveStage, C,
}: {
  deal: PersonalDeal;
  onPress: () => void;
  onLongPress: () => void;
  onMoveStage: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const contact = getContactById(deal.contactId);
  const soon = isClosingSoon(deal);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => ({
        flexDirection: 'row',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: pressed ? C.surfacePressed : C.surface,
        marginBottom: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.separator,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      {/* Left color bar */}
      <View style={{ width: 4, backgroundColor: STAGE_COLORS[deal.stage] }} />

      {/* Main content */}
      <View style={{ flex: 1, paddingVertical: 14, paddingLeft: 12, paddingRight: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <PriorityDot priority={deal.priority} />
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: C.label, lineHeight: 20 }} numberOfLines={2}>
            {deal.title}
          </Text>
        </View>
        {contact && (
          <Text style={{ fontSize: 13, color: C.secondary, marginLeft: 16 }}>{contact.company}</Text>
        )}
        {soon && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, marginLeft: 16, backgroundColor: '#B85C5C18', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start' }}>
            <IconSymbol name="clock.fill" size={10} color="#B85C5C" />
            <Text style={{ fontSize: 11, color: '#B85C5C', fontWeight: '600' }}>Closing {formatCloseDate(deal.expectedClose)}</Text>
          </View>
        )}
      </View>

      {/* Value + date */}
      <View style={{ paddingVertical: 14, paddingRight: 4, alignItems: 'flex-end', justifyContent: 'center', gap: 4, minWidth: 72 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.label }}>{formatDealValue(deal.value)}</Text>
        <Text style={{ fontSize: 11, color: C.secondary }}>{formatRelativeDate(deal.lastActivity)}</Text>
      </View>

      {/* Three-dot menu */}
      <Pressable
        onPress={onMoveStage}
        hitSlop={8}
        style={{ width: 36, alignItems: 'center', justifyContent: 'center' }}
      >
        <IconSymbol name="ellipsis" size={16} color={C.secondary} />
      </Pressable>
    </Pressable>
  );
}

// ── Stage Section Header ──────────────────────────────────────────────────────

function StageHeader({
  stage, count, total, isCollapsed, onToggle, C,
}: {
  stage: CRMStage;
  count: number;
  total: number;
  isCollapsed: boolean;
  onToggle: () => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 2,
        backgroundColor: pressed ? C.surfacePressed : C.bg,
        marginBottom: 8,
        marginTop: 4,
      })}
    >
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: STAGE_COLORS[stage], marginRight: 10 }} />
      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>{stage}</Text>
      <View style={{
        minWidth: 24, height: 22, borderRadius: 11, backgroundColor: C.surface,
        borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7, marginRight: 10,
      }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary }}>{count}</Text>
      </View>
      {total > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginRight: 10 }}>
          {formatDealValue(total)}
        </Text>
      )}
      <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={13} color={C.secondary} />
    </Pressable>
  );
}

// ── Stage Summary Bar ─────────────────────────────────────────────────────────

function StageSummaryBar({
  deals, activeStage, onChipPress, C,
}: {
  deals: PersonalDeal[];
  activeStage: CRMStage | null;
  onChipPress: (stage: CRMStage) => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingBottom: 14, paddingTop: 2 }}
    >
      {CRM_STAGES.map(stage => {
        const stageDeals = getDealsByStage(deals, stage);
        const total = stageDeals.reduce((s, d) => s + d.value, 0);
        const isActive = activeStage === stage;
        return (
          <Pressable
            key={stage}
            onPress={() => { Haptics.selectionAsync(); onChipPress(stage); }}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 5,
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
              backgroundColor: isActive ? C.label : pressed ? C.surfacePressed : C.surface,
              borderWidth: 1, borderColor: isActive ? C.label : C.inputBorder,
            })}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isActive ? C.bg : STAGE_COLORS[stage] }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: isActive ? C.bg : C.label }}>{stage}</Text>
            <Text style={{ fontSize: 11, color: isActive ? C.bg : C.secondary }}>{stageDeals.length}</Text>
            {total > 0 && (
              <Text style={{ fontSize: 11, color: isActive ? C.bg : C.accent, fontWeight: '600' }}>{formatDealValue(total)}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Pipeline List View ────────────────────────────────────────────────────────

function PipelineListView({
  deals, pill, stageFilter, onStageFilter, collapsedStages, onToggleStage, onDealPress, onMoveDeal, onScroll, C,
}: {
  deals: PersonalDeal[];
  pill: string;
  stageFilter: CRMStage | null;
  onStageFilter: (stage: CRMStage) => void;
  collapsedStages: Set<CRMStage>;
  onToggleStage: (stage: CRMStage) => void;
  onDealPress: (deal: PersonalDeal) => void;
  onMoveDeal: (deal: PersonalDeal) => void;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  C: ReturnType<typeof useColors>;
}) {
  const listRef = useRef<SectionList<PersonalDeal, PipelineSection>>(null);

  const filtered = useMemo(() => {
    if (pill === 'Hot')          return deals.filter(d => d.priority === 'Hot');
    if (pill === 'Warm')         return deals.filter(d => d.priority === 'Warm');
    if (pill === 'Cold')         return deals.filter(d => d.priority === 'Cold');
    if (pill === 'Closing Soon') return deals.filter(d => isClosingSoon(d));
    return deals;
  }, [deals, pill]);

  const sections: PipelineSection[] = useMemo(() => {
    const stageList = stageFilter ? [stageFilter] : CRM_STAGES;
    return stageList.map(stage => {
      const allDeals = getDealsByStage(filtered, stage);
      return { stage, data: collapsedStages.has(stage) ? [] : allDeals, allDeals };
    });
  }, [filtered, collapsedStages, stageFilter]);

  return (
    <SectionList<PersonalDeal, PipelineSection>
      ref={listRef}
      sections={sections}
      keyExtractor={item => item.id}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 120 }}
      ListHeaderComponent={
        <StageSummaryBar deals={filtered} activeStage={stageFilter} onChipPress={onStageFilter} C={C} />
      }
      renderSectionHeader={({ section }) => (
        <StageHeader
          stage={section.stage}
          count={section.allDeals.length}
          total={section.allDeals.reduce((s, d) => s + d.value, 0)}
          isCollapsed={collapsedStages.has(section.stage)}
          onToggle={() => { Haptics.selectionAsync(); onToggleStage(section.stage); }}
          C={C}
        />
      )}
      renderItem={({ item }) => (
        <PipelineCard
          deal={item}
          onPress={() => onDealPress(item)}
          onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMoveDeal(item); }}
          onMoveStage={() => onMoveDeal(item)}
          C={C}
        />
      )}
      renderSectionFooter={({ section }) => {
        if (!collapsedStages.has(section.stage) && section.allDeals.length === 0) {
          return (
            <Text style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', marginBottom: 12 }}>
              No deals at this stage
            </Text>
          );
        }
        return <View style={{ height: 4 }} />;
      }}
    />
  );
}

// ── Contact Row (with swipe-left actions) ────────────────────────────────────

function ContactRow({
  contact, onPress, onLongPress, C,
}: {
  contact: EnrichedContact;
  onPress: () => void;
  onLongPress: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const close = useCallback(() => {
    isOpen.current = false;
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 200, friction: 25 }).start();
  }, [translateX]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gs) =>
      Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
    onPanResponderMove: (_, gs) => {
      const base = isOpen.current ? -SWIPE_W : 0;
      translateX.setValue(Math.max(-SWIPE_W, Math.min(0, base + gs.dx)));
    },
    onPanResponderRelease: (_, gs) => {
      const base = isOpen.current ? -SWIPE_W : 0;
      if (base + gs.dx < -SWIPE_W / 2) {
        isOpen.current = true;
        Animated.spring(translateX, { toValue: -SWIPE_W, useNativeDriver: true, tension: 200, friction: 25 }).start();
      } else {
        isOpen.current = false;
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 200, friction: 25 }).start();
      }
    },
  }), [translateX]);

  const statusDot =
    contact.active.length > 0 ? C.green :
    contact.allDeals.length > 0 ? C.muted :
    '#1A1714';
  const statusText =
    contact.active.length > 0 ? `${contact.active.length} active deal${contact.active.length !== 1 ? 's' : ''}` :
    contact.allDeals.length > 0 ? 'No active deals' :
    'New';

  return (
    <View style={{ overflow: 'hidden' }}>
      {/* Swipe actions (revealed behind) */}
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: SWIPE_W, flexDirection: 'row' }}>
        <Pressable
          onPress={() => { close(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ flex: 1, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <IconSymbol name="message" size={18} color="#fff" />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Message</Text>
        </Pressable>
        <Pressable
          onPress={() => { close(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ flex: 1, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <IconSymbol name="phone" size={18} color="#fff" />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Call</Text>
        </Pressable>
      </View>

      {/* Row translates left to reveal actions */}
      <Animated.View style={{ transform: [{ translateX }], backgroundColor: C.bg }} {...panResponder.panHandlers}>
        <Pressable
          onPress={() => { if (isOpen.current) { close(); return; } onPress(); }}
          onLongPress={onLongPress}
          delayLongPress={400}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            backgroundColor: pressed ? C.surfacePressed : C.bg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: C.separator,
            gap: 12,
          })}
        >
          {/* Avatar + online dot */}
          <View>
            <Avatar initials={contact.initials} hue={contact.avatarHue} size={46} />
            {contact.isOnKaNeXT && (
              <View style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: C.green,
                borderWidth: 2, borderColor: C.bg,
              }} />
            )}
          </View>

          {/* Name + company + status */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{contact.name}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{contact.company}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusDot }} />
              <Text style={{ fontSize: 11, color: C.muted }}>{statusText}</Text>
            </View>
          </View>

          {/* Value + deal count */}
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            {contact.total > 0 && (
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.accent }}>{formatDealValue(contact.total)}</Text>
            )}
            <Text style={{ fontSize: 11, color: C.secondary }}>
              {contact.allDeals.length} deal{contact.allDeals.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────────────

function ContactsTab({
  deals, C,
}: {
  deals: PersonalDeal[];
  C: ReturnType<typeof useColors>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedPill, setSelectedPill] = useState('All');
  const [showFilterPills, setShowFilterPills] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set(['Past Deals', 'New']));

  const enriched = useMemo<EnrichedContact[]>(() => {
    return CRM_CONTACTS.map(c => {
      const allDeals = deals.filter(d => d.contactId === c.id);
      const active = allDeals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
      const past = allDeals.filter(d => d.stage === 'Won' || d.stage === 'Lost');
      const total = allDeals.reduce((s, d) => s + d.value, 0);
      const isNew = !!c.addedDate && (Date.now() - c.addedDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
      return { ...c, allDeals, active, past, total, isNew };
    });
  }, [deals]);

  const filtered = useMemo<EnrichedContact[]>(() => {
    let result = [...enriched];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
    }
    if (selectedPill === 'Active Deals')    result = result.filter(c => c.active.length > 0);
    else if (selectedPill === 'Past Deals') result = result.filter(c => c.active.length === 0 && c.past.length > 0);
    else if (selectedPill === 'New This Month') result = result.filter(c => c.isNew);
    else if (selectedPill === 'Highest Value')  result = result.filter(c => c.total >= 10000);
    result.sort((a, b) => b.total - a.total);
    return result;
  }, [enriched, search, selectedPill]);

  const sections = useMemo<ContactSection[]>(() => {
    const activeDeal  = filtered.filter(c => c.active.length > 0);
    const pastDeal    = filtered.filter(c => c.active.length === 0 && c.past.length > 0);
    const newContacts = filtered.filter(c => c.active.length === 0 && c.past.length === 0 && c.isNew);
    return [
      { title: 'Active Deals', allData: activeDeal, data: collapsedSections.has('Active Deals') ? [] : activeDeal },
      { title: 'Past Deals',   allData: pastDeal,   data: collapsedSections.has('Past Deals')   ? [] : pastDeal   },
      { title: 'New',          allData: newContacts, data: collapsedSections.has('New')          ? [] : newContacts },
    ].filter(s => s.allData.length > 0);
  }, [filtered, collapsedSections]);

  const toggleSection = useCallback((title: string) => {
    Haptics.selectionAsync();
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  const handleLongPress = useCallback((contact: EnrichedContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Message', 'Call', 'Video', 'Email', 'View Deals', 'Add Deal'],
          cancelButtonIndex: 0,
          title: contact.name,
          message: contact.company,
        },
        (idx) => {
          if (idx === 5) router.push({ pathname: '/(tabs)/(main)/deals/contact' as any, params: { contactId: contact.id } });
        },
      );
    }
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      {/* Search + filter toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: C.surface, borderRadius: 10,
          paddingHorizontal: 10, height: 38,
          borderWidth: 1, borderColor: C.inputBorder,
        }}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: C.label }}
            placeholder="Search contacts..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => { setShowFilterPills(p => !p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{
            width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
            backgroundColor: showFilterPills ? C.accent : C.surface,
            borderWidth: 1, borderColor: showFilterPills ? C.accent : C.inputBorder,
          }}
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={16} color={showFilterPills ? '#fff' : C.secondary} />
        </Pressable>
      </View>

      {/* Filter pills */}
      {showFilterPills && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
        >
          {CONTACTS_PILLS.map(p => (
            <Pressable
              key={p}
              onPress={() => { setSelectedPill(p); Haptics.selectionAsync(); }}
              style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1,
                backgroundColor: selectedPill === p ? C.label : C.surface,
                borderColor: selectedPill === p ? C.label : C.inputBorder,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: selectedPill === p ? C.bg : C.secondary }}>{p}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Sectioned list */}
      <SectionList<EnrichedContact, ContactSection>
        sections={sections}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderSectionHeader={({ section }) => (
          <Pressable
            onPress={() => toggleSection(section.title)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
              backgroundColor: pressed ? C.surfacePressed : C.bg,
              marginTop: 4,
            })}
          >
            <Text style={{
              flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>{section.title}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginRight: 6 }}>{section.allData.length}</Text>
            <IconSymbol
              name={collapsedSections.has(section.title) ? 'chevron.right' : 'chevron.down'}
              size={12}
              color={C.muted}
            />
          </Pressable>
        )}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            onPress={() => router.push({ pathname: '/(tabs)/(main)/deals/contact' as any, params: { contactId: item.id } })}
            onLongPress={() => handleLongPress(item)}
            C={C}
          />
        )}
        renderSectionFooter={({ section }) =>
          !collapsedSections.has(section.title) && section.allData.length === 0
            ? <Text style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', paddingVertical: 8 }}>No contacts</Text>
            : null
        }
        ListEmptyComponent={
          <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center', paddingTop: 32 }}>No contacts found</Text>
        }
      />
    </View>
  );
}

// ── Deal Detail Sheet ─────────────────────────────────────────────────────────

function DealDetailSheet({
  deal, visible, onClose, onMoveStage, C,
}: {
  deal: PersonalDeal | null;
  visible: boolean;
  onClose: () => void;
  onMoveStage: () => void;
  C: ReturnType<typeof useColors>;
}) {
  if (!deal) return <BottomSheet visible={false} onClose={onClose} useModal title="Deal"><View /></BottomSheet>;
  const contact = getContactById(deal.contactId);
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={deal.title}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: STAGE_COLORS[deal.stage] + '20' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: STAGE_COLORS[deal.stage] }}>{deal.stage}</Text>
        </View>
        <Pressable
          onPress={onMoveStage}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 4,
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
            backgroundColor: pressed ? C.surfacePressed : C.surface,
          })}
        >
          <IconSymbol name="arrow.right" size={13} color={C.accent} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.accent }}>Move Stage</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>VALUE</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>{formatDealValueFull(deal.value)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>CLOSE DATE</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{formatCloseDate(deal.expectedClose)}</Text>
        </View>
      </View>

      {contact && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>CONTACT</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar initials={contact.initials} hue={contact.avatarHue} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{contact.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{contact.company}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{contact.email}</Text>
            </View>
          </View>
        </View>
      )}

      {deal.notes ? (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>NOTES</Text>
          <Text style={{ fontSize: 13, color: C.label, lineHeight: 20 }}>{deal.notes}</Text>
        </View>
      ) : null}

      {deal.tasks.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>TASKS</Text>
          {deal.tasks.map(task => (
            <View key={task.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: C.surface, borderRadius: 10, padding: 10, marginBottom: 6,
            }}>
              <IconSymbol name={task.completed ? 'checkmark.circle.fill' : 'circle'} size={18} color={task.completed ? C.green : C.muted} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: C.label }}>{task.title}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{formatCloseDate(task.dueDate)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>ACTIVITY</Text>
      {[...deal.activities].reverse().map(act => (
        <View key={act.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 16, lineHeight: 20 }}>{formatActivityType(act.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }}>{act.description}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{formatRelativeDate(act.timestamp)}</Text>
          </View>
        </View>
      ))}
    </BottomSheet>
  );
}

// ── Move Stage Sheet ──────────────────────────────────────────────────────────

function MoveStageSheet({
  deal, visible, onClose, onSelect, C,
}: {
  deal: PersonalDeal | null;
  visible: boolean;
  onClose: () => void;
  onSelect: (stage: CRMStage) => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Move to Stage" snapPoints={['40%', '60%']}>
      {CRM_STAGES.map(stage => {
        const isCurrent = deal?.stage === stage;
        return (
          <Pressable
            key={stage}
            onPress={() => onSelect(stage)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingVertical: 14, paddingHorizontal: 4,
              borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: STAGE_COLORS[stage] }} />
              <Text style={{ fontSize: 15, fontWeight: isCurrent ? '700' : '500', color: isCurrent ? C.accent : C.label }}>{stage}</Text>
            </View>
            {isCurrent && <IconSymbol name="checkmark" size={14} color={C.accent} />}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

// ── Create Deal Sheet ─────────────────────────────────────────────────────────

function CreateDealSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ReturnType<typeof useColors> }) {
  const [title, setTitle] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('cc1');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<CRMStage>('Lead');
  const [priority, setPriority] = useState<Priority>('Warm');

  const inputStyle = {
    backgroundColor: C.surface, borderRadius: 10, padding: 12,
    fontSize: 14, color: C.label, marginBottom: 10,
    borderWidth: 1, borderColor: C.inputBorder,
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="New Deal">
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>DEAL TITLE</Text>
      <TextInput style={inputStyle} placeholder="e.g. Nike Content Partnership" placeholderTextColor={C.muted} value={title} onChangeText={setTitle} />
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6, marginTop: 4 }}>VALUE ($)</Text>
      <TextInput style={inputStyle} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" value={value} onChangeText={setValue} />
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6, marginTop: 4 }}>CONTACT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {CRM_CONTACTS.map(c => (
          <Pressable key={c.id} onPress={() => setSelectedContact(c.id)} style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8,
            backgroundColor: selectedContact === c.id ? C.accent : C.surface,
            borderWidth: 1, borderColor: selectedContact === c.id ? C.accent : C.inputBorder,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: selectedContact === c.id ? '#fff' : C.label }}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>STAGE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {(['Lead', 'Contacted', 'Proposal'] as CRMStage[]).map(s => (
          <Pressable key={s} onPress={() => setStage(s)} style={{
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, marginRight: 6,
            backgroundColor: stage === s ? C.accent : C.surface,
            borderWidth: 1, borderColor: stage === s ? C.accent : C.inputBorder,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: stage === s ? '#fff' : C.label }}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>PRIORITY</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {(['Hot', 'Warm', 'Cold'] as Priority[]).map(p => (
          <Pressable key={p} onPress={() => setPriority(p)} style={{
            flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
            backgroundColor: priority === p ? PRIORITY_COLORS[p] + '20' : C.surface,
            borderWidth: 1.5, borderColor: priority === p ? PRIORITY_COLORS[p] : C.inputBorder,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: priority === p ? PRIORITY_COLORS[p] : C.secondary }}>{p}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={onClose} style={({ pressed }) => ({ backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Add Deal</Text>
      </Pressable>
    </BottomSheet>
  );
}

// ── Add Contact Sheet ─────────────────────────────────────────────────────────

function AddContactSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ReturnType<typeof useColors> }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [handle, setHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const inputStyle = {
    backgroundColor: C.surface, borderRadius: 10, padding: 12,
    fontSize: 14, color: C.label, marginBottom: 10,
    borderWidth: 1, borderColor: C.inputBorder,
  };
  const label = (t: string) => <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6, marginTop: 4 }}>{t}</Text>;

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="New Contact">
      {label('NAME')}
      <TextInput style={inputStyle} placeholder="Full name" placeholderTextColor={C.muted} value={name} onChangeText={setName} />
      {label('COMPANY / BRAND')}
      <TextInput style={inputStyle} placeholder="e.g. Nike, Creator Fund" placeholderTextColor={C.muted} value={company} onChangeText={setCompany} />
      {label('@KAYNEXT HANDLE')}
      <TextInput style={inputStyle} placeholder="Search KaNeXT..." placeholderTextColor={C.muted} autoCapitalize="none" value={handle} onChangeText={setHandle} />
      {label('PHONE')}
      <TextInput style={inputStyle} placeholder="+1 000-000-0000" placeholderTextColor={C.muted} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      {label('EMAIL')}
      <TextInput style={inputStyle} placeholder="email@domain.com" placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      {label('NOTES')}
      <TextInput
        style={[inputStyle, { height: 72, textAlignVertical: 'top' }]}
        placeholder="Context, how you met, etc."
        placeholderTextColor={C.muted}
        multiline
        value={notes}
        onChangeText={setNotes}
      />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={({ pressed }) => ({
            flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
            backgroundColor: pressed ? C.surfacePressed : C.surface,
            borderWidth: 1, borderColor: C.inputBorder,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>Import from Contacts</Text>
        </Pressable>
        <Pressable
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onClose(); }}
          style={({ pressed }) => ({ flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 })}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Add Contact</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// ── Insights Tab ──────────────────────────────────────────────────────────────

const INSIGHTS_TOP_BRANDS = [
  { name: 'Adidas',           revenue: 20000 },
  { name: 'Nike',             revenue: 15000 },
  { name: 'FitLife',          revenue: 12000 },
  { name: 'TechCorp',         revenue: 8500  },
  { name: 'Black Enterprise', revenue: 6000  },
];

const DIPSON_INSIGHTS = [
  'Your avg close time dropped from 35 days to 28 days this quarter',
  'Referrals convert at 2× the rate of inbound DMs — prioritize referral channels',
  'You have $28K in Negotiation — follow up on TechBrand to close before month end',
];

function InsightsTab({ C, onNavigateToPipeline }: {
  C: ReturnType<typeof useColors>;
  onNavigateToPipeline: (stage: CRMStage) => void;
}) {
  const chartMax  = useMemo(() => Math.max(...MONTHLY_REVENUE.map(m => m.value), 1), []);
  const funnelMax = useMemo(() => Math.max(...CRM_STAGES.map(s => getDealsByStage(PERSONAL_DEALS, s).length), 1), []);
  const brandMax  = Math.max(...INSIGHTS_TOP_BRANDS.map(b => b.revenue), 1);

  const [timePeriod, setTimePeriod] = useState('This Month');
  const [revenueBar, setRevenueBar] = useState<string | null>(null);
  const [funnelBar,  setFunnelBar]  = useState<CRMStage | null>(null);
  const [sourceBar,  setSourceBar]  = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTooltips = useCallback(() => { setRevenueBar(null); setFunnelBar(null); setSourceBar(null); }, []);

  const armTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearTooltips, 3000);
  }, [clearTooltips]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const tapRevenue = (month: string) => { setRevenueBar(p => p === month ? null : month); setFunnelBar(null); setSourceBar(null); armTimer(); Haptics.selectionAsync(); };
  const tapFunnel  = (s: CRMStage)  => { setFunnelBar(p => p === s ? null : s); setRevenueBar(null); setSourceBar(null); armTimer(); Haptics.selectionAsync(); };
  const tapSource  = (l: string)    => { setSourceBar(p => p === l ? null : l); setRevenueBar(null); setFunnelBar(null); armTimer(); Haptics.selectionAsync(); };

  const statCards = [
    { label: 'Win Rate',    value: `${INSIGHT_STATS.winRate}%`,                icon: 'percent'       },
    { label: 'Avg Deal',    value: formatDealValue(INSIGHT_STATS.avgDealSize),  icon: 'tag.fill'      },
    { label: 'Avg Close',   value: `${INSIGHT_STATS.avgTimeToClose}d`,          icon: 'calendar'      },
    { label: 'Won This Mo', value: `${INSIGHT_STATS.wonThisMonth}`,             icon: 'trophy.fill'   },
  ];

  const activeRevBar = revenueBar ? MONTHLY_REVENUE.find(m => m.month === revenueBar) : null;
  const activeSrcBar = sourceBar  ? SOURCE_BREAKDOWN.find(s => s.label === sourceBar) : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* Time period + Export row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 6 }}>
          {['This Month', 'This Quarter', 'This Year'].map(p => (
            <Pressable
              key={p}
              onPress={() => { setTimePeriod(p); Haptics.selectionAsync(); }}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: timePeriod === p ? C.label : C.inputBorder, backgroundColor: timePeriod === p ? C.label : C.surface }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: timePeriod === p ? C.bg : C.secondary }}>{p}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: pressed ? C.surfacePressed : C.surface, borderWidth: 1, borderColor: C.separator })}
        >
          <IconSymbol name="square.and.arrow.up" size={13} color={C.secondary} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Export</Text>
        </Pressable>
      </View>

      {/* Stat cards */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {statCards.map(sc => (
          <View key={sc.label} style={{ width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <IconSymbol name={sc.icon as any} size={18} color={C.accent} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginTop: 6 }}>{sc.value}</Text>
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{sc.label}</Text>
          </View>
        ))}
      </View>

      {/* Monthly Revenue */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 6 }}>Monthly Revenue</Text>
      <View style={{ height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
        {activeRevBar && (
          <View style={{ backgroundColor: C.label, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg }}>{activeRevBar.month}: ${activeRevBar.value.toLocaleString()}</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 90, marginBottom: 24 }}>
        {MONTHLY_REVENUE.map(m => {
          const barH = chartMax > 0 ? Math.max(4, (m.value / chartMax) * 80) : 4;
          const isActive = revenueBar === m.month;
          return (
            <Pressable key={m.month} style={{ flex: 1, alignItems: 'center' }} onPress={() => tapRevenue(m.month)}>
              <View style={{ width: '100%', height: barH, borderRadius: 4, backgroundColor: isActive ? C.label : C.accent }} />
              <Text style={{ fontSize: 10, color: isActive ? C.label : C.muted, marginTop: 4, fontWeight: isActive ? '700' : '400' }}>{m.month}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Pipeline Funnel */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 6 }}>Pipeline Funnel</Text>
      {funnelBar && (() => {
        const sd = getDealsByStage(PERSONAL_DEALS, funnelBar);
        const tot = sd.reduce((s, d) => s + d.value, 0);
        return (
          <Pressable
            onPress={() => { setFunnelBar(null); onNavigateToPipeline(funnelBar); }}
            style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.8 : 1 })}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg }}>{funnelBar}: {sd.length} deal{sd.length !== 1 ? 's' : ''}, {formatDealValue(tot)}</Text>
            <IconSymbol name="arrow.right" size={11} color={C.bg} />
          </Pressable>
        );
      })()}
      {CRM_STAGES.filter(s => s !== 'Lost').map(stage => {
        const count = getDealsByStage(PERSONAL_DEALS, stage).length;
        const isActive = funnelBar === stage;
        return (
          <Pressable key={stage} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }} onPress={() => tapFunnel(stage)}>
            <Text style={{ width: 80, fontSize: 11, color: isActive ? C.label : C.secondary, fontWeight: isActive ? '700' : '400' }}>{stage}</Text>
            <View style={{ flex: 1, height: 24, backgroundColor: C.surface, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: `${(count / funnelMax) * 100}%`, height: '100%', borderRadius: 6, backgroundColor: isActive ? C.label : STAGE_COLORS[stage] }} />
            </View>
            <Text style={{ width: 20, fontSize: 11, fontWeight: '600', color: isActive ? C.label : C.secondary, textAlign: 'right' }}>{count}</Text>
          </Pressable>
        );
      })}

      {/* Lead Sources */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginTop: 20, marginBottom: 6 }}>Lead Sources</Text>
      {activeSrcBar && (
        <View style={{ backgroundColor: C.label, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8, alignSelf: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg }}>{activeSrcBar.label}: {activeSrcBar.pct}% of leads</Text>
        </View>
      )}
      {SOURCE_BREAKDOWN.map(src => {
        const isActive = sourceBar === src.label;
        return (
          <Pressable key={src.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }} onPress={() => tapSource(src.label)}>
            <Text style={{ width: 86, fontSize: 11, color: isActive ? C.label : C.secondary, fontWeight: isActive ? '700' : '400' }}>{src.label}</Text>
            <View style={{ flex: 1, height: 20, backgroundColor: C.surface, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: `${src.pct}%`, height: '100%', borderRadius: 6, backgroundColor: isActive ? C.label : C.accent + 'CC' }} />
            </View>
            <Text style={{ width: 32, fontSize: 11, fontWeight: '600', color: isActive ? C.label : C.secondary, textAlign: 'right' }}>{src.pct}%</Text>
          </Pressable>
        );
      })}

      {/* Top Brands by Revenue */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginTop: 24, marginBottom: 10 }}>Top Brands by Revenue</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 20 }}>
        {INSIGHTS_TOP_BRANDS.map((brand, idx) => (
          <View key={brand.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: idx < INSIGHTS_TOP_BRANDS.length - 1 ? 12 : 0 }}>
            <Text style={{ width: 18, fontSize: 13, fontWeight: '700', color: idx === 0 ? '#B8943E' : C.secondary, textAlign: 'center' }}>{idx + 1}</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{brand.name}</Text>
            <View style={{ width: 80, height: 8, backgroundColor: C.bg, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: `${(brand.revenue / brandMax) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: C.label }} />
            </View>
            <Text style={{ width: 44, fontSize: 12, fontWeight: '600', color: C.secondary, textAlign: 'right' }}>{formatDealValue(brand.revenue)}</Text>
          </View>
        ))}
      </View>

      {/* Dipson Insights */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <IconSymbol name="sparkles" size={15} color={C.secondary} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Dipson Insights</Text>
        </View>
        {DIPSON_INSIGHTS.map((insight, idx) => (
          <View key={idx} style={{ flexDirection: 'row', gap: 10, marginBottom: idx < DIPSON_INSIGHTS.length - 1 ? 10 : 0 }}>
            <View style={{ paddingTop: 6 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.secondary }} />
            </View>
            <Text style={{ flex: 1, fontSize: 13, color: C.secondary, lineHeight: 18 }}>{insight}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

// ── Subscriber Collaborate View ───────────────────────────────────────────────

const COLLAB_RATE_CARD = [
  { service: 'Sponsored Post',        price: '$500 – $1,500',       deliverables: '1 Instagram or X post, 1 story',                  turnaround: '5–7 business days',   usageRights: 'Brand may repost for 90 days' },
  { service: 'Sponsored Reel',        price: '$750 – $2,000',       deliverables: '1 short-form video reel (30–60 sec)',              turnaround: '7–10 business days',  usageRights: 'Brand may repost for 90 days' },
  { service: 'KTV Video Integration', price: '$1,000 – $3,000',     deliverables: 'Brand integration in 1 KTV video (60–90 sec)',     turnaround: '10–14 business days', usageRights: 'Brand may repost for 6 months' },
  { service: 'Story Feature',         price: '$250 – $500',         deliverables: '3–5 story frames with link sticker',              turnaround: '3–5 business days',   usageRights: 'Brand may screenshot for 30 days' },
  { service: 'Brand Ambassadorship',  price: '$2,000 – $5,000/mo',  deliverables: '4 posts, 8 stories, 1 reel per month',            turnaround: 'Ongoing monthly',     usageRights: 'Full license during contract term' },
  { service: 'Speaking Engagement',   price: '$1,500 – $5,000',     deliverables: '30–60 min keynote or panel appearance',           turnaround: 'Per event schedule',  usageRights: 'Event organizer may share clips for 1 year' },
  { service: 'Consulting Session',    price: '$150/hr',             deliverables: '1-on-1 video call + follow-up notes doc',         turnaround: '5 business days',     usageRights: 'For internal use only' },
  { service: 'Custom Package',        price: "Let's talk",          deliverables: 'Tailored to your campaign goals and deliverables', turnaround: 'Discussed in brief',  usageRights: 'Negotiated per agreement' },
];

const WHAT_I_OFFER = [
  { icon: 'camera.fill',    title: 'Sponsored Content',    desc: 'Authentic product integrations across posts, reels, and KTV videos', steps: ['Brief review & creative alignment', 'Content creation & shoot', 'Review period (2 revision rounds)', 'Post goes live + metrics report delivered'], startingPrice: 'From $500' },
  { icon: 'star.fill',      title: 'Brand Ambassadorship', desc: 'Long-term partnership with ongoing content, appearances, and co-branding', steps: ['Intro call & campaign scoping', 'Contract & deliverables agreed', 'Monthly content creation & delivery', 'Quarterly performance review & renewal'], startingPrice: 'From $2,000/mo' },
  { icon: 'mic.fill',       title: 'Speaking & Events',    desc: 'Keynotes, panels, workshops, and live appearances', steps: ['Topic brief & event details review', 'Deck or talking points prepared', 'Rehearsal or pre-event call (if needed)', 'Live appearance + post-event content optional'], startingPrice: 'From $1,500' },
  { icon: 'lightbulb.fill', title: 'Consulting',           desc: '1-on-1 strategy sessions for brands, creators, and athletes', steps: ['Submit agenda & goals in advance', '60-min video call session', 'Follow-up notes doc delivered within 48hrs', 'Optional async follow-up via voice note'], startingPrice: 'From $150/hr' },
  { icon: 'sparkles',       title: 'Custom',               desc: 'Have something else in mind? Pitch it below', steps: ['Submit your idea via the form below', 'Initial response within 3 business days', 'Discovery call to scope the project', 'Custom proposal & pricing delivered'], startingPrice: "Let's talk" },
];

const PAST_PARTNERS = [
  { id: 'pp1', name: 'Nike',             initials: 'NK', hue: 30,  type: 'Content Series',     year: '2025', outcome: '5M+ impressions across 8-post campaign'    },
  { id: 'pp2', name: 'Gatorade',         initials: 'GT', hue: 90,  type: 'Sponsorship',         year: '2024', outcome: 'Product integration campaign, 1.2M reach'   },
  { id: 'pp3', name: 'Under Armour',     initials: 'UA', hue: 210, type: 'Brand Ambassador',    year: '2024', outcome: '6-month ambassador deal, 3 content series'   },
  { id: 'pp4', name: 'Black Enterprise', initials: 'BE', hue: 0,   type: 'Speaking',            year: '2025', outcome: 'Keynote at Entrepreneurs Summit 2025'         },
  { id: 'pp5', name: 'Beats by Dre',    initials: 'BD', hue: 340, type: 'Product Integration', year: '2025', outcome: 'KTV video integration, 850K views'            },
];

const COLLAB_PROJECT_TYPES = ['Sponsored Post', 'Ambassadorship', 'Speaking', 'Consulting', 'Custom'] as const;
const COLLAB_BUDGET_RANGES = ['Under $1K', '$1K–$5K', '$5K–$10K', '$10K–$25K', '$25K+', 'Flexible'] as const;

type SubmissionStatus = 'Submitted' | 'Under Review' | 'Accepted' | 'Declined';
const SUBMISSION_STATUS_CONFIG: Record<SubmissionStatus, { color: string; label: string }> = {
  'Submitted':   { color: '#9C9790', label: 'Submitted'   },
  'Under Review':{ color: '#B8943E', label: 'Under Review' },
  'Accepted':    { color: '#5A8A6E', label: 'Accepted'     },
  'Declined':    { color: '#B85C5C', label: 'Declined'     },
};

const INITIAL_MY_SUBMISSIONS = [
  { id: 'ms1', type: 'Sponsored Post',  company: 'My Brand Co.',      date: 'Mar 15, 2026', status: 'Under Review' as SubmissionStatus, description: 'Looking to sponsor 2 Instagram posts and a Story set for our spring launch.' },
  { id: 'ms2', type: 'Ambassadorship',  company: 'FitLife Pro',       date: 'Feb 8, 2026',  status: 'Accepted'     as SubmissionStatus, description: 'Long-term ambassador partnership — 3 months, 2 posts per month.' },
  { id: 'ms3', type: 'Speaking',        company: 'CreatorConf 2026',  date: 'Jan 20, 2026', status: 'Declined'     as SubmissionStatus, description: 'Panel speaker at our annual creator economy conference.' },
];


function CollaborateView({ C, topBarH }: { C: ReturnType<typeof useColors>; topBarH: number }) {
  const [proposalSheet,   setProposalSheet]   = useState(false);
  const [submissionSheet, setSubmissionSheet] = useState<typeof INITIAL_MY_SUBMISSIONS[number] | null>(null);
  const [mySubmissions,   setMySubmissions]   = useState(INITIAL_MY_SUBMISSIONS);
  const [expandedRate,    setExpandedRate]    = useState<string | null>(null);

  // Proposal form state
  const [brand,       setBrand]       = useState('');
  const [yourName,    setYourName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [projectType, setProjectType] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState<string | null>(null);
  const [timeline,    setTimeline]    = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = !!(brand.trim() && yourName.trim() && email.trim() && projectType && budgetRange && description.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newSub = {
      id: `ms${Date.now()}`,
      type: projectType!,
      company: brand.trim(),
      date: 'Apr 8, 2026',
      status: 'Submitted' as SubmissionStatus,
      description: description.trim(),
    };
    setMySubmissions(prev => [newSub, ...prev]);
    setBrand(''); setYourName(''); setEmail('');
    setProjectType(null); setBudgetRange(null); setTimeline(''); setDescription('');
    setProposalSheet(false);
  };

  const sectionLabel = (t: string) => (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 8 }}>{t}</Text>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Past Partnerships */}
      {sectionLabel('Past Partnerships')}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' }}>
        {PAST_PARTNERS.map((partner, idx) => (
          <View key={partner.id} style={{ borderBottomWidth: idx < PAST_PARTNERS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 }}>
              <Avatar initials={partner.initials} hue={partner.hue} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{partner.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{partner.type} · {partner.year}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Rate Card */}
      {sectionLabel('Rate Card')}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' }}>
        {COLLAB_RATE_CARD.map((item, idx) => {
          const isOpen = expandedRate === item.service;
          return (
            <View key={item.service} style={{ borderBottomWidth: idx < COLLAB_RATE_CARD.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedRate(p => p === item.service ? null : item.service); }}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{item.service}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginRight: 8 }}>{item.price}</Text>
                <IconSymbol name={isOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
              </Pressable>
              {isOpen && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, width: 90 }}>Deliverables:</Text>
                    <Text style={{ fontSize: 12, color: C.label, flex: 1, lineHeight: 17 }}>{item.deliverables}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, width: 90 }}>Turnaround:</Text>
                    <Text style={{ fontSize: 12, color: C.label, flex: 1, lineHeight: 17 }}>{item.turnaround}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, width: 90 }}>Usage Rights:</Text>
                    <Text style={{ fontSize: 12, color: C.label, flex: 1, lineHeight: 17 }}>{item.usageRights}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Submit a Proposal CTA */}
      <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setProposalSheet(true); }}
          style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Submit a Proposal</Text>
        </Pressable>
      </View>

      {/* My Submissions */}
      {mySubmissions.length > 0 && (
        <>
          {sectionLabel('My Submissions')}
          <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' }}>
            {mySubmissions.map((sub, idx) => {
              const cfg = SUBMISSION_STATUS_CONFIG[sub.status];
              return (
                <View key={sub.id} style={{ borderBottomWidth: idx < mySubmissions.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSubmissionSheet(sub); }}
                    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, opacity: pressed ? 0.7 : 1 })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{sub.type}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{sub.company} · {sub.date}</Text>
                    </View>
                    <View style={{ backgroundColor: cfg.color + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={12} color={C.secondary} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Proposal form sheet */}
      <BottomSheet visible={proposalSheet} onClose={() => setProposalSheet(false)} useModal title="Submit a Proposal">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Brand / Company *</Text>
            <TextInput style={{ backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.separator }} placeholder="Nike, Adidas, FitLife…" placeholderTextColor={C.secondary} value={brand} onChangeText={setBrand} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Your Name *</Text>
            <TextInput style={{ backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.separator }} placeholder="Full name" placeholderTextColor={C.secondary} value={yourName} onChangeText={setYourName} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Email *</Text>
            <TextInput style={{ backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.separator }} placeholder="you@brand.com" placeholderTextColor={C.secondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Project Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {COLLAB_PROJECT_TYPES.map(t => (
                <Pressable key={t} onPress={() => { setProjectType(p => p === t ? null : t); Haptics.selectionAsync(); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: projectType === t ? C.label : C.separator, backgroundColor: projectType === t ? C.label : 'transparent' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: projectType === t ? C.bg : C.secondary }}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Budget Range *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {COLLAB_BUDGET_RANGES.map(b => (
                <Pressable key={b} onPress={() => { setBudgetRange(p => p === b ? null : b); Haptics.selectionAsync(); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: budgetRange === b ? C.label : C.separator, backgroundColor: budgetRange === b ? C.label : 'transparent' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: budgetRange === b ? C.bg : C.secondary }}>{b}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Timeline</Text>
            <TextInput style={{ backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.separator }} placeholder="e.g. Q2 2026, ASAP, Flexible" placeholderTextColor={C.secondary} value={timeline} onChangeText={setTimeline} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Project Description *</Text>
            <TextInput style={{ backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.separator, minHeight: 90, textAlignVertical: 'top' }} placeholder="Tell me about the project, deliverables, and goals…" placeholderTextColor={C.secondary} value={description} onChangeText={setDescription} multiline numberOfLines={4} />
          </View>
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => ({ backgroundColor: canSubmit ? C.label : C.separator, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: pressed && canSubmit ? 0.85 : 1 })}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: canSubmit ? C.bg : C.secondary }}>Submit Proposal</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>

      {/* Submission detail sheet */}
      <BottomSheet visible={!!submissionSheet} onClose={() => setSubmissionSheet(null)} useModal title={submissionSheet?.type ?? ''}>
        {submissionSheet && (() => {
          const cfg = SUBMISSION_STATUS_CONFIG[submissionSheet.status];
          return (
            <View style={{ gap: 16, paddingTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Company</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{submissionSheet.company}</Text>
                </View>
                <View style={{ backgroundColor: cfg.color + '22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Submitted</Text>
                <Text style={{ fontSize: 15, color: C.label }}>{submissionSheet.date}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Description</Text>
                <Text style={{ fontSize: 14, color: C.label, lineHeight: 21 }}>{submissionSheet.description}</Text>
              </View>
            </View>
          );
        })()}
      </BottomSheet>
    </ScrollView>
  );
}

// ── Live Mode Public View ─────────────────────────────────────────────────────

const LIVE_RATE_CARD = [
  { service: 'Speaking Engagement', rate: 'Starting at $5,000', desc: 'Keynote or panel for conferences, events, summits.' },
  { service: 'Brand Partnership', rate: 'Starting at $2,500/month', desc: 'Long-form partnership integrations for aligned brands.' },
  { service: 'Consulting — Sports Tech', rate: 'Starting at $500/hour', desc: 'Strategic advisory for sports organizations and tech companies.' },
  { service: 'Advisory Role', rate: 'Equity + retainer', desc: 'Board advisory for early-stage companies in sports, AI, and EdTech.' },
];

function LiveDealsView({ C, insets }: { C: any; insets: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 16 }}>
        <View style={{ gap: 4, paddingTop: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>Collaborate</Text>
          <Text style={{ fontSize: 14, color: C.secondary }}>Work with Sammy Kalejaiye</Text>
        </View>
        {/* CTA buttons */}
        <View style={{ gap: 10 }}>
          <Pressable style={{ backgroundColor: C.label, borderRadius: 14, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Submit a Proposal</Text>
          </Pressable>
          <Pressable style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.separator }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Book a Call</Text>
          </Pressable>
        </View>
        {/* Rate card */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Services & Rates</Text>
        {LIVE_RATE_CARD.map(item => (
          <View key={item.service} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{item.service}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>{item.rate}</Text>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function DealsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll: scrollHeaderOnScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const dataMode = useDataMode();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:deals');
  const isOwner = role === roleCycles[0];

  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(() => (TABS.includes(tabParam as Tab) ? (tabParam as Tab) : 'Pipeline'));
  const [showPills, setShowPills] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;

  const [deals, setDeals] = useState<PersonalDeal[]>([...PERSONAL_DEALS]);
  const [collapsedStages, setCollapsedStages] = useState<Set<CRMStage>>(() => new Set(['Won', 'Lost']));
  const [stageFilter, setStageFilter] = useState<CRMStage | null>(null);
  const toggleStageFilter = useCallback((stage: CRMStage) => {
    setStageFilter(prev => prev === stage ? null : stage);
  }, []);

  const [selectedDeal, setSelectedDeal]     = useState<PersonalDeal | null>(null);
  const [detailOpen, setDetailOpen]         = useState(false);
  const [moveStageOpen, setMoveStageOpen]   = useState(false);
  const [createOpen, setCreateOpen]         = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (tabParam && TABS.includes(tabParam as Tab)) {
      setTab(tabParam as Tab);
      setSelectedPill('All');
    }
  }, [tabParam]);

  // Reset owner-specific state when switching to follower role
  useEffect(() => {
    if (!isOwner) {
      setShowPills(false);
      pillsRevealAnim.setValue(0);
      setStageFilter(null);
      setSelectedPill('All');
    }
  }, [isOwner]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.nativeEvent.contentOffset.y > 20 ? hideFooter() : showFooter();
    scrollHeaderOnScroll(e);
  }, [scrollHeaderOnScroll]);

  const togglePills = () => {
    const next = !showPills;
    setShowPills(next);
    Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pillRowH = pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] });

  const switchTab = (t: Tab) => {
    setTab(t);
    setSelectedPill('All');
    if (t !== 'Pipeline') setStageFilter(null);
    if (showPills) { setShowPills(false); pillsRevealAnim.setValue(0); }
  };

  const navigateToPipeline = (stage: CRMStage) => {
    setStageFilter(stage);
    setTab('Pipeline');
    setSelectedPill('All');
    if (showPills) { setShowPills(false); pillsRevealAnim.setValue(0); }
  };

  const openDetail = (deal: PersonalDeal) => { setSelectedDeal(deal); setDetailOpen(true); };
  const openMoveStage = (deal: PersonalDeal) => { setSelectedDeal(deal); setMoveStageOpen(true); };

  const moveDeal = useCallback((dealId: string, newStage: CRMStage) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const toggleStage = useCallback((stage: CRMStage) => {
    setCollapsedStages(prev => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage); else next.add(stage);
      return next;
    });
  }, []);

  const scrollPadTop = topBarH + (showPills ? PILL_ROW_H : 0) + 8;
  const pills = TAB_PILLS[tab];

  // ── Live mode public view ──────────────────────────────────────────────────
  if (dataMode === 'live') return <LiveDealsView C={C} insets={insets} />;

  // ── Subscriber (Collaborate) view ──────────────────────────────────────────
  if (!isOwner) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={styles.topBtn}
            >
              <KMenuButton />
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={[styles.staticPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Collaborate</Text>
              </View>
            </View>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </Animated.View>

        <CollaborateView C={C} topBarH={topBarH} />
      </View>
    );
  }

  // ── Owner view ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={styles.topBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.label, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{tab}</Text>
            </View>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
        </View>
      </Animated.View>


      {/* Filter Pills (Pipeline / Insights only) */}
      <View style={[styles.pillRow, { height: pillRowH, top: topBarH, backgroundColor: C.bg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
          {pills.map(pill => (
            <Pressable
              key={pill}
              onPress={() => { setSelectedPill(pill); Haptics.selectionAsync(); }}
              style={[styles.pill, {
                backgroundColor: selectedPill === pill ? C.label : C.surface,
                borderColor: selectedPill === pill ? C.label : C.inputBorder,
              }]}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: selectedPill === pill ? C.bg : C.secondary }}>{pill}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>


      {/* Content */}
      {tab === 'Pipeline' && (
        <View style={{ flex: 1, marginTop: scrollPadTop, paddingHorizontal: 16 }}>
          {CLOSING_SOON.length > 0 && (
            <View style={{
              borderLeftWidth: 4, borderLeftColor: '#B8943E',
              backgroundColor: '#B8943E18',
              borderRadius: 12, padding: 14, marginBottom: 12,
              borderWidth: StyleSheet.hairlineWidth, borderColor: '#B8943E44',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconSymbol name="clock.fill" size={13} color="#B8943E" />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#B8943E', textTransform: 'uppercase', letterSpacing: 0.7 }}>Closing This Week</Text>
                <View style={{ marginLeft: 4, backgroundColor: '#B8943E', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{CLOSING_SOON.length}</Text>
                </View>
              </View>
              {CLOSING_SOON.map((deal, i) => (
                <View key={deal.id} style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 7,
                  borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
                  borderTopColor: '#B8943E33',
                }}>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{deal.title}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#B8943E', marginLeft: 12 }}>{formatDealValue(deal.value)}</Text>
                </View>
              ))}
            </View>
          )}
          {OVERDUE_TASKS.length > 0 && (
            <View style={{
              borderLeftWidth: 4, borderLeftColor: '#B85C5C',
              backgroundColor: '#B85C5C18',
              borderRadius: 12, padding: 14, marginBottom: 12,
              borderWidth: StyleSheet.hairlineWidth, borderColor: '#B85C5C44',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconSymbol name="exclamationmark.circle.fill" size={13} color="#B85C5C" />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#B85C5C', textTransform: 'uppercase', letterSpacing: 0.7 }}>Overdue Follow-Ups</Text>
                <View style={{ marginLeft: 4, backgroundColor: '#B85C5C', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{OVERDUE_TASKS.length}</Text>
                </View>
              </View>
              {OVERDUE_TASKS.slice(0, 3).map(({ task, deal }, i) => {
                const daysOver = Math.floor((Date.now() - task.dueDate.getTime()) / 86400000);
                return (
                  <View key={task.id} style={{
                    paddingVertical: 7,
                    borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
                    borderTopColor: '#B85C5C33',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{deal.title}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#B85C5C' }}>{daysOver}d overdue</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }} numberOfLines={1}>{task.title}</Text>
                  </View>
                );
              })}
            </View>
          )}
          <PipelineListView
            deals={deals}
            pill={selectedPill}
            stageFilter={stageFilter}
            onStageFilter={toggleStageFilter}
            collapsedStages={collapsedStages}
            onToggleStage={toggleStage}
            onDealPress={openDetail}
            onMoveDeal={openMoveStage}
            onScroll={handleScroll}
            C={C}
          />
        </View>
      )}
      {tab === 'Contacts' && (
        <View style={{ flex: 1, marginTop: scrollPadTop, paddingHorizontal: 16 }}>
          <ContactsTab deals={deals} C={C} />
        </View>
      )}
      {tab === 'Insights' && (
        <View style={{ flex: 1, paddingTop: scrollPadTop, paddingHorizontal: 16 }}>
          <InsightsTab C={C} onNavigateToPipeline={navigateToPipeline} />
        </View>
      )}

      {/* FAB */}
      {tab === 'Pipeline' && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCreateOpen(true);
          }}
          style={[styles.fab, { backgroundColor: C.label, bottom: insets.bottom + 80 }]}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

      {/* Sheets */}
      <DealDetailSheet
        deal={selectedDeal}
        visible={detailOpen}
        onClose={() => setDetailOpen(false)}
        onMoveStage={() => { setDetailOpen(false); setTimeout(() => setMoveStageOpen(true), 350); }}
        C={C}
      />
      <MoveStageSheet
        deal={selectedDeal}
        visible={moveStageOpen}
        onClose={() => setMoveStageOpen(false)}
        onSelect={(stage) => { if (selectedDeal) moveDeal(selectedDeal.id, stage); setMoveStageOpen(false); }}
        C={C}
      />
      <CreateDealSheet visible={createOpen} onClose={() => setCreateOpen(false)} C={C} />
      <AddContactSheet visible={addContactOpen} onClose={() => setAddContactOpen(false)} C={C} />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 8,
    height: 52,
  },
  topBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  staticPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, borderWidth: 1.5,
  },
  pillRow: {
    position: 'absolute', left: 0, right: 0, zIndex: 9, overflow: 'hidden',
    justifyContent: 'center',
  },
  pillScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
});
