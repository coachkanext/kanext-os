/**
 * Dialpad — full-screen keypad with T9 live contact search.
 * Suggestions appear above number display as user types.
 * 5th row: Video (left) · Voice (center) · Backspace (right).
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { PHONE_CONTACTS, CONTACT_PHONES } from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';

const KEYS = [
  [{ d: '1', l: '' }, { d: '2', l: 'ABC' }, { d: '3', l: 'DEF' }],
  [{ d: '4', l: 'GHI' }, { d: '5', l: 'JKL' }, { d: '6', l: 'MNO' }],
  [{ d: '7', l: 'PQRS' }, { d: '8', l: 'TUV' }, { d: '9', l: 'WXYZ' }],
  [{ d: '*', l: '' }, { d: '0', l: '+' }, { d: '#', l: '' }],
];

const KEY_SIZE = 70;
const KEY_GAP = 24;

// ── T9 matching ───────────────────────────────────────────────────────────────

const T9: Record<string, string> = {
  '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
  '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz',
};

function digitForChar(c: string): string {
  for (const [d, letters] of Object.entries(T9)) {
    if (letters.includes(c.toLowerCase())) return d;
  }
  return '';
}

function contactMatchesDigits(contact: { name: string; username: string }, digits: string): boolean {
  const d = digits.replace(/\D/g, '');
  if (!d || d.length < 2) return false;

  // Phone number match
  const phones = CONTACT_PHONES[contact.username];
  if (phones?.some(ph => ph.number.replace(/\D/g, '').includes(d))) return true;

  // T9 name match — any word prefix
  return contact.name.toLowerCase().split(/\s+/).some(word => {
    const enc = word.split('').map(digitForChar).filter(Boolean).join('');
    return enc.startsWith(d);
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DialpadScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [digits, setDigits] = useState('');

  const addDigit = useCallback((d: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDigits(prev => prev + d);
  }, []);

  const deleteLast = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDigits(prev => prev.slice(0, -1));
  }, []);

  const suggestions = useMemo(() => {
    if (digits.length < 2) return [];
    return PHONE_CONTACTS.filter(c => contactMatchesDigits(c, digits)).slice(0, 3);
  }, [digits]);

  const [contactMenuOpen, setContactMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      {/* Back button (left) + Contact icon (right) — absolute */}
      <View style={[styles.topBar, { top: insets.top }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: C.surfacePressed }]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Pressable
          style={[styles.backBtn, { backgroundColor: C.surfacePressed }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setContactMenuOpen(v => !v);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="person.crop.circle.badge.plus" size={20} color={C.label} />
        </Pressable>
      </View>

      {/* Contact dropdown */}
      {contactMenuOpen && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setContactMenuOpen(false)} />
          <View style={[styles.contactMenu, { top: insets.top + 52, backgroundColor: C.bg, borderColor: C.separator }]}>
            {[
              { icon: 'person.badge.plus', label: 'Create New Contact' },
              { icon: 'person.crop.circle.badge.checkmark', label: 'Add to Existing Contact' },
            ].map(({ icon, label }) => (
              <Pressable
                key={label}
                style={({ pressed }) => [styles.contactMenuItem, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setContactMenuOpen(false);
                }}
              >
                <IconSymbol name={icon as any} size={18} color={C.label} />
                <Text style={[styles.contactMenuLabel, { color: C.label }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Center fills full height → truly centered keypad */}
      <View style={styles.center}>

        {/* T9 suggestions — appear above display when typing */}
        {suggestions.length > 0 && (
          <View style={styles.suggestList}>
            {suggestions.map(contact => {
              const phones = CONTACT_PHONES[contact.username];
              const subtitle = phones?.[0]
                ? `${phones[0].label} · ${phones[0].number}`
                : `${contact.role} · ${contact.org}`;
              return (
                <Pressable
                  key={contact.id}
                  style={({ pressed }) => [
                    styles.suggestRow,
                    pressed && { backgroundColor: C.surfacePressed },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    const num = phones?.[0]?.number.replace(/\D/g, '') ?? digits;
                    setDigits(num);
                    initiateCall({
                      contactName: contact.name,
                      contactInitials: contact.initials,
                      mode: contact.mode,
                      type: 'audio',
                    });
                    router.back();
                  }}
                >
                  <View style={[styles.suggestAvatar, { backgroundColor: C.surface }]}>
                    <Text style={[styles.suggestInitials, { color: C.label }]}>{contact.initials}</Text>
                  </View>
                  <View style={styles.suggestInfo}>
                    <Text style={[styles.suggestName, { color: C.label }]}>{contact.name}</Text>
                    <Text style={[styles.suggestSub, { color: C.secondary }]} numberOfLines={1}>{subtitle}</Text>
                  </View>
                  <IconSymbol name="phone.fill" size={15} color={C.accent} />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Number display */}
        <Text
          style={[styles.digits, { color: C.label }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {digits || '\u00A0'}
        </Text>

        {/* Keypad rows 1–4 + 5th row (call + backspace) */}
        <View style={styles.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map(key => (
                <Pressable
                  key={key.d}
                  style={({ pressed }) => [styles.key, pressed && { backgroundColor: C.separator }]}
                  onPress={() => addDigit(key.d)}
                  onLongPress={key.d === '0' ? () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDigits(prev => prev + '+');
                  } : undefined}
                  delayLongPress={500}
                >
                  <Text style={[styles.keyDigit, { color: C.label }]}>{key.d}</Text>
                  {key.l !== '' && (
                    <Text style={[styles.keyLetters, { color: C.secondary }]}>{key.l}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}

          {/* 5th row: centered circles + backspace to the right */}
          <View style={styles.callRow}>
            <View style={styles.callSpacer} />
            <View style={styles.callCircles}>
              <Pressable
                style={[styles.callCircle, { backgroundColor: C.accent }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  initiateCall({ contactName: digits || 'Unknown', contactInitials: '?', mode: 'personal', type: 'video' });
                  router.back();
                }}
              >
                <IconSymbol name="video.fill" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={[styles.callCircle, { backgroundColor: C.green }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  initiateCall({ contactName: digits || 'Unknown', contactInitials: '?', mode: 'personal', type: 'audio' });
                  router.back();
                }}
              >
                <IconSymbol name="phone.fill" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
            <Pressable
              style={styles.callSpacer}
              onPress={deleteLast}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setDigits('');
              }}
              delayLongPress={600}
              hitSlop={10}
            >
              {digits.length > 0 && (
                <IconSymbol name="delete.backward.fill" size={22} color={C.secondary} />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 2,
  },
  contactMenu: {
    position: 'absolute',
    right: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 220,
  },
  contactMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactMenuLabel: { fontSize: 15, fontWeight: '500' },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // T9 suggestions
  suggestList: {
    width: KEY_SIZE * 3 + KEY_GAP * 2,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 10,
  },
  suggestAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  suggestInitials: { fontSize: 13, fontWeight: '700' },
  suggestInfo: { flex: 1, minWidth: 0, gap: 1 },
  suggestName: { fontSize: 15, fontWeight: '500' },
  suggestSub: { fontSize: 12 },

  digits: {
    width: KEY_SIZE * 3 + KEY_GAP * 2,
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
    minHeight: 46,
  },

  keypad: { gap: 12 },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDigit: { fontSize: 28, fontWeight: '300' },
  keyLetters: { fontSize: 9, fontWeight: '600', letterSpacing: 2, marginTop: -2 },

  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: KEY_SIZE * 3 + KEY_GAP * 2,
    height: KEY_SIZE,
  },
  callSpacer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: KEY_SIZE,
  },
  callCircles: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  callCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
