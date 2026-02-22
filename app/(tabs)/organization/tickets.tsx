/**
 * Tickets Screen
 * Athletic event ticketing for Sports mode.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
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

type TicketType = 'single' | 'season' | 'package';

interface TicketOption {
  id: string;
  type: TicketType;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  icon: IconSymbolName;
  isPopular?: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  sport: string;
  ticketsAvailable: boolean;
  priceRange: { min: number; max: number };
}

const TICKET_OPTIONS: TicketOption[] = [
  {
    id: 'single-ga',
    type: 'single',
    name: 'General Admission',
    description: 'Single game access',
    price: 15,
    features: ['Entry to one game', 'General seating'],
    icon: 'ticket',
  },
  {
    id: 'single-reserved',
    type: 'single',
    name: 'Reserved Seating',
    description: 'Premium single game',
    price: 25,
    features: ['Entry to one game', 'Reserved seat', 'Program included'],
    icon: 'ticket.fill',
  },
  {
    id: 'season-pass',
    type: 'season',
    name: 'Season Pass',
    description: 'All home games',
    price: 150,
    originalPrice: 200,
    features: [
      'All regular season home games',
      'Priority seating',
      '25% savings',
      'Transferable tickets',
    ],
    icon: 'calendar',
    isPopular: true,
  },
  {
    id: 'family-pack',
    type: 'package',
    name: 'Family Pack',
    description: '4 tickets + concessions',
    price: 75,
    originalPrice: 100,
    features: [
      '4 general admission tickets',
      '$20 concession credit',
      'Kids activity pack',
      'Photo opportunity',
    ],
    icon: 'person.3.fill',
  },
];

const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'event-1',
    title: "Men's Basketball vs State",
    opponent: 'State University',
    date: 'Feb 15',
    time: '7:00 PM',
    venue: 'KaNeXT Arena',
    sport: 'Basketball',
    ticketsAvailable: true,
    priceRange: { min: 15, max: 35 },
  },
  {
    id: 'event-2',
    title: "Women's Basketball vs Central",
    opponent: 'Central College',
    date: 'Feb 17',
    time: '5:00 PM',
    venue: 'KaNeXT Arena',
    sport: 'Basketball',
    ticketsAvailable: true,
    priceRange: { min: 10, max: 25 },
  },
  {
    id: 'event-3',
    title: 'Baseball vs Northern',
    opponent: 'Northern University',
    date: 'Mar 1',
    time: '2:00 PM',
    venue: 'Wolves Field',
    sport: 'Baseball',
    ticketsAvailable: true,
    priceRange: { min: 8, max: 20 },
  },
  {
    id: 'event-4',
    title: "Men's Basketball vs Metro",
    opponent: 'Metro State',
    date: 'Mar 5',
    time: '7:30 PM',
    venue: 'KaNeXT Arena',
    sport: 'Basketball',
    ticketsAvailable: false,
    priceRange: { min: 20, max: 45 },
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

interface TicketCardProps {
  option: TicketOption;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function TicketCard({ option, colors, accentColor, onPress }: TicketCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ticketCard,
        {
          backgroundColor: colors.card,
          borderColor: option.isPopular ? accentColor : colors.border,
          borderWidth: option.isPopular ? 2 : 1,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {option.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.popularBadgeText}>Best Value</ThemedText>
        </View>
      )}
      <View style={styles.ticketHeader}>
        <View style={[styles.ticketIcon, { backgroundColor: accentColor + '15' }]}>
          <IconSymbol name={option.icon} size={20} color={accentColor} />
        </View>
        <View style={styles.ticketInfo}>
          <ThemedText style={styles.ticketName}>{option.name}</ThemedText>
          <ThemedText style={[styles.ticketDesc, { color: colors.textSecondary }]}>
            {option.description}
          </ThemedText>
        </View>
        <View style={styles.ticketPricing}>
          {option.originalPrice && (
            <ThemedText style={[styles.originalPrice, { color: colors.textTertiary }]}>
              ${option.originalPrice}
            </ThemedText>
          )}
          <ThemedText style={[styles.ticketPrice, { color: accentColor }]}>
            ${option.price}
          </ThemedText>
        </View>
      </View>
      <View style={styles.ticketFeatures}>
        {option.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={accentColor} />
            <ThemedText style={[styles.featureText, { color: colors.textSecondary }]}>
              {feature}
            </ThemedText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

interface EventRowProps {
  event: UpcomingEvent;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function EventRow({ event, colors, accentColor, onPress }: EventRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventRow,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      disabled={!event.ticketsAvailable}
    >
      <View style={styles.eventDate}>
        <ThemedText style={[styles.eventDateText, { color: accentColor }]}>
          {event.date.split(' ')[0]}
        </ThemedText>
        <ThemedText style={[styles.eventDateDay, { color: colors.textSecondary }]}>
          {event.date.split(' ')[1]}
        </ThemedText>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </ThemedText>
        <ThemedText style={[styles.eventDetails, { color: colors.textSecondary }]}>
          {event.time} @ {event.venue}
        </ThemedText>
      </View>
      <View style={styles.eventTickets}>
        {event.ticketsAvailable ? (
          <>
            <ThemedText style={[styles.eventPrice, { color: accentColor }]}>
              ${event.priceRange.min}+
            </ThemedText>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </>
        ) : (
          <View style={[styles.soldOutBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.soldOutText, { color: colors.textTertiary }]}>
              Sold Out
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// FILTER TABS
// =============================================================================

type FilterTab = 'all' | 'basketball' | 'baseball';

interface FilterTabsProps {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function FilterTabs({ active, onChange, colors, accentColor }: FilterTabsProps) {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Sports' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'baseball', label: 'Baseball' },
  ];

  return (
    <View style={styles.filterTabs}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          style={[
            styles.filterTab,
            {
              backgroundColor: active === tab.id ? accentColor : colors.backgroundSecondary,
            },
          ]}
          onPress={() => onChange(tab.id)}
        >
          <ThemedText
            style={[
              styles.filterTabText,
              { color: active === tab.id ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {tab.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TicketsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.sports;

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredEvents = UPCOMING_EVENTS.filter((event) => {
    if (activeFilter === 'all') return true;
    return event.sport.toLowerCase() === activeFilter;
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleTicketPress = (option: TicketOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, would open purchase flow
    console.log('Selected ticket:', option.name);
  };

  const handleEventPress = (event: UpcomingEvent) => {
    if (!event.ticketsAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, would navigate to event ticket purchase
    console.log('Selected event:', event.title);
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
            Tickets
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            KaNeXT Athletics
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticket Options */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Ticket Options
          </ThemedText>
          <View style={styles.ticketsList}>
            {TICKET_OPTIONS.map((option) => (
              <TicketCard
                key={option.id}
                option={option}
                colors={colors}
                accentColor={modeColors.primary}
                onPress={() => handleTicketPress(option)}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Upcoming Events
          </ThemedText>
          <FilterTabs
            active={activeFilter}
            onChange={setActiveFilter}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <View style={styles.eventsList}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  colors={colors}
                  accentColor={modeColors.primary}
                  onPress={() => handleEventPress(event)}
                />
              ))
            ) : (
              <View style={styles.emptyEvents}>
                <IconSymbol name="calendar.badge.exclamationmark" size={32} color={colors.textTertiary} />
                <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No upcoming events for this sport
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Box Office Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <IconSymbol name="info.circle.fill" size={20} color={modeColors.primary} />
            <ThemedText style={styles.infoTitle}>Box Office</ThemedText>
          </View>
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            Tickets also available at the venue on game day (subject to availability).
            Box office opens 1 hour before events.
          </ThemedText>
          <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.infoRow}>
            <IconSymbol name="phone.fill" size={16} color={colors.textTertiary} />
            <ThemedText style={[styles.infoValue, { color: colors.textSecondary }]}>
              (555) 123-4567
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="envelope.fill" size={16} color={colors.textTertiary} />
            <ThemedText style={[styles.infoValue, { color: colors.textSecondary }]}>
              tickets@kanext.edu
            </ThemedText>
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

  // Ticket Cards
  ticketsList: {
    gap: Spacing.sm,
  },
  ticketCard: {
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
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ticketDesc: {
    fontSize: 13,
    marginTop: 1,
  },
  ticketPricing: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  ticketFeatures: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  featureText: {
    fontSize: 13,
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Events
  eventsList: {
    gap: Spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  eventDate: {
    width: 44,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  eventDateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  eventDateDay: {
    fontSize: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  eventDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  eventTickets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  soldOutBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  soldOutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
  },

  // Info Card
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 13,
  },
});
