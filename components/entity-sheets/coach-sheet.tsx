/**
 * Coach Sheet — Universal 3-tab coach profile bottom sheet.
 * Tabs: Bio | Systems | Notes
 * Header (name, title, team) always visible above tabs.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { CoachCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

type Tab = 'bio' | 'systems' | 'notes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'bio', label: 'Bio' },
  { key: 'systems', label: 'Systems' },
  { key: 'notes', label: 'Notes' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CoachCardData | null;
}

export function CoachSheet({ visible, onClose, data }: Props) {
  const C = useColors();
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('bio');
  const styles = useMemo(() => makeStyles(C), [C]);

  // Reset tab when sheet reopens
  React.useEffect(() => {
    if (visible) setActiveTab('bio');
  }, [visible]);

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.headerSection}>
        {/* ── HEADER — always visible ── */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 30%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.coachName}>{data.name}</Text>
            <Text style={styles.coachTitle}>{data.title}</Text>
          </View>
        </View>

        {/* ── TAB PILLS ── */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabPill, active && [styles.tabPillActive, { backgroundColor: accent + '30' }]]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <Text style={[styles.tabText, { color: active ? accent : C.secondary }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>

          {/* ════════════════════════════════════════════
              TAB 1 — BIO
              ════════════════════════════════════════════ */}
          {activeTab === 'bio' && (
            <>
              {/* Role & Tenure */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>ROLE & TENURE</Text>
                <InfoRow label="Title" value={data.title} C={C} styles={styles} />
                {data.tenure && <InfoRow label="Tenure" value={data.tenure} C={C} styles={styles} />}
                {data.recordAtInstitution && (
                  <InfoRow label="Record" value={data.recordAtInstitution} C={C} styles={styles} />
                )}
              </View>

              {/* Bio */}
              {data.bio ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>BIO</Text>
                  <Text style={styles.bioText}>{data.bio}</Text>
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>BIO</Text>
                  <Text style={styles.placeholderText}>
                    Full coaching biography not yet available.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 2 — SYSTEMS
              ════════════════════════════════════════════ */}
          {activeTab === 'systems' && (
            <>
              {/* System profile */}
              {(data.offSystem || data.defSystem) ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>SYSTEM PROFILE</Text>
                  {data.offSystem && <InfoRow label="Offensive System" value={data.offSystem} C={C} styles={styles} />}
                  {data.defSystem && <InfoRow label="Defensive System" value={data.defSystem} C={C} styles={styles} />}
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>SYSTEM PROFILE</Text>
                  <Text style={styles.placeholderText}>
                    System data not yet available.
                  </Text>
                </View>
              )}

              {/* Tendencies */}
              {data.tendencies && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>TENDENCIES</Text>
                  <Text style={styles.bioText}>{data.tendencies}</Text>
                </View>
              )}

              {/* Known levers */}
              {data.knownLevers && data.knownLevers.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>KNOWN LEVERS</Text>
                  {data.knownLevers.map((lever, i) => (
                    <View key={i} style={styles.leverRow}>
                      <Text style={styles.bullet}>{'\u2022'}</Text>
                      <Text style={styles.leverText}>{lever}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 3 — NOTES
              ════════════════════════════════════════════ */}
          {activeTab === 'notes' && (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>SCOUTING NOTES</Text>
                <Text style={styles.placeholderText}>
                  No scouting notes yet. Coaching intel and game prep notes will appear here.
                </Text>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

// ── Helper Components ──

function InfoRow({ label, value, C, styles }: { label: string; value: string; C: ComponentColors; styles: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: C.label, letterSpacing: 1 },
  coachName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: C.label },
  coachTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, color: C.secondary },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4, backgroundColor: C.surface },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8, backgroundColor: C.surface, borderColor: C.separator },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  bioText: { fontSize: 13, fontWeight: '500', lineHeight: 19, color: C.secondary },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: C.muted },
  infoValue: { fontSize: 13, fontWeight: '700', color: C.label },

  // Levers
  leverRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 18, color: C.secondary },
  leverText: { fontSize: 13, fontWeight: '600', lineHeight: 18, flex: 1, color: C.label },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic', color: C.muted },
});
