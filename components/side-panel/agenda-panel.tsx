/**
 * Agenda Side Panel — left-edge drawer.
 * Visible tab on left edge. Tap or swipe-right to open.
 * 10 sections, scrollable.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PANEL_WIDTH = Dimensions.get('window').width * 0.78;

interface Props {
  translateX: Animated.Value;
  onOpen: () => void;
  onClose: () => void;
}

const SECTIONS = [
  {
    key: 'quick-add',
    label: 'Quick Add',
    icon: 'plus.circle.fill' as const,
    items: ['Event', 'Task', 'Reminder', 'Deadline', 'Prep Block'],
  },
  {
    key: 'context-scope',
    label: 'Context Scope',
    icon: 'building.2.fill' as const,
    items: ['All Orgs', 'Lincoln U Only', 'Personal Only', 'Sports Mode', 'Business Mode'],
  },
  {
    key: 'date-nav',
    label: 'Date Navigation',
    icon: 'calendar' as const,
    items: ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Jump to Date…'],
  },
  {
    key: 'filters',
    label: 'Filters',
    icon: 'line.3.horizontal.decrease' as const,
    items: ['All Types', 'Meetings Only', 'Deadlines Only', 'High Priority+', 'Personal Only'],
  },
];

export function AgendaSidePanel({ translateX, onOpen, onClose }: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const handleTabPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpen();
  }, [onOpen]);

  const panelTranslate = translateX.interpolate({
    inputRange: [0, PANEL_WIDTH],
    outputRange: [-PANEL_WIDTH, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Left-edge visible tab */}
      <Pressable
        style={[
          styles.tab,
          {
            top: insets.top + 80,
            backgroundColor: C.surface,
            borderColor: C.separator,
          },
        ]}
        onPress={handleTabPress}
      >
        <IconSymbol name="chevron.right" size={10} color={C.muted} />
      </Pressable>

      {/* Slide-in panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            width: PANEL_WIDTH,
            backgroundColor: C.bg,
            borderRightColor: C.separator,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: panelTranslate }],
          },
        ]}
      >
        <View style={[styles.panelHeader, { borderBottomColor: C.separator }]}>
          <Text style={[styles.panelTitle, { color: C.label }]}>Agenda</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={C.secondary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {SECTIONS.map((section, sectionIndex) => (
            <View key={section.key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol name={section.icon} size={13} color={C.muted} />
                <Text style={[styles.sectionTitle, { color: C.muted }]}>
                  {section.label.toUpperCase()}
                </Text>
              </View>
              {section.items.map((item, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.item,
                    { borderBottomColor: C.separator },
                    i === section.items.length - 1 && styles.itemLast,
                    pressed && { backgroundColor: C.surfacePressed },
                  ]}
                >
                  <Text style={[styles.itemText, { color: C.label }]}>{item}</Text>
                  <IconSymbol name="chevron.right" size={11} color={C.muted} />
                </Pressable>
              ))}
              {sectionIndex < SECTIONS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: C.divider }]} />
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tab: {
    position: 'absolute',
    left: 0,
    width: 18,
    height: 48,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLast: { borderBottomWidth: 0 },
  itemText: { fontSize: 14, fontWeight: '400' },
  divider: { height: 1, marginTop: 4 },
});
