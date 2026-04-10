/**
 * Manage Videos — KTV owner video management page.
 * Filter pills: All / Published / Scheduled / Draft / Processing
 * Search + sort, video list with three-dot menu, bulk select.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Semantic colors ────────────────────────────────────────────────────────────
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

// ── Types ─────────────────────────────────────────────────────────────────────
type VideoStatus = 'Published' | 'Scheduled' | 'Draft' | 'Processing';
type FilterTab   = 'All' | VideoStatus;
type SortOrder   = 'Recent' | 'Popular' | 'Oldest';

type ManagedVideo = {
  id: string;
  title: string;
  emoji: string;
  hue: number;
  duration: string;
  views: string;
  likes: string;
  status: VideoStatus;
  date: string;
  series: string | null;
  scheduledFor?: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const VIDEOS: ManagedVideo[] = [
  { id: 'pk11', title: 'Day in My Life - Coach & CEO',           emoji: '🌟', hue: 45,  duration: '16:22', views: '8.9K', likes: '412', status: 'Published',  date: 'Apr 5, 2026',   series: null },
  { id: 'pk8',  title: 'How I Use AI to Build Faster',           emoji: '⚡', hue: 280, duration: '7:30',  views: '6.8K', likes: '287', status: 'Published',  date: 'Apr 3, 2026',   series: 'Creator Toolkit' },
  { id: 'pk1',  title: 'Why I Built an OS',                      emoji: '🏗️',  hue: 200, duration: '12:34', views: '5.1K', likes: '198', status: 'Published',  date: 'Mar 22, 2026',  series: 'Building KaNeXT' },
  { id: 'pk10', title: 'Brand Deal Negotiation Tips',            emoji: '🤝', hue: 320, duration: '11:42', views: '4.1K', likes: '163', status: 'Published',  date: 'Mar 18, 2026',  series: 'Creator Toolkit' },
  { id: 'pk5',  title: 'Why System Fit Matters More Than Talent',emoji: '🧩', hue: 150, duration: '9:45',  views: '4.2K', likes: '189', status: 'Published',  date: 'Mar 14, 2026',  series: 'Coaching Philosophy' },
  { id: 'pk9',  title: 'My Content Creation Workflow',           emoji: '🎬', hue: 300, duration: '8:55',  views: '3.4K', likes: '142', status: 'Published',  date: 'Mar 14, 2026',  series: 'Creator Toolkit' },
  { id: 'pk4',  title: 'From Coach to CEO',                      emoji: '🎯', hue: 30,  duration: '10:15', views: '3.2K', likes: '128', status: 'Published',  date: 'Mar 10, 2026',  series: 'Building KaNeXT' },
  { id: 'pk6',  title: 'Building Culture at Lincoln',            emoji: '🏛️', hue: 165, duration: '11:20', views: '2.8K', likes: '112', status: 'Published',  date: 'Mar 5, 2026',   series: 'Coaching Philosophy' },
  { id: 'pk2',  title: 'KaNeXT Product Demo',                    emoji: '📱', hue: 220, duration: '8:22',  views: '2.4K', likes: '97',  status: 'Published',  date: 'Feb 28, 2026',  series: 'Building KaNeXT' },
  { id: 'pk12', title: 'Q&A: Ask Me Anything March 2026',        emoji: '🎙️', hue: 190, duration: '22:15', views: '2.1K', likes: '84',  status: 'Published',  date: 'Feb 24, 2026',  series: null },
  // Scheduled
  { id: 'ps1',  title: 'Player Profile: Marcus James',           emoji: '🏀', hue: 120, duration: '14:30', views: '—',   likes: '—',  status: 'Scheduled',  date: 'Mar 27, 2026',  series: 'Coaching Philosophy', scheduledFor: 'Mar 27 · 9:00 AM' },
  { id: 'ps2',  title: 'Weekly Roundup - March Week 4',          emoji: '📋', hue: 60,  duration: '8:15',  views: '—',   likes: '—',  status: 'Scheduled',  date: 'Mar 28, 2026',  series: null, scheduledFor: 'Mar 28 · 8:00 AM' },
];

const FILTER_TABS: FilterTab[] = ['All', 'Published', 'Scheduled', 'Draft', 'Processing'];

const STATUS_COLOR: Record<VideoStatus, string> = {
  Published:  GAIN,
  Scheduled:  CAUTION,
  Draft:      '#8A837C',
  Processing: '#8A837C',
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ManageVideosPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const { filter: filterParam } = useLocalSearchParams<{ filter?: string }>();

  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/kaytv/my-channel' as any);
  }, [isOwner]);

  const initialFilter = (FILTER_TABS.includes(filterParam as FilterTab) ? filterParam : 'All') as FilterTab;
  const [activeFilter, setActiveFilter] = useState<FilterTab>(initialFilter);
  const [sort, setSort]     = useState<SortOrder>('Recent');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (filterParam && FILTER_TABS.includes(filterParam as FilterTab)) {
      setActiveFilter(filterParam as FilterTab);
    }
  }, [filterParam]));

  const styles = useMemo(() => makeStyles(C), [C]);

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = VIDEOS.filter(v => activeFilter === 'All' || v.status === activeFilter);
    if (search.trim()) {
      list = list.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (sort === 'Popular') {
      list = [...list].sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    } else if (sort === 'Oldest') {
      list = [...list].reverse();
    }
    return list;
  }, [activeFilter, search, sort]);

  // Stat cards
  const totalVideos     = VIDEOS.length;
  const publishedCount  = VIDEOS.filter(v => v.status === 'Published').length;
  const scheduledCount  = VIDEOS.filter(v => v.status === 'Scheduled').length;

  const handleMenu = (video: ManagedVideo, action: string) => {
    setMenuOpen(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (action === 'Delete') {
      Alert.alert(
        `Delete "${video.title}"?`,
        'This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {} },
        ]
      );
    }
  };

  const topBarH = insets.top + 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: C.bg }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: C.separator }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Manage Videos</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onStartShouldSetResponder={() => { if (menuOpen) { setMenuOpen(null); return true; } return false; }}
      >

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 }}>
          {[
            { label: 'Total', value: totalVideos.toString(),    filter: 'All'       as FilterTab },
            { label: 'Published', value: publishedCount.toString(), filter: 'Published' as FilterTab },
            { label: 'Scheduled', value: scheduledCount.toString(), filter: 'Scheduled' as FilterTab },
          ].map(card => (
            <Pressable
              key={card.label}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(card.filter); }}
              style={{ flex: 1, backgroundColor: activeFilter === card.filter ? C.label : C.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: activeFilter === card.filter ? C.bg : C.label }}>{card.value}</Text>
              <Text style={{ fontSize: 10, marginTop: 2, color: activeFilter === card.filter ? C.bg + 'CC' : C.secondary }}>{card.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Filter Pills ────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }} style={{ marginBottom: 12 }}>
          {FILTER_TABS.map(tab => {
            const active = activeFilter === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(tab); }}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? C.activePill : C.surface }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Search + Sort ───────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 12, gap: 8 }}>
            <IconSymbol name="magnifyingglass" size={14} color={C.secondary} />
            <TextInput
              style={{ flex: 1, fontSize: 14, color: C.label, paddingVertical: 10 }}
              placeholder="Search videos..."
              placeholderTextColor={C.secondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <IconSymbol name="xmark.circle.fill" size={14} color={C.secondary} />
              </Pressable>
            )}
          </View>
          {/* Sort */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['Recent', 'Popular', 'Oldest'] as SortOrder[]).map(s => (
              <Pressable
                key={s}
                onPress={() => { Haptics.selectionAsync(); setSort(s); }}
                style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: sort === s ? C.activePill : C.surface }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: sort === s ? C.activePillText : C.secondary }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Video List ──────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, textAlign: 'center' }}>
              {activeFilter === 'All' ? 'No videos yet.' : `No ${activeFilter.toLowerCase()} videos.`}
            </Text>
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center', marginTop: 6 }}>
              {activeFilter === 'Scheduled'
                ? 'Upload a video and set a future publish date.'
                : activeFilter === 'All'
                ? 'Tap Upload in the sidebar to get started.'
                : ''}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, paddingHorizontal: 16 }}>
            {filtered.map(video => (
              <View key={video.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 12 }}>
                {/* Thumbnail */}
                <View style={{ width: 80, height: 54, borderRadius: 8, backgroundColor: `hsl(${video.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 22 }}>{video.emoji}</Text>
                  <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                    <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>{video.duration}</Text>
                  </View>
                </View>

                {/* Content */}
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, lineHeight: 18 }} numberOfLines={2}>{video.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: STATUS_COLOR[video.status] + '22', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: STATUS_COLOR[video.status] }}>{video.status}</Text>
                    </View>
                    {video.scheduledFor && (
                      <Text style={{ fontSize: 10, color: CAUTION }}>🕐 {video.scheduledFor}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 10, color: C.secondary }}>
                    {video.series ? `${video.series} · ` : ''}{video.date}
                  </Text>
                  {video.status === 'Published' && (
                    <Text style={{ fontSize: 10, color: C.secondary }}>{video.views} views · {video.likes} likes</Text>
                  )}
                </View>

                {/* Three-dot menu */}
                <View style={{ alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { Haptics.selectionAsync(); setMenuOpen(menuOpen === video.id ? null : video.id); }}
                    style={{ padding: 6 }}
                  >
                    <IconSymbol name="ellipsis" size={16} color={C.secondary} />
                  </Pressable>
                  {menuOpen === video.id && (
                    <View style={{ position: 'absolute', top: 28, right: 0, backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.separator, zIndex: 20, minWidth: 160, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 }}>
                      {[
                        { label: 'Edit', icon: 'pencil' },
                        ...(video.status === 'Scheduled' ? [{ label: 'Reschedule', icon: 'clock' }, { label: 'Publish Now', icon: 'arrow.up.circle' }] : []),
                        ...(video.status === 'Draft' ? [{ label: 'Publish Now', icon: 'arrow.up.circle' }] : []),
                        ...(video.status === 'Published' ? [{ label: 'Move to Draft', icon: 'tray' }] : []),
                        { label: 'Duplicate', icon: 'doc.on.doc' },
                        { label: 'Delete', icon: 'trash' },
                      ].map((action, idx, arr) => (
                        <Pressable
                          key={action.label}
                          onPress={() => handleMenu(video, action.label)}
                          style={({ pressed }) => [{
                            flexDirection: 'row', alignItems: 'center', gap: 10,
                            padding: 12, opacity: pressed ? 0.7 : 1,
                            borderBottomWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                            borderBottomColor: C.separator,
                          }]}
                        >
                          <IconSymbol name={action.icon as any} size={14} color={action.label === 'Delete' ? HEAT : C.secondary} />
                          <Text style={{ fontSize: 14, color: action.label === 'Delete' ? HEAT : C.label }}>{action.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function makeStyles(C: ComponentColors) {
  return StyleSheet.create({});
}
