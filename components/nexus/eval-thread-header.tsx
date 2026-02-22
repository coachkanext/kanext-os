/**
 * Eval Thread Header Component
 * Compact header at top of eval threads with player/role selectors and actions.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PlayerEvalConfig, PlayerEvalRole } from '@/types';

// Mock players for demo
const MOCK_PLAYERS = [
  { id: 'p1', name: 'Marcus Reed' },
  { id: 'p2', name: 'Devon Carter' },
  { id: 'p3', name: 'Tyler Rodriguez' },
  { id: 'p4', name: 'Jamal Thompson' },
  { id: 'p5', name: 'Chris Anderson' },
];

const ROLES: { value: PlayerEvalRole; label: string }[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'development', label: 'Development' },
];

interface EvalThreadHeaderProps {
  config: PlayerEvalConfig;
  onConfigChange: (config: PlayerEvalConfig) => void;
  onGenerateEval: () => void;
  isLoading?: boolean;
}

export function EvalThreadHeader({
  config,
  onConfigChange,
  onGenerateEval,
  isLoading = false,
}: EvalThreadHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const selectedPlayer = MOCK_PLAYERS.find((p) => p.id === config.playerId);
  const selectedRole = ROLES.find((r) => r.value === config.role);

  const handlePlayerSelect = (player: { id: string; name: string }) => {
    Haptics.selectionAsync();
    onConfigChange({
      ...config,
      playerId: player.id,
      playerName: player.name,
    });
    setShowPlayerPicker(false);
  };

  const handleRoleSelect = (role: PlayerEvalRole) => {
    Haptics.selectionAsync();
    onConfigChange({
      ...config,
      role,
    });
    setShowRolePicker(false);
  };

  const handleGenerateEval = () => {
    if (!config.playerId || !config.role) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGenerateEval();
  };

  const canGenerate = config.playerId && config.role && !isLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
      {/* Header Label */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <IconSymbol name="person.text.rectangle" size={16} color="#ffffff" />
          <ThemedText style={styles.headerTitle}>Player Evaluation</ThemedText>
        </View>
      </View>

      {/* Selectors Row */}
      <View style={styles.selectorsRow}>
        {/* Player Selector */}
        <Pressable
          style={({ pressed }) => [
            styles.selector,
            { backgroundColor: colors.background, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            setShowPlayerPicker(!showPlayerPicker);
            setShowRolePicker(false);
          }}
        >
          <ThemedText
            style={[
              styles.selectorText,
              !selectedPlayer && { color: colors.textTertiary },
            ]}
            numberOfLines={1}
          >
            {selectedPlayer?.name ?? 'Select Player'}
          </ThemedText>
          <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
        </Pressable>

        {/* Role Selector */}
        <Pressable
          style={({ pressed }) => [
            styles.selector,
            styles.roleSelector,
            { backgroundColor: colors.background, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            setShowRolePicker(!showRolePicker);
            setShowPlayerPicker(false);
          }}
        >
          <ThemedText
            style={[
              styles.selectorText,
              !selectedRole && { color: colors.textTertiary },
            ]}
          >
            {selectedRole?.label ?? 'Role'}
          </ThemedText>
          <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
        </Pressable>

        {/* Generate Button */}
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            { backgroundColor: canGenerate ? '#ffffff' : colors.backgroundTertiary },
            pressed && canGenerate && { opacity: 0.8 },
          ]}
          onPress={handleGenerateEval}
          disabled={!canGenerate}
        >
          <IconSymbol name="sparkles" size={14} color={canGenerate ? '#FFFFFF' : colors.textTertiary} />
          <ThemedText
            style={[
              styles.generateText,
              { color: canGenerate ? '#FFFFFF' : colors.textTertiary },
            ]}
          >
            Generate
          </ThemedText>
        </Pressable>
      </View>

      {/* Player Dropdown */}
      {showPlayerPicker && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MOCK_PLAYERS.map((player) => (
            <Pressable
              key={player.id}
              style={({ pressed }) => [
                styles.dropdownItem,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={() => handlePlayerSelect(player)}
            >
              <ThemedText style={styles.dropdownText}>{player.name}</ThemedText>
              {player.id === config.playerId && (
                <IconSymbol name="checkmark" size={14} color="#ffffff" />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Role Dropdown */}
      {showRolePicker && (
        <View style={[styles.dropdown, styles.roleDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ROLES.map((role) => (
            <Pressable
              key={role.value}
              style={({ pressed }) => [
                styles.dropdownItem,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={() => handleRoleSelect(role.value)}
            >
              <ThemedText style={styles.dropdownText}>{role.label}</ThemedText>
              {role.value === config.role && (
                <IconSymbol name="checkmark" size={14} color="#ffffff" />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  selectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  roleSelector: {
    flex: 0.7,
  },
  selectorText: {
    fontSize: 14,
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  generateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleDropdown: {
    left: 'auto',
    right: 100,
    width: 140,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownText: {
    fontSize: 14,
  },
});
