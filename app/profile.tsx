/**
 * Profile Screen — Viewer Experience
 *
 * Identity + Active Context for viewers.
 * Viewers see a single organization per mode with limited/single options.
 *
 * Structure:
 * - Identity Header (Avatar, Name, Subtext, Context Summary)
 * - Active Context (4 rows, mode-specific)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  ActionSheetIOS,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode } from '@/types';

// =============================================
// VIEWER CONTEXT DATA (Single options per mode)
// =============================================

const VIEWER_CONTEXT: Record<Mode, {
  organization: { label: string; value: string; options: string[] };
  row3: { label: string; value: string; options: string[] };
  row4: { label: string; value: string; options: string[] };
}> = {
  sports: {
    organization: { label: 'Organization', value: 'Lincoln University', options: ['Lincoln University'] },
    row3: { label: 'Program', value: 'Varsity', options: ['Varsity'] },
    row4: { label: 'Season', value: '2025–26', options: ['2025–26'] },
  },
  church: {
    organization: { label: 'Organization', value: 'ICCLA', options: ['ICCLA'] },
    row3: { label: 'Ministry', value: 'General', options: ['General'] },
    row4: { label: 'Year', value: '2025', options: ['2025'] },
  },
  enterprise: {
    organization: { label: 'Organization', value: 'KaNeXT', options: ['KaNeXT'] },
    row3: { label: 'Workspace', value: 'Default', options: ['Default'] },
    row4: { label: 'Role', value: 'Viewer', options: ['Viewer'] },
  },
  education: {
    organization: { label: 'Institution', value: 'Florida Memorial University', options: ['Florida Memorial University'] },
    row3: { label: 'Program', value: 'General Studies', options: ['General Studies'] },
    row4: { label: 'Term', value: 'Spring 2025', options: ['Spring 2025'] },
  },
};

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'sports', label: 'Sports' },
  { value: 'church', label: 'Church' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'education', label: 'Education' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, switchMode } = useAppContext();

  const isLoggedIn = state.authState === 'owner';
  const currentMode = state.mode || 'sports';
  const viewerContext = VIEWER_CONTEXT[currentMode];

  // Selector state for Android/Web
  const [activeSelector, setActiveSelector] = useState<string | null>(null);

  // Build context summary line
  const modeName = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
  const contextSummary = `${modeName} · ${viewerContext.organization.value} · ${viewerContext.row3.value} · ${viewerContext.row4.value}`;

  // Show selector (iOS ActionSheet or fallback modal)
  const showSelector = (
    title: string,
    options: string[],
    currentValue: string,
    onSelect: (value: string) => void,
    selectorKey: string
  ) => {
    if (Platform.OS === 'ios') {
      const displayOptions = options.map(opt =>
        opt === currentValue ? `✓ ${opt}` : `   ${opt}`
      );
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: [...displayOptions, 'Cancel'],
          cancelButtonIndex: displayOptions.length,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            onSelect(options[buttonIndex]);
          }
        }
      );
    } else {
      setActiveSelector(selectorKey);
    }
  };

  // Handle mode selection
  const handleModePress = () => {
    showSelector(
      'Select Mode',
      MODE_OPTIONS.map(m => m.label),
      modeName,
      (label) => {
        const selected = MODE_OPTIONS.find(m => m.label === label);
        if (selected) switchMode(selected.value);
      },
      'mode'
    );
  };

  // Handle other context rows (viewer has single options, but selector still opens)
  const handleContextRowPress = (label: string, options: string[], currentValue: string) => {
    showSelector(
      `Select ${label}`,
      options,
      currentValue,
      () => {}, // No-op for viewer (single option)
      label.toLowerCase()
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* ===== IDENTITY HEADER ===== */}
        <View style={styles.identitySection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="person.fill" size={40} color={colors.icon} />
          </View>
          <Text style={[styles.identityName, { color: colors.text }]}>
            {isLoggedIn ? 'Sammy Kalejaiye' : 'Viewer'}
          </Text>
          <Text style={[styles.identitySubtext, { color: colors.textSecondary }]}>
            {isLoggedIn ? 'Owner' : 'Viewer'}
          </Text>
          <Text style={[styles.contextSummary, { color: colors.textTertiary }]}>
            {contextSummary}
          </Text>
        </View>

        {/* ===== ACTIVE CONTEXT ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACTIVE CONTEXT
          </Text>
          <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Row 1: Mode */}
            <ContextRow
              label="Mode"
              value={modeName}
              colors={colors}
              onPress={handleModePress}
            />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

            {/* Row 2: Organization/Institution */}
            <ContextRow
              label={viewerContext.organization.label}
              value={viewerContext.organization.value}
              colors={colors}
              onPress={() => handleContextRowPress(
                viewerContext.organization.label,
                viewerContext.organization.options,
                viewerContext.organization.value
              )}
            />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

            {/* Row 3: Program/Ministry/Workspace */}
            <ContextRow
              label={viewerContext.row3.label}
              value={viewerContext.row3.value}
              colors={colors}
              onPress={() => handleContextRowPress(
                viewerContext.row3.label,
                viewerContext.row3.options,
                viewerContext.row3.value
              )}
            />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

            {/* Row 4: Season/Year/Term/Role */}
            <ContextRow
              label={viewerContext.row4.label}
              value={viewerContext.row4.value}
              colors={colors}
              onPress={() => handleContextRowPress(
                viewerContext.row4.label,
                viewerContext.row4.options,
                viewerContext.row4.value
              )}
            />
          </View>
        </View>
      </ScrollView>

      {/* Android/Web Fallback Selector Modal */}
      {Platform.OS !== 'ios' && activeSelector && (
        <SelectorModal
          visible={true}
          title={`Select ${activeSelector.charAt(0).toUpperCase() + activeSelector.slice(1)}`}
          options={
            activeSelector === 'mode'
              ? MODE_OPTIONS.map(m => m.label)
              : activeSelector === viewerContext.organization.label.toLowerCase()
              ? viewerContext.organization.options
              : activeSelector === viewerContext.row3.label.toLowerCase()
              ? viewerContext.row3.options
              : viewerContext.row4.options
          }
          selectedValue={
            activeSelector === 'mode'
              ? modeName
              : activeSelector === viewerContext.organization.label.toLowerCase()
              ? viewerContext.organization.value
              : activeSelector === viewerContext.row3.label.toLowerCase()
              ? viewerContext.row3.value
              : viewerContext.row4.value
          }
          onSelect={(value) => {
            if (activeSelector === 'mode') {
              const selected = MODE_OPTIONS.find(m => m.label === value);
              if (selected) switchMode(selected.value);
            }
            setActiveSelector(null);
          }}
          onClose={() => setActiveSelector(null)}
          colors={colors}
        />
      )}
    </View>
  );
}

