/**
 * Media Screen — YouTube-style video platform.
 * Page 0: Browse (featured banner + category rows).
 * Page 1: Library (Watch History, Saved, Playlists, Downloads, Uploads).
 * SwipeableTwoPage container. Side panel on right edge swipe.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';
import { SwipeableTwoPage } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { FeaturedBanner } from '@/components/media/featured-banner';
import { CategoryRow } from '@/components/media/category-row';
import { LibrarySection } from '@/components/media/library-section';
import {
  BROWSE_CATEGORIES_BY_MODE,
  FEATURED_BY_MODE,
  PLAYLISTS,
  SAVED_VIDEOS,
  DOWNLOADS,
  YOUR_UPLOADS,
} from '@/data/mock-media';
import { WATCH_HISTORY_BY_MODE } from '@/data/mock-video';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

import { useMode } from '@/context/app-context';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const mode = useMode();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  const categories = useMemo(() => BROWSE_CATEGORIES_BY_MODE[mode], [mode]);
  const featured = useMemo(() => FEATURED_BY_MODE[mode], [mode]);
  const watchHistory = useMemo(() => WATCH_HISTORY_BY_MODE[mode], [mode]);

  // Scroll-driven footer hide/show
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

  // Long press on video → context menu
  const handleVideoLongPress = useCallback((videoId: string, videoTitle: string, creatorInitials: string, pageY: number) => {
    setMenuData({
      title: videoTitle,
      subtitle: 'Video',
      initials: creatorInitials,
      isSquircle: true,
      pageY,
      actions: [
        { key: 'save', label: 'Save', icon: 'bookmark.fill' },
        { key: 'playlist', label: 'Add to Playlist', icon: 'music.note.list' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'not-interested', label: 'Not Interested', icon: 'hand.thumbsdown.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <SwipeableTwoPage
        activeIndex={pageIndex}
        onPageChange={handlePageChange}

      >
        {/* Page 0: Browse */}
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <FeaturedBanner video={featured} />
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onVideoLongPress={handleVideoLongPress}
            />
          ))}
        </ScrollView>

        {/* Page 1: Library */}
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <LibrarySection
            icon="clock.fill"
            label="Watch History"
            type="history"
            historyItems={watchHistory}
          />
          <LibrarySection
            icon="bookmark.fill"
            label="Saved"
            type="saved"
            videos={SAVED_VIDEOS}
          />
          <LibrarySection
            icon="music.note.list"
            label="Playlists"
            type="playlists"
            playlists={PLAYLISTS}
          />
          <LibrarySection
            icon="arrow.down.circle.fill"
            label="Downloads"
            type="downloads"
            videos={DOWNLOADS}
          />
          <LibrarySection
            icon="arrow.up.circle.fill"
            label="Your Uploads"
            type="uploads"
            videos={YOUR_UPLOADS}
          />
        </ScrollView>
      </SwipeableTwoPage>

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
});
