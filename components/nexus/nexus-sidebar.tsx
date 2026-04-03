/**
 * NexusSidebar — DrawerPanel-backed sidebar modeled on Claude's iOS sidebar.
 *
 * Layout (top → bottom):
 *   Header:  "Nexus" bold title  +  [X] close
 *   Nav:     Chats | Projects | Artifacts (icon + label rows)
 *   Section: "Recents" / "Projects" / "Artifacts" label + separator
 *   Scroll:  content for the active nav view
 *   Bottom:  [SK avatar + name]  ·  [+ FAB]
 *
 * Width: 78% screen — exposes content behind on the right.
 * Animation: DrawerPanel spring slide (handles its own animation).
 * Background: C.bg (fully opaque warm cream).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, Platform,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerPanel } from '@/components/ui/drawer-panel';
import { loadAllChatsWithMessages } from '@/services/nexus/nexus-chat-storage';
import { extractArtifactsFromChats, type NexusArtifact } from '@/services/nexus/nexus-artifact-extractor';
import type { NexusChatMeta, NexusProject } from '@/services/nexus/nexus-chat-storage';

// ── Constants ─────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

// ── Types ─────────────────────────────────────────────────────────────────────

type SidebarView = 'chats' | 'projects' | 'artifacts';

// ── Nav item ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon:     string;
  label:    string;
  isActive: boolean;
  onPress:  () => void;
  C:        ComponentColors;
  S:        ReturnType<typeof makeStyles>;
}

function NavItem({ icon, label, isActive, onPress, C, S }: NavItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        S.navItem,
        isActive && { backgroundColor: C.surfacePressed },
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
      hitSlop={4}
    >
      <IconSymbol name={icon as any} size={20} color={C.label} />
      <Text style={[S.navLabel, { color: C.label }]}>{label}</Text>
    </Pressable>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface NexusSidebarProps {
  isOpen:          boolean;
  onClose:         () => void;
  chats:           NexusChatMeta[];
  projects:        NexusProject[];
  currentChatId:   string | null;
  onSelectChat:    (chatId: string) => void;
  onDeleteChat:    (chatId: string) => void;
  onRenameChat:    (chatId: string, newTitle: string) => void;
  onStarChat:      (chatId: string) => void;
  onNewChat:       () => void;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (name: string) => void;
  onOpenArtifact:  (artifact: NexusArtifact) => void;
  activeProjectId: string | null;
}

export function NexusSidebar({
  isOpen,
  onClose,
  chats,
  projects,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onStarChat,
  onNewChat,
  onSelectProject,
  onCreateProject,
  onOpenArtifact,
}: NexusSidebarProps) {
  const C      = useColors();
  const S      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [activeView, setActiveView]           = useState<SidebarView>('chats');
  const [artifacts, setArtifacts]             = useState<NexusArtifact[]>([]);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifactsLoaded, setArtifactsLoaded]   = useState(false);

  // ── Artifacts lazy load ────────────────────────────────────────────────────

  const switchToArtifacts = async () => {
    setActiveView('artifacts');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!artifactsLoaded && !artifactsLoading) {
      setArtifactsLoading(true);
      try {
        const full = await loadAllChatsWithMessages();
        setArtifacts(extractArtifactsFromChats(full));
        setArtifactsLoaded(true);
      } finally {
        setArtifactsLoading(false);
      }
    }
  };

  // ── Chat long-press actions ────────────────────────────────────────────────

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
                'Rename',
                'Enter new title',
                (newTitle) => { if (newTitle?.trim()) onRenameChat(chat.id, newTitle.trim()); },
                'plain-text',
                chat.title,
              );
            }
          },
        },
        {
          text: chat.starred ? 'Unstar' : 'Star',
          onPress: () => onStarChat(chat.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDeleteChat(chat.id);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  // ── Create project ─────────────────────────────────────────────────────────

  const handleCreateProject = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'New Project',
        'Enter a name for this project',
        (name) => {
          if (name?.trim()) {
            onCreateProject(name.trim());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
        'plain-text',
        '',
      );
    } else {
      onCreateProject('New Project');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // ── Section label ──────────────────────────────────────────────────────────

  const sectionLabel =
    activeView === 'chats'     ? 'Recents'   :
    activeView === 'projects'  ? 'Projects'  : 'Artifacts';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DrawerPanel visible={isOpen} onClose={onClose} width={SIDEBAR_WIDTH}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={[S.header, { paddingTop: insets.top + 12 }]}>
          <Text style={[S.headerTitle, { color: C.label }]}>Nexus</Text>
          <Pressable
            style={({ pressed }) => [S.closeBtn, { opacity: pressed ? 0.5 : 1 }]}
            onPress={onClose}
            hitSlop={12}
          >
            <IconSymbol name="xmark" size={18} color={C.secondary} />
          </Pressable>
        </View>

        {/* ── Nav items ────────────────────────────────────────────────────── */}
        <View style={S.nav}>
          <NavItem
            icon="bubble.left.and.bubble.right"
            label="Chats"
            isActive={activeView === 'chats'}
            onPress={() => { setActiveView('chats'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            C={C} S={S}
          />
          <NavItem
            icon="folder"
            label="Projects"
            isActive={activeView === 'projects'}
            onPress={() => { setActiveView('projects'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            C={C} S={S}
          />
          <NavItem
            icon="sparkles"
            label="Artifacts"
            isActive={activeView === 'artifacts'}
            onPress={switchToArtifacts}
            C={C} S={S}
          />
        </View>

        {/* ── Section label + separator ─────────────────────────────────────── */}
        <Text style={[S.sectionLabel, { color: C.muted }]}>{sectionLabel}</Text>
        <View style={[S.separator, { backgroundColor: C.separator }]} />

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CHATS view */}
          {activeView === 'chats' && (
            <>
              {chats.length === 0 ? (
                <Text style={[S.emptyHint, { color: C.muted }]}>No conversations yet</Text>
              ) : (
                chats.map(chat => (
                  <Pressable
                    key={chat.id}
                    style={({ pressed }) => [
                      S.chatRow,
                      chat.id === currentChatId && S.chatRowActive,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSelectChat(chat.id);
                      onClose();
                    }}
                    onLongPress={() => handleChatLongPress(chat)}
                    delayLongPress={400}
                  >
                    {chat.id === currentChatId && (
                      <View style={[S.activeLine, { backgroundColor: C.accent }]} />
                    )}
                    <Text
                      style={[
                        S.chatTitle,
                        { color: chat.id === currentChatId ? C.accent : C.label },
                        chat.id === currentChatId && { fontWeight: '500' },
                      ]}
                      numberOfLines={1}
                    >
                      {chat.title}
                    </Text>
                  </Pressable>
                ))
              )}
            </>
          )}

          {/* PROJECTS view */}
          {activeView === 'projects' && (
            <>
              {projects.length === 0 ? (
                <Text style={[S.emptyHint, { color: C.muted }]}>No projects yet</Text>
              ) : (
                projects.map(project => (
                  <Pressable
                    key={project.id}
                    style={({ pressed }) => [S.chatRow, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSelectProject(project.id);
                      setActiveView('chats');
                    }}
                  >
                    <IconSymbol name="folder" size={16} color={C.muted} />
                    <Text style={[S.chatTitle, { color: C.label, marginLeft: 12 }]} numberOfLines={1}>
                      {project.name}
                    </Text>
                    {(project.chatIds?.length ?? 0) > 0 && (
                      <Text style={[S.chatCount, { color: C.muted }]}>
                        {project.chatIds!.length}
                      </Text>
                    )}
                  </Pressable>
                ))
              )}
              <Pressable
                style={({ pressed }) => [S.createRow, { opacity: pressed ? 0.6 : 1 }]}
                onPress={handleCreateProject}
              >
                <IconSymbol name="plus" size={14} color={C.accent} />
                <Text style={[S.createLabel, { color: C.accent }]}>Create Project</Text>
              </Pressable>
            </>
          )}

          {/* ARTIFACTS view */}
          {activeView === 'artifacts' && (
            <>
              {artifactsLoading && (
                <Text style={[S.emptyHint, { color: C.muted }]}>Loading…</Text>
              )}
              {!artifactsLoading && artifacts.length === 0 && (
                <Text style={[S.emptyHint, { color: C.muted }]}>No artifacts yet</Text>
              )}
              {!artifactsLoading && artifacts.map(artifact => (
                <Pressable
                  key={artifact.id}
                  style={({ pressed }) => [S.artifactRow, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onOpenArtifact(artifact);
                  }}
                >
                  <View style={[S.langBadge, { backgroundColor: C.surfacePressed }]}>
                    <Text style={[S.langText, { color: C.secondary }]}>
                      {(artifact.language ?? artifact.type).toUpperCase().slice(0, 4)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.chatTitle, { color: C.label }]} numberOfLines={1}>
                      {artifact.title}
                    </Text>
                    {artifact.chatTitle && (
                      <Text style={[S.artifactSource, { color: C.muted }]} numberOfLines={1}>
                        {artifact.chatTitle}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </>
          )}
        </ScrollView>

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <View
          style={[
            S.bottomBar,
            { borderTopColor: C.separator, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Avatar + name */}
          <View style={S.userInfo}>
            <View style={[S.avatar, { backgroundColor: C.surface }]}>
              <Text style={[S.avatarText, { color: C.label }]}>SK</Text>
            </View>
            <Text style={[S.userName, { color: C.label }]} numberOfLines={1}>
              Sammy Kalejaiye
            </Text>
          </View>

          {/* New Chat FAB */}
          <Pressable
            style={({ pressed }) => [
              S.fab,
              { backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onNewChat();
              onClose();
            }}
          >
            <IconSymbol name="plus" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>
    </DrawerPanel>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 30,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    closeBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Nav
    nav: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
      gap: 2,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 12,
      paddingVertical: 13,
      borderRadius: 10,
      minHeight: 48,
    },
    navLabel: {
      fontSize: 17,
    },

    // Section label + separator
    sectionLabel: {
      fontSize: 14,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 20,
      marginBottom: 4,
    },

    // Chat rows (Recents)
    chatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 0,
      minHeight: 48,
    },
    chatRowActive: {
      backgroundColor: C.surfacePressed,
    },
    activeLine: {
      position: 'absolute',
      left: 0,
      top: 8,
      bottom: 8,
      width: 3,
      borderRadius: 2,
    },
    chatTitle: {
      flex: 1,
      fontSize: 16,
    },
    chatCount: {
      fontSize: 13,
      marginLeft: 8,
    },

    // Empty hint
    emptyHint: {
      fontSize: 14,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },

    // Projects
    createRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    createLabel: {
      fontSize: 15,
    },

    // Artifacts
    artifactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      minHeight: 52,
    },
    langBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 5,
    },
    langText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    artifactSource: {
      fontSize: 12,
      marginTop: 1,
    },

    // Bottom bar
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '600',
    },
    userName: {
      fontSize: 14,
      flex: 1,
    },
    fab: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
  });
