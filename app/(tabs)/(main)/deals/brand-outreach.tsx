/**
 * Brand Outreach — Personal Deals, Owner only.
 * Outreach Tracker + Dipson-powered Brand Discovery.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

// ── Types & Data ──────────────────────────────────────────────────────────────

type PitchStatus = 'Draft' | 'Sent' | 'Viewed' | 'Responded' | 'Deal' | 'Declined';

const STATUS_CONFIG: Record<PitchStatus, { color: string; icon: string; label: string }> = {
  Draft:     { color: '#9C9790', icon: 'doc.text',                label: 'Draft'     },
  Sent:      { color: '#B8943E', icon: 'paperplane.fill',         label: 'Sent'      },
  Viewed:    { color: '#B8943E', icon: 'eye.fill',                label: 'Viewed'    },
  Responded: { color: '#5A8A6E', icon: 'checkmark.circle.fill',   label: 'Responded' },
  Deal:      { color: '#5A8A6E', icon: 'star.fill',               label: 'Deal'      },
  Declined:  { color: '#B85C5C', icon: 'xmark.circle.fill',       label: 'Declined'  },
};

interface PitchEntry {
  id: string;
  brand: string;
  pitchType: string;
  dateSent: Date | null;
  followUpDate: Date | null;
  status: PitchStatus;
  pitchText: string;
  contactName?: string;
  contactEmail?: string;
  isOverdue: boolean;
}

const INITIAL_PITCHES: PitchEntry[] = [
  { id: 'p1', brand: 'Under Armour',   pitchType: 'Brand Ambassadorship', dateSent: new Date('2026-03-15'), followUpDate: new Date('2026-03-22'), status: 'Responded', pitchText: "Hi Sarah, I've been a fan of Under Armour's commitment to performance. With 47K engaged followers in the athletic performance space, I believe there's a natural partnership opportunity...", contactName: 'Sarah Kim',    contactEmail: 'sarah.kim@underarmour.com', isOverdue: false },
  { id: 'p2', brand: 'Beats by Dre',   pitchType: 'Sponsored Reel',       dateSent: new Date('2026-03-20'), followUpDate: new Date('2026-03-27'), status: 'Viewed',    pitchText: "Hey Marcus, loved the new Studio Pro launch. My audience of 18-34 professionals would love an authentic look at how Beats fits into a high-performance lifestyle...",              contactName: 'Marcus Davis', contactEmail: 'm.davis@beatsbydre.com',    isOverdue: true  },
  { id: 'p3', brand: 'Lululemon',       pitchType: 'Content Bundle',       dateSent: new Date('2026-03-25'), followUpDate: new Date('2026-04-01'), status: 'Sent',      pitchText: "Hi team, I've been wearing Lululemon for years and my audience trusts my honest take on performance gear. I'd love to create a content bundle showcasing your newest collection...",   isOverdue: true  },
  { id: 'p4', brand: 'Hyperice',        pitchType: 'Sponsored Post',       dateSent: null,                   followUpDate: null,                   status: 'Draft',     pitchText: "Draft: Hi Hyperice team, as a recovery-focused athlete with a highly engaged audience of sports performance enthusiasts...",                                                           isOverdue: false },
  { id: 'p5', brand: 'Whoop',           pitchType: 'Brand Ambassadorship', dateSent: new Date('2026-02-10'), followUpDate: null,                   status: 'Deal',      pitchText: "Initial pitch that led to the current deal — quarterly content partnership agreement signed March 2026.",                                                                                isOverdue: false },
  { id: 'p6', brand: 'Gatorade',        pitchType: 'Speaking Engagement',  dateSent: new Date('2026-03-01'), followUpDate: null,                   status: 'Declined',  pitchText: "Hi Gatorade team, I'd love to bring my audience's passion for sports performance to one of your upcoming brand events...",                                                           isOverdue: false },
];

interface BrandSuggestion {
  id: string;
  brand: string;
  category: string;
  matchReason: string;
  matchPercent: number;
}

const SUGGESTIONS: BrandSuggestion[] = [
  { id: 's1', brand: 'Garmin',                  category: 'Fitness Tech',   matchReason: "38% of your audience are performance athletes aged 22–35 — aligns with Garmin's sports GPS and smartwatch lineup.", matchPercent: 91 },
  { id: 's2', brand: 'AG1 by Athletic Greens',  category: 'Nutrition',      matchReason: "67% of your followers engage with health & performance content — perfect for AG1's daily nutrition product.", matchPercent: 88 },
  { id: 's3', brand: 'Therabody',               category: 'Recovery Tech',  matchReason: "Your audience skews toward gym-goers and weekend warriors — Therabody's recovery tools are a natural fit.", matchPercent: 85 },
  { id: 's4', brand: 'Vuori',                   category: 'Activewear',     matchReason: "Premium activewear for professionals matches your audience's 25–34 age bracket and lifestyle positioning.", matchPercent: 82 },
  { id: 's5', brand: 'Eight Sleep',             category: 'Sleep Tech',     matchReason: "Performance recovery content resonates strongly with your followers — sleep optimization products are a natural extension.", matchPercent: 79 },
];

const PITCH_TYPES = ['Sponsored Post', 'Sponsored Reel', 'Ambassadorship', 'Speaking', 'Consulting'] as const;

function fmtDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PitchStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: cfg.color + '20', borderWidth: 1, borderColor: cfg.color + '60' }}>
      <IconSymbol name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function BrandOutreachScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + 52;

  const [pitches, setPitches] = useState<PitchEntry[]>(INITIAL_PITCHES);
  const [selectedPitch, setSelectedPitch] = useState<PitchEntry | null>(null);
  const [pitchDetailOpen, setPitchDetailOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<BrandSuggestion | null>(null);
  const [draftPitchOpen, setDraftPitchOpen] = useState(false);
  const [newPitchOpen, setNewPitchOpen] = useState(false);

  // New pitch form
  const [newBrand, setNewBrand] = useState('');
  const [newType, setNewType] = useState<string>(PITCH_TYPES[0]);
  const [newText, setNewText] = useState('');

  // Draft pitch state
  const [draftText, setDraftText] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const overdue = useMemo(() => pitches.filter(p => p.isOverdue), [pitches]);

  function openPitch(p: PitchEntry) {
    Haptics.selectionAsync();
    setSelectedPitch(p);
    setPitchDetailOpen(true);
  }

  function openDraft(s: BrandSuggestion) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSuggestion(s);
    setDraftText(`Hi ${s.brand} team,\n\nI've been following ${s.brand}'s work closely and I believe there's a strong alignment between your brand and my audience of ${s.matchPercent}% performance-focused professionals aged 22–35.\n\nWith 47.2K engaged followers and a 4.8% engagement rate, I'd love to explore a content partnership that feels authentic to both our communities.\n\nOpen to a quick call to explore what this could look like?\n\nBest,\nMarcus`);
    setDraftPitchOpen(true);
  }

  function sendDraftPitch() {
    if (!selectedSuggestion) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newPitch: PitchEntry = {
      id: `p${Date.now()}`,
      brand: selectedSuggestion.brand,
      pitchType: 'Sponsored Post',
      dateSent: new Date(),
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      pitchText: draftText,
      isOverdue: false,
    };
    setPitches(prev => [newPitch, ...prev]);
    setDraftPitchOpen(false);
  }

  function saveNewPitch(asDraft: boolean) {
    if (!newBrand.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const p: PitchEntry = {
      id: `p${Date.now()}`,
      brand: newBrand.trim(),
      pitchType: newType,
      dateSent: asDraft ? null : new Date(),
      followUpDate: asDraft ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: asDraft ? 'Draft' : 'Sent',
      pitchText: newText,
      isOverdue: false,
    };
    setPitches(prev => [p, ...prev]);
    setNewBrand(''); setNewType(PITCH_TYPES[0]); setNewText('');
    setNewPitchOpen(false);
  }

  const matchColor = (pct: number) => pct >= 85 ? '#5A8A6E' : pct >= 75 ? '#B8943E' : C.secondary;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: C.bg }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: C.label, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Brand Outreach</Text>
          </View>
        </View>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNewPitchOpen(true); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="plus" size={22} color={C.label} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>

        {/* Overdue Follow-ups */}
        {overdue.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 12, backgroundColor: '#B85C5C18', borderWidth: StyleSheet.hairlineWidth, borderColor: '#B85C5C40', borderLeftWidth: 4, borderLeftColor: '#B85C5C', padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <IconSymbol name="clock.badge.exclamationmark" size={16} color="#B85C5C" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#B85C5C', flex: 1 }}>Overdue Follow-ups</Text>
              <View style={{ backgroundColor: '#B85C5C', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{overdue.length}</Text>
              </View>
            </View>
            {overdue.map((p, i) => (
              <Pressable key={p.id} onPress={() => openPitch(p)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: '#B85C5C30', opacity: pressed ? 0.7 : 1 })}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{p.brand}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Follow up by {fmtDate(p.followUpDate)}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* OUTREACH TRACKER */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.6, textTransform: 'uppercase', marginHorizontal: 16, marginBottom: 10 }}>Outreach Tracker</Text>

        {pitches.map(p => (
          <Pressable key={p.id} onPress={() => openPitch(p)} style={({ pressed }) => ({ marginHorizontal: 16, marginBottom: 10, borderRadius: 14, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14, opacity: pressed ? 0.75 : 1 })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{p.brand}</Text>
              <StatusBadge status={p.status} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.secondary, flex: 1 }}>{p.pitchType}</Text>
              {p.dateSent && <Text style={{ fontSize: 12, color: C.secondary }}>{fmtDate(p.dateSent)}</Text>}
            </View>
            {p.followUpDate && (p.status === 'Sent' || p.status === 'Viewed') && (
              <Text style={{ fontSize: 12, color: '#B8943E', marginTop: 4 }}>Follow up: {fmtDate(p.followUpDate)}</Text>
            )}
          </Pressable>
        ))}

        {/* BRAND DISCOVERY */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.6, textTransform: 'uppercase', flex: 1 }}>Brand Discovery</Text>
          <Text style={{ fontSize: 11, color: C.secondary }}>Powered by Dipson</Text>
        </View>

        {SUGGESTIONS.map(s => (
          <View key={s.id} style={{ marginHorizontal: 16, marginBottom: 10, borderRadius: 14, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }}>{s.brand}</Text>
              <View style={{ backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 11, color: C.secondary }}>{s.category}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: matchColor(s.matchPercent), marginBottom: 6 }}>{s.matchPercent}% match</Text>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18, marginBottom: 12 }}>{s.matchReason}</Text>
            <Pressable onPress={() => openDraft(s)} style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 10, padding: 11, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Draft Pitch with Dipson</Text>
            </Pressable>
          </View>
        ))}

      </ScrollView>

      {/* Pitch Detail Sheet */}
      <BottomSheet visible={pitchDetailOpen} onClose={() => setPitchDetailOpen(false)} useModal title={selectedPitch?.brand ?? ''}>
        {selectedPitch && (
          <View style={{ paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <StatusBadge status={selectedPitch.status} />
            </View>
            {selectedPitch.contactName && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 2 }}>Contact</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{selectedPitch.contactName}</Text>
                {selectedPitch.contactEmail && <Text style={{ fontSize: 13, color: C.secondary }}>{selectedPitch.contactEmail}</Text>}
              </View>
            )}
            {[
              selectedPitch.dateSent && { label: 'Pitch Sent', value: fmtDate(selectedPitch.dateSent) },
              selectedPitch.followUpDate && { label: 'Follow-up', value: fmtDate(selectedPitch.followUpDate) },
              { label: 'Type', value: selectedPitch.pitchType },
            ].filter(Boolean).map((row: any) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                <Text style={{ fontSize: 14, color: C.secondary }}>{row.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{row.value}</Text>
              </View>
            ))}
            <View style={{ marginTop: 14, backgroundColor: C.surface, borderRadius: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pitch</Text>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 22 }}>{selectedPitch.pitchText}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable onPress={() => setPitchDetailOpen(false)} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Resend</Text>
              </Pressable>
              {selectedPitch.status === 'Declined' ? (
                <Pressable onPress={() => setPitchDetailOpen(false)} style={{ flex: 1, borderRadius: 12, padding: 13, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#B85C5C' }}>Archive</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setPitchDetailOpen(false)} style={{ flex: 1, backgroundColor: C.label, borderRadius: 12, padding: 13, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Mark Responded</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Draft Pitch Sheet */}
      <BottomSheet visible={draftPitchOpen} onClose={() => setDraftPitchOpen(false)} useModal title={selectedSuggestion ? `Draft Pitch — ${selectedSuggestion.brand}` : 'Draft Pitch'}>
        <View style={{ paddingBottom: 16 }}>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12, lineHeight: 18 }}>
            Dipson generated this pitch based on your stats, media kit, and audience alignment with {selectedSuggestion?.brand}.
          </Text>
          <TextInput
            value={draftText}
            onChangeText={setDraftText}
            multiline
            style={{ backgroundColor: C.surface, borderRadius: 10, padding: 12, fontSize: 14, color: C.label, lineHeight: 22, minHeight: 160, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, marginBottom: 14, textAlignVertical: 'top' }}
          />
          <Pressable onPress={sendDraftPitch} style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 12, padding: 14, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Send Pitch</Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* New Pitch Sheet */}
      <BottomSheet visible={newPitchOpen} onClose={() => setNewPitchOpen(false)} useModal title="New Pitch">
        <View style={{ paddingBottom: 16 }}>
          <TextInput
            placeholder="Brand name"
            placeholderTextColor={C.secondary}
            value={newBrand}
            onChangeText={setNewBrand}
            style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: C.label, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, marginBottom: 10 }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
            {PITCH_TYPES.map(t => {
              const active = newType === t;
              return (
                <Pressable key={t} onPress={() => { Haptics.selectionAsync(); setNewType(t); }} style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: active ? C.label : C.separator }}>
                  <Text style={{ fontSize: 13, fontWeight: active ? '700' : '400', color: active ? C.bg : C.secondary }}>{t}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <TextInput
            placeholder="Pitch text..."
            placeholderTextColor={C.secondary}
            value={newText}
            onChangeText={setNewText}
            multiline
            style={{ backgroundColor: C.surface, borderRadius: 10, padding: 12, fontSize: 14, color: C.label, lineHeight: 22, minHeight: 120, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, marginBottom: 14, textAlignVertical: 'top' }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => saveNewPitch(true)} style={({ pressed }) => ({ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Save as Draft</Text>
            </Pressable>
            <Pressable onPress={() => saveNewPitch(false)} style={({ pressed }) => ({ flex: 1, backgroundColor: C.label, borderRadius: 12, padding: 13, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Send Now</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

    </View>
  );
}
