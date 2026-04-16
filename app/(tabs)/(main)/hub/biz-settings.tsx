/**
 * Business Hub — Settings. CEO + Client.
 * CEO: company profile, client portal, team, notifications.
 * Client: account preferences and notifications.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Switch } from 'react-native';
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

const TOP_BAR_H = 52;

type ToggleKey =
  | 'pubProfile' | 'showFollowers' | 'showRevenue'
  | 'clientPortal' | 'invoiceNotify' | 'deliverableApprovals'
  | 'teamDirectory' | 'projectNotify' | 'teamUpdates'
  | 'notifyInquiry' | 'notifyDeadline' | 'notifyInvoice'
  | 'clientProjectUpdates' | 'clientInvoiceAlerts' | 'clientDeliverableAlerts' | 'clientMessages';

type ToggleRow = { icon: string; label: string; stateKey: ToggleKey };
type Section   = { header: string; rows: ToggleRow[] };

const SECTIONS: Section[] = [
  {
    header: 'COMPANY PROFILE',
    rows: [
      { icon: 'building.2.fill',   label: 'Public Business Profile',  stateKey: 'pubProfile'    },
      { icon: 'person.2.fill',     label: 'Show Follower Count',       stateKey: 'showFollowers' },
      { icon: 'chart.bar.fill',    label: 'Show Revenue Stats',        stateKey: 'showRevenue'   },
    ],
  },
  {
    header: 'CLIENT PORTAL',
    rows: [
      { icon: 'person.badge.key.fill',  label: 'Client Project Access',       stateKey: 'clientPortal'          },
      { icon: 'doc.text.fill',          label: 'Invoice Notifications',        stateKey: 'invoiceNotify'         },
      { icon: 'checkmark.seal.fill',    label: 'Deliverable Approvals',        stateKey: 'deliverableApprovals'  },
    ],
  },
  {
    header: 'TEAM',
    rows: [
      { icon: 'person.3.fill',       label: 'Team Directory Visibility',       stateKey: 'teamDirectory' },
      { icon: 'bell.badge.fill',     label: 'Project Assignment Alerts',       stateKey: 'projectNotify' },
      { icon: 'arrow.triangle.2.circlepath', label: 'Team Status Updates',     stateKey: 'teamUpdates'   },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'tray.and.arrow.down.fill', label: 'New Client Inquiry',    stateKey: 'notifyInquiry'  },
      { icon: 'calendar.badge.exclamationmark', label: 'Project Deadline Alerts', stateKey: 'notifyDeadline' },
      { icon: 'dollarsign.circle.fill',   label: 'Invoice Due Alerts',    stateKey: 'notifyInvoice'  },
    ],
  },
];

const CLIENT_SECTIONS: Section[] = [
  {
    header: 'ACCOUNT',
    rows: [
      { icon: 'person.crop.rectangle', label: 'Show My Profile',          stateKey: 'pubProfile'             },
      { icon: 'checkmark.seal.fill',   label: 'Deliverable Approvals',    stateKey: 'deliverableApprovals'   },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'folder.fill',               label: 'Project Updates',       stateKey: 'clientProjectUpdates'   },
      { icon: 'dollarsign.circle.fill',     label: 'Invoice Alerts',        stateKey: 'clientInvoiceAlerts'    },
      { icon: 'checkmark.circle.fill',      label: 'Deliverable Alerts',    stateKey: 'clientDeliverableAlerts'},
      { icon: 'message.fill',               label: 'Messages',              stateKey: 'clientMessages'         },
    ],
  },
];

function ToggleRowItem({ row, C, s, value, onToggle }: { row: ToggleRow; C: ComponentColors; s: ReturnType<typeof makeStyles>; value: boolean; onToggle: () => void }) {
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

export default function BizSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];

  const [pubProfile,           setPubProfile]           = useState(true);
  const [showFollowers,        setShowFollowers]        = useState(true);
  const [showRevenue,          setShowRevenue]          = useState(false);
  const [clientPortal,         setClientPortal]         = useState(true);
  const [invoiceNotify,        setInvoiceNotify]        = useState(true);
  const [deliverableApprovals, setDeliverableApprovals] = useState(true);
  const [teamDirectory,        setTeamDirectory]        = useState(true);
  const [projectNotify,        setProjectNotify]        = useState(true);
  const [teamUpdates,          setTeamUpdates]          = useState(false);
  const [notifyInquiry,           setNotifyInquiry]           = useState(true);
  const [notifyDeadline,          setNotifyDeadline]          = useState(true);
  const [notifyInvoice,           setNotifyInvoice]           = useState(true);
  const [clientProjectUpdates,    setClientProjectUpdates]    = useState(true);
  const [clientInvoiceAlerts,     setClientInvoiceAlerts]     = useState(true);
  const [clientDeliverableAlerts, setClientDeliverableAlerts] = useState(true);
  const [clientMessages,          setClientMessages]          = useState(true);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubProfile, showFollowers, showRevenue,
    clientPortal, invoiceNotify, deliverableApprovals,
    teamDirectory, projectNotify, teamUpdates,
    notifyInquiry, notifyDeadline, notifyInvoice,
    clientProjectUpdates, clientInvoiceAlerts, clientDeliverableAlerts, clientMessages,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    switch (key) {
      case 'pubProfile':              setPubProfile(v => !v);              break;
      case 'showFollowers':           setShowFollowers(v => !v);           break;
      case 'showRevenue':             setShowRevenue(v => !v);             break;
      case 'clientPortal':            setClientPortal(v => !v);            break;
      case 'invoiceNotify':           setInvoiceNotify(v => !v);           break;
      case 'deliverableApprovals':    setDeliverableApprovals(v => !v);    break;
      case 'teamDirectory':           setTeamDirectory(v => !v);           break;
      case 'projectNotify':           setProjectNotify(v => !v);           break;
      case 'teamUpdates':             setTeamUpdates(v => !v);             break;
      case 'notifyInquiry':           setNotifyInquiry(v => !v);           break;
      case 'notifyDeadline':          setNotifyDeadline(v => !v);          break;
      case 'notifyInvoice':           setNotifyInvoice(v => !v);           break;
      case 'clientProjectUpdates':    setClientProjectUpdates(v => !v);    break;
      case 'clientInvoiceAlerts':     setClientInvoiceAlerts(v => !v);     break;
      case 'clientDeliverableAlerts': setClientDeliverableAlerts(v => !v); break;
      case 'clientMessages':          setClientMessages(v => !v);          break;
    }
  }, []);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Settings</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {(isCEO ? SECTIONS : CLIENT_SECTIONS).map(section => (
          <View key={section.header} style={{ marginBottom: 28 }}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>{section.header}</Text>
            <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
              {section.rows.map((row, idx) => (
                <View key={row.stateKey}>
                  {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                  <ToggleRowItem row={row} C={C} s={s} value={toggleValues[row.stateKey]} onToggle={() => handleToggle(row.stateKey)} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, marginBottom: 8 },
  sectionCard: { borderRadius: 14, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowSep: { height: StyleSheet.hairlineWidth },
});
