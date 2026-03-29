/**
 * Following — list of people and brands you follow.
 */

import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

// ── Mock following data ────────────────────────────────────────────────────────

type FollowEntry =
  | { id: string; type: 'person'; name: string; handle: string; role: string; brand: string; initials: string; mode: string }
  | { id: string; type: 'brand';  name: string; handle: string; members: number; initials: string; mode: string };

const FOLLOWING: FollowEntry[] = [
  { id: 'f1',  type: 'person', name: 'Marcus Webb',      handle: '@mwebb',    role: 'Product Lead',     brand: 'KaNeXT',              initials: 'MW', mode: 'business'  },
  { id: 'f2',  type: 'person', name: 'Jordan Hayes',     handle: '@jhayes',   role: 'Guard',            brand: "LU Men's Basketball", initials: 'JH', mode: 'sports'    },
  { id: 'f3',  type: 'person', name: 'Dr. Angela Ross',  handle: '@aross',    role: 'Professor',        brand: 'Lincoln Univ.',       initials: 'AR', mode: 'education' },
  { id: 'f4',  type: 'person', name: 'Pastor Leon King', handle: '@lking',    role: 'Senior Pastor',    brand: 'ICCLA',               initials: 'LK', mode: 'community' },
  { id: 'f5',  type: 'person', name: 'Priya Sharma',     handle: '@psharma',  role: 'Engineer',         brand: 'KaNeXT',              initials: 'PS', mode: 'business'  },
  { id: 'f6',  type: 'person', name: 'Trey Coleman',     handle: '@tcoleman', role: 'Forward',          brand: "LU Men's Basketball", initials: 'TC', mode: 'sports'    },
  { id: 'f7',  type: 'person', name: 'Casey Brown',      handle: '@cbrown',   role: 'Worship Director', brand: 'ICCLA',               initials: 'CB', mode: 'community' },
  { id: 'f8',  type: 'person', name: 'Sam Chen',         handle: '@schen',    role: 'Student',          brand: 'Lincoln Univ.',       initials: 'SC', mode: 'education' },
  { id: 'f9',  type: 'brand', name: 'Varsity FC',        handle: '@varsityfc',    members: 24,  initials: 'VF', mode: 'sports'    },
  { id: 'f10', type: 'brand', name: 'NovaTech Inc.',     handle: '@novatech',     members: 18,  initials: 'NT', mode: 'business'  },
  { id: 'f11', type: 'brand', name: 'ICCLA',             handle: '@iccla',        members: 312, initials: 'IC', mode: 'community' },
  { id: 'f12', type: 'brand', name: 'Lincoln Univ.',     handle: '@lincolnuniv',  members: 840, initials: 'LU', mode: 'education' },
];

const MODE_COLORS: Record<string, string> = {
  sports:    '#990000',
  business:  '#1D9BF0',
  education: '#003A63',
  community: '#5A8A6E',
  personal:  '#3B82F6',
};

// ── Main screen ────────────────────────────────────────────────────────────────

export default function FollowingScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'people' | 'brands'>('all');
  const [unfollowed, setUnfollowed] = useState<Set<string>>(new Set());

  const filtered = FOLLOWING.filter(f => {
    if (filter === 'people') return f.type === 'person';
    if (filter === 'brands') return f.type === 'brand';
    return true;
  }).filter(f => !unfollowed.has(f.id));

  const handleUnfollow = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUnfollowed(prev => new Set([...prev, id]));
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.title, { color: C.label }]}>Following</Text>
        <View style={s.backBtn} />
      </View>

      {/* Filter pills */}
      <View style={[s.filterRow, { borderBottomColor: C.separator }]}>
        {(['all', 'people', 'brands'] as const).map(f => (
          <Pressable
            key={f}
            style={[s.filterPill, filter === f && { backgroundColor: C.label, borderColor: C.label }, { borderColor: C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
          >
            <Text style={[s.filterText, { color: filter === f ? C.bg : C.secondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
        <Text style={[s.countText, { color: C.muted }]}>{filtered.length}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        {filtered.map((entry, i) => {
          const modeColor = MODE_COLORS[entry.mode] ?? C.accent;
          const isLast = i === filtered.length - 1;

          return (
            <Pressable
              key={entry.id}
              style={({ pressed }) => [
                s.row,
                { borderBottomColor: C.separator },
                !isLast && { borderBottomWidth: StyleSheet.hairlineWidth },
                pressed && { backgroundColor: C.surfacePressed },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (entry.type === 'brand') {
                  router.push({ pathname: '/(tabs)/(main)/social/brand' as any, params: { brand: entry.name } });
                } else {
                  router.push({ pathname: '/(tabs)/(main)/social/person' as any, params: { authorId: entry.id } });
                }
              }}
            >
              {/* Avatar */}
              <View style={[
                s.avatar,
                entry.type === 'brand' ? { borderRadius: 12 } : { borderRadius: 20 },
                { backgroundColor: modeColor + '20', borderColor: modeColor + '30', borderWidth: 1 },
              ]}>
                <Text style={[s.avatarText, { color: modeColor }]}>{entry.initials}</Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[s.name, { color: C.label }]} numberOfLines={1}>{entry.name}</Text>
                  {entry.type === 'brand' && (
                    <View style={[s.brandTag, { backgroundColor: modeColor + '18' }]}>
                      <Text style={[s.brandTagText, { color: modeColor }]}>{entry.mode}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.meta, { color: C.secondary }]} numberOfLines={1}>
                  {entry.handle}
                  {entry.type === 'person' ? ` · ${entry.role} · ${entry.brand}` : ` · ${entry.members.toLocaleString()} members`}
                </Text>
              </View>

              {/* Unfollow button */}
              <Pressable
                style={[s.unfollowBtn, { borderColor: C.separator }]}
                onPress={() => handleUnfollow(entry.id)}
                hitSlop={8}
              >
                <Text style={[s.unfollowText, { color: C.secondary }]}>Following</Text>
              </Pressable>
            </Pressable>
          );
        })}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <IconSymbol name="person.2" size={40} color={C.muted} />
            <Text style={[s.emptyText, { color: C.muted }]}>No results</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn:      { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title:        { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  filterRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  filterPill:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  filterText:   { fontSize: 13, fontWeight: '500' },
  countText:    { marginLeft: 'auto' as any, fontSize: 13, fontWeight: '500' },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  avatar:       { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:   { fontSize: 14, fontWeight: '700' },
  name:         { fontSize: 14, fontWeight: '600' },
  meta:         { fontSize: 12, marginTop: 1 },
  brandTag:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  brandTagText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  unfollowBtn:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5 },
  unfollowText: { fontSize: 12, fontWeight: '500' },
  empty:        { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText:    { fontSize: 15 },
});
