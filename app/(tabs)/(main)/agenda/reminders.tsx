import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  useColorScheme,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Semantic color constants ──────────────────────────────────────────────────
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const GAIN    = '#5A8A6E';

// Card background tints — light / dark pairs
const DANGER_BG  = { light: '#FCEBEB', dark: '#3D1717' } as const;
const WARNING_BG = { light: '#FFF8EB', dark: '#3D2E0F' } as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type Priority       = 'none' | 'medium' | 'high';
type ReminderStatus = 'pending' | 'completed';
type FilterTab      = 'Today' | 'Scheduled' | 'Flagged' | 'All';
type DateChoice     = 'today' | 'tomorrow' | 'weekend' | 'none';

type Reminder = {
  id: number;
  text: string;
  subtitle?: string;
  dueDate?: string;
  dueTime?: string;
  priority: Priority;
  flagged: boolean;
  status: ReminderStatus;
  isOverdue: boolean;
  overdueLabel?: string;
  completedAt?: number;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_REMINDERS: Reminder[] = [
  // OVERDUE
  { id: 1,  text: 'Follow up with Puma on contract terms',  subtitle: 'Deals \u00b7 Contract negotiation',       dueDate: '2026-04-10', dueTime: '10:00 AM', priority: 'high',   flagged: true,  status: 'pending',   isOverdue: true,  overdueLabel: '3 days overdue' },
  { id: 2,  text: "Post Tuesday's reel to IG and TikTok",   subtitle: 'Content \u00b7 Spring collection series',  dueDate: '2026-04-11', dueTime: '9:00 AM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: true,  overdueLabel: 'Yesterday' },
  // TODAY
  { id: 3,  text: 'Nike brand call \u2014 prep talking points',   subtitle: 'Meetings \u00b7 Partnership discussion',   dueDate: '2026-04-13', dueTime: '1:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
  { id: 4,  text: 'Review April content calendar',           subtitle: 'Content \u00b7 Monthly planning',          dueDate: '2026-04-13', dueTime: '3:00 PM',  priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
  { id: 5,  text: 'Send invoice to Alex',                    subtitle: 'Earnings \u00b7 Coaching session payment', dueDate: '2026-04-13', dueTime: '6:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
  // SCHEDULED
  { id: 6,  text: 'Adidas proposal deadline',                subtitle: 'Deals \u00b7 Spring campaign pitch',       dueDate: '2026-04-14', dueTime: '5:00 PM',  priority: 'high',   flagged: true,  status: 'pending',   isOverdue: false },
  { id: 7,  text: 'Record podcast intro segments',           subtitle: 'Content \u00b7 Episode 43',                dueDate: '2026-04-15', dueTime: '10:00 AM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
  { id: 8,  text: 'Inner Circle Q&A prep',                   subtitle: 'Bookings \u00b7 12 members attending',    dueDate: '2026-04-16', dueTime: '11:00 AM', priority: 'medium', flagged: false, status: 'pending',   isOverdue: false },
  { id: 9,  text: 'Monthly analytics review',                subtitle: 'Analytics \u00b7 Growth trends check',     dueDate: '2026-04-17', dueTime: '2:00 PM',  priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
  { id: 10, text: 'Lululemon pitch deck draft',              subtitle: 'Deals \u00b7 Initial brand meeting prep',  dueDate: '2026-04-20', dueTime: '9:00 AM',  priority: 'medium', flagged: true,  status: 'pending',   isOverdue: false },
  { id: 11, text: 'Subscriber newsletter \u2014 May edition',     subtitle: 'Content \u00b7 Monthly newsletter',        dueDate: '2026-04-22', dueTime: '12:00 PM', priority: 'none',   flagged: false, status: 'pending',   isOverdue: false },
  // COMPLETED
  { id: 12, text: 'Upload BTS photoshoot clips',             subtitle: 'Content',  dueDate: '2026-04-11', dueTime: '4:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 86400000 },
  { id: 13, text: 'Schedule week 3 content batch',           subtitle: 'Content',  dueDate: '2026-04-10', dueTime: '2:00 PM',  priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 172800000 },
  { id: 14, text: 'Reply to brand DMs',                      subtitle: 'Meetings', dueDate: '2026-04-12', dueTime: '11:00 AM', priority: 'none', flagged: false, status: 'completed', isOverdue: false, completedAt: Date.now() - 7200000 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

function formatDueLabel(r: Reminder): string {
  if (!r.dueDate) return '';
  if (r.isOverdue) return r.overdueLabel ?? 'Overdue';
  if (r.dueDate === '2026-04-13') return r.dueTime ?? 'Today';
  const parts = r.dueDate.split('-');
  const mIdx  = parseInt(parts[1]) - 1;
  const day   = parseInt(parts[2]);
  return `${MONTHS[mIdx]} ${day}`;
}

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date      = new Date(y, m - 1, d);
  const dayAbbr   = DAYS[date.getDay()];
  const monAbbr   = MONTHS[m - 1].toUpperCase();
  return `${dayAbbr} ${monAbbr} ${d}`;
}

// Category color system — maps category name → border/dot color
function getCategoryColor(subtitle: string | undefined, C: ComponentColors): string {
  if (!subtitle) return C.secondary;
  const cat = subtitle.split(/[\u00b7·]/)[0].trim().toLowerCase();
  if (cat === 'content')   return C.label;
  if (cat === 'deals')     return CAUTION;
  if (cat === 'meetings')  return C.secondary;
  if (cat === 'earnings')  return GAIN;
  return C.secondary;
}

function getLeftBorderColor(r: Reminder, C: ComponentColors): string {
  if (r.status === 'completed')     return GAIN;
  if (r.isOverdue)                  return HEAT;
  // Today cards: category-based color
  if (r.dueDate === '2026-04-13')   return getCategoryColor(r.subtitle, C);
  // Scheduled / future: priority-based
  if (r.priority === 'high')        return HEAT;
  if (r.priority === 'medium')      return CAUTION;
  if (r.flagged)                    return CAUTION;
  return 'transparent';
}

// ── Reminder Row ──────────────────────────────────────────────────────────────

interface ReminderRowProps {
  reminder:   Reminder;
  onToggle:   (id: number) => void;
  onFlag:     (id: number) => void;
  onDelete:   (id: number) => void;
  C:          ComponentColors;
  dangerBg:   string;
  warningBg:  string;
  fadeValue:  Animated.Value;
}

function ReminderRow({ reminder, onToggle, onFlag, onDelete, C, dangerBg, warningBg, fadeValue }: ReminderRowProps) {
  const isCompleted  = reminder.status === 'completed';
  const isToday      = reminder.dueDate === '2026-04-13' && !reminder.isOverdue;
  const borderColor  = getLeftBorderColor(reminder, C);
  const hasBorder    = borderColor !== 'transparent';
  const dueLabel     = formatDueLabel(reminder);
  const catColor     = getCategoryColor(reminder.subtitle, C);

  // Card background
  let cardBg = C.surface;
  if (reminder.isOverdue)              cardBg = dangerBg;
  else if (isToday && reminder.flagged) cardBg = warningBg;

  // Due label color
  const dueLabelColor = reminder.isOverdue ? HEAT : C.label;

  return (
    <Animated.View style={{ opacity: fadeValue }}>
      <Pressable
        onLongPress={() =>
          Alert.alert('Options', undefined, [
            { text: reminder.flagged ? 'Remove Flag' : 'Flag', onPress: () => onFlag(reminder.id) },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
            { text: 'Cancel', style: 'cancel' },
          ])
        }
        style={[
          styles.reminderRow,
          {
            backgroundColor: cardBg,
            borderLeftColor: hasBorder ? borderColor : undefined,
            borderLeftWidth: hasBorder ? 3 : 0,
            paddingLeft:     hasBorder ? 11 : 14,
          },
        ]}
      >
        {/* Checkbox */}
        <Pressable onPress={() => onToggle(reminder.id)} hitSlop={8} style={styles.checkboxWrapper}>
          {isCompleted ? (
            <IconSymbol name="checkmark.circle.fill" size={22} color={GAIN} />
          ) : (
            <View style={[styles.emptyCircle, { borderColor: C.separator }]} />
          )}
        </Pressable>

        {/* Content */}
        <View style={styles.reminderContent}>
          <View style={styles.priorityTextRow}>
            {reminder.priority !== 'none' && (
              <View style={[styles.priorityDot, { backgroundColor: reminder.priority === 'high' ? HEAT : CAUTION }]} />
            )}
            <Text
              style={[
                styles.reminderText,
                { color: C.label },
                isCompleted && { textDecorationLine: 'line-through', color: C.secondary },
              ]}
              numberOfLines={2}
            >
              {reminder.text}
            </Text>
          </View>

          {/* Subtitle with category dot */}
          {reminder.subtitle ? (
            <View style={styles.subtitleRow}>
              {!isCompleted && (
                <View style={[styles.catDot, { backgroundColor: catColor }]} />
              )}
              <Text style={[styles.reminderSubtitle, { color: C.secondary }]} numberOfLines={1}>
                {reminder.subtitle}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right: flag + timestamp */}
        <View style={styles.reminderRight}>
          <Pressable onPress={() => onFlag(reminder.id)} hitSlop={8}>
            <IconSymbol
              name={reminder.flagged ? 'flag.fill' : 'flag'}
              size={13}
              color={reminder.flagged ? CAUTION : C.separator}
            />
          </Pressable>
          {reminder.dueDate ? (
            <Text
              style={[
                styles.dueLabel,
                {
                  color:      dueLabelColor,
                  fontWeight: reminder.isOverdue ? '600' : '500',
                },
              ]}
            >
              {dueLabel}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RemindersScreen() {
  const C         = useColors();
  const insets    = useSafeAreaInsets();
  const scheme    = useColorScheme();
  const isDark    = scheme === 'dark';
  const dangerBg  = isDark ? DANGER_BG.dark  : DANGER_BG.light;
  const warningBg = isDark ? WARNING_BG.dark : WARNING_BG.light;

  const [role, cycleRole, roleCycles] = useDemoRole('personal:agenda');
  const isOwner = role === roleCycles[0];

  const [reminders,     setReminders]     = useState<Reminder[]>(INITIAL_REMINDERS);
  const [activeFilter,  setActiveFilter]  = useState<FilterTab>('Today');
  const [showCompleted, setShowCompleted] = useState(false);

  // Create sheet state
  const sheetRef      = useRef<BottomSheetModal>(null);
  const inputRef      = useRef<TextInput>(null);
  const [newText,     setNewText]     = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDate,     setNewDate]     = useState<DateChoice>('today');
  const [newTime,     setNewTime]     = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('none');
  const [newFlagged,  setNewFlagged]  = useState(false);

  // Animated fade values per reminder id
  const fadeValues = useRef<Map<number, Animated.Value>>(new Map());
  const getFadeValue = useCallback((id: number): Animated.Value => {
    if (!fadeValues.current.has(id)) {
      fadeValues.current.set(id, new Animated.Value(1));
    }
    return fadeValues.current.get(id)!;
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  // ── Derived lists ───────────────────────────────────────────────────────────
  const pending   = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');

  const overdue    = pending.filter(r => r.isOverdue);
  const todayItems = pending.filter(r => !r.isOverdue && r.dueDate === '2026-04-13');
  const scheduled  = pending.filter(r => !r.isOverdue && r.dueDate && r.dueDate > '2026-04-13');
  const flagged    = pending.filter(r => r.flagged);

  const filteredPending = useMemo(() => {
    if (activeFilter === 'Today')     return { overdue,    today: todayItems };
    if (activeFilter === 'Scheduled') return { overdue: [], today: scheduled };
    if (activeFilter === 'Flagged')   return { overdue: [], today: flagged };
    return { overdue, today: pending.filter(r => !r.isOverdue) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, reminders]);

  const scheduledGroups = useMemo(() => {
    if (activeFilter !== 'Scheduled') return [];
    const byDate: Record<string, Reminder[]> = {};
    scheduled.forEach(r => {
      const k = r.dueDate!;
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(r);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({ date, items }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, reminders]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const toggleComplete = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    if (reminder.status === 'pending') {
      // Fade out, then move to completed
      const fadeVal = getFadeValue(id);
      Animated.timing(fadeVal, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, status: 'completed', completedAt: Date.now() } : r)
        );
        // Reset for possible un-complete
        fadeVal.setValue(1);
      });
    } else {
      setReminders(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'pending' } : r)
      );
    }
  }, [reminders, getFadeValue]);

  const toggleFlag = useCallback((id: number) => {
    Haptics.selectionAsync();
    setReminders(prev => prev.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  }, []);

  const deleteReminder = useCallback((id: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    Alert.alert('Clear Completed', 'Remove all completed reminders?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => setReminders(prev => prev.filter(r => r.status !== 'completed')) },
    ]);
  }, []);

  const createReminder = useCallback(() => {
    if (!newText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dueDateMap: Record<DateChoice, string | undefined> = {
      today: '2026-04-13', tomorrow: '2026-04-14', weekend: '2026-04-18', none: undefined,
    };
    const dueDate = dueDateMap[newDate];
    const newR: Reminder = {
      id:        Date.now(),
      text:      newText.trim(),
      subtitle:  newSubtitle.trim() || undefined,
      dueDate,
      dueTime:   newTime || (newDate === 'today' ? '9:00 AM' : undefined),
      priority:  newPriority,
      flagged:   newFlagged,
      status:    'pending',
      isOverdue: false,
    };
    setReminders(prev => [newR, ...prev]);
    setNewText(''); setNewSubtitle(''); setNewDate('today');
    setNewTime(''); setNewPriority('none'); setNewFlagged(false);
    sheetRef.current?.dismiss();
  }, [newText, newSubtitle, newDate, newTime, newPriority, newFlagged]);

  // ── Backdrop ────────────────────────────────────────────────────────────────
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} pressBehavior="close" />
    ),
    []
  );

  const handleFilter = useCallback((f: FilterTab) => {
    Haptics.selectionAsync();
    setActiveFilter(f);
  }, []);

  const hasOverdue = filteredPending.overdue.length > 0;
  const hasToday   = filteredPending.today.length > 0;
  const isEmpty    = !hasOverdue && !hasToday;
  const fabBottom  = insets.bottom + 80;

  // Shared row renderer
  const renderRow = (r: Reminder) => (
    <ReminderRow
      key={r.id}
      reminder={r}
      onToggle={toggleComplete}
      onFlag={toggleFlag}
      onDelete={deleteReminder}
      C={C}
      dangerBg={dangerBg}
      warningBg={warningBg}
      fadeValue={getFadeValue(r.id)}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <KMenuButton onPress={() => openSidePanel()} />
          <View style={styles.topBarCenter}>
            <View style={[styles.screenPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.screenPillText, { color: C.label }]}>Reminders</Text>
            </View>
          </View>
          <RolePill role={role} onPress={cycleRole} />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 52 + 8, paddingBottom: insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Filter pills ─────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['Today', 'Scheduled', 'Flagged', 'All'] as FilterTab[]).map(f => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => handleFilter(f)}
                style={[styles.filterPill, { backgroundColor: active ? C.label : 'transparent', borderColor: active ? C.label : C.separator }]}
              >
                <Text style={[styles.filterPillText, { color: active ? C.bg : C.label }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── OVERDUE section ──────────────────────────────────────────────── */}
        {activeFilter === 'Today' && hasOverdue && (
          <View style={styles.overdueSection}>
            <Text style={[styles.sectionHeader, { color: HEAT }]}>OVERDUE</Text>
            {filteredPending.overdue.map(renderRow)}
          </View>
        )}

        {/* ── Divider between OVERDUE and TODAY ────────────────────────────── */}
        {activeFilter === 'Today' && hasOverdue && hasToday && (
          <View style={[styles.sectionDivider, { backgroundColor: C.separator }]} />
        )}

        {/* ── TODAY / main list ────────────────────────────────────────────── */}
        {activeFilter !== 'Scheduled' ? (
          <>
            {hasToday && activeFilter === 'Today' && (
              <Text style={[styles.sectionHeader, { color: C.secondary }]}>TODAY</Text>
            )}
            {filteredPending.today.map(renderRow)}

            {/* Today empty (when overdue exists but today is clear) */}
            {activeFilter === 'Today' && hasOverdue && !hasToday && (
              <View style={styles.todayEmptyState}>
                <Text style={[styles.todayEmptyTitle, { color: C.secondary }]}>All clear for today</Text>
                <Pressable
                  onPress={() => openDipsonSheet('Reminders')}
                  style={[styles.dipsonBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
                >
                  <IconSymbol name="sparkles" size={14} color={C.secondary} />
                  <Text style={[styles.dipsonBtnText, { color: C.label }]}>Ask Dipson to plan your day</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          scheduledGroups.map(group => (
            <View key={group.date}>
              <Text style={[styles.dateHeader, { color: C.secondary, borderBottomColor: C.separator }]}>
                {formatDateHeader(group.date)}
              </Text>
              {group.items.map(renderRow)}
            </View>
          ))
        )}

        {/* ── Full empty state ─────────────────────────────────────────────── */}
        {isEmpty && (
          <View style={styles.emptyState}>
            <IconSymbol name="checkmark.circle" size={52} color={C.separator} />
            <Text style={[styles.emptyTitle, { color: C.label }]}>No reminders</Text>
            <Text style={[styles.emptySubtitle, { color: C.secondary }]}>
              Tap + to create one, or ask Dipson
            </Text>
            <Pressable
              onPress={() => openDipsonSheet('Reminders')}
              style={[styles.dipsonBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
            >
              <IconSymbol name="sparkles" size={14} color={C.secondary} />
              <Text style={[styles.dipsonBtnText, { color: C.label }]}>Ask Dipson</Text>
            </Pressable>
          </View>
        )}

        {/* ── Completed section ────────────────────────────────────────────── */}
        {completed.length > 0 && (
          <View style={styles.completedSection}>
            <View style={[styles.completedHeader, { borderTopColor: C.separator }]}>
              <Pressable onPress={() => setShowCompleted(v => !v)} style={styles.completedHeaderLeft}>
                <IconSymbol name={showCompleted ? 'chevron.down' : 'chevron.right'} size={12} color={C.secondary} />
                <Text style={[styles.completedHeaderText, { color: C.secondary }]}>
                  Completed ({completed.length})
                </Text>
              </Pressable>
              <Pressable onPress={clearCompleted} hitSlop={8}>
                <Text style={[styles.clearText, { color: HEAT }]}>Clear</Text>
              </Pressable>
            </View>
            {showCompleted && completed.map(renderRow)}
          </View>
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      {isOwner && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); sheetRef.current?.present(); }}
          style={[styles.fab, { backgroundColor: C.label, bottom: fabBottom }]}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      )}

      {/* ── Create sheet ─────────────────────────────────────────────────────── */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%', '90%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: C.bg }}
        handleIndicatorStyle={{ backgroundColor: C.separator }}
        onDismiss={() => {
          setNewText(''); setNewSubtitle(''); setNewDate('today');
          setNewTime(''); setNewPriority('none'); setNewFlagged(false);
        }}
      >
        <BottomSheetView style={[styles.sheetContent, { backgroundColor: C.bg }]}>
          <Text style={[styles.sheetTitle, { color: C.label }]}>New Reminder</Text>

          <TextInput
            ref={inputRef}
            placeholder="What do you need to remember?"
            placeholderTextColor={C.secondary}
            value={newText}
            onChangeText={setNewText}
            autoFocus
            multiline
            style={[styles.mainInput, { color: C.label, backgroundColor: C.surface, borderColor: C.separator }]}
          />

          <TextInput
            placeholder="Add notes (optional)"
            placeholderTextColor={C.secondary}
            value={newSubtitle}
            onChangeText={setNewSubtitle}
            style={[styles.notesInput, { color: C.label, backgroundColor: C.surface, borderColor: C.separator }]}
          />

          <Text style={[styles.sheetSectionLabel, { color: C.secondary }]}>When</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {(['today', 'tomorrow', 'weekend', 'none'] as DateChoice[]).map(d => {
              const active = newDate === d;
              const label: Record<DateChoice, string> = { today: 'Today', tomorrow: 'Tomorrow', weekend: 'Weekend', none: 'No Date' };
              return (
                <Pressable
                  key={d}
                  onPress={() => setNewDate(d)}
                  style={[styles.chip, { backgroundColor: active ? C.label : C.surface, borderColor: active ? C.label : C.separator }]}
                >
                  <Text style={[styles.chipText, { color: active ? C.bg : C.label }]}>{label[d]}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.sheetSectionLabel, { color: C.secondary }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {(['none', 'medium', 'high'] as Priority[]).map(p => {
              const active = newPriority === p;
              const label  = p.charAt(0).toUpperCase() + p.slice(1);
              return (
                <Pressable
                  key={p}
                  onPress={() => setNewPriority(p)}
                  style={[styles.priorityChip, { backgroundColor: active ? C.label : C.surface, borderColor: active ? C.label : C.separator }]}
                >
                  {p !== 'none' && (
                    <View style={[styles.priorityDot, { backgroundColor: p === 'high' ? HEAT : CAUTION }]} />
                  )}
                  <Text style={[styles.chipText, { color: active ? C.bg : C.label }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => setNewFlagged(v => !v)} style={[styles.flagRow, { borderColor: C.separator }]}>
            <IconSymbol name={newFlagged ? 'flag.fill' : 'flag'} size={16} color={newFlagged ? CAUTION : C.secondary} />
            <Text style={[styles.flagRowText, { color: C.label }]}>Flag this reminder</Text>
            {newFlagged && (
              <View style={[styles.flaggedBadge, { backgroundColor: CAUTION + '22' }]}>
                <Text style={[styles.flaggedBadgeText, { color: CAUTION }]}>Flagged</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={createReminder}
            disabled={!newText.trim()}
            style={[styles.addButton, { backgroundColor: newText.trim() ? C.label : C.separator }]}
          >
            <Text style={[styles.addButtonText, { color: newText.trim() ? C.bg : C.secondary }]}>Add Reminder</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
  },
  topBarCenter: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  screenPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  screenPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Filter row
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  // Section headers
  overdueSection: { marginBottom: 4 },
  sectionHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
  },
  sectionDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  dateHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4,
  },

  // Reminder row
  reminderRow: {
    marginHorizontal: 16,
    marginBottom:     12,
    borderRadius:     12,
    paddingRight:     14,
    paddingTop:       14,
    paddingBottom:    14,
    flexDirection:    'row',
    alignItems:       'flex-start',
    gap:              12,
  },
  checkboxWrapper: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  emptyCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
  reminderContent: { flex: 1 },
  priorityTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  reminderText: { fontSize: 15, fontWeight: '500', flex: 1 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  catDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  reminderSubtitle: { fontSize: 12, flex: 1 },
  reminderRight: { alignItems: 'flex-end', gap: 4, paddingTop: 1, minWidth: 56 },
  dueLabel: { fontSize: 11 },

  // Today empty (all-clear sub-state)
  todayEmptyState: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  todayEmptyTitle: { fontSize: 14 },

  // Full empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  dipsonBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1,
  },
  dipsonBtnText: { fontSize: 14, fontWeight: '500' },

  // Completed section
  completedSection: { marginTop: 8 },
  completedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth,
  },
  completedHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  completedHeaderText: { fontSize: 14, fontWeight: '500' },
  clearText: { fontSize: 13, fontWeight: '500' },

  // FAB
  fab: {
    position: 'absolute', right: 16,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },

  // Create sheet
  sheetContent: { flex: 1, padding: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  mainInput: {
    borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15,
    minHeight: 80, textAlignVertical: 'top', marginBottom: 10,
  },
  notesInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, marginBottom: 16 },
  sheetSectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingRight: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 12, borderWidth: 1,
  },
  flagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 16,
  },
  flagRowText: { fontSize: 15, fontWeight: '500', flex: 1 },
  flaggedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  flaggedBadgeText: { fontSize: 12, fontWeight: '600' },
  addButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  addButtonText: { fontSize: 16, fontWeight: '600' },
});
