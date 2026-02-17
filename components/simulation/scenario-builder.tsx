/**
 * ScenarioBuilder — Step-by-step simulation creation UI.
 * Type selection, configuration, overrides, replications, run + inline result.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SIM_TYPE_CARDS, SUN_CONFERENCE_OPPONENTS, formatMargin } from '@/data/mock-simulations';
import type { SimType } from '@/components/simulation/simulation-types';

const ACCENT = '#FFFFFF';

type SimLocation = 'home' | 'away' | 'neutral';
type RosterSelection = 'official' | 'sandbox';
type Tempo = 'push' | 'moderate' | 'controlled';
type Replications = 'quick' | 'standard' | 'deep';

interface MockResult {
  winProbability: number;
  projectedScore: { home: number; away: number };
  confidence: number;
  confidenceLabel: string;
  drivers: string[];
}

// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Sim Type Grid
// ---------------------------------------------------------------------------

function SimTypeGrid({
  selected,
  onSelect,
  colors,
}: {
  selected: SimType | null;
  onSelect: (t: SimType) => void;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.typeGrid}>
      {SIM_TYPE_CARDS.map((card) => {
        const isSelected = selected === card.id;
        return (
          <Pressable
            key={card.id}
            style={[
              styles.typeCard,
              {
                backgroundColor: colors.card,
                borderColor: isSelected ? card.color : colors.border,
                borderWidth: isSelected ? 1.5 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(card.id);
            }}
          >
            <View style={[styles.typeIconCircle, { backgroundColor: card.color + '20' }]}>
              <IconSymbol name={card.icon as any} size={18} color={card.color} />
            </View>
            <ThemedText
              style={[styles.typeName, { color: isSelected ? card.color : colors.text }]}
              numberOfLines={1}
            >
              {card.name}
            </ThemedText>
            <ThemedText style={[styles.typeDesc, { color: colors.textTertiary }]} numberOfLines={1}>
              {card.description}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Base Configuration
// ---------------------------------------------------------------------------

function BaseConfiguration({
  opponent,
  setOpponent,
  location,
  setLocation,
  roster,
  setRoster,
  colors,
}: {
  opponent: string;
  setOpponent: (o: string) => void;
  location: SimLocation;
  setLocation: (l: SimLocation) => void;
  roster: RosterSelection;
  setRoster: (r: RosterSelection) => void;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Opponent chips — horizontal scroll */}
      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Opponent</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipScrollContent}
      >
        {SUN_CONFERENCE_OPPONENTS.map((opp) => {
          const isSelected = opponent === opp;
          return (
            <Pressable
              key={opp}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? ACCENT + '15' : colors.backgroundTertiary,
                  borderColor: isSelected ? ACCENT : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOpponent(opp);
              }}
            >
              <ThemedText
                style={[styles.chipText, { color: isSelected ? ACCENT : colors.textSecondary }]}
                numberOfLines={1}
              >
                {opp}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Location toggle */}
      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        Location
      </ThemedText>
      <View style={styles.toggleRow}>
        {(['home', 'away', 'neutral'] as SimLocation[]).map((loc) => {
          const isSelected = location === loc;
          return (
            <Pressable
              key={loc}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: isSelected ? ACCENT + '15' : colors.backgroundTertiary,
                  borderColor: isSelected ? ACCENT : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLocation(loc);
              }}
            >
              <ThemedText style={[styles.toggleText, { color: isSelected ? ACCENT : colors.textSecondary }]}>
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Roster toggle */}
      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        Roster
      </ThemedText>
      <View style={styles.toggleRow}>
        {(['official', 'sandbox'] as RosterSelection[]).map((r) => {
          const isSelected = roster === r;
          return (
            <Pressable
              key={r}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: isSelected ? ACCENT + '15' : colors.backgroundTertiary,
                  borderColor: isSelected ? ACCENT : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRoster(r);
              }}
            >
              <ThemedText style={[styles.toggleText, { color: isSelected ? ACCENT : colors.textSecondary }]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Overrides (Tempo)
// ---------------------------------------------------------------------------

function OverridesSection({
  tempo,
  setTempo,
  colors,
}: {
  tempo: Tempo;
  setTempo: (t: Tempo) => void;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tempo</ThemedText>
      <View style={styles.toggleRow}>
        {(['push', 'moderate', 'controlled'] as Tempo[]).map((t) => {
          const isSelected = tempo === t;
          return (
            <Pressable
              key={t}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: isSelected ? ACCENT + '15' : colors.backgroundTertiary,
                  borderColor: isSelected ? ACCENT : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTempo(t);
              }}
            >
              <ThemedText style={[styles.toggleText, { color: isSelected ? ACCENT : colors.textSecondary }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Seeds & Replications
// ---------------------------------------------------------------------------

const REPLICATION_OPTIONS: { key: Replications; label: string; count: string }[] = [
  { key: 'quick', label: 'Quick', count: '100' },
  { key: 'standard', label: 'Standard', count: '1,000' },
  { key: 'deep', label: 'Deep', count: '10,000' },
];

function ReplicationsSection({
  replications,
  setReplications,
  colors,
}: {
  replications: Replications;
  setReplications: (r: Replications) => void;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Replication Tier</ThemedText>
      <View style={styles.toggleRow}>
        {REPLICATION_OPTIONS.map((opt) => {
          const isSelected = replications === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: isSelected ? ACCENT + '15' : colors.backgroundTertiary,
                  borderColor: isSelected ? ACCENT : colors.border,
                  flex: 1,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setReplications(opt.key);
              }}
            >
              <ThemedText style={[styles.toggleText, { color: isSelected ? ACCENT : colors.textSecondary }]}>
                {opt.label}
              </ThemedText>
              <ThemedText style={[styles.repCount, { color: isSelected ? ACCENT + 'AA' : colors.textTertiary }]}>
                {opt.count}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Summary + Run
// ---------------------------------------------------------------------------

function SummaryCard({
  selectedType,
  opponent,
  location,
  roster,
  tempo,
  replications,
  colors,
}: {
  selectedType: SimType;
  opponent: string;
  location: SimLocation;
  roster: RosterSelection;
  tempo: Tempo;
  replications: Replications;
  colors: typeof Colors.light;
}) {
  const typeCard = SIM_TYPE_CARDS.find((c) => c.id === selectedType);
  const repOption = REPLICATION_OPTIONS.find((r) => r.key === replications);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SummaryRow label="Type" value={typeCard?.name ?? selectedType} colors={colors} />
      <SummaryRow label="Opponent" value={opponent || 'None selected'} colors={colors} />
      <SummaryRow label="Location" value={location.charAt(0).toUpperCase() + location.slice(1)} colors={colors} />
      <SummaryRow label="Roster" value={roster.charAt(0).toUpperCase() + roster.slice(1)} colors={colors} />
      <SummaryRow label="Tempo" value={tempo.charAt(0).toUpperCase() + tempo.slice(1)} colors={colors} />
      <SummaryRow label="Replications" value={`${repOption?.label} (${repOption?.count})`} colors={colors} />
    </View>
  );
}

function SummaryRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
      <ThemedText style={[styles.summaryValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Inline Mock Result
// ---------------------------------------------------------------------------

function InlineResult({ result, colors }: { result: MockResult; colors: typeof Colors.light }) {
  const winColor = result.winProbability >= 55 ? Brand.success : result.winProbability >= 45 ? ACCENT : Brand.error;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.resultHeader, { color: colors.text }]}>Simulation Result</ThemedText>

      {/* Win % */}
      <View style={styles.winProbRow}>
        <ThemedText style={[styles.winProbValue, { color: winColor }]}>{result.winProbability}%</ThemedText>
        <View style={[styles.winProbBarBg, { backgroundColor: colors.backgroundTertiary }]}>
          <View style={[styles.winProbBarFill, { width: `${result.winProbability}%`, backgroundColor: winColor }]} />
        </View>
      </View>

      {/* Score */}
      <View style={styles.resultScoreRow}>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Score</ThemedText>
          <ThemedText style={styles.scoreValue}>
            {result.projectedScore.home} – {result.projectedScore.away}
          </ThemedText>
        </View>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Confidence</ThemedText>
          <View style={[styles.confidenceBadge, { backgroundColor: Brand.precision + '20' }]}>
            <ThemedText style={[styles.confidenceBadgeText, { color: Brand.precision }]}>
              {result.confidence}% — {result.confidenceLabel}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Drivers */}
      {result.drivers.length > 0 && (
        <View style={[styles.resultDrivers, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
            Key Drivers
          </ThemedText>
          {result.drivers.map((d, i) => (
            <View key={i} style={styles.driverRow}>
              <View style={[styles.driverDot, { backgroundColor: Brand.precision }]} />
              <ThemedText style={[styles.driverText, { color: colors.textSecondary }]}>{d}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ScenarioBuilder (main export)
// ---------------------------------------------------------------------------

export function ScenarioBuilder() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [selectedType, setSelectedType] = useState<SimType | null>(null);
  const [opponent, setOpponent] = useState('');
  const [location, setLocation] = useState<SimLocation>('home');
  const [roster, setRoster] = useState<RosterSelection>('official');
  const [tempo, setTempo] = useState<Tempo>('moderate');
  const [replications, setReplications] = useState<Replications>('standard');
  const [result, setResult] = useState<MockResult | null>(null);

  const handleRun = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Generate mock result
    const winProb = Math.floor(Math.random() * 30) + 45;
    const homeScore = Math.floor(Math.random() * 15) + 72;
    const margin = Math.floor((winProb - 50) / 2.5);
    setResult({
      winProbability: winProb,
      projectedScore: { home: homeScore, away: homeScore - margin },
      confidence: Math.floor(Math.random() * 25) + 60,
      confidenceLabel: winProb >= 60 ? 'High' : winProb >= 50 ? 'Medium' : 'Low',
      drivers: [
        'Home court advantage factored in',
        `${opponent || 'Opponent'} recent form analyzed`,
        `${tempo.charAt(0).toUpperCase() + tempo.slice(1)} tempo selected`,
        `${replications === 'deep' ? 'Deep' : replications === 'standard' ? 'Standard' : 'Quick'} replication tier`,
      ],
    });
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Step 1: Select Type */}
      <SectionLabel title="SELECT SIMULATION TYPE" colors={colors} />
      <SimTypeGrid selected={selectedType} onSelect={setSelectedType} colors={colors} />

      {/* Step 2: Base Configuration */}
      {selectedType && (
        <>
          <SectionLabel title="BASE CONFIGURATION" colors={colors} />
          <BaseConfiguration
            opponent={opponent}
            setOpponent={setOpponent}
            location={location}
            setLocation={setLocation}
            roster={roster}
            setRoster={setRoster}
            colors={colors}
          />
        </>
      )}

      {/* Step 3: Overrides */}
      {selectedType && (
        <>
          <SectionLabel title="OVERRIDES" colors={colors} />
          <OverridesSection tempo={tempo} setTempo={setTempo} colors={colors} />
        </>
      )}

      {/* Step 4: Seeds & Replications */}
      {selectedType && (
        <>
          <SectionLabel title="SEEDS & REPLICATIONS" colors={colors} />
          <ReplicationsSection replications={replications} setReplications={setReplications} colors={colors} />
        </>
      )}

      {/* Step 5: Summary + Run */}
      {selectedType && (
        <>
          <SectionLabel title="SUMMARY" colors={colors} />
          <SummaryCard
            selectedType={selectedType}
            opponent={opponent}
            location={location}
            roster={roster}
            tempo={tempo}
            replications={replications}
            colors={colors}
          />

          <Pressable
            style={({ pressed }) => [
              styles.runButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleRun}
          >
            <ThemedText style={styles.runButtonText}>Run Simulation</ThemedText>
          </Pressable>
        </>
      )}

      {/* Inline Result */}
      {result && (
        <>
          <SectionLabel title="RESULT" colors={colors} />
          <InlineResult result={result} colors={colors} />
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },

  // Type Grid (3x3)
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCard: {
    width: '31%',
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  typeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  typeDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  // Fields
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },

  // Chip scroll
  chipScroll: { marginHorizontal: -Spacing.md },
  chipScrollContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  // Toggles
  toggleRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: { fontSize: 13, fontWeight: '600' },
  repCount: { fontSize: 10, marginTop: 2 },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '700' },

  // Run button
  runButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  runButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },

  // Inline Result
  resultHeader: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  winProbRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  winProbValue: { fontSize: 24, fontWeight: '800', width: 56 },
  winProbBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  winProbBarFill: { height: '100%', borderRadius: 4 },
  resultScoreRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  scoreItem: {},
  scoreLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  scoreValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, marginTop: 2 },
  confidenceBadgeText: { fontSize: 12, fontWeight: '700' },
  resultDrivers: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.md, paddingTop: Spacing.sm },

  // Drivers
  driverRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  driverDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
  driverText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
