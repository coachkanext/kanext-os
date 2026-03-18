/**
 * Phone — universal to all modes.
 * "Calls" header left · Filter icon right (All / Missed / Voicemail / Contacts)
 * Favorites row — horizontal scroll, big avatar cards.
 * Recents list — name, direction arrow, timestamp, quick-call icon.
 * Two stacked FABs (dialer + search), bottom-right above footer.
 * Search: full-screen overlay, grouped results (Calls / Voicemail / Contacts).
 * Dialer: 90% bottom sheet, iOS-style keypad.
 * Tap person → profile bottom sheet.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, TextInput, Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode, useAppContext } from '@/context/app-context';
import { useRouter } from 'expo-router';
import {
  RECENT_CALLS, PHONE_CONTACTS, VOICEMAILS, MY_KANEXT_NUMBERS,
  type RecentCall, type PhoneContact, type Voicemail, type CallDirection,
} from '@/data/mock-phone';

type PhoneFilter = 'Calls' | 'Missed' | 'Voicemail' | 'Contacts';
type ExpandedSection = 'calls' | 'voicemails' | 'contacts' | null;

type ContextMenuItem = {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type ContextMenuState = {
  visible: boolean;
  items: ContextMenuItem[];
  anchorY: number;
};

type ContactContextMenuState = ContextMenuState & { contact: PhoneContact | null };

const FILTER_OPTIONS: PhoneFilter[] = ['Calls', 'Missed', 'Voicemail', 'Contacts'];
const FOOTER_HEIGHT = 49;
const SEARCH_BAR_HEIGHT = 52;
const SECTION_MAX = 3;

const FULL_ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];

const DIALPAD_KEYS = [
  [{ digit: '1', letters: '' }, { digit: '2', letters: 'ABC' }, { digit: '3', letters: 'DEF' }],
  [{ digit: '4', letters: 'GHI' }, { digit: '5', letters: 'JKL' }, { digit: '6', letters: 'MNO' }],
  [{ digit: '7', letters: 'PQRS' }, { digit: '8', letters: 'TUV' }, { digit: '9', letters: 'WXYZ' }],
  [{ digit: '*', letters: '' }, { digit: '0', letters: '+' }, { digit: '#', letters: '' }],
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function directionIcon(d: CallDirection): string {
  if (d === 'video') return 'video.fill';
  if (d === 'outgoing') return 'arrow.up.right';
  return 'arrow.down.left';
}

function directionLabel(d: CallDirection): string {
  if (d === 'video') return 'Video';
  if (d === 'outgoing') return 'Outgoing';
  if (d === 'missed') return 'Missed';
  return 'Incoming';
}

// ── Row / card components ─────────────────────────────────────────────────────

function FavoriteCard({
  contact, C, styles, onPress,
}: {
  contact: PhoneContact; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
}) {
  return (
    <Pressable style={styles.favCard} onPress={onPress}>
      <View style={[styles.favAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.favInitials}>{contact.initials}</Text>
      </View>
      <Text style={styles.favName} numberOfLines={1}>{contact.name.split(' ')[0]}</Text>
    </Pressable>
  );
}

function RecentRow({
  call, C, styles, onPress, onLongPress,
}: {
  call: RecentCall; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  onLongPress?: (pageY: number) => void;
}) {
  const isMissed = call.direction === 'missed';
  const dirColor = isMissed ? C.red : C.secondary;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
      onLongPress={onLongPress ? (e) => onLongPress(e.nativeEvent.pageY) : undefined}
      delayLongPress={350}
    >
      <View style={[styles.rowAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.rowInitials}>{call.initials}</Text>
        {call.hasVoicemail && (
          <View style={[styles.vmBadge, { backgroundColor: C.red, borderColor: C.bg }]} />
        )}
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, isMissed && { color: C.red }]}>{call.name}</Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowHandle, { color: C.muted }]}>@{call.username}</Text>
          <Text style={[styles.rowSub, { color: C.muted }]}> · </Text>
          <IconSymbol name={directionIcon(call.direction) as any} size={11} color={dirColor} />
          <Text style={[styles.rowSub, { color: dirColor }]}>
            {' '}{directionLabel(call.direction)}{call.duration ? ` · ${call.duration}` : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.rowTimestamp}>{call.timestamp}</Text>
      <Pressable
        style={styles.callBtn}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconSymbol
          name={call.direction === 'video' ? 'video.fill' : 'phone.fill'}
          size={16}
          color={C.accent}
        />
      </Pressable>
    </Pressable>
  );
}

function VoicemailRow({
  vm, C, styles, onPress, onLongPress,
}: {
  vm: Voicemail; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  onLongPress?: (pageY: number) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
      onLongPress={onLongPress ? (e) => onLongPress(e.nativeEvent.pageY) : undefined}
      delayLongPress={350}
    >
      <View style={[styles.rowAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.rowInitials}>{vm.callerInitials}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{vm.callerName}</Text>
        <Text style={[styles.rowSub, { color: C.muted }]} numberOfLines={1}>{vm.transcription}</Text>
      </View>
      <View style={styles.vmMeta}>
        <Text style={styles.rowTimestamp}>{vm.timestamp}</Text>
        <Text style={[styles.vmDuration, { color: C.muted }]}>{vm.duration}</Text>
      </View>
      <Pressable
        style={styles.callBtn}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconSymbol name="phone.fill" size={16} color={C.accent} />
      </Pressable>
    </Pressable>
  );
}

function ContactRow({
  contact, C, styles, onPress, onLongPress,
}: {
  contact: PhoneContact; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  onLongPress?: (pageY: number) => void;
}) {
  // Split "First Last" → first name (normal) + last name (bold)
  const parts = contact.name.trim().split(' ');
  const lastName = parts.pop() ?? '';
  const firstName = parts.join(' ');

  return (
    <Pressable
      style={({ pressed }) => [styles.contactRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
      onLongPress={onLongPress ? (e) => onLongPress(e.nativeEvent.pageY) : undefined}
      delayLongPress={350}
    >
      <View style={[styles.contactAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.contactInitials, { color: C.label }]}>{contact.initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: C.label }]} numberOfLines={1}>
          {firstName ? `${firstName} ` : ''}
          <Text style={styles.contactNameBold}>{lastName}</Text>
        </Text>
        <Text style={[styles.contactHandle, { color: C.muted }]} numberOfLines={1}>
          @{contact.username}{contact.role ? ` · ${contact.role}` : ''}{contact.org ? ` · ${contact.org}` : ''}
        </Text>
        {/* Inset separator */}
        <View style={[styles.contactSeparator, { backgroundColor: C.separator }]} />
      </View>
    </Pressable>
  );
}

