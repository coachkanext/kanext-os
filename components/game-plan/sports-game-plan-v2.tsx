/**
 * Sports Game Plan V2 — Full Game Plan OS (7 RBAC-gated tabs)
 * Tabs: Overview, Offense, Defense, Matchups, Rotation, Scout, Staff
 * Opponent selector at top — all tabs re-render when opponent changes.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';
import { getSportsRole, getGamePlanHubTabs, getKRVisibility, formatKR, type GamePlanTab } from '@/utils/sports-rbac';
import { getKRColor } from '@/utils/kr-display';
import { openPlayerCard } from '@/utils/global-entity-sheets';

import {
  GAME_PLANS,
  type FullGamePlan,
  type KeyMatchup,
  type RotationSlot,
  type ScoutNote,
  type StaffAssignment,
} from '@/data/mock-game-plan-v2';

const STATUS_COLORS: Record<string, string> = {
  draft: '#9C9790',
  'in-review': '#B8943E',
  locked: '#5A8A6E',
  archived: '#52525B',
};

export function SportsGamePlanV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const membershipId = useMembershipId();
  const role = getSportsRole(membershipId);
  const krVis = getKRVisibility(role);
  const tabs = useMemo(() => getGamePlanHubTabs(role), [role]);
  const [activeTab, setActiveTab] = useState<GamePlanTab>(tabs[0]?.key ?? 'overview');

  // Opponent selector — index into GAME_PLANS
  const [planIndex, setPlanIndex] = useState(0);
  const plan = GAME_PLANS[planIndex] ?? GAME_PLANS[0];
  const h = plan.header;

  // Opponent dropdown
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Opponent Selector */}
      <View style={styles.selectorRow}>
        <Pressable
          style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setDropOpen(!dropOpen)}
        >
          <Text style={[styles.selectorText, { color: colors.text }]}>vs {h.opponent}</Text>
          <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
        </Pressable>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[h.status] + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[h.status] }]}>{h.status.toUpperCase()}</Text>
        </View>
      </View>
      {dropOpen && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {GAME_PLANS.map((gp, i) => (
            <Pressable
              key={gp.header.id}
              style={[styles.dropdownItem, i === planIndex && { backgroundColor: accent + '18' }]}
              onPress={() => { setPlanIndex(i); setDropOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>vs {gp.header.opponent}</Text>
              <Text style={[styles.dropdownItemMeta, { color: colors.textSecondary }]}>{gp.header.date} · {gp.header.status}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {tabs.map((t) => (
          <Pressable key={t.key} style={[styles.pill, activeTab === t.key && { backgroundColor: accent }]} onPress={() => setActiveTab(t.key)}>
            <Text style={[styles.pillText, { color: activeTab === t.key ? '#000' : colors.textSecondary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab plan={plan} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'offense' && <OffenseTab plan={plan} colors={colors} accent={accent} />}
      {activeTab === 'defense' && <DefenseTab plan={plan} colors={colors} accent={accent} />}
      {activeTab === 'matchups' && <MatchupsTab plan={plan} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'rotation' && <RotationTab plan={plan} colors={colors} accent={accent} />}
      {activeTab === 'scout' && <ScoutTab plan={plan} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'staff' && <StaffTab plan={plan} colors={colors} accent={accent} />}
    </View>
  );
}

type TabProps = { plan: FullGamePlan; colors: typeof Colors.light; accent: string; krVis?: string };

// Opponent KR derived from pregame data (mock)
function getOppKR(plan: FullGamePlan): number {
  // Derive from win pct — higher win% = weaker opponent
  return Math.max(55, Math.min(85, Math.round(100 - plan.header.simWinPct * 0.6)));
}

function getOppSystems(plan: FullGamePlan): { off: string; def: string } {
  // Derive from scout notes
  const notes = plan.scoutNotes;
  const tendencyNote = notes.find(n => n.category === 'tendency');
  const defNote = tendencyNote?.title ?? 'Man-to-Man';
  return {
    off: defNote.includes('PnR') ? 'Spread PnR' : defNote.includes('Zone') ? 'Zone Motion' : 'Dribble Drive',
    def: plan.defense.primarySystem === 'Pack Line' ? 'Pressure Man' : 'Containment Man',
  };
}

// ─── Tab 1: Overview ───
function OverviewTab({ plan, colors, accent, krVis }: TabProps) {
  const h = plan.header;
  const oppKR = getOppKR(plan);
  const oppSys = getOppSystems(plan);
  const fmuKR = 74;
  const winPctColor = h.simWinPct >= 60 ? '#5A8A6E' : h.simWinPct >= 45 ? '#B8943E' : '#B85C5C';

  // Key matchup advantages
  const advantages = plan.matchups.filter(m => m.advantageRating > 0).slice(0, 4).map(m => m.notes);
  const scoutConf = plan.scoutNotes.filter(n => n.confidence === 'high').length;
  const totalNotes = plan.scoutNotes.length;
  const confPct = Math.round((scoutConf / Math.max(1, totalNotes)) * 100);
  const confSource = totalNotes > 3 ? 'Synergy + Film' : totalNotes > 1 ? 'Box-Score + Film' : 'Box-Score Only';

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Matchup Header */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.matchupHeader}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>KaNeXT</Text>
            <Text style={[styles.teamRecord, { color: colors.textSecondary }]}>22-8</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.vsText, { color: colors.textTertiary }]}>VS</Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>{h.date}</Text>
            <Text style={[styles.venueText, { color: colors.textTertiary }]}>{h.location}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>{h.opponent}</Text>
            <Text style={[styles.teamRecord, { color: colors.textSecondary }]}>—</Text>
          </View>
        </View>
      </View>

      {/* Win Probability Bar */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>WIN PROBABILITY</Text>
        <View style={styles.winProbRow}>
          <View style={styles.winProbBarBg}>
            <View style={[styles.winProbBarFill, { width: `${h.simWinPct}%`, backgroundColor: winPctColor }]} />
          </View>
          <Text style={[styles.winProbPct, { color: winPctColor }]}>{h.simWinPct}%</Text>
        </View>
        <View style={styles.rangeRow}>
          <Text style={[styles.rangeText, { color: colors.textTertiary }]}>Low {Math.max(35, h.simWinPct - 8)}%</Text>
          <Text style={[styles.rangeText, { color: colors.textTertiary }]}>Base {h.simWinPct}%</Text>
          <Text style={[styles.rangeText, { color: colors.textTertiary }]}>High {Math.min(92, h.simWinPct + 8)}%</Text>
        </View>
      </View>

      {/* Side-by-Side Comparison */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>COMPARISON</Text>
        <CompareRow label="Team KR" fmu={`${fmuKR}`} opp={krVis === 'hidden' ? '—' : `${oppKR}`} fmuColor={getKRColor(fmuKR)} oppColor={getKRColor(oppKR)} colors={colors} />
        <CompareRow label="Offense" fmu={plan.offense.primarySystem} opp={oppSys.off} colors={colors} />
        <CompareRow label="Defense" fmu={plan.defense.primarySystem} opp={oppSys.def} colors={colors} />
        <CompareRow label="Tempo" fmu={plan.offense.tempoTarget} opp="Moderate" colors={colors} />
        <CompareRow label="Pace" fmu={`${plan.offense.paceTarget}`} opp="68" colors={colors} />
        <CompareRow label="Sim Margin" fmu={`+${h.simMargin}`} opp="" colors={colors} fmuColor="#5A8A6E" />
      </View>

      {/* Key Matchup Advantages */}
      {advantages.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>KEY ADVANTAGES</Text>
          {advantages.map((adv, i) => (
            <View key={i} style={styles.advantageRow}>
              <Text style={[styles.advantageDot, { color: '#5A8A6E' }]}>●</Text>
              <Text style={[styles.advantageText, { color: colors.text }]}>{adv}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Scouting Confidence */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SCOUTING CONFIDENCE</Text>
        <View style={styles.confRow}>
          <Text style={[styles.confPct, { color: confPct >= 70 ? '#5A8A6E' : confPct >= 50 ? '#B8943E' : '#B85C5C' }]}>{confPct}%</Text>
          <Text style={[styles.confSource, { color: colors.textSecondary }]}>{confSource}</Text>
        </View>
        <Text style={[styles.confDetail, { color: colors.textTertiary }]}>{scoutConf} of {totalNotes} scout notes rated high confidence</Text>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function CompareRow({ label, fmu, opp, fmuColor, oppColor, colors }: { label: string; fmu: string; opp: string; fmuColor?: string; oppColor?: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.compareRow}>
      <Text style={[styles.compareLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.compareValue, { color: fmuColor ?? colors.text }]}>{fmu}</Text>
      <Text style={[styles.compareSep, { color: colors.textTertiary }]}>vs</Text>
      <Text style={[styles.compareValue, { color: oppColor ?? colors.text }]}>{opp || '—'}</Text>
    </View>
  );
}

// ─── Tab 2: Offense ───
function OffenseTab({ plan, colors, accent }: TabProps) {
  const off = plan.offense;
  const oppSys = getOppSystems(plan);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Opponent defensive system */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OPPONENT DEFENSE</Text>
        <Text style={[styles.systemName, { color: colors.text }]}>{oppSys.def}</Text>
        <Text style={[styles.systemMeta, { color: colors.textTertiary }]}>Confidence: High (Synergy data)</Text>
      </View>

      {/* System × System Interaction */}
      <View style={[styles.card, { backgroundColor: '#0B0F14', borderColor: accent + '33' }]}>
        <Text style={[styles.sectionLabel, { color: accent }]}>SYSTEM × SYSTEM</Text>
        <Text style={[styles.interactionText, { color: '#ccc' }]}>
          {off.primarySystem} vs {oppSys.def}: Ball pressure disrupts entry timing but increases foul risk once the screen is used. KaNeXT pull-up midrange opens at the nail.
        </Text>
      </View>

      {/* Recommended Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>RECOMMENDED ACTIONS</Text>
      {off.emphasisPlays.map((play) => (
        <View key={play.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.playHeader}>
            <Text style={[styles.playName, { color: colors.text }]}>{play.name}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: play.priority === 'primary' ? accent + '22' : play.priority === 'secondary' ? '#B8943E22' : '#9C979022' }]}>
              <Text style={[styles.priorityText, { color: play.priority === 'primary' ? accent : play.priority === 'secondary' ? '#B8943E' : '#9C9790' }]}>{play.priority}</Text>
            </View>
          </View>
          <Text style={[styles.playNotes, { color: colors.textSecondary }]}>{play.notes}</Text>
        </View>
      ))}

      {/* Adjustments */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>ADJUSTMENTS</Text>
      {off.adjustments.map((adj, i) => (
        <View key={i} style={[styles.adjRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="arrow.turn.down.right" size={14} color={accent} />
          <Text style={[styles.adjText, { color: colors.text }]}>{adj}</Text>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Tab 3: Defense ───
function DefenseTab({ plan, colors, accent }: TabProps) {
  const def = plan.defense;
  const oppSys = getOppSystems(plan);
  // Key threats from scout notes
  const keyPlayers = plan.scoutNotes.filter(n => n.category === 'key-player');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Opponent offensive system */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OPPONENT OFFENSE</Text>
        <Text style={[styles.systemName, { color: colors.text }]}>{oppSys.off}</Text>
        <Text style={[styles.systemMeta, { color: colors.textTertiary }]}>Confidence: High</Text>
      </View>

      {/* System × System */}
      <View style={[styles.card, { backgroundColor: '#0B0F14', borderColor: accent + '33' }]}>
        <Text style={[styles.sectionLabel, { color: accent }]}>SYSTEM × SYSTEM</Text>
        <Text style={[styles.interactionText, { color: '#ccc' }]}>
          {def.primarySystem} vs {oppSys.off}: Pack line restricts driving lanes but opens mid-range pull-ups. Hedge-and-recover on PnR to limit roll man.
        </Text>
      </View>

      {/* Key Threats */}
      {keyPlayers.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>OPPONENT KEY THREATS</Text>
          {keyPlayers.map((kp) => (
            <View key={kp.id} style={[styles.card, { backgroundColor: colors.card, borderColor: '#B85C5C44' }]}>
              <Text style={[styles.threatName, { color: colors.text }]}>{kp.title}</Text>
              <Text style={[styles.threatDetail, { color: colors.textSecondary }]}>{kp.detail}</Text>
            </View>
          ))}
        </>
      )}

      {/* Defensive Rules */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>COVERAGE RULES</Text>
      {def.emphasisRules.map((rule) => (
        <View key={rule.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.playHeader}>
            <Text style={[styles.playName, { color: colors.text, flex: 1 }]}>{rule.rule}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: rule.priority === 'must' ? '#B85C5C22' : rule.priority === 'should' ? '#B8943E22' : '#9C979022' }]}>
              <Text style={[styles.priorityText, { color: rule.priority === 'must' ? '#B85C5C' : rule.priority === 'should' ? '#B8943E' : '#9C9790' }]}>{rule.priority}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Coverage Details */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SCHEME DETAILS</Text>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>PnR:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{def.pnrCoverage}</Text></View>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Post:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{def.postDefense}</Text></View>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Transition:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{def.transitionScheme}</Text></View>
      </View>

      {/* Adjustments */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>ADJUSTMENTS</Text>
      {def.adjustments.map((adj, i) => (
        <View key={i} style={[styles.adjRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="arrow.turn.down.right" size={14} color={accent} />
          <Text style={[styles.adjText, { color: colors.text }]}>{adj}</Text>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Tab 4: Matchups ───
function MatchupsTab({ plan, colors, accent, krVis }: TabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Matrix hint */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 12 }]}>
        KaNeXT starters vs {plan.header.opponent} — tap for details
      </Text>

      {plan.matchups.map((m) => {
        const expanded = expandedId === m.id;
        const advColor = m.advantageRating > 0 ? '#5A8A6E' : m.advantageRating < 0 ? '#B85C5C' : '#B8943E';
        const advLabel = m.advantageRating > 0 ? `+${m.advantageRating}` : `${m.advantageRating}`;
        return (
          <Pressable key={m.id} onPress={() => setExpandedId(expanded ? null : m.id)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.matchupRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.matchupPlayers, { color: colors.text }]}>{m.ourPlayer} vs {m.theirPlayer}</Text>
                <View style={[styles.typeBadge, { backgroundColor: accent + '18' }]}>
                  <Text style={[styles.typeText, { color: accent }]}>{m.matchupType}</Text>
                </View>
              </View>
              <View style={[styles.advBadge, { backgroundColor: advColor + '22' }]}>
                <Text style={[styles.advText, { color: advColor }]}>{advLabel}</Text>
              </View>
            </View>
            <Text style={[styles.matchupNotes, { color: colors.textSecondary }]}>{m.notes}</Text>

            {expanded && (
              <View style={styles.expandedMatchup}>
                <Text style={[styles.expandedLabel, { color: accent }]}>DETAILED BREAKDOWN</Text>
                <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
                  Offensive archetype vs defensive archetype interaction. {m.matchupType === 'switch' ? 'Switch scenario — used for defensive stops.' : 'Primary assignment for full game.'}
                </Text>
                <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
                  Key action: {m.advantageRating >= 1 ? 'Exploit this matchup aggressively.' : m.advantageRating <= -1 ? 'Avoid ISO situations in this matchup.' : 'Neutral — play to system.'}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Tab 5: Rotation ───
function RotationTab({ plan, colors, accent }: TabProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {(['1H', '2H'] as const).map((period) => {
        const slots = plan.rotation.filter(s => s.period === period);
        return (
          <View key={period}>
            <Text style={[styles.sectionTitle, { color: accent }]}>{period === '1H' ? 'FIRST HALF' : 'SECOND HALF'}</Text>
            {slots.map((slot, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.rotationHeader}>
                  <Text style={[styles.rotationTime, { color: accent }]}>{slot.startMin}:00 – {slot.endMin}:00</Text>
                  <Text style={[styles.rotationDuration, { color: colors.textTertiary }]}>{slot.endMin - slot.startMin} min</Text>
                </View>
                <View style={styles.lineupRow}>
                  {slot.lineup.map((name, j) => (
                    <View key={j} style={[styles.lineupChip, { backgroundColor: colors.background }]}>
                      <Text style={[styles.lineupName, { color: colors.text }]}>{name}</Text>
                    </View>
                  ))}
                </View>
                {slot.notes && <Text style={[styles.rotationNotes, { color: colors.textSecondary }]}>{slot.notes}</Text>}
              </View>
            ))}
          </View>
        );
      })}

      {/* Foul Trouble Contingency */}
      <View style={[styles.card, { backgroundColor: '#0B0F14', borderColor: '#B8943E44' }]}>
        <Text style={[styles.sectionLabel, { color: '#B8943E' }]}>FOUL TROUBLE CONTINGENCY</Text>
        {plan.offense.adjustments.filter(a => a.toLowerCase().includes('foul')).map((a, i) => (
          <Text key={i} style={[styles.contingencyText, { color: '#ccc' }]}>● {a}</Text>
        ))}
        {plan.defense.adjustments.filter(a => a.toLowerCase().includes('foul')).map((a, i) => (
          <Text key={`d-${i}`} style={[styles.contingencyText, { color: '#ccc' }]}>● {a}</Text>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Tab 6: Scout ───
function ScoutTab({ plan, colors, accent, krVis }: TabProps) {
  const catColors: Record<string, string> = { tendency: '#B8943E', weakness: '#B85C5C', strength: '#5A8A6E', 'key-player': accent, situational: accent };
  const oppKR = getOppKR(plan);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Opponent Team KR */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OPPONENT OVERVIEW</Text>
        <View style={styles.scoutOverviewRow}>
          <View style={[styles.krBadgeLg, { backgroundColor: getKRColor(oppKR) + '22' }]}>
            <Text style={[styles.krValueLg, { color: getKRColor(oppKR) }]}>{krVis === 'hidden' ? '—' : oppKR}</Text>
            <Text style={[styles.krLabelSm, { color: colors.textSecondary }]}>Team KR</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>{plan.header.opponent}</Text>
            <Text style={[styles.systemMeta, { color: colors.textSecondary }]}>{plan.header.date} · {plan.header.location}</Text>
          </View>
        </View>
      </View>

      {/* Opponent Tendencies */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>SCOUTING NOTES</Text>
      {plan.scoutNotes.map((note) => (
        <View key={note.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scoutHeader}>
            <View style={[styles.catBadge, { backgroundColor: (catColors[note.category] ?? '#9C9790') + '22' }]}>
              <Text style={[styles.catText, { color: catColors[note.category] ?? '#9C9790' }]}>{note.category}</Text>
            </View>
            <View style={[styles.confBadge, { backgroundColor: note.confidence === 'high' ? '#5A8A6E22' : note.confidence === 'medium' ? '#B8943E22' : '#B85C5C22' }]}>
              <Text style={[styles.confBadgeText, { color: note.confidence === 'high' ? '#5A8A6E' : note.confidence === 'medium' ? '#B8943E' : '#B85C5C' }]}>{note.confidence}</Text>
            </View>
          </View>
          <Text style={[styles.scoutTitle, { color: colors.text }]}>{note.title}</Text>
          <Text style={[styles.scoutDetail, { color: colors.textSecondary }]}>{note.detail}</Text>
          <Text style={[styles.scoutSource, { color: colors.textTertiary }]}>Source: {note.source}</Text>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Tab 7: Staff ───
function StaffTab({ plan, colors, accent }: TabProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Staff Assignments */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>STAFF ASSIGNMENTS</Text>
      {plan.staffAssignments.map((staff) => (
        <View key={staff.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.staffHeader}>
            <Text style={[styles.staffName, { color: colors.text }]}>{staff.staffName}</Text>
            <View style={[styles.roleBadge, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.roleText, { color: accent }]}>{staff.role}</Text>
            </View>
          </View>
          <Text style={[styles.staffResp, { color: colors.textSecondary }]}>{staff.responsibility}</Text>
          {staff.pregameTask && (
            <View style={styles.taskRow}>
              <Text style={[styles.taskLabel, { color: colors.textTertiary }]}>Pregame:</Text>
              <Text style={[styles.taskValue, { color: colors.text }]}>{staff.pregameTask}</Text>
            </View>
          )}
          {staff.inGameTask && (
            <View style={styles.taskRow}>
              <Text style={[styles.taskLabel, { color: colors.textTertiary }]}>In-Game:</Text>
              <Text style={[styles.taskValue, { color: colors.text }]}>{staff.inGameTask}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Pre-game Notes (placeholder) */}
      <View style={[styles.card, { backgroundColor: '#0B0F14', borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRE-GAME STAFF NOTES</Text>
        <Text style={[styles.notesPlaceholder, { color: colors.textTertiary }]}>Tap to add coaching staff notes for this game...</Text>
      </View>

      {/* Practice Plan Link */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRACTICE PLAN</Text>
        <Text style={[styles.linkText, { color: accent }]}>View practice plan tied to this game →</Text>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Selector
  selectorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  selectorBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  selectorText: { fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  dropdown: { marginHorizontal: 16, marginTop: 4, borderRadius: 10, borderWidth: 1, overflow: 'hidden', zIndex: 10 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemText: { fontSize: 14, fontWeight: '600' },
  dropdownItemMeta: { fontSize: 11, marginTop: 2 },

  // Pills
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Card
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },

  // Overview
  matchupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  teamName: { fontSize: 16, fontWeight: '800' },
  teamRecord: { fontSize: 12, marginTop: 2 },
  vsText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  dateText: { fontSize: 11, marginTop: 4 },
  venueText: { fontSize: 10, marginTop: 2 },

  winProbRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  winProbBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#2F3336' },
  winProbBarFill: { height: 8, borderRadius: 4 },
  winProbPct: { fontSize: 20, fontWeight: '800', width: 50, textAlign: 'right' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  rangeText: { fontSize: 10 },

  compareRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  compareLabel: { width: 80, fontSize: 11, fontWeight: '600' },
  compareValue: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  compareSep: { width: 30, fontSize: 10, textAlign: 'center' },

  advantageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  advantageDot: { fontSize: 10, marginTop: 3 },
  advantageText: { fontSize: 12, flex: 1, lineHeight: 18 },

  confRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confPct: { fontSize: 28, fontWeight: '800' },
  confSource: { fontSize: 12 },
  confDetail: { fontSize: 11, marginTop: 4 },

  // Offense / Defense
  systemName: { fontSize: 18, fontWeight: '800' },
  systemMeta: { fontSize: 11, marginTop: 4 },
  interactionText: { fontSize: 13, lineHeight: 20 },

  playHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  playName: { fontSize: 14, fontWeight: '700' },
  playNotes: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  adjRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  adjText: { fontSize: 13, flex: 1, lineHeight: 19 },

  detailRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  detailLabel: { fontSize: 11, fontWeight: '600', width: 80 },
  detailValue: { fontSize: 12, flex: 1 },

  threatName: { fontSize: 15, fontWeight: '700' },
  threatDetail: { fontSize: 12, marginTop: 4, lineHeight: 18 },

  // Matchups
  matchupRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchupPlayers: { fontSize: 14, fontWeight: '700' },
  advBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  advText: { fontSize: 14, fontWeight: '800' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  typeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  matchupNotes: { fontSize: 12, marginTop: 8, lineHeight: 18 },
  expandedMatchup: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2F3336' },
  expandedLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  expandedText: { fontSize: 12, lineHeight: 18, marginBottom: 4 },

  // Rotation
  rotationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rotationTime: { fontSize: 14, fontWeight: '700' },
  rotationDuration: { fontSize: 11 },
  lineupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  lineupChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  lineupName: { fontSize: 12, fontWeight: '600' },
  rotationNotes: { fontSize: 11, marginTop: 8 },
  contingencyText: { fontSize: 12, lineHeight: 18, marginBottom: 4 },

  // Scout
  scoutOverviewRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  krBadgeLg: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  krValueLg: { fontSize: 22, fontWeight: '800' },
  krLabelSm: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 1 },
  scoutHeader: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  confBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  confBadgeText: { fontSize: 10, fontWeight: '600' },
  scoutTitle: { fontSize: 15, fontWeight: '700' },
  scoutDetail: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  scoutSource: { fontSize: 10, marginTop: 6 },

  // Staff
  staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  staffName: { fontSize: 15, fontWeight: '700' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '700' },
  staffResp: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  taskRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  taskLabel: { fontSize: 11, fontWeight: '600' },
  taskValue: { fontSize: 12, flex: 1 },
  notesPlaceholder: { fontSize: 13, fontStyle: 'italic' },
  linkText: { fontSize: 13, fontWeight: '600' },
});
