/**
 * Business Organization People Tab -- V3
 * 3-pill ViewBar: Team | Board | Contacts
 * KaNeXT founder view. All data inline.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'team' | 'board' | 'contacts';
type ContactCategory = 'All' | 'Investors' | 'Partners' | 'Clients' | 'Press' | 'Vendors' | 'Legal';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA
// =============================================================================

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'team', label: 'Team' },
  { id: 'board', label: 'Board' },
  { id: 'contacts', label: 'Contacts' },
];

const TEAM = [
  { id: 'p1', name: 'Alex Morgan', role: 'Founder & CEO', type: 'Full-time', reportsTo: null, level: 0, initials: 'AM' },
  { id: 'p2', name: 'Marcus Chen', role: 'CTO', type: 'Full-time', reportsTo: 'p1', level: 1, initials: 'MC' },
  { id: 'p3', name: 'Aisha Williams', role: 'Head of Product', type: 'Full-time', reportsTo: 'p1', level: 1, initials: 'AW' },
  { id: 'p4', name: 'David Park', role: 'Lead Engineer', type: 'Full-time', reportsTo: 'p2', level: 2, initials: 'DP' },
  { id: 'p5', name: 'Sofia Reyes', role: 'Designer', type: 'Contract', reportsTo: 'p3', level: 2, initials: 'SR' },
  { id: 'p6', name: 'Jordan Ellis', role: 'Operations Manager', type: 'Full-time', reportsTo: 'p1', level: 1, initials: 'JE' },
];

const BOARD = [
  { id: 'b1', name: 'Alex Morgan', title: 'Founder & CEO', seat: 'Founder Seat', term: 'Permanent' },
  { id: 'b2', name: 'Dr. Patricia Moore', title: 'Angel Investor & Advisor', seat: 'Investor Seat', term: '2024-2027' },
  { id: 'b3', name: 'James Bradford', title: 'Industry Advisor, ex-VP Google', seat: 'Advisor Seat', term: '2024-2026' },
];

const CONTACT_CATEGORIES: ContactCategory[] = ['All', 'Investors', 'Partners', 'Clients', 'Press', 'Vendors', 'Legal'];

const CONTACTS = [
  { id: 'c1', name: 'Velocity Ventures', category: 'Investors' as ContactCategory, contact: 'Sarah Lin', email: 'sarah@velocityvc.com', note: 'Lead investor, pre-seed round' },
  { id: 'c2', name: 'Horizon Capital', category: 'Investors' as ContactCategory, contact: 'Michael Torres', email: 'mt@horizoncap.io', note: 'Seed-stage interest' },
  { id: 'c3', name: 'NAA Conference Partners', category: 'Partners' as ContactCategory, contact: 'Robert Hughes', email: 'rhughes@naia.org', note: 'Beta testing partnership' },
  { id: 'c4', name: 'Faith Community Church', category: 'Clients' as ContactCategory, contact: 'Pastor David Brown', email: 'dbrown@fcc.org', note: 'Pilot church customer' },
  { id: 'c5', name: 'TechCrunch', category: 'Press' as ContactCategory, contact: 'Amanda Wells', email: 'amanda@techcrunch.com', note: 'Journalist covering EdTech/SaaS' },
  { id: 'c6', name: 'AWS', category: 'Vendors' as ContactCategory, contact: 'Cloud Team', email: 'enterprise@aws.amazon.com', note: 'Infrastructure provider' },
  { id: 'c7', name: 'Vercel', category: 'Vendors' as ContactCategory, contact: 'Support', email: 'support@vercel.com', note: 'Hosting & deployment' },
  { id: 'c8', name: 'Mitchell & Associates', category: 'Legal' as ContactCategory, contact: 'Laura Mitchell, Esq.', email: 'lmitchell@mitchelllaw.com', note: 'Corporate counsel, IP filings' },
];

const TYPE_COLORS: Record<string, string> = {
  'Full-time': '#22C55E',
  'Contract': '#F59E0B',
  'Part-time': '#1D9BF0',
};

const SEAT_COLORS: Record<string, string> = {
  'Founder Seat': '#1D9BF0',
  'Investor Seat': '#1D9BF0',
  'Advisor Seat': '#1D9BF0',
};

const CATEGORY_COLORS: Record<string, string> = {
  Investors: '#1D9BF0',
  Partners: '#1D9BF0',
  Clients: '#22C55E',
  Press: '#1D9BF0',
  Vendors: '#F59E0B',
  Legal: '#1D9BF0',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BizPeople({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('team');
  const [activeCategory, setActiveCategory] = useState<ContactCategory>('All');

  const handleViewPress = useCallback((id: ViewMode) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const handleCategoryPress = useCallback((cat: ContactCategory) => {
    Haptics.selectionAsync();
    setActiveCategory(cat);
  }, []);

  const filteredContacts = activeCategory === 'All'
    ? CONTACTS
    : CONTACTS.filter((c) => c.category === activeCategory);

  // ---------------------------------------------------------------------------
  // TEAM
  // ---------------------------------------------------------------------------
  const renderTeam = () => {
    // Group by level for org chart
    const executives = TEAM.filter((p) => p.level === 0);
    const directors = TEAM.filter((p) => p.level === 1);
    const individual = TEAM.filter((p) => p.level === 2);

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Summary */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <ThemedText style={[s.summaryValue, { color: colors.text }]}>{TEAM.length}</ThemedText>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Total</ThemedText>
            </View>
            <View style={s.summaryItem}>
              <ThemedText style={[s.summaryValue, { color: '#22C55E' }]}>
                {TEAM.filter((p) => p.type === 'Full-time').length}
              </ThemedText>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Full-time</ThemedText>
            </View>
            <View style={s.summaryItem}>
              <ThemedText style={[s.summaryValue, { color: '#F59E0B' }]}>
                {TEAM.filter((p) => p.type === 'Contract').length}
              </ThemedText>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Contract</ThemedText>
            </View>
          </View>
        </View>

        {/* Executive */}
        <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EXECUTIVE</ThemedText>
        {executives.map((person) => renderPersonCard(person))}

        {/* Directors / Leads */}
        <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>DIRECTORS</ThemedText>
        {directors.map((person) => renderPersonCard(person))}

        {/* Individual Contributors */}
        <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>INDIVIDUAL CONTRIBUTORS</ThemedText>
        {individual.map((person) => renderPersonCard(person))}
      </ScrollView>
    );
  };

  const renderPersonCard = (person: typeof TEAM[0]) => {
    const typeColor = TYPE_COLORS[person.type] ?? colors.textSecondary;
    const reportsToName = person.reportsTo
      ? TEAM.find((p) => p.id === person.reportsTo)?.name ?? 'N/A'
      : 'None';
    return (
      <View key={person.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
        <View style={s.personRow}>
          <View style={[s.avatar, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.avatarText, { color: accentColor }]}>{person.initials}</ThemedText>
          </View>
          <View style={s.personInfo}>
            <ThemedText style={[s.personName, { color: colors.text }]}>{person.name}</ThemedText>
            <ThemedText style={[s.personRole, { color: colors.textSecondary }]}>{person.role}</ThemedText>
            <View style={s.personMeta}>
              <View style={[s.statusBadge, { backgroundColor: typeColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: typeColor }]}>{person.type.toUpperCase()}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        <View style={[s.reportsToRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
          <IconSymbol name="arrow.up" size={12} color={colors.textTertiary} />
          <ThemedText style={[s.reportsToText, { color: colors.textSecondary }]}>Reports to: {reportsToName}</ThemedText>
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // BOARD
  // ---------------------------------------------------------------------------
  const renderBoard = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BOARD MEMBERS & ADVISORS</ThemedText>
      {BOARD.map((member) => {
        const seatColor = SEAT_COLORS[member.seat] ?? colors.textSecondary;
        return (
          <View key={member.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.personRow}>
              <View style={[s.avatar, { backgroundColor: seatColor + '20' }]}>
                <ThemedText style={[s.avatarText, { color: seatColor }]}>
                  {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </ThemedText>
              </View>
              <View style={s.personInfo}>
                <ThemedText style={[s.personName, { color: colors.text }]}>{member.name}</ThemedText>
                <ThemedText style={[s.personRole, { color: colors.textSecondary }]}>{member.title}</ThemedText>
              </View>
            </View>
            <View style={[s.boardDetailRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={s.boardDetailItem}>
                <ThemedText style={[s.boardDetailLabel, { color: colors.textSecondary }]}>Seat</ThemedText>
                <View style={[s.statusBadge, { backgroundColor: seatColor + '20' }]}>
                  <ThemedText style={[s.statusBadgeText, { color: seatColor }]}>{member.seat.toUpperCase()}</ThemedText>
                </View>
              </View>
              <View style={s.boardDetailItem}>
                <ThemedText style={[s.boardDetailLabel, { color: colors.textSecondary }]}>Term</ThemedText>
                <ThemedText style={[s.boardDetailValue, { color: colors.text }]}>{member.term}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // CONTACTS
  // ---------------------------------------------------------------------------
  const renderContacts = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.filterRow}>
        {CONTACT_CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <Pressable
              key={cat}
              style={[s.filterPill, { backgroundColor: isActive ? accentColor : '#2F3336' }]}
              onPress={() => handleCategoryPress(cat)}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {cat}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Contacts list */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        {activeCategory === 'All' ? 'ALL CONTACTS' : activeCategory.toUpperCase()} ({filteredContacts.length})
      </ThemedText>
      {filteredContacts.map((contact) => {
        const catColor = CATEGORY_COLORS[contact.category] ?? colors.textSecondary;
        return (
          <View key={contact.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.contactHeader}>
              <View style={[s.contactIcon, { backgroundColor: catColor + '15' }]}>
                <IconSymbol name="person.fill" size={16} color={catColor} />
              </View>
              <View style={s.contactHeaderInfo}>
                <ThemedText style={[s.contactName, { color: colors.text }]}>{contact.name}</ThemedText>
                <ThemedText style={[s.contactPerson, { color: colors.textSecondary }]}>{contact.contact}</ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: catColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: catColor }]}>{contact.category.toUpperCase()}</ThemedText>
              </View>
            </View>
            <View style={[s.contactDetail, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={s.contactDetailRow}>
                <IconSymbol name="envelope.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.contactEmail, { color: colors.textSecondary }]} numberOfLines={1}>{contact.email}</ThemedText>
              </View>
              <ThemedText style={[s.contactNote, { color: colors.textSecondary }]}>{contact.note}</ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.viewPill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handleViewPress(v.id)}
            >
              <ThemedText style={[s.viewPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeView === 'team' && renderTeam()}
      {activeView === 'board' && renderBoard()}
      {activeView === 'contacts' && renderContacts()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ViewBar
  viewBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Person card
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
  },
  personRole: {
    fontSize: 12,
  },
  personMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },

  // Reports to
  reportsToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  reportsToText: {
    fontSize: 12,
  },

  // Board
  boardDetailRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  boardDetailItem: {
    gap: 4,
  },
  boardDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  boardDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Filters
  filterRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Contacts
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactHeaderInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactPerson: {
    fontSize: 12,
    marginTop: 2,
  },
  contactDetail: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactEmail: {
    fontSize: 12,
    flex: 1,
  },
  contactNote: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
});
