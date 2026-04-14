/**
 * Newsletter Compose — full-screen compose form for Hub.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { HUB_TIERS } from '@/data/mock-hub';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;

type ToOption = 'All Subscribers' | 'Free' | 'Supporter' | 'Inner Circle';

const TO_OPTIONS: ToOption[] = ['All Subscribers', 'Free', 'Supporter', 'Inner Circle'];

export default function NewsletterComposeScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [toTier, setToTier] = useState<ToOption>('All Subscribers');
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const recipientCount = (() => {
    if (toTier === 'All Subscribers') return HUB_TIERS.reduce((s, t) => s + t.subscriberCount, 0);
    const tier = HUB_TIERS.find(t => t.name === toTier);
    return tier?.subscriberCount ?? 0;
  })();

  const handleSend = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [router]);

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={styles.backBtn}
            hitSlop={12}
          >
            <IconSymbol name="chevron.left" size={20} color={C.label} />
            <Text style={[styles.backText, { color: C.label }]}>Back</Text>
          </Pressable>
          <Text style={[styles.topBarTitle, { color: C.label }]}>New Newsletter</Text>
          <Pressable
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: C.accent }]}
          >
            <Text style={styles.sendBtnText}>{scheduled ? 'Schedule' : 'Send'}</Text>
          </Pressable>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* To field */}
        <View style={[styles.fieldRow, { borderBottomColor: C.separator }]}>
          <Text style={[styles.fieldLabel, { color: C.secondary }]}>To</Text>
          <Pressable
            style={styles.fieldValueRow}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setToDropdownOpen(v => !v); }}
          >
            <Text style={[styles.fieldValue, { color: C.label }]}>{toTier}</Text>
            <Text style={[styles.recipientCount, { color: C.secondary }]}>({recipientCount} recipients)</Text>
            <IconSymbol name="chevron.down" size={14} color={C.secondary} />
          </Pressable>
        </View>

        {/* To dropdown */}
        {toDropdownOpen && (
          <View style={[styles.toDropdown, { backgroundColor: C.surface, borderColor: C.separator }]}>
            {TO_OPTIONS.map(opt => (
              <Pressable
                key={opt}
                style={({ pressed }) => [
                  styles.toOption,
                  { borderBottomColor: C.separator },
                  pressed && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setToTier(opt);
                  setToDropdownOpen(false);
                }}
              >
                <Text style={[styles.toOptionText, { color: opt === toTier ? C.accent : C.label }]}>{opt}</Text>
                {opt === toTier && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        )}

        {/* Subject field */}
        <View style={[styles.fieldRow, { borderBottomColor: C.separator }]}>
          <Text style={[styles.fieldLabel, { color: C.secondary }]}>Subject</Text>
          <TextInput
            style={[styles.subjectInput, { color: C.label }]}
            placeholder="Email subject line…"
            placeholderTextColor={C.muted}
            value={subject}
            onChangeText={setSubject}
            returnKeyType="next"
          />
        </View>

        {/* Preview toggle */}
        {showPreview && (subject || body) ? (
          <View style={[styles.previewBox, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[styles.previewSubject, { color: C.label }]}>{subject || '(no subject)'}</Text>
            <Text style={[styles.previewBody, { color: C.secondary }]}>{body || '(empty body)'}</Text>
          </View>
        ) : (
          /* Body input */
          <TextInput
            style={[styles.bodyInput, { color: C.label, borderColor: C.separator }]}
            placeholder="Write your newsletter…"
            placeholderTextColor={C.muted}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        )}

        {/* Attach Media */}
        <Pressable
          style={[styles.attachRow, { borderColor: C.separator }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="photo.on.rectangle" size={18} color={C.secondary} />
          <Text style={[styles.attachLabel, { color: C.secondary }]}>Attach Media</Text>
        </Pressable>

        {/* Schedule toggle */}
        <View style={[styles.switchRow, { borderColor: C.separator }]}>
          <View style={styles.switchRowLeft}>
            <IconSymbol name="calendar.badge.clock" size={18} color={C.secondary} />
            <Text style={[styles.switchLabel, { color: C.label }]}>
              {scheduled ? 'Schedule Send' : 'Send Now'}
            </Text>
          </View>
          <Pressable
            style={[styles.toggle, { backgroundColor: scheduled ? C.accent : C.surfacePressed }]}
            onPress={() => { Haptics.selectionAsync(); setScheduled(v => !v); }}
          >
            <View style={[styles.toggleKnob, { left: scheduled ? 20 : 3 }]} />
          </Pressable>
        </View>

        {scheduled && (
          <View style={[styles.schedulePlaceholder, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <IconSymbol name="calendar" size={18} color={C.secondary} />
            <Text style={[styles.schedulePlaceholderText, { color: C.secondary }]}>
              Date & time picker — coming soon
            </Text>
          </View>
        )}

        {/* Footer: char count + preview toggle */}
        <View style={styles.footerRow}>
          <Text style={[styles.charCount, { color: C.muted }]}>{body.length} characters</Text>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPreview(v => !v); }}
          >
            <Text style={[styles.previewToggle, { color: C.accent }]}>
              {showPreview ? 'Edit' : 'Preview'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backText: { fontSize: 16 },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sendBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18,
    minWidth: 60, alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { flex: 1 },
  scrollContent: {},

  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  fieldLabel: { fontSize: 14, fontWeight: '600', width: 56 },
  fieldValueRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldValue: { fontSize: 15, flex: 1 },
  recipientCount: { fontSize: 13 },

  toDropdown: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden',
  },
  toOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toOptionText: { fontSize: 15 },

  subjectInput: { flex: 1, fontSize: 15, paddingVertical: 0 },

  bodyInput: {
    minHeight: 220, marginHorizontal: 16, marginTop: 8, marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 12,
    padding: 14, fontSize: 15, lineHeight: 22,
  },

  previewBox: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 12,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16,
  },
  previewSubject: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  previewBody: { fontSize: 14, lineHeight: 21 },

  attachRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 12,
  },
  attachLabel: { fontSize: 14 },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, marginBottom: 12,
  },
  switchRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { fontSize: 15 },
  toggle: {
    width: 44, height: 26, borderRadius: 13, position: 'relative',
  },
  toggleKnob: {
    position: 'absolute', top: 3, width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#fff',
  },

  schedulePlaceholder: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, padding: 14, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, marginBottom: 12,
  },
  schedulePlaceholderText: { fontSize: 14 },

  footerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  charCount: { fontSize: 12 },
  previewToggle: { fontSize: 14, fontWeight: '600' },
});
