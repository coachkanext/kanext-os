/**
 * Studios Content — 3-page swipeable layout for KayStudios.
 * Page 0: Play — active games, quick play, recently played.
 * Page 1: Library — featured game, catalog with category filters.
 * Page 2: Compete — profile, leaderboards, achievements, challenges, friends.
 * 3 dots at top. Swipe right on page 0 = side panel.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getActiveGames,
  getQuickPlayOptions,
  getRecentlyPlayed,
  getCatalogGames,
  getFeaturedGame,
  getGamerProfile,
  getLeaderboard,
  getAchievements,
  getChallenges,
  getGamingFriends,
  LIBRARY_FILTERS,
  COMPETE_FILTERS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ActiveGame,
  type CatalogGame,
  type LibraryFilterKey,
  type CompeteFilterKey,
} from '@/data/mock-studios';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTINUE_CARD_WIDTH = SCREEN_WIDTH * 0.6;

// ─── Shared components ────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: readonly { key: T; label: string }[] | { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action && <Text style={s.sectionAction}>{action}</Text>}
    </View>
  );
}

// ─── Continue Playing Card ───────────────────────────────────────────────

function ContinueCard({ game }: { game: ActiveGame }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const catColor = CATEGORY_COLORS[game.category];
  return (
    <Pressable
      style={({ pressed }) => [s.continueCard, pressed && { opacity: 0.9 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Image source={{ uri: game.imageUri }} style={s.continueImage} />
      <View style={s.continueOverlay}>
        <View style={[s.categoryDot, { backgroundColor: catColor }]} />
        <Text style={s.continueTitle} numberOfLines={1}>{game.title}</Text>
        <Text style={s.continueProgress} numberOfLines={1}>{game.progress}</Text>
        <Text style={s.continueTimestamp}>{game.lastPlayed}</Text>
      </View>
    </Pressable>
  );
}

// ─── Quick Play Button ───────────────────────────────────────────────────

function QuickPlayButton({ option }: { option: ReturnType<typeof getQuickPlayOptions>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.quickPlayBtn, pressed && { opacity: 0.8 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={s.quickPlayIcon}>
        <IconSymbol name={option.icon as any} size={20} color={C.amber} />
      </View>
      <View style={s.quickPlayInfo}>
        <Text style={s.quickPlayLabel}>{option.label}</Text>
        <Text style={s.quickPlaySub}>{option.subtitle}</Text>
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ─── Recently Played Row ─────────────────────────────────────────────────

function RecentRow({
  game,
  onLongPress,
}: {
  game: ActiveGame;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const catColor = CATEGORY_COLORS[game.category];
  return (
    <Pressable
      style={({ pressed }) => [s.recentRow, pressed && { opacity: 0.85 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <Image source={{ uri: game.imageUri }} style={s.recentThumb} />
      <View style={s.recentInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[s.categoryDotSmall, { backgroundColor: catColor }]} />
          <Text style={s.recentTitle} numberOfLines={1}>{game.title}</Text>
        </View>
        <Text style={s.recentProgress} numberOfLines={1}>{game.progress}</Text>
        <Text style={s.recentTimestamp}>{game.lastPlayed}</Text>
      </View>
      <IconSymbol name="play.fill" size={16} color={C.label} />
    </Pressable>
  );
}

// ─── Catalog Game Card ───────────────────────────────────────────────────

function CatalogCard({
  game,
  onLongPress,
}: {
  game: CatalogGame;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const catColor = CATEGORY_COLORS[game.category];
  const catLabel = CATEGORY_LABELS[game.category];
  return (
    <Pressable
      style={({ pressed }) => [s.catalogCard, pressed && { opacity: 0.9 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <Image source={{ uri: game.imageUri }} style={s.catalogImage} />
      <View style={s.catalogInfo}>
        <View style={s.catalogHeaderRow}>
          <View style={[s.categoryBadge, { backgroundColor: catColor + '20' }]}>
            <Text style={[s.categoryBadgeText, { color: catColor }]}>{catLabel}</Text>
          </View>
          {game.installed && (
            <View style={s.installedBadge}>
              <Text style={s.installedText}>Installed</Text>
            </View>
          )}
        </View>
        <Text style={s.catalogTitle} numberOfLines={1}>{game.title}</Text>
        <Text style={s.catalogDesc} numberOfLines={1}>{game.description}</Text>
        <View style={s.catalogFooterRow}>
          {game.rating > 0 && (
            <View style={s.ratingRow}>
              <IconSymbol name="star.fill" size={12} color={C.amber} />
              <Text style={s.ratingText}>{game.rating.toFixed(1)}</Text>
            </View>
          )}
          {game.rating === 0 && <Text style={s.comingSoonLabel}>Coming Soon</Text>}
          <Text style={s.priceText}>{game.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────────

function LeaderboardRow({ entry }: { entry: ReturnType<typeof getLeaderboard>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={[s.leaderRow, entry.isYou && s.leaderRowHighlight]}>
      <Text style={[s.leaderRank, entry.rank <= 3 && { color: C.amber }]}>
        {entry.rank}
      </Text>
      <View style={[s.leaderAvatar, entry.isYou && { backgroundColor: C.blue }]}>
        <Text style={s.leaderInitials}>{entry.initials}</Text>
      </View>
      <Text style={s.leaderName} numberOfLines={1}>
        {entry.name}{entry.isYou ? ' (You)' : ''}
      </Text>
      <Text style={s.leaderScore}>{entry.score}</Text>
    </View>
  );
}

// ─── Achievement Card ────────────────────────────────────────────────────

function AchievementCard({ achievement }: { achievement: ReturnType<typeof getAchievements>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const earned = achievement.earned;
  return (
    <View style={[s.achieveCard, !earned && s.achieveCardLocked]}>
      <View style={[s.achieveIcon, !earned && { opacity: 0.4 }]}>
        <IconSymbol name={achievement.icon as any} size={22} color={earned ? C.amber : C.muted} />
      </View>
      <View style={s.achieveInfo}>
        <Text style={[s.achieveTitle, !earned && { color: C.muted }]}>{achievement.title}</Text>
        <Text style={s.achieveDesc} numberOfLines={1}>{achievement.description}</Text>
        <View style={s.achieveMeta}>
          <Text style={s.achieveGame}>{achievement.game}</Text>
          <Text style={s.achieveRarity}>{achievement.rarity}% of players</Text>
        </View>
      </View>
      {earned && achievement.dateEarned && (
        <Text style={s.achieveDate}>{achievement.dateEarned}</Text>
      )}
    </View>
  );
}

// ─── Challenge Card ──────────────────────────────────────────────────────

function ChallengeCard({ challenge }: { challenge: ReturnType<typeof getChallenges>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const CHALLENGE_TYPE_COLORS: Record<string, string> = {
    daily: C.amber,
    weekly: C.blue,
    friend: C.purple,
    community: C.green,
  };
  const pct = Math.min(challenge.progress / challenge.target, 1);
  const typeColor = CHALLENGE_TYPE_COLORS[challenge.type] ?? C.muted;
  return (
    <View style={s.challengeCard}>
      <View style={s.challengeHeader}>
        <View style={[s.challengeTypeBadge, { backgroundColor: typeColor + '20' }]}>
          <Text style={[s.challengeTypeText, { color: typeColor }]}>
            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
          </Text>
        </View>
        <Text style={s.challengeDeadline}>{challenge.deadline}</Text>
      </View>
      <Text style={s.challengeTitle}>{challenge.title}</Text>
      <Text style={s.challengeDesc}>{challenge.description}</Text>
      <View style={s.challengeProgressBg}>
        <View style={[s.challengeProgressFill, { width: `${pct * 100}%`, backgroundColor: typeColor }]} />
      </View>
      <View style={s.challengeFooter}>
        <Text style={s.challengeProgressText}>{challenge.progress}/{challenge.target}</Text>
        <Text style={s.challengeReward}>{challenge.reward}</Text>
      </View>
    </View>
  );
}

// ─── Friend Row ──────────────────────────────────────────────────────────

function FriendRow({ friend }: { friend: ReturnType<typeof getGamingFriends>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={({ pressed }) => [s.friendRow, pressed && { opacity: 0.85 }]}>
      <View style={s.friendAvatar}>
        <Text style={s.friendInitials}>{friend.initials}</Text>
        {friend.online && <View style={s.onlineDot} />}
      </View>
      <View style={s.friendInfo}>
        <Text style={s.friendName}>{friend.name}</Text>
        <Text style={s.friendGame}>{friend.favoriteGame} · {friend.lastPlayed}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [s.challengeBtn, pressed && { opacity: 0.8 }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Text style={s.challengeBtnText}>Challenge</Text>
      </Pressable>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function StudiosContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilterKey>('all');
  const [competeFilter, setCompeteFilter] = useState<CompeteFilterKey>('leaderboards');

  const activeGames = useMemo(() => getActiveGames(), []);
  const quickPlay = useMemo(() => getQuickPlayOptions(), []);
  const recentlyPlayed = useMemo(() => getRecentlyPlayed(), []);
  const catalogGames = useMemo(() => getCatalogGames(libraryFilter), [libraryFilter]);
  const featured = useMemo(() => getFeaturedGame(), []);
  const profile = useMemo(() => getGamerProfile(), []);
  const leaderboard = useMemo(() => getLeaderboard(), []);
  const achievements = useMemo(() => getAchievements(), []);
  const challenges = useMemo(() => getChallenges(), []);
  const friends = useMemo(() => getGamingFriends(), []);

  const xpPct = Math.min(profile.xp / profile.xpNext, 1);

  // Scroll footer hide
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index);
    showFooter();
  }, []);

  const longPressGame = useCallback((game: ActiveGame | CatalogGame, pageY: number) => {
    setMenuData({
      title: game.title,
      subtitle: 'category' in game ? CATEGORY_LABELS[game.category] : '',
      initials: game.title.slice(0, 2).toUpperCase(),
      isSquircle: true,
      pageY,
      actions: [
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'details', label: 'View Details', icon: 'eye.fill' },
        { key: 'hide', label: 'Hide', icon: 'eye.slash.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={handlePageChange}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: PLAY ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Continue Playing */}
            <SectionHeader title="Continue Playing" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.continueRow}
            >
              {activeGames.map((game) => (
                <ContinueCard key={game.id} game={game} />
              ))}
            </ScrollView>

            {/* Quick Play */}
            <SectionHeader title="Quick Play" />
            {quickPlay.map((option, idx) => (
              <View key={option.id}>
                {idx > 0 && <View style={s.separator} />}
                <QuickPlayButton option={option} />
              </View>
            ))}

            {/* Recently Played */}
            <SectionHeader title="Recently Played" />
            {recentlyPlayed.map((game, idx) => (
              <View key={game.id}>
                {idx > 0 && <View style={s.separator} />}
                <RecentRow
                  game={game}
                  onLongPress={(pageY) => longPressGame(game, pageY)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: LIBRARY ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Featured Banner */}
            <Pressable
              style={s.featuredBanner}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Image source={{ uri: featured.imageUri }} style={s.featuredImage} />
              <View style={s.featuredOverlay}>
                <View style={[s.categoryBadge, { backgroundColor: CATEGORY_COLORS[featured.category] + '20' }]}>
                  <Text style={[s.categoryBadgeText, { color: CATEGORY_COLORS[featured.category] }]}>
                    {CATEGORY_LABELS[featured.category]}
                  </Text>
                </View>
                <Text style={s.featuredTitle}>{featured.title}</Text>
                <Text style={s.featuredDesc} numberOfLines={2}>{featured.description}</Text>
                <View style={s.featuredPriceRow}>
                  <Text style={s.featuredPrice}>{featured.price}</Text>
                  {featured.rating > 0 && (
                    <View style={s.ratingRow}>
                      <IconSymbol name="star.fill" size={12} color={C.amber} />
                      <Text style={s.ratingText}>{featured.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>

            {/* Category Pills */}
            <FilterPills items={LIBRARY_FILTERS} active={libraryFilter} onSelect={setLibraryFilter} />

            {/* Game Catalog */}
            {catalogGames.map((game) => (
              <CatalogCard
                key={game.id}
                game={game}
                onLongPress={(pageY) => longPressGame(game, pageY)}
              />
            ))}
            {catalogGames.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>No games in this category</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── PAGE 2: COMPETE ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Gamer Profile */}
            <View style={s.profileCard}>
              <View style={s.profileAvatar}>
                <Text style={s.profileInitials}>{profile.initials}</Text>
              </View>
              <View style={s.profileInfo}>
                <Text style={s.profileName}>{profile.name}</Text>
                <Text style={s.profileLevel}>Level {profile.level}</Text>
              </View>
              <View style={s.profileStats}>
                <View style={s.profileStatItem}>
                  <Text style={s.profileStatValue}>{profile.achievements}</Text>
                  <Text style={s.profileStatLabel}>Badges</Text>
                </View>
                <View style={s.profileStatItem}>
                  <Text style={s.profileStatValue}>{profile.wins}-{profile.losses}</Text>
                  <Text style={s.profileStatLabel}>W-L</Text>
                </View>
                <View style={s.profileStatItem}>
                  <Text style={[s.profileStatValue, { color: C.amber }]}>{profile.streak}</Text>
                  <Text style={s.profileStatLabel}>Streak</Text>
                </View>
              </View>
              {/* XP bar */}
              <View style={s.xpBarBg}>
                <View style={[s.xpBarFill, { width: `${xpPct * 100}%` }]} />
              </View>
              <Text style={s.xpText}>
                {profile.xp.toLocaleString()} / {profile.xpNext.toLocaleString()} XP
              </Text>
            </View>

            {/* Section Pills */}
            <FilterPills items={COMPETE_FILTERS} active={competeFilter} onSelect={setCompeteFilter} />

            {/* Leaderboards */}
            {competeFilter === 'leaderboards' && (
              <View>
                <SectionHeader title="Basketball Manager — Top GMs" />
                {leaderboard.map((entry, idx) => (
                  <View key={entry.rank}>
                    {idx > 0 && <View style={s.separator} />}
                    <LeaderboardRow entry={entry} />
                  </View>
                ))}
              </View>
            )}

            {/* Achievements */}
            {competeFilter === 'achievements' && (
              <View>
                {achievements.map((ach) => (
                  <AchievementCard key={ach.id} achievement={ach} />
                ))}
              </View>
            )}

            {/* Challenges */}
            {competeFilter === 'challenges' && (
              <View>
                {challenges.map((ch) => (
                  <ChallengeCard key={ch.id} challenge={ch} />
                ))}
              </View>
            )}

            {/* Friends */}
            {competeFilter === 'friends' && (
              <View>
                {friends.map((friend, idx) => (
                  <View key={friend.id}>
                    {idx > 0 && <View style={s.separator} />}
                    <FriendRow friend={friend} />
                  </View>
                ))}
                <Pressable
                  style={({ pressed }) => [s.addFriendBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="plus.circle.fill" size={18} color={C.blue} />
                  <Text style={s.addFriendText}>Add Friends by @username</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </SwipeablePages>

      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  topBarTitle: { fontSize: 22, fontWeight: '700', color: C.label },

  // Filter pills
  filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  filterPillActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  filterTextActive: { color: '#000000' },

  // Section
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.label },
  sectionAction: { fontSize: 13, color: C.blue },

  // Continue Playing
  continueRow: { paddingHorizontal: 16, gap: 12 },
  continueCard: {
    width: CONTINUE_CARD_WIDTH, borderRadius: 14, overflow: 'hidden',
    backgroundColor: C.surface,
  },
  continueImage: { width: '100%', height: CONTINUE_CARD_WIDTH * 0.55, backgroundColor: C.surface },
  continueOverlay: { padding: 12 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  continueTitle: { fontSize: 15, fontWeight: '700', color: C.label },
  continueProgress: { fontSize: 12, color: C.secondary, marginTop: 2 },
  continueTimestamp: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Quick Play
  quickPlayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  quickPlayIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  quickPlayInfo: { flex: 1 },
  quickPlayLabel: { fontSize: 15, fontWeight: '600', color: C.label },
  quickPlaySub: { fontSize: 12, color: C.muted, marginTop: 1 },

  // Recently Played
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  recentThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: C.surface },
  recentInfo: { flex: 1 },
  categoryDotSmall: { width: 6, height: 6, borderRadius: 3 },
  recentTitle: { fontSize: 14, fontWeight: '600', color: C.label },
  recentProgress: { fontSize: 12, color: C.secondary, marginTop: 2 },
  recentTimestamp: { fontSize: 11, color: C.muted, marginTop: 1 },

  // Featured Banner
  featuredBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, overflow: 'hidden', height: 200 },
  featuredImage: { width: '100%', height: '100%', backgroundColor: C.surface },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: C.label, marginTop: 6 },
  featuredDesc: { fontSize: 13, color: C.secondary, marginTop: 2 },
  featuredPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  featuredPrice: { fontSize: 13, fontWeight: '700', color: C.label },

  // Catalog Card
  catalogCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: 'hidden',
    backgroundColor: C.surface,
  },
  catalogImage: { width: '100%', height: 140, backgroundColor: C.surface },
  catalogInfo: { padding: 12 },
  catalogHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700' },
  installedBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  installedText: { fontSize: 10, fontWeight: '700', color: C.green },
  catalogTitle: { fontSize: 16, fontWeight: '700', color: C.label, marginTop: 6 },
  catalogDesc: { fontSize: 13, color: C.secondary, marginTop: 2 },
  catalogFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: C.amber },
  comingSoonLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  priceText: { fontSize: 13, fontWeight: '700', color: C.label },

  // Profile Card
  profileCard: {
    marginHorizontal: 16, padding: 16, borderRadius: 14,
    backgroundColor: C.surface,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: C.blue,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  profileInitials: { fontSize: 20, fontWeight: '800', color: C.label },
  profileInfo: { alignItems: 'center', marginTop: 8 },
  profileName: { fontSize: 18, fontWeight: '700', color: C.label },
  profileLevel: { fontSize: 13, color: C.secondary, marginTop: 2 },
  profileStats: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 16 },
  profileStatItem: { alignItems: 'center' },
  profileStatValue: { fontSize: 18, fontWeight: '800', color: C.label },
  profileStatLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  xpBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 16 },
  xpBarFill: { height: 6, borderRadius: 3, backgroundColor: C.blue },
  xpText: { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 6 },

  // Leaderboard
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  leaderRowHighlight: { backgroundColor: 'rgba(59,130,246,0.08)' },
  leaderRank: { fontSize: 16, fontWeight: '800', color: C.muted, width: 24, textAlign: 'center' },
  leaderAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  leaderInitials: { fontSize: 12, fontWeight: '700', color: C.label },
  leaderName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.label },
  leaderScore: { fontSize: 12, color: C.secondary },

  // Achievements
  achieveCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8, padding: 14,
    borderRadius: 12, backgroundColor: C.surface,
  },
  achieveCardLocked: { opacity: 0.7 },
  achieveIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(248,177,51,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  achieveInfo: { flex: 1 },
  achieveTitle: { fontSize: 14, fontWeight: '700', color: C.label },
  achieveDesc: { fontSize: 12, color: C.secondary, marginTop: 1 },
  achieveMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  achieveGame: { fontSize: 10, color: C.muted },
  achieveRarity: { fontSize: 10, color: C.purple },
  achieveDate: { fontSize: 10, color: C.muted },

  // Challenges
  challengeCard: {
    marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderRadius: 12, backgroundColor: C.surface,
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  challengeTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  challengeTypeText: { fontSize: 10, fontWeight: '700' },
  challengeDeadline: { fontSize: 11, color: C.muted },
  challengeTitle: { fontSize: 15, fontWeight: '700', color: C.label },
  challengeDesc: { fontSize: 12, color: C.secondary, marginTop: 2 },
  challengeProgressBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 10 },
  challengeProgressFill: { height: 6, borderRadius: 3 },
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  challengeProgressText: { fontSize: 11, color: C.muted },
  challengeReward: { fontSize: 11, fontWeight: '600', color: C.amber },

  // Friends
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  friendAvatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  friendInitials: { fontSize: 14, fontWeight: '700', color: C.label },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.green, borderWidth: 2, borderColor: C.bg,
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, fontWeight: '600', color: C.label },
  friendGame: { fontSize: 12, color: C.muted, marginTop: 1 },
  challengeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: C.blue,
  },
  challengeBtnText: { fontSize: 12, fontWeight: '700', color: C.label },
  addFriendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginHorizontal: 16, marginTop: 8, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: C.separator, borderStyle: 'dashed',
  },
  addFriendText: { fontSize: 14, fontWeight: '600', color: C.blue },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.muted },
});
