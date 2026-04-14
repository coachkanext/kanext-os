/**
 * Tasks — Personal task management screen.
 * Filter pills: All | Today | This Week | Completed
 * Swipe left to complete, FAB to create, tap to edit.
 * Subtask support with progress indicator.
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
import { useMode } from '@/context/app-context';
import { resetFooter } from '@/utils/global-footer-hide';
import { useOwnerGuard } from '@/hooks/use-owner-guard';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = 'Low' | 'Medium' | 'High';
type Category = 'Content' | 'Business' | 'Personal' | 'Custom';
type FilterKey = 'All' | 'Today' | 'This Week' | 'Completed';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  due?: Date;
  priority: Priority;
  category: Category;
  completed: boolean;
  completedAt?: Date;
  subtasks?: Subtask[];
  notes?: string;
}

// ── Demo data ──────────────────────────────────────────────────────────────────

const _today = new Date();
_today.setHours(0, 0, 0, 0);

function dn(days: number): Date {
  const d = new Date(_today);
  d.setDate(d.getDate() + days);
  return d;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review Under Armour contract',
    due: dn(0),
    priority: 'High',
    category: 'Business',
    completed: false,
  },
  {
    id: 't2',
    title: 'Film intro for Speed & Agility course',
    due: dn(1),
    priority: 'High',
    category: 'Content',
    completed: false,
    subtasks: [
      { id: 'st1', title: 'Write script', completed: true },
      { id: 'st2', title: 'Set up lighting', completed: false },
      { id: 'st3', title: 'Record take', completed: false },
      { id: 'st4', title: 'Review footage', completed: false },
    ],
  },
  {
    id: 't3',
    title: 'Update portfolio with Combine recap',
    due: dn(2),
    priority: 'Medium',
    category: 'Content',
    completed: false,
  },
  {
    id: 't4',
    title: 'Research new brand targets',
    due: dn(4),
    priority: 'Medium',
    category: 'Business',
    completed: false,
  },
  {
    id: 't5',
    title: 'Order new filming equipment',
    due: dn(6),
    priority: 'Low',
    category: 'Content',
    completed: false,
  },
  {
    id: 't6',
    title: 'Set up Q2 content calendar',
    due: dn(8),
    priority: 'Medium',
    category: 'Content',
    completed: false,
  },
  {
    id: 't7',
    title: 'Send thank you to event sponsors',
    due: dn(3),
    priority: 'Low',
    category: 'Personal',
    completed: false,
  },
  {
    id: 't8',
    title: 'Finalize rate card for speaking',
    due: dn(-3),
    priority: 'Medium',
    category: 'Business',
    completed: true,
    completedAt: new Date(_today.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ── Helper functions ───────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isThisWeek(d: Date): boolean {
  const day = _today.getDay(); // 0=Sun
  const monday = new Date(_today);
  monday.setDate(_today.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return d >= monday && d <= sunday;
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDue(due: Date): string {
  if (isSameDay(due, _today)) return 'Due Today';
  const tomorrow = new Date(_today);
  tomorrow.setDate(_today.getDate() + 1);
  if (isSameDay(due, tomorrow)) return 'Due Tomorrow';
  return `Due ${MONTH_ABBR[due.getMonth()]} ${due.getDate()}`;
}

function isOverdue(due: Date): boolean {
  return due < _today && !isSameDay(due, _today);
}

const PRIORITY_ORDER: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };

// ── Create/Edit form state type ────────────────────────────────────────────────

interface FormState {
  title: string;
  due: Date | null;
  priority: Priority;
  category: Category;
  subtasks: { id: string; title: string }[];
  notes: string;
  showNotes: boolean;
}

function emptyForm(): FormState {
  return {
    title: '',
    due: null,
    priority: 'Medium',
    category: 'Personal',
    subtasks: [],
    notes: '',
    showNotes: false,
  };
}

function taskToForm(task: Task): FormState {
  return {
    title: task.title,
    due: task.due ?? null,
    priority: task.priority,
    category: task.category,
    subtasks: (task.subtasks ?? []).map((s) => ({ id: s.id, title: s.title })),
    notes: task.notes ?? '',
    showNotes: !!task.notes,
  };
}

// ── TaskCard ───────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  C: ComponentColors;
  onToggleComplete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onPress: (task: Task) => void;
}

function TaskCard({ task, C, onToggleComplete, onToggleSubtask, onPress }: TaskCardProps) {
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const isCompleting = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          swipeAnim.setValue(Math.max(gs.dx, -120));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -80 && !isCompleting.current) {
          isCompleting.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Animated.timing(swipeAnim, {
            toValue: -400,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onToggleComplete(task.id);
            swipeAnim.setValue(0);
            isCompleting.current = false;
          });
        } else {
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  const completedSubtasks = (task.subtasks ?? []).filter((s) => s.completed).length;
  const totalSubtasks = (task.subtasks ?? []).length;

  const overdue = task.due ? isOverdue(task.due) : false;
  const dueDateStr = task.due ? fmtDue(task.due) : null;

  return (
    <View style={styles.cardWrapper}>
      {/* Swipe background — Complete action */}
      <View style={[styles.swipeBg, { backgroundColor: '#5A8A6E' }]}>
        <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
        <Text style={styles.swipeBgLabel}>Complete</Text>
      </View>

      <Animated.View style={{ transform: [{ translateX: swipeAnim }] }}>
        <Pressable
          style={[styles.card, { backgroundColor: C.surface }]}
          onPress={() => onPress(task)}
          {...panResponder.panHandlers}
        >
          <View style={styles.cardRow}>
            {/* Checkbox */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleComplete(task.id);
              }}
              style={styles.checkboxHitArea}
            >
              {task.completed ? (
                <View style={styles.checkboxFilled}>
                  <IconSymbol name="checkmark" size={13} color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.checkboxEmpty, { borderColor: C.separator }]} />
              )}
            </Pressable>

            {/* Content */}
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.taskTitle,
                  { color: task.completed ? C.muted : C.label },
                  task.completed && styles.taskTitleCompleted,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>

              {/* Due date + priority + category row */}
              <View style={styles.metaRow}>
                {dueDateStr && (
                  <Text
                    style={[
                      styles.dueDateText,
                      { color: overdue ? '#B85C5C' : C.secondary },
                    ]}
                  >
                    {dueDateStr}
                  </Text>
                )}
                {overdue && (
                  <View style={styles.overduePill}>
                    <Text style={styles.overdueText}>Overdue</Text>
                  </View>
                )}
                <PriorityBadge priority={task.priority} C={C} />
                <CategoryTag category={task.category} C={C} />
              </View>
            </View>

            {/* Right side: subtask progress */}
            {totalSubtasks > 0 && (
              <Text style={[styles.subtaskProgress, { color: C.secondary }]}>
                {completedSubtasks}/{totalSubtasks}
              </Text>
            )}
          </View>

          {/* Subtasks */}
          {(task.subtasks ?? []).length > 0 && (
            <View style={styles.subtasksContainer}>
              {task.subtasks!.map((sub) => (
                <Pressable
                  key={sub.id}
                  style={styles.subtaskRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onToggleSubtask(task.id, sub.id);
                  }}
                >
                  {sub.completed ? (
                    <View style={styles.subtaskCheckboxFilled}>
                      <IconSymbol name="checkmark" size={9} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={[styles.subtaskCheckboxEmpty, { borderColor: C.separator }]} />
                  )}
                  <Text
                    style={[
                      styles.subtaskText,
                      { color: sub.completed ? C.muted : C.label },
                      sub.completed && styles.subtaskTextCompleted,
                    ]}
                  >
                    {sub.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Priority Badge ─────────────────────────────────────────────────────────────

function PriorityBadge({ priority, C }: { priority: Priority; C: ComponentColors }) {
  const config: Record<Priority, { bg: string; color: string }> = {
    High: { bg: '#B85C5C20', color: '#B85C5C' },
    Medium: { bg: '#B8943E20', color: '#B8943E' },
    Low: { bg: C.separator, color: C.secondary },
  };
  const { bg, color } = config[priority];
  return (
    <View style={[styles.priorityBadge, { backgroundColor: bg }]}>
      <Text style={[styles.priorityText, { color }]}>{priority}</Text>
    </View>
  );
}

// ── Category Tag ──────────────────────────────────────────────────────────────

function CategoryTag({ category, C }: { category: Category; C: ComponentColors }) {
  return (
    <View style={[styles.categoryTag, { borderColor: C.separator }]}>
      <Text style={[styles.categoryText, { color: C.muted }]}>{category}</Text>
    </View>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ message, C }: { message: string; C: ComponentColors }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: C.secondary }]}>{message}</Text>
    </View>
  );
}

// ── Create/Edit Sheet Contents ────────────────────────────────────────────────

interface SheetFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onDelete?: () => void;
  C: ComponentColors;
  isEdit: boolean;
}

