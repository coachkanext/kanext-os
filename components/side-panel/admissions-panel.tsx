/**
 * Admissions Side Panel — role-aware admin/student views.
 * Education mode only. Local role toggle for demo.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

type PanelRole = 'Admin' | 'Student';

const ADMIN_NAV = [
  { icon: 'person.2.fill',          label: 'Pipeline',     route: '/(tabs)/(main)/admissions' },
  { icon: 'doc.text.fill',          label: 'Applications', route: '/(tabs)/(main)/admissions' },
  { icon: 'megaphone.fill',         label: 'Campaigns',    route: '/(tabs)/(main)/admissions' },
] as const;

const ADMIN_SETTINGS = [
  { icon: 'doc.plaintext',          label: 'Application Form' },
  { icon: 'envelope.fill',          label: 'Email Templates'  },
  { icon: 'calendar.badge.clock',   label: 'Deadlines'        },
] as const;

const STUDENT_RESOURCES = [
  { icon: 'questionmark.circle.fill', label: 'FAQ'     },
  { icon: 'envelope.fill',            label: 'Contact' },
] as const;

export function AdmissionsPanel() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [panelRole, setPanelRole] = useState<PanelRole>('Admin');

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      {/* Role toggle */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {(['Admin', 'Student'] as PanelRole[]).map(r => (
          <Pressable
            key={r}
            style={({ pressed }) => ({
              flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
              backgroundColor: panelRole === r ? C.accent : (pressed ? C.surfacePressed : C.surface),
            })}
            onPress={() => { Haptics.selectionAsync(); setPanelRole(r); }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: panelRole === r ? '#fff' : C.secondary }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {panelRole === 'Admin' ? (
        <>
          {/* ── Home ── */}
          <Pressable
            style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed, styles.navRowBorder]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              closeSidePanel();
              router.setParams({ manage: undefined });
            }}
          >
            <IconSymbol name="house.fill" size={18} color={C.secondary} />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <View style={styles.divider} />

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `hsl(220,60%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>LU</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Lincoln University</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>Admissions</Text>
            </View>
          </View>

          {/* Navigate */}
          {ADMIN_NAV.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.navRow,
                pressed && styles.navRowPressed,
                idx < ADMIN_NAV.length - 1 && styles.navRowBorder,
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigateTo(item.route); }}
            >
              <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
              <Text style={styles.navLabel}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </Pressable>
          ))}

          <View style={styles.divider} />

          {/* Queue */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Queue</Text>
            {[
              { label: '4 Unreviewed',       badge: 4 },
              { label: '2 Decisions Pending', badge: 2 },
            ].map(item => (
              <Pressable key={item.label} style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed, styles.navRowBorder]}>
                <Text style={[styles.navLabel, { fontSize: 14 }]}>{item.label}</Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: C.accent }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{item.badge}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Upcoming events */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Upcoming</Text>
            {[
              { label: 'Spring Campus Visit Day', date: 'Apr 12' },
              { label: 'Virtual Open House',       date: 'May 20' },
            ].map((item, idx) => (
              <View key={item.label} style={[styles.navRow, idx === 0 && styles.navRowBorder]}>
                <IconSymbol name="calendar" size={16} color={C.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: C.label, fontWeight: '600' }}>{item.label}</Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>{item.date}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Settings */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Settings</Text>
            {ADMIN_SETTINGS.map((item, idx) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navRow,
                  pressed && styles.navRowPressed,
                  idx < ADMIN_SETTINGS.length - 1 && styles.navRowBorder,
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name={item.icon as any} size={16} color={C.secondary} />
                <Text style={styles.navLabel}>{item.label}</Text>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* Student header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `hsl(200,50%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>ME</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>My Application</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: '#1A171422', borderWidth: 1, borderColor: '#1A1714' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#1A1714' }}>Applied</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Application status row */}
          <Pressable
            style={({ pressed }) => [styles.navRow, styles.navRowBorder, pressed && styles.navRowPressed]}
            onPress={() => { navigateTo('/(tabs)/(main)/admissions'); }}
          >
            <IconSymbol name="doc.text.fill" size={16} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: C.label, fontWeight: '600' }}>Application Status</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>Applied · Under Review</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>

          {/* Counselor */}
          <Pressable
            style={({ pressed }) => [styles.navRow, styles.navRowBorder, pressed && styles.navRowPressed]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="person.fill" size={16} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: C.label, fontWeight: '600' }}>Sarah Chen</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>Your Admissions Counselor</Text>
            </View>
            <IconSymbol name="phone" size={16} color={C.accent} />
          </Pressable>

          <View style={styles.divider} />

          {/* Upcoming events */}
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Events</Text>
          {[
            { label: 'Spring Campus Visit Day', date: 'Apr 12 · On Campus' },
            { label: 'Virtual Open House',       date: 'May 20 · Virtual'   },
          ].map((item, idx) => (
            <View key={item.label} style={[styles.navRow, idx === 0 && styles.navRowBorder]}>
              <IconSymbol name="calendar" size={16} color={C.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: C.label, fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{item.date}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Financial aid */}
          <View style={[styles.navRow, styles.navRowBorder]}>
            <IconSymbol name="dollarsign.circle.fill" size={16} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: C.label, fontWeight: '600' }}>Financial Aid</Text>
              <Text style={{ fontSize: 12, color: '#B8943E' }}>Award Pending</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Resources */}
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Resources</Text>
          {STUDENT_RESOURCES.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.navRow,
                pressed && styles.navRowPressed,
                idx < STUDENT_RESOURCES.length - 1 && styles.navRowBorder,
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={item.icon as any} size={16} color={C.secondary} />
              <Text style={styles.navLabel}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </Pressable>
          ))}
        </>
      )}

      <View style={{ height: 32 }} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {},
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginVertical: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  navRowPressed: {
    backgroundColor: C.surfacePressed,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  navRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    color: C.label,
  },
});
