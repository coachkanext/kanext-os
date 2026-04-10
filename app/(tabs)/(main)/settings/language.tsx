/**
 * Language Settings — Select the app display language.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;

const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English'   },
  { code: 'es', name: 'Spanish',    native: 'Español'   },
  { code: 'fr', name: 'French',     native: 'Français'  },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'de', name: 'German',     native: 'Deutsch'   },
  { code: 'ar', name: 'Arabic',     native: 'العربية'   },
  { code: 'zh', name: 'Chinese',    native: '中文'        },
  { code: 'ja', name: 'Japanese',   native: '日本語'      },
  { code: 'ko', name: 'Korean',     native: '한국어'      },
  { code: 'hi', name: 'Hindi',      native: 'हिन्दी'     },
  { code: 'yo', name: 'Yoruba',     native: 'Yorùbá'    },
  { code: 'ig', name: 'Igbo',       native: 'Igbo'      },
];

export default function LanguageSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [selected, setSelected] = useState('English');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Language</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <GlassView tier={1} style={[s.card, { marginTop: 16 }]}>
          {LANGUAGES.map((lang, idx) => (
            <Pressable
              key={lang.code}
              onPress={() => { haptic(); setSelected(lang.name); }}
              style={[
                s.row,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.langName, { color: C.label, fontWeight: selected === lang.name ? '700' : '400' }]}>
                  {lang.name}
                </Text>
                <Text style={[s.langNative, { color: C.secondary }]}>{lang.native}</Text>
              </View>
              {selected === lang.name && (
                <IconSymbol name="checkmark" size={16} color={C.label} />
              )}
            </Pressable>
          ))}
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:  { fontSize: 14, fontWeight: '700' },
    card:      { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    langName:  { fontSize: 15 },
    langNative: { fontSize: 12, marginTop: 1 },
  });
}
