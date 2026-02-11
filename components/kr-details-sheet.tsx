/**
 * KR Details Sheet
 * Bottom sheet overlay showing KaNeXT Rating breakdown details.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);

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
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!visible) return null;

  const fitColor = (val: number) =>
    val >= 75 ? '#4CAF50' : val >= 60 ? '#FF9800' : '#FF5722';

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + Spacing.md,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

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
            <ThemedText style={[styles.gapTag, { color: '#FF9800' }]}>
              under-covered
            </ThemedText>
          </View>
        </View>

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
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
