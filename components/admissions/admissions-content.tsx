/**
 * Admissions — 3-page swipeable layout for education mode.
 * Page 0: Enrollment — Kanban board with 7 stages.
 * Page 1: Discover — filterable prospect list with sort.
 * Page 2: Applications — filterable application queue.
 * Identical SwipeablePages / LongPressContextMenu patterns as Leads.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  ENROLLMENT_STAGES,
  ENROLLMENT_SUMMARY,
  getApplicantsByStage,
  getStageConversion,
  getProspects,
  getApplications,
  formatAidAmount,
  type ApplicantCard as ApplicantCardType,
  type EnrollmentStage,
  type ProspectFilter,
  type ProspectSort,
  type ProspectItem,
  type AppFilter,
  type ApplicationItem,
} from '@/data/mock-admissions';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const COLUMN_WIDTH = Dimensions.get('window').width * 0.72;

const APP_TYPE_LABELS: Record<string, string> = {
  'early-decision': 'ED',
  'early-action': 'EA',
  'regular': 'RD',
  'transfer': 'TR',
  'international': 'INT',
};

// ─── Page Top Bar ──────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ───────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── FAB ───────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color={C.label} />
    </Pressable>
  );
}

// ─── Sort Row ──────────────────────────────────────────────────────────────

function SortRow({
  sort,
  onSort,
}: {
  sort: ProspectSort;
  onSort: (key: ProspectSort) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const sortOptions: { key: ProspectSort; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'gpa', label: 'GPA' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'location', label: 'Location' },
    { key: 'intendedMajor', label: 'Major' },
  ];

  return (
    <View style={s.sortRow}>
      <Text style={s.sortLabel}>Sort by:</Text>
      {sortOptions.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onSort(opt.key)}
          style={[s.sortOption, sort === opt.key && s.sortOptionActive]}
        >
          <Text style={[s.sortOptionText, sort === opt.key && s.sortOptionTextActive]}>{opt.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Enrollment Summary Card ──────────────────────────────────────────────

function EnrollmentSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const yieldDelta = ENROLLMENT_SUMMARY.yieldRate - ENROLLMENT_SUMMARY.lastCycleYieldRate;
  const yieldTrend = yieldDelta >= 0 ? `+${yieldDelta}%` : `${yieldDelta}%`;

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>ENROLLMENT FUNNEL</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{ENROLLMENT_SUMMARY.yieldRate}% yield</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{ENROLLMENT_SUMMARY.totalProspects}</Text>
          <Text style={s.summaryPosLabel}>Prospects</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{ENROLLMENT_SUMMARY.totalApplicants}</Text>
          <Text style={s.summaryPosLabel}>Applicants</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{ENROLLMENT_SUMMARY.totalAdmitted}</Text>
          <Text style={s.summaryPosLabel}>Admitted</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{ENROLLMENT_SUMMARY.totalEnrolled}</Text>
          <Text style={s.summaryPosLabel}>Enrolled</Text>
        </View>
      </View>
      <Text style={s.yieldTrend}>vs last cycle: {yieldTrend}</Text>
    </View>
  );
}

// ─── Applicant Card (Kanban) ──────────────────────────────────────────────

function ApplicantKanbanCard({
  applicant,
  onLongPress,
}: {
  applicant: ApplicantCardType;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const AID_COLORS: Record<string, string> = {
    none: C.muted,
    pending: C.amber,
    awarded: C.green,
  };
  const appTypeLabel = APP_TYPE_LABELS[applicant.applicationType] || applicant.applicationType;
  const aidColor = AID_COLORS[applicant.financialAidStatus];

  return (
    <Pressable
      style={({ pressed }) => [s.dealCard, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.dealCardHeader}>
        <View style={s.applicantAvatar}>
          <Text style={s.applicantAvatarText}>{applicant.initials}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.dealCardContact} numberOfLines={1}>{applicant.name}</Text>
          <Text style={s.dealCardCompany} numberOfLines={1}>{applicant.intendedMajor}</Text>
        </View>
        <View style={[s.priorityPill, { backgroundColor: C.purple + '22' }]}>
          <Text style={[s.priorityPillText, { color: C.purple }]}>{appTypeLabel}</Text>
        </View>
      </View>
      <Text style={s.applicantLocation} numberOfLines={1}>{applicant.location}</Text>
      <View style={s.applicantStatsRow}>
        <Text style={s.applicantGpa}>{applicant.gpa.toFixed(2)} GPA</Text>
        {applicant.testScore && (
          <>
            <Text style={s.dealCardDot}>&middot;</Text>
            <Text style={s.applicantTestScore}>{applicant.testScore} SAT</Text>
          </>
        )}
      </View>
      {applicant.financialAidStatus !== 'none' && (
        <View style={[s.aidPill, { backgroundColor: aidColor + '22' }]}>
          <Text style={[s.aidPillText, { color: aidColor }]}>Aid: {applicant.financialAidStatus}</Text>
        </View>
      )}
      <View style={s.dealCardFooter}>
        <Text style={s.dealCardMeta}>{applicant.lastInteraction}</Text>
      </View>
      {applicant.flags.length > 0 && (
        <View style={s.flagsRow}>
          {applicant.flags.map((flag) => (
            <View key={flag} style={s.flagBadge}>
              <Text style={s.flagBadgeText}>{flag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

// ─── Prospect Row ─────────────────────────────────────────────────────────

function ProspectRow({
  prospect,
  onLongPress,
}: {
  prospect: ProspectItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const ENGAGEMENT_COLORS: Record<string, string> = {
    hot: C.red,
    warm: C.amber,
    cold: C.blue,
  };
  const engColor = ENGAGEMENT_COLORS[prospect.engagementLevel];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.contactAvatar}>
        <Text style={s.contactInitials}>{prospect.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.contactNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{prospect.name}</Text>
          <View style={[s.engagementPill, { backgroundColor: engColor + '22' }]}>
            <Text style={[s.engagementPillText, { color: engColor }]}>{prospect.engagementLevel}</Text>
          </View>
        </View>
        <Text style={s.prospectSchool} numberOfLines={1}>{prospect.highSchool}</Text>
        <Text style={s.prospectLocation} numberOfLines={1}>{prospect.location}</Text>
        <View style={s.prospectStatsRow}>
          <Text style={s.prospectGpa}>{prospect.gpa.toFixed(2)} GPA</Text>
          {prospect.testScore && (
            <>
              <Text style={s.dealCardDot}>&middot;</Text>
              <Text style={s.prospectTestScore}>{prospect.testScore}</Text>
            </>
          )}
          <Text style={s.dealCardDot}>&middot;</Text>
          <Text style={s.prospectMajor}>{prospect.intendedMajor}</Text>
        </View>
        <View style={s.prospectMetaRow}>
          <View style={s.sourceBadge}>
            <Text style={s.sourceBadgeText}>{prospect.source.replace('-', ' ')}</Text>
          </View>
          {prospect.eventsAttended > 0 && (
            <Text style={s.eventsText}>{prospect.eventsAttended} events</Text>
          )}
          <Text style={s.lastInteractionText}>{prospect.lastInteraction}</Text>
        </View>
        {prospect.flags.length > 0 && (
          <View style={s.flagsRow}>
            {prospect.flags.map((flag) => (
              <View key={flag} style={s.flagBadge}>
                <Text style={s.flagBadgeText}>{flag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Application Row ──────────────────────────────────────────────────────

function ApplicationRow({
  item,
  onLongPress,
}: {
  item: ApplicationItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const REVIEW_COLORS: Record<string, string> = {
    unread: C.muted,
    'in-review': C.amber,
    scored: C.blue,
    'decision-ready': C.purple,
    decided: C.green,
  };
  const DECISION_COLORS: Record<string, string> = {
    accepted: C.green,
    denied: C.red,
    waitlisted: C.amber,
    deferred: C.blue,
  };
  const reviewColor = REVIEW_COLORS[item.reviewStatus] || C.muted;
  const appTypeLabel = APP_TYPE_LABELS[item.applicationType] || item.applicationType;
  const decisionColor = item.decision ? DECISION_COLORS[item.decision] : undefined;

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.contactAvatar}>
        <Text style={s.contactInitials}>{item.studentInitials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.contactNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{item.studentName}</Text>
          <View style={[s.priorityPill, { backgroundColor: C.purple + '22' }]}>
            <Text style={[s.priorityPillText, { color: C.purple }]}>{appTypeLabel}</Text>
          </View>
        </View>
        <Text style={s.prospectSchool} numberOfLines={1}>{item.program}</Text>
        <Text style={s.lastInteractionText}>Submitted {item.submissionDate}</Text>

        {/* Completeness bar */}
        <View style={s.completenessRow}>
          <View style={s.completenessBar}>
            <View style={[s.completenessFill, { width: `${item.completeness}%`, backgroundColor: item.completeness === 100 ? C.green : C.amber }]} />
          </View>
          <Text style={s.completenessText}>{item.completeness}%</Text>
        </View>

        {item.missingItems.length > 0 && (
          <Text style={s.missingText} numberOfLines={1}>Missing: {item.missingItems.join(', ')}</Text>
        )}

        <View style={s.appMetaRow}>
          {item.reviewerName && (
            <Text style={s.reviewerText}>{item.reviewerName}</Text>
          )}
          <View style={[s.reviewStatusBadge, { backgroundColor: reviewColor + '22' }]}>
            <Text style={[s.reviewStatusText, { color: reviewColor }]}>{item.reviewStatus.replace('-', ' ')}</Text>
          </View>
          {item.decision && decisionColor && (
            <View style={[s.decisionBadge, { backgroundColor: decisionColor + '22' }]}>
              <Text style={[s.decisionBadgeText, { color: decisionColor }]}>{item.decision}</Text>
            </View>
          )}
        </View>

        {item.financialAidAmount != null && (
          <Text style={s.aidAmountText}>Aid: {formatAidAmount(item.financialAidAmount)}</Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── Filter Data ──────────────────────────────────────────────────────────

const PROSPECT_FILTERS: { key: ProspectFilter; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'highGpa',       label: 'High GPA' },
  { key: 'scholarship',   label: 'Scholarship' },
  { key: 'athlete',       label: 'Athlete' },
  { key: 'firstGen',      label: 'First-Gen' },
  { key: 'international', label: 'International' },
];

const APP_FILTERS: { key: AppFilter; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'unreviewed',    label: 'Unreviewed' },
  { key: 'inReview',      label: 'In Review' },
  { key: 'decisionReady', label: 'Decision Ready' },
  { key: 'decided',       label: 'Decided' },
];

