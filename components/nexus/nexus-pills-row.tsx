/**
 * Nexus Pills Row — shown below top bar in active chat.
 * Project pill (if set) + Artifacts pill (always shown per spec).
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

interface NexusPillsRowProps {
  projectName?: string | null;
  artifactCount?: number;
  onProjectPress?: () => void;
  onArtifactsPress?: () => void;
}

export function NexusPillsRow({
  projectName,
  artifactCount = 0,
  onProjectPress,
  onArtifactsPress,
}: NexusPillsRowProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  // Artifacts pill always shown in active chat per spec.
  // Project pill shown only when conversation has a project.

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.container}
    >
      {projectName && (
        <Pressable
          style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.7 : 1 }]}
          onPress={onProjectPress}
        >
          <IconSymbol name="folder" size={13} color={C.secondary} />
          <Text style={styles.pillText} numberOfLines={1}>{projectName}</Text>
        </Pressable>
      )}
      <Pressable
        style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onArtifactsPress}
      >
        <IconSymbol name="doc.text" size={13} color={C.secondary} />
        <Text style={styles.pillText}>
          {artifactCount} {artifactCount === 1 ? 'artifact' : 'artifacts'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.divider,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.divider,
      backgroundColor: C.surface,
      maxWidth: 180,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '500',
      color: C.secondary,
    },
  });
