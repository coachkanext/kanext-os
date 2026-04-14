/**
 * Outreach — Follow-Up Sequences (Pastor only).
 * Member redirects to outreach/index.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';

// ── Mock data ─────────────────────────────────────────────────────────────────

type SequenceStep = { day: number; title: string };

type Sequence = {
  id: string;
  name: string;
  status: 'Active' | 'Draft';
  enrolled: number;
  steps: SequenceStep[];
};

const SEQUENCES: Sequence[] = [
  {
    id: 'sq1',
    name: 'New Visitor Welcome',
    status: 'Active',
    enrolled: 12,
    steps: [
      { day: 1,  title: 'Welcome text'        },
      { day: 3,  title: 'Follow-up call'      },
      { day: 7,  title: 'Group invite email'  },
      { day: 14, title: 'Check-in text'       },
      { day: 30, title: 'Re-engage call'      },
    ],
  },
  {
    id: 'sq2',
    name: 'First Visit to Member',
    status: 'Active',
    enrolled: 8,
    steps: [
      { day: 1,  title: 'Personal thank-you text'     },
      { day: 3,  title: 'Invitation to small group'   },
      { day: 7,  title: 'Pastor intro call'           },
      { day: 14, title: 'Membership class invite'     },
      { day: 21, title: 'Check-in text'               },
      { day: 30, title: 'Serve team invite'           },
      { day: 45, title: 'Membership commitment ask'   },
    ],
  },
  {
    id: 'sq3',
    name: 'Lapsed Reconnect',
    status: 'Draft',
    enrolled: 3,
    steps: [
      { day: 1,  title: '"We miss you" text'          },
      { day: 7,  title: 'Personal call from leader'   },
      { day: 14, title: 'Event invite email'          },
      { day: 30, title: 'Final re-engage text'        },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FollowUpScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['sq1']));

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/outreach' as any);
    }
  }, [isPastor, router]));

  if (!isPastor) return null;

  const toggleExpand = (id: string) => {
    Haptics.selectionAsync();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const statusColor  = (status: Sequence['status']) => status === 'Active' ? GAIN : C.secondary;
  const statusBg     = (status: Sequence['status']) => status === 'Active' ? GAIN + '20' : C.separator;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidePanel();
              }}
              hitSlop={12}
            >
              <KMenuButton />
            </Pressable>
          </View>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titlePillText, { color: C.label }]}>Follow-Up Sequences</Text>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {SEQUENCES.map(seq => {
          const isOpen = expanded.has(seq.id);
          return (
            <View key={seq.id} style={[s.seqCard, { backgroundColor: C.surface }]}>
              {/* Header — tappable */}
              <Pressable
                style={({ pressed }) => [
                  s.seqHeader,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => toggleExpand(seq.id)}
              >
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[s.seqName, { color: C.label }]}>{seq.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[s.statusBadge, { backgroundColor: statusBg(seq.status) }]}>
                      <Text style={[s.statusBadgeText, { color: statusColor(seq.status) }]}>
                        {seq.status}
                      </Text>
                    </View>
                    <Text style={[s.enrolledText, { color: C.secondary }]}>
                      {seq.enrolled} people active
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[s.stepCount, { color: C.secondary }]}>
                    {seq.steps.length} steps
                  </Text>
                  <IconSymbol
                    name={isOpen ? 'chevron.up' : 'chevron.down'}
                    size={14}
                    color={C.secondary}
                  />
                </View>
              </Pressable>

              {/* Steps timeline — shown when expanded */}
              {isOpen && (
                <View style={[s.stepsContainer, { borderTopColor: C.separator }]}>
                  {seq.steps.map((step, idx) => (
                    <View
                      key={idx}
                      style={[
                        s.stepRow,
                        idx < seq.steps.length - 1 && [s.stepRowBorder, { borderBottomColor: C.separator }],
                      ]}
                    >
                      {/* Day label */}
                      <Text style={[s.stepDay, { color: C.secondary }]}>Day {step.day}</Text>
                      {/* Connector line + dot */}
                      <View style={s.stepConnector}>
                        <View style={[s.stepDot, { backgroundColor: C.separator }]} />
                        {idx < seq.steps.length - 1 && (
                          <View style={[s.stepLine, { backgroundColor: C.separator }]} />
                        )}
                      </View>
                      {/* Title */}
                      <Text style={[s.stepTitle, { color: C.label }]}>{step.title}</Text>
                    </View>
                  ))}

                  {/* Edit / Preview actions */}
                  <View style={[s.seqActions, { borderTopColor: C.separator }]}>
                    <Pressable
                      style={({ pressed }) => [
                        s.seqActionBtn,
                        { borderColor: C.separator },
                        pressed && { opacity: 0.75 },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert('Edit Sequence', `Editing: ${seq.name}`, [
                          { text: 'Cancel' },
                          { text: 'Edit' },
                        ]);
                      }}
                    >
                      <Text style={[s.seqActionText, { color: C.label }]}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        s.seqActionBtn,
                        { borderColor: C.separator },
                        pressed && { opacity: 0.75 },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert(
                          seq.name,
                          `${seq.steps.length} steps · ${seq.enrolled} people active\nStatus: ${seq.status}`,
                          [{ text: 'OK' }],
                        );
                      }}
                    >
                      <Text style={[s.seqActionText, { color: C.label }]}>Preview</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB — Create Sequence */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Create Sequence', 'Open sequence creation form?', [
            { text: 'Cancel' },
            { text: 'Create' },
          ]);
        }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },
  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },
  titlePill: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  titlePillText: { fontSize: 13, fontWeight: '700' },

  seqCard:   { borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  seqHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  seqName:   { fontSize: 15, fontWeight: '700' },

  statusBadge:     { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  enrolledText:    { fontSize: 12 },
  stepCount:       { fontSize: 12 },

  stepsContainer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, paddingHorizontal: 16 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 0,
  },
  stepRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  stepDay: {
    width: 50,
    fontSize: 11,
    fontWeight: '600',
    paddingTop: 2,
  },
  stepConnector: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  stepDot:  { width: 8, height: 8, borderRadius: 4, marginTop: 3 },
  stepLine: { width: 1, flex: 1, minHeight: 12 },
  stepTitle:{ flex: 1, fontSize: 13 },

  seqActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  seqActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  seqActionText: { fontSize: 13, fontWeight: '600' },

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
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
