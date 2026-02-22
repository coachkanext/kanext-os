/**
 * KR Details Sheet
 * Bottom sheet overlay showing KaNeXT Rating breakdown details.
 */

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Demo data — canonical sources:
// Tier: Team KR Legend (NAIA 72–75 = "Regional Power")
// Weighting: Team KR Math + Weights (LOCKED 53/47 off/def)
// Systems: UI System Set (11 offensive, 9 defensive)
// Gap: System Demand Profiles (critical-missing risk)
const KR_DATA = {
  offKR: 77,
  defKR: 71,
  offSystem: 'Spread Pick-and-Roll',
  defSystem: 'Pressure Man (Denial)',
  tempo: 'Fast',
  offFit: 72,
  defFit: 65,
  topDrivers: [
    { name: 'Rico Thompson', playerKR: 82 },
    { name: "Ka'Mar Benbo", playerKR: 79 },
    { name: 'Devin Carter', playerKR: 76 },
  ],
  primaryGap: 'Rim Protection',
};

interface KRDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function KRDetailsSheet({ visible, onClose }: KRDetailsSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const fitColor = (val: number) =>
    val >= 75 ? '#22C55E' : val >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Team KR Breakdown">
      {/* 1) Off/Def KR pills */}
      <View style={styles.headerSection}>
        <View style={styles.krPillRow}>
          <View style={[styles.krPill, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[styles.krPillLabel, { color: colors.textTertiary }]}>Off</ThemedText>
            <ThemedText style={styles.krPillValue}>{KR_DATA.offKR}</ThemedText>
          </View>
          <View style={[styles.krPill, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[styles.krPillLabel, { color: colors.textTertiary }]}>Def</ThemedText>
            <ThemedText style={styles.krPillValue}>{KR_DATA.defKR}</ThemedText>
          </View>
        </View>
      </View>

      {/* 2) Program Context */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        PROGRAM CONTEXT
      </ThemedText>
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.cardRow}>
          <ThemedText style={[styles.cardRowLabel, { color: colors.textSecondary }]}>
            Off System
          </ThemedText>
          <ThemedText style={styles.cardRowValue}>{KR_DATA.offSystem}</ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.cardRow}>
          <ThemedText style={[styles.cardRowLabel, { color: colors.textSecondary }]}>
            Def System
          </ThemedText>
          <ThemedText style={styles.cardRowValue}>{KR_DATA.defSystem}</ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.cardRow}>
          <ThemedText style={[styles.cardRowLabel, { color: colors.textSecondary }]}>
            Tempo
          </ThemedText>
          <ThemedText style={styles.cardRowValue}>{KR_DATA.tempo}</ThemedText>
        </View>
      </View>

      {/* 3) System Fit */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        SYSTEM FIT
      </ThemedText>
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.cardRow}>
          <ThemedText style={[styles.cardRowLabel, { color: colors.textSecondary }]}>
            Off Fit
          </ThemedText>
          <ThemedText style={[styles.cardRowValue, { color: fitColor(KR_DATA.offFit) }]}>
            {KR_DATA.offFit}%
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.cardRow}>
          <ThemedText style={[styles.cardRowLabel, { color: colors.textSecondary }]}>
            Def Fit
          </ThemedText>
          <ThemedText style={[styles.cardRowValue, { color: fitColor(KR_DATA.defFit) }]}>
            {KR_DATA.defFit}%
          </ThemedText>
        </View>
      </View>

      {/* 4) Top Drivers */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        TOP DRIVERS
      </ThemedText>
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        {KR_DATA.topDrivers.map((driver, i) => (
          <React.Fragment key={driver.name}>
            {i > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            )}
            <View style={styles.cardRow}>
              <ThemedText style={[styles.cardRowLabel, { color: colors.text }]}>
                {i + 1}. {driver.name}
              </ThemedText>
              <ThemedText style={[styles.cardRowValue, { color: colors.textSecondary }]}>
                {driver.playerKR} KR
              </ThemedText>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* 5) Biggest Fit Gap */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        BIGGEST FIT GAP
      </ThemedText>
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.cardRow}>
          <ThemedText style={[styles.cardRowLabel, { color: colors.text }]}>
            {KR_DATA.primaryGap}
          </ThemedText>
          <ThemedText style={[styles.gapTag, { color: '#F59E0B' }]}>
            under-covered
          </ThemedText>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  krPillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  krPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  krPillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  krPillValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  cardRowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardRowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
  gapTag: {
    fontSize: 13,
    fontWeight: '600',
  },
});
