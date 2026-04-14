import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole } from '@/utils/demo-role-store';
import { openSidePanel } from '@/utils/global-side-panel';

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------

type Tier = 'free' | 'supporters' | 'inner_circle';

interface Member {
  id: string;
  name: string;
  initials: string;
  hue: number;
  handle: string;
  location: string;
  joinDate: string;
  tier: Tier;
  tierLabel: string;
  isOnline: boolean;
  engagementLevel?: 'High' | 'Medium' | 'Low';
  totalSpent?: string;
  lastActive?: string;
}

const MEMBERS: Member[] = [
  // Free Community
  { id: 'm1',  name: 'Devon Williams',  initials: 'DW', hue: 280, handle: '@devonw',    location: 'Atlanta, GA',      joinDate: 'Jan 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: true,  engagementLevel: 'High',   totalSpent: '$0',     lastActive: '5m ago'  },
  { id: 'm2',  name: 'Chioma Obi',      initials: 'CO', hue: 20,  handle: '@chiomao',   location: 'Lagos, Nigeria',   joinDate: 'Feb 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: false, engagementLevel: 'Medium', totalSpent: '$0',     lastActive: '2h ago'  },
  { id: 'm3',  name: 'Jordan Taylor',   initials: 'JT', hue: 60,  handle: '@jordant',   location: 'Austin, TX',       joinDate: 'Feb 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: true,  engagementLevel: 'High',   totalSpent: '$0',     lastActive: '12m ago' },
  { id: 'm4',  name: 'Priya Sharma',    initials: 'PS', hue: 320, handle: '@priyas',    location: 'London, UK',       joinDate: 'Mar 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: false, engagementLevel: 'Low',    totalSpent: '$0',     lastActive: '3d ago'  },
  { id: 'm5',  name: 'Liam Chen',       initials: 'LC', hue: 200, handle: '@liamc',     location: 'Vancouver, BC',    joinDate: 'Mar 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: false, engagementLevel: 'Medium', totalSpent: '$0',     lastActive: '1d ago'  },
  { id: 'm6',  name: 'Sofia Martinez',  initials: 'SM', hue: 0,   handle: '@sofiam',    location: 'Miami, FL',        joinDate: 'Apr 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: true,  engagementLevel: 'High',   totalSpent: '$0',     lastActive: '8m ago'  },
  { id: 'm7',  name: 'Kwame Asante',    initials: 'KA', hue: 140, handle: '@kwamea',    location: 'Accra, Ghana',     joinDate: 'Apr 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: false, engagementLevel: 'Low',    totalSpent: '$0',     lastActive: '5d ago'  },
  { id: 'm8',  name: 'Emma Walsh',      initials: 'EW', hue: 240, handle: '@emmaw',     location: 'Dublin, Ireland',  joinDate: 'May 2025', tier: 'free',         tierLabel: 'Free Community', isOnline: false, engagementLevel: 'Medium', totalSpent: '$0',     lastActive: '2d ago'  },
  // Supporters
  { id: 'm9',  name: 'Marcus Thompson', initials: 'MT', hue: 40,  handle: '@marcust',   location: 'Houston, TX',      joinDate: 'Dec 2024', tier: 'supporters',   tierLabel: 'Supporters',     isOnline: true,  engagementLevel: 'High',   totalSpent: '$348',   lastActive: '3m ago'  },
  { id: 'm10', name: 'Aisha Andrews',   initials: 'AA', hue: 160, handle: '@aishaa',    location: 'Brooklyn, NY',     joinDate: 'Jan 2025', tier: 'supporters',   tierLabel: 'Supporters',     isOnline: false, engagementLevel: 'High',   totalSpent: '$232',   lastActive: '1h ago'  },
  { id: 'm11', name: 'Riley Spencer',   initials: 'RS', hue: 100, handle: '@rileys',    location: 'Denver, CO',       joinDate: 'Feb 2025', tier: 'supporters',   tierLabel: 'Supporters',     isOnline: true,  engagementLevel: 'Medium', totalSpent: '$174',   lastActive: '20m ago' },
  { id: 'm12', name: 'Noah Okafor',     initials: 'NO', hue: 200, handle: '@noaho',     location: 'London, UK',       joinDate: 'Mar 2025', tier: 'supporters',   tierLabel: 'Supporters',     isOnline: false, engagementLevel: 'Medium', totalSpent: '$116',   lastActive: '4h ago'  },
  { id: 'm13', name: 'Zara Patel',      initials: 'ZP', hue: 260, handle: '@zarap',     location: 'Toronto, ON',      joinDate: 'Mar 2025', tier: 'supporters',   tierLabel: 'Supporters',     isOnline: false, engagementLevel: 'Low',    totalSpent: '$58',    lastActive: '6d ago'  },
  // Inner Circle
  { id: 'm14', name: 'Laolu Adeyemi',   initials: 'LA', hue: 80,  handle: '@laolua',    location: 'Lagos, Nigeria',   joinDate: 'Oct 2024', tier: 'inner_circle', tierLabel: 'Inner Circle',   isOnline: true,  engagementLevel: 'High',   totalSpent: '$2,340', lastActive: '1m ago'  },
  { id: 'm15', name: 'Victoria Brooks', initials: 'VB', hue: 180, handle: '@victoriab', location: 'Chicago, IL',      joinDate: 'Nov 2024', tier: 'inner_circle', tierLabel: 'Inner Circle',   isOnline: false, engagementLevel: 'High',   totalSpent: '$1,872', lastActive: '45m ago' },
  { id: 'm16', name: 'Kai Tanaka',      initials: 'KT', hue: 220, handle: '@kait',      location: 'Tokyo, Japan',     joinDate: 'Dec 2024', tier: 'inner_circle', tierLabel: 'Inner Circle',   isOnline: true,  engagementLevel: 'High',   totalSpent: '$1,638', lastActive: '10m ago' },
];

const TIER_RANK: Record<string, number> = { free: 0, supporters: 1, inner_circle: 2 };
const FOLLOWER_TIER: Tier = 'supporters';

const STATS = [
  { label: 'Total Members',    value: '1,247' },
  { label: 'Active This Week', value: '342'   },
  { label: 'New This Week',    value: '12'    },
  { label: 'Spaces',           value: '5'     },
];

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function Avatar({ initials, hue, size = 44 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `hsl(${hue},35%,75%)`, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: '#1A1714' }}>{initials}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function MembersScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:network');
  const isOwner = role === roleCycles[0];

  const topBarH = insets.top + 52;

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const visibleTiers: Tier[] = isOwner
    ? ['free', 'supporters', 'inner_circle']
    : (['free', 'supporters', 'inner_circle'] as Tier[]).filter(t => TIER_RANK[t] <= TIER_RANK[FOLLOWER_TIER]);

  const filterPills = ['All', ...visibleTiers.map(t =>
    t === 'inner_circle' ? 'Inner Circle' : t === 'supporters' ? 'Supporters' : 'Free Community'
  )];

  const filteredMembers = useMemo(() => {
    let list = MEMBERS.filter(m => visibleTiers.includes(m.tier));
    if (tierFilter !== 'All') list = list.filter(m => m.tierLabel === tierFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.handle.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tierFilter, searchQuery, isOwner]);

  const grouped = useMemo(() => {
    const groups: { tier: Tier; label: string; members: Member[] }[] = [];
    (['inner_circle', 'supporters', 'free'] as Tier[]).forEach(t => {
      if (!visibleTiers.includes(t)) return;
      const members = filteredMembers.filter(m => m.tier === t);
      if (members.length > 0) {
        groups.push({
          tier: t,
          label: t === 'inner_circle' ? 'Inner Circle' : t === 'supporters' ? 'Supporters' : 'Free Community',
          members,
        });
      }
    });
    return groups;
  }, [filteredMembers]);

  function TierBadge({ tier, label }: { tier: Tier; label: string }) {
    const color = tier === 'inner_circle' ? C.label : tier === 'supporters' ? '#B8943E' : C.secondary;
    return (
      <View style={{ marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: color, alignSelf: 'center' }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color }}>{label}</Text>
      </View>
    );
  }

  const engagementColor = (level?: string) => {
    if (level === 'High') return '#5A8A6E';
    if (level === 'Low') return '#B85C5C';
    return C.secondary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top bar */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        height: topBarH, paddingTop: insets.top,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg, opacity,
      }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.label, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Members</Text>
            </View>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Stat cards — Owner only */}
        {isOwner && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
            style={{ marginBottom: 16 }}
          >
            {STATS.map(stat => (
              <View key={stat.label} style={{
                width: 110, height: 80,
                backgroundColor: C.surface, borderRadius: 14,
                borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
                alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Search bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: C.surface, borderRadius: 12,
          paddingHorizontal: 12, paddingVertical: 10,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
          marginHorizontal: 16, marginBottom: 12,
        }}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            placeholder="Search members..."
            placeholderTextColor={C.secondary}
            style={{ flex: 1, fontSize: 15, color: C.label }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Tier filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          style={{ marginBottom: 16 }}
        >
          {filterPills.map(pill => {
            const active = tierFilter === pill;
            return (
              <Pressable
                key={pill}
                onPress={() => { Haptics.selectionAsync(); setTierFilter(pill); }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: active ? C.label : C.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: active ? C.label : C.separator,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: active ? '700' : '400', color: active ? C.bg : C.secondary }}>
                  {pill}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Member list */}
        {filteredMembers.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 48 }}>
            <IconSymbol name="person.3.fill" size={36} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12 }}>No members found</Text>
          </View>
        ) : tierFilter !== 'All' ? (
          // Flat list when filter active
          filteredMembers.map((m, i) => (
            <MemberRow key={m.id} m={m} i={i} isFirst={i === 0} isOwner={isOwner} C={C} onPress={() => { setSelectedMember(m); setProfileOpen(true); }} />
          ))
        ) : (
          // Grouped by tier
          grouped.map(group => (
            <View key={group.tier}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.7, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 8, marginBottom: 6 }}>
                {group.label} · {group.members.length}
              </Text>
              {group.members.map((m, i) => (
                <MemberRow key={m.id} m={m} i={i} isFirst={i === 0} isOwner={isOwner} C={C} onPress={() => { setSelectedMember(m); setProfileOpen(true); }} />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Member profile sheet */}
      <BottomSheet visible={profileOpen} onClose={() => setProfileOpen(false)} useModal>
        {selectedMember && (
          <View style={{ padding: 24, paddingBottom: 32 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Avatar initials={selectedMember.initials} hue={selectedMember.hue} size={64} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginTop: 12 }}>{selectedMember.name}</Text>
              <Text style={{ fontSize: 14, color: C.secondary }}>{selectedMember.handle} · {selectedMember.location}</Text>
              <TierBadge tier={selectedMember.tier} label={selectedMember.tierLabel} />
            </View>

            {[
              { label: 'Joined', value: selectedMember.joinDate },
              ...(isOwner ? [
                { label: 'Last Active',  value: selectedMember.lastActive ?? '-' },
                { label: 'Engagement',   value: selectedMember.engagementLevel ?? '-' },
                { label: 'Total Spent',  value: selectedMember.totalSpent ?? '$0' },
              ] : []),
            ].map(row => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                <Text style={{ fontSize: 14, color: C.secondary }}>{row.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: row.label === 'Engagement' ? engagementColor(row.value) : C.label }}>
                  {row.value}
                </Text>
              </View>
            ))}

            {isOwner && (
              <Pressable
                style={{ marginTop: 16, backgroundColor: C.label, borderRadius: 14, padding: 14, alignItems: 'center' }}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setProfileOpen(false); }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Introduce Member</Text>
              </Pressable>
            )}
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Member row (extracted to avoid hooks-in-loop issues)
// ---------------------------------------------------------------------------

function MemberRow({ m, i, isFirst, isOwner, C, onPress }: {
  m: Member; i: number; isFirst: boolean; isOwner: boolean;
  C: ReturnType<typeof useColors>; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
        borderTopColor: C.separator,
        backgroundColor: pressed ? C.surface : 'transparent',
      })}
    >
      <View style={{ marginRight: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `hsl(${m.hue},35%,75%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1714' }}>{m.initials}</Text>
        </View>
        {m.isOnline && (
          <View style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#5A8A6E', borderWidth: 2, borderColor: C.bg }} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{m.name}</Text>
        <Text style={{ fontSize: 13, color: C.secondary }}>{m.handle} · {m.location}</Text>
      </View>
      <Text style={{ fontSize: 12, color: C.secondary }}>{m.joinDate}</Text>
    </Pressable>
  );
}
