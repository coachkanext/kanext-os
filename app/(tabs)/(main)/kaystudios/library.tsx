/**
 * KPlay Library — Personal. All modes, all roles.
 * In Progress, Completed, Saved. Horizontal scroll per section.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAppContext } from '@/context/app-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import {
  LIBRARY_IN_PROGRESS, LIBRARY_COMPLETED, LIBRARY_SAVED, type LibraryItem,
} from '@/data/mock-personal-kplay';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';

const TYPE_BADGE: Record<string, { bg: string; label: string }> = {
  Course:     { bg: GAIN,      label: 'Course'    },
  Quiz:       { bg: '#1A1714', label: 'Quiz'      },
  Game:       { bg: '#B8943E', label: 'Game'      },
  Simulation: { bg: '#9C9790', label: 'Sim'       },
  Challenge:  { bg: '#B85C5C', label: 'Challenge' },
  Flashcards: { bg: GAIN,      label: 'Cards'     },
};

// ── LibCard ───────────────────────────────────────────────────────────────────

function LibCard({ item, C }: { item: LibraryItem; C: ComponentColors }) {
  const badge = TYPE_BADGE[item.type] ?? TYPE_BADGE.Game;
  const pct   = item.progress !== undefined ? Math.round(item.progress * 100) : 0;

  return (
    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, width: 150, marginRight: 12 })}>
      <View style={{ width: 150, height: 108, borderRadius: 10, backgroundColor: item.coverBg, overflow: 'hidden', marginBottom: 8, justifyContent: 'flex-end', padding: 8 }}>
        <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: badge.bg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{badge.label}</Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: item.coverText, lineHeight: 16 }} numberOfLines={2}>{item.title}</Text>
      </View>
      {item.progress !== undefined ? (
        <View>
          <View style={{ height: 3, backgroundColor: C.separator, borderRadius: 2, marginBottom: 5 }}>
            <View style={{ height: 3, width: `${pct}%` as any, backgroundColor: GAIN, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: GAIN }}>{pct}% · Continue →</Text>
        </View>
      ) : item.completedDate ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconSymbol name="checkmark.circle.fill" size={12} color={GAIN} />
          <Text style={{ fontSize: 11, color: C.secondary }}>
            {item.completedDate}{item.score !== undefined ? ` · ${item.score}%` : ''}
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>Saved · Start →</Text>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KPlayLibraryScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode    = state.activeContext?.mode ?? state.mode ?? 'personal';
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const roleKey = `${mode}:kaystudios` as any;
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdmin = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, backgroundColor: C.bg, opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Library</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Your Library</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
            {LIBRARY_IN_PROGRESS.length} in progress · {LIBRARY_COMPLETED.length} completed · {LIBRARY_SAVED.length} saved
          </Text>
        </View>

        {/* In Progress */}
        {LIBRARY_IN_PROGRESS.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
              In Progress
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {LIBRARY_IN_PROGRESS.map(item => <LibCard key={item.id} item={item} C={C} />)}
            </ScrollView>
          </View>
        )}

        {/* Completed */}
        {LIBRARY_COMPLETED.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
              Completed
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {LIBRARY_COMPLETED.map(item => <LibCard key={item.id} item={item} C={C} />)}
            </ScrollView>
          </View>
        )}

        {/* Saved */}
        {LIBRARY_SAVED.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
              Saved
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {LIBRARY_SAVED.map(item => <LibCard key={item.id} item={item} C={C} />)}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
