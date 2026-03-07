/**
 * Default Side Panel Content
 * Per-screen tappable rows with relevant secondary features.
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const C = {
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  separator: 'rgba(255,255,255,0.08)',
};

type PanelItem = { icon: string; label: string };

const SCREEN_ITEMS: Record<string, { title: string; items: PanelItem[] }> = {
  nexus: {
    title: 'Nexus',
    items: [
      { icon: 'clock.fill', label: 'Conversation History' },
      { icon: 'bookmark.fill', label: 'Saved Conversations' },
      { icon: 'book.fill', label: 'Bookmarks' },
    ],
  },
  media: {
    title: 'Media',
    items: [
      { icon: 'play.rectangle.fill', label: 'Library' },
      { icon: 'music.note.list', label: 'Playlists' },
      { icon: 'bookmark.fill', label: 'Saved Clips' },
      { icon: 'arrow.up.circle.fill', label: 'Uploads' },
      { icon: 'clock.fill', label: 'Watch Later' },
    ],
  },
  organization: {
    title: 'Organization',
    items: [
      { icon: 'person.3.fill', label: 'Departments' },
      { icon: 'checkmark.shield.fill', label: 'Compliance' },
      { icon: 'doc.fill', label: 'Documents' },
      { icon: 'gearshape.fill', label: 'Admin Tools' },
    ],
  },
  season: {
    title: 'Season',
    items: [
      { icon: 'list.number', label: 'Standings' },
      { icon: 'chart.bar.fill', label: 'Full Stats' },
      { icon: 'line.3.horizontal.decrease.circle.fill', label: 'Schedule Filters' },
      { icon: 'film.fill', label: 'Film Library' },
    ],
  },
  store: {
    title: 'Store',
    items: [
      { icon: 'clock.fill', label: 'Order History' },
      { icon: 'chart.pie.fill', label: 'Analytics' },
      { icon: 'shippingbox.fill', label: 'Inventory' },
      { icon: 'gearshape.fill', label: 'Settings' },
    ],
  },
  give: {
    title: 'Giving',
    items: [
      { icon: 'clock.fill', label: 'Giving History' },
      { icon: 'chart.pie.fill', label: 'Analytics' },
      { icon: 'gearshape.fill', label: 'Settings' },
    ],
  },
  video: {
    title: 'Video',
    items: [
      { icon: 'play.rectangle.fill', label: 'Library' },
      { icon: 'music.note.list', label: 'Playlists' },
      { icon: 'bookmark.fill', label: 'Saved Clips' },
      { icon: 'clock.fill', label: 'Watch Later' },
    ],
  },
  phone: {
    title: 'Phone',
    items: [
      { icon: 'phone.fill', label: 'Voicemail' },
      { icon: 'person.crop.circle.fill', label: 'KaNeXT Numbers' },
      { icon: 'gearshape.fill', label: 'Call Settings' },
      { icon: 'waveform', label: 'Audio Devices' },
    ],
  },
};

/** Resolve which item set to show based on pathname */
function resolveScreen(pathname: string): { title: string; items: PanelItem[] } {
  const p = pathname.toLowerCase();
  if (p.includes('nexus')) return SCREEN_ITEMS.nexus;
  if (p.includes('media') || p.includes('title=Media')) return SCREEN_ITEMS.media;
  if (p.includes('organization') || p.includes('title=Organization')) return SCREEN_ITEMS.organization;
  if (p.includes('season')) return SCREEN_ITEMS.season;
  if (p.includes('store')) return SCREEN_ITEMS.store;
  if (p.includes('give') || p.includes('giving')) return SCREEN_ITEMS.give;
  if (p.includes('video')) return SCREEN_ITEMS.video;
  if (p.includes('phone')) return SCREEN_ITEMS.phone;
  // Generic fallback
  return {
    title: 'Tools',
    items: [
      { icon: 'magnifyingglass', label: 'Search' },
      { icon: 'gearshape.fill', label: 'Settings' },
      { icon: 'bookmark.fill', label: 'Saved' },
    ],
  };
}

interface DefaultPanelProps {
  pathname: string;
}

export function DefaultPanel({ pathname }: DefaultPanelProps) {
  const screen = resolveScreen(pathname);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{screen.title}</Text>
      {screen.items.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.row,
            pressed && styles.rowPressed,
            idx < screen.items.length - 1 && styles.rowBorder,
          ]}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={styles.rowLabel}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: C.label,
  },
});
