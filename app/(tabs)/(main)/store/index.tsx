/**
 * Store — Products / Orders / Drops
 * Consumer-facing product store. Mode-aware: Business products, Sports merch,
 * Education bookstore. RBAC: Admin manages catalog, Member browses and buys.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Image, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import {
  getProducts, getFeaturedBanner, getOrders, getDrops,
  STORE_CATEGORIES, ORDER_FILTERS, DROP_FILTERS, formatPrice,
  type ProductItem, type OrderItem, type DropItem,
} from '@/data/mock-store';

const TOP_BAR_H = 52;
const PILLS_H   = 48;

type StoreTab  = 'Products' | 'Orders' | 'Drops';
type StoreRole = 'Admin' | 'Member';
type StoreMode = 'sports' | 'business' | 'education';

function pillsForTab(tab: StoreTab, mode: StoreMode): string[] {
  if (tab === 'Products') {
    return (STORE_CATEGORIES[mode] ?? STORE_CATEGORIES.business).map(c => c.label);
  }
  if (tab === 'Orders') return ORDER_FILTERS.map(f => f.label);
  return DROP_FILTERS.map(f => f.label);
}

function orderStatusColor(status: OrderItem['status'], C: ComponentColors): string {
  switch (status) {
    case 'delivered':        return C.green;
    case 'out_for_delivery': return C.accent;
    case 'shipped':          return '#1A1714';
    case 'processing':       return C.amber as string;
    case 'cancelled':        return C.red;
    default:                 return C.muted as string;
  }
}

function orderStatusLabel(status: OrderItem['status']): string {
  if (status === 'out_for_delivery') return 'Out for Delivery';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function dropTypeColor(type: DropItem['type'], C: ComponentColors): string {
  switch (type) {
    case 'live_now':    return C.green;
    case 'exclusive':   return C.accent;
    case 'sale':        return C.red;
    case 'coming_soon': return C.amber as string;
    default:            return C.muted as string;
  }
}

function dropTypeLabel(type: DropItem['type']): string {
  const map: Record<string, string> = {
    live_now: 'Live Now', exclusive: 'Exclusive', sale: 'Sale', coming_soon: 'Coming Soon',
  };
  return map[type] ?? type;
}

// ── ProductCard ────────────────────────────────────────────────────────────────

function ProductCard({ item, C }: { item: ProductItem; C: ComponentColors }) {
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.productCard, pressed && { opacity: 0.8 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Image source={{ uri: item.imageUri }} style={s.productImage} />
      <View style={s.productInfo}>
        <Text style={[s.productName, { color: C.label }]} numberOfLines={2}>{item.name}</Text>
        {item.subtitle && (
          <Text style={[s.productSub, { color: C.secondary as string }]} numberOfLines={1}>{item.subtitle}</Text>
        )}
        <View style={[s.row, { marginTop: 6, justifyContent: 'space-between' }]}>
          <Text style={[s.productPrice, { color: C.label }]}>{formatPrice(item.price)}</Text>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={[s.addBtn, { backgroundColor: C.accent }]}
          >
            <Text style={s.addBtnText}>{item.actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

function OrderCard({ item, C }: { item: OrderItem; C: ComponentColors }) {
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = orderStatusColor(item.status, C);
  return (
    <GlassView tier={1} style={s.orderCard}>
      <View style={s.row}>
        <Image source={{ uri: item.productImage }} style={s.orderThumb} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={2}>{item.productName}</Text>
          <Text style={[s.bodySmall, { color: C.secondary as string, marginTop: 2 }]}>{item.dateOrdered}</Text>
          <View style={[s.row, { marginTop: 6, justifyContent: 'space-between' }]}>
            <View style={[s.statusBadge, { backgroundColor: `${statusColor}18`, borderColor: statusColor }]}>
              <Text style={[s.statusBadgeText, { color: statusColor }]}>{orderStatusLabel(item.status)}</Text>
            </View>
            <Text style={[s.bodyMed, { color: C.label }]}>{formatPrice(item.amount)}</Text>
          </View>
        </View>
      </View>
      {item.trackingUrl && item.status !== 'cancelled' && item.status !== 'delivered' && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={[s.trackBtn, { borderTopColor: C.separator as string }]}
        >
          <IconSymbol name="map.fill" size={13} color={C.accent} />
          <Text style={[s.bodySmall, { color: C.accent, fontWeight: '600' }]}>Track Order</Text>
        </Pressable>
      )}
    </GlassView>
  );
}

// ── DropCard ──────────────────────────────────────────────────────────────────

function DropCard({ item, C }: { item: DropItem; C: ComponentColors }) {
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = dropTypeColor(item.type, C);
  return (
    <Pressable
      style={({ pressed }) => [s.dropCard, pressed && { opacity: 0.85 }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Image source={{ uri: item.imageUri }} style={s.dropImage} />
      <View style={[s.dropTypeBadge, { backgroundColor: `${typeColor}E8` }]}>
        <Text style={s.dropTypeBadgeText}>{dropTypeLabel(item.type)}</Text>
      </View>
      {item.stockLeft !== undefined && (
        <View style={s.stockBadge}>
          <Text style={s.stockBadgeText}>{item.stockLeft} left</Text>
        </View>
      )}
      <View style={[s.dropInfo, { backgroundColor: C.surface }]}>
        <Text style={[s.productName, { color: C.label }]} numberOfLines={2}>{item.name}</Text>
        <View style={[s.row, { marginTop: 6, justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            {item.price !== undefined ? (
              <View style={s.row}>
                <Text style={[s.productPrice, { color: C.label }]}>{formatPrice(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={[s.strikePrice, { color: C.muted as string }]}>{formatPrice(item.originalPrice)}</Text>
                )}
              </View>
            ) : item.countdown ? (
              <View style={[s.row, { gap: 4 }]}>
                <IconSymbol name="clock.fill" size={12} color={C.amber as string} />
                <Text style={[s.bodySmall, { color: C.amber as string, fontWeight: '600' }]}>{item.countdown}</Text>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={[s.addBtn, {
              backgroundColor: item.type === 'coming_soon' ? C.surfacePressed as string : C.accent,
              borderWidth: item.type === 'coming_soon' ? 1 : 0,
              borderColor: C.inputBorder as string,
            }]}
          >
            <Text style={[s.addBtnText, { color: item.type === 'coming_soon' ? C.label : '#fff' }]}>
              {item.actionLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab,    setActiveTab]    = useState<StoreTab>('Products');
  const [mode]                          = useState<StoreMode>('business');
  const [demoRole, cycleRole] = useDemoRole('business:store');
  const role: StoreRole = demoRole === 'CEO' ? 'Admin' : 'Member';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const pills = useMemo(() => pillsForTab(activeTab, mode), [activeTab, mode]);

  function togglePills() {
    Haptics.selectionAsync();
    const next = !pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: StoreTab) {
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    setSelectedPill('All');
    const newPills = pillsForTab(tab, mode);
    if (!newPills.length) {
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;

  // ── Data ──────────────────────────────────────────────────────────────────

  const allProducts    = useMemo(() => getProducts(mode), [mode]);
  const modeCategories = useMemo(() => STORE_CATEGORIES[mode] ?? STORE_CATEGORIES.business, [mode]);
  const featured       = useMemo(() => getFeaturedBanner(mode), [mode]);

  const filteredProducts = useMemo(() => {
    if (selectedPill === 'All') return allProducts;
    const cat = modeCategories.find(c => c.label === selectedPill);
    if (!cat) return allProducts;
    return allProducts.filter(p => p.type === cat.key);
  }, [allProducts, selectedPill, modeCategories]);

  const orderFilterKey = useMemo(() => {
    const map: Record<string, string> = {
      'All': 'all', 'Active': 'active', 'Delivered': 'delivered', 'Cancelled': 'cancelled',
    };
    return map[selectedPill] ?? 'all';
  }, [selectedPill]);

  const filteredOrders = useMemo(() => getOrders(orderFilterKey), [orderFilterKey]);

  const dropFilterKey = useMemo(() => {
    const map: Record<string, string> = {
      'All': 'all', 'Coming Soon': 'coming_soon', 'Live Now': 'live_now',
      'Exclusive': 'exclusive', 'Sale': 'sale',
    };
    return map[selectedPill] ?? 'all';
  }, [selectedPill]);

  const filteredDrops = useMemo(() => getDrops(dropFilterKey), [dropFilterKey]);

  // ── CEO Store Dashboard ──────────────────────────────────────────────────

  function renderCEOView() {
    const INVENTORY = [
      { name: 'Branded Polo Shirt',     sku: 'APP-001', stock: 142, reorder: 50,  price: 59.99,  status: 'ok'    },
      { name: 'Executive Hoodie',       sku: 'APP-002', stock: 18,  reorder: 30,  price: 89.99,  status: 'low'   },
      { name: 'Wireless Headset Pro',   sku: 'TECH-01', stock: 7,   reorder: 20,  price: 249.00, status: 'critical' },
      { name: 'Business Card Pack',     sku: 'PRT-001', stock: 500, reorder: 100, price: 24.99,  status: 'ok'    },
      { name: 'Custom Tote Bag',        sku: 'ACC-001', stock: 0,   reorder: 40,  price: 34.99,  status: 'oos'   },
    ];
    const ORDER_COUNTS = [
      { label: 'Pending',    value: 12, color: '#B8943E' },
      { label: 'Processing', value:  8, color: '#1A1714' },
      { label: 'Shipped',    value: 24, color: '#1A1714' },
      { label: 'Delivered',  value: 89, color: '#5A8A6E' },
    ];
    const RECENT_ORDERS = [
      { id: '#ORD-4821', customer: 'Acme Corp',       items: 3, total: 284.97, status: 'processing' },
      { id: '#ORD-4820', customer: 'Davis & Partners', items: 1, total:  89.99, status: 'pending'    },
      { id: '#ORD-4819', customer: 'Marcus Okonkwo',  items: 2, total: 159.98, status: 'shipped'    },
    ];
    return (
      <View style={{ paddingHorizontal: 16, paddingBottom: 40, gap: 20 }}>
        {/* Revenue KPIs */}
        <View style={{ backgroundColor: '#1A1714', borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.6 }}>GMV This Month</Text>
          <Text style={{ fontSize: 34, fontWeight: '900', color: '#fff', marginTop: 4 }}>$48,291</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            {[
              { label: 'AOV',        value: '$124' },
              { label: 'Orders',     value: '389'  },
              { label: 'Conv Rate',  value: '3.8%' },
            ].map(k => (
              <View key={k.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{k.value}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{k.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order status counts */}
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Orders Dashboard</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {ORDER_COUNTS.map(oc => (
              <View key={oc.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: oc.color }}>{oc.value}</Text>
                <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>{oc.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent orders */}
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Recent Orders</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden' }}>
            {RECENT_ORDERS.map((order, idx) => {
              const statusColors: Record<string, string> = { pending: '#B8943E', processing: '#1A1714', shipped: '#1A1714' };
              const sColor = statusColors[order.status] ?? C.secondary;
              return (
                <View key={order.id} style={{
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
                  borderBottomWidth: idx < RECENT_ORDERS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{order.customer}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{order.id}  ·  {order.items} item{order.items !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>${order.total.toFixed(2)}</Text>
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: sColor + '22' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: sColor, textTransform: 'capitalize' }}>{order.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Inventory management */}
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Inventory</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden' }}>
            {INVENTORY.map((item, idx) => {
              const stockColor = item.status === 'ok' ? '#5A8A6E' : item.status === 'low' ? '#B8943E' : item.status === 'critical' ? '#B85C5C' : '#6B7280';
              return (
                <View key={item.sku} style={{
                  paddingHorizontal: 14, paddingVertical: 11,
                  borderBottomWidth: idx < INVENTORY.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.name}</Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>{item.sku}  ·  ${item.price.toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: stockColor }}>{item.stock}</Text>
                      <Text style={{ fontSize: 10, color: C.muted }}>in stock</Text>
                    </View>
                  </View>
                  {(item.status === 'low' || item.status === 'critical' || item.status === 'oos') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={11} color={stockColor} />
                      <Text style={{ fontSize: 11, color: stockColor, fontWeight: '600' }}>
                        {item.status === 'oos' ? 'Out of Stock' : `Reorder point: ${item.reorder}`}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Product management actions */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Add Product',    icon: 'plus.circle.fill'     },
            { label: 'Edit Pricing',   icon: 'tag.fill'             },
            { label: 'Bundles',        icon: 'shippingbox.fill'     },
          ].map(action => (
            <Pressable
              key={action.label}
              style={({ pressed }) => ({
                flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5,
                backgroundColor: pressed ? C.surfacePressed : C.surface,
                borderRadius: 12, paddingVertical: 13,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={action.icon as any} size={18} color={C.accent} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textAlign: 'center' }}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // ── Render Products ───────────────────────────────────────────────────────

  function renderProducts() {
    return (
      <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={s.featuredBanner}
        >
          <Image source={{ uri: featured.imageUri }} style={StyleSheet.absoluteFill} />
          <View style={s.featuredOverlay}>
            <Text style={s.featuredTitle}>{featured.title}</Text>
            <Text style={s.featuredSubtitle}>{featured.subtitle}</Text>
          </View>
        </Pressable>

        <View style={s.productGrid}>
          {filteredProducts.map(item => (
            <ProductCard key={item.id} item={item} C={C} />
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <IconSymbol name="bag" size={36} color={C.muted as string} />
            <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 8 }]}>No products found</Text>
          </View>
        )}
      </View>
    );
  }

  // ── Render Orders ─────────────────────────────────────────────────────────

  function renderOrders() {
    return (
      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 32 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
          {[
            { label: 'Total Spent', value: '$435.46', icon: 'dollarsign.circle.fill', color: C.accent },
            { label: 'Orders',      value: '7',       icon: 'bag.fill',               color: '#1A1714' },
            { label: 'Delivered',   value: '3',       icon: 'checkmark.seal.fill',    color: C.green },
            { label: 'Active',      value: '3',       icon: 'shippingbox.fill',       color: C.amber as string },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={s.summaryCard}>
              <IconSymbol name={m.icon as any} size={18} color={m.color} />
              <Text style={[s.summaryNum, { color: C.label }]}>{m.value}</Text>
              <Text style={[s.summaryLabel, { color: C.secondary as string }]}>{m.label}</Text>
            </GlassView>
          ))}
        </ScrollView>

        {filteredOrders.map(order => (
          <OrderCard key={order.id} item={order} C={C} />
        ))}

        {filteredOrders.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <IconSymbol name="shippingbox" size={36} color={C.muted as string} />
            <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 8 }]}>No orders found</Text>
          </View>
        )}
      </View>
    );
  }

  // ── Render Drops ──────────────────────────────────────────────────────────

  function renderDrops() {
    const liveNow = filteredDrops.filter(d => d.type === 'live_now');
    const rest    = filteredDrops.filter(d => d.type !== 'live_now');
    const showAll = dropFilterKey === 'all';

    return (
      <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
        {showAll && liveNow.length > 0 && (
          <View>
            <View style={[s.row, { marginBottom: 10, gap: 6 }]}>
              <View style={[s.liveDot, { backgroundColor: C.green }]} />
              <Text style={[s.sectionTitle, { color: C.green }]}>Live Now</Text>
            </View>
            <View style={s.productGrid}>
              {liveNow.map(item => <DropCard key={item.id} item={item} C={C} />)}
            </View>
          </View>
        )}

        {(showAll ? rest : filteredDrops).length > 0 && (
          <View>
            {showAll && <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>All Drops</Text>}
            <View style={s.productGrid}>
              {(showAll ? rest : filteredDrops).map(item => <DropCard key={item.id} item={item} C={C} />)}
            </View>
          </View>
        )}

        {filteredDrops.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <IconSymbol name="bolt.fill" size={36} color={C.muted as string} />
            <Text style={[s.bodySmall, { color: C.muted as string, marginTop: 8 }]}>No drops found</Text>
          </View>
        )}
      </View>
    );
  }

  // ── Shell ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator as string, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={s.iconBtn} hitSlop={8}
          >
            <IconSymbol name="line.3.horizontal" size={20} color={C.label} />
          </Pressable>

          <Pressable
            onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}
          >
            <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
            <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary as string} style={{ marginLeft: 4 }} />
          </Pressable>

          <View style={[s.row, { gap: 8 }]}>
            <RolePill
              role={demoRole}
              onPress={cycleRole}
              accentColor="#1A1714"
              isPrimary={role === 'Admin'}
            />
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={8} style={s.iconBtn}>
                <IconSymbol
                  name={pillsVisible ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={20}
                  color={pillsVisible ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {pills.length > 0 && (
          <Animated.View style={[s.pillsRow, {
            height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }),
            opacity: pillsAnim, overflow: 'hidden', borderBottomColor: C.separator as string,
          }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
              {pills.map(pill => {
                const active = selectedPill === pill;
                return (
                  <Pressable key={pill}
                    onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                    style={[s.pill, {
                      borderColor: active ? C.accent : C.inputBorder as string,
                      backgroundColor: active ? C.accent : 'transparent',
                    }]}
                  >
                    <Text style={[s.pillText, { color: active ? '#fff' : C.secondary as string }]}>{pill}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 150 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[s.dropdown, { top: topBarH, backgroundColor: C.surface, borderColor: C.separator as string }]}>
            {(['Products', 'Orders', 'Drops'] as StoreTab[]).map(tab => (
              <Pressable key={tab} onPress={() => changeTab(tab)}
                style={({ pressed }) => [
                  s.dropdownItem,
                  pressed && { backgroundColor: C.surfacePressed as string },
                  activeTab === tab && { backgroundColor: C.surfacePressed as string },
                ]}
              >
                <Text style={[s.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>{tab}</Text>
                {activeTab === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ScrollView
        contentContainerStyle={{ paddingTop: contentPaddingTop }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {role === 'Admin' ? renderCEOView() : (
          <>
            {activeTab === 'Products' && renderProducts()}
            {activeTab === 'Orders'   && renderOrders()}
            {activeTab === 'Drops'    && renderDrops()}
          </>
        )}
      </ScrollView>

      {activeTab === 'Products' && role === 'Admin' && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[s.fab, { backgroundColor: C.accent, bottom: insets.bottom + 88 }]}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:             { flex: 1 },
  topBarOuter:      { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:           { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  iconBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:     { flex: 1, marginHorizontal: 10, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  dropdownPillText: { fontSize: 14, fontWeight: '700' },
  rolePill:         { paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rolePillText:     { fontSize: 12, fontWeight: '700' },
  pillsRow:         { borderBottomWidth: StyleSheet.hairlineWidth },
  pill:             { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillText:         { fontSize: 13, fontWeight: '600' },
  dropdown:         { position: 'absolute', left: 16, right: 16, zIndex: 200, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  dropdownItem:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemText: { flex: 1, fontSize: 15, fontWeight: '600' },
  row:              { flexDirection: 'row', alignItems: 'center' },
  bodyMed:          { fontSize: 14, fontWeight: '600' },
  bodySmall:        { fontSize: 13 },
  sectionTitle:     { fontSize: 15, fontWeight: '700' },
  // Featured Banner
  featuredBanner:   { borderRadius: 16, overflow: 'hidden', height: 160 },
  featuredOverlay:  { flex: 1, justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(0,0,0,0.38)' },
  featuredTitle:    { fontSize: 18, fontWeight: '800', color: '#fff' },
  featuredSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  // Product Grid
  productGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard:      { width: '47%', borderRadius: 14, overflow: 'hidden', backgroundColor: C.surface },
  productImage:     { width: '100%', height: 130 },
  productInfo:      { padding: 10 },
  productName:      { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  productSub:       { fontSize: 11, marginTop: 2 },
  productPrice:     { fontSize: 15, fontWeight: '800' },
  addBtn:           { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  addBtnText:       { fontSize: 12, fontWeight: '700', color: '#fff' },
  strikePrice:      { fontSize: 12, textDecorationLine: 'line-through', marginLeft: 6, alignSelf: 'center' },
  // Orders
  summaryCard:      { width: 110, padding: 12, borderRadius: 14, alignItems: 'center', gap: 2 },
  summaryNum:       { fontSize: 18, fontWeight: '800', marginTop: 4 },
  summaryLabel:     { fontSize: 11, fontWeight: '500' },
  orderCard:        { padding: 14, borderRadius: 16 },
  orderThumb:       { width: 64, height: 64, borderRadius: 10 },
  statusBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  statusBadgeText:  { fontSize: 11, fontWeight: '600' },
  trackBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, marginTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  // Drops
  dropCard:         { width: '47%', borderRadius: 14, overflow: 'hidden', backgroundColor: C.surface },
  dropImage:        { width: '100%', height: 140 },
  dropInfo:         { padding: 10 },
  dropTypeBadge:    { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  dropTypeBadgeText:{ fontSize: 11, fontWeight: '700', color: '#fff' },
  stockBadge:       { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.65)' },
  stockBadgeText:   { fontSize: 10, fontWeight: '700', color: '#fff' },
  liveDot:          { width: 8, height: 8, borderRadius: 4, marginRight: 2 },
  // FAB
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});
