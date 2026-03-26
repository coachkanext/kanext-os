/**
 * Network Side Panel — owner and member versions.
 * Owner: community health metrics, new member queue, moderation shortcut, settings.
 * Member: my tier status, my spaces, my interest tags, notifications.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  COMMUNITY_STATS,
  COMMUNITY_TIERS,
  COMMUNITY_MEMBERS,
  isNewThisWeek,
} from '@/data/mock-creator-community';

const NEW_MEMBERS = COMMUNITY_MEMBERS.filter(m => isNewThisWeek(m.joinDate));
const ONLINE_COUNT = COMMUNITY_MEMBERS.filter(m => m.isOnline).length;

export function NetworkPanel({ role = 'owner' }: { role?: 'owner' | 'member' | 'visitor' }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const close = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
  };

  if (role === 'owner') return <OwnerPanel C={C} styles={styles} onClose={close} />;
  return <MemberPanel C={C} styles={styles} onClose={close} />;
}

// ── Owner Panel ───────────────────────────────────────────────────────────────

function OwnerPanel({ C, styles, onClose }: { C: ComponentColors; styles: any; onClose: () => void }) {
  const navItems = [
    { icon: 'person.3',       label: 'Community',   tab: 'Community' },
    { icon: 'bubble.left.and.bubble.right', label: 'Spaces', tab: 'Spaces' },
    { icon: 'link',           label: 'Connect',     tab: 'Connect' },
  ] as const;

  const settingsItems = [
    { icon: 'tag',                    label: 'Interest Tags' },
    { icon: 'arrow.trianglehead.2.clockwise.rotate.90', label: 'Tier-Space Mapping' },
    { icon: 'shield',                 label: 'Community Rules' },
    { icon: 'exclamationmark.shield', label: 'Moderation Policies' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: C.accent }]}>
          <Text style={[styles.avatarText, { color: '#fff' }]}>SK</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.headerName, { color: C.label }]}>My Community</Text>
          <Text style={[styles.headerSub, { color: C.secondary }]}>sammykalejaiye</Text>
        </View>
      </View>

      {/* Health metrics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>COMMUNITY HEALTH</Text>
        <View style={[styles.metricsGrid, { backgroundColor: C.surfacePressed, borderRadius: 12 }]}>
          {[
            { label: 'Total',   value: String(COMMUNITY_STATS.totalMembers), color: C.label },
            { label: 'Active',  value: String(COMMUNITY_STATS.activeThisWeek), color: '#5A8A6E' },
            { label: 'Online',  value: String(ONLINE_COUNT),    color: C.accent },
            { label: 'New',     value: String(COMMUNITY_STATS.newThisWeek),    color: C.accent },
          ].map(m => (
            <View key={m.label} style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: C.muted }]}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigate */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>NAVIGATE</Text>
        {navItems.map(item => (
          <Pressable
            key={item.tab}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={onClose}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={16} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* New member queue */}
      {NEW_MEMBERS.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.secondary }]}>NEW THIS WEEK</Text>
          {NEW_MEMBERS.slice(0, 3).map(m => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
              onPress={onClose}
            >
              <View style={[styles.memberDot, { backgroundColor: `hsl(${m.avatarHue},35%,75%)` }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: `hsl(${m.avatarHue},40%,30%)` }}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.navLabel, { color: C.label }]}>{m.name}</Text>
                <Text style={[styles.navSub, { color: C.muted }]}>{m.handle}</Text>
              </View>
              <Text style={[styles.newBadge, { backgroundColor: '#5A8A6E' + '22', color: '#5A8A6E' }]}>New</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Moderation */}
      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
          onPress={onClose}
        >
          <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="exclamationmark.bubble" size={16} color={C.label} />
          </View>
          <Text style={[styles.navLabel, { color: C.label }]}>Moderation Queue</Text>
          <View style={[styles.badge, { backgroundColor: C.accent }]}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
          onPress={onClose}
        >
          <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="plus.circle" size={16} color={C.label} />
          </View>
          <Text style={[styles.navLabel, { color: C.label }]}>Create Space</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
          onPress={onClose}
        >
          <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="lightbulb" size={16} color={C.label} />
          </View>
          <Text style={[styles.navLabel, { color: C.label }]}>Weekly Prompt</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>SETTINGS</Text>
        {settingsItems.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={onClose}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={16} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Member Panel ──────────────────────────────────────────────────────────────

function MemberPanel({ C, styles, onClose }: { C: ComponentColors; styles: any; onClose: () => void }) {
  // Demo: user is a Supporter
  const myTier = COMMUNITY_TIERS.find(t => t.id === 'supporters')!;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: C.surfacePressed }]}>
          <Text style={[styles.avatarText, { color: C.label }]}>YO</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.headerName, { color: C.label }]}>My Community</Text>
          <Text style={[styles.headerSub, { color: myTier.color }]}>{myTier.name}</Text>
        </View>
      </View>

      {/* My tier */}
      <View style={[styles.tierCard, { borderColor: myTier.color + '44', backgroundColor: myTier.color + '10' }]}>
        <Text style={[styles.tierCardName, { color: myTier.color }]}>{myTier.name}</Text>
        <Text style={[styles.tierCardPrice, { color: C.secondary }]}>${myTier.price}/mo</Text>
        <View style={{ marginTop: 8, gap: 4 }}>
          {myTier.perks.slice(0, 3).map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconSymbol name="checkmark" size={11} color={myTier.color} />
              <Text style={{ fontSize: 12, color: C.secondary }}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigate */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>NAVIGATE</Text>
        {[
          { icon: 'person.3', label: 'Community' },
          { icon: 'bubble.left.and.bubble.right', label: 'Spaces' },
          { icon: 'link', label: 'Connect' },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={onClose}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={16} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* My interests */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>MY INTERESTS</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
          {['entrepreneurship', 'coding', 'fitness'].map(tag => (
            <View key={tag} style={[styles.interestTag, { backgroundColor: C.surfacePressed }]}>
              <Text style={{ fontSize: 12, color: C.secondary }}>{tag}</Text>
            </View>
          ))}
          <Pressable style={[styles.interestTag, { borderWidth: 1, borderColor: C.inputBorder }]} onPress={onClose}>
            <IconSymbol name="plus" size={11} color={C.muted} />
            <Text style={{ fontSize: 12, color: C.muted }}>Edit</Text>
          </Pressable>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
          onPress={onClose}
        >
          <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="bell" size={16} color={C.label} />
          </View>
          <Text style={[styles.navLabel, { color: C.label }]}>Notification Preferences</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 20, marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
  headerName: { fontSize: 15, fontWeight: '700' },
  headerSub:  { fontSize: 12, marginTop: 1 },
  section:    { marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 9, borderRadius: 10, paddingHorizontal: 2,
  },
  navIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  navSub:   { fontSize: 11 },
  metricsGrid: {
    flexDirection: 'row', justifyContent: 'space-around', padding: 14,
  },
  metricItem: { alignItems: 'center', gap: 2 },
  metricValue: { fontSize: 18, fontWeight: '700' },
  metricLabel: { fontSize: 11 },
  memberDot: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  newBadge: {
    fontSize: 10, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  tierCard: {
    marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1.5,
  },
  tierCardName:  { fontSize: 14, fontWeight: '700' },
  tierCardPrice: { fontSize: 12, marginTop: 2 },
  interestTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
});
