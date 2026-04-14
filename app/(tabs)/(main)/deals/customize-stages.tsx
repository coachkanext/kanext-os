/**
 * Customize Stages — Edit pipeline stages: name, color, win probability, order.
 * Owner-only.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert, TextInput, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Types & constants ─────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { label: 'Mist',    value: '#E0DBD4' },
  { label: 'Drift',   value: '#9C9790' },
  { label: 'Caution', value: '#B8943E' },
  { label: 'Gain',    value: '#5A8A6E' },
  { label: 'Heat',    value: '#B85C5C' },
  { label: 'Carbon',  value: '#1A1714' },
] as const;

type ColorValue = typeof COLOR_OPTIONS[number]['value'];

interface Stage {
  id: string;
  name: string;
  color: ColorValue;
  winProbability: number;
  dealCount: number;
}

const DEFAULT_STAGES: Stage[] = [
  { id: 's1', name: 'Contacted',   color: '#E0DBD4', winProbability: 10,  dealCount: 2 },
  { id: 's2', name: 'Proposal',    color: '#B8943E', winProbability: 25,  dealCount: 3 },
  { id: 's3', name: 'Negotiating', color: '#B8943E', winProbability: 50,  dealCount: 1 },
  { id: 's4', name: 'Contract',    color: '#5A8A6E', winProbability: 75,  dealCount: 2 },
  { id: 's5', name: 'Active',      color: '#5A8A6E', winProbability: 90,  dealCount: 1 },
  { id: 's6', name: 'Completed',   color: '#1A1714', winProbability: 100, dealCount: 4 },
];

const PROB_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

// ── Edit Sheet ────────────────────────────────────────────────────────────────

function EditStageSheet({
  stage,
  visible,
  onClose,
  onSave,
  C,
}: {
  stage: Stage | null;
  visible: boolean;
  onClose: () => void;
  onSave: (updated: Omit<Stage, 'id' | 'dealCount'>) => void;
  C: ReturnType<typeof useColors>;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColorValue>('#E0DBD4');
  const [prob, setProb] = useState(50);

  React.useEffect(() => {
    if (stage) {
      setName(stage.name);
      setColor(stage.color);
      setProb(stage.winProbability);
    } else {
      setName('');
      setColor('#E0DBD4');
      setProb(50);
    }
  }, [stage, visible]);

  const label = (t: string) => (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {t}
    </Text>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={stage ? 'Edit Stage' : 'New Stage'} snapPoints={['65%', '100%']}>
      {label('Stage Name')}
      <TextInput
        style={{
          backgroundColor: C.surface, borderRadius: 10, padding: 12,
          fontSize: 15, color: C.label, marginBottom: 20,
          borderWidth: 1, borderColor: C.separator,
        }}
        placeholder="Stage name"
        placeholderTextColor={C.secondary}
        value={name}
        onChangeText={setName}
        autoFocus={!stage}
      />

      {label('Color')}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        {COLOR_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            onPress={() => { setColor(opt.value); Haptics.selectionAsync(); }}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: opt.value,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: color === opt.value ? 2.5 : 1,
              borderColor: color === opt.value ? C.label : C.separator,
            }}
          >
            {color === opt.value && (
              <IconSymbol name="checkmark" size={14} color={opt.value === '#1A1714' ? '#FFFFFF' : '#1A1714'} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {label('Win Probability')}
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, marginBottom: 8 }}>{prob}%</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }} style={{ marginBottom: 24 }}>
        {PROB_STEPS.map(step => (
          <Pressable
            key={step}
            onPress={() => { setProb(step); Haptics.selectionAsync(); }}
            style={{
              width: 44, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
              backgroundColor: prob === step ? C.label : C.surface,
              borderWidth: 1, borderColor: prob === step ? C.label : C.separator,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: prob === step ? C.bg : C.secondary }}>{step}%</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={() => {
          if (!name.trim()) return;
          onSave({ name: name.trim(), color, winProbability: prob });
          onClose();
        }}
        style={({ pressed }) => ({
          backgroundColor: name.trim() ? C.label : C.separator,
          borderRadius: 12, paddingVertical: 14, alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Save</Text>
      </Pressable>
    </BottomSheet>
  );
}

// ── Stage Card ────────────────────────────────────────────────────────────────

function StageCard({
  stage,
  onEdit,
  onDelete,
  C,
}: {
  stage: Stage;
  onEdit: () => void;
  onDelete: () => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: pressed ? C.bg : C.surface,
        borderRadius: 12, padding: 14, marginBottom: 8,
      })}
    >
      <IconSymbol name="line.3.horizontal" size={18} color={C.secondary} />

      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: stage.color }} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{stage.name}</Text>
        </View>
        <Text style={{ fontSize: 12, color: C.secondary }}>Win probability: {stage.winProbability}%</Text>
        <Text style={{ fontSize: 12, color: C.secondary }}>
          {stage.dealCount === 0 ? 'No deals' : `${stage.dealCount} deal${stage.dealCount !== 1 ? 's' : ''}`}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Alert.alert(stage.name, undefined, [
            { text: 'Edit',   onPress: onEdit },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
        hitSlop={8}
        style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
      >
        <IconSymbol name="ellipsis" size={16} color={C.secondary} />
      </Pressable>
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CustomizeStagesScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + 52;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:deals');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [editTarget, setEditTarget] = useState<Stage | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const openEdit = (stage: Stage) => { setEditTarget(stage); setEditOpen(true); };
  const openNew  = () => { setEditTarget(null); setEditOpen(true); };

  const handleSave = (updated: Omit<Stage, 'id' | 'dealCount'>) => {
    if (editTarget) {
      setStages(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...updated } : s));
    } else {
      setStages(prev => [...prev, { id: `s${Date.now()}`, dealCount: 0, ...updated }]);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (stage: Stage) => {
    if (stages.length <= 2) {
      Alert.alert('Cannot Delete', 'Pipeline needs at least 2 stages.');
      return;
    }
    if (stage.dealCount === 0) {
      Alert.alert(`Delete "${stage.name}"?`, undefined, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            setStages(prev => prev.filter(s => s.id !== stage.id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]);
    } else {
      const others = stages.filter(s => s.id !== stage.id);
      Alert.alert(
        `${stage.dealCount} deal${stage.dealCount !== 1 ? 's' : ''} in "${stage.name}"`,
        'Move them to:',
        [
          ...others.map(dest => ({
            text: dest.name,
            onPress: () => {
              setStages(prev => prev.filter(s => s.id !== stage.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          })),
          { text: 'Cancel', style: 'cancel' as const },
        ],
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: insets.top,
        backgroundColor: C.bg,
        opacity,
      }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18,
              backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.separator,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Customize Stages</Text>
            </View>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
        </View>
      </Animated.View>

      {/* Stage list */}
      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16, lineHeight: 18 }}>
          Stages define your deal pipeline. Tap a stage to edit its name, color, and win probability. Win probability is used for weighted pipeline forecasting.
        </Text>

        {stages.map(stage => (
          <StageCard
            key={stage.id}
            stage={stage}
            onEdit={() => openEdit(stage)}
            onDelete={() => handleDelete(stage)}
            C={C}
          />
        ))}

        {/* Add Stage */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openNew(); }}
          style={({ pressed }) => ({
            borderWidth: 1.5, borderColor: C.separator, borderStyle: 'dashed',
            borderRadius: 12, padding: 18, alignItems: 'center',
            backgroundColor: pressed ? C.surface : 'transparent',
            marginTop: 4,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>+ Add Stage</Text>
        </Pressable>
      </ScrollView>

      <EditStageSheet
        stage={editTarget}
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        C={C}
      />
    </View>
  );
}
