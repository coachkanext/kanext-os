/**
 * KPlay — Settings
 * Default pricing, certificates, notifications, access defaults, integrations.
 * Personal mode · KPlay tile · Owner only (MANAGE).
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ── Helper ────────────────────────────────────────────────────────────────────

const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function KPlaySettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  const TOP_BAR_H_FULL = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H_FULL);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isOwner) {
      router.replace('/(tabs)/(main)/kaystudios' as any);
    }
  }, [isOwner, router]));

  // ── State ─────────────────────────────────────────────────────────────────

  type PricingOption = 'free' | 'onetime' | 'subscription';
  type AccessOption  = 'public' | 'subscribers';

  const [pricing,              setPricing]              = useState<PricingOption>('free');
  const [accessDefault,        setAccessDefault]        = useState<AccessOption>('public');
  const [completionCerts,      setCompletionCerts]      = useState(true);
  const [notifyEnrollment,     setNotifyEnrollment]     = useState(true);
  const [notifyCompleted,      setNotifyCompleted]      = useState(true);
  const [notifyReview,         setNotifyReview]         = useState(true);
  const [notifyQuestion,       setNotifyQuestion]       = useState(false);

  // ── Inline helpers ────────────────────────────────────────────────────────

  function SectionHeader({ title }: { title: string }) {
    return (
      <Text style={[s.sectionHeader, { color: C.secondary }]}>{title}</Text>
    );
  }

  function SwitchRow({
    label, value, onChange, isLast,
  }: { label: string; value: boolean; onChange: (v: boolean) => void; isLast?: boolean }) {
    return (
      <View style={[s.row, { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
        <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{label}</Text>
        <Switch
          value={value}
          onValueChange={(v) => { tap(); onChange(v); }}
          trackColor={{ true: C.label, false: C.separator }}
          thumbColor={C.bg}
          ios_backgroundColor={C.separator}
        />
      </View>
    );
  }

  function ChevronRow({
    label, value, onPress, isLast,
  }: { label: string; value?: string; onPress?: () => void; isLast?: boolean }) {
    return (
      <Pressable
        onPress={() => { tap(); onPress?.(); }}
        style={({ pressed }) => ([
          s.row,
          {
            backgroundColor: pressed ? C.separator : 'transparent',
            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: C.separator,
          },
        ])}
      >
        <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{label}</Text>
        {value != null && (
          <Text style={{ fontSize: 14, color: C.secondary, marginRight: 6 }}>{value}</Text>
        )}
        <IconSymbol name="chevron.right" size={13} color={C.secondary} />
      </Pressable>
    );
  }

  // ── Pricing option row ────────────────────────────────────────────────────

  function PricingRow({
    id, label, subtitle, isLast,
  }: { id: PricingOption; label: string; subtitle: string; isLast?: boolean }) {
    const active = pricing === id;
    return (
      <Pressable
        onPress={() => { tap(); setPricing(id); }}
        style={({ pressed }) => ([
          s.row,
          {
            height: 'auto' as any,
            paddingVertical: 14,
            backgroundColor: pressed ? C.separator : 'transparent',
            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: C.separator,
            alignItems: 'center',
          },
        ])}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, color: active ? C.label : C.secondary }}>{label}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{subtitle}</Text>
        </View>
        <IconSymbol
          name={active ? 'checkmark.circle.fill' : 'circle'}
          size={20}
          color={active ? GAIN : C.separator}
        />
      </Pressable>
    );
  }

  // ── Access option row ─────────────────────────────────────────────────────

  function AccessRow({
    id, label, subtitle, isLast,
  }: { id: AccessOption; label: string; subtitle: string; isLast?: boolean }) {
    const active = accessDefault === id;
    return (
      <Pressable
        onPress={() => { tap(); setAccessDefault(id); }}
        style={({ pressed }) => ([
          s.row,
          {
            height: 'auto' as any,
            paddingVertical: 14,
            backgroundColor: pressed ? C.separator : 'transparent',
            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: C.separator,
            alignItems: 'center',
          },
        ])}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, color: active ? C.label : C.secondary }}>{label}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{subtitle}</Text>
        </View>
        <IconSymbol
          name={active ? 'checkmark.circle.fill' : 'circle'}
          size={20}
          color={active ? GAIN : C.separator}
        />
      </Pressable>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.topBarTitle, { color: C.label }]}>Settings</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{
          paddingTop: TOP_BAR_H_FULL + 16,
          paddingBottom: insets.bottom + 40,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* 1. Default Pricing */}
        <View>
          <SectionHeader title="Default Pricing" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <PricingRow
              id="free"
              label="Free"
              subtitle="No payment required to enroll"
            />
            <PricingRow
              id="onetime"
              label="One-Time Purchase"
              subtitle="Students pay once, lifetime access"
            />
            <PricingRow
              id="subscription"
              label="Subscription Tier Gated"
              subtitle="Requires active subscription tier"
              isLast
            />
          </View>
        </View>

        {/* 2. Certificates */}
        <View>
          <SectionHeader title="Certificates" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SwitchRow
              label="Completion Certificates"
              value={completionCerts}
              onChange={setCompletionCerts}
            />
            <ChevronRow
              label="Upload Certificate Template"
              onPress={() => Alert.alert('KPlay', 'Upload template')}
            />
            <ChevronRow
              label="Certificate Name Format"
              value="Creator Name + Course"
              onPress={() => Alert.alert('KPlay', 'Edit certificate name format')}
            />
            <ChevronRow
              label="Branding"
              value="KaNeXT + Your Logo"
              onPress={() => Alert.alert('KPlay', 'Edit branding settings')}
              isLast
            />
          </View>
        </View>

        {/* 3. Notifications */}
        <View>
          <SectionHeader title="Notifications" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SwitchRow label="New Enrollment"    value={notifyEnrollment} onChange={setNotifyEnrollment} />
            <SwitchRow label="Course Completed"  value={notifyCompleted}  onChange={setNotifyCompleted} />
            <SwitchRow label="New Review"        value={notifyReview}     onChange={setNotifyReview} />
            <SwitchRow label="Student Question"  value={notifyQuestion}   onChange={setNotifyQuestion} isLast />
          </View>
        </View>

        {/* 4. Access Defaults */}
        <View>
          <SectionHeader title="Access Defaults" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <AccessRow
              id="public"
              label="Public"
              subtitle="Anyone can find and enroll"
            />
            <AccessRow
              id="subscribers"
              label="Subscribers Only"
              subtitle="Only active subscribers can enroll"
              isLast
            />
          </View>
        </View>

        {/* 5. Integrations */}
        <View>
          <SectionHeader title="Integrations" />
          <View style={[s.card, { backgroundColor: C.surface }]}>

            {/* KTV */}
            <Pressable
              onPress={() => { tap(); Alert.alert('KPlay', 'Import videos as lessons'); }}
              style={({ pressed }) => ([
                s.row,
                {
                  backgroundColor: pressed ? C.separator : 'transparent',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: C.separator,
                },
              ])}
            >
              <IconSymbol name="play.rectangle.fill" size={18} color={C.secondary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Connect to KTV</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: GAIN }} />
                <Text style={{ fontSize: 13, color: GAIN }}>Connected</Text>
              </View>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>

            {/* Store */}
            <Pressable
              onPress={() => { tap(); Alert.alert('KPlay', 'Courses appear as store products'); }}
              style={({ pressed }) => ([
                s.row,
                {
                  backgroundColor: pressed ? C.separator : 'transparent',
                  borderBottomWidth: 0,
                },
              ])}
            >
              <IconSymbol name="bag.fill" size={18} color={C.secondary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Connect to Store</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginRight: 8 }}>Not Connected</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
    topBarTitle: { fontSize: 17, fontWeight: '700' },
    card: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
    sectionHeader: {
      fontSize: 12, fontWeight: '600', letterSpacing: 0.5,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6,
    },
    row: {
      height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
  });
}
