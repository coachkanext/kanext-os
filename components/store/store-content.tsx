/**
 * Store Content — 3-page swipeable layout for sports/business/education.
 * Page 0: Shop — featured banner, category pills, product grid.
 * Page 1: Orders — filter pills, active + past orders.
 * Page 2: Drops — coming soon, live now, exclusive, sale.
 * 3 dots at top. Swipe right on page 0 = side panel.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getProducts,
  getFeaturedBanner,
  getOrders,
  getDrops,
  formatPrice,
  STORE_CATEGORIES,
  ORDER_FILTERS,
  DROP_FILTERS,
  type ProductItem,
  type OrderItem,
  type DropItem,
} from '@/data/mock-store';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

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

// ─── Product Card ─────────────────────────────────────────────────────────

function ProductCard({
  product,
  onLongPress,
}: {
  product: ProductItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.productCard, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <Image source={{ uri: product.imageUri }} style={s.productImage} />
      <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
      {product.subtitle && (
        <Text style={s.productSubtitle} numberOfLines={1}>{product.subtitle}</Text>
      )}
      <Text style={s.productPrice}>{formatPrice(product.price)}</Text>
      <Pressable
        style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.8 }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Text style={s.actionBtnText}>{product.actionLabel}</Text>
      </Pressable>
    </Pressable>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function OrderRow({ order }: { order: OrderItem }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const STATUS_COLORS: Record<string, string> = {
    processing: C.amber,
    shipped: C.blue,
    out_for_delivery: C.blue,
    delivered: C.green,
    cancelled: C.red,
  };
  const color = STATUS_COLORS[order.status] ?? C.muted;
  return (
    <Pressable style={({ pressed }) => [s.orderRow, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: order.productImage }} style={s.orderThumb} />
      <View style={s.orderInfo}>
        <Text style={s.orderName} numberOfLines={1}>{order.productName}</Text>
        <View style={s.orderStatusRow}>
          <View style={[s.statusDot, { backgroundColor: color }]} />
          <Text style={[s.orderStatus, { color }]}>{STATUS_LABELS[order.status]}</Text>
        </View>
        <Text style={s.orderMeta}>{order.dateOrdered} · {formatPrice(order.amount)}</Text>
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ─── Drop Card ────────────────────────────────────────────────────────────

function DropCard({ drop }: { drop: DropItem }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={({ pressed }) => [s.dropCard, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: drop.imageUri }} style={s.dropImage} />
      <View style={s.dropInfo}>
        <Text style={s.dropName} numberOfLines={1}>{drop.name}</Text>
        {drop.countdown && (
          <Text style={s.dropCountdown}>{drop.countdown}</Text>
        )}
        {drop.price != null && (
          <View style={s.dropPriceRow}>
            {drop.originalPrice != null && (
              <Text style={s.dropOriginalPrice}>{formatPrice(drop.originalPrice)}</Text>
            )}
            <Text style={s.dropPrice}>{formatPrice(drop.price)}</Text>
            {drop.originalPrice != null && (
              <Text style={s.dropSavings}>
                {Math.round((1 - drop.price / drop.originalPrice) * 100)}% off
              </Text>
            )}
          </View>
        )}
        {drop.stockLeft != null && (
          <Text style={s.dropStock}>{drop.stockLeft} left · Selling fast</Text>
        )}
        {drop.releaseDate && !drop.price && (
          <Text style={s.dropRelease}>{drop.releaseDate}</Text>
        )}
      </View>
      <Pressable
        style={({ pressed }) => [
          s.dropAction,
          drop.type === 'coming_soon' && s.dropActionOutline,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Text style={[
          s.dropActionText,
          drop.type === 'coming_soon' && s.dropActionTextOutline,
        ]}>{drop.actionLabel}</Text>
      </Pressable>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function StoreContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const mode = useMode();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [shopCategory, setShopCategory] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [dropFilter, setDropFilter] = useState('all');

  const categories = useMemo(() => STORE_CATEGORIES[mode ?? 'sports'] ?? STORE_CATEGORIES.sports, [mode]);
  const featured = useMemo(() => getFeaturedBanner(mode), [mode]);
  const allProducts = useMemo(() => getProducts(mode), [mode]);
  const products = useMemo(
    () => shopCategory === 'all' ? allProducts : allProducts.filter((p) => p.type === shopCategory),
    [allProducts, shopCategory],
  );
  const orders = useMemo(() => getOrders(orderFilter), [orderFilter]);
  const drops = useMemo(() => getDrops(dropFilter), [dropFilter]);

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

  const longPressProduct = useCallback((product: ProductItem, pageY: number) => {
    setMenuData({
      title: product.name,
      subtitle: formatPrice(product.price),
      initials: product.name.slice(0, 2).toUpperCase(),
      isSquircle: true,
      pageY,
      actions: [
        { key: 'save', label: 'Save', icon: 'bookmark.fill' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'details', label: 'View Details', icon: 'eye.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={handlePageChange}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: SHOP ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Featured banner */}
            <Pressable style={s.featuredBanner}>
              <Image source={{ uri: featured.imageUri }} style={s.featuredImage} />
              <View style={s.featuredOverlay}>
                <Text style={s.featuredTitle}>{featured.title}</Text>
                <Text style={s.featuredSubtitle}>{featured.subtitle}</Text>
              </View>
            </Pressable>

            {/* Category pills */}
            <FilterPills items={categories} active={shopCategory} onSelect={setShopCategory} />

            {/* Product grid */}
            <View style={s.productGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onLongPress={(pageY) => longPressProduct(product, pageY)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── PAGE 1: ORDERS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Orders" />
            <FilterPills items={ORDER_FILTERS} active={orderFilter} onSelect={setOrderFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {orders.map((order, idx) => (
              <View key={order.id}>
                {idx > 0 && <View style={s.separator} />}
                <OrderRow order={order} />
              </View>
            ))}
            {orders.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>No orders found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── PAGE 2: DROPS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Drops" />
            <FilterPills items={DROP_FILTERS} active={dropFilter} onSelect={setDropFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {drops.map((drop, idx) => (
              <View key={drop.id}>
                {idx > 0 && <View style={s.separator} />}
                <DropCard drop={drop} />
              </View>
            ))}
            {drops.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>No drops right now</Text>
              </View>
            )}
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

  // Featured banner
  featuredBanner: { marginHorizontal: 16, marginTop: 8, borderRadius: 16, overflow: 'hidden', height: 180 },
  featuredImage: { width: '100%', height: '100%', backgroundColor: C.surface },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: C.label },
  featuredSubtitle: { fontSize: 13, color: C.secondary, marginTop: 2 },

  // Product grid
  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 16, paddingTop: 8,
  },
  productCard: {
    width: CARD_WIDTH, backgroundColor: C.surface,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  productImage: { width: '100%', height: CARD_WIDTH, backgroundColor: C.surface },
  productName: { fontSize: 14, fontWeight: '700', color: C.label, paddingHorizontal: 10, paddingTop: 8 },
  productSubtitle: { fontSize: 11, color: C.muted, paddingHorizontal: 10, marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: '700', color: C.label, paddingHorizontal: 10, marginTop: 4 },
  actionBtn: {
    margin: 10, marginTop: 6, paddingVertical: 8,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: C.label },

  // Orders
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  orderThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: C.surface },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: '600', color: C.label },
  orderStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  orderStatus: { fontSize: 12, fontWeight: '600' },
  orderMeta: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Drops
  dropCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  dropImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: C.surface },
  dropInfo: { flex: 1 },
  dropName: { fontSize: 14, fontWeight: '700', color: C.label },
  dropCountdown: { fontSize: 12, fontWeight: '600', color: C.amber, marginTop: 2 },
  dropPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dropOriginalPrice: { fontSize: 12, color: C.muted, textDecorationLine: 'line-through' },
  dropPrice: { fontSize: 14, fontWeight: '700', color: C.label },
  dropSavings: { fontSize: 11, fontWeight: '600', color: C.green },
  dropStock: { fontSize: 11, fontWeight: '600', color: C.red, marginTop: 2 },
  dropRelease: { fontSize: 11, color: C.muted, marginTop: 2 },
  dropAction: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, backgroundColor: C.blue,
  },
  dropActionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: C.separator,
  },
  dropActionText: { fontSize: 12, fontWeight: '700', color: C.label },
  dropActionTextOutline: { color: C.secondary },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.muted },
});
