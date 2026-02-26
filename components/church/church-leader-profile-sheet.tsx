/**
 * Church Leader Profile Sheet
 * Bottom sheet showing a leader's profile.
 *
 * Blocks:
 *   Block 0 — Avatar + Name + Role
 *   Block 1 — Bio
 *   Block 2 — Ministries
 *   Block 3 — Actions (Message, Email)
 *
 * No personal contact info exposed unless RBAC allows.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors } from '@/constants/theme';
import type { ChurchLeader } from '@/data/mock-church-home';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  visible: boolean;
  onClose: () => void;
  leader: ChurchLeader | null;
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  const parts = name.replace(/^(Pastor|Elder|Deacon|Mother|Minister|Sister|Brother)\s+/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#22C55E' },
  on_leave: { label: 'On Leave', color: '#F59E0B' },
  visiting: { label: 'Visiting', color: '#8B5CF6' },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchLeaderProfileSheet({ visible, onClose, leader, colors, accent }: Props) {
  if (!leader) return null;

  const statusConf = STATUS_CONFIG[leader.status] || STATUS_CONFIG.active;
  const initials = getInitials(leader.name);

  const handleMessage = () => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert('Message', `Opening conversation with ${leader.name}...`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* ── Block 0 — Header ── */}
      <View style={s.headerBlock}>
        <View style={[s.avatarLg, { backgroundColor: accent + '20' }]}>
          <ThemedText style={[s.avatarText, { color: accent }]}>{initials}</ThemedText>
        </View>
        <ThemedText style={[s.leaderName, { color: colors.text }]}>{leader.name}</ThemedText>
        <ThemedText style={[s.leaderTitle, { color: colors.textSecondary }]}>{leader.title}</ThemedText>
        <View style={s.headerChips}>
          <View style={[s.statusChip, { backgroundColor: statusConf.color + '18' }]}>
            <ThemedText style={[s.statusText, { color: statusConf.color }]}>{statusConf.label}</ThemedText>
          </View>
          <View style={[s.yearsChip, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[s.yearsText, { color: colors.textSecondary }]}>
              {leader.yearsServing} years serving
            </ThemedText>
          </View>
        </View>
      </View>

      {/* ── Block 1 — Bio ── */}
      <View style={[s.block, { borderTopColor: colors.border }]}>
        <ThemedText style={[s.blockTitle, { color: colors.text }]}>About</ThemedText>
        <ThemedText style={[s.bioText, { color: colors.textSecondary }]}>{leader.bio}</ThemedText>
      </View>

      {/* ── Block 2 — Ministries ── */}
      {leader.ministries.length > 0 && (
        <View style={[s.block, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.blockTitle, { color: colors.text }]}>Ministries</ThemedText>
          <View style={s.ministryChips}>
            {leader.ministries.map((m) => (
              <View key={m} style={[s.ministryChip, { backgroundColor: accent + '15' }]}>
                <ThemedText style={[s.ministryChipText, { color: accent }]}>{m}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Block 3 — Actions ── */}
      <View style={[s.block, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [s.actionBtn, { backgroundColor: accent }, pressed && { opacity: 0.7 }]}
          onPress={handleMessage}
        >
          <IconSymbol name="envelope.fill" size={16} color="#000" />
          <ThemedText style={s.actionBtnText}>Message</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  headerBlock: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  leaderName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  leaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  headerChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  yearsChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  yearsText: {
    fontSize: 11,
    fontWeight: '600',
  },

  block: {
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 20,
  },

  ministryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ministryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ministryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});
