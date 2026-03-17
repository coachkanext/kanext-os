/**
 * NexusPageTopBar — multi-state top bar for the Nexus screen.
 *
 * view='home'  → hamburger | "Nexus v1" pill | spacer
 * view='chat'  → hamburger | "Nexus v1" pill + chevron | new-chat circle
 * view='list'  → back/hamburger | title (22px 700) | filter icon
 *
 * Inline dropdown (home/chat): Change project · Star · Rename · ─── · Delete (red)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

export interface NexusPageTopBarProps {
  /** Which view state drives the bar */
  view?: 'home' | 'chat' | 'list';
  /** Title text for list view */
  title?: string;
  showBack?: boolean;
  showFilter?: boolean;
  showNewChat?: boolean;
  filterActive?: boolean;
  onHamburger?: () => void;
  onBack?: () => void;
  onNewChat?: () => void;
  onFilter?: () => void;
  onDropdownAction?: (action: 'change-project' | 'star' | 'rename' | 'delete') => void;
  /** Legacy: kept for backward compat — same as onNewChat */
  onPlusPress?: () => void;
}

export function NexusPageTopBar({
  view = 'home',
  title,
  showBack = false,
  showFilter = false,
  showNewChat = false,
  filterActive = false,
  onHamburger,
  onBack,
  onNewChat,
  onFilter,
  onDropdownAction,
  onPlusPress,
}: NexusPageTopBarProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLeftPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showBack && onBack) onBack();
    else onHamburger?.();
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNewChat?.();
    onPlusPress?.();
  };

  return (
    <View>
      <View style={styles.container}>
        {/* Left */}
        <Pressable
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handleLeftPress}
          accessibilityLabel={showBack ? 'Go back' : 'Open sidebar'}
          accessibilityRole="button"
        >
          {showBack ? (
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          ) : (
            <View style={styles.menuLines}>
              <View style={[styles.menuLine, { width: 20, backgroundColor: C.secondary }]} />
              <View style={[styles.menuLine, { width: 13, backgroundColor: C.secondary }]} />
            </View>
          )}
        </Pressable>

        {/* Center */}
        {view === 'list' ? (
          <Text style={styles.listTitle} numberOfLines={1}>{title ?? ''}</Text>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.nexusPill,
              { backgroundColor: pressed ? C.separator : C.surface },
            ]}
            onPress={() => setDropdownOpen((v) => !v)}
            accessibilityLabel="Nexus options"
          >
            <Text style={styles.nexusPillText}>Nexus 1.0</Text>
          </Pressable>
        )}

        {/* Right */}
        {view === 'home' ? (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleNewChat}
            accessibilityLabel="New chat"
          >
            <IconSymbol name="square.and.pencil" size={20} color={C.secondary} />
          </Pressable>
        ) : view === 'chat' && showNewChat ? (
          <Pressable
            style={({ pressed }) => [styles.newChatBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={handleNewChat}
            accessibilityLabel="New chat"
          >
            <IconSymbol name="plus" size={18} color={C.bg} />
          </Pressable>
        ) : view === 'list' && showFilter ? (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={onFilter}
            accessibilityLabel="Filter"
          >
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={20}
              color={filterActive ? C.label : C.secondary}
            />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* Dropdown backdrop */}
      {dropdownOpen && view !== 'list' && (
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}

      {/* Dropdown menu */}
      {dropdownOpen && view !== 'list' && (
        <View style={[styles.dropdown, { backgroundColor: C.surface, borderColor: C.divider }]}>
          {(
            [
              { key: 'change-project', label: 'Change project', icon: 'folder' },
              { key: 'star', label: 'Star', icon: 'star' },
              { key: 'rename', label: 'Rename', icon: 'pencil' },
            ] as const
          ).map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.dropdownItem,
                { backgroundColor: pressed ? C.separator : 'transparent' },
              ]}
              onPress={() => {
                setDropdownOpen(false);
                onDropdownAction?.(item.key);
              }}
            >
              <IconSymbol name={item.icon as any} size={14} color={C.secondary} />
              <Text style={[styles.dropdownLabel, { color: C.label }]}>{item.label}</Text>
            </Pressable>
          ))}
          <View style={[styles.dropdownDivider, { backgroundColor: C.divider }]} />
          <Pressable
            style={({ pressed }) => [
              styles.dropdownItem,
              { backgroundColor: pressed ? C.separator : 'transparent' },
            ]}
            onPress={() => {
              setDropdownOpen(false);
              onDropdownAction?.('delete');
            }}
          >
            <IconSymbol name="trash" size={14} color={C.red} />
            <Text style={[styles.dropdownLabel, { color: C.red }]}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLines: {
      gap: 5,
      alignItems: 'flex-start',
    },
    menuLine: {
      height: 2,
      borderRadius: 1,
    },
    listTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '700',
      color: C.label,
      marginHorizontal: 8,
    },
    nexusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 16,
    },
    nexusPillText: {
      fontSize: 15,
      fontWeight: '600',
      color: C.label,
    },
    ghostBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    },
    ghostEmoji: {
      fontSize: 20,
    },
    newChatBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.label,
      marginRight: 4,
    },
    dropdown: {
      position: 'absolute',
      top: 52,
      alignSelf: 'center',
      minWidth: 210,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      paddingVertical: 4,
      zIndex: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 12,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 11,
      paddingHorizontal: 16,
    },
    dropdownLabel: {
      fontSize: 15,
    },
    dropdownDivider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 4,
      marginHorizontal: 16,
    },
  });
