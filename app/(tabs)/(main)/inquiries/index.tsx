/**
 * Business Inquiries — Pipeline / Contacts / Campaigns
 * KaNeXT Operations LLC
 * RBAC demo: CEO sees full CRM pipeline + lead scoring + forecast;
 * Client sees their engagement card, proposals, invoices, shared docs.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Animated, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDataMode } from '@/utils/global-demo-mode';
import {
  DEALS, BIZ_CONTACTS, CAMPAIGNS, BIZ_DASHBOARD, ACTIVITY_FEED,
  getContactById, getEmployeeById,
  formatCurrency, formatDate, stageColor,
  type Deal, type DealStage, type BizContact, type Campaign,
} from '@/data/mock-business-ops';

const TOP_BAR_H  = 52;
const PILLS_H    = 48;
const ACCENT_INQ = '#1A1714';

type InqTab  = 'Pipeline' | 'Contacts' | 'Campaigns';
type InqRole = 'CEO' | 'Client';

const PIPELINE_STAGES: DealStage[] = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

function pillsForTab(tab: InqTab): string[] {
  if (tab === 'Pipeline') return ['All', 'New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  if (tab === 'Contacts') return ['All', 'Active Deals', 'Clients', 'Past'];
  return [];
}

function dealStageBg(stage: DealStage): string {
  const colors: Record<DealStage, string> = {
    New:         'rgba(45,30,18,0.08)',
    Qualified:   '#1A171420',
    Proposal:    '#1A171420',
    Negotiation: '#1A171420',
    Won:         '#5A8A6E20',
    Lost:        '#B85C5C20',
  };
  return colors[stage];
}

function LiveInquiriesView({ C, insets }: { C: any; insets: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 16 }}>
        <View style={{ gap: 4, paddingTop: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>Contact Us</Text>
          <Text style={{ fontSize: 14, color: C.secondary }}>We'd love to hear from you. Fill out the form below.</Text>
        </View>
        {[
          { label: 'Your Name', placeholder: 'Full name' },
          { label: 'Email', placeholder: 'you@company.com' },
          { label: 'Company / Organization', placeholder: 'Optional' },
        ].map(field => (
          <View key={field.label} style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>{field.label}</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, padding: 14 }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>{field.placeholder}</Text>
            </View>
          </View>
        ))}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Message</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, padding: 14, height: 100 }}>
            <Text style={{ fontSize: 14, color: C.secondary }}>Tell us how we can help...</Text>
          </View>
        </View>
        <Pressable style={{ backgroundColor: C.label, borderRadius: 14, padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Send Message</Text>
        </Pressable>
        <View style={{ gap: 8, paddingTop: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Or reach us directly</Text>
          <Text style={{ fontSize: 14, color: C.label }}>hello@kanext.io</Text>
          <Text style={{ fontSize: 14, color: C.label }}>kanext.io</Text>
          <Text style={{ fontSize: 14, color: C.label }}>Miami, FL</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function InquiriesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const dataMode = useDataMode();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab,    setActiveTab]    = useState<InqTab>('Pipeline');
  const [role,         setRole]         = useState<InqRole>('CEO');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;

  const [selectedDealId,    setSelectedDealId]    = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [collapsedStages,   setCollapsedStages]   = useState<Set<DealStage>>(new Set(['Won', 'Lost']));
  const [searchQuery,       setSearchQuery]       = useState('');

  const isCEO = role === 'CEO';

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const pills = useMemo(() => (isCEO ? pillsForTab(activeTab) : []), [activeTab, isCEO]);

  function togglePills() {
    Haptics.selectionAsync();
    const next = !pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: InqTab) {
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    setSelectedPill('All');
    setSelectedDealId(null);
    setSelectedContactId(null);
    const newPills = pillsForTab(tab);
    if (!newPills.length) {
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  function toggleStage(stage: DealStage) {
    Haptics.selectionAsync();
    setCollapsedStages(prev => {
      const next = new Set(prev);
      next.has(stage) ? next.delete(stage) : next.add(stage);
      return next;
    });
  }

  const contentPaddingTop = topBarH + (isCEO && pillsVisible ? PILLS_H : 0) + 8;

  // ── PIPELINE ─────────────────────────────────────────────────────────────────

  const activePipelineValue = useMemo(
    () => DEALS.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').reduce((s, d) => s + d.value, 0),
    [],
  );

  const closingSoon = useMemo(
    () => DEALS.filter(d => {
      if (d.stage === 'Won' || d.stage === 'Lost') return false;
      const close = new Date(d.expectedClose);
      const today = new Date('2026-03-26');
      const diff  = (close.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff >= 0;
    }),
    [],
  );

  if (dataMode === 'live') return <LiveInquiriesView C={C} insets={insets} />;

  function renderDealDetail(deal: Deal) {
    const contact  = getContactById(deal.contactId);
    const assignee = getEmployeeById(deal.assigneeId);
    return (
      <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 12 }]}>
        <Pressable onPress={() => setSelectedDealId(null)} style={[s.row, { marginBottom: 12 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary as string} />
          <Text style={[s.bodySmall, { color: C.secondary as string, marginLeft: 4 }]}>Back to Pipeline</Text>
        </Pressable>

        <View style={[s.row, { marginBottom: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{deal.title}</Text>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>{deal.company}</Text>
          </View>
          <View style={[s.stageBadge, { backgroundColor: dealStageBg(deal.stage), borderColor: stageColor(deal.stage) }]}>
            <Text style={[s.stageBadgeText, { color: stageColor(deal.stage) }]}>{deal.stage}</Text>
          </View>
        </View>

        <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
          {[
            { label: 'Value',    value: formatCurrency(deal.value, true), color: C.accent },
            { label: 'Close',    value: formatDate(deal.expectedClose),   color: C.label },
            { label: 'Prob',     value: `${deal.probability}%`,          color: deal.probability > 60 ? C.green : C.secondary as string },
          ].map(m => (
            <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
              <Text style={[s.bodyMed, { color: m.color }]}>{m.value}</Text>
              <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        {[
          { label: 'Contact',   value: contact?.name ?? '—' },
          { label: 'Assignee',  value: assignee?.name ?? '—' },
          { label: 'Last Activity', value: formatDate(deal.lastActivity) },
          { label: 'Notes',     value: deal.notes },
        ].map((item, i) => (
          <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
            <Text style={[s.bodySmall, { color: C.muted as string, width: 100 }]}>{item.label}</Text>
            <Text style={[s.bodyMed, { color: C.label, flex: 1 }]} numberOfLines={2}>{item.value}</Text>
          </View>
        ))}

        {/* Timeline stub */}
        <View style={{ marginTop: 14 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>Timeline</Text>
          {[
            { label: 'Deal added',          date: '2026-01-15', color: C.muted as string },
            { label: 'First contact made',  date: '2026-01-22', color: '#1A1714' },
            { label: 'Proposal sent',       date: deal.stage !== 'New' ? '2026-02-10' : '—', color: C.accent },
          ].map((tl, i) => (
            <View key={i} style={[s.row, { gap: 10, paddingVertical: 7 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tl.color }} />
              <Text style={[s.bodySmall, { color: C.label, flex: 1 }]}>{tl.label}</Text>
              <Text style={[s.bodySmall, { color: C.muted as string }]}>{tl.date !== '—' ? formatDate(tl.date) : '—'}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={[s.row, { marginTop: 14, gap: 8 }]}>
          {[
            { label: 'Log Activity', icon: 'pencil' },
            { label: 'Move Stage',   icon: 'arrow.right.circle' },
            { label: 'Mark Won',     icon: 'checkmark.seal' },
          ].map(a => (
            <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[s.outlineBtn, { flex: 1, gap: 4, borderColor: C.inputBorder as string }]}>
              <IconSymbol name={a.icon as any} size={14} color={C.accent} />
              <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 11 }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </GlassView>
    );
  }

  function renderPipeline() {
    if (selectedDealId) {
      const deal = DEALS.find(d => d.id === selectedDealId);
      if (deal) return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingTop: contentPaddingTop }}>
            {renderDealDetail(deal)}
          </View>
        </ScrollView>
      );
    }

    const filterStage = selectedPill !== 'All' ? selectedPill as DealStage : null;
    const stagesToShow = filterStage ? [filterStage] : PIPELINE_STAGES;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 100 }}>
        {/* Summary bar */}
        <View style={[s.row, { gap: 8, paddingHorizontal: 16, marginBottom: 12 }]}>
          {[
            { label: 'Pipeline',  value: formatCurrency(activePipelineValue, true), color: C.accent },
            { label: 'Open Deals', value: `${DEALS.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length}`, color: '#1A1714' },
            { label: 'Closing Soon', value: `${closingSoon.length}`, color: '#1A1714' },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.dealMetricChip, { flex: 1 }]}>
              <Text style={[s.bodyMed, { color: m.color, fontSize: 16 }]}>{m.value}</Text>
              <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 11 }]}>{m.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Stage groups */}
        {stagesToShow.map(stage => {
          const stageDeals = DEALS.filter(d => d.stage === stage);
          if (stageDeals.length === 0) return null;
          const isCollapsed = collapsedStages.has(stage);
          const stageVal    = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <View key={stage} style={{ marginHorizontal: 16, marginBottom: 12 }}>
              {/* Stage header */}
              <Pressable
                onPress={() => toggleStage(stage)}
                style={[s.stageHeader, { backgroundColor: dealStageBg(stage), borderLeftColor: stageColor(stage) }]}
              >
                <View style={[s.row, { gap: 8 }]}>
                  <View style={[s.stageDot, { backgroundColor: stageColor(stage) }]} />
                  <Text style={[s.bodyMed, { color: C.label }]}>{stage}</Text>
                  <View style={[s.countBadge, { backgroundColor: stageColor(stage) }]}>
                    <Text style={s.countBadgeText}>{stageDeals.length}</Text>
                  </View>
                </View>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>{formatCurrency(stageVal, true)}</Text>
                <IconSymbol name={isCollapsed ? 'chevron.down' : 'chevron.up'} size={12} color={C.muted as string} />
              </Pressable>

              {/* Deals */}
              {!isCollapsed && (
                <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden' }}>
                  {stageDeals.map((deal, i) => {
                    const contact = getContactById(deal.contactId);
                    return (
                      <Pressable
                        key={deal.id}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDealId(deal.id); }}
                        style={({ pressed }) => [
                          s.row, { padding: 14, gap: 12 },
                          i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                          pressed && { backgroundColor: C.surfacePressed as string },
                        ]}
                      >
                        <View style={[s.avatarMd, { backgroundColor: contact ? `hsl(${contact.hue},45%,28%)` : '#1A1714' }]}>
                          <Text style={s.avatarMdText}>{contact?.initials ?? '??'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{deal.title}</Text>
                          <Text style={[s.bodySmall, { color: C.secondary as string }]} numberOfLines={1}>{deal.company}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 3 }}>
                          <Text style={[s.bodyMed, { color: C.accent }]}>{formatCurrency(deal.value, true)}</Text>
                          <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]}>Close {formatDate(deal.expectedClose)}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={12} color={C.muted as string} />
                      </Pressable>
                    );
                  })}
                </GlassView>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // ── CONTACTS ─────────────────────────────────────────────────────────────────

  function renderContactProfile(contact: BizContact) {
    const contactDeals = DEALS.filter(d => contact.dealIds.includes(d.id));
    return (
      <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 12 }]}>
        <Pressable onPress={() => setSelectedContactId(null)} style={[s.row, { marginBottom: 12 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary as string} />
          <Text style={[s.bodySmall, { color: C.secondary as string, marginLeft: 4 }]}>Back to Contacts</Text>
        </Pressable>

        <View style={[s.row, { gap: 14, marginBottom: 14 }]}>
          <View style={[s.avatarLg, { backgroundColor: `hsl(${contact.hue},45%,28%)` }]}>
            <Text style={s.avatarLgText}>{contact.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{contact.name}</Text>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>{contact.title}</Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>{contact.company}</Text>
            {contact.isClient && (
              <View style={{ backgroundColor: `${C.green}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: C.green }}>CLIENT</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
          {[
            { icon: 'phone.fill',    label: 'Call' },
            { icon: 'envelope.fill', label: 'Email' },
            { icon: 'message.fill',  label: 'Message' },
          ].map(a => (
            <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[s.actionBtn, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
              <IconSymbol name={a.icon as any} size={16} color={C.accent} />
              <Text style={{ fontSize: 11, color: C.secondary as string, marginTop: 3 }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {contactDeals.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>Linked Deals</Text>
            {contactDeals.map((deal, i) => (
              <Pressable key={deal.id} onPress={() => { setSelectedDealId(deal.id); setActiveTab('Pipeline'); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 10, gap: 10 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                ]}>
                <View style={[s.stageDot, { backgroundColor: stageColor(deal.stage) }]} />
                <Text style={[s.bodyMed, { color: C.label, flex: 1 }]} numberOfLines={1}>{deal.title}</Text>
                <Text style={[s.bodySmall, { color: C.accent }]}>{formatCurrency(deal.value, true)}</Text>
                <View style={[s.stageBadge, { backgroundColor: dealStageBg(deal.stage), borderColor: stageColor(deal.stage) }]}>
                  <Text style={[s.stageBadgeText, { color: stageColor(deal.stage) }]}>{deal.stage}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ gap: 0 }}>
          {[
            { label: 'Email',    value: contact.email },
            { label: 'Phone',    value: contact.phone },
            { label: 'Added',    value: formatDate(contact.addedDate) },
          ].map((item, i) => (
            <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <Text style={[s.bodySmall, { color: C.muted as string, width: 80 }]}>{item.label}</Text>
              <Text style={[s.bodyMed, { color: C.label, flex: 1 }]} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </View>
      </GlassView>
    );
  }

  function renderContacts() {
    if (selectedContactId) {
      const contact = getContactById(selectedContactId);
      if (contact) return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingTop: contentPaddingTop }}>
            {renderContactProfile(contact)}
          </View>
        </ScrollView>
      );
    }

    let filteredContacts = BIZ_CONTACTS;
    if (selectedPill === 'Active Deals') filteredContacts = BIZ_CONTACTS.filter(c => c.dealIds.some(did => { const d = DEALS.find(x => x.id === did); return d && d.stage !== 'Won' && d.stage !== 'Lost'; }));
    if (selectedPill === 'Clients')      filteredContacts = BIZ_CONTACTS.filter(c => c.isClient);
    if (selectedPill === 'Past')         filteredContacts = BIZ_CONTACTS.filter(c => c.dealIds.every(did => { const d = DEALS.find(x => x.id === did); return !d || d.stage === 'Won' || d.stage === 'Lost'; }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredContacts = filteredContacts.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 100 }}>
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder as string, marginHorizontal: 16, marginBottom: 12 }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted as string} />
          <TextInput style={[s.searchInput, { color: C.label }]} placeholder="Search contacts..." placeholderTextColor={C.muted as string} value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <GlassView tier={1} style={[s.card, { marginHorizontal: 16 }]}>
          {filteredContacts.map((contact, i) => {
            const activeDeals = DEALS.filter(d => contact.dealIds.includes(d.id) && d.stage !== 'Won' && d.stage !== 'Lost');
            return (
              <Pressable
                key={contact.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedContactId(contact.id); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 12, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                ]}
              >
                <View style={[s.avatarMd, { backgroundColor: `hsl(${contact.hue},45%,28%)` }]}>
                  <Text style={s.avatarMdText}>{contact.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[s.row, { gap: 6 }]}>
                    <Text style={[s.bodyMed, { color: C.label }]}>{contact.name}</Text>
                    {contact.isClient && <View style={{ backgroundColor: `${C.green}20`, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}><Text style={{ fontSize: 9, fontWeight: '700', color: C.green }}>CLIENT</Text></View>}
                  </View>
                  <Text style={[s.bodySmall, { color: C.secondary as string }]} numberOfLines={1}>{contact.title}</Text>
                  <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]} numberOfLines={1}>{contact.company}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  {activeDeals.length > 0 && (
                    <View style={{ backgroundColor: `${C.accent}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.accent }}>{activeDeals.length} deal{activeDeals.length > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={12} color={C.muted as string} />
                </View>
              </Pressable>
            );
          })}
        </GlassView>
      </ScrollView>
    );
  }

  // ── CAMPAIGNS ────────────────────────────────────────────────────────────────

  const campTypeColor = (type: string): string => {
    switch (type) {
      case 'email':   return '#1A1714';
      case 'text':    return C.green as string;
      case 'phone':   return '#1A1714';
      case 'digital': return '#1A1714';
      case 'event':   return C.accent as string;
      default: return C.accent as string;
    }
  };

  const campProgress = (camp: typeof CAMPAIGNS[0]): number => {
    switch (camp.type) {
      case 'email': case 'text': return Math.min(100, Math.round(((camp.replied ?? 0) / camp.target) * 100));
      case 'phone':    return Math.min(100, Math.round(((camp.meetings ?? 0) / camp.target) * 100));
      case 'digital':  return Math.min(100, Math.round(((camp.connections ?? 0) / camp.target) * 100));
      case 'event':    return Math.min(100, Math.round(((camp.converted ?? 0) / camp.target) * 100));
      default: return 0;
    }
  };

  const campTargetLabel = (type: string): string => {
    switch (type) {
      case 'email': case 'text': return 'replies';
      case 'phone':    return 'meetings';
      case 'digital':  return 'connections';
      case 'event':    return 'conversions';
      default: return 'goal';
    }
  };

  const totalSent    = CAMPAIGNS.reduce((s, c) => s + (c.sent ?? 0), 0);
  const totalReplied = CAMPAIGNS.reduce((s, c) => s + (c.replied ?? 0), 0);
  const replyRatePct = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  const RECENT_REPLIES = [
    { id: 'rr1', name: 'Jim Hayes',    company: 'Tougaloo College (NAIA AD)',  campaign: 'NAIA Mandate Outreach',       time: '2h ago',  snippet: '"Interested in a demo — when are you available?"',  hue: 210, initials: 'JH' },
    { id: 'rr2', name: 'Marcus Webb',  company: 'Minnect Network',            campaign: 'Minnect Outreach',           time: '4h ago',  snippet: '"Ready to hop on a call this week."',               hue: 140, initials: 'MW' },
    { id: 'rr3', name: 'Dr. Lisa Park', company: 'Park Capital Group',        campaign: 'LinkedIn Investor Campaign', time: '1d ago',  snippet: '"Sent you some follow-up questions via email."',    hue: 280, initials: 'LP' },
    { id: 'rr4', name: 'Coach T. Reed', company: 'Lane College Athletics',    campaign: 'School Network Cold Outreach', time: '1d ago', snippet: '"We use a competitor — open to hearing more."',  hue: 30,  initials: 'TR' },
  ];

  const SCHEDULED_SENDS = [
    { id: 'ss1', campaign: 'Minnect Outreach',             action: 'Follow-up batch (8 texts)',   time: 'Tomorrow 9 AM',   icon: 'message.fill',   color: C.green as string },
    { id: 'ss2', campaign: 'School Network Cold Outreach', action: 'Batch #2 (45 emails)',        time: 'Mar 28, 10 AM',   icon: 'envelope.fill',  color: '#1A1714' },
    { id: 'ss3', campaign: 'NAIA Mandate Outreach',        action: 'Batch #4 (30 emails)',        time: 'Mar 30, 8 AM',    icon: 'envelope.fill',  color: '#1A1714' },
    { id: 'ss4', campaign: 'LinkedIn Investor Campaign',   action: 'Product update post',         time: 'Mar 28, 2 PM',    icon: 'network',        color: '#1A1714' },
  ];

  const SUGGESTED_ACTIONS = [
    { id: 'sa1', label: '5 contacts not followed up in 7+ days', icon: 'clock.badge.exclamationmark', color: C.red as string, cta: 'View Contacts' },
    { id: 'sa2', label: 'NAIA Mandate Outreach reply rate below target — consider phone follow-up', icon: 'phone.badge.plus', color: '#1A1714', cta: 'Log Call' },
    { id: 'sa3', label: '12 new LinkedIn connections — send intro DMs now while warm', icon: 'person.2.badge.plus', color: '#1A1714', cta: 'Draft DM' },
    { id: 'sa4', label: 'Governing Body Direct: 2 meetings scheduled — add to pipeline', icon: 'arrow.right.circle.fill', color: C.accent as string, cta: 'Add Deals' },
  ];

  function renderCampaigns() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 120 }}>

        {/* Stats row */}
        <View style={[s.row, { gap: 8, paddingHorizontal: 16, marginBottom: 12 }]}>
          {[
            { label: 'Active',      value: `${CAMPAIGNS.filter(c => c.status === 'active').length}`,       color: C.green },
            { label: 'Total Sent',  value: `${totalSent}`,                                                  color: C.label },
            { label: 'Replies',     value: `${totalReplied}`,                                               color: C.accent },
            { label: 'Reply Rate',  value: `${replyRatePct}%`,                                              color: '#1A1714' },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.dealMetricChip, { flex: 1 }]}>
              <Text style={[s.bodyMed, { color: m.color, fontSize: 16 }]}>{m.value}</Text>
              <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Campaign cards */}
        {CAMPAIGNS.map(camp => {
          const assignee  = camp.assigneeId ? getEmployeeById(camp.assigneeId) : null;
          const typeColor = campTypeColor(camp.type);
          const progress  = campProgress(camp);
          return (
            <View key={camp.id} style={{ marginHorizontal: 16, marginBottom: 12 }}>
              <GlassView tier={1} style={s.card}>
                {/* Header */}
                <View style={[s.row, { marginBottom: 8 }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[s.bodyMed, { color: C.label, fontSize: 15 }]}>{camp.name}</Text>
                    <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]} numberOfLines={2}>{camp.description}</Text>
                  </View>
                  <View style={[s.typeBadge, { backgroundColor: `${typeColor}20`, borderColor: typeColor }]}>
                    <Text style={[s.typeBadgeText, { color: typeColor }]}>{camp.type}</Text>
                  </View>
                </View>

                {/* Email stats */}
                {camp.type === 'email' && (
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    {[
                      { label: 'Sent',    value: camp.sent ?? 0,    pct: null },
                      { label: 'Opened',  value: camp.opened ?? 0,  pct: camp.sent ? Math.round(((camp.opened ?? 0) / camp.sent) * 100) : 0 },
                      { label: 'Replied', value: camp.replied ?? 0, pct: camp.sent ? Math.round(((camp.replied ?? 0) / camp.sent) * 100) : 0 },
                    ].map(m => (
                      <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{m.value}</Text>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}{m.pct !== null ? ` (${m.pct}%)` : ''}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Text stats */}
                {camp.type === 'text' && (
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    {[
                      { label: 'Texts Sent', value: camp.sent ?? 0 },
                      { label: 'Replied',    value: camp.replied ?? 0 },
                      { label: 'Reply Rate', value: camp.sent ? `${Math.round(((camp.replied ?? 0) / camp.sent) * 100)}%` : '0%' },
                    ].map(m => (
                      <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{m.value}</Text>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Phone stats */}
                {camp.type === 'phone' && (
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    {[
                      { label: 'Calls Made',    value: camp.calls ?? 0 },
                      { label: 'Mtgs Booked',   value: camp.meetings ?? 0 },
                      { label: 'Target',         value: camp.target },
                    ].map(m => (
                      <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{m.value}</Text>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Digital stats */}
                {(camp.type === 'digital' || camp.type === 'social') && (
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    {[
                      { label: 'Impressions',   value: camp.impressions ?? 0 },
                      { label: 'Connections',   value: camp.connections ?? 0 },
                      { label: 'Target',         value: camp.target },
                    ].map(m => (
                      <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{m.value}</Text>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Event stats */}
                {camp.type === 'event' && (camp.registered !== undefined ? (
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    {[
                      { label: 'Registered', value: camp.registered ?? 0 },
                      { label: 'Converted',  value: camp.converted ?? 0 },
                      { label: 'Target',     value: camp.target },
                    ].map(m => (
                      <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{m.value}</Text>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    {[
                      { label: 'Conferences', value: camp.conferences ?? 0 },
                      { label: 'Upcoming',    value: camp.upcoming ?? 0 },
                      { label: 'Converted',   value: camp.converted ?? 0 },
                    ].map(m => (
                      <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
                        <Text style={[s.bodyMed, { color: C.label }]}>{m.value}</Text>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                ))}

                {/* Progress bar */}
                <View style={{ marginTop: 12 }}>
                  <View style={[s.progressBarBg, { backgroundColor: C.surfacePressed as string }]}>
                    <View style={[s.progressBarFill, { backgroundColor: typeColor, width: `${progress}%` as any }]} />
                  </View>
                  <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 4, fontSize: 11 }]}>
                    {progress}% toward goal · {camp.target} {campTargetLabel(camp.type)}
                  </Text>
                </View>

                {/* Last activity + assignee + next action */}
                <View style={[{ marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string, gap: 6 }]}>
                  <View style={[s.row, { gap: 8 }]}>
                    <IconSymbol name="clock" size={12} color={C.muted as string} />
                    <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 12, flex: 1 }]}>
                      Last activity {camp.lastActivity ? formatDate(camp.lastActivity) : '—'}
                    </Text>
                    {assignee && (
                      <View style={[s.row, { gap: 5 }]}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: `hsl(${assignee.hue ?? 30},45%,28%)` }}>
                          <Text style={{ fontSize: 8, fontWeight: '700', color: '#fff' }}>{assignee.initials}</Text>
                        </View>
                        <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 11 }]}>{assignee.name.split(' ')[0]}</Text>
                      </View>
                    )}
                  </View>
                  {camp.nextAction && (
                    <View style={[s.row, { gap: 8 }]}>
                      <IconSymbol name="arrow.right.circle" size={12} color={typeColor} />
                      <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 12 }]} numberOfLines={1}>{camp.nextAction}</Text>
                    </View>
                  )}
                </View>
              </GlassView>
            </View>
          );
        })}

        {/* ── Campaign Performance Summary ──────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Performance Summary</Text>
          <GlassView tier={1} style={s.card}>
            <View style={[s.row, { marginBottom: 12, gap: 10 }]}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${C.green}20`, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="trophy.fill" size={18} color={C.green as string} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]}>Best Performer</Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>Minnect Outreach — 44% reply rate</Text>
              </View>
              <View style={{ backgroundColor: `${C.green}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.green }}>44%</Text>
              </View>
            </View>
            {[
              { label: 'Email avg reply rate',    yours: '6%',  bench: '3%',  better: true },
              { label: 'Text avg reply rate',     yours: '44%', bench: '15%', better: true },
              { label: 'Email open rate',         yours: `${Math.round((45 / 200) * 100)}%`,  bench: '22%', better: true },
            ].map((row, i) => (
              <View key={row.label} style={[s.row, { paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <Text style={[s.bodySmall, { color: C.secondary as string, flex: 1 }]}>{row.label}</Text>
                <Text style={[s.bodyMed, { color: row.better ? C.green : C.red, marginRight: 8 }]}>{row.yours}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]}>Bench {row.bench}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* ── Recent Replies ────────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <View style={[s.row, { marginBottom: 8, paddingHorizontal: 2 }]}>
            <Text style={[s.subHeader, { color: C.secondary as string, flex: 1 }]}>Recent Replies</Text>
            <View style={{ backgroundColor: `${C.red}20`, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.red }}>HOT LEADS</Text>
            </View>
          </View>
          <GlassView tier={1} style={{ borderRadius: 16, overflow: 'hidden' }}>
            {RECENT_REPLIES.map((reply, i) => (
              <Pressable key={reply.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [
                  s.row, { padding: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                ]}>
                <View style={[s.avatarMd, { backgroundColor: `hsl(${reply.hue},45%,28%)` }]}>
                  <Text style={s.avatarMdText}>{reply.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[s.row, { gap: 6, marginBottom: 2 }]}>
                    <Text style={[s.bodyMed, { color: C.label }]}>{reply.name}</Text>
                    <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]}>{reply.time}</Text>
                  </View>
                  <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 12 }]} numberOfLines={1}>{reply.company}</Text>
                  <Text style={[s.bodySmall, { color: C.label, fontSize: 12, marginTop: 3, fontStyle: 'italic' }]} numberOfLines={2}>{reply.snippet}</Text>
                </View>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={{ backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Reply</Text>
                </Pressable>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* ── Scheduled Sends ───────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Scheduled Sends</Text>
          <GlassView tier={1} style={{ borderRadius: 16, overflow: 'hidden' }}>
            {SCHEDULED_SENDS.map((send, i) => (
              <View key={send.id} style={[
                s.row, { padding: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
              ]}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${send.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={send.icon as any} size={15} color={send.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11, marginBottom: 1 }]}>{send.campaign}</Text>
                  <Text style={[s.bodyMed, { color: C.label, fontSize: 13 }]}>{send.action}</Text>
                </View>
                <View style={{ backgroundColor: C.surfacePressed as string, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary as string }}>{send.time}</Text>
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* ── Suggested Actions ─────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Suggested Actions</Text>
          <View style={{ gap: 8 }}>
            {SUGGESTED_ACTIONS.map(action => (
              <GlassView tier={1} key={action.id} style={[s.card, { paddingVertical: 12 }]}>
                <View style={[s.row, { gap: 12 }]}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `${action.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={action.icon as any} size={16} color={action.color} />
                  </View>
                  <Text style={[s.bodySmall, { color: C.label, flex: 1, fontSize: 13, lineHeight: 18 }]}>{action.label}</Text>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={{ backgroundColor: `${action.color}18`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: action.color }}>{action.cta}</Text>
                  </Pressable>
                </View>
              </GlassView>
            ))}
          </View>
        </View>

      </ScrollView>
    );
  }

  // ── CLIENT VIEW ──────────────────────────────────────────────────────────────

  function renderClientView() {
    const CLIENT_PROPOSALS = [
      { id: 'p1', title: 'KaNeXT OS — Starter Package',     amount: 4800,  status: 'Accepted',  expiry: '2026-04-15', statusColor: C.green as string },
      { id: 'p2', title: 'KaNeXT Analytics Add-On',          amount: 1200,  status: 'In Review',  expiry: '2026-04-30', statusColor: '#B8943E' },
      { id: 'p3', title: 'Custom Branding & White-Label',     amount: 3500,  status: 'Draft',      expiry: '2026-05-10', statusColor: C.secondary as string },
    ];
    const CLIENT_INVOICES = [
      { id: 'inv1', number: 'INV-1042', desc: 'Onboarding & Setup',       amount: 2400, status: 'Paid',   due: '2026-03-01', statusColor: C.green as string },
      { id: 'inv2', number: 'INV-1055', desc: 'Monthly Subscription (Apr)', amount: 800,  status: 'Due',    due: '2026-04-01', statusColor: '#B8943E' },
      { id: 'inv3', number: 'INV-1061', desc: 'Analytics Add-On (Pro-rate)', amount: 350,  status: 'Pending', due: '2026-04-15', statusColor: C.secondary as string },
    ];
    const CLIENT_DOCS = [
      { id: 'd1', title: 'Master Services Agreement',  type: 'PDF',  icon: 'doc.fill',        date: '2026-01-10' },
      { id: 'd2', title: 'Statement of Work v2',        type: 'PDF',  icon: 'doc.text.fill',   date: '2026-02-14' },
      { id: 'd3', title: 'Onboarding Checklist',        type: 'DOC',  icon: 'checklist',        date: '2026-03-05' },
      { id: 'd4', title: 'Product Roadmap Q2 2026',     type: 'PDF',  icon: 'chart.bar.doc.horizontal', date: '2026-03-18' },
    ];
    const CLIENT_ACTIVITY = [
      { id: 'a1', text: 'Proposal for Analytics Add-On sent for review',      time: '2 days ago' },
      { id: 'a2', text: 'Onboarding call completed — recording shared',        time: '1 week ago' },
      { id: 'a3', text: 'INV-1042 marked paid — thank you!',                   time: '2 weeks ago' },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 120 }}>

        {/* ── My Engagement Card ────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <GlassView tier={1} style={[s.card, { backgroundColor: '#1A1714', padding: 0, overflow: 'hidden' }]}>
            {/* Header banner */}
            <View style={{ backgroundColor: ACCENT_INQ, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
              <View style={[s.row, { marginBottom: 4, gap: 8 }]}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5 }}>ACTIVE ENGAGEMENT</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 2 }}>Tougaloo College Athletics</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>KaNeXT OS — Starter Package</Text>
            </View>

            {/* Rep + phase */}
            <View style={{ padding: 16, gap: 12 }}>
              <View style={[s.row, { gap: 12 }]}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1714', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>SR</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Sam Richardson</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Your Account Rep · sam@kanext.co</Text>
                </View>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={{ backgroundColor: ACCENT_INQ, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Contact</Text>
                </Pressable>
              </View>

              {/* Phase + progress */}
              <View style={{ gap: 6 }}>
                <View style={[s.row]}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', flex: 1 }}>Current Phase</Text>
                  <View style={{ backgroundColor: `${ACCENT_INQ}40`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: ACCENT_INQ }}>Onboarding</Text>
                  </View>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: ACCENT_INQ, width: '35%' }} />
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>35% complete · Est. go-live Apr 18</Text>
              </View>
            </View>
          </GlassView>
        </View>

        {/* ── Recent Activity ────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Recent Activity</Text>
          <GlassView tier={1} style={{ borderRadius: 16, overflow: 'hidden' }}>
            {CLIENT_ACTIVITY.map((item, i) => (
              <View key={item.id} style={[
                s.row, { padding: 14, gap: 10 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
              ]}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT_INQ, marginTop: 2 }} />
                <Text style={[s.bodySmall, { color: C.label, flex: 1, lineHeight: 18 }]}>{item.text}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]}>{item.time}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* ── Proposals & Quotes ─────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Proposals & Quotes</Text>
          <GlassView tier={1} style={{ borderRadius: 16, overflow: 'hidden' }}>
            {CLIENT_PROPOSALS.map((prop, i) => (
              <Pressable key={prop.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [
                  s.row, { padding: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                ]}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${ACCENT_INQ}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="doc.text.fill" size={16} color={ACCENT_INQ} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{prop.title}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 12 }]}>Expires {formatDate(prop.expiry)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[s.bodyMed, { color: C.accent }]}>{formatCurrency(prop.amount, true)}</Text>
                  <View style={{ backgroundColor: `${prop.statusColor}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: prop.statusColor }}>{prop.status.toUpperCase()}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* ── Invoices ───────────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Invoices</Text>
          <GlassView tier={1} style={{ borderRadius: 16, overflow: 'hidden' }}>
            {CLIENT_INVOICES.map((inv, i) => (
              <Pressable key={inv.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [
                  s.row, { padding: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                ]}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${inv.statusColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="dollarsign.circle.fill" size={16} color={inv.statusColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{inv.number}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 12 }]} numberOfLines={1}>{inv.desc}</Text>
                  <Text style={[s.bodySmall, { color: C.muted as string, fontSize: 11 }]}>Due {formatDate(inv.due)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{formatCurrency(inv.amount, false)}</Text>
                  <View style={{ backgroundColor: `${inv.statusColor}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: inv.statusColor }}>{inv.status.toUpperCase()}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* ── Shared Documents ───────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8, paddingHorizontal: 2 }]}>Shared Documents</Text>
          <GlassView tier={1} style={{ borderRadius: 16, overflow: 'hidden' }}>
            {CLIENT_DOCS.map((doc, i) => (
              <Pressable key={doc.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [
                  s.row, { padding: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                ]}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${C.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={doc.icon as any} size={16} color={C.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{doc.title}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 12 }]}>Updated {formatDate(doc.date)}</Text>
                </View>
                <View style={[s.row, { gap: 6 }]}>
                  <View style={{ backgroundColor: C.surfacePressed as string, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: C.muted as string }}>{doc.type}</Text>
                  </View>
                  <IconSymbol name="arrow.down.circle" size={18} color={C.accent} />
                </View>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* ── Message Us ─────────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={({ pressed }) => [{
              backgroundColor: pressed ? '#1A1714' : ACCENT_INQ,
              borderRadius: 14, padding: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            }]}
          >
            <IconSymbol name="message.fill" size={18} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Message Your Rep</Text>
          </Pressable>
        </View>

      </ScrollView>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────

  function cycleRole() {
    Haptics.selectionAsync();
    setRole(r => r === 'CEO' ? 'Client' : 'CEO');
    setActiveTab('Pipeline');
    setSelectedDealId(null);
    setSelectedContactId(null);
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator as string, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={s.iconBtn} hitSlop={8}>
            <IconSymbol name="line.3.horizontal" size={20} color={C.label} />
          </Pressable>

          {isCEO ? (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
              style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}
            >
              <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary as string} style={{ marginLeft: 4 }} />
            </Pressable>
          ) : (
            <View style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}>
              <Text style={[s.dropdownPillText, { color: C.secondary as string }]}>My Portal</Text>
            </View>
          )}

          <View style={[s.row, { gap: 8 }]}>
            {isCEO && pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={8} style={s.iconBtn}>
                <IconSymbol
                  name={pillsVisible ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={20} color={pillsVisible ? C.accent : C.label}
                />
              </Pressable>
            )}
            <Pressable onPress={cycleRole} style={[s.rolePill, {
              backgroundColor: isCEO ? ACCENT_INQ : C.surfacePressed as string,
              borderColor: isCEO ? ACCENT_INQ : C.separator as string,
            }]}>
              <Text style={[s.rolePillText, { color: isCEO ? '#fff' : C.secondary as string }]}>{role}</Text>
            </Pressable>
          </View>
        </View>

        {pills.length > 0 && (
          <Animated.View style={[s.pillsRow, {
            height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }),
            opacity: pillsAnim, overflow: 'hidden', borderBottomColor: C.separator as string,
          }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
              {pills.map(pill => {
                const active = selectedPill === pill;
                return (
                  <Pressable key={pill} onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                    style={[s.pill, { borderColor: active ? C.accent : C.inputBorder as string, backgroundColor: active ? C.accent : 'transparent' }]}>
                    <Text style={[s.pillText, { color: active ? '#fff' : C.secondary as string }]}>{pill}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Dropdown — CEO only */}
      {isCEO && dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 150 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[s.dropdown, { top: topBarH, backgroundColor: C.surface, borderColor: C.separator as string }]}>
            {(['Pipeline', 'Contacts', 'Campaigns'] as InqTab[]).map(tab => (
              <Pressable key={tab} onPress={() => changeTab(tab)}
                style={({ pressed }) => [s.dropdownItem, pressed && { backgroundColor: C.surfacePressed as string }, activeTab === tab && { backgroundColor: C.surfacePressed as string }]}>
                <Text style={[s.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>{tab}</Text>
                {activeTab === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Content */}
      {!isCEO ? renderClientView() : (
        <>
          {activeTab === 'Pipeline'  && renderPipeline()}
          {activeTab === 'Contacts'  && renderContacts()}
          {activeTab === 'Campaigns' && renderCampaigns()}
        </>
      )}

      {/* FABs — CEO only */}
      {isCEO && activeTab === 'Pipeline' && !selectedDealId && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[s.fab, { backgroundColor: ACCENT_INQ, bottom: insets.bottom + 88 }]}>
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}
      {isCEO && activeTab === 'Campaigns' && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[s.fab, { backgroundColor: ACCENT_INQ, bottom: insets.bottom + 88 }]}>
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flex: 1, marginHorizontal: 10, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  dropdownPillText: { fontSize: 14, fontWeight: '700' },
  rolePill: { paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rolePillText: { fontSize: 12, fontWeight: '700' },
  pillsRow: { borderBottomWidth: StyleSheet.hairlineWidth },
  pill: { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 13, fontWeight: '600' },
  dropdown: { position: 'absolute', left: 16, right: 16, zIndex: 200, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemText: { flex: 1, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: { padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  subHeader: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyMed: { fontSize: 14, fontWeight: '600' },
  bodySmall: { fontSize: 13 },
  stageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderLeftWidth: 3, marginBottom: 6 },
  stageDot: { width: 8, height: 8, borderRadius: 4, marginRight: 2 },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  stageBadgeText: { fontSize: 11, fontWeight: '600' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  typeBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  dealMetricChip: { alignItems: 'center', padding: 10, borderRadius: 12 },
  countBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, marginLeft: 4 },
  countBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  avatarMd: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarMdText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  avatarLg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarLgText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  actionBtn: { padding: 10, borderRadius: 10, alignItems: 'center' },
  outlineBtn: { height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 14 },
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});
