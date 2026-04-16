/**
 * Inquiries — Contacts (CEO only)
 * Full CRM contacts — everyone the company has a relationship with
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, TextInput, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import {
  DEALS, BIZ_CONTACTS,
  getContactById, formatCurrency, formatDate, stageColor,
  type BizContact,
} from '@/data/mock-business-ops';

const TOP_BAR_H = 54;
const GAIN = '#5A8A6E';

type ContactFilter = 'All' | 'Clients' | 'Prospects' | 'Partners' | 'Vendors' | 'Press';
const FILTERS: ContactFilter[] = ['All', 'Clients', 'Prospects', 'Partners', 'Vendors', 'Press'];

export default function ContactsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:inquiries');
  const isCEO = role === roleCycles[0];

  const [query, setQuery]               = useState('');
  const [filter, setFilter]             = useState<ContactFilter>('All');
  const [selectedContactId, setSelected]= useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/inquiries/support' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const filtered = BIZ_CONTACTS.filter(c => {
    const q = query.toLowerCase();
    const matchQuery = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
    const matchFilter =
      filter === 'All'      ? true :
      filter === 'Clients'  ? c.isClient :
      filter === 'Prospects'? !c.isClient && c.dealIds.length > 0 :
      true; // Partners / Vendors / Press — show all as demo
    return matchQuery && matchFilter;
  });

  const selectedContact = selectedContactId ? getContactById(selectedContactId) : null;

  function renderContactDetail(contact: BizContact) {
    const contactDeals = DEALS.filter(d => contact.dealIds.includes(d.id));
    return (
      <View style={{ marginHorizontal: 16 }}>
        <Pressable onPress={() => setSelected(null)} style={[s.row, { marginBottom: 16 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary} />
          <Text style={{ fontSize: 13, color: C.secondary, marginLeft: 4 }}>Back to Contacts</Text>
        </Pressable>

        <View style={[s.detailCard, { backgroundColor: C.surface }]}>
          <View style={[s.row, { marginBottom: 16 }]}>
            <View style={[s.avatarLg, { backgroundColor: C.label }]}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.bg }}>{contact.initials}</Text>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{contact.name}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>{contact.title}</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>{contact.company}</Text>
              {contact.isClient && (
                <View style={{ backgroundColor: GAIN + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: GAIN }}>CLIENT</Text>
                </View>
              )}
            </View>
          </View>

          <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
            {[
              { label: 'Call',    icon: 'phone.fill'    },
              { label: 'Email',   icon: 'envelope.fill' },
              { label: 'Message', icon: 'message.fill'  },
            ].map(a => (
              <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[s.actionBtn, { flex: 1, backgroundColor: C.bg, borderColor: C.separator }]}>
                <IconSymbol name={a.icon as any} size={15} color={C.label} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginTop: 4 }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          {[
            { label: 'Email',   value: contact.email },
            { label: 'Phone',   value: contact.phone },
            { label: 'Added',   value: formatDate(contact.addedDate) },
          ].map((item, i) => (
            <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
              <Text style={{ fontSize: 13, color: C.secondary, width: 80 }}>{item.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }}>{item.value}</Text>
            </View>
          ))}

          {contactDeals.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Linked Deals</Text>
              {contactDeals.map((deal, i) => (
                <View key={deal.id} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stageColor(deal.stage), marginRight: 10 }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>{deal.title}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{formatCurrency(deal.value, true)}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Create Deal', 'Coming soon'); }}
            style={[s.primaryBtn, { backgroundColor: C.label, marginTop: 14 }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Create Deal</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Contacts</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >
        {selectedContact ? renderContactDetail(selectedContact) : (
          <>
            {/* Search */}
            <View style={[s.searchRow, { marginHorizontal: 16, backgroundColor: C.surface, borderColor: C.separator }]}>
              <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
              <TextInput
                style={[s.searchInput, { color: C.label }]}
                placeholder="Search contacts..."
                placeholderTextColor={C.secondary}
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
                </Pressable>
              )}
            </View>

            {/* Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
              {FILTERS.map(f => (
                <Pressable
                  key={f}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
                  style={[s.filterPill, { backgroundColor: filter === f ? C.label : C.surface, borderColor: filter === f ? C.label : C.separator }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.secondary }}>{f}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Contact list */}
            <GlassView tier={1} style={{ marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
              {filtered.map((contact, i) => {
                const activeDeals = DEALS.filter(d => contact.dealIds.includes(d.id) && d.stage !== 'Won' && d.stage !== 'Lost');
                return (
                  <Pressable
                    key={contact.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(contact.id); }}
                    style={({ pressed }) => [
                      s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={[s.avatarMd, { backgroundColor: C.label }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{contact.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={[s.row, { gap: 6 }]}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{contact.name}</Text>
                        {contact.isClient && (
                          <View style={{ backgroundColor: GAIN + '20', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: GAIN }}>CLIENT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{contact.title}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{contact.company}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      {activeDeals.length > 0 && (
                        <View style={{ backgroundColor: C.label + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: C.label }}>{activeDeals.length} deal{activeDeals.length > 1 ? 's' : ''}</Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 11, color: C.secondary }}>{formatDate(contact.addedDate)}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={12} color={C.secondary} />
                  </Pressable>
                );
              })}
            </GlassView>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {!selectedContact && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Contact', 'Coming soon'); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    searchRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 42, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    searchInput:   { flex: 1, fontSize: 15 },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    avatarMd:      { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    avatarLg:      { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    detailCard:    { borderRadius: 14, padding: 16 },
    actionBtn:     { alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
    primaryBtn:    { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
  });
}
