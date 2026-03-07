/**
 * Messages Side Panel Content
 * Search, filters, channel management, notification settings, DM management.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useMode } from '@/context/app-context';
import { getRooms, getGlobalDMs } from '@/data/mock-messages-v3';
import {
  setMessageFilter,
  getMessageFilters,
  type MessageFilterKey,
} from '@/utils/global-message-filters';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  separator: 'rgba(255,255,255,0.08)',
};

export function MessagesPanel() {
  const accent = useAccentColor();
  const mode = useMode();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(getMessageFilters);

  // Channel + DM data for search
  const channels = useMemo(() => getRooms(mode), [mode]);
  const dms = useMemo(() => getGlobalDMs(), []);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const matchedChannels = channels.filter((r) =>
      r.name.toLowerCase().includes(q),
    );
    const matchedDMs = dms.filter((t) =>
      t.name.toLowerCase().includes(q),
    );
    return { channels: matchedChannels, dms: matchedDMs };
  }, [search, channels, dms]);

  const toggleFilter = useCallback((key: MessageFilterKey) => {
    setFilters((prev) => {
      const newVal = !prev[key];
      const next = { ...prev, [key]: newVal };
      // dms_only and channels_only are mutually exclusive
      if (key === 'dms_only' && newVal) {
        next.channels_only = false;
        setMessageFilter('channels_only', false);
      } else if (key === 'channels_only' && newVal) {
        next.dms_only = false;
        setMessageFilter('dms_only', false);
      }
      setMessageFilter(key, newVal);
      return next;
    });
  }, []);

  // Mute state (local mock)
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set());
  const toggleChannelMute = useCallback((id: string) => {
    setMutedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Notification settings (local mock)
  const [muteAll, setMuteAll] = useState(false);
  const [mentionsOnly, setMentionsOnly] = useState(false);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Search bar ── */}
      <View style={styles.searchWrap}>
        <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels & DMs"
          placeholderTextColor={C.secondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
          </Pressable>
        )}
      </View>

      {/* ── Search results (replaces content when searching) ── */}
      {searchResults ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          {searchResults.channels.length === 0 && searchResults.dms.length === 0 && (
            <Text style={styles.emptyText}>No matches</Text>
          )}
          {searchResults.channels.map((ch) => (
            <View key={ch.id} style={styles.resultRow}>
              <View style={styles.channelIcon}>
                <Text style={styles.channelInitials}>{ch.initials}</Text>
              </View>
              <Text style={styles.resultName} numberOfLines={1}>{ch.name}</Text>
            </View>
          ))}
          {searchResults.dms.map((dm) => (
            <View key={dm.id} style={styles.resultRow}>
              <View style={styles.dmIcon}>
                <Text style={styles.dmInitials}>{dm.initials}</Text>
              </View>
              <Text style={styles.resultName} numberOfLines={1}>{dm.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          {/* ── Filters ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filters</Text>
            {([
              { key: 'unread' as MessageFilterKey, label: 'Unread' },
              { key: 'mentions' as MessageFilterKey, label: 'Mentions' },
              { key: 'pinned' as MessageFilterKey, label: 'Pinned' },
              { key: 'dms_only' as MessageFilterKey, label: 'DMs Only' },
              { key: 'channels_only' as MessageFilterKey, label: 'Channels Only' },
            ]).map(({ key, label }) => (
              <View key={key} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{label}</Text>
                <Switch
                  value={filters[key]}
                  onValueChange={() => toggleFilter(key)}
                  trackColor={{ false: '#39393D', true: accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* ── Channel Management ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Channels</Text>
            <Pressable style={styles.actionRow}>
              <IconSymbol name="plus.circle.fill" size={18} color={accent} />
              <Text style={[styles.actionLabel, { color: accent }]}>Create Channel</Text>
            </Pressable>
            {channels.map((ch) => (
              <View key={ch.id} style={styles.channelManageRow}>
                <View style={styles.channelIconSmall}>
                  <Text style={styles.channelInitialsSmall}>{ch.initials}</Text>
                </View>
                <Text style={styles.channelManageName} numberOfLines={1}>{ch.name}</Text>
                <Switch
                  value={!mutedChannels.has(ch.id)}
                  onValueChange={() => toggleChannelMute(ch.id)}
                  trackColor={{ false: '#39393D', true: accent }}
                  thumbColor="#FFFFFF"
                  style={styles.miniSwitch}
                />
              </View>
            ))}
            <Pressable style={styles.actionRow}>
              <IconSymbol name="archivebox.fill" size={16} color={C.secondary} />
              <Text style={styles.secondaryActionLabel}>Archived Channels</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* ── Notification Settings ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Mute All</Text>
              <Switch
                value={muteAll}
                onValueChange={setMuteAll}
                trackColor={{ false: '#39393D', true: accent }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Mentions Only</Text>
              <Switch
                value={mentionsOnly}
                onValueChange={setMentionsOnly}
                trackColor={{ false: '#39393D', true: accent }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Pressable style={styles.actionRow}>
              <IconSymbol name="moon.fill" size={16} color={C.secondary} />
              <Text style={styles.secondaryActionLabel}>Do Not Disturb</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* ── DM Management ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Direct Messages</Text>
            <Pressable style={styles.actionRow}>
              <IconSymbol name="archivebox.fill" size={16} color={C.secondary} />
              <Text style={styles.secondaryActionLabel}>Archived DMs</Text>
            </Pressable>
            <Pressable style={styles.actionRow}>
              <IconSymbol name="hand.raised.fill" size={16} color={C.secondary} />
              <Text style={styles.secondaryActionLabel}>Blocked Users</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.label,
    padding: 0,
  },

  // Sections
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Filters / toggles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 15,
    color: C.label,
  },

  // Action rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActionLabel: {
    fontSize: 15,
    color: C.secondary,
  },

  // Channel management
  channelManageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  channelIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInitialsSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: C.label,
  },
  channelManageName: {
    flex: 1,
    fontSize: 14,
    color: C.label,
  },
  miniSwitch: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
  },

  // Search results
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  channelIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  dmIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmInitials: {
    fontSize: 11,
    fontWeight: '600',
    color: C.label,
  },
  resultName: {
    flex: 1,
    fontSize: 15,
    color: C.label,
  },

  emptyText: {
    fontSize: 14,
    color: C.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
