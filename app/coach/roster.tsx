/**
 * Coach Roster Screen
 * Thin wrapper around RosterContent with TopBar and AvatarDrawer.
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TopBar } from '@/components/top-bar';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { RosterContent } from '@/components/roster-content';
import { TabFooter } from '@/components/tab-footer';
import { openTeamSheet } from '@/utils/global-team-sheet';

export default function CoachRosterScreen() {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <TopBar onAvatarPress={() => setDrawerVisible(true)} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <RosterContent
          onViewChange={() => scrollRef.current?.scrollTo({ y: 0, animated: false })}
          onLogoLongPress={openTeamSheet}
        />
      </ScrollView>

      <TabFooter activeTab="Home" />
      <AvatarDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
});
