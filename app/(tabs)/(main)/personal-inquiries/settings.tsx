/**
 * Inquiry Settings — tile-level settings for the Personal Inquiries tile.
 * Personal mode. Controls intake, pipeline, public page, and notifications.
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

type ToggleKey =
  | 'openInquiries'
  | 'autoReply'
  | 'showBudget'
  | 'notifyNew'
  | 'followUpReminders'
  | 'autoArchive'
  | 'publicPage'
  | 'showTrustedBy'
  | 'showResponseTime'
  | 'notifyMessages'
  | 'notifyStatus';

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
    header: 'INTAKE',
    rows: [
      { icon: 'tray.and.arrow.down.fill', label: 'Open for Inquiries',    stateKey: 'openInquiries'    },
      { icon: 'envelope.badge.fill',      label: 'Auto-Reply',            stateKey: 'autoReply'        },
      { icon: 'dollarsign.circle',        label: 'Show Budget Field',     stateKey: 'showBudget'       },
    ],
  },
  {
    header: 'PIPELINE',
    rows: [
      { icon: 'bell.badge.fill',          label: 'New Inquiry Notifications', stateKey: 'notifyNew'         },
      { icon: 'clock.badge.fill',         label: 'Follow-up Reminders',       stateKey: 'followUpReminders' },
      { icon: 'archivebox.fill',          label: 'Auto-Archive Declined',     stateKey: 'autoArchive'       },
    ],
  },
  {
    header: 'YOUR PUBLIC PAGE',
    rows: [
      { icon: 'globe',                    label: 'Visible to the public',     stateKey: 'publicPage'        },
      { icon: 'building.2.fill',          label: 'Show Trusted By Logos',     stateKey: 'showTrustedBy'     },
      { icon: 'clock',                    label: 'Show Response Time',        stateKey: 'showResponseTime'  },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'message.fill',             label: 'New Message Alerts',        stateKey: 'notifyMessages'    },
      { icon: 'checkmark.circle.fill',    label: 'Status Change Alerts',      stateKey: 'notifyStatus'      },
    ],
  },
];

// ── Main screen ───────────────────────────────────────────────────────────────

export default function InquirySettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:inquiries');
  const isOwner = role === roleCycles[0];

  const [openInquiries,    setOpenInquiries]    = useState(true);
  const [autoReply,        setAutoReply]        = useState(true);
  const [showBudget,       setShowBudget]       = useState(true);
  const [notifyNew,        setNotifyNew]        = useState(true);
  const [followUpReminders,setFollowUpReminders]= useState(true);
  const [autoArchive,      setAutoArchive]      = useState(false);
  const [publicPage,       setPublicPage]       = useState(true);
  const [showTrustedBy,    setShowTrustedBy]    = useState(true);
  const [showResponseTime, setShowResponseTime] = useState(true);
  const [notifyMessages,   setNotifyMessages]   = useState(true);
  const [notifyStatus,     setNotifyStatus]     = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    openInquiries,
    autoReply,
    showBudget,
    notifyNew,
    followUpReminders,
    autoArchive,
    publicPage,
    showTrustedBy,
    showResponseTime,
    notifyMessages,
    notifyStatus,
  };

  const setters: Record<ToggleKey, React.Dispatch<React.SetStateAction<boolean>>> = {
    openInquiries:    setOpenInquiries,
    autoReply:        setAutoReply,
    showBudget:       setShowBudget,
    notifyNew:        setNotifyNew,
    followUpReminders:setFollowUpReminders,
    autoArchive:      setAutoArchive,
    publicPage:       setPublicPage,
    showTrustedBy:    setShowTrustedBy,
    showResponseTime: setShowResponseTime,
    notifyMessages:   setNotifyMessages,
    notifyStatus:     setNotifyStatus,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    setters[key](v => !v);
  }, []);

  function renderRow(row: ToggleRow, idx: number) {
    return (
      <View key={row.stateKey}>
        {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
        <View style={s.row}>
          <IconSymbol name={row.icon as any} size={22} color={C.label} />
          <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
          <Switch
            value={toggleValues[row.stateKey]}
            onValueChange={() => handleToggle(row.stateKey)}
            trackColor={{ false: C.separator, true: C.label }}
            thumbColor={C.bg}
            ios_backgroundColor={C.separator}
          />
        </View>
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
              <Text style={[s.titlePillText, { color: C.label }]}>Inquiry Settings</Text>
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