function ProfileSheet({
  contact, C, styles,
}: {
  contact: PhoneContact; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
}) {
  const actions = [
    { icon: 'phone.fill', label: 'Call', color: C.green },
    { icon: 'video.fill', label: 'Video', color: C.accent },
    { icon: 'message.fill', label: 'Message', color: C.accent },
  ] as const;

  return (
    <View style={styles.profileSheet}>
      <View style={[styles.profileAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.profileInitials}>{contact.initials}</Text>
        {contact.online && (
          <View style={[styles.profileOnlineDot, { backgroundColor: C.green, borderColor: C.bg }]} />
        )}
      </View>
      <Text style={styles.profileName}>{contact.name}</Text>
      {(contact.role || contact.org) ? (
        <Text style={[styles.profileRole, { color: C.secondary }]}>
          {[contact.role, contact.org].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      <View style={styles.profileActions}>
        {actions.map(({ icon, label, color }) => (
          <Pressable
            key={label}
            style={styles.profileActionBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <View style={[styles.profileActionIcon, { backgroundColor: color + '22' }]}>
              <IconSymbol name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.profileActionLabel, { color: C.secondary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Dialer keypad (inside BottomSheet) ────────────────────────────────────────

function DialerContent({
  C, styles, onClose,
}: {
  C: ComponentColors; styles: ReturnType<typeof makeStyles>; onClose: () => void;
}) {
  const [digits, setDigits] = useState('');

  const addDigit = useCallback((d: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDigits(prev => prev + d);
  }, []);

  const backspace = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDigits(prev => prev.slice(0, -1));
  }, []);

  return (
    <View style={styles.dialerContent}>
      {/* Number display */}
      <View style={styles.dialerDisplayWrap}>
        <Text style={[styles.dialerDisplay, { color: C.label }]} adjustsFontSizeToFit numberOfLines={1}>
          {digits}
        </Text>
      </View>

      {/* 4 × 3 key grid */}
      {DIALPAD_KEYS.map((row, ri) => (
        <View key={ri} style={styles.keyRow}>
          {row.map(({ digit, letters }) => (
            <Pressable
              key={digit}
              style={({ pressed }) => [styles.key, pressed && { backgroundColor: C.surfacePressed }]}
              onPress={() => addDigit(digit)}
              onLongPress={digit === '0' ? () => addDigit('+') : undefined}
            >
              <Text style={[styles.keyDigit, { color: C.label }]}>{digit}</Text>
              {letters
                ? <Text style={[styles.keyLetters, { color: C.muted }]}>{letters}</Text>
                : <View style={styles.keyLettersSpacer} />
              }
            </Pressable>
          ))}
        </View>
      ))}

      {/* Bottom row: empty · call · backspace */}
      <View style={styles.keyRow}>
        <View style={styles.key} />
        <View style={[styles.key, styles.keyCenter]}>
          <Pressable
            style={[styles.callKeyCircle, { backgroundColor: C.green }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <IconSymbol name="phone.fill" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
        <Pressable
          style={styles.key}
          onPress={backspace}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setDigits('');
          }}
        >
          {digits.length > 0 && (
            <IconSymbol name="delete.left.fill" size={22} color={C.secondary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ── Top match scoring ────────────────────────────────────────────────────────

type TopMatchKind =
  | { kind: 'contact'; data: PhoneContact }
  | { kind: 'call'; data: RecentCall }
  | { kind: 'voicemail'; data: Voicemail };

function nameScore(name: string, q: string): number {
  const n = name.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 50;
  if (n.includes(q)) return 10;
  return 0;
}

function getTopMatch(
  query: string,
  calls: RecentCall[],
  contacts: PhoneContact[],
  voicemails: Voicemail[],
): TopMatchKind | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestScore = 0;
  let best: TopMatchKind | null = null;

  for (const c of contacts) {
    const ns = nameScore(c.name, q);
    if (!ns) continue;
    const freq = calls.filter(r => r.username === c.username).length;
    const score = ns + freq * 5 + (c.isFavorite ? 20 : 0);
    if (score > bestScore) { bestScore = score; best = { kind: 'contact', data: c }; }
  }
  for (const c of calls) {
    const ns = nameScore(c.name, q);
    if (!ns) continue;
    if (ns > bestScore) { bestScore = ns; best = { kind: 'call', data: c }; }
  }
  for (const v of voicemails) {
    const ns = nameScore(v.callerName, q);
    if (!ns) continue;
    if (ns > bestScore) { bestScore = ns; best = { kind: 'voicemail', data: v }; }
  }
  return best;
}

// ── Top match card ────────────────────────────────────────────────────────────

function TopMatchCard({
  match, C, styles, onPress,
}: {
  match: TopMatchKind; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
}) {
  let initials: string, name: string, subtitle: string, actionIcon: string, actionColor: string;
  let actionBg: string;

  if (match.kind === 'contact') {
    initials = match.data.initials;
    name = match.data.name;
    subtitle = [match.data.role, match.data.org].filter(Boolean).join(' · ');
    actionIcon = 'phone.fill'; actionColor = C.accent; actionBg = C.surfacePressed;
  } else if (match.kind === 'call') {
    initials = match.data.initials;
    name = match.data.name;
    subtitle = `${directionLabel(match.data.direction)} · ${match.data.timestamp}`;
    actionIcon = match.data.direction === 'video' ? 'video.fill' : 'phone.fill';
    actionColor = C.accent; actionBg = C.surfacePressed;
  } else {
    initials = match.data.callerInitials;
    name = match.data.callerName;
    subtitle = match.data.transcription;
    actionIcon = 'play.fill'; actionColor = '#FFFFFF'; actionBg = C.accent;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.topCard, { backgroundColor: C.surface }, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={[styles.topCardAvatar, { backgroundColor: C.bg }]}>
        <Text style={styles.topCardInitials}>{initials}</Text>
      </View>
      <View style={styles.topCardInfo}>
        <Text style={[styles.topCardName, { color: C.label }]}>{name}</Text>
        <Text style={[styles.topCardSub, { color: C.secondary }]} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Pressable
        style={[styles.callBtn, { backgroundColor: actionBg }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconSymbol name={actionIcon as any} size={16} color={actionColor} />
      </Pressable>
    </Pressable>
  );
}

// ── Search results overlay ────────────────────────────────────────────────────

function SearchResults({
  query, C, styles, expandedSection, setExpandedSection, onOpenContact, onOpenFromCall, bottomPad,
  calls, contacts, voicemails, onCallLongPress, onVmLongPress,
}: {
  query: string; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
  expandedSection: ExpandedSection; setExpandedSection: (s: ExpandedSection) => void;
  onOpenContact: (c: PhoneContact) => void; onOpenFromCall: (c: RecentCall) => void;
  bottomPad: number;
  calls: RecentCall[]; contacts: PhoneContact[]; voicemails: Voicemail[];
  onCallLongPress?: (call: RecentCall, pageY: number) => void;
  onVmLongPress?: (vm: Voicemail, pageY: number) => void;
}) {
  const q = query.toLowerCase().trim();

  const topMatch = useMemo(() => getTopMatch(query, calls, contacts, voicemails), [query, calls, contacts, voicemails]);

  const matchingCalls = useMemo(() => {
    if (!q) return [];
    return calls.filter(c =>
      c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q),
    );
  }, [q, calls]);

  const matchingVMs = useMemo(() => {
    if (!q) return [];
    return voicemails.filter(v =>
      v.callerName.toLowerCase().includes(q) || v.transcription.toLowerCase().includes(q),
    );
  }, [q, voicemails]);

  const matchingContacts = useMemo(() => {
    if (!q) return [];
    return contacts
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.org.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const last = (n: string) => n.split(' ').pop() ?? n;
        return last(a.name).localeCompare(last(b.name));
      });
  }, [q, contacts]);

  if (!q) {
    return (
      <View style={styles.searchEmpty}>
        <IconSymbol name="magnifyingglass" size={32} color={C.muted} />
        <Text style={[styles.searchEmptyText, { color: C.muted }]}>
          Search calls, voicemails, contacts
        </Text>
      </View>
    );
  }

  if (!matchingCalls.length && !matchingVMs.length && !matchingContacts.length) {
    return (
      <View style={styles.searchEmpty}>
        <Text style={[styles.searchEmptyText, { color: C.muted }]}>No results for "{query}"</Text>
      </View>
    );
  }

  const callsExp = expandedSection === 'calls';
  const vmsExp = expandedSection === 'voicemails';
  const contactsExp = expandedSection === 'contacts';

  const openTopMatch = () => {
    if (!topMatch) return;
    if (topMatch.kind === 'contact') onOpenContact(topMatch.data);
    else if (topMatch.kind === 'call') onOpenFromCall(topMatch.data);
    else {
      const c = contacts.find(p => p.username === topMatch.data.callerUsername);
      if (c) onOpenContact(c);
    }
  };

  return (
    <ScrollView
      style={styles.searchScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: bottomPad }}
    >
      {/* Top match — unlabelled */}
      {topMatch && (
        <TopMatchCard match={topMatch} C={C} styles={styles} onPress={openTopMatch} />
      )}

      {/* Calls */}
      {matchingCalls.length > 0 && (
        <View>
          <View style={styles.searchSectionHeader}>
            <Text style={styles.sectionLabel}>Calls</Text>
            {matchingCalls.length > SECTION_MAX && !callsExp && (
              <Pressable
                onPress={() => setExpandedSection('calls')}
                style={styles.seeAllBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </Pressable>
            )}
          </View>
          {(callsExp ? matchingCalls : matchingCalls.slice(0, SECTION_MAX)).map(call => (
            <RecentRow
              key={call.id} call={call} C={C} styles={styles}
              onPress={() => onOpenFromCall(call)}
              onLongPress={onCallLongPress ? (py) => onCallLongPress(call, py) : undefined}
            />
          ))}
        </View>
      )}

      {/* Voicemail */}
      {matchingVMs.length > 0 && (
        <View>
          <View style={styles.searchSectionHeader}>
            <Text style={styles.sectionLabel}>Voicemail</Text>
            {matchingVMs.length > SECTION_MAX && !vmsExp && (
              <Pressable
                onPress={() => setExpandedSection('voicemails')}
                style={styles.seeAllBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </Pressable>
            )}
          </View>
          {(vmsExp ? matchingVMs : matchingVMs.slice(0, SECTION_MAX)).map(vm => (
            <VoicemailRow
              key={vm.id} vm={vm} C={C} styles={styles}
              onPress={() => {
                const c = contacts.find(p => p.username === vm.callerUsername);
                if (c) onOpenContact(c);
              }}
              onLongPress={onVmLongPress ? (py) => onVmLongPress(vm, py) : undefined}
            />
          ))}
        </View>
      )}

      {/* Contacts */}
      {matchingContacts.length > 0 && (
        <View>
          <View style={styles.searchSectionHeader}>
            <Text style={styles.sectionLabel}>Contacts</Text>
            {matchingContacts.length > SECTION_MAX && !contactsExp && (
              <Pressable
                onPress={() => setExpandedSection('contacts')}
                style={styles.seeAllBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </Pressable>
            )}
          </View>
          {(contactsExp ? matchingContacts : matchingContacts.slice(0, SECTION_MAX)).map(c => (
            <ContactRow key={c.id} contact={c} C={C} styles={styles} onPress={() => onOpenContact(c)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── My profile card (top of contacts list) ────────────────────────────────────

function MyProfileCard({
  role, mode, C, styles,
}: {
  role: string; mode: ReturnType<typeof useMode>;
  C: ComponentColors; styles: ReturnType<typeof makeStyles>;
}) {
  const myNumber = MY_KANEXT_NUMBERS.find(n => n.mode === mode);
  return (
    <View style={[styles.myCard, { backgroundColor: C.surface }]}>
      <View style={[styles.myAvatar, { backgroundColor: C.accent }]}>
        <Text style={styles.myAvatarInitials}>SK</Text>
        <View style={[styles.onlineDot, { backgroundColor: C.green, borderColor: C.surface }]} />
      </View>
      <View style={styles.myInfo}>
        <Text style={[styles.myName, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[styles.myMeta, { color: C.secondary }]} numberOfLines={1}>
          {role || 'Owner'}{myNumber ? `  ·  ${myNumber.number}` : ''}
        </Text>
      </View>
    </View>
  );
}

// ── Context menu overlay ──────────────────────────────────────────────────────

const CTX_ITEM_H = 50;
const CTX_PREVIEW_H = 72;
const CTX_WIDTH = 248;

function ContactPreview({
  contact, C, styles,
}: {
  contact: PhoneContact; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.ctxPreview}>
      <View style={[styles.ctxPreviewAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.ctxPreviewInitials, { color: C.label }]}>{contact.initials}</Text>
      </View>
      <View style={styles.ctxPreviewInfo}>
        <Text style={[styles.ctxPreviewName, { color: C.label }]} numberOfLines={1}>{contact.name}</Text>
        <Text style={[styles.ctxPreviewSub, { color: C.secondary }]} numberOfLines={1}>
          {[contact.role, contact.org].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );
}

function ContextMenuOverlay({
  ctxMenu, onClose, C, styles, preview,
}: {
  ctxMenu: ContextMenuState; onClose: () => void;
  C: ComponentColors; styles: ReturnType<typeof makeStyles>;
  preview?: React.ReactNode;
}) {
  const { height: screenH } = useWindowDimensions();
  if (!ctxMenu.visible) return null;

  const previewH = preview ? CTX_PREVIEW_H : 0;
  const menuH = ctxMenu.items.length * CTX_ITEM_H + previewH;
  const showAbove = ctxMenu.anchorY > screenH * 0.55;
  const rawTop = showAbove ? ctxMenu.anchorY - menuH - 12 : ctxMenu.anchorY + 12;
  const menuTop = Math.max(60, Math.min(rawTop, screenH - menuH - 16));

  return (
    <>
      <Pressable style={[StyleSheet.absoluteFill, styles.ctxBackdrop]} onPress={onClose} />
      <View style={[styles.ctxShadow, { top: menuTop, width: CTX_WIDTH }]}>
        <View style={[styles.ctxInner, { backgroundColor: C.bg, borderColor: C.separator }]}>
          {preview && (
            <>
              {preview}
              <View style={[styles.ctxDivider, { backgroundColor: C.separator, marginLeft: 0 }]} />
            </>
          )}
          {ctxMenu.items.map((item, i) => (
            <React.Fragment key={item.label}>
              <Pressable
                style={({ pressed }) => [
                  styles.ctxItem,
                  pressed && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => { onClose(); item.onPress(); }}
              >
                <IconSymbol
                  name={item.icon as any}
                  size={18}
                  color={item.destructive ? C.red : C.label}
                />
                <Text style={[styles.ctxLabel, { color: item.destructive ? C.red : C.label }]}>
                  {item.label}
                </Text>
              </Pressable>
              {i < ctxMenu.items.length - 1 && (
                <View style={[styles.ctxDivider, { backgroundColor: C.separator }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PhoneScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const mode = useMode();
  const router = useRouter();
  const { state } = useAppContext();
  const activeRole = state.activeContext.derived_role_badge ?? 'Owner';

  const [filter, setFilter] = useState<PhoneFilter>('Calls');
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [dialerVisible, setDialerVisible] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [selectedContact, setSelectedContact] = useState<PhoneContact | null>(null);
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({ visible: false, items: [], anchorY: 0 });
  const [contactCtxMenu, setContactCtxMenu] = useState<ContactContextMenuState>({ visible: false, items: [], anchorY: 0, contact: null });

  // Fade animations
  const mainOpacity = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  // Org-scoped data — re-derives whenever the active mode changes
  const orgCalls = useMemo(
    () => RECENT_CALLS.filter(c => c.mode === mode),
    [mode],
  );
  const orgContacts = useMemo(() => {
    const lastName = (n: string) => n.split(' ').pop() ?? n;
    return [...PHONE_CONTACTS.filter(c => c.mode === mode)]
      .sort((a, b) => lastName(a.name).localeCompare(lastName(b.name)));
  }, [mode]);
  const orgVoicemails = useMemo(
    () => VOICEMAILS.filter(v => v.mode === mode),
    [mode],
  );
  const favorites = useMemo(() => orgContacts.filter(c => c.isFavorite), [orgContacts]);

  const missedCalls = useMemo(() => orgCalls.filter(c => c.direction === 'missed'), [orgCalls]);
  const canvasCalls = filter === 'Missed' ? missedCalls : orgCalls;
  const pillLabel = filter;

  const fabBottom = insets.bottom + FOOTER_HEIGHT + 16;
  const searchBarBottom = insets.bottom + FOOTER_HEIGHT;
  const headerHeight = insets.top + 14 + 50; // approx header block height

  // ── Contacts: grouped sections + alphabet index ─────────────────────────────
  const contactSections = useMemo(() => {
    const groups: Record<string, PhoneContact[]> = {};
    for (const c of orgContacts) {
      const raw = ((c.name.split(' ').pop() ?? c.name)[0] ?? '#').toUpperCase();
      const letter = /^[0-9]/.test(raw) ? '#' : raw;
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    }
    return Object.keys(groups)
      .sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b))
      .map(title => ({ title, data: groups[title] }));
  }, [orgContacts]);

  const contactsScrollRef = useRef<ScrollView>(null);
  const sectionYRef = useRef<Record<string, number>>({});

  const scrollToLetter = useCallback((letter: string) => {
    if (contactSections.length === 0) return;
    let targetTitle: string | undefined;
    if (letter === '#') {
      targetTitle = contactSections.find(s => s.title === '#')?.title;
    } else {
      const found = contactSections.find(s => s.title !== '#' && s.title >= letter);
      targetTitle = found?.title
        ?? [...contactSections].reverse().find(s => s.title !== '#')?.title;
    }
    if (!targetTitle) return;
    const y = sectionYRef.current[targetTitle];
    if (y == null) return;
    contactsScrollRef.current?.scrollTo({ y, animated: false });
  }, [contactSections]);

  const openContact = useCallback((contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedContact(contact);
    setProfileSheetVisible(true);
  }, []);

  const openFromCall = useCallback((call: RecentCall) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const found = orgContacts.find(c => c.username === call.username);
    setSelectedContact(found ?? {
      id: call.id, name: call.name, username: call.username,
      initials: call.initials, org: '', role: '', mode: call.mode,
    });
    setProfileSheetVisible(true);
  }, [orgContacts]);

  const activateSearch = useCallback(() => {
    setSearchActive(true);
    setExpandedSection(null);
    Animated.parallel([
      Animated.timing(mainOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [mainOpacity, resultsOpacity]);

  const deactivateSearch = useCallback(() => {
    Animated.parallel([
      Animated.timing(mainOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setSearchActive(false);
      setSearchQuery('');
    });
  }, [mainOpacity, resultsOpacity]);

  const closeCtxMenu = useCallback(() => setCtxMenu(s => ({ ...s, visible: false })), []);

  const openCallCtxMenu = useCallback((call: RecentCall, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isKnown = orgContacts.some(c => c.username === call.username);
    const items: ContextMenuItem[] = [
      { icon: 'phone.fill',    label: 'Call',    onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
      { icon: 'message.fill',  label: 'Message', onPress: () => {} },
      { icon: 'video.fill',    label: 'Video',   onPress: () => {} },
      ...(isKnown ? [] : [
        { icon: 'person.badge.plus',           label: 'Add to Existing Contact', onPress: () => {} },
        { icon: 'person.crop.circle.badge.plus', label: 'Create New Contact',    onPress: () => {} },
      ]),
      { icon: 'trash.fill', label: 'Delete', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), destructive: true },
    ];
    setCtxMenu({ visible: true, items, anchorY });
  }, [orgContacts]);

  const openVmCtxMenu = useCallback((vm: Voicemail, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isKnown = orgContacts.some(c => c.username === vm.callerUsername);
    const items: ContextMenuItem[] = [
      { icon: 'phone.fill',   label: 'Call',    onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
      { icon: 'message.fill', label: 'Message', onPress: () => {} },
      { icon: 'video.fill',   label: 'Video',   onPress: () => {} },
      ...(isKnown ? [] : [
        { icon: 'person.badge.plus',           label: 'Add to Existing Contact', onPress: () => {} },
        { icon: 'person.crop.circle.badge.plus', label: 'Create New Contact',    onPress: () => {} },
      ]),
      { icon: 'trash.fill', label: 'Delete', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), destructive: true },
    ];
    setCtxMenu({ visible: true, items, anchorY });
  }, [orgContacts]);

  const closeContactCtxMenu = useCallback(() => setContactCtxMenu(s => ({ ...s, visible: false })), []);

  const openContactCtxMenu = useCallback((contact: PhoneContact, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const items: ContextMenuItem[] = [
      { icon: 'message.fill',        label: 'Message',        onPress: () => {} },
      { icon: 'phone.fill',          label: 'Call',           onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
      { icon: 'video.fill',          label: 'Video',          onPress: () => {} },
      { icon: 'doc.on.doc',          label: 'Copy',           onPress: () => {} },
      { icon: 'square.and.arrow.up', label: 'Share',          onPress: () => {} },
      { icon: 'trash.fill',          label: 'Delete Contact', onPress: () => {}, destructive: true },
    ];
    setContactCtxMenu({ visible: true, items, anchorY, contact });
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>

      {/* ── Main content — fades out when searching ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: mainOpacity }]}
        pointerEvents={searchActive ? 'none' : 'auto'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          {/* Spacer to balance the filter icon */}
          <View style={styles.filterBtn} />

          {/* Centered state pill */}
          <View style={[styles.statePill, { backgroundColor: C.surfacePressed }]}>
            <Text style={[styles.statePillText, { color: C.label }]}>{pillLabel}</Text>
          </View>

          {/* Filter icon */}
          <Pressable
            style={styles.filterBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterDropdownVisible(v => !v);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol
              name="slider.horizontal.3"
              size={20}
              color={C.secondary}
            />
          </Pressable>
        </View>

        {/* Scrollable body — plain ScrollView for Contacts (onLayout-measured Y), ScrollView for everything else */}
        {filter === 'Contacts' ? (
          <ScrollView
            ref={contactsScrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + FOOTER_HEIGHT + 150 }}
          >
            <MyProfileCard role={activeRole} mode={mode} C={C} styles={styles} />
            {contactSections.length === 0 && <Text style={styles.emptyText}>No contacts</Text>}
            {contactSections.map(section => (
              <React.Fragment key={section.title}>
                <View
                  style={[styles.sectionLetterHeader, { backgroundColor: C.bg }]}
                  onLayout={(e) => { sectionYRef.current[section.title] = e.nativeEvent.layout.y; }}
                >
                  <Text style={[styles.sectionLetter, { color: C.secondary }]}>{section.title}</Text>
                </View>
                {section.data.map(contact => (
                  <ContactRow
                    key={contact.id}
                    contact={contact} C={C} styles={styles}
                    onPress={() => openContact(contact)}
                    onLongPress={(py) => openContactCtxMenu(contact, py)}
                  />
                ))}
              </React.Fragment>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + FOOTER_HEIGHT + 150 }}
          >
            {favorites.length > 0 && filter === 'Calls' && (
              <View style={styles.section}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.favsContent}
                >
                  {favorites.map(fav => (
                    <FavoriteCard
                      key={fav.id} contact={fav} C={C} styles={styles}
                      onPress={() => openContact(fav)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              {filter === 'Voicemail' ? (
                <>
                  {orgVoicemails.length === 0
                    ? <Text style={styles.emptyText}>No voicemails</Text>
                    : orgVoicemails.map(vm => (
                      <VoicemailRow
                        key={vm.id} vm={vm} C={C} styles={styles}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/(tabs)/(main)/phone/vm/${vm.id}` as any);
                        }}
                        onLongPress={(py) => openVmCtxMenu(vm, py)}
                      />
                    ))
                  }
                </>
              ) : (
                <>
                  {canvasCalls.length === 0
                    ? <Text style={styles.emptyText}>No calls</Text>
                    : canvasCalls.map(call => (
                      <RecentRow
                        key={call.id} call={call} C={C} styles={styles}
                        onPress={() => openFromCall(call)}
                        onLongPress={(py) => openCallCtxMenu(call, py)}
                      />
                    ))
                  }
                </>
              )}
            </View>
          </ScrollView>
        )}

        {/* Alphabet index — Contacts view only */}
        {filter === 'Contacts' && (
          <View
            style={[styles.alphabetIndex, { top: headerHeight, bottom: insets.bottom + FOOTER_HEIGHT + 4 }]}
          >
            {FULL_ALPHABET.map(letter => (
              <Pressable
                key={letter}
                onPress={() => {
                  scrollToLetter(letter);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                hitSlop={{ top: 2, bottom: 2, left: 8, right: 8 }}
              >
                <Text style={[styles.alphabetLetter, { color: C.accent }]}>{letter}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* FAB stack */}
        <View style={[styles.fabStack, { bottom: fabBottom }]}>
          <Pressable
            style={[styles.fab, { backgroundColor: C.green }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setDialerVisible(true);
            }}
          >
            <IconSymbol name="circle.grid.3x3.fill" size={26} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={[styles.fab, { backgroundColor: C.accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              activateSearch();
            }}
          >
            <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Search results overlay — fades in when searching ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: resultsOpacity, backgroundColor: C.bg }]}
        pointerEvents={searchActive ? 'auto' : 'none'}
      >
        <View style={{ height: headerHeight }} />
        <SearchResults
          query={searchQuery}
          C={C}
          styles={styles}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          onOpenContact={openContact}
          onOpenFromCall={openFromCall}
          bottomPad={insets.bottom + FOOTER_HEIGHT + SEARCH_BAR_HEIGHT + 8}
          calls={orgCalls}
          contacts={orgContacts}
          voicemails={orgVoicemails}
          onCallLongPress={openCallCtxMenu}
          onVmLongPress={openVmCtxMenu}
        />
      </Animated.View>

      {/* ── Search bar — slides up above footer when searching ── */}
      {searchActive && (
        <View style={[
          styles.searchBar,
          { bottom: searchBarBottom, backgroundColor: C.bg, borderTopColor: C.separator },
        ]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={[styles.searchBarInput, { color: C.label }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor={C.muted}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Pressable
            onPress={deactivateSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.cancelBtn, { color: C.accent }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* ── Filter dropdown ── */}
      {filterDropdownVisible && (
        <>
          {/* Backdrop — tap outside to dismiss */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setFilterDropdownVisible(false)}
          />
          {/* Menu */}
          <View style={[
            styles.filterDropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator },
          ]}>
            {FILTER_OPTIONS.map((opt, i) => (
              <Pressable
                key={opt}
                style={({ pressed }) => [
                  styles.dropdownOption,
                  pressed && { backgroundColor: C.surfacePressed },
                  i < FILTER_OPTIONS.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.separator,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(opt);
                  setFilterDropdownVisible(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  { color: opt === filter ? C.label : C.secondary },
                  opt === filter && { fontWeight: '600' },
                ]}>
                  {opt}
                </Text>
                {opt === filter && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Dialer sheet ── */}
      <BottomSheet
        visible={dialerVisible}
        onClose={() => setDialerVisible(false)}
        useModal
        snapPoints={['90%', '100%']}
        backgroundColor={C.bg}
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
      >
        <DialerContent C={C} styles={styles} onClose={() => setDialerVisible(false)} />
      </BottomSheet>

      {/* ── Profile sheet ── */}
      {selectedContact && (
        <BottomSheet
          visible={profileSheetVisible}
          onClose={() => setProfileSheetVisible(false)}
          useModal
          backgroundColor={C.bg}
        >
          <ProfileSheet contact={selectedContact} C={C} styles={styles} />
        </BottomSheet>
      )}

      {/* ── Context menu (calls/voicemails) ── */}
      <ContextMenuOverlay ctxMenu={ctxMenu} onClose={closeCtxMenu} C={C} styles={styles} />

      {/* ── Context menu (contacts) ── */}
      <ContextMenuOverlay
        ctxMenu={contactCtxMenu}
        onClose={closeContactCtxMenu}
        C={C}
        styles={styles}
        preview={contactCtxMenu.contact
          ? <ContactPreview contact={contactCtxMenu.contact} C={C} styles={styles} />
          : undefined
        }
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statePill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statePillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Scroll
  scroll: { flex: 1 },

  // Sections
  section: { marginBottom: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },

  // Favorites
  favsContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  favCard: { width: 68, alignItems: 'center', gap: 6 },
  favAvatar: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  favInitials: { fontSize: 20, fontWeight: '700', color: C.label },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7, borderWidth: 2,
  },
  favName: { fontSize: 12, fontWeight: '500', color: C.secondary, textAlign: 'center' },

  // Shared row
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11, gap: 12,
  },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', flexShrink: 0,
  },
  rowInitials: { fontSize: 15, fontWeight: '700', color: C.label },
  vmBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 12, height: 12, borderRadius: 6, borderWidth: 2,
  },
  rowInfo: { flex: 1, minWidth: 0, gap: 2 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },
  rowHandle: { fontSize: 12, fontWeight: '400' },
  rowMeta: { flexDirection: 'row', alignItems: 'center' },
  rowSub: { fontSize: 12 },
  rowTimestamp: { fontSize: 13, color: C.muted, flexShrink: 0 },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfacePressed,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  vmMeta: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  vmDuration: { fontSize: 12 },

  // Empty
  emptyText: {
    textAlign: 'center', fontSize: 15, color: C.muted,
    paddingVertical: 40, paddingHorizontal: 20,
  },

  // FAB stack
  fabStack: {
    position: 'absolute',
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  // Filter dropdown
  filterDropdown: {
    position: 'absolute',
    right: 16,
    minWidth: 160,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  dropdownOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  // Search bar (above footer)
  searchBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 0,
  },

  // Top match card
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  topCardAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  topCardInitials: { fontSize: 17, fontWeight: '700' },
  topCardInfo: { flex: 1, minWidth: 0, gap: 3 },
  topCardName: { fontSize: 16, fontWeight: '600' },
  topCardSub: { fontSize: 13 },

  // Search results
  searchScroll: { flex: 1 },
  searchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  searchEmptyText: { fontSize: 15, textAlign: 'center' },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  seeAllBtn: { marginLeft: 'auto' as any },
  seeAll: { fontSize: 13, fontWeight: '500' },

  // Dialer keypad
  dialerContent: { paddingBottom: 20 },
  dialerDisplayWrap: {
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dialerDisplay: {
    fontSize: 36,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 3,
  },
  keyRow: { flexDirection: 'row' },
  key: {
    flex: 1,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  keyCenter: { alignItems: 'center', justifyContent: 'center' },
  keyDigit: { fontSize: 28, fontWeight: '300' },
  keyLetters: { fontSize: 10, fontWeight: '500', letterSpacing: 1.5, marginTop: 2 },
  keyLettersSpacer: { height: 14 },
  callKeyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile sheet
  profileSheet: {
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 14,
  },
  profileInitials: { fontSize: 28, fontWeight: '700', color: C.label },
  profileOnlineDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 18, height: 18, borderRadius: 9, borderWidth: 3,
  },
  profileName: {
    fontSize: 22, fontWeight: '700', color: C.label,
    marginBottom: 4, textAlign: 'center',
  },
  profileRole: { fontSize: 14, marginBottom: 28, textAlign: 'center' },
  profileActions: { flexDirection: 'row', gap: 20 },
  profileActionBtn: { alignItems: 'center', gap: 8 },
  profileActionIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  profileActionLabel: { fontSize: 12, fontWeight: '500' },

  // Contacts section headers + alphabet
  sectionLetterHeader: {
    paddingLeft: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLetter: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // iOS-style contact row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    height: 64,
  },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative',
  },
  contactInitials: { fontSize: 15, fontWeight: '700' },
  contactInfo: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 16,
    position: 'relative',
  },
  contactName: { fontSize: 17, fontWeight: '400' },
  contactNameBold: { fontWeight: '700' },
  contactHandle: { fontSize: 12, marginTop: 1 },
  contactSeparator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  alphabetIndex: {
    position: 'absolute',
    right: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  alphabetLetter: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    paddingHorizontal: 5,
  },

  // My profile card (top of Contacts)
  myCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  myAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', flexShrink: 0,
  },
  myAvatarInitials: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  myInfo: { flex: 1, minWidth: 0, gap: 3 },
  myName: { fontSize: 16, fontWeight: '600' },
  myMeta: { fontSize: 13 },

  // Context menu preview card
  ctxPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    height: CTX_PREVIEW_H,
  },
  ctxPreviewAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ctxPreviewInitials: { fontSize: 15, fontWeight: '700' },
  ctxPreviewInfo: { flex: 1, minWidth: 0, gap: 2 },
  ctxPreviewName: { fontSize: 15, fontWeight: '600' },
  ctxPreviewSub: { fontSize: 13 },

  // Context menu
  ctxBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 5000,
  },
  ctxShadow: {
    position: 'absolute',
    right: 16,
    zIndex: 5001,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
  },
  ctxInner: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  ctxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CTX_ITEM_H,
    paddingHorizontal: 16,
    gap: 14,
  },
  ctxLabel: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  ctxDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
