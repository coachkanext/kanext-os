/**
 * DrawerPanel — half-screen sliding side panel (Claude-style).
 *
 * Behaviour:
 *  - Slides in from left (or right), occupying ~78% screen width
 *  - Main content behind remains visible on the exposed side
 *  - Exposed side dims slightly with rounded inner corner (depth illusion)
 *  - Tap exposed side → close
 *  - Swipe in the dismiss direction → close
 *  - Spring animation open/close (≈250 ms)
 *  - No shadow, no border on flush edge; borderRadius 20 on inner edge only
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 60;

interface DrawerPanelProps {
  visible: boolean;
  onClose: () => void;
  /** Which edge the panel is anchored to. Default: 'left'. */
  side?: 'left' | 'right';
  /** Panel width in px. Default: 78% of screen width. */
  width?: number;
  /** Override the panel background color. Defaults to C.bg. */
  backgroundColor?: string;
  children: React.ReactNode;
}

export function DrawerPanel({
  visible,
  onClose,
  side = 'left',
  width = Math.round(SCREEN_WIDTH * 0.78),
  backgroundColor,
  children,
}: DrawerPanelProps) {
  const C = useColors();
  const [mounted, setMounted] = useState(visible);

  const closedX = side === 'left' ? -width : width;
  const slideAnim = useRef(new Animated.Value(visible ? 0 : closedX)).current;
  const scrimOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  // Use a ref for onClose so PanResponder doesn't go stale
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 24,
          stiffness: 200,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(scrimOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: closedX,
          damping: 26,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(scrimOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        side === 'left'
          ? gs.dx < -12 && Math.abs(gs.dx) > Math.abs(gs.dy)
          : gs.dx > 12 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        if (side === 'left' && gs.dx < 0) slideAnim.setValue(gs.dx);
        if (side === 'right' && gs.dx > 0) slideAnim.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        const shouldClose =
          (side === 'left' && gs.dx < -SWIPE_THRESHOLD) ||
          (side === 'right' && gs.dx > SWIPE_THRESHOLD);
        if (shouldClose) {
          onCloseRef.current();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 24,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!mounted) return null;

  const panelRadius = {};

  const panelAnchor = side === 'left' ? { left: 0 } : { right: 0 };

  const scrimAnchor =
    side === 'left'
      ? { left: width, right: 0 }
      : { right: width, left: 0 };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2000 }]} pointerEvents="box-none">
      {/* Dim overlay — tap to close */}
      <Animated.View
        style={[styles.scrim, scrimAnchor, { opacity: scrimOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sliding panel */}
      <Animated.View
        style={[
          styles.panel,
          panelAnchor,
          panelRadius,
          { width, backgroundColor: backgroundColor ?? C.bg, transform: [{ translateX: slideAnim }] },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});
