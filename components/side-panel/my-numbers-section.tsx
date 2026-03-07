/**
 * MyNumbersSection — Shared "My Numbers" component for Phone and Messages side panels.
 * Shows user's KaNeXT numbers with mode-colored pills.
 * Tap → onFilter callback, Long-press → NumberPopup (Copy, Port, Share).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  MY_KANEXT_NUMBERS,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  type KanextNumber,
} from '@/data/mock-phone';
import type { Mode } from '@/types';

const C = {
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  divider: '#2F3336',
  surface: '#0B0F14',
};

// ── Number long-press popup ──

function NumberPopup({
  visible,
  number,
  onClose,
}: {
  visible: boolean;
  number: KanextNumber | null;
  onClose: () => void;
}) {
  if (!visible || !number) return null;
  const color = MODE_BADGE_COLORS[number.mode];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          <View style={popupStyles.header}>
            <View style={[popupStyles.headerPill, { backgroundColor: color }]}>
              <Text style={popupStyles.headerPillText}>{MODE_BADGE_LABELS[number.mode]}</Text>
            </View>
            <Text style={popupStyles.num}>{number.number}</Text>
          </View>
          <View style={popupStyles.divider} />
          {[
            { label: 'Copy to Clipboard', icon: 'doc.on.doc.fill', onPress: onClose },
            { label: 'Port Existing Number', icon: 'arrow.right.arrow.left', onPress: onClose },
            { label: 'Share Number', icon: 'square.and.arrow.up', onPress: onClose },
          ].map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                popupStyles.row,
                pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                action.onPress();
              }}
            >
              <IconSymbol name={action.icon as any} size={16} color={C.secondary} />
              <Text style={popupStyles.rowLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Main component ──

export function MyNumbersSection({ onFilter }: { onFilter: (mode: Mode) => void }) {
  const [popupNumber, setPopupNumber] = useState<KanextNumber | null>(null);

  return (
    <View style={styles.container}>
      {/* Section header */}
      <Text style={styles.sectionLabel}>MY NUMBERS</Text>

      {/* Number cards */}
      <View style={styles.cardWrap}>
        {MY_KANEXT_NUMBERS.map((num, i) => {
          const color = MODE_BADGE_COLORS[num.mode];
          const isLast = i === MY_KANEXT_NUMBERS.length - 1;
          return (
            <Pressable
              key={num.mode}
              style={({ pressed }) => [
                styles.numberRow,
                pressed && { backgroundColor: 'rgba(255,255,255,0.08)' },
                !isLast && styles.numberRowBorder,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilter(num.mode);
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPopupNumber(num);
              }}
              delayLongPress={400}
            >
              {/* Left: colored accent bar + number */}
              <View style={styles.numberLeft}>
                <View style={[styles.accentBar, { backgroundColor: color }]} />
                <Text style={styles.numberText}>{num.number}</Text>
              </View>
              {/* Right: pill */}
              <View style={[styles.pill, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.pillText, { color }]}>{MODE_BADGE_LABELS[num.mode]}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <NumberPopup
        visible={popupNumber !== null}
        number={popupNumber}
        onClose={() => setPopupNumber(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.secondary,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  cardWrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 0,
  },
  numberRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  numberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accentBar: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },
  numberText: {
    fontSize: 16,
    fontWeight: '500',
    color: C.label,
    fontVariant: ['tabular-nums'],
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

const popupStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  num: {
    fontSize: 18,
    fontWeight: '500',
    color: C.label,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  rowLabel: {
    fontSize: 15,
    color: C.label,
  },
});
