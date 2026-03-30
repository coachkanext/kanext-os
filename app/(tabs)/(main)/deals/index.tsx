/**
 * Personal Deals — Pipedrive-style creator CRM.
 * Pipeline (vertical grouped list) / Contacts / Insights tabs.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, SectionList, Pressable, StyleSheet, Platform,
  ActionSheetIOS, Animated, PanResponder, TextInput,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
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

const STAGE_COLORS: Record<CRMStage, string> = {
  Lead:        'rgba(45,30,18,0.30)',
  Contacted:   '#3B82F6',
  Proposal:    '#5A8A6E',
  Negotiation: '#1D9BF0',
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
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: pressed ? C.surfacePressed : C.surface,
        marginBottom: 8,
      })}
    >
      <View style={{ width: 4, backgroundColor: STAGE_COLORS[deal.stage] }} />
      <View style={{ flex: 1, paddingVertical: 11, paddingLeft: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
          <PriorityDot priority={deal.priority} />
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: C.label, lineHeight: 18 }} numberOfLines={2}>
            {deal.title}
          </Text>
        </View>
        {contact && (
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 3, marginLeft: 14 }}>{contact.company}</Text>
        )}
        {soon && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 14 }}>
            <IconSymbol name="clock" size={10} color="#B85C5C" />
            <Text style={{ fontSize: 10, color: '#B85C5C', fontWeight: '600' }}>Closing {formatCloseDate(deal.expectedClose)}</Text>
          </View>
        )}
      </View>
      <View style={{ paddingVertical: 11, paddingRight: 4, alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{formatDealValue(deal.value)}</Text>
        <Text style={{ fontSize: 10, color: C.muted }}>{formatRelativeDate(deal.lastActivity)}</Text>
      </View>
      <Pressable
        onPress={onMoveStage}
        hitSlop={8}
        style={{ width: 36, alignItems: 'center', justifyContent: 'center' }}
      >
        <IconSymbol name="ellipsis" size={16} color={C.muted} />
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
        paddingVertical: 10,
        backgroundColor: pressed ? C.surfacePressed : C.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.separator,
        marginBottom: 8,
      })}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: STAGE_COLORS[stage], marginRight: 8 }} />
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, flex: 1 }}>{stage}</Text>
      <View style={{
        minWidth: 22, height: 20, borderRadius: 10, backgroundColor: C.surfacePressed,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginRight: 8,
      }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{count}</Text>
      </View>
      {total > 0 && (
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginRight: 8 }}>
          {formatDealValue(total)}
        </Text>
      )}
      <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={13} color={C.muted} />
    </Pressable>
  );
}

// ── Stage Summary Bar ─────────────────────────────────────────────────────────

function StageSummaryBar({
  deals, onChipPress, C,
}: {
  deals: PersonalDeal[];
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
        return (
          <Pressable
            key={stage}
            onPress={() => onChipPress(stage)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 5,
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
              backgroundColor: pressed ? C.surfacePressed : C.surface,
              borderWidth: 1, borderColor: C.inputBorder,
            })}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STAGE_COLORS[stage] }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{stage}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>{stageDeals.length}</Text>
            {total > 0 && (
              <Text style={{ fontSize: 11, color: C.accent, fontWeight: '600' }}>{formatDealValue(total)}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Pipeline List View ────────────────────────────────────────────────────────

function PipelineListView({
  deals, pill, collapsedStages, onToggleStage, onDealPress, onMoveDeal, onScroll, C,
}: {
  deals: PersonalDeal[];
  pill: string;
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

  const sections: PipelineSection[] = useMemo(() =>
    CRM_STAGES.map(stage => {
      const allDeals = getDealsByStage(filtered, stage);
      return { stage, data: collapsedStages.has(stage) ? [] : allDeals, allDeals };
    }),
    [filtered, collapsedStages],
  );

  const scrollToStage = useCallback((stage: CRMStage) => {
    const idx = CRM_STAGES.indexOf(stage);
    if (idx < 0) return;
    try {
      listRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true, viewOffset: 0 });
    } catch {}
  }, []);

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
        <StageSummaryBar deals={filtered} onChipPress={scrollToStage} C={C} />
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
    '#1D9BF0';
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

function InsightsTab({ C }: { C: ReturnType<typeof useColors> }) {
  const chartMax = useMemo(() => Math.max(...MONTHLY_REVENUE.map(m => m.value), 1), []);
  const statCards = [
    { label: 'Pipeline',    value: `$${(INSIGHT_STATS.totalPipelineValue / 1000).toFixed(0)}K`, icon: 'chart.line.uptrend.xyaxis' },
    { label: 'Won / Mo',    value: formatDealValue(INSIGHT_STATS.wonValueThisMonth),             icon: 'checkmark.seal.fill' },
    { label: 'Win Rate',    value: `${INSIGHT_STATS.winRate}%`,                                  icon: 'percent' },
    { label: 'Avg Deal',    value: formatDealValue(INSIGHT_STATS.avgDealSize),                   icon: 'tag.fill' },
    { label: 'Avg Close',   value: `${INSIGHT_STATS.avgTimeToClose}d`,                           icon: 'calendar' },
    { label: 'Won This Mo', value: `${INSIGHT_STATS.wonThisMonth}`,                              icon: 'trophy.fill' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {statCards.map(sc => (
          <View key={sc.label} style={{ width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <IconSymbol name={sc.icon as any} size={18} color={C.accent} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginTop: 6 }}>{sc.value}</Text>
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{sc.label}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12 }}>Monthly Revenue</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 110, marginBottom: 20 }}>
        {MONTHLY_REVENUE.map(m => {
          const barH = chartMax > 0 ? Math.max(4, (m.value / chartMax) * 90) : 4;
          return (
            <View key={m.month} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 2 }}>{m.value > 0 ? `$${(m.value / 1000).toFixed(1)}K` : ''}</Text>
              <View style={{ width: '100%', height: barH, borderRadius: 4, backgroundColor: C.accent }} />
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{m.month}</Text>
            </View>
          );
        })}
      </View>

      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12 }}>Pipeline Funnel</Text>
      {CRM_STAGES.filter(s => s !== 'Lost').map(stage => {
        const count = getDealsByStage(PERSONAL_DEALS, stage).length;
        const maxCount = Math.max(...CRM_STAGES.map(s => getDealsByStage(PERSONAL_DEALS, s).length), 1);
        return (
          <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ width: 80, fontSize: 11, color: C.secondary }}>{stage}</Text>
            <View style={{ flex: 1, height: 24, backgroundColor: C.surface, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: `${(count / maxCount) * 100}%`, height: '100%', borderRadius: 6, backgroundColor: STAGE_COLORS[stage] }} />
            </View>
            <Text style={{ width: 20, fontSize: 11, fontWeight: '600', color: C.label, textAlign: 'right' }}>{count}</Text>
          </View>
        );
      })}

      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginTop: 20, marginBottom: 12 }}>Lead Sources</Text>
      {SOURCE_BREAKDOWN.map(src => (
        <View key={src.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Text style={{ width: 86, fontSize: 11, color: C.secondary }}>{src.label}</Text>
          <View style={{ flex: 1, height: 20, backgroundColor: C.surface, borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ width: `${src.pct}%`, height: '100%', borderRadius: 6, backgroundColor: C.accent + 'CC' }} />
          </View>
          <Text style={{ width: 32, fontSize: 11, fontWeight: '600', color: C.secondary, textAlign: 'right' }}>{src.pct}%</Text>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function DealsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;

  const [tab, setTab] = useState<Tab>('Pipeline');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPills, setShowPills] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;

  const [deals, setDeals] = useState<PersonalDeal[]>([...PERSONAL_DEALS]);
  const [collapsedStages, setCollapsedStages] = useState<Set<CRMStage>>(() => new Set(['Won', 'Lost']));

  const [selectedDeal, setSelectedDeal]     = useState<PersonalDeal | null>(null);
  const [detailOpen, setDetailOpen]         = useState(false);
  const [moveStageOpen, setMoveStageOpen]   = useState(false);
  const [createOpen, setCreateOpen]         = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.nativeEvent.contentOffset.y > 20 ? hideFooter() : showFooter();
  }, []);

  const togglePills = () => {
    const next = !showPills;
    setShowPills(next);
    Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pillRowH = pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] });

  const switchTab = (t: Tab) => {
    setTab(t);
    setDropdownOpen(false);
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

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <View style={[styles.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg }]}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={styles.topBtn}>
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Pressable
            onPress={() => { setDropdownOpen(o => !o); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.dropdownPill, { backgroundColor: C.surfacePressed, borderColor: C.inputBorder }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{tab}</Text>
            <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={11} color={C.muted} />
          </Pressable>
        </View>
        {/* Filter button — only for Pipeline/Insights (Contacts has internal filter) */}
        {tab !== 'Contacts' ? (
          <Pressable onPress={togglePills} style={styles.topBtn}>
            <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={showPills ? C.accent : C.label} />
          </Pressable>
        ) : (
          <View style={styles.topBtn} />
        )}
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <View style={[styles.dropdown, { top: topBarH + 4, backgroundColor: C.surface, borderColor: C.inputBorder }]}>
          {TABS.map(t => (
            <Pressable
              key={t}
              onPress={() => switchTab(t)}
              style={({ pressed }) => [styles.dropdownItem, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            >
              <Text style={{ fontSize: 14, fontWeight: tab === t ? '700' : '500', color: tab === t ? C.accent : C.label }}>{t}</Text>
              {tab === t && <IconSymbol name="checkmark" size={13} color={C.accent} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* Filter Pills (Pipeline / Insights only) */}
      <Animated.View style={[styles.pillRow, { height: pillRowH, top: topBarH, backgroundColor: C.bg }]}>
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
      </Animated.View>

      {/* Dropdown dismiss overlay */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => dropdownOpen && setDropdownOpen(false)}
        pointerEvents={dropdownOpen ? 'auto' : 'none'}
      />

      {/* Content */}
      {tab === 'Pipeline' && (
        <View style={{ flex: 1, marginTop: scrollPadTop, paddingHorizontal: 16 }}>
          <PipelineListView
            deals={deals}
            pill={selectedPill}
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
          <InsightsTab C={C} />
        </View>
      )}

      {/* FAB */}
      {(tab === 'Pipeline' || tab === 'Contacts') && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (tab === 'Pipeline') setCreateOpen(true);
            else setAddContactOpen(true);
          }}
          style={[styles.fab, { backgroundColor: C.accent, bottom: insets.bottom + 80 }]}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
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
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  topBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, borderWidth: 1.5,
  },
  dropdown: {
    position: 'absolute', left: 16, right: 16, zIndex: 99,
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
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
