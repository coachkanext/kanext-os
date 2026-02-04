/**
 * Home Screen
 * Orientation only - displays current system context.
 * Per spec: Home = orientation only. No work performed here.
 * Single exception: Program switching is allowed on Home.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/top-bar';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Program } from '@/types';

// Available programs for Sports mode
const PROGRAMS: Program[] = [
  { id: 'varsity', name: 'Varsity', level: 'varsity' },
  { id: 'dev1', name: 'Development I', level: 'development_1' },
  { id: 'dev2', name: 'Development II', level: 'development_2' },
  { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { state, setProgram } = useAppContext();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [programPickerVisible, setProgramPickerVisible] = useState(false);

  // Format mode name for display
  const formatMode = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Format role name for display
  const formatRole = (role: string) => {
    const roleLabels: Record<string, string> = {
      founder: 'Founder & CEO',
      head_coach: 'Head Coach',
      fan: 'Fan',
      member: 'Member',
      student: 'Student',
      viewer: 'Viewer',
    };
    return roleLabels[role] || role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Get default organization name by mode
  const getOrgName = () => {
    if (state.organization) return state.organization.name;
    switch (state.mode) {
      case 'sports': return 'Lincoln University';
      case 'enterprise': return 'KaNeXT';
      case 'church': return 'International Christian Center';
      case 'education': return 'San Diego Christian College';
      default: return 'Organization';
    }
  };

  const handleProgramSelect = (program: Program) => {
    setProgram(program);
    setProgramPickerVisible(false);
  };

  const currentProgram = state.program ?? PROGRAMS[0];

  return (
    <ThemedView style={styles.container}>
      <TopBar onAvatarPress={() => setDrawerVisible(true)} />

      <View style={styles.content}>
        {/* Context Display */}
        <View style={styles.contextSection}>
          {/* Mode */}
          <View style={styles.contextRow}>
            <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
              Mode
            </ThemedText>
            <ThemedText style={styles.contextValue}>
              {formatMode(state.mode)}
            </ThemedText>
          </View>

          {/* Organization */}
          <View style={styles.contextRow}>
            <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
              Organization
            </ThemedText>
            <ThemedText style={styles.contextValue}>
              {getOrgName()}
            </ThemedText>
          </View>

          {/* Program (Sports mode only - interactive) */}
          {state.mode === 'sports' && (
            <View style={styles.contextRow}>
              <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
                Program
              </ThemedText>
              <Pressable
                style={({ pressed }) => [
                  styles.programSelector,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setProgramPickerVisible(true)}
              >
                <ThemedText style={styles.programText}>
                  {currentProgram.name}
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
              </Pressable>
            </View>
          )}

          {/* Operating Role */}
          <View style={styles.contextRow}>
            <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
              Operating Role
            </ThemedText>
            <ThemedText style={styles.contextValue}>
              {formatRole(state.operatingRole)}
            </ThemedText>
          </View>

          {/* Cycle (if set) */}
          {state.cycle && (
            <View style={styles.contextRow}>
              <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
                {state.mode === 'sports' ? 'Season' : state.mode === 'education' ? 'Academic Year' : 'Cycle'}
              </ThemedText>
              <ThemedText style={styles.contextValue}>
                {state.cycle.name}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Avatar Drawer */}
      <AvatarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Program Picker Modal (Sports mode only) */}
      <Modal
        visible={programPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProgramPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProgramPickerVisible(false)}
        >
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <ThemedText style={styles.pickerTitle}>Select Program</ThemedText>
            {PROGRAMS.map((program) => (
              <Pressable
                key={program.id}
                style={({ pressed }) => [
                  styles.pickerOption,
                  {
                    backgroundColor:
                      currentProgram.id === program.id
                        ? colors.backgroundSecondary
                        : pressed
                        ? colors.backgroundSecondary
                        : 'transparent',
                  },
                ]}
                onPress={() => handleProgramSelect(program)}
              >
                <ThemedText
                  style={[
                    styles.pickerOptionText,
                    currentProgram.id === program.id && { fontWeight: '600' },
                  ]}
                >
                  {program.name}
                </ThemedText>
                {currentProgram.id === program.id && (
                  <IconSymbol name="chevron.right" size={16} color={colors.tint} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  contextSection: {
    gap: Spacing.lg,
  },
  contextRow: {
    gap: Spacing.xs,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  programSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  programText: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pickerContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  pickerOptionText: {
    fontSize: 16,
  },
});
