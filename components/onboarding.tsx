/**
 * Onboarding Component
 * First-run experience asking "What brought you here?"
 * Per spec: This is shown once on first launch to set the initial mode.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode, Role } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ModeOption {
  mode: Mode;
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  color: string;
  defaultRole: Role;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'sports',
    title: 'Sports',
    subtitle: 'Manage teams, rosters, and recruiting',
    icon: 'sportscourt.fill',
    color: ModeColors.sports.primary,
    defaultRole: 'head_coach',
  },
  {
    mode: 'enterprise',
    title: 'Enterprise',
    subtitle: 'Investor relations and data room',
    icon: 'building.2.fill',
    color: ModeColors.enterprise.primary,
    defaultRole: 'founder',
  },
  {
    mode: 'church',
    title: 'Church',
    subtitle: 'Campuses, ministries, and community',
    icon: 'heart.fill',
    color: ModeColors.church.primary,
    defaultRole: 'member',
  },
  {
    mode: 'education',
    title: 'Education',
    subtitle: 'Academic calendar and institutional data',
    icon: 'graduationcap.fill',
    color: ModeColors.education.primary,
    defaultRole: 'faculty',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { switchMode, setFirstRun } = useAppContext();

  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);

  const handleModeSelect = (option: ModeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMode(option.mode);
  };

  const handleContinue = () => {
    if (!selectedMode) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(selectedMode); // Sets mode, org, role, and cycle together
    setFirstRun(false);
    onComplete();
  };

  const selectedOption = MODE_OPTIONS.find((o) => o.mode === selectedMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={[styles.logoContainer, { backgroundColor: Brand.nexus }]}>
            <Text style={styles.logoText}>K</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>KaNeXT</Text>
          <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
            Institutional OS + Governed Intelligence
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            What brought you here?
          </Text>
          <Text style={[styles.questionSubtext, { color: colors.textSecondary }]}>
            Select your primary use case to get started
          </Text>
        </View>

        {/* Mode Options */}
        <View style={styles.optionsGrid}>
          {MODE_OPTIONS.map((option) => (
            <Pressable
              key={option.mode}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedMode === option.mode ? option.color : colors.border,
                  borderWidth: selectedMode === option.mode ? 2 : 1,
                },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => handleModeSelect(option)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                <IconSymbol name={option.icon} size={28} color={option.color} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {option.title}
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                {option.subtitle}
              </Text>
              {selectedMode === option.mode && (
                <View style={[styles.selectedIndicator, { backgroundColor: option.color }]}>
                  <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Continue Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: selectedOption?.color || colors.backgroundTertiary,
                opacity: selectedMode ? (pressed ? 0.8 : 1) : 0.5,
              },
            ]}
            onPress={handleContinue}
            disabled={!selectedMode}
          >
            <Text style={styles.continueButtonText}>
              {selectedMode ? `Continue with ${selectedOption?.title}` : 'Select an option'}
            </Text>
            {selectedMode && (
              <IconSymbol name="arrow.right" size={18} color="#FFFFFF" />
            )}
          </Pressable>

          <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
            You can switch modes anytime from your profile
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
  },
  brandTagline: {
    fontSize: 14,
    marginTop: 4,
  },

  // Question
  questionSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  questionSubtext: {
    fontSize: 15,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // Options
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  optionCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
