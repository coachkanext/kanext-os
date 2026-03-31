/**
 * Biz Vault Proof View — Institution cards with mode/status badges
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors , MODE_ACCENT } from '@/constants/theme';
import { PROOF_INSTITUTIONS, type ProofInstitution } from '@/data/mock-business-home';


const ACCENT = MODE_ACCENT.business;
interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const MODE_COLORS: Record<string, string> = {
  sports: ACCENT,
  church: ACCENT,
  education: '#5A8A6E',
  competition: '#B85C5C',
};

const MODE_LABELS: Record<string, string> = {
  sports: 'Sports',
  church: 'Faith',
  education: 'Education',
  competition: 'Competition',
};

const STATUS_COLORS: Record<string, string> = {
  live: '#5A8A6E',
  onboarding: '#B8943E',
  signed: ACCENT,
  prospect: '#9C9790',
};

const STATUS_LABELS: Record<string, string> = {
  live: 'Live',
  onboarding: 'Onboarding',
  signed: 'Signed',
  prospect: 'Prospect',
};

export function BizVaultProofView({ colors, accent }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionLabel, { color: accent }]}>INSTITUTIONS</ThemedText>
      {PROOF_INSTITUTIONS.map((inst: ProofInstitution) => {
        const modeColor = MODE_COLORS[inst.mode] ?? '#9C9790';
        const statusColor = STATUS_COLORS[inst.status] ?? '#9C9790';
        const isLive = inst.status === 'live';

        return (
          <View
            key={inst.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              isLive && { borderLeftColor: '#5A8A6E', borderLeftWidth: 3 },
            ]}
          >
            <View style={styles.cardTop}>
              <ThemedText style={[styles.instName, { color: colors.text }]}>{inst.name}</ThemedText>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: modeColor + '22' }]}>
                  <ThemedText style={[styles.badgeText, { color: modeColor }]}>
                    {MODE_LABELS[inst.mode] ?? inst.mode}
                  </ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
                  <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                    {STATUS_LABELS[inst.status] ?? inst.status}
                  </ThemedText>
                </View>
              </View>
            </View>

            <ThemedText style={[styles.keyMetric, { color: colors.textSecondary }]}>
              {inst.keyMetrics}
            </ThemedText>

            <View style={styles.cardBottom}>
              {inst.activeViews > 0 && (
                <ThemedText style={[styles.viewsText, { color: accent }]}>
                  {inst.activeViews} active views
                </ThemedText>
              )}
              {inst.sinceDate !== '' && (
                <ThemedText style={[styles.sinceText, { color: colors.textSecondary }]}>
                  Since {inst.sinceDate}
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  instName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  keyMetric: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewsText: { fontSize: 11, fontWeight: '700' },
  sinceText: { fontSize: 11 },
});
