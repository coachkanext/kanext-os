/**
 * Reminders — Personal mode agenda sub-screen.
 * Filter pills: All | Today | Upcoming | Completed
 * Swipe left → Complete, swipe right → Snooze
 * FAB → Create Reminder sheet
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useOwnerGuard } from '@/hooks/use-owner-guard';

// ── Types ─────────────────────────────────────────────────────────────────────

type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
type FilterKey = 'all' | 'today' | 'upcoming' | 'completed';

interface Reminder {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  recurring?: RepeatOption;
  notes?: string;
}

// ── Date Helpers ───────────────────────────────────────────────────────────────

function addDays(base: Date, days: number, hours = 0, minutes = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function formatDueDate(date: Date): string {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const itemDay = startOfDay(date);

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (itemDay.getTime() === today.getTime()) return `Today, ${timeStr}`;
  if (itemDay.getTime() === tomorrow.getTime()) return `Tomorrow, ${timeStr}`;

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}, ${timeStr}`;
}

function isOverdue(date: Date, completed: boolean): boolean {
  if (completed) return false;
  return date < new Date();
}

function isToday(date: Date): boolean {
  const today = startOfDay(new Date());
  return startOfDay(date).getTime() === today.getTime();
}

function isUpcoming(date: Date): boolean {
  const tomorrow = startOfDay(addDays(new Date(), 1));
  return startOfDay(date) >= tomorrow;
}

function nextHour(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

// ── Demo Data ─────────────────────────────────────────────────────────────────

const _today = new Date();
_today.setHours(0, 0, 0, 0);

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: '1',
    title: 'Follow up with Nike',
    dueDate: addDays(_today, 0, 15, 0),
    completed: false,
  },
  {
    id: '2',
    title: 'Post behind-the-scenes content',
    dueDate: addDays(_today, 0, 18, 0),
    completed: false,
  },
  {
    id: '3',
    title: 'Review weekly analytics',
    dueDate: addDays(_today, 1, 9, 0),
    completed: false,
    recurring: 'weekly',
  },
  {
    id: '4',
    title: 'Send invoice to Gatorade',
    dueDate: addDays(_today, 2, 10, 0),
    completed: false,
  },
  {
    id: '5',
    title: 'Prep for Under Armour call',
    dueDate: addDays(_today, 3, 14, 0),
    completed: false,
  },
  {
    id: '6',
    title: 'Submit quarterly tax payment',
    dueDate: addDays(_today, 9, 12, 0),
    completed: false,
  },
  {
    id: '7',
    title: 'Update rate card pricing',
    dueDate: addDays(_today, 14, 10, 0),
    completed: false,
  },
  {
    id: '8',
    title: 'Called back Marcus T.',
    dueDate: addDays(_today, -1, 11, 0),
    completed: true,
  },
];

// ── Swipeable Reminder Card ───────────────────────────────────────────────────

interface CardProps {
  reminder: Reminder;
  C: ComponentColors;
  onComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onEdit: (id: string) => void;
}

function ReminderCard({ reminder, C, onComplete, onSnooze, onEdit }: CardProps) {
  const swipeX = useRef(new Animated.Value(0)).current;
  const THRESHOLD = 80;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 6 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderGrant: () => {
        swipeX.stopAnimation();
      },
      onPanResponderMove: (_, gs) => {
        swipeX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -THRESHOLD) {
          // Swipe left → complete
          Animated.timing(swipeX, { toValue: -300, duration: 200, useNativeDriver: true }).start(
            () => {
              swipeX.setValue(0);
              onComplete(reminder.id);
            }
          );
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (gs.dx > THRESHOLD) {
          // Swipe right → snooze
          Animated.timing(swipeX, { toValue: 300, duration: 200, useNativeDriver: true }).start(
            () => {
              swipeX.setValue(0);
              onSnooze(reminder.id);
            }
          );
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }).start();
      },
    })
  ).current;

  const overdue = isOverdue(reminder.dueDate, reminder.completed);
  const dateColor = overdue ? '#B85C5C' : C.secondary;

  // Action background opacity based on swipe direction
  const completeOpacity = swipeX.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const snoozeOpacity = swipeX.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.cardWrapper}>
      {/* Swipe action backgrounds */}
      <Animated.View style={[styles.actionBg, styles.actionBgLeft, { opacity: completeOpacity }]}>
        <Text style={styles.actionText}>Complete</Text>
      </Animated.View>
      <Animated.View style={[styles.actionBg, styles.actionBgRight, { opacity: snoozeOpacity }]}>
        <Text style={styles.actionText}>Snooze</Text>
      </Animated.View>

      {/* Card */}
      <Animated.View
        style={{ transform: [{ translateX: swipeX }] }}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={() => !reminder.completed && onEdit(reminder.id)}
          style={[
            styles.card,
            { backgroundColor: C.surface },
          ]}
        >
          {/* Checkbox */}
          <Pressable
            onPress={() => { onComplete(reminder.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[
              styles.checkbox,
              reminder.completed
                ? { backgroundColor: '#5A8A6E', borderColor: '#5A8A6E' }
                : { borderColor: C.separator },
            ]}
            hitSlop={10}
          >
            {reminder.completed && (
              <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
            )}
          </Pressable>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                { color: reminder.completed ? C.muted : C.label },
                reminder.completed && styles.cardTitleCompleted,
              ]}
              numberOfLines={2}
            >
              {reminder.title}
            </Text>

            <View style={styles.cardMeta}>
              <Text style={[styles.cardDate, { color: dateColor }]}>
                {formatDueDate(reminder.dueDate)}
              </Text>
              {overdue && (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueBadgeText}>Overdue</Text>
                </View>
              )}
            </View>

            {reminder.recurring && reminder.recurring !== 'none' && (
              <View style={styles.recurringRow}>
                <IconSymbol name="repeat" size={11} color={C.muted} />
                <Text style={[styles.recurringText, { color: C.muted }]}>
                  {' '}Repeats {reminder.recurring}
                </Text>
              </View>
            )}
          </View>

        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Repeat Label ──────────────────────────────────────────────────────────────

