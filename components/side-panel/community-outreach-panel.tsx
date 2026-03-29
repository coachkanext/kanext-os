/**
 * Community Outreach Side Panel — admin navigation + pipeline summary.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getStageCounts, getCampaignsByStatus } from '@/data/mock-community-outreach';

export function CommunityOutreachPanel() {
  const C      = useColors();
  const router = useRouter();

  const stageCounts     = getStageCounts();
  const activeCampaigns = getCampaignsByStatus('active');
  const totalProspects  = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  const nav = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const navRow = (icon: string, label: string, detail?: string, onPress?: () => void) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress ?? (() => {})}
    >
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>
      {/* Pipeline summary */}
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 8 }}>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Pipeline</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {([
            { label: '1st Visit', count: stageCounts['First Visit'], color: '#1D9BF0' },
            { label: 'Returned',  count: stageCounts['Returned'],    color: '#3B82F6' },
            { label: 'Connected', count: stageCounts['Connected'],   color: '#5A8A6E' },
            { label: 'Member',    count: stageCounts['Member'],      color: '#3D7A5A' },
          ] as const).map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: item.color + '11', borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: item.color }}>{item.count}</Text>
              <Text style={{ fontSize: 8, color: item.color, textAlign: 'center', marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigate */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('person.2.fill',   'Pipeline',  `${totalProspects} prospects`, () => nav('/(tabs)/(main)/outreach'))}
        {navRow('megaphone.fill',  'Campaigns', `${activeCampaigns.length} active`,   () => nav('/(tabs)/(main)/outreach'))}
        {navRow('hands.clap.fill', 'Serve',     undefined,                            () => nav('/(tabs)/(main)/outreach'))}
      </View>

      {/* Active campaigns */}
      {activeCampaigns.length > 0 && (
        <>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Active Campaigns</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {activeCampaigns.map((c, i) => (
              <View
                key={c.id}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 14, paddingVertical: 12, gap: 10,
                  borderBottomWidth: i < activeCampaigns.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5A8A6E' }} />
                <Text style={{ flex: 1, fontSize: 13, color: C.label }} numberOfLines={1}>{c.name}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{c.volunteersJoined}/{c.volunteersNeeded}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Actions */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('person.badge.plus',    'Add Connect Card')}
        {navRow('plus.circle.fill',     'New Campaign')}
        {navRow('square.and.arrow.up',  'Export Prospects')}
      </View>

      {/* Settings */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Settings</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('gear',     'Follow-up Workflows')}
        {navRow('map.fill', 'Territory Map')}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 6 },
  navRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:     { fontSize: 12 },
});
