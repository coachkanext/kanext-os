/**
 * LongPressContextMenu — shared iOS-style long-press popup menu.
 * Extracted from identical PreviewOverlay implementations in
 * Messages and Phone screens.
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface ContextMenuAction {
  key: string;
  label: string;
  icon: string;
  destructive?: boolean;
}

export interface ContextMenuData {
  title: string;
  subtitle: string;
  initials: string;
  isSquircle?: boolean;
  pageY: number;
  actions: ContextMenuAction[];
  onAction: (key: string) => void;
}

interface LongPressContextMenuProps {
  data: ContextMenuData | null;
  onClose: () => void;
}

export function LongPressContextMenu({ data, onClose }: LongPressContextMenuProps) {
  if (!data) return null;
  return <ContextMenuInner data={data} onClose={onClose} />;
}

function ContextMenuInner({
  data,
  onClose,
}: {
  data: ContextMenuData;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [fadeAnim, onClose]);

  const handleAction = useCallback(
    (key: string) => {
      data.onAction(key);
      dismiss();
    },
    [data.onAction, dismiss],
  );

  const cardTop = Math.max(
    insets.top + 40,
    Math.min(data.pageY - 30, 340),
  );

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdrop} onPress={dismiss} />
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale: scaleAnim }], top: cardTop },
          ]}
        >
          <View style={styles.previewCard}>
            <View
              style={[
                styles.previewAvatar,
                data.isSquircle
                  ? { borderRadius: 12, backgroundColor: '#0B1220' }
                  : { borderRadius: 24 },
              ]}
            >
              <Text style={styles.previewInitials}>{data.initials}</Text>
            </View>
            <View style={styles.previewText}>
              <Text style={styles.previewName} numberOfLines={1}>
                {data.title}
              </Text>
              <Text style={styles.previewSub} numberOfLines={2}>
                {data.subtitle}
              </Text>
            </View>
          </View>
          <View style={styles.menu}>
            {data.actions.map((action, idx) => (
              <Pressable
                key={action.key}
                style={[
                  styles.menuItem,
                  idx < data.actions.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleAction(action.key)}
              >
                <Text
                  style={[
                    styles.menuLabel,
                    action.destructive && styles.menuLabelDestructive,
                  ]}
                >
                  {action.label}
                </Text>
                <IconSymbol
                  name={action.icon as any}
                  size={16}
                  color={action.destructive ? '#FF3B30' : '#FFFFFF'}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  content: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    gap: 12,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInitials: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  previewText: { flex: 1 },
  previewName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  previewSub: { fontSize: 14, color: '#A1A1AA', lineHeight: 19 },
  menu: {
    marginTop: 8,
    backgroundColor: '#000000',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  menuLabel: { fontSize: 16, color: '#FFFFFF' },
  menuLabelDestructive: { color: '#FF3B30' },
});