function SheetForm({ form, setForm, onSave, onDelete, C, isEdit }: SheetFormProps) {
  const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
  const CATEGORIES: Category[] = ['Content', 'Business', 'Personal'];

  function addSubtask() {
    const newId = `new_${Date.now()}`;
    setForm((f) => ({ ...f, subtasks: [...f.subtasks, { id: newId, title: '' }] }));
  }

  function updateSubtaskTitle(id: string, title: string) {
    setForm((f) => ({
      ...f,
      subtasks: f.subtasks.map((s) => (s.id === id ? { ...s, title } : s)),
    }));
  }

  function removeSubtask(id: string) {
    setForm((f) => ({ ...f, subtasks: f.subtasks.filter((s) => s.id !== id) }));
  }

  function cycleDue() {
    // Cycle through: null → today → tomorrow → +3 days → null
    if (!form.due) {
      setForm((f) => ({ ...f, due: new Date(_today) }));
    } else if (isSameDay(form.due, _today)) {
      const tm = new Date(_today);
      tm.setDate(_today.getDate() + 1);
      setForm((f) => ({ ...f, due: tm }));
    } else {
      const plus3 = new Date(_today);
      plus3.setDate(_today.getDate() + 3);
      if (isSameDay(form.due, new Date(_today.getTime() + 86400000))) {
        setForm((f) => ({ ...f, due: plus3 }));
      } else {
        setForm((f) => ({ ...f, due: null }));
      }
    }
  }

  const dueLabelStr = form.due
    ? isSameDay(form.due, _today)
      ? 'Today'
      : (() => {
          const tm = new Date(_today);
          tm.setDate(_today.getDate() + 1);
          return isSameDay(form.due, tm)
            ? 'Tomorrow'
            : `${MONTH_ABBR[form.due.getMonth()]} ${form.due.getDate()}`;
        })()
    : 'No due date';

  return (
    <View style={styles.formContainer}>
      {/* Title */}
      <TextInput
        style={[styles.formTitleInput, { color: C.label, borderBottomColor: C.separator }]}
        placeholder="What needs to get done?"
        placeholderTextColor={C.secondary}
        value={form.title}
        onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
        multiline
        returnKeyType="done"
        autoFocus={!isEdit}
      />

      {/* Due date row */}
      <Pressable
        style={[styles.formRow, { borderBottomColor: C.separator }]}
        onPress={cycleDue}
      >
        <IconSymbol name="calendar" size={16} color={C.secondary} />
        <Text style={[styles.formRowLabel, { color: C.label }]}>Due</Text>
        <Text style={[styles.formRowValue, { color: form.due ? C.label : C.secondary }]}>
          {dueLabelStr}
        </Text>
        <IconSymbol name="chevron.right" size={14} color={C.secondary} />
      </Pressable>

      {/* Priority row */}
      <View style={[styles.formRow, { borderBottomColor: C.separator }]}>
        <IconSymbol name="flag" size={16} color={C.secondary} />
        <Text style={[styles.formRowLabel, { color: C.label }]}>Priority</Text>
        <View style={styles.pillGroup}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setForm((f) => ({ ...f, priority: p }))}
              style={[
                styles.selectorPill,
                {
                  backgroundColor: form.priority === p ? C.activePill : 'transparent',
                  borderColor: form.priority === p ? C.activePill : C.separator,
                },
              ]}
            >
              <Text
                style={[
                  styles.selectorPillText,
                  { color: form.priority === p ? C.activePillText : C.secondary },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Category row */}
      <View style={[styles.formRow, { borderBottomColor: C.separator }]}>
        <IconSymbol name="tag" size={16} color={C.secondary} />
        <Text style={[styles.formRowLabel, { color: C.label }]}>Category</Text>
        <View style={styles.pillGroup}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setForm((f) => ({ ...f, category: cat }))}
              style={[
                styles.selectorPill,
                {
                  backgroundColor: form.category === cat ? C.activePill : 'transparent',
                  borderColor: form.category === cat ? C.activePill : C.separator,
                },
              ]}
            >
              <Text
                style={[
                  styles.selectorPillText,
                  { color: form.category === cat ? C.activePillText : C.secondary },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Subtasks */}
      <View style={styles.formSection}>
        <Text style={[styles.formSectionLabel, { color: C.secondary }]}>Subtasks</Text>
        {form.subtasks.map((sub, idx) => (
          <View key={sub.id} style={styles.subtaskInputRow}>
            <TextInput
              style={[styles.subtaskInput, { color: C.label, borderBottomColor: C.separator }]}
              placeholder={`Subtask ${idx + 1}`}
              placeholderTextColor={C.secondary}
              value={sub.title}
              onChangeText={(t) => updateSubtaskTitle(sub.id, t)}
            />
            <Pressable onPress={() => removeSubtask(sub.id)} style={styles.subtaskDeleteBtn}>
              <IconSymbol name="xmark.circle.fill" size={18} color={C.secondary} />
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.addSubtaskBtn} onPress={addSubtask}>
          <IconSymbol name="plus" size={14} color={C.accent} />
          <Text style={[styles.addSubtaskText, { color: C.accent }]}>Add subtask</Text>
        </Pressable>
      </View>

      {/* Notes */}
      <View style={styles.formSection}>
        {!form.showNotes ? (
          <Pressable
            style={styles.addSubtaskBtn}
            onPress={() => setForm((f) => ({ ...f, showNotes: true }))}
          >
            <IconSymbol name="text.alignleft" size={14} color={C.accent} />
            <Text style={[styles.addSubtaskText, { color: C.accent }]}>Add notes</Text>
          </Pressable>
        ) : (
          <>
            <Text style={[styles.formSectionLabel, { color: C.secondary }]}>Notes</Text>
            <TextInput
              style={[styles.notesInput, { color: C.label, borderColor: C.separator }]}
              placeholder="Add notes..."
              placeholderTextColor={C.secondary}
              value={form.notes}
              onChangeText={(t) => setForm((f) => ({ ...f, notes: t }))}
              multiline
              numberOfLines={3}
            />
          </>
        )}
      </View>

      {/* Save button */}
      <Pressable
        style={[styles.saveButton, { backgroundColor: C.accent }]}
        onPress={() => {
          if (!form.title.trim()) return;
          onSave();
        }}
      >
        <Text style={[styles.saveButtonText, { color: C.activePillText }]}>
          {isEdit ? 'Save Changes' : 'Save'}
        </Text>
      </Pressable>

      {/* Delete button (edit only) */}
      {isEdit && onDelete && (
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={[styles.deleteButtonText, { color: '#B85C5C' }]}>Delete Task</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:agenda' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:agenda';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/agenda');
  const accent = C.label;

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<FilterKey>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, []),
  );

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  // ── Filter logic ─────────────────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    let result: Task[];

    if (filter === 'All') {
      // Active only, overdue pinned top, then priority desc, then due date asc
      const active = tasks.filter((t) => !t.completed);
      const overdueTasks = active
        .filter((t) => t.due && isOverdue(t.due))
        .sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
      const upcomingTasks = active
        .filter((t) => !t.due || !isOverdue(t.due))
        .sort((a, b) => {
          const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          if (a.due && b.due) return a.due.getTime() - b.due.getTime();
          if (a.due) return -1;
          if (b.due) return 1;
          return 0;
        });
      result = [...overdueTasks, ...upcomingTasks];
    } else if (filter === 'Today') {
      result = tasks
        .filter((t) => !t.completed && t.due && isSameDay(t.due, _today))
        .sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
    } else if (filter === 'This Week') {
      result = tasks
        .filter((t) => !t.completed && t.due && isThisWeek(t.due))
        .sort((a, b) => {
          if (a.due && b.due) {
            const dateDiff = a.due.getTime() - b.due.getTime();
            if (dateDiff !== 0) return dateDiff;
          }
          return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        });
    } else {
      // Completed — most recently completed first
      result = tasks
        .filter((t) => t.completed)
        .sort((a, b) => {
          if (a.completedAt && b.completedAt)
            return b.completedAt.getTime() - a.completedAt.getTime();
          return 0;
        });
    }

    return result;
  }, [tasks, filter]);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined }
          : t,
      ),
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks ?? []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s,
        );
        const allDone =
          updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
        return {
          ...t,
          subtasks: updatedSubtasks,
          completed: allDone ? true : t.completed,
          completedAt: allDone && !t.completed ? new Date() : t.completedAt,
        };
      }),
    );
  }, []);

  const openCreate = useCallback(() => {
    setEditTask(null);
    setForm(emptyForm());
    setShowCreate(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setEditTask(task);
    setForm(taskToForm(task));
    setShowCreate(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editTask.id
            ? {
                ...t,
                title: form.title.trim(),
                due: form.due ?? undefined,
                priority: form.priority,
                category: form.category,
                notes: form.notes.trim() || undefined,
                subtasks:
                  form.subtasks.length > 0
                    ? form.subtasks
                        .filter((s) => s.title.trim())
                        .map((s) => {
                          const existing = t.subtasks?.find((es) => es.id === s.id);
                          return {
                            id: s.id,
                            title: s.title.trim(),
                            completed: existing?.completed ?? false,
                          };
                        })
                    : undefined,
              }
            : t,
        ),
      );
    } else {
      const newTask: Task = {
        id: `t_${Date.now()}`,
        title: form.title.trim(),
        due: form.due ?? undefined,
        priority: form.priority,
        category: form.category,
        completed: false,
        notes: form.notes.trim() || undefined,
        subtasks:
          form.subtasks.length > 0
            ? form.subtasks
                .filter((s) => s.title.trim())
                .map((s) => ({ id: s.id, title: s.title.trim(), completed: false }))
            : undefined,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setShowCreate(false);
    setEditTask(null);
    setForm(emptyForm());
  }, [form, editTask]);

  const handleDelete = useCallback(() => {
    if (!editTask) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTasks((prev) => prev.filter((t) => t.id !== editTask.id));
    setShowCreate(false);
    setEditTask(null);
    setForm(emptyForm());
  }, [editTask]);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  // ── Empty state messages ──────────────────────────────────────────────────────

  const emptyMessage: Record<FilterKey, string> = {
    All: 'No tasks. Tap + to create one.',
    Today: 'Nothing due today.',
    'This Week': 'No tasks this week.',
    Completed: 'No completed tasks.',
  };

  const FILTERS: FilterKey[] = ['All', 'Today', 'This Week', 'Completed'];

  const contentBottom = 49 + insets.bottom + 16;

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => openSidePanel()} style={styles.topBarSide}>
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.titlePillText, { color: C.label }]}>Tasks</Text>
            </View>
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
      </Animated.View>
      {/* ── Task List ────────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 56 + 8, paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Filter Pills ─────────────────────────────────────────────────────── */}
        <View style={[styles.filterBar, { borderBottomColor: C.separator }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: active ? C.activePill : 'transparent',
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
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Clear All (Completed filter only) ───────────────────────────────── */}
        {filter === 'Completed' && filteredTasks.length > 0 && (
          <View style={[styles.clearAllBar, { borderBottomColor: C.separator }]}>
            <Pressable onPress={clearCompleted}>
              <Text style={[styles.clearAllText, { color: '#B85C5C' }]}>Clear All</Text>
            </Pressable>
          </View>
        )}
        {filteredTasks.length === 0 ? (
          <EmptyState message={emptyMessage[filter]} C={C} />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              C={C}
              onToggleComplete={toggleComplete}
              onToggleSubtask={toggleSubtask}
              onPress={openEdit}
            />
          ))
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: C.accent,
            bottom: 49 + insets.bottom + 16,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          openCreate();
        }}
      >
        <IconSymbol name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      {/* ── Create / Edit Sheet ──────────────────────────────────────────────── */}
      <BottomSheet
        visible={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditTask(null);
          setForm(emptyForm());
        }}
        title={editTask ? 'Edit Task' : 'New Task'}
        snapPoints={['60%', '90%']}
        useModal
      >
        <SheetForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onDelete={editTask ? handleDelete : undefined}
          C={C}
          isEdit={!!editTask}
        />
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Top bar
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topBarSide: {
    width: 80,
    alignItems: 'flex-start',
  },
  titlePill: {
    paddingHorizontal: 12,
    paddingVertical:    5,
    borderRadius:      14,
    borderWidth:        1,
  },
  titlePillText: {
    fontSize:      12,
    fontWeight:    '600',
    letterSpacing: 0.3,
  },

  // Filter bar
  filterBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
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

  // Clear all
  clearAllBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // Card wrapper (for swipe background)
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  swipeBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
    borderRadius: 14,
    gap: 6,
  },
  swipeBgLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Card
  card: {
    borderRadius: 14,
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  // Checkbox
  checkboxHitArea: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  checkboxFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5A8A6E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card content
  cardContent: {
    flex: 1,
    gap: 5,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
  },
  dueDateText: {
    fontSize: 13,
  },
  overduePill: {
    backgroundColor: '#B85C5C',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  overdueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  categoryTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
  },

  // Subtask progress
  subtaskProgress: {
    fontSize: 12,
    marginTop: 2,
  },

  // Subtasks in card
  subtasksContainer: {
    marginTop: 10,
    gap: 6,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 28,
  },
  subtaskCheckboxEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  subtaskCheckboxFilled: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5A8A6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskText: {
    fontSize: 13,
    flex: 1,
  },
  subtaskTextCompleted: {
    textDecorationLine: 'line-through',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },

  // Sheet form
  formContainer: {
    paddingTop: 4,
    gap: 0,
  },
  formTitleInput: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 0,
    minHeight: 50,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
  },
  formRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 64,
  },
  formRowValue: {
    fontSize: 14,
    flex: 1,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  selectorPill: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  selectorPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formSection: {
    paddingTop: 14,
    gap: 8,
  },
  formSectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtaskDeleteBtn: {
    padding: 4,
  },
  addSubtaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  addSubtaskText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