// ─── Main Component ──────────────────────────────────────────────────────

export function AdmissionsContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  // Discover state
  const [prospectFilter, setProspectFilter] = useState<ProspectFilter>('all');
  const [prospectSort, setProspectSort] = useState<ProspectSort>('name');

  // Applications state
  const [appFilter, setAppFilter] = useState<AppFilter>('all');

  // ── Data ──
  const prospects = useMemo(
    () => getProspects(prospectFilter, prospectSort),
    [prospectFilter, prospectSort],
  );

  const applications = useMemo(
    () => getApplications(appFilter),
    [appFilter],
  );

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Applicant ──
  const longPressApplicant = useCallback((applicant: ApplicantCardType, pageY: number) => {
    setMenuData({
      title: applicant.name,
      subtitle: `${applicant.intendedMajor} · ${applicant.location} · ${applicant.gpa.toFixed(2)} GPA`,
      initials: applicant.initials,
      pageY,
      actions: [
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'note', label: 'Add Note', icon: 'note.text' },
        { key: 'flag', label: 'Flag', icon: 'flag.fill' },
        { key: 'move', label: 'Move Stage', icon: 'arrow.right.circle' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Prospect ──
  const longPressProspect = useCallback((prospect: ProspectItem, pageY: number) => {
    setMenuData({
      title: prospect.name,
      subtitle: `${prospect.highSchool} · ${prospect.gpa.toFixed(2)} GPA`,
      initials: prospect.initials,
      pageY,
      actions: [
        { key: 'pipeline', label: 'Add to Pipeline', icon: 'plus.circle.fill' },
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'assign', label: 'Assign Counselor', icon: 'person.badge.plus' },
        { key: 'flag', label: 'Flag', icon: 'flag.fill' },
        { key: 'note', label: 'Add Note', icon: 'note.text' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Application ──
  const longPressApplication = useCallback((item: ApplicationItem, pageY: number) => {
    setMenuData({
      title: item.studentName,
      subtitle: `${item.program} · ${item.applicationType}`,
      initials: item.studentInitials,
      pageY,
      actions: [
        { key: 'review', label: 'Review', icon: 'doc.text.fill' },
        { key: 'assign', label: 'Assign Reviewer', icon: 'person.badge.plus' },
        { key: 'request', label: 'Request Documents', icon: 'paperclip' },
        { key: 'accept', label: 'Accept', icon: 'checkmark.seal.fill' },
        { key: 'deny', label: 'Deny', icon: 'xmark.seal.fill' },
        { key: 'waitlist', label: 'Waitlist', icon: 'clock.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
      >
        {/* ── PAGE 0: ENROLLMENT ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Enrollment" />
          </View>

          {/* Summary card */}
          <EnrollmentSummaryCard />

          {/* Horizontal Kanban */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.kanbanScroll}
            decelerationRate="fast"
            snapToInterval={COLUMN_WIDTH + 12}
          >
            {ENROLLMENT_STAGES.map(({ stage, color }, stageIdx) => {
              const applicants = getApplicantsByStage(stage);
              const conversion = getStageConversion(stageIdx);
              return (
                <View key={stage} style={[s.column, { width: COLUMN_WIDTH }]}>
                  {/* Column header */}
                  <View style={s.columnHeader}>
                    <View style={[s.stageIndicator, { backgroundColor: color }]} />
                    <Text style={s.columnTitle}>{stage}</Text>
                    <View style={[s.countBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[s.countText, { color }]}>{applicants.length}</Text>
                    </View>
                    {conversion !== null && (
                      <Text style={s.columnValue}>{conversion}%</Text>
                    )}
                  </View>

                  {/* Applicant cards */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.columnContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {applicants.length === 0 ? (
                      <View style={s.emptyColumn}>
                        <Text style={s.emptyText}>No applicants</Text>
                      </View>
                    ) : (
                      applicants.map((applicant) => (
                        <ApplicantKanbanCard
                          key={applicant.id}
                          applicant={applicant}
                          onLongPress={(pageY) => longPressApplicant(applicant, pageY)}
                        />
                      ))
                    )}
                    <View style={{ height: 100 }} />
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: DISCOVER ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Discover" />
            <FilterPills items={PROSPECT_FILTERS} active={prospectFilter} onSelect={setProspectFilter} />
            <SortRow sort={prospectSort} onSort={setProspectSort} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {prospects.map((prospect, idx) => (
              <View key={prospect.id}>
                {idx > 0 && <View style={s.separator} />}
                <ProspectRow
                  prospect={prospect}
                  onLongPress={(pageY) => longPressProspect(prospect, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 2: APPLICATIONS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Applications" />
            <FilterPills items={APP_FILTERS} active={appFilter} onSelect={setAppFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {applications.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={s.separator} />}
                <ApplicationRow
                  item={item}
                  onLongPress={(pageY) => longPressApplication(item, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Summary card
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  summaryBadge: {
    backgroundColor: C.green + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.green,
  },
  summaryPositions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryPosItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryPosCount: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryPosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },
  yieldTrend: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    marginTop: 8,
  },

  // Kanban
  kanbanScroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  column: { flex: 1 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 2 },
  stageIndicator: { width: 4, height: 16, borderRadius: 2 },
  columnTitle: { fontSize: 13, fontWeight: '700', color: C.label, flex: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '800' },
  columnValue: { fontSize: 11, fontWeight: '600', color: C.muted },
  columnContent: { gap: 8 },
  emptyColumn: { padding: 20, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: C.separator, alignItems: 'center' },
  emptyText: { fontSize: 12, color: C.muted },

  // Applicant card (kanban)
  dealCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  dealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  applicantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantAvatarText: { fontSize: 10, fontWeight: '700', color: C.secondary },
  dealCardContact: { fontSize: 14, fontWeight: '600', color: C.label },
  dealCardCompany: { fontSize: 12, color: C.muted },
  applicantLocation: { fontSize: 12, color: C.muted, marginBottom: 4 },
  applicantStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  applicantGpa: { fontSize: 13, fontWeight: '700', color: C.label },
  applicantTestScore: { fontSize: 12, color: C.secondary },
  dealCardDot: { fontSize: 11, color: C.muted },
  dealCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dealCardMeta: { fontSize: 11, color: C.muted },
  priorityPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityPillText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  aidPill: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  aidPillText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

  // Flags
  flagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  flagBadge: { backgroundColor: C.blue + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  flagBadgeText: { fontSize: 9, fontWeight: '600', color: C.blue },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Prospect row
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  contactInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  engagementPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  engagementPillText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  prospectSchool: { fontSize: 12, color: C.secondary, marginTop: 2 },
  prospectLocation: { fontSize: 12, color: C.muted, marginTop: 1 },
  prospectStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  prospectGpa: { fontSize: 12, fontWeight: '600', color: C.label },
  prospectTestScore: { fontSize: 12, color: C.secondary },
  prospectMajor: { fontSize: 12, color: C.secondary },
  prospectMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sourceBadge: { backgroundColor: C.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sourceBadgeText: { fontSize: 9, fontWeight: '600', color: C.secondary, textTransform: 'uppercase' },
  eventsText: { fontSize: 11, color: C.muted },
  lastInteractionText: { fontSize: 11, color: C.muted },

  // Application row
  completenessRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  completenessBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.surface },
  completenessFill: { height: 4, borderRadius: 2 },
  completenessText: { fontSize: 10, fontWeight: '600', color: C.muted, width: 30 },
  missingText: { fontSize: 11, color: C.red, marginTop: 2 },
  appMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  reviewerText: { fontSize: 11, color: C.secondary },
  reviewStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  reviewStatusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  decisionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  decisionBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  aidAmountText: { fontSize: 11, fontWeight: '600', color: C.green, marginTop: 2 },

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: C.muted,
  },
  sortOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: C.surface,
  },
  sortOptionText: {
    fontSize: 12,
    color: C.muted,
  },
  sortOptionTextActive: {
    color: C.label,
    fontWeight: '600',
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
