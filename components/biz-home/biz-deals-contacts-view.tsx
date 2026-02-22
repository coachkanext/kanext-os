/**
 * Biz Deals Contacts View — Search, filter pills, contact rows
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { BIZ_CONTACTS, type BizContact } from '@/data/mock-business-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const FILTER_PILLS = ['All', 'Investors', 'Partners', 'Clients', 'Advisors', 'Press'] as const;
type FilterKey = (typeof FILTER_PILLS)[number];

const FILTER_MAP: Record<string, string> = {
  Investors: 'investor',
  Partners: 'partner',
  Clients: 'client',
  Advisors: 'advisor',
  Press: 'press',
};

const TYPE_COLORS: Record<string, string> = {
  investor: '#22C55E',
  partner: '#1D9BF0',
  client: '#1D9BF0',
  advisor: '#F59E0B',
  press: '#EF4444',
  vendor: '#A1A1AA',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function BizDealsContactsView({ colors, accent }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('All');

  const filteredContacts = useMemo(() => {
    let list = BIZ_CONTACTS;
    if (filter !== 'All') {
      const mapped = FILTER_MAP[filter];
      if (mapped) list = list.filter((c: BizContact) => c.relationshipType === mapped);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c: BizContact) =>
          c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, filter]);

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Filter pills */}
      <View style={styles.filterBar}>
        {FILTER_PILLS.map((pill) => {
          const isActive = filter === pill;
          return (
            <Pressable
              key={pill}
              style={[styles.filterPill, isActive && { backgroundColor: accent }]}
              onPress={() => setFilter(pill)}
            >
              <ThemedText
                style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {pill}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Contact rows */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredContacts.map((contact: BizContact) => {
          const typeColor = TYPE_COLORS[contact.relationshipType] ?? '#A1A1AA';
          const initials = getInitials(contact.name);
          return (
            <Pressable
              key={contact.id}
              style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openPersonCard({
                  name: contact.name,
                  role: `${contact.role} · ${contact.company}`,
                  status: contact.status,
                });
              }}
            >
              {/* Initials circle */}
              <View style={[styles.initialsCircle, { backgroundColor: typeColor + '33' }]}>
                <ThemedText style={[styles.initialsText, { color: typeColor }]}>{initials}</ThemedText>
              </View>

              {/* Details */}
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <ThemedText style={[styles.contactName, { color: colors.text }]}>{contact.name}</ThemedText>
                  {contact.activeDealId && (
                    <View style={[styles.dealDot, { backgroundColor: accent }]} />
                  )}
                </View>
                <ThemedText style={[styles.contactCompany, { color: colors.textSecondary }]}>
                  {contact.company} · {contact.role}
                </ThemedText>
              </View>

              {/* Right side: type badge + last contact */}
              <View style={styles.contactRight}>
                <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
                  <ThemedText style={[styles.typeBadgeText, { color: typeColor }]}>
                    {contact.relationshipType.toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.lastContactText, { color: colors.textSecondary }]}>
                  {contact.lastContact}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#2F3336',
  },
  filterPillText: { fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  initialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  initialsText: { fontSize: 14, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactName: { fontSize: 14, fontWeight: '700' },
  dealDot: { width: 6, height: 6, borderRadius: 3 },
  contactCompany: { fontSize: 11, marginTop: 2 },
  contactRight: { alignItems: 'flex-end', marginLeft: 8 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '700' },
  lastContactText: { fontSize: 10 },
});
