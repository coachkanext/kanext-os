/**
 * NexusSidebar — DrawerPanel-backed sidebar.
 *
 * Layout (top → bottom):
 *   Header:   K logo + X close
 *   New Chat: full-width Carbon button
 *   Context:  4 fixed items — Data Room · KaNeXT OS · Athletic Intelligence · Institutional Intelligence
 *   Divider
 *   History:  chat list grouped by Today / Yesterday / This Week / Older  (flex: 1, scrollable)
 *   Divider
 *   Footer:   Settings · Help · Theme toggle  (pinned)
 */

import React, { useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, Platform,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSetThemePreference } from '@/context/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerPanel } from '@/components/ui/drawer-panel';
import { openSettingsPanel } from '@/utils/global-settings-panel';
import type { NexusChatMeta } from '@/services/nexus/nexus-chat-storage';

// ── Constants ─────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NexusSidebarProps {
  isOpen:        boolean;
  onClose:       () => void;
  chats:         NexusChatMeta[];
  currentChatId: string | null;
  onSelectChat:  (chatId: string) => void;
  onDeleteChat:  (chatId: string) => void;
  onRenameChat:  (chatId: string, newTitle: string) => void;
  onStarChat:    (chatId: string) => void;
  onNewChat:     () => void;
}

// ── Date grouping ─────────────────────────────────────────────────────────────

type ChatGroup = { label: string; chats: NexusChatMeta[] };

function groupChatsByDate(chats: NexusChatMeta[]): ChatGroup[] {
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);

  const groups: Record<string, NexusChatMeta[]> = {
    Today: [], Yesterday: [], 'This Week': [], Older: [],
  };

  for (const c of chats) {
    const d   = new Date(c.updatedAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (day >= today.getTime())         groups['Today'].push(c);
    else if (day >= yesterday.getTime()) groups['Yesterday'].push(c);
    else if (day >= weekAgo.getTime())   groups['This Week'].push(c);
    else                                 groups['Older'].push(c);
  }

  return Object.entries(groups)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, chats]) => ({ label, chats }));
}

function formatDate(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NexusSidebar({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onStarChat,
  onNewChat,
}: NexusSidebarProps) {
  const C        = useColors();
  const S        = useMemo(() => makeStyles(C), [C]);
  const insets   = useSafeAreaInsets();
  const scheme   = useColorScheme();
  const setTheme = useSetThemePreference();

  const groups = useMemo(() => groupChatsByDate(chats), [chats]);

  const isDark = scheme === 'dark';

  const handleChatLongPress = (chat: NexusChatMeta) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      chat.title.slice(0, 40),
      undefined,
      [
        {
          text: 'Rename',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Alert.prompt(
                'Rename', 'Enter new title',
                (t) => { if (t?.trim()) onRenameChat(chat.id, t.trim()); },
                'plain-text', chat.title,
              );
            }
          },
        },
        { text: chat.starred ? 'Unstar' : 'Star', onPress: () => onStarChat(chat.id) },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDeleteChat(chat.id);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <DrawerPanel visible={isOpen} onClose={onClose} width={SIDEBAR_WIDTH}>
      <View style={[S.root, { backgroundColor: C.bg }]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={[S.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[S.kLogo, { color: C.label }]}>K</Text>
          <Pressable
            style={({ pressed }) => [S.closeBtn, { opacity: pressed ? 0.5 : 1 }]}
            onPress={onClose}
            hitSlop={12}
          >
            <IconSymbol name="xmark" size={18} color={C.secondary} />
          </Pressable>
        </View>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <View style={[S.divider, { backgroundColor: C.mist }]} />

        {/* ── Chat history ─────────────────────────────────────────────────── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {groups.length === 0 ? (
            <Text style={[S.emptyHint, { color: C.secondary }]}>No conversations yet</Text>
          ) : (
            groups.map(group => (
              <View key={group.label}>
                <Text style={[S.groupLabel, { color: C.secondary }]}>{group.label.toUpperCase()}</Text>
                {group.chats.map(chat => {
                  const isActive = chat.id === currentChatId;
                  return (
                    <Pressable
                      key={chat.id}
                      style={({ pressed }) => [
                        S.chatRow,
                        isActive && { backgroundColor: C.surface },
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelectChat(chat.id); onClose(); }}
                      onLongPress={() => handleChatLongPress(chat)}
                      delayLongPress={400}
                    >
                      <Text style={[S.chatTitle, { color: isActive ? C.label : C.secondary }]} numberOfLines={1}>
                        {chat.title}
                      </Text>
                      <Text style={[S.chatDate, { color: C.secondary }]}>
                        {formatDate(chat.updatedAt)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
          <View style={{ height: 12 }} />
        </ScrollView>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <View style={[S.divider, { backgroundColor: C.mist }]} />

        {/* ── Pinned footer ────────────────────────────────────────────────── */}
        <View style={[S.pinnedFooter, { paddingBottom: insets.bottom + 12 }]}>

          <Pressable
            style={({ pressed }) => [S.footerRow, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => { onClose(); setTimeout(openSettingsPanel, 300); }}
          >
            <IconSymbol name="gearshape.fill" size={16} color={C.secondary} />
            <Text style={[S.footerLabel, { color: C.secondary }]}>Settings</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [S.footerRow, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol name="questionmark.circle.fill" size={16} color={C.secondary} />
            <Text style={[S.footerLabel, { color: C.secondary }]}>Help</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [S.footerRow, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleThemeToggle}
          >
            <IconSymbol
              name={isDark ? 'sun.max.fill' : 'moon.fill'}
              size={16}
              color={C.secondary}
            />
            <Text style={[S.footerLabel, { color: C.secondary }]}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </Pressable>

        </View>

      </View>
    </DrawerPanel>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    root: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    kLogo: {
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    closeBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 16,
      marginVertical: 4,
    },

    groupLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.6,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 4,
    },
    chatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    chatTitle: {
      flex: 1,
      fontSize: 14,
    },
    chatDate: {
      fontSize: 12,
      flexShrink: 0,
    },
    emptyHint: {
      fontSize: 13,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },

    pinnedFooter: {
      paddingTop: 8,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    footerLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
