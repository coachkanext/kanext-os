/**
 * Education Announcement Compose — send school-wide or targeted announcements.
 * Admin only. Recipients: All Students, specific department, or specific class.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';

const TO_OPTIONS = [
  { label: 'All Students',       value: 'all',      count: 3247 },
  { label: 'Business Dept',      value: 'business', count: 620  },
  { label: 'Natural Sciences',   value: 'sciences', count: 480  },
  { label: 'Liberal Arts',       value: 'arts',     count: 540  },
  { label: 'School of Education',value: 'education',count: 310  },
  { label: 'All Faculty',        value: 'faculty',  count: 86   },
  { label: 'ENG-201 Class',      value: 'eng201',   count: 26   },
  { label: 'MATH-202 Class',     value: 'math202',  count: 22   },
  { label: 'BUS-315 Class',      value: 'bus315',   count: 28   },
];

export default function EduAnnouncement() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [toValue, setToValue]         = useState('all');
  const [toDropdownOpen, setDropdown] = useState(false);
  const [subject, setSubject]         = useState('');
  const [body, setBody]               = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selected = TO_OPTIONS.find(o => o.value === toValue)!;
  const canSend  = subject.trim().length > 0 && body.trim().length > 0;

  const handleSend = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [router]);

  return (
    <View style={[st.screen, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[st.topBar, { paddingTop: insets.top + 6, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <KMenuButton onPress={openSidePanel} />
        <Text style={[st.topBarTitle, { color: C.label }]}>New Announcement</Text>
        <Pressable
          style={[st.sendBtn, { backgroundColor: canSend ? C.accent : C.surfacePressed }]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Text style={[st.sendBtnText, { color: canSend ? '#fff' : C.muted }]}>Send</Text>
        </Pressable>
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* To */}
        <View style={[st.field, { borderBottomColor: C.separator }]}>
          <Text style={[st.fieldLabel, { color: C.secondary }]}>To</Text>
          <Pressable
            style={st.toSelector}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdown(v => !v); }}
          >
            <Text style={[st.toValue, { color: C.label }]}>{selected.label}</Text>
            <Text style={[st.toCount, { color: C.muted }]}>{selected.count.toLocaleString()} recipients</Text>
            <IconSymbol name="chevron.down" size={14} color={C.muted} />
          </Pressable>
        </View>

        {toDropdownOpen && (
          <View style={[st.dropdown, { backgroundColor: C.surface, borderColor: C.separator }]}>
            {TO_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  st.dropdownOpt,
                  { borderBottomColor: C.separator },
                  (pressed || opt.value === toValue) && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => { Haptics.selectionAsync(); setToValue(opt.value); setDropdown(false); }}
              >
                <Text style={[st.dropdownOptLabel, { color: C.label }]}>{opt.label}</Text>
                <Text style={[st.dropdownOptCount, { color: C.muted }]}>{opt.count.toLocaleString()}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Subject */}
        <View style={[st.field, { borderBottomColor: C.separator }]}>
          <Text style={[st.fieldLabel, { color: C.secondary }]}>Subject</Text>
          <TextInput
            style={[st.input, { color: C.label }]}
            value={subject} onChangeText={setSubject}
            placeholder="Announcement title…"
            placeholderTextColor={C.muted}
          />
        </View>

        {/* Body */}
        <View style={[st.field, st.bodyField, { borderBottomColor: C.separator }]}>
          <Text style={[st.fieldLabel, { color: C.secondary }]}>Message</Text>
          <TextInput
            style={[st.bodyInput, { color: C.label }]}
            value={body} onChangeText={setBody}
            placeholder="Write your message…"
            placeholderTextColor={C.muted}
            multiline textAlignVertical="top"
          />
        </View>

        <Text style={[st.charCount, { color: C.muted }]}>{body.length} characters</Text>

        <Pressable
          style={[st.previewToggle, { borderColor: C.separator }]}
          onPress={() => { Haptics.selectionAsync(); setShowPreview(v => !v); }}
        >
          <IconSymbol name={showPreview ? 'eye.slash' : 'eye'} size={16} color={C.secondary} />
          <Text style={[st.previewToggleTxt, { color: C.secondary }]}>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Text>
        </Pressable>

        {showPreview && (
          <View style={[st.preview, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <View style={[st.previewHeader, { borderBottomColor: C.separator }]}>
              <Text style={[st.previewLabel, { color: C.muted }]}>PREVIEW</Text>
            </View>
            <Text style={[st.previewTo, { color: C.muted }]}>To: {selected.label}</Text>
            <Text style={[st.previewSubject, { color: C.label }]}>{subject || 'No subject'}</Text>
            <Text style={[st.previewBody, { color: C.secondary }]}>{body || 'No message yet.'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1 },
  topBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sendBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendBtnText: { fontSize: 14, fontWeight: '700' },
  scroll:      { flex: 1 },
  field:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  bodyField: { alignItems: 'flex-start', paddingTop: 14 },
  fieldLabel:{ width: 58, fontSize: 14, fontWeight: '600' },
  input:     { flex: 1, fontSize: 15 },
  bodyInput: { flex: 1, fontSize: 15, minHeight: 180, width: '100%' },
  toSelector:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  toValue:       { flex: 1, fontSize: 15 },
  toCount:       { fontSize: 12 },
  dropdown:      { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8, overflow: 'hidden' },
  dropdownOpt:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownOptLabel:{ flex: 1, fontSize: 14 },
  dropdownOptCount:{ fontSize: 13 },
  charCount:         { fontSize: 12, textAlign: 'right', marginTop: 8, marginBottom: 12 },
  previewToggle:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  previewToggleTxt:  { fontSize: 14 },
  preview:           { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 12, overflow: 'hidden' },
  previewHeader:     { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  previewLabel:      { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  previewTo:         { paddingHorizontal: 14, paddingTop: 12, fontSize: 12 },
  previewSubject:    { paddingHorizontal: 14, paddingTop: 6, fontSize: 17, fontWeight: '700' },
  previewBody:       { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 14, fontSize: 14, lineHeight: 21 },
});
