/**
 * KayTV Side Panel
 * Sections: Quick Nav · Subscriptions · Watch Later · Recently Watched ·
 *           Playlists · Creator (admin) · Settings
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode, useOperatingRole } from '@/context/app-context';
import {
  getSubscriptions, getWatchLaterFeed, getWatchHistoryFeed, getPlaylists,
  getMyChannelStats, getMyUploads, getScheduledVideos,
  type KayTVFeedItem,
} from '@/data/mock-kaytv';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CREATOR_ROLES = new Set(['founder', 'head_coach', 'athletic_director', 'principal', 'admin', 'owner', 'coach']);

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Simulate a watch progress (0–1) per video id
const PROGRESS: Record<string, number> = {
  default: 0.0,
};
function watchProgress(id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round(((seed % 7) / 10 + 0.1) * 10) / 10; // 0.1 – 0.7
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, C, styles }: { label: string; C: ComponentColors; styles: any }) {
  return <Text style={[styles.sectionHeader, { color: C.secondary }]}>{label}</Text>;
}

function NavRow({
  icon, label, detail, C, styles, onPress,
}: { icon: string; label: string; detail?: string; C: ComponentColors; styles: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={17} color={C.secondary} />
      <Text style={[styles.navLabel, { color: C.label }]}>{label}</Text>
      {detail ? <Text style={[styles.navDetail, { color: C.muted }]}>{detail}</Text> : null}
      <IconSymbol name="chevron.right" size={13} color={C.muted} />
    </Pressable>
  );
}

function MiniVideoRow({
  video, progress, C, styles,
}: { video: KayTVFeedItem; progress?: number; C: ComponentColors; styles: any }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.miniRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
    >
      <View style={[styles.miniThumb, { backgroundColor: `hsl(${video.thumbHue},35%,30%)` }]}>
        <Text style={styles.miniEmoji}>{video.thumbEmoji}</Text>
        <View style={styles.miniDuration}>
          <Text style={styles.miniDurationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.miniInfo}>
        <Text style={[styles.miniTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.miniSub, { color: C.muted }]}>{video.uploaderName}</Text>
        {progress != null && progress > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: C.separator }]}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: C.accent }]} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function KayTVPanel() {
  const C = useColors();
  const mode = useMode();
  const role = useOperatingRole();
  const isCreator = CREATOR_ROLES.has(role);
  const styles = useMemo(() => makeStyles(C), [C]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manageOpen,   setManageOpen]   = useState(false);

  const subscriptions  = useMemo(() => getSubscriptions(mode), [mode]);
  const watchLater     = useMemo(() => getWatchLaterFeed(mode).slice(0, 5), [mode]);
  const recentlyWatched = useMemo(() => getWatchHistoryFeed(mode).slice(0, 5), [mode]);
  const playlists      = useMemo(() => getPlaylists(), []);
  const channelStats   = useMemo(() => getMyChannelStats(), []);
  const myUploads      = useMemo(() => getMyUploads(), []);
  const scheduled      = useMemo(() => getScheduledVideos(), []);

  const close = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Title ── */}
      <Text style={[styles.title, { color: C.label }]}>KayTV</Text>

      {/* ── Quick Nav ── */}
      <SectionHeader label="NAVIGATE" C={C} styles={styles} />
      <View style={styles.section}>
        {([
          { icon: 'house',          label: 'Home'    },
          { icon: 'safari',         label: 'Explore' },
          { icon: 'folder',         label: 'Library' },
        ] as { icon: string; label: string }[]).map(item => (
          <NavRow key={item.label} icon={item.icon} label={item.label} C={C} styles={styles} onPress={close} />
        ))}
      </View>

      {/* ── Subscriptions ── */}
      <SectionHeader label="SUBSCRIPTIONS" C={C} styles={styles} />
      <View style={styles.section}>
        {subscriptions.map(sub => (
          <Pressable
            key={sub.brandName}
            style={({ pressed }) => [styles.subRow, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={close}
          >
            <View style={[styles.subAvatar, { backgroundColor: `hsl(${sub.hue},40%,35%)` }]}>
              <Text style={styles.subAvatarText}>{sub.initials}</Text>
            </View>
            <View style={styles.subInfo}>
              <Text style={[styles.subName, { color: C.label }]}>{sub.brandName}</Text>
              <Text style={[styles.subHandle, { color: C.muted }]}>{sub.handle}</Text>
            </View>
            {sub.hasNew && (
              <View style={[styles.newBadge, { backgroundColor: C.accent }]}>
                <Text style={styles.newBadgeText}>{sub.newCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* ── Watch Later ── */}
      <SectionHeader label="WATCH LATER" C={C} styles={styles} />
      <View style={styles.section}>
        {watchLater.length === 0
          ? <Text style={[styles.emptyNote, { color: C.muted }]}>No saved videos</Text>
          : watchLater.map(v => <MiniVideoRow key={v.id} video={v} C={C} styles={styles} />)
        }
      </View>

      {/* ── Recently Watched ── */}
      <SectionHeader label="RECENTLY WATCHED" C={C} styles={styles} />
      <View style={styles.section}>
        {recentlyWatched.map(v => (
          <MiniVideoRow key={v.id} video={v} progress={watchProgress(v.id)} C={C} styles={styles} />
        ))}
      </View>

      {/* ── Playlists ── */}
      <SectionHeader label="PLAYLISTS" C={C} styles={styles} />
      <View style={styles.section}>
        {playlists.map(pl => (
          <Pressable
            key={pl.id}
            style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={close}
          >
            <View style={[styles.playlistIcon, { backgroundColor: C.surface }]}>
              <IconSymbol name="list.bullet" size={14} color={C.secondary} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{pl.name}</Text>
            <Text style={[styles.navDetail, { color: C.muted }]}>{pl.videoCount} videos</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        ))}
        <NavRow icon="plus.circle" label="New Playlist" C={C} styles={styles} onPress={close} />
      </View>

      {/* ── Creator Section (admin/creator only) ── */}
      {isCreator && (
        <>
          <SectionHeader label="MY CHANNEL" C={C} styles={styles} />
          <View style={styles.section}>

            {/* Stats row */}
            <View style={[styles.statsRow, { backgroundColor: C.surface }]}>
              {[
                { label: 'Uploads',     value: String(channelStats.uploadCount) },
                { label: 'Views',       value: fmtViews(channelStats.totalViews) },
                { label: 'Subscribers', value: fmtViews(channelStats.subscriberCount) },
              ].map(s => (
                <View key={s.label} style={styles.statCell}>
                  <Text style={[styles.statValue, { color: C.label }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: C.muted }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Analytics preview */}
            <View style={[styles.analyticsCard, { backgroundColor: C.surface }]}>
              <View style={styles.analyticsRow}>
                <Text style={[styles.analyticsLabel, { color: C.secondary }]}>Views this week</Text>
                <Text style={[styles.analyticsValue, { color: C.label }]}>{fmtViews(channelStats.viewsThisWeek)}</Text>
              </View>
              <View style={styles.analyticsRow}>
                <Text style={[styles.analyticsLabel, { color: C.secondary }]}>Subscriber growth</Text>
                <Text style={[styles.analyticsValue, { color: C.green }]}>+{channelStats.subGrowth}%</Text>
              </View>
              <View style={[styles.analyticsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.analyticsLabel, { color: C.secondary }]}>Top video</Text>
                <Text style={[styles.analyticsValueSm, { color: C.label }]} numberOfLines={1}>{channelStats.topVideoTitle}</Text>
              </View>
            </View>

            {/* Upload shortcut */}
            <NavRow icon="square.and.arrow.up" label="Upload Video" C={C} styles={styles} onPress={close} />

            {/* Manage Videos (expand) */}
            <Pressable
              style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setManageOpen(v => !v); }}
            >
              <IconSymbol name="film" size={17} color={C.secondary} />
              <Text style={[styles.navLabel, { color: C.label }]}>Manage Videos</Text>
              <Text style={[styles.navDetail, { color: C.muted }]}>{myUploads.length} videos</Text>
              <IconSymbol name={manageOpen ? 'chevron.up' : 'chevron.down'} size={13} color={C.muted} />
            </Pressable>

            {manageOpen && myUploads.map(u => (
              <View key={u.id} style={[styles.manageRow, { borderBottomColor: C.separator }]}>
                <View style={[styles.manageThumb, { backgroundColor: `hsl(${u.thumbHue},35%,30%)` }]}>
                  <Text style={{ fontSize: 12 }}>{u.thumbEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.manageTitle, { color: C.label }]} numberOfLines={1}>{u.title}</Text>
                  <Text style={[styles.manageMeta, { color: C.muted }]}>
                    {u.status === 'draft' ? 'Draft' : `${fmtViews(u.viewCount)} views · ${u.publishedDate}`}
                  </Text>
                </View>
                <View style={styles.manageActions}>
                  <Pressable hitSlop={8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <IconSymbol name="pencil" size={14} color={C.secondary} />
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Scheduled */}
            {scheduled.length > 0 && (
              <>
                <View style={[styles.divider, { backgroundColor: C.separator }]} />
                <Text style={[styles.subSectionLabel, { color: C.secondary }]}>Scheduled</Text>
                {scheduled.map(s => (
                  <View key={s.id} style={[styles.manageRow, { borderBottomColor: C.separator }]}>
                    <View style={[styles.manageThumb, { backgroundColor: `hsl(${s.thumbHue},35%,30%)` }]}>
                      <Text style={{ fontSize: 12 }}>{s.thumbEmoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.manageTitle, { color: C.label }]} numberOfLines={1}>{s.title}</Text>
                      <Text style={[styles.manageMeta, { color: C.accent }]}>{s.scheduledDate}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        </>
      )}

      {/* ── Settings ── */}
      <Pressable
        style={[styles.settingsToggle]}
        onPress={() => { Haptics.selectionAsync(); setSettingsOpen(v => !v); }}
      >
        <Text style={[styles.sectionHeader, { color: C.secondary, marginBottom: 0 }]}>SETTINGS</Text>
        <IconSymbol name={settingsOpen ? 'chevron.up' : 'chevron.down'} size={13} color={C.muted} />
      </Pressable>

      {settingsOpen && (
        <View style={styles.section}>
          {([
            { icon: 'play.circle',        label: 'Autoplay',             detail: 'On' },
            { icon: 'square.3.layers.3d', label: 'Default Quality',      detail: '1080p' },
            { icon: 'captions.bubble',    label: 'Captions',             detail: 'Off' },
            { icon: 'bell',               label: 'Subscription Alerts',  detail: 'On' },
            { icon: 'bell.badge',         label: 'Live Notifications',   detail: 'All' },
          ] as { icon: string; label: string; detail: string }[]).map(item => (
            <NavRow key={item.label} icon={item.icon} label={item.label} detail={item.detail} C={C} styles={styles} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container:      { flex: 1 },
  title:          { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 20 },

  sectionHeader:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 4, marginTop: 16 },
  section:        { marginBottom: 4 },

  navRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  navLabel:       { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:      { fontSize: 12, marginRight: 2 },

  // Subscriptions
  subRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  subAvatar:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  subAvatarText:  { fontSize: 12, fontWeight: '700', color: '#fff' },
  subInfo:        { flex: 1 },
  subName:        { fontSize: 13, fontWeight: '600' },
  subHandle:      { fontSize: 11, marginTop: 1 },
  newBadge:       { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  newBadgeText:   { fontSize: 10, fontWeight: '700', color: '#fff' },

  // Mini video rows
  miniRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  miniThumb:      { width: 72, height: 42, borderRadius: 4, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  miniEmoji:      { fontSize: 18 },
  miniDuration:   { position: 'absolute', bottom: 3, right: 3, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 2, paddingHorizontal: 3 },
  miniDurationText: { fontSize: 9, color: '#fff', fontWeight: '600' },
  miniInfo:       { flex: 1, paddingTop: 1 },
  miniTitle:      { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  miniSub:        { fontSize: 11, marginTop: 2 },
  progressTrack:  { height: 2, borderRadius: 1, marginTop: 5, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 1 },

  // Playlists
  playlistIcon:   { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },

  // Creator stats
  statsRow:       { flexDirection: 'row', marginHorizontal: 16, borderRadius: 10, marginBottom: 8 },
  statCell:       { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statValue:      { fontSize: 16, fontWeight: '700' },
  statLabel:      { fontSize: 10, marginTop: 2 },

  // Analytics card
  analyticsCard:   { marginHorizontal: 16, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  analyticsRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  analyticsLabel:  { fontSize: 12 },
  analyticsValue:  { fontSize: 13, fontWeight: '600' },
  analyticsValueSm: { fontSize: 11, fontWeight: '500', maxWidth: 120 },

  // Manage videos
  divider:        { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginVertical: 8 },
  subSectionLabel: { fontSize: 11, fontWeight: '600', color: C.secondary, paddingHorizontal: 16, marginBottom: 4 },
  manageRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  manageThumb:    { width: 40, height: 28, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  manageTitle:    { fontSize: 12, fontWeight: '500' },
  manageMeta:     { fontSize: 10, marginTop: 2 },
  manageActions:  { gap: 10, flexDirection: 'row' },

  // Settings toggle
  settingsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },

  emptyNote:      { fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
});
