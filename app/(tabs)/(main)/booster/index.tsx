/**
 * Sports Mode Booster — LU Men's Basketball
 * Three tabs via centered dropdown pill: Support / NIL / Shop
 * Roles: fan / player / admin — cycle via top-right pill
 *
 * Support tab: Quick Give, Active Campaigns, Tickets, Fan Rewards
 * NIL tab:     Player dashboard / Fan view / Admin compliance
 * Shop tab:    Featured, Category filter, Product grid, Cart FAB
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import {
  BOOSTER_CAMPAIGNS, NIL_OPPORTUNITIES, NIL_DEALS, MERCH_PRODUCTS,
  TICKET_GAMES, FAN_REWARDS, NIL_ACTIVITY, FAN_EXPERIENCES, PLAYERS,
  formatCurrency,
  type NILOpportunity, type MerchProduct, type Player,
  type NILActivity, type FanExperience,
} from '@/data/mock-sports-hub';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const PAYMENT_METHODS = ['Visa •4242', 'Apple Pay', 'KayPay $847'];

// ── Types ─────────────────────────────────────────────────────────────────────

type BoosterTab  = 'Support' | 'NIL' | 'Shop';
type BoosterRole = 'fan' | 'player' | 'admin';

// ── Helpers ───────────────────────────────────────────────────────────────────

function campaignProgress(raised: number, goal: number): number {
  return Math.min(raised / goal, 1);
}

function pillsForTab(tab: BoosterTab): string[] {
  if (tab === 'NIL')  return ['All', 'Approved', 'Pending', 'Flagged'];
  if (tab === 'Shop') return ['All', 'Apparel', 'Headwear', 'Accessories', 'Special'];
  return [];
}

function fundColor(fund: string, C: ComponentColors): string {
  switch (fund) {
    case 'General':      return C.accent;
    case 'Scholarship':  return '#003A63';
    case 'Facilities':   return '#5A8A6E';
    case 'Equipment':    return '#8B6340';
    case 'Travel':       return '#1D9BF0';
    case 'Unrestricted': return C.muted as string;
    default:             return C.accent;
  }
}

function roleLabel(role: BoosterRole): string {
  if (role === 'fan')    return 'Fan';
  if (role === 'player') return 'Player';
  return 'Admin';
}

function nextRole(role: BoosterRole): BoosterRole {
  if (role === 'fan')    return 'player';
  if (role === 'player') return 'admin';
  return 'fan';
}

function dealTypeBadgeColor(type: string, C: ComponentColors): string {
  switch (type) {
    case 'ambassador':  return '#003A63';
    case 'endorsement': return C.accent;
    case 'social-post': return '#1D9BF0';
    case 'appearance':  return '#5A8A6E';
    case 'content':     return '#8B6340';
    default:            return C.muted as string;
  }
}

function nilStatusColor(status: string, C: ComponentColors): string {
  if (status === 'completed' || status === 'approved') return C.green;
  if (status === 'in-progress' || status === 'pending') return '#3B82F6';
  if (status === 'flagged') return C.red;
  return C.secondary as string;
}

function categoryHue(category: string): number {
  switch (category) {
    case 'Apparel':     return 215;
    case 'Headwear':    return 45;
    case 'Accessories': return 130;
    case 'Special':     return 0;
    default:            return 215;
  }
}

function starString(rating: number): string {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '\u2606'.repeat(empty);
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function BoosterScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH = insets.top + TOP_BAR_H;

  // ── Tab & Role ─────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<BoosterTab>('Support');
  const [role,         setRole]         = useState<BoosterRole>('fan');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Pills ──────────────────────────────────────────────────────────────────
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;
  const pills     = useMemo(() => pillsForTab(activeTab), [activeTab]);

  // ── Support / Give ─────────────────────────────────────────────────────────
  const [amount,       setAmount]       = useState('');
  const [selectedFund, setSelectedFund] = useState('General');
  const [frequency,    setFrequency]    = useState<'One-Time' | 'Monthly' | 'Annually'>('One-Time');
  const [paymentIndex, setPaymentIndex] = useState(0);
  const [coverFees,    setCoverFees]    = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);

  // ── NIL ────────────────────────────────────────────────────────────────────
  const [selectedOpportunity,   setSelectedOpportunity]   = useState<NILOpportunity | null>(null);
  const [nilFilter,              setNilFilter]             = useState<'All' | 'Approved' | 'Pending' | 'Flagged'>('All');
  const [showSupportSheet,      setShowSupportSheet]      = useState(false);
  const [supportSelectedPlayer, setSupportSelectedPlayer] = useState<Player | null>(null);
  const [supportAmount,         setSupportAmount]         = useState('');

  // ── Shop ───────────────────────────────────────────────────────────────────
  const [categoryFilter,   setCategoryFilter]   = useState('All');
  const [selectedProduct,  setSelectedProduct]  = useState<MerchProduct | null>(null);
  const [selectedColor,    setSelectedColor]    = useState<string>('');
  const [cartItems,        setCartItems]        = useState<{ id: string; qty: number }[]>([]);
  const [cartSheetVisible, setCartSheetVisible] = useState(false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  // ── Focus effect ───────────────────────────────────────────────────────────
  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Pills animation ────────────────────────────────────────────────────────
  function togglePills() {
    Haptics.selectionAsync();
    const toValue = pillsVisible ? 0 : 1;
    setPillsVisible(!pillsVisible);
    Animated.timing(pillsAnim, { toValue, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: BoosterTab) {
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    setSelectedPill('All');
    const newPills = pillsForTab(tab);
    if (!newPills.length) {
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  function handleCycleRole() {
    Haptics.selectionAsync();
    setRole(prev => nextRole(prev));
    setPillsVisible(false);
    pillsAnim.setValue(0);
  }

  const contentPaddingTop = topBarH + (pillsVisible ? PILL_ROW_H : 0) + 8;

  // ── Give ───────────────────────────────────────────────────────────────────
  function handleGive() {
    if (!amount) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAmount('');
    }, 2000);
  }

  // ── Cart ───────────────────────────────────────────────────────────────────
  function addToCart(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCartItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id, qty: 1 }];
    });
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const filteredProducts = useMemo(
    () =>
      categoryFilter === 'All'
        ? MERCH_PRODUCTS
        : MERCH_PRODUCTS.filter(p => p.category === categoryFilter),
    [categoryFilter],
  );

  const featuredProducts = useMemo(
    () => MERCH_PRODUCTS.filter(p => p.isFeatured),
    [],
  );

  const myDeals = useMemo(
    () => NIL_DEALS.filter(d => d.playerId === 'p01'),
    [],
  );

  // ────────────────────────────────────────────────────────────────────────────
  // SUPPORT TAB
  // ────────────────────────────────────────────────────────────────────────────

  function renderAdminGivingDashboard() {
    return (
      <GlassView tier={1} style={[s.card, { backgroundColor: '#003A63', marginBottom: 16 }]}>
        <Text style={[s.sectionTitle, { color: '#fff', marginBottom: 4 }]}>Giving Dashboard</Text>
        <Text style={[s.adminStatBig, { color: '#fff' }]}>$284,200 raised this year</Text>
        <Text style={[s.bodySmall, { color: 'rgba(255,255,255,0.65)', marginBottom: 12 }]}>
          {'vs $241,000 last year \u00B7 +18% YoY'}
        </Text>
        <View style={s.row}>
          {[
            { label: 'Donors',    value: '1,222' },
            { label: 'Avg Gift',  value: '$232'  },
            { label: 'Retention', value: '94%'   },
          ].map(stat => (
            <View key={stat.label} style={s.adminStatChip}>
              <Text style={s.adminStatChipNum}>{stat.value}</Text>
              <Text style={s.adminStatChipLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <View style={[s.row, { marginTop: 12, flexWrap: 'wrap', gap: 6 }]}>
          {[
            { label: 'Donations', value: '$187K' },
            { label: 'Tickets',   value: '$62K'  },
            { label: 'Merch',     value: '$35K'  },
          ].map(src => (
            <View key={src.label} style={s.revChip}>
              <Text style={s.revChipVal}>{src.value}</Text>
              <Text style={s.revChipLabel}>{src.label}</Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ marginTop: 12 }}
        >
          <Text style={[s.linkText, { color: '#7EB8D4' }]}>{'View Full Report \u2192'}</Text>
        </Pressable>
      </GlassView>
    );
  }

  function renderAdminTicketStats() {
    return (
      <GlassView tier={1} style={[s.card, { marginBottom: 16 }]}>
        <Text style={[s.sectionTitle, { color: C.label }]}>Ticket Management</Text>
        <View style={[s.row, { marginTop: 10, gap: 8 }]}>
          {[
            { label: 'Sold',      value: '1,284'  },
            { label: 'Revenue',   value: '$22.4K' },
            { label: 'Remaining', value: '596'    },
          ].map(stat => (
            <View
              key={stat.label}
              style={[s.adminStatChip, { backgroundColor: C.surfacePressed as string, flex: 1 }]}
            >
              <Text style={[s.adminStatChipNum, { color: C.label }]}>{stat.value}</Text>
              <Text style={[s.adminStatChipLabel, { color: C.secondary as string }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </GlassView>
    );
  }

  function renderQuickGive() {
    const amountNum  = parseFloat(amount) || 0;
    const fee        = amountNum * 0.029 + 0.30;
    const total      = coverFees && amountNum > 0 ? amountNum + fee : amountNum;
    const FUNDS_LIST = ['General', 'Scholarship', 'Facilities', 'Equipment', 'Travel', 'Unrestricted'];
    const FREQS_LIST = ['One-Time', 'Monthly', 'Annually'] as const;

    return (
      <GlassView tier={1} style={[s.card, { marginBottom: 16 }]}>
        {/* Large amount input */}
        <View style={s.amountRow}>
          <Text style={[s.dollarSign, { color: amount ? C.label : (C.muted as string) }]}>$</Text>
          <TextInput
            style={[s.amountInput, { color: C.label }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.muted as string}
            returnKeyType="done"
          />
        </View>

        {/* Fund pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
        >
          {FUNDS_LIST.map(fund => {
            const isActive = selectedFund === fund;
            const fc       = fundColor(fund, C);
            return (
              <Pressable
                key={fund}
                onPress={() => { Haptics.selectionAsync(); setSelectedFund(fund); }}
                style={[
                  s.fundPill,
                  {
                    borderColor:     isActive ? fc : (C.inputBorder as string),
                    backgroundColor: isActive ? fc : 'transparent',
                  },
                ]}
              >
                <Text style={[s.fundPillText, { color: isActive ? '#fff' : (C.secondary as string) }]}>
                  {fund}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Frequency pills */}
        <View style={[s.row, { marginTop: 12, gap: 8 }]}>
          {FREQS_LIST.map(freq => {
            const isActive = frequency === freq;
            return (
              <Pressable
                key={freq}
                onPress={() => { Haptics.selectionAsync(); setFrequency(freq); }}
                style={[
                  s.freqPill,
                  {
                    borderColor:     isActive ? C.accent : (C.inputBorder as string),
                    backgroundColor: isActive ? C.accent : 'transparent',
                    flex: 1,
                  },
                ]}
              >
                <Text style={[s.freqPillText, { color: isActive ? '#fff' : (C.secondary as string) }]}>
                  {freq}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Payment method cycle row */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setPaymentIndex(prev => (prev + 1) % PAYMENT_METHODS.length);
          }}
          style={[s.paymentRow, { borderColor: C.inputBorder as string }]}
        >
          <IconSymbol name="creditcard" size={16} color={C.secondary as string} />
          <Text style={[s.paymentLabel, { color: C.label }]}>
            {PAYMENT_METHODS[paymentIndex]}
          </Text>
          <Text style={[s.paymentTap, { color: C.secondary as string }]}>Tap to change</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
        </Pressable>

        {/* Cover fees toggle */}
        {amountNum > 0 && (
          <View style={[s.coverFeesRow, { borderTopColor: C.separator as string }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.coverFeesLabel, { color: C.label }]}>Cover the Fees</Text>
              <Text style={[s.coverFeesSub, { color: C.secondary as string }]}>
                Add ${fee.toFixed(2)} so 100% goes to the Lions
              </Text>
            </View>
            <Switch
              value={coverFees}
              onValueChange={v => { Haptics.selectionAsync(); setCoverFees(v); }}
              trackColor={{ false: C.surfacePressed as string, true: C.accent }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Give button */}
        <Pressable
          onPress={handleGive}
          style={[
            s.giveBtn,
            {
              backgroundColor: showSuccess ? C.green : C.accent,
              opacity:          amountNum > 0 ? 1 : 0.5,
            },
          ]}
        >
          <Text style={s.giveBtnText}>
            {showSuccess
              ? '\u2713  Thank you, Lion Fan!'
              : amountNum > 0
                ? `Support Lions Basketball \u00B7 ${formatCurrency(total)}`
                : 'Support Lions Basketball'}
          </Text>
        </Pressable>
      </GlassView>
    );
  }

  function renderCampaigns() {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Active Campaigns</Text>
        {BOOSTER_CAMPAIGNS.map(campaign => {
          const pct = campaignProgress(campaign.raised, campaign.goal);
          return (
            <GlassView tier={1} key={campaign.id} style={[s.card, { marginBottom: 12 }]}>
              <Text style={[s.campaignName, { color: C.label }]}>{campaign.name}</Text>
              <Text style={[s.campaignDesc, { color: C.secondary as string }]}>{campaign.desc}</Text>

              {/* Thermometer progress bar */}
              <View style={[s.thermoBg, { backgroundColor: C.surfacePressed as string, marginTop: 10 }]}>
                <View
                  style={[
                    s.thermoFill,
                    { width: `${Math.round(pct * 100)}%` as any, backgroundColor: C.accent },
                  ]}
                />
              </View>

              <View style={[s.row, { marginTop: 6, justifyContent: 'space-between' }]}>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                  {formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}
                </Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                  {campaign.donors} donors
                </Text>
              </View>
              <View style={[s.row, { marginTop: 4, justifyContent: 'space-between' }]}>
                <Text style={[s.bodySmall, { color: C.muted as string }]}>
                  Deadline: {campaign.deadline}
                </Text>
                <Text style={[s.bodySmall, { color: C.accent, fontWeight: '600' }]}>
                  {Math.round(pct * 100)}%
                </Text>
              </View>

              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[s.outlineBtn, { borderColor: C.accent, marginTop: 12 }]}
              >
                <Text style={[s.outlineBtnText, { color: C.accent }]}>Give to Campaign</Text>
              </Pressable>
            </GlassView>
          );
        })}
      </View>
    );
  }

  function renderTickets() {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Upcoming Games</Text>
        {TICKET_GAMES.map(game => (
          <GlassView tier={1} key={game.gameId} style={[s.card, { marginBottom: 12 }]}>
            <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.campaignName, { color: C.label }]}>vs {game.opponent}</Text>
                <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]}>
                  {`${game.date} \u00B7 ${game.time}`}
                </Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>{game.venue}</Text>
              </View>
              {game.isAway && (
                <View style={[s.locationBadge, { backgroundColor: '#1D9BF0' }]}>
                  <Text style={s.locationBadgeText}>A</Text>
                </View>
              )}
            </View>

            <View style={[s.ticketTypes, { borderTopColor: C.separator as string }]}>
              {game.types.map((type: any) => (
                <View
                  key={type.label}
                  style={[s.row, { justifyContent: 'space-between', marginBottom: 6 }]}
                >
                  <Text style={[s.bodySmall, { color: C.label }]}>{type.label}</Text>
                  <View style={s.row}>
                    <Text style={[s.bodySmall, { color: C.accent, fontWeight: '700', marginRight: 8 }]}>
                      ${type.price}
                    </Text>
                    <Text style={[s.bodySmall, { color: C.muted as string }]}>
                      {type.available} left
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[s.giveBtn, { backgroundColor: C.accent, marginTop: 12 }]}
            >
              <Text style={s.giveBtnText}>Buy Tickets</Text>
            </Pressable>
          </GlassView>
        ))}
      </View>
    );
  }

  function renderFanRewards() {
    return (
      <View style={{ marginBottom: 24 }}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Fan Rewards</Text>
        <GlassView tier={1} style={s.card}>
          {/* Personal points */}
          <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }]}>
            <Text style={[s.bodyMed, { color: C.label }]}>Your Points</Text>
            <View style={[s.pointsBadge, { backgroundColor: C.accent }]}>
              <Text style={s.pointsBadgeText}>1,240 pts</Text>
            </View>
          </View>

          {/* Top 5 leaderboard */}
          <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>
            Top Supporters
          </Text>
          {FAN_REWARDS.map(fan => (
            <View key={fan.id} style={[s.row, { marginBottom: 8, alignItems: 'center' }]}>
              <Text style={[s.rankNum, { color: fan.rank <= 3 ? C.accent : (C.muted as string) }]}>
                #{fan.rank}
              </Text>
              <View
                style={[
                  s.avatarCircle,
                  { backgroundColor: `hsl(${fan.hue}, 55%, 55%)`, marginLeft: 8 },
                ]}
              >
                <Text style={s.avatarText}>{fan.name.charAt(0)}</Text>
              </View>
              <Text style={[s.bodySmall, { flex: 1, color: C.label, marginLeft: 8 }]}>
                {fan.name}
              </Text>
              <Text style={[s.bodySmall, { color: C.accent, fontWeight: '700' }]}>
                {fan.points.toLocaleString()} pts
              </Text>
            </View>
          ))}

          {/* Redemption chips */}
          <View style={[s.redeemSection, { borderTopColor: C.separator as string }]}>
            <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>
              Redeem Rewards
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                { label: 'Early Ticket Access', pts: 2000 },
                { label: 'Meet & Greet',        pts: 5000 },
                { label: 'Courtside Upgrade',   pts: 8000 },
              ].map(r => (
                <Pressable
                  key={r.label}
                  onPress={() => Haptics.selectionAsync()}
                  style={[s.redeemChip, { borderColor: C.accent }]}
                >
                  <Text style={[s.redeemChipLabel, { color: C.label }]}>{r.label}</Text>
                  <Text style={[s.redeemChipPts, { color: C.accent }]}>
                    {r.pts.toLocaleString()} pts
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </GlassView>
      </View>
    );
  }

  function renderSupportTab() {
    return (
      <>
        {role === 'admin' && renderAdminGivingDashboard()}
        <Text style={[s.sectionHeader, { color: C.label }]}>Quick Give</Text>
        {renderQuickGive()}
        {role === 'admin' && renderAdminTicketStats()}
        {renderCampaigns()}
        {renderTickets()}
        {renderFanRewards()}
      </>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // NIL TAB
  // ────────────────────────────────────────────────────────────────────────────

  function renderNILPlayerDashboard() {
    return (
      <>
        {/* My NIL Dashboard — 3 stat cards */}
        <View style={[s.row, { gap: 10, marginBottom: 16 }]}>
          {[
            { label: 'Total Earned',  value: '$4,700' },
            { label: 'Active Deals',  value: '2'      },
            { label: 'Pending',       value: '1'      },
          ].map(stat => (
            <GlassView tier={1} key={stat.label} style={[s.statCard, { flex: 1 }]}>
              <Text style={[s.statCardNum, { color: C.label }]}>{stat.value}</Text>
              <Text style={[s.statCardLabel, { color: C.secondary as string }]}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Social value estimate */}
        <GlassView
          tier={1}
          style={[s.card, { marginBottom: 16, flexDirection: 'row', alignItems: 'center' }]}
        >
          <IconSymbol name="chart.line.uptrend.xyaxis" size={18} color={C.accent} />
          <View style={{ marginLeft: 10 }}>
            <Text style={[s.bodyMed, { color: C.label }]}>Estimated Social Value</Text>
            <Text style={[s.adminStatBig, { color: C.accent }]}>$2,400 est. social value</Text>
          </View>
        </GlassView>

        {/* Available Opportunities */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Available Opportunities</Text>
        {NIL_OPPORTUNITIES.map(opp => (
          <GlassView tier={1} key={opp.id} style={[s.card, { marginBottom: 12 }]}>
            <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
              <View style={[s.row, { flex: 1 }]}>
                <View
                  style={[
                    s.brandCircle,
                    { backgroundColor: `hsl(${opp.brandHue}, 55%, 50%)` },
                  ]}
                >
                  <Text style={s.brandCircleText}>{opp.brand.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{opp.brand}</Text>
                  <View style={[s.row, { marginTop: 4, gap: 6 }]}>
                    <View
                      style={[
                        s.dealTypeBadge,
                        { backgroundColor: dealTypeBadgeColor(opp.type, C) },
                      ]}
                    >
                      <Text style={s.dealTypeBadgeText}>{opp.type}</Text>
                    </View>
                    {opp.openToAll && (
                      <View style={[s.dealTypeBadge, { backgroundColor: C.green }]}>
                        <Text style={s.dealTypeBadgeText}>Open</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={[s.amountChipGreen, { backgroundColor: `${C.green}22` }]}>
                <Text style={[s.amountChipText, { color: C.green }]}>
                  ${opp.amount.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={[s.campaignDesc, { color: C.secondary as string, marginTop: 8 }]}>
              {opp.description}
            </Text>
            <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 4 }]}>
              Deliverables: {opp.deliverables}
            </Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>
              Deadline: {opp.deadline}
            </Text>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedOpportunity(opp);
              }}
              style={[s.outlineBtn, { borderColor: C.green, marginTop: 10 }]}
            >
              <Text style={[s.outlineBtnText, { color: C.green }]}>View Deal</Text>
            </Pressable>
          </GlassView>
        ))}

        {/* My Active Deals */}
        <Text style={[s.sectionHeader, { color: C.label }]}>My Active Deals</Text>
        {myDeals.map(deal => (
          <GlassView tier={1} key={deal.id} style={[s.card, { marginBottom: 12 }]}>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Text style={[s.bodyMed, { color: C.label }]}>{deal.brand}</Text>
              <View
                style={[
                  s.statusBadge,
                  { backgroundColor: `${nilStatusColor(deal.status, C)}22` },
                ]}
              >
                <Text style={[s.statusBadgeText, { color: nilStatusColor(deal.status, C) }]}>
                  {deal.status}
                </Text>
              </View>
            </View>
            <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]}>
              {`${deal.type} \u00B7 $${deal.amount.toLocaleString()}`}
            </Text>

            {/* Progress bar */}
            <View style={[s.thermoBg, { backgroundColor: C.surfacePressed as string, marginTop: 10 }]}>
              <View
                style={[
                  s.thermoFill,
                  { width: `${deal.completed}%` as any, backgroundColor: C.green },
                ]}
              />
            </View>
            <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 4 }]}>
              {deal.completed}% complete
            </Text>

            {/* Deliverables checklist */}
            <View style={{ marginTop: 8 }}>
              {deal.deliverables.map((d: string, i: number) => (
                <View key={i} style={[s.row, { marginTop: 3 }]}>
                  <Text style={{ color: deal.completed === 100 ? C.green : (C.muted as string), marginRight: 6 }}>
                    {deal.completed === 100 ? '\u2713' : '\u25CB'}
                  </Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string }]}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Payment status chip */}
            <View style={[s.row, { marginTop: 8 }]}>
              <View style={[s.statusBadge, { backgroundColor: `${C.green}22` }]}>
                <Text style={[s.statusBadgeText, { color: C.green }]}>
                  {deal.status === 'completed' ? 'Paid' : 'Payment Pending'}
                </Text>
              </View>
            </View>
          </GlassView>
        ))}

        {/* Compliance note */}
        <GlassView tier={1} style={[s.card, { backgroundColor: `${C.green}18`, marginBottom: 24 }]}>
          <View style={[s.row, { alignItems: 'center' }]}>
            <IconSymbol name="checkmark.shield.fill" size={18} color={C.green} />
            <Text style={[s.bodySmall, { color: C.green, fontWeight: '600', marginLeft: 8, flex: 1 }]}>
              {'All NIL activity auto-disclosed \u00B7 KaNeXT Compliance Verified'}
            </Text>
          </View>
        </GlassView>
      </>
    );
  }

  function renderNILFanView() {
    const starters = PLAYERS.filter(p => p.role === 'Starter');

    return (
      <>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <GlassView tier={1} style={[s.card, { marginBottom: 16 }]}>
          <View style={[s.row, { alignItems: 'center', marginBottom: 8 }]}>
            <IconSymbol name="heart.fill" size={18} color={C.accent} />
            <Text style={[s.sectionTitle, { color: C.label, marginLeft: 8 }]}>Support Your Players</Text>
            <View style={[s.fanBadge, { marginLeft: 'auto' as any }]}>
              <Text style={s.fanBadgeText}>Fan</Text>
            </View>
          </View>
          <Text style={[s.campaignDesc, { color: C.secondary as string }]}>
            Every contribution supports athlete NIL — verified, compliance-reviewed, and publicly disclosed. Be part of their journey.
          </Text>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowSupportSheet(true); }}
            style={[s.giveBtn, { backgroundColor: C.accent, marginTop: 14 }]}
          >
            <Text style={s.giveBtnText}>Support an Athlete</Text>
          </Pressable>
        </GlassView>

        {/* ── Featured Athletes ─────────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Featured Athletes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 10, paddingRight: 16 }}
        >
          {starters.map(p => {
            const totalNIL = NIL_DEALS
              .filter(d => d.playerId === p.id)
              .reduce((sum, d) => sum + d.amount, 0);
            return (
              <GlassView tier={1} key={p.id} style={s.athleteCard}>
                <View style={[s.athleteAvatar, { backgroundColor: `hsl(${p.hue},55%,35%)` }]}>
                  <Text style={s.athleteAvatarText}>{p.initials}</Text>
                </View>
                <Text
                  style={[s.bodySmall, { color: C.label, marginTop: 8, textAlign: 'center', fontWeight: '600' }]}
                  numberOfLines={1}
                >
                  {p.name.split(' ')[0]}
                </Text>
                <Text style={[s.bodySmall, { color: C.secondary as string, textAlign: 'center', fontSize: 11 }]}>
                  {p.position}
                </Text>
                {totalNIL > 0 && (
                  <View style={[s.nilValueChip, { backgroundColor: `${C.green}22`, marginTop: 6 }]}>
                    <Text style={[s.nilValueChipText, { color: C.green }]}>
                      {`$${(totalNIL / 1000).toFixed(1)}K`}
                    </Text>
                  </View>
                )}
              </GlassView>
            );
          })}
        </ScrollView>

        {/* ── Active NIL Deals ──────────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Active NIL Deals</Text>
        {NIL_DEALS.map(deal => {
          const player = PLAYERS.find(p => p.id === deal.playerId);
          const hue = player?.hue ?? 215;
          return (
            <GlassView tier={1} key={deal.id} style={[s.card, { marginBottom: 10 }]}>
              <View style={[s.row, { alignItems: 'center', marginBottom: 8 }]}>
                <View style={[s.nilDealAvatar, { backgroundColor: `hsl(${hue},55%,35%)` }]}>
                  <Text style={s.nilDealAvatarText}>{player?.initials ?? deal.playerName[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{deal.playerName}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                    {`${deal.brand} \u00B7 ${deal.type}`}
                  </Text>
                </View>
                <View style={[s.dealValueChip, { backgroundColor: `${C.green}22` }]}>
                  <Text style={[s.dealValueChipText, { color: C.green }]}>
                    {`$${deal.amount.toLocaleString()}`}
                  </Text>
                </View>
              </View>
              <Text style={[s.bodySmall, { color: C.muted as string, marginBottom: 6 }]}>
                {`${deal.startDate} \u2013 ${deal.endDate}`}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.thermoBg, { flex: 1, backgroundColor: C.separator as string }]}>
                  <View
                    style={[
                      s.thermoFill,
                      {
                        width: `${deal.completed}%` as any,
                        backgroundColor: deal.completed === 100 ? C.green : C.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={[s.bodySmall, { color: C.secondary as string, width: 36, textAlign: 'right' }]}>
                  {`${deal.completed}%`}
                </Text>
                <View style={[s.statusBadge, { backgroundColor: `${nilStatusColor(deal.compliance, C)}22` }]}>
                  <Text style={[s.statusBadgeText, { color: nilStatusColor(deal.compliance, C) }]}>
                    {deal.compliance}
                  </Text>
                </View>
              </View>
            </GlassView>
          );
        })}

        {/* ── Recent NIL Activity ───────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.label, marginTop: 4 }]}>Recent Activity</Text>
        <GlassView tier={1} style={[s.card, { marginBottom: 16 }]}>
          {NIL_ACTIVITY.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.activityRow,
                idx < NIL_ACTIVITY.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: C.separator as string,
                },
              ]}
            >
              <View style={[s.activityAvatar, { backgroundColor: `hsl(${item.hue},55%,35%)` }]}>
                <Text style={s.activityAvatarText}>{item.initials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}>
                  {item.playerName}
                </Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                  {`${item.action} \u00B7 ${item.brand}`}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {item.amount != null && (
                  <Text style={[s.bodySmall, { color: C.green, fontWeight: '700' }]}>
                    {`+$${item.amount.toLocaleString()}`}
                  </Text>
                )}
                <Text style={[s.bodySmall, { color: C.muted as string, marginTop: item.amount != null ? 2 : 0 }]}>
                  {item.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </GlassView>

        {/* ── Fan Leaderboard ───────────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Fan Leaderboard</Text>
        <GlassView tier={1} style={[s.card, { marginBottom: 16 }]}>
          <Text style={[s.subHeader, { color: C.muted as string, marginBottom: 10 }]}>Top Supporters This Month</Text>
          {FAN_REWARDS.map(fan => (
            <View key={fan.id} style={[s.row, { alignItems: 'center', paddingVertical: 7, gap: 10 }]}>
              <Text style={[s.rankNum, { color: fan.rank <= 3 ? C.accent : (C.secondary as string) }]}>
                {`#${fan.rank}`}
              </Text>
              <View style={[s.avatarCircle, { backgroundColor: `hsl(${fan.hue},50%,38%)` }]}>
                <Text style={s.avatarText}>{fan.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <Text style={[s.bodySmall, { flex: 1, color: C.label, fontWeight: fan.rank <= 3 ? '700' : '400' }]}>
                {fan.name}
              </Text>
              <View style={[s.pointsBadge, { backgroundColor: `${C.accent}22` }]}>
                <Text style={[s.pointsBadgeText, { color: C.accent, fontSize: 12 }]}>
                  {`${fan.points.toLocaleString()} pts`}
                </Text>
              </View>
            </View>
          ))}
          <View
            style={[
              s.row,
              {
                alignItems:       'center',
                paddingVertical:  7,
                gap:              10,
                marginTop:        6,
                borderTopWidth:   StyleSheet.hairlineWidth,
                borderTopColor:   C.separator as string,
              },
            ]}
          >
            <Text style={[s.rankNum, { color: C.secondary as string }]}>#247</Text>
            <View style={[s.avatarCircle, { backgroundColor: `${C.accent}33` }]}>
              <Text style={[s.avatarText, { color: C.accent, fontSize: 10 }]}>You</Text>
            </View>
            <Text style={[s.bodySmall, { flex: 1, color: C.label }]}>You</Text>
            <View style={[s.pointsBadge, { backgroundColor: `${C.accent}22` }]}>
              <Text style={[s.pointsBadgeText, { color: C.accent, fontSize: 12 }]}>480 pts</Text>
            </View>
          </View>
        </GlassView>

        {/* ── Fan Experiences ───────────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Fan Experiences</Text>
        {FAN_EXPERIENCES.map(exp => {
          const soldOut = exp.spotsLeft === 0;
          return (
            <GlassView
              tier={1}
              key={exp.id}
              style={[s.card, { marginBottom: 10, opacity: soldOut ? 0.65 : 1 }]}
            >
              <View style={[s.row, { alignItems: 'center', marginBottom: 8 }]}>
                <View style={[s.nilDealAvatar, { backgroundColor: `hsl(${exp.hue},55%,35%)` }]}>
                  <Text style={s.nilDealAvatarText}>{exp.initials}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{exp.title}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                    {`with ${exp.playerName}`}
                  </Text>
                </View>
                <Text style={[s.bodyMed, { color: C.accent }]}>{`$${exp.price}`}</Text>
              </View>
              <Text style={[s.campaignDesc, { color: C.secondary as string, marginBottom: 8 }]}>
                {exp.description}
              </Text>
              <View style={[s.row, { alignItems: 'center' }]}>
                {exp.spotsLeft != null && exp.spotsLeft > 0 && (
                  <Text style={[s.bodySmall, { color: C.muted as string, flex: 1 }]}>
                    {exp.isRaffle
                      ? `${exp.spotsLeft} raffle entries left`
                      : `${exp.spotsLeft} spot${exp.spotsLeft !== 1 ? 's' : ''} left`}
                  </Text>
                )}
                {soldOut ? (
                  <View style={s.soldOutBadge}>
                    <Text style={s.soldOutText}>Sold Out</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    style={[s.expBookBtn, { backgroundColor: C.accent }]}
                  >
                    <Text style={[s.giveBtnText, { fontSize: 13 }]}>
                      {exp.isRaffle ? 'Enter Raffle' : 'Book Now'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </GlassView>
          );
        })}
      </>
    );
  }

  function renderSupportSheet() {
    const SUPPORT_AMOUNTS = [25, 50, 100, 250];
    const starters = PLAYERS.filter(p => p.role === 'Starter');
    const customAmt = parseFloat(supportAmount);
    const finalAmt  = isNaN(customAmt) ? 0 : customAmt;
    const canPay    = supportSelectedPlayer != null && finalAmt > 0;

    return (
      <BottomSheet
        visible={showSupportSheet}
        onClose={() => { setShowSupportSheet(false); setSupportSelectedPlayer(null); setSupportAmount(''); }}
        useModal
        snapPoints={['50%', '100%']}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[s.subHeader, { color: C.muted as string, marginBottom: 10 }]}>Choose Athlete</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ gap: 10, paddingRight: 8 }}
          >
            {starters.map(p => {
              const isSelected = supportSelectedPlayer?.id === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => { Haptics.selectionAsync(); setSupportSelectedPlayer(isSelected ? null : p); }}
                  style={[
                    s.athleteCard,
                    isSelected && { borderWidth: 2, borderColor: C.accent },
                  ]}
                >
                  <View style={[s.athleteAvatar, { backgroundColor: `hsl(${p.hue},55%,35%)` }]}>
                    <Text style={s.athleteAvatarText}>{p.initials}</Text>
                  </View>
                  <Text
                    style={[s.bodySmall, { color: C.label, marginTop: 6, textAlign: 'center', fontWeight: '600' }]}
                    numberOfLines={1}
                  >
                    {p.name.split(' ')[0]}
                  </Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string, textAlign: 'center', fontSize: 11 }]}>
                    {`#${p.number}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[s.subHeader, { color: C.muted as string, marginBottom: 10 }]}>Choose Amount</Text>
          <View style={[s.row, { flexWrap: 'wrap' as any, gap: 8, marginBottom: 14 }]}>
            {SUPPORT_AMOUNTS.map(amt => {
              const isSelected = parseFloat(supportAmount) === amt;
              return (
                <Pressable
                  key={amt}
                  onPress={() => { Haptics.selectionAsync(); setSupportAmount(String(amt)); }}
                  style={[
                    s.amountPresetChip,
                    {
                      borderColor:     isSelected ? C.accent : (C.inputBorder as string),
                      backgroundColor: isSelected ? C.accent : 'transparent',
                    },
                  ]}
                >
                  <Text style={[s.amountPresetText, { color: isSelected ? '#fff' : (C.label as string) }]}>
                    {`$${amt}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={supportAmount}
            onChangeText={setSupportAmount}
            keyboardType="numeric"
            placeholder="Custom amount"
            placeholderTextColor={C.muted as string}
            style={[
              s.supportAmtInput,
              {
                color:           C.label as string,
                borderColor:     C.inputBorder as string,
                backgroundColor: C.surface,
              },
            ]}
          />

          <Pressable
            onPress={() => {
              if (!canPay) return;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowSupportSheet(false);
              setSupportSelectedPlayer(null);
              setSupportAmount('');
              setShowSuccess(true);
            }}
            style={[
              s.giveBtn,
              {
                backgroundColor: canPay ? C.accent : (C.separator as string),
                marginTop:        20,
              },
            ]}
          >
            <Text style={[s.giveBtnText, { color: canPay ? '#fff' : (C.secondary as string) }]}>
              {canPay
                ? `Send $${finalAmt} to ${supportSelectedPlayer!.name.split(' ')[0]} via KayPay`
                : 'Select athlete and amount'}
            </Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>
    );
  }

  function renderNILAdminView() {
    const filtered = nilFilter === 'All'
      ? NIL_DEALS
      : NIL_DEALS.filter(d => d.compliance === nilFilter.toLowerCase());

    return (
      <>
        {/* Summary stat cards */}
        <View style={[s.row, { gap: 10, marginBottom: 16 }]}>
          {[
            { label: 'Approved', value: '2', color: C.green  },
            { label: 'Pending',  value: '1', color: C.accent },
            { label: 'Flagged',  value: '0', color: C.red    },
          ].map(stat => (
            <GlassView tier={1} key={stat.label} style={[s.statCard, { flex: 1 }]}>
              <Text style={[s.statCardNum, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[s.statCardLabel, { color: C.secondary as string }]}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {(['All', 'Approved', 'Pending', 'Flagged'] as const).map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setNilFilter(f); }}
              style={[
                s.filterPill,
                {
                  borderColor:     nilFilter === f ? C.accent : (C.inputBorder as string),
                  backgroundColor: nilFilter === f ? C.accent : 'transparent',
                },
              ]}
            >
              <Text style={[s.filterPillText, { color: nilFilter === f ? '#fff' : (C.secondary as string) }]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Compliance table */}
        <GlassView tier={1} style={[s.card, { marginBottom: 16 }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>NIL Compliance</Text>
          {filtered.map(deal => (
            <View
              key={deal.id}
              style={[s.adminNilRow, { borderBottomColor: C.separator as string }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}>
                  {deal.playerName}
                </Text>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                  {`${deal.brand} \u00B7 ${deal.type}`}
                </Text>
              </View>
              <Text style={[s.bodySmall, { color: C.label, marginRight: 10 }]}>
                ${deal.amount.toLocaleString()}
              </Text>
              <View
                style={[
                  s.statusBadge,
                  { backgroundColor: `${nilStatusColor(deal.compliance, C)}22` },
                ]}
              >
                <Text style={[s.statusBadgeText, { color: nilStatusColor(deal.compliance, C) }]}>
                  {deal.compliance}
                </Text>
              </View>
            </View>
          ))}
        </GlassView>

        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={[s.giveBtn, { backgroundColor: '#003A63', marginBottom: 24 }]}
        >
          <Text style={s.giveBtnText}>Export Report</Text>
        </Pressable>
      </>
    );
  }

  function renderNILTab() {
    if (role === 'player') return renderNILPlayerDashboard();
    if (role === 'admin')  return renderNILAdminView();
    return renderNILFanView();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SHOP TAB
  // ────────────────────────────────────────────────────────────────────────────

  function renderShopTab() {
    return (
      <>
        {/* Admin: Manage Products button */}
        {role === 'admin' && (
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[s.adminShopBanner, { backgroundColor: '#003A63' }]}
          >
            <IconSymbol name="square.grid.2x2" size={16} color="#fff" />
            <Text style={[s.bodyMed, { color: '#fff', marginLeft: 8, flex: 1 }]}>Manage Products</Text>
            <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.6)" />
          </Pressable>
        )}

        {/* Game-Day Special banner */}
        <GlassView
          tier={1}
          style={[
            s.card,
            {
              backgroundColor: `${C.accent}18`,
              borderWidth:     1,
              borderColor:     `${C.accent}44`,
              marginBottom:    16,
            },
          ]}
        >
          <View style={[s.row, { alignItems: 'center' }]}>
            <Text style={{ fontSize: 20 }}>{'\uD83C\uDFC0'}</Text>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[s.bodyMed, { color: C.accent, fontWeight: '800', letterSpacing: 0.3 }]}>
                GAME DAY SPECIAL
              </Text>
              <Text style={[s.bodySmall, { color: C.label }]}>
                {'Apr 1 vs Howard \u2014 20% off all jerseys'}
              </Text>
            </View>
          </View>
        </GlassView>

        {/* Featured products horizontal scroll */}
        <Text style={[s.sectionHeader, { color: C.label }]}>Featured</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 12, paddingRight: 16 }}
        >
          {featuredProducts.map(product => (
            <Pressable
              key={product.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedProduct(product);
                setSelectedColor(product.colors[0]);
              }}
            >
              <GlassView tier={1} style={s.featuredCard}>
                <View style={[s.featuredImg, { backgroundColor: '#003A63' }]}>
                  <View style={s.productLogoWrap}>
                    <Text style={s.productLogoText}>LU</Text>
                  </View>
                  <Text style={s.productCategoryLabel}>{product.category.toUpperCase()}</Text>
                  {product.isLimited && (
                    <View style={s.limitedBadge}>
                      <Text style={s.limitedBadgeText}>LIMITED</Text>
                    </View>
                  )}
                  {role === 'admin' && (
                    <View style={[s.inventoryBadge, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                      <Text style={s.inventoryBadgeText}>
                        {product.inStock ? 'In Stock' : 'Out'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={s.featuredInfo}>
                  <Text
                    style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <View style={[s.row, { justifyContent: 'space-between', marginTop: 4 }]}>
                    <Text style={[s.bodySmall, { color: C.accent, fontWeight: '700' }]}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#F4A934' }}>
                      {starString(product.rating)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => addToCart(product.id)}
                    style={[s.addToCartBtn, { backgroundColor: C.accent }]}
                  >
                    <Text style={s.addToCartBtnText}>Add to Cart</Text>
                  </Pressable>
                </View>
              </GlassView>
            </Pressable>
          ))}
        </ScrollView>

        {/* Category filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {['All', 'Apparel', 'Headwear', 'Accessories', 'Special'].map(cat => (
            <Pressable
              key={cat}
              onPress={() => { Haptics.selectionAsync(); setCategoryFilter(cat); }}
              style={[
                s.filterPill,
                {
                  borderColor:     categoryFilter === cat ? C.accent : (C.inputBorder as string),
                  backgroundColor: categoryFilter === cat ? C.accent : 'transparent',
                },
              ]}
            >
              <Text
                style={[s.filterPillText, { color: categoryFilter === cat ? '#fff' : (C.secondary as string) }]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Product grid — 2 column */}
        <View style={s.productGrid}>
          {filteredProducts.map((product, idx) => (
            <Pressable
              key={product.id}
              style={[
                s.productCell,
                idx % 2 === 0 ? { paddingRight: 6 } : { paddingLeft: 6 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedProduct(product);
                setSelectedColor(product.colors[0]);
              }}
            >
              <GlassView tier={1} style={s.productCard}>
                <View style={[s.productImg, { backgroundColor: '#003A63' }]}>
                  <Text style={s.productGridLogo}>LU</Text>
                  <Text style={s.productGridCategory}>{product.category.toUpperCase()}</Text>
                  {product.isLimited && (
                    <View style={s.limitedBadgeSmall}>
                      <Text style={s.limitedBadgeSmallText}>LTD</Text>
                    </View>
                  )}
                  {role === 'admin' && (
                    <View style={[s.inventoryBadgeSmall, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                      <Text style={s.inventoryBadgeSmallText}>
                        {product.inStock ? 'Stocked' : 'OOS'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ padding: 10 }}>
                  <Text
                    style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <View style={[s.row, { justifyContent: 'space-between', marginTop: 4 }]}>
                    <Text style={[s.bodySmall, { color: C.accent, fontWeight: '700' }]}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.muted as string }}>
                      {'\u2605'}{product.rating}
                    </Text>
                  </View>
                  {!product.inStock && (
                    <Text style={[s.bodySmall, { color: C.red, marginTop: 2 }]}>Out of Stock</Text>
                  )}
                </View>
              </GlassView>
            </Pressable>
          ))}
        </View>

        {/* Spacer for cart FAB */}
        <View style={{ height: 80 }} />
      </>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // BOTTOM SHEETS
  // ────────────────────────────────────────────────────────────────────────────

  function renderProductSheet() {
    if (!selectedProduct) return null;
    return (
      <BottomSheet
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        snapPoints={['50%', '100%']}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Large product photo placeholder */}
          <View style={[s.productSheetImg, { backgroundColor: '#003A63' }]}>
            <View style={s.productSheetLogoWrap}>
              <Text style={s.productSheetLogo}>LU</Text>
            </View>
            <Text style={s.productSheetName} numberOfLines={2}>
              {selectedProduct.name}
            </Text>
            {selectedProduct.isLimited && (
              <View style={s.limitedBadge}>
                <Text style={s.limitedBadgeText}>LIMITED EDITION</Text>
              </View>
            )}
          </View>

          {/* Name / category */}
          <Text style={[s.adminStatBig, { color: C.label, marginTop: 14 }]}>
            {selectedProduct.name}
          </Text>
          <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]}>
            {selectedProduct.category}
          </Text>

          {/* Price / rating */}
          <View style={[s.row, { marginTop: 6, alignItems: 'center', gap: 10 }]}>
            <Text style={[s.adminStatBig, { color: C.accent }]}>
              ${selectedProduct.price.toFixed(2)}
            </Text>
            <Text style={{ color: '#F4A934', fontSize: 16 }}>
              {starString(selectedProduct.rating)}
            </Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>
              ({selectedProduct.reviews} reviews)
            </Text>
          </View>

          {/* Color selector chips */}
          <Text style={[s.subHeader, { color: C.secondary as string, marginTop: 14, marginBottom: 8 }]}>
            Color
          </Text>
          <View style={[s.row, { gap: 8, flexWrap: 'wrap' }]}>
            {selectedProduct.colors.map(color => (
              <Pressable
                key={color}
                onPress={() => { Haptics.selectionAsync(); setSelectedColor(color); }}
                style={[
                  s.colorChip,
                  {
                    borderColor:     selectedColor === color ? C.accent : (C.inputBorder as string),
                    backgroundColor: selectedColor === color ? `${C.accent}22` : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    s.colorChipText,
                    { color: selectedColor === color ? C.accent : (C.secondary as string) },
                  ]}
                >
                  {color}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Add to Cart */}
          <Pressable
            onPress={() => {
              addToCart(selectedProduct.id);
              setSelectedProduct(null);
            }}
            style={[s.outlineBtn, { borderColor: C.accent, marginTop: 20 }]}
          >
            <Text style={[s.outlineBtnText, { color: C.accent }]}>Add to Cart</Text>
          </Pressable>

          {/* Buy with KayPay */}
          <Pressable
            onPress={() => {
              addToCart(selectedProduct.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setSelectedProduct(null);
            }}
            style={[s.giveBtn, { backgroundColor: C.accent, marginTop: 10 }]}
          >
            <Text style={s.giveBtnText}>Buy with KayPay</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>
    );
  }

  function renderOpportunitySheet() {
    if (!selectedOpportunity) return null;
    const opp = selectedOpportunity;
    return (
      <BottomSheet
        visible={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        snapPoints={['50%', '100%']}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header */}
          <View style={[s.row, { alignItems: 'center', marginBottom: 16 }]}>
            <View
              style={[
                s.brandCircleLg,
                { backgroundColor: `hsl(${opp.brandHue}, 55%, 48%)` },
              ]}
            >
              <Text style={s.brandCircleLgText}>{opp.brand.charAt(0)}</Text>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={[s.adminStatBig, { color: C.label }]}>{opp.brand}</Text>
              <View
                style={[
                  s.dealTypeBadge,
                  {
                    backgroundColor: dealTypeBadgeColor(opp.type, C),
                    marginTop:       4,
                    alignSelf:       'flex-start',
                  },
                ]}
              >
                <Text style={s.dealTypeBadgeText}>{opp.type}</Text>
              </View>
            </View>
            <View style={[s.amountChipGreen, { backgroundColor: `${C.green}22` }]}>
              <Text style={[s.amountChipText, { color: C.green, fontSize: 20 }]}>
                ${opp.amount.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Description */}
          <GlassView tier={1} style={[s.card, { marginBottom: 12 }]}>
            <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 4 }]}>
              Description
            </Text>
            <Text style={[s.bodySmall, { color: C.label }]}>{opp.description}</Text>
          </GlassView>

          {/* Deliverables */}
          <GlassView tier={1} style={[s.card, { marginBottom: 12 }]}>
            <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 4 }]}>
              Deliverables
            </Text>
            <Text style={[s.bodySmall, { color: C.label }]}>{opp.deliverables}</Text>
          </GlassView>

          {/* Deadline / Amount */}
          <GlassView
            tier={1}
            style={[s.card, { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' }]}
          >
            <View>
              <Text style={[s.subHeader, { color: C.secondary as string }]}>Deadline</Text>
              <Text style={[s.bodyMed, { color: C.label, marginTop: 2 }]}>{opp.deadline}</Text>
            </View>
            <View>
              <Text style={[s.subHeader, { color: C.secondary as string }]}>Amount</Text>
              <Text style={[s.bodyMed, { color: C.green, fontWeight: '700', marginTop: 2 }]}>
                ${opp.amount.toLocaleString()}
              </Text>
            </View>
          </GlassView>

          {/* Accept */}
          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setSelectedOpportunity(null);
            }}
            style={[s.giveBtn, { backgroundColor: C.green }]}
          >
            <Text style={s.giveBtnText}>Accept Deal</Text>
          </Pressable>

          {/* Counter / Decline */}
          <View style={[s.row, { gap: 10, marginTop: 10 }]}>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setSelectedOpportunity(null); }}
              style={[s.outlineBtn, { borderColor: C.secondary as string, flex: 1 }]}
            >
              <Text style={[s.outlineBtnText, { color: C.secondary as string }]}>Counter</Text>
            </Pressable>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setSelectedOpportunity(null); }}
              style={[s.outlineBtn, { borderColor: C.red, flex: 1 }]}
            >
              <Text style={[s.outlineBtnText, { color: C.red }]}>Decline</Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheet>
    );
  }

  function renderCartSheet() {
    const cartTotal = cartItems.reduce((sum, item) => {
      const p = MERCH_PRODUCTS.find(prod => prod.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);

    return (
      <BottomSheet
        visible={cartSheetVisible}
        onClose={() => setCartSheetVisible(false)}
        snapPoints={['50%', '100%']}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[s.adminStatBig, { color: C.label, marginBottom: 16 }]}>Your Cart</Text>

          {cartItems.length === 0 ? (
            <Text style={[s.campaignDesc, { color: C.secondary as string }]}>Your cart is empty.</Text>
          ) : (
            cartItems.map(item => {
              const p = MERCH_PRODUCTS.find(prod => prod.id === item.id);
              if (!p) return null;
              return (
                <View
                  key={item.id}
                  style={[
                    s.row,
                    {
                      justifyContent:    'space-between',
                      paddingVertical:   10,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: C.separator as string,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.bodySmall, { color: C.label, fontWeight: '600' }]}>
                      {p.name}
                    </Text>
                    <Text style={[s.bodySmall, { color: C.secondary as string }]}>
                      Qty: {item.qty}
                    </Text>
                  </View>
                  <Text style={[s.bodySmall, { color: C.accent, fontWeight: '700' }]}>
                    ${(p.price * item.qty).toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}

          {cartItems.length > 0 && (
            <>
              <View style={[s.row, { justifyContent: 'space-between', marginTop: 14 }]}>
                <Text style={[s.bodyMed, { color: C.label }]}>Total</Text>
                <Text style={[s.bodyMed, { color: C.accent, fontWeight: '800' }]}>
                  ${cartTotal.toFixed(2)}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setCartSheetVisible(false);
                  setCartItems([]);
                }}
                style={[s.giveBtn, { backgroundColor: C.accent, marginTop: 16 }]}
              >
                <Text style={s.giveBtnText}>Checkout with KayPay</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </BottomSheet>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Fixed top bar ───────────────────────────────────────────────── */}
      <View
        style={[
          s.topBarOuter,
          {
            paddingTop:      insets.top,
            backgroundColor: C.bg,
            borderBottomColor: C.separator as string,
          },
        ]}
      >
        <View style={s.topBar}>
          {/* Left: side panel menu */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            style={s.iconBtn}
            hitSlop={8}
          >
            <IconSymbol name="line.3.horizontal" size={20} color={C.label} />
          </Pressable>

          {/* Center: dropdown tab pill */}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}
          >
            <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
            <IconSymbol
              name={dropdownOpen ? 'chevron.up' : 'chevron.down'}
              size={12}
              color={C.secondary as string}
              style={{ marginLeft: 4 }}
            />
          </Pressable>

          {/* Right: role cycle pill + filter icon */}
          <View style={[s.row, { gap: 8 }]}>
            <Pressable
              onPress={handleCycleRole}
              style={[s.rolePill, { backgroundColor: C.surface, borderColor: C.separator as string }]}
            >
              <Text style={[s.rolePillText, { color: C.accent }]}>{roleLabel(role)}</Text>
            </Pressable>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={8} style={s.iconBtn}>
                <IconSymbol
                  name={
                    pillsVisible
                      ? 'line.3.horizontal.decrease.circle.fill'
                      : 'line.3.horizontal.decrease.circle'
                  }
                  size={20}
                  color={pillsVisible ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Animated pills row */}
        {pills.length > 0 && (
          <Animated.View
            style={[
              s.pillsRow,
              {
                height:  pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
                opacity: pillsAnim,
                overflow: 'hidden',
                borderBottomColor: C.separator as string,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}
            >
              {pills.map(pill => {
                const isActive = selectedPill === pill;
                return (
                  <Pressable
                    key={pill}
                    onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                    style={[
                      s.pill,
                      {
                        borderColor:     isActive ? C.accent : (C.inputBorder as string),
                        backgroundColor: isActive ? C.accent : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[s.pillText, { color: isActive ? '#fff' : (C.secondary as string) }]}>
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* ── Dropdown overlay ─────────────────────────────────────────────── */}
      {dropdownOpen && (
        <>
          {/* Backdrop — separate from dropdown so dropdown isn't clipped */}
          <Pressable
            style={[StyleSheet.absoluteFill, { zIndex: 150 }]}
            onPress={() => setDropdownOpen(false)}
          />
          <View
            style={[
              s.dropdown,
              {
                backgroundColor: C.surface,
                borderColor:     C.separator as string,
                top:             topBarH,
                zIndex:          200,
              },
            ]}
          >
            {(['Support', 'NIL', 'Shop'] as BoosterTab[]).map(tab => (
              <Pressable
                key={tab}
                onPress={() => changeTab(tab)}
                style={[
                  s.dropdownItem,
                  {
                    borderBottomColor: C.separator as string,
                    backgroundColor:   activeTab === tab ? (C.surfacePressed as string) : 'transparent',
                  },
                ]}
              >
                <Text style={[s.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>
                  {tab}
                </Text>
                {activeTab === tab && (
                  <IconSymbol name="checkmark" size={14} color={C.accent} />
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Main scroll content ──────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingTop: contentPaddingTop }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'Support' && renderSupportTab()}
        {activeTab === 'NIL'     && renderNILTab()}
        {activeTab === 'Shop'    && renderShopTab()}
      </ScrollView>

      {/* ── Cart FAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'Shop' && cartCount > 0 && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCartSheetVisible(true);
          }}
          style={[s.cartFab, { backgroundColor: C.accent, bottom: insets.bottom + 88 }]}
        >
          <IconSymbol name="cart.fill" size={20} color="#fff" />
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeText}>{cartCount}</Text>
          </View>
        </Pressable>
      )}

      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      {renderProductSheet()}
      {renderOpportunitySheet()}
      {renderCartSheet()}
      {renderSupportSheet()}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter: {
    position:          'absolute',
    top:               0,
    left:              0,
    right:             0,
    zIndex:            100,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: {
    height:            TOP_BAR_H,
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
  },
  iconBtn: {
    width:          36,
    height:         36,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dropdownPill: {
    flex:              1,
    marginHorizontal:  10,
    height:            34,
    borderRadius:      17,
    borderWidth:       1,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 14,
  },
  dropdownPillText: {
    fontSize:   14,
    fontWeight: '700',
  },
  rolePill: {
    paddingHorizontal: 12,
    height:            28,
    borderRadius:      14,
    borderWidth:       1,
    alignItems:        'center',
    justifyContent:    'center',
  },
  rolePillText: {
    fontSize:   12,
    fontWeight: '700',
  },
  pillsRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Pills
  pill: {
    height:            30,
    paddingHorizontal: 14,
    borderRadius:      15,
    borderWidth:       1,
    alignItems:        'center',
    justifyContent:    'center',
  },
  pillText: {
    fontSize:   13,
    fontWeight: '600',
  },
  filterPill: {
    height:            30,
    paddingHorizontal: 14,
    borderRadius:      15,
    borderWidth:       1,
    alignItems:        'center',
    justifyContent:    'center',
  },
  filterPillText: {
    fontSize:   13,
    fontWeight: '600',
  },

  // Dropdown
  dropdown: {
    position:      'absolute',
    left:          60,
    right:         60,
    zIndex:        200,
    borderRadius:  14,
    borderWidth:   1,
    overflow:      'hidden',
    shadowColor:   '#000',
    shadowOpacity: 0.12,
    shadowRadius:  12,
    shadowOffset:  { width: 0, height: 4 },
    elevation:     8,
  },
  dropdownItem: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 18,
    paddingVertical:   13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: {
    fontSize:   15,
    fontWeight: '600',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom:     120,
  },

  // Cards
  card: {
    padding:      16,
    borderRadius: 16,
    marginBottom: 4,
  },

  // Typography
  sectionHeader: {
    fontSize:     18,
    fontWeight:   '800',
    marginBottom: 12,
    marginTop:    8,
  },
  sectionTitle: {
    fontSize:   15,
    fontWeight: '700',
  },
  subHeader: {
    fontSize:      12,
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyMed: {
    fontSize:   14,
    fontWeight: '600',
  },
  bodySmall: {
    fontSize: 13,
  },
  linkText: {
    fontSize:   13,
    fontWeight: '600',
  },
  adminStatBig: {
    fontSize:   20,
    fontWeight: '800',
  },

  // Quick Give
  amountRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dollarSign: {
    fontSize:   48,
    fontWeight: '800',
    lineHeight: 56,
  },
  amountInput: {
    fontSize:   64,
    fontWeight: '800',
    minWidth:   80,
    textAlign:  'left',
    padding:    0,
    margin:     0,
  },
  fundPill: {
    height:            32,
    paddingHorizontal: 14,
    borderRadius:      16,
    borderWidth:       1,
    alignItems:        'center',
    justifyContent:    'center',
  },
  fundPillText: {
    fontSize:   13,
    fontWeight: '600',
  },
  freqPill: {
    height:         36,
    borderRadius:   18,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  freqPillText: {
    fontSize:   13,
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        12,
    borderRadius:   12,
    borderWidth:    1,
    marginTop:      12,
    gap:            8,
  },
  paymentLabel: {
    flex:       1,
    fontSize:   14,
    fontWeight: '600',
  },
  paymentTap: {
    fontSize: 12,
  },
  coverFeesRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingTop:     12,
    marginTop:      12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  coverFeesLabel: {
    fontSize:   14,
    fontWeight: '600',
  },
  coverFeesSub: {
    fontSize:  12,
    marginTop: 2,
  },
  giveBtn: {
    height:         52,
    borderRadius:   26,
    alignItems:     'center',
    justifyContent: 'center',
    marginTop:      14,
  },
  giveBtnText: {
    color:         '#fff',
    fontSize:      16,
    fontWeight:    '800',
    letterSpacing: 0.2,
  },
  outlineBtn: {
    height:         44,
    borderRadius:   22,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize:   14,
    fontWeight: '700',
  },

  // Thermometer
  thermoBg: {
    height:       6,
    borderRadius: 3,
    overflow:     'hidden',
  },
  thermoFill: {
    height:       6,
    borderRadius: 3,
  },

  // Campaign / tickets
  campaignName: {
    fontSize:   15,
    fontWeight: '700',
  },
  campaignDesc: {
    fontSize:   13,
    lineHeight: 18,
    marginTop:  2,
  },
  ticketTypes: {
    marginTop:      12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop:     10,
  },
  locationBadge: {
    width:          28,
    height:         28,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  locationBadgeText: {
    color:      '#fff',
    fontSize:   12,
    fontWeight: '800',
  },

  // Fan Rewards
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      12,
  },
  pointsBadgeText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   14,
  },
  rankNum: {
    fontSize:   14,
    fontWeight: '800',
    width:      28,
  },
  avatarCircle: {
    width:          32,
    height:         32,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
  },
  avatarText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   14,
  },
  redeemSection: {
    marginTop:      14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop:     12,
  },
  redeemChip: {
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderRadius:      12,
    borderWidth:       1.5,
    alignItems:        'center',
  },
  redeemChipLabel: {
    fontSize:   13,
    fontWeight: '600',
  },
  redeemChipPts: {
    fontSize:   12,
    fontWeight: '700',
    marginTop:  2,
  },

  // Admin dashboard
  adminStatChip: {
    flex:            1,
    alignItems:      'center',
    padding:         10,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  adminStatChipNum: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#fff',
  },
  adminStatChipLabel: {
    fontSize:  11,
    color:     'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  revChip: {
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      10,
    backgroundColor:   'rgba(255,255,255,0.15)',
    alignItems:        'center',
  },
  revChipVal: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   14,
  },
  revChipLabel: {
    color:      'rgba(255,255,255,0.65)',
    fontSize:   11,
    marginTop:  1,
  },

  // Stat cards
  statCard: {
    padding:      12,
    borderRadius: 14,
    alignItems:   'center',
  },
  statCardNum: {
    fontSize:   22,
    fontWeight: '800',
  },
  statCardLabel: {
    fontSize:  11,
    marginTop: 2,
  },

  // NIL
  brandCircle: {
    width:          44,
    height:         44,
    borderRadius:   22,
    alignItems:     'center',
    justifyContent: 'center',
  },
  brandCircleText: {
    color:      '#fff',
    fontSize:   18,
    fontWeight: '800',
  },
  brandCircleLg: {
    width:          60,
    height:         60,
    borderRadius:   30,
    alignItems:     'center',
    justifyContent: 'center',
  },
  brandCircleLgText: {
    color:      '#fff',
    fontSize:   24,
    fontWeight: '800',
  },
  dealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  dealTypeBadgeText: {
    color:         '#fff',
    fontSize:      11,
    fontWeight:    '700',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      8,
  },
  statusBadgeText: {
    fontSize:      11,
    fontWeight:    '700',
    textTransform: 'capitalize',
  },
  amountChipGreen: {
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderRadius:      10,
    alignItems:        'center',
    justifyContent:    'center',
  },
  amountChipText: {
    fontWeight: '800',
    fontSize:   16,
  },
  adminNilRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Fan NIL view
  fanBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
    backgroundColor:   'rgba(217,119,87,0.15)',
  },
  fanBadgeText: {
    fontSize:   11,
    fontWeight: '700',
    color:      '#3B82F6',
  },
  athleteCard: {
    width:        88,
    padding:      12,
    borderRadius: 16,
    alignItems:   'center',
  },
  athleteAvatar: {
    width:          48,
    height:         48,
    borderRadius:   24,
    alignItems:     'center',
    justifyContent: 'center',
  },
  athleteAvatarText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   16,
  },
  nilValueChip: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
  },
  nilValueChipText: {
    fontSize:   11,
    fontWeight: '700',
  },
  nilDealAvatar: {
    width:          38,
    height:         38,
    borderRadius:   19,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  nilDealAvatarText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   14,
  },
  dealValueChip: {
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:      10,
  },
  dealValueChipText: {
    fontSize:   13,
    fontWeight: '800',
  },
  activityRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 9,
  },
  activityAvatar: {
    width:          32,
    height:         32,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  activityAvatarText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   12,
  },
  soldOutBadge: {
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:      10,
    backgroundColor:   'rgba(184,92,92,0.15)',
  },
  soldOutText: {
    color:      '#B85C5C',
    fontWeight: '700',
    fontSize:   13,
  },
  expBookBtn: {
    height:            38,
    borderRadius:      19,
    paddingHorizontal: 20,
    alignItems:        'center',
    justifyContent:    'center',
  },
  amountPresetChip: {
    height:            40,
    paddingHorizontal: 18,
    borderRadius:      20,
    borderWidth:       1.5,
    alignItems:        'center',
    justifyContent:    'center',
  },
  amountPresetText: {
    fontSize:   15,
    fontWeight: '700',
  },
  supportAmtInput: {
    height:        52,
    borderRadius:  14,
    borderWidth:   1,
    paddingHorizontal: 16,
    fontSize:      18,
    fontWeight:    '600',
  },

  // Shop
  adminShopBanner: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        14,
    borderRadius:   14,
    marginBottom:   12,
  },
  featuredCard: {
    width:        160,
    borderRadius: 16,
    overflow:     'hidden',
  },
  featuredImg: {
    width:          160,
    height:         140,
    alignItems:     'center',
    justifyContent: 'center',
  },
  productLogoWrap: {
    width:           60,
    height:          60,
    borderRadius:    14,
    backgroundColor: 'rgba(255,215,0,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     'rgba(255,215,0,0.22)',
  },
  productLogoText: {
    fontSize:      24,
    fontWeight:    '900',
    color:         'rgba(255,215,0,0.9)',
    letterSpacing: -1,
  },
  productCategoryLabel: {
    position:      'absolute',
    bottom:        8,
    left:          0,
    right:         0,
    textAlign:     'center',
    fontSize:      9,
    fontWeight:    '800',
    color:         'rgba(255,255,255,0.38)',
    letterSpacing: 1.5,
  },
  featuredInfo: {
    padding: 10,
  },
  limitedBadge: {
    position:          'absolute',
    top:               8,
    right:             8,
    backgroundColor:   '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical:   3,
    borderRadius:      6,
  },
  limitedBadgeText: {
    color:         '#fff',
    fontSize:      9,
    fontWeight:    '800',
    letterSpacing: 0.5,
  },
  inventoryBadge: {
    position:          'absolute',
    bottom:            8,
    left:              8,
    paddingHorizontal: 6,
    paddingVertical:   3,
    borderRadius:      6,
  },
  inventoryBadgeText: {
    color:      '#fff',
    fontSize:   10,
    fontWeight: '700',
  },
  addToCartBtn: {
    height:         30,
    borderRadius:   15,
    alignItems:     'center',
    justifyContent: 'center',
    marginTop:      8,
  },
  addToCartBtnText: {
    color:      '#fff',
    fontSize:   12,
    fontWeight: '700',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  productCell: {
    width: '50%',
  },
  productCard: {
    borderRadius: 14,
    overflow:     'hidden',
    marginBottom: 12,
  },
  productImg: {
    height:         100,
    alignItems:     'center',
    justifyContent: 'center',
  },
  productGridLogo: {
    fontSize:      18,
    fontWeight:    '900',
    color:         'rgba(255,215,0,0.85)',
    letterSpacing: -0.5,
  },
  productGridCategory: {
    position:      'absolute',
    bottom:        5,
    left:          0,
    right:         0,
    textAlign:     'center',
    fontSize:      8,
    fontWeight:    '800',
    color:         'rgba(255,255,255,0.32)',
    letterSpacing: 1,
  },
  limitedBadgeSmall: {
    position:          'absolute',
    top:               6,
    right:             6,
    backgroundColor:   '#3B82F6',
    paddingHorizontal: 5,
    paddingVertical:   2,
    borderRadius:      5,
  },
  limitedBadgeSmallText: {
    color:      '#fff',
    fontSize:   8,
    fontWeight: '800',
  },
  inventoryBadgeSmall: {
    position:          'absolute',
    bottom:            6,
    left:              6,
    paddingHorizontal: 5,
    paddingVertical:   2,
    borderRadius:      5,
  },
  inventoryBadgeSmallText: {
    color:      '#fff',
    fontSize:   9,
    fontWeight: '700',
  },

  // Product detail sheet
  productSheetImg: {
    width:             '100%',
    height:            220,
    borderRadius:      16,
    alignItems:        'center',
    justifyContent:    'center',
    overflow:          'hidden',
  },
  productSheetLogoWrap: {
    width:           84,
    height:          84,
    borderRadius:    20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     'rgba(255,215,0,0.18)',
    marginBottom:    10,
  },
  productSheetLogo: {
    fontSize:      34,
    fontWeight:    '900',
    color:         'rgba(255,215,0,0.9)',
    letterSpacing: -1.5,
  },
  productSheetName: {
    color:             '#fff',
    fontSize:          17,
    fontWeight:        '700',
    opacity:           0.85,
    textAlign:         'center',
    paddingHorizontal: 20,
  },
  colorChip: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1.5,
  },
  colorChipText: {
    fontSize:   13,
    fontWeight: '600',
  },

  // Cart FAB
  cartFab: {
    position:       'absolute',
    right:          20,
    width:          56,
    height:         56,
    borderRadius:   28,
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#000',
    shadowOpacity:  0.2,
    shadowRadius:   8,
    shadowOffset:   { width: 0, height: 4 },
    elevation:      8,
    zIndex:         50,
  },
  cartBadge: {
    position:        'absolute',
    top:             -2,
    right:           -2,
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: '#fff',
    alignItems:      'center',
    justifyContent:  'center',
  },
  cartBadgeText: {
    fontSize:   11,
    fontWeight: '800',
    color:      '#3B82F6',
  },

  // Shared
  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },
});
