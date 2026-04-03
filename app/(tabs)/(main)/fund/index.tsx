/**
 * Education Fund — Give, Campaigns, History.
 * Three tabs via centered dropdown pill. RBAC: Admin ↔ Donor.
 * Give tab: amount input, 6 fund pills, 4-frequency toggle,
 * payment method selector, cover fees, employer matching, gift dedication.
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, Switch, ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import {
  FUNDS, FUND_CAMPAIGNS, SAVED_PAYMENT_METHODS, MY_RECURRING_GIFTS,
  MY_PLEDGE, FUND_TRANSACTIONS, ADMIN_DASHBOARD, SCHOLARSHIPS,
  calcFee, formatCurrency, getPaymentIcon, formatDate, getFundById,
  campaignTypeColor, campaignTypeLabel, formatTimeRemaining, lookupEmployerMatch,
  lifetimeGiving,
  type FundFundId, type FundGiftFrequency,
} from '@/data/mock-fund';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H     = 52;
const PILLS_H       = 48;
const DONOR_SHEET_H = 480;
const P2P_SHEET_H   = 420;
const RECEIPT_SHEET_H = 420;

// ── Types ─────────────────────────────────────────────────────────────────────

type FundTab = 'Give' | 'Campaigns' | 'History';

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillsForTab(tab: FundTab, isAdmin: boolean): string[] {
  if (tab === 'Give') return [];
  if (tab === 'Campaigns') return ['All', 'Active', 'Upcoming', 'Giving Days', 'Scholarship', 'Capital', 'P2P', 'Completed'];
  return isAdmin
    ? ['All', 'This Week', 'This Month', 'This Year', 'By Fund', 'By Class Year']
    : ['All', 'This Year', 'Recurring', 'Tax Receipts', 'Pledges'];
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

export default function EducationFundScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const topBarH   = insets.top + TOP_BAR_H;
  const pillsAnim = useRef(new Animated.Value(0)).current;

  // ── RBAC role ───────────────────────────────────────────────────────────────
  const [demoRole, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isAdmin = demoRole === roleCycles[0];

  // ── Navigation state ────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<FundTab>('Give');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');

  // ── Give tab state ──────────────────────────────────────────────────────────
  const [amount,           setAmount]           = useState('');
  const [selectedFundId,   setSelectedFundId]   = useState<FundFundId>('annual');
  const [frequency,        setFrequency]        = useState<FundGiftFrequency>('one-time');
  const [selectedMethodId, setSelectedMethodId] = useState(SAVED_PAYMENT_METHODS[0].id);
  const [coverFees,        setCoverFees]        = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // ── Employer matching state ──────────────────────────────────────────────────
  const [matchChecked,      setMatchChecked]      = useState(false);
  const [employerName,      setEmployerName]      = useState('');
  const [matchLookupState,  setMatchLookupState]  = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle');
  const [matchPolicy,       setMatchPolicy]       = useState<ReturnType<typeof lookupEmployerMatch>>(null);
  const matchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Dedicate state ──────────────────────────────────────────────────────────
  const [dedicateOn,   setDedicateOn]   = useState(false);
  const [dedicateType, setDedicateType] = useState<'honor' | 'memory'>('honor');
  const [dedicateName, setDedicateName] = useState('');

  // ── Admin dashboard state ────────────────────────────────────────────────────
  const [showAdminDash, setShowAdminDash] = useState(false);
  const [dashPeriod,    setDashPeriod]    = useState<'thisWeek' | 'thisMonth' | 'thisYear'>('thisMonth');

  // ── Campaigns state ─────────────────────────────────────────────────────────
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaignName,    setNewCampaignName]    = useState('');
  const [newCampaignGoal,    setNewCampaignGoal]    = useState('');
  const [newCampaignDesc,    setNewCampaignDesc]    = useState('');

  // ── Giving day state ─────────────────────────────────────────────────────────
  const [givingDayCountdown, setGivingDayCountdown] = useState('');
  const [liveCountTick,      setLiveCountTick]      = useState(0);
  const [showConfetti,       setShowConfetti]       = useState(false);
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;

  // ── P2P state ────────────────────────────────────────────────────────────────
  const [showP2PCreator, setShowP2PCreator] = useState(false);
  const [p2pGoal,        setP2pGoal]        = useState('');
  const [p2pMessage,     setP2pMessage]     = useState('');
  const p2pAnim = useRef(new Animated.Value(0)).current;

  // ── History state ────────────────────────────────────────────────────────────
  const [memberHistoryPeriod, setMemberHistoryPeriod] = useState<'month' | 'year' | 'all'>('year');
  const [selectedDonorTxId,   setSelectedDonorTxId]   = useState<string | null>(null);
  const [selectedTxId,        setSelectedTxId]        = useState<string | null>(null);
  const donorSheetAnim = useRef(new Animated.Value(0)).current;
  const txSheetAnim    = useRef(new Animated.Value(0)).current;

  // ── Scholarships state ───────────────────────────────────────────────────────
  const [expandedScholarshipId, setExpandedScholarshipId] = useState<string | null>(null);

  // ── Education President Finance tab ──────────────────────────────────────────
  const [presidentTab, setPresidentTab] = useState<'Overview' | 'Tuition' | 'Budget' | 'Aid'>('Overview');

  // ── Derived ─────────────────────────────────────────────────────────────────
  const pills             = useMemo(() => pillsForTab(activeTab, isAdmin), [activeTab, isAdmin]);
  const amountNum         = parseFloat(amount) || 0;
  const method            = SAVED_PAYMENT_METHODS.find(m => m.id === selectedMethodId) ?? SAVED_PAYMENT_METHODS[0];
  const feeAmt            = coverFees ? calcFee(amountNum, method.type) : 0;
  const totalAmt          = amountNum + feeAmt;
  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;

  // ── Footer scroll ─────────────────────────────────────────────────────────
  const lastScrollY = useRef(0);
  const onScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y - lastScrollY.current > 10)      hideFooter();
    else if (lastScrollY.current - y > 10) showFooter();
    lastScrollY.current = y;
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));
  useEffect(() => () => { resetFooter(); }, []);

  // ── Effects ─────────────────────────────────────────────────────────────────

  // 1. Giving day countdown
  useEffect(() => {
    const gd = FUND_CAMPAIGNS.find(c => c.type === 'giving-day' && c.status === 'active' && c.endDatetime);
    if (!gd?.endDatetime) return;
    const iv = setInterval(() => {
      setGivingDayCountdown(formatTimeRemaining(gd.endDatetime!));
      setLiveCountTick(t => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // 2. Confetti on mount if giving day >= 67%
  useEffect(() => {
    const gd = FUND_CAMPAIGNS.find(c => c.type === 'giving-day' && c.status === 'active');
    if (!gd || gd.raisedAmount / gd.goalAmount < 0.67) return;
    const t = setTimeout(() => {
      setShowConfetti(true);
      Animated.sequence([
        Animated.timing(confettiAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(confettiAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setShowConfetti(false));
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // 3. Pulsing dot for Giving Day LIVE indicator
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.25, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 4. Employer matching debounce
  useEffect(() => {
    if (!matchChecked || employerName.length < 3) {
      setMatchLookupState('idle');
      setMatchPolicy(null);
      return;
    }
    if (matchTimer.current) clearTimeout(matchTimer.current);
    matchTimer.current = setTimeout(() => {
      setMatchLookupState('loading');
      const policy = lookupEmployerMatch(employerName);
      const delay  = policy?.lookupDelayMs ?? 1500;
      setTimeout(() => {
        setMatchLookupState(policy ? 'found' : 'notfound');
        setMatchPolicy(policy);
      }, delay);
    }, 600);
    return () => { if (matchTimer.current) clearTimeout(matchTimer.current); };
  }, [employerName, matchChecked]);

  // ── Callbacks ────────────────────────────────────────────────────────────────

  const togglePills = useCallback(() => {
    if (pills.length === 0) return;
    Haptics.selectionAsync();
    const toValue = pillsVisible ? 0 : 1;
    setPillsVisible(!pillsVisible);
    Animated.timing(pillsAnim, { toValue, duration: 200, useNativeDriver: false }).start();
  }, [pillsVisible, pills, pillsAnim]);

  const changeTab = useCallback((tab: FundTab) => {
    Haptics.selectionAsync();
    const newPills = pillsForTab(tab, isAdmin);
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill(newPills[0] ?? 'All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setExpandedCampaignId(null);
  }, [isAdmin, pillsAnim]);

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

  const openP2PCreator = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowP2PCreator(true);
    Animated.timing(p2pAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [p2pAnim]);

  const closeP2PCreator = useCallback(() => {
    Animated.timing(p2pAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setShowP2PCreator(false);
      setP2pGoal('');
      setP2pMessage('');
    });
  }, [p2pAnim]);

  const openDonorSheet = useCallback((txId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDonorTxId(txId);
    Animated.timing(donorSheetAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [donorSheetAnim]);

  const closeDonorSheet = useCallback(() => {
    Animated.timing(donorSheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setSelectedDonorTxId(null));
  }, [donorSheetAnim]);

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
    const givingDayCampaign = FUND_CAMPAIGNS.find(c => c.type === 'giving-day' && c.status === 'active');

    return (
      <>
        {/* Admin dashboard banner */}
        {isAdmin && (
          <Pressable
            style={[s.adminBanner, { backgroundColor: C.accent + '18', borderColor: C.accent + '44' }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdminDash(true); }}
          >
            <IconSymbol name="chart.bar.fill" size={16} color={C.accent} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: C.accent }}>Giving Dashboard</Text>
            <IconSymbol name="chevron.right" size={12} color={C.accent} />
          </Pressable>
        )}

        {/* Giving Day mini-card */}
        {givingDayCampaign && (
          <Pressable
            style={[s.givingDayCard, { backgroundColor: '#B8943E18', borderColor: '#B8943E44' }]}
            onPress={() => { Haptics.selectionAsync(); changeTab('Campaigns'); }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#B8943E', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Lincoln Giving Day · Live
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>
                {givingDayCountdown || formatTimeRemaining(givingDayCampaign.endDatetime ?? '')} remaining
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#B8943E', fontWeight: '600' }}>View →</Text>
          </Pressable>
        )}

        {/* Amount input */}
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

        {/* Frequency toggle — 4 options */}
        <View style={[s.freqRow, { backgroundColor: C.surface, marginBottom: 12 }]}>
          {(['one-time', 'monthly', 'quarterly', 'annually'] as FundGiftFrequency[]).map(freq => {
            const active = freq === frequency;
            const label  = freq === 'one-time' ? 'Once' : freq.charAt(0).toUpperCase() + freq.slice(1);
            return (
              <Pressable
                key={freq}
                style={[s.freqBtn, active && s.freqBtnActive]}
                onPress={() => { Haptics.selectionAsync(); setFrequency(freq); }}
              >
                <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary, fontSize: 12 }, active && { fontWeight: '700' }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Payment method */}
        <Pressable
          style={[s.methodRow, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.selectionAsync();
            const idx  = SAVED_PAYMENT_METHODS.findIndex(m => m.id === selectedMethodId);
            const next = SAVED_PAYMENT_METHODS[(idx + 1) % SAVED_PAYMENT_METHODS.length];
            setSelectedMethodId(next.id);
          }}
        >
          <IconSymbol name={getPaymentIcon(method.type) as any} size={18} color={C.secondary} />
          <Text style={{ flex: 1, fontSize: 14, color: C.label, fontWeight: '500', marginLeft: 10 }}>
            {method.label}{method.last4 ? ` ••••${method.last4}` : ''}{method.balance != null ? ` — ${formatCurrency(method.balance)}` : ''}
          </Text>
          <Text style={{ fontSize: 12, color: C.accent, fontWeight: '600' }}>Change</Text>
        </Pressable>

        {/* Cover fees */}
        {amountNum > 0 && (
          <Pressable
            style={[s.methodRow, { backgroundColor: C.surface, marginTop: 8 }]}
            onPress={() => { Haptics.selectionAsync(); setCoverFees(v => !v); }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>Cover Processing Fee</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginRight: 8 }}>+{formatCurrency(calcFee(amountNum, method.type))}</Text>
            <Switch value={coverFees} onValueChange={setCoverFees} trackColor={{ true: C.accent }} thumbColor="#fff" />
          </Pressable>
        )}

        {/* Employer matching */}
        <View style={[s.matchSection, { backgroundColor: C.surface }]}>
          <Pressable
            style={s.matchCheckRow}
            onPress={() => { Haptics.selectionAsync(); setMatchChecked(v => !v); if (matchChecked) { setEmployerName(''); setMatchLookupState('idle'); setMatchPolicy(null); } }}
          >
            <View style={[s.checkbox, { borderColor: matchChecked ? C.accent : C.separator, backgroundColor: matchChecked ? C.accent : 'transparent' }]}>
              {matchChecked && <IconSymbol name="checkmark" size={10} color="#fff" />}
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>My employer matches gifts</Text>
          </Pressable>
          {matchChecked && (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
              <View style={[s.matchInputWrap, { borderColor: C.inputBorder, backgroundColor: C.surface }]}>
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: C.label }}
                  placeholder="Enter company name…"
                  placeholderTextColor={C.muted}
                  value={employerName}
                  onChangeText={setEmployerName}
                  autoCorrect={false}
                />
                {matchLookupState === 'loading' && <ActivityIndicator size="small" color={C.accent} />}
              </View>
              {matchLookupState === 'found' && matchPolicy && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#5A8A6E15', borderRadius: 10, padding: 10 }}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#5A8A6E" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#5A8A6E' }}>{matchPolicy.companyName} matches {matchPolicy.ratio}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>
                      Up to {formatCurrency(matchPolicy.maxPerYear)}/yr · Your gift could be worth {formatCurrency(amountNum * (matchPolicy.ratioMultiplier + 1))}
                    </Text>
                  </View>
                </View>
              )}
              {matchLookupState === 'notfound' && (
                <Text style={{ fontSize: 13, color: C.muted, paddingLeft: 4 }}>No matching gift program found for this employer.</Text>
              )}
            </View>
          )}
        </View>

        {/* Dedicate gift */}
        <View style={[s.dedicateSection, { backgroundColor: C.surface, marginTop: 8 }]}>
          <Pressable
            style={s.dedicateHeader}
            onPress={() => { Haptics.selectionAsync(); setDedicateOn(v => !v); }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>Dedicate this gift</Text>
            <Switch value={dedicateOn} onValueChange={setDedicateOn} trackColor={{ true: C.accent }} thumbColor="#fff" />
          </Pressable>
          {dedicateOn && (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
              <View style={[s.freqRow, { backgroundColor: C.surfacePressed }]}>
                {(['honor', 'memory'] as const).map(dtype => {
                  const active = dedicateType === dtype;
                  return (
                    <Pressable
                      key={dtype}
                      style={[s.freqBtn, active && s.freqBtnActive]}
                      onPress={() => { Haptics.selectionAsync(); setDedicateType(dtype); }}
                    >
                      <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary }, active && { fontWeight: '700' }]}>
                        {dtype === 'honor' ? 'In Honor Of' : 'In Memory Of'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={[s.matchInputWrap, { borderColor: C.inputBorder, backgroundColor: C.surfacePressed }]}>
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: C.label }}
                  placeholder={dedicateType === 'honor' ? 'Honoree name…' : 'Name of the departed…'}
                  placeholderTextColor={C.muted}
                  value={dedicateName}
                  onChangeText={setDedicateName}
                />
              </View>
            </View>
          )}
        </View>

        {/* Give button */}
        <Pressable
          style={[s.giveBtn, { backgroundColor: amountNum > 0 ? C.accent : C.separator, marginTop: 16 }]}
          onPress={handleGive}
          disabled={amountNum <= 0}
        >
          <Text style={[s.giveBtnText, { color: amountNum > 0 ? '#fff' : C.muted }]}>
            {amountNum > 0 ? `Give ${formatCurrency(totalAmt)}` : 'Give'}
          </Text>
        </Pressable>

        {/* My Recurring Gifts */}
        {MY_RECURRING_GIFTS.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 24, marginBottom: 10 }]}>My Recurring Gifts</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden' }}>
              {MY_RECURRING_GIFTS.map((rg, i) => (
                <View
                  key={rg.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10,
                    borderBottomWidth: i < MY_RECURRING_GIFTS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                  }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5A8A6E' }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>
                      {formatCurrency(rg.amount)} / {rg.frequency}
                    </Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{getFundById(rg.fundId).name} · Next {formatDate(rg.nextDate)}</Text>
                  </View>
                  <View style={{ backgroundColor: '#5A8A6E22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E' }}>Active</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 80 }} />
      </>
    );
  }

  // ── Render: Campaigns (Admin) ─────────────────────────────────────────────────

  function renderScholarshipsAdmin() {
    return (
      <>
        <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>Scholarships</Text>
        {SCHOLARSHIPS.map(sc => {
          const expanded = expandedScholarshipId === sc.id;
          const statusColor = sc.status === 'awarded' ? '#5A8A6E' : sc.status === 'reviewing' ? '#B8943E' : sc.status === 'open' ? C.accent : C.muted;
          return (
            <Pressable
              key={sc.id}
              style={[s.campaignCard, { backgroundColor: C.surface }]}
              onPress={() => { Haptics.selectionAsync(); setExpandedScholarshipId(expanded ? null : sc.id); }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{sc.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{formatCurrency(sc.amount)} award · {sc.applicantCount} applicant{sc.applicantCount !== 1 ? 's' : ''}</Text>
                </View>
                <View style={{ backgroundColor: statusColor + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor, textTransform: 'capitalize' }}>{sc.status}</Text>
                </View>
              </View>
              {expanded && (
                <View style={{ marginTop: 12, gap: 8 }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{sc.criteria}</Text>
                  {sc.awardedTo && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#5A8A6E15', borderRadius: 8, padding: 8 }}>
                      <IconSymbol name="checkmark.circle.fill" size={14} color="#5A8A6E" />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#5A8A6E' }}>Awarded to {sc.awardedTo}</Text>
                    </View>
                  )}
                  {sc.applications.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {sc.applications.map(app => (
                        <View key={app.id} style={{ backgroundColor: C.surfacePressed, borderRadius: 10, padding: 12, gap: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{app.studentName}</Text>
                            <Text style={{ fontSize: 11, color: C.secondary }}>GPA {app.gpa} · {app.major}</Text>
                          </View>
                          {app.essayPreview && (
                            <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={2}>{app.essayPreview}</Text>
                          )}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 11, color: C.muted }}>{formatDate(app.appliedDate)}</Text>
                            {app.status === 'under-review' && (
                              <>
                                <Pressable
                                  style={{ flex: 1, backgroundColor: '#5A8A6E', borderRadius: 8, paddingVertical: 7, alignItems: 'center' }}
                                  onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                                >
                                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Award</Text>
                                </Pressable>
                                <Pressable
                                  style={{ flex: 1, backgroundColor: '#B85C5C', borderRadius: 8, paddingVertical: 7, alignItems: 'center' }}
                                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                                >
                                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Deny</Text>
                                </Pressable>
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </>
    );
  }

  function renderCampaignsAdmin() {
    if (selectedPill === 'Scholarship') return renderScholarshipsAdmin();

    const activeCampaigns = FUND_CAMPAIGNS.filter(c => c.status === 'active');
    const totalRaised     = FUND_CAMPAIGNS.filter(c => c.status !== 'upcoming').reduce((sum, c) => sum + c.raisedAmount, 0);
    const totalDonors     = FUND_CAMPAIGNS.filter(c => c.status !== 'upcoming').reduce((sum, c) => sum + c.donorCount, 0);

    let filtered = FUND_CAMPAIGNS;
    if (selectedPill === 'Active')      filtered = FUND_CAMPAIGNS.filter(c => c.status === 'active');
    if (selectedPill === 'Upcoming')    filtered = FUND_CAMPAIGNS.filter(c => c.status === 'upcoming');
    if (selectedPill === 'Giving Days') filtered = FUND_CAMPAIGNS.filter(c => c.type === 'giving-day');
    if (selectedPill === 'Capital')     filtered = FUND_CAMPAIGNS.filter(c => c.type === 'capital');
    if (selectedPill === 'P2P')         filtered = FUND_CAMPAIGNS.filter(c => c.type === 'p2p');
    if (selectedPill === 'Completed')   filtered = FUND_CAMPAIGNS.filter(c => c.status === 'completed');

    const gdCampaign   = FUND_CAMPAIGNS.find(c => c.type === 'giving-day' && c.status === 'active');
    const liveFeed     = gdCampaign?.liveDonorFeed ?? [];
    const feedSlot     = liveCountTick > 0 ? Math.floor(liveCountTick / 5) % liveFeed.length : 0;
    const myP2PPages   = FUND_CAMPAIGNS
      .filter(c => c.type === 'p2p' && c.status === 'active' && c.p2pFundraisers?.some(f => f.isMe))
      .map(c => ({ campaign: c, page: c.p2pFundraisers!.find(f => f.isMe)! }));

    return (
      <>
        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {([
            { label: 'Active',       value: activeCampaigns.length.toString(), color: C.accent  },
            { label: 'Total Raised', value: formatCurrency(totalRaised),       color: '#5A8A6E' },
            { label: 'Donors',       value: totalDonors.toLocaleString(),      color: C.label   },
          ] as const).map(stat => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', gap: 3 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color, textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {filtered.map(campaign => {
          const expanded  = expandedCampaignId === campaign.id;
          const pct       = campaignProgress(campaign.raisedAmount, campaign.goalAmount);
          const typeColor = campaignTypeColor(campaign.type);
          const isLive    = campaign.type === 'giving-day' && campaign.status === 'active';
          const isCompleted = campaign.status === 'completed';
          const isUpcoming  = campaign.status === 'upcoming';
          const goalExceeded = isCompleted && campaign.raisedAmount > campaign.goalAmount;
          const liveDonorCount = isLive
            ? (campaign.donorCount ?? 0) + Math.floor(liveCountTick / 8)
            : campaign.donorCount;

          return (
            <Pressable
              key={campaign.id}
              style={[s.campaignCard, { backgroundColor: C.surface }, isLive && { borderWidth: 1.5, borderColor: '#B8943E40' }]}
              onPress={() => { Haptics.selectionAsync(); setExpandedCampaignId(expanded ? null : campaign.id); }}
            >
              {/* Giving Day LIVE banner with pulsing dot */}
              {isLive && (
                <View style={{ backgroundColor: '#B8943E', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Animated.View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#fff', opacity: pulseAnim }} />
                  <Text style={{ flex: 1, fontSize: 12, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Giving Day — Live
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] as any }}>
                    {givingDayCountdown}
                  </Text>
                </View>
              )}

              {/* Upcoming badge */}
              {isUpcoming && (
                <View style={{ backgroundColor: '#1A171415', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="clock.fill" size={12} color="#1A1714" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1714' }}>
                    Starts {formatDate(campaign.startDate)}
                  </Text>
                </View>
              )}

              {/* Completed success banner */}
              {isCompleted && (
                <View style={{ backgroundColor: goalExceeded ? '#5A8A6E18' : C.surfacePressed, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name={goalExceeded ? 'checkmark.seal.fill' : 'checkmark.circle.fill'} size={14} color={goalExceeded ? '#5A8A6E' : C.secondary} />
                  <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: goalExceeded ? '#5A8A6E' : C.secondary }}>
                    Raised {formatCurrency(campaign.raisedAmount)} from {campaign.donorCount} donors
                    {goalExceeded ? ' — Goal exceeded! 🎉' : ''}
                  </Text>
                </View>
              )}

              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{campaign.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <View style={{ backgroundColor: typeColor + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: typeColor }}>{campaignTypeLabel(campaign.type)}</Text>
                    </View>
                    {!isUpcoming && (
                      <Text style={{ fontSize: 11, color: C.muted }}>
                        {liveDonorCount > 0 ? `${liveDonorCount} donors · ` : ''}{daysRemaining(campaign.deadline)}d left
                      </Text>
                    )}
                  </View>
                </View>
                <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
              </View>

              {/* Thermometer (hide for upcoming with no data) */}
              {!isUpcoming && (
                <>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator, marginBottom: 6 }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: isCompleted ? '#5A8A6E' : C.accent, width: `${pct}%` as any }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: campaign.classLeaderboard ? 8 : 0 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{formatCurrency(campaign.raisedAmount)} raised</Text>
                    <Text style={{ fontSize: 12, color: C.muted }}>{pct}% of {formatCurrency(campaign.goalAmount)}</Text>
                  </View>

                  {/* Giving Day class leaderboard preview */}
                  {campaign.classLeaderboard && campaign.classLeaderboard.length > 0 && (
                    <Pressable
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}
                      onPress={() => { Haptics.selectionAsync(); setExpandedCampaignId(expanded ? null : campaign.id); }}
                    >
                      <IconSymbol name="trophy.fill" size={10} color="#B8943E" />
                      <Text style={{ fontSize: 11, color: C.secondary }} numberOfLines={1}>
                        {campaign.classLeaderboard.map(cl => `'${String(cl.classYear).slice(2)} (${formatCurrency(cl.totalRaised)})`).join('  ·  ')}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}

              {/* Expanded detail */}
              {expanded && (
                <View style={{ marginTop: 14, gap: 12 }}>
                  <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{campaign.description}</Text>

                  {/* Giving Day challenge bar */}
                  {isLive && campaign.challengeGoalDonors && (
                    <View style={{ backgroundColor: '#B8943E12', borderRadius: 10, padding: 12, gap: 6 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#B8943E' }}>
                        Donor Challenge: {(campaign.challengeCurrentDonors ?? 0) + Math.floor(liveCountTick / 8)} / {campaign.challengeGoalDonors} donors
                      </Text>
                      <View style={{ height: 8, borderRadius: 4, backgroundColor: C.separator }}>
                        <View style={{ height: 8, borderRadius: 4, backgroundColor: '#B8943E', width: `${Math.min(100, (((campaign.challengeCurrentDonors ?? 0) + Math.floor(liveCountTick / 8)) / campaign.challengeGoalDonors) * 100)}%` as any }} />
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary }}>
                        {formatCurrency(campaign.challengeMatchAmount ?? 0)} match unlocks at {campaign.challengeGoalDonors} donors
                      </Text>
                    </View>
                  )}

                  {/* Live donor feed (expanded) */}
                  {campaign.liveDonorFeed && campaign.liveDonorFeed.length > 0 && (
                    <View style={{ gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Recent Donors</Text>
                      {campaign.liveDonorFeed.slice(0, 5).map(entry => (
                        <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent + '22', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent }}>{entry.firstName[0]}</Text>
                          </View>
                          <Text style={{ flex: 1, fontSize: 13, color: C.label }}>
                            {entry.firstName} <Text style={{ color: C.muted }}>'{String(entry.classYear).slice(2)}</Text>
                          </Text>
                          {entry.isPublic && entry.amount && (
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{formatCurrency(entry.amount)}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Capital phases */}
                  {campaign.type === 'capital' && campaign.phases && (
                    <View style={{ gap: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Campaign Phases</Text>
                      {campaign.phases.map((phase, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: phase.isComplete ? '#5A8A6E' : C.separator, backgroundColor: phase.isComplete ? '#5A8A6E' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                            {phase.isComplete && <IconSymbol name="checkmark" size={10} color="#fff" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, color: phase.isComplete ? C.label : C.secondary }}>{phase.label}</Text>
                            <Text style={{ fontSize: 11, color: C.muted }}>{formatCurrency(phase.goalAmount)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* P2P fundraiser leaderboard */}
                  {campaign.type === 'p2p' && campaign.p2pFundraisers && (
                    <View style={{ gap: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Fundraisers</Text>
                      {campaign.p2pFundraisers.map(f => {
                        const fPct = campaignProgress(f.raisedAmount, f.goalAmount);
                        return (
                          <View key={f.id} style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `hsl(${f.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{f.donorInitials}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{f.donorName}{f.isMe ? ' (You)' : ''}</Text>
                                <Text style={{ fontSize: 11, color: C.muted }}>{formatCurrency(f.raisedAmount)} of {formatCurrency(f.goalAmount)}</Text>
                              </View>
                              <Text style={{ fontSize: 12, color: C.accent, fontWeight: '700' }}>{fPct}%</Text>
                            </View>
                            <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                              <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${fPct}%` as any }} />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Actions row */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable style={{ flex: 1, backgroundColor: C.surfacePressed, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                      onPress={() => Haptics.selectionAsync()}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Share</Text>
                    </Pressable>
                    <Pressable style={{ flex: 1, backgroundColor: C.surfacePressed, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                      onPress={() => Haptics.selectionAsync()}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* ── Giving Day Live Feed ── */}
        {gdCampaign && liveFeed.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginTop: 8, marginBottom: 12 }}>
              Live Donor Feed
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {Array.from({ length: Math.min(6, liveFeed.length) }).map((_, i) => {
                const idx   = (feedSlot + liveFeed.length - i) % liveFeed.length;
                const entry = liveFeed[idx];
                const secsAgo = i === 0 ? 'just now' : `${i * 5}s ago`;
                return (
                  <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: i < 5 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: i === 0 ? C.accent + '25' : C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: i === 0 ? C.accent : C.secondary }}>{entry.firstName[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: C.label }}>
                        <Text style={{ fontWeight: '600' }}>{entry.firstName}</Text>
                        <Text style={{ color: C.muted }}> '{String(entry.classYear).slice(2)}</Text>
                        {entry.isPublic && entry.amount && (
                          <Text style={{ color: C.secondary }}> gave <Text style={{ fontWeight: '700', color: C.label }}>{formatCurrency(entry.amount)}</Text></Text>
                        )}
                        {!entry.isPublic && <Text style={{ color: C.secondary }}> gave anonymously</Text>}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.muted }}>{secsAgo}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Campaign Impact ── */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 12 }}>Campaign Impact</Text>

        {/* YoY comparison */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12, gap: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Year-over-Year</Text>
          {[
            { label: '2026 (YTD)',   value: ADMIN_DASHBOARD.thisYear.total,      color: C.accent },
            { label: '2025',         value: Math.round(ADMIN_DASHBOARD.thisYear.total / (1 + ADMIN_DASHBOARD.yoyThisYear / 100)), color: C.secondary },
          ].map(row => (
            <View key={row.label} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: C.secondary }}>{row.label}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: row.color }}>{formatCurrency(row.value)}</Text>
              </View>
              <View style={{ height: 5, backgroundColor: C.bg, borderRadius: 3 }}>
                <View style={{ height: 5, width: `${Math.min(100, (row.value / ADMIN_DASHBOARD.thisYear.total) * 100)}%` as any, backgroundColor: row.color, borderRadius: 3 }} />
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ backgroundColor: '#5A8A6E18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#5A8A6E' }}>+{ADMIN_DASHBOARD.yoyThisYear}% vs last year</Text>
            </View>
            <Text style={{ fontSize: 12, color: C.muted }}>Alumni rate: <Text style={{ fontWeight: '700', color: C.accent }}>{ADMIN_DASHBOARD.thisYear.alumniRate}%</Text></Text>
          </View>
        </View>

        {/* Class leaderboard */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <IconSymbol name="trophy.fill" size={14} color="#B8943E" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Class Leaderboard</Text>
          </View>
          {ADMIN_DASHBOARD.classLeaderboard.slice(0, 5).map((cls, idx) => (
            <View key={cls.classYear} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: idx === 0 ? '#B8943E' : C.muted, width: 18 }}>{idx + 1}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, width: 42 }}>Class of '{String(cls.classYear).slice(2)}</Text>
              <View style={{ flex: 1, height: 5, backgroundColor: C.bg, borderRadius: 3 }}>
                <View style={{ height: 5, width: `${(cls.totalRaised / ADMIN_DASHBOARD.classLeaderboard[0].totalRaised) * 100}%` as any, backgroundColor: idx === 0 ? '#B8943E' : C.accent + '80', borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.label, width: 64, textAlign: 'right' }}>{formatCurrency(cls.totalRaised)}</Text>
            </View>
          ))}
        </View>

        {/* ── Your Fundraising Pages ── */}
        {myP2PPages.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 12 }}>Your Fundraising Pages</Text>
            {myP2PPages.map(({ campaign, page }) => {
              const fPct = campaignProgress(page.raisedAmount, page.goalAmount);
              return (
                <View key={page.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: C.accent }}>SK</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{campaign.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{page.donorCount} donors · {fPct}% of goal</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: C.accent }}>{formatCurrency(page.raisedAmount)}</Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>of {formatCurrency(page.goalAmount)}</Text>
                    </View>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${fPct}%` as any }} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      style={{ flex: 1, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 9, alignItems: 'center' }}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Share Page</Text>
                    </Pressable>
                    <Pressable
                      style={{ flex: 1, backgroundColor: C.surfacePressed, borderRadius: 10, paddingVertical: 9, alignItems: 'center' }}
                      onPress={() => Haptics.selectionAsync()}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit Page</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 100 }} />
      </>
    );
  }

  // ── Render: Campaigns (Member) ────────────────────────────────────────────────

  function renderCampaignsMember() {
    const visibleCampaigns = FUND_CAMPAIGNS.filter(c => c.status === 'active' || c.status === 'upcoming');
    const myP2PPages = FUND_CAMPAIGNS
      .filter(c => c.type === 'p2p' && c.status === 'active' && c.p2pFundraisers?.some(f => f.isMe))
      .map(c => ({ campaign: c, page: c.p2pFundraisers!.find(f => f.isMe)! }));

    return (
      <>
        {visibleCampaigns.map(campaign => {
          const pct = campaignProgress(campaign.raisedAmount, campaign.goalAmount);
          const typeColor = campaignTypeColor(campaign.type);
          const isUpcoming = campaign.status === 'upcoming';
          return (
            <View key={campaign.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
              {isUpcoming && (
                <View style={{ backgroundColor: '#1A171415', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="clock.fill" size={12} color="#1A1714" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1714' }}>Coming {formatDate(campaign.startDate)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <View style={{ backgroundColor: typeColor + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: typeColor }}>{campaignTypeLabel(campaign.type)}</Text>
                </View>
                {!isUpcoming && (
                  <Text style={{ fontSize: 11, color: C.muted }}>{campaign.donorCount} donors · {daysRemaining(campaign.deadline)}d left</Text>
                )}
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 6 }}>{campaign.name}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 10 }} numberOfLines={2}>{campaign.description}</Text>
              {!isUpcoming && (
                <>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator, marginBottom: 6 }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${pct}%` as any }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{formatCurrency(campaign.raisedAmount)} raised</Text>
                    <Text style={{ fontSize: 12, color: C.muted }}>{pct}% of {formatCurrency(campaign.goalAmount)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      style={{ flex: 1, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }}
                      onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); changeTab('Give'); }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Give to Campaign</Text>
                    </Pressable>
                    {campaign.type === 'p2p' && (
                      <Pressable
                        style={{ flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: C.separator }}
                        onPress={openP2PCreator}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Start Fundraising Page</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}
              {isUpcoming && (
                <Pressable
                  style={{ backgroundColor: C.surfacePressed, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Notify Me When Live</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Your Fundraising Pages */}
        {myP2PPages.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginTop: 8, marginBottom: 12 }}>Your Fundraising Pages</Text>
            {myP2PPages.map(({ campaign, page }) => {
              const fPct = campaignProgress(page.raisedAmount, page.goalAmount);
              return (
                <View key={page.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: C.accent }}>SK</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{campaign.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{page.donorCount} donors · {fPct}% of goal</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: C.accent }}>{formatCurrency(page.raisedAmount)}</Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>of {formatCurrency(page.goalAmount)}</Text>
                    </View>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${fPct}%` as any }} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      style={{ flex: 1, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 9, alignItems: 'center' }}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Share Page</Text>
                    </Pressable>
                    <Pressable
                      style={{ flex: 1, backgroundColor: C.surfacePressed, borderRadius: 10, paddingVertical: 9, alignItems: 'center' }}
                      onPress={() => Haptics.selectionAsync()}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit Page</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 100 }} />
      </>
    );
  }

  // ── Render: History (Member) ──────────────────────────────────────────────────

  function renderHistoryMember() {
    const allMyTx = FUND_TRANSACTIONS.filter(t => t.isMe);

    if (selectedPill === 'Recurring') {
      return (
        <>
          <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>Active Recurring Gifts</Text>
          {MY_RECURRING_GIFTS.map(rg => (
            <View key={rg.id} style={[s.recurringCard, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>
                  {formatCurrency(rg.amount)}
                  <Text style={{ fontSize: 13, fontWeight: '400', color: C.secondary }}> / {rg.frequency}</Text>
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
        </>
      );
    }

    if (selectedPill === 'Tax Receipts') {
      const total2025 = allMyTx.filter(t => t.date.startsWith('2025')).reduce((a, t) => a + t.amount, 0);
      const total2026 = allMyTx.filter(t => t.date.startsWith('2026')).reduce((a, t) => a + t.amount, 0);
      return (
        <>
          <View style={[s.taxCard, { backgroundColor: C.surface }]}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>2025 Annual Giving</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>{formatCurrency(total2025)}</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2, marginBottom: 16 }}>
              {allMyTx.filter(t => t.date.startsWith('2025')).length} gifts · Lincoln University · EIN 74-2345678
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
        </>
      );
    }

    if (selectedPill === 'Pledges') {
      const pledge = MY_PLEDGE;
      const pct    = Math.min(100, Math.round((pledge.fulfilledAmount / pledge.totalPledged) * 100));
      const camp   = FUND_CAMPAIGNS.find(c => c.id === pledge.campaignId);
      return (
        <>
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{camp?.name}</Text>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: C.separator }}>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: C.accent, width: `${pct}%` as any }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: C.secondary }}>{formatCurrency(pledge.fulfilledAmount)} fulfilled</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{pct}% of {formatCurrency(pledge.totalPledged)}</Text>
            </View>
            <Text style={{ fontSize: 12, color: C.muted }}>{formatCurrency(pledge.amountPerPeriod)} / {pledge.frequency} · ends {formatDate(pledge.endDate)}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={{ flex: 1, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }}
                onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); changeTab('Give'); }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Give Now</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: C.separator }}
                onPress={() => Haptics.selectionAsync()}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Pause</Text>
              </Pressable>
            </View>
          </View>
        </>
      );
    }

    // Default / This Year view
    let filtered = allMyTx;
    if (selectedPill === 'This Year') filtered = allMyTx.filter(t => t.date.startsWith('2026'));

    const periodTotal = filtered.reduce((a, t) => a + t.amount, 0);
    const periodGifts = filtered.length;
    const periodAvg   = periodGifts > 0 ? Math.round(periodTotal / periodGifts) : 0;
    const lifetime    = lifetimeGiving();
    const engScore    = Math.min(5, Math.max(1, Math.floor(lifetime / 200)));

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

    const byFundMap: Record<string, number> = {};
    allMyTx.forEach(tx => { byFundMap[tx.fundId] = (byFundMap[tx.fundId] ?? 0) + tx.amount; });
    const fundBreakdown = Object.entries(byFundMap).sort((a, b) => b[1] - a[1]);

    return (
      <>
        {/* Lifetime + engagement */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: C.secondary }}>Lifetime Giving</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: C.label }}>{formatCurrency(lifetime)}</Text>
            <Text style={{ fontSize: 12, color: C.muted }}>Lincoln University Alumna/us</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 10, color: C.secondary }}>Engagement</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i < engScore ? '#5A8A6E' : C.separator }} />
              ))}
            </View>
          </View>
        </View>

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
                    <Text style={{ fontSize: 12, color: C.secondary }}>
                      {formatDate(tx.date)} · {tx.frequency}{tx.employerMatched ? ' · Matched ✓' : ''}
                    </Text>
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

        {/* By fund breakdown */}
        <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 8, marginBottom: 12 }]}>My Giving by Fund</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 12, marginBottom: 12 }}>
          {fundBreakdown.map(([fundId, amt]) => {
            const pct = lifetime > 0 ? Math.round((amt / lifetime) * 100) : 0;
            return (
              <View key={fundId}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: C.label }}>{getFundById(fundId as FundFundId).name}</Text>
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
            <Text style={{ fontSize: 12, color: C.secondary }}>Lincoln University · EIN 74-2345678</Text>
          </View>
          <IconSymbol name="arrow.down.circle.fill" size={20} color={C.accent} />
        </Pressable>

        <View style={{ height: 80 }} />
      </>
    );
  }

  // ── Render: History (Admin) ────────────────────────────────────────────────────

  function renderHistoryAdmin() {
    const isByFund      = selectedPill === 'By Fund';
    const isByClassYear = selectedPill === 'By Class Year';

    let filtered = FUND_TRANSACTIONS;
    if (selectedPill === 'This Week')  filtered = FUND_TRANSACTIONS.filter(t => t.date >= '2026-03-18');
    if (selectedPill === 'This Month') filtered = FUND_TRANSACTIONS.filter(t => t.date.startsWith('2026-03'));
    if (selectedPill === 'This Year')  filtered = FUND_TRANSACTIONS.filter(t => t.date.startsWith('2026'));

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
            <Text style={[s.statNum, { color: C.label }]}>{dash.donors}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Donors</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.label }]}>{formatCurrency(dash.avgGift)}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Avg Gift</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.accent }]}>{dash.alumniRate}%</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Alumni</Text>
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
        ) : isByClassYear ? (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 12 }]}>Class Year Leaderboard</Text>
            {ADMIN_DASHBOARD.classLeaderboard.map((cls, idx) => (
              <View key={cls.classYear} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: idx === 0 ? C.accent : C.muted, width: 24, textAlign: 'center' }}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Class of {cls.classYear}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{cls.donorCount} donors · {cls.participationRate}% participation</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>{formatCurrency(cls.totalRaised)}</Text>
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
                        onPress={() => openDonorSheet(tx.id)}
                      >
                        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `hsl(${tx.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{tx.donorInitials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{tx.donorName}</Text>
                          <Text style={{ fontSize: 12, color: C.secondary }}>
                            {tx.classYear ? `'${String(tx.classYear).slice(2)} · ` : ''}{getFundById(tx.fundId).name} · {formatDate(tx.date)}
                          </Text>
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

  // ── Education: Student Finances View ────────────────────────────────────────

  function renderStudentFinancesView() {
    const SEMESTER_BILL = [
      { label: 'Tuition',  amount: 6_575 },
      { label: 'Fees',     amount:   425 },
    ];
    const semesterTotal = SEMESTER_BILL.reduce((a, i) => a + i.amount, 0); // 7_000
    const AID_APPLIED = [
      { label: 'Institutional Grant', amount: -2_500 },
      { label: 'Merit Scholarship',   amount: -1_212.50 },
    ];
    const balanceDue = 3_287.50;
    const PAYMENT_HISTORY = [
      { label: 'Fall 2025 — Tuition & Fees', amount: 3_287.50, date: 'Aug 20, 2025' },
      { label: 'Spring 2026 — Partial',      amount: 1_500.00, date: 'Jan 8, 2026'  },
      { label: 'Spring 2026 — Partial',      amount: 1_000.00, date: 'Feb 14, 2026' },
    ];

    return (
      <>
        {/* Balance card */}
        <View style={{ backgroundColor: '#F5F0EA', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E0DBD4' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9C9790', textTransform: 'uppercase', letterSpacing: 0.6 }}>Balance Due</Text>
          <Text style={{ fontSize: 38, fontWeight: '900', color: '#B85C5C', marginTop: 4 }}>${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          <Text style={{ fontSize: 13, color: '#9C9790', marginTop: 2 }}>Spring 2026  ·  Due May 1, 2026</Text>
          <Pressable
            style={({ pressed }) => ({
              marginTop: 16, backgroundColor: pressed ? '#333' : '#1A1714',
              borderRadius: 12, paddingVertical: 13, alignItems: 'center',
            })}
            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Pay Now</Text>
          </Pressable>
        </View>

        {/* Semester Bill Breakdown */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Spring 2026 Bill</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {SEMESTER_BILL.map((item, idx) => (
            <View key={item.label} style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 13,
              borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
            }}>
              <Text style={{ fontSize: 14, color: C.label }}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 16, paddingVertical: 13,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Semester Total</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>{formatCurrency(semesterTotal)}</Text>
          </View>
        </View>

        {/* Financial Aid Applied */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Financial Aid Applied</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {AID_APPLIED.map((item, idx) => (
            <View key={item.label} style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 13,
              borderBottomWidth: idx < AID_APPLIED.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}>
              <Text style={{ fontSize: 14, color: C.label }}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#5A8A6E' }}>
                {`-${formatCurrency(Math.abs(item.amount))}`}
              </Text>
            </View>
          ))}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 }} />
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 16, paddingVertical: 13,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Net Due</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#B85C5C' }}>
              ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Payment History */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Payment History</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {PAYMENT_HISTORY.map((item, idx) => (
            <View key={idx} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 16, paddingVertical: 12,
              borderBottomWidth: idx < PAYMENT_HISTORY.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#5A8A6E15', alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#5A8A6E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.label}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{item.date}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Download 1098-T */}
        <Pressable
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: pressed ? C.surfacePressed : C.surface,
            borderRadius: 14, padding: 16, marginBottom: 24,
          })}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1A171415', alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="doc.text.fill" size={17} color="#1A1714" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Download 1098-T</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>Tax year 2025  ·  Lincoln University</Text>
          </View>
          <IconSymbol name="arrow.down.circle" size={20} color={C.label} />
        </Pressable>

        <View style={{ height: 40 }} />
      </>
    );
  }

  // ── Education: President Finance View ────────────────────────────────────────

  function renderPresidentFinanceView() {
    const PRES_TABS = ['Overview', 'Tuition', 'Budget', 'Aid'] as const;

    const PROGRAMS = [
      { name: 'BA Business Admin',  tuition: 12_800, enrolled: 340 },
      { name: 'BS Diagnostic Imag', tuition: 14_200, enrolled: 180 },
      { name: 'MBA',                tuition: 18_500, enrolled:  95 },
      { name: 'MS IBFM',            tuition: 16_400, enrolled:  62 },
      { name: 'DBA',                tuition: 22_000, enrolled:  28 },
    ];

    const DEPARTMENTS = [
      { name: 'Academic Affairs',   budget: 680_000, actual: 612_000 },
      { name: 'Student Services',   budget: 310_000, actual: 328_500 },
      { name: 'Administration',     budget: 240_000, actual: 231_000 },
      { name: 'Facilities',         budget: 195_000, actual: 201_000 },
      { name: 'Technology',         budget: 145_000, actual: 138_000 },
    ];

    const AID_DIST = [
      { label: 'Need-Based',     pct: 45, color: '#1A1714'  },
      { label: 'Merit',          pct: 30, color: '#5A8A6E'  },
      { label: 'Athletic',       pct:  5, color: '#B8943E'  },
      { label: 'Institutional',  pct: 20, color: '#9C9790'  },
    ];

    const CASHFLOW_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const CASHFLOW_VALUES = [180, 210, 195, 225, 205, 215]; // $K, normalized
    const maxFlow = Math.max(...CASHFLOW_VALUES);

    return (
      <>
        {/* President tab switcher */}
        <View style={{
          flexDirection: 'row', backgroundColor: C.surface,
          borderRadius: 12, padding: 4, marginBottom: 20, gap: 2,
        }}>
          {PRES_TABS.map(tab => {
            const active = presidentTab === tab;
            return (
              <Pressable
                key={tab}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center',
                  backgroundColor: active ? '#1A1714' : 'transparent',
                }}
                onPress={() => { Haptics.selectionAsync(); setPresidentTab(tab); }}
              >
                <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? '#FFFFFF' : C.secondary }}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Overview tab ── */}
        {presidentTab === 'Overview' && (
          <>
            {/* Revenue vs Expenses */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Revenue YTD',   value: '$2.1M',  sub: 'vs $1.8M prior yr', color: '#5A8A6E' },
                { label: 'Expenses YTD',  value: '$1.8M',  sub: 'on budget',          color: '#1A1714' },
              ].map(stat => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>{stat.label}</Text>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>{stat.sub}</Text>
                </View>
              ))}
            </View>

            {/* 12-month Cash Flow chart */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 14 }}>12-Month Cash Flow</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 64 }}>
                {CASHFLOW_MONTHS.map((month, idx) => {
                  const h = Math.round((CASHFLOW_VALUES[idx] / maxFlow) * 64);
                  return (
                    <View key={month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <View style={{ width: '100%', height: h, backgroundColor: '#1A1714', borderRadius: 4 }} />
                      <Text style={{ fontSize: 9, color: C.muted }}>{month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Outstanding receivables */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#B85C5C15', alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="exclamationmark.circle.fill" size={20} color="#B85C5C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Outstanding Receivables</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>23 student accounts past due</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#B85C5C' }}>$142K</Text>
            </View>
            <View style={{ height: 40 }} />
          </>
        )}

        {/* ── Tuition tab ── */}
        {presidentTab === 'Tuition' && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Collection by Program
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {PROGRAMS.map((prog, idx) => {
                const collected = prog.tuition * prog.enrolled;
                return (
                  <View key={prog.name} style={{
                    paddingHorizontal: 16, paddingVertical: 13,
                    borderBottomWidth: idx < PROGRAMS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                    gap: 4,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>{prog.name}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{formatCurrency(collected)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{prog.enrolled} enrolled</Text>
                      <Text style={{ fontSize: 12, color: C.muted }}>{formatCurrency(prog.tuition)}/student</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ backgroundColor: '#B85C5C15', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconSymbol name="clock.badge.exclamationmark.fill" size={18} color="#B85C5C" />
              <Text style={{ fontSize: 14, color: '#B85C5C', fontWeight: '600' }}>
                23 accounts with outstanding balances
              </Text>
            </View>
            <View style={{ height: 40 }} />
          </>
        )}

        {/* ── Budget tab ── */}
        {presidentTab === 'Budget' && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Department Budget vs Actual
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {DEPARTMENTS.map((dept, idx) => {
                const isOver    = dept.actual > dept.budget;
                const variance  = dept.actual - dept.budget;
                const varColor  = isOver ? '#B85C5C' : '#5A8A6E';
                const barPct    = Math.min(100, Math.round((dept.actual / dept.budget) * 100));
                return (
                  <View key={dept.name} style={{
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: idx < DEPARTMENTS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator, gap: 8,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }}>{dept.name}</Text>
                      <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: varColor + '20' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: varColor }}>
                          {isOver ? '+' : ''}{formatCurrency(Math.abs(variance))}
                        </Text>
                      </View>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator }}>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: isOver ? '#B85C5C' : '#5A8A6E', width: `${barPct}%` as any }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: C.muted }}>Budget: {formatCurrency(dept.budget)}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary }}>Actual: {formatCurrency(dept.actual)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ height: 40 }} />
          </>
        )}

        {/* ── Aid tab ── */}
        {presidentTab === 'Aid' && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Aid Distribution
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {AID_DIST.map((item, idx) => (
                <View key={item.label} style={{
                  paddingHorizontal: 16, paddingVertical: 13, gap: 8,
                  borderBottomWidth: idx < AID_DIST.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: C.label }}>{item.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: item.color }}>{item.pct}%</Text>
                  </View>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: C.separator }}>
                    <View style={{ height: 5, borderRadius: 3, backgroundColor: item.color, width: `${item.pct}%` as any }} />
                  </View>
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 3 }}>Institutional Discount Rate</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>Aid as % of gross tuition revenue</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A1714' }}>18%</Text>
            </View>
            <View style={{ height: 40 }} />
          </>
        )}
      </>
    );
  }

  function renderContent() {
    if (!isAdmin) return renderStudentFinancesView();
    if (isAdmin)  return renderPresidentFinanceView();
    return renderGiveTab();
  }

  // ── Layout ────────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Scrollable content */}
      <ScrollView
        key={activeTab}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* Create Campaign FAB — not shown in education finance views */}
      {isAdmin && activeTab === 'Campaigns' && false && (
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
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
              hitSlop={12}
            >
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
          </View>

          <View style={s.dropdownPillWrap}>
            {isAdmin ? (
              <Pressable
                style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
                onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
              >
                <Text style={[s.dropdownPillText, { color: C.label }]}>Finance</Text>
                <IconSymbol name="chevron.down" size={12} color={C.secondary} />
              </Pressable>
            ) : (
              <View style={[s.dropdownPill, { backgroundColor: 'transparent' }]}>
                <Text style={[s.dropdownPillText, { color: C.label }]}>My Finances</Text>
              </View>
            )}
          </View>

          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }]}>
            <RolePill
              role={demoRole}
              onPress={cycleRole}
              accentColor="#1A1714"
              isPrimary={isAdmin}
            />
            {pills.length > 0 && !isAdmin && (
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

      {/* Dropdown — President Finance sub-nav */}
      {dropdownOpen && isAdmin && (
        <>
          <Pressable
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 98 } as any}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[s.dropdown, { backgroundColor: C.surface, borderColor: C.separator, top: insets.top + TOP_BAR_H }]}>
            {(['Overview', 'Tuition', 'Budget', 'Aid'] as const).map(tab => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  s.dropdownOpt, { borderBottomColor: C.separator },
                  (pressed || tab === presidentTab) && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => { Haptics.selectionAsync(); setPresidentTab(tab); setDropdownOpen(false); }}
              >
                <Text style={[s.dropdownOptText, { color: tab === presidentTab ? C.accent : C.label }]}>{tab}</Text>
                {tab === presidentTab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
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

      {/* Confetti overlay */}
      {showConfetti && (
        <Animated.View
          pointerEvents="none"
          style={{ ...StyleSheet.absoluteFillObject, zIndex: 80, alignItems: 'center', justifyContent: 'center', opacity: confettiAnim } as any}
        >
          <View style={{ backgroundColor: '#B8943E', borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 40 }}>🎉</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Lincoln Giving Day!</Text>
            <Text style={{ fontSize: 14, color: '#fff' }}>{formatCurrency(FUND_CAMPAIGNS[0].raisedAmount)} raised so far</Text>
          </View>
        </Animated.View>
      )}

      {/* P2P Creator Sheet */}
      {showP2PCreator && (
        <>
          <Animated.View
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: p2pAnim } as any}
          >
            <Pressable style={{ flex: 1 }} onPress={closeP2PCreator} />
          </Animated.View>
          <Animated.View
            style={[
              s.p2pSheet,
              { backgroundColor: C.bg, zIndex: 50, paddingBottom: insets.bottom + 16 },
              { transform: [{ translateY: p2pAnim.interpolate({ inputRange: [0, 1], outputRange: [P2P_SHEET_H, 0] }) }] },
            ]}
          >
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.separator }} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingHorizontal: 20, marginBottom: 16 }}>Start a Fundraising Page</Text>
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Your Goal</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ fontSize: 18, color: C.muted, marginRight: 4 }}>$</Text>
                <TextInput style={{ flex: 1, fontSize: 18, color: C.label }} value={p2pGoal} onChangeText={setP2pGoal} keyboardType="decimal-pad" placeholder="5,000" placeholderTextColor={C.muted} />
              </View>
            </View>
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Personal Message</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <TextInput style={{ fontSize: 14, color: C.label, minHeight: 80, textAlignVertical: 'top' }} value={p2pMessage} onChangeText={setP2pMessage} multiline placeholder="Share why you're fundraising for Lincoln…" placeholderTextColor={C.muted} />
              </View>
            </View>
            <Pressable
              style={{ marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); closeP2PCreator(); }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Create My Page</Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      {/* Transaction receipt sheet (member) */}
      {selectedTxId && (() => {
        const tx = FUND_TRANSACTIONS.find(t => t.id === selectedTxId);
        if (!tx) return null;
        const methodLabel = tx.paymentMethod === 'card' ? 'Credit/Debit Card'
          : tx.paymentMethod === 'bank'      ? 'Bank Transfer'
          : tx.paymentMethod === 'apple_pay' ? 'Apple Pay'
          : 'KayPay';
        return (
          <>
            <Animated.View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: txSheetAnim } as any}>
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
                  { label: 'Confirmation',   value: `#LU-${tx.id.toUpperCase()}` },
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

      {/* Donor detail sheet (admin) */}
      {selectedDonorTxId && (() => {
        const tx = FUND_TRANSACTIONS.find(t => t.id === selectedDonorTxId);
        if (!tx) return null;
        const donorTxs  = FUND_TRANSACTIONS.filter(t => t.donorName === tx.donorName);
        const lifetime  = donorTxs.reduce((a, t) => a + t.amount, 0);
        const thisYear  = donorTxs.filter(t => t.date.startsWith('2026')).reduce((a, t) => a + t.amount, 0);
        const lastGift  = donorTxs.sort((a, b) => b.date.localeCompare(a.date))[0];
        const engScore  = Math.min(5, Math.max(1, Math.floor(lifetime / 500)));
        const tag       = lifetime >= 5000 ? 'Major Donor' : lifetime >= 500 ? 'Mid-Level' : 'New Donor';
        const tagColor  = lifetime >= 5000 ? C.accent : lifetime >= 500 ? '#5A8A6E' : C.secondary;

        return (
          <>
            <Animated.View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: donorSheetAnim } as any}>
              <Pressable style={{ flex: 1 }} onPress={closeDonorSheet} />
            </Animated.View>
            <Animated.View
              style={[
                s.donorSheet,
                { backgroundColor: C.bg, zIndex: 50, paddingBottom: insets.bottom + 16 },
                { transform: [{ translateY: donorSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [DONOR_SHEET_H, 0] }) }] },
              ]}
            >
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.separator }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 14, marginBottom: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `hsl(${tx.donorHue},42%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{tx.donorInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>{tx.donorName}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary }}>
                    {tx.classYear ? `Class of ${tx.classYear}` : 'Lincoln University'}
                  </Text>
                </View>
                <View style={{ backgroundColor: tagColor + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: tagColor }}>{tag}</Text>
                </View>
              </View>

              {/* Engagement score */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 8, marginBottom: 14 }}>
                <Text style={{ fontSize: 12, color: C.secondary }}>Engagement</Text>
                {Array.from({ length: 5 }, (_, i) => (
                  <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i < engScore ? '#5A8A6E' : C.separator }} />
                ))}
              </View>

              {/* Stats */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 }}>
                {([
                  { label: 'Lifetime',   value: formatCurrency(lifetime), color: C.accent },
                  { label: 'This Year',  value: formatCurrency(thisYear),  color: '#5A8A6E' },
                  { label: 'Last Gift',  value: formatDate(lastGift?.date ?? ''), color: C.label },
                ] as const).map(stat => (
                  <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center', gap: 3 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                    <Text style={{ fontSize: 9, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Quick actions */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 }}>
                {[
                  { icon: 'envelope.fill', label: 'Email' },
                  { icon: 'phone.fill',    label: 'Call'  },
                  { icon: 'note.text',     label: 'Notes' },
                ].map(action => (
                  <Pressable
                    key={action.label}
                    style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 4 }}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <IconSymbol name={action.icon as any} size={16} color={C.secondary} />
                    <Text style={{ fontSize: 11, color: C.secondary }}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Last 3 transactions */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, paddingHorizontal: 20, marginBottom: 8 }}>Recent Gifts</Text>
              <View style={{ marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                {donorTxs.slice(0, 3).map((dtx, i) => (
                  <View
                    key={dtx.id}
                    style={{
                      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10,
                      borderBottomWidth: i < Math.min(3, donorTxs.length) - 1 ? StyleSheet.hairlineWidth : 0,
                      borderBottomColor: C.separator,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: C.label }}>{getFundById(dtx.fundId).name}</Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>{formatDate(dtx.date)}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{formatCurrency(dtx.amount)}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        );
      })()}

      {/* Create Campaign overlay */}
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
                <TextInput style={{ fontSize: 15, color: C.label }} placeholder="e.g. Spring 2026 Fund Drive" placeholderTextColor={C.muted} value={newCampaignName} onChangeText={setNewCampaignName} />
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Goal Amount *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ fontSize: 15, color: C.muted, marginRight: 4 }}>$</Text>
                <TextInput style={{ flex: 1, fontSize: 15, color: C.label }} placeholder="50,000" placeholderTextColor={C.muted} keyboardType="decimal-pad" value={newCampaignGoal} onChangeText={setNewCampaignGoal} />
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

      {/* Admin Dashboard overlay */}
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
                  <Pressable key={key} style={[s.freqBtn, active && s.freqBtnActive]} onPress={() => { Haptics.selectionAsync(); setDashPeriod(key); }}>
                    <Text style={[s.freqBtnText, { color: active ? C.label : C.secondary }, active && { fontWeight: '700' }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Stats grid */}
            {(() => {
              const d = ADMIN_DASHBOARD[dashPeriod];
              return (
                <>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    {([
                      { label: 'Total',    value: formatCurrency(d.total),   color: C.accent  },
                      { label: 'Donors',   value: d.donors.toString(),       color: '#5A8A6E' },
                      { label: 'Avg Gift', value: formatCurrency(d.avgGift), color: C.label   },
                    ] as const).map(stat => (
                      <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                        <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Alumni participation rate */}
                  <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 8 }}>Alumni Participation Rate</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                      <Text style={{ fontSize: 40, fontWeight: '800', color: C.accent }}>{d.alumniRate}%</Text>
                      <Text style={{ fontSize: 14, color: C.secondary }}>of alumni gave</Text>
                    </View>
                    <View style={{ height: 10, borderRadius: 5, backgroundColor: C.separator }}>
                      <View style={{ height: 10, borderRadius: 5, backgroundColor: C.accent, width: `${d.alumniRate}%` as any }} />
                    </View>
                  </View>
                </>
              );
            })()}

            {/* New vs Returning */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#5A8A6E' }}>{ADMIN_DASHBOARD.returningDonorCount}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>Returning Donors</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.accent }}>{ADMIN_DASHBOARD.newDonorCount}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>New Donors</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: ADMIN_DASHBOARD.yoyThisYear > 0 ? '#5A8A6E' : '#B85C5C' }}>
                  {ADMIN_DASHBOARD.yoyThisYear > 0 ? '+' : ''}{ADMIN_DASHBOARD.yoyThisYear}%
                </Text>
                <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>YoY Growth</Text>
              </View>
            </View>

            {/* 6-month trend */}
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>6-Month Trend</Text>
            {(() => {
              const maxAmt = Math.max(...ADMIN_DASHBOARD.trendData.map(d => d.amount));
              return (
                <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
                    {ADMIN_DASHBOARD.trendData.map((pt, i) => {
                      const barH = maxAmt > 0 ? Math.max(4, Math.round((pt.amount / maxAmt) * 72)) : 4;
                      const isLast = i === ADMIN_DASHBOARD.trendData.length - 1;
                      return (
                        <View key={pt.month} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 80 }}>
                          <View style={{ width: '80%', height: barH, borderRadius: 4, backgroundColor: isLast ? C.accent : C.accent + '55' }} />
                          <Text style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>{pt.month}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })()}

            {/* By Fund */}
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>By Fund</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, gap: 12, marginBottom: 16 }}>
              {ADMIN_DASHBOARD.byFund.map(fb => (
                <View key={fb.fundId}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: C.label }}>{getFundById(fb.fundId).name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{formatCurrency(fb.amount)}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{fb.percentage}%</Text>
                    </View>
                  </View>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${fb.percentage}%` as any }} />
                  </View>
                </View>
              ))}
            </View>

            {/* Class leaderboard top 3 */}
            <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 10 }]}>Top Classes</Text>
            {ADMIN_DASHBOARD.classLeaderboard.slice(0, 3).map((cls, idx) => (
              <View key={cls.classYear} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: idx === 0 ? C.accent : C.muted, width: 24, textAlign: 'center' }}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Class of {cls.classYear}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{cls.participationRate}% participation</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.label }}>{formatCurrency(cls.totalRaised)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen:          { flex: 1 },
    topBarWrap:      { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    topBar:          { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    topBarSide:      { width: 60 },
    dropdownPillWrap:{ flex: 1, alignItems: 'center' },
    dropdownPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    dropdownPillText:{ fontSize: 15, fontWeight: '700' },
    pillsRow:        { borderTopWidth: StyleSheet.hairlineWidth },
    pillsContent:    { paddingHorizontal: 16, gap: 8, alignItems: 'center', height: PILLS_H },
    pill:            { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    pillText:        { fontSize: 13 },
    dropdown:        { position: 'absolute', left: 16, right: 16, zIndex: 99, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
    dropdownOpt:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
    dropdownOptText: { flex: 1, fontSize: 15, fontWeight: '600' },
    fab:             { position: 'absolute', right: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    adminBanner:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
    givingDayCard:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
    amountWrap:      { alignItems: 'center', paddingVertical: 20 },
    amountRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    amountDollar:    { fontSize: 40, fontWeight: '700', lineHeight: 80 },
    amountInput:     { fontSize: 72, fontWeight: '800', minWidth: 60 },
    fundPill:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    fundPillText:    { fontSize: 13 },
    freqRow:         { flexDirection: 'row', borderRadius: 12, padding: 3 },
    freqBtn:         { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    freqBtnActive:   { backgroundColor: C.bg },
    freqBtnText:     { fontSize: 13 },
    methodRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
    matchSection:    { borderRadius: 14, overflow: 'hidden' },
    matchCheckRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
    matchInputWrap:  { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    checkbox:        { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    dedicateSection: { borderRadius: 14, overflow: 'hidden' },
    dedicateHeader:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
    giveBtn:         { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    giveBtnText:     { fontSize: 17, fontWeight: '800' },
    sectionLabel:    { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    recurringCard:   { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    taxCard:         { borderRadius: 14, padding: 16 },
    campaignCard:    { borderRadius: 14, padding: 16, marginBottom: 12 },
    statsRow:        { flexDirection: 'row', borderRadius: 14, padding: 14, marginBottom: 2 },
    statItem:        { flex: 1, alignItems: 'center', gap: 3 },
    statNum:         { fontSize: 16, fontWeight: '800' },
    statLabel:       { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
    statDivider:     { width: 1, marginVertical: 4 },
    successToast:    { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#5A8A6E', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, zIndex: 90 },
    donorSheet:      { position: 'absolute', left: 0, right: 0, bottom: 0, height: DONOR_SHEET_H, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    p2pSheet:        { position: 'absolute', left: 0, right: 0, bottom: 0, height: P2P_SHEET_H, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    receiptSheet:    { position: 'absolute', left: 0, right: 0, bottom: 0, height: RECEIPT_SHEET_H, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  });
}
