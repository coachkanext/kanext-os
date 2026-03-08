/**
 * NumberFilterPills — Shared phone-number-based filter pills for side panels.
 * Each pill shows last 4 digits + mode label. Tap filters, long press opens popup.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  MY_KANEXT_NUMBERS,
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

interface NumberFilterPillsProps {
  activeMode: Mode | null;
  onFilterChange: (mode: Mode | null) => void;
}

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

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          <View style={popupStyles.header}>
            <View style={popupStyles.headerPill}>
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

// ── Extract last 4 digits from a phone number string ──

function lastFour(number: string): string {
  const digits = number.replace(/\D/g, '');
  return digits.slice(-4);
}

// ── Main component ──

export function NumberFilterPills({ activeMode, onFilterChange }: NumberFilterPillsProps) {
  const [popupNumber, setPopupNumber] = useState<KanextNumber | null>(null);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {MY_KANEXT_NUMBERS.map((num) => {
          const active = activeMode === num.mode;
          return (
            <Pressable
              key={num.mode}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilterChange(active ? null : num.mode);
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPopupNumber(num);
              }}
              delayLongPress={400}
            >
              <Text style={[styles.pillNumber, active && styles.pillTextActive]}>
                {lastFour(num.number)}
              </Text>
              <Text style={[styles.pillLabel, active && styles.pillTextActive]}>
                {MODE_BADGE_LABELS[num.mode]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <NumberPopup
        visible={popupNumber !== null}
        number={popupNumber}
        onClose={() => setPopupNumber(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillActive: {
    backgroundColor: '#FFFFFF',
  },
  pillNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
    fontVariant: ['tabular-nums'],
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: C.secondary,
  },
  pillTextActive: {
    color: '#000000',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
