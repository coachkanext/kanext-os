/**
 * Store — Products / Orders / Drops
 * Consumer-facing product store. Mode-aware: Business products, Sports merch,
 * Education bookstore. RBAC: Admin manages catalog, Member browses and buys.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Image, Animated, TextInput, ActionSheetIOS, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import { useMode } from '@/context/app-context';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  getProducts, getFeaturedBanner, getOrders, getDrops,
  STORE_CATEGORIES, ORDER_FILTERS, DROP_FILTERS, formatPrice,
  type ProductItem, type OrderItem, type DropItem,
} from '@/data/mock-store';

// ── Personal Store Data ────────────────────────────────────────────────────────

const PERSONAL_PRODUCTS = [
  { id: '1', type: 'Digital',  title: 'The Blueprint (eBook)',         price: 19.99,  sales: 342, revenue: 6817.58,  rating: 4.9, emoji: '📖', accessLevel: 'Public',           status: 'Published' },
  { id: '2', type: 'Course',   title: 'Film Study Masterclass',        price: 89.00,  sales: 127, revenue: 11303.00, rating: 4.8, emoji: '🎬', accessLevel: 'Public',           status: 'Published' },
  { id: '3', type: 'Services', title: '1-on-1 Training Session',       price: 150.00, sales: 48,  revenue: 7200.00,  rating: 5.0, emoji: '🤝', accessLevel: 'Subscribers Only', status: 'Published' },
  { id: '4', type: 'Merch',    title: 'KLVN Training Hoodie',          price: 65.00,  sales: 83,  revenue: 5395.00,  rating: 4.7, emoji: '👕', accessLevel: 'Public',           status: 'Published' },
  { id: '5', type: 'Digital',  title: 'Speed & Agility Program (PDF)', price: 14.99,  sales: 219, revenue: 3282.81,  rating: 4.6, emoji: '⚡', accessLevel: 'Public',           status: 'Published' },
  { id: '6', type: 'Course',   title: 'Recruiting 101 Webinar',        price: 49.00,  sales: 94,  revenue: 4606.00,  rating: 4.7, emoji: '🎓', accessLevel: 'Subscribers Only', status: 'Draft'     },
];

const PERSONAL_TYPES = ['All', 'Digital', 'Course', 'Services', 'Merch'];

const MY_LIBRARY = [
  { id: '1', title: 'The Blueprint (eBook)',         type: 'Digital' },
  { id: '2', title: 'Speed & Agility Program (PDF)', type: 'Digital' },
];

const STORE_TIERS = [
  { id: 'free',    name: 'Free',         price: 0,  members: 1000, color: '#9C9790', benefits: ['Public posts', 'Community feed'] },
  { id: 'support', name: 'Supporters',   price: 10, members: 197,  color: '#5A8A6E', benefits: ['All Free', 'Exclusive content', 'Monthly Q&A', 'Early drops'] },
  { id: 'inner',   name: 'Inner Circle', price: 25, members: 50,   color: '#B8943E', benefits: ['All Supporters', '1-on-1 session', 'Private channel', '20% merch discount'] },
];

// ── Personal Store Screen ──────────────────────────────────────────────────────

function PersonalStoreScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [demoRole, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = demoRole === roleCycles[0];

  const [preview,   setPreview]   = useState(false);
  const [filter,    setFilter]    = useState('All');
  const [addSheet,  setAddSheet]  = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType,  setFormType]  = useState('Digital');
  const [formPrice, setFormPrice] = useState('');

  const [editProduct,   setEditProduct]   = useState<string | null>(null);
  const [formDesc,      setFormDesc]      = useState('');
  const [formAccess,    setFormAccess]    = useState('Public');
  const [formStatus,    setFormStatus]    = useState('Published');
  const [formPriceType, setFormPriceType] = useState<'one-time' | 'plan'>('one-time');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const showFollower = !isOwner || preview;

  const filtered = useMemo(() =>
    filter === 'All' ? PERSONAL_PRODUCTS : PERSONAL_PRODUCTS.filter(p => p.type === filter),
    [filter]
  );

  const productIcon = (type: string) =>
    type === 'Services' ? 'person.fill' : type === 'Merch' ? 'bag.fill' : 'doc.fill';

  function handleProductMore(product: typeof PERSONAL_PRODUCTS[0]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit', 'Duplicate', 'Hide', 'Delete', 'Cancel'], cancelButtonIndex: 4, destructiveButtonIndex: 3 },
        (idx) => {
          if (idx === 0) {
            setEditProduct(product.id);
            setFormTitle(product.title);
            setFormType(product.type);
            setFormPrice(String(product.price));
            setFormDesc('');
            setFormAccess(product.accessLevel);
            setFormStatus(product.status);
            setAddSheet(true);
          } else if (idx < 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      );
    }
  }

  function renderOwnerView() {
    return (
      <>
        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 16 }}>
          {([
            { label: 'Total Products', value: '6'   },
            { label: 'Total Sales',    value: '913' },
            { label: 'Active Subs',    value: '247' },
          ] as const).map(stat => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Preview Store button */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreview(true); }}
          style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
        >
          <IconSymbol name="eye.fill" size={14} color={C.secondary} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>Preview Store</Text>
        </Pressable>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
          {PERSONAL_TYPES.map(f => (
            <Pressable key={f} onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f ? C.label : C.surface }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.label }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Product list */}
        <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 110 }}>
          {filtered.map(product => (
            <Pressable
              key={product.id}
              onPress={() => {
                setEditProduct(product.id);
                setFormTitle(product.title);
                setFormType(product.type);
                setFormPrice(String(product.price));
                setFormDesc('');
                setFormAccess(product.accessLevel);
                setFormStatus(product.status);
                setAddSheet(true);
              }}
              style={({ pressed }) => ({ backgroundColor: C.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, opacity: pressed ? 0.85 : 1 })}
            >
              {/* Thumbnail */}
              <View style={{ width: 60, height: 60, backgroundColor: C.bg, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 26 }}>{product.emoji}</Text>
              </View>
              {/* Info */}
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: C.label }} numberOfLines={1}>{product.title}</Text>
                  <Pressable onPress={() => handleProductMore(product)} hitSlop={8} style={{ paddingLeft: 6 }}>
                    <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                  </Pressable>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary }}>{product.type}</Text>
                {/* Stats row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>${product.price}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{product.sales} sold</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>${(product.revenue / 1000).toFixed(1)}K rev</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Text style={{ fontSize: 12, color: '#5A8A6E', fontWeight: '600' }}>★ {product.rating}</Text>
                  </View>
                </View>
                {/* Status + access badges */}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                  <View style={{ backgroundColor: product.status === 'Draft' ? '#B8943E18' : '#5A8A6E18', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: product.status === 'Draft' ? '#B8943E' : '#5A8A6E' }}>{product.status}</Text>
                  </View>
                  {product.accessLevel !== 'Public' && (
                    <View style={{ backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                      <Text style={{ fontSize: 10, color: C.secondary }}>🔒 {product.accessLevel}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </>
    );
  }

  function renderFollowerView() {
    return (
      <View style={{ paddingBottom: 110 }}>
        {/* My Library */}
        {MY_LIBRARY.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10 }}>My Library</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {MY_LIBRARY.map(item => (
                <Pressable key={item.id} style={{ width: 140, backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 6 }}>
                  <View style={{ width: '100%', height: 80, backgroundColor: C.separator, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name="doc.fill" size={28} color={C.secondary} />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }} numberOfLines={2}>{item.title}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{item.type}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured */}
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Featured</Text>
          <View style={{ backgroundColor: '#1A1714', borderRadius: 16, padding: 20, gap: 8 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Course</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>Film Study Masterclass</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 }}>Learn how the pros break down game film. Improve your read speed and decision-making.</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>$89</Text>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1714' }}>Buy Now</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* All Products */}
        <View style={{ marginTop: 20, gap: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16 }}>All Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {PERSONAL_TYPES.map(f => (
              <Pressable key={f} onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
                style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: filter === f ? C.label : C.surface }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.label }}>{f}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {filtered.map(product => (
              <Pressable key={product.id}
                style={({ pressed }) => ({ backgroundColor: C.surface, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.8 : 1 })}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <View style={{ width: 52, height: 52, backgroundColor: C.separator, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={productIcon(product.type) as any} size={22} color={C.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{product.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{product.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>${product.price}</Text>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    style={{ backgroundColor: C.label, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>Buy</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Subscription Tiers */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Membership Tiers</Text>
          {STORE_TIERS.map(tier => (
            <View key={tier.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tier.color }} />
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: C.label }}>{tier.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{tier.price === 0 ? 'Free' : `$${tier.price}/mo`}</Text>
              </View>
              <View style={{ gap: 4 }}>
                {tier.benefits.map((b, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                    <IconSymbol name="checkmark" size={12} color={tier.color} style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>
              {tier.price > 0 && (
                <Pressable
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  style={{ backgroundColor: C.label, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Join {tier.name}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  const topBarH = insets.top + 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, paddingTop: insets.top }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          {isOwner && !preview ? (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
              <KMenuButton />
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>
              {preview ? 'Store Preview' : isOwner ? 'Store' : 'Shop'}
            </Text>
          </View>
          {!preview ? (
            <RolePill
              role={demoRole}
              onPress={() => { cycleRole(); setFilter('All'); setPreview(false); }}
              accentColor="#1A1714"
              isPrimary={isOwner}
            />
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingTop: topBarH }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {showFollower ? renderFollowerView() : renderOwnerView()}
      </ScrollView>

      {/* Owner FAB */}
      {isOwner && !preview && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setAddSheet(true); }}
          style={{ position: 'absolute', right: 20, bottom: insets.bottom + 88, width: 52, height: 52, borderRadius: 26, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

      {/* Preview Back button */}
      {preview && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreview(false); }}
          style={{ position: 'absolute', bottom: insets.bottom + 88, alignSelf: 'center', backgroundColor: C.label, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <IconSymbol name="arrow.left" size={13} color={C.bg} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Back to Manage</Text>
        </Pressable>
      )}

      {/* Add Product Sheet */}
      <BottomSheet visible={addSheet} onClose={() => { setAddSheet(false); setEditProduct(null); }} useModal>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>{editProduct ? 'Edit Product' : 'New Product'}</Text>

          {/* Title */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Title</Text>
            <TextInput
              value={formTitle} onChangeText={setFormTitle}
              placeholder="Product name" placeholderTextColor={C.secondary}
              style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, backgroundColor: C.surface }}
            />
          </View>

          {/* Description */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Description</Text>
            <TextInput
              value={formDesc} onChangeText={setFormDesc}
              placeholder="Describe what's included…" placeholderTextColor={C.secondary}
              multiline numberOfLines={3}
              style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.label, backgroundColor: C.surface, height: 90, textAlignVertical: 'top' }}
            />
          </View>

          {/* Type */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Product Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Digital', 'Course', 'Services', 'Merch'].map(t => (
                <Pressable key={t} onPress={() => { Haptics.selectionAsync(); setFormType(t); }}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: formType === t ? C.label : C.surface, borderWidth: 1, borderColor: C.separator }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: formType === t ? C.bg : C.label }}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Pricing</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {(['one-time', 'plan'] as const).map(pt => (
                <Pressable key={pt} onPress={() => setFormPriceType(pt)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: formPriceType === pt ? C.label : C.surface, borderWidth: 1, borderColor: C.separator }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: formPriceType === pt ? C.bg : C.label }}>{pt === 'one-time' ? 'One-Time' : 'Payment Plan'}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={formPrice} onChangeText={setFormPrice}
              keyboardType="decimal-pad" placeholder={formPriceType === 'plan' ? 'Price per installment ($)' : 'Price ($)'} placeholderTextColor={C.secondary}
              style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, backgroundColor: C.surface }}
            />
          </View>

          {/* Delivery note per type */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 12 }}>
            <Text style={{ fontSize: 12, color: C.secondary }}>
              {formType === 'Digital'   && '📁 File upload — buyers get instant download after purchase.'}
              {formType === 'Course'    && '▶️ Links to your KPlay content for lesson delivery.'}
              {formType === 'Services'  && '📅 Booking via Agenda + payment collected via KPay.'}
              {formType === 'Merch'     && '📦 Set variants, inventory, and shipping in Product Settings.'}
            </Text>
          </View>

          {/* Access Level */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Access Level</Text>
            <View style={{ gap: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.separator }}>
              {['Public', 'Subscribers Only', 'Inner Circle'].map((level, idx, arr) => (
                <Pressable key={level} onPress={() => setFormAccess(level)}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: formAccess === level ? C.bg : C.surface, borderBottomWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                  <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{level}</Text>
                  {formAccess === level && <IconSymbol name="checkmark" size={14} color={C.label} />}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Status */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Status</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Published', 'Draft', 'Hidden'] as const).map(st => (
                <Pressable key={st} onPress={() => setFormStatus(st)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: formStatus === st ? C.label : C.surface, borderWidth: 1, borderColor: C.separator }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: formStatus === st ? C.bg : C.label }}>{st}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setAddSheet(false); setEditProduct(null); }}
            style={{ backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>{editProduct ? 'Save Changes' : 'Save & Publish'}</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// ── Business / Multi-Mode Store ────────────────────────────────────────────────

const TOP_BAR_H = 52;
const PILLS_H   = 48;

type StoreTab      = 'Products' | 'Orders' | 'Analytics' | 'Subscriptions';
type StoreCEOTab    = 'Products' | 'Orders' | 'Analytics';
type StoreCustomTab = 'Products' | 'Orders' | 'Subscriptions';
type StoreRole = 'Admin' | 'Member';
type StoreMode = 'sports' | 'business' | 'education';

function pillsForTab(tab: StoreTab, mode: StoreMode): string[] {
  if (tab === 'Products') {
    return (STORE_CATEGORIES[mode] ?? STORE_CATEGORIES.business).map(c => c.label);
  }
  if (tab === 'Orders') return ORDER_FILTERS.map(f => f.label);
  return [];
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

// ── Live Mode Public Store ─────────────────────────────────────────────────────

const LIVE_BIZ_PRODUCTS = [
  { id: '1', emoji: '🚀', name: 'KaNeXT OS — Starter Plan', price: '$299/mo', desc: 'For small organizations. Up to 50 users, 3 modes, core tiles.' },
  { id: '2', emoji: '🏢', name: 'KaNeXT OS — Enterprise', price: 'Custom', desc: 'Full platform deployment for large institutions. Contact for pricing.' },
  { id: '3', emoji: '🏀', name: 'Athletic Intelligence Add-on', price: '$149/mo', desc: 'Player pool, KR evaluations, scouting reports. Requires base plan.' },
  { id: '4', emoji: '🎓', name: 'Education Intelligence Add-on', price: '$99/mo', desc: 'Admissions KR, student success tracking. Requires base plan.' },
  { id: '5', emoji: '💼', name: 'Implementation Package', price: '$4,500', desc: 'Onboarding, data migration, and 90-day success support.' },
  { id: '6', emoji: '📊', name: 'Custom Intelligence Build', price: 'From $10K', desc: 'Custom KR model and knowledge base for your specific domain.' },
];

function LiveBizStoreView({ C, insets }: { C: any; insets: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8 }}>Products & Services</Text>
        <Text style={{ fontSize: 14, color: C.secondary, paddingBottom: 4 }}>KaNeXT OS plans and add-ons.</Text>
        {LIVE_BIZ_PRODUCTS.map(item => (
          <View key={item.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 52, height: 52, backgroundColor: C.separator, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{item.name}</Text>
                <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 17 }}>{item.desc}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{item.price}</Text>
              <Pressable style={{ backgroundColor: C.label, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>
                  {item.price === 'Custom' ? 'Contact Us' : 'Get Started'}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

function BusinessStoreScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const dataMode = useDataMode();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab,    setActiveTab]    = useState<StoreTab>('Products');
  const [mode]                          = useState<StoreMode>('business');
  const [demoRole, cycleRole, roleCycles] = useDemoRole('business:store');
  const role: StoreRole = demoRole === roleCycles[0] ? 'Admin' : 'Member';
  const isAdmin = role === 'Admin';
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const pills = useMemo(() => pillsForTab(activeTab, mode), [activeTab, mode]);

  function handleCycleRole() {
    cycleRole();
    setActiveTab('Products');
    setSelectedPill('All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
  }

  function togglePills() {
    Haptics.selectionAsync();
    const next = !pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: StoreTab) {
    Haptics.selectionAsync();
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

  if (dataMode === 'live') return <LiveBizStoreView C={C} insets={insets} />;

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

  // ── Render Subscriptions (Customer) ───────────────────────────────────────

  function renderSubscriptions() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
        <Text style={{ fontSize: 16, color: C.secondary, fontWeight: '600' }}>Subscriptions</Text>
        <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6, opacity: 0.6 }}>Coming soon</Text>
      </View>
    );
  }

  // ── Shell ─────────────────────────────────────────────────────────────────

  const ceoTabs: StoreCEOTab[]    = ['Products', 'Orders', 'Analytics'];
  const customerTabs: StoreCustomTab[] = ['Products', 'Orders', 'Subscriptions'];

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator as string, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isAdmin) openSidePanel(); }}
            style={s.iconBtn} hitSlop={8}
          >
            <KMenuButton />
          </Pressable>

          {isAdmin ? (
            <View style={{ flex: 1, marginHorizontal: 10, flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
                {ceoTabs.map(tab => {
                  const active = activeTab === tab;
                  return (
                    <Pressable key={tab} onPress={() => changeTab(tab)}
                      style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{tab}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, marginHorizontal: 10, flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
                {customerTabs.map(tab => {
                  const active = activeTab === tab;
                  return (
                    <Pressable key={tab} onPress={() => changeTab(tab)}
                      style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{tab}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <View style={[s.row, { gap: 8 }]}>
            <RolePill
              role={demoRole}
              onPress={handleCycleRole}
              accentColor="#1A1714"
              isPrimary={isAdmin}
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

      <ScrollView
        contentContainerStyle={{ paddingTop: contentPaddingTop, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isAdmin ? (
          <>
            {activeTab === 'Products'  && renderProducts()}
            {activeTab === 'Orders'    && renderOrders()}
            {activeTab === 'Analytics' && renderCEOView()}
          </>
        ) : (
          <>
            {activeTab === 'Products'      && renderProducts()}
            {activeTab === 'Orders'        && renderOrders()}
            {activeTab === 'Subscriptions' && renderSubscriptions()}
          </>
        )}
      </ScrollView>

      {activeTab === 'Products' && isAdmin && (
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

// ── Routing Wrapper ────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const appMode = useMode();
  if (appMode === 'personal') return <PersonalStoreScreen />;
  return <BusinessStoreScreen />;
}
