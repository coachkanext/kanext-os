/**
 * Film — Head Coach KTV Film Viewer (Sports Mode).
 * Quick-access game film viewer without telestration tools.
 * For deep analysis with drawing tools, use Dashboard > Film Room.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

type FilmGame = {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: 'Raw' | 'Tagged' | 'Analyzed';
  thumbUri: string;
};

const FILM_GAMES: FilmGame[] = [
  { id: 'f1', title: 'LU vs Cal Maritime',    date: 'Apr 12', duration: '1:42:30', status: 'Analyzed', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80' },
  { id: 'f2', title: 'LU vs Dominican',       date: 'Apr 5',  duration: '1:38:14', status: 'Tagged',   thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80' },
  { id: 'f3', title: 'LU vs Academy of Art',  date: 'Mar 28', duration: '1:51:02', status: 'Raw',      thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80' },
  { id: 'f4', title: 'GAAC Semifinals vs WJC', date: 'Mar 22', duration: '1:44:55', status: 'Analyzed', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80' },
  { id: 'f5', title: 'LU vs Notre Dame de Namur', date: 'Mar 15', duration: '1:36:40', status: 'Tagged', thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80' },
];

const STATUS_COLORS: Record<FilmGame['status'], string> = {
  Raw:      '#B85C5C',
  Tagged:   '#B8943E',
  Analyzed: '#5A8A6E',
};

export default function FilmScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:agenda');
  const isHeadCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={{ width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.titlePillText, { color: C.label }]}>Film</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Game Film</Text>

        {FILM_GAMES.map((game, idx) => (
          <Pressable
            key={game.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: game.id } });
            }}
            style={({ pressed }) => [
              styles.row,
              { borderBottomWidth: idx < FILM_GAMES.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.thumb, { backgroundColor: '#1A2535' }]}>
              <Image source={{ uri: game.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={[styles.durationBadge]}>
                <Text style={styles.durationText}>{game.duration}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.gameTitle, { color: C.label }]} numberOfLines={2}>{game.title}</Text>
              <Text style={[styles.gameMeta, { color: C.secondary }]}>{game.date}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[game.status] + '22', borderColor: STATUS_COLORS[game.status] + '55' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[game.status] }]}>{game.status}</Text>
              </View>
            </View>
            <IconSymbol name="play.circle" size={22} color={C.secondary} />
          </Pressable>
        ))}

        {/* Film Room CTA */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={[styles.filmRoomCta, { borderColor: C.separator, backgroundColor: C.surface }]}
        >
          <IconSymbol name="pencil.and.outline" size={18} color={C.label} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Open Film Room for Full Analysis</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },

  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  thumb:     { width: 120, height: 68, borderRadius: 8, overflow: 'hidden' },
  durationBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  durationText:  { fontSize: 9, color: '#fff', fontWeight: '600' },

  gameTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 2 },
  gameMeta:  { fontSize: 11, marginBottom: 6 },

  statusBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  statusText:  { fontSize: 10, fontWeight: '700' },

  filmRoomCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
});
