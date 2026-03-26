/**
 * Community Give — Quick Give, Campaigns, Giving History.
 * Three tabs via centered dropdown pill. RBAC: Admin ↔ Member.
 * Give tab: Cash App-style large amount input, fund pills, frequency toggle,
 * payment method selector, cover fees toggle, full-width Give button.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  FUNDS, GIVING_CAMPAIGNS, SAVED_PAYMENT_METHODS, MY_RECURRING_GIFTS,
  MY_PLEDGES, ALL_PLEDGES, GIVING_TRANSACTIONS, ADMIN_DASHBOARD,
  calcFee, formatCurrency, getPaymentIcon, formatDate, getFundById,
  getFeaturedCampaign,
  type FundId, type GiftFrequency,
} from '@/data/mock-give';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H      = 52;
const PILLS_H        = 48;
const PLEDGE_SHEET_H = 380;
const RECEIPT_SHEET_H = 420;

// ── Types ─────────────────────────────────────────────────────────────────────

type GiveTab = 'Give' | 'Campaigns' | 'History';

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillsForTab(tab: GiveTab, isAdmin: boolean): string[] {
  if (tab === 'Give') return [];
  if (tab === 'Campaigns') return ['All', 'Active', 'Completed', 'My Pledges'];
  return isAdmin
    ? ['All', 'This Week', 'This Month', 'This Year', 'By Fund']
    : ['Recurring', 'Tax Receipts'];
}

function campaignProgress(raised: number, goal: number): number {
  return goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
}

function daysRemaining(deadline: string): number {
  const today = new Date('2026-03-25');
  const end   = new Date(deadline);
  return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CommunityGiveScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const topBarH   = insets.top + TOP_BAR_H;
  const pillsAnim = useRef(new Animated.Value(0)).current;

  // ── Core state ──────────────────────────────────────────────────────────────
  const [isAdmin,      setIsAdmin]      = useState(true);
  const [activeTab,    setActiveTab]    = useState<GiveTab>('Give');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');

  // ── Give tab state ──────────────────────────────────────────────────────────
  const [amount,           setAmount]           = useState('');
  const [selectedFundId,   setSelectedFundId]   = useState<FundId>('tithe');
  const [frequency,        setFrequency]        = useState<GiftFrequency>('monthly');
  const [selectedMethodId, setSelectedMethodId] = useState(SAVED_PAYMENT_METHODS[0].id);
  const [coverFees,        setCoverFees]        = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // ── Admin dashboard state ───────────────────────────────────────────────────
  const [showAdminDash, setShowAdminDash] = useState(false);
  const [dashPeriod,    setDashPeriod]    = useState<'thisWeek' | 'thisMonth' | 'thisYear'>('thisMonth');

  // ── Campaigns tab state ─────────────────────────────────────────────────────
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [pledgeCampaignId,   setPledgeCampaignId]   = useState<string | null>(null);
  const pledgeAnim = useRef(new Animated.Value(0)).current;
  const [pledgeAmount,    setPledgeAmount]    = useState('');
  const [pledgeFrequency, setPledgeFrequency] = useState<GiftFrequency>('monthly');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignGoal, setNewCampaignGoal] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  // ── History tab state ────────────────────────────────────────────────────────
  const [memberHistoryPeriod, setMemberHistoryPeriod] = useState<'month' | 'year' | 'all'>('year');
  const [selectedTxId,        setSelectedTxId]        = useState<string | null>(null);
  const txSheetAnim = useRef(new Animated.Value(0)).current;

  // ── Derived ─────────────────────────────────────────────────────────────────
  const pills    = useMemo(() => pillsForTab(activeTab, isAdmin), [activeTab, isAdmin]);
  const amountNum = parseFloat(amount) || 0;
  const method   = SAVED_PAYMENT_METHODS.find(m => m.id === selectedMethodId) ?? SAVED_PAYMENT_METHODS[0];
  const feeAmt   = coverFees ? calcFee(amountNum, method.type) : 0;
  const totalAmt = amountNum + feeAmt;
  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;

  // ── Footer scroll ────────────────────────────────────────────────────────────
  const lastScrollY = useRef(0);
  const onScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y - lastScrollY.current > 10)      hideFooter();
    else if (lastScrollY.current - y > 10) showFooter();
    lastScrollY.current = y;
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Pills toggle ─────────────────────────────────────────────────────────────
  const togglePills = useCallback(() => {
    if (pills.length === 0) return;
    Haptics.selectionAsync();
    const toValue = pillsVisible ? 0 : 1;
    setPillsVisible(!pillsVisible);
    Animated.timing(pillsAnim, { toValue, duration: 200, useNativeDriver: false }).start();
  }, [pillsVisible, pills, pillsAnim]);

  // ── Tab change ───────────────────────────────────────────────────────────────
  const changeTab = useCallback((tab: GiveTab) => {
    Haptics.selectionAsync();
    const newPills = pillsForTab(tab, isAdmin);
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill(newPills[0] ?? 'All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setExpandedCampaignId(null);
  }, [isAdmin, pillsAnim]);

  // ── Role toggle ──────────────────────────────────────────────────────────────
  const handleRoleToggle = useCallback(() => {
    Haptics.selectionAsync();
    const newAdmin = !isAdmin;
    const newPills = pillsForTab(activeTab, newAdmin);
    setIsAdmin(newAdmin);
    setSelectedPill(newPills[0] ?? 'All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
  }, [isAdmin, activeTab, pillsAnim]);

  // ── Give submit ──────────────────────────────────────────────────────────────
  const handleGive = useCallback(() => {
    if (amountNum <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    setAmount('');
    setCoverFees(false);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  }, [amountNum, successAnim]);

  // ── Pledge open/close ────────────────────────────────────────────────────────
  const openPledge = useCallback((campaignId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPledgeCampaignId(campaignId);
    Animated.timing(pledgeAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [pledgeAnim]);

  const closePledge = useCallback(() => {
    Animated.timing(pledgeAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setPledgeCampaignId(null);
      setPledgeAmount('');
    });
  }, [pledgeAnim]);

  // ── Transaction detail open/close ────────────────────────────────────────────
  const openTxDetail = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTxId(id);
    Animated.timing(txSheetAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [txSheetAnim]);

  const closeTxDetail = useCallback(() => {
    Animated.timing(txSheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setSelectedTxId(null));
  }, [txSheetAnim]);

  // ── Render: Give tab ─────────────────────────────────────────────────────────

  function renderGiveTab() {
    const myTx    = GIVING_TRANSACTIONS.filter(t => t.isMe);
    const featured = getFeaturedCampaign();

    // Compute giving streak (consecutive months)
    const myMonths = [...new Set(myTx.map(t => t.date.slice(0, 7)))].sort().reverse();
    let givingStreak = 0;
    if (myMonths.length > 0) {
      const toYM = (s: string) => { const [y, m] = s.split('-').map(Number); return y * 12 + m; };
      givingStreak = 1;
      for (let i = 0; i < myMonths.length - 1; i++) {
        if (toYM(myMonths[i]) - toYM(myMonths[i + 1]) === 1) givingStreak++;
        else break;
      }
    }

    return (
      <>
        {/* Featured campaign banner (member only) */}
        {featured && !isAdmin && (
          <View style={[s.featuredBanner, { backgroundColor: C.surface }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                Featured Campaign
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }} numberOfLines={1}>{featured.name}</Text>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, marginTop: 8 }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${campaignProgress(featured.raisedAmount, featured.goalAmount)}%` as any }} />
              </View>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>
                {formatCurrency(featured.raisedAmount)} raised · {campaignProgress(featured.raisedAmount, featured.goalAmount)}% of goal
              </Text>
            </View>
          </View>
        )}

        {/* Amount input — Cash App style */}
        <View style={s.amountWrap}>
          <View style={s.amountRow}>
            <Text style={[s.amountDollar, { color: amountNum > 0 ? C.label : C.muted }]}>$</Text>
            <TextInput
              style={[s.amountInput, { color: C.label }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={C.muted}
              returnKeyType="done"
            />
          </View>
          {amountNum > 0 && coverFees && (
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center', marginTop: 4 }}>
              +{formatCurrency(feeAmt)} fee · Total {formatCurrency(totalAmt)}
            </Text>
          )}
        </View>

        {/* Fund pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -16, marginBottom: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
        >
          {FUNDS.map(fund => {
            const active = fund.id === selectedFundId;
            return (
              <Pressable
                key={fund.id}
                style={[s.fundPill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                onPress={() => { Haptics.selectionAsync(); setSelectedFundId(fund.id); }}
              >
                <Text style={[s.fundPillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>
                  {fund.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Frequency toggle */}
        <View style={[s.freqRow, { backgroundColor: C.surface, marginBottom: 12 }]}>
          {(['one-time', 'weekly', 'monthly'] as GiftFrequency[]).map(freq => {
            const active = freq === frequency;
            const label  = freq === 'one-time' ? 'One-Time' : freq.charAt(0).toUpperCase() + freq.slice(1);
            return (
              <Pressable
                key={freq}
                style={[s.freqBtn, active && s.freqBtnActive]}
                onPress={() => { Haptics.selectionAsync(); setFrequency(freq); }}
              >
                <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary }, active && { fontWeight: '700' }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Payment method selector */}
        <Pressable
          style={[s.methodRow, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.selectionAsync();
            const idx  = SAVED_PAYMENT_METHODS.findIndex(m => m.id === selectedMethodId);
            const next = SAVED_PAYMENT_METHODS[(idx + 1) % SAVED_PAYMENT_METHODS.length];
            setSelectedMethodId(next.id);
          }}
        >
          <IconSymbol name={getPaymentIcon(method.type) as any} size={20} color={C.secondary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 15, color: C.label, fontWeight: '500' }}>
              {method.label}{method.last4 ? ` •${method.last4}` : ''}{method.balance !== undefined ? ` · ${formatCurrency(method.balance)}` : ''}
            </Text>
            {method.isDefault && <Text style={{ fontSize: 11, color: C.muted }}>Default</Text>}
          </View>
          <IconSymbol name="chevron.up.chevron.down" size={16} color={C.muted} />
        </Pressable>

        {/* Cover the fees */}
        {amountNum > 0 && (
          <View style={[s.coverRow, { backgroundColor: C.surface }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Cover the Fees</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>
                Adds {formatCurrency(calcFee(amountNum, method.type))} so 100% reaches {getFundById(selectedFundId).name}
              </Text>
            </View>
            <Switch
              value={coverFees}
              onValueChange={setCoverFees}
              trackColor={{ false: C.separator, true: C.accent }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Give button */}
        <Pressable
          style={[s.giveBtn, { backgroundColor: amountNum > 0 ? C.accent : C.surfacePressed }]}
          onPress={handleGive}
        >
          <Text style={[s.giveBtnText, { color: amountNum > 0 ? '#fff' : C.muted }]}>
            {amountNum > 0 ? `Give ${formatCurrency(totalAmt)}` : 'Give'}
          </Text>
        </Pressable>

        {/* Recurring note */}
        {frequency !== 'one-time' && amountNum > 0 && (
          <Text style={{ fontSize: 12, color: C.secondary, textAlign: 'center', marginTop: 8 }}>
            You'll be charged {formatCurrency(totalAmt)} {frequency} starting today
          </Text>
        )}

        {/* Active recurring gifts */}
        {MY_RECURRING_GIFTS.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 28, marginBottom: 10 }]}>My Recurring Gifts</Text>
            {MY_RECURRING_GIFTS.map(rg => (
              <View key={rg.id} style={[s.recurringCard, { backgroundColor: C.surface }]}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>
                    {formatCurrency(rg.amount)}
                    <Text style={{ fontSize: 13, fontWeight: '400', color: C.secondary }}>
                      {' '}/ {rg.frequency === 'monthly' ? 'month' : rg.frequency === 'weekly' ? 'week' : 'once'}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 13, color: C.secondary }}>{getFundById(rg.fundId).name}</Text>
                  <Text style={{ fontSize: 12, color: C.muted }}>Next: {formatDate(rg.nextDate)}</Text>
                </View>
                <View style={{ gap: 6, alignItems: 'flex-end' }}>
                  <View style={{ backgroundColor: '#5A8A6E22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E' }}>Active</Text>
                  </View>
                  <Pressable
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.separator }}
                    onPress={() => Haptics.selectionAsync()}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Pause</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Recent Gifts */}
        {myTx.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 28, marginBottom: 10 }]}>Recent Gifts</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
              {myTx.slice(0, 3).map((tx, i) => (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    paddingVertical: 12, paddingHorizontal: 14,
                    borderBottomWidth: i < 2 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={getPaymentIcon(tx.paymentMethod) as any} size={16} color={C.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{getFundById(tx.fundId).name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{formatDate(tx.date)}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{formatCurrency(tx.amount)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Active campaign preview */}
        {featured && (() => {
          const pct = campaignProgress(featured.raisedAmount, featured.goalAmount);
          const days = daysRemaining(featured.deadline);
          return (
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginTop: 20, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconSymbol name="star.fill" size={12} color={C.accent} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Campaign</Text>
                {days > 0 && <Text style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' as any }}>{days} days left</Text>}
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{featured.name}</Text>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${pct}%` as any }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: C.secondary }}>{formatCurrency(featured.raisedAmount)} raised</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{pct}% of {formatCurrency(featured.goalAmount)}</Text>
              </View>
              <Pressable
                style={{ backgroundColor: C.accent, borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedFundId(featured.fundId); }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Give to Campaign</Text>
              </Pressable>
            </View>
          );
        })()}

        {/* Giving streak */}
        {givingStreak >= 2 && (
          <View style={{
            backgroundColor: '#5A8A6E11', borderRadius: 14, padding: 16, marginTop: 12,
            flexDirection: 'row', alignItems: 'center', gap: 12,
            borderWidth: 1, borderColor: '#5A8A6E22',
          }}>
            <IconSymbol name="flame.fill" size={22} color="#5A8A6E" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{givingStreak}-Month Giving Streak</Text>
              <Text style={{ fontSize: 12, color: '#5A8A6E' }}>Keep it going — next gift due Apr 1</Text>
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </>
    );
  }

  // ── Render: Campaigns tab ────────────────────────────────────────────────────

  function renderCampaignsAdmin() {
    if (selectedPill === 'My Pledges') {
      return (
        <>
          <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>All Pledges</Text>
          {ALL_PLEDGES.map(pledge => {
            const campaign = GIVING_CAMPAIGNS.find(c => c.id === pledge.campaignId);
            const pct = Math.min(100, Math.round((pledge.fulfilledAmount / pledge.totalPledged) * 100));
            return (
              <View key={pledge.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
                <View style={{ padding: 14, gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `hsl(${pledge.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{pledge.donorInitials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{pledge.donorName}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{campaign?.name}</Text>
                    </View>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                      backgroundColor: pledge.status === 'active' ? '#5A8A6E22' : pledge.status === 'fulfilled' ? '#1D9BF022' : C.surfacePressed,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: pledge.status === 'active' ? '#5A8A6E' : pledge.status === 'fulfilled' ? '#1D9BF0' : C.secondary }}>
                        {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${pct}%` as any }} />
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    {formatCurrency(pledge.amountPerPeriod)}/{pledge.frequency} · {formatCurrency(pledge.fulfilledAmount)} of {formatCurrency(pledge.totalPledged)} fulfilled
                  </Text>
                </View>
              </View>
            );
          })}
          <View style={{ height: 80 }} />
        </>
      );
    }

    const filter  = selectedPill === 'All' ? null : selectedPill.toLowerCase() as 'active' | 'completed';
    const visible = GIVING_CAMPAIGNS.filter(c => !filter || c.status === filter);
    const totalRaised = GIVING_CAMPAIGNS.reduce((a, c) => a + c.raisedAmount, 0);
    const totalDonors = GIVING_CAMPAIGNS.reduce((a, c) => a + c.donorCount, 0);
    const recentOtherTx = GIVING_TRANSACTIONS.filter(t => !t.isMe).slice(0, 5);

    return (
      <>
        {/* Stats row */}
        <View style={[s.statsRow, { backgroundColor: C.surface, marginBottom: 16 }]}>
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{GIVING_CAMPAIGNS.filter(c => c.status === 'active').length}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Active</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{formatCurrency(totalRaised)}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Total Raised</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{totalDonors.toLocaleString()}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Donors</Text>
          </View>
        </View>

        {visible.map(campaign => {
          const isExpanded = expandedCampaignId === campaign.id;
          const pct        = campaignProgress(campaign.raisedAmount, campaign.goalAmount);
          const pledges    = ALL_PLEDGES.filter(p => p.campaignId === campaign.id);
          const days       = daysRemaining(campaign.deadline);

          return (
            <View key={campaign.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
              <Pressable
                style={({ pressed }) => [s.campaignHeader, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => { Haptics.selectionAsync(); setExpandedCampaignId(isExpanded ? null : campaign.id); }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{campaign.name}</Text>
                    {campaign.featured && <IconSymbol name="star.fill" size={12} color={C.accent} />}
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                      backgroundColor: campaign.status === 'active' ? '#5A8A6E22' : C.surfacePressed,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: campaign.status === 'active' ? '#5A8A6E' : C.secondary }}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${pct}%` as any }} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{formatCurrency(campaign.raisedAmount)} / {formatCurrency(campaign.goalAmount)} · {pct}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>{campaign.donorCount} donors</Text>
                    {campaign.status === 'active' && (
                      <Text style={{ fontSize: 11, color: days <= 14 ? '#D97757' : C.muted }}>
                        {days > 0 ? `${days} days left` : 'Ended'}
                      </Text>
                    )}
                  </View>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} style={{ marginLeft: 10 }} />
              </Pressable>

              {isExpanded && (
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, padding: 14, gap: 12 }}>
                  <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{campaign.description}</Text>
                  <View style={{ flexDirection: 'row', gap: 20 }}>
                    <View><Text style={{ fontSize: 10, color: C.secondary }}>DONORS</Text><Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{campaign.donorCount}</Text></View>
                    <View><Text style={{ fontSize: 10, color: C.secondary }}>DEADLINE</Text><Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{formatDate(campaign.deadline)}</Text></View>
                    <View><Text style={{ fontSize: 10, color: C.secondary }}>FUND</Text><Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{getFundById(campaign.fundId).name}</Text></View>
                  </View>

                  {pledges.length > 0 && (
                    <>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Pledges ({pledges.length})
                      </Text>
                      {pledges.map(pledge => (
                        <View key={pledge.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: `hsl(${pledge.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{pledge.donorInitials}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{pledge.donorName}</Text>
                            <Text style={{ fontSize: 11, color: C.secondary }}>
                              {formatCurrency(pledge.amountPerPeriod)}/{pledge.frequency} · {formatCurrency(pledge.fulfilledAmount)} fulfilled
                            </Text>
                          </View>
                          <View style={{
                            paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
                            backgroundColor: pledge.status === 'active' ? '#5A8A6E22' : pledge.status === 'fulfilled' ? '#1D9BF022' : C.surfacePressed,
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: pledge.status === 'active' ? '#5A8A6E' : pledge.status === 'fulfilled' ? '#1D9BF0' : C.secondary }}>
                              {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Below-list: impact + activity + suggested (All pill only) */}
        {selectedPill === 'All' && (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 24, marginBottom: 12 }]}>Campaign Impact</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                {([
                  { label: 'Total Raised', value: formatCurrency(totalRaised),          color: C.accent },
                  { label: 'Total Donors', value: totalDonors.toLocaleString(),          color: C.label },
                  { label: 'Campaigns',    value: GIVING_CAMPAIGNS.length.toString(),    color: C.secondary },
                ] as const).map((stat, i) => (
                  <View key={stat.label} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 2 ? StyleSheet.hairlineWidth : 0, borderRightColor: C.separator }}>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 16, marginBottom: 10 }]}>Recent Donor Activity</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
              {recentOtherTx.map((tx, i) => (
                <View key={tx.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  paddingVertical: 11, paddingHorizontal: 14,
                  borderBottomWidth: i < recentOtherTx.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `hsl(${tx.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{tx.donorInitials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{tx.donorName}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{formatCurrency(tx.amount)} · {getFundById(tx.fundId).name}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: C.muted }}>{formatDate(tx.date)}</Text>
                </View>
              ))}
            </View>

            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 16, marginBottom: 10 }]}>Suggested Campaigns</Text>
            {([
              { icon: 'calendar.badge.clock', title: 'Launch a Giving Day', desc: 'Create urgency with a 24-hour giving challenge' },
              { icon: 'graduationcap.fill',   title: 'Start a Scholarship Fund', desc: 'Support church members pursuing education' },
            ] as const).map(sugg => (
              <Pressable
                key={sugg.title}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? C.surfacePressed : C.surface,
                  borderRadius: 12, padding: 14, marginBottom: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                })}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCreateCampaign(true); }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={sugg.icon as any} size={18} color={C.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{sugg.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{sugg.desc}</Text>
                </View>
                <IconSymbol name="plus.circle.fill" size={20} color={C.accent} />
              </Pressable>
            ))}
          </>
        )}

        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderCampaignsMember() {
    if (selectedPill === 'My Pledges') {
      if (MY_PLEDGES.length === 0) {
        return (
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>No pledges yet</Text>
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Pledge toward a campaign to track your commitment.</Text>
          </View>
        );
      }
      return (
        <>
          {MY_PLEDGES.map(pledge => {
            const campaign = GIVING_CAMPAIGNS.find(c => c.id === pledge.campaignId);
            const pct = Math.min(100, Math.round((pledge.fulfilledAmount / pledge.totalPledged) * 100));
            return (
              <View key={pledge.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
                <View style={{ padding: 16, gap: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{campaign?.name}</Text>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, color: C.secondary }}>{formatCurrency(pledge.amountPerPeriod)} / {pledge.frequency}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.accent }}>{pct}%</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${pct}%` as any }} />
                    </View>
                    <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>
                      {formatCurrency(pledge.fulfilledAmount)} of {formatCurrency(pledge.totalPledged)} pledged
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: C.surfacePressed }}
                      onPress={() => Haptics.selectionAsync()}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Pause</Text>
                    </Pressable>
                    <Pressable
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: C.accent }}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Give Now</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </>
      );
    }

    const filter  = selectedPill === 'Completed' ? 'completed' : 'active';
    const visible = selectedPill === 'All' ? GIVING_CAMPAIGNS : GIVING_CAMPAIGNS.filter(c => c.status === filter);

    return (
      <>
        {visible.map(campaign => {
          const pct = campaignProgress(campaign.raisedAmount, campaign.goalAmount);
          return (
            <View key={campaign.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
              <View style={{ padding: 16, gap: 10 }}>
                {campaign.featured && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name="star.fill" size={11} color={C.accent} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>Featured</Text>
                  </View>
                )}
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{campaign.name}</Text>
                <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }} numberOfLines={3}>{campaign.description}</Text>
                <View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator, marginBottom: 6 }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${pct}%` as any }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{formatCurrency(campaign.raisedAmount)} raised</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{pct}% of {formatCurrency(campaign.goalAmount)}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 11, color: C.muted }}>{campaign.donorCount} donors</Text>
                  {campaign.status === 'active' && (() => {
                    const d = daysRemaining(campaign.deadline);
                    return <Text style={{ fontSize: 11, color: d <= 14 ? '#D97757' : C.muted }}>{d > 0 ? `${d} days left` : 'Ended'}</Text>;
                  })()}
                </View>
                {campaign.status === 'active' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <Pressable
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.separator }}
                      onPress={() => openPledge(campaign.id)}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>Pledge</Text>
                    </Pressable>
                    <Pressable
                      style={{ flex: 2, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: C.accent }}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedFundId(campaign.fundId); changeTab('Give'); }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Give to Campaign</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </>
    );
  }

  // ── Render: History tab ──────────────────────────────────────────────────────

  function renderHistoryMember() {
    const allMyTx = GIVING_TRANSACTIONS.filter(t => t.isMe);

    if (selectedPill === 'Recurring') {
      return (
        <>
          <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>Active Recurring Gifts</Text>
          {MY_RECURRING_GIFTS.map(rg => (
            <View key={rg.id} style={[s.recurringCard, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>
                  {formatCurrency(rg.amount)}
                  <Text style={{ fontSize: 13, fontWeight: '400', color: C.secondary }}>
                    {' '}/ {rg.frequency === 'monthly' ? 'month' : 'week'}
                  </Text>
                </Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>{getFundById(rg.fundId).name}</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>Next charge: {formatDate(rg.nextDate)}</Text>
              </View>
              <View style={{ gap: 6, alignItems: 'flex-end' }}>
                <View style={{ backgroundColor: '#5A8A6E22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E' }}>Active</Text>
                </View>
                <Pressable
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.separator }}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Pause</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </>
      );
    }

    if (selectedPill === 'Tax Receipts') {
      const total2025 = allMyTx.filter(t => t.date.startsWith('2025')).reduce((acc, t) => acc + t.amount, 0);
      const total2026 = allMyTx.filter(t => t.date.startsWith('2026')).reduce((acc, t) => acc + t.amount, 0);
      return (
        <>
          <View style={[s.taxCard, { backgroundColor: C.surface }]}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>2025 Annual Giving</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>{formatCurrency(total2025)}</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2, marginBottom: 16 }}>
              {allMyTx.filter(t => t.date.startsWith('2025')).length} gifts · ICCLA · EIN 83-1234567
            </Text>
            <Pressable
              style={{ backgroundColor: C.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Download 2025 Tax Receipt</Text>
            </Pressable>
          </View>
          <View style={[s.taxCard, { backgroundColor: C.surfacePressed, marginTop: 10 }]}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>2026 Year to Date</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: C.label }}>{formatCurrency(total2026)}</Text>
            <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Receipt available at year end</Text>
          </View>
          <View style={{ height: 40 }} />
        </>
      );
    }

    // Default view: period toggle + grouped transactions
    let filtered = allMyTx;
    if (memberHistoryPeriod === 'month') filtered = allMyTx.filter(t => t.date.startsWith('2026-03'));
    if (memberHistoryPeriod === 'year')  filtered = allMyTx.filter(t => t.date.startsWith('2026'));

    const periodTotal   = filtered.reduce((acc, t) => acc + t.amount, 0);
    const periodGifts   = filtered.length;
    const periodAvg     = periodGifts > 0 ? Math.round(periodTotal / periodGifts) : 0;

    // Group by month
    const groups: Array<{ label: string; txs: typeof allMyTx; subtotal: number }> = [];
    const seen: Record<string, number> = {};
    filtered.forEach(tx => {
      const key = tx.date.slice(0, 7);
      if (seen[key] === undefined) {
        const [y, m] = key.split('-').map(Number);
        const mName  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
        seen[key] = groups.length;
        groups.push({ label: `${mName} ${y}`, txs: [], subtotal: 0 });
      }
      groups[seen[key]].txs.push(tx);
      groups[seen[key]].subtotal += tx.amount;
    });

    // By-fund breakdown (all time)
    const byFundMap: Record<string, number> = {};
    allMyTx.forEach(tx => { byFundMap[tx.fundId] = (byFundMap[tx.fundId] ?? 0) + tx.amount; });
    const fundBreakdown = Object.entries(byFundMap).sort((a, b) => b[1] - a[1]);
    const lifetimeTotal = allMyTx.reduce((acc, t) => acc + t.amount, 0);

    return (
      <>
        {/* Stats bar */}
        <View style={[s.statsRow, { backgroundColor: C.surface, marginBottom: 16 }]}>
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.accent }]}>{formatCurrency(periodTotal)}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Total</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{periodGifts}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Gifts</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{formatCurrency(periodAvg)}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Avg</Text>
          </View>
        </View>

        {/* Period toggle */}
        <View style={[s.freqRow, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {([
            { key: 'month', label: 'This Month' },
            { key: 'year',  label: 'This Year'  },
            { key: 'all',   label: 'All Time'   },
          ] as const).map(({ key, label }) => {
            const active = memberHistoryPeriod === key;
            return (
              <Pressable
                key={key}
                style={[s.freqBtn, active && s.freqBtnActive]}
                onPress={() => { Haptics.selectionAsync(); setMemberHistoryPeriod(key); }}
              >
                <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary }, active && { fontWeight: '700' }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Grouped transactions */}
        {groups.length === 0 && (
          <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 20 }}>No transactions for this period.</Text>
        )}
        {groups.map(group => (
          <View key={group.label} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{group.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.accent }}>{formatCurrency(group.subtotal)}</Text>
            </View>
            <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
              {group.txs.map((tx, i) => (
                <Pressable
                  key={tx.id}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    paddingVertical: 12, paddingHorizontal: 14,
                    borderBottomWidth: i < group.txs.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                    backgroundColor: pressed ? C.surfacePressed : 'transparent',
                  })}
                  onPress={() => openTxDetail(tx.id)}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={getPaymentIcon(tx.paymentMethod) as any} size={16} color={C.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{getFundById(tx.fundId).name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{formatDate(tx.date)} · {tx.frequency}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{formatCurrency(tx.amount)}</Text>
                    <IconSymbol name="chevron.right" size={10} color={C.muted} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Giving breakdown by fund */}
        <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 8, marginBottom: 12 }]}>My Giving by Fund</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 12, marginBottom: 12 }}>
          {fundBreakdown.map(([fundId, amt]) => {
            const pct = lifetimeTotal > 0 ? Math.round((amt / lifetimeTotal) * 100) : 0;
            return (
              <View key={fundId}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: C.label }}>{getFundById(fundId as FundId).name}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{formatCurrency(amt)}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{pct}%</Text>
                  </View>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${pct}%` as any }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Download tax receipt */}
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? C.surfacePressed : C.surface,
            borderRadius: 14, padding: 16,
            flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
          })}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <IconSymbol name="doc.text.fill" size={20} color={C.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Download 2025 Tax Receipt</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>ICCLA · EIN 83-1234567</Text>
          </View>
          <IconSymbol name="arrow.down.circle.fill" size={20} color={C.accent} />
        </Pressable>

        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderHistoryAdmin() {
    const isByFund = selectedPill === 'By Fund';
    let filtered   = GIVING_TRANSACTIONS;
    if (selectedPill === 'This Week')  filtered = GIVING_TRANSACTIONS.filter(t => t.date >= '2026-03-18');
    if (selectedPill === 'This Month') filtered = GIVING_TRANSACTIONS.filter(t => t.date.startsWith('2026-03'));
    if (selectedPill === 'This Year')  filtered = GIVING_TRANSACTIONS.filter(t => t.date.startsWith('2026'));

    const period = selectedPill === 'This Week' ? 'thisWeek' : selectedPill === 'This Year' ? 'thisYear' : 'thisMonth';
    const dash   = ADMIN_DASHBOARD[period as 'thisWeek' | 'thisMonth' | 'thisYear'];

    return (
      <>
        {/* Stats */}
        <View style={[s.statsRow, { backgroundColor: C.surface, marginBottom: 16 }]}>
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.accent }]}>{formatCurrency(dash.total)}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Total</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{dash.givers}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Givers</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{formatCurrency(dash.avgGift)}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Avg Gift</Text>
          </View>
        </View>

        {isByFund ? (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 12 }]}>Giving by Fund</Text>
            {ADMIN_DASHBOARD.byFund.map(fb => (
              <View key={fb.fundId} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, color: C.label }}>{getFundById(fb.fundId).name}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{formatCurrency(fb.amount)}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{fb.percentage}%</Text>
                  </View>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${fb.percentage}%` as any }} />
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {filtered.length === 0 && (
              <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 20 }}>No transactions.</Text>
            )}
            {(() => {
              const adminGroups: Array<{ label: string; txs: typeof filtered; subtotal: number }> = [];
              const adminSeen: Record<string, number> = {};
              filtered.forEach(tx => {
                const key = tx.date.slice(0, 7);
                if (adminSeen[key] === undefined) {
                  const [y, m] = key.split('-').map(Number);
                  const mName  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
                  adminSeen[key] = adminGroups.length;
                  adminGroups.push({ label: `${mName} ${y}`, txs: [], subtotal: 0 });
                }
                adminGroups[adminSeen[key]].txs.push(tx);
                adminGroups[adminSeen[key]].subtotal += tx.amount;
              });
              return adminGroups.map(group => (
                <View key={group.label} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{group.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.accent }}>{formatCurrency(group.subtotal)}</Text>
                  </View>
                  <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                    {group.txs.map((tx, i) => (
                      <Pressable
                        key={tx.id}
                        style={({ pressed }) => ({
                          flexDirection: 'row', alignItems: 'center', gap: 10,
                          paddingVertical: 11, paddingHorizontal: 14,
                          borderBottomWidth: i < group.txs.length - 1 ? StyleSheet.hairlineWidth : 0,
                          borderBottomColor: C.separator,
                          backgroundColor: pressed ? C.surfacePressed : 'transparent',
                        })}
                        onPress={() => openTxDetail(tx.id)}
                      >
                        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `hsl(${tx.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{tx.donorInitials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{tx.donorName}</Text>
                          <Text style={{ fontSize: 12, color: C.secondary }}>{getFundById(tx.fundId).name} · {formatDate(tx.date)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{formatCurrency(tx.amount)}</Text>
                          <IconSymbol name="chevron.right" size={10} color={C.muted} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ));
            })()}
          </>
        )}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderContent() {
    if (activeTab === 'Give')      return renderGiveTab();
    if (activeTab === 'Campaigns') return isAdmin ? renderCampaignsAdmin() : renderCampaignsMember();
    return isAdmin ? renderHistoryAdmin() : renderHistoryMember();
  }

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* Create Campaign FAB (admin campaigns tab) */}
      {isAdmin && activeTab === 'Campaigns' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCreateCampaign(true); }}
        >
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>New Campaign</Text>
        </Pressable>
      )}

      {/* Absolute top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left */}
          <View style={s.topBarSide}>
            {isAdmin && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
                hitSlop={12}
              >
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            )}
          </View>

          {/* Center: dropdown pill */}
          <View style={s.dropdownPillWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            >
              <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right */}
          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }]}>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={12}>
                <IconSymbol
                  name={pillsVisible || selectedPill !== pills[0] ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={pillsVisible || selectedPill !== pills[0] ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Pills row */}
        <Animated.View style={{ height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }), opacity: pillsAnim, overflow: 'hidden' }}>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={[s.pillsRow, { borderTopColor: C.separator }]}
            contentContainerStyle={s.pillsContent}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[s.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>{pill}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <>
          <Pressable
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 98 } as any}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[s.dropdown, { backgroundColor: C.surface, borderColor: C.separator, top: insets.top + TOP_BAR_H }]}>
            {(['Give', 'Campaigns', 'History'] as GiveTab[]).map(tab => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  s.dropdownOpt, { borderBottomColor: C.separator },
                  (pressed || tab === activeTab) && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => changeTab(tab)}
              >
                <Text style={[s.dropdownOptText, { color: tab === activeTab ? C.accent : C.label }]}>{tab}</Text>
                {tab === activeTab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Success toast */}
      {showSuccess && (
        <Animated.View
          style={[
            s.successToast,
            { bottom: insets.bottom + 100 },
            { opacity: successAnim, transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
          ]}
        >
          <IconSymbol name="checkmark.circle.fill" size={18} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Gift received! Thank you.</Text>
        </Animated.View>
      )}

      {/* Pledge form slide-up sheet */}
      {pledgeCampaignId && (
        <>
          <Animated.View
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: pledgeAnim } as any}
          >
            <Pressable style={{ flex: 1 }} onPress={closePledge} />
          </Animated.View>
          <Animated.View
            style={[
              s.pledgeSheet,
              { backgroundColor: C.bg, zIndex: 50, paddingBottom: insets.bottom + 16 },
              { transform: [{ translateY: pledgeAnim.interpolate({ inputRange: [0, 1], outputRange: [PLEDGE_SHEET_H, 0] }) }] },
            ]}
          >
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.separator }} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingHorizontal: 20, marginBottom: 2 }}>Make a Pledge</Text>
            <Text style={{ fontSize: 13, color: C.secondary, paddingHorizontal: 20, marginBottom: 20 }}>
              {GIVING_CAMPAIGNS.find(c => c.id === pledgeCampaignId)?.name}
            </Text>

            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Amount per Period</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ fontSize: 18, color: C.muted, marginRight: 4 }}>$</Text>
                <TextInput
                  style={{ flex: 1, fontSize: 18, color: C.label }}
                  value={pledgeAmount}
                  onChangeText={setPledgeAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                />
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 8 }}>Frequency</Text>
              <View style={[s.freqRow, { backgroundColor: C.surface }]}>
                {(['monthly', 'weekly', 'one-time'] as GiftFrequency[]).map(freq => {
                  const active = freq === pledgeFrequency;
                  const label  = freq === 'one-time' ? 'One-Time' : freq.charAt(0).toUpperCase() + freq.slice(1);
                  return (
                    <Pressable
                      key={freq}
                      style={[s.freqBtn, active && s.freqBtnActive]}
                      onPress={() => { Haptics.selectionAsync(); setPledgeFrequency(freq); }}
                    >
                      <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary }, active && { fontWeight: '700' }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              style={{ marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); closePledge(); }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Confirm Pledge</Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      {/* Transaction receipt sheet */}
      {selectedTxId && (() => {
        const tx = GIVING_TRANSACTIONS.find(t => t.id === selectedTxId);
        if (!tx) return null;
        const methodLabel = tx.paymentMethod === 'card' ? 'Credit/Debit Card'
          : tx.paymentMethod === 'bank'      ? 'Bank Transfer'
          : tx.paymentMethod === 'apple_pay' ? 'Apple Pay'
          : 'KayPay';
        return (
          <>
            <Animated.View
              style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: txSheetAnim } as any}
            >
              <Pressable style={{ flex: 1 }} onPress={closeTxDetail} />
            </Animated.View>
            <Animated.View
              style={[
                s.receiptSheet,
                { backgroundColor: C.bg, zIndex: 50, paddingBottom: insets.bottom + 16 },
                { transform: [{ translateY: txSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [RECEIPT_SHEET_H, 0] }) }] },
              ]}
            >
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.separator }} />
              </View>
              <View style={{ alignItems: 'center', paddingVertical: 16, gap: 2 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#5A8A6E22', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <IconSymbol name="checkmark.circle.fill" size={26} color="#5A8A6E" />
                </View>
                <Text style={{ fontSize: 30, fontWeight: '800', color: C.label }}>{formatCurrency(tx.amount)}</Text>
                <Text style={{ fontSize: 14, color: C.secondary }}>{getFundById(tx.fundId).name}</Text>
              </View>
              <View style={{ marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                {([
                  { label: 'Date',           value: formatDate(tx.date) },
                  { label: 'Fund',           value: getFundById(tx.fundId).name },
                  { label: 'Frequency',      value: tx.frequency.charAt(0).toUpperCase() + tx.frequency.slice(1) },
                  { label: 'Payment',        value: methodLabel },
                  { label: 'Confirmation',   value: `#ICCLA-${tx.id.toUpperCase()}` },
                  { label: 'Tax Deductible', value: 'Yes' },
                ] as const).map((row, i, arr) => (
                  <View key={row.label} style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                  }}>
                    <Text style={{ fontSize: 13, color: C.secondary }}>{row.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{row.value}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                style={{ marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); closeTxDetail(); }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Download Receipt</Text>
              </Pressable>
            </Animated.View>
          </>
        );
      })()}

      {/* Create Campaign full-screen overlay */}
      {showCreateCampaign && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 60, backgroundColor: C.bg } as any}>
          <View style={{
            paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12,
            backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <Pressable onPress={() => setShowCreateCampaign(false)} hitSlop={12}>
              <IconSymbol name="xmark" size={20} color={C.label} />
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }}>New Campaign</Text>
            <Pressable
              style={{ backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setShowCreateCampaign(false); setNewCampaignName(''); setNewCampaignGoal(''); setNewCampaignDesc(''); }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Create</Text>
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Campaign Name *</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <TextInput style={{ fontSize: 15, color: C.label }} placeholder="e.g. Christmas 2026" placeholderTextColor={C.muted} value={newCampaignName} onChangeText={setNewCampaignName} />
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Goal Amount *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ fontSize: 15, color: C.muted, marginRight: 4 }}>$</Text>
                <TextInput style={{ flex: 1, fontSize: 15, color: C.label }} placeholder="10,000" placeholderTextColor={C.muted} keyboardType="decimal-pad" value={newCampaignGoal} onChangeText={setNewCampaignGoal} />
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Description</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <TextInput style={{ fontSize: 15, color: C.label, minHeight: 100, textAlignVertical: 'top' }} placeholder="Describe your campaign…" placeholderTextColor={C.muted} multiline value={newCampaignDesc} onChangeText={setNewCampaignDesc} />
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Admin Dashboard full-screen overlay */}
      {showAdminDash && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 70, backgroundColor: C.bg } as any}>
          <View style={{
            paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12,
            borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Pressable onPress={() => setShowAdminDash(false)} hitSlop={12}>
              <IconSymbol name="xmark" size={20} color={C.label} />
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }}>Giving Dashboard</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
            {/* Period toggle */}
            <View style={[s.freqRow, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {([
                { key: 'thisWeek',  label: 'This Week'  },
                { key: 'thisMonth', label: 'This Month' },
                { key: 'thisYear',  label: 'This Year'  },
              ] as const).map(({ key, label }) => {
                const active = dashPeriod === key;
                return (
                  <Pressable
                    key={key}
                    style={[s.freqBtn, active && s.freqBtnActive]}
                    onPress={() => { Haptics.selectionAsync(); setDashPeriod(key); }}
                  >
                    <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary }, active && { fontWeight: '700' }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Stats grid */}
            {(() => {
              const dash = ADMIN_DASHBOARD[dashPeriod];
              return (
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  {([
                    { label: 'Total',    value: formatCurrency(dash.total),   color: C.accent  },
                    { label: 'Givers',   value: dash.givers.toString(),       color: '#5A8A6E' },
                    { label: 'Avg Gift', value: formatCurrency(dash.avgGift), color: C.label   },
                  ] as const).map(stat => (
                    <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                      <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              );
            })()}

            {/* Recurring vs one-time */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#5A8A6E' }}>{ADMIN_DASHBOARD.recurringCount}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Recurring</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{ADMIN_DASHBOARD.oneTimeCount}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>One-Time</Text>
              </View>
            </View>

            {/* 6-month trend bar chart */}
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 12 }]}>6-Month Trend</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 24 }}>
              {(() => {
                const chartMax = Math.max(...ADMIN_DASHBOARD.trendData.map(d => d.amount));
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 }}>
                    {ADMIN_DASHBOARD.trendData.map(point => {
                      const barH      = Math.max(4, (point.amount / chartMax) * 88);
                      const isCurrent = point.month === 'Mar';
                      return (
                        <View key={point.month} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <View style={{ height: barH, borderRadius: 4, backgroundColor: isCurrent ? C.accent : C.accent + '55' }} />
                          </View>
                          <Text style={{ fontSize: 9, color: isCurrent ? C.label : C.muted, fontWeight: isCurrent ? '700' : '400' }}>
                            {point.month}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </View>

            {/* Fund breakdown */}
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 12 }]}>Giving by Fund</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 14 }}>
              {ADMIN_DASHBOARD.byFund.map(fb => (
                <View key={fb.fundId}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, color: C.label }}>{getFundById(fb.fundId).name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{formatCurrency(fb.amount)}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{fb.percentage}%</Text>
                    </View>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${fb.percentage}%` as any }} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:          { flex: 1 },
  topBarWrap:      { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:          { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:      { width: 86, justifyContent: 'center' },
  dropdownPillWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dropdownPillText:{ fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  rbacToggle:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  rbacToggleText:  { fontSize: 11, fontWeight: '700' },
  pillsRow:        { height: PILLS_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent:    { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText:        { fontSize: 13 },

  dropdown: {
    position: 'absolute', left: '50%' as any, marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, zIndex: 99, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 8,
  },
  dropdownOpt:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownOptText: { flex: 1, fontSize: 15, fontWeight: '600' },

  // Amount input
  amountWrap:  { alignItems: 'center', paddingVertical: 24 },
  amountRow:   { flexDirection: 'row', alignItems: 'flex-end' },
  amountDollar:{ fontSize: 40, fontWeight: '700', marginRight: 2, paddingBottom: 6 },
  amountInput: { fontSize: 72, fontWeight: '800', minWidth: 80, letterSpacing: -2 },

  // Fund pills
  fundPill:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  fundPillText: { fontSize: 14 },

  // Frequency toggle
  freqRow:       { flexDirection: 'row', padding: 4, borderRadius: 14 },
  freqBtn:       { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  freqBtnActive: { backgroundColor: '#F5EFE4', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  freqBtnText:   { fontSize: 14 },

  // Payment method
  methodRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 12 },

  // Cover fees
  coverRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 16 },

  // Give button
  giveBtn:     { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  giveBtnText: { fontSize: 18, fontWeight: '800' },

  // Admin banner
  adminBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, marginBottom: 16 },

  // Featured banner
  featuredBanner: { borderRadius: 14, padding: 16, marginBottom: 16 },

  // Campaign card
  campaignCard:   { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },

  // Stats row
  statsRow:    { flexDirection: 'row', borderRadius: 12, padding: 12 },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 15, fontWeight: '800' },
  statLabel:   { fontSize: 10, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28, alignSelf: 'center' },

  // Recurring card
  recurringCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 16, marginBottom: 10 },

  // Tax receipt
  taxCard: { borderRadius: 14, padding: 20 },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Success toast
  successToast: {
    position: 'absolute', left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#5A8A6E', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },

  // Pledge sheet
  pledgeSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: PLEDGE_SHEET_H,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },
  receiptSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: RECEIPT_SHEET_H,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },

  // FAB
  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 28,
    backgroundColor: C.accent,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
