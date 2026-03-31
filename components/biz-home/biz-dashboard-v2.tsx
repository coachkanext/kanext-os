/**
 * Biz Dashboard V2 — Executive Dashboard (Single-Scroll)
 *
 * 5 blocks: Hero Video, Primary Focus Card, Capital Snapshot,
 *           People Snapshot, Domain Grid (2×3)
 *
 * Follows the same visual rhythm as Sports/Church home dashboards.
 * Rendering Context: Founder / CEO (B1)
 * Minimal, calm, no fake metrics, no artificial health bars.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';

const ACCENT = MODE_ACCENT.business;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const HERO = {
  title: 'Meridian Ventures — Seed Round Update',
  subtitle: 'Founder Brief · Feb 2026',
  badge: 'UPDATE' as 'LIVE' | 'UPDATE' | 'ANNOUNCEMENT' | 'INVESTOR',
};

const BADGE_COLORS: Record<string, string> = {
  LIVE: '#B85C5C',
  UPDATE: ACCENT,
  ANNOUNCEMENT: '#B8943E',
  INVESTOR: '#5A8A6E',
};

const FOCUS = {
  priority: 'Raising Seed Round',
  context: 'Targeting $2M seed with 3 leads in due diligence. Deck updated this week.',
  updatedDaysAgo: 2,
};

const CAPITAL = {
  cash: 1_200_000,
  committedObligations: 340_000,
  netPosition: 860_000,
};

const PEOPLE = {
  total: 18,
  executiveRolesFilled: 3,
  executiveRolesOpen: 1,
  openCriticalRoles: 2,
};

interface DomainCard {
  label: string;
  icon: string;
  target: string;
}

const DOMAIN_CARDS: DomainCard[] = [
  { label: 'Program', icon: 'building.2.fill', target: 'Program' },
  { label: 'People', icon: 'person.2.fill', target: 'People' },
  { label: 'Finance', icon: 'dollarsign.circle.fill', target: 'Finance' },
  { label: 'Compliance', icon: 'shield.checkmark.fill', target: 'Compliance' },
  { label: 'Facilities', icon: 'mappin.and.ellipse', target: 'Facilities' },
  { label: 'Ledger', icon: 'doc.text.fill', target: 'Ledger' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.md * 2 - 10) / 2;

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizDashboardV2({ colors, accent }: Props) {
  const badgeColor = BADGE_COLORS[HERO.badge] ?? ACCENT;
  const badgePulse = HERO.badge === 'LIVE';

  const handleNav = (target: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigation to org tabs — placeholder
  };

  return (
    <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      {/* ── BLOCK 1 — Hero Video ────────────────────────────────────── */}
      <View style={s.videoHero}>
        <LinearGradient
          colors={['#0B0F14', '#0B0F14', '#0B0F14']}
          style={s.heroGradient}
        >
          {/* Play Button */}
          <Pressable style={s.heroPlayButton}>
            <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* Badge Pill */}
          <View style={[s.heroBadge, { backgroundColor: badgeColor }]}>
            {badgePulse && <View style={s.heroBadgeDot} />}
            <ThemedText style={s.heroBadgeText}>{HERO.badge}</ThemedText>
          </View>

          {/* Text Block */}
          <View style={s.heroTextBlock}>
            <ThemedText style={s.heroTitle} numberOfLines={2}>{HERO.title}</ThemedText>
            <ThemedText style={s.heroSubtitle} numberOfLines={2}>{HERO.subtitle}</ThemedText>
          </View>
        </LinearGradient>
      </View>

      {/* ── BLOCK 2 — Primary Focus Card ────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [s.focusCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.85 }]}
        onPress={() => handleNav('Program')}
      >
        <ThemedText style={[s.focusLabel, { color: colors.textSecondary }]}>CURRENT FOCUS</ThemedText>
        <ThemedText style={[s.focusPriority, { color: colors.text }]}>{FOCUS.priority}</ThemedText>
        {FOCUS.context ? (
          <ThemedText style={[s.focusContext, { color: colors.textSecondary }]} numberOfLines={2}>
            {FOCUS.context}
          </ThemedText>
        ) : null}
        <View style={s.focusFooter}>
          <ThemedText style={[s.focusUpdated, { color: colors.textTertiary }]}>
            Updated {FOCUS.updatedDaysAgo} day{FOCUS.updatedDaysAgo !== 1 ? 's' : ''} ago
          </ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </View>
      </Pressable>

      {/* ── BLOCK 3 — Capital Snapshot ──────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [s.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.85 }]}
        onPress={() => handleNav('Finance')}
      >
        <ThemedText style={[s.snapshotLabel, { color: colors.textSecondary }]}>CAPITAL</ThemedText>
        <View style={s.capitalRow}>
          <View style={s.capitalCell}>
            <ThemedText style={[s.capitalValue, { color: colors.text }]}>{formatCurrency(CAPITAL.cash)}</ThemedText>
            <ThemedText style={[s.capitalMeta, { color: colors.textSecondary }]}>Cash</ThemedText>
          </View>
          <View style={s.capitalCell}>
            <ThemedText style={[s.capitalValue, { color: colors.text }]}>{formatCurrency(CAPITAL.committedObligations)}</ThemedText>
            <ThemedText style={[s.capitalMeta, { color: colors.textSecondary }]}>Committed</ThemedText>
          </View>
          <View style={s.capitalCell}>
            <ThemedText style={[s.capitalValue, { color: accent }]}>{formatCurrency(CAPITAL.netPosition)}</ThemedText>
            <ThemedText style={[s.capitalMeta, { color: colors.textSecondary }]}>Net Position</ThemedText>
          </View>
        </View>
      </Pressable>

      {/* ── BLOCK 4 — People Snapshot ──────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [s.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.85 }]}
        onPress={() => handleNav('People')}
      >
        <ThemedText style={[s.snapshotLabel, { color: colors.textSecondary }]}>PEOPLE</ThemedText>
        <View style={s.peopleRow}>
          <View style={s.peoplePrimary}>
            <ThemedText style={[s.peopleTotalValue, { color: colors.text }]}>{PEOPLE.total}</ThemedText>
            <ThemedText style={[s.capitalMeta, { color: colors.textSecondary }]}>Total People</ThemedText>
          </View>
          <View style={s.peopleCells}>
            <View style={s.peopleStat}>
              <ThemedText style={[s.peopleStatValue, { color: colors.text }]}>
                {PEOPLE.executiveRolesFilled}/{PEOPLE.executiveRolesFilled + PEOPLE.executiveRolesOpen}
              </ThemedText>
              <ThemedText style={[s.capitalMeta, { color: colors.textSecondary }]}>Exec Filled</ThemedText>
            </View>
            <View style={s.peopleStat}>
              <ThemedText style={[s.peopleStatValue, { color: PEOPLE.openCriticalRoles > 0 ? '#B8943E' : colors.text }]}>
                {PEOPLE.openCriticalRoles}
              </ThemedText>
              <ThemedText style={[s.capitalMeta, { color: colors.textSecondary }]}>Open Critical</ThemedText>
            </View>
          </View>
        </View>
      </Pressable>

      {/* ── BLOCK 5 — Domain Grid (2×3) ─────────────────────────────── */}
      <View style={s.domainGrid}>
        {DOMAIN_CARDS.map((card) => (
          <Pressable
            key={card.label}
            style={({ pressed }) => [
              s.domainGridCard,
              { backgroundColor: colors.card, borderColor: colors.border, width: CARD_WIDTH },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleNav(card.target)}
          >
            <View style={[s.domainGridIcon, { backgroundColor: `${accent}18` }]}>
              <IconSymbol name={card.icon as any} size={16} color={accent} />
            </View>
            <ThemedText style={[s.domainGridTitle, { color: colors.text }]} numberOfLines={1}>
              {card.label}
            </ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scrollContent: { paddingTop: 8 },

  // ── Block 1: Video Hero (matches Sports pattern) ──
  videoHero: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroGradient: {
    aspectRatio: 16 / 9,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  heroPlayButton: {
    position: 'absolute',
    top: '35%',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTextBlock: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },

  // ── Block 2: Focus Card ──
  focusCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  focusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  focusPriority: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  focusContext: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  focusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusUpdated: {
    fontSize: 11,
  },

  // ── Block 3 & 4: Snapshot Cards ──
  snapshotCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  snapshotLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Capital
  capitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capitalCell: {
    alignItems: 'center',
    flex: 1,
  },
  capitalValue: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  capitalMeta: {
    fontSize: 10,
    marginTop: 3,
  },

  // People
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  peoplePrimary: {
    alignItems: 'center',
  },
  peopleTotalValue: {
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    lineHeight: 36,
  },
  peopleCells: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  peopleStat: {
    alignItems: 'center',
  },
  peopleStatValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // ── Block 5: Domain Grid (matches Sports pattern) ──
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  domainGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  domainGridIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainGridTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
