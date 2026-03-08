/**
 * SocialFab — FAB + popup menu with posting options.
 * Same pattern as Messages FAB. Only visible on Feed page.
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
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

// ── Popup Menu ──

function FabPopupMenu({
  bottomOffset,
  onDismiss,
}: {
  bottomOffset: number;
  onDismiss: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
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
      duration: 120,
      useNativeDriver: true,
    }).start(() => onDismiss());
  }, [fadeAnim, onDismiss]);

  const items = [
    { icon: 'camera.fill' as const, label: 'Photo' },
    { icon: 'video.fill' as const, label: 'Video' },
    { icon: 'film' as const, label: 'Reel' },
    { icon: 'plus.circle.fill' as const, label: 'Story' },
  ];

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[menuStyles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={menuStyles.backdrop} onPress={dismiss} />
        <Animated.View
          style={[
            menuStyles.menu,
            {
              bottom: bottomOffset,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {items.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={menuStyles.divider} />}
              <Pressable style={menuStyles.menuItem} onPress={dismiss}>
                <IconSymbol name={item.icon} size={18} color="#FFFFFF" />
                <Text style={menuStyles.menuLabel}>{item.label}</Text>
              </Pressable>
            </React.Fragment>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const menuStyles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  menu: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#000000',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2F3336',
    overflow: 'hidden',
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2F3336',
  },
  menuLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

// ── FAB ──

interface SocialFabProps {
  visible: boolean;
  bottomOffset: number;
}

export function SocialFab({ visible, bottomOffset }: SocialFabProps) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  if (!visible) return null;

  return (
    <>
      <Pressable
        style={[styles.fab, { bottom: bottomOffset }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setMenuVisible(true);
        }}
      >
        <IconSymbol name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      {menuVisible && (
        <FabPopupMenu
          bottomOffset={bottomOffset + 60}
          onDismiss={() => setMenuVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
