/**
 * EmptyModeShell — Reusable PagerView + PagedTabBar shell
 * Renders EmptyState in each tab. Used when a mode has no data loaded.
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { EmptyState } from '@/components/ui/empty-state';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { MODE_ACCENT } from '@/constants/theme';
import { useMode } from '@/context/app-context';

export interface ShellTab {
  id: string;
  label: string;
  icon: IconSymbolName;
  emptyTitle: string;
  emptyDescription: string;
}

interface EmptyModeShellProps {
  tabs: ShellTab[];
}

export function EmptyModeShell({ tabs }: EmptyModeShellProps) {
  const mode = useMode();
  const accent = MODE_ACCENT[mode];
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const pagerTabs = tabs.map((t) => ({ id: t.id, label: t.label }));

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <View style={styles.container}>
      <PagedTabBar
        tabs={pagerTabs}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
        accentColor={accent}
      />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress} wrap>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {tabs.map((tab) => (
            <View key={tab.id} style={styles.page}>
              <EmptyState
                icon={tab.icon}
                title={tab.emptyTitle}
                description={tab.emptyDescription}
              />
            </View>
          ))}
        </PagerView>
      </EdgeHoldAdvance>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
