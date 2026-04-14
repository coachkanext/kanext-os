/**
 * KayStudios — Search
 * Full-screen search over all experiences in the current mode.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { searchContent, type StudioContent, type ExperienceType } from '@/data/mock-kaystudios';

function TypeBadge({ type, C }: { type: ExperienceType; C: ComponentColors }) {
  const labels: Record<ExperienceType, string> = {
    trivia: 'Trivia', quiz: 'Quiz', course: 'Course',
    flashcards: 'Flashcards', simulation: 'Simulation',
    game: 'Game', training: 'Training', devotional: 'Devotional',
  };
  return (
    <View style={[styles.typeBadge, { backgroundColor: C.surfacePressed }]}>
      <Text style={[styles.typeBadgeText, { color: C.secondary }]}>{labels[type]}</Text>
    </View>
  );
}

function ResultRow({ item, C, onPress }: { item: StudioContent; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.result, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.resultThumb, { backgroundColor: `hsl(${item.thumbHue},42%,26%)` }]}>
        <Text style={styles.resultEmoji}>{item.thumbEmoji}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.resultBrand, { color: C.secondary }]} numberOfLines={1}>
          {item.brand} · {item.duration}
        </Text>
        <View style={styles.resultMeta}>
          <TypeBadge type={item.type} C={C} />
          <Text style={[styles.resultDifficulty, { color: C.muted }]}>{item.difficulty}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function StudioSearchScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const TOP_BAR_H = insets.top + 64;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);

  const results = useMemo(() => searchContent(query), [query]);

  const navigateToDetail = useCallback((item: StudioContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/detail' as any,
      params: { contentId: item.id },
    });
  }, [router]);

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search bar */}
      <Animated.View style={[styles.searchBarWrap, { paddingTop: insets.top + 8, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={styles.searchBarInner}>
        <View style={[styles.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: C.label }]}
            placeholder="Search experiences..."
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={styles.cancelBtn}
          hitSlop={8}
        >
          <Text style={[styles.cancelText, { color: C.accent }]}>Cancel</Text>
        </Pressable>
        </View>
      </Animated.View>

      {/* Results */}
      <ScrollView
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: TOP_BAR_H }}
      >
        {!query && (
          <View style={[styles.emptyState, { marginTop: 60 }]}>
            <IconSymbol name="magnifyingglass" size={44} color={C.muted} />
            <Text style={[styles.emptyTitle, { color: C.secondary }]}>Search experiences</Text>
            <Text style={[styles.emptySubtitle, { color: C.muted }]}>
              Find games, courses, trivia, and more across all of KaNeXT
            </Text>
          </View>
        )}

        {query.length > 0 && results.length === 0 && (
          <View style={[styles.emptyState, { marginTop: 60 }]}>
            <IconSymbol name="magnifyingglass" size={44} color={C.muted} />
            <Text style={[styles.emptyTitle, { color: C.secondary }]}>No results for "{query}"</Text>
            <Text style={[styles.emptySubtitle, { color: C.muted }]}>Try different keywords</Text>
          </View>
        )}

        {results.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: C.label }]}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
            {results.map(item => (
              <ResultRow key={item.id} item={item} C={C} onPress={() => navigateToDetail(item)} />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  searchBarWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBarInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  cancelBtn: { paddingVertical: 6 },
  cancelText: { fontSize: 15, fontWeight: '500' },

  sectionTitle: { fontSize: 13, fontWeight: '600', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },

  result: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  resultThumb: {
    width: 64, height: 64, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  resultEmoji: { fontSize: 26 },
  resultInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  resultTitle: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  resultBrand: { fontSize: 12 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  resultDifficulty: { fontSize: 11 },

  emptyState: { alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
