/**
 * Program Context Drawer Component
 * Right slide-in drawer for viewing/editing program context settings.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Program } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(340, SCREEN_WIDTH * 0.9);

// Program options
const PROGRAMS: Program[] = [
  { id: 'varsity', name: 'Varsity', level: 'varsity' },
  { id: 'dev1', name: 'Development I', level: 'development_1' },
  { id: 'dev2', name: 'Development II', level: 'development_2' },
  { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
];

interface ProgramContextDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function ProgramContextDrawer({
  visible,
  onClose,
}: ProgramContextDrawerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state, setProgram } = useAppContext();

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const currentProgram = state.program ?? PROGRAMS[0];

  const handleProgramSelect = (program: Program) => {
    setProgram(program);
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim / Backdrop */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.headerTitle}>Program Context</ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
            accessibilityLabel="Close drawer"
            accessibilityRole="button"
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Program Selector */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              ACTIVE PROGRAM
            </ThemedText>
            <View style={styles.optionsList}>
              {PROGRAMS.map((program) => {
                const isSelected = program.id === currentProgram.id;
                return (
                  <Pressable
                    key={program.id}
                    style={({ pressed }) => [
                      styles.optionRow,
                      {
                        backgroundColor: isSelected
                          ? colors.backgroundSecondary
                          : pressed
                          ? colors.backgroundSecondary
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleProgramSelect(program)}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && (
                        <View
                          style={[styles.radioInner, { backgroundColor: colors.tint }]}
                        />
                      )}
                    </View>
                    <ThemedText
                      style={[
                        styles.optionLabel,
                        isSelected && { fontWeight: '600' },
                      ]}
                    >
                      {program.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Season/Cycle */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              ACTIVE SEASON
            </ThemedText>
            <ThemedText style={styles.fieldValue}>
              {state.cycle?.name ?? '2025-26'}
            </ThemedText>
          </View>

          {/* Organization */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              ORGANIZATION
            </ThemedText>
            <ThemedText style={styles.fieldValue}>
              {state.organization?.name ?? 'Lincoln University'}
            </ThemedText>
          </View>

          {/* Program Resources (Read-only for demo) */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              PROGRAM RESOURCES
            </ThemedText>
            <View style={[styles.resourceCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.resourceRow}>
                <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
                  Scholarships
                </ThemedText>
                <ThemedText style={styles.resourceValue}>10 / 10</ThemedText>
              </View>
              <View style={styles.resourceRow}>
                <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
                  NIL Budget
                </ThemedText>
                <ThemedText style={styles.resourceValue}>$250,000</ThemedText>
              </View>
            </View>
          </View>

          {/* System Preset (Read-only for demo) */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              SYSTEM PRESET
            </ThemedText>
            <View style={[styles.presetBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={styles.presetText}>Motion Offense</ThemedText>
            </View>
            <ThemedText style={[styles.presetDescription, { color: colors.textSecondary }]}>
              Emphasizes ball movement, spacing, and player versatility.
            </ThemedText>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  optionsList: {
    marginTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 16,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  resourceCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  resourceLabel: {
    fontSize: 14,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  presetBadge: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  presetDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
