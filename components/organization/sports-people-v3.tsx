/**
 * Sports People V3 — 3-pill ViewBar (Staff | Contacts | Directory)
 * KaNeXT Men's Basketball · NAIA KaNeXT Conference
 * Head Coach / GM perspective. Inline mock data, no DrillMode.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'staff' | 'contacts' | 'directory';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'staff', label: 'Staff' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'directory', label: 'Directory' },
];

interface StaffMember {
  id: string;
  name: string;
  title: string;
  team: string;
  phone: string;
  email: string;
}

const STAFF: StaffMember[] = [
  { id: 's1', name: 'Marcus Brooks', title: 'Head Coach', team: 'Varsity', phone: '(305) 555-0101', email: 'mbrooks@fmu.edu' },
  { id: 's2', name: 'Darius Hill', title: 'Head Coach', team: 'Dev 1', phone: '(305) 555-0102', email: 'dhill@fmu.edu' },
  { id: 's3', name: 'Terrence Williams', title: 'Head Coach', team: 'Dev 2', phone: '(305) 555-0103', email: 'twilliams@fmu.edu' },
  { id: 's4', name: 'Andre Mitchell', title: 'Assistant Coach', team: 'Varsity', phone: '(305) 555-0104', email: 'amitchell@fmu.edu' },
  { id: 's5', name: 'Devon Clark', title: 'Strength & Conditioning Coach', team: 'All Teams', phone: '(305) 555-0105', email: 'dclark@fmu.edu' },
  { id: 's6', name: 'Lisa Perkins', title: 'Athletic Trainer', team: 'All Teams', phone: '(305) 555-0106', email: 'lperkins@fmu.edu' },
  { id: 's7', name: 'Jamal Foster', title: 'Video Coordinator', team: 'All Teams', phone: '(305) 555-0107', email: 'jfoster@fmu.edu' },
  { id: 's8', name: 'Tamara Hughes', title: 'Academic Advisor', team: 'All Teams', phone: '(305) 555-0108', email: 'thughes@fmu.edu' },
];

interface Contact {
  id: string;
  name: string;
  relationship: string;
  associatedPlayer: string;
  lastContact: string;
}

const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Robert Jenkins Sr.', relationship: 'Recruit Parent', associatedPlayer: 'Robert Jenkins Jr.', lastContact: 'Jan 12, 2025' },
  { id: 'c2', name: 'Coach Darryl Thomas', relationship: 'HS Coach', associatedPlayer: 'Marcus Lane', lastContact: 'Jan 10, 2025' },
  { id: 'c3', name: 'Patricia Williams', relationship: 'Recruit Parent', associatedPlayer: 'Jaylen Williams', lastContact: 'Jan 8, 2025' },
  { id: 'c4', name: 'Coach Ray Simmons', relationship: 'AAU Coach', associatedPlayer: 'Terrell Davis', lastContact: 'Jan 5, 2025' },
  { id: 'c5', name: 'Angela Moore', relationship: 'Recruit Parent', associatedPlayer: 'DeShawn Moore', lastContact: 'Dec 28, 2024' },
  { id: 'c6', name: 'Coach James Wright', relationship: 'HS Coach', associatedPlayer: 'Brandon Carter', lastContact: 'Dec 20, 2024' },
];

type DirectoryFilter = 'all' | 'staff' | 'varsity' | 'dev1' | 'dev2' | 'contacts';

const DIRECTORY_FILTERS: { id: DirectoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'staff', label: 'Staff' },
  { id: 'varsity', label: 'Varsity' },
  { id: 'dev1', label: 'Dev 1' },
  { id: 'dev2', label: 'Dev 2' },
  { id: 'contacts', label: 'Contacts' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: STAFF
// =============================================================================

function StaffView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        COACHING & SUPPORT STAFF
      </ThemedText>
      {STAFF.map((member) => (
        <Pressable
          key={member.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.staffHeader}>
            <View style={[s.avatar, { backgroundColor: accentColor + '30' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {member.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={s.staffInfo}>
              <ThemedText style={[s.staffName, { color: colors.text }]}>{member.name}</ThemedText>
              <ThemedText style={[s.staffTitle, { color: colors.textSecondary }]}>{member.title}</ThemedText>
            </View>
            <StatusBadge label={member.team.toUpperCase()} color={accentColor} />
          </View>
          <View style={[s.staffContact, { borderTopColor: colors.border }]}>
            <View style={s.contactItem}>
              <IconSymbol name="phone.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.contactText, { color: colors.textSecondary }]}>{member.phone}</ThemedText>
            </View>
            <View style={s.contactItem}>
              <IconSymbol name="envelope.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.contactText, { color: colors.textSecondary }]}>{member.email}</ThemedText>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: CONTACTS
// =============================================================================

function ContactsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        EXTERNAL CONTACTS
      </ThemedText>
      {CONTACTS.map((contact) => (
        <View
          key={contact.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.contactHeader}>
            <View style={s.contactHeaderInfo}>
              <ThemedText style={[s.contactName, { color: colors.text }]}>{contact.name}</ThemedText>
              <StatusBadge label={contact.relationship.toUpperCase()} color="#6AA9FF" />
            </View>
          </View>
          <View style={[s.contactMeta, { borderTopColor: colors.border }]}>
            <View style={s.contactMetaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.contactMetaText, { color: colors.textSecondary }]}>
                {contact.associatedPlayer}
              </ThemedText>
            </View>
            <View style={s.contactMetaItem}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.contactMetaText, { color: colors.textSecondary }]}>
                Last contact: {contact.lastContact}
              </ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: DIRECTORY
// =============================================================================

function DirectoryView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [filter, setFilter] = useState<DirectoryFilter>('all');
  const [search, setSearch] = useState('');

  const allEntries = useMemo(() => {
    const entries: { id: string; name: string; subtitle: string; group: string; filterKey: DirectoryFilter }[] = [];
    STAFF.forEach((m) => {
      let fk: DirectoryFilter = 'staff';
      if (m.team === 'Varsity') fk = 'varsity';
      else if (m.team === 'Dev 1') fk = 'dev1';
      else if (m.team === 'Dev 2') fk = 'dev2';
      entries.push({ id: m.id, name: m.name, subtitle: `${m.title} · ${m.team}`, group: 'Staff', filterKey: fk });
    });
    CONTACTS.forEach((c) => {
      entries.push({ id: c.id, name: c.name, subtitle: `${c.relationship} · ${c.associatedPlayer}`, group: 'Contacts', filterKey: 'contacts' });
    });
    return entries;
  }, []);

  const filtered = useMemo(() => {
    let list = allEntries;
    if (filter === 'staff') list = list.filter((e) => e.group === 'Staff');
    else if (filter === 'contacts') list = list.filter((e) => e.filterKey === 'contacts');
    else if (filter === 'varsity') list = allEntries.filter((e) => e.filterKey === 'varsity');
    else if (filter === 'dev1') list = allEntries.filter((e) => e.filterKey === 'dev1');
    else if (filter === 'dev2') list = allEntries.filter((e) => e.filterKey === 'dev2');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q));
    }
    return list;
  }, [allEntries, filter, search]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search directory..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={{ flexGrow: 0, marginBottom: 12 }}
      >
        {DIRECTORY_FILTERS.map((f) => {
          const isActive = f.id === filter;
          return (
            <Pressable
              key={f.id}
              style={[
                s.filterPill,
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f.id);
              }}
            >
              <ThemedText
                style={[
                  s.filterPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        {filtered.length} RESULT{filtered.length !== 1 ? 'S' : ''}
      </ThemedText>
      {filtered.map((entry) => (
        <View
          key={entry.id}
          style={[s.listRow, { borderBottomColor: colors.border }]}
        >
          <View style={[s.dirAvatar, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.dirAvatarText, { color: accentColor }]}>
              {entry.name.split(' ').map((n) => n[0]).join('')}
            </ThemedText>
          </View>
          <View style={s.dirInfo}>
            <ThemedText style={[s.dirName, { color: colors.text }]}>{entry.name}</ThemedText>
            <ThemedText style={[s.dirSub, { color: colors.textSecondary }]}>{entry.subtitle}</ThemedText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsPeople({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('staff');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'staff':
        return <StaffView colors={colors} accentColor={accentColor} />;
      case 'contacts':
        return <ContactsView colors={colors} accentColor={accentColor} />;
      case 'directory':
        return <DirectoryView colors={colors} accentColor={accentColor} />;
    }
  };

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
                s.pill,
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
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

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Staff --
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
  },
  staffTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  staffContact: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
  },

  // -- Contacts --
  contactHeader: {
    marginBottom: 4,
  },
  contactHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  contactMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  contactMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactMetaText: {
    fontSize: 12,
  },

  // -- Directory --
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dirAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirAvatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dirInfo: {
    flex: 1,
  },
  dirName: {
    fontSize: 13,
    fontWeight: '600',
  },
  dirSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
