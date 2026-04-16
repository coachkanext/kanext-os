/**
 * New Email — compose screen.
 * Handles new email, reply, reply-all, and forward modes.
 * To (multi-recipient pills), CC/BCC (expandable), Subject,
 * rich text body with formatting bar, quoted content, attachment strip.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAccentColor } from '@/hooks/use-accent-color';

// ── Data ──────────────────────────────────────────────────────────────────────

const MEMBERS_LIST = [
  { key: 'jd', initials: 'JD', name: 'Jordan Dean',    role: 'CPO',         username: '@jdean',   email: 'jdean@kanext.com'   },
  { key: 'ar', initials: 'AR', name: 'Alex Ramos',     role: 'CTO',         username: '@aramos',  email: 'aramos@kanext.com'  },
  { key: 'vp', initials: 'VP', name: 'Vikram Patel',   role: 'Investor',    username: '@vpatel',  email: 'vpatel@kanext.com'  },
  { key: 'rc', initials: 'RC', name: 'Rachel Chen',    role: 'Design',      username: '@rchen',   email: 'rchen@kanext.com'   },
  { key: 'tm', initials: 'TM', name: 'Tyler Moore',    role: 'Advisor',     username: '@tmoore',  email: 'tmoore@kanext.com'  },
  { key: 'ct', initials: 'CT', name: 'Coach Thompson', role: 'Head Coach',  username: '@coacht',  email: 'cthompson@kanext.com'},
  { key: 'pk', initials: 'PK', name: 'Pastor King',    role: 'Lead Pastor', username: '@pastork', email: 'pking@kanext.com'   },
];

const SCHEDULE_OPTIONS = ['In 30 min', 'Tonight 8 PM', 'Tomorrow 9 AM', 'Monday 9 AM'] as const;

type Contact = { key: string; initials: string; name: string; role: string; username: string; email: string };
type FormatMark = 'bold' | 'italic' | 'underline';

// Build a one-off Contact entry from an external sender
function senderContact(name: string, email: string): Contact {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return { key: `ext-${email}`, initials, name, role: '', username: `@${email.split('@')[0]}`, email };
}

// ── Recipient pill ────────────────────────────────────────────────────────────

function RecipientPill({ contact, onRemove, C }: {
  contact: Contact; onRemove: () => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[pill.wrap, { backgroundColor: C.surfacePressed }]}>
      <Text style={[pill.initials, { color: C.secondary }]}>{contact.initials}</Text>
      <Text style={[pill.name, { color: C.label }]}>{contact.name}</Text>
      <Pressable onPress={onRemove} hitSlop={8}>
        <IconSymbol name="xmark" size={11} color={C.muted} />
      </Pressable>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 8, paddingRight: 8, paddingVertical: 4, borderRadius: 20, marginRight: 4, marginBottom: 4 },
  initials: { fontSize: 10, fontWeight: '600' },
  name:     { fontSize: 13, fontWeight: '500' },
});

// ── Contact suggestion row ────────────────────────────────────────────────────

function SuggestionRow({ contact, onSelect, C }: {
  contact: Contact; onSelect: () => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        sugg.row,
        { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
        pressed && { backgroundColor: C.surfacePressed },
      ]}
      onPress={onSelect}
    >
      <View style={[sugg.avatar, { backgroundColor: C.surfacePressed }]}>
        <Text style={[sugg.avatarText, { color: C.secondary }]}>{contact.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[sugg.name, { color: C.label }]}>{contact.name}</Text>
        <Text style={[sugg.email, { color: C.muted }]}>{contact.email}</Text>
      </View>
    </Pressable>
  );
}

const sugg = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 12 },
  avatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '600' },
  name:       { fontSize: 14, fontWeight: '500' },
  email:      { fontSize: 12, marginTop: 1 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NewEmailScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const {
    mode,
    originalFrom, originalFromEmail,
    originalDate, originalBody,
    originalSubject, originalAttachments,
  } = useLocalSearchParams<{
    mode?: string;
    originalFrom?: string;
    originalFromEmail?: string;
    originalDate?: string;
    originalBody?: string;
    originalSubject?: string;
    originalAttachments?: string;
  }>();

  const isReply   = mode === 'reply' || mode === 'reply-all';
  const isForward = mode === 'forward';

  // Parse forwarded attachments
  const fwdAttachments = useMemo<{ name: string; size: string; icon: string }[]>(() => {
    if (!isForward || !originalAttachments) return [];
    try { return JSON.parse(originalAttachments); } catch { return []; }
  }, [isForward, originalAttachments]);

  // ── Recipients ──
  const [toList, setToList] = useState<Contact[]>(() => {
    if (isReply && originalFrom && originalFromEmail) {
      return [senderContact(originalFrom, originalFromEmail)];
    }
    return [];
  });
  const [ccList, setCcList] = useState<Contact[]>(() =>
    mode === 'reply-all' ? [MEMBERS_LIST[0]] : [],
  );
  const [bccList,   setBccList]   = useState<Contact[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(mode === 'reply-all');

  // Active search field
  const [activeField, setActiveField] = useState<'to' | 'cc' | 'bcc' | null>(
    isForward ? 'to' : null,
  );
  const [query, setQuery] = useState('');

  // ── Compose fields ──
  const [subject, setSubject] = useState(() => {
    if (mode === 'reply' || mode === 'reply-all') return `Re: ${originalSubject ?? ''}`;
    if (mode === 'forward') return `Fwd: ${originalSubject ?? ''}`;
    return '';
  });
  const [body, setBody] = useState('');

  // ── Formatting ──
  const [marks, setMarks] = useState<Set<FormatMark>>(new Set());

  // ── Schedule ──
  const [scheduledFor,    setScheduledFor]    = useState<string | null>(null);
  const [scheduleVisible, setScheduleVisible] = useState(false);

  // ── Nav title ──
  const navTitle = mode === 'reply'     ? 'Reply'
    : mode === 'reply-all' ? 'Reply All'
    : mode === 'forward'   ? 'Forward'
    : 'New Email';

  // ── Suggestions ──
  const addedKeys = useMemo(
    () => new Set([...toList, ...ccList, ...bccList].map(c => c.key)),
    [toList, ccList, bccList],
  );
  const suggestions = useMemo(() => {
    if (!activeField || query.trim().length === 0) return [];
    const q = query.toLowerCase();
    return MEMBERS_LIST.filter(
      c => !addedKeys.has(c.key) &&
        (c.name.toLowerCase().includes(q) ||
         c.email.toLowerCase().includes(q) ||
         c.username.toLowerCase().includes(q)),
    );
  }, [query, activeField, addedKeys]);

  const canSend = toList.length > 0 && subject.trim().length > 0;

  const addContact = (contact: Contact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeField === 'to')  setToList(p  => [...p, contact]);
    if (activeField === 'cc')  setCcList(p  => [...p, contact]);
    if (activeField === 'bcc') setBccList(p => [...p, contact]);
    setQuery('');
  };

  const removeContact = (field: 'to' | 'cc' | 'bcc', key: string) => {
    if (field === 'to')  setToList(p  => p.filter(c => c.key !== key));
    if (field === 'cc')  setCcList(p  => p.filter(c => c.key !== key));
    if (field === 'bcc') setBccList(p => p.filter(c => c.key !== key));
  };

  const toggleMark = (m: FormatMark) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMarks(prev => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  };

  const handleSend = () => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  // ── Recipient field renderer ──
  const RecipientField = ({ field, list, label }: { field: 'to' | 'cc' | 'bcc'; list: Contact[]; label: string }) => {
    const isActive = activeField === field;
    return (
      <Pressable
        style={[s.fieldRow, { borderBottomColor: C.separator }]}
        onPress={() => { setActiveField(field); setQuery(''); }}
      >
        <Text style={[s.fieldLabel, { color: C.muted }]}>{label}</Text>
        <View style={s.pillsRow}>
          {list.map(c => (
            <RecipientPill key={c.key} contact={c} onRemove={() => removeContact(field, c.key)} C={C} />
          ))}
          {isActive && (
            <TextInput
              style={[s.inlineInput, { color: C.label }]}
              value={query}
              onChangeText={setQuery}
              autoFocus={field === 'to' && isForward}
              placeholder={list.length === 0 ? 'Add recipients…' : ''}
              placeholderTextColor={C.muted}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          {!isActive && list.length === 0 && (
            <Text style={[s.emptyFieldHint, { color: C.muted }]}>—</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Nav bar ── */}
        <Animated.View style={[s.nav, { paddingTop: insets.top, opacity }]}>
          <Pressable onPress={() => router.back()} style={s.cancelBtn}>
            <Text style={[s.cancelText, { color: accent }]}>Cancel</Text>
          </Pressable>
          <View style={s.navCenter}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{navTitle}</Text>
            </View>
            {scheduledFor && (
              <Text style={[s.scheduledLabel, { color: accent }]}>Scheduled · {scheduledFor}</Text>
            )}
          </View>
          <Pressable
            style={s.clockBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setScheduleVisible(true); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="clock" size={20} color={scheduledFor ? accent : C.muted} />
          </Pressable>
          <Pressable
            style={[s.sendBtn, { backgroundColor: canSend ? accent : C.surfacePressed }]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: canSend ? '#fff' : C.muted }}>
              {scheduledFor ? 'Schedule' : 'Send'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* ── Suggestions (above fields when typing) ── */}
        {suggestions.length > 0 && (
          <View style={[s.suggestionsWrap, { backgroundColor: C.surface, borderColor: C.separator }]}>
            {suggestions.slice(0, 5).map(c => (
              <SuggestionRow key={c.key} contact={c} onSelect={() => addContact(c)} C={C} />
            ))}
          </View>
        )}

        {/* ── Fields + Body ── */}
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
          {/* To */}
          <RecipientField field="to" list={toList} label="To" />

          {/* CC/BCC */}
          {!showCcBcc ? (
            <View style={[s.fieldRow, { borderBottomColor: C.separator }]}>
              <Pressable onPress={() => { setShowCcBcc(true); setActiveField('cc'); }} hitSlop={8}>
                <Text style={[s.fieldLabel, { color: C.muted }]}>Cc/Bcc</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <RecipientField field="cc"  list={ccList}  label="Cc"  />
              <RecipientField field="bcc" list={bccList} label="Bcc" />
            </>
          )}

          {/* Subject */}
          <View style={[s.fieldRow, { borderBottomColor: C.separator }]}>
            <Text style={[s.fieldLabel, { color: C.muted }]}>Subject</Text>
            <TextInput
              style={[s.inlineInput, { color: C.label, flex: 1 }]}
              placeholder="Subject"
              placeholderTextColor={C.muted}
              value={subject}
              onChangeText={setSubject}
              onFocus={() => setActiveField(null)}
              returnKeyType="next"
            />
          </View>

          {/* Body */}
          <TextInput
            style={[s.body, { color: C.label }]}
            placeholder="Compose email…"
            placeholderTextColor={C.muted}
            value={body}
            onChangeText={setBody}
            onFocus={() => setActiveField(null)}
            multiline
            textAlignVertical="top"
            autoFocus={isReply}
          />

          {/* ── Quoted content (Reply / Reply All) ── */}
          {isReply && originalBody ? (
            <View style={s.quoteSection}>
              <View style={[s.quoteDivider, { backgroundColor: C.separator }]} />
              <Text style={[s.quoteAttrib, { color: C.muted }]}>
                On {originalDate}, {originalFrom} wrote:
              </Text>
              <View style={[s.quoteBar, { borderLeftColor: C.accent + '55' }]}>
                <Text style={[s.quoteBody, { color: C.muted }]}>{originalBody}</Text>
              </View>
            </View>
          ) : isForward && originalBody ? (
            /* ── Forwarded message (Forward) ── */
            <View style={s.quoteSection}>
              <View style={[s.quoteDivider, { backgroundColor: C.separator }]} />
              <Text style={[s.quoteAttrib, { color: C.muted }]}>
                {'---------- Forwarded message ----------'}
              </Text>
              <Text style={[s.quoteHeader, { color: C.muted }]}>
                {`From: ${originalFrom} <${originalFromEmail}>\nDate: ${originalDate}\nSubject: ${originalSubject}\nTo: you@kanext.com`}
              </Text>
              <Text style={[s.quoteBody, { color: C.muted }]}>{'\n'}{originalBody}</Text>
              {fwdAttachments.length > 0 && (
                <View style={s.fwdAttachRow}>
                  {fwdAttachments.map(a => (
                    <View key={a.name} style={[s.fwdAttachChip, { backgroundColor: C.surface, borderColor: C.separator }]}>
                      <IconSymbol name={a.icon as any} size={14} color={C.accent} />
                      <Text style={[s.fwdAttachName, { color: C.secondary }]} numberOfLines={1}>{a.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>

        {/* ── Formatting + attachment bar ── */}
        <View style={[s.toolbar, { borderTopColor: C.separator, paddingBottom: insets.bottom + 4 }]}>
          {([
            { mark: 'bold'      as FormatMark, label: 'B', style: { fontWeight: '700' as const } },
            { mark: 'italic'    as FormatMark, label: 'I', style: { fontStyle: 'italic' as const } },
            { mark: 'underline' as FormatMark, label: 'U', style: { textDecorationLine: 'underline' as const } },
          ] as const).map(({ mark, label, style }) => (
            <Pressable
              key={mark}
              style={[s.formatBtn, marks.has(mark) && { backgroundColor: C.accent + '22' }]}
              onPress={() => toggleMark(mark)}
            >
              <Text style={[s.formatLabel, style, { color: marks.has(mark) ? C.accent : C.secondary }]}>
                {label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={s.formatBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <IconSymbol name="list.bullet" size={17} color={C.secondary} />
          </Pressable>
          <Pressable style={s.formatBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <IconSymbol name="list.number" size={17} color={C.secondary} />
          </Pressable>
          <Pressable style={s.formatBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <IconSymbol name="link" size={17} color={C.secondary} />
          </Pressable>
          <View style={[s.toolbarDivider, { backgroundColor: C.separator }]} />
          <Pressable style={s.formatBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <IconSymbol name="paperclip" size={19} color={C.secondary} />
          </Pressable>
          <Pressable style={s.formatBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <IconSymbol name="camera" size={19} color={C.secondary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* ── Schedule send sheet ── */}
      <BottomSheet
        visible={scheduleVisible}
        onClose={() => setScheduleVisible(false)}
        useModal
        backgroundColor={C.bg}
        title="Schedule send"
      >
        <View style={{ paddingBottom: 24 }}>
          {SCHEDULE_OPTIONS.map((opt, i) => (
            <React.Fragment key={opt}>
              {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 20 }} />}
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 20, paddingVertical: 16,
                  backgroundColor: pressed ? C.surfacePressed : 'transparent',
                })}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setScheduledFor(opt);
                  setScheduleVisible(false);
                }}
              >
                <IconSymbol name="clock.fill" size={18} color={accent} />
                <Text style={{ flex: 1, fontSize: 16, color: C.label, marginLeft: 14 }}>{opt}</Text>
                {scheduledFor === opt && <IconSymbol name="checkmark" size={16} color={accent} />}
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:           { flex: 1 },

  // Nav
  nav:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  cancelBtn:      { paddingVertical: 4, paddingRight: 4 },
  cancelText:     { fontSize: 16 },
  navCenter:      { flex: 1, alignItems: 'center' },
  navTitle:       { fontSize: 17, fontWeight: '600' },
  scheduledLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  clockBtn:       { padding: 4 },
  sendBtn:        { minWidth: 65, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },

  // Suggestions
  suggestionsWrap: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },

  // Field rows
  fieldRow:       { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 16, paddingRight: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  fieldLabel:     { fontSize: 15, fontWeight: '500', width: 56, paddingTop: 3 },
  pillsRow:       { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  inlineInput:    { fontSize: 15, paddingVertical: 3, minWidth: 120 },
  emptyFieldHint: { fontSize: 15, paddingVertical: 3 },

  // Body
  body:           { fontSize: 15, lineHeight: 23, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40, minHeight: 150 },

  // Quoted content
  quoteSection:   { paddingHorizontal: 16, paddingBottom: 32 },
  quoteDivider:   { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  quoteAttrib:    { fontSize: 13, marginBottom: 10 },
  quoteBar:       { borderLeftWidth: 3, paddingLeft: 12 },
  quoteHeader:    { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  quoteBody:      { fontSize: 14, lineHeight: 21 },

  // Forwarded attachments
  fwdAttachRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  fwdAttachChip:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  fwdAttachName:  { fontSize: 12, fontWeight: '500', maxWidth: 130 },

  // Formatting toolbar
  toolbar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
  formatBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  formatLabel:    { fontSize: 16 },
  toolbarDivider: { width: StyleSheet.hairlineWidth, height: 22, marginHorizontal: 4 },
});
