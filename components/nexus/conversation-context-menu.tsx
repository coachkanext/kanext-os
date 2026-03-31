/**
 * Conversation Context Menu
 * iOS Messages-style floating context menu on long-press.
 * Shows lifted preview card + action menu.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Conversation } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuOption {
  id: string;
  label: string;
  icon: IconSymbolName;
  destructive?: boolean;
}

const MENU_OPTIONS: MenuOption[] = [
  { id: 'share', label: 'Share Chat', icon: 'square.and.arrow.up' },
  { id: 'pin', label: 'Pin', icon: 'pin.fill' },
  { id: 'rename', label: 'Rename', icon: 'pencil' },
  { id: 'archive', label: 'Archive', icon: 'archivebox.fill' },
  { id: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
];

interface ConversationContextMenuProps {
  visible: boolean;
  conversation: Conversation | null;
  position: { x: number; y: number };
  onClose: () => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function ConversationContextMenu({
  visible,
  conversation,
  position,
  onClose,
  onPin,
  onUnpin,
  onRename,
  onArchive,
  onDelete,
  onShare,
}: ConversationContextMenuProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  const [showRenameInput, setShowRenameInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    if (visible) {
      setRenameText(conversation?.title ?? '');
      setShowRenameInput(false);
      setShowDeleteConfirm(false);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 400,
          friction: 25,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(liftAnim, {
          toValue: 1,
          tension: 400,
          friction: 25,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim, liftAnim, conversation?.title]);

  const handleOptionPress = (optionId: string) => {
    if (!conversation) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (optionId) {
      case 'pin':
        if (conversation.isPinned) {
          onUnpin(conversation.id);
        } else {
          onPin(conversation.id);
        }
        onClose();
        break;
      case 'rename':
        setShowRenameInput(true);
        break;
      case 'archive':
        onArchive(conversation.id);
        onClose();
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
      case 'share':
        onShare(conversation.id);
        onClose();
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (conversation) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete(conversation.id);
      onClose();
    }
  };

  const handleRenameSubmit = () => {
    if (conversation && renameText.trim()) {
      onRename(conversation.id, renameText.trim());
      onClose();
    }
  };

  // Calculate menu position - center horizontally, position below preview
  const menuWidth = 220;
  const previewWidth = 260;
  const menuLeft = Math.max(16, Math.min(position.x - menuWidth / 2, SCREEN_WIDTH - menuWidth - 16));
  const previewLeft = Math.max(16, Math.min(position.x - previewWidth / 2, SCREEN_WIDTH - previewWidth - 16));

  // Position preview card and menu
  const previewTop = Math.max(60, Math.min(position.y - 80, SCREEN_HEIGHT - 400));
  const menuTop = previewTop + 100;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.6)',
              opacity: opacityAnim,
            },
          ]}
        />
      </Pressable>

      {/* Lifted Preview Card */}
      <Animated.View
        style={[
          styles.previewCard,
          {
            top: previewTop,
            left: previewLeft,
            width: previewWidth,
            backgroundColor: colors.backgroundSecondary,
            transform: [
              { scale: scaleAnim },
              {
                translateY: liftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
            opacity: opacityAnim,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: isDark ? 0.5 : 0.25,
            shadowRadius: 30,
            elevation: 24,
          },
        ]}
      >
        <View style={styles.previewHeader}>
          <View style={[styles.previewIcon, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="text.bubble.fill" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.previewContent}>
            <ThemedText style={styles.previewTitle} numberOfLines={1}>
              {conversation?.title}
            </ThemedText>
            {conversation?.lastMessage && (
              <ThemedText style={[styles.previewMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                {conversation.lastMessage.content}
              </ThemedText>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Action Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            top: menuTop,
            left: menuLeft,
            width: menuWidth,
            backgroundColor: colors.backgroundSecondary,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 20,
            elevation: 20,
          },
        ]}
      >
        {/* Rename Input View */}
        {showRenameInput ? (
          <View style={styles.renameContainer}>
            <ThemedText style={styles.renameLabel}>Rename conversation</ThemedText>
            <TextInput
              style={[
                styles.renameInput,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundTertiary,
                  borderColor: colors.border,
                },
              ]}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Conversation name"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              selectTextOnFocus
              onSubmitEditing={handleRenameSubmit}
              returnKeyType="done"
            />
            <View style={styles.renameActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.renameButton,
                  { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setShowRenameInput(false)}
              >
                <ThemedText style={styles.renameButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.renameButton,
                  styles.renameButtonPrimary,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleRenameSubmit}
              >
                <ThemedText style={[styles.renameButtonText, { color: '#000000' }]}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : showDeleteConfirm ? (
          /* Delete Confirmation View */
          <View style={styles.confirmContainer}>
            <ThemedText style={styles.confirmTitle}>Delete conversation?</ThemedText>
            <ThemedText style={[styles.confirmMessage, { color: colors.textSecondary }]}>
              This action cannot be undone.
            </ThemedText>
            <View style={styles.confirmActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <ThemedText style={styles.confirmButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonDestructive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleDeleteConfirm}
              >
                <ThemedText style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Delete</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Menu Options */
          <View style={styles.optionsList}>
            {MENU_OPTIONS.map((option, index) => {
              const isPinOption = option.id === 'pin';
              const label = isPinOption && conversation?.isPinned ? 'Unpin' : option.label;
              const icon: IconSymbolName = isPinOption && conversation?.isPinned ? 'pin.slash.fill' : option.icon;

              return (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && { backgroundColor: colors.backgroundTertiary },
                    index < MENU_OPTIONS.length - 1 && styles.optionBorder,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => handleOptionPress(option.id)}
                >
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      option.destructive && { color: '#B85C5C' },
                    ]}
                  >
                    {label}
                  </ThemedText>
                  <IconSymbol
                    name={icon}
                    size={18}
                    color={option.destructive ? '#B85C5C' : colors.textSecondary}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewCard: {
    position: 'absolute',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  optionsList: {
    paddingVertical: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  renameContainer: {
    padding: Spacing.md,
  },
  renameLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  renameInput: {
    fontSize: 16,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  renameButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: BorderRadius.md,
  },
  renameButtonPrimary: {
    backgroundColor: '#ffffff',
  },
  renameButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  confirmButtonDestructive: {
    backgroundColor: '#B85C5C',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
