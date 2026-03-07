/**
 * Dial Pad — iPhone-style centered keypad.
 * Number display, standard keypad, green call button.
 * Long press 0 = +. Vertically centered on screen.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { initiateCall } from '@/utils/global-call';
import { useMode } from '@/context/app-context';

const C = {
  bg: '#000000',
  label: '#FFFFFF',
  letters: '#A1A1AA',
  muted: '#52525B',
  green: '#34C759',
};

const KEYS = [
  [{ d: '1', l: '' }, { d: '2', l: 'ABC' }, { d: '3', l: 'DEF' }],
  [{ d: '4', l: 'GHI' }, { d: '5', l: 'JKL' }, { d: '6', l: 'MNO' }],
  [{ d: '7', l: 'PQRS' }, { d: '8', l: 'TUV' }, { d: '9', l: 'WXYZ' }],
  [{ d: '*', l: '' }, { d: '0', l: '+' }, { d: '#', l: '' }],
];

export default function DialPadScreen() {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const [digits, setDigits] = useState('');

  const addDigit = useCallback((d: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDigits((prev) => prev + d);
  }, []);

  const deleteLast = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDigits((prev) => prev.slice(0, -1));
  }, []);

  const clearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDigits('');
  }, []);

  const handleCall = useCallback(() => {
    if (!digits) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    initiateCall({
      contactName: digits,
      contactInitials: digits.slice(0, 2),
      mode,
      type: 'audio',
    });
  }, [digits, mode]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Center everything vertically */}
      <View style={styles.center}>
        {/* Number display */}
        <View style={styles.display}>
          <Text
            style={[styles.digits, digits.length > 12 && styles.digitsSmall]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {digits || '\u00A0'}
          </Text>
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key) => (
                <Pressable
                  key={key.d}
                  style={({ pressed }) => [
                    styles.key,
                    pressed && styles.keyPressed,
                  ]}
                  onPress={() => addDigit(key.d)}
                  onLongPress={
                    key.d === '0'
                      ? () => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setDigits((prev) => prev + '+');
                        }
                      : undefined
                  }
                  delayLongPress={500}
                >
                  <Text style={styles.keyDigit}>{key.d}</Text>
                  {key.l !== '' && <Text style={styles.keyLetters}>{key.l}</Text>}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Bottom row: spacer | call | delete */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomSide} />
          <Pressable
            style={[styles.callBtn, !digits && styles.callBtnDim]}
            onPress={handleCall}
          >
            <IconSymbol name="phone.fill" size={32} color="#FFFFFF" />
          </Pressable>
          {digits.length > 0 ? (
            <Pressable
              style={styles.bottomSide}
              onPress={deleteLast}
              onLongPress={clearAll}
              delayLongPress={600}
              hitSlop={12}
            >
              <IconSymbol name="delete.backward.fill" size={24} color={C.label} />
            </Pressable>
          ) : (
            <View style={styles.bottomSide} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  display: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
    minHeight: 48,
    justifyContent: 'center',
  },
  digits: {
    fontSize: 40,
    fontWeight: '300',
    color: C.label,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  digitsSmall: {
    fontSize: 28,
  },
  keypad: {
    gap: 14,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  key: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  keyDigit: {
    fontSize: 33,
    fontWeight: '300',
    color: C.label,
  },
  keyLetters: {
    fontSize: 10,
    fontWeight: '600',
    color: C.letters,
    letterSpacing: 2,
    marginTop: -2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 78 * 3 + 24 * 2,
  },
  bottomSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
  },
  callBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnDim: {
    opacity: 0.5,
  },
});
