/**
 * NexusSidebar (Dipson) — DrawerPanel-backed sidebar.
 *
 * Layout (top → bottom):
 *   Header:  "Dipson" wordmark  +  [X] close
 *   New Chat: full-width Carbon button
 *   Chats:   collapsible — general/untagged chats
 *   Data Room: collapsible — data-room tagged chats
 *   Athletic Intelligence: collapsible — sport groups + sport-tagged chats inline
 *   Institutional Intelligence: collapsible — domain groups + domain-tagged chats inline
 *   Footer:  Sign In · Request Access (Drift text)
 *
 * Width: 78% screen — exposes content behind on the right.
 * Animation: DrawerPanel spring slide (handles its own animation).
 * Background: C.bg (fully opaque warm cream).
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, Platform,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerPanel } from '@/components/ui/drawer-panel';
import type { NexusChatMeta } from '@/services/nexus/nexus-chat-storage';

// ── Constants ─────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

// ── Types ─────────────────────────────────────────────────────────────────────

export type DipsonSection =
  | 'general'
  | 'data-room'
  | 'basketball' | 'football' | 'mens-basketball' | 'womens-basketball'
  | 'mens-soccer' | 'womens-soccer' | 'baseball' | 'softball'
  | 'mens-volleyball' | 'womens-volleyball' | 'flag-football'
  | 'mens-golf' | 'womens-golf' | 'mens-track' | 'womens-track'
  | 'beach-volleyball' | 'cheer'
  | 'admissions' | 'hiring' | 'student-success'
  | 'sales-revenue' | 'financial' | 'fundraising'
  | 'operations' | 'marketing' | 'compliance' | 'curriculum'
  | 'real-estate' | 'acquisition';

export interface NexusSidebarProps {
  isOpen:          boolean;
  onClose:         () => void;
  chats:           NexusChatMeta[];
  currentChatId:   string | null;
  activeSection:   DipsonSection | null;
  onSectionChange: (section: DipsonSection | null) => void;
  onSelectChat:    (chatId: string) => void;
  onDeleteChat:    (chatId: string) => void;
  onRenameChat:    (chatId: string, newTitle: string) => void;
  onStarChat:      (chatId: string) => void;
  onNewChat:       () => void;
}

// ── Sport/domain definitions ──────────────────────────────────────────────────

interface SectionItem {
  key:   DipsonSection;
  label: string;
}

interface SectionGroup {
  groupLabel: string;
  items:      SectionItem[];
}

const ATHLETIC_GROUPS: SectionGroup[] = [
  {
    groupLabel: 'TEAM SPORTS',
    items: [
      { key: 'baseball',          label: 'Baseball'                },
      { key: 'football',          label: 'Football'                },
      { key: 'mens-basketball',   label: "Men's Basketball"        },
      { key: 'mens-soccer',       label: "Men's Soccer"            },
      { key: 'mens-volleyball',   label: "Men's Volleyball"        },
      { key: 'softball',          label: 'Softball'                },
      { key: 'womens-basketball', label: "Women's Basketball"      },
      { key: 'flag-football',     label: "Women's Flag Football"   },
      { key: 'womens-soccer',     label: "Women's Soccer"          },
      { key: 'womens-volleyball', label: "Women's Volleyball"      },
    ],
  },
  {
    groupLabel: 'INDIVIDUAL SPORTS',
    items: [
      { key: 'beach-volleyball', label: 'Beach Volleyball'         },
      { key: 'mens-golf',        label: "Men's Golf"              },
      { key: 'mens-track',       label: "Men's Track & Field"     },
      { key: 'womens-golf',      label: "Women's Golf"            },
      { key: 'womens-track',     label: "Women's Track & Field"   },
    ],
  },
  {
    groupLabel: 'PERFORMANCE SPORTS',
    items: [
      { key: 'cheer', label: 'Cheer' },
    ],
  },
];

const INSTITUTIONAL_GROUPS: SectionGroup[] = [
  {
    groupLabel: 'PEOPLE INTELLIGENCE',
    items: [
      { key: 'admissions',     label: 'Admissions'     },
      { key: 'hiring',         label: 'Hiring'         },
      { key: 'student-success', label: 'Student Success' },
    ],
  },
  {
    groupLabel: 'MONEY INTELLIGENCE',
    items: [
      { key: 'sales-revenue', label: 'Sales Revenue'          },
      { key: 'financial',     label: 'Financial'               },
      { key: 'fundraising',   label: 'Fundraising/Development' },
    ],
  },
  {
    groupLabel: 'OPERATIONS',
    items: [
      { key: 'operations', label: 'Operations' },
      { key: 'marketing',  label: 'Marketing'  },
      { key: 'compliance', label: 'Compliance' },
      { key: 'curriculum', label: 'Curriculum' },
    ],
  },
  {
    groupLabel: 'ASSETS INTELLIGENCE',
    items: [
      { key: 'real-estate', label: 'Real Estate' },
      { key: 'acquisition', label: 'Acquisition' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const isSameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    ...(isSameYear ? {} : { year: 'numeric' }),
  });
}

function chatsForSection(
  chats:   NexusChatMeta[],
  section: string | null,
): NexusChatMeta[] {
  if (section === null || section === 'general') {
    return chats.filter(
      c => !c.section || c.section === 'general'
    );
  }
  return chats.filter(c => c.section === section);
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface ChatRowProps {
  chat:          NexusChatMeta;
  currentChatId: string | null;
  onSelect:      (id: string) => void;
  onClose:       () => void;
  onLongPress:   (chat: NexusChatMeta) => void;
  C:             ComponentColors;
  S:             ReturnType<typeof makeStyles>;
  indented?:     boolean;
}

function ChatRow({
  chat, currentChatId, onSelect, onClose, onLongPress, C, S, indented,
}: ChatRowProps) {
  const isActive = chat.id === currentChatId;
  return (
    <Pressable
      style={({ pressed }) => [
        S.chatRow,
        indented && S.chatRowIndented,
        isActive && { backgroundColor: C.surface },
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(chat.id);
        onClose();
      }}
      onLongPress={() => onLongPress(chat)}
      delayLongPress={400}
    >
      <Text
        style={[S.chatTitle, { color: isActive ? C.label : C.secondary }]}
        numberOfLines={1}
      >
        {chat.title}
      </Text>
      <Text style={[S.chatDate, { color: C.secondary }]}>
        {formatDate(chat.updatedAt)}
      </Text>
    </Pressable>
  );
}

interface CollapsibleHeaderProps {
  label:    string;
  expanded: boolean;
  onPress:  () => void;
  C:        ComponentColors;
  S:        ReturnType<typeof makeStyles>;
}

function CollapsibleHeader({ label, expanded, onPress, C, S }: CollapsibleHeaderProps) {
  return (
    <Pressable
      style={({ pressed }) => [S.sectionHeader, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <IconSymbol
        name={expanded ? 'chevron.down' : 'chevron.right'}
        size={12}
        color={C.secondary}
      />
      <Text style={[S.sectionHeaderText, { color: C.label }]}>{label}</Text>
    </Pressable>
  );
}

interface GroupLabelProps {
  label: string;
  C:     ComponentColors;
  S:     ReturnType<typeof makeStyles>;
}

function GroupLabel({ label, C, S }: GroupLabelProps) {
  return (
    <Text style={[S.groupLabel, { color: C.secondary }]}>{label}</Text>
  );
}

interface SectionRowProps {
  item:          SectionItem;
  activeSection: DipsonSection | null;
  onPress:       (key: DipsonSection) => void;
  C:             ComponentColors;
  S:             ReturnType<typeof makeStyles>;
  // Chats that belong to this section (shown inline when active)
  chats:           NexusChatMeta[];
  currentChatId:   string | null;
  onSelectChat:    (id: string) => void;
  onClose:         () => void;
  onLongPress:     (chat: NexusChatMeta) => void;
}

function SectionRow({
  item, activeSection, onPress, C, S,
  chats, currentChatId, onSelectChat, onClose, onLongPress,
}: SectionRowProps) {
  const isActive = activeSection === item.key;
  const sectionChats = chatsForSection(chats, item.key);
  return (
    <>
      <Pressable
        style={({ pressed }) => [
          S.sportRow,
          isActive && { backgroundColor: C.surface },
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(item.key);
        }}
      >
        <Text style={[S.sportLabel, { color: isActive ? C.label : C.secondary }]}>
          {item.label}
        </Text>
        {isActive && (
          <IconSymbol name="checkmark" size={12} color={C.label} style={{ marginLeft: 'auto' }} />
        )}
      </Pressable>
      {/* Inline chats for this section when active */}
      {isActive && sectionChats.map(chat => (
        <ChatRow
          key={chat.id}
          chat={chat}
          currentChatId={currentChatId}
          onSelect={onSelectChat}
          onClose={onClose}
          onLongPress={onLongPress}
          C={C}
          S={S}
          indented
        />
      ))}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NexusSidebar({
  isOpen,
  onClose,
  chats,
  currentChatId,
  activeSection,
  onSectionChange,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onStarChat,
  onNewChat,
}: NexusSidebarProps) {
  const C      = useColors();
  const S      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [chatsExpanded,       setChatsExpanded]       = useState(true);
  const [dataRoomExpanded,    setDataRoomExpanded]     = useState(false);
  const [athleticsExpanded,   setAthleticsExpanded]   = useState(false);
  const [institutionalExpanded, setInstitutionalExpanded] = useState(false);

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

  // ── Derived data ───────────────────────────────────────────────────────────

  const generalChats  = useMemo(() => chatsForSection(chats, null),        [chats]);
  const dataRoomChats = useMemo(() => chatsForSection(chats, 'data-room'), [chats]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DrawerPanel visible={isOpen} onClose={onClose} width={SIDEBAR_WIDTH}>
      <View style={[S.root, { backgroundColor: C.bg }]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={[S.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[S.wordmark, { color: C.label }]}>Dipson</Text>
          <Pressable
            style={({ pressed }) => [S.closeBtn, { opacity: pressed ? 0.5 : 1 }]}
            onPress={onClose}
            hitSlop={12}
          >
            <IconSymbol name="xmark" size={18} color={C.secondary} />
          </Pressable>
        </View>

        {/* ── New Chat button ──────────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [S.newChatBtn, { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => { onNewChat(); onClose(); }}
        >
          <IconSymbol name="plus" size={16} color={C.bg} />
          <Text style={[S.newChatText, { color: C.bg }]}>New Chat</Text>
        </Pressable>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Chats section ─────────────────────────────────────────────── */}
          <CollapsibleHeader
            label="Chats"
            expanded={chatsExpanded}
            onPress={() => {
              setChatsExpanded(v => !v);
              if (!chatsExpanded) onSectionChange(null);
            }}
            C={C} S={S}
          />
          {chatsExpanded && (
            <>
              {generalChats.length === 0 ? (
                <Text style={[S.emptyHint, { color: C.secondary }]}>No conversations yet</Text>
              ) : (
                generalChats.map(chat => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    currentChatId={currentChatId}
                    onSelect={onSelectChat}
                    onClose={onClose}
                    onLongPress={handleChatLongPress}
                    C={C} S={S}
                  />
                ))
              )}
            </>
          )}

          {/* ── Data Room section ──────────────────────────────────────────── */}
          <CollapsibleHeader
            label="Data Room"
            expanded={dataRoomExpanded}
            onPress={() => {
              setDataRoomExpanded(v => !v);
              if (!dataRoomExpanded) onSectionChange('data-room');
            }}
            C={C} S={S}
          />
          {dataRoomExpanded && (
            <>
              {dataRoomChats.length === 0 ? (
                <Text style={[S.emptyHint, { color: C.secondary }]}>No data room chats yet</Text>
              ) : (
                dataRoomChats.map(chat => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    currentChatId={currentChatId}
                    onSelect={onSelectChat}
                    onClose={onClose}
                    onLongPress={handleChatLongPress}
                    C={C} S={S}
                  />
                ))
              )}
            </>
          )}

          {/* ── Athletic Intelligence section ──────────────────────────────── */}
          <CollapsibleHeader
            label="Athletic Intelligence"
            expanded={athleticsExpanded}
            onPress={() => setAthleticsExpanded(v => !v)}
            C={C} S={S}
          />
          {athleticsExpanded && ATHLETIC_GROUPS.map(group => (
            <View key={group.groupLabel}>
              <GroupLabel label={group.groupLabel} C={C} S={S} />
              {group.items.map(item => (
                <SectionRow
                  key={item.key}
                  item={item}
                  activeSection={activeSection}
                  onPress={onSectionChange}
                  C={C} S={S}
                  chats={chats}
                  currentChatId={currentChatId}
                  onSelectChat={onSelectChat}
                  onClose={onClose}
                  onLongPress={handleChatLongPress}
                />
              ))}
            </View>
          ))}

          {/* ── Institutional Intelligence section ─────────────────────────── */}
          <CollapsibleHeader
            label="Institutional Intelligence"
            expanded={institutionalExpanded}
            onPress={() => setInstitutionalExpanded(v => !v)}
            C={C} S={S}
          />
          {institutionalExpanded && INSTITUTIONAL_GROUPS.map(group => (
            <View key={group.groupLabel}>
              <GroupLabel label={group.groupLabel} C={C} S={S} />
              {group.items.map(item => (
                <SectionRow
                  key={item.key}
                  item={item}
                  activeSection={activeSection}
                  onPress={onSectionChange}
                  C={C} S={S}
                  chats={chats}
                  currentChatId={currentChatId}
                  onSelectChat={onSelectChat}
                  onClose={onClose}
                  onLongPress={handleChatLongPress}
                />
              ))}
            </View>
          ))}

          {/* Bottom spacer */}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <View style={[S.footer, { borderTopColor: C.separator, paddingBottom: insets.bottom + 12 }]}>
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })} hitSlop={8}>
            <Text style={[S.footerLink, { color: C.secondary }]}>Sign In</Text>
          </Pressable>
          <View style={[S.footerDot, { backgroundColor: C.separator }]} />
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })} hitSlop={8}>
            <Text style={[S.footerLink, { color: C.secondary }]}>Request Access</Text>
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

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    wordmark: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    closeBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // New Chat button
    newChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 12,
      height: 40,
      borderRadius: 10,
    },
    newChatText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Collapsible section header
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    sectionHeaderText: {
      fontSize: 13,
      fontWeight: '600',
      marginLeft: 6,
    },

    // Group label (non-tappable sub-heading)
    groupLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
      textTransform: 'uppercase',
    },

    // Sport / domain row
    sportRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
    sportLabel: {
      fontSize: 14,
      flex: 1,
    },

    // Chat rows
    chatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      minHeight: 40,
      gap: 8,
    },
    chatRowIndented: {
      paddingHorizontal: 32,
    },
    chatTitle: {
      flex: 1,
      fontSize: 14,
    },
    chatDate: {
      fontSize: 12,
      flexShrink: 0,
    },

    // Empty hint
    emptyHint: {
      fontSize: 13,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },

    // Footer
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      gap: 10,
    },
    footerLink: {
      fontSize: 13,
    },
    footerDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
    },
  });
