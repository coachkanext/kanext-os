/**
 * Highlights — Player KTV Highlight Reel Builder (Sports Mode).
 * Select clips from coach-shared film, arrange, export to Social or Messages for recruiting.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, Alert } from 'react-native';
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

type Clip = {
  id: string;
  title: string;
  game: string;
  duration: string;
  thumbUri: string;
  inReel: boolean;
};

const CLIPS: Clip[] = [
  { id: 'c1', title: 'Laolu 38pts — Full Performance', game: 'vs Pepperdine',   duration: '3:22', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', inReel: true  },
  { id: 'c2', title: 'Crossover + Pull-Up Jumper',     game: 'vs Cal Maritime', duration: '0:18', thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80', inReel: true  },
  { id: 'c3', title: 'Defensive Sequence — 3 Stops',   game: 'vs Dominican',    duration: '0:45', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', inReel: false },
  { id: 'c4', title: 'Back-to-Back Three Pointers',    game: 'vs Cal Maritime', duration: '0:22', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', inReel: true  },
  { id: 'c5', title: 'Full-Court Press Break + Dunk',  game: 'vs GAAC Semis',   duration: '0:12', thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80', inReel: false },
];

export default function HighlightsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:agenda');
  const isHeadCoach = role === roleCycles[0];

  const [clips, setClips] = useState(CLIPS);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleClip = (id: string) => {
    Haptics.selectionAsync();
    setClips(prev => prev.map(c => c.id === id ? { ...c, inReel: !c.inReel } : c));
  };

  const reelClips = clips.filter(c => c.inReel);
  const reelDuration = reelClips.reduce((acc, c) => {
    const parts = c.duration.split(':').map(Number);
    return acc + (parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]);
  }, 0);
  const reelMin = Math.floor(reelDuration / 60);
  const reelSec = reelDuration % 60;

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
              <Text style={[styles.titlePillText, { color: C.label }]}>Highlights</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Reel summary ── */}
        <View style={[styles.reelSummary, { backgroundColor: C.surface, borderColor: C.separator, marginHorizontal: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reelLabel, { color: C.secondary }]}>My Reel</Text>
            <Text style={[styles.reelStats, { color: C.label }]}>
              {reelClips.length} clips · {reelMin}:{String(reelSec).padStart(2, '0')}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Export Reel', 'Share to Social or send via Messages for recruiting.', [
                { text: 'Share to Social' },
                { text: 'Send via Messages' },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            style={[styles.exportBtn, { backgroundColor: C.label }]}
          >
            <IconSymbol name="square.and.arrow.up" size={14} color={C.bg} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Export</Text>
          </Pressable>
        </View>

        {/* ── Clips ── */}
        <Text style={[styles.sectionLabel, { color: C.secondary, marginTop: 20, marginHorizontal: 16 }]}>Coach-Shared Clips</Text>

        {clips.map((clip, idx) => (
          <Pressable
            key={clip.id}
            onPress={() => toggleClip(clip.id)}
            style={({ pressed }) => [
              styles.row,
              { borderBottomWidth: idx < clips.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator, opacity: pressed ? 0.8 : 1, paddingHorizontal: 16 },
            ]}
          >
            <View style={[styles.thumb, { backgroundColor: '#1A2535' }]}>
              <Image source={{ uri: clip.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{clip.duration}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.clipTitle, { color: C.label }]} numberOfLines={2}>{clip.title}</Text>
              <Text style={[styles.clipMeta, { color: C.secondary }]}>{clip.game}</Text>
            </View>
            <View style={[
              styles.checkCircle,
              { borderColor: clip.inReel ? C.label : C.separator, backgroundColor: clip.inReel ? C.label : 'transparent' },
            ]}>
              {clip.inReel && <IconSymbol name="checkmark" size={12} color={C.bg} />}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  reelSummary: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 4 },
  reelLabel:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 },
  reelStats:   { fontSize: 16, fontWeight: '700' },
  exportBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16 },

  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },

  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  thumb:     { width: 110, height: 62, borderRadius: 8, overflow: 'hidden' },
  durationBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  durationText:  { fontSize: 9, color: '#fff', fontWeight: '600' },

  clipTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 2 },
  clipMeta:  { fontSize: 11 },

  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
