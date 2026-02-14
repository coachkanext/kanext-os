/**
 * UniversalFinder — Spotlight-style search overlay.
 * Opened via Nexus double-tap. Searches across players, recruits, games, clips, posts.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { registerFinderHandlers } from '@/utils/global-finder';
import { MOCK_FINDER_INDEX } from '@/data/mock-finder';
import type { FinderResult, FinderResultType } from '@/data/mock-finder';

const TYPE_COLORS: Record<FinderResultType, string> = {
  player: '#2196F3',
  recruit: '#4CAF50',
  team: '#FFA500',
  game: '#EF4444',
  clip: '#9C27B0',
  post: '#6e6e6e',
};

function TypeBadge({ type }: { type: FinderResultType }) {
  return (
    <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] + '20' }]}>
      <ThemedText style={[styles.typeBadgeText, { color: TYPE_COLORS[type] }]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </ThemedText>
    </View>
  );
}

function ResultRow({ result, onSelect }: { result: FinderResult; onSelect: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.resultRow, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onSelect}
    >
      <View style={styles.resultIcon}>
        <IconSymbol name={result.icon as any} size={18} color="#999" />
      </View>
      <View style={styles.resultContent}>
        <ThemedText style={styles.resultLabel}>{result.label}</ThemedText>
        <ThemedText style={styles.resultSubtitle}>{result.subtitle}</ThemedText>
      </View>
      <TypeBadge type={result.type} />
    </Pressable>
  );
}

export function UniversalFinder() {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    registerFinderHandlers(
      () => setVisible(true),
      () => setVisible(false),
    );
  }, []);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const results = useMemo(() => {
    if (!query.trim()) return MOCK_FINDER_INDEX;
    const q = query.toLowerCase();
    return MOCK_FINDER_INDEX.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.type.includes(q),
    );
  }, [query]);

  const handleSelect = (result: FinderResult) => {
    Keyboard.dismiss();
    setVisible(false);
    router.push(result.route as any);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[styles.container, { paddingTop: insets.top + 12 }]}
          onPress={() => {}}
        >
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={18} color="#6e6e6e" />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Find anything..."
              placeholderTextColor="#555"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={18} color="#555" />
              </Pressable>
            )}
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <ThemedText style={styles.closeBtnText}>Cancel</ThemedText>
            </Pressable>
          </View>

          {/* Results */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ResultRow result={item} onSelect={() => handleSelect(item)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No results found</ThemedText>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f5f5f5',
    paddingVertical: 0,
  },
  closeBtn: {
    paddingLeft: 8,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6e6e6e',
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#555',
  },
});
