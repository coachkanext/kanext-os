/**
 * Inquiries — Leads (CEO only)
 * Inbound lead management with source, score, and auto-routing
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type LeadScore  = 'Hot' | 'Warm' | 'Cold';
type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
type LeadSource = 'Website' | 'Referral' | 'Event' | 'Cold Outreach' | 'Inbound Email';

type Lead = {
  id: string;
  name: string;
  company: string;
  source: LeadSource;
  date: string;
  score: LeadScore;
  status: LeadStatus;
  assignedTo: string;
  email: string;
  phone: string;
  notes: string;
  initials: string;
  staleDays?: number;
};

const LEADS: Lead[] = [
  { id: 'l1',  name: 'Dr. James Okafor',    company: 'Meharry Medical College',     source: 'Referral',      date: 'Apr 13', score: 'Hot',  status: 'New',         assignedTo: 'Carlos Mendez',  email: 'jokafor@meharry.edu',    phone: '615-555-0182', notes: 'Referred by Lincoln U. Very interested in full OS deployment.', initials: 'JO' },
  { id: 'l2',  name: 'Marcus Webb',         company: 'Minnect Network',             source: 'Inbound Email', date: 'Apr 12', score: 'Hot',  status: 'Contacted',   assignedTo: 'Simone Delacroix',email: 'm.webb@minnect.com',     phone: '305-555-0341', notes: 'Ready to hop on a call. Move to pipeline if demo goes well.', initials: 'MW' },
  { id: 'l3',  name: 'Tara Simmons',        company: 'Tougaloo College',            source: 'Website',       date: 'Apr 10', score: 'Warm', status: 'Contacted',   assignedTo: 'Carlos Mendez',  email: 'tsimmons@tougaloo.edu',  phone: '601-555-0203', notes: 'Downloaded the whitepaper. Responded to follow-up.', initials: 'TS' },
  { id: 'l4',  name: 'Greg Hutchins',       company: 'Valley Capital Group',        source: 'Event',         date: 'Apr 8',  score: 'Warm', status: 'Qualified',   assignedTo: 'Simone Delacroix',email: 'ghutchins@valleycap.com',phone: '415-555-0127', notes: 'Met at SaaStr 2026. Interested in analytics tier.', initials: 'GH' },
  { id: 'l5',  name: 'Pastor Jerome Grant', company: 'Greater Destiny Church',      source: 'Referral',      date: 'Apr 6',  score: 'Hot',  status: 'Qualified',   assignedTo: 'Carlos Mendez',  email: 'jgrant@greaterdestiny.org',phone:'404-555-0299',notes: 'ICCLA referral. Wants Community Mode. Budget confirmed.', initials: 'JG' },
  { id: 'l6',  name: 'Lisa Fontaine',       company: 'Lane College Athletics',      source: 'Cold Outreach', date: 'Apr 3',  score: 'Cold', status: 'Contacted',   assignedTo: 'Raj Patel',       email: 'lfontaine@lane.edu',     phone: '731-555-0177', notes: 'Replied to cold email. Low budget. Exploring options.', initials: 'LF', staleDays: 12 },
  { id: 'l7',  name: 'Derrick Owens',       company: 'Oakland USD',                 source: 'Inbound Email', date: 'Apr 1',  score: 'Hot',  status: 'New',         assignedTo: 'Simone Delacroix',email: 'dowens@ousd.org',        phone: '510-555-0314', notes: 'Large district. $500K potential. Needs district demo.', initials: 'DO' },
  { id: 'l8',  name: 'Amy Chen',            company: 'Pacific Ventures',            source: 'Website',       date: 'Mar 28', score: 'Cold', status: 'Unqualified', assignedTo: 'Raj Patel',       email: 'achen@pacificv.com',     phone: '650-555-0088', notes: 'Not the right fit currently. Small budget, solo use.', initials: 'AC', staleDays: 18 },
];

const FILTERS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Unqualified'];

const SCORE_COLOR: Record<LeadScore, string> = {
  Hot:  HEAT,
  Warm: CAUTION,
  Cold: '#8A837C',
};

const SOURCE_ICON: Record<LeadSource, string> = {
  Website:       'globe',
  Referral:      'person.2.fill',
  Event:         'ticket.fill',
  'Cold Outreach': 'envelope.fill',
  'Inbound Email': 'tray.and.arrow.down.fill',
};

export default function LeadsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:inquiries');
  const isCEO = role === roleCycles[0];

  const [activeFilter, setActiveFilter] = useState<'All' | LeadStatus>('All');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/inquiries/support' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const filtered = activeFilter === 'All' ? LEADS : LEADS.filter(l => l.status === activeFilter);
  const staleLeads = LEADS.filter(l => (l.staleDays ?? 0) > 7 && l.status !== 'Unqualified');

  const selectedLead = selectedLeadId ? LEADS.find(l => l.id === selectedLeadId) : null;

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
              <Text style={[s.titlePillText, { color: C.label }]}>Leads</Text>
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
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >
        {selectedLead ? (
          /* Lead detail */
          <View style={{ marginHorizontal: 16 }}>
            <Pressable onPress={() => setSelectedLeadId(null)} style={[s.row, { marginBottom: 16 }]}>
              <IconSymbol name="chevron.left" size={14} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary, marginLeft: 4 }}>Back to Leads</Text>
            </Pressable>

            <View style={[s.detailCard, { backgroundColor: C.surface }]}>
              <View style={[s.row, { marginBottom: 14 }]}>
                <View style={[s.avatar, { backgroundColor: C.label }]}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{selectedLead.initials}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{selectedLead.name}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary }}>{selectedLead.company}</Text>
                </View>
                <View style={[s.scorePill, { backgroundColor: SCORE_COLOR[selectedLead.score] + '18', borderColor: SCORE_COLOR[selectedLead.score] + '60' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: SCORE_COLOR[selectedLead.score] }}>{selectedLead.score}</Text>
                </View>
              </View>

              {[
                { label: 'Email',    value: selectedLead.email  },
                { label: 'Phone',    value: selectedLead.phone  },
                { label: 'Source',   value: selectedLead.source },
                { label: 'Assigned', value: selectedLead.assignedTo },
                { label: 'Notes',    value: selectedLead.notes  },
              ].map((row, i) => (
                <View key={row.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                  <Text style={{ fontSize: 13, color: C.secondary, width: 80 }}>{row.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={3}>{row.value}</Text>
                </View>
              ))}

              <View style={[s.row, { gap: 8, marginTop: 14 }]}>
                {[
                  { label: 'Call',    icon: 'phone.fill'    },
                  { label: 'Message', icon: 'message.fill'  },
                  { label: 'Email',   icon: 'envelope.fill' },
                ].map(a => (
                  <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={[s.actionBtn, { flex: 1, backgroundColor: C.bg, borderColor: C.separator }]}>
                    <IconSymbol name={a.icon as any} size={15} color={C.label} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginTop: 4 }}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={[s.row, { gap: 8, marginTop: 10 }]}>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Convert to Deal', 'This lead will move to Pipeline as a New Lead.'); }}
                  style={[s.primaryBtn, { flex: 1, backgroundColor: C.label }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Convert to Deal</Text>
                </Pressable>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Marked Unqualified'); setSelectedLeadId(null); }}
                  style={[s.primaryBtn, { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator }]}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Unqualified</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Stale alert */}
            {staleLeads.length > 0 && (
              <View style={[s.alertCard, { borderLeftColor: HEAT, backgroundColor: HEAT + '10', marginHorizontal: 16, marginBottom: 12 }]}>
                <View style={s.row}>
                  <IconSymbol name="clock.badge.exclamationmark" size={14} color={HEAT} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: HEAT, marginLeft: 6 }}>{staleLeads.length} stale lead{staleLeads.length > 1 ? 's' : ''} — no contact in 7+ days</Text>
                </View>
              </View>
            )}

            {/* Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
              {(['All', ...FILTERS] as ('All' | LeadStatus)[]).map(f => (
                <Pressable
                  key={f}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveFilter(f); }}
                  style={[s.filterPill, { backgroundColor: activeFilter === f ? C.label : C.surface, borderColor: activeFilter === f ? C.label : C.separator }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: activeFilter === f ? C.bg : C.secondary }}>{f}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Lead list */}
            <View style={{ marginHorizontal: 16 }}>
              {filtered.map((lead, idx) => (
                <Pressable
                  key={lead.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedLeadId(lead.id); }}
                >
                  <View style={[s.leadRow, {
                    backgroundColor: C.surface,
                    borderBottomColor: C.separator,
                    borderBottomWidth: idx < filtered.length - 1 ? StyleSheet.hairlineWidth : 0,
                  }]}>
                    <View style={[s.avatar, { backgroundColor: C.separator }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{lead.initials}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={s.row}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }}>{lead.name}</Text>
                        <View style={[s.scorePill, { backgroundColor: SCORE_COLOR[lead.score] + '18', borderColor: SCORE_COLOR[lead.score] + '60' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: SCORE_COLOR[lead.score] }}>{lead.score}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>{lead.company}</Text>
                      <View style={[s.row, { gap: 10, marginTop: 4 }]}>
                        <View style={s.row}>
                          <IconSymbol name={SOURCE_ICON[lead.source] as any} size={11} color={C.secondary} />
                          <Text style={{ fontSize: 11, color: C.secondary, marginLeft: 4 }}>{lead.source}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: C.secondary }}>{lead.date}</Text>
                        {lead.staleDays && lead.staleDays > 7 && (
                          <Text style={{ fontSize: 11, color: HEAT }}>Stale</Text>
                        )}
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={C.secondary} style={{ marginLeft: 8 }} />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {!selectedLeadId && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Lead', 'Coming soon'); }}
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
    alertCard:     { borderLeftWidth: 3, borderRadius: 10, padding: 12 },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    leadRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14 },
    avatar:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    scorePill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
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
