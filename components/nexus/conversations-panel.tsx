/**
 * Conversations Panel Component
 * Left slide-in drawer showing the list of Nexus conversations.
 * ChatGPT-style layout with new conversation options and recent history.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ConversationContextMenu } from './conversation-context-menu';
import { Colors, Spacing, BorderRadius, Brand, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTimestamp } from '@/data/mock-nexus';
import type { Conversation } from '@/types';

interface ConversationOption {
  type: 'sim';
  label: string;
  icon: IconSymbolName;
  color: string;
}

const CONVERSATION_OPTIONS: ConversationOption[] = [
  {
    type: 'sim',
    label: 'Game Simulation',
    icon: 'chart.bar.fill',
    color: ModeColors.sports.primary,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.7;

interface ConversationsPanelProps {
  visible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onNewSim: () => void;
  onAvatarPress: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onPinConversation: (id: string) => void;
  onUnpinConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onArchiveConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationsPanel({
  visible,
  onClose,
  onNewChat,
  onNewSim,
  onAvatarPress,
  conversations,
  activeConversationId,
  onSelectConversation,
  onPinConversation,
  onUnpinConversation,
  onRenameConversation,
  onArchiveConversation,
  onDeleteConversation,
}: ConversationsPanelProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -PANEL_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const handleSimPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNewSim();
  };

  const handleNewChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNewChat();
  };

  const handleConversationPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectConversation(id);
  };

  const handleConversationLongPress = (conversation: Conversation, event: { nativeEvent: { pageX: number; pageY: number } }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedConversation(conversation);
    setMenuPosition({ x: event.nativeEvent.pageX - 120, y: event.nativeEvent.pageY - 20 });
    setContextMenuVisible(true);
  };

  const handleShare = async (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      try {
        await Share.share({
          message: `Check out this conversation: ${conversation.title}`,
        });
      } catch (error) {
        console.log('Share error:', error);
      }
    }
  };

  // Don't render when fully hidden
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          width: PANEL_WIDTH,
          backgroundColor: colors.background,
          paddingTop: insets.top,
          borderRightColor: colors.border,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Search Bar */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* New Conversation Options */}
        <View style={styles.optionsContainer}>
          {CONVERSATION_OPTIONS.map((option) => (
            <Pressable
              key={option.type}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  backgroundColor: pressed
                    ? colors.backgroundSecondary
                    : 'transparent',
                },
              ]}
              onPress={handleSimPress}
            >
              <View style={[styles.optionAvatar, { backgroundColor: option.color }]}>
                <IconSymbol name={option.icon} size={18} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Recent Conversations - always show section, only list convos with messages */}
        <View style={styles.recentSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            Recent
          </ThemedText>
          {conversations.filter((c) => c.lastMessage).map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              return (
                <Pressable
                  key={conversation.id}
                  style={({ pressed }) => [
                    styles.conversationRow,
                    {
                      backgroundColor: isActive
                        ? colors.backgroundSecondary
                        : pressed
                        ? colors.backgroundSecondary
                        : 'transparent',
                    },
                  ]}
                  onPress={() => handleConversationPress(conversation.id)}
                  onLongPress={(event) => handleConversationLongPress(conversation, event)}
                  delayLongPress={300}
                >
                  <IconSymbol
                    name={conversation.isPinned ? 'pin.fill' : 'text.bubble'}
                    size={16}
                    color={conversation.isPinned ? colors.text : colors.textSecondary}
                    style={styles.conversationIcon}
                  />
                  <View style={styles.conversationContent}>
                    <ThemedText
                      style={[styles.conversationTitle, isActive && { fontWeight: '600' }]}
                      numberOfLines={1}
                    >
                      {conversation.title}
                    </ThemedText>
                    {conversation.lastMessage && (
                      <ThemedText
                        style={[styles.conversationPreview, { color: colors.textTertiary }]}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage.content}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={[styles.conversationTime, { color: colors.textTertiary }]}>
                    {formatTimestamp(conversation.updatedAt)}
                  </ThemedText>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>

      {/* Footer - Avatar, Name, and New Chat */}
      <View style={[styles.footer, { marginBottom: Spacing.sm }]}>
        <Pressable
          style={({ pressed }) => [
            styles.userRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onAvatarPress}
          accessibilityLabel="Open profile"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.avatarButton,
              { backgroundColor: colors.backgroundTertiary },
            ]}
          >
            <IconSymbol name="person.fill" size={18} color={colors.icon} />
          </View>
          <ThemedText style={styles.userName}>Sammy Kalejaiye</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.newChatButton,
            { backgroundColor: Brand.nexus, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleNewChatPress}
          accessibilityLabel="Start new conversation"
          accessibilityRole="button"
        >
          <IconSymbol name="plus" size={20} color="#000000" />
        </Pressable>
      </View>

      {/* Context Menu */}
      <ConversationContextMenu
        visible={contextMenuVisible}
        conversation={selectedConversation}
        position={menuPosition}
        onClose={() => setContextMenuVisible(false)}
        onPin={onPinConversation}
        onUnpin={onUnpinConversation}
        onRename={onRenameConversation}
        onArchive={onArchiveConversation}
        onDelete={onDeleteConversation}
        onShare={handleShare}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: Spacing.xs,
    paddingVertical: 0,
  },
  scrollContent: {
    flex: 1,
  },
  optionsContainer: {
    paddingTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginVertical: 1,
  },
  optionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginVertical: 1,
  },
  conversationIcon: {
    marginRight: Spacing.sm,
  },
  conversationContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  conversationPreview: {
    fontSize: 12,
    marginTop: 2,
  },
  conversationTime: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
