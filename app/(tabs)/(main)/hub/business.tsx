/**
 * Business Hub — Overview.
 * Top bar sits ABOVE cover photo (not overlaid).
 * CEO: full profile management — bio, featured, products, testimonials, contact.
 * Customer: read-only company profile + Follow.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
  TextInput, ActionSheetIOS, Platform, Alert, Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GlassView } from '@/components/ui/glass-view';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H    = 52;
const AVATAR_SIZE  = 80;
const AVATAR_OVR   = AVATAR_SIZE / 2;

// ─── Static data ──────────────────────────────────────────────────────────────

const COMPANY = {
  name:      'KaNeXT',
  handle:    '@kanext',
  industry:  'Technology',
  location:  'Miami, FL',
  followers: 2847,
};

const INITIAL_BIO = 'Building the operating system for institutions. Sports. Education. Business. Community.';

type FeaturedType = 'VIDEO' | 'POST' | 'EVENT';
type FeaturedItem = { id: string; type: FeaturedType; title: string; sub: string };
type Product      = { id: string; name: string; sub: string };
type Testimonial  = { id: string; quote: string; name: string; title: string };
type ContactItem  = { id: string; icon: string; title: string; sub: string };


const SOCIAL_PLATFORMS = [
  { name: 'Instagram', fa: 'instagram'  },
  { name: 'X',         fa: 'x-twitter' },
  { name: 'TikTok',    fa: 'tiktok'    },
  { name: 'YouTube',   fa: 'youtube'   },
  { name: 'LinkedIn',  fa: 'linkedin'  },
] satisfies { name: string; fa: string }[];

const INIT_FEATURED: FeaturedItem[] = [
  { id: 'f1', type: 'VIDEO', title: 'KaNeXT OS v2.0 - Full Walkthrough',  sub: '12.4K views' },
  { id: 'f2', type: 'POST',  title: 'Why Every Institution Needs an OS',   sub: '2.1K likes'  },
  { id: 'f3', type: 'EVENT', title: 'Product Launch Event',                sub: 'May 15'      },
];

const INIT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'KaNeXT OS',        sub: 'Sports Intelligence Platform'         },
  { id: 'p2', name: 'KaNeXT Dipson',    sub: 'AI-Powered Institutional Assistant'   },
  { id: 'p3', name: 'KaNeXT Analytics', sub: 'Real-Time Data Dashboard'             },
];

const INIT_TESTIMONIALS: Testimonial[] = [
  { id: 't1', quote: 'KaNeXT transformed how we manage our program.',     name: 'Coach Davis', title: 'LU Basketball'     },
  { id: 't2', quote: "The analytics suite is unlike anything we've seen.", name: 'Dr. Marcus',  title: 'Lincoln University' },
];

const INIT_CONTACT: ContactItem[] = [
  { id: 'c1', icon: 'envelope.fill', title: 'hello@kanext.io', sub: 'Email us'          },
  { id: 'c2', icon: 'phone.fill',    title: 'Book a Demo',     sub: 'kanext.io/demo'    },
  { id: 'c3', icon: 'globe',         title: 'kanext.io',       sub: 'Visit our website' },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: any }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
      color: C.secondary, marginBottom: 12, marginTop: 4,
    }}>
      {title}
    </Text>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BusinessOverview() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const COVER_H = 220 + topBarH;

  const [role, toggleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Editable state ──────────────────────────────────────────────────────────
  const [bio,          setBio]          = useState(INITIAL_BIO);
  const [featured,     setFeatured]     = useState<FeaturedItem[]>(INIT_FEATURED);
  const [products,     setProducts]     = useState<Product[]>(INIT_PRODUCTS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INIT_TESTIMONIALS);
  const [contact,      setContact]      = useState<ContactItem[]>(INIT_CONTACT);
  const [followed,     setFollowed]     = useState(false);

  // Add-sheets
  const [addFeatOpen,  setAddFeatOpen]  = useState(false);
  const [addProdOpen,  setAddProdOpen]  = useState(false);
  const [addTestOpen,  setAddTestOpen]  = useState(false);
  const [addContOpen,  setAddContOpen]  = useState(false);

  const [newFeatType,  setNewFeatType]  = useState<FeaturedType>('VIDEO');
  const [newFeatTitle, setNewFeatTitle] = useState('');
  const [newFeatSub,   setNewFeatSub]   = useState('');
  const [newProdName,  setNewProdName]  = useState('');
  const [newProdSub,   setNewProdSub]   = useState('');
  const [newTestQuote, setNewTestQuote] = useState('');
  const [newTestName,  setNewTestName]  = useState('');
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newContIcon,  setNewContIcon]  = useState('globe');
  const [newContTitle, setNewContTitle] = useState('');
  const [newContSub,   setNewContSub]   = useState('');

  // ── CEO action helpers ──────────────────────────────────────────────────────

  function featuredMenu(item: FeaturedItem) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const opts = Platform.OS === 'ios'
      ? ['Edit Title', 'Remove', 'Cancel']
      : ['Edit Title', 'Remove'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: opts, cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Title', '', (t) => {
              if (t?.trim()) setFeatured(p => p.map(f => f.id === item.id ? { ...f, title: t.trim() } : f));
            }, 'plain-text', item.title);
          } else if (idx === 1) {
            setFeatured(p => p.filter(f => f.id !== item.id));
          }
        },
      );
    } else {
      Alert.alert(item.title, '', [
        { text: 'Remove', style: 'destructive', onPress: () => setFeatured(p => p.filter(f => f.id !== item.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  function productMenu(item: Product) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit Name', 'Edit Description', 'Remove', 'Cancel'], cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Name', '', (t) => {
              if (t?.trim()) setProducts(p => p.map(x => x.id === item.id ? { ...x, name: t.trim() } : x));
            }, 'plain-text', item.name);
          } else if (idx === 1) {
            Alert.prompt('Edit Description', '', (t) => {
              if (t?.trim()) setProducts(p => p.map(x => x.id === item.id ? { ...x, sub: t.trim() } : x));
            }, 'plain-text', item.sub);
          } else if (idx === 2) {
            setProducts(p => p.filter(x => x.id !== item.id));
          }
        },
      );
    } else {
      Alert.alert(item.name, '', [
        { text: 'Remove', style: 'destructive', onPress: () => setProducts(p => p.filter(x => x.id !== item.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  function contactMenu(item: ContactItem) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit Title', 'Edit Subtitle', 'Remove', 'Cancel'], cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Title', '', (t) => {
              if (t?.trim()) setContact(p => p.map(x => x.id === item.id ? { ...x, title: t.trim() } : x));
            }, 'plain-text', item.title);
          } else if (idx === 1) {
            Alert.prompt('Edit Subtitle', '', (t) => {
              if (t?.trim()) setContact(p => p.map(x => x.id === item.id ? { ...x, sub: t.trim() } : x));
            }, 'plain-text', item.sub);
          } else if (idx === 2) {
            setContact(p => p.filter(x => x.id !== item.id));
          }
        },
      );
    } else {
      Alert.alert(item.title, '', [
        { text: 'Remove', style: 'destructive', onPress: () => setContact(p => p.filter(x => x.id !== item.id)) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  function pickFeatType() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const types: FeaturedType[] = ['VIDEO', 'POST', 'EVENT'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...types, 'Cancel'], cancelButtonIndex: 3 },
        (idx) => { if (idx < 3) setNewFeatType(types[idx]); },
      );
    }
  }

  function handleAddFeatured() {
    if (!newFeatTitle.trim()) return;
    setFeatured(p => [...p, { id: `f-${Date.now()}`, type: newFeatType, title: newFeatTitle.trim(), sub: newFeatSub.trim() }]);
    setNewFeatTitle(''); setNewFeatSub(''); setNewFeatType('VIDEO');
    setAddFeatOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleAddProduct() {
    if (!newProdName.trim()) return;
    setProducts(p => [...p, { id: `p-${Date.now()}`, name: newProdName.trim(), sub: newProdSub.trim() }]);
    setNewProdName(''); setNewProdSub('');
    setAddProdOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleAddTestimonial() {
    if (!newTestQuote.trim() || !newTestName.trim()) return;
    setTestimonials(p => [...p, { id: `t-${Date.now()}`, quote: newTestQuote.trim(), name: newTestName.trim(), title: newTestTitle.trim() }]);
    setNewTestQuote(''); setNewTestName(''); setNewTestTitle('');
    setAddTestOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleAddContact() {
    if (!newContTitle.trim()) return;
    setContact(p => [...p, { id: `c-${Date.now()}`, icon: newContIcon || 'globe', title: newContTitle.trim(), sub: newContSub.trim() }]);
    setNewContTitle(''); setNewContSub(''); setNewContIcon('globe');
    setAddContOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar — transparent overlay, floats over cover ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, opacity,
      }} pointerEvents="box-none">
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }} pointerEvents="box-none">
          <View style={{ width: 80, justifyContent: 'center' }} pointerEvents="auto">
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1 }} pointerEvents="none" />
          <View style={{ width: 80, alignItems: 'flex-end' }} pointerEvents="auto">
            <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cover + avatar ── */}
        <View style={{ position: 'relative', marginBottom: AVATAR_OVR + 12 }}>
          {/* Cover image fills from y=0, bleeds behind top bar */}
          <View style={{ height: COVER_H, overflow: 'hidden' }}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/kanext-office/900/500' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {isCEO && (
              <Pressable
                onPress={() => Alert.alert('Edit Cover Photo', 'Tap to change cover (demo)')}
                style={{
                  position: 'absolute', bottom: 10, right: 12,
                  backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 5,
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                }}
              >
                <IconSymbol name="camera.fill" size={12} color="#fff" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Edit Cover</Text>
              </Pressable>
            )}
          </View>

          {/* Company logo — bottom-left, overlapping */}
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <Pressable
              onPress={() => isCEO && Alert.alert('Edit Logo', 'Tap to change logo (demo)')}
              disabled={!isCEO}
            >
              <View style={{
                width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
                backgroundColor: C.label, borderWidth: 3, borderColor: C.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: C.bg }}>K</Text>
              </View>
              {isCEO && (
                <View style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: C.label, borderWidth: 2, borderColor: C.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconSymbol name="camera.fill" size={11} color={C.bg} />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Identity block — left-aligned ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginBottom: 2 }}>{COMPANY.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 2 }}>{COMPANY.handle}</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 8 }}>{COMPANY.industry} · {COMPANY.location}</Text>
          {isCEO ? (
            <TextInput
              value={bio}
              onChangeText={(t) => t.length <= 160 && setBio(t)}
              multiline
              style={{ fontSize: 14, color: C.label, lineHeight: 20 }}
              placeholder="Add a bio..."
              placeholderTextColor={C.secondary}
            />
          ) : (
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, opacity: 0.85 }}>{bio}</Text>
          )}
          {isCEO && (
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>{bio.length}/160</Text>
          )}
        </View>

        {/* ── Followers row ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{COMPANY.followers.toLocaleString()}</Text>{' followers'}
          </Text>
          {isCEO ? (
            <Pressable
              style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator, opacity: pressed ? 0.7 : 1 })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Manage</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: followed ? C.surface : C.label, borderWidth: 1.5, borderColor: followed ? C.separator : C.label, opacity: pressed ? 0.7 : 1 })}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFollowed(f => !f); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: followed ? C.label : C.bg }}>{followed ? 'Following' : 'Follow'}</Text>
            </Pressable>
          )}
        </View>

        {/* ── Socials row ── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'flex-start', gap: 12,
          paddingHorizontal: 20, paddingVertical: 14,
          borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: C.separator, marginBottom: 28,
        }}>
          {SOCIAL_PLATFORMS.map(platform => (
            <Pressable key={platform.name} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome6 name={platform.fa as any} size={18} color={C.label} iconStyle="brands" />
              </View>
            </Pressable>
          ))}
          {isCEO && (
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{ paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit Socials</Text>
            </Pressable>
          )}
        </View>

        {/* ── FEATURED ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Featured" C={C} />
          {featured.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: C.surface, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8,
                opacity: pressed ? 0.75 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={{ backgroundColor: C.separator, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: C.secondary, letterSpacing: 0.5 }}>{item.type}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.title}</Text>
                {!!item.sub && <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{item.sub}</Text>}
              </View>
              {isCEO ? (
                <Pressable onPress={() => featuredMenu(item)} hitSlop={8}>
                  <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                </Pressable>
              ) : (
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              )}
            </Pressable>
          ))}
          {isCEO && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddFeatOpen(true); }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="plus.circle" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.secondary }}>Add Featured</Text>
            </Pressable>
          )}
        </View>

        {/* ── PRODUCTS ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Products" C={C} />
          {products.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: C.surface, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8,
                opacity: pressed ? 0.75 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.sub}</Text>
              </View>
              {isCEO ? (
                <Pressable onPress={() => productMenu(item)} hitSlop={8}>
                  <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                </Pressable>
              ) : (
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              )}
            </Pressable>
          ))}
          {isCEO && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddProdOpen(true); }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="plus.circle" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.secondary }}>Add Product</Text>
            </Pressable>
          )}
        </View>

        {/* ── TESTIMONIALS ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Testimonials" C={C} />
          <View style={{ gap: 8 }}>
            {testimonials.map(item => (
              <View key={item.id} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ flex: 1, fontSize: 14, color: C.label, lineHeight: 21, fontStyle: 'italic' }}>
                    "{item.quote}"
                  </Text>
                  {isCEO && (
                    <Pressable
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTestimonials(p => p.filter(t => t.id !== item.id)); }}
                      hitSlop={8}
                      style={{ paddingLeft: 8 }}
                    >
                      <IconSymbol name="xmark" size={12} color={C.secondary} />
                    </Pressable>
                  )}
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{item.title}</Text>
                </View>
              </View>
            ))}
            {isCEO && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddTestOpen(true); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  paddingVertical: 10, opacity: pressed ? 0.6 : 1,
                })}
              >
                <IconSymbol name="plus.circle" size={18} color={C.secondary} />
                <Text style={{ fontSize: 14, color: C.secondary }}>Add Testimonial</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── CONTACT ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <SH title="Contact" C={C} />
          {contact.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: C.surface, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8,
                opacity: pressed ? 0.75 : 1,
              })}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center',
              }}>
                <IconSymbol name={item.icon as any} size={16} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{item.sub}</Text>
              </View>
              {isCEO ? (
                <Pressable onPress={() => contactMenu(item)} hitSlop={8}>
                  <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                </Pressable>
              ) : (
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              )}
            </Pressable>
          ))}
          {isCEO && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddContOpen(true); }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="plus.circle" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.secondary }}>Add Contact</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>

      {/* ── Add Featured Sheet ── */}
      <BottomSheet visible={addFeatOpen} onClose={() => setAddFeatOpen(false)} useModal title="Add Featured">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 6 }}>
            <Text style={sheetLabel}>Type</Text>
            <Pressable
              onPress={pickFeatType}
              style={({ pressed }) => sheetPickerStyle(C, pressed)}
            >
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>{newFeatType}</Text>
              <IconSymbol name="chevron.down" size={14} color={C.secondary} />
            </Pressable>
          </View>
          <SheetField label="Title" value={newFeatTitle} onChange={setNewFeatTitle} placeholder="e.g. Product Demo Video" C={C} />
          <SheetField label="Subtitle" value={newFeatSub} onChange={setNewFeatSub} placeholder="e.g. 12.4K views" C={C} />
          <SheetSubmit label="Add" onPress={handleAddFeatured} C={C} />
        </ScrollView>
      </BottomSheet>

      {/* ── Add Product Sheet ── */}
      <BottomSheet visible={addProdOpen} onClose={() => setAddProdOpen(false)} useModal title="Add Product">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }} keyboardShouldPersistTaps="handled">
          <SheetField label="Product Name" value={newProdName} onChange={setNewProdName} placeholder="e.g. KaNeXT OS" C={C} />
          <SheetField label="Description" value={newProdSub} onChange={setNewProdSub} placeholder="e.g. Sports Intelligence Platform" C={C} />
          <SheetSubmit label="Add Product" onPress={handleAddProduct} C={C} />
        </ScrollView>
      </BottomSheet>

      {/* ── Add Testimonial Sheet ── */}
      <BottomSheet visible={addTestOpen} onClose={() => setAddTestOpen(false)} useModal title="Add Testimonial">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }} keyboardShouldPersistTaps="handled">
          <SheetField label="Quote" value={newTestQuote} onChange={setNewTestQuote} placeholder="What did they say?" C={C} multiline />
          <SheetField label="Name" value={newTestName} onChange={setNewTestName} placeholder="e.g. Coach Davis" C={C} />
          <SheetField label="Title / Company" value={newTestTitle} onChange={setNewTestTitle} placeholder="e.g. LU Basketball" C={C} />
          <SheetSubmit label="Add Testimonial" onPress={handleAddTestimonial} C={C} />
        </ScrollView>
      </BottomSheet>

      {/* ── Add Contact Sheet ── */}
      <BottomSheet visible={addContOpen} onClose={() => setAddContOpen(false)} useModal title="Add Contact">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }} keyboardShouldPersistTaps="handled">
          <SheetField label="Title" value={newContTitle} onChange={setNewContTitle} placeholder="e.g. hello@kanext.io" C={C} />
          <SheetField label="Subtitle" value={newContSub} onChange={setNewContSub} placeholder="e.g. Email us" C={C} />
          <SheetSubmit label="Add Contact" onPress={handleAddContact} C={C} />
        </ScrollView>
      </BottomSheet>

    </View>
  );
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────

const sheetLabel: any = {
  fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
  letterSpacing: 0.5, color: '#9C9790',
};

function sheetPickerStyle(C: any, pressed: boolean) {
  return {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.separator,
    padding: 14, flexDirection: 'row' as const, alignItems: 'center' as const,
    opacity: pressed ? 0.8 : 1,
  };
}

function SheetField({ label, value, onChange, placeholder, C, multiline }: {
  label: string; value: string; onChange: (t: string) => void;
  placeholder: string; C: any; multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={sheetLabel}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: C.surface, borderRadius: 12,
          borderWidth: 1, borderColor: C.separator,
          padding: 14, fontSize: 15, color: C.label,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.secondary}
        multiline={multiline}
      />
    </View>
  );
}

function SheetSubmit({ label, onPress, C }: { label: string; onPress: () => void; C: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: C.label, borderRadius: 14,
        paddingVertical: 15, alignItems: 'center' as const, marginTop: 4, opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>{label}</Text>
    </Pressable>
  );
}
