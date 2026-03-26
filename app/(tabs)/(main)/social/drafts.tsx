/**
 * Social Drafts — saved draft posts.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

export default function DraftsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.title, { color: C.label }]}>Drafts</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.empty}>
        <IconSymbol name="doc.text" size={40} color={C.muted} />
        <Text style={[s.emptyTitle, { color: C.label }]}>No drafts</Text>
        <Text style={[s.emptyText, { color: C.secondary }]}>
          Posts you save as drafts will appear here.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn:    { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title:      { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 4 },
  emptyText:  { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
