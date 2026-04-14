/**
 * Inquiry Help — tile-level help for the Personal Inquiries tile.
 * Personal mode. FAQ sections with search, plus GET HELP actions.
 * Monochrome design system. No blue. No accent.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// ── Types ─────────────────────────────────────────────────────────────────────

type FaqRow = {
  icon: string;
  title: string;
  keywords: string;
};

type FaqSection = {
  header: string;
  rows: FaqRow[];
};

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ_SECTIONS: FaqSection[] = [
  {
    header: 'RECEIVING INQUIRIES',
    rows: [
      { icon: 'tray.and.arrow.down.fill',  title: 'How inquiries arrive',           keywords: 'receive inquiry submit form'         },
      { icon: 'envelope.fill',             title: 'Setting up your contact form',   keywords: 'contact form setup enable'           },
      { icon: 'dollarsign.circle',         title: 'Budget field and pricing',       keywords: 'budget rate field pricing'           },
      { icon: 'bell.badge.fill',           title: 'Notification settings',          keywords: 'notifications alerts new inquiry'    },
    ],
  },
  {
    header: 'MANAGING YOUR PIPELINE',
    rows: [
      { icon: 'folder.fill',               title: 'Inbox, Archive, and statuses',   keywords: 'inbox archive status pipeline'       },
      { icon: 'checkmark.circle.fill',     title: 'Accepting and declining',        keywords: 'accept decline respond'             },
      { icon: 'message.fill',              title: 'Messaging within an inquiry',    keywords: 'message reply thread chat'           },
      { icon: 'clock.fill',               title: 'Follow-up reminders',            keywords: 'follow up reminder 48 hours'         },
    ],
  },
  {
    header: 'YOUR PUBLIC PAGE',
    rows: [
      { icon: 'globe',                     title: 'What senders see on your page',  keywords: 'public page sender visitor view'     },
      { icon: 'briefcase.fill',            title: 'Services and rate card',         keywords: 'services rates card pricing'         },
      { icon: 'building.2.fill',           title: 'Trusted by logos',               keywords: 'trusted brand logos partners'        },
    ],
  },
  {
    header: 'PRIVACY',
    rows: [
      { icon: 'eye.slash.fill',            title: 'Hiding your inquiry form',       keywords: 'hide disable form private'           },
      { icon: 'person.crop.circle.badge.xmark', title: 'Blocking senders',         keywords: 'block sender spam'                   },
    ],
  },
];

const ALL_ROWS: Array<FaqRow & { sectionHeader: string }> = FAQ_SECTIONS.flatMap(sec =>
  sec.rows.map(row => ({ ...row, sectionHeader: sec.header })),
);

// ── Types ─────────────────────────────────────────────────────────────────────

type ActionItem = {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
};

// ── Helper components ─────────────────────────────────────────────────────────

function FaqRowItem({
  row, C, s, onPress,
}: { row: FaqRow; C: ComponentColors; s: ReturnType<typeof makeStyles>; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.faqRow, pressed && { backgroundColor: C.surface }]}
      onPress={onPress}
    >
      <IconSymbol name={row.icon as any} size={20} color={C.label} />
      <Text style={[s.faqRowTitle, { color: C.label }]}>{row.title}</Text>
      <IconSymbol name="chevron.right" size={13} color={C.secondary} />
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function InquiryHelpScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:inquiries');
  const isOwner = role === roleCycles[0];

  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return ALL_ROWS.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.keywords.toLowerCase().includes(q),
    );
  }, [query]);

  function handleArticlePress(title: string) {
    Haptics.selectionAsync();
    Alert.alert(title, 'Full article coming soon.');
  }

  function handleContactSupport() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Contact Support', 'This will open a message thread with KaNeXT Support in the Messages tab.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Messages', onPress: () => {} },
    ]);
  }

  function handleReportBug() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Report a Bug', 'Describe the issue below. A screenshot and device info will be auto-attached.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', onPress: () => {} },
    ]);
  }

  function handleFeatureRequest() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Feature Request', 'What would you like to see in KaNeXT?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', onPress: () => {} },
    ]);
  }

  function handleCommunityForum() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Community Forum', 'The KaNeXT community forum is coming soon.');
  }

  const actionItems: ActionItem[] = [
    { icon: 'message.fill',  label: 'Contact Support',   subtitle: 'Opens a message thread with KaNeXT Support',  onPress: handleContactSupport  },
    { icon: 'ant.fill',      label: 'Report a Bug',      subtitle: 'Auto-attaches screenshot and device info',    onPress: handleReportBug       },
    { icon: 'lightbulb.fill',label: 'Feature Request',   subtitle: 'Tell us what you want to see',               onPress: handleFeatureRequest  },
    { icon: 'person.3.fill', label: 'Community Forum',   subtitle: 'Connect with other KaNeXT users',            onPress: handleCommunityForum  },
  ];

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}
      >
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
            style={s.kBtn}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Inquiry Help</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Search bar ────────────────────────────────────────────────────── */}
        <View style={[s.searchWrap, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search inquiry help..."
            placeholderTextColor={C.secondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* ── Search results ─────────────────────────────────────────────────── */}
        {searchResults !== null ? (
          <View style={s.section}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>
              {searchResults.length === 0 ? 'NO RESULTS' : `RESULTS  ·  ${searchResults.length}`}
            </Text>
            {searchResults.length === 0 ? (
              <Text style={[s.emptySearch, { color: C.secondary }]}>
                Try different keywords or browse the sections below.
              </Text>
            ) : (
              <View style={[s.sectionRows, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
                {searchResults.map((row, idx) => (
                  <View key={`${row.sectionHeader}-${row.title}`}>
                    {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                    <FaqRowItem row={row} C={C} s={s} onPress={() => handleArticlePress(row.title)} />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          FAQ_SECTIONS.map(section => (
            <View key={section.header} style={s.section}>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>{section.header}</Text>
              <View style={[s.sectionRows, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
                {section.rows.map((row, idx) => (
                  <View key={row.title}>
                    {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                    <FaqRowItem row={row} C={C} s={s} onPress={() => handleArticlePress(row.title)} />
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        {/* ── GET HELP ─────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>GET HELP</Text>
          <View style={[s.sectionRows, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
            {actionItems.map((item, idx) => (
              <View key={item.label}>
                {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                <Pressable
                  style={({ pressed }) => [s.actionRow, pressed && { backgroundColor: C.surface }]}
                  onPress={item.onPress}
                >
                  <IconSymbol name={item.icon as any} size={20} color={C.label} />
                  <View style={s.actionBody}>
                    <Text style={[s.actionLabel, { color: C.label }]}>{item.label}</Text>
                    <Text style={[s.actionSub, { color: C.secondary }]}>{item.subtitle}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={13} color={C.secondary} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <Text style={[s.footerNote, { color: C.secondary }]}>
          Average response time · ~2 hours
        </Text>

      </ScrollView>
    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    scrollContent: { paddingHorizontal: 0 },

    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 16,
      marginBottom: 20,
      paddingHorizontal: 14,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
    },
    searchInput: { flex: 1, fontSize: 15 },

    section: { marginBottom: 28 },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    sectionRows: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowSep: { height: StyleSheet.hairlineWidth, marginLeft: 52 },

    faqRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      minHeight: 48,
    },
    faqRowTitle: { flex: 1, fontSize: 15 },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      minHeight: 56,
    },
    actionBody: { flex: 1, gap: 2 },
    actionLabel: { fontSize: 15 },
    actionSub: { fontSize: 12, lineHeight: 17 },

    emptySearch: {
      fontSize: 14,
      paddingHorizontal: 16,
      paddingTop: 8,
      lineHeight: 20,
    },

    footerNote: {
      fontSize: 12,
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });
}
