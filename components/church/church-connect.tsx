/**
 * Church Connect — Relational entry point
 *
 * Purpose: "How do I connect?" — people, groups, care.
 * Not schedule. Not directory. Not governance.
 *
 * Layout: Single vertical scroll, 5 blocks
 *   Block 1 — Quick Actions (Message, Prayer, Serve, Groups)
 *   Block 2 — Leaders & Staff (campus leadership cards)
 *   Block 3 — My Connections (relational shortcuts)
 *   Block 4 — Join / Get Involved (3 cards)
 *   Block 5 — Care & Support (Prayer Request, Care Request)
 *
 * Campus-scoped. Role-aware. No inline editing.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { CHURCH_LEADERS, type ChurchLeader } from '@/data/mock-church-home';
import { ChurchLeaderProfileSheet } from '@/components/church/church-leader-profile-sheet';
import { ChurchPrayerRequestSheet } from '@/components/church/church-prayer-request-sheet';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role: string;
  /** Callback to switch to another tab (e.g., Ministries) */
  onSwitchTab?: (index: number) => void;
}

// =============================================================================
// MOCK — MY CONNECTIONS
// =============================================================================

interface Connection {
  id: string;
  name: string;
  role: string;
  context: string;
  initials: string;
}

const MY_CONNECTIONS_ICCLA: Connection[] = [
  { id: 'conn-01', name: 'Sister Angela Davis', role: 'Lead Teacher', context: 'Formation Kids', initials: 'AD' },
  { id: 'conn-02', name: 'Minister Desiree Hamilton', role: 'Ministry Leader', context: 'Single & Purposeful', initials: 'DH' },
  { id: 'conn-03', name: 'Deacon Lawrence Price', role: 'Small Group Leader', context: 'Squads — Zone 3', initials: 'LP' },
  { id: 'conn-04', name: 'Sister Keisha Brown', role: 'Serving Partner', context: "Children's Church Team", initials: 'KB' },
];

const MY_CONNECTIONS_ICCIE: Connection[] = [
  { id: 'conn-01', name: 'Sister Angela Davis', role: 'Lead Teacher', context: 'Formation Kids', initials: 'AD' },
  { id: 'conn-05', name: 'Brother Emmanuel Obi', role: 'Small Group Leader', context: 'Squads — East', initials: 'EO' },
];

// =============================================================================
// CAMPUS-SCOPED LEADERS
// =============================================================================

/** Leaders shown on the Connect page — key staff for the campus */
const CAMPUS_LEADER_IDS_ICCLA = ['ldr-001', 'ldr-004', 'ldr-010', 'ldr-007'];
const CAMPUS_LEADER_IDS_ICCIE = ['ldr-001', 'ldr-003', 'ldr-004'];

function getCampusLeaders(campus: 'ICCLA' | 'ICCIE'): ChurchLeader[] {
  const ids = campus === 'ICCLA' ? CAMPUS_LEADER_IDS_ICCLA : CAMPUS_LEADER_IDS_ICCIE;
  return ids.map((id) => CHURCH_LEADERS.find((l) => l.id === id)).filter(Boolean) as ChurchLeader[];
}

