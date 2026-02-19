/**
 * Conversations Panel Component
 * Left slide-in drawer with mode filter pills, search, pinned section,
 * workspace collapsibles, and recent conversations.
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConversationContextMenu } from './conversation-context-menu';
import { WorkspaceCard } from './workspace-card';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTimestamp } from '@/data/mock-nexus';
import { MOCK_NEXUS_WORKSPACES } from '@/data/mock-nexus-v2';
import type { Conversation, Mode } from '@/types';
import type { NexusWorkspace } from '@/types/nexus-v2';

const MODE_FILTER_PILLS: Array<{ key: Mode | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'sports', label: 'Sports' },
  { key: 'church', label: 'Church' },
  { key: 'business', label: 'Business' },
  { key: 'education', label: 'Education' },
  { key: 'competition', label: 'Comp' },
];

const MODE_DOT_COLORS: Record<Mode, string> = {
  sports: '#3B82F6',
  church: '#A855F7',
  business: '#10B981',
  education: '#F59E0B',
  competition: '#EF4444',
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
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Filter state
  const [modeFilter, setModeFilter] = useState<Mode | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Set<string>>(new Set());

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -PANEL_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  // Filter and group conversations
  const filtered = useMemo(() => {
    let list = conversations;

    // Search filter
    if (searchQuery.length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.lastMessage?.content.toLowerCase().includes(q),
      );
    }

    // Mode filter (does NOT affect pinned — pinned always visible)
    if (modeFilter !== 'all') {
      list = list.filter((c) => c.isPinned || c.mode === modeFilter);
    }

    return list;
  }, [conversations, searchQuery, modeFilter]);

  const pinned = useMemo(() => filtered.filter((c) => c.isPinned), [filtered]);
  const recent = useMemo(
    () => filtered.filter((c) => !c.isPinned && c.lastMessage),
    [filtered],
  );

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

  const toggleWorkspace = (id: string) => {
    setCollapsedWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!visible) return null;

  const renderConversationRow = (conversation: Conversation) => {
    const isActive = conversation.id === activeConversationId;
    const dotColor = conversation.mode ? MODE_DOT_COLORS[conversation.mode] : colors.textTertiary;
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
        {/* Mode dot */}
        <View style={[styles.modeDot, { backgroundColor: dotColor }]} />
        <View style={styles.conversationContent}>
          <View style={styles.titleRow}>
            <ThemedText
              style={[styles.conversationTitle, isActive && { fontWeight: '600' }]}
              numberOfLines={1}
            >
              {conversation.isPinned ? '📌 ' : ''}{conversation.title}
            </ThemedText>
            <ThemedText style={[styles.conversationTime, { color: colors.textTertiary }]}>
              {formatTimestamp(conversation.updatedAt)}
            </ThemedText>
          </View>
          {conversation.workspace && (
            <ThemedText
              style={[styles.workspaceTag, { color: colors.textTertiary }]}
              numberOfLines={1}
            >
              {conversation.workspace}
            </ThemedText>
          )}
          {conversation.lastMessage && (
            <ThemedText
              style={[styles.conversationPreview, { color: colors.textTertiary }]}
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
      {/* Mode Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modePillsRow}
        style={styles.modePillsScroll}
      >
        {MODE_FILTER_PILLS.map((pill) => {
          const isActive = modeFilter === pill.key;
          const bg = isActive
            ? pill.key === 'all'
              ? colors.text
              : ModeColors[pill.key as Mode]?.primary ?? colors.text
            : 'transparent';
          const fg = isActive ? colors.background : colors.textSecondary;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.modePill,
                { backgroundColor: bg, borderColor: isActive ? bg : colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModeFilter(pill.key);
              }}
            >
              <ThemedText style={[styles.modePillText, { color: fg }]}>
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar (always visible) */}
      <View style={styles.searchRow}>
        <View
          style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* + New Workspace */}
      <Pressable
        style={({ pressed }) => [
          styles.newWorkspaceBtn,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNewChat();
        }}
      >
        <IconSymbol name="plus" size={16} color={colors.tint} />
        <ThemedText style={[styles.newWorkspaceText, { color: colors.tint }]}>
          New Workspace
        </ThemedText>
      </Pressable>

      {/* Conversation List */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pinned Section (always visible) */}
        {pinned.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              Pinned
            </ThemedText>
            {pinned.map(renderConversationRow)}
          </View>
        )}

        {/* Workspaces as collapsible sections */}
        {MOCK_NEXUS_WORKSPACES.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              Workspaces
            </ThemedText>
            {MOCK_NEXUS_WORKSPACES.map((ws) => {
              const isCollapsed = collapsedWorkspaces.has(ws.id);
              return (
                <View key={ws.id}>
                  <Pressable
                    style={styles.workspaceHeader}
                    onPress={() => toggleWorkspace(ws.id)}
                  >
                    <IconSymbol
                      name={isCollapsed ? 'chevron.right' : 'chevron.down'}
                      size={12}
                      color={colors.textTertiary}
                    />
                    <ThemedText style={[styles.workspaceName, { color: colors.text }]}>
                      {ws.name}
                    </ThemedText>
                    <ThemedText style={[styles.workspaceCount, { color: colors.textTertiary }]}>
                      {ws.thread_ids.length}
                    </ThemedText>
                  </Pressable>
                  {!isCollapsed && (
                    <WorkspaceCard
                      workspace={ws}
                      onPress={(w: NexusWorkspace) => {
                        if (w.thread_ids.length > 0) {
                          onSelectConversation(w.thread_ids[0]);
                        }
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Section */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              Recent
            </ThemedText>
            {recent.map(renderConversationRow)}
          </View>
        )}
      </ScrollView>

      {/* Footer - Avatar, Name */}
      <View style={[styles.footer, { marginBottom: Spacing.sm }]}>
        <Pressable
          style={({ pressed }) => [styles.userRow, { opacity: pressed ? 0.7 : 1 }]}
          onPress={onAvatarPress}
          accessibilityLabel="Open profile"
          accessibilityRole="button"
        >
          <View style={[styles.avatarButton, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="person.fill" size={18} color={colors.icon} />
          </View>
          <ThemedText style={styles.userName}>Sammy Kalejaiye</ThemedText>
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

  // Mode filter pills
  modePillsScroll: {
    flexGrow: 0,
    paddingTop: Spacing.sm,
  },
  modePillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  modePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Search
  searchRow: {
    paddingHorizontal: Spacing.sm,
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

  // New workspace
  newWorkspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  newWorkspaceText: {
    fontSize: 14,
    fontWeight: '600',
  },

  scrollContent: {
    flex: 1,
  },

  // Sections
  section: {
    paddingTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },

  // Workspaces
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  workspaceName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  workspaceCount: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Conversation rows
  conversationRow: {
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
  conversationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 11,
  },
  workspaceTag: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  conversationPreview: {
    fontSize: 12,
    marginTop: 2,
  },

  // Footer
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
});
