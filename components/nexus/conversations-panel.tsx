/**
 * Conversations Panel — Nexus Side Panel
 *
 * Universal thread list. Threads are global — NOT mode-scoped.
 * Mode is ambient context, not a partition.
 *
 * Layout:
 *   Header: Avatar + Name + Role
 *   New Thread CTA
 *   Thread List: all threads, most recent first, mode dot is informational only
 *   Footer: Settings · Clear Conversations · About Nexus
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConversationContextMenu } from './conversation-context-menu';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTimestamp } from '@/data/mock-nexus';
import type { Conversation, Mode } from '@/types';

const MODE_DOT_COLORS: Record<Mode, string> = {
  sports: MODE_ACCENT.sports,
  church: MODE_ACCENT.church,
  business: MODE_ACCENT.business,
  education: MODE_ACCENT.education,
  competition: MODE_ACCENT.competition,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.7;

interface ConversationsPanelProps {
  visible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onNewSim?: () => void;
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
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -PANEL_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  // Universal thread list — no mode filtering, all threads visible
  const filtered = useMemo(() => {
    let list = conversations;

    if (searchQuery.length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.lastMessage?.content.toLowerCase().includes(q),
      );
    }

    return list;
  }, [conversations, searchQuery]);

  const handleConversationPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectConversation(id);
  };

  const handleConversationLongPress = (
    conversation: Conversation,
    event: { nativeEvent: { pageX: number; pageY: number } },
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedConversation(conversation);
    setMenuPosition({ x: event.nativeEvent.pageX - 120, y: event.nativeEvent.pageY - 20 });
    setContextMenuVisible(true);
  };

  const handleShare = async (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      try {
        await Share.share({ message: `Check out this conversation: ${conv.title}` });
      } catch {}
    }
  };

  const handleClearConversations = () => {
    Alert.alert(
      'Clear Conversations',
      'This will delete all conversations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            conversations.forEach((c) => onDeleteConversation(c.id));
          },
        },
      ],
    );
  };

  if (!visible) return null;

  const renderThreadRow = (conversation: Conversation) => {
    const isActive = conversation.id === activeConversationId;
    const dotColor = conversation.mode ? MODE_DOT_COLORS[conversation.mode] : colors.textTertiary;
    return (
      <Pressable
        key={conversation.id}
        style={({ pressed }) => [
          styles.threadRow,
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
        {/* Mode dot — informational only, does not restrict access */}
        <View style={[styles.modeDot, { backgroundColor: dotColor }]} />
        <View style={styles.threadContent}>
          <View style={styles.titleRow}>
            <ThemedText
              style={[styles.threadTitle, isActive && { fontWeight: '600' }]}
              numberOfLines={1}
            >
              {conversation.title}
            </ThemedText>
            <ThemedText style={[styles.threadTime, { color: colors.textTertiary }]}>
              {formatTimestamp(conversation.updatedAt)}
            </ThemedText>
          </View>
          {conversation.lastMessage && (
            <ThemedText
              style={[styles.threadPreview, { color: colors.textTertiary }]}
              numberOfLines={1}
            >
              {conversation.lastMessage.content}
            </ThemedText>
          )}
        </View>
      </Pressable>
    );
  };

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
      {/* ── Header: Avatar + Name + Role ── */}
      <Pressable
        style={({ pressed }) => [styles.headerSection, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onAvatarPress}
        accessibilityLabel="Open profile"
        accessibilityRole="button"
      >
        <View style={[styles.avatarCircle, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="person.fill" size={20} color={colors.icon} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={styles.headerName}>Alex Morgan</ThemedText>
          <ThemedText style={[styles.headerRole, { color: colors.textTertiary }]}>
            Primary Admin
          </ThemedText>
        </View>
      </Pressable>

      {/* ── New Thread CTA ── */}
      <Pressable
        style={({ pressed }) => [
          styles.newThreadBtn,
          { backgroundColor: accent, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNewChat();
        }}
      >
        <IconSymbol name="plus" size={16} color="#FFFFFF" />
        <ThemedText style={styles.newThreadText}>New Thread</ThemedText>
      </Pressable>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <View
          style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search threads"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* ── Thread List (universal — all modes) ── */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length > 0 ? (
          filtered.map(renderThreadRow)
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              {searchQuery ? 'No matching threads' : 'No threads yet'}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Section ── */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.bottomRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => { /* Settings placeholder */ }}
        >
          <IconSymbol name="gearshape" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.bottomLabel, { color: colors.textSecondary }]}>
            Settings
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.bottomRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handleClearConversations}
        >
          <IconSymbol name="trash" size={16} color="#FF453A" />
          <ThemedText style={[styles.bottomLabel, { color: '#FF453A' }]}>
            Clear Conversations
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.bottomRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => { /* About Nexus placeholder */ }}
        >
          <IconSymbol name="info.circle" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.bottomLabel, { color: colors.textSecondary }]}>
            About Nexus
          </ThemedText>
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

  // Header
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRole: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },

  // New Thread CTA
  newThreadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  newThreadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Search
  searchRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchContainer: {
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

  // Thread rows
  threadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginVertical: 1,
    gap: 8,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  threadContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  threadTime: {
    fontSize: 11,
  },
  threadPreview: {
    fontSize: 12,
    marginTop: 2,
  },

  // Empty
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Bottom Section
  bottomSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  bottomLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
