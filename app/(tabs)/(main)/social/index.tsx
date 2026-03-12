/**
 * Social Screen — Instagram-style visual platform.
 * Mode-aware: content changes based on active mode (sports, church, education, business).
 * Page 0: Feed (stories + posts). Page 1: Reels (full-screen video playback).
 * SwipeableTwoPage container. FAB on Feed only. Side panel on right edge swipe.
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { SwipeableTwoPage } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { StoriesRow } from '@/components/social/stories-row';
import { StoryViewer } from '@/components/social/story-viewer';
import { FeedPost } from '@/components/social/feed-post';
import { ReelsPage } from '@/components/social/reels-page';
import { ExplorePage } from '@/components/social/explore-page';
import { SocialFab } from '@/components/social/social-fab';
import { getStories, getFeedPosts, getReels, getTrendingTopics, getExploreTiles, getSuggestedAccounts } from '@/data/mock-social';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

import type { StoryUser } from '@/data/mock-social';

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const mode = useMode();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [storyViewerUser, setStoryViewerUser] = useState<number | null>(null);

  // Mode-aware data
  const stories = useMemo(() => getStories(mode), [mode]);
  const posts = useMemo(() => getFeedPosts(mode), [mode]);
  const reels = useMemo(() => getReels(mode), [mode]);

  // Explore data (universal, not per-mode)
  const trendingTopics = useMemo(() => getTrendingTopics(), []);
  const exploreTiles = useMemo(() => getExploreTiles(), []);
  const suggestedAccounts = useMemo(() => getSuggestedAccounts(), []);

  // Like / bookmark state — reset on mode change
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [bookmarkedReels, setBookmarkedReels] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLikedPosts(new Set(posts.filter((p) => p.isLiked).map((p) => p.id)));
    setBookmarkedPosts(new Set(posts.filter((p) => p.isBookmarked).map((p) => p.id)));
    setLikedReels(new Set(reels.filter((r) => r.isLiked).map((r) => r.id)));
    setBookmarkedReels(new Set(reels.filter((r) => r.isBookmarked).map((r) => r.id)));
  }, [posts, reels]);

  // Scroll-driven footer hide/show
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // Page change: track index + ensure footer is visible
  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index);
    showFooter();
  }, []);

  // Toggle helpers
  const togglePostLike = useCallback((id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const togglePostBookmark = useCallback((id: string) => {
    setBookmarkedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleReelLike = useCallback((id: string) => {
    setLikedReels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleReelBookmark = useCallback((id: string) => {
    setBookmarkedReels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Story press
  const handleStoryPress = useCallback((user: StoryUser) => {
    if (user.isYou || user.storyFrames.length === 0) return;
    const idx = stories.findIndex((s) => s.id === user.id);
    if (idx >= 0) setStoryViewerUser(idx);
  }, [stories]);

  // Long press on post → context menu
  const handlePostLongPress = useCallback((postId: string, authorName: string, authorInitials: string, pageY: number) => {
    setMenuData({
      title: authorName,
      subtitle: 'Post',
      initials: authorInitials,
      isSquircle: false,
      pageY,
      actions: [
        { key: 'save', label: 'Save', icon: 'bookmark.fill' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'copy', label: 'Copy Link', icon: 'link' },
        { key: 'report', label: 'Report', icon: 'exclamationmark.triangle.fill', destructive: true },
        { key: 'mute', label: 'Mute User', icon: 'speaker.slash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'save') togglePostBookmark(postId);
      },
    });
  }, [togglePostBookmark]);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }, pageIndex !== 1 && { paddingTop: insets.top }]}>
      <SwipeableTwoPage
        activeIndex={pageIndex}
        onPageChange={handlePageChange}

      >
        {/* Page 0: Feed */}
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <StoriesRow stories={stories} onStoryPress={handleStoryPress} />
          <View style={styles.feedSeparator} />
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              isLiked={likedPosts.has(post.id)}
              isBookmarked={bookmarkedPosts.has(post.id)}
              onLikeToggle={() => togglePostLike(post.id)}
              onBookmarkToggle={() => togglePostBookmark(post.id)}
              onLongPress={(pageY) =>
                handlePostLongPress(post.id, post.author.name, post.author.initials, pageY)
              }
            />
          ))}
        </ScrollView>

        {/* Page 1: Reels */}
        <ReelsPage
          reels={reels}
          likedReels={likedReels}
          bookmarkedReels={bookmarkedReels}
          onLikeToggle={toggleReelLike}
          onBookmarkToggle={toggleReelBookmark}
        />

        {/* Page 2: Explore */}
        <ExplorePage
          mode={mode}
          trendingTopics={trendingTopics}
          tiles={exploreTiles}
          suggestedAccounts={suggestedAccounts}
        />
      </SwipeableTwoPage>

      {/* FAB — Feed only */}
      <SocialFab
        visible={pageIndex === 0}
        bottomOffset={insets.bottom + 60}
      />

      {/* Story viewer overlay */}
      <StoryViewer
        visible={storyViewerUser !== null}
        stories={stories}
        initialUserIndex={storyViewerUser ?? 0}
        onClose={() => setStoryViewerUser(null)}
      />

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pageScroll: {
    flex: 1,
  },
  feedSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2F3336',
  },
});
