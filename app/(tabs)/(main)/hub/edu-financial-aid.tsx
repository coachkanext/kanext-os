/**
 * Education Hub — Financial Aid (Student only)
 * Tuition balance, aid package, disbursements, documents, 1098-T.
 */

import React, { useCallback } from 'react';
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
const CAUTION = '#B8943E';

const DISBURSEMENTS = [
  { date: 'Jan 15, 2026', amount: '$3,560', status: 'Disbursed', note: 'Applied to balance'      },
  { date: 'May 15, 2026', amount: '$3,560', status: 'Upcoming',  note: 'Fall 2026 disbursement'  },
  { date: 'Sep 15, 2026', amount: '$3,560', status: 'Upcoming',  note: 'Spring 2027 disbursement' },
];

const DOCS = [
  { name: 'FAFSA Verification',      status: 'Submitted' },
  { name: 'Income Verification',     status: 'Submitted' },
  { name: 'Enrollment Verification', status: 'Submitted' },
  { name: 'Scholarship Acceptance',  status: 'Pending'   },
];

function disbursementStyle(status: string, C: any) {
  if (status === 'Disbursed') return { bg: GAIN + '26',    text: GAIN    };
  return { bg: C.separator, text: C.secondary };
}

function docStyle(status: string, C: any) {
  if (status === 'Submitted') return { bg: GAIN + '26',    text: GAIN    };
  if (status === 'Pending')   return { bg: CAUTION + '26', text: CAUTION };
  return { bg: '#B85C5C26', text: '#B85C5C' };
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduFinancialAid() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

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
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Financial Aid</Text>
            </View>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPresident} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {isPresident ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <IconSymbol name="lock.fill" size={32} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12, textAlign: 'center' }}>Switch to Student role to view financial aid</Text>
          </View>
        ) : (
          <>
            {/* TUITION BALANCE */}
            <View style={{ marginTop: 16, backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 8 }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: C.label, marginBottom: 4 }}>$3,420</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 8 }}>Balance Due — Spring 2026</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 14 }}>Payment Plan: Next payment <Text style={{ fontWeight: '600', color: C.label }}>$855</Text> due May 1</Text>
              <Pressable style={{ backgroundColor: C.label, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, alignSelf: 'flex-start', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.bg }}>Pay Now</Text>
              </Pressable>
              <Text style={{ fontSize: 11, color: C.muted }}>Paid via KaPay</Text>
            </View>

            {/* AID PACKAGE */}
            <SH title="Aid Package" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 12 }}>Total Aid: $8,360 / year</Text>
              {[
                { name: 'Lincoln Merit Scholarship', amount: '$4,000' },
                { name: 'Oakland Opportunity Grant',  amount: '$2,160' },
                { name: 'Federal Pell Grant',         amount: '$1,200' },
                { name: 'Institutional Aid',          amount: '$1,000' },
              ].map((a, i) => (
                <View key={i} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                  <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{a.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{a.amount}</Text>
                </View>
              ))}
              <View style={{ marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Net Cost: $7,840 / semester</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>tuition $11,400 − aid $3,560 per semester</Text>
              </View>
            </View>

            {/* DISBURSEMENT SCHEDULE */}
            <SH title="Disbursement Schedule" C={C} />
            {DISBURSEMENTS.map((d, i) => {
              const st = disbursementStyle(d.status, C);
              return (
                <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{d.date}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{d.note}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{d.amount}</Text>
                    <View style={{ backgroundColor: st.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: st.text }}>{d.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* DOCUMENTS */}
            <SH title="Documents" C={C} />
            {DOCS.map((doc, i) => {
              const st = docStyle(doc.status, C);
              return (
                <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <IconSymbol
                    name={doc.status === 'Submitted' ? 'checkmark.circle.fill' : 'clock'}
                    size={16}
                    color={doc.status === 'Submitted' ? GAIN : CAUTION}
                  />
                  <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{doc.name}</Text>
                  <View style={{ backgroundColor: st.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: st.text }}>{doc.status}</Text>
                  </View>
                  {doc.status === 'Pending' && (
                    <Pressable style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Upload</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}

            {/* 1098-T */}
            <SH title="Tax Forms" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 6 }}>1098-T — Tax Year 2025</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 14 }}>
                Qualified education expenses: $18,720{'\n'}Scholarships received: $8,360
              </Text>
              <Pressable style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconSymbol name="arrow.down.doc.fill" size={13} color={C.label} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Download PDF</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
