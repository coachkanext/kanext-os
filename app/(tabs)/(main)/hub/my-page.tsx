/**
 * My Page — Personal Mode Creator Profile & Link-in-Bio Builder.
 * Owner: full edit controls, preview mode toggle.
 * Follower / Preview: tabbed view — Overview | Content.
 * No filter icon in top bar on any follower page.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { PersonalSeasonCard } from '@/components/home/personal-season-card';

const LAOLU_HEADSHOT = require('@/assets/images/headshots/11-kalejaiye.png');
import {
  HUB_PROFILE, HUB_LINKS, HUB_PORTFOLIO, HUB_FEATURED, CONTENT_ITEMS,
  type HubLink, type PortfolioItem, type ContentType,
} from '@/data/mock-hub';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H   = 44;
const COVER_H     = 180;
const AVATAR_SIZE = 80;
const AVATAR_HALF = AVATAR_SIZE / 2;

// Links that open outside the app get an external arrow icon
const EXTERNAL_LINK_IDS = new Set(['l1', 'l3', 'l4']); // Official Website, LinkedIn, YouTube Channel

type ContentFilter = 'All' | 'Posts' | 'Reels' | 'KTV' | 'Stories';

const CONTENT_FILTER_MAP: Record<ContentFilter, ContentType | null> = {
  All: null, Posts: 'post', Reels: 'reel', KTV: 'ktv', Stories: 'story',
};

const TYPE_HUE: Record<ContentType, number> = {
  post: 200, reel: 140, ktv: 32, story: 270,
};

const SOCIAL_PLATFORMS = [
  { id: 's1', key: 'ig', platform: 'Instagram' },
  { id: 's2', key: 'x',  platform: 'X'         },
  { id: 's3', key: 'tk', platform: 'TikTok'    },
  { id: 's4', key: 'yt', platform: 'YouTube'   },
  { id: 's5', key: 'li', platform: 'LinkedIn'  },
];

const FA_BRAND: Record<string, string> = {
  ig: 'instagram', tk: 'tiktok', yt: 'youtube', li: 'linkedin',
};

function SocialIcon({ id, size, color }: { id: string; size: number; color: string }) {
  const fa = FA_BRAND[id];
  if (fa) return <FontAwesome5 name={fa as any} size={size} color={color} brand />;
  return (
    <Text style={{ fontSize: size * 0.85, fontWeight: '800', color, lineHeight: size * 1.1 }}>
      {id.toUpperCase()}
    </Text>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function typeIcon(type: ContentType): string {
  switch (type) {
    case 'reel':  return 'film';
    case 'ktv':   return 'play.rectangle.fill';
    case 'story': return 'circle.inset.filled';
    default:      return 'text.bubble';
  }
}

function formatViews(n?: number): string {
  if (!n) return '—';
  if (n >= 10000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDaysFromToday(days: number | null): string {
  if (days === null) return 'Draft';
  if (days === 0)    return 'Today';
  if (days === -1)   return 'Yesterday';
  if (days < 0) {
    const abs = Math.abs(days);
    if (abs < 7)  return `${abs} days ago`;
    if (abs < 14) return '1 week ago';
    return `${Math.round(abs / 7)} weeks ago`;
  }
  return 'Upcoming';
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MyPageScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole] = useDemoRole('personal:hub');
  const isOwner = role === 'Owner';

  const [previewMode,    setPreviewMode]    = useState(false);
  const [seasonCardKey,  setSeasonCardKey]  = useState(0);
  const [contentFilter,  setContentFilter]  = useState<ContentFilter>('All');
  const [links,          setLinks]          = useState<HubLink[]>(HUB_LINKS);
  const [portfolio,      setPortfolio]      = useState<PortfolioItem[]>(HUB_PORTFOLIO);

  const showEdit        = isOwner && !previewMode;
  const showVisitorView = !showEdit;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const deleteLink = (id: string) => {
    Alert.alert('Remove Link', 'Remove this link from your page?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setLinks(prev => prev.filter(l => l.id !== id)) },
    ]);
  };

  const publishedContent = useMemo(() =>
    CONTENT_ITEMS
      .filter(i => i.status === 'published')
      .sort((a, b) => (b.daysFromToday ?? 0) - (a.daysFromToday ?? 0)),
  []);

  const filteredContent = useMemo(() => {
    const type = CONTENT_FILTER_MAP[contentFilter];
    return type ? publishedContent.filter(i => i.type === type) : publishedContent;
  }, [publishedContent, contentFilter]);

  // ── Section renderers ────────────────────────────────────────────────────────

  const renderCoverAndAvatar = () => (
    <View>
      <Pressable
        style={[s.cover, { backgroundColor: C.surface }]}
        onPress={() => { if (!showEdit) return; haptic(); }}
        disabled={!showEdit}
      >
        <PersonalSeasonCard key={seasonCardKey} onDone={() => setSeasonCardKey(k => k + 1)} />
        {showEdit && (
          <View style={s.coverEditHint}>
            <IconSymbol name="camera.fill" size={14} color="#fff" />
            <Text style={[s.coverEditText, { color: '#fff' }]}>Tap to edit cover</Text>
          </View>
        )}
      </Pressable>
      <View style={s.avatarRow}>
        <Pressable
          style={[s.avatarWrap, { borderColor: C.bg }]}
          onPress={() => { if (!showEdit) return; haptic(); }}
          disabled={!showEdit}
        >
          <Image source={LAOLU_HEADSHOT} style={s.avatar} resizeMode="cover" />
          {showEdit && (
            <View style={[s.cameraBadge, { backgroundColor: C.bg, borderColor: C.separator }]}>
              <IconSymbol name="camera.fill" size={10} color={C.secondary} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderIdentity = () => (
    <View style={s.identitySection}>
      <Text style={[s.profileName, { color: C.label }]}>{HUB_PROFILE.name}</Text>
      <Text style={[s.profileHandle, { color: C.secondary }]}>{HUB_PROFILE.handle}</Text>
      <View style={s.locationRow}>
        <IconSymbol name="mappin" size={13} color={C.secondary} />
        <Text style={[s.locationText, { color: C.secondary }]}>{HUB_PROFILE.location}</Text>
      </View>
    </View>
  );

  const renderBio = () => (
    <GlassView tier={1} style={[s.bioCard, { backgroundColor: C.surface }]}>
      <View style={s.bioHeader}>
        <Text style={[s.bioTitle, { color: C.label }]}>About</Text>
        {showEdit && (
          <Pressable onPress={() => haptic()}>
            <Text style={[s.bioEditLink, { color: C.secondary }]}>Edit</Text>
          </Pressable>
        )}
      </View>
      <Text style={[s.bioText, { color: C.secondary }]}>{HUB_PROFILE.bio}</Text>
    </GlassView>
  );

  const renderSocials = () => (
    <View style={s.socialsRow}>
      {SOCIAL_PLATFORMS.map(p => (
        <Pressable
          key={p.id}
          style={[s.socialCircle, { backgroundColor: C.surface, borderColor: C.separator }]}
          onPress={() => haptic()}
        >
          <SocialIcon id={p.key} size={16} color={C.label} />
        </Pressable>
      ))}
      {showEdit && (
        <Pressable style={s.editSocialsBtn} onPress={() => haptic()}>
          <Text style={[s.editSocialsText, { color: C.secondary }]}>Edit Socials</Text>
        </Pressable>
      )}
    </View>
  );

  const renderStats = () => (
    <GlassView tier={1} style={[s.statsCard, { backgroundColor: C.surface }]}>
      <View style={s.statItem}>
        <Text style={[s.statValue, { color: C.label }]}>
          {HUB_PROFILE.followerCount.toLocaleString()}
        </Text>
        <Text style={[s.statLabel, { color: C.secondary }]}>Followers</Text>
      </View>
      <View style={[s.statDivider, { backgroundColor: C.separator }]} />
      <View style={s.statItem}>
        <Text style={[s.statValue, { color: C.label }]}>{HUB_PROFILE.postCount}</Text>
        <Text style={[s.statLabel, { color: C.secondary }]}>Posts</Text>
      </View>
    </GlassView>
  );

  const renderActions = () => (
    <View style={s.actionRow}>
      <Pressable
        style={[s.actionBtn, { backgroundColor: C.label, opacity: showEdit ? 0.45 : 1 }]}
        onPress={() => { if (showEdit) return; haptic(); }}
        disabled={showEdit}
      >
        <Text style={[s.actionBtnText, { color: C.bg }]}>Follow</Text>
      </Pressable>
      <Pressable
        style={[s.actionBtn, { backgroundColor: C.label, opacity: showEdit ? 0.45 : 1 }]}
        onPress={() => { if (showEdit) return; haptic(); }}
        disabled={showEdit}
      >
        <Text style={[s.actionBtnText, { color: C.bg }]}>Subscribe</Text>
      </Pressable>
    </View>
  );

  const renderLinks = () => (
    <View style={s.section}>
      <Text style={[s.sectionHeader, { color: C.label }]}>Links</Text>
      <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden' }}>
        {links.map((link, idx) => (
          <Pressable
            key={link.id}
            style={({ pressed }) => [
              s.linkRow,
              { backgroundColor: C.surface },
              idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              haptic();
              if (link.route) router.push(link.route as any);
            }}
          >
            {showEdit && (
              <IconSymbol name="line.3.horizontal" size={16} color={C.muted} style={{ marginRight: 4 }} />
            )}
            <View style={[s.linkIconWrap, { backgroundColor: C.bg }]}>
              <IconSymbol name={link.icon as any} size={16} color={C.secondary} />
            </View>
            <Text style={[s.linkTitle, { color: C.label }]} numberOfLines={1}>{link.title}</Text>
          </Pressable>
        ))}
      </GlassView>
      {showEdit && (
        <Pressable
          style={[s.addLinkBtn, { borderColor: C.separator }]}
          onPress={() => haptic()}
        >
          <IconSymbol name="plus" size={14} color={C.secondary} />
          <Text style={[s.addLinkText, { color: C.secondary }]}>Add Link</Text>
        </Pressable>
      )}
    </View>
  );

  const renderPortfolio = () => (
    <View style={s.section}>
      <View style={s.sectionHeaderRow}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Portfolio</Text>
        {showEdit && (
          <Pressable onPress={() => haptic()} style={s.addPortfolioBtn}>
            <IconSymbol name="plus" size={14} color={C.secondary} />
            <Text style={[s.addPortfolioText, { color: C.secondary }]}>Add</Text>
          </Pressable>
        )}
      </View>
      <View style={s.portfolioGrid}>
        {portfolio.map(item => {
          const thumbColor = `hsl(${item.thumbHue}, 30%, 42%)`;
          return (
            <Pressable
              key={item.id}
              style={[s.portfolioCard, { backgroundColor: C.surface }]}
              onPress={() => haptic()}
            >
              {item.thumbUri
                ? <Image source={{ uri: item.thumbUri }} style={s.portfolioThumb} resizeMode="cover" />
                : <View style={[s.portfolioThumb, { backgroundColor: thumbColor }]}>
                    <Text style={s.portfolioEmoji}>{item.thumbEmoji}</Text>
                  </View>
              }
              <View style={s.portfolioInfo}>
                <Text style={[s.portfolioTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[s.portfolioMeta, { color: C.secondary }]}>{item.category} · {item.year}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // Recent/Featured content — Overview tab only
  const renderRecentContent = () => (
    <View style={s.section}>
      <Text style={[s.sectionHeader, { color: C.label }]}>Recent Content</Text>
      <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden' }}>
        {HUB_FEATURED.map((item, idx) => {
          const thumbBg = `hsl(${item.thumbHue}, 28%, 42%)`;
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                s.featuredRow,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => haptic()}
            >
              {item.thumbUri
                ? <Image source={{ uri: item.thumbUri }} style={s.featuredThumb} resizeMode="cover" />
                : <View style={[s.featuredThumb, { backgroundColor: thumbBg }]}>
                    <Text style={s.featuredEmoji}>{item.thumbEmoji}</Text>
                  </View>
              }
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[s.featuredTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[s.featuredMeta, { color: C.secondary }]}>
                  {item.viewCount} views · {item.timestamp}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );

  // Content tab — feed of published content with filter pills
  const renderContentFeed = () => (
    <View style={{ paddingBottom: insets.bottom + 80 }}>
      {/* Filter pills — inside content, not in top bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
      >
        {(Object.keys(CONTENT_FILTER_MAP) as ContentFilter[]).map(f => {
          const active = contentFilter === f;
          return (
            <Pressable
              key={f}
              style={[s.filterPill, active
                ? { backgroundColor: C.label, borderColor: C.label }
                : { backgroundColor: C.surface, borderColor: C.separator }]}
              onPress={() => { haptic(); setContentFilter(f); }}
            >
              <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Feed */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        {filteredContent.length === 0 ? (
          <Text style={[{ textAlign: 'center', fontSize: 14, color: C.secondary, paddingVertical: 32 }]}>
            No content in this category yet.
          </Text>
        ) : (
          <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden' }}>
            {filteredContent.map((item, idx) => {
              const thumbBg = `hsl(${TYPE_HUE[item.type]}, 28%, 42%)`;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    s.contentRow,
                    { backgroundColor: C.surface },
                    idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => haptic()}
                >
                  <View style={[s.contentThumb, { backgroundColor: thumbBg }]}>
                    <IconSymbol name={typeIcon(item.type) as any} size={20} color="rgba(255,255,255,0.85)" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                    <Text style={[s.contentTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[s.contentMeta, { color: C.secondary }]}>
                      {formatViews(item.views)} views · {formatDaysFromToday(item.daysFromToday)}
                    </Text>
                  </View>
                    </Pressable>
              );
            })}
          </GlassView>
        )}
      </View>
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Preview Back Button */}
      {previewMode && (
        <Pressable
          style={[s.previewBackBtn, { top: topBarH + 12, backgroundColor: C.label }]}
          onPress={() => { haptic(); setPreviewMode(false); }}
        >
          <IconSymbol name="arrow.left" size={13} color={C.bg} />
          <Text style={[s.previewBackText, { color: C.bg }]}>Back to Edit</Text>
        </Pressable>
      )}

      {/* Top Bar — no filter icon on follower pages */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { haptic(); openSidePanel(); }}
            style={s.iconBtn}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.centerPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.centerPillText, { color: C.label }]}>Profile</Text>
            </View>
          </View>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); cycleRole(); setPreviewMode(false); }}
            style={[
              s.rolePill,
              isOwner
                ? { backgroundColor: C.label, borderColor: C.label }
                : { backgroundColor: C.surface, borderColor: C.separator },
            ]}
          >
            <Text style={[s.rolePillText, { color: isOwner ? C.bg : C.label }]}>{role}</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingBottom: showEdit ? 0 : insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {showEdit ? (
          /* Owner Edit Mode */
          <>
            {renderCoverAndAvatar()}
            {renderIdentity()}
            {renderBio()}
            {renderSocials()}
            {renderStats()}
            {renderActions()}
            {renderLinks()}
            {renderPortfolio()}
            <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 80 }}>
              <Pressable
                style={[s.previewBtn, { backgroundColor: C.label }]}
                onPress={() => { haptic(); setPreviewMode(true); }}
              >
                <IconSymbol name="eye" size={16} color={C.bg} />
                <Text style={[s.previewBtnText, { color: C.bg }]}>Preview as Visitor</Text>
              </Pressable>
            </View>
          </>
        ) : (
          /* Follower / Preview — single scrollable page */
          <>
            {renderCoverAndAvatar()}
            {renderIdentity()}
            {renderBio()}
            {renderSocials()}
            {renderStats()}
            {renderActions()}
            {renderLinks()}
            {renderPortfolio()}
            {renderRecentContent()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: {
    height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
  },
  iconBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  centerPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  centerPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePill: {
    paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  rolePillText: { fontSize: 12, fontWeight: '700' },

  // Cover + Avatar
  cover: {
    height: COVER_H, width: '100%', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  coverGradient: { opacity: 0.6 },
  coverEditHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  coverEditText: { fontSize: 13, fontWeight: '600', opacity: 0.85 },
  avatarRow: { alignItems: 'center', marginTop: -AVATAR_HALF, zIndex: 10 },
  avatarWrap: {
    width: AVATAR_SIZE + 8, height: AVATAR_SIZE + 8, borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 26, fontWeight: '800', color: '#fff' },
  cameraBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },

  // Identity
  identitySection: { alignItems: 'center', paddingTop: 12, paddingBottom: 4, paddingHorizontal: 16 },
  profileName:   { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  profileHandle: { fontSize: 14, marginTop: 2, textAlign: 'center' },
  locationRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText:  { fontSize: 13 },

  // Bio
  bioCard: { marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: 12 },
  bioHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  bioTitle:    { fontSize: 15, fontWeight: '700' },
  bioEditLink: { fontSize: 14, fontWeight: '600' },
  bioText:     { fontSize: 14, lineHeight: 22 },

  // Socials
  socialsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, marginTop: 14, flexWrap: 'wrap',
  },
  socialCircle: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  editSocialsBtn:  { paddingHorizontal: 12, paddingVertical: 8 },
  editSocialsText: { fontSize: 13, fontWeight: '600' },

  // Stats
  statsCard: {
    marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 36, marginHorizontal: 12 },

  // Actions
  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 14 },
  actionBtn:     { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 15, fontWeight: '700' },

  // Sections
  section:          { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader:    { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },

  // Links
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  linkIconWrap: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  linkTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  addLinkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 10, height: 44, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
  },
  addLinkText: { fontSize: 14, fontWeight: '600' },

  // Portfolio
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  portfolioCard: { width: '47%', borderRadius: 12, overflow: 'hidden' },
  portfolioThumb: {
    width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
  },
  portfolioEmoji:    { fontSize: 34 },
  portfolioInfo:     { padding: 10 },
  portfolioTitle:    { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  portfolioMeta:     { fontSize: 11, marginTop: 3 },
  addPortfolioBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addPortfolioText:  { fontSize: 14, fontWeight: '600' },

  // Recent Content (Overview tab)
  featuredRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  featuredThumb: {
    width: 52, height: 52, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featuredEmoji: { fontSize: 22 },
  featuredTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  featuredMeta:  { fontSize: 12, marginTop: 2 },

  // Content feed (Content tab)
  filterPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  filterPillText: { fontSize: 13, fontWeight: '600' },
  contentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  contentThumb: {
    width: 52, height: 52, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  contentTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  contentMeta:  { fontSize: 12 },

  // Preview
  previewBtn: {
    height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  previewBtnText: { fontSize: 16, fontWeight: '700' },
  previewBackBtn: {
    position: 'absolute', zIndex: 200, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  previewBackText: { fontSize: 13, fontWeight: '700' },
});
