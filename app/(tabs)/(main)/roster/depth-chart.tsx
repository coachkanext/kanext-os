import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Slot = 'Starter' | 'Backup' | 'Third String';

interface Player {
  id: string;
  name: string;
  jersey: number;
  classYear: 'Fr' | 'So' | 'Jr' | 'Sr';
  kr: number;
  hue: string;
}

interface PositionGroupData {
  abbr: string;
  label: string;
  slots: [Player | null, Player | null, Player | null];
}

interface LineupConfig {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// KR tier color helper
// ---------------------------------------------------------------------------

function krColor(kr: number, C: ComponentColors): string {
  if (kr >= 80) return '#B8943E';
  if (kr >= 75) return '#5A8A6E';
  if (kr >= 65) return C.secondary;
  return '#B85C5C';
}

// ---------------------------------------------------------------------------
// Player hue palette
// ---------------------------------------------------------------------------

const HUE_PALETTE = [
  '#8B7355',
  '#6B8C7A',
  '#7A6B8C',
  '#8C7A6B',
  '#6B7A8C',
  '#8C6B7A',
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const POSITION_GROUPS: PositionGroupData[] = [
  {
    abbr: 'PG',
    label: 'Point Guard',
    slots: [
      { id: 'pg1', name: 'Marcus Johnson', jersey: 3,  classYear: 'Sr', kr: 84, hue: HUE_PALETTE[0] },
      { id: 'pg2', name: 'Devon Williams',  jersey: 11, classYear: 'So', kr: 76, hue: HUE_PALETTE[1] },
      null,
    ],
  },
  {
    abbr: 'SG',
    label: 'Shooting Guard',
    slots: [
      { id: 'sg1', name: 'Isaiah Carter',  jersey: 22, classYear: 'Jr', kr: 78, hue: HUE_PALETTE[2] },
      { id: 'sg2', name: 'Tre Robinson',   jersey: 5,  classYear: 'Fr', kr: 68, hue: HUE_PALETTE[3] },
      { id: 'sg3', name: 'Malik Peters',   jersey: 33, classYear: 'Fr', kr: 61, hue: HUE_PALETTE[4] },
    ],
  },
  {
    abbr: 'SF',
    label: 'Small Forward',
    slots: [
      { id: 'sf1', name: 'Jordan Hayes',   jersey: 4,  classYear: 'Jr', kr: 79, hue: HUE_PALETTE[5] },
      { id: 'sf2', name: 'Andre Thompson', jersey: 14, classYear: 'So', kr: 73, hue: HUE_PALETTE[0] },
      null,
    ],
  },
  {
    abbr: 'PF',
    label: 'Power Forward',
    slots: [
      { id: 'pf1', name: 'Chris Williams', jersey: 23, classYear: 'Sr', kr: 71, hue: HUE_PALETTE[1] },
      { id: 'pf2', name: 'Brandon Lee',    jersey: 31, classYear: 'So', kr: 66, hue: HUE_PALETTE[2] },
      null,
    ],
  },
  {
    abbr: 'C',
    label: 'Center',
    slots: [
      { id: 'c1', name: 'Tyrone Davis',  jersey: 50, classYear: 'Jr', kr: 82, hue: HUE_PALETTE[3] },
      { id: 'c2', name: 'Sam Mitchell',  jersey: 42, classYear: 'So', kr: 75, hue: HUE_PALETTE[4] },
      null,
    ],
  },
];

const SLOT_LABELS: Slot[] = ['Starter', 'Backup', 'Third String'];

const LINEUP_CONFIGS: LineupConfig[] = [
  { id: 'full',  name: 'Full Strength', subtitle: '5 players', icon: 'star.fill' },
  { id: 'press', name: 'Press Defense', subtitle: '5 players', icon: 'bolt.fill' },
  { id: 'zone',  name: 'Zone Offense',  subtitle: '5 players', icon: 'square.grid.2x2.fill' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PlayerCard({
  player,
  slotLabel,
  whatIf,
  C,
  s,
  onPress,
}: {
  player: Player;
  slotLabel: Slot;
  whatIf: boolean;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  const tierColor = krColor(player.kr, C);

  return (
    <Pressable
      onPress={whatIf ? onPress : undefined}
      style={({ pressed }) => [
        s.playerCard,
        { borderColor: C.separator, backgroundColor: C.surface },
        whatIf && pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[s.tierStripe, { backgroundColor: tierColor }]} />
      <View style={[s.initialsCircle, { backgroundColor: player.hue }]}>
        <Text style={s.initialsText}>{getInitials(player.name)}</Text>
      </View>
      <View style={s.playerInfo}>
        <View style={s.playerNameRow}>
          <Text style={[s.playerName, { color: C.label }]} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={[s.jerseyText, { color: C.secondary }]}>#{player.jersey}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <Text style={[s.classText, { color: C.secondary }]}>{player.classYear}</Text>
          <View style={[s.krBadge, { borderColor: tierColor }]}>
            <Text style={[s.krText, { color: tierColor }]}>{player.kr}</Text>
          </View>
        </View>
      </View>
      <Text style={[s.slotLabel, { color: C.secondary }]}>{slotLabel}</Text>
      {whatIf && (
        <View style={s.swapIcon}>
          <IconSymbol name="arrow.up.arrow.down" size={12} color={C.secondary} />
        </View>
      )}
    </Pressable>
  );
}

function EmptySlotCard({
  slotLabel,
  C,
  s,
  whatIf,
  onPress,
}: {
  slotLabel: Slot;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  whatIf: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={whatIf ? onPress : undefined}
      style={({ pressed }) => [
        s.emptyCard,
        { borderColor: C.separator, backgroundColor: C.bg },
        whatIf && pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[s.emptySlotLabel, { color: C.separator }]}>{slotLabel}</Text>
      <Text style={[s.openSlotText, { color: C.secondary }]}>Open Slot</Text>
      {whatIf && <IconSymbol name="plus" size={14} color={C.secondary} />}
    </Pressable>
  );
}

function PositionGroup({
  group,
  whatIf,
  C,
  s,
}: {
  group: PositionGroupData;
  whatIf: boolean;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  function handleSlotPress(slotLabel: Slot, player: Player | null) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const title = player
      ? `Swap ${player.name} (${slotLabel})`
      : `Fill ${group.abbr} ${slotLabel}`;
    Alert.alert(title, 'Select a player from the roster to place in this slot.', [
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={s.positionGroup}>
      <View style={[s.groupHeader, { borderBottomColor: C.separator }]}>
        <Text style={[s.groupAbbr, { color: C.label }]}>{group.abbr}</Text>
        <Text style={[s.groupLabel, { color: C.secondary }]}>{group.label}</Text>
      </View>
      <View style={s.slotsContainer}>
        {SLOT_LABELS.map((slotLabel, idx) => {
          const player = group.slots[idx];
          if (player) {
            return (
              <PlayerCard
                key={slotLabel}
                player={player}
                slotLabel={slotLabel}
                whatIf={whatIf}
                C={C}
                s={s}
                onPress={() => handleSlotPress(slotLabel, player)}
              />
            );
          }
          return (
            <EmptySlotCard
              key={slotLabel}
              slotLabel={slotLabel}
              C={C}
              s={s}
              whatIf={whatIf}
              onPress={() => handleSlotPress(slotLabel, null)}
            />
          );
        })}
      </View>
    </View>
  );
}

function LineupConfigCard({
  config,
  C,
  s,
}: {
  config: LineupConfig;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      config.name,
      `Apply the "${config.name}" lineup configuration to your active roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => Alert.alert('Applied', `"${config.name}" lineup is now active.`),
        },
      ],
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        s.lineupCard,
        { backgroundColor: C.surface, borderColor: C.separator },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[s.lineupIconBox, { backgroundColor: C.bg, borderColor: C.separator }]}>
        <IconSymbol name={config.icon as any} size={28} color={C.label} />
      </View>
      <Text style={[s.lineupName, { color: C.label }]} numberOfLines={2}>
        {config.name}
      </Text>
      <Text style={[s.lineupSubtitle, { color: C.secondary }]}>{config.subtitle}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    topBarSide: { width: 36, alignItems: 'center', justifyContent: 'center' },
    titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    whatIfBtn: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: StyleSheet.hairlineWidth,
    },
    whatIfText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },

    scrollContent: { paddingHorizontal: 16 },

    positionGroup: { marginBottom: 24 },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      marginBottom: 10,
    },
    groupAbbr: { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
    groupLabel: { fontSize: 13, fontWeight: '400' },
    slotsContainer: { gap: 8 },

    playerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
      paddingRight: 12,
      minHeight: 62,
    },
    tierStripe: { width: 4, alignSelf: 'stretch', marginRight: 10 },
    initialsCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    initialsText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
    playerInfo: { flex: 1, justifyContent: 'center', gap: 3 },
    playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    playerName: { fontSize: 14, fontWeight: '600', flex: 1 },
    jerseyText: { fontSize: 12, fontWeight: '500' },
    playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    classText: { fontSize: 12, fontWeight: '400' },
    krBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
    krText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
    slotLabel: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      marginLeft: 6,
      width: 68,
      textAlign: 'right',
    },
    swapIcon: { marginLeft: 6 },

    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
      minHeight: 62,
    },
    emptySlotLabel: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      width: 72,
    },
    openSlotText: { flex: 1, fontSize: 13, fontWeight: '400', fontStyle: 'italic' },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      marginTop: 4,
    },
    sectionTitle: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
    sectionDivider: { flex: 1, height: StyleSheet.hairlineWidth },

    lineupScrollContent: { paddingHorizontal: 16, gap: 12, paddingRight: 32 },
    lineupCard: {
      width: 130,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      alignItems: 'center',
      gap: 8,
    },
    lineupIconBox: {
      width: 64,
      height: 64,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    lineupName: { fontSize: 13, fontWeight: '600', textAlign: 'center', letterSpacing: 0.1 },
    lineupSubtitle: { fontSize: 11, fontWeight: '400' },
    lineupSectionWrapper: { marginBottom: 32 },
  });

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DepthChartScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [whatIf, setWhatIf] = useState(false);
  const s = useMemo(() => makeStyles(C), [C]);
  const scrollFooter = useScrollFooter();
  const TOP_BAR_H2 = 52;
  const topBarH = insets.top + TOP_BAR_H2;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, []),
  );

  function toggleWhatIf() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWhatIf(prev => !prev);
  }

  return (
    <View style={[s.root]}>
      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8} style={s.topBarSide}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Depth Chart</Text>
            </View>
          </View>
          <Pressable
            onPress={toggleWhatIf}
            style={[
              s.whatIfBtn,
              { borderColor: whatIf ? C.activePill : C.separator },
              whatIf && { backgroundColor: C.activePill },
            ]}
            hitSlop={8}
          >
            <Text style={[s.whatIfText, { color: whatIf ? C.activePillText : C.secondary }]}>
              What If
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Body */}
      <ScrollView
        {...scrollFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingTop: topBarH + 8, paddingBottom: insets.bottom + 24 }]}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {POSITION_GROUPS.map(group => (
          <PositionGroup key={group.abbr} group={group} whatIf={whatIf} C={C} s={s} />
        ))}

        {/* Lineup Configurations */}
        <View style={s.lineupSectionWrapper}>
          <View style={[s.sectionHeader, { paddingHorizontal: 0 }]}>
            <Text style={[s.sectionTitle, { color: C.label }]}>Lineup Configurations</Text>
            <View style={[s.sectionDivider, { backgroundColor: C.separator }]} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.lineupScrollContent}
            style={{ marginHorizontal: -16 }}
          >
            {LINEUP_CONFIGS.map(config => (
              <LineupConfigCard key={config.id} config={config} C={C} s={s} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
