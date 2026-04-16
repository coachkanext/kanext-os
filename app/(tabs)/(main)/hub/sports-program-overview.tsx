/**
 * Sports Hub — Program Overview (Athletics Dashboard).
 * Follows business.tsx layout: cover → logo overlap → identity → socials → sections.
 * Head Coach: full management (edit cover, bio, content, roster, staff, links).
 * Player: read-only program profile + Follow.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
  TextInput, ActionSheetIOS, Platform, Alert, Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H   = 52;
const LOGO_SIZE   = 80;
const LOGO_OVR    = LOGO_SIZE / 2;

// ─── Static data ──────────────────────────────────────────────────────────────

const PROGRAM = {
  name:       "Lincoln Men's Basketball",
  handle:     '@lmbb',
  conf:       'GAAC · Laney College, Oakland',
  followers:  1284,
};

const INITIAL_BIO = '15-8 · SWS Regular Season Champions (Back-to-Back) · GAAC Tournament Champions. Building the standard at Lincoln University.';

const SOCIAL_PLATFORMS = [
  { name: 'Instagram', fa: 'instagram'  },
  { name: 'X',         fa: 'x-twitter' },
  { name: 'TikTok',    fa: 'tiktok'    },
  { name: 'YouTube',   fa: 'youtube'   },
] satisfies { name: string; fa: string }[];

type FeaturedType = 'VIDEO' | 'POST' | 'EVENT';
type FeaturedItem = { id: string; type: FeaturedType; title: string; sub: string };

type GameResult = 'W' | 'L';
type Game = { id: string; opp: string; result: GameResult; score: string; date: string; level: string };

type RosterPlayer = { id: string; initials: string; name: string; number: string; pos: string; kr: number };

type StaffMember = { id: string; initials: string; name: string; title: string };

type Link = { id: string; icon: string; title: string; sub: string };

const INIT_FEATURED: FeaturedItem[] = [
  { id: 'f1', type: 'VIDEO', title: 'Season Highlights — 15-8 Championship Run', sub: '4.2K views'  },
  { id: 'f2', type: 'POST',  title: 'Back-to-Back SWS Regular Season Champions', sub: '892 likes'   },
  { id: 'f3', type: 'EVENT', title: 'End-of-Season Banquet',                     sub: 'May 3, 2026' },
];

const RECENT_GAMES: Game[] = [
  { id: 'g1', opp: 'vs. Bishop State',   result: 'W', score: '94–71',  date: 'Mar 8',  level: 'USCAA'  },
  { id: 'g2', opp: 'vs. Davis & Elkins', result: 'W', score: '101–83', date: 'Mar 5',  level: 'USCAA'  },
  { id: 'g3', opp: 'vs. Georgetown KY',  result: 'W', score: '88–79',  date: 'Mar 1',  level: 'USCAA'  },
  { id: 'g4', opp: 'vs. Pacific',        result: 'L', score: '64–112', date: 'Feb 22', level: 'D1'     },
  { id: 'g5', opp: 'vs. CSUF',           result: 'L', score: '71–109', date: 'Feb 19', level: 'D1'     },
];

const INIT_ROSTER: RosterPlayer[] = [
  { id: 'r1', initials: 'LK', name: 'Kalejaiye', number: '11', pos: 'PG', kr: 86 },
  { id: 'r2', initials: 'BW', name: 'Williams',  number: '1',  pos: 'SG', kr: 76 },
  { id: 'r3', initials: 'CM', name: 'McKesey',   number: '3',  pos: 'SG', kr: 71 },
  { id: 'r4', initials: 'NC', name: 'Chatelain', number: '15', pos: 'C',  kr: 71 },
  { id: 'r5', initials: 'AH', name: 'Hernandez', number: '10', pos: 'SG', kr: 62 },
  { id: 'r6', initials: 'CP', name: 'Plantey',   number: '2',  pos: 'G',  kr: 61 },
  { id: 'r7', initials: 'SW', name: 'Wall',       number: '6',  pos: 'G',  kr: 60 },
];

const INIT_STAFF: StaffMember[] = [
  { id: 's1', initials: 'WM', name: 'William Middlebrooks', title: 'Head Coach'      },
  { id: 's2', initials: 'SK', name: 'Sammy Kalejaiye',      title: 'Assistant Coach' },
];

const INIT_LINKS: Link[] = [
  { id: 'l1', icon: 'calendar',          title: 'Full Schedule',      sub: 'All 2025–26 games'     },
  { id: 'l2', icon: 'doc.text.fill',     title: 'Media Guide',        sub: 'Stats, roster, history' },
  { id: 'l3', icon: 'person.3.fill',     title: 'Roster',             sub: '12 players'             },
  { id: 'l4', icon: 'chart.bar.fill',    title: 'Statistics',         sub: 'Full season data'       },
  { id: 'l5', icon: 'tray.fill',         title: 'Recruiting Board',   sub: '8 prospects tracked'    },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: any }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
      color: C.secondary, marginBottom: 12, marginTop: 4,
    }}>
      {title}
    </Text>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SportsProgramOverview() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const COVER_H = 220 + topBarH;

  const [role, toggleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Editable state ──────────────────────────────────────────────────────────
  const [bio,      setBio]      = useState(INITIAL_BIO);
  const [featured, setFeatured] = useState<FeaturedItem[]>(INIT_FEATURED);
  const [roster,   setRoster]   = useState<RosterPlayer[]>(INIT_ROSTER);
  const [staff,    setStaff]    = useState<StaffMember[]>(INIT_STAFF);
  const [links,    setLinks]    = useState<Link[]>(INIT_LINKS);
  const [followed, setFollowed] = useState(false);

  // Add-sheets
  const [addFeatOpen,  setAddFeatOpen]  = useState(false);
  const [addLinkOpen,  setAddLinkOpen]  = useState(false);

  const [newFeatType,  setNewFeatType]  = useState<FeaturedType>('VIDEO');
  const [newFeatTitle, setNewFeatTitle] = useState('');
  const [newFeatSub,   setNewFeatSub]   = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkSub,   setNewLinkSub]   = useState('');

  // ── Coach action helpers ─────────────────────────────────────────────────────

  function featuredMenu(item: FeaturedItem) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit Title', 'Remove', 'Cancel'], cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Title', '', (t) => {
              if (t?.trim()) setFeatured(p => p.map(f => f.id === item.id ? { ...f, title: t.trim() } : f));
            }, 'plain-text', item.title);
          } else if (idx === 1) {
            setFeatured(p => p.filter(f => f.id !== item.id));
          }
        },
      );
    } else {
      Alert.alert(item.title, '', [
        { text: 'Remove', style: 'destructive', onPress: () => setFeatured(p => p.filter(f => f.id !== item.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  function staffMenu(member: StaffMember) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit Title', 'Remove', 'Cancel'], cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Title', '', (t) => {
              if (t?.trim()) setStaff(p => p.map(s => s.id === member.id ? { ...s, title: t.trim() } : s));
            }, 'plain-text', member.title);
          } else if (idx === 1) {
            setStaff(p => p.filter(s => s.id !== member.id));
          }
        },
      );
    } else {
      Alert.alert(member.name, '', [
        { text: 'Remove', style: 'destructive', onPress: () => setStaff(p => p.filter(s => s.id !== member.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  function linkMenu(item: Link) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit Title', 'Remove', 'Cancel'], cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Title', '', (t) => {
              if (t?.trim()) setLinks(p => p.map(l => l.id === item.id ? { ...l, title: t.trim() } : l));
            }, 'plain-text', item.title);
          } else if (idx === 1) {
            setLinks(p => p.filter(l => l.id !== item.id));
          }
        },
      );
    } else {
      Alert.alert(item.title, '', [
        { text: 'Remove', style: 'destructive', onPress: () => setLinks(p => p.filter(l => l.id !== item.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  function pickFeatType() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const types: FeaturedType[] = ['VIDEO', 'POST', 'EVENT'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...types, 'Cancel'], cancelButtonIndex: 3 },
        (idx) => { if (idx < 3) setNewFeatType(types[idx]); },
      );
    }
  }

  function handleAddFeatured() {
    if (!newFeatTitle.trim()) return;
    setFeatured(p => [...p, { id: `f-${Date.now()}`, type: newFeatType, title: newFeatTitle.trim(), sub: newFeatSub.trim() }]);
    setNewFeatTitle(''); setNewFeatSub(''); setNewFeatType('VIDEO');
    setAddFeatOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleAddLink() {
    if (!newLinkTitle.trim()) return;
    setLinks(p => [...p, { id: `l-${Date.now()}`, icon: 'link', title: newLinkTitle.trim(), sub: newLinkSub.trim() }]);
    setNewLinkTitle(''); setNewLinkSub('');
    setAddLinkOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar — transparent overlay, floats over cover ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, opacity,
      }} pointerEvents="box-none">
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }} pointerEvents="box-none">
          <View style={{ width: 80, justifyContent: 'center' }} pointerEvents="auto">
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1 }} pointerEvents="none" />
          <View style={{ alignItems: 'flex-end' }} pointerEvents="auto">
            <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cover + logo ── */}
        <View style={{ position: 'relative', marginBottom: LOGO_OVR + 12 }}>
          <View style={{ height: COVER_H, overflow: 'hidden' }}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/lu-basketball/900/500' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {isCoach && (
              <Pressable
                onPress={() => Alert.alert('Edit Cover Photo', 'Tap to change cover (demo)')}
                style={{
                  position: 'absolute', bottom: 10, right: 12,
                  backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 5,
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                }}
              >
                <IconSymbol name="camera.fill" size={12} color="#fff" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Edit Cover</Text>
              </Pressable>
            )}
          </View>

          {/* Team logo — bottom-left, overlapping */}
          <View style={{ position: 'absolute', bottom: -LOGO_OVR, left: 20 }}>
            <Pressable
              onPress={() => isCoach && Alert.alert('Edit Logo', 'Tap to change logo (demo)')}
              disabled={!isCoach}
            >
              <View style={{
                width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2,
                backgroundColor: C.label, borderWidth: 3, borderColor: C.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 30, fontWeight: '900', color: C.bg }}>LM</Text>
              </View>
              {isCoach && (
                <View style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: C.label, borderWidth: 2, borderColor: C.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconSymbol name="camera.fill" size={11} color={C.bg} />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Identity block ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginBottom: 2 }}>{PROGRAM.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 2 }}>{PROGRAM.handle}</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 8 }}>{PROGRAM.conf}</Text>
          {isCoach ? (
            <TextInput
              value={bio}
              onChangeText={(t) => t.length <= 160 && setBio(t)}
              multiline
              style={{ fontSize: 14, color: C.label, lineHeight: 20 }}
              placeholder="Add a bio..."
              placeholderTextColor={C.secondary}
            />
          ) : (
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, opacity: 0.85 }}>{bio}</Text>
          )}
          {isCoach && (
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>{bio.length}/160</Text>
          )}
        </View>

        {/* ── Followers row ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{PROGRAM.followers.toLocaleString()}</Text>{' followers'}
          </Text>
          {isCoach ? (
            <Pressable
              style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator, opacity: pressed ? 0.7 : 1 })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit Profile</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: followed ? C.surface : C.label, borderWidth: 1.5, borderColor: followed ? C.separator : C.label, opacity: pressed ? 0.7 : 1 })}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFollowed(f => !f); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: followed ? C.label : C.bg }}>{followed ? 'Following' : 'Follow'}</Text>
            </Pressable>
          )}
        </View>

        {/* ── Socials row ── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'flex-start', gap: 12,
          paddingHorizontal: 20, paddingVertical: 14,
          borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: C.separator, marginBottom: 28,
        }}>
          {SOCIAL_PLATFORMS.map(platform => (
            <Pressable key={platform.name} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome6 name={platform.fa as any} size={18} color={C.label} iconStyle="brands" />
              </View>
            </Pressable>
          ))}
          {isCoach && (
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{ paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit Socials</Text>
            </Pressable>
          )}
        </View>

        {/* ── FEATURED ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Featured" C={C} />
          {featured.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: C.surface, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8,
                opacity: pressed ? 0.75 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={{ backgroundColor: C.separator, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: C.secondary, letterSpacing: 0.5 }}>{item.type}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.title}</Text>
                {!!item.sub && <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{item.sub}</Text>}
              </View>
              {isCoach ? (
                <Pressable onPress={() => featuredMenu(item)} hitSlop={8}>
                  <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                </Pressable>
              ) : (
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              )}
            </Pressable>
          ))}
          {isCoach && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddFeatOpen(true); }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="plus.circle" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.secondary }}>Add Featured</Text>
            </Pressable>
          )}
        </View>

        {/* ── COACHING STAFF ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Coaching Staff" C={C} />
          {staff.map(member => (
            <Pressable
              key={member.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: C.surface, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8,
                opacity: pressed ? 0.75 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: C.label }}>{member.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{member.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{member.title}</Text>
              </View>
              {isCoach ? (
                <Pressable onPress={() => staffMenu(member)} hitSlop={8}>
                  <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                </Pressable>
              ) : (
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* ── LINKS ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Links" C={C} />
          {links.filter(item => isCoach || item.id !== 'l5').map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: C.surface, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8,
                opacity: pressed ? 0.75 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center',
              }}>
                <IconSymbol name={item.icon as any} size={16} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.title}</Text>
                {!!item.sub && <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{item.sub}</Text>}
              </View>
              {isCoach ? (
                <Pressable onPress={() => linkMenu(item)} hitSlop={8}>
                  <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                </Pressable>
              ) : (
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              )}
            </Pressable>
          ))}
          {isCoach && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddLinkOpen(true); }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="plus.circle" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.secondary }}>Add Link</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>

      {/* ── Add Featured Sheet ── */}
      <BottomSheet visible={addFeatOpen} onClose={() => setAddFeatOpen(false)} useModal title="Add Featured">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 6 }}>
            <Text style={sheetLabel}>Type</Text>
            <Pressable
              onPress={pickFeatType}
              style={({ pressed }) => sheetPickerStyle(C, pressed)}
            >
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>{newFeatType}</Text>
              <IconSymbol name="chevron.down" size={14} color={C.secondary} />
            </Pressable>
          </View>
          <SheetField label="Title" value={newFeatTitle} onChange={setNewFeatTitle} placeholder="e.g. Season Highlights Reel" C={C} />
          <SheetField label="Subtitle" value={newFeatSub} onChange={setNewFeatSub} placeholder="e.g. 4.2K views" C={C} />
          <SheetSubmit label="Add" onPress={handleAddFeatured} C={C} />
        </ScrollView>
      </BottomSheet>

      {/* ── Add Link Sheet ── */}
      <BottomSheet visible={addLinkOpen} onClose={() => setAddLinkOpen(false)} useModal title="Add Link">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }} keyboardShouldPersistTaps="handled">
          <SheetField label="Title" value={newLinkTitle} onChange={setNewLinkTitle} placeholder="e.g. Game Film" C={C} />
          <SheetField label="Subtitle" value={newLinkSub} onChange={setNewLinkSub} placeholder="e.g. Full season footage" C={C} />
          <SheetSubmit label="Add Link" onPress={handleAddLink} C={C} />
        </ScrollView>
      </BottomSheet>

    </View>
  );
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────

const sheetLabel: any = {
  fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
  letterSpacing: 0.5, color: '#9C9790',
};

function sheetPickerStyle(C: any, pressed: boolean) {
  return {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.separator,
    padding: 14, flexDirection: 'row' as const, alignItems: 'center' as const,
    opacity: pressed ? 0.8 : 1,
  };
}

function SheetField({ label, value, onChange, placeholder, C, multiline }: {
  label: string; value: string; onChange: (t: string) => void;
  placeholder: string; C: any; multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={sheetLabel}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: C.surface, borderRadius: 12,
          borderWidth: 1, borderColor: C.separator,
          padding: 14, fontSize: 15, color: C.label,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.secondary}
        multiline={multiline}
      />
    </View>
  );
}

function SheetSubmit({ label, onPress, C }: { label: string; onPress: () => void; C: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: C.label, borderRadius: 14,
        paddingVertical: 15, alignItems: 'center' as const, marginTop: 4, opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>{label}</Text>
    </Pressable>
  );
}
