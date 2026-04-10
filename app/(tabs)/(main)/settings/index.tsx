/**
 * Settings — Main hub with Account and Brand tabs.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';

const TOP_BAR_H = 44;
const HEAT = '#B85C5C';

type TabId = 'account' | 'brand';

const ACCOUNT_ROWS = [
  { icon: 'person.fill',          label: 'Profile',        preview: 'Sammy Kalejaiye', route: '/(tabs)/(main)/settings/profile'       },
  { icon: 'lock.fill',            label: 'Security',       preview: 'Face ID on',      route: '/(tabs)/(main)/settings/security'      },
  { icon: 'bell.fill',            label: 'Notifications',  preview: 'On',              route: '/(tabs)/(main)/settings/notifications' },
  { icon: 'shield.fill',          label: 'Privacy',        preview: null,              route: '/(tabs)/(main)/settings/privacy'       },
  { icon: 'creditcard.fill',      label: 'KPay',           preview: 'Chase ••4521',    route: '/(tabs)/(main)/settings/kpay'          },
  { icon: 'paintbrush.fill',      label: 'Appearance',     preview: 'Light',           route: '/(tabs)/(main)/settings/appearance'    },
  { icon: 'globe',                label: 'Language',       preview: 'English',         route: '/(tabs)/(main)/settings/language'      },
  { icon: 'questionmark.circle',  label: 'Help & Support', preview: null,              route: '/(tabs)/(main)/settings/help'          },
  { icon: 'info.circle',          label: 'About',          preview: 'v2.4.1',          route: '/(tabs)/(main)/settings/about'         },
] as const;

const BRAND_ROWS = [
  { icon: 'building.2.fill',      label: 'Brand Profile',   preview: 'Sammy Kalejaiye', route: '/(tabs)/(main)/settings/brand-profile'  },
  { icon: 'person.2.fill',        label: 'Members & Roles', preview: '1,247 members',   route: '/(tabs)/(main)/settings/members'        },
  { icon: 'paintpalette.fill',    label: 'Customization',   preview: null,              route: '/(tabs)/(main)/settings/customization'  },
  { icon: 'key.fill',             label: 'Permissions',     preview: null,              route: '/(tabs)/(main)/settings/permissions'    },
  { icon: 'creditcard.fill',      label: 'Billing',         preview: 'Pro Plan',        route: '/(tabs)/(main)/settings/billing'        },
  { icon: 'arrow.down.circle',    label: 'Data & Export',   preview: null,              route: '/(tabs)/(main)/settings/data-export'    },
  { icon: 'puzzlepiece.fill',     label: 'Integrations',    preview: '3 connected',     route: '/(tabs)/(main)/settings/integrations'   },
] as const;

export default function SettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [activeTab, setActiveTab] = useState<TabId>('account');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const go = (route: string) => {
    haptic();
    router.push(route as any);
  };

  const renderRows = (rows: typeof ACCOUNT_ROWS | typeof BRAND_ROWS) => (
    <GlassView tier={1} style={s.card}>
      {rows.map((row, idx) => (
        <Pressable
          key={row.label}
          style={({ pressed }) => [
            s.row,
            { backgroundColor: pressed ? C.bg : C.surface },
            idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
          ]}
          onPress={() => go(row.route)}
        >
          <IconSymbol name={row.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
          {row.preview && <Text style={[s.rowPreview, { color: C.secondary }]}>{row.preview}</Text>}
          <IconSymbol name="chevron.right" size={13} color={C.muted} />
        </Pressable>
      ))}
    </GlassView>
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={8} style={s.topBarBtn}>
          <KMenuButton />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Settings</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Segment toggle */}
        <View style={[s.segmentWrap, { backgroundColor: C.surface, borderColor: C.separator }]}>
          {(['account', 'brand'] as TabId[]).map(tab => (
            <Pressable
              key={tab}
              style={[s.segmentPill, activeTab === tab && { backgroundColor: C.label }]}
              onPress={() => { haptic(); setActiveTab(tab); }}
            >
              <Text style={[s.segmentText, { color: activeTab === tab ? C.bg : C.secondary }]}>
                {tab === 'account' ? 'Account' : 'Brand'}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'account' ? (
          <>
            {renderRows(ACCOUNT_ROWS)}

            {/* Log Out section */}
            <View style={s.logOutSection}>
              <Pressable
                style={[s.logOutBtn, { backgroundColor: C.surface, borderColor: HEAT + '33' }]}
                onPress={() => haptic()}
              >
                <Text style={[s.logOutText, { color: HEAT }]}>Log Out</Text>
              </Pressable>
              <Pressable onPress={() => haptic()} style={s.linkRow}>
                <Text style={[s.linkText, { color: C.secondary }]}>Log out all devices</Text>
              </Pressable>
              <Pressable onPress={() => haptic()} style={s.linkRow}>
                <Text style={[s.linkText, { color: C.secondary }]}>Deactivate account</Text>
              </Pressable>
              <Pressable onPress={() => haptic()} style={s.linkRow}>
                <Text style={[s.linkText, { color: HEAT }]}>Delete account</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {renderRows(BRAND_ROWS)}

            {/* Danger Zone */}
            <Pressable
              style={[s.dangerRow, { backgroundColor: C.surface, borderColor: HEAT + '33' }]}
              onPress={() => go('/(tabs)/(main)/settings/danger-zone')}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color={HEAT} />
              <Text style={[s.dangerLabel, { color: HEAT }]}>Danger Zone</Text>
              <IconSymbol name="chevron.right" size={13} color={HEAT} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:  { fontSize: 14, fontWeight: '700' },

    segmentWrap: { flexDirection: 'row', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 3, marginHorizontal: 16, marginTop: 12, marginBottom: 16 },
    segmentPill: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    segmentText: { fontSize: 14, fontWeight: '700' },

    card:       { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel:   { flex: 1, fontSize: 15 },
    rowPreview: { fontSize: 13 },

    logOutSection: { paddingHorizontal: 16, marginTop: 32, marginBottom: 8 },
    logOutBtn:  { height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    logOutText: { fontSize: 16, fontWeight: '700' },
    linkRow:    { marginTop: 12, alignItems: 'center' },
    linkText:   { fontSize: 13 },

    dangerRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 16, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
    dangerLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  });
}
