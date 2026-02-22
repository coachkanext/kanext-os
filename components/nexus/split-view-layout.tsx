/**
 * Split-View Layout — side-by-side film review + Nexus chat.
 * Video top (40%), chat bottom (60%). Used when a film link chip is activated.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SplitViewLayoutProps {
  /** The video/film content to show in the top pane */
  videoContent?: React.ReactNode;
  /** The chat content to show in the bottom pane */
  chatContent: React.ReactNode;
  /** Film context label (e.g. "vs Summit — Q1 5:32") */
  filmContextLabel?: string;
  /** Called when the user exits split view */
  onExitSplitView: () => void;
}

export function SplitViewLayout({
  videoContent,
  chatContent,
  filmContextLabel,
  onExitSplitView,
}: SplitViewLayoutProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {/* Top pane — Video (40%) */}
      <View style={[styles.videoPane, { backgroundColor: '#000' }]}>
        {videoContent || (
          <View style={styles.videoPlaceholder}>
            <IconSymbol name="play.rectangle.fill" size={48} color="rgba(255,255,255,0.4)" />
            <ThemedText style={styles.videoPlaceholderText}>
              Film Review
            </ThemedText>
            {filmContextLabel && (
              <ThemedText style={styles.videoContextLabel}>
                {filmContextLabel}
              </ThemedText>
            )}
          </View>
        )}

        {/* Exit split view button */}
        <Pressable
          style={({ pressed }) => [
            styles.exitButton,
            { backgroundColor: 'rgba(0,0,0,0.6)', opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onExitSplitView}
        >
          <IconSymbol name="arrow.down.right.and.arrow.up.left" size={14} color="#fff" />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Bottom pane — Chat (60%) */}
      <View style={styles.chatPane}>
        {chatContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoPane: {
    flex: 0.4,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  videoPlaceholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContextLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
  },
  exitButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  chatPane: {
    flex: 0.6,
  },
});
