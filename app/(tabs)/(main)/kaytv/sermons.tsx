/**
 * Sermons — Community KTV default screen.
 * Featured banner, series carousel, segment pills (Sermons / Worship / Events / About).
 * Pastor: + FAB for upload, three-dot menu on each row.
 * Member: like and save buttons on each row.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

// ── Types ─────────────────────────────────────────────────────────────────────

type Pill = 'Sermons' | 'Worship' | 'Events' | 'About';

const PILLS: Pill[] = ['Sermons', 'Worship', 'Events', 'About'];

// ── Mock data ─────────────────────────────────────────────────────────────────

const FEATURED = {
  title: 'Greater Is He That Is In You',
  speaker: 'Pastor Michael Davis',
  date: 'Apr 6, 2026',
};

const SERIES = [
  { id: 's1', title: 'Faith Over Fear',     count: 6, hue: 200 },
  { id: 's2', title: 'Rooted & Grounded',   count: 4, hue: 140 },
  { id: 's3', title: 'Walking in Purpose',  count: 8, hue: 30  },
  { id: 's4', title: 'New Beginnings',      count: 3, hue: 280 },
];

const SERMONS = [
  { id: 'v1', title: 'Greater Is He That Is In You',  speaker: 'Pastor Davis',   date: 'Apr 6, 2026',  scripture: '1 John 4:4',          duration: '42:18' },
  { id: 'v2', title: 'Walking by Faith, Not by Sight',speaker: 'Elder Thomas',   date: 'Mar 30, 2026', scripture: '2 Corinthians 5:7',    duration: '38:55' },
  { id: 'v3', title: 'The Power of Gratitude',        speaker: 'Pastor Davis',   date: 'Mar 23, 2026', scripture: '1 Thessalonians 5:18', duration: '44:02' },
  { id: 'v4', title: 'Renewing Your Mind',             speaker: 'Deacon Williams',date: 'Mar 16, 2026', scripture: 'Romans 12:2',          duration: '35:40' },
  { id: 'v5', title: 'The Armor of God',               speaker: 'Pastor Davis',   date: 'Mar 9, 2026',  scripture: 'Ephesians 6:10-18',    duration: '47:22' },
];

const WORSHIP = [
  { id: 'w1', title: 'Sunday Morning Worship — Apr 6',  date: 'Apr 6, 2026',  duration: '58:30' },
  { id: 'w2', title: 'Wednesday Night Praise',          date: 'Apr 2, 2026',  duration: '45:10' },
  { id: 'w3', title: 'Sunday Morning Worship — Mar 30', date: 'Mar 30, 2026', duration: '55:48' },
];

const EVENTS = [
  { id: 'e1', title: 'Easter Sunday Service 2026',   date: 'Apr 5, 2026',  duration: '1:32:14' },
  { id: 'e2', title: 'Good Friday Prayer Service',   date: 'Apr 3, 2026',  duration: '48:22'   },
];

const ABOUT_INFO = {
  church:    'New Life Community Church',
  address:   '4820 Kings Drive, Atlanta, GA 30303',
  services:  ['Sun 9:00 AM', 'Sun 11:00 AM', 'Wed 7:00 PM'],
  pastor:    'Pastor Michael Davis',
  contact:   'newlife@newlifeatl.org',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SermonsPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const s       = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaytv');
  const isPastor = role === roleCycles[0];

  const [activePill, setActivePill] = useState<Pill>('Sermons');
  const [menuOpen, setMenuOpen]     = useState<string | null>(null);
  const [liked, setLiked]           = useState<Set<string>>(new Set());
  const [saved, setSaved]           = useState<Set<string>>(new Set());

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const topBarH = insets.top + TOP_BAR_H;

  const toggleLike = (id: string) => {
    Haptics.selectionAsync();
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSave = (id: string) => {
    Haptics.selectionAsync();
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleSermonMenu = (title: string, action: string) => {
    setMenuOpen(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (action === 'Delete') {
      Alert.alert(`Delete "${title}"?`, 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]);
    } else if (action === 'Set as Featured') {
      Alert.alert('Featured Updated', `"${title}" is now the featured sermon.`);
    } else {
      Alert.alert(action, `"${title}"`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={s.kBtn}
          >
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Sermons</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        onStartShouldSetResponder={() => { if (menuOpen) { setMenuOpen(null); return true; } return false; }}
      >
        {/* ── Featured Banner ── */}
        <View style={[s.featuredBanner, { backgroundColor: C.label }]}>
          <View style={s.featuredInner}>
            <Text style={s.featuredLabel}>FEATURED SERMON</Text>
            <Text style={s.featuredTitle} numberOfLines={2}>{FEATURED.title}</Text>
            <Text style={s.featuredMeta}>{FEATURED.speaker} · {FEATURED.date}</Text>
          </View>
          <Pressable
            onPress={() => Alert.alert('Play', FEATURED.title)}
            style={[s.playBtn, { backgroundColor: C.bg }]}
          >
            <Text style={[s.playBtnText, { color: C.label }]}>Play</Text>
          </Pressable>
        </View>

        {/* ── Series Carousel ── */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Series</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
          style={{ marginBottom: 20 }}
        >
          {SERIES.map(series => (
            <Pressable
              key={series.id}
              onPress={() => Alert.alert(series.title, `${series.count} sermons`)}
              style={[s.seriesCard, { backgroundColor: C.surface }]}
            >
              <View style={[s.seriesCover, { backgroundColor: `hsl(${series.hue},30%,${C.bg === '#FFFFFF' ? 88 : 22}%)` }]}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: `hsl(${series.hue},40%,${C.bg === '#FFFFFF' ? 30 : 70}%)` }}>
                  {series.title.charAt(0)}
                </Text>
              </View>
              <Text style={[s.seriesTitle, { color: C.label }]} numberOfLines={2}>{series.title}</Text>
              <Text style={[s.seriesCount, { color: C.secondary }]}>{series.count} sermons</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Segment Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 2 }}
          style={{ marginBottom: 16 }}
        >
          {PILLS.map(pill => {
            const active = activePill === pill;
            return (
              <Pressable
                key={pill}
                onPress={() => { Haptics.selectionAsync(); setActivePill(pill); }}
                style={[s.segmentPill, { backgroundColor: active ? C.label : C.surface }]}
              >
                <Text style={[s.segmentText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Content by Pill ── */}

        {activePill === 'Sermons' && (
          <View style={{ gap: 2, paddingHorizontal: 16 }}>
            {SERMONS.map(sermon => (
              <View key={sermon.id} style={[s.contentRow, { borderBottomColor: C.separator }]}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.contentTitle, { color: C.label }]} numberOfLines={2}>{sermon.title}</Text>
                  <Text style={[s.contentMeta, { color: C.secondary }]}>{sermon.speaker} · {sermon.date}</Text>
                  <Text style={[s.contentMeta, { color: C.secondary }]}>{sermon.scripture} · {sermon.duration}</Text>
                </View>

                {isPastor ? (
                  <View>
                    <Pressable
                      onPress={() => { Haptics.selectionAsync(); setMenuOpen(menuOpen === sermon.id ? null : sermon.id); }}
                      style={{ padding: 6 }}
                    >
                      <IconSymbol name="ellipsis" size={16} color={C.secondary} />
                    </Pressable>
                    {menuOpen === sermon.id && (
                      <View style={[s.menuDropdown, { backgroundColor: C.bg, borderColor: C.separator }]}>
                        {['Edit', 'Set as Featured', 'Delete'].map((action, idx, arr) => (
                          <Pressable
                            key={action}
                            onPress={() => handleSermonMenu(sermon.title, action)}
                            style={({ pressed }) => [{
                              flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10,
                              padding: 12, opacity: pressed ? 0.7 : 1,
                              borderBottomWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                              borderBottomColor: C.separator,
                            }]}
                          >
                            <IconSymbol
                              name={action === 'Edit' ? 'pencil' : action === 'Set as Featured' ? 'star.fill' : 'trash'}
                              size={14}
                              color={action === 'Delete' ? '#B85C5C' : C.secondary}
                            />
                            <Text style={{ fontSize: 14, color: action === 'Delete' ? '#B85C5C' : C.label }}>{action}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Pressable onPress={() => toggleLike(sermon.id)}>
                      <IconSymbol
                        name={liked.has(sermon.id) ? 'heart.fill' : 'heart'}
                        size={18}
                        color={liked.has(sermon.id) ? '#B85C5C' : C.secondary}
                      />
                    </Pressable>
                    <Pressable onPress={() => toggleSave(sermon.id)}>
                      <IconSymbol
                        name={saved.has(sermon.id) ? 'bookmark.fill' : 'bookmark'}
                        size={18}
                        color={saved.has(sermon.id) ? C.label : C.secondary}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {activePill === 'Worship' && (
          <View style={{ gap: 2, paddingHorizontal: 16 }}>
            {WORSHIP.map(item => (
              <Pressable
                key={item.id}
                onPress={() => Alert.alert('Play', item.title)}
                style={[s.contentRow, { borderBottomColor: C.separator }]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.contentTitle, { color: C.label }]}>{item.title}</Text>
                  <Text style={[s.contentMeta, { color: C.secondary }]}>{item.date} · {item.duration}</Text>
                </View>
                <IconSymbol name="play.circle.fill" size={28} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        )}

        {activePill === 'Events' && (
          <View style={{ gap: 2, paddingHorizontal: 16 }}>
            {EVENTS.map(item => (
              <Pressable
                key={item.id}
                onPress={() => Alert.alert('Play', item.title)}
                style={[s.contentRow, { borderBottomColor: C.separator }]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.contentTitle, { color: C.label }]}>{item.title}</Text>
                  <Text style={[s.contentMeta, { color: C.secondary }]}>{item.date} · {item.duration}</Text>
                </View>
                <IconSymbol name="play.circle.fill" size={28} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        )}

        {activePill === 'About' && (
          <View style={{ paddingHorizontal: 16, gap: 14 }}>
            <View style={[s.aboutCard, { backgroundColor: C.surface }]}>
              <Text style={[s.aboutLabel, { color: C.secondary }]}>Church</Text>
              <Text style={[s.aboutValue, { color: C.label }]}>{ABOUT_INFO.church}</Text>
            </View>
            <View style={[s.aboutCard, { backgroundColor: C.surface }]}>
              <Text style={[s.aboutLabel, { color: C.secondary }]}>Address</Text>
              <Text style={[s.aboutValue, { color: C.label }]}>{ABOUT_INFO.address}</Text>
            </View>
            <View style={[s.aboutCard, { backgroundColor: C.surface }]}>
              <Text style={[s.aboutLabel, { color: C.secondary }]}>Service Times</Text>
              {ABOUT_INFO.services.map(t => (
                <Text key={t} style={[s.aboutValue, { color: C.label }]}>{t}</Text>
              ))}
            </View>
            <View style={[s.aboutCard, { backgroundColor: C.surface }]}>
              <Text style={[s.aboutLabel, { color: C.secondary }]}>Lead Pastor</Text>
              <Text style={[s.aboutValue, { color: C.label }]}>{ABOUT_INFO.pastor}</Text>
            </View>
            <View style={[s.aboutCard, { backgroundColor: C.surface }]}>
              <Text style={[s.aboutLabel, { color: C.secondary }]}>Contact</Text>
              <Text style={[s.aboutValue, { color: C.label }]}>{ABOUT_INFO.contact}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ── FAB (Pastor only) ── */}
      {isPastor && (
        <Pressable
          onPress={() => Alert.alert('Upload', 'Upload a new sermon video.')}
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 66 }]}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    kBtn:        { width: 40, alignItems: 'center' },
    titleWrap:   { flex: 1, alignItems: 'center' },
    titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:   { fontSize: 13, fontWeight: '700' },
    rolePillWrap:{ alignItems: 'flex-end' },

    featuredBanner: { marginHorizontal: 16, borderRadius: 16, height: 180, padding: 18, justifyContent: 'space-between', marginBottom: 24 },
    featuredInner:  { flex: 1, gap: 6 },
    featuredLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.6)' },
    featuredTitle:  { fontSize: 20, fontWeight: '800', color: '#FFFFFF', lineHeight: 26 },
    featuredMeta:   { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    playBtn:        { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    playBtnText:    { fontSize: 13, fontWeight: '700' },

    sectionHeader: { fontSize: 17, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },

    seriesCard:  { width: 120, borderRadius: 12, overflow: 'hidden', paddingBottom: 10 },
    seriesCover: { height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    seriesTitle: { fontSize: 12, fontWeight: '600', paddingHorizontal: 8, lineHeight: 16 },
    seriesCount: { fontSize: 11, paddingHorizontal: 8, marginTop: 2 },

    segmentPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    segmentText: { fontSize: 13, fontWeight: '600' },

    contentRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
    },
    contentTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
    contentMeta:  { fontSize: 12 },

    menuDropdown: {
      position: 'absolute', top: 28, right: 0, borderRadius: 12, borderWidth: 1,
      zIndex: 20, minWidth: 170, shadowColor: '#000', shadowOpacity: 0.1,
      shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },

    aboutCard:  { borderRadius: 12, padding: 14, gap: 4 },
    aboutLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    aboutValue: { fontSize: 14, lineHeight: 20 },

    fab: {
      position: 'absolute', right: 20, width: 52, height: 52,
      borderRadius: 26, alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
  });
}
