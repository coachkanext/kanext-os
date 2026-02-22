/**
 * Church People V3 — KaNeXT Church · Senior Pastor
 * ViewBar: Leadership | Members | Visitors
 * Self-contained with inline mock data.
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

type ViewId = 'leadership' | 'members' | 'visitors';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// VIEWS
// =============================================================================

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'leadership', label: 'Leadership' },
  { id: 'members', label: 'Members' },
  { id: 'visitors', label: 'Visitors' },
];

// =============================================================================
// MOCK DATA
// =============================================================================

interface Leader {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  ministries: string[];
}

const LEADERSHIP: Leader[] = [
  { id: 'l1', name: 'Dr. Oladipo Carter', title: 'Senior Pastor', phone: '(310) 555-0101', email: 'pastor@iccla.org', ministries: ['All Ministries', 'Hotline to Heaven'] },
  { id: 'l2', name: 'Pastor Grace Carter', title: 'Associate Pastor', phone: '(310) 555-0102', email: 'grace@iccla.org', ministries: ['Connect Groups', 'Women\'s Ministry'] },
  { id: 'l3', name: 'Pastor David Akinola', title: 'Youth Pastor', phone: '(310) 555-0103', email: 'david@iccla.org', ministries: ['Fresh Fire', 'T.O.R.C.H.'] },
  { id: 'l4', name: 'Minister Sarah Okonkwo', title: 'Worship Leader', phone: '(310) 555-0104', email: 'sarah@iccla.org', ministries: ['Vineyard Voices'] },
  { id: 'l5', name: 'Deacon James Mensah', title: 'Deacon Board Chair', phone: '(310) 555-0105', email: 'james@iccla.org', ministries: ['Single Saved Serving', 'Operations'] },
  { id: 'l6', name: 'Elder Ruth Adeyemi', title: 'Elder', phone: '(310) 555-0106', email: 'ruth@iccla.org', ministries: ['Rooted', 'Pastoral Care'] },
  { id: 'l7', name: 'Brother Michael Osei', title: 'T.O.R.C.H. Leader', phone: '(310) 555-0107', email: 'michael@iccla.org', ministries: ['T.O.R.C.H.', 'The Harvesters'] },
  { id: 'l8', name: 'Sister Funke Balogun', title: 'Sheepfold Director', phone: '(310) 555-0108', email: 'funke@iccla.org', ministries: ['Sheepfold'] },
];

type MemberStatus = 'Member' | 'Regular Attendee' | 'Volunteer' | 'Leader';

interface ChurchMember {
  id: string;
  name: string;
  status: MemberStatus;
  ministries: string[];
  joinDate: string;
}

const MEMBERS: ChurchMember[] = [
  { id: 'cm1', name: 'Adebayo Oluwaseun', status: 'Member', ministries: ['T.O.R.C.H.', 'Vineyard Voices'], joinDate: 'Jan 2020' },
  { id: 'cm2', name: 'Chioma Eze', status: 'Volunteer', ministries: ['Sheepfold'], joinDate: 'Mar 2021' },
  { id: 'cm3', name: 'Daniel Kwame', status: 'Member', ministries: ['Connect Groups'], joinDate: 'Sep 2019' },
  { id: 'cm4', name: 'Esther Nwankwo', status: 'Leader', ministries: ['Rooted', 'Connect Groups'], joinDate: 'Jun 2018' },
  { id: 'cm5', name: 'Francis Adjei', status: 'Member', ministries: ['The Harvesters'], joinDate: 'Feb 2022' },
  { id: 'cm6', name: 'Grace Amponsah', status: 'Regular Attendee', ministries: [], joinDate: 'Nov 2023' },
  { id: 'cm7', name: 'Henry Okafor', status: 'Volunteer', ministries: ['Operations', 'Parking'], joinDate: 'Apr 2021' },
  { id: 'cm8', name: 'Ifeoma Chukwu', status: 'Member', ministries: ['Vineyard Voices'], joinDate: 'Aug 2020' },
  { id: 'cm9', name: 'Joseph Mensah', status: 'Volunteer', ministries: ['Sound/Media'], joinDate: 'Jan 2023' },
  { id: 'cm10', name: 'Kezia Boateng', status: 'Member', ministries: ['Single Saved Serving'], joinDate: 'May 2022' },
  { id: 'cm11', name: 'Lola Adebisi', status: 'Regular Attendee', ministries: [], joinDate: 'Oct 2024' },
  { id: 'cm12', name: 'Nnamdi Ugochukwu', status: 'Leader', ministries: ['T.O.R.C.H.', 'The Harvesters'], joinDate: 'Jul 2019' },
];

type FollowUpStatus = 'Contacted' | 'Needs Follow-up' | 'Connected';

interface Visitor {
  id: string;
  name: string;
  firstVisit: string;
  returnVisits: number;
  followUpStatus: FollowUpStatus;
  assignedGroup: string | null;
}

const VISITORS: Visitor[] = [
  { id: 'vis1', name: 'Amanda Richards', firstVisit: 'Feb 2, 2025', returnVisits: 3, followUpStatus: 'Connected', assignedGroup: 'Connect Group 4' },
  { id: 'vis2', name: 'Brian Asante', firstVisit: 'Feb 9, 2025', returnVisits: 2, followUpStatus: 'Contacted', assignedGroup: null },
  { id: 'vis3', name: 'Cynthia Okoro', firstVisit: 'Feb 9, 2025', returnVisits: 1, followUpStatus: 'Needs Follow-up', assignedGroup: null },
  { id: 'vis4', name: 'David & Mary Thompson', firstVisit: 'Jan 26, 2025', returnVisits: 4, followUpStatus: 'Connected', assignedGroup: 'Connect Group 2' },
  { id: 'vis5', name: 'Emmanuel Osei', firstVisit: 'Feb 16, 2025', returnVisits: 0, followUpStatus: 'Needs Follow-up', assignedGroup: null },
  { id: 'vis6', name: 'Fatima Bello', firstVisit: 'Feb 16, 2025', returnVisits: 0, followUpStatus: 'Needs Follow-up', assignedGroup: null },
];

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  Member: '#22C55E',
  'Regular Attendee': '#1D9BF0',
  Volunteer: '#1D9BF0',
  Leader: '#F59E0B',
  Contacted: '#1D9BF0',
  'Needs Follow-up': '#EF4444',
  Connected: '#22C55E',
};

function getInitials(name: string): string {
  const parts = name.replace(/^(Pastor|Elder|Dr\.?|Minister|Deacon|Brother|Sister|Sis\.|Bro\.)\s+/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

// =============================================================================
// VIEW BAR
// =============================================================================

function ViewBar({
  views,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  views: typeof VIEWS;
  activeId: ViewId;
  onSelect: (id: ViewId) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.viewBar}>
      {views.map((v) => {
        const isActive = v.id === activeId;
        return (
          <Pressable
            key={v.id}
            style={[
              s.viewPill,
              {
                backgroundColor: isActive ? accentColor : '#2F3336',
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.viewPillText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// LEADERSHIP VIEW
// =============================================================================

function LeadershipView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CHURCH LEADERSHIP</ThemedText>
      {LEADERSHIP.map((leader) => (
        <View
          key={leader.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.leaderRow}>
            <View style={[s.avatar, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>{getInitials(leader.name)}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.leaderName, { color: colors.text }]}>{leader.name}</ThemedText>
              <ThemedText style={[s.leaderTitle, { color: colors.textSecondary }]}>{leader.title}</ThemedText>
            </View>
          </View>
          <View style={s.leaderMeta}>
            <View style={s.metaItem}>
              <IconSymbol name="phone.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{leader.phone}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="envelope.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{leader.email}</ThemedText>
            </View>
          </View>
          {leader.ministries.length > 0 && (
            <View style={s.ministriesRow}>
              {leader.ministries.map((m) => (
                <View key={m} style={[s.ministryChip, { backgroundColor: '#2F3336' }]}>
                  <ThemedText style={[s.ministryChipText, { color: colors.textSecondary }]}>{m}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MEMBERS VIEW
// =============================================================================

type MemberFilter = 'All' | 'Members' | 'Volunteers' | 'Leaders';

function MembersView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [filter, setFilter] = useState<MemberFilter>('All');
  const FILTERS: MemberFilter[] = ['All', 'Members', 'Volunteers', 'Leaders'];

  const filtered = MEMBERS.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Members') return m.status === 'Member' || m.status === 'Regular Attendee';
    if (filter === 'Volunteers') return m.status === 'Volunteer';
    if (filter === 'Leaders') return m.status === 'Leader';
    return true;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Filter Pills */}
      <View style={s.filterRow}>
        {FILTERS.map((f) => {
          const isActive = f === filter;
          return (
            <Pressable
              key={f}
              style={[
                s.filterPill,
                {
                  backgroundColor: isActive ? accentColor + '20' : '#2F3336',
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f);
              }}
            >
              <ThemedText
                style={[s.filterPillText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {f}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        {filtered.length} {filter === 'All' ? 'PEOPLE' : filter.toUpperCase()}
      </ThemedText>

      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {filtered.map((member, idx) => (
          <View
            key={member.id}
            style={[
              s.memberRow,
              idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.avatarSmall, { backgroundColor: STATUS_COLORS[member.status] + '20' }]}>
              <ThemedText style={[s.avatarSmallText, { color: STATUS_COLORS[member.status] }]}>
                {getInitials(member.name)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.memberName, { color: colors.text }]}>{member.name}</ThemedText>
              <View style={s.memberMetaRow}>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[member.status] + '20' }]}>
                  <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[member.status] }]}>
                    {member.status}
                  </ThemedText>
                </View>
                <ThemedText style={[s.memberJoin, { color: colors.textTertiary }]}>Since {member.joinDate}</ThemedText>
              </View>
              {member.ministries.length > 0 && (
                <ThemedText style={[s.memberMinistries, { color: colors.textSecondary }]} numberOfLines={1}>
                  {member.ministries.join(', ')}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VISITORS VIEW
// =============================================================================

function VisitorsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>RECENT VISITORS</ThemedText>
      {VISITORS.map((visitor) => (
        <View
          key={visitor.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.visitorHeader}>
            <View style={[s.avatarSmall, { backgroundColor: STATUS_COLORS[visitor.followUpStatus] + '20' }]}>
              <ThemedText style={[s.avatarSmallText, { color: STATUS_COLORS[visitor.followUpStatus] }]}>
                {getInitials(visitor.name)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.visitorName, { color: colors.text }]}>{visitor.name}</ThemedText>
              <ThemedText style={[s.visitorDate, { color: colors.textSecondary }]}>First visit: {visitor.firstVisit}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[visitor.followUpStatus] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[visitor.followUpStatus] }]}>
                {visitor.followUpStatus}
              </ThemedText>
            </View>
          </View>
          <View style={s.visitorMeta}>
            <View style={s.metaItem}>
              <IconSymbol name="arrow.triangle.2.circlepath" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
                {visitor.returnVisits} return visit{visitor.returnVisits !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            {visitor.assignedGroup && (
              <View style={s.metaItem}>
                <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{visitor.assignedGroup}</ThemedText>
              </View>
            )}
          </View>
          {/* Pipeline */}
          <View style={s.pipelineRow}>
            {(['First Visit', 'Follow-up', 'Connected', 'Member'] as const).map((stage, idx) => {
              let filled = false;
              if (stage === 'First Visit') filled = true;
              if (stage === 'Follow-up') filled = visitor.followUpStatus === 'Contacted' || visitor.followUpStatus === 'Connected';
              if (stage === 'Connected') filled = visitor.followUpStatus === 'Connected';
              if (stage === 'Member') filled = false;
              return (
                <View key={stage} style={s.pipelineStage}>
                  <View style={[s.pipelineDot, { backgroundColor: filled ? accentColor : colors.textTertiary }]} />
                  <ThemedText style={[s.pipelineLabel, { color: filled ? accentColor : colors.textTertiary }]}>{stage}</ThemedText>
                  {idx < 3 && (
                    <View style={[s.pipelineLine, { backgroundColor: filled ? accentColor + '40' : colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchPeople({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('leadership');

  const handleViewChange = useCallback((id: ViewId) => {
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'leadership':
        return <LeadershipView colors={colors} accentColor={accentColor} />;
      case 'members':
        return <MembersView colors={colors} accentColor={accentColor} />;
      case 'visitors':
        return <VisitorsView colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <ViewBar
        views={VIEWS}
        activeId={activeView}
        onSelect={handleViewChange}
        accentColor={accentColor}
        colors={colors}
      />
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

  // -- View Bar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
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
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // -- Status Badge --
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // -- Avatar --
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // -- Meta --
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },

  // -- Leadership --
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  leaderMeta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  ministriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ministryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ministryChipText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // -- Members --
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 3,
  },
  memberJoin: {
    fontSize: 10,
  },
  memberMinistries: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Visitors --
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  visitorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  visitorDate: {
    fontSize: 12,
    marginTop: 2,
  },
  visitorMeta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },
  pipelineStage: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  pipelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  pipelineLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  pipelineLine: {
    position: 'absolute',
    top: 4,
    left: '60%',
    right: '-40%',
    height: 2,
  },
});
