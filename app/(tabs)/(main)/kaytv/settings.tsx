/**
 * KTV Settings — KayTV tile-specific settings.
 * Toggle rows for channel, uploads, monetization, and notifications.
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
  | 'pubChannel'
  | 'showViews'
  | 'comments'
  | 'hdQuality'
  | 'autoCaptions'
  | 'defaultPrivate'
  | 'subOnly'
  | 'adRevenue'
  | 'notifyComment'
  | 'notifySubscriber'
  | 'notifyMilestone';

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
    header: 'CHANNEL',
    rows: [
      { icon: 'tv',               label: 'Public Channel',    stateKey: 'pubChannel'   },
      { icon: 'eye',              label: 'Show View Counts',  stateKey: 'showViews'    },
      { icon: 'bubble.left.fill', label: 'Comments Enabled',  stateKey: 'comments'     },
    ],
  },
  {
    header: 'UPLOADS',
    rows: [
      { icon: 'arrow.up.circle.fill',   label: 'HD Quality Default',      stateKey: 'hdQuality'      },
      { icon: 'captions.bubble.fill',   label: 'Auto-generate Captions',  stateKey: 'autoCaptions'   },
      { icon: 'eye.slash.fill',         label: 'Default to Private',       stateKey: 'defaultPrivate' },
    ],
  },
  {
    header: 'MONETIZATION',
    rows: [
      { icon: 'lock.fill',                    label: 'Subscriber-only Videos', stateKey: 'subOnly'    },
      { icon: 'chart.line.uptrend.xyaxis',    label: 'Ad Revenue',             stateKey: 'adRevenue'  },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'bell.badge.fill',   label: 'New Comment',      stateKey: 'notifyComment'    },
      { icon: 'person.badge.plus', label: 'New Subscriber',   stateKey: 'notifySubscriber' },
      { icon: 'star.fill',         label: 'Milestone Alerts', stateKey: 'notifyMilestone'  },
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

export default function KayTVSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  const [pubChannel,       setPubChannel]       = useState(true);
  const [showViews,        setShowViews]         = useState(true);
  const [comments,         setComments]          = useState(true);
  const [hdQuality,        setHdQuality]         = useState(true);
  const [autoCaptions,     setAutoCaptions]      = useState(false);
  const [defaultPrivate,   setDefaultPrivate]    = useState(false);
  const [subOnly,          setSubOnly]           = useState(false);
  const [adRevenue,        setAdRevenue]         = useState(false);
  const [notifyComment,    setNotifyComment]     = useState(true);
  const [notifySubscriber, setNotifySubscriber]  = useState(true);
  const [notifyMilestone,  setNotifyMilestone]   = useState(true);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubChannel,
    showViews,
    comments,
    hdQuality,
    autoCaptions,
    defaultPrivate,
    subOnly,
    adRevenue,
    notifyComment,
    notifySubscriber,
    notifyMilestone,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    switch (key) {
      case 'pubChannel':       setPubChannel(v => !v);       break;
      case 'showViews':        setShowViews(v => !v);        break;
      case 'comments':         setComments(v => !v);         break;
      case 'hdQuality':        setHdQuality(v => !v);        break;
      case 'autoCaptions':     setAutoCaptions(v => !v);     break;
      case 'defaultPrivate':   setDefaultPrivate(v => !v);   break;
      case 'subOnly':          setSubOnly(v => !v);          break;
      case 'adRevenue':        setAdRevenue(v => !v);        break;
      case 'notifyComment':    setNotifyComment(v => !v);    break;
      case 'notifySubscriber': setNotifySubscriber(v => !v); break;
      case 'notifyMilestone':  setNotifyMilestone(v => !v);  break;
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
              <Text style={[s.titlePillText, { color: C.label }]}>KTV Settings</Text>
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
    rolePillWrap: { alignItems: 'flex-end', justifyContent: 'center' },

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
