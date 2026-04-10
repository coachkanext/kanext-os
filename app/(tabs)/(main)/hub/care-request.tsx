/**
 * Care Request Submit — member submits a prayer, counseling, or support request.
 * Private — only admin and the submitter see the details.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, TextInput, ScrollView, StyleSheet, Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import type { CareRequestType } from '@/data/mock-community-hub';

const REQUEST_TYPES: CareRequestType[] = ['Prayer', 'Counseling', 'Financial Aid', 'General'];

export default function CareRequestScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [reqType, setReqType]   = useState<CareRequestType>('Prayer');
  const [details, setDetails]   = useState('');
  const [anonymous, setAnon]    = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!details.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  }, [details]);

  if (submitted) {
    return (
      <View style={[succ.screen, { backgroundColor: C.bg }]}>
        <View style={[succ.topBar, { paddingTop: insets.top + 6, borderBottomColor: C.separator }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="xmark" size={20} color={C.label} />
          </Pressable>
        </View>
        <View style={succ.body}>
          <View style={[succ.iconWrap, { backgroundColor: '#5A8A6E22' }]}>
            <IconSymbol name="checkmark.circle.fill" size={44} color="#5A8A6E" />
          </View>
          <Text style={[succ.title, { color: C.label }]}>Request Submitted</Text>
          <Text style={[succ.sub, { color: C.secondary }]}>
            Your request has been received. Our pastoral team will follow up privately.
          </Text>
          <Pressable style={[succ.btn, { backgroundColor: C.label }]} onPress={() => router.back()}>
            <Text style={[succ.btnText, { color: C.bg }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[st.screen, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[st.topBar, { paddingTop: insets.top + 6, borderBottomColor: C.separator, backgroundColor: C.bg }]}>
        <KMenuButton onPress={openSidePanel} />
        <Text style={[st.topBarTitle, { color: C.label }]}>Care Request</Text>
        <Pressable
          style={[st.submitBtn, { backgroundColor: details.trim() ? C.accent : C.surfacePressed }]}
          onPress={handleSubmit}
          disabled={!details.trim()}
        >
          <Text style={[st.submitBtnText, { color: details.trim() ? '#fff' : C.muted }]}>Submit</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Privacy notice */}
        <View style={[st.notice, { backgroundColor: '#5A8A6E18', borderColor: '#5A8A6E44' }]}>
          <IconSymbol name="lock.fill" size={14} color="#5A8A6E" />
          <Text style={[st.noticeText, { color: '#5A8A6E' }]}>
            Your request is private — only pastoral leadership can see it.
          </Text>
        </View>

        {/* Request Type */}
        <Text style={[st.label, { color: C.label }]}>Request Type</Text>
        <View style={st.typeRow}>
          {REQUEST_TYPES.map(t => (
            <Pressable
              key={t}
              style={[
                st.typeBtn,
                { borderColor: reqType === t ? C.accent : C.separator },
                reqType === t && { backgroundColor: `${C.accent}18` },
              ]}
              onPress={() => { Haptics.selectionAsync(); setReqType(t); }}
            >
              <Text style={[st.typeBtnText, { color: reqType === t ? C.accent : C.secondary }]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Details */}
        <Text style={[st.label, { color: C.label }]}>Details</Text>
        <TextInput
          style={[st.detailsInput, { color: C.label, borderColor: C.inputBorder, backgroundColor: C.surface }]}
          value={details}
          onChangeText={setDetails}
          placeholder="Share what you need prayer or support for…"
          placeholderTextColor={C.muted}
          multiline
          textAlignVertical="top"
        />

        {/* Anonymous toggle */}
        <View style={[st.anonRow, { borderTopColor: C.separator }]}>
          <View style={st.anonInfo}>
            <Text style={[st.anonLabel, { color: C.label }]}>Submit Anonymously</Text>
            <Text style={[st.anonSub, { color: C.secondary }]}>
              Your name won't be shared with anyone
            </Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={v => { Haptics.selectionAsync(); setAnon(v); }}
            trackColor={{ false: C.separator, true: C.accent }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  submitBtn:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  submitBtnText: { fontSize: 14, fontWeight: '700' },

  notice:     { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18 },

  label:      { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  typeRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeBtn:    { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, borderWidth: 1.5 },
  typeBtnText:{ fontSize: 13, fontWeight: '600' },

  detailsInput: {
    borderWidth: 1, borderRadius: 14, padding: 14,
    fontSize: 14, minHeight: 140, lineHeight: 21, marginBottom: 20,
  },

  anonRow:    { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  anonInfo:   { flex: 1 },
  anonLabel:  { fontSize: 15, fontWeight: '600' },
  anonSub:    { fontSize: 12, marginTop: 2 },
});

const succ = StyleSheet.create({
  screen:  { flex: 1 },
  topBar:  { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  body:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  iconWrap:{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: 22, fontWeight: '800' },
  sub:     { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  btn:     { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, marginTop: 8 },
  btnText: { fontSize: 15, fontWeight: '700' },
});
