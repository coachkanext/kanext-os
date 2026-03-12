/**
 * Campus — 3-page swipeable layout for education mode.
 * Page 0: Classes — term header, status + department filters, class cards.
 * Page 1: Programs — filter pills, program cards with degree badges.
 * Page 2: Performance — time range pills, KPI grid, department breakdown, at-risk, insights.
 * Identical SwipeablePages / LongPressContextMenu patterns as Office.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CURRENT_TERM,
  DEPARTMENTS,
  DEPARTMENT_METRICS,
  AT_RISK_STUDENTS,
  NEXUS_INSIGHTS,
  getClasses,
  getPrograms,
  getAcademicKpis,
  type ClassItem,
  type ClassFilter,
  type ClassStatus,
  type ProgramItem,
  type ProgramFilter,
  type DegreeType,
  type AcademicTimeRange,
  type AcademicKpi as AcademicKpiType,
} from '@/data/mock-campus';

import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const CLASS_STATUS_COLORS: Record<ClassStatus, string> = {
  active: '#3B82F6',
  upcoming: '#F59E0B',
  completed: '#22C55E',
};

const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

const DEGREE_COLORS: Record<DegreeType, string> = {
  BS: '#3B82F6',
  BA: '#3B82F6',
  MS: '#8B5CF6',
  MBA: '#8B5CF6',
  Certificate: '#F59E0B',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

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

// ─── Term Header ─────────────────────────────────────────────────────────────

function TermHeader() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.termHeader}>
      <Text style={s.termName}>{CURRENT_TERM.name}</Text>
      <Text style={s.termRange}>{CURRENT_TERM.dateRange}</Text>
    </View>
  );
}

// ─── Department Pills ────────────────────────────────────────────────────────

function DepartmentPills({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (dept: string) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {DEPARTMENTS.map((dept) => {
        const isActive = active === dept;
        return (
          <Pressable
            key={dept}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(dept)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{dept}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Enrollment Bar ──────────────────────────────────────────────────────────

function EnrollmentBar({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const pct = (enrolled / capacity) * 100;
  const fillColor = pct >= 100 ? C.red : pct > 90 ? C.amber : C.blue;

  return (
    <View style={s.enrollBarBg}>
      <View style={[s.enrollBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

// ─── Class Card ──────────────────────────────────────────────────────────────

function ClassCard({
  classItem,
  onLongPress,
}: {
  classItem: ClassItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const statusColor = CLASS_STATUS_COLORS[classItem.status];
  const statusLabel = CLASS_STATUS_LABELS[classItem.status];

  return (
    <Pressable
      style={({ pressed }) => [s.classCard, pressed && s.classCardPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      {/* Header: code + name + status */}
      <View style={s.classHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={s.classCode}>{classItem.code}</Text>
          <Text style={s.className} numberOfLines={1}>{classItem.name}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Instructor row */}
      <View style={s.instructorRow}>
        <View style={s.instructorAvatar}>
          <Text style={s.instructorInitials}>{classItem.instructorInitials}</Text>
        </View>
        <Text style={s.instructorName}>{classItem.instructorName}</Text>
      </View>

      {/* Schedule + room row */}
      <View style={s.scheduleRow}>
        <Text style={s.scheduleText}>{classItem.schedule}</Text>
        <Text style={s.roomText}>{classItem.room}</Text>
      </View>

      {/* Enrollment bar */}
      <EnrollmentBar enrolled={classItem.enrolled} capacity={classItem.capacity} />
      <Text style={s.enrollText}>{classItem.enrolled}/{classItem.capacity} enrolled</Text>
    </Pressable>
  );
}

// ─── Degree Badge ────────────────────────────────────────────────────────────

function DegreeBadge({ type }: { type: DegreeType }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const color = DEGREE_COLORS[type];
  return (
    <View style={[s.degreeBadge, { backgroundColor: color + '22' }]}>
      <Text style={[s.degreeBadgeText, { color }]}>{type}</Text>
    </View>
  );
}

