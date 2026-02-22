/**
 * Donations Screen
 * Athletic giving and booster support for Sports mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// =============================================================================
// MOCK DATA
// =============================================================================

interface DonationTier {
  id: string;
  name: string;
  minAmount: number;
  benefits: string[];
  icon: IconSymbolName;
  isHighlighted?: boolean;
}

interface GivingOpportunity {
  id: string;
  title: string;
  description: string;
  goal?: number;
  raised?: number;
  icon: IconSymbolName;
}

const DONATION_TIERS: DonationTier[] = [
  {
    id: 'blue-gold',
    name: 'Blue & Gold Club',
    minAmount: 100,
    benefits: ['Newsletter updates', 'Recognition on donor wall', 'Booster decal'],
    icon: 'star',
  },
  {
    id: 'lion-pride',
    name: "Lion's Pride",
    minAmount: 500,
    benefits: [
      'All Blue & Gold benefits',
      'Priority ticket access',
      'Exclusive events invitation',
    ],
    icon: 'star.fill',
  },
  {
    id: 'legacy',
    name: 'Legacy Circle',
    minAmount: 1000,
    benefits: [
      "All Lion's Pride benefits",
      'VIP parking',
      'Meet & greet with coaches',
      'Name on championship banner',
    ],
    icon: 'star.circle.fill',
    isHighlighted: true,
  },
  {
    id: 'founders',
    name: "Founder's Society",
    minAmount: 5000,
    benefits: [
      'All Legacy Circle benefits',
      'Private suite access',
      'Annual dinner with AD',
      'Named scholarship opportunity',
    ],
    icon: 'crown.fill',
  },
];

const GIVING_OPPORTUNITIES: GivingOpportunity[] = [
  {
    id: 'scholarship',
    title: 'Athletic Scholarships',
    description: 'Support student-athletes with educational funding',
    goal: 100000,
    raised: 67500,
    icon: 'graduationcap.fill',
  },
  {
    id: 'facilities',
    title: 'Facility Upgrades',
    description: 'Help modernize training and competition venues',
    goal: 250000,
    raised: 112000,
    icon: 'building.2.fill',
  },
  {
    id: 'equipment',
    title: 'Equipment Fund',
    description: 'Provide teams with top-tier equipment',
    goal: 25000,
    raised: 18750,
    icon: 'sportscourt.fill',
  },
  {
    id: 'travel',
    title: 'Team Travel',
    description: 'Fund away games and tournament travel',
    goal: 50000,
    raised: 32000,
    icon: 'airplane',
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

interface TierCardProps {
  tier: DonationTier;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function TierCard({ tier, colors, accentColor, onPress }: TierCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tierCard,
        {
          backgroundColor: colors.card,
          borderColor: tier.isHighlighted ? accentColor : colors.border,
          borderWidth: tier.isHighlighted ? 2 : 1,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {tier.isHighlighted && (
        <View style={[styles.popularBadge, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.popularBadgeText}>Most Popular</ThemedText>
        </View>
      )}
      <View style={[styles.tierIconContainer, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={tier.icon} size={24} color={accentColor} />
      </View>
      <ThemedText style={styles.tierName}>{tier.name}</ThemedText>
      <ThemedText style={[styles.tierAmount, { color: accentColor }]}>
        ${tier.minAmount.toLocaleString()}+
      </ThemedText>
      <View style={styles.tierBenefits}>
        {tier.benefits.slice(0, 3).map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <IconSymbol name="checkmark" size={12} color={accentColor} />
            <ThemedText style={[styles.benefitText, { color: colors.textSecondary }]}>
              {benefit}
            </ThemedText>
          </View>
        ))}
        {tier.benefits.length > 3 && (
          <ThemedText style={[styles.moreBenefits, { color: colors.textTertiary }]}>
            +{tier.benefits.length - 3} more benefits
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

interface OpportunityCardProps {
  opportunity: GivingOpportunity;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function OpportunityCard({ opportunity, colors, accentColor, onPress }: OpportunityCardProps) {
  const progress = opportunity.goal && opportunity.raised
    ? (opportunity.raised / opportunity.goal) * 100
    : 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.opportunityCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.opportunityHeader}>
        <View style={[styles.opportunityIcon, { backgroundColor: accentColor + '15' }]}>
          <IconSymbol name={opportunity.icon} size={20} color={accentColor} />
        </View>
        <View style={styles.opportunityInfo}>
          <ThemedText style={styles.opportunityTitle}>{opportunity.title}</ThemedText>
          <ThemedText style={[styles.opportunityDesc, { color: colors.textSecondary }]}>
            {opportunity.description}
          </ThemedText>
        </View>
      </View>
      {opportunity.goal && opportunity.raised && (
        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: accentColor, width: `${Math.min(progress, 100)}%` },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <ThemedText style={[styles.progressAmount, { color: accentColor }]}>
              ${opportunity.raised.toLocaleString()}
            </ThemedText>
            <ThemedText style={[styles.progressGoal, { color: colors.textTertiary }]}>
              of ${opportunity.goal.toLocaleString()}
            </ThemedText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DonationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.sports;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleTierPress = (tier: DonationTier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, would open donation form or external link
    console.log('Selected tier:', tier.name);
  };

  const handleOpportunityPress = (opportunity: GivingOpportunity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, would open donation form for specific fund
    console.log('Selected opportunity:', opportunity.title);
  };

  const handleDonateNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In production, would open general donation form
    console.log('Open donation form');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Support Carroll Athletics
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Join our booster community
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Impact Statement */}
        <View style={[styles.impactCard, { backgroundColor: modeColors.primary }]}>
          <IconSymbol name="heart.fill" size={32} color="#FFFFFF" />
          <ThemedText style={styles.impactTitle}>Your Impact Matters</ThemedText>
          <ThemedText style={styles.impactText}>
            Every gift helps our student-athletes succeed both on the field and in the classroom.
          </ThemedText>
        </View>

        {/* Giving Tiers */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Giving Levels
          </ThemedText>
          <View style={styles.tiersGrid}>
            {DONATION_TIERS.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                colors={colors}
                accentColor={modeColors.primary}
                onPress={() => handleTierPress(tier)}
              />
            ))}
          </View>
        </View>

        {/* Giving Opportunities */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Giving Opportunities
          </ThemedText>
          <View style={styles.opportunitiesList}>
            {GIVING_OPPORTUNITIES.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                colors={colors}
                accentColor={modeColors.primary}
                onPress={() => handleOpportunityPress(opportunity)}
              />
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="envelope.fill" size={24} color={modeColors.primary} />
          <ThemedText style={styles.contactTitle}>Questions about giving?</ThemedText>
          <ThemedText style={[styles.contactText, { color: colors.textSecondary }]}>
            Contact our Development Office at athletics@carroll.edu
          </ThemedText>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.donateButton,
            { backgroundColor: modeColors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleDonateNow}
        >
          <ThemedText style={styles.donateButtonText}>Donate Now</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 80,
  },

  // Impact Card
  impactCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  impactTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  impactText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Tiers
  tiersGrid: {
    gap: Spacing.sm,
  },
  tierCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: BorderRadius.md,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tierIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  tierName: {
    fontSize: 17,
    fontWeight: '600',
  },
  tierAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  tierBenefits: {
    marginTop: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  benefitText: {
    fontSize: 13,
    flex: 1,
  },
  moreBenefits: {
    fontSize: 12,
    marginTop: 4,
  },

  // Opportunities
  opportunitiesList: {
    gap: Spacing.sm,
  },
  opportunityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  opportunityIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  opportunityInfo: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  opportunityDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  progressSection: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  progressAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressGoal: {
    fontSize: 13,
  },

  // Contact
  contactCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  contactText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  donateButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
