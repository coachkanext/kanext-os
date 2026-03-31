/**
 * Alert Row — alert list item with severity indicator and CTA.
 * V2: entire row tappable for detail sheet.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatMessageTime, getSeverityColor, getSourceTagColor } from '@/data/mock-messages';
import type { AlertItem } from '@/data/mock-messages';

interface AlertRowProps {
  alert: AlertItem;
  onCta: () => void;
  onPress: () => void;
}

export function AlertRow({ alert, onCta, onPress }: AlertRowProps) {
  const severityColor = getSeverityColor(alert.severity);
  const sourceColor = getSourceTagColor(alert.sourceTag);

  const handleCta = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCta();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? '#0B0F14' : 'transparent' },
        alert.resolved && styles.resolved,
      ]}
      onPress={handlePress}
    >
      {/* Severity Dot */}
      <View style={[styles.severityDot, { backgroundColor: severityColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {alert.title}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={[styles.sourceTag, { backgroundColor: sourceColor.bg }]}>
            <ThemedText style={[styles.sourceText, { color: sourceColor.text }]}>{alert.sourceTag}</ThemedText>
          </View>
          {alert.assignedTo && (
            <ThemedText style={styles.assignedText}>{alert.assignedTo}</ThemedText>
          )}
        </View>
      </View>

      {/* Right Column */}
      <View style={styles.rightCol}>
        <ThemedText style={styles.timestamp}>{formatMessageTime(alert.timestamp)}</ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.ctaPill,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleCta}
        >
          <ThemedText style={styles.ctaText}>{alert.cta}</ThemedText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
  },
  resolved: {
    opacity: 0.5,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm + 4,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceTag: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  sourceText: {
    fontSize: 11,
    color: '#9C9790',
    fontWeight: '500',
  },
  assignedText: {
    fontSize: 11,
    color: '#555',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#9C9790',
  },
  ctaPill: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
