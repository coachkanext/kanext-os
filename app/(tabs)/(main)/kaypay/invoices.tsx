/**
 * KayPay — Invoices (Owner Only)
 * Create, manage, and track invoices. Filter by status. Role-guarded.
 * Personal mode · KayPay tile.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActionSheetIOS,
  Platform,
  Alert,
  Switch,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
// ── Types ─────────────────────────────────────────────────────────────────────

type InvoiceStatus = 'Draft' | 'Sent' | 'Viewed' | 'Paid' | 'Overdue';

type Invoice = {
  id:        string;
  number:    string;
  client:    string;
  amount:    number;
  status:    InvoiceStatus;
  issueDate: string;
  dueDate:   string;
  items:     { desc: string; qty: number; rate: number }[];
};

// ── Static data ───────────────────────────────────────────────────────────────

const INITIAL_INVOICES: Invoice[] = [
  {
    id: '1', number: 'INV-001', client: 'Nike Brand Deals', amount: 3500,
    status: 'Paid', issueDate: 'Mar 1', dueDate: 'Mar 31',
    items: [{ desc: 'Brand campaign video', qty: 1, rate: 3500 }],
  },
  {
    id: '2', number: 'INV-002', client: 'Adidas Collab', amount: 2800,
    status: 'Overdue', issueDate: 'Mar 10', dueDate: 'Apr 9',
    items: [{ desc: 'Social media content pack', qty: 4, rate: 700 }],
  },
  {
    id: '3', number: 'INV-003', client: 'Under Armour', amount: 1500,
    status: 'Sent', issueDate: 'Apr 1', dueDate: 'Apr 30',
    items: [{ desc: 'Coaching consultation', qty: 3, rate: 500 }],
  },
  {
    id: '4', number: 'INV-004', client: 'Red Bull Sports', amount: 4200,
    status: 'Paid', issueDate: 'Feb 15', dueDate: 'Mar 15',
    items: [{ desc: 'Event appearance', qty: 1, rate: 4200 }],
  },
  {
    id: '5', number: 'INV-005', client: 'Gatorade', amount: 900,
    status: 'Draft', issueDate: 'Apr 7', dueDate: 'Apr 21',
    items: [{ desc: 'Product review video', qty: 1, rate: 900 }],
  },
  {
    id: '6', number: 'INV-006', client: 'ESPN Feature', amount: 2100,
    status: 'Viewed', issueDate: 'Mar 25', dueDate: 'Apr 24',
    items: [{ desc: 'Interview + feature rights', qty: 1, rate: 2100 }],
  },
  {
    id: '7', number: 'INV-007', client: 'Lincoln University', amount: 800,
    status: 'Paid', issueDate: 'Feb 1', dueDate: 'Feb 28',
    items: [{ desc: 'Speaking engagement', qty: 2, rate: 400 }],
  },
  {
    id: '8', number: 'INV-008', client: 'Academy Sports', amount: 1200,
    status: 'Overdue', issueDate: 'Mar 5', dueDate: 'Apr 4',
    items: [{ desc: 'Promo video', qty: 2, rate: 600 }],
  },
  {
    id: '9', number: 'INV-009', client: 'KaNeXT Partnership', amount: 5000,
    status: 'Sent', issueDate: 'Apr 3', dueDate: 'May 3',
    items: [{ desc: 'Platform ambassador Q2', qty: 1, rate: 5000 }],
  },
  {
    id: '10', number: 'INV-010', client: 'Whataburger', amount: 600,
    status: 'Draft', issueDate: 'Apr 8', dueDate: 'Apr 22',
    items: [{ desc: 'Social post bundle', qty: 3, rate: 200 }],
  },
];

const FILTERS = ['All', 'Draft', 'Sent', 'Viewed', 'Paid', 'Overdue'] as const;
type FilterKey = typeof FILTERS[number];

const DUE_TYPES = ['Net 15', 'Net 30', 'Net 60', 'Custom'] as const;
type DueType = typeof DUE_TYPES[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

function fmtAmountFull(n: number): string {
  return '$' + n.toLocaleString('en-US') + '.00';
}

function nextId(invoices: Invoice[]): string {
  const nums = invoices.map(i => parseInt(i.id, 10)).filter(n => !isNaN(n));
  return String(nums.length > 0 ? Math.max(...nums) + 1 : 1);
}

function nextNumber(invoices: Invoice[]): string {
  const nums = invoices
    .map(i => parseInt(i.number.replace('INV-', ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(3, '0')}`;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function InvoicesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  // ── Role guard ──────────────────────────────────────────────────────────────
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  const TOP_BAR_H = insets.top + 54;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);
  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/kaypay' as any);
  }, [isOwner]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Status config (dynamic — uses C from hook) ──────────────────────────────
  const STATUS_CONFIG: Record<InvoiceStatus, { dot: string; label: string }> = useMemo(() => ({
    Draft:   { dot: C.secondary, label: C.secondary },
    Sent:    { dot: CAUTION,     label: CAUTION },
    Viewed:  { dot: CAUTION,     label: CAUTION },
    Paid:    { dot: GAIN,        label: GAIN },
    Overdue: { dot: HEAT,        label: HEAT },
  }), [C.secondary]);

  // ── Core state ──────────────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [detailSheet, setDetailSheet] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [createSheet, setCreateSheet] = useState(false);

  // ── Create form state ───────────────────────────────────────────────────────
  const [formClient, setFormClient]   = useState('');
  const [formDueType, setFormDueType] = useState<DueType>('Net 30');
  const [formTax, setFormTax]         = useState(false);
  const [formNotes, setFormNotes]     = useState('');
  const [formItems, setFormItems]     = useState([{ desc: '', qty: '1', rate: '' }]);

  // ── Derived: filtered list ──────────────────────────────────────────────────
  const filteredInvoices = useMemo(
    () => activeFilter === 'All' ? invoices : invoices.filter(i => i.status === activeFilter),
    [invoices, activeFilter],
  );

  // ── Derived: summary stats ──────────────────────────────────────────────────
  const { outstanding, paidMonth } = useMemo(() => {
    const outstanding = invoices
      .filter(i => i.status === 'Overdue' || i.status === 'Sent' || i.status === 'Viewed')
      .reduce((sum, i) => sum + i.amount, 0);
    const paidMonth = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.amount, 0);
    return { outstanding, paidMonth };
  }, [invoices]);

  // ── Haptics ─────────────────────────────────────────────────────────────────
  const tap = useCallback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), []);

  // ── Action sheet (3-dot) ────────────────────────────────────────────────────
  const showActionSheet = useCallback((inv: Invoice) => {
    tap();
    const options = ['View Invoice', 'Send Reminder', 'Mark as Paid', 'Download PDF', 'Delete', 'Cancel'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 5, destructiveButtonIndex: 4, title: `${inv.number} · ${inv.client}` },
        idx => {
          if (idx === 0) {
            setDetailInvoice(inv);
            setDetailSheet(true);
          } else if (idx === 1) {
            Alert.alert('Reminder Sent', `A reminder has been sent to ${inv.client}.`);
          } else if (idx === 2) {
            setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'Paid' } : i));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else if (idx === 3) {
            Alert.alert('Download PDF', 'PDF export is coming soon.');
          } else if (idx === 4) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Delete Invoice', `Delete ${inv.number}?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete', style: 'destructive',
                onPress: () => setInvoices(prev => prev.filter(i => i.id !== inv.id)),
              },
            ]);
          }
        },
      );
    } else {
      Alert.alert(`${inv.number} · ${inv.client}`, undefined, [
        { text: 'View Invoice', onPress: () => { setDetailInvoice(inv); setDetailSheet(true); } },
        { text: 'Send Reminder', onPress: () => Alert.alert('Reminder Sent', `Sent to ${inv.client}.`) },
        { text: 'Mark as Paid', onPress: () => setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'Paid' } : i)) },
        { text: 'Download PDF', onPress: () => Alert.alert('Download PDF', 'Coming soon.') },
        { text: 'Delete', style: 'destructive', onPress: () => setInvoices(prev => prev.filter(i => i.id !== inv.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [tap]);

  // ── Reset create form ───────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormClient('');
    setFormDueType('Net 30');
    setFormTax(false);
    setFormNotes('');
    setFormItems([{ desc: '', qty: '1', rate: '' }]);
  }, []);

  // ── Save invoice ────────────────────────────────────────────────────────────
  const saveInvoice = useCallback((asDraft: boolean) => {
    if (!formClient.trim()) {
      Alert.alert('Client Required', 'Please enter a client name.');
      return;
    }
    const parsedItems = formItems
      .filter(it => it.desc.trim() || it.rate.trim())
      .map(it => ({
        desc: it.desc.trim(),
        qty:  parseInt(it.qty, 10) || 1,
        rate: parseFloat(it.rate) || 0,
      }));
    if (parsedItems.length === 0) {
      Alert.alert('Line Item Required', 'Add at least one line item.');
      return;
    }
    const subtotal = parsedItems.reduce((sum, it) => sum + it.qty * it.rate, 0);
    const tax      = formTax ? subtotal * 0.0825 : 0;
    const total    = subtotal + tax;
    const newInv: Invoice = {
      id:        nextId(invoices),
      number:    nextNumber(invoices),
      client:    formClient.trim(),
      amount:    Math.round(total),
      status:    asDraft ? 'Draft' : 'Sent',
      issueDate: 'Apr 8',
      dueDate:   formDueType === 'Net 15' ? 'Apr 23'
                 : formDueType === 'Net 30' ? 'May 8'
                 : formDueType === 'Net 60' ? 'Jun 7'
                 : 'TBD',
      items:     parsedItems,
    };
    setInvoices(prev => [newInv, ...prev]);
    setCreateSheet(false);
    resetForm();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [formClient, formItems, formTax, formDueType, invoices, resetForm]);

  // ── Detail: mark as paid ────────────────────────────────────────────────────
  const markDetailPaid = useCallback(() => {
    if (!detailInvoice) return;
    setInvoices(prev => prev.map(i => i.id === detailInvoice.id ? { ...i, status: 'Paid' } : i));
    setDetailInvoice(prev => prev ? { ...prev, status: 'Paid' } : prev);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [detailInvoice]);

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.topBarOuter,
          { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top, opacity },
        ]}
      >
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.topBarTitle, { color: C.label }]}>Invoices</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
          <Pressable
            onPress={() => { tap(); setCreateSheet(true); }}
            style={{ marginRight: 16, marginLeft: 8 }}
          >
            <Text style={[s.newBtn, { color: C.label }]}>+ New</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Main scroll ─────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{
          paddingTop:    TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 100,
        }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Summary row ─────────────────────────────────────────────────── */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: C.surface }]}>
            <Text style={[s.summaryCardLabel, { color: C.secondary }]}>Outstanding</Text>
            <Text style={[s.summaryCardValue, { color: HEAT }]}>{fmtAmount(outstanding)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: C.surface }]}>
            <Text style={[s.summaryCardLabel, { color: C.secondary }]}>Paid / Month</Text>
            <Text style={[s.summaryCardValue, { color: GAIN }]}>{fmtAmount(paidMonth)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: C.surface }]}>
            <Text style={[s.summaryCardLabel, { color: C.secondary }]}>Total</Text>
            <Text style={[s.summaryCardValue, { color: C.label }]}>{invoices.length} invoices</Text>
          </View>
        </View>

        {/* ── Filter pills ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterScroll}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => { tap(); setActiveFilter(f); }}
                style={[
                  s.filterPill,
                  { backgroundColor: active ? C.label : C.surface },
                ]}
              >
                <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Invoice list ─────────────────────────────────────────────────── */}
        <View style={s.listWrapper}>
          {filteredInvoices.map(inv => {
            const sc       = STATUS_CONFIG[inv.status];
            const isOverdue = inv.status === 'Overdue';
            return (
              <Pressable
                key={inv.id}
                onPress={() => { tap(); setDetailInvoice(inv); setDetailSheet(true); }}
                style={[
                  s.invoiceCard,
                  { backgroundColor: C.surface },
                  isOverdue && { borderLeftWidth: 3, borderLeftColor: HEAT },
                ]}
              >
                {/* Row 1: number + status badge */}
                <View style={s.invRow}>
                  <Text style={[s.invNumber, { color: C.secondary }]}>#{inv.number}</Text>
                  <View style={s.statusBadge}>
                    <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
                    <Text style={[s.statusText, { color: sc.label }]}>{inv.status}</Text>
                  </View>
                </View>

                {/* Row 2: client + amount */}
                <View style={s.invRow}>
                  <Text style={[s.clientName, { color: C.label }]} numberOfLines={1}>{inv.client}</Text>
                  <Text style={[s.amountText, { color: C.label }]}>{fmtAmountFull(inv.amount)}</Text>
                </View>

                {/* Row 3: dates */}
                <View style={s.invRow}>
                  <Text style={[s.dateText, { color: C.secondary }]}>Issued {inv.issueDate}</Text>
                  <Text style={[s.dateText, { color: C.secondary }]}>Due {inv.dueDate}</Text>
                </View>

                {/* Hairline */}
                <View style={[s.hairline, { backgroundColor: C.separator }]} />

                {/* Ellipsis row */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Pressable
                    onPress={e => { e.stopPropagation(); showActionSheet(inv); }}
                    hitSlop={8}
                    style={{ paddingVertical: 4 }}
                  >
                    <Text style={[s.ellipsis, { color: C.secondary }]}>•••</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>

      {/* ── Invoice Detail BottomSheet ─────────────────────────────────────── */}
      <BottomSheet
        visible={detailSheet}
        onClose={() => setDetailSheet(false)}
        useModal
      >
        {detailInvoice && (
          <InvoiceDetailContent
            inv={detailInvoice}
            C={C}
            STATUS_CONFIG={STATUS_CONFIG}
            onMarkPaid={markDetailPaid}
            onClose={() => setDetailSheet(false)}
          />
        )}
      </BottomSheet>

      {/* ── Create Invoice BottomSheet ────────────────────────────────────── */}
      <BottomSheet
        visible={createSheet}
        onClose={() => { setCreateSheet(false); resetForm(); }}
        useModal
      >
        <CreateInvoiceContent
          C={C}
          formClient={formClient}
          setFormClient={setFormClient}
          formDueType={formDueType}
          setFormDueType={setFormDueType}
          formTax={formTax}
          setFormTax={setFormTax}
          formNotes={formNotes}
          setFormNotes={setFormNotes}
          formItems={formItems}
          setFormItems={setFormItems}
          onSend={() => saveInvoice(false)}
          onDraft={() => saveInvoice(true)}
        />
      </BottomSheet>

    </View>
  );
}

// ── Invoice Detail Content ────────────────────────────────────────────────────

type StatusConfig = Record<InvoiceStatus, { dot: string; label: string }>;

function InvoiceDetailContent({
  inv,
  C,
  STATUS_CONFIG,
  onMarkPaid,
  onClose,
}: {
  inv: Invoice;
  C: ComponentColors;
  STATUS_CONFIG: StatusConfig;
  onMarkPaid: () => void;
  onClose: () => void;
}) {
  const sc       = STATUS_CONFIG[inv.status];
  const subtotal = inv.items.reduce((sum, it) => sum + it.qty * it.rate, 0);
  const tax      = subtotal * 0.0825;
  const hasTax   = false; // mock invoices don't carry tax flag; show subtotal = total
  const total    = subtotal;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}>

      {/* Invoice number + status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{inv.number}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sc.dot }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: sc.label }}>{inv.status}</Text>
        </View>
      </View>

      {/* Client */}
      <Text style={{ fontSize: 22, fontWeight: '700', color: C.label, marginBottom: 16 }}>{inv.client}</Text>

      {/* Dates */}
      <View style={{ flexDirection: 'row', gap: 32, marginBottom: 20 }}>
        <View>
          <Text style={{ fontSize: 11, color: C.secondary, fontWeight: '500', marginBottom: 2 }}>ISSUED</Text>
          <Text style={{ fontSize: 14, color: C.label, fontWeight: '600' }}>{inv.issueDate}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, color: C.secondary, fontWeight: '500', marginBottom: 2 }}>DUE</Text>
          <Text style={{ fontSize: 14, color: C.label, fontWeight: '600' }}>{inv.dueDate}</Text>
        </View>
      </View>

      {/* Line items table */}
      <View style={{ borderRadius: 10, backgroundColor: C.surface, overflow: 'hidden', marginBottom: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: C.secondary }}>DESCRIPTION</Text>
          <Text style={{ width: 36, fontSize: 11, fontWeight: '600', color: C.secondary, textAlign: 'center' }}>QTY</Text>
          <Text style={{ width: 72, fontSize: 11, fontWeight: '600', color: C.secondary, textAlign: 'right' }}>RATE</Text>
          <Text style={{ width: 72, fontSize: 11, fontWeight: '600', color: C.secondary, textAlign: 'right' }}>AMT</Text>
        </View>
        {/* Rows */}
        {inv.items.map((it, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 12, paddingVertical: 10,
              borderBottomWidth: idx < inv.items.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}
          >
            <Text style={{ flex: 1, fontSize: 13, color: C.label }} numberOfLines={2}>{it.desc}</Text>
            <Text style={{ width: 36, fontSize: 13, color: C.label, textAlign: 'center' }}>{it.qty}</Text>
            <Text style={{ width: 72, fontSize: 13, color: C.label, textAlign: 'right' }}>${it.rate.toLocaleString()}</Text>
            <Text style={{ width: 72, fontSize: 13, color: C.label, textAlign: 'right' }}>${(it.qty * it.rate).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ paddingHorizontal: 4, gap: 6, marginBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: C.secondary }}>Subtotal</Text>
          <Text style={{ fontSize: 13, color: C.label }}>${subtotal.toLocaleString()}.00</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: C.secondary }}>Tax (8.25%)</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>—</Text>
        </View>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Total</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>${total.toLocaleString()}.00</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={{ gap: 10 }}>
        {inv.status !== 'Paid' && (
          <Pressable
            onPress={() => Alert.alert('Reminder Sent', `Reminder sent to ${inv.client}.`)}
            style={{ borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Send Reminder</Text>
          </Pressable>
        )}
        {inv.status !== 'Paid' && (
          <Pressable
            onPress={onMarkPaid}
            style={{ borderRadius: 12, backgroundColor: C.label, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.bg }}>Mark as Paid</Text>
          </Pressable>
        )}
        {inv.status === 'Paid' && (
          <View style={{ borderRadius: 12, backgroundColor: C.surface, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: GAIN }}>Paid</Text>
          </View>
        )}
        <Pressable
          onPress={() => Alert.alert('Download PDF', 'PDF export is coming soon.')}
          style={{ borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.secondary }}>Download PDF</Text>
        </Pressable>
      </View>

    </View>
  );
}

