/**
 * Collaborate — Collaboration page.
 * Owner:    Editable — description, services, trusted brands.
 * Follower: Read-only + "Submit a Proposal" CTA.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
  TextInput, ActionSheetIOS, Platform, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { RATE_SERVICES, TRUSTED_BY, type RateService } from '@/data/mock-personal-inquiries';

const TOP_BAR_H   = 52;
const GAIN        = '#5A8A6E';
const BUDGET_OPTS = ['$500–$2K', '$2K–$5K', '$5K–$10K', '$10K–$25K', '$25K–$50K', '$50K+'] as const;

const DEFAULT_ICONS = [
  'star.fill', 'play.circle.fill', 'photo.fill', 'mic.fill',
  'video.fill', 'person.fill', 'briefcase.fill', 'pencil',
];

export default function CollaborateScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const router  = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:inquiries');
  const isOwner = role === roleCycles[0];

  useEffect(() => {
    if (isOwner) router.replace('/(tabs)/(main)/personal-inquiries' as any);
  }, [isOwner]);

  // ── Owner editable state ─────────────────────────────────────────────────────
  const [description, setDescription] = useState(
    'I partner with brands, creators, and organizations on content, coaching, and speaking engagements. Tell me what you have in mind.'
  );
  const [services, setServices] = useState<RateService[]>([...RATE_SERVICES]);
  const [brands, setBrands] = useState([...TRUSTED_BY]);

  // Add-service sheet
  const [addSvcOpen,     setAddSvcOpen]     = useState(false);
  const [newSvcTitle,    setNewSvcTitle]    = useState('');
  const [newSvcPrice,    setNewSvcPrice]    = useState('');

  // ── Follower proposal state ──────────────────────────────────────────────────
  const [submitOpen,   setSubmitOpen]   = useState(false);
  const [confirmed,    setConfirmed]    = useState(false);
  const [formName,     setFormName]     = useState('');
  const [formCompany,  setFormCompany]  = useState('');
  const [formEmail,    setFormEmail]    = useState('');
  const [formService,  setFormService]  = useState('');
  const [formBudget,   setFormBudget]   = useState('');
  const [formTimeline, setFormTimeline] = useState('');
  const [formDesc,     setFormDesc]     = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Owner: service menu ──────────────────────────────────────────────────────

  function showServiceMenu(svc: RateService) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit Name', 'Edit Price', 'Delete Service', 'Cancel'], cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 0) {
            Alert.prompt('Edit Service Name', '', (text) => {
              if (text?.trim()) setServices(prev => prev.map(s => s.id === svc.id ? { ...s, title: text.trim() } : s));
            }, 'plain-text', svc.title);
          } else if (idx === 1) {
            Alert.prompt('Edit Starting Price', 'e.g. $5,000', (text) => {
              if (text?.trim()) setServices(prev => prev.map(s => s.id === svc.id ? { ...s, starting: text.trim() } : s));
            }, 'plain-text', svc.starting);
          } else if (idx === 2) {
            setServices(prev => prev.filter(s => s.id !== svc.id));
          }
        },
      );
    } else {
      Alert.alert(svc.title, '', [
        { text: 'Edit Name',    onPress: () => Alert.prompt?.('Edit Name', '', (t) => { if (t?.trim()) setServices(p => p.map(s => s.id === svc.id ? { ...s, title: t.trim() } : s)); }) },
        { text: 'Edit Price',   onPress: () => Alert.prompt?.('Edit Price', '', (t) => { if (t?.trim()) setServices(p => p.map(s => s.id === svc.id ? { ...s, starting: t.trim() } : s)); }) },
        { text: 'Delete',       style: 'destructive', onPress: () => setServices(p => p.filter(s => s.id !== svc.id)) },
        { text: 'Cancel',       style: 'cancel' },
      ]);
    }
  }

  function handleAddService() {
    if (!newSvcTitle.trim()) return;
    const icon = DEFAULT_ICONS[services.length % DEFAULT_ICONS.length];
    setServices(prev => [...prev, {
      id: `custom-${Date.now()}`,
      title: newSvcTitle.trim(),
      starting: newSvcPrice.trim() || 'Custom',
      icon,
    }]);
    setNewSvcTitle('');
    setNewSvcPrice('');
    setAddSvcOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // ── Owner: brand management ─────────────────────────────────────────────────

  function removeBrand(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBrands(prev => prev.filter(b => b.id !== id));
  }

  function addBrand() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      Alert.prompt('Add Brand', 'Enter brand name', (text) => {
        if (!text?.trim()) return;
        const name = text.trim();
        setBrands(prev => [...prev, {
          id: `brand-${Date.now()}`,
          name,
          initials: name.slice(0, 2).toUpperCase(),
          hue: 0,
        }]);
      }, 'plain-text');
    } else {
      Alert.alert('Add Brand', 'Use iOS to add brands');
    }
  }

  // ── Follower: proposal form ──────────────────────────────────────────────────

  const serviceTitles = services.map(s => s.title);

  function pickService() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...serviceTitles, 'Cancel'], cancelButtonIndex: serviceTitles.length },
        (idx) => { if (idx < serviceTitles.length) setFormService(serviceTitles[idx]); },
      );
    } else {
      Alert.alert('Service Type', '', serviceTitles.map(s => ({ text: s, onPress: () => setFormService(s) })));
    }
  }

  function pickBudget() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const opts = [...BUDGET_OPTS];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...opts, 'Cancel'], cancelButtonIndex: opts.length },
        (idx) => { if (idx < opts.length) setFormBudget(opts[idx]); },
      );
    } else {
      Alert.alert('Budget Range', '', opts.map(b => ({ text: b, onPress: () => setFormBudget(b) })));
    }
  }

  function handleSubmit() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitOpen(false);
    setFormName(''); setFormCompany(''); setFormEmail('');
    setFormService(''); setFormBudget(''); setFormTimeline(''); setFormDesc('');
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 5000);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, backgroundColor: C.bg, opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Collaborate</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{
          paddingTop: topBarH + 20,
          paddingBottom: isOwner ? insets.bottom + 49 + 24 : insets.bottom + 49 + 90,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Description ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          {isOwner ? (
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ fontSize: 15, color: C.secondary, lineHeight: 22 }}
              placeholderTextColor={C.secondary}
              placeholder="Add a description..."
            />
          ) : (
            <Text style={{ fontSize: 15, color: C.secondary, lineHeight: 22 }}>
              {description}
            </Text>
          )}
        </View>

        {/* ── SERVICES ── */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 10 }}>
          Services
        </Text>
        <View style={{ marginHorizontal: 16, borderRadius: 14, backgroundColor: C.surface, overflow: 'hidden', marginBottom: 32 }}>
          {services.map((svc, idx) => (
            <View
              key={svc.id}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, paddingVertical: 14, gap: 14,
                borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: C.separator,
              }}
            >
              <IconSymbol name={svc.icon as any} size={20} color={C.label} />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: C.label }}>
                {svc.title}
              </Text>
              <Text style={{ fontSize: 14, color: C.secondary, fontWeight: '500' }}>
                from {svc.starting}
              </Text>
              {isOwner && (
                <Pressable
                  onPress={() => showServiceMenu(svc)}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingLeft: 4 })}
                >
                  <IconSymbol name="ellipsis" size={16} color={C.secondary} />
                </Pressable>
              )}
            </View>
          ))}

          {/* Add Service row — Owner only */}
          {isOwner && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSvcOpen(true); }}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, paddingVertical: 14, gap: 14,
                borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <IconSymbol name="plus.circle" size={20} color={C.secondary} />
              <Text style={{ fontSize: 15, color: C.secondary }}>Add a service</Text>
            </Pressable>
          )}
        </View>

        {/* ── TRUSTED BY ── */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 10 }}>
          Trusted By
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
          style={{ marginBottom: 32 }}
        >
          {brands.map(brand => (
            <View
              key={brand.id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: C.surface, borderRadius: 20,
                paddingHorizontal: 14, paddingVertical: 9,
              }}
            >
              <View style={{
                width: 24, height: 24, borderRadius: 6,
                backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: C.secondary }}>{brand.initials}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{brand.name}</Text>
              {isOwner && (
                <Pressable onPress={() => removeBrand(brand.id)} hitSlop={6}>
                  <IconSymbol name="xmark" size={11} color={C.secondary} />
                </Pressable>
              )}
            </View>
          ))}

          {/* Add brand pill — Owner only */}
          {isOwner && (
            <Pressable
              onPress={addBrand}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: C.surface, borderRadius: 20,
                paddingHorizontal: 14, paddingVertical: 9,
                borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <IconSymbol name="plus" size={13} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.secondary }}>Add</Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Confirmation banner — Follower only */}
        {!isOwner && confirmed && (
          <View style={{
            marginHorizontal: 16, backgroundColor: GAIN + '20', borderRadius: 12,
            padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <IconSymbol name="checkmark.circle.fill" size={18} color={GAIN} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: GAIN }}>
              Proposal submitted! You'll hear back soon.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit a Proposal CTA — Follower only, sits above universal 49px footer */}
      {!isOwner && (
        <View style={{
          position: 'absolute', bottom: insets.bottom + 49, left: 0, right: 0,
          paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
          backgroundColor: C.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator,
        }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSubmitOpen(true); }}
            style={({ pressed }) => ({
              backgroundColor: C.label, borderRadius: 14,
              paddingVertical: 15, alignItems: 'center', opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Submit a Proposal</Text>
          </Pressable>
        </View>
      )}

      {/* ── Add Service sheet — Owner ── */}
      <BottomSheet visible={addSvcOpen} onClose={() => setAddSvcOpen(false)} useModal title="Add Service">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField label="Service Name" value={newSvcTitle} onChangeText={setNewSvcTitle} placeholder="e.g. Sponsored Reel" C={C} />
          <FormField label="Starting Price" value={newSvcPrice} onChangeText={setNewSvcPrice} placeholder="e.g. $8,000" C={C} />

          <Pressable
            onPress={handleAddService}
            style={({ pressed }) => ({
              backgroundColor: C.label, borderRadius: 14,
              paddingVertical: 15, alignItems: 'center', marginTop: 4, opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Add Service</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>

      {/* ── Proposal form sheet — Follower ── */}
      <BottomSheet visible={submitOpen} onClose={() => setSubmitOpen(false)} useModal title="Submit a Proposal">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField label="Your Name"       value={formName}     onChangeText={setFormName}     placeholder="Full name"           C={C} />
          <FormField label="Company / Brand" value={formCompany}  onChangeText={setFormCompany}  placeholder="Optional"            C={C} />
          <FormField label="Email"           value={formEmail}    onChangeText={setFormEmail}     placeholder="you@company.com"     keyboardType="email-address" C={C} />

          {/* Service type */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Service Type
            </Text>
            <Pressable
              onPress={pickService}
              style={({ pressed }) => ({
                backgroundColor: C.surface, borderRadius: 12,
                borderWidth: 1, borderColor: C.separator,
                padding: 14, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ flex: 1, fontSize: 15, color: formService ? C.label : C.secondary }}>
                {formService || 'Select a service...'}
              </Text>
              <IconSymbol name="chevron.down" size={14} color={C.secondary} />
            </Pressable>
          </View>

          {/* Budget range */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Budget Range
            </Text>
            <Pressable
              onPress={pickBudget}
              style={({ pressed }) => ({
                backgroundColor: C.surface, borderRadius: 12,
                borderWidth: 1, borderColor: C.separator,
                padding: 14, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ flex: 1, fontSize: 15, color: formBudget ? C.label : C.secondary }}>
                {formBudget || 'Select budget range...'}
              </Text>
              <IconSymbol name="chevron.down" size={14} color={C.secondary} />
            </Pressable>
          </View>

          <FormField label="Timeline"                   value={formTimeline} onChangeText={setFormTimeline} placeholder="e.g. Q3 2026, ASAP, flexible" C={C} />
          <FormField label="Tell me about your project" value={formDesc}     onChangeText={setFormDesc}     placeholder="Describe what you're looking for..." multiline C={C} />

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => ({
              backgroundColor: C.label, borderRadius: 14,
              paddingVertical: 15, alignItems: 'center', marginTop: 4, opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Submit</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// ── FormField ──────────────────────────────────────────────────────────────────

function FormField({
  label, value, onChangeText, placeholder, multiline, keyboardType, C,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address';
  C: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: C.surface, borderRadius: 12,
          borderWidth: 1, borderColor: C.separator,
          padding: 14, fontSize: 15, color: C.label,
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.secondary}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}
