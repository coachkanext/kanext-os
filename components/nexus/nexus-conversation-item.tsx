/**
 * NexusConversationItem — Single row in the Nexus sidebar conversation list.
 *
 * Active:     3px accent left border + semibold title
 * Normal:     muted title
 * Subtitle:   last message preview (one line, "You: " prefix for user msgs)
 * Star icon:  right side — filled when starred
 * Long press: Alert with Rename / Star / Delete options
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, TextInput, StyleSheet, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { NexusChatMeta } from '@/services/nexus/nexus-chat-storage';

// ── Component ─────────────────────────────────────────────────────────────────

interface NexusConversationItemProps {
  chat:     NexusChatMeta;
  isActive: boolean;
  onPress:  () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onStar:   () => void;
}

export function NexusConversationItem({
  chat,
  isActive,
  onPress,
  onDelete,
  onRename,
  onStar,
}: NexusConversationItemProps) {
  const C             = useColors();
  const S             = useMemo(() => makeStyles(C), [C]);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(chat.title);
  const inputRef      = useRef<TextInput>(null);

  const subtitle = useMemo(() => {
    if (!chat.lastMessagePreview) return null;
    const prefix = chat.lastMessageRole === 'user' ? 'You: ' : '';
    return prefix + chat.lastMessagePreview;
  }, [chat.lastMessagePreview, chat.lastMessageRole]);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      chat.title.slice(0, 40),
      undefined,
      [
        {
          text: 'Rename',
          onPress: () => {
            setEditText(chat.title);
            setEditing(true);
            setTimeout(() => inputRef.current?.focus(), 80);
          },
        },
        {
          text: chat.starred ? 'Unstar' : 'Star',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onStar();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const commitRename = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== chat.title) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        S.row,
        isActive && S.rowActive,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      {/* Active indicator */}
      {isActive && (
        <View style={[S.activeLine, { backgroundColor: C.accent }]} />
      )}

      <View style={S.body}>
        {editing ? (
          <TextInput
            ref={inputRef}
            style={[S.renameInput, { color: C.label, borderColor: C.accent }]}
            value={editText}
            onChangeText={setEditText}
            onBlur={commitRename}
            onSubmitEditing={commitRename}
            returnKeyType="done"
            selectTextOnFocus
            autoFocus
          />
        ) : (
          <>
            <Text
              style={[
                S.title,
                { color: isActive ? C.label : C.secondary },
                isActive && { fontWeight: '500' },
              ]}
              numberOfLines={1}
            >
              {chat.title}
            </Text>
            {subtitle && (
              <Text
                style={[S.subtitle, { color: C.muted }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Star icon */}
      {!editing && (
        <Pressable
          hitSlop={8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onStar();
          }}
        >
          <IconSymbol
            name={chat.starred ? 'star.fill' : 'star'}
            size={14}
            color={chat.starred ? '#F5B800' : C.muted}
          />
        </Pressable>
      )}

      {/* Delete button — visible when active */}
      {isActive && !editing && (
        <Pressable
          hitSlop={8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Delete Chat', `"${chat.title.slice(0, 30)}"`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]);
          }}
        >
          <IconSymbol name="trash" size={14} color={C.muted} />
        </Pressable>
      )}
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      gap: 10,
      minHeight: 44,
    },
    rowActive: {
      backgroundColor: C.surfacePressed,
    },
    activeLine: {
      position: 'absolute',
      left: 0,
      top: 6,
      bottom: 6,
      width: 3,
      borderRadius: 2,
    },
    body: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 15,
      lineHeight: 20,
    },
    subtitle: {
      fontSize: 12,
      lineHeight: 16,
    },
    renameInput: {
      fontSize: 15,
      lineHeight: 20,
      borderBottomWidth: 1,
      paddingVertical: 2,
    },
  });
