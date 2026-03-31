/**
 * Business Team Side Panel — Directory / Departments / Org Chart nav.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import { EMPLOYEES, DEPARTMENTS, getEmployeeById } from '@/data/mock-business-ops';

export function TeamPanel() {
  const C = useColors();
  const [role, setRole] = useState<'Admin' | 'Employee'>('Admin');
  const isAdmin = role === 'Admin';

  const onPTO       = EMPLOYEES.filter(e => e.status === 'pto');
  const newHires    = EMPLOYEES.filter(e => e.isNew);
  const contractors = EMPLOYEES.filter(e => e.status === 'contractor');
  const me          = EMPLOYEES.find(e => e.id === 'e01')!;
  const myManager   = me.manager ? getEmployeeById(me.manager) : null;

  const navRow = (icon: string, label: string, detail?: string) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
    >
      <IconSymbol name={icon as any} size={16} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>

      {/* Role toggle */}
      <View style={[s.roleRow, { backgroundColor: C.surfacePressed as string }]}>
        {(['Admin', 'Employee'] as const).map(r => (
          <Pressable key={r} onPress={() => { Haptics.selectionAsync(); setRole(r); }}
            style={[s.roleBtn, r === role && { backgroundColor: C.accent }]}>
            <Text style={[s.roleBtnText, { color: r === role ? '#fff' : C.secondary }]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {isAdmin ? (
        <>
          {/* Team stats */}
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { label: 'Total',   value: EMPLOYEES.length.toString(), color: C.label },
                { label: 'Active',  value: EMPLOYEES.filter(e => e.status === 'active').length.toString(), color: C.green },
                { label: 'Remote',  value: EMPLOYEES.filter(e => e.status === 'remote').length.toString(), color: '#1A1714' },
              ].map(m => (
                <View key={m.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed as string, borderRadius: 8, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: m.color }}>{m.value}</Text>
                  <Text style={{ fontSize: 9, color: C.secondary, marginTop: 2 }}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Navigate */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('person.2.fill',       'Directory',   `${EMPLOYEES.length} members`)}
            {navRow('building.2.fill',     'Departments', `${DEPARTMENTS.length} depts`)}
            {navRow('list.bullet.indent',  'Org Chart')}
          </View>

          {/* Who's out */}
          {onPTO.length > 0 && (
            <>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>Out Today</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                {onPTO.map((emp, i) => (
                  <Pressable key={emp.id} style={({ pressed }) => [
                    s.navRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    pressed && { backgroundColor: C.surfacePressed },
                  ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `hsl(${emp.hue},45%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{emp.initials}</Text>
                    </View>
                    <Text style={[s.navLabel, { color: C.label }]}>{emp.name}</Text>
                    <Text style={[s.navDetail, { color: '#1A1714' }]}>PTO</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* New hires */}
          {newHires.length > 0 && (
            <>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>New Hires</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                {newHires.map((emp, i) => (
                  <Pressable key={emp.id} style={({ pressed }) => [
                    s.navRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    pressed && { backgroundColor: C.surfacePressed },
                  ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `hsl(${emp.hue},45%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{emp.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.navLabel, { color: C.label, flex: 0 }]}>{emp.name}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{emp.title}</Text>
                    </View>
                    <View style={{ backgroundColor: `${C.accent}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: C.accent }}>NEW</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Actions */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('person.fill.badge.plus', 'Add Member')}
            {navRow('envelope.fill',          'Team Announcement')}
          </View>
        </>
      ) : (
        <>
          {/* My profile summary */}
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `hsl(${me.hue},45%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{me.initials}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{me.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{me.title}</Text>
              </View>
            </View>
            {[
              { label: 'Dept',    value: 'Leadership' },
              { label: 'Manager', value: myManager?.name ?? 'No manager' },
              { label: 'PTO',     value: `${me.ptoBalance} days left` },
            ].map((item, i) => (
              <View key={item.label} style={[{ flexDirection: 'row', paddingVertical: 7 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 12, color: C.muted, width: 70 }}>{item.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('person.2.fill',     'Directory')}
            {navRow('building.2.fill',   'Departments')}
            {navRow('list.bullet.indent','Org Chart')}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 6 },
  navRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:     { fontSize: 12 },
  roleRow:       { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  roleBtn:       { flex: 1, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roleBtnText:   { fontSize: 13, fontWeight: '700' },
});
