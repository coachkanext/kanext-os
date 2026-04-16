/**
 * Education Hub — Enrollment (President only)
 * Admissions funnel, applications, campaigns, yield tracking.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

const FUNNEL = [
  { stage: 'Inquiries',    count: 1240, rate: '28%' },
  { stage: 'Applied',      count: 347,  rate: '41%' },
  { stage: 'Under Review', count: 143,  rate: '76%' },
  { stage: 'Accepted',     count: 109,  rate: '52%' },
  { stage: 'Deposited',    count: 57,   rate: '89%' },
  { stage: 'Enrolled',     count: 51,   rate: null  },
];

const APPLICATIONS = [
  { name: 'Maria Gonzalez', program: 'MBA',                         status: 'Under Review', date: 'Apr 10' },
  { name: 'James Okafor',   program: 'BS Diagnostic Imaging',       status: 'New',          date: 'Apr 12' },
  { name: 'Sarah Kim',      program: 'BA Business Administration',  status: 'Decision Made',date: 'Apr 8'  },
  { name: 'David Chen',     program: 'DBA',                         status: 'Under Review', date: 'Apr 7'  },
  { name: 'Amara Diallo',   program: "MS Int'l Business & Finance", status: 'New',          date: 'Apr 13' },
];

const APP_FILTERS = ['All', 'New', 'Under Review', 'Decision Made'] as const;
type AppFilter = typeof APP_FILTERS[number];

const CAMPAIGNS = [
  { name: 'Spring Open House',     date: 'Apr 20', leads: 89,  conversion: '12%' },
  { name: 'Oakland HS Visit Tour', date: 'May 3',  leads: 45,  conversion: '8%'  },
  { name: 'Virtual Info Session',  date: 'May 15', leads: 132, conversion: '15%' },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

function statusPillStyle(status: string, C: any) {
  if (status === 'New') return { bg: C.separator, text: C.secondary };
  if (status === 'Under Review') return { bg: CAUTION + '26', text: CAUTION };
  if (status === 'Decision Made') return { bg: GAIN + '26', text: GAIN };
  return { bg: C.separator, text: C.secondary };
}

export default function EduEnrollment() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];
  const [appFilter, setAppFilter] = useState<AppFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredApps = appFilter === 'All' ? APPLICATIONS : APPLICATIONS.filter(a => a.status === appFilter);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ backgroundColor: C.bg, paddingTop: insets.top }}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: C.label }}>K</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Enrollment</Text>
            </View>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPresident} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {!isPresident ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <IconSymbol name="lock.fill" size={32} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12, textAlign: 'center' }}>This section is for administrators</Text>
          </View>
        ) : (
          <>
            {/* FUNNEL */}
            <SH title="Admissions Pipeline — Fall 2026" C={C} />
            {FUNNEL.map((f, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, fontSize: 14, color: C.secondary }}>{f.stage}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 17, fontWeight: '600', color: C.label }}>{f.count.toLocaleString()}</Text>
                  {f.rate && <Text style={{ fontSize: 11, color: C.muted }}>→ {f.rate} converted</Text>}
                </View>
              </View>
            ))}

            {/* APPLICATIONS */}
            <SH title="Applications" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {APP_FILTERS.map(f => (
                  <Pressable
                    key={f}
                    onPress={() => setAppFilter(f)}
                    style={{ backgroundColor: f === appFilter ? C.label : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '500', color: f === appFilter ? C.bg : C.secondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {filteredApps.map((a, i) => {
              const pill = statusPillStyle(a.status, C);
              return (
                <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{initials(a.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{a.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{a.program}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={{ backgroundColor: pill.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: pill.text }}>{a.status}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.muted }}>{a.date}</Text>
                  </View>
                </View>
              );
            })}

            {/* CAMPAIGNS */}
            <SH title="Campaigns" C={C} />
            {CAMPAIGNS.map((camp, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{camp.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{camp.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{camp.leads} leads</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{camp.conversion} conversion</Text>
                </View>
              </View>
            ))}

            {/* YIELD TRACKING */}
            <SH title="Yield Tracking" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 8 }}>
                57 deposited / 109 accepted — <Text style={{ color: GAIN }}>52% yield rate</Text>
              </Text>
              <Text style={{ fontSize: 13, color: CAUTION, marginBottom: 8 }}>52 accepted students have not yet deposited</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>Follow-up actions: Send reminder email · Schedule campus visit · Offer financial aid review</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
