/**
 * New Thread Sheet — Thread template picker with 9 templates, role-gated.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { THREAD_TEMPLATES } from '@/data/mock-messages';
import { useOperatingRole } from '@/context/app-context';
import { getAvailableTemplates } from '@/utils/messages-permissions';

interface NewThreadSheetProps {
  onClose: () => void;
}

export function NewThreadSheet({ onClose }: NewThreadSheetProps) {
  const role = useOperatingRole();
  const allowedTemplates = getAvailableTemplates(role);
  const visibleTemplates = THREAD_TEMPLATES.filter((t) => allowedTemplates.includes(t.key));

  const handleSelect = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('New Thread', `Creating "${label}" thread...`);
    onClose();
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.subtitle}>Choose a thread type</ThemedText>

      {visibleTemplates.map((template) => (
        <Pressable
          key={template.key}
          style={({ pressed }) => [
            styles.templateRow,
            { backgroundColor: pressed ? '#0B0F14' : 'transparent' },
          ]}
          onPress={() => handleSelect(template.label)}
        >
          <View style={styles.iconCircle}>
            <IconSymbol name={template.icon as any} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.templateContent}>
            <ThemedText style={styles.templateLabel}>{template.label}</ThemedText>
            <ThemedText style={styles.templateDesc}>{template.description}</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color="#555" />
        </Pressable>
      ))}

      {visibleTemplates.length === 0 && (
        <ThemedText style={styles.emptyText}>
          No thread types available for your role.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#9C9790',
    marginBottom: Spacing.md,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateContent: {
    flex: 1,
  },
  templateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  templateDesc: {
    fontSize: 13,
    color: '#9C9790',
  },
  emptyText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
