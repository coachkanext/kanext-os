/**
 * SocialFab — FAB + popup menu with posting options.
 * Same pattern as Messages FAB. Only visible on Feed page.
 */

import React, { useRef, useCallback, useMemo } from 'react';
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
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Popup Menu ──

function FabPopupMenu({
  bottomOffset,
  onDismiss,
}: {
  bottomOffset: number;
  onDismiss: () => void;
}) {
  const C = useColors();
  const mStyles = useMemo(() => makeMenuStyles(C), [C]);
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
      <Animated.View style={[mStyles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={mStyles.backdrop} onPress={dismiss} />
        <Animated.View
          style={[
            mStyles.menu,
            {
              bottom: bottomOffset,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {items.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={mStyles.divider} />}
              <Pressable style={mStyles.menuItem} onPress={dismiss}>
                <IconSymbol name={item.icon} size={18} color={C.label} />
                <Text style={mStyles.menuLabel}>{item.label}</Text>
              </Pressable>
            </React.Fragment>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const makeMenuStyles = (C: ComponentColors) =>
  StyleSheet.create({
    overlay: { flex: 1 },
    backdrop: { ...StyleSheet.absoluteFillObject },
    menu: {
      position: 'absolute',
      right: 20,
      backgroundColor: C.bg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.divider,
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
      backgroundColor: C.divider,
    },
    menuLabel: {
      fontSize: 16,
      color: C.label,
    },
  });

// ── FAB ──

interface SocialFabProps {
  visible: boolean;
  bottomOffset: number;
}

export function SocialFab({ visible, bottomOffset }: SocialFabProps) {
  const C = useColors();
  const fabStyles = useMemo(() => makeFabStyles(C), [C]);
  const [menuVisible, setMenuVisible] = React.useState(false);

  if (!visible) return null;

  return (
    <>
      <Pressable
        style={[fabStyles.fab, { bottom: bottomOffset }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setMenuVisible(true);
        }}
      >
        <IconSymbol name="plus" size={24} color={C.label} />
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

const makeFabStyles = (C: ComponentColors) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: C.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: C.bg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
  });
