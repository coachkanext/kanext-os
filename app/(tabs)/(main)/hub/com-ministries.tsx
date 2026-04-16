/**
 * Community Ministries — ICCLA.
 * Pastor: All 10 ministries with filter pills (All/Active/Needs Attention), health indicators, Create Ministry.
 * Member: My Ministries at top, Browse Ministries below with filter pills (All/Fellowship/Worship/Youth/Service).
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ─── Data ─────────────────────────────────────────────────────────────────────

type Health = 'active' | 'caution' | 'inactive';
type Category = 'Fellowship' | 'Worship' | 'Youth' | 'Service' | 'Connect';

interface Ministry {
  id: string;
  name: string;
  leader: string;
  members: number;
  nextMeeting: string;
  health: Health;
  healthNote?: string;
  category: Category;
  description: string;
}

const MINISTRIES: Ministry[] = [
  {
    id: 'm1', name: 'Men Wondered At Fellowship', leader: 'Elder Emmanuel Mensah',
    members: 28, nextMeeting: 'Sat Apr 19 · 8:00 AM', health: 'active', category: 'Fellowship',
    description: 'Men\'s discipleship, accountability, and fellowship.',
  },
  {
    id: 'm2', name: 'Virtuous Women\'s Ministry', leader: 'Sis. Ada Okonkwo',
    members: 42, nextMeeting: 'Sat Apr 19 · 10:00 AM', health: 'active', category: 'Fellowship',
    description: 'Women\'s empowerment, prayer, and community.',
  },
  {
    id: 'm3', name: 'T.O.R.C.H. Nation', leader: 'David Eze',
    members: 35, nextMeeting: 'Fri Apr 18 · 6:00 PM', health: 'active', category: 'Youth',
    description: 'Young adults ministry — Taking Over, Reaching Communities, Honoring God.',
  },
  {
    id: 'm4', name: 'Sheepfold', leader: 'Sis. Ruth Osei',
    members: 47, nextMeeting: 'Sun Apr 20 · 11:00 AM', health: 'active', category: 'Youth',
    description: 'Children\'s church for ages 3–12.',
  },
  {
    id: 'm5', name: 'Fresh Fire Teens Church', leader: 'Bro. Tobi Kalejaiye',
    members: 31, nextMeeting: 'Sun Apr 20 · 11:00 AM', health: 'active', category: 'Youth',
    description: 'Teen church for ages 13–17.',
  },
  {
    id: 'm6', name: 'Rooted', leader: 'Bro. Chidi Nwosu',
    members: 22, nextMeeting: 'Thu Apr 17 · 7:00 PM', health: 'caution', healthNote: 'Low attendance',
    category: 'Connect', description: 'New member integration and discipleship program.',
  },
  {
    id: 'm7', name: 'ICC Connect Groups', leader: 'Sis. Grace Addo',
    members: 64, nextMeeting: 'Various', health: 'active', category: 'Connect',
    description: 'Small group Bible studies hosted throughout the community.',
  },
  {
    id: 'm8', name: 'Vineyard Voices', leader: 'Dr. Kunle Pinmiloye / Ksticks',
    members: 18, nextMeeting: 'Wed Apr 16 · 6:30 PM', health: 'active', category: 'Worship',
    description: 'The ICCLA choir and worship arts team.',
  },
  {
    id: 'm9', name: 'Single Saved Serving', leader: '—',
    members: 14, nextMeeting: 'TBD', health: 'caution', healthNote: 'Leader gap',
    category: 'Fellowship', description: 'Community and purpose for single adults.',
  },
  {
    id: 'm10', name: 'The Harvesters', leader: 'Bro. Lekan Adeyemi',
    members: 26, nextMeeting: 'Sat Apr 26 · 9:00 AM', health: 'active', category: 'Service',
    description: 'Evangelism and community outreach ministry.',
  },
];

const MY_MINISTRY_IDS = ['m3', 'm5'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
      {title}
    </Text>
  );
}

function healthColor(h: Health) {
  return h === 'active' ? GAIN : h === 'caution' ? CAUTION : HEAT;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ComMinistriesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const [pastorFilter, setPastorFilter] = useState<'All' | 'Active' | 'Needs Attention'>('All');
  const [memberFilter, setMemberFilter] = useState<'All' | 'Fellowship' | 'Worship' | 'Youth' | 'Service'>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredForPastor = MINISTRIES.filter(m => {
    if (pastorFilter === 'Active') return m.health === 'active';
    if (pastorFilter === 'Needs Attention') return m.health !== 'active';
    return true;
  });

  const myMinistries = MINISTRIES.filter(m => MY_MINISTRY_IDS.includes(m.id));
  const browseMinistries = MINISTRIES.filter(m => {
    if (memberFilter === 'All') return true;
    return m.category === memberFilter;
  });

  // ── PASTOR VIEW ──────────────────────────────────────────────────────────────
  const renderPastor = () => (
    <>
      {/* Filter pills */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 20 }}>
        {(['All', 'Active', 'Needs Attention'] as const).map(f => {
          const active = pastorFilter === f;
          return (
            <Pressable
              key={f}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 17, backgroundColor: active ? C.activePill : C.surface }}
              onPress={() => { Haptics.selectionAsync(); setPastorFilter(f); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{f}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ministry list */}
      {filteredForPastor.map(m => {
        const col = healthColor(m.health);
        return (
          <Pressable
            key={m.id}
            style={({ pressed }) => [styles.card, { marginBottom: 8, flexDirection: 'row', alignItems: 'center' }, pressed && { opacity: 0.8 }]}
          >
            {/* Health dot */}
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>{m.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{m.leader}</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: C.muted }}>{m.members} members</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{m.nextMeeting}</Text>
              </View>
              {m.healthNote && (
                <Text style={{ fontSize: 11, color: col, marginTop: 3, fontWeight: '600' }}>{m.healthNote}</Text>
              )}
            </View>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        );
      })}

      {/* Create Ministry */}
      <Pressable style={[styles.outlineBtn, { marginTop: 8, marginBottom: 28 }]}>
        <IconSymbol name="plus" size={14} color={C.secondary} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>Create Ministry</Text>
      </Pressable>
    </>
  );

  // ── MEMBER VIEW ───────────────────────────────────────────────────────────────
  const renderMember = () => (
    <>
      {/* MY MINISTRIES */}
      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <SH title="My Ministries" C={C} />
        {myMinistries.map(m => (
          <Pressable
            key={m.id}
            style={({ pressed }) => [styles.card, { marginBottom: 8, flexDirection: 'row', alignItems: 'center' }, pressed && { opacity: 0.8 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>{m.name}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{m.leader}</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{m.nextMeeting}</Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* BROWSE MINISTRIES */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Browse Ministries" C={C} />
        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {(['All', 'Fellowship', 'Worship', 'Youth', 'Service'] as const).map(f => {
            const active = memberFilter === f;
            return (
              <Pressable
                key={f}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 17, backgroundColor: active ? C.activePill : C.surface }}
                onPress={() => { Haptics.selectionAsync(); setMemberFilter(f); }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {browseMinistries.map(m => {
          const isMine = MY_MINISTRY_IDS.includes(m.id);
          return (
            <View key={m.id} style={[styles.card, { marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 1 }}>{m.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{m.leader}</Text>
                </View>
                {isMine ? (
                  <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.label }}>Joined</Text>
                  </View>
                ) : (
                  <Pressable style={{ backgroundColor: C.label, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>Join</Text>
                  </Pressable>
                )}
              </View>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18, marginBottom: 6 }}>{m.description}</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 11, color: C.muted }}>{m.members} members</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{m.nextMeeting}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Ministries</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 120, paddingHorizontal: 16 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {isPastor ? renderPastor() : renderMember()}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container:  { flex: 1 },
  topBar:     { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  card:       { backgroundColor: C.surface, borderRadius: 14, padding: 14 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: C.separator, borderRadius: 14, paddingVertical: 12 },
});
