/**
 * Privacy Settings — Messaging permissions, profile visibility, discoverability,
 * activity status, data preferences, and brand directory visibility.
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
const GAIN = '#5A8A6E';

type MsgPermission = 'Everyone' | 'Followers' | 'Members' | 'No one';
const MSG_PERMISSION_CYCLE: MsgPermission[] = ['Everyone', 'Followers', 'Members', 'No one'];

export default function PrivacySettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [profileVisible, setProfileVisible]           = useState(true);
  const [phoneDiscoverable, setPhoneDiscoverable]     = useState(false);
  const [emailDiscoverable, setEmailDiscoverable]     = useState(true);
  const [activityStatus, setActivityStatus]           = useState(true);
  const [readReceipts, setReadReceipts]               = useState(true);
  const [dataSharing, setDataSharing]                 = useState(false);
  const [msgPermission, setMsgPermission]             = useState<MsgPermission>('Followers');
  const [dirVisibility, setDirVisibility]             = useState({ personal: true, sports: true, business: false });

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const cycleMsgPermission = () => {
    haptic();
    setMsgPermission(current => {
      const idx = MSG_PERMISSION_CYCLE.indexOf(current);
      return MSG_PERMISSION_CYCLE[(idx + 1) % MSG_PERMISSION_CYCLE.length];
    });
  };

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

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Privacy</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MESSAGING */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>MESSAGING</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={cycleMsgPermission}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="message.fill" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Who can message me</Text>
            <Text style={[s.previewText, { color: C.secondary }]}>{msgPermission}</Text>
            <IconSymbol name="chevron.down" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* PROFILE */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PROFILE</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="globe" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Public Profile</Text>
            <Toggle val={profileVisible} setVal={setProfileVisible} />
          </View>
        </GlassView>

        {/* DISCOVERABILITY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>DISCOVERABILITY</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="phone.fill" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Phone Number</Text>
            <Toggle val={phoneDiscoverable} setVal={setPhoneDiscoverable} />
          </View>
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="envelope.fill" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Email Address</Text>
            <Toggle val={emailDiscoverable} setVal={setEmailDiscoverable} />
          </View>
        </GlassView>

        {/* ACTIVITY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>ACTIVITY</Text>
        <GlassView tier={1} style={s.card}>
          {/* Activity Status row — icon + stacked label+description + toggle */}
          <View style={[s.row, { backgroundColor: C.surface, alignItems: 'center' }]}>
            <IconSymbol
              name="circle.fill"
              size={18}
              color={activityStatus ? GAIN : C.secondary}
            />
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label, flex: 0 }]}>Activity Status</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Show when you're online
              </Text>
            </View>
            <Toggle val={activityStatus} setVal={setActivityStatus} />
          </View>
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="eye.fill" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Read Receipts</Text>
            <Toggle val={readReceipts} setVal={setReadReceipts} />
          </View>
        </GlassView>

        {/* DATA */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>DATA</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="chart.bar.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Analytics & Personalization</Text>
            <Toggle val={dataSharing} setVal={setDataSharing} />
          </View>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="arrow.down.doc.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Download My Data</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* DIRECTORY VISIBILITY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>DIRECTORY VISIBILITY</Text>
        <GlassView tier={1} style={s.card}>
          {/* Personal Brand */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <Text style={[s.rowLabel, { color: C.label }]}>Personal Brand</Text>
            <Text style={[s.dirStatusText, { color: C.secondary }]}>
              {dirVisibility.personal ? 'Visible' : 'Hidden'}
            </Text>
            <Pressable
              onPress={() => { haptic(); setDirVisibility(prev => ({ ...prev, personal: !prev.personal })); }}
              style={{
                width: 44, height: 26, borderRadius: 13, padding: 2,
                justifyContent: 'center',
                backgroundColor: dirVisibility.personal ? C.label : C.separator,
              }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: C.bg,
                marginLeft: dirVisibility.personal ? 18 : 0,
              }} />
            </Pressable>
          </View>
          {/* KaNeXT Sports */}
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <Text style={[s.rowLabel, { color: C.label }]}>KaNeXT Sports</Text>
            <Text style={[s.dirStatusText, { color: C.secondary }]}>
              {dirVisibility.sports ? 'Visible' : 'Hidden'}
            </Text>
            <Pressable
              onPress={() => { haptic(); setDirVisibility(prev => ({ ...prev, sports: !prev.sports })); }}
              style={{
                width: 44, height: 26, borderRadius: 13, padding: 2,
                justifyContent: 'center',
                backgroundColor: dirVisibility.sports ? C.label : C.separator,
              }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: C.bg,
                marginLeft: dirVisibility.sports ? 18 : 0,
              }} />
            </Pressable>
          </View>
          {/* KaNeXT Business */}
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <Text style={[s.rowLabel, { color: C.label }]}>KaNeXT Business</Text>
            <Text style={[s.dirStatusText, { color: C.secondary }]}>
              {dirVisibility.business ? 'Visible' : 'Hidden'}
            </Text>
            <Pressable
              onPress={() => { haptic(); setDirVisibility(prev => ({ ...prev, business: !prev.business })); }}
              style={{
                width: 44, height: 26, borderRadius: 13, padding: 2,
                justifyContent: 'center',
                backgroundColor: dirVisibility.business ? C.label : C.separator,
              }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: C.bg,
                marginLeft: dirVisibility.business ? 18 : 0,
              }} />
            </Pressable>
          </View>
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
    card:          { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel:      { flex: 1, fontSize: 15 },
    previewText:   { fontSize: 14 },
    dirStatusText: { fontSize: 13 },
  });
}
