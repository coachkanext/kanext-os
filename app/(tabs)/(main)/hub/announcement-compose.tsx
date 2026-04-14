/**
 * Announcement Compose — send a community-wide announcement.
 * Admin only. Sends to all members or a specific department/group.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, TextInput, ScrollView, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;

const TO_OPTIONS = [
  { label: 'All Members',   value: 'all',         count: 487 },
  { label: 'Worship Dept',  value: 'worship',     count: 42  },
  { label: 'Youth Dept',    value: 'youth',       count: 67  },
  { label: 'Hospitality',   value: 'hospitality', count: 38  },
  { label: 'Outreach Dept', value: 'outreach',    count: 55  },
  { label: 'Education',     value: 'education',   count: 29  },
];

export default function AnnouncementCompose() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [toValue, setToValue]           = useState('all');
  const [toDropdownOpen, setToDropdown] = useState(false);
  const [subject, setSubject]           = useState('');
  const [body, setBody]                 = useState('');
  const [showPreview, setShowPreview]   = useState(false);

  const selected = TO_OPTIONS.find(o => o.value === toValue)!;

  const handleSend = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [router]);

  const charCount = body.length;

  return (
    <View style={[st.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[st.topBarOuter, { paddingTop: insets.top + 6, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={st.topBar}>
          <KMenuButton onPress={openSidePanel} />
          <Text style={[st.topBarTitle, { color: C.label }]}>New Announcement</Text>
          <Pressable
            style={[st.sendBtn, { backgroundColor: subject.trim() && body.trim() ? C.accent : C.surfacePressed }]}
            onPress={handleSend}
            disabled={!subject.trim() || !body.trim()}
          >
            <Text style={[st.sendBtnText, { color: subject.trim() && body.trim() ? '#fff' : C.muted }]}>Send</Text>
          </Pressable>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={st.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 6 + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* To field */}
        <View style={[st.field, { borderBottomColor: C.separator }]}>
          <Text style={[st.fieldLabel, { color: C.secondary }]}>To</Text>
          <Pressable
            style={st.toSelector}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setToDropdown(v => !v); }}
          >
            <Text style={[st.toValue, { color: C.label }]}>{selected.label}</Text>
            <Text style={[st.toCount, { color: C.muted }]}>{selected.count} recipients</Text>
            <IconSymbol name="chevron.down" size={14} color={C.muted} />
          </Pressable>
        </View>

        {/* To Dropdown */}
        {toDropdownOpen && (
          <View style={[st.dropdown, { backgroundColor: C.surface, borderColor: C.separator }]}>
            {TO_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  st.dropdownOpt,
                  { borderBottomColor: C.separator },
                  pressed && { backgroundColor: C.surfacePressed },
                  opt.value === toValue && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setToValue(opt.value);
                  setToDropdown(false);
                }}
              >
                <Text style={[st.dropdownOptLabel, { color: C.label }]}>{opt.label}</Text>
                <Text style={[st.dropdownOptCount, { color: C.muted }]}>{opt.count}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Subject */}
        <View style={[st.field, { borderBottomColor: C.separator }]}>
          <Text style={[st.fieldLabel, { color: C.secondary }]}>Subject</Text>
          <TextInput
            style={[st.input, { color: C.label }]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Announcement title…"
            placeholderTextColor={C.muted}
          />
        </View>

        {/* Body */}
        <View style={[st.field, st.bodyField, { borderBottomColor: C.separator }]}>
          <Text style={[st.fieldLabel, { color: C.secondary }]}>Message</Text>
          <TextInput
            style={[st.bodyInput, { color: C.label }]}
            value={body}
            onChangeText={setBody}
            placeholder="Write your announcement…"
            placeholderTextColor={C.muted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Char count */}
        <Text style={[st.charCount, { color: C.muted }]}>{charCount} characters</Text>

        {/* Preview toggle */}
        <Pressable
          style={[st.previewToggle, { borderColor: C.separator }]}
          onPress={() => { Haptics.selectionAsync(); setShowPreview(v => !v); }}
        >
          <IconSymbol name={showPreview ? 'eye.slash' : 'eye'} size={16} color={C.secondary} />
          <Text style={[st.previewToggleText, { color: C.secondary }]}>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Text>
        </Pressable>

        {/* Preview */}
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
  screen: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: {
    height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, gap: 12,
  },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sendBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendBtnText: { fontSize: 14, fontWeight: '700' },
  scroll:      { flex: 1 },

  field:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  bodyField: { alignItems: 'flex-start', paddingTop: 14 },
  fieldLabel:{ width: 58, fontSize: 14, fontWeight: '600' },
  input:     { flex: 1, fontSize: 15 },
  bodyInput: { flex: 1, fontSize: 15, minHeight: 180, width: '100%' },

  toSelector:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  toValue:     { flex: 1, fontSize: 15 },
  toCount:     { fontSize: 12 },

  dropdown:    { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8, overflow: 'hidden' },
  dropdownOpt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownOptLabel: { flex: 1, fontSize: 14 },
  dropdownOptCount: { fontSize: 13 },

  charCount:      { fontSize: 12, textAlign: 'right', marginTop: 8, marginBottom: 12 },
  previewToggle:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  previewToggleText: { fontSize: 14 },

  preview:       { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 12, overflow: 'hidden' },
  previewHeader: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  previewLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  previewTo:     { paddingHorizontal: 14, paddingTop: 12, fontSize: 12 },
  previewSubject:{ paddingHorizontal: 14, paddingTop: 6, fontSize: 17, fontWeight: '700' },
  previewBody:   { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 14, fontSize: 14, lineHeight: 21 },
});
