/**
 * Hub Settings — Personal Hub tile-specific settings.
 * Toggle rows for profile, content, subscribers, and notifications.
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
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
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

type ToggleKey =
  | 'pubProfile'
  | 'showFollowers'
  | 'earningsBadge'
  | 'featurePost'
  | 'newsletter'
  | 'mediaKit'
  | 'welcomeDM'
  | 'showTiers'
  | 'notifySubscriber'
  | 'notifyFollower'
  | 'notifyEngagement';

type ToggleRow = {
  icon: string;
  label: string;
  stateKey: ToggleKey;
};

type Section = {
  header: string;
  rows: ToggleRow[];
};

// ── Section definitions ───────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    header: 'PROFILE',
    rows: [
      { icon: 'person.crop.rectangle', label: 'Public Profile',       stateKey: 'pubProfile'    },
      { icon: 'person.2.fill',          label: 'Show Follower Count',  stateKey: 'showFollowers' },
      { icon: 'chart.bar.fill',         label: 'Show Earnings Badge',  stateKey: 'earningsBadge' },
    ],
  },
  {
    header: 'CONTENT',
    rows: [
      { icon: 'star.fill',          label: 'Feature a Post',           stateKey: 'featurePost' },
      { icon: 'newspaper.fill',     label: 'Show Newsletter Archive',  stateKey: 'newsletter'  },
      { icon: 'doc.richtext.fill',  label: 'Show Media Kit Button',    stateKey: 'mediaKit'    },
    ],
  },
  {
    header: 'SUBSCRIBERS',
    rows: [
      { icon: 'sparkles',    label: 'Subscriber Welcome DM', stateKey: 'welcomeDM'  },
      { icon: 'list.bullet', label: 'Show Subscriber Tiers', stateKey: 'showTiers'  },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'bell.badge.fill',  label: 'New Subscriber',     stateKey: 'notifySubscriber' },
      { icon: 'person.badge.plus', label: 'New Follower',       stateKey: 'notifyFollower'   },
      { icon: 'heart.fill',        label: 'Engagement Alerts',  stateKey: 'notifyEngagement' },
    ],
  },
];

// ── Row component ─────────────────────────────────────────────────────────────

function ToggleRowItem({
  row, C, s, value, onToggle,
}: {
  row: ToggleRow;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={s.row}>
      <IconSymbol name={row.icon as any} size={22} color={C.label} />
      <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.separator, true: C.label }}
        thumbColor={C.bg}
        ios_backgroundColor={C.separator}
      />
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function HubSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  const [pubProfile,        setPubProfile]        = useState(true);
  const [showFollowers,     setShowFollowers]      = useState(true);
  const [earningsBadge,     setEarningsBadge]      = useState(false);
  const [featurePost,       setFeaturePost]        = useState(false);
  const [newsletter,        setNewsletter]         = useState(true);
  const [mediaKit,          setMediaKit]           = useState(true);
  const [welcomeDM,         setWelcomeDM]          = useState(false);
  const [showTiers,         setShowTiers]          = useState(true);
  const [notifySubscriber,  setNotifySubscriber]   = useState(true);
  const [notifyFollower,    setNotifyFollower]     = useState(true);
  const [notifyEngagement,  setNotifyEngagement]   = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubProfile,
    showFollowers,
    earningsBadge,
    featurePost,
    newsletter,
    mediaKit,
    welcomeDM,
    showTiers,
    notifySubscriber,
    notifyFollower,
    notifyEngagement,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    switch (key) {
      case 'pubProfile':       setPubProfile(v => !v);       break;
      case 'showFollowers':    setShowFollowers(v => !v);    break;
      case 'earningsBadge':    setEarningsBadge(v => !v);    break;
      case 'featurePost':      setFeaturePost(v => !v);      break;
      case 'newsletter':       setNewsletter(v => !v);       break;
      case 'mediaKit':         setMediaKit(v => !v);         break;
      case 'welcomeDM':        setWelcomeDM(v => !v);        break;
      case 'showTiers':        setShowTiers(v => !v);        break;
      case 'notifySubscriber': setNotifySubscriber(v => !v); break;
      case 'notifyFollower':   setNotifyFollower(v => !v);   break;
      case 'notifyEngagement': setNotifyEngagement(v => !v); break;
    }
  }, []);

  function renderRow(row: ToggleRow, idx: number) {
    return (
      <View key={row.stateKey}>
        {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
        <ToggleRowItem
          row={row}
          C={C}
          s={s}
          value={toggleValues[row.stateKey]}
          onToggle={() => handleToggle(row.stateKey)}
        />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.topBarOuter,
          { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity },
        ]}
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
              <Text style={[s.titlePillText, { color: C.label }]}>Hub Settings</Text>
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
          { paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {SECTIONS.map((section, sIdx) => (
          <View key={section.header} style={sIdx > 0 ? s.sectionGap : undefined}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>
              {section.header}
            </Text>
            <View style={[s.sectionRows, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
              {section.rows.map((row, rIdx) => renderRow(row, rIdx))}
            </View>
          </View>
        ))}
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

    sectionGap: { marginTop: 32 },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    sectionRows: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      minHeight: 50,
    },
    rowSep: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 52,
    },
    rowLabel: { flex: 1, fontSize: 16 },
  });
}
