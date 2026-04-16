/**
 * Workforce — Contact (Client view only)
 * Team members assigned to the client's projects
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;

type AssignedMember = {
  id: string;
  name: string;
  title: string;
  project: string;
  role: string;
  initials: string;
};

const ASSIGNED_MEMBERS: AssignedMember[] = [
  { id: 'm1', name: 'Marcus Rivera',  title: 'Head of Engineering', project: 'OS Integration',   role: 'Technical Lead',    initials: 'MR' },
  { id: 'm2', name: 'Devon Brooks',   title: 'Mobile Engineer',     project: 'OS Integration',   role: 'Mobile Developer',  initials: 'DB' },
  { id: 'm3', name: 'Jordan Kim',     title: 'Head of Product',     project: 'OS Integration',   role: 'Product Owner',     initials: 'JK' },
  { id: 'm4', name: 'Carlos Mendez',  title: 'Head of Sales',       project: 'Account Manager',  role: 'Account Executive', initials: 'CM' },
];

export default function ContactScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isCEO) router.replace('/(tabs)/(main)/workforce/directory' as any);
  }, [isCEO, router]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.iconBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Contact</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >
        <Text style={[s.headerNote, { color: C.secondary, marginHorizontal: 16, marginBottom: 16 }]}>
          Team members assigned to your projects
        </Text>

        <View style={{ marginHorizontal: 16, gap: 12 }}>
          {ASSIGNED_MEMBERS.map(member => (
            <View key={member.id} style={[s.memberCard, { backgroundColor: C.surface }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[s.avatar, { backgroundColor: C.separator }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{member.initials}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{member.name}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>{member.title}</Text>
                </View>
              </View>

              <View style={[s.projectTag, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <IconSymbol name="folder.fill" size={11} color={C.secondary} />
                <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 4 }}>{member.project} · {member.role}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Pressable
                  style={[s.actionBtn, { backgroundColor: C.label, flex: 1 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Message', `Opening chat with ${member.name}`); }}
                >
                  <IconSymbol name="message.fill" size={14} color={C.bg} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg, marginLeft: 6 }}>Message</Text>
                </Pressable>
                <Pressable
                  style={[s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1, flex: 1 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Call', `Calling ${member.name}...`); }}
                >
                  <IconSymbol name="phone.fill" size={14} color={C.label} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginLeft: 6 }}>Call</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    headerNote:    { fontSize: 14 },
    memberCard:    { borderRadius: 14, padding: 14 },
    avatar:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    projectTag: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 8, borderWidth: StyleSheet.hairlineWidth,
    },
    actionBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 9, borderRadius: 10,
    },
  });
}