// =============================================================================
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  const parts = name.replace(/^(Pastor|Elder|Deacon|Mother|Minister|Sister|Brother)\s+/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

// =============================================================================
// QUICK ACTION BUTTON
// =============================================================================

function QuickAction({
  icon,
  label,
  color,
  bgColor,
  onPress,
}: {
  icon: IconSymbolName;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.quickAction, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={[s.quickActionIcon, { backgroundColor: bgColor }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <ThemedText style={[s.quickActionLabel, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

// =============================================================================
// LEADER CARD
// =============================================================================

function LeaderCard({
  leader,
  colors,
  accent,
  onPress,
  onMessage,
}: {
  leader: ChurchLeader;
  colors: typeof Colors.light;
  accent: string;
  onPress: () => void;
  onMessage: () => void;
}) {
  const initials = getInitials(leader.name);
  return (
    <Pressable
      style={({ pressed }) => [
        s.leaderCard,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={[s.leaderAvatar, { backgroundColor: accent + '20' }]}>
        <ThemedText style={[s.leaderAvatarText, { color: accent }]}>{initials}</ThemedText>
      </View>
      <View style={s.leaderInfo}>
        <ThemedText style={[s.leaderName, { color: colors.text }]} numberOfLines={1}>
          {leader.name}
        </ThemedText>
        <ThemedText style={[s.leaderRole, { color: colors.textSecondary }]} numberOfLines={1}>
          {leader.title}
        </ThemedText>
      </View>
      <Pressable
        style={({ pressed }) => [s.msgBtn, { backgroundColor: accent }, pressed && { opacity: 0.7 }]}
        onPress={(e) => { e.stopPropagation?.(); onMessage(); }}
      >
        <IconSymbol name="envelope.fill" size={12} color="#000" />
      </Pressable>
    </Pressable>
  );
}

// =============================================================================
// CONNECTION CARD
// =============================================================================

function ConnectionCard({
  connection,
  colors,
  accent,
  onPress,
}: {
  connection: Connection;
  colors: typeof Colors.light;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.connCard,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={[s.connAvatar, { backgroundColor: accent + '20' }]}>
        <ThemedText style={[s.connAvatarText, { color: accent }]}>{connection.initials}</ThemedText>
      </View>
      <View style={s.connInfo}>
        <ThemedText style={[s.connName, { color: colors.text }]} numberOfLines={1}>
          {connection.name}
        </ThemedText>
        <ThemedText style={[s.connRole, { color: colors.textSecondary }]} numberOfLines={1}>
          {connection.role}
        </ThemedText>
        <ThemedText style={[s.connContext, { color: accent }]} numberOfLines={1}>
          {connection.context}
        </ThemedText>
      </View>
      <IconSymbol name="bubble.left.fill" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// INVOLVEMENT CARD
// =============================================================================

function InvolvementCard({
  icon,
  title,
  description,
  colors,
  accent,
  onPress,
}: {
  icon: IconSymbolName;
  title: string;
  description: string;
  colors: typeof Colors.light;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.involveCard,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={[s.involveIcon, { backgroundColor: accent + '15' }]}>
        <IconSymbol name={icon} size={22} color={accent} />
      </View>
      <View style={s.involveInfo}>
        <ThemedText style={[s.involveTitle, { color: colors.text }]}>{title}</ThemedText>
        <ThemedText style={[s.involveDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchConnect({ colors, accent, role, onSwitchTab }: Props) {
  const [leaderSheetVisible, setLeaderSheetVisible] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<ChurchLeader | null>(null);
  const [prayerSheetVisible, setPrayerSheetVisible] = useState(false);
  const [prayerRequestType, setPrayerRequestType] = useState<'prayer' | 'care'>('prayer');

  // Demo: active campus
  const campus: 'ICCLA' | 'ICCIE' = 'ICCLA';
  const campusLeaders = getCampusLeaders(campus);
  const myConnections = campus === 'ICCLA' ? MY_CONNECTIONS_ICCLA : MY_CONNECTIONS_ICCIE;

  const handleLeaderPress = useCallback((leader: ChurchLeader) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setSelectedLeader(leader);
    setLeaderSheetVisible(true);
  }, []);

  const handleMessage = useCallback((name: string) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert('Message', `Opening conversation with ${name}...`);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    switch (action) {
      case 'message':
        Alert.alert('Messages', 'Opening Messages → Inbox...');
        break;
      case 'prayer':
        setPrayerRequestType('prayer');
        setPrayerSheetVisible(true);
        break;
      case 'serve':
        // Navigate to Ministries tab (index 2)
        onSwitchTab?.(2);
        break;
      case 'groups':
        Alert.alert('Small Groups', 'Opening Small Groups directory...');
        break;
    }
  }, [onSwitchTab]);

  const handleJoinMinistry = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    onSwitchTab?.(2); // Navigate to Ministries tab
  }, [onSwitchTab]);

  const handleCareRequest = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setPrayerRequestType('care');
    setPrayerSheetVisible(true);
  }, []);

  const handlePrayerRequest = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setPrayerRequestType('prayer');
    setPrayerSheetVisible(true);
  }, []);

  return (
    <ThemedView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── Block 1 — Quick Actions ── */}
        <View style={s.block}>
          <View style={s.quickActionsRow}>
            <QuickAction
              icon="envelope.fill"
              label="Message"
              color="#1A1714"
              bgColor="#1A171418"
              onPress={() => handleQuickAction('message')}
            />
            <QuickAction
              icon="hands.sparkles.fill"
              label="Prayer"
              color="#1A1714"
              bgColor="#1A171418"
              onPress={() => handleQuickAction('prayer')}
            />
            <QuickAction
              icon="star.fill"
              label="Serve"
              color="#B8943E"
              bgColor="#B8943E18"
              onPress={() => handleQuickAction('serve')}
            />
            <QuickAction
              icon="person.3.fill"
              label="Groups"
              color="#5A8A6E"
              bgColor="#5A8A6E18"
              onPress={() => handleQuickAction('groups')}
            />
          </View>
        </View>

        {/* ── Block 2 — Leaders & Staff ── */}
        <View style={s.block}>
          <ThemedText style={[s.blockTitle, { color: colors.text }]}>Leaders & Staff</ThemedText>
          {campusLeaders.map((leader) => (
            <LeaderCard
              key={leader.id}
              leader={leader}
              colors={colors}
              accent={accent}
              onPress={() => handleLeaderPress(leader)}
              onMessage={() => handleMessage(leader.name)}
            />
          ))}
        </View>

        {/* ── Block 3 — My Connections ── */}
        <View style={s.block}>
          <ThemedText style={[s.blockTitle, { color: colors.text }]}>My Connections</ThemedText>
          {myConnections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              colors={colors}
              accent={accent}
              onPress={() => handleMessage(conn.name)}
            />
          ))}
        </View>

        {/* ── Block 4 — Join / Get Involved ── */}
        <View style={s.block}>
          <ThemedText style={[s.blockTitle, { color: colors.text }]}>Get Involved</ThemedText>
          <InvolvementCard
            icon="heart.fill"
            title="Join a Ministry"
            description="Find where you belong — serve in children's, youth, worship, or outreach."
            colors={colors}
            accent={accent}
            onPress={handleJoinMinistry}
          />
          <InvolvementCard
            icon="person.3.fill"
            title="Join a Small Group"
            description="Connect in community through home-based fellowship and Bible study."
            colors={colors}
            accent={accent}
            onPress={() => {
              Haptics.impactAsync(ImpactFeedbackStyle.Light);
              Alert.alert('Small Groups', 'Opening Small Groups directory...');
            }}
          />
          <InvolvementCard
            icon="star.fill"
            title="Volunteer to Serve"
            description="Production, hospitality, parking, greeting — every hand matters on Sunday."
            colors={colors}
            accent={accent}
            onPress={handleJoinMinistry}
          />
        </View>

        {/* ── Block 5 — Care & Support ── */}
        <View style={s.block}>
          <ThemedText style={[s.blockTitle, { color: colors.text }]}>Care & Support</ThemedText>
          <View style={s.careRow}>
            <Pressable
              style={({ pressed }) => [
                s.careCard,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handlePrayerRequest}
            >
              <View style={[s.careIcon, { backgroundColor: '#1A171418' }]}>
                <IconSymbol name="hands.sparkles.fill" size={24} color="#1A1714" />
              </View>
              <ThemedText style={[s.careTitle, { color: colors.text }]}>Request Prayer</ThemedText>
              <ThemedText style={[s.careDesc, { color: colors.textSecondary }]}>
                Submit a prayer request to the prayer team.
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.careCard,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleCareRequest}
            >
              <View style={[s.careIcon, { backgroundColor: '#B85C5C18' }]}>
                <IconSymbol name="heart.circle.fill" size={24} color="#B85C5C" />
              </View>
              <ThemedText style={[s.careTitle, { color: colors.text }]}>Request Care</ThemedText>
              <ThemedText style={[s.careDesc, { color: colors.textSecondary }]}>
                Reach out to the pastoral care team.
              </ThemedText>
            </Pressable>
          </View>
        </View>

      </ScrollView>

      {/* ── Leader Profile Sheet ── */}
      <ChurchLeaderProfileSheet
        visible={leaderSheetVisible}
        onClose={() => setLeaderSheetVisible(false)}
        leader={selectedLeader}
        colors={colors}
        accent={accent}
      />

      {/* ── Prayer/Care Request Sheet ── */}
      <ChurchPrayerRequestSheet
        visible={prayerSheetVisible}
        onClose={() => setPrayerSheetVisible(false)}
        colors={colors}
        accent={accent}
        requestType={prayerRequestType}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 80 },

  // Block
  block: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Leader Card
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  leaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderAvatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  leaderRole: {
    fontSize: 12,
    marginTop: 2,
  },
  msgBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Connection Card
  connCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  connAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connAvatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  connInfo: {
    flex: 1,
  },
  connName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  connRole: {
    fontSize: 11,
    marginTop: 1,
  },
  connContext: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  // Involvement Card
  involveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  involveIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  involveInfo: {
    flex: 1,
  },
  involveTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  involveDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  // Care & Support
  careRow: {
    flexDirection: 'row',
    gap: 10,
  },
  careCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  careIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  careTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  careDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