const REPEAT_LABELS: Record<RepeatOption, string> = {
  none: 'None',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

const REPEAT_OPTIONS: RepeatOption[] = ['none', 'daily', 'weekly', 'monthly', 'custom'];

// ── Snooze Options ────────────────────────────────────────────────────────────

const SNOOZE_OPTIONS = [
  { label: '15 minutes', minutes: 15 },
  { label: '1 hour', minutes: 60 },
  { label: '3 hours', minutes: 180 },
  { label: 'Tomorrow', minutes: 60 * 24 },
  { label: 'Next Week', minutes: 60 * 24 * 7 },
];

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RemindersScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:agenda');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/agenda');
  const accent = C.label;

  // State
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showSnooze, setShowSnooze] = useState(false);
  const [snoozeId, setSnoozeId] = useState<string | null>(null);
  const [showRepeat, setShowRepeat] = useState(false);

  // Create/Edit form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date());
  const [formTime, setFormTime] = useState(nextHour());
  const [formRepeat, setFormRepeat] = useState<RepeatOption>('none');
  const [formNotes, setFormNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, [])
  );

  const scrollFooter = useScrollFooter();

  // ── Filtered reminders ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...reminders];

    switch (activeFilter) {
      case 'today':
        list = list.filter((r) => !r.completed && isToday(r.dueDate));
        list.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        break;
      case 'upcoming':
        list = list.filter((r) => !r.completed && isUpcoming(r.dueDate));
        list.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        break;
      case 'completed':
        list = list.filter((r) => r.completed);
        list.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
        break;
      case 'all':
      default:
        // Overdue pinned first, then sorted by date, completed excluded from top
        const overdue = list.filter((r) => !r.completed && isOverdue(r.dueDate, r.completed));
        const active = list.filter((r) => !r.completed && !isOverdue(r.dueDate, r.completed));
        const done = list.filter((r) => r.completed);
        overdue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        active.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        list = [...overdue, ...active, ...done];
        break;
    }
    return list;
  }, [reminders, activeFilter]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleComplete = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  }, []);

  const handleSnoozeOpen = useCallback((id: string) => {
    setSnoozeId(id);
    setShowSnooze(true);
  }, []);

  const handleSnoozeSelect = useCallback(
    (minutes: number) => {
      if (!snoozeId) return;
      setReminders((prev) =>
        prev.map((r) => {
          if (r.id !== snoozeId) return r;
          const newDate = new Date(r.dueDate.getTime() + minutes * 60 * 1000);
          return { ...r, dueDate: newDate };
        })
      );
      setShowSnooze(false);
      setSnoozeId(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [snoozeId]
  );

  const handleEditOpen = useCallback(
    (id: string) => {
      const r = reminders.find((x) => x.id === id);
      if (!r) return;
      setEditId(id);
      setFormTitle(r.title);
      setFormDate(r.dueDate);
      setFormTime(r.dueDate);
      setFormRepeat(r.recurring ?? 'none');
      setFormNotes(r.notes ?? '');
      setShowNotes(!!r.notes);
      setShowEdit(true);
    },
    [reminders]
  );

  const handleCreateOpen = useCallback(() => {
    setFormTitle('');
    const t = nextHour();
    setFormDate(t);
    setFormTime(t);
    setFormRepeat('none');
    setFormNotes('');
    setShowNotes(false);
    setShowCreate(true);
  }, []);

  const buildDueDate = (): Date => {
    const d = new Date(formDate);
    d.setHours(formTime.getHours(), formTime.getMinutes(), 0, 0);
    return d;
  };

  const handleSaveCreate = useCallback(() => {
    if (!formTitle.trim()) return;
    const newReminder: Reminder = {
      id: String(Date.now()),
      title: formTitle.trim(),
      dueDate: buildDueDate(),
      completed: false,
      recurring: formRepeat !== 'none' ? formRepeat : undefined,
      notes: formNotes.trim() || undefined,
    };
    setReminders((prev) => [newReminder, ...prev]);
    setShowCreate(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [formTitle, formDate, formTime, formRepeat, formNotes]);

  const handleSaveEdit = useCallback(() => {
    if (!formTitle.trim() || !editId) return;
    setReminders((prev) =>
      prev.map((r) =>
        r.id === editId
          ? {
              ...r,
              title: formTitle.trim(),
              dueDate: buildDueDate(),
              recurring: formRepeat !== 'none' ? formRepeat : undefined,
              notes: formNotes.trim() || undefined,
            }
          : r
      )
    );
    setShowEdit(false);
    setEditId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [formTitle, formDate, formTime, formRepeat, formNotes, editId]);

  const handleDelete = useCallback(() => {
    if (!editId) return;
    setReminders((prev) => prev.filter((r) => r.id !== editId));
    setShowEdit(false);
    setEditId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [editId]);

  const handleClearAllCompleted = useCallback(() => {
    setReminders((prev) => prev.filter((r) => !r.completed));
  }, []);

  // ── Filter Pills ──────────────────────────────────────────────────────────

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ];

  // ── Form Sheet Content ────────────────────────────────────────────────────

  const renderFormFields = (isEdit: boolean) => (
    <View style={styles.sheetContent}>
      {/* Title */}
      <View style={[styles.sheetField, { borderColor: C.separator }]}>
        <TextInput
          style={[styles.sheetInput, { color: C.label }]}
          placeholder="Remind me to…"
          placeholderTextColor={C.muted}
          value={formTitle}
          onChangeText={setFormTitle}
          autoFocus={!isEdit}
          returnKeyType="done"
        />
      </View>

      {/* Date row */}
      <Pressable
        style={[styles.sheetRow, { borderColor: C.separator }]}
        onPress={() => {/* Date picker — future enhancement */}}
      >
        <IconSymbol name="calendar" size={16} color={C.secondary} />
        <Text style={[styles.sheetRowLabel, { color: C.label }]}>
          {formatDueDate(formDate).split(',')[0]}
        </Text>
        <IconSymbol name="chevron.right" size={13} color={C.muted} style={{ marginLeft: 'auto' }} />
      </Pressable>

      {/* Time row */}
      <Pressable
        style={[styles.sheetRow, { borderColor: C.separator }]}
        onPress={() => {/* Time picker — future enhancement */}}
      >
        <IconSymbol name="clock" size={16} color={C.secondary} />
        <Text style={[styles.sheetRowLabel, { color: C.label }]}>
          {formTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </Text>
        <IconSymbol name="chevron.right" size={13} color={C.muted} style={{ marginLeft: 'auto' }} />
      </Pressable>

      {/* Repeat row */}
      <Pressable
        style={[styles.sheetRow, { borderColor: C.separator }]}
        onPress={() => setShowRepeat(true)}
      >
        <IconSymbol name="repeat" size={16} color={C.secondary} />
        <Text style={[styles.sheetRowLabel, { color: C.label }]}>Repeat</Text>
        <Text style={[styles.sheetRowValue, { color: C.secondary, marginLeft: 'auto' }]}>
          {REPEAT_LABELS[formRepeat]}
        </Text>
        <IconSymbol name="chevron.right" size={13} color={C.muted} />
      </Pressable>

      {/* Notes toggle */}
      <Pressable
        style={[styles.sheetRow, { borderColor: C.separator }]}
        onPress={() => setShowNotes((v) => !v)}
      >
        <IconSymbol name="note.text" size={16} color={C.secondary} />
        <Text style={[styles.sheetRowLabel, { color: C.label }]}>Add notes</Text>
        <IconSymbol
          name={showNotes ? 'chevron.up' : 'chevron.down'}
          size={13}
          color={C.muted}
          style={{ marginLeft: 'auto' }}
        />
      </Pressable>

      {showNotes && (
        <View style={[styles.sheetField, { borderColor: C.separator, marginTop: 0 }]}>
          <TextInput
            style={[styles.sheetInput, styles.sheetNotesInput, { color: C.label }]}
            placeholder="Notes…"
            placeholderTextColor={C.muted}
            value={formNotes}
            onChangeText={setFormNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* Save */}
      <Pressable
        style={[styles.saveButton, { backgroundColor: C.label }]}
        onPress={isEdit ? handleSaveEdit : handleSaveCreate}
      >
        <Text style={[styles.saveButtonText, { color: C.bg }]}>Save</Text>
      </Pressable>

      {/* Delete (edit only) */}
      {isEdit && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={[styles.deleteButtonText, { color: '#B85C5C' }]}>Delete Reminder</Text>
        </Pressable>
      )}
    </View>
  );

  // ── Empty State ───────────────────────────────────────────────────────────

  const EMPTY_MESSAGES: Record<FilterKey, string> = {
    all: 'No reminders. Tap + to create one.',
    today: 'Nothing due today.',
    upcoming: 'No upcoming reminders.',
    completed: 'No completed reminders.',
  };

  const FOOTER_HEIGHT = 49 + insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => openSidePanel()} style={styles.topBarSide}>
          <KMenuButton />
        </Pressable>

        <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[styles.titlePillText, { color: C.label }]}>Reminders</Text>
        </View>

        <View style={styles.topBarSide}>
          <RolePill
            role={role}
            onPress={guardedCycle}
            accentColor={accent}
            isPrimary={isOwner}
          />
        </View>
      </View>

      {/* Filter Pills */}
      <View style={[styles.filterBar, { borderBottomColor: C.separator }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarContent}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? C.activePill : C.surface,
                    borderColor: active ? C.activePill : C.separator,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? C.activePillText : C.secondary },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Completed — Clear All header */}
      {activeFilter === 'completed' && filtered.length > 0 && (
        <View style={[styles.clearAllRow, { borderBottomColor: C.separator }]}>
          <Text style={[styles.clearAllCount, { color: C.secondary }]}>
            {filtered.length} completed
          </Text>
          <Pressable onPress={handleClearAllCompleted}>
            <Text style={[styles.clearAllBtn, { color: '#B85C5C' }]}>Clear All</Text>
          </Pressable>
        </View>
      )}

      {/* Reminders List */}
      <ScrollView
        {...scrollFooter}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: FOOTER_HEIGHT + 72 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="bell.slash" size={36} color={C.muted} />
            <Text style={[styles.emptyText, { color: C.muted }]}>
              {EMPTY_MESSAGES[activeFilter]}
            </Text>
          </View>
        ) : (
          filtered.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              C={C}
              onComplete={handleComplete}
              onSnooze={handleSnoozeOpen}
              onEdit={handleEditOpen}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: C.label,
            bottom: FOOTER_HEIGHT + 16,
          },
        ]}
        onPress={handleCreateOpen}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>

      {/* Create Sheet */}
      <BottomSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Reminder"
        useModal
        snapPoints={['50%', '90%']}
      >
        {renderFormFields(false)}
      </BottomSheet>

      {/* Edit Sheet */}
      <BottomSheet
        visible={showEdit}
        onClose={() => { setShowEdit(false); setEditId(null); }}
        title="Edit Reminder"
        useModal
        snapPoints={['50%', '90%']}
      >
        {renderFormFields(true)}
      </BottomSheet>

      {/* Snooze Sheet */}
      <BottomSheet
        visible={showSnooze}
        onClose={() => { setShowSnooze(false); setSnoozeId(null); }}
        title="Snooze until…"
        useModal
        snapPoints={['40%', '50%']}
      >
        <View style={styles.snoozeList}>
          {SNOOZE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.label}
              style={[styles.snoozeOption, { borderBottomColor: C.separator }]}
              onPress={() => handleSnoozeSelect(opt.minutes)}
            >
              <Text style={[styles.snoozeOptionText, { color: C.label }]}>{opt.label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      {/* Repeat Picker Sheet */}
      <BottomSheet
        visible={showRepeat}
        onClose={() => setShowRepeat(false)}
        title="Repeat"
        useModal
        snapPoints={['40%', '50%']}
      >
        <View style={styles.snoozeList}>
          {REPEAT_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.snoozeOption, { borderBottomColor: C.separator }]}
              onPress={() => { setFormRepeat(opt); setShowRepeat(false); }}
            >
              <Text style={[styles.snoozeOptionText, { color: C.label }]}>{REPEAT_LABELS[opt]}</Text>
              {formRepeat === opt && (
                <IconSymbol name="checkmark" size={14} color={C.label} />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarSide: {
    width: 80,
    alignItems: 'flex-start',
  },
  titlePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  titlePillText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Filter Pills
  filterBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Clear All
  clearAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clearAllCount: {
    fontSize: 13,
  },
  clearAllBtn: {
    fontSize: 13,
    fontWeight: '600',
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
  },

  // Card wrapper for action backgrounds
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 14,
  },
  actionBgLeft: {
    backgroundColor: '#5A8A6E',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  actionBgRight: {
    backgroundColor: '#B8943E',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDate: {
    fontSize: 13,
  },
  overdueBadge: {
    backgroundColor: '#B85C5C',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  overdueBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  recurringText: {
    fontSize: 11,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },

  // Sheet
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 0,
  },
  sheetField: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  sheetInput: {
    fontSize: 15,
    minHeight: 36,
  },
  sheetNotesInput: {
    minHeight: 72,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  sheetRowLabel: {
    fontSize: 15,
  },
  sheetRowValue: {
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Snooze / Repeat Sheet
  snoozeList: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  snoozeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  snoozeOptionText: {
    fontSize: 16,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 14,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
