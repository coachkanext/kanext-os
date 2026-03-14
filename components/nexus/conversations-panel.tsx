/**
 * Conversations Panel — Nexus Side Panel
 *
 * Spec layout (top → bottom):
 *   1. "KaNeXT" brand (18px 700)
 *   2. Nav tabs: Chats / Projects / Artifacts (with count badges)
 *   3. Divider
 *   4. "RECENT" section label
 *   5. Thread rows (title only, 13px 500)
 *   6. Bottom bar: avatar + name + compose circle
 *
 * Width: 280px. Background: #F8F8F8 (light) / #1C1C1E (dark).
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Share,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConversationContextMenu } from './conversation-context-menu';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Conversation } from '@/types';

const PANEL_WIDTH = 280;

export type SidebarNav = 'chats' | 'projects' | 'artifacts';

const NAV_TABS: Array<{ key: SidebarNav; label: string; icon: string; badge: number | null }> = [
  { key: 'chats',     label: 'Chats',     icon: 'bubble.left.and.bubble.right', badge: null },
  { key: 'projects',  label: 'Projects',  icon: 'folder',                        badge: 5    },
  { key: 'artifacts', label: 'Artifacts', icon: 'doc.text',                      badge: 9    },
];

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
  activeNav?: SidebarNav;
  onNavSelect?: (nav: SidebarNav) => void;
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
  activeNav = 'chats',
  onNavSelect,
}: ConversationsPanelProps) {
  const C = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const panelBg    = colorScheme === 'dark' ? '#1C1C1E' : '#F8F8F8';
  const activeBg   = 'rgba(0,0,0,0.06)';
  const borderColor = 'rgba(0,0,0,0.06)';

  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

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

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          backgroundColor: panelBg,
          paddingTop: insets.top,
          bottom: (insets.bottom || 0) + 72,
          borderRightColor: borderColor,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* ── 1. Brand ── */}
      <Text style={[styles.brand, { color: C.label }]}>KaNeXT</Text>

      {/* ── 2. Nav Tabs ── */}
      <View style={styles.navContainer}>
        {NAV_TABS.map((tab) => {
          const isActive = activeNav === tab.key;
          const badge = tab.key === 'chats' ? conversations.length : tab.badge;
          return (
            <Pressable
              key={tab.key}
              style={({ pressed }) => [
                styles.navTab,
                { backgroundColor: isActive || pressed ? activeBg : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavSelect?.(tab.key);
                onClose();
              }}
            >
              <IconSymbol
                name={tab.icon as any}
                size={18}
                color={isActive ? C.label : C.secondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: isActive ? C.label : C.secondary,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {badge != null && badge > 0 && (
                <View style={[styles.navBadge, { backgroundColor: activeBg }]}>
                  <Text style={[styles.navBadgeText, { color: C.muted }]}>{badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── 3. Divider ── */}
      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      {/* ── 4. RECENT label ── */}
      <Text style={[styles.sectionLabel, { color: C.muted }]}>RECENT</Text>

      {/* ── 5. Thread List ── */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <Pressable
                key={conv.id}
                style={({ pressed }) => [
                  styles.threadRow,
                  { backgroundColor: isActive || pressed ? activeBg : 'transparent' },
                ]}
                onPress={() => handleConversationPress(conv.id)}
                onLongPress={(event) => handleConversationLongPress(conv, event)}
                delayLongPress={300}
              >
                <Text
                  style={[
                    styles.threadTitle,
                    {
                      color: C.label,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {conv.title}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: C.muted }]}>No threads yet</Text>
          </View>
        )}
      </ScrollView>

      {/* ── 6. Bottom Bar ── */}
      <View style={[styles.bottomBar, { borderTopColor: borderColor }]}>
        <Pressable
          style={styles.bottomLeft}
          onPress={onAvatarPress}
          accessibilityLabel="Open profile"
        >
          <View style={[styles.avatar, { backgroundColor: activeBg }]}>
            <Text style={[styles.avatarInitials, { color: C.label }]}>A</Text>
          </View>
          <Text style={[styles.bottomName, { color: C.label }]} numberOfLines={1}>
            Alex Morgan
          </Text>
        </Pressable>
        <Pressable
          style={styles.composeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNewChat();
            onClose();
          }}
          accessibilityLabel="New chat"
        >
          <IconSymbol name="square.and.pencil" size={16} color="#FFFFFF" />
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
    width: PANEL_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    zIndex: 50,
  },

  // 1. Brand
  brand: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // 2. Nav tabs
  navContainer: {
    paddingHorizontal: 8,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
  },
  navBadge: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  navBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // 3. Divider
  divider: {
    height: 1,
    marginHorizontal: 12,
    marginVertical: 6,
  },

  // 4. Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },

  // 5. Thread list
  scrollContent: { flex: 1 },
  threadRow: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  threadTitle: { fontSize: 13 },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, fontStyle: 'italic' },

  // 6. Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  composeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
