/**
 * CRM Contacts List — Personal Deals, Owner only.
 * Full contact directory with filter pills, search, avatar grid, and Add Contact sheet.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import {
  PERSONAL_DEALS,
  CRM_CONTACTS,
  type CRMContact,
  type PersonalDeal,
  formatDealValue,
  getDealsByContact,
  formatRelativeDate,
} from '@/data/mock-personal-deals';
import { getContactDetail } from '@/data/mock-contact-details';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterPill = 'All' | 'Active Partners' | 'Past Partners' | 'Leads' | 'Press';

const FILTER_PILLS: FilterPill[] = ['All', 'Active Partners', 'Past Partners', 'Leads', 'Press'];

const PRESS_CONTACT_IDS = new Set<string>([]);

// ── Helpers ───────────────────────────────────────────────────────────────────

interface EnrichedContact {
  contact: CRMContact;
  deals: PersonalDeal[];
  activeDeals: PersonalDeal[];
  totalValue: number;
  lastInteraction: Date | null;
  category: FilterPill;
}

function getCategory(
  deals: PersonalDeal[],
  activeDeals: PersonalDeal[],
  contactId: string,
): FilterPill {
  if (PRESS_CONTACT_IDS.has(contactId)) return 'Press';
  if (deals.length === 0) return 'Leads';

  const leadStages = new Set(['Lead', 'Contacted']);
  const closedStages = new Set(['Won', 'Lost']);

  const allClosed = deals.every(d => closedStages.has(d.stage));
  const allLeadOrContacted = deals.every(d => leadStages.has(d.stage));

  if (allClosed) return 'Past Partners';
  if (allLeadOrContacted) return 'Leads';
  return 'Active Partners';
}

function getLastInteraction(deals: PersonalDeal[]): Date | null {
  if (deals.length === 0) return null;
  let latest: Date | null = null;
  for (const deal of deals) {
    for (const act of deal.activities) {
      if (!latest || act.timestamp > latest) latest = act.timestamp;
    }
    if (!latest || deal.lastActivity > latest) latest = deal.lastActivity;
  }
  return latest;
}

function enrichContacts(contacts: CRMContact[]): EnrichedContact[] {
  return contacts.map(contact => {
    const deals = getDealsByContact
      ? getDealsByContact(contact.id)
      : PERSONAL_DEALS.filter(d => d.contactId === contact.id);
    const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    const lastInteraction = getLastInteraction(deals);
    const category = getCategory(deals, activeDeals, contact.id);
    return { contact, deals, activeDeals, totalValue, lastInteraction, category };
  });
}

function sortContacts(enriched: EnrichedContact[]): EnrichedContact[] {
  return [...enriched].sort((a, b) => {
    const aActive = a.category === 'Active Partners';
    const bActive = b.category === 'Active Partners';
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    if (aActive && bActive) {
      const aVal = a.activeDeals.reduce((s, d) => s + d.value, 0);
      const bVal = b.activeDeals.reduce((s, d) => s + d.value, 0);
      return bVal - aVal;
    }
    const aPast = a.category === 'Past Partners';
    const bPast = b.category === 'Past Partners';
    if (aPast && !bPast) return -1;
    if (!aPast && bPast) return 1;
    return b.totalValue - a.totalValue;
  });
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ initials, hue, size = 44 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${hue}, 35%, 75%)`,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ fontSize: size * 0.31, fontWeight: '700', color: '#fff' }}>{initials}</Text>
    </View>
  );
}

// ── Contact Card ──────────────────────────────────────────────────────────────

function ContactCard({ enriched, onPress, C }: {
  enriched: EnrichedContact;
  onPress: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const { contact, activeDeals, totalValue, lastInteraction } = enriched;
  const detail = getContactDetail(contact.id);
  const title = detail?.title ?? '';
  const activeTotalValue = activeDeals.reduce((s, d) => s + d.value, 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginBottom: 10,
        borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.separator, padding: 14, gap: 12,
        backgroundColor: C.surface, opacity: pressed ? 0.75 : 1,
      })}
    >
      <Avatar initials={contact.initials} hue={contact.avatarHue} size={44} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }} numberOfLines={1}>{contact.name}</Text>
        <Text style={{ fontSize: 13, color: C.secondary }} numberOfLines={1}>{contact.company}</Text>
        {title ? <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={1}>{title}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        {lastInteraction ? (
          <Text style={{ fontSize: 12, color: C.secondary }}>{formatRelativeDate(lastInteraction)}</Text>
        ) : null}
        {activeDeals.length > 0 ? (
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{formatDealValue(activeTotalValue)}</Text>
        ) : totalValue > 0 ? (
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>{formatDealValue(totalValue)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ filter, C }: { filter: FilterPill; C: ReturnType<typeof useColors> }) {
  const subtexts: Record<FilterPill, string> = {
    'All':             'Add your first contact to get started.',
    'Active Partners': 'No contacts with active deals right now.',
    'Past Partners':   'Closed deals will appear here.',
    'Leads':           'Contacts at the Lead or Contacted stage appear here.',
    'Press':           'No press contacts added yet.',
  };
  return (
    <View style={{ alignItems: 'center', paddingTop: 64, paddingHorizontal: 40, gap: 10 }}>
      <IconSymbol name="person.badge.plus.fill" size={38} color={C.secondary} />
      <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginTop: 6 }}>No contacts yet</Text>
      <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>{subtexts[filter]}</Text>
    </View>
  );
}

// ── Add Contact Sheet ─────────────────────────────────────────────────────────

interface NewContactForm { name: string; company: string; role: string; email: string; phone: string; }
const EMPTY_FORM: NewContactForm = { name: '', company: '', role: '', email: '', phone: '' };

function AddContactSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ReturnType<typeof useColors> }) {
  const [form, setForm] = useState<NewContactForm>(EMPTY_FORM);
  const [nameError, setNameError] = useState(false);

  function handleSave() {
    if (!form.name.trim()) {
      setNameError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setForm(EMPTY_FORM);
    setNameError(false);
    onClose();
  }

  function handleClose() { setForm(EMPTY_FORM); setNameError(false); onClose(); }

  const inputStyle = (hasError?: boolean) => ({
    backgroundColor: C.surface, borderColor: hasError ? '#B85C5C' : C.separator,
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 15, color: C.label, marginBottom: 10,
  });

  return (
    <BottomSheet visible={visible} onClose={handleClose} useModal title="Add Contact">
      <View style={{ paddingHorizontal: 2, paddingBottom: 8 }}>
        <TextInput style={inputStyle(nameError)} placeholder="Name *" placeholderTextColor={nameError ? '#B85C5C' : C.secondary} value={form.name} onChangeText={v => { setForm(f => ({ ...f, name: v })); setNameError(false); }} autoCapitalize="words" returnKeyType="next" />
        <TextInput style={inputStyle()} placeholder="Company" placeholderTextColor={C.secondary} value={form.company} onChangeText={v => setForm(f => ({ ...f, company: v }))} autoCapitalize="words" returnKeyType="next" />
        <TextInput style={inputStyle()} placeholder="Role / Title" placeholderTextColor={C.secondary} value={form.role} onChangeText={v => setForm(f => ({ ...f, role: v }))} autoCapitalize="words" returnKeyType="next" />
        <TextInput style={inputStyle()} placeholder="Email" placeholderTextColor={C.secondary} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
        <TextInput style={inputStyle()} placeholder="Phone" placeholderTextColor={C.secondary} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" returnKeyType="done" />
        <Pressable onPress={handleSave} style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6, opacity: pressed ? 0.75 : 1 })}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Save Contact</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// ── FAB Options Sheet ─────────────────────────────────────────────────────────

function FabSheet({ visible, onClose, onAddManually, onImport, C }: { visible: boolean; onClose: () => void; onAddManually: () => void; onImport: () => void; C: ReturnType<typeof useColors> }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Add Contact">
      <View style={{ paddingBottom: 8 }}>
        <Pressable onPress={() => { onClose(); setTimeout(onAddManually, 300); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, opacity: pressed ? 0.7 : 1 })}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="person.fill.badge.plus" size={20} color={C.label} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Add Manually</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginTop: 1 }}>Enter contact details by hand</Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={C.secondary} />
        </Pressable>

        <Pressable onPress={() => { onClose(); setTimeout(onImport, 300); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, opacity: pressed ? 0.7 : 1 })}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="person.crop.circle.badge.checkmark" size={20} color={C.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Import from Phone</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginTop: 1 }}>Coming soon</Text>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>Soon</Text>
          </View>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ContactsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topBarH = insets.top + 52;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const [activeFilter, setActiveFilter] = useState<FilterPill>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [fabSheetVisible, setFabSheetVisible] = useState(false);
  const [addContactVisible, setAddContactVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const allEnriched = useMemo(() => sortContacts(enrichContacts(CRM_CONTACTS)), []);

  const filtered = useMemo(() => {
    let result = allEnriched;
    if (activeFilter !== 'All') result = result.filter(e => e.category === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.contact.name.toLowerCase().includes(q) ||
        e.contact.company.toLowerCase().includes(q) ||
        e.contact.email.toLowerCase().includes(q) ||
        e.contact.handle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allEnriched, activeFilter, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
        opacity,
      }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.label, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Contacts</Text>
            </View>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: topBarH + 12, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, backgroundColor: C.surface, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 }}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: C.label, paddingVertical: 0 }}
            placeholder="Search contacts..."
            placeholderTextColor={C.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 14 }}>
          {FILTER_PILLS.map(pill => {
            const active = activeFilter === pill;
            return (
              <Pressable
                key={pill}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(pill); }}
                style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: active ? C.label : C.separator }}
              >
                <Text style={{ fontSize: 13, fontWeight: active ? '700' : '400', color: active ? C.bg : C.secondary }}>{pill}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtered.length > 0 && (
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginHorizontal: 16, marginBottom: 8, letterSpacing: 0.2 }}>
            {filtered.length} {filtered.length === 1 ? 'contact' : 'contacts'}
          </Text>
        )}

        {filtered.length === 0 ? (
          <EmptyState filter={activeFilter} C={C} />
        ) : (
          filtered.map(enriched => (
            <ContactCard
              key={enriched.contact.id}
              enriched={enriched}
              onPress={() => { Haptics.selectionAsync(); router.push(`/(tabs)/(main)/deals/contact?id=${enriched.contact.id}` as any); }}
              C={C}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setFabSheetVisible(true); }}
        style={({ pressed }) => ({ position: 'absolute', right: 20, bottom: insets.bottom + 80, width: 56, height: 56, borderRadius: 28, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 })}
      >
        <IconSymbol name="plus" size={24} color={C.bg} />
      </Pressable>

      <FabSheet visible={fabSheetVisible} onClose={() => setFabSheetVisible(false)} onAddManually={() => setAddContactVisible(true)} onImport={() => setImportVisible(true)} C={C} />
      <AddContactSheet visible={addContactVisible} onClose={() => setAddContactVisible(false)} C={C} />
      <BottomSheet visible={importVisible} onClose={() => setImportVisible(false)} useModal title="Import from Phone">
        <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 }}>
          <IconSymbol name="person.crop.circle.badge.checkmark" size={44} color={C.secondary} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginTop: 16, marginBottom: 8 }}>Coming Soon</Text>
          <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>Contact import from your phone's address book will be available in a future update.</Text>
          <Pressable onPress={() => setImportVisible(false)} style={({ pressed }) => ({ marginTop: 28, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Got It</Text>
          </Pressable>
        </View>
      </BottomSheet>

    </View>
  );
}
