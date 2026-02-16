/**
 * Business Home — KaNeXT Founder OS Control Room
 * 4 swipeable hub tabs + More overflow (v1 LOCKED)
 * Dashboard | Operations | Projects | Finance + More
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { View, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerMoreHandlers, unregisterMoreHandlers } from '@/utils/global-more';
import { useEnterprise } from '@/context/enterprise-context';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { VideoHeroCard } from '@/components/ui/video-hero-card';
import { DashboardRenderer } from '@/components/dashboard/dashboard-renderer';
import { buildBusinessDashboard } from '@/data/dashboard-payloads';
import {
  POWER_METRICS,
  TODAY_NEXT,
  TOP_3_MOVES,
  ROADMAP_PHASES,
  WEDGES,
  PROOF_ARTIFACTS,
  CAPITAL_ROUNDS,
  PBD_TRANCHES,
  USE_OF_FUNDS,
  BOARD_SEATS,
  DECISION_CLASSES,
  GOVERNANCE_AUDIT_PRINCIPLE,
  DATA_ROOM_DOCS,
  DATA_ROOM_CATEGORIES,
  RAILS_FLOW_STEPS,
  MOCK_TRANSACTIONS,
  DIRECTORY,
  WORKSTREAMS,
  MEETINGS,
  getMetricsForRole,
  getProofForRole,
  getCapitalForRole,
  getDataRoomForRole,
  getDataRoomByCategory,
  type BusinessTab,
  type RoleView,
  type RoadmapPhase,
  type ProofArtifact,
  type PBDTranche,
} from '@/data/mock-business';

const BP = BusinessPalette;

// Business Hub Tabs (v1 LOCKED)
// 4 swipeable pages + "More" overflow trigger
const BIZ_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'operations', label: 'Operations' },
  { id: 'projects', label: 'Projects' },
  { id: 'finance', label: 'Finance' },
];

const BIZ_MORE_ITEMS = [
  { id: 'people', label: 'People' },
  { id: 'sales', label: 'Sales' },
  { id: 'legal', label: 'Legal' },
  { id: 'assets', label: 'Assets' },
  { id: 'reports', label: 'Reports' },
];

// =============================================================================
// HUB TAB BAR
// =============================================================================

function BusinessHubTabs({
  activeTab,
  onTabPress,
  onMorePress,
}: {
  activeTab: number;
  onTabPress: (index: number) => void;
  onMorePress: () => void;
}) {
  const tabScrollRef = useRef<ScrollView>(null);

  return (
    <View style={hubStyles.tabBarContainer}>
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={hubStyles.tabBarContent}
      >
        {BIZ_HUB_TABS.map((tab, index) => {
          const isActive = index === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={hubStyles.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabPress(index);
              }}
            >
              <ThemedText
                style={[
                  hubStyles.tabText,
                  { color: isActive ? BP.champagneGold : BP.ash },
                  isActive && hubStyles.tabTextActive,
                ]}
              >
                {tab.label}
              </ThemedText>
              {isActive && <View style={[hubStyles.tabIndicator, { backgroundColor: BP.champagneGold }]} />}
            </Pressable>
          );
        })}
        {/* More — overflow trigger */}
        <Pressable
          style={hubStyles.tab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onMorePress();
          }}
        >
          <ThemedText style={[hubStyles.tabText, { color: BP.ash }]}>
            More
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const hubStyles = StyleSheet.create({
  tabBarContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  tabBarContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  tab: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabIndicator: {
    height: 2.5,
    borderRadius: 1.5,
    width: '100%',
    marginTop: 4,
  },
});

// =============================================================================
// VIEW AS TOGGLE (RBAC)
// =============================================================================