// ─── Program Card ────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  onLongPress,
}: {
  program: ProgramItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <Pressable
      style={({ pressed }) => [s.programCard, pressed && s.programCardPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      {/* Header: name + degree badge */}
      <View style={s.programHeader}>
        <Text style={s.programName} numberOfLines={1}>{program.name}</Text>
        <DegreeBadge type={program.degreeType} />
      </View>

      {/* Department */}
      <Text style={s.programDept}>{program.department}</Text>

      {/* Stats row */}
      <View style={s.programStats}>
        <Text style={s.programStatText}>{program.enrolledCount} enrolled</Text>
        <Text style={s.programStatText}>{program.totalCredits} credits</Text>
        <View style={s.accreditationDot}>
          <View style={[s.dot, { backgroundColor: program.accredited ? C.green : C.red }]} />
          <Text style={s.accreditationText}>{program.accredited ? 'Accredited' : 'Not Accredited'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── KPI Card View ───────────────────────────────────────────────────────────

function KpiCardView({ kpi }: { kpi: AcademicKpiType }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const isPositive = kpi.invertTrend
    ? kpi.trend === 'down'
    : kpi.trend === 'up';
  const isNegative = kpi.invertTrend
    ? kpi.trend === 'up'
    : kpi.trend === 'down';
  const trendColor = isPositive ? C.green : isNegative ? C.red : C.secondary;
  const trendArrow = kpi.trend === 'up' ? '▲' : kpi.trend === 'down' ? '▼' : '─';
  const maxBar = Math.max(...kpi.sparkBars, 1);

  return (
    <View style={s.kpiCard}>
      <Text style={s.kpiMetricName}>{kpi.metricName}</Text>
      <Text style={s.kpiValue}>{kpi.currentValue}</Text>
      <View style={s.kpiTrendRow}>
        <Text style={[s.kpiTrendArrow, { color: trendColor }]}>{trendArrow}</Text>
        <Text style={[s.kpiTrendPercent, { color: trendColor }]}>{kpi.changePercent}</Text>
      </View>
      <View style={s.sparkBarRow}>
        {kpi.sparkBars.map((val, i) => (
          <View key={i} style={s.sparkBarContainer}>
            <View
              style={[
                s.sparkBar,
                {
                  height: Math.max((val / maxBar) * 28, 2),
                  backgroundColor: trendColor + '66',
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────────────

function KpiGrid({ kpis }: { kpis: AcademicKpiType[] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.kpiGrid}>
      {kpis.map((kpi) => (
        <KpiCardView key={kpi.id} kpi={kpi} />
      ))}
    </View>
  );
}

// ─── Department Row ──────────────────────────────────────────────────────────

function DepartmentRow({ metric }: { metric: typeof DEPARTMENT_METRICS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.deptRow}>
      <Text style={s.deptName}>{metric.department}</Text>
      <Text style={s.deptStat}>{metric.enrollment}</Text>
      <Text style={s.deptStat}>{metric.avgGpa}</Text>
      <Text style={s.deptStat}>{metric.retentionPercent}%</Text>
      <Text style={s.deptStat}>{metric.studentFacultyRatio}</Text>
    </View>
  );
}

// ─── Department Breakdown ────────────────────────────────────────────────────

function DepartmentBreakdown() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.deptBreakdown}>
      {/* Table header */}
      <View style={s.deptHeaderRow}>
        <Text style={[s.deptHeaderText, { flex: 1 }]}>Dept</Text>
        <Text style={s.deptHeaderText}>Enrl</Text>
        <Text style={s.deptHeaderText}>GPA</Text>
        <Text style={s.deptHeaderText}>Ret%</Text>
        <Text style={s.deptHeaderText}>S:F</Text>
      </View>
      {DEPARTMENT_METRICS.map((metric) => (
        <DepartmentRow key={metric.id} metric={metric} />
      ))}
    </View>
  );
}

// ─── At-Risk Row ─────────────────────────────────────────────────────────────

function AtRiskRow({ student }: { student: typeof AT_RISK_STUDENTS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.atRiskRow}>
      <View style={s.atRiskAvatar}>
        <Text style={s.atRiskInitials}>{student.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.atRiskName}>{student.name}</Text>
        <View style={s.atRiskMeta}>
          <View style={s.atRiskReasonBadge}>
            <Text style={s.atRiskReasonText}>{student.reason}</Text>
          </View>
          <Text style={s.atRiskDept}>{student.department}</Text>
        </View>
      </View>
      <Text style={s.atRiskGpa}>{student.gpa}</Text>
    </View>
  );
}

// ─── Insight Row ─────────────────────────────────────────────────────────────

function InsightRow({ insight }: { insight: typeof NEXUS_INSIGHTS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.insightRow}>
      <View style={s.insightIcon}>
        <IconSymbol name="sparkles" size={16} color={C.purple} />
      </View>
      <Text style={s.insightText}>{insight.text}</Text>
    </View>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────

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
      <IconSymbol name="plus" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

// ─── Filter Data ─────────────────────────────────────────────────────────────

const CLASS_FILTERS: { key: ClassFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const PROGRAM_FILTERS: { key: ProgramFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'undergraduate', label: 'Undergraduate' },
  { key: 'graduate', label: 'Graduate' },
  { key: 'certificate', label: 'Certificate' },
  { key: 'online', label: 'Online' },
];

const TIME_RANGES: { key: AcademicTimeRange; label: string }[] = [
  { key: 'term', label: 'This Term' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function CampusContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all');
  const [timeRange, setTimeRange] = useState<AcademicTimeRange>('term');

  // ── Data ──
  const filteredClasses = useMemo(() => getClasses(classFilter, departmentFilter), [classFilter, departmentFilter]);
  const filteredPrograms = useMemo(() => getPrograms(programFilter), [programFilter]);
  const kpis = useMemo(() => getAcademicKpis(timeRange), [timeRange]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Class ──
  const longPressClass = useCallback((classItem: ClassItem, pageY: number) => {
    setMenuData({
      title: `${classItem.code} · ${classItem.name}`,
      subtitle: `${classItem.instructorName} · ${CLASS_STATUS_LABELS[classItem.status]}`,
      initials: classItem.instructorInitials,
      pageY,
      actions: [
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'duplicate', label: 'Duplicate for Next Term', icon: 'doc.on.doc.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Program ──
  const longPressProgram = useCallback((program: ProgramItem, pageY: number) => {
    setMenuData({
      title: program.name,
      subtitle: `${program.department} · ${program.degreeType}`,
      initials: program.degreeType,
      pageY,
      actions: [
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'curriculum', label: 'View Curriculum', icon: 'doc.text.fill' },
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
        {/* ── PAGE 0: CLASSES ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Classes" />
            <TermHeader />
            <FilterPills items={CLASS_FILTERS} active={classFilter} onSelect={setClassFilter} />
            <DepartmentPills active={departmentFilter} onSelect={setDepartmentFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {filteredClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                onLongPress={(pageY) => longPressClass(classItem, pageY)}
              />
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: PROGRAMS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Programs" />
            <FilterPills items={PROGRAM_FILTERS} active={programFilter} onSelect={setProgramFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {filteredPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onLongPress={(pageY) => longPressProgram(program, pageY)}
              />
            ))}
          </ScrollView>
          {pageIndex === 1 && <FAB onPress={() => {}} />}
        </View>

        {/* ── PAGE 2: PERFORMANCE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Performance" />
            <FilterPills items={TIME_RANGES} active={timeRange} onSelect={setTimeRange} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <KpiGrid kpis={kpis} />
            <SectionHeader title="By Department" />
            <DepartmentBreakdown />
            <SectionHeader title="At-Risk Students" />
            {AT_RISK_STUDENTS.map((student) => (
              <AtRiskRow key={student.id} student={student} />
            ))}
            <SectionHeader title="Nexus Insights" />
            {NEXUS_INSIGHTS.map((insight) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  // Term header
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
  },
  termRange: {
    fontSize: 13,
    color: C.muted,
  },

  // Class card
  classCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  classCardPressed: {
    opacity: 0.85,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  classCode: {
    fontSize: 12,
    fontWeight: '700',
    color: C.secondary,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  instructorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: C.label,
  },
  instructorName: {
    fontSize: 13,
    color: C.secondary,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 12,
    color: C.muted,
  },
  roomText: {
    fontSize: 12,
    color: C.muted,
  },

  // Enrollment bar
  enrollBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  enrollBarFill: {
    height: 4,
    borderRadius: 2,
  },
  enrollText: {
    fontSize: 11,
    color: C.muted,
  },

  // Program card
  programCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  programCardPressed: {
    opacity: 0.85,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
    flex: 1,
    marginRight: 8,
  },
  programDept: {
    fontSize: 13,
    color: C.secondary,
    marginBottom: 10,
  },
  programStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  programStatText: {
    fontSize: 12,
    color: C.muted,
  },
  accreditationDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  accreditationText: {
    fontSize: 11,
    color: C.muted,
  },

  // Degree badge
  degreeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  degreeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // KPI card
  kpiCard: {
    width: '48%',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  kpiMetricName: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: C.label,
    marginBottom: 4,
  },
  kpiTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  kpiTrendArrow: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiTrendPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  sparkBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  sparkBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    height: 28,
  },
  sparkBar: {
    borderRadius: 2,
    minHeight: 2,
  },

  // KPI grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Department breakdown
  deptBreakdown: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  deptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
    marginBottom: 4,
  },
  deptHeaderText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    width: 48,
    textAlign: 'right',
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  deptName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
  },
  deptStat: {
    fontSize: 13,
    color: C.secondary,
    width: 48,
    textAlign: 'right',
  },

  // At-risk row
  atRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  atRiskAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atRiskInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  atRiskName: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  atRiskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  atRiskReasonBadge: {
    backgroundColor: C.red + '26',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  atRiskReasonText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.red,
  },
  atRiskDept: {
    fontSize: 12,
    color: C.muted,
  },
  atRiskGpa: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },

  // Insight row
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.purple + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
    lineHeight: 20,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

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
