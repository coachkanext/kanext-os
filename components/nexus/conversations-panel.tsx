/**
 * Conversations Panel — Nexus Side Panel
 * Uses DrawerPanel for slide animation, backdrop, and swipe-to-close.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerPanel } from '@/components/ui/drawer-panel';
import { ConversationContextMenu } from './conversation-context-menu';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import type { Conversation } from '@/types';

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
  const C = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { state: authState } = useAuth();

  const PANEL_WIDTH = Math.min(screenWidth * 0.82, 320);

  const panelBg   = colorScheme === 'dark' ? '#1C1C1E' : C.bg;
  const activeBg  = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const displayName = authState.session?.displayName ?? 'You';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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
      try { await Share.share({ message: `Check out this conversation: ${conv.title}` }); } catch {}
    }
  };

  return (
    <DrawerPanel visible={visible} onClose={onClose} width={PANEL_WIDTH}>
      <View style={[styles.panel, { backgroundColor: panelBg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
        {/* ── Brand ── */}
        <Text style={[styles.brand, { color: C.label }]}>KaNeXT</Text>
        <View style={[styles.brandDivider, { backgroundColor: C.divider }]} />

        {/* ── Nav Tabs (display only) ── */}
        <View style={styles.navContainer}>
          {(
            [
              { label: 'Chats',     icon: 'bubble.left.and.bubble.right' },
              { label: 'Projects',  icon: 'folder'                        },
              { label: 'Artifacts', icon: 'doc.text'                      },
            ] as const
          ).map((tab) => (
            <View key={tab.label} style={styles.navTab}>
              <IconSymbol name={tab.icon as any} size={19} color={C.secondary} />
              <Text style={[styles.navLabel, { color: C.secondary }]}>{tab.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Recents label ── */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>Recents</Text>

        {/* ── Thread List ── */}
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
                    style={[styles.threadTitle, { color: isActive ? C.label : C.secondary, fontWeight: isActive ? '500' : '400' }]}
                    numberOfLines={1}
                  >
                    {conv.title}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: C.muted }]}>No conversations yet</Text>
            </View>
          )}
        </ScrollView>

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
      </View>
    </DrawerPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },

  brand: {
    fontSize: 30,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  brandDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  navContainer: { paddingHorizontal: 8, gap: 2 },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  navLabel: { fontSize: 16 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 6,
  },

  scrollContent: { flex: 1 },
  threadRow: {
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  threadTitle: { fontSize: 15 },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
});
