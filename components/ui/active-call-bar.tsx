/**
 * ActiveCallBar — compact in-app call strip.
 * Green dot · name · timer · red end button.
 * Used in both the phone screen and chat thread screen.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

interface ActiveCallBarProps {
  name: string;
  onEnd: () => void;
  /** Optional tap on the bar itself (e.g. to expand a minimized call) */
  onPress?: () => void;
}

export function ActiveCallBar({ name, onEnd, onPress }: ActiveCallBarProps) {
  const C = useColors();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <Pressable style={[styles.bar, { backgroundColor: C.surface, shadowColor: C.label }]} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: C.green }]} />
      <Text style={[styles.name, { color: C.label }]} numberOfLines={1}>{name}</Text>
      <Text style={[styles.timer, { color: C.green }]}>{timer}</Text>
      <Pressable style={[styles.endBtn, { backgroundColor: C.red }]} onPress={onEnd}>
        <IconSymbol name="phone.down.fill" size={15} color="#fff" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginBottom: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  dot:    { width: 8, height: 8, borderRadius: 4 },
  name:   { flex: 1, fontSize: 15, fontWeight: '600' },
  timer:  { fontSize: 14, fontWeight: '500', fontVariant: ['tabular-nums'] },
  endBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
