/**
 * Inquiries — Support (Client only)
 * Help desk portal: submit requests, my requests, FAQ, live chat
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

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type RequestStatus = 'Open' | 'In Progress' | 'Resolved';
type RequestCategory = 'Bug' | 'Feature Request' | 'Billing' | 'General';

type SupportRequest = {
  id: string;
  subject: string;
  category: RequestCategory;
  date: string;
  status: RequestStatus;
};

const MY_REQUESTS: SupportRequest[] = [
  { id: 'r1', subject: 'Dashboard not loading after update',     category: 'Bug',             date: 'Apr 14', status: 'In Progress' },
  { id: 'r2', subject: 'Add export to CSV for analytics',        category: 'Feature Request', date: 'Apr 10', status: 'Open'        },
  { id: 'r3', subject: 'Invoice INV-1055 billing question',      category: 'Billing',         date: 'Apr 5',  status: 'Resolved'    },
  { id: 'r4', subject: 'How do I add team members?',             category: 'General',         date: 'Mar 28', status: 'Resolved'    },
];

const STATUS_COLOR: Record<RequestStatus, string> = {
  'Open':        GAIN,
  'In Progress': CAUTION,
  'Resolved':    '#8A837C',
};

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    articles: [
      { title: 'How to set up your first project',      preview: 'Step-by-step guide to creating and configuring your workspace...' },
      { title: 'Inviting team members',                  preview: 'Learn how to add collaborators and set permissions...' },
      { title: 'Connecting your calendar',               preview: 'Sync your Google or Outlook calendar with KaNeXT...' },
    ],
  },
  {
    category: 'Billing',
    articles: [
      { title: 'Understanding your invoice',             preview: 'A breakdown of what each line item means on your bill...' },
      { title: 'How to update payment method',           preview: 'Change or update your credit card or bank account...' },
    ],
  },
  {
    category: 'Features',
    articles: [
      { title: 'Using the analytics dashboard',          preview: 'How to read charts, export data, and set up alerts...' },
      { title: 'Automations and workflows',              preview: 'Build automated pipelines and notifications...' },
    ],
  },
];

export default function SupportScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:inquiries');
  const isCEO = role === roleCycles[0];

  const [faqQuery, setFaqQuery] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isCEO) router.replace('/(tabs)/(main)/inquiries/pipeline' as any);
  }, [isCEO, router]);

  if (isCEO) return null;

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
              <Text style={[s.titlePillText, { color: C.label }]}>Support</Text>
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

        {/* Submit Request CTA */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Pressable
            style={[s.submitBtn, { backgroundColor: C.label }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Submit a Request', 'Request form — coming soon');
            }}
          >
            <IconSymbol name="plus.bubble.fill" size={18} color={C.bg} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg, marginLeft: 8 }}>Submit a Request</Text>
          </Pressable>
        </View>

        {/* My Requests */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>My Requests</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {MY_REQUESTS.map((req, i) => (
              <Pressable
                key={req.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(req.subject, `Category: ${req.category}\nStatus: ${req.status}\nSubmitted: ${req.date}`);
                }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{req.subject}</Text>
                  <View style={[s.row, { gap: 8, marginTop: 4 }]}>
                    <View style={[s.categoryTag, { backgroundColor: C.bg, borderColor: C.separator }]}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{req.category}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{req.date}</Text>
                  </View>
                </View>
                <View style={[s.statusPill, { backgroundColor: STATUS_COLOR[req.status] + '18', borderColor: STATUS_COLOR[req.status] + '60' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: STATUS_COLOR[req.status] }}>{req.status}</Text>
                </View>
                <IconSymbol name="chevron.right" size={12} color={C.secondary} />
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* FAQ */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Knowledge Base</Text>

          <View style={[s.searchRow, { backgroundColor: C.surface, borderColor: C.separator, marginBottom: 16 }]}>
            <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
            <TextInput
              style={[s.searchInput, { color: C.label }]}
              placeholder="Search articles..."
              placeholderTextColor={C.secondary}
              value={faqQuery}
              onChangeText={setFaqQuery}
            />
          </View>

          {FAQ_ITEMS.map(section => (
            <View key={section.category} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{section.category}</Text>
              <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden' }}>
                {section.articles
                  .filter(a => !faqQuery || a.title.toLowerCase().includes(faqQuery.toLowerCase()))
                  .map((article, i) => (
                    <Pressable
                      key={article.title}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(article.title, article.preview); }}
                      style={({ pressed }) => [
                        { paddingVertical: 12, paddingHorizontal: 14 },
                        i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 3 }}>{article.title}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={1}>{article.preview}</Text>
                    </Pressable>
                  ))}
              </GlassView>
            </View>
          ))}
        </View>

        {/* Live chat */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Pressable
            style={[s.chatBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Chat with Support', 'Opening Messages with KaNeXT Support...'); }}
          >
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={18} color={C.label} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, marginLeft: 8 }}>Chat with Support</Text>
          </Pressable>
        </View>

      </ScrollView>

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
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    submitBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14 },
    chatBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
    categoryTag:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    searchRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 42, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    searchInput:   { flex: 1, fontSize: 15 },
  });
}
