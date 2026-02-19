/**
 * Church Connect — Pipeline View
 * Stage summary bar + filterable person list with CRM cards.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { PIPELINE_STAGES, PIPELINE_PEOPLE, PIPELINE_STAGE_COLORS, type ChurchPipelineStage } from '@/data/mock-church-home';
import { openPersonCard, openLeaderCard } from '@/utils/global-entity-sheets';

interface Props { colors: typeof Colors.light; accent: string }

function getInitials(name: string): string {
  return name.split(' ').filter((p) => p !== '&').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function ChurchConnectPipelineView({ colors, accent }: Props) {
  const [selectedStage, setSelectedStage] = useState<ChurchPipelineStage | 'all'>('all');

  const filtered = useMemo(() => {
    if (selectedStage === 'all') return PIPELINE_PEOPLE;
    return PIPELINE_PEOPLE.filter((p) => p.stage === selectedStage);
  }, [selectedStage]);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Stage Summary Bar */}
      <View style={styles.stageBar}>
        <Pressable
          style={[styles.stagePill, { backgroundColor: selectedStage === 'all' ? accent + '22' : colors.card, borderColor: selectedStage === 'all' ? accent : colors.border }]}
          onPress={() => setSelectedStage('all')}
        >
          <ThemedText style={[styles.stageCount, { color: selectedStage === 'all' ? accent : colors.text }]}>{PIPELINE_PEOPLE.length}</ThemedText>
          <ThemedText style={[styles.stageLabel, { color: selectedStage === 'all' ? accent : colors.textSecondary }]}>All</ThemedText>
        </Pressable>
        {PIPELINE_STAGES.map((stage) => {
          const isActive = selectedStage === stage.key;
          const sc = PIPELINE_STAGE_COLORS[stage.key];
          return (
            <Pressable
              key={stage.key}
              style={[styles.stagePill, { backgroundColor: isActive ? sc + '22' : colors.card, borderColor: isActive ? sc : colors.border }]}
              onPress={() => setSelectedStage(stage.key)}
            >
              <ThemedText style={[styles.stageCount, { color: isActive ? sc : colors.text }]}>{stage.count}</ThemedText>
              <ThemedText style={[styles.stageLabel, { color: isActive ? sc : colors.textSecondary }]} numberOfLines={1}>{stage.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Person Cards */}
      {filtered.map((person) => {
        const sc = PIPELINE_STAGE_COLORS[person.stage];
        const label = PIPELINE_STAGES.find((s) => s.key === person.stage)?.label ?? person.stage;
        return (
          <Pressable
            key={person.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openPersonCard({ name: person.name, role: label, status: person.stage })}
          >
            <View style={[styles.avatar, { backgroundColor: sc + '33' }]}>
              <ThemedText style={[styles.avatarText, { color: sc }]}>{getInitials(person.name)}</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <ThemedText style={[styles.personName, { color: colors.text }]}>{person.name}</ThemedText>
                <View style={[styles.stageBadge, { backgroundColor: sc + '22' }]}>
                  <ThemedText style={[styles.stageBadgeText, { color: sc }]}>{label}</ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>Last visit: {person.lastVisit}</ThemedText>
              {person.nextStep && (
                <ThemedText style={[styles.nextStepText, { color: accent }]}>
                  Next: {person.nextStep}
                </ThemedText>
              )}
              {person.assignedTo && (
                <Pressable
                  onPress={() => openLeaderCard({ name: person.assignedTo!, title: '' })}
                  hitSlop={6}
                >
                  <ThemedText style={[styles.assignedLink, { color: accent }]}>
                    Assigned to {person.assignedTo}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  stageBar: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  stagePill: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, minWidth: 44 },
  stageCount: { fontSize: 14, fontWeight: '800' },
  stageLabel: { fontSize: 9, fontWeight: '600', marginTop: 1 },
  card: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 13, fontWeight: '700' },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  personName: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stageBadgeText: { fontSize: 10, fontWeight: '700' },
  metaText: { fontSize: 11, marginBottom: 2 },
  nextStepText: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  assignedLink: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});
