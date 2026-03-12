/**
 * Wallet Content — 3-page swipeable layout for KayPay.
 * Page 0: Home — balance, quick actions, card preview, recent transactions.
 * Page 1: Card — card visual, controls, bill pay, direct deposit, credit, loans.
 * Page 2: Grow — savings vaults, crypto, IRA, future.
 * 3 dots at top. Swipe right on page 0 = side panel.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getTransactions,
  getBalance,
  getCardInfo,
  getBillers,
  getSavingsVaults,
  getCryptoHoldings,
  getCryptoIra,
  getQuickRecipients,
  formatCurrency,
  formatCompact,
  TRANSACTION_FILTERS,
  APY_RATE,
  MONTHLY_INTEREST,
  type Transaction,
  type TransactionFilterKey,
} from '@/data/mock-wallet';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Shared components ────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: readonly { key: T; label: string }[] | { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return <Text style={s.sectionHeader}>{title}</Text>;
}

// ─── Quick Action Button ─────────────────────────────────────────────────

function QuickAction({ icon, label }: { icon: string; label: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.quickAction, pressed && { opacity: 0.8 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={s.quickActionIcon}>
        <IconSymbol name={icon as any} size={20} color={C.label} />
      </View>
      <Text style={s.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Transaction Row ─────────────────────────────────────────────────────

function TransactionRow({
  tx,
  onLongPress,
}: {
  tx: Transaction;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const isPositive = tx.amount > 0;
  return (
    <Pressable
      style={({ pressed }) => [s.txRow, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.txAvatar}>
        <Text style={s.txAvatarText}>{tx.avatarInitials}</Text>
      </View>
      <View style={s.txInfo}>
        <Text style={s.txName} numberOfLines={1}>{tx.name}</Text>
        <Text style={s.txNote} numberOfLines={1}>{tx.note}</Text>
      </View>
      <View style={s.txAmountCol}>
        <Text style={[s.txAmount, { color: isPositive ? C.green : C.label }]}>
          {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
        </Text>
        <Text style={s.txTimestamp}>{tx.timestamp}</Text>
      </View>
    </Pressable>
  );
}

// ─── Card Preview (Page 0) ───────────────────────────────────────────────

function CardPreview({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const card = getCardInfo();
  return (
    <Pressable
      style={({ pressed }) => [s.cardPreview, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <Text style={s.cardBrand}>KayPay</Text>
      <Text style={s.cardLast4}>•••• {card.last4}</Text>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ─── Card Visual (Page 1) ────────────────────────────────────────────────

function CardVisual() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const card = getCardInfo();
  return (
    <Pressable
      style={({ pressed }) => [s.cardVisual, pressed && { opacity: 0.95 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={s.cardVisualTop}>
        <Text style={s.cardVisualBrand}>KayPay</Text>
        {card.frozen && (
          <View style={s.frozenBadge}>
            <IconSymbol name="snowflake" size={10} color={C.blue} />
            <Text style={s.frozenText}>Frozen</Text>
          </View>
        )}
      </View>
      <Text style={s.cardVisualNumber}>•••• •••• •••• {card.last4}</Text>
      <View style={s.cardVisualBottom}>
        <View>
          <Text style={s.cardVisualLabel}>CARD HOLDER</Text>
          <Text style={s.cardVisualValue}>{card.name}</Text>
        </View>
        <View>
          <Text style={s.cardVisualLabel}>EXPIRES</Text>
          <Text style={s.cardVisualValue}>{card.expiry}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Card Control Button ─────────────────────────────────────────────────

function CardControl({ icon, label }: { icon: string; label: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.cardControl, pressed && { opacity: 0.8 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={s.cardControlIcon}>
        <IconSymbol name={icon as any} size={18} color={C.label} />
      </View>
      <Text style={s.cardControlLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Biller Row ──────────────────────────────────────────────────────────

const BILLER_ICONS: Record<string, string> = {
  rent: 'house.fill',
  utilities: 'bolt.fill',
  phone: 'phone.fill',
  internet: 'wifi',
  insurance: 'shield.fill',
};

function BillerRow({ biller }: { biller: ReturnType<typeof getBillers>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={({ pressed }) => [s.billerRow, pressed && { opacity: 0.85 }]}>
      <View style={s.billerIcon}>
        <IconSymbol name={(BILLER_ICONS[biller.category] ?? 'doc.fill') as any} size={16} color={C.secondary} />
      </View>
      <View style={s.billerInfo}>
        <Text style={s.billerName}>{biller.name}</Text>
        <Text style={s.billerDue}>Due {biller.dueDate}</Text>
      </View>
      {biller.autoPay && (
        <View style={s.autoPayBadge}>
          <Text style={s.autoPayText}>Auto</Text>
        </View>
      )}
      <Text style={s.billerAmount}>{formatCurrency(biller.amountDue)}</Text>
    </Pressable>
  );
}

// ─── Vault Card ──────────────────────────────────────────────────────────

function VaultCard({ vault }: { vault: ReturnType<typeof getSavingsVaults>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const pct = Math.min(vault.current / vault.target, 1);
  return (
    <Pressable style={({ pressed }) => [s.vaultCard, pressed && { opacity: 0.85 }]}>
      <View style={s.vaultHeader}>
        <IconSymbol name={vault.iconName as any} size={18} color={C.blue} />
        <Text style={s.vaultName}>{vault.name}</Text>
      </View>
      <View style={s.progressBarBg}>
        <View style={[s.progressBarFill, { width: `${pct * 100}%` }]} />
      </View>
      <View style={s.vaultFooter}>
        <Text style={s.vaultCurrent}>{formatCompact(vault.current)}</Text>
        <Text style={s.vaultTarget}>of {formatCompact(vault.target)}</Text>
      </View>
    </Pressable>
  );
}

// ─── Crypto Row ──────────────────────────────────────────────────────────

function CryptoRow({ holding }: { holding: ReturnType<typeof getCryptoHoldings>[number] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const isUp = holding.gainLoss >= 0;
  const holdingsValue = holding.price * holding.holdings;
  return (
    <Pressable style={({ pressed }) => [s.cryptoRow, pressed && { opacity: 0.85 }]}>
      <View style={s.cryptoIcon}>
        <Text style={s.cryptoSymbol}>{holding.symbol.slice(0, 2)}</Text>
      </View>
      <View style={s.cryptoInfo}>
        <Text style={s.cryptoName}>{holding.coin}</Text>
        <Text style={s.cryptoPrice}>{formatCurrency(holding.price)}</Text>
      </View>
      <View style={s.cryptoRight}>
        <Text style={s.cryptoHoldings}>{formatCurrency(holdingsValue)}</Text>
        <Text style={[s.cryptoGain, { color: isUp ? C.green : C.red }]}>
          {isUp ? '+' : ''}{holding.gainPct.toFixed(1)}%
        </Text>
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function WalletContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [txFilter, setTxFilter] = useState<TransactionFilterKey>('all');

  const balance = useMemo(() => getBalance(), []);
  const recipients = useMemo(() => getQuickRecipients(), []);
  const transactions = useMemo(() => getTransactions(txFilter), [txFilter]);
  const billers = useMemo(() => getBillers(), []);
  const vaults = useMemo(() => getSavingsVaults(), []);
  const cryptoHoldings = useMemo(() => getCryptoHoldings(), []);
  const cryptoIra = useMemo(() => getCryptoIra(), []);

  const totalWealth = useMemo(() => {
    const vaultTotal = vaults.reduce((sum, v) => sum + v.current, 0);
    const cryptoTotal = cryptoHoldings.reduce((sum, h) => sum + h.price * h.holdings, 0);
    return balance + vaultTotal + cryptoTotal + cryptoIra.totalValue;
  }, [balance, vaults, cryptoHoldings, cryptoIra]);

  // Scroll footer hide
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index);
    showFooter();
  }, []);

  const longPressTx = useCallback((tx: Transaction, pageY: number) => {
    setMenuData({
      title: tx.name,
      subtitle: formatCurrency(tx.amount),
      initials: tx.avatarInitials,
      isSquircle: false,
      pageY,
      actions: [
        { key: 'receipt', label: 'Share Receipt', icon: 'square.and.arrow.up' },
        { key: 'report', label: 'Report Issue', icon: 'exclamationmark.triangle.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  const iraPct = Math.min(cryptoIra.contributionsThisYear / cryptoIra.limit, 1);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={handlePageChange}
      >
        {/* ── PAGE 0: HOME ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Balance */}
            <View style={s.balanceContainer}>
              <Text style={s.balanceAmount}>{formatCurrency(balance)}</Text>
              <Text style={s.apyText}>Earning {APY_RATE}% APY · +{formatCurrency(MONTHLY_INTEREST)}/mo</Text>
            </View>

            {/* Quick Actions */}
            <View style={s.quickActionsRow}>
              <QuickAction icon="arrow.up.right" label="Send" />
              <QuickAction icon="arrow.down.left" label="Receive" />
              <QuickAction icon="qrcode.viewfinder" label="Scan" />
              <QuickAction icon="hand.raised.fill" label="Request" />
            </View>

            {/* Card Preview */}
            <CardPreview onPress={() => { setPageIndex(1); showFooter(); }} />

            {/* Quick Recipients */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.recipientsRow}
            >
              {recipients.map((r) => (
                <Pressable
                  key={r.id}
                  style={({ pressed }) => [s.recipientItem, pressed && { opacity: 0.8 }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={s.recipientAvatar}>
                    <Text style={s.recipientInitials}>{r.initials}</Text>
                  </View>
                  <Text style={s.recipientName} numberOfLines={1}>{r.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Transaction Filter */}
            <FilterPills items={TRANSACTION_FILTERS} active={txFilter} onSelect={setTxFilter} />

            {/* Transactions */}
            {transactions.map((tx, idx) => (
              <View key={tx.id}>
                {idx > 0 && <View style={s.separator} />}
                <TransactionRow tx={tx} onLongPress={(pageY) => longPressTx(tx, pageY)} />
              </View>
            ))}
            {transactions.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>No transactions found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── PAGE 1: CARD ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Card Visual */}
            <CardVisual />

            {/* Card Controls */}
            <View style={s.cardControlsRow}>
              <CardControl icon="snowflake" label="Freeze" />
              <CardControl icon="slider.horizontal.3" label="Limits" />
              <CardControl icon="lock.fill" label="PIN" />
            </View>

            {/* Bill Pay */}
            <SectionHeader title="Bill Pay" />
            {billers.map((biller, idx) => (
              <View key={biller.id}>
                {idx > 0 && <View style={s.separator} />}
                <BillerRow biller={biller} />
              </View>
            ))}

            {/* Direct Deposit */}
            <SectionHeader title="Direct Deposit" />
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Routing</Text>
                <Text style={s.infoValue}>021000021</Text>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name="doc.on.doc" size={14} color={C.muted} />
                </Pressable>
              </View>
              <View style={s.infoSep} />
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Account</Text>
                <Text style={s.infoValue}>••••4827</Text>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name="doc.on.doc" size={14} color={C.muted} />
                </Pressable>
              </View>
            </View>

            {/* Credit */}
            <SectionHeader title="Credit" />
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Credit Line</Text>
                <Text style={s.infoValue}>{formatCurrency(2_500)}</Text>
              </View>
              <View style={s.infoSep} />
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Balance Owed</Text>
                <Text style={s.infoValue}>{formatCurrency(0)}</Text>
              </View>
              <View style={s.infoSep} />
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Min Payment</Text>
                <Text style={s.infoValue}>{formatCurrency(0)}</Text>
              </View>
              <View style={s.infoSep} />
              <Pressable style={s.infoRow}>
                <Text style={s.infoLabel}>Buy Now, Pay Later</Text>
                <Text style={[s.infoValue, { color: C.blue }]}>Explore</Text>
                <IconSymbol name="chevron.right" size={12} color={C.muted} />
              </Pressable>
            </View>

            {/* Loans */}
            <SectionHeader title="Loans" />
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Pre-qualified</Text>
                <Text style={s.infoValue}>Up to {formatCurrency(5_000)}</Text>
              </View>
              <View style={s.infoSep} />
              <Pressable style={s.infoRow}>
                <Text style={[s.infoLabel, { color: C.blue }]}>Learn More</Text>
                <IconSymbol name="chevron.right" size={12} color={C.blue} />
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* ── PAGE 2: GROW ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Total Wealth */}
            <View style={s.wealthContainer}>
              <Text style={s.wealthLabel}>Total Wealth</Text>
              <Text style={s.wealthAmount}>{formatCurrency(totalWealth)}</Text>
            </View>

            {/* Savings Vaults */}
            <SectionHeader title="Savings Vaults" />
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
            <Pressable
              style={({ pressed }) => [s.newVaultBtn, pressed && { opacity: 0.8 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="plus.circle.fill" size={18} color={C.blue} />
              <Text style={s.newVaultText}>New Vault</Text>
            </Pressable>

            {/* Crypto */}
            <SectionHeader title="Crypto" />
            <View style={s.cryptoTotal}>
              <Text style={s.cryptoTotalLabel}>Portfolio</Text>
              <Text style={s.cryptoTotalValue}>
                {formatCurrency(cryptoHoldings.reduce((sum, h) => sum + h.price * h.holdings, 0))}
              </Text>
            </View>
            {cryptoHoldings.map((holding, idx) => (
              <View key={holding.id}>
                {idx > 0 && <View style={s.separator} />}
                <CryptoRow holding={holding} />
              </View>
            ))}

            {/* Crypto IRA */}
            <SectionHeader title="Crypto IRA" />
            <View style={s.iraCard}>
              <View style={s.iraHeader}>
                <Text style={s.iraType}>{cryptoIra.accountType} IRA</Text>
                <Text style={s.iraValue}>{formatCurrency(cryptoIra.totalValue)}</Text>
              </View>
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${iraPct * 100}%`, backgroundColor: C.purple }]} />
              </View>
              <Text style={s.iraContrib}>
                {formatCurrency(cryptoIra.contributionsThisYear)} of {formatCurrency(cryptoIra.limit)} contributed
              </Text>
            </View>

            {/* Future */}
            <SectionHeader title="Investing" />
            <View style={s.comingSoonCard}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={C.muted} />
              <Text style={s.comingSoonText}>Stocks & ETFs — Coming Soon</Text>
            </View>
          </ScrollView>
        </View>
      </SwipeablePages>

      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  topBarTitle: { fontSize: 22, fontWeight: '700', color: C.label },

  // Filter pills
  filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  filterPillActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  filterTextActive: { color: '#000000' },

  // Balance
  balanceContainer: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: C.label },
  apyText: { fontSize: 13, color: C.secondary, marginTop: 4 },

  // Quick Actions
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 16, paddingVertical: 16 },
  quickAction: { alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: C.secondary },

  // Card Preview
  cardPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, padding: 16, borderRadius: 12,
    backgroundColor: C.surface,
  },
  cardBrand: { fontSize: 16, fontWeight: '700', color: C.label, flex: 1 },
  cardLast4: { fontSize: 14, color: C.secondary },

  // Recipients
  recipientsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  recipientItem: { alignItems: 'center', gap: 4 },
  recipientAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  recipientInitials: { fontSize: 14, fontWeight: '700', color: C.label },
  recipientName: { fontSize: 11, color: C.secondary, width: 44, textAlign: 'center' },

  // Transaction Row
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  txAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  txAvatarText: { fontSize: 13, fontWeight: '700', color: C.label },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, fontWeight: '600', color: C.label },
  txNote: { fontSize: 12, color: C.muted, marginTop: 1 },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txTimestamp: { fontSize: 11, color: C.muted, marginTop: 1 },

  // Card Visual (Page 1)
  cardVisual: {
    marginHorizontal: 16, padding: 24, borderRadius: 16,
    backgroundColor: C.surface, minHeight: 200, justifyContent: 'space-between',
  },
  cardVisualTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardVisualBrand: { fontSize: 22, fontWeight: '800', color: C.label },
  frozenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  frozenText: { fontSize: 11, fontWeight: '600', color: C.blue },
  cardVisualNumber: { fontSize: 20, fontWeight: '600', color: C.secondary, letterSpacing: 2, marginTop: 32 },
  cardVisualBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  cardVisualLabel: { fontSize: 9, fontWeight: '600', color: C.muted, letterSpacing: 1 },
  cardVisualValue: { fontSize: 14, fontWeight: '600', color: C.label, marginTop: 2 },

  // Card Controls
  cardControlsRow: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 20 },
  cardControl: { alignItems: 'center', gap: 6 },
  cardControlIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  cardControlLabel: { fontSize: 12, fontWeight: '600', color: C.secondary },

  // Section Header
  sectionHeader: { fontSize: 17, fontWeight: '700', color: C.label, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 10 },

  // Biller Row
  billerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  billerIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  billerInfo: { flex: 1 },
  billerName: { fontSize: 14, fontWeight: '600', color: C.label },
  billerDue: { fontSize: 12, color: C.muted, marginTop: 1 },
  autoPayBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  autoPayText: { fontSize: 10, fontWeight: '700', color: C.green },
  billerAmount: { fontSize: 14, fontWeight: '700', color: C.label, marginLeft: 8 },

  // Info Card (Direct Deposit, Credit, Loans)
  infoCard: {
    marginHorizontal: 16, borderRadius: 12, backgroundColor: C.surface,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  infoLabel: { flex: 1, fontSize: 14, color: C.secondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: C.label },
  infoSep: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 },

  // Wealth Summary (Page 2)
  wealthContainer: { alignItems: 'center', paddingBottom: 8 },
  wealthLabel: { fontSize: 13, color: C.secondary },
  wealthAmount: { fontSize: 28, fontWeight: '800', color: C.label, marginTop: 2 },

  // Vault Card
  vaultCard: {
    marginHorizontal: 16, marginBottom: 10, padding: 16,
    borderRadius: 12, backgroundColor: C.surface,
  },
  vaultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  vaultName: { fontSize: 14, fontWeight: '700', color: C.label },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressBarFill: { height: 6, borderRadius: 3, backgroundColor: C.blue },
  vaultFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  vaultCurrent: { fontSize: 14, fontWeight: '700', color: C.label },
  vaultTarget: { fontSize: 12, color: C.muted },

  // New Vault Button
  newVaultBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginHorizontal: 16, marginBottom: 8, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: C.separator, borderStyle: 'dashed',
  },
  newVaultText: { fontSize: 14, fontWeight: '600', color: C.blue },

  // Crypto
  cryptoTotal: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  cryptoTotalLabel: { fontSize: 14, color: C.secondary },
  cryptoTotalValue: { fontSize: 16, fontWeight: '700', color: C.label },
  cryptoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  cryptoIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  cryptoSymbol: { fontSize: 13, fontWeight: '800', color: C.amber },
  cryptoInfo: { flex: 1 },
  cryptoName: { fontSize: 14, fontWeight: '600', color: C.label },
  cryptoPrice: { fontSize: 12, color: C.muted, marginTop: 1 },
  cryptoRight: { alignItems: 'flex-end' },
  cryptoHoldings: { fontSize: 14, fontWeight: '700', color: C.label },
  cryptoGain: { fontSize: 12, fontWeight: '600', marginTop: 1 },

  // IRA
  iraCard: {
    marginHorizontal: 16, padding: 16, borderRadius: 12,
    backgroundColor: C.surface,
  },
  iraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iraType: { fontSize: 14, fontWeight: '700', color: C.label },
  iraValue: { fontSize: 16, fontWeight: '700', color: C.label },
  iraContrib: { fontSize: 12, color: C.muted, marginTop: 8 },

  // Coming Soon
  comingSoonCard: {
    marginHorizontal: 16, padding: 24, borderRadius: 12,
    backgroundColor: C.surface, alignItems: 'center', gap: 8,
  },
  comingSoonText: { fontSize: 14, color: C.muted },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.muted },
});