function ViewAsBar() {
  const { viewAsRole, setViewAsRole, isPBDView, setIsPBDView } = useEnterprise();
  const roles: { id: RoleView; label: string }[] = [
    { id: 'founder', label: 'Founder' },
    { id: 'investor', label: 'Investor' },
    { id: 'public', label: 'Public' },
  ];

  return (
    <View style={viewStyles.container}>
      <View style={viewStyles.pillRow}>
        {roles.map((r) => {
          const isActive = r.id === viewAsRole;
          return (
            <Pressable
              key={r.id}
              style={[
                viewStyles.pill,
                { backgroundColor: isActive ? BP.champagneGold + '20' : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewAsRole(r.id);
                if (r.id !== 'investor') setIsPBDView(false);
              }}
            >
              <ThemedText style={[viewStyles.pillText, { color: isActive ? BP.champagneGold : BP.ash }]}>
                {r.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {viewAsRole === 'investor' && (
        <Pressable
          style={[viewStyles.pdbToggle, { backgroundColor: isPBDView ? BP.champagneGold + '20' : BP.glass }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsPBDView(!isPBDView);
          }}
        >
          <ThemedText style={[viewStyles.pdbText, { color: isPBDView ? BP.champagneGold : BP.ash }]}>
            PBD View
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pdbToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  pdbText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

// =============================================================================
// SHARED CARD WRAPPER
// =============================================================================

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[cardStyles.card, style]}>
      {children}
    </View>
  );
}

function CardTitle({ text }: { text: string }) {
  return <ThemedText style={cardStyles.title}>{text}</ThemedText>;
}



const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: BP.ash,
    marginBottom: Spacing.sm,
  },
});

// =============================================================================
// TAB 1: DASHBOARD
// =============================================================================

function MomentumCard() {
  const milestones = [
    { label: 'Proof Wedges', status: 'active' as const, detail: 'FMU + ICCLA + K-1 deployed' },
    { label: 'Video Mandate', status: 'next' as const, detail: '1,050+ institutions targeted' },
    { label: 'Settlement Rails', status: 'next' as const, detail: 'Ticket/donation/payout rails' },
  ];

  return (
    <Card>
      <CardTitle text="Momentum" />
      <View style={tabStyles.momentumTimeline}>
        {milestones.map((m, i) => {
          const color = m.status === 'done' ? BP.emerald : m.status === 'active' ? BP.champagneGold : BP.ash;
          return (
            <View key={i} style={tabStyles.momentumStep}>
              <View style={tabStyles.momentumTrack}>
                <View style={[tabStyles.momentumDot, { backgroundColor: color, borderColor: color }]}>
                  {m.status === 'done' && <IconSymbol name="checkmark" size={8} color={BP.obsidian} />}
                </View>
                {i < milestones.length - 1 && (
                  <View style={[tabStyles.momentumLine, {
                    backgroundColor: m.status === 'done' ? BP.emerald : BP.graphite,
                  }]} />
                )}
              </View>
              <View style={tabStyles.momentumContent}>
                <ThemedText style={[tabStyles.momentumLabel, { color }]}>{m.label}</ThemedText>
                <ThemedText style={[tabStyles.momentumDetail, { color: BP.ash }]}>{m.detail}</ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function WedgeSnapshot() {
  const wedgeSnaps = [
    { name: 'FMU', icon: 'sportscourt.fill' as const, color: '#FFFFFF', stat: '$53M–$157M', statLabel: 'Media Value Y1' },
    { name: 'ICCLA', icon: 'heart.fill' as const, color: '#B8C0CC', stat: '3', statLabel: 'Campuses' },
    { name: 'K-1', icon: 'flag.checkered' as const, color: '#FF4D4D', stat: '14', statLabel: 'Race Season' },
  ];

  return (
    <Card>
      <CardTitle text="Proof Wedges" />
      <View style={tabStyles.wedgeSnapRow}>
        {wedgeSnaps.map((w) => (
          <View key={w.name} style={[tabStyles.wedgeSnapCard, { borderColor: BP.graphite }]}>
            <View style={[tabStyles.wedgeSnapIcon, { backgroundColor: w.color + '15' }]}>
              <IconSymbol name={w.icon as any} size={18} color={w.color} />
            </View>
            <ThemedText style={[tabStyles.wedgeSnapName, { color: BP.smoke }]}>{w.name}</ThemedText>
            <ThemedText style={[tabStyles.wedgeSnapStat, { color: BP.champagneGold }]}>{w.stat}</ThemedText>
            <ThemedText style={[tabStyles.wedgeSnapLabel, { color: BP.ash }]}>{w.statLabel}</ThemedText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function DashboardTab({ role, isPBD }: { role: RoleView; isPBD: boolean }) {
  const payload = buildBusinessDashboard(role, isPBD);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      <VideoHeroCard
        title="KaNeXT Investor Preview"
        subtitle="Investor Preview — FY 2026"
      />
      <ViewAsBar />
      <DashboardRenderer payload={payload} skipHeroVideo renderAsFragment />
      <AskNexusCTA label="Ask Nexus About KaNeXT" engineContext="business" />
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 2: ROADMAP
// =============================================================================

function RoadmapTab() {
  const [expanded, setExpanded] = useState<string | null>(ROADMAP_PHASES.find(p => p.status === 'active')?.id ?? null);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      <Card>
        <CardTitle text="Phase Ladder" />
        <ThemedText style={[tabStyles.roadmapSub, { color: BP.ash }]}>
          5-phase plan from OS shell to global federation
        </ThemedText>
      </Card>

      {ROADMAP_PHASES.map((phase) => {
        const isExpanded = expanded === phase.id;
        const statusColor = phase.status === 'completed' ? BP.emerald : phase.status === 'active' ? BP.champagneGold : BP.ash;

        return (
          <Pressable
            key={phase.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpanded(isExpanded ? null : phase.id);
            }}
          >
            <Card>
              <View style={tabStyles.phaseHeader}>
                <View style={[tabStyles.phaseBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[tabStyles.phaseBadgeText, { color: statusColor }]}>
                    P{phase.phase}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[tabStyles.phaseTitle, { color: BP.smoke }]}>{phase.title}</ThemedText>
                  <View style={[tabStyles.phaseStatusPill, { backgroundColor: statusColor + '15' }]}>
                    <ThemedText style={[tabStyles.phaseStatusText, { color: statusColor }]}>
                      {phase.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={BP.ash} />
              </View>

              {isExpanded && (
                <View style={tabStyles.phaseExpanded}>
                  <ThemedText style={[tabStyles.phaseObjective, { color: BP.smoke }]}>{phase.objective}</ThemedText>

                  <ThemedText style={[tabStyles.phaseSectionLabel, { color: BP.champagneGold }]}>Deliverables</ThemedText>
                  {phase.deliverables.map((d, i) => (
                    <ThemedText key={i} style={[tabStyles.phaseBullet, { color: BP.ash }]}>  •  {d}</ThemedText>
                  ))}

                  <ThemedText style={[tabStyles.phaseSectionLabel, { color: BP.champagneGold }]}>Proof Artifacts</ThemedText>
                  {phase.proofArtifacts.map((a, i) => (
                    <ThemedText key={i} style={[tabStyles.phaseBullet, { color: BP.ash }]}>  •  {a}</ThemedText>
                  ))}

                  <ThemedText style={[tabStyles.phaseSectionLabel, { color: BP.red }]}>Risks</ThemedText>
                  {phase.risks.map((r, i) => (
                    <ThemedText key={i} style={[tabStyles.phaseBullet, { color: BP.ash }]}>  •  {r}</ThemedText>
                  ))}

                  <ThemedText style={[tabStyles.phaseSectionLabel, { color: BP.emerald }]}>Success Looks Like</ThemedText>
                  <ThemedText style={[tabStyles.phaseSuccess, { color: BP.smoke }]}>{phase.successLooksLike}</ThemedText>
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 3: WEDGES
// =============================================================================

function WedgesTab() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {WEDGES.map((wedge) => (
        <Card key={wedge.id}>
          <View style={tabStyles.wedgeHeader}>
            <View style={[tabStyles.wedgeIcon, { backgroundColor: wedge.color + '20' }]}>
              <IconSymbol name={wedge.icon as any} size={20} color={wedge.color} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[tabStyles.wedgeName, { color: BP.smoke }]}>{wedge.name}</ThemedText>
              <ThemedText style={[tabStyles.wedgeOrg, { color: BP.ash }]}>{wedge.orgName}</ThemedText>
            </View>
          </View>

          <ThemedText style={[tabStyles.wedgeSummary, { color: BP.ash }]}>{wedge.summary}</ThemedText>

          <ThemedText style={[tabStyles.wedgeSectionLabel, { color: BP.champagneGold }]}>Proof Events</ThemedText>
          {wedge.proofEvents.map((e, i) => (
            <ThemedText key={i} style={[tabStyles.wedgeBullet, { color: BP.smoke }]}>  •  {e}</ThemedText>
          ))}

          <ThemedText style={[tabStyles.wedgeSectionLabel, { color: BP.champagneGold }]}>Key Advantages</ThemedText>
          {wedge.advantages.map((a, i) => (
            <ThemedText key={i} style={[tabStyles.wedgeBullet, { color: BP.smoke }]}>  •  {a}</ThemedText>
          ))}

          {wedge.modes && (
            <>
              <ThemedText style={[tabStyles.wedgeSectionLabel, { color: BP.champagneGold }]}>Modes</ThemedText>
              <View style={tabStyles.modesRow}>
                {wedge.modes.map((m) => (
                  <View key={m} style={[tabStyles.modePill, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
                    <ThemedText style={[tabStyles.modePillText, { color: BP.platinum }]}>{m}</ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {wedge.proofArtifact && (
            <Pressable style={[tabStyles.artifactLink, { borderColor: BP.champagneGold + '40' }]}>
              <IconSymbol name="doc.text.fill" size={16} color={BP.champagneGold} />
              <ThemedText style={[tabStyles.artifactLinkText, { color: BP.champagneGold }]}>
                {wedge.proofArtifact.title}
              </ThemedText>
              <IconSymbol name="chevron.right" size={12} color={BP.champagneGold} />
            </Pressable>
          )}
        </Card>
      ))}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 4: PROOF
// =============================================================================

function ProofTab({ role }: { role: RoleView }) {
  const artifacts = getProofForRole(role);
  const sections = [...new Set(artifacts.map((a) => a.section))];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {sections.map((section) => (
        <View key={section}>
          <ThemedText style={[tabStyles.proofSectionTitle, { color: BP.champagneGold }]}>{section}</ThemedText>
          {artifacts.filter((a) => a.section === section).map((artifact) => (
            <Card key={artifact.id}>
              <View style={tabStyles.proofCardHeader}>
                <View style={[tabStyles.proofCategoryBadge, {
                  backgroundColor: artifact.category === 'media' ? BP.champagneGold + '20'
                    : artifact.category === 'postseason' ? BP.emerald + '20'
                    : artifact.category === 'capital' ? BP.platinum + '20'
                    : BP.amber + '20',
                }]}>
                  <ThemedText style={[tabStyles.proofCategoryText, {
                    color: artifact.category === 'media' ? BP.champagneGold
                      : artifact.category === 'postseason' ? BP.emerald
                      : artifact.category === 'capital' ? BP.platinum
                      : BP.amber,
                  }]}>
                    {artifact.category.toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={[tabStyles.proofDate, { color: BP.ash }]}>{artifact.lastUpdated}</ThemedText>
              </View>
              <ThemedText style={[tabStyles.proofTitle, { color: BP.smoke }]}>{artifact.title}</ThemedText>
              <ThemedText style={[tabStyles.proofSubtitle, { color: BP.ash }]}>{artifact.subtitle}</ThemedText>
              {artifact.highlights.slice(0, 3).map((h, i) => (
                <ThemedText key={i} style={[tabStyles.proofHighlight, { color: BP.platinum }]}>  •  {h}</ThemedText>
              ))}
            </Card>
          ))}
        </View>
      ))}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 5: CAPITAL
// =============================================================================

function CapitalTab({ role, isPBD }: { role: RoleView; isPBD: boolean }) {
  const rounds = getCapitalForRole(role);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {/* Capital Rounds */}
      <Card>
        <CardTitle text="Capital Stack" />
        {rounds.map((round) => {
          const statusColor = round.status === 'closed' ? BP.emerald : round.status === 'active' ? BP.champagneGold : BP.ash;
          return (
            <View key={round.id} style={tabStyles.roundRow}>
              <View style={tabStyles.roundHeader}>
                <ThemedText style={[tabStyles.roundName, { color: BP.smoke }]}>{round.name}</ThemedText>
                <View style={[tabStyles.roundStatusPill, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[tabStyles.roundStatusText, { color: statusColor }]}>
                    {round.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[tabStyles.roundInstrument, { color: BP.ash }]}>{round.instrument}</ThemedText>
              {round.target && (
                <View style={tabStyles.roundMetrics}>
                  <View>
                    <ThemedText style={[tabStyles.roundMetricValue, { color: BP.champagneGold }]}>{round.target}</ThemedText>
                    <ThemedText style={[tabStyles.roundMetricLabel, { color: BP.ash }]}>Target</ThemedText>
                  </View>
                  {round.raised && (
                    <View>
                      <ThemedText style={[tabStyles.roundMetricValue, { color: BP.champagneGold }]}>{round.raised}</ThemedText>
                      <ThemedText style={[tabStyles.roundMetricLabel, { color: BP.ash }]}>Raised</ThemedText>
                    </View>
                  )}
                  {round.closingDate && (
                    <View>
                      <ThemedText style={[tabStyles.roundMetricValue, { color: BP.smoke }]}>{round.closingDate}</ThemedText>
                      <ThemedText style={[tabStyles.roundMetricLabel, { color: BP.ash }]}>Close</ThemedText>
                    </View>
                  )}
                </View>
              )}
              <ThemedText style={[tabStyles.roundSummary, { color: BP.ash }]}>{round.summary}</ThemedText>
            </View>
          );
        })}
      </Card>

      {/* PBD Co-Founder View */}
      {isPBD && (
        <>
          <Card>
            <CardTitle text="PBD Tranche Schedule" />
            {PBD_TRANCHES.map((t) => (
              <View key={t.id} style={tabStyles.trancheRow}>
                <View style={[tabStyles.trancheDot, { backgroundColor: t.funded ? BP.emerald : BP.ash }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[tabStyles.trancheName, { color: BP.smoke }]}>
                    Tranche {t.tranche} — {t.amount}
                  </ThemedText>
                  <ThemedText style={[tabStyles.trancheDate, { color: BP.ash }]}>
                    Due: {t.dueDate} · Equity: {t.equityPct}
                  </ThemedText>
                </View>
                <View style={[tabStyles.trancheStatus, { backgroundColor: t.funded ? BP.emerald + '20' : BP.glass }]}>
                  <ThemedText style={[tabStyles.trancheStatusText, { color: t.funded ? BP.emerald : BP.ash }]}>
                    {t.funded ? 'FUNDED' : 'PENDING'}
                  </ThemedText>
                </View>
              </View>
            ))}

            {/* Equity Progress */}
            <View style={tabStyles.equityProgressRow}>
              <ThemedText style={[tabStyles.equityLabel, { color: BP.ash }]}>Equity to Date</ThemedText>
              <ThemedText style={[tabStyles.equityValue, { color: BP.champagneGold }]}>0% → 10%</ThemedText>
            </View>
            <View style={[tabStyles.equityBar, { backgroundColor: BP.glass }]}>
              <View style={[tabStyles.equityFill, { backgroundColor: BP.champagneGold, width: '0%' }]} />
            </View>
          </Card>

          <Card>
            <CardTitle text="Board Seat Activation" />
            <View style={tabStyles.boardSeatRow}>
              <View style={[tabStyles.boardSeatDot, { backgroundColor: BP.amber }]} />
              <ThemedText style={[tabStyles.boardSeatText, { color: BP.smoke }]}>
                Seat 2 activates at tranche threshold
              </ThemedText>
            </View>
            <ThemedText style={[tabStyles.boardSeatStatus, { color: BP.ash }]}>
              Status: Pending — awaiting Tranche 1 funding
            </ThemedText>
          </Card>

          <Card>
            <CardTitle text="Distribution Flywheel" />
            {['Valuetainment coverage hooks', 'Proof events calendar', 'Owned media pipeline'].map((item, i) => (
              <View key={i} style={tabStyles.flywheelRow}>
                <View style={[tabStyles.flywheelDot, { backgroundColor: BP.champagneGold }]} />
                <ThemedText style={[tabStyles.flywheelText, { color: BP.smoke }]}>{item}</ThemedText>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Use of Funds (Founder only) */}
      {role === 'founder' && (
        <Card>
          <CardTitle text="Use of Funds" />
          {USE_OF_FUNDS.map((uof) => (
            <View key={uof.id} style={tabStyles.uofRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[tabStyles.uofBucket, { color: BP.smoke }]}>{uof.bucket}</ThemedText>
                <ThemedText style={[tabStyles.uofAlloc, { color: BP.ash }]}>{uof.allocation}</ThemedText>
              </View>
              <View style={tabStyles.uofBarWrap}>
                <View style={[tabStyles.uofBarBg, { backgroundColor: BP.glass }]}>
                  <View style={[tabStyles.uofBarFill, { backgroundColor: BP.champagneGold, width: `${uof.pct}%` }]} />
                </View>
                <ThemedText style={[tabStyles.uofPct, { color: BP.champagneGold }]}>{uof.pct}%</ThemedText>
              </View>
            </View>
          ))}
        </Card>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 6: GOVERNANCE
// =============================================================================

function GovernanceTab({ role }: { role: RoleView }) {
  if (role === 'public') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
        <Card>
          <View style={tabStyles.emptyState}>
            <IconSymbol name="lock.fill" size={32} color={BP.ash} />
            <ThemedText style={[tabStyles.emptyTitle, { color: BP.smoke }]}>Governance</ThemedText>
            <ThemedText style={[tabStyles.emptyText, { color: BP.ash }]}>
              Governance details are visible to Founder and Investor views.
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {/* Board Composition */}
      <Card>
        <CardTitle text="Board Composition" />
        {BOARD_SEATS.map((seat) => {
          const statusColor = seat.status === 'active' ? BP.emerald : seat.status === 'pending' ? BP.amber : BP.ash;
          return (
            <View key={seat.id} style={tabStyles.seatRow}>
              <View style={[tabStyles.seatDot, { backgroundColor: statusColor }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[tabStyles.seatTitle, { color: BP.smoke }]}>{seat.title}</ThemedText>
                <ThemedText style={[tabStyles.seatHolder, { color: BP.champagneGold }]}>{seat.holder}</ThemedText>
                <ThemedText style={[tabStyles.seatDesc, { color: BP.ash }]}>{seat.description}</ThemedText>
              </View>
              <View style={[tabStyles.seatStatus, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[tabStyles.seatStatusText, { color: statusColor }]}>
                  {seat.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </Card>

      {/* Decision Classes */}
      <Card>
        <CardTitle text="Decision Classes" />
        {DECISION_CLASSES.map((dc) => (
          <View key={dc.id} style={tabStyles.decisionRow}>
            <ThemedText style={[tabStyles.decisionName, { color: BP.smoke }]}>{dc.name}</ThemedText>
            <ThemedText style={[tabStyles.decisionDesc, { color: BP.ash }]}>{dc.description}</ThemedText>
            {dc.requiresBoard && (
              <View style={[tabStyles.requiresBoardPill, { backgroundColor: BP.amber + '15' }]}>
                <ThemedText style={[tabStyles.requiresBoardText, { color: BP.amber }]}>REQUIRES BOARD</ThemedText>
              </View>
            )}
          </View>
        ))}
      </Card>

      {/* Audit Principle */}
      <Card>
        <CardTitle text="Audit Principle" />
        <View style={[tabStyles.auditCard, { borderLeftColor: BP.champagneGold }]}>
          <ThemedText style={[tabStyles.auditText, { color: BP.smoke }]}>{GOVERNANCE_AUDIT_PRINCIPLE}</ThemedText>
        </View>
      </Card>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 7: DATA ROOM
// =============================================================================

function DataRoomTab({ role }: { role: RoleView }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const docs = getDataRoomByCategory(role, activeCategory as any);

  const fileTypeIcon = (ft: string) => {
    switch (ft) {
      case 'pdf': return 'doc.fill';
      case 'docx': return 'doc.text.fill';
      case 'xlsx': return 'tablecells';
      case 'deck': return 'rectangle.stack.fill';
      default: return 'doc.fill';
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
        <View style={tabStyles.filterRow}>
          {DATA_ROOM_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <Pressable
                key={cat.id}
                style={[tabStyles.filterPill, { backgroundColor: isActive ? BP.champagneGold + '20' : BP.glass, borderColor: isActive ? BP.champagneGold + '40' : BP.graphite }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat.id);
                }}
              >
                <ThemedText style={[tabStyles.filterPillText, { color: isActive ? BP.champagneGold : BP.ash }]}>
                  {cat.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Document List */}
      {docs.map((doc) => (
        <Pressable key={doc.id} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
          <Card>
            <View style={tabStyles.docRow}>
              <View style={[tabStyles.docIcon, { backgroundColor: BP.champagneGold + '15' }]}>
                <IconSymbol name={fileTypeIcon(doc.fileType) as any} size={18} color={BP.champagneGold} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[tabStyles.docTitle, { color: BP.smoke }]} numberOfLines={1}>{doc.title}</ThemedText>
                <View style={tabStyles.docMetaRow}>
                  <View style={[tabStyles.docCategoryPill, { backgroundColor: BP.glass }]}>
                    <ThemedText style={[tabStyles.docCategoryText, { color: BP.platinum }]}>
                      {doc.category.toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={[tabStyles.docDate, { color: BP.ash }]}>{doc.lastUpdated}</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={14} color={BP.ash} />
            </View>
          </Card>
        </Pressable>
      ))}

      {docs.length === 0 && (
        <Card>
          <View style={tabStyles.emptyState}>
            <IconSymbol name="doc.fill" size={32} color={BP.ash} />
            <ThemedText style={[tabStyles.emptyText, { color: BP.ash }]}>No documents for this view.</ThemedText>
          </View>
        </Card>
      )}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 8: RAILS
// =============================================================================

function RailsTab() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {/* Rails Flow Diagram */}
      <Card>
        <CardTitle text="Settlement Architecture" />
        <View style={tabStyles.railsFlow}>
          {RAILS_FLOW_STEPS.map((step, i) => (
            <View key={step.id}>
              <View style={tabStyles.railsStepRow}>
                <View style={[tabStyles.railsStepNum, { backgroundColor: BP.champagneGold + '20' }]}>
                  <ThemedText style={[tabStyles.railsStepNumText, { color: BP.champagneGold }]}>{i + 1}</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[tabStyles.railsStepName, { color: BP.smoke }]}>{step.step}</ThemedText>
                  <ThemedText style={[tabStyles.railsStepDesc, { color: BP.ash }]}>{step.description}</ThemedText>
                </View>
              </View>
              {i < RAILS_FLOW_STEPS.length - 1 && (
                <View style={[tabStyles.railsConnector, { borderLeftColor: BP.champagneGold + '30' }]} />
              )}
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <CardTitle text="Transaction Feed" />
        {MOCK_TRANSACTIONS.map((tx, i) => {
          const isIncome = tx.amount > 0;
          return (
            <View key={tx.id} style={[tabStyles.txRow, i < MOCK_TRANSACTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite }]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[tabStyles.txDesc, { color: BP.smoke }]} numberOfLines={1}>{tx.description}</ThemedText>
                <View style={tabStyles.txMetaRow}>
                  <ThemedText style={[tabStyles.txOrg, { color: BP.ash }]}>{tx.org}</ThemedText>
                  <ThemedText style={[tabStyles.txDate, { color: BP.ash }]}> · {tx.date}</ThemedText>
                  <View style={[tabStyles.txStatusPill, { backgroundColor: tx.status === 'settled' ? BP.emerald + '15' : tx.status === 'pending' ? BP.amber + '15' : BP.red + '15' }]}>
                    <ThemedText style={[tabStyles.txStatusText, { color: tx.status === 'settled' ? BP.emerald : tx.status === 'pending' ? BP.amber : BP.red }]}>
                      {tx.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <ThemedText style={[tabStyles.txAmount, { color: isIncome ? BP.emerald : BP.red }]}>
                {isIncome ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
              </ThemedText>
            </View>
          );
        })}
      </Card>

      {/* Processor Strategy */}
      <Card>
        <CardTitle text="Processor Strategy" />
        <View style={tabStyles.processorRow}>
          <View style={[tabStyles.processorPhase, { borderColor: BP.champagneGold + '40' }]}>
            <ThemedText style={[tabStyles.processorLabel, { color: BP.champagneGold }]}>v1</ThemedText>
            <ThemedText style={[tabStyles.processorText, { color: BP.smoke }]}>Orchestrate via external processors</ThemedText>
          </View>
          <View style={[tabStyles.processorPhase, { borderColor: BP.ash + '40' }]}>
            <ThemedText style={[tabStyles.processorLabel, { color: BP.ash }]}>v2+</ThemedText>
            <ThemedText style={[tabStyles.processorText, { color: BP.ash }]}>KaNeXT rails expansion (roadmap)</ThemedText>
          </View>
        </View>
      </Card>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TAB 9: OPS
// =============================================================================

function OpsTab({ role }: { role: RoleView }) {
  const [activeOpsTab, setActiveOpsTab] = useState<'directory' | 'workstreams' | 'meetings'>('directory');

  if (role === 'public') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
        <Card>
          <View style={tabStyles.emptyState}>
            <IconSymbol name="lock.fill" size={32} color={BP.ash} />
            <ThemedText style={[tabStyles.emptyTitle, { color: BP.smoke }]}>Operations</ThemedText>
            <ThemedText style={[tabStyles.emptyText, { color: BP.ash }]}>
              Operations are visible to Founder and Investor views.
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    );
  }

  const opsTabs = [
    { id: 'directory' as const, label: 'Directory' },
    { id: 'workstreams' as const, label: 'Workstreams' },
    { id: 'meetings' as const, label: 'Meetings' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scrollContent}>
      {/* Ops sub-tabs */}
      <View style={tabStyles.opsTabRow}>
        {opsTabs.map((t) => {
          const isActive = t.id === activeOpsTab;
          return (
            <Pressable
              key={t.id}
              style={[tabStyles.opsTab, { backgroundColor: isActive ? BP.champagneGold + '20' : BP.glass, borderColor: isActive ? BP.champagneGold + '40' : BP.graphite }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveOpsTab(t.id);
              }}
            >
              <ThemedText style={[tabStyles.opsTabText, { color: isActive ? BP.champagneGold : BP.ash }]}>
                {t.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Directory */}
      {activeOpsTab === 'directory' && (
        <Card>
          <CardTitle text="Directory" />
          {DIRECTORY.map((entry, i) => {
            const statusColor = entry.status === 'active' ? BP.emerald : entry.status === 'advisor' ? BP.platinum : BP.amber;
            return (
              <View key={entry.id} style={[tabStyles.dirRow, i < DIRECTORY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite }]}>
                <View style={[tabStyles.dirAvatar, { backgroundColor: BP.glass }]}>
                  <ThemedText style={[tabStyles.dirInitials, { color: BP.platinum }]}>
                    {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[tabStyles.dirName, { color: BP.smoke }]}>{entry.name}</ThemedText>
                  <ThemedText style={[tabStyles.dirRole, { color: BP.ash }]}>{entry.role}</ThemedText>
                </View>
                <View style={[tabStyles.dirStatusDot, { backgroundColor: statusColor }]} />
              </View>
            );
          })}
        </Card>
      )}

      {/* Workstreams */}
      {activeOpsTab === 'workstreams' && (
        <Card>
          <CardTitle text="Workstreams" />
          {WORKSTREAMS.map((ws) => {
            const statusColor = ws.status === 'active' ? BP.emerald : ws.status === 'blocked' ? BP.red : BP.platinum;
            return (
              <View key={ws.id} style={tabStyles.wsRow}>
                <View style={tabStyles.wsHeader}>
                  <ThemedText style={[tabStyles.wsName, { color: BP.smoke }]}>{ws.name}</ThemedText>
                  <ThemedText style={[tabStyles.wsItems, { color: BP.ash }]}>{ws.items} items</ThemedText>
                </View>
                <View style={[tabStyles.wsBarBg, { backgroundColor: BP.glass }]}>
                  <View style={[tabStyles.wsBarFill, { backgroundColor: statusColor, width: `${ws.progress}%` }]} />
                </View>
                <ThemedText style={[tabStyles.wsProgress, { color: BP.ash }]}>{ws.progress}% · {ws.lead}</ThemedText>
              </View>
            );
          })}
        </Card>
      )}

      {/* Meetings */}
      {activeOpsTab === 'meetings' && (
        <Card>
          <CardTitle text="Meetings" />
          {MEETINGS.map((mtg) => (
            <View key={mtg.id} style={tabStyles.mtgRow}>
              <View style={[tabStyles.mtgDot, { backgroundColor: mtg.status === 'completed' ? BP.emerald : BP.champagneGold }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[tabStyles.mtgTitle, { color: BP.smoke }]}>{mtg.title}</ThemedText>
                <ThemedText style={[tabStyles.mtgDate, { color: BP.ash }]}>{mtg.date}</ThemedText>
                <ThemedText style={[tabStyles.mtgAttendees, { color: BP.ash }]}>
                  {mtg.attendees.join(', ')}
                </ThemedText>
              </View>
              {mtg.decisions > 0 && (
                <View style={[tabStyles.mtgDecisions, { backgroundColor: BP.champagneGold + '20' }]}>
                  <ThemedText style={[tabStyles.mtgDecisionsText, { color: BP.champagneGold }]}>
                    {mtg.decisions}
                  </ThemedText>
                </View>
              )}
            </View>
          ))}
        </Card>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessHome() {
  const [activeTab, setActiveTab] = useState(0);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  // Register global More handlers so Org double-tap can open this menu
  useFocusEffect(
    useCallback(() => {
      registerMoreHandlers(
        () => setMoreMenuVisible(true),
        () => setMoreMenuVisible(false)
      );
      return () => unregisterMoreHandlers();
    }, [])
  );

  const pagerRef = useRef<PagerView>(null);
  const insets = useSafeAreaInsets();
  const { viewAsRole, isPBDView } = useEnterprise();

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={mainStyles.container}>
      <BusinessHubTabs activeTab={activeTab} onTabPress={handleTabPress} onMorePress={() => setMoreMenuVisible(true)} />
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        <View key="dashboard" style={{ flex: 1 }}>
          <DashboardTab role={viewAsRole} isPBD={isPBDView} />
        </View>
        <View key="operations" style={{ flex: 1 }}>
          <OpsTab role={viewAsRole} />
        </View>
        <View key="projects" style={{ flex: 1 }}>
          <RoadmapTab />
        </View>
        <View key="finance" style={{ flex: 1 }}>
          <CapitalTab role={viewAsRole} isPBD={isPBDView} />
        </View>
      </PagerView>

      {/* ===== MORE OVERFLOW MENU ===== */}
      <BottomSheet visible={moreMenuVisible} onClose={() => setMoreMenuVisible(false)}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }}>More</ThemedText>
          {BIZ_MORE_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 4,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: BP.graphite,
              }, pressed && { opacity: 0.6 }]}
              onPress={() => setMoreMenuVisible(false)}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: '500', color: BP.smoke }}>{item.label}</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={BP.ash} />
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

// =============================================================================
// MAIN STYLES
// =============================================================================

const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BP.obsidian,
  },
});

// =============================================================================
// TAB CONTENT STYLES
// =============================================================================

const tabStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // Momentum
  momentumTimeline: {
    gap: 0,
  },
  momentumStep: {
    flexDirection: 'row',
    minHeight: 48,
  },
  momentumTrack: {
    width: 24,
    alignItems: 'center',
  },
  momentumDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentumLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
  },
  momentumContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  momentumLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  momentumDetail: {
    fontSize: 12,
    marginTop: 2,
  },

  // Wedge Snapshot
  wedgeSnapRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  wedgeSnapCard: {
    flex: 1,
    backgroundColor: BP.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  wedgeSnapIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  wedgeSnapName: {
    fontSize: 13,
    fontWeight: '700',
  },
  wedgeSnapStat: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  wedgeSnapLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
    textAlign: 'center',
  },

  // Dashboard
  statusStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '500' },
  statusSub: { fontSize: 12, marginTop: 2 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricTile: { width: '47%', flexGrow: 1, backgroundColor: BP.glass, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  metricLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2, textAlign: 'center' },
  metricDelta: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  todayDot: { width: 8, height: 8, borderRadius: 4 },
  todayTitle: { fontSize: 14, fontWeight: '500' },
  todayTime: { fontSize: 12, marginTop: 1 },
  todayTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  todayTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  moveRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  moveNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  moveNumText: { fontSize: 12, fontWeight: '700' },
  moveText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Roadmap
  roadmapSub: { fontSize: 13, marginTop: -4 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  phaseBadge: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  phaseBadgeText: { fontSize: 13, fontWeight: '700' },
  phaseTitle: { fontSize: 15, fontWeight: '600' },
  phaseStatusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, marginTop: 4 },
  phaseStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  phaseExpanded: { marginTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BP.graphite, paddingTop: Spacing.md },
  phaseObjective: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  phaseSectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.sm, marginBottom: 4 },
  phaseBullet: { fontSize: 13, lineHeight: 20 },
  phaseSuccess: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },

  // Wedges
  wedgeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  wedgeIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  wedgeName: { fontSize: 18, fontWeight: '700' },
  wedgeOrg: { fontSize: 12, marginTop: 1 },
  wedgeSummary: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.sm },
  wedgeSectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.sm, marginBottom: 4 },
  wedgeBullet: { fontSize: 13, lineHeight: 20 },
  modesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  modePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  modePillText: { fontSize: 11, fontWeight: '600' },
  artifactLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md, paddingVertical: 10, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1 },
  artifactLinkText: { flex: 1, fontSize: 13, fontWeight: '600' },

  // Proof
  proofSectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  proofCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  proofCategoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  proofCategoryText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  proofDate: { fontSize: 11 },
  proofTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  proofSubtitle: { fontSize: 13, marginBottom: Spacing.sm },
  proofHighlight: { fontSize: 12, lineHeight: 18 },

  // Capital
  roundRow: { paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite },
  roundHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundName: { fontSize: 15, fontWeight: '600' },
  roundStatusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  roundStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  roundInstrument: { fontSize: 12, marginTop: 2 },
  roundMetrics: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.sm },
  roundMetricValue: { fontSize: 18, fontWeight: '700' },
  roundMetricLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },
  roundSummary: { fontSize: 13, lineHeight: 18, marginTop: Spacing.sm },

  // PBD
  trancheRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  trancheDot: { width: 10, height: 10, borderRadius: 5 },
  trancheName: { fontSize: 14, fontWeight: '500' },
  trancheDate: { fontSize: 12, marginTop: 1 },
  trancheStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  trancheStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  equityProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  equityLabel: { fontSize: 12 },
  equityValue: { fontSize: 14, fontWeight: '700' },
  equityBar: { height: 6, borderRadius: 3, marginTop: 6 },
  equityFill: { height: 6, borderRadius: 3 },
  boardSeatRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  boardSeatDot: { width: 10, height: 10, borderRadius: 5 },
  boardSeatText: { fontSize: 14 },
  boardSeatStatus: { fontSize: 13, marginTop: Spacing.sm },
  flywheelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  flywheelDot: { width: 6, height: 6, borderRadius: 3 },
  flywheelText: { fontSize: 14 },

  // Use of Funds
  uofRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  uofBucket: { fontSize: 13, fontWeight: '500' },
  uofAlloc: { fontSize: 11, marginTop: 1 },
  uofBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 120 },
  uofBarBg: { flex: 1, height: 4, borderRadius: 2 },
  uofBarFill: { height: 4, borderRadius: 2 },
  uofPct: { fontSize: 11, fontWeight: '700', width: 30, textAlign: 'right' },

  // Governance
  seatRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite },
  seatDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  seatTitle: { fontSize: 13, fontWeight: '600' },
  seatHolder: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  seatDesc: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  seatStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  seatStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  decisionRow: { paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite },
  decisionName: { fontSize: 14, fontWeight: '600' },
  decisionDesc: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  requiresBoardPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, marginTop: 6 },
  requiresBoardText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  auditCard: { borderLeftWidth: 3, paddingLeft: Spacing.md, paddingVertical: Spacing.sm },
  auditText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },

  // Data Room
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  docIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontWeight: '500' },
  docMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  docCategoryPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  docCategoryText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  docDate: { fontSize: 11 },

  // Rails
  railsFlow: {},
  railsStepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  railsStepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  railsStepNumText: { fontSize: 12, fontWeight: '700' },
  railsStepName: { fontSize: 14, fontWeight: '600' },
  railsStepDesc: { fontSize: 12 },
  railsConnector: { borderLeftWidth: 1.5, height: 16, marginLeft: 14 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  txDesc: { fontSize: 13, fontWeight: '500' },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  txOrg: { fontSize: 11 },
  txDate: { fontSize: 11 },
  txStatusPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm, marginLeft: Spacing.sm },
  txStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  txAmount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  processorRow: { flexDirection: 'row', gap: Spacing.sm },
  processorPhase: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.sm },
  processorLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  processorText: { fontSize: 12, lineHeight: 18 },

  // Ops
  opsTabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  opsTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1 },
  opsTabText: { fontSize: 13, fontWeight: '600' },
  dirRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  dirAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dirInitials: { fontSize: 13, fontWeight: '700' },
  dirName: { fontSize: 14, fontWeight: '500' },
  dirRole: { fontSize: 12, marginTop: 1 },
  dirStatusDot: { width: 8, height: 8, borderRadius: 4 },
  wsRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite },
  wsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wsName: { fontSize: 14, fontWeight: '500' },
  wsItems: { fontSize: 11 },
  wsBarBg: { height: 4, borderRadius: 2, marginTop: 8 },
  wsBarFill: { height: 4, borderRadius: 2 },
  wsProgress: { fontSize: 11, marginTop: 4 },
  mtgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BP.graphite },
  mtgDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  mtgTitle: { fontSize: 14, fontWeight: '500' },
  mtgDate: { fontSize: 12, marginTop: 1 },
  mtgAttendees: { fontSize: 11, marginTop: 2 },
  mtgDecisions: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mtgDecisionsText: { fontSize: 12, fontWeight: '700' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: Spacing.sm },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
