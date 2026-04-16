/**
 * Community Groups — ICCLA.
 * Pastor: tabbed Ministries / Small Groups / Bible Studies management.
 * Member: My Groups + Browse All with join.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

// ─── Data ─────────────────────────────────────────────────────────────────────

const MINISTRIES = [
  { id: 'm1',  name: 'Worship Team',        leader: 'Pastor Nony',  members: 24, next: 'Thu Apr 17, 6 PM'  },
  { id: 'm2',  name: 'Youth Ministry',       leader: 'Tobi A.',      members: 48, next: 'Fri Apr 18, 5 PM'  },
  { id: 'm3',  name: "Children's Church",    leader: 'Sister Ada',   members: 36, next: 'Sun Apr 20, 9 AM'  },
  { id: 'm4',  name: "Men's Fellowship",     leader: 'Bro. Emeka',   members: 32, next: 'Sat Apr 19, 9 AM'  },
  { id: 'm5',  name: "Women's Ministry",     leader: 'Sis. Grace',   members: 41, next: 'Sat Apr 26, 10 AM' },
  { id: 'm6',  name: 'Prayer Ministry',      leader: 'Deacon James', members: 28, next: 'Fri Apr 18, 6 AM'  },
  { id: 'm7',  name: 'Evangelism',           leader: 'Elder Paul',   members: 19, next: 'Sat Apr 19, 2 PM'  },
  { id: 'm8',  name: 'Hospitality',          leader: 'Sis. Ruth',    members: 22, next: 'Sun Apr 20, 8 AM'  },
  { id: 'm9',  name: 'Media & Tech',         leader: 'Bro. David',   members: 12, next: 'Mon Apr 14, 6 PM'  },
  { id: 'm10', name: 'Missions & Outreach',  leader: 'Pastor Dipo',  members: 15, next: 'Sat Apr 26, 1 PM'  },
];

const SMALL_GROUPS = [
  { id: 'sg1', name: "Monday Night Men's Bible Study", leader: 'Bro. Emeka', members: 12, schedule: 'Mondays 7 PM'   },
  { id: 'sg2', name: "Thursday Women's Prayer Group",  leader: 'Sis. Grace', members: 18, schedule: 'Thursdays 6 PM' },
  { id: 'sg3', name: 'Young Adults Connect',           leader: 'Tobi A.',    members: 22, schedule: 'Fridays 7 PM'   },
];

const BIBLE_STUDIES = [
  { id: 'bs1', name: 'Wed Evening Bible Study', leader: 'Pastor Dipo', attendees: 45, schedule: 'Wed 7 PM',  location: 'Fellowship Hall' },
  { id: 'bs2', name: 'Sunday School',           leader: 'Elder James', attendees: 38, schedule: 'Sun 9 AM',  location: 'Classrooms'     },
  { id: 'bs3', name: 'Online Bible Study',       leader: 'Pastor Nony', attendees: 67, schedule: 'Tue 8 PM',  location: 'Zoom'           },
];

const MY_GROUPS = [
  { id: 'm4', name: "Men's Fellowship", leader: 'Bro. Emeka', next: 'Sat Apr 19, 9:00 AM' },
  { id: 'm9', name: 'Media & Tech',     leader: 'Bro. David', next: 'Mon Apr 14, 6:00 PM' },
];
const MY_GROUP_IDS = new Set(MY_GROUPS.map(g => g.id));

type PastorTab = 'ministries' | 'small_groups' | 'bible_studies';

function inits(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>{title}</Text>;
}

function Avatar({ name, C }: { name: string; C: ComponentColors }) {
  return (
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{inits(name)}</Text>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ComGroupsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const [activeTab,  setActiveTab]  = useState<PastorTab>('ministries');
  const [search,     setSearch]     = useState('');
  const [joinedIds,  setJoinedIds]  = useState<Set<string>>(new Set());

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const join = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setJoinedIds(prev => new Set(prev).add(id));
  };

  const q = search.toLowerCase();
  const browseMins = MINISTRIES.filter(m => !MY_GROUP_IDS.has(m.id) && (!q || m.name.toLowerCase().includes(q) || m.leader.toLowerCase().includes(q)));
  const browseSGs  = SMALL_GROUPS.filter(sg => !q || sg.name.toLowerCase().includes(q) || sg.leader.toLowerCase().includes(q));

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
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Groups</Text>
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

        {isPastor ? (
          <>
            {/* Tab pills */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 20 }}>
              {(['ministries', 'small_groups', 'bible_studies'] as PastorTab[]).map(tab => {
                const label = tab === 'ministries' ? 'Ministries' : tab === 'small_groups' ? 'Small Groups' : 'Bible Studies';
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
                    style={{ backgroundColor: active ? C.activePill : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {activeTab === 'ministries' && (
              <>
                <SH title="All Ministries" C={C} />
                {MINISTRIES.map((m, i) => (
                  <Pressable key={m.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
                    <Avatar name={m.name} C={C} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{m.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{m.leader} · {m.members} members</Text>
                      <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Next: {m.next}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={C.muted} />
                  </Pressable>
                ))}
                <Pressable style={[styles.outlineBtn, { borderColor: C.separator, marginTop: 4 }]}>
                  <IconSymbol name="plus" size={14} color={C.label} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>New Ministry</Text>
                </Pressable>
              </>
            )}

            {activeTab === 'small_groups' && (
              <>
                <SH title="Small Groups" C={C} />
                {SMALL_GROUPS.map(sg => (
                  <Pressable key={sg.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
                    <Avatar name={sg.name} C={C} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{sg.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{sg.members} members · {sg.schedule}</Text>
                      <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Leader: {sg.leader}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={C.muted} />
                  </Pressable>
                ))}
                <Pressable style={[styles.outlineBtn, { borderColor: C.separator, marginTop: 4 }]}>
                  <IconSymbol name="plus" size={14} color={C.label} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>New Small Group</Text>
                </Pressable>
              </>
            )}

            {activeTab === 'bible_studies' && (
              <>
                <SH title="Bible Studies" C={C} />
                {BIBLE_STUDIES.map(bs => (
                  <Pressable key={bs.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
                    <Avatar name={bs.name} C={C} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{bs.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{bs.attendees} attend · {bs.leader}</Text>
                      <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{bs.schedule} · {bs.location}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={C.muted} />
                  </Pressable>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {/* MY GROUPS */}
            <View style={{ marginTop: 20, marginBottom: 28 }}>
              <SH title="My Groups" C={C} />
              {MY_GROUPS.map(g => (
                <View key={g.id} style={styles.card}>
                  <Avatar name={g.name} C={C} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{g.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>Next: {g.next}</Text>
                    <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Leader: {g.leader}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted} />
                </View>
              ))}
            </View>

            {/* BROWSE ALL */}
            <SH title="Browse All Groups" C={C} />
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, height: 40, paddingHorizontal: 12, gap: 8, marginBottom: 16 }}>
              <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: C.label, padding: 0 }}
                placeholder="Search groups..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <SH title="Ministries" C={C} />
            {browseMins.map(m => (
              <View key={m.id} style={styles.card}>
                <Avatar name={m.name} C={C} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{m.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{m.members} members · {m.leader}</Text>
                </View>
                {joinedIds.has(m.id) ? (
                  <View style={{ backgroundColor: C.separator, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Joined</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => join(m.id)} style={{ backgroundColor: C.activePill, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.activePillText }}>Join</Text>
                  </Pressable>
                )}
              </View>
            ))}

            <View style={{ marginTop: 16 }}>
              <SH title="Small Groups" C={C} />
              {browseSGs.map(sg => (
                <View key={sg.id} style={styles.card}>
                  <Avatar name={sg.name} C={C} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{sg.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{sg.members} members</Text>
                  </View>
                  {joinedIds.has(sg.id) ? (
                    <View style={{ backgroundColor: C.separator, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Joined</Text>
                    </View>
                  ) : (
                    <Pressable onPress={() => join(sg.id)} style={{ backgroundColor: C.activePill, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: C.activePillText }}>Join</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container:  { flex: 1 },
  topBar:     { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10 },
});
