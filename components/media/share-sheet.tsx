/**
 * Share Sheet — bottom sheet with sharing options for games/clips/reels.
 * Copy Link, Share to…, Share to Messages, Post to Feed.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { VisibilityPicker } from '@/components/media/visibility-picker';
import { Spacing } from '@/constants/theme';
import type { ShareVisibility } from '@/data/mock-video';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  shareUrl?: string;
  showVisibility?: boolean;
}

export function ShareSheet({ visible, onClose, title, shareUrl = 'https://kanext.app/share/demo', showVisibility = false }: ShareSheetProps) {
  const [visibility, setVisibility] = useState<ShareVisibility>('team');

  const handleCopyLink = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'Link copied to clipboard');
    onClose();
  };

  const handleShareTo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: `${title}\n${shareUrl}`, url: shareUrl });
    } catch {
      // User cancelled
    }
  };

  const handleShareMessages = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share to Messages', 'Team Thread / Staff Room / Player 1:1 — Coming Soon');
  };

  const handlePostToFeed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'Post to Feed will be available in a future update.');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Share" useModal>
      <View style={styles.content}>
        {showVisibility && (
          <View style={styles.visibilitySection}>
            <ThemedText style={styles.sectionLabel}>Visibility</ThemedText>
            <VisibilityPicker value={visibility} onChange={setVisibility} />
          </View>
        )}

        <Pressable style={styles.row} onPress={handleCopyLink}>
          <IconSymbol name="link" size={20} color="#FFFFFF" />
          <ThemedText style={styles.rowLabel}>Copy Link</ThemedText>
        </Pressable>

        <Pressable style={styles.row} onPress={handleShareTo}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#FFFFFF" />
          <ThemedText style={styles.rowLabel}>Share to...</ThemedText>
        </Pressable>

        <Pressable style={styles.row} onPress={handleShareMessages}>
          <IconSymbol name="bubble.left.fill" size={20} color="#FFFFFF" />
          <ThemedText style={styles.rowLabel}>Share to Messages</ThemedText>
        </Pressable>

        <Pressable style={styles.row} onPress={handlePostToFeed}>
          <IconSymbol name="doc.badge.arrow.up" size={20} color="#FFFFFF" />
          <ThemedText style={styles.rowLabel}>Post to Feed</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 4,
  },
  visibilitySection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
