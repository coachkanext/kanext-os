/**
 * Connect Screen
 * Ways to connect with the church for Church mode.
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
import { ICC_ORGANIZATION, CAMPUSES } from '@/data/mock-church';

// =============================================================================
// DATA
// =============================================================================

interface ConnectOption {
  id: string;
  title: string;
  description: string;
  icon: IconSymbolName;
  action: 'link' | 'internal';
  url?: string;
  route?: string;
}

const CONNECT_OPTIONS: ConnectOption[] = [
  {
    id: 'visit',
    title: 'Plan Your Visit',
    description: 'Find a campus near you and join us this Sunday',
    icon: 'building.2.fill',
    action: 'internal',
    route: '/organization/campuses',
  },
  {
    id: 'prayer',
    title: 'Prayer Request',
    description: 'Submit a prayer request - our team is here for you',
    icon: 'hands.sparkles.fill',
    action: 'link',
    url: 'https://icc.org/prayer',
  },
  {
    id: 'connect-card',
    title: 'Connect Card',
    description: "Let us know you're here and how we can serve you",
    icon: 'person.crop.circle.badge.plus',
    action: 'link',
    url: 'https://icc.org/connect',
  },
  {
    id: 'baptism',
    title: 'Baptism',
    description: 'Take your next step of faith through baptism',
    icon: 'drop.fill',
    action: 'link',
    url: 'https://icc.org/baptism',
  },
  {
    id: 'membership',
    title: 'Become a Member',
    description: 'Learn about membership and join our church family',
    icon: 'person.3.fill',
    action: 'link',
    url: 'https://icc.org/membership',
  },
  {
    id: 'groups',
    title: 'Small Groups',
    description: 'Find community in a small group near you',
    icon: 'person.2.fill',
    action: 'link',
    url: 'https://icc.org/groups',
  },
];

const SOCIAL_LINKS = [
  { id: 'facebook', icon: 'globe' as IconSymbolName, label: 'Facebook', url: 'https://facebook.com/icc' },
  { id: 'instagram', icon: 'camera.fill' as IconSymbolName, label: 'Instagram', url: 'https://instagram.com/icc' },
  { id: 'youtube', icon: 'play.rectangle.fill' as IconSymbolName, label: 'YouTube', url: 'https://youtube.com/icc' },
  { id: 'twitter', icon: 'bubble.left.fill' as IconSymbolName, label: 'Twitter', url: 'https://twitter.com/icc' },
];

// =============================================================================
// COMPONENTS
// =============================================================================

interface ConnectCardProps {
  option: ConnectOption;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function ConnectCard({ option, colors, accentColor, onPress }: ConnectCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.connectCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.connectIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={option.icon} size={24} color={accentColor} />
      </View>
      <View style={styles.connectContent}>
        <ThemedText style={styles.connectTitle}>{option.title}</ThemedText>
        <ThemedText style={[styles.connectDesc, { color: colors.textSecondary }]}>
          {option.description}
        </ThemedText>
      </View>
      <IconSymbol
        name={option.action === 'link' ? 'arrow.up.right' : 'chevron.right'}
        size={16}
        color={colors.textTertiary}
      />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ConnectScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.church;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleOptionPress = (option: ConnectOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (option.action === 'link' && option.url) {
      Linking.openURL(option.url);
    } else if (option.action === 'internal' && option.route) {
      router.push(option.route as any);
    }
  };

  const handleSocialPress = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
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
            Connect
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            We'd love to meet you
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Message */}
        <View style={[styles.welcomeCard, { backgroundColor: modeColors.primary }]}>
          <ThemedText style={styles.welcomeTitle}>Welcome Home</ThemedText>
          <ThemedText style={styles.welcomeText}>
            {ICC_ORGANIZATION.description}
          </ThemedText>
          <View style={styles.welcomeStats}>
            <View style={styles.welcomeStat}>
              <ThemedText style={styles.welcomeStatValue}>{CAMPUSES.length}</ThemedText>
              <ThemedText style={styles.welcomeStatLabel}>Campuses</ThemedText>
            </View>
            <View style={[styles.welcomeStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.welcomeStat}>
              <ThemedText style={styles.welcomeStatValue}>1985</ThemedText>
              <ThemedText style={styles.welcomeStatLabel}>Founded</ThemedText>
            </View>
          </View>
        </View>

        {/* Connect Options */}
        <View style={styles.connectSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            WAYS TO CONNECT
          </ThemedText>
          {CONNECT_OPTIONS.map((option) => (
            <ConnectCard
              key={option.id}
              option={option}
              colors={colors}
              accentColor={modeColors.primary}
              onPress={() => handleOptionPress(option)}
            />
          ))}
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            FOLLOW US
          </ThemedText>
          <View style={styles.socialGrid}>
            {SOCIAL_LINKS.map((social) => (
              <Pressable
                key={social.id}
                style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSocialPress(social.url)}
              >
                <IconSymbol name={social.icon} size={24} color={modeColors.primary} />
                <ThemedText style={styles.socialLabel}>{social.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.contactCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <ThemedText style={[styles.contactTitle, { color: colors.textSecondary }]}>
            CONTACT US
          </ThemedText>
          <View style={styles.contactRow}>
            <IconSymbol name="phone.fill" size={16} color={modeColors.primary} />
            <ThemedText style={styles.contactText}>(800) ICC-INFO</ThemedText>
          </View>
          <View style={styles.contactRow}>
            <IconSymbol name="envelope.fill" size={16} color={modeColors.primary} />
            <ThemedText style={styles.contactText}>info@icc.org</ThemedText>
          </View>
          <View style={styles.contactRow}>
            <IconSymbol name="globe" size={16} color={modeColors.primary} />
            <ThemedText style={styles.contactText}>www.icc.org</ThemedText>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
  },

  // Welcome Card
  welcomeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  welcomeStats: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeStat: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeStatValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeStatLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  welcomeStatDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Connect Section
  connectSection: {
    marginBottom: Spacing.lg,
  },

  // Connect Card
  connectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  connectIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  connectContent: {
    flex: 1,
  },
  connectTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  connectDesc: {
    fontSize: 13,
    marginTop: 2,
  },

  // Social Section
  socialSection: {
    marginBottom: Spacing.lg,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  socialButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Contact Card
  contactCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  contactTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 14,
  },
});
