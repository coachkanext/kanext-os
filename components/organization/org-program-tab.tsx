/**
 * Organization → Program Tab (Sports Mode only)
 * Current program's admin / GM control plane.
 * Sections: Identity → Snapshot → Systems → Roster Control → Schedule →
 *           Ops Pulse → Finance Pulse → Rails Pulse → Compliance Pulse →
 *           Rooms → Audit & Settings
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  PROGRAM_IDENTITY,
  PROGRAM_SNAPSHOT,
  STAFF_MEMBERS,
  ROSTER_AVAILABILITY,
  PROGRAM_SYSTEMS,
  UPCOMING_GAMES,
  OPS_PULSE,
  FINANCE_PULSE,
  PAYMENT_RAILS_PULSE,
  COMPLIANCE_PULSE,
  PROGRAM_ROOMS,
  AUDIT_LOG,
  AUDIT_ACTION_META,
  PROGRAM_SETTINGS,
  TODAY_NEXT,
  type ProgramSetting,
} from '@/data/mock-program-v2';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString();
}

function getHealthColor(value: number): string {
  if (value >= 80) return '#22C55E';
  if (value >= 60) return '#F59E0B';
  return '#EF4444';
}

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionLabel({ text, colors }: { text: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>{text}</ThemedText>
  );
}

function QuickActionButton({
  label,
  icon,
  colors,
  accentColor,
  onPress,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
  accentColor: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[s.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
    >
      <IconSymbol name={icon as any} size={16} color={accentColor} />
      <ThemedText style={[s.quickActionLabel, { color: colors.text }]}>{label}</ThemedText>
    </Pressable>
  );
}

function PulseRow({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.pulseRow}>
      <ThemedText style={[s.pulseLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.pulseValue, { color: valueColor ?? colors.text }]}>{value}</ThemedText>
    </View>
  );
}

function ShortcutRow({
  label,
  icon,
  badge,
  colors,
  accentColor,
}: {
  label: string;
  icon: string;
  badge?: number;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <Pressable
      style={[s.shortcutRow, { borderBottomColor: colors.divider }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[s.shortcutIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={icon as any} size={16} color={accentColor} />
      </View>
      <ThemedText style={[s.shortcutLabel, { color: colors.text }]}>{label}</ThemedText>
      {badge != null && badge > 0 && (
        <View style={[s.shortcutBadge, { backgroundColor: accentColor }]}>
          <ThemedText style={s.shortcutBadgeText}>{badge}</ThemedText>
        </View>
      )}
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// ORG PROGRAM TAB (main export)
// =============================================================================

export function OrgProgramTab({ colors, accentColor }: Props) {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const budgetPct = useMemo(() => {
    return Math.round((FINANCE_PULSE.actualSpend / FINANCE_PULSE.budgetTotal) * 100);
  }, []);

  const leaderStaff = useMemo(() => {
    return STAFF_MEMBERS.filter((s) => s.role === 'Head Coach' || s.role === 'Assistant Coach' || s.role === 'Director of Ops');
  }, []);

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      {/* ================================================================= */}
      {/* 1) PROGRAM IDENTITY HEADER                                        */}
      {/* ================================================================= */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.identityRow}>
          <View style={s.identityCircle}>
            <ThemedText style={s.identityInitials}>{PROGRAM_IDENTITY.initials}</ThemedText>
          </View>
          <View style={s.identityInfo}>
            <ThemedText style={[s.identityName, { color: colors.text }]}>
              {PROGRAM_IDENTITY.name}
            </ThemedText>
            <View style={s.badgesRow}>
              <View style={[s.badge, { backgroundColor: accentColor + '15' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>Basketball</ThemedText>
              </View>
              <View style={[s.badge, { backgroundColor: accentColor + '15' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>{PROGRAM_IDENTITY.level}</ThemedText>
              </View>
              <View style={[s.badge, { backgroundColor: accentColor + '15' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>2025–26</ThemedText>
              </View>
              <View style={[s.badge, { backgroundColor: '#22C55E20' }]}>
                <ThemedText style={[s.badgeText, { color: '#22C55E' }]}>Active</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Leadership */}
        <View style={[s.leadershipRow, { borderTopColor: colors.divider }]}>
          {leaderStaff.map((staff) => (
            <View key={staff.id} style={s.leaderChip}>
              <View style={[s.leaderAvatar, { backgroundColor: '#6366F1' }]}>
                <ThemedText style={s.leaderInitials}>{staff.initials}</ThemedText>
              </View>
              <View style={s.leaderMeta}>
                <ThemedText style={[s.leaderName, { color: colors.text }]} numberOfLines={1}>
                  {staff.name}
                </ThemedText>
                <ThemedText style={[s.leaderRole, { color: colors.textTertiary }]} numberOfLines={1}>
                  {staff.role}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Quick actions row */}
        <View style={s.quickActionsRow}>
          <QuickActionButton label="Program Hub" icon="square.grid.2x2.fill" colors={colors} accentColor={accentColor} />
          <QuickActionButton label="Rooms" icon="text.bubble" colors={colors} accentColor={accentColor} />
          <QuickActionButton label="Ops" icon="gearshape.fill" colors={colors} accentColor={accentColor} />
          <QuickActionButton label="Finance" icon="dollarsign.circle.fill" colors={colors} accentColor={accentColor} />
        </View>
      </View>

      {/* ================================================================= */}
      {/* 2.1) PROGRAM SNAPSHOT                                              */}
      {/* ================================================================= */}
      <SectionLabel text="PROGRAM SNAPSHOT" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.snapshotGrid}>
          <View style={s.snapshotStat}>
            <ThemedText style={[s.snapshotValue, { color: accentColor }]}>
              {PROGRAM_SNAPSHOT.rosterTotal}
            </ThemedText>
            <ThemedText style={[s.snapshotStatLabel, { color: colors.textTertiary }]}>Roster</ThemedText>
          </View>
          <View style={s.snapshotStat}>
            <ThemedText style={[s.snapshotValue, { color: accentColor }]}>
              {PROGRAM_SNAPSHOT.staffCount}
            </ThemedText>
            <ThemedText style={[s.snapshotStatLabel, { color: colors.textTertiary }]}>Staff</ThemedText>
          </View>
          <View style={s.snapshotStat}>
            <ThemedText style={[s.snapshotValue, { color: accentColor }]}>
              {PROGRAM_SNAPSHOT.teamsCount}
            </ThemedText>
            <ThemedText style={[s.snapshotStatLabel, { color: colors.textTertiary }]}>Teams</ThemedText>
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.divider }]} />

        {/* Last / Next */}
        <PulseRow label="Last Result" value={TODAY_NEXT.lastResult} colors={colors} />
        <PulseRow label="Next Game" value={`${TODAY_NEXT.nextGame} — ${TODAY_NEXT.nextGameDate}`} colors={colors} />

        <View style={[s.divider, { backgroundColor: colors.divider }]} />

        {/* Roster availability */}
        <ThemedText style={[s.subsectionLabel, { color: colors.textSecondary }]}>
          ROSTER AVAILABILITY
        </ThemedText>
        <View style={s.availabilityRow}>
          <View style={s.availChip}>
            <View style={[s.availDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[s.availText, { color: colors.text }]}>{ROSTER_AVAILABILITY.available}</ThemedText>
            <ThemedText style={[s.availLabel, { color: colors.textTertiary }]}>Available</ThemedText>
          </View>
          <View style={s.availChip}>
            <View style={[s.availDot, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={[s.availText, { color: colors.text }]}>{ROSTER_AVAILABILITY.injured}</ThemedText>
            <ThemedText style={[s.availLabel, { color: colors.textTertiary }]}>Injured</ThemedText>
          </View>
          <View style={s.availChip}>
            <View style={[s.availDot, { backgroundColor: '#EF4444' }]} />
            <ThemedText style={[s.availText, { color: colors.text }]}>{ROSTER_AVAILABILITY.out}</ThemedText>
            <ThemedText style={[s.availLabel, { color: colors.textTertiary }]}>Out</ThemedText>
          </View>
          <View style={s.availChip}>
            <View style={[s.availDot, { backgroundColor: '#8F8F8F' }]} />
            <ThemedText style={[s.availText, { color: colors.text }]}>{ROSTER_AVAILABILITY.redshirt}</ThemedText>
            <ThemedText style={[s.availLabel, { color: colors.textTertiary }]}>RS</ThemedText>
          </View>
        </View>
      </View>

      {/* ================================================================= */}
      {/* 2.2) SYSTEMS & IDENTITY                                            */}
      {/* ================================================================= */}
      <SectionLabel text="SYSTEMS & IDENTITY" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.systemRow}>
          <View style={s.systemItem}>
            <ThemedText style={[s.systemKind, { color: colors.textTertiary }]}>OFFENSE</ThemedText>
            <ThemedText style={[s.systemName, { color: colors.text }]}>
              {PROGRAM_SYSTEMS.offenseSystem}
            </ThemedText>
            {PROGRAM_SYSTEMS.offenseProvisional && (
              <View style={[s.provBadge, { backgroundColor: '#F59E0B20' }]}>
                <ThemedText style={[s.provText, { color: '#F59E0B' }]}>Provisional</ThemedText>
              </View>
            )}
          </View>
          <View style={[s.systemDivider, { backgroundColor: colors.divider }]} />
          <View style={s.systemItem}>
            <ThemedText style={[s.systemKind, { color: colors.textTertiary }]}>DEFENSE</ThemedText>
            <ThemedText style={[s.systemName, { color: colors.text }]}>
              {PROGRAM_SYSTEMS.defenseSystem}
            </ThemedText>
            {PROGRAM_SYSTEMS.defenseProvisional && (
              <View style={[s.provBadge, { backgroundColor: '#F59E0B20' }]}>
                <ThemedText style={[s.provText, { color: '#F59E0B' }]}>Provisional</ThemedText>
              </View>
            )}
          </View>
        </View>

        {PROGRAM_SYSTEMS.notes ? (
          <>
            <View style={[s.divider, { backgroundColor: colors.divider }]} />
            <ThemedText style={[s.systemNotes, { color: colors.textSecondary }]}>
              {PROGRAM_SYSTEMS.notes}
            </ThemedText>
          </>
        ) : null}

        <View style={s.systemActions}>
          <QuickActionButton label="System Fit" icon="chart.bar.fill" colors={colors} accentColor={accentColor} />
          <QuickActionButton label="System Sweep" icon="arrow.triangle.2.circlepath" colors={colors} accentColor={accentColor} />
        </View>
      </View>

      {/* ================================================================= */}
      {/* 2.3) ROSTER CONTROL                                                */}
      {/* ================================================================= */}
      <SectionLabel text="ROSTER CONTROL" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, paddingVertical: 0 }]}>
        <ShortcutRow label="Roster" icon="person.3.fill" badge={PROGRAM_SNAPSHOT.rosterTotal} colors={colors} accentColor={accentColor} />
        <ShortcutRow label="Depth Chart" icon="list.number" colors={colors} accentColor={accentColor} />
        <ShortcutRow label="Recruiting Board" icon="person.badge.plus" badge={24} colors={colors} accentColor={accentColor} />
        <ShortcutRow label="KX Database" icon="cylinder.fill" badge={200} colors={colors} accentColor={accentColor} />
      </View>

      {/* ================================================================= */}
      {/* 2.4) SCHEDULE CONTROL                                              */}
      {/* ================================================================= */}
      <SectionLabel text="SCHEDULE CONTROL" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {UPCOMING_GAMES.map((game, i) => (
          <View key={game.id}>
            <View style={s.gameRow}>
              <View style={[s.gameDot, { backgroundColor: game.location === 'Home' ? '#22C55E' : '#6AA9FF' }]} />
              <View style={s.gameInfo}>
                <ThemedText style={[s.gameName, { color: colors.text }]}>
                  {game.location === 'Home' ? 'vs' : '@'} {game.opponent}
                </ThemedText>
                <ThemedText style={[s.gameMeta, { color: colors.textTertiary }]}>
                  {game.date} · {game.time} · {game.location}
                </ThemedText>
              </View>
            </View>
            {i < UPCOMING_GAMES.length - 1 && (
              <View style={[s.divider, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}

        <View style={[s.divider, { backgroundColor: colors.divider, marginTop: Spacing.sm }]} />
        <View style={s.systemActions}>
          <QuickActionButton label="Schedule" icon="calendar" colors={colors} accentColor={accentColor} />
          <QuickActionButton label="Game Plan" icon="doc.text.fill" colors={colors} accentColor={accentColor} />
        </View>
      </View>

      {/* ================================================================= */}
      {/* 2.5) OPERATIONS PULSE                                              */}
      {/* ================================================================= */}
      <SectionLabel text="OPERATIONS PULSE" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PulseRow
          label="Open P0 tasks"
          value={String(OPS_PULSE.openTasksP0)}
          valueColor={OPS_PULSE.openTasksP0 > 0 ? '#EF4444' : '#22C55E'}
          colors={colors}
        />
        <PulseRow label="Open P1 tasks" value={String(OPS_PULSE.openTasksP1)} colors={colors} />
        {OPS_PULSE.nextTrip && (
          <PulseRow label="Next Trip" value={OPS_PULSE.nextTrip} colors={colors} />
        )}
        <PulseRow label="Facility Issues" value={String(OPS_PULSE.facilityIssues)} valueColor="#22C55E" colors={colors} />
        <View style={[s.divider, { backgroundColor: colors.divider }]} />
        <QuickActionButton label="Open Operations" icon="gearshape.fill" colors={colors} accentColor={accentColor} />
      </View>

      {/* ================================================================= */}
      {/* 2.6) FINANCE PULSE                                                 */}
      {/* ================================================================= */}
      <SectionLabel text="FINANCE PULSE" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PulseRow
          label="Budget vs Actual"
          value={`${formatCurrency(FINANCE_PULSE.actualSpend)} / ${formatCurrency(FINANCE_PULSE.budgetTotal)} (${budgetPct}%)`}
          colors={colors}
        />
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${budgetPct}%`, backgroundColor: getHealthColor(100 - budgetPct) }]} />
        </View>
        <PulseRow label="Pending Approvals" value={String(FINANCE_PULSE.pendingApprovals)} valueColor={FINANCE_PULSE.pendingApprovals > 0 ? '#F59E0B' : '#22C55E'} colors={colors} />
        <PulseRow label="Payables Due Soon" value={String(FINANCE_PULSE.payablesDueSoon)} colors={colors} />
        <View style={[s.divider, { backgroundColor: colors.divider }]} />
        <QuickActionButton label="Open Finance" icon="dollarsign.circle.fill" colors={colors} accentColor={accentColor} />
      </View>

      {/* ================================================================= */}
      {/* 2.7) PAYMENT RAILS PULSE                                           */}
      {/* ================================================================= */}
      <SectionLabel text="PAYMENT RAILS PULSE" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PulseRow label="Recent Collections" value={formatCurrency(PAYMENT_RAILS_PULSE.recentCollections)} colors={colors} />
        <PulseRow label="Pending Payouts" value={String(PAYMENT_RAILS_PULSE.pendingPayouts)} colors={colors} />
        <PulseRow
          label="Settlement Ready"
          value={PAYMENT_RAILS_PULSE.settlementReady ? 'Yes' : 'No'}
          valueColor={PAYMENT_RAILS_PULSE.settlementReady ? '#22C55E' : '#F59E0B'}
          colors={colors}
        />
        <View style={[s.divider, { backgroundColor: colors.divider }]} />
        <QuickActionButton label="Open Payment Rails" icon="creditcard.fill" colors={colors} accentColor={accentColor} />
      </View>

      {/* ================================================================= */}
      {/* 2.8) COMPLIANCE PULSE                                              */}
      {/* ================================================================= */}
      <SectionLabel text="COMPLIANCE PULSE" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PulseRow label="Due Soon" value={String(COMPLIANCE_PULSE.dueSoon)} valueColor={COMPLIANCE_PULSE.dueSoon > 0 ? '#F59E0B' : '#22C55E'} colors={colors} />
        <PulseRow label="Overdue" value={String(COMPLIANCE_PULSE.overdue)} valueColor={COMPLIANCE_PULSE.overdue > 0 ? '#EF4444' : '#22C55E'} colors={colors} />
        <PulseRow label="Training Completion" value={`${COMPLIANCE_PULSE.trainingCompletion}%`} valueColor={getHealthColor(COMPLIANCE_PULSE.trainingCompletion)} colors={colors} />
        <PulseRow label="Open Incidents" value={String(COMPLIANCE_PULSE.openIncidents)} valueColor="#22C55E" colors={colors} />
        <View style={[s.divider, { backgroundColor: colors.divider }]} />
        <QuickActionButton label="Open Compliance" icon="checkmark.shield.fill" colors={colors} accentColor={accentColor} />
      </View>

      {/* ================================================================= */}
      {/* 2.9) ROOMS SHORTCUTS                                               */}
      {/* ================================================================= */}
      <SectionLabel text="ROOMS" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, paddingVertical: 0 }]}>
        {PROGRAM_ROOMS.map((room) => (
          <ShortcutRow
            key={room.id}
            label={room.title}
            icon={room.icon}
            badge={room.unread}
            colors={colors}
            accentColor={accentColor}
          />
        ))}
      </View>
      <Pressable
        style={[s.seeAllBtn, { borderColor: colors.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <ThemedText style={[s.seeAllText, { color: accentColor }]}>See all rooms</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={accentColor} />
      </Pressable>

      {/* ================================================================= */}
      {/* 2.10) AUDIT & SETTINGS                                             */}
      {/* ================================================================= */}
      <SectionLabel text="AUDIT & SETTINGS" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.subsectionLabel, { color: colors.textSecondary }]}>
          RECENT CHANGES
        </ThemedText>
        {AUDIT_LOG.slice(0, 5).map((entry, i) => {
          const meta = AUDIT_ACTION_META[entry.action];
          return (
            <View key={entry.id}>
              <View style={s.auditRow}>
                <View style={[s.auditIcon, { backgroundColor: meta.color + '15' }]}>
                  <IconSymbol name={meta.icon as any} size={14} color={meta.color} />
                </View>
                <View style={s.auditInfo}>
                  <ThemedText style={[s.auditDesc, { color: colors.text }]} numberOfLines={2}>
                    {entry.description}
                  </ThemedText>
                  <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                    {entry.actor} · {entry.timestamp}
                  </ThemedText>
                </View>
              </View>
              {i < 4 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
            </View>
          );
        })}

        <View style={[s.divider, { backgroundColor: colors.divider, marginTop: Spacing.sm }]} />
        <View style={s.systemActions}>
          <QuickActionButton label="View Audit" icon="clock.arrow.circlepath" colors={colors} accentColor={accentColor} />
          <QuickActionButton
            label="Program Settings"
            icon="slider.horizontal.3"
            colors={colors}
            accentColor={accentColor}
            onPress={() => setSettingsVisible(true)}
          />
        </View>
      </View>

      <View style={s.bottomSpacer} />

      {/* Settings sheet */}
      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        colors={colors}
        accentColor={accentColor}
      />
    </ScrollView>
  );
}

// =============================================================================
// SETTINGS BOTTOM SHEET
// =============================================================================

function SettingsSheet({
  visible,
  onClose,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const sections = useMemo(() => {
    const map = new Map<string, ProgramSetting[]>();
    for (const setting of PROGRAM_SETTINGS) {
      const arr = map.get(setting.section) ?? [];
      arr.push(setting);
      map.set(setting.section, arr);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Program Settings" useModal>
      {sections.map(([section, settings]) => (
        <View key={section} style={s.settingsSection}>
          <ThemedText style={[s.settingsSectionTitle, { color: colors.textSecondary }]}>
            {section.toUpperCase()}
          </ThemedText>
          {settings.map((setting) => (
            <View key={setting.id} style={s.settingsRow}>
              <View style={s.settingsInfo}>
                <ThemedText style={[s.settingsLabel, { color: colors.text }]}>
                  {setting.label}
                </ThemedText>
                <ThemedText style={[s.settingsDesc, { color: colors.textTertiary }]}>
                  {setting.description}
                </ThemedText>
              </View>
              {setting.type === 'toggle' ? (
                <Switch
                  value={setting.enabled}
                  trackColor={{ false: colors.backgroundTertiary, true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                  onValueChange={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              ) : (
                <Pressable
                  style={[s.settingsActionBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ))}
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  bottomSpacer: {
    height: 48,
  },

  // -- Card --
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // -- Section label --
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  subsectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },

  // -- Divider --
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },

  // -- Identity header --
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  identityCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B4F8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  identityInfo: {
    flex: 1,
  },
  identityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Leadership --
  leadershipRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  leaderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  leaderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leaderMeta: {
    flex: 1,
  },
  leaderName: {
    fontSize: 13,
    fontWeight: '500',
  },
  leaderRole: {
    fontSize: 11,
  },

  // -- Quick actions --
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Snapshot grid --
  snapshotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  snapshotStat: {
    alignItems: 'center',
  },
  snapshotValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  snapshotStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // -- Availability --
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xs,
  },
  availChip: {
    alignItems: 'center',
    gap: 3,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availText: {
    fontSize: 16,
    fontWeight: '700',
  },
  availLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Systems --
  systemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  systemItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  systemDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.md,
  },
  systemKind: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  systemName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  provBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  provText: {
    fontSize: 10,
    fontWeight: '600',
  },
  systemNotes: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  systemActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // -- Shortcut row --
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  shortcutIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  shortcutBadge: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  shortcutBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },

  // -- Game row --
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  gameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameInfo: {
    flex: 1,
    gap: 2,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '500',
  },
  gameMeta: {
    fontSize: 12,
  },

  // -- Pulse --
  pulseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  pulseLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  pulseValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
    maxWidth: '60%',
    textAlign: 'right',
  },

  // -- Bar --
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },

  // -- See all --
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Audit --
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  auditIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  auditMeta: {
    fontSize: 11,
  },

  // -- Settings sheet --
  settingsSection: {
    marginBottom: Spacing.lg,
  },
  settingsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingsInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  settingsActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