// ── Create Invoice Content ────────────────────────────────────────────────────

function CreateInvoiceContent({
  C,
  formClient, setFormClient,
  formDueType, setFormDueType,
  formTax, setFormTax,
  formNotes, setFormNotes,
  formItems, setFormItems,
  onSend, onDraft,
}: {
  C: ComponentColors;
  formClient: string;
  setFormClient: (v: string) => void;
  formDueType: DueType;
  setFormDueType: (v: DueType) => void;
  formTax: boolean;
  setFormTax: (v: boolean) => void;
  formNotes: string;
  setFormNotes: (v: string) => void;
  formItems: { desc: string; qty: string; rate: string }[];
  setFormItems: React.Dispatch<React.SetStateAction<{ desc: string; qty: string; rate: string }[]>>;
  onSend: () => void;
  onDraft: () => void;
}) {
  const inputStyle = {
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15 as const,
    color: C.label,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  };

  const updateItem = (idx: number, field: 'desc' | 'qty' | 'rate', value: string) => {
    setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addItem = () => {
    if (formItems.length >= 4) return;
    setFormItems(prev => [...prev, { desc: '', qty: '1', rate: '' }]);
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, gap: 18 }}>

      <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>New Invoice</Text>

      {/* Client */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>CLIENT</Text>
        <TextInput
          value={formClient}
          onChangeText={setFormClient}
          placeholder="Client or company name"
          placeholderTextColor={C.secondary}
          style={inputStyle}
          returnKeyType="done"
        />
      </View>

      {/* Due date pills */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>PAYMENT TERMS</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {DUE_TYPES.map(dt => {
            const active = formDueType === dt;
            return (
              <Pressable
                key={dt}
                onPress={() => setFormDueType(dt)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: active ? C.label : C.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: active ? C.label : C.separator,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.bg : C.secondary }}>{dt}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Line items */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>LINE ITEMS</Text>
        <View style={{ gap: 8 }}>
          {formItems.map((it, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <TextInput
                value={it.desc}
                onChangeText={v => updateItem(idx, 'desc', v)}
                placeholder="Description"
                placeholderTextColor={C.secondary}
                style={[inputStyle, { flex: 1 }]}
                returnKeyType="next"
              />
              <TextInput
                value={it.qty}
                onChangeText={v => updateItem(idx, 'qty', v)}
                placeholder="Qty"
                placeholderTextColor={C.secondary}
                style={[inputStyle, { width: 48, textAlign: 'center' }]}
                keyboardType="numeric"
                returnKeyType="next"
              />
              <TextInput
                value={it.rate}
                onChangeText={v => updateItem(idx, 'rate', v)}
                placeholder="Rate"
                placeholderTextColor={C.secondary}
                style={[inputStyle, { width: 72 }]}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          ))}
        </View>
        {formItems.length < 4 && (
          <Pressable onPress={addItem} style={{ paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>+ Add Item</Text>
          </Pressable>
        )}
      </View>

      {/* Tax toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Apply Tax</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>8.25% sales tax</Text>
        </View>
        <Switch
          value={formTax}
          onValueChange={setFormTax}
          trackColor={{ false: C.separator, true: C.label }}
          thumbColor={C.bg}
        />
      </View>

      {/* Notes */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>NOTES</Text>
        <TextInput
          value={formNotes}
          onChangeText={setFormNotes}
          placeholder="Payment instructions, notes…"
          placeholderTextColor={C.secondary}
          style={[inputStyle, { minHeight: 72, textAlignVertical: 'top', paddingTop: 12 }]}
          multiline
          numberOfLines={3}
          returnKeyType="default"
        />
      </View>

      {/* Actions */}
      <View style={{ gap: 12, paddingTop: 4 }}>
        <Pressable
          onPress={onSend}
          style={{ borderRadius: 14, backgroundColor: C.label, padding: 16, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Send Invoice</Text>
        </Pressable>
        <Pressable onPress={onDraft} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.secondary }}>Save as Draft</Text>
        </Pressable>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Top bar
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
    topBarTitle: { fontSize: 17, fontWeight: '700' },
    newBtn:      { fontSize: 13, fontWeight: '600' },

    // Summary row
    summaryRow:       { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
    summaryCard:      { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
    summaryCardLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
    summaryCardValue: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'], textAlign: 'center' },

    // Filter pills
    filterScroll: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
    filterPill:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    filterPillText: { fontSize: 13, fontWeight: '600' },

    // Invoice list
    listWrapper:  { paddingHorizontal: 16, gap: 10 },
    invoiceCard:  { borderRadius: 12, padding: 14, overflow: 'hidden' },
    invRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    invNumber:    { fontSize: 12, fontWeight: '500' },
    statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statusDot:    { width: 7, height: 7, borderRadius: 4 },
    statusText:   { fontSize: 12, fontWeight: '600' },
    clientName:   { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
    amountText:   { fontSize: 15, fontWeight: '700' },
    dateText:     { fontSize: 12 },
    hairline:     { height: StyleSheet.hairlineWidth, marginTop: 10, marginBottom: 2 },
    ellipsis:     { fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  });
}
