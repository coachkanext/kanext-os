/**
 * Admissions — Financial Aid (Student only)
 * Tuition balance, aid package, disbursement schedule, documents, 1098-T.
 * Two access points: sidebar + my-application screen.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TUITION = {
  semesterCost: 18500,
  amountOwed:   4200,
  nextPayment:  '$700',
  nextPayDate:  'May 1, 2026',
};

const AID_PACKAGE = [
  { label: 'Presidential Merit Scholarship', amount: 8000, type: 'scholarship' },
  { label: 'Federal Pell Grant',             amount: 3800, type: 'grant'       },
  { label: 'Subsidized Loan',                amount: 2500, type: 'loan'        },
];
const TOTAL_AID = AID_PACKAGE.reduce((s, a) => s + a.amount, 0);

const DISBURSEMENTS = [
  { label: 'Fall 2026 Aid Disbursement',   date: 'Aug 15, 2026', amount: 14300, status: 'Scheduled' },
  { label: 'Spring 2026 Aid Disbursement', date: 'Jan 10, 2026', amount: 14300, status: 'Paid'      },
];

type DocStatus = 'submitted' | 'pending' | 'missing';
const FA_DOCS: { label: string; status: DocStatus }[] = [
  { label: 'FAFSA (2025-26)',             status: 'submitted' },
  { label: 'Verification Worksheet',      status: 'submitted' },
  { label: 'Tax Return (Student)',        status: 'submitted' },
  { label: 'Scholarship Acceptance Form', status: 'pending'   },
];

const DOC_COLOR: Record<DocStatus, string> = { submitted: GAIN, pending: CAUTION, missing: HEAT };
const DOC_ICON: Record<DocStatus, string>  = { submitted: 'checkmark.circle.fill', pending: 'clock.fill', missing: 'exclamationmark.circle.fill' };

const AID_TYPE_COLOR = { scholarship: GAIN, grant: GAIN, loan: CAUTION };

export default function FinancialAidScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('education:admissions');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isPresident) router.replace('/(tabs)/(main)/admissions/pipeline' as any);
  }, [isPresident, router]);

  if (isPresident) return null;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Financial Aid</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={!isPresident} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Tuition balance */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <GlassView tier={1} style={{ borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>BALANCE DUE — FALL 2026</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: HEAT, marginBottom: 4 }}>${TUITION.amountOwed.toLocaleString()}</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>After financial aid · Tuition ${TUITION.semesterCost.toLocaleString()}/semester</Text>
            <View style={[s.row, { marginBottom: 16 }]}>
              <IconSymbol name="calendar" size={13} color={C.secondary} />
              <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 6 }}>Next payment {TUITION.nextPayment} due {TUITION.nextPayDate}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [s.payBtn, { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Pay Now', 'Opening KayPay — coming soon'); }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Pay Now via KayPay</Text>
            </Pressable>
          </GlassView>
        </View>

        {/* Aid package */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Aid Package</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {AID_PACKAGE.map((aid, i) => (
              <View key={aid.label} style={[
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{aid.label}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 1, textTransform: 'capitalize' }}>{aid.type}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: AID_TYPE_COLOR[aid.type as keyof typeof AID_TYPE_COLOR] ?? GAIN }}>${aid.amount.toLocaleString()}</Text>
              </View>
            ))}
            {/* Total */}
            <View style={[s.row, { paddingVertical: 13, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: C.separator }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>Total Aid</Text>
              <Text style={{ fontSize: 15, fontWeight: '900', color: GAIN }}>${TOTAL_AID.toLocaleString()}</Text>
            </View>
          </GlassView>
        </View>

        {/* Disbursement schedule */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Disbursements</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {DISBURSEMENTS.map((d, i) => {
              const isScheduled = d.status === 'Scheduled';
              return (
                <View key={d.label} style={[
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{d.label}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{d.date}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: isScheduled ? CAUTION : GAIN }}>${d.amount.toLocaleString()}</Text>
                  <View style={[s.statusPill, {
                    backgroundColor: (isScheduled ? CAUTION : GAIN) + '18',
                    borderColor:     (isScheduled ? CAUTION : GAIN) + '60',
                  }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: isScheduled ? CAUTION : GAIN }}>{d.status}</Text>
                  </View>
                </View>
              );
            })}
          </GlassView>
        </View>

        {/* Required documents */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Required Documents</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {FA_DOCS.map((doc, i) => (
              <View key={doc.label} style={[
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <IconSymbol name={DOC_ICON[doc.status] as any} size={16} color={DOC_COLOR[doc.status]} />
                <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{doc.label}</Text>
                {doc.status !== 'submitted' && (
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Upload', `Upload ${doc.label} — coming soon`); }}
                    style={[s.uploadBtn, { borderColor: C.separator }]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.label }}>Upload</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </GlassView>
        </View>

        {/* 1098-T */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Tax Form (1098-T)</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 4 }}>Tax Year 2025</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 14, lineHeight: 19 }}>
              Your 1098-T form for qualified education expenses is available for download. Use this for your federal tax return.
            </Text>
            <Pressable
              style={({ pressed }) => [s.downloadBtn, { borderColor: C.separator, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Download 1098-T', 'PDF download — coming soon'); }}
            >
              <IconSymbol name="arrow.down.circle.fill" size={15} color={C.label} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Download 1098-T (PDF)</Text>
            </Pressable>
          </GlassView>
        </View>

      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    payBtn:        { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    uploadBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
    downloadBtn:   { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  });
}
