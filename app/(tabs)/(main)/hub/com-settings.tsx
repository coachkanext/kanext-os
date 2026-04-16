/**
 * Community Hub — Settings. Pastor + Member.
 * Pastor: church profile, services & events, congregation, giving.
 * Member: personal preferences and notifications.
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
  | 'pubProfile' | 'showMemberCount' | 'showServiceTimes' | 'acceptNewMembers'
  | 'notifyScheduleChanges' | 'allowRsvps' | 'showAttendanceTracking' | 'liveStreamServices'
  | 'memberDirectoryVisible' | 'allowMemberMessaging' | 'requireApproval'
  | 'onlineGiving' | 'showGivingTotals' | 'givingReceipts' | 'recurringGiving'
  | 'serviceReminders' | 'eventNotifications' | 'givingReminders' | 'profileInDirectory'
  | 'announcements' | 'ministryUpdates' | 'prayerRequests';

type ToggleRow = { icon: string; label: string; stateKey: ToggleKey };
type Section   = { header: string; rows: ToggleRow[] };

const PASTOR_SECTIONS: Section[] = [
  {
    header: 'CHURCH PROFILE',
    rows: [
      { icon: 'building.columns',      label: 'Public Profile Visible',           stateKey: 'pubProfile'            },
      { icon: 'person.3.fill',         label: 'Show Member Count',                stateKey: 'showMemberCount'       },
      { icon: 'clock',                 label: 'Show Service Times on Profile',    stateKey: 'showServiceTimes'      },
      { icon: 'person.badge.plus',     label: 'Accept New Members',               stateKey: 'acceptNewMembers'      },
    ],
  },
  {
    header: 'SERVICES & EVENTS',
    rows: [
      { icon: 'bell.badge.fill',       label: 'Notify Members of Schedule Changes', stateKey: 'notifyScheduleChanges' },
      { icon: 'calendar.badge.plus',   label: 'Allow RSVPs for Events',             stateKey: 'allowRsvps'            },
      { icon: 'chart.bar.fill',        label: 'Show Attendance Tracking',           stateKey: 'showAttendanceTracking'},
      { icon: 'video.fill',            label: 'Live Stream Services',               stateKey: 'liveStreamServices'    },
    ],
  },
  {
    header: 'CONGREGATION',
    rows: [
      { icon: 'book.fill',             label: 'Member Directory Visible to Members', stateKey: 'memberDirectoryVisible' },
      { icon: 'message.fill',          label: 'Allow Member-to-Member Messaging',    stateKey: 'allowMemberMessaging'   },
      { icon: 'checkmark.seal.fill',   label: 'Require Approval for New Members',    stateKey: 'requireApproval'        },
    ],
  },
  {
    header: 'GIVING',
    rows: [
      { icon: 'dollarsign.circle.fill', label: 'Online Giving Enabled',             stateKey: 'onlineGiving'      },
      { icon: 'chart.bar.fill',         label: 'Show Giving Totals to Leadership',  stateKey: 'showGivingTotals'  },
      { icon: 'envelope.fill',          label: 'Send Giving Receipts Automatically',stateKey: 'givingReceipts'    },
      { icon: 'arrow.clockwise',        label: 'Allow Recurring Giving Setup',       stateKey: 'recurringGiving'   },
    ],
  },
];

const MEMBER_SECTIONS: Section[] = [
  {
    header: 'MY PREFERENCES',
    rows: [
      { icon: 'bell.fill',             label: 'Receive Service Reminders',         stateKey: 'serviceReminders'    },
      { icon: 'calendar',              label: 'Receive Event Notifications',        stateKey: 'eventNotifications'  },
      { icon: 'dollarsign.circle.fill',label: 'Receive Giving Reminders',           stateKey: 'givingReminders'     },
      { icon: 'person.crop.rectangle', label: 'Show My Profile in Member Directory',stateKey: 'profileInDirectory'  },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'megaphone.fill',        label: 'Announcements',                      stateKey: 'announcements'    },
      { icon: 'info.circle.fill',      label: 'Ministry Updates',                   stateKey: 'ministryUpdates'  },
      { icon: 'heart.fill',            label: 'Prayer Requests',                    stateKey: 'prayerRequests'   },
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

export default function ComSettings() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  // Pastor toggles
  const [pubProfile,             setPubProfile]             = useState(true);
  const [showMemberCount,        setShowMemberCount]        = useState(true);
  const [showServiceTimes,       setShowServiceTimes]       = useState(true);
  const [acceptNewMembers,       setAcceptNewMembers]       = useState(true);
  const [notifyScheduleChanges,  setNotifyScheduleChanges]  = useState(true);
  const [allowRsvps,             setAllowRsvps]             = useState(true);
  const [showAttendanceTracking, setShowAttendanceTracking] = useState(false);
  const [liveStreamServices,     setLiveStreamServices]     = useState(true);
  const [memberDirectoryVisible, setMemberDirectoryVisible] = useState(true);
  const [allowMemberMessaging,   setAllowMemberMessaging]   = useState(true);
  const [requireApproval,        setRequireApproval]        = useState(false);
  const [onlineGiving,           setOnlineGiving]           = useState(true);
  const [showGivingTotals,       setShowGivingTotals]       = useState(true);
  const [givingReceipts,         setGivingReceipts]         = useState(true);
  const [recurringGiving,        setRecurringGiving]        = useState(true);

  // Member toggles
  const [serviceReminders,    setServiceReminders]    = useState(true);
  const [eventNotifications,  setEventNotifications]  = useState(true);
  const [givingReminders,     setGivingReminders]     = useState(false);
  const [profileInDirectory,  setProfileInDirectory]  = useState(true);
  const [announcements,       setAnnouncements]       = useState(true);
  const [ministryUpdates,     setMinistryUpdates]     = useState(true);
  const [prayerRequests,      setPrayerRequests]      = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubProfile, showMemberCount, showServiceTimes, acceptNewMembers,
    notifyScheduleChanges, allowRsvps, showAttendanceTracking, liveStreamServices,
    memberDirectoryVisible, allowMemberMessaging, requireApproval,
    onlineGiving, showGivingTotals, givingReceipts, recurringGiving,
    serviceReminders, eventNotifications, givingReminders, profileInDirectory,
    announcements, ministryUpdates, prayerRequests,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    switch (key) {
      case 'pubProfile':             setPubProfile(v => !v);             break;
      case 'showMemberCount':        setShowMemberCount(v => !v);        break;
      case 'showServiceTimes':       setShowServiceTimes(v => !v);       break;
      case 'acceptNewMembers':       setAcceptNewMembers(v => !v);       break;
      case 'notifyScheduleChanges':  setNotifyScheduleChanges(v => !v);  break;
      case 'allowRsvps':             setAllowRsvps(v => !v);             break;
      case 'showAttendanceTracking': setShowAttendanceTracking(v => !v); break;
      case 'liveStreamServices':     setLiveStreamServices(v => !v);     break;
      case 'memberDirectoryVisible': setMemberDirectoryVisible(v => !v); break;
      case 'allowMemberMessaging':   setAllowMemberMessaging(v => !v);   break;
      case 'requireApproval':        setRequireApproval(v => !v);        break;
      case 'onlineGiving':           setOnlineGiving(v => !v);           break;
      case 'showGivingTotals':       setShowGivingTotals(v => !v);       break;
      case 'givingReceipts':         setGivingReceipts(v => !v);         break;
      case 'recurringGiving':        setRecurringGiving(v => !v);        break;
      case 'serviceReminders':       setServiceReminders(v => !v);       break;
      case 'eventNotifications':     setEventNotifications(v => !v);     break;
      case 'givingReminders':        setGivingReminders(v => !v);        break;
      case 'profileInDirectory':     setProfileInDirectory(v => !v);     break;
      case 'announcements':          setAnnouncements(v => !v);          break;
      case 'ministryUpdates':        setMinistryUpdates(v => !v);        break;
      case 'prayerRequests':         setPrayerRequests(v => !v);         break;
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
              <Text style={[s.titlePillText, { color: C.label }]}>Church Settings</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
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
        {(isPastor ? PASTOR_SECTIONS : MEMBER_SECTIONS).map(section => (
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