// =============================================
// CONTEXT ROW (Tappable, no arrows)
// =============================================
function ContextRow({
  label,
  value,
  colors,
  onPress,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.contextRow,
        pressed && { backgroundColor: colors.backgroundTertiary },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.contextValue, { color: colors.text }]}>{value}</Text>
    </Pressable>
  );
}

// =============================================
// SELECTOR MODAL (Android/Web fallback)
// =============================================
function SelectorModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          {options.map((option) => {
            const isSelected = option === selectedValue;
            return (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.modalOption,
                  isSelected && { backgroundColor: colors.backgroundSecondary },
                  pressed && !isSelected && { backgroundColor: colors.backgroundTertiary },
                ]}
                onPress={() => onSelect(option)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.text },
                    isSelected && { fontWeight: '600' },
                  ]}
                >
                  {option}
                </Text>
                {isSelected && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
              </Pressable>
            );
          })}
          <Pressable
            style={[styles.modalCancel, { borderTopColor: colors.divider }]}
            onPress={onClose}
          >
            <Text style={[styles.modalCancelText, { color: colors.tint }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Identity Section
  identitySection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: Spacing.lg,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  identityName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  identitySubtext: {
    fontSize: 15,
    marginBottom: 8,
  },
  contextSummary: {
    fontSize: 13,
    textAlign: 'center',
  },

  // Section
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Context Card
  contextCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  contextLabel: {
    fontSize: 15,
  },
  contextValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 280,
    borderRadius: BorderRadius.lg,
    paddingTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCancel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
