/**
 * Integrations Settings — Connected services, available integrations,
 * API key management, and webhook configuration.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';

const CONNECTED = [
  { id: 'i1', name: 'Google Calendar', icon: 'calendar.fill',            status: 'connected', lastSync: '2h ago'  },
  { id: 'i2', name: 'Hudl',            icon: 'play.rectangle.fill',      status: 'connected', lastSync: '1d ago'  },
  { id: 'i3', name: 'QuickBooks',      icon: 'chart.bar.doc.horizontal', status: 'connected', lastSync: '3d ago'  },
];

const AVAILABLE = [
  { id: 'a1', name: 'Stripe',    icon: 'creditcard.fill',                       category: 'Payments'       },
  { id: 'a2', name: 'Mailchimp', icon: 'envelope.badge.fill',                   category: 'Email'          },
  { id: 'a3', name: 'Zoom',      icon: 'video.fill',                            category: 'Video'          },
  { id: 'a4', name: 'Slack',     icon: 'bubble.left.and.bubble.right.fill',     category: 'Communication'  },
  { id: 'a5', name: 'HubSpot',   icon: 'arrow.triangle.2.circlepath',           category: 'CRM'            },
];

export default function IntegrationsSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Integrations</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* CONNECTED */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>CONNECTED — 3</Text>
        <GlassView tier={1} style={s.card}>
          {CONNECTED.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.integrationRow,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <View style={[s.iconBox, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <IconSymbol name={item.icon as any} size={18} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GAIN }} />
                  <Text style={{ fontSize: 12, color: C.secondary }}>Last sync {item.lastSync}</Text>
                </View>
              </View>
              <Pressable onPress={() => haptic()}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#B85C5C' }}>Disconnect</Text>
              </Pressable>
            </View>
          ))}
        </GlassView>

        {/* AVAILABLE INTEGRATIONS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>AVAILABLE INTEGRATIONS</Text>
        <GlassView tier={1} style={s.card}>
          {AVAILABLE.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.integrationRow,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <View style={[s.iconBox, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <IconSymbol name={item.icon as any} size={18} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{item.name}</Text>
                <View style={{ marginTop: 3 }}>
                  <View style={[s.categoryBadge, { backgroundColor: C.bg, borderColor: C.separator }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{item.category}</Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={() => haptic()}
                style={[s.connectBtn, { borderColor: C.separator }]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Connect</Text>
              </Pressable>
            </View>
          ))}
        </GlassView>

        {/* API ACCESS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>API ACCESS</Text>
        <GlassView tier={1} style={s.card}>
          {/* API Key Display */}
          <View style={[{ backgroundColor: C.surface, paddingHorizontal: 14, paddingVertical: 14 }]}>
            <Text style={{ fontSize: 13, color: C.secondary, fontWeight: '600', marginBottom: 8 }}>API Key</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[s.apiKeyBox, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <Text style={{ fontSize: 12, color: C.label, letterSpacing: 0.5 }}>
                  {apiKeyVisible ? 'sk_live_kn_a9f2b7c3d4e5f6g7h8i9j0...' : '••••••••••••••••••••••••••••'}
                </Text>
              </View>
              <Pressable
                onPress={() => setApiKeyVisible(v => !v)}
                style={[s.eyeBtn, { borderColor: C.separator, backgroundColor: C.surface }]}
              >
                <IconSymbol name={apiKeyVisible ? 'eye.slash' : 'eye'} size={16} color={C.label} />
              </Pressable>
            </View>
          </View>
          {/* Regenerate */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="arrow.clockwise" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Regenerate API Key</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* WEBHOOKS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>WEBHOOKS</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="link" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Configure Webhooks</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>0 endpoints</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:  { fontSize: 14, fontWeight: '700' },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 16, marginBottom: 6, marginTop: 24,
    },
    card:          { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },

    integrationRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 13,
    },
    iconBox: {
      width: 36, height: 36, borderRadius: 9,
      borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
    },
    connectBtn: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    apiKeyBox: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    eyeBtn: {
      height: 38,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      justifyContent: 'center',
    },
  });
}
