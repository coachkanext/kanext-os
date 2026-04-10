/**
 * Notifications Settings — Toggle notification preferences by category.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;

export default function NotificationsSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Global
  const [globalOn, setGlobalOn] = useState(true);
  // Messages
  const [msgDMs, setMsgDMs]       = useState(true);
  const [msgRooms, setMsgRooms]   = useState(true);
  const [msgEmail, setMsgEmail]   = useState(false);
  // Social
  const [socLikes, setSocLikes]         = useState(true);
  const [socComments, setSocComments]   = useState(true);
  const [socFollows, setSocFollows]     = useState(true);
  const [socMentions, setSocMentions]   = useState(true);
  // Financial
  const [finPayments, setFinPayments] = useState(true);
  const [finDeposits, setFinDeposits] = useState(true);
  const [finLowBal, setFinLowBal]     = useState(true);
  const [finLarge, setFinLarge]       = useState(true);
  // Brand
  const [brandAnnounce, setBrandAnnounce] = useState(true);
  const [brandEvents, setBrandEvents]     = useState(true);
  const [brandTasks, setBrandTasks]       = useState(false);
  // Dipson
  const [dipsonComplete, setDipsonComplete]   = useState(true);
  const [dipsonScheduled, setDipsonScheduled] = useState(true);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const Toggle = ({ val, setVal }: { val: boolean; setVal: (fn: (v: boolean) => boolean) => void }) => (
    <Pressable
      onPress={() => { haptic(); setVal(v => !v); }}
      style={{
        width: 44, height: 26, borderRadius: 13, padding: 2,
        justifyContent: 'center',
        backgroundColor: val ? C.label : C.separator,
      }}
    >
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: C.bg,
        marginLeft: val ? 18 : 0,
      }} />
    </Pressable>
  );

  const ToggleRow = ({
    icon, label, val, setVal, isFirst,
  }: {
    icon: string; label: string;
    val: boolean; setVal: (fn: (v: boolean) => boolean) => void;
    isFirst: boolean;
  }) => (
    <View style={[
      s.row,
      { backgroundColor: C.surface },
      !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
    ]}>
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[s.rowLabel, { color: C.label }]}>{label}</Text>
      <Toggle val={val} setVal={setVal} />
    </View>
  );

  const NavRow = ({
    icon, label, preview, isFirst,
  }: {
    icon: string; label: string; preview: string; isFirst: boolean;
  }) => (
    <Pressable
      onPress={() => haptic()}
      style={[
        s.row,
        { backgroundColor: C.surface },
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
      ]}
    >
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[s.rowLabel, { color: C.label }]}>{label}</Text>
      <Text style={[s.previewText, { color: C.secondary }]}>{preview}</Text>
      <IconSymbol name="chevron.right" size={13} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Notifications</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Global Toggle — prominent card at top */}
        <GlassView tier={1} style={[s.card, { marginTop: 16 }]}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol
              name="bell.fill"
              size={20}
              color={globalOn ? C.label : C.secondary}
            />
            <Text style={[s.globalLabel, { color: C.label }]}>Notifications</Text>
            <Toggle val={globalOn} setVal={setGlobalOn} />
          </View>
        </GlassView>

        {/* MESSAGES */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>MESSAGES</Text>
        <GlassView tier={1} style={s.card}>
          <ToggleRow icon="message.fill"                        label="Direct Messages"    val={msgDMs}   setVal={setMsgDMs}   isFirst={true}  />
          <ToggleRow icon="bubble.left.and.bubble.right.fill"   label="Rooms & Channels"   val={msgRooms} setVal={setMsgRooms} isFirst={false} />
          <ToggleRow icon="envelope.fill"                       label="Email Digests"      val={msgEmail} setVal={setMsgEmail} isFirst={false} />
        </GlassView>

        {/* SOCIAL */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>SOCIAL</Text>
        <GlassView tier={1} style={s.card}>
          <ToggleRow icon="heart.fill"          label="Likes"          val={socLikes}    setVal={setSocLikes}    isFirst={true}  />
          <ToggleRow icon="text.bubble.fill"    label="Comments"       val={socComments} setVal={setSocComments} isFirst={false} />
          <ToggleRow icon="person.badge.plus"   label="New Followers"  val={socFollows}  setVal={setSocFollows}  isFirst={false} />
          <ToggleRow icon="at"                  label="Mentions"       val={socMentions} setVal={setSocMentions} isFirst={false} />
        </GlassView>

        {/* FINANCIAL */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>FINANCIAL</Text>
        <GlassView tier={1} style={s.card}>
          <ToggleRow icon="dollarsign.circle.fill"           label="Payments Received"  val={finPayments} setVal={setFinPayments} isFirst={true}  />
          <ToggleRow icon="arrow.down.circle.fill"           label="Deposits"           val={finDeposits} setVal={setFinDeposits} isFirst={false} />
          <ToggleRow icon="exclamationmark.circle.fill"      label="Low Balance"        val={finLowBal}   setVal={setFinLowBal}   isFirst={false} />
          <ToggleRow icon="arrow.up.arrow.down.circle.fill"  label="Large Transactions" val={finLarge}    setVal={setFinLarge}    isFirst={false} />
        </GlassView>

        {/* BRAND */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BRAND</Text>
        <GlassView tier={1} style={s.card}>
          <ToggleRow icon="megaphone.fill"        label="Announcements" val={brandAnnounce} setVal={setBrandAnnounce} isFirst={true}  />
          <ToggleRow icon="calendar.badge.plus"   label="Events"        val={brandEvents}   setVal={setBrandEvents}   isFirst={false} />
          <ToggleRow icon="checkmark.circle.fill" label="Task Updates"  val={brandTasks}    setVal={setBrandTasks}    isFirst={false} />
        </GlassView>

        {/* DIPSON */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>DIPSON</Text>
        <GlassView tier={1} style={s.card}>
          <ToggleRow icon="wand.and.stars" label="Task Complete"    val={dipsonComplete}  setVal={setDipsonComplete}  isFirst={true}  />
          <ToggleRow icon="clock.fill"     label="Scheduled Sends"  val={dipsonScheduled} setVal={setDipsonScheduled} isFirst={false} />
        </GlassView>

        {/* QUIET HOURS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>QUIET HOURS</Text>
        <GlassView tier={1} style={s.card}>
          <NavRow icon="moon.fill"    label="Start Time" preview="10:00 PM" isFirst={true}  />
          <NavRow icon="sun.max.fill" label="End Time"   preview="7:00 AM"  isFirst={false} />
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:  { fontSize: 14, fontWeight: '700' },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 16, marginBottom: 6, marginTop: 24,
    },
    card:        { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel:    { flex: 1, fontSize: 15 },
    globalLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
    previewText: { fontSize: 14 },
  });
}
