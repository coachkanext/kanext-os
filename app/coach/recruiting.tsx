/**
 * Coach Recruiting Screen
 * 4 sub-views: National Player Pool, Recruiting Board, Logs, Saved Evaluations
 * Default: Recruiting Board
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];

import { PLAYER_POOL, type PoolLevel, type PoolPosition } from '@/data/playerPool';
import { RECRUITING_BOARD, type BoardEntry, type BoardStatus } from '@/data/recruitingBoard';
import { RECRUITING_LOGS, type RecruitingLog, type ActionType } from '@/data/recruitingLogs';
import { EVAL_SNAPSHOTS } from '@/data/evalSnapshots';

type TabKey = 'pool' | 'board' | 'logs' | 'evals';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'board', label: 'Board' },
  { key: 'pool', label: 'Player Pool' },
  { key: 'logs', label: 'Logs' },
  { key: 'evals', label: 'Evaluations' },
];

const STATUS_COLORS: Record<BoardStatus, string> = {
  Watching: '#6e6e6e',
  Contacted: '#d4d4d4',
  Offered: '#ffffff',
  Committed: '#f5f5f5',
  Archived: '#555555',
};

const PRIORITY_COLORS: Record<string, string> = {
  A: '#f5f5f5',
  B: '#6e6e6e',
  C: '#555555',
};

const BOARD_STATUS_TABS: BoardStatus[] = ['Watching', 'Contacted', 'Offered', 'Committed', 'Archived'];

// ─── Tab Bar ───
function TabBar({
  tabs,
  activeTab,
  onTabChange,
  colors,
}: {
  tabs: typeof TABS;
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.tabBar, { borderBottomColor: colors.divider }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(tab.key);
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? colors.text : colors.textTertiary },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.tabIndicator, { backgroundColor: colors.text }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── National Player Pool ───
function NationalPlayerPool({ colors }: { colors: (typeof Colors)['light'] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<PoolLevel | null>(null);
  const [posFilter, setPosFilter] = useState<PoolPosition | null>(null);
  const [filmOnly, setFilmOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = PLAYER_POOL;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.currentSchool.toLowerCase().includes(q)
      );
    }
    if (levelFilter) list = list.filter((p) => p.level === levelFilter);
    if (posFilter) list = list.filter((p) => p.position === posFilter);
    if (filmOnly) list = list.filter((p) => p.hasFilm);
    return list;
  }, [search, levelFilter, posFilter, filmOnly]);

  const levels: PoolLevel[] = ['HS', 'JUCO', 'NCAA D1', 'NCAA D2', 'NCAA D3', 'International'];
  const positions: PoolPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];

  return (
    <View style={styles.subViewContainer}>
      <Text style={[styles.subViewTitle, { color: colors.text }]}>National Player Pool</Text>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search name or school..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {/* Level chips */}
        {levels.map((lv) => (
          <Pressable
            key={lv}
            style={[
              styles.filterChip,
              { backgroundColor: levelFilter === lv ? colors.text : colors.backgroundSecondary },
            ]}
            onPress={() => setLevelFilter(levelFilter === lv ? null : lv)}
          >
            <Text style={[styles.filterChipText, { color: levelFilter === lv ? colors.background : colors.textSecondary }]}>
              {lv}
            </Text>
          </Pressable>
        ))}
        <View style={styles.filterDividerV} />
        {/* Position chips */}
        {positions.map((pos) => (
          <Pressable
            key={pos}
            style={[
              styles.filterChip,
              { backgroundColor: posFilter === pos ? colors.text : colors.backgroundSecondary },
            ]}
            onPress={() => setPosFilter(posFilter === pos ? null : pos)}
          >
            <Text style={[styles.filterChipText, { color: posFilter === pos ? colors.background : colors.textSecondary }]}>
              {pos}
            </Text>
          </Pressable>
        ))}
        <View style={styles.filterDividerV} />
        {/* Film toggle */}
        <Pressable
          style={[
            styles.filterChip,
            { backgroundColor: filmOnly ? colors.text : colors.backgroundSecondary },
          ]}
          onPress={() => setFilmOnly(!filmOnly)}
        >
          <Text style={[styles.filterChipText, { color: filmOnly ? colors.background : colors.textSecondary }]}>
            Has Film
          </Text>
        </Pressable>
      </ScrollView>

      {/* Player table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={[styles.poolHeaderRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.poolHeaderCell, styles.poolColName, { color: colors.textSecondary }]}>PLAYER</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColPos, { color: colors.textSecondary }]}>POS</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColHt, { color: colors.textSecondary }]}>HT</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColClass, { color: colors.textSecondary }]}>CLASS</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColSchool, { color: colors.textSecondary }]}>SCHOOL</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColLevel, { color: colors.textSecondary }]}>LEVEL</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColStats, { color: colors.textSecondary }]}>KEY STATS</Text>
            <Text style={[styles.poolHeaderCell, styles.poolColActions, { color: colors.textSecondary }]}>ACTIONS</Text>
          </View>
          {/* Rows */}
          {filtered.map((player, idx) => (
            <View
              key={player.id}
              style={[styles.poolRow, idx % 2 === 1 && { backgroundColor: colors.backgroundSecondary + '40' }]}
            >
              <Pressable
                style={styles.poolColName}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/coach/player-profile', params: { id: player.id } });
                }}
              >
                <Text style={[styles.poolCellName, { color: colors.text }]}>
                  {player.firstName} {player.lastName}
                </Text>
              </Pressable>
              <Text style={[styles.poolCell, styles.poolColPos, { color: colors.text }]}>{player.position}</Text>
              <Text style={[styles.poolCell, styles.poolColHt, { color: colors.text }]}>{player.height}</Text>
              <Text style={[styles.poolCell, styles.poolColClass, { color: colors.text }]}>{player.classYear}</Text>
              <Text style={[styles.poolCell, styles.poolColSchool, { color: colors.text }]} numberOfLines={1}>{player.currentSchool}</Text>
              <Text style={[styles.poolCell, styles.poolColLevel, { color: colors.textSecondary }]}>{player.level}</Text>
              <Text style={[styles.poolCell, styles.poolColStats, { color: colors.textSecondary }]} numberOfLines={1}>{player.keyStatLine}</Text>
              <View style={[styles.poolColActions, { flexDirection: 'row', gap: 6 }]}>
                <Pressable
                  style={[styles.poolActionBtn, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/coach/player-profile', params: { id: player.id } });
                  }}
                >
                  <Text style={[styles.poolActionText, { color: colors.text }]}>Profile</Text>
                </Pressable>
                <Pressable
                  style={[styles.poolActionBtn, { backgroundColor: '#ffffff20' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Text style={[styles.poolActionText, { color: '#ffffff' }]}>Nexus</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No players match your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Recruiting Board ───
function RecruitingBoardView({ colors }: { colors: (typeof Colors)['light'] }) {
  const router = useRouter();
  const [statusTab, setStatusTab] = useState<BoardStatus>('Watching');
  const [board, setBoard] = useState<BoardEntry[]>([...RECRUITING_BOARD]);
  const [selectedEntry, setSelectedEntry] = useState<BoardEntry | null>(null);

  const filteredBoard = useMemo(
    () => board.filter((e) => e.status === statusTab),
    [board, statusTab]
  );

  const playerName = (playerId: string) => {
    const p = PLAYER_POOL.find((pp) => pp.id === playerId);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  };

  const counts = useMemo(() => {
    const c: Record<BoardStatus, number> = { Watching: 0, Contacted: 0, Offered: 0, Committed: 0, Archived: 0 };
    board.forEach((e) => c[e.status]++);
    return c;
  }, [board]);

  return (
    <View style={styles.subViewContainer}>
      <Text style={[styles.subViewTitle, { color: colors.text }]}>Recruiting Board</Text>
      <Text style={[styles.contextLine, { color: colors.textTertiary }]}>
        Lincoln University Oakland · Men's Basketball · 2025-26
      </Text>

      {/* Status tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusTabsScroll}>
        {BOARD_STATUS_TABS.map((st) => {
          const isActive = statusTab === st;
          return (
            <Pressable
              key={st}
              style={[
                styles.statusTab,
                { borderBottomColor: isActive ? STATUS_COLORS[st] : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStatusTab(st);
              }}
            >
              <Text style={[styles.statusTabText, { color: isActive ? colors.text : colors.textTertiary }]}>
                {st}
              </Text>
              <View style={[styles.statusTabCount, { backgroundColor: isActive ? STATUS_COLORS[st] + '30' : colors.backgroundSecondary }]}>
                <Text style={[styles.statusTabCountText, { color: isActive ? STATUS_COLORS[st] : colors.textTertiary }]}>
                  {counts[st]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Board table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.boardHeaderRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.boardHeaderCell, styles.boardColPlayer, { color: colors.textSecondary }]}>PLAYER</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColPri, { color: colors.textSecondary }]}>PRI</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColPos, { color: colors.textSecondary }]}>POS</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColClass, { color: colors.textSecondary }]}>CLASS</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColNotes, { color: colors.textSecondary }]}>NOTES</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColNext, { color: colors.textSecondary }]}>NEXT STEP</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColDue, { color: colors.textSecondary }]}>DUE</Text>
            <Text style={[styles.boardHeaderCell, styles.boardColCoach, { color: colors.textSecondary }]}>COACH</Text>
          </View>
          {filteredBoard.map((entry, idx) => (
            <Pressable
              key={entry.id}
              style={[styles.boardRow, idx % 2 === 1 && { backgroundColor: colors.backgroundSecondary + '40' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedEntry(entry);
              }}
            >
              <View style={styles.boardColPlayer}>
                <Text style={[styles.boardCellName, { color: colors.text }]}>{playerName(entry.playerId)}</Text>
              </View>
              <View style={[styles.boardColPri, { alignItems: 'center' }]}>
                <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[entry.priority] + '25' }]}>
                  <Text style={[styles.priorityText, { color: PRIORITY_COLORS[entry.priority] }]}>{entry.priority}</Text>
                </View>
              </View>
              <Text style={[styles.boardCell, styles.boardColPos, { color: colors.text }]}>{entry.position}</Text>
              <Text style={[styles.boardCell, styles.boardColClass, { color: colors.text }]}>{entry.classYear}</Text>
              <Text style={[styles.boardCell, styles.boardColNotes, { color: colors.textSecondary }]} numberOfLines={1}>{entry.shortNotes}</Text>
              <Text style={[styles.boardCell, styles.boardColNext, { color: colors.text }]} numberOfLines={1}>{entry.nextStep}</Text>
              <Text style={[styles.boardCell, styles.boardColDue, { color: colors.textSecondary }]}>{entry.dueDate ? new Date(entry.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</Text>
              <Text style={[styles.boardCell, styles.boardColCoach, { color: colors.textSecondary }]} numberOfLines={1}>{entry.assignedCoach}</Text>
            </Pressable>
          ))}
          {filteredBoard.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No {statusTab.toLowerCase()} recruits</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Panel Modal */}
      {selectedEntry && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedEntry(null)}>
          <BoardDetailPanel
            entry={selectedEntry}
            colors={colors}
            onClose={() => setSelectedEntry(null)}
            onUpdate={(updated) => {
              setBoard((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
              setSelectedEntry(updated);
            }}
          />
        </Modal>
      )}
    </View>
  );
}

// ─── Board Detail Panel ───
function BoardDetailPanel({
  entry,
  colors,
  onClose,
  onUpdate,
}: {
  entry: BoardEntry;
  colors: (typeof Colors)['light'];
  onClose: () => void;
  onUpdate: (entry: BoardEntry) => void;
}) {
  const router = useRouter();
  const player = PLAYER_POOL.find((p) => p.id === entry.playerId);
  const name = player ? `${player.firstName} ${player.lastName}` : 'Unknown';

  return (
    <View style={[styles.detailOverlay, { backgroundColor: colors.background + 'F5' }]}>
      <View style={[styles.detailPanel, { backgroundColor: colors.backgroundSecondary }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailName, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
                {entry.position} · Class {entry.classYear} · {player?.currentSchool}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.detailCloseBtn}>
              <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Quick links */}
          <View style={styles.detailActions}>
            <Pressable
              style={[styles.detailActionBtn, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => {
                onClose();
                router.push({ pathname: '/coach/player-profile', params: { id: entry.playerId } });
              }}
            >
              <Text style={[styles.detailActionText, { color: colors.text }]}>Profile</Text>
            </Pressable>
            <Pressable style={[styles.detailActionBtn, { backgroundColor: '#ffffff20' }]}>
              <Text style={[styles.detailActionText, { color: '#ffffff' }]}>Open in Nexus</Text>
            </Pressable>
            <Pressable style={[styles.detailActionBtn, { backgroundColor: '#f5f5f520' }]}>
              <Text style={[styles.detailActionText, { color: '#f5f5f5' }]}>Run Evaluation</Text>
            </Pressable>
          </View>

          {/* Editable fields */}
          <View style={styles.detailFieldGroup}>
            <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>STATUS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {BOARD_STATUS_TABS.map((st) => (
                <Pressable
                  key={st}
                  style={[
                    styles.detailStatusChip,
                    { backgroundColor: entry.status === st ? STATUS_COLORS[st] + '30' : colors.backgroundTertiary },
                  ]}
                  onPress={() => onUpdate({ ...entry, status: st })}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: entry.status === st ? STATUS_COLORS[st] : colors.textTertiary }}>
                    {st}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>PRIORITY</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {(['A', 'B', 'C'] as const).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityChip,
                    { backgroundColor: entry.priority === p ? PRIORITY_COLORS[p] + '30' : colors.backgroundTertiary },
                  ]}
                  onPress={() => onUpdate({ ...entry, priority: p })}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: entry.priority === p ? PRIORITY_COLORS[p] : colors.textTertiary }}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>TAGS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {entry.tags.map((tag) => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>NOTES</Text>
            <Text style={[styles.detailFieldValue, { color: colors.text }]}>{entry.shortNotes}</Text>
            <Text style={[styles.detailFieldValueSub, { color: colors.textSecondary }]}>{entry.longNotes}</Text>

            <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>NEXT STEP</Text>
            <Text style={[styles.detailFieldValue, { color: colors.text }]}>{entry.nextStep || '—'}</Text>
            {entry.dueDate ? (
              <Text style={[styles.detailFieldValueSub, { color: colors.textTertiary }]}>
                Due: {new Date(entry.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            ) : null}

            <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>ASSIGNED COACH</Text>
            <Text style={[styles.detailFieldValue, { color: colors.text }]}>{entry.assignedCoach}</Text>

            {entry.scholarshipPct !== undefined && (
              <>
                <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>PLANNED SCHOLARSHIP</Text>
                <Text style={[styles.detailFieldValue, { color: colors.text }]}>{entry.scholarshipPct}%</Text>
              </>
            )}
            {entry.nilAmount && (
              <>
                <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>PLANNED NIL</Text>
                <Text style={[styles.detailFieldValue, { color: colors.text }]}>{entry.nilAmount}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Logs ───
function LogsView({ colors }: { colors: (typeof Colors)['light'] }) {
  const [logs] = useState<RecruitingLog[]>([...RECRUITING_LOGS]);
  const [filterPlayer, setFilterPlayer] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    if (!filterPlayer) return logs;
    const q = filterPlayer.toLowerCase();
    return logs.filter((l) => l.playerName.toLowerCase().includes(q));
  }, [logs, filterPlayer]);

  const actionTypeColor = (type: ActionType): string => {
    switch (type) {
      case 'Call': return '#f5f5f5';
      case 'Text': return '#ffffff';
      case 'DM': return '#ffffff';
      case 'Visit': case 'Official': case 'Unofficial': return '#6e6e6e';
      case 'Watched Film': return '#d4d4d4';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.subViewContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[styles.subViewTitle, { color: colors.text }]}>Recruiting Logs</Text>
        <Pressable
          style={[styles.addLogBtn, { backgroundColor: colors.text }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddModal(true);
          }}
        >
          <Text style={[styles.addLogBtnText, { color: colors.background }]}>+ Log</Text>
        </Pressable>
      </View>

      {/* Filter */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Filter by player..."
          placeholderTextColor={colors.textTertiary}
          value={filterPlayer}
          onChangeText={setFilterPlayer}
        />
      </View>

      {/* Log rows */}
      {filtered.sort((a, b) => b.date.localeCompare(a.date)).map((log, idx) => (
        <View
          key={log.id}
          style={[
            styles.logRow,
            { backgroundColor: colors.backgroundSecondary },
            idx > 0 && { marginTop: 8 },
          ]}
        >
          <View style={styles.logRowHeader}>
            <Text style={[styles.logDate, { color: colors.textTertiary }]}>
              {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <View style={[styles.logTypeBadge, { backgroundColor: actionTypeColor(log.actionType) + '20' }]}>
              <Text style={[styles.logTypeText, { color: actionTypeColor(log.actionType) }]}>{log.actionType}</Text>
            </View>
            <Text style={[styles.logOwner, { color: colors.textTertiary }]}>{log.owner}</Text>
          </View>
          <Text style={[styles.logPlayer, { color: colors.text }]}>{log.playerName}</Text>
          <Text style={[styles.logOutcome, { color: colors.textSecondary }]}>{log.outcome}</Text>
          {log.nextAction ? (
            <Text style={[styles.logNext, { color: colors.textTertiary }]}>
              Next: {log.nextAction}
              {log.nextActionDue ? ` (${new Date(log.nextActionDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : ''}
            </Text>
          ) : null}
        </View>
      ))}

      {/* Add Log Modal (placeholder) */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={[styles.detailOverlay, { backgroundColor: colors.background + 'F5' }]}>
          <View style={[styles.addLogModal, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailName, { color: colors.text }]}>Add Log Entry</Text>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.detailCloseBtn}>
                <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
              <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>ACTION TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {(['Call', 'Text', 'DM', 'Visit', 'Watched Film', 'Official', 'Unofficial'] as ActionType[]).map((t) => (
                  <View key={t} style={[styles.filterChip, { backgroundColor: colors.backgroundTertiary, marginRight: 6 }]}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{t}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>PLAYER</Text>
              <View style={[styles.addLogField, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={{ color: colors.textTertiary }}>Select player...</Text>
              </View>
              <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>NOTES / OUTCOME</Text>
              <View style={[styles.addLogField, { backgroundColor: colors.backgroundTertiary, height: 80 }]}>
                <Text style={{ color: colors.textTertiary }}>Enter notes...</Text>
              </View>
              <Text style={[styles.detailFieldLabel, { color: colors.textTertiary }]}>NEXT ACTION + DUE DATE</Text>
              <View style={[styles.addLogField, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={{ color: colors.textTertiary }}>Enter next action...</Text>
              </View>
              <Pressable style={[styles.addLogSubmit, { backgroundColor: colors.text }]}>
                <Text style={{ color: colors.background, fontWeight: '600', fontSize: 15 }}>Save Log Entry</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Saved Evaluations ───
function SavedEvalsView({ colors }: { colors: (typeof Colors)['light'] }) {
  const [filterPlayer, setFilterPlayer] = useState('');

  const filtered = useMemo(() => {
    if (!filterPlayer) return EVAL_SNAPSHOTS;
    const q = filterPlayer.toLowerCase();
    return EVAL_SNAPSHOTS.filter((e) => e.playerName.toLowerCase().includes(q));
  }, [filterPlayer]);

  return (
    <View style={styles.subViewContainer}>
      <Text style={[styles.subViewTitle, { color: colors.text }]}>Saved Evaluations</Text>

      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Filter by player..."
          placeholderTextColor={colors.textTertiary}
          value={filterPlayer}
          onChangeText={setFilterPlayer}
        />
      </View>

      {filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((snap, idx) => (
        <View
          key={snap.id}
          style={[
            styles.evalCard,
            { backgroundColor: colors.backgroundSecondary },
            idx > 0 && { marginTop: 8 },
          ]}
        >
          <View style={styles.evalCardHeader}>
            <Text style={[styles.evalPlayerName, { color: colors.text }]}>{snap.playerName}</Text>
            <Text style={[styles.evalDate, { color: colors.textTertiary }]}>
              {new Date(snap.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <Text style={[styles.evalMeta, { color: colors.textTertiary }]}>
            {snap.evaluator} · {snap.season}
          </Text>
          <Text style={[styles.evalSummary, { color: colors.textSecondary }]} numberOfLines={3}>
            {snap.summary}
          </Text>
          <View style={styles.evalActions}>
            {snap.nexusThreadId && (
              <Pressable style={[styles.evalActionBtn, { backgroundColor: '#ffffff20' }]}>
                <Text style={[styles.evalActionText, { color: '#ffffff' }]}>Open in Nexus</Text>
              </Pressable>
            )}
            {snap.boardEntryId ? (
              <View style={[styles.evalActionBtn, { backgroundColor: '#f5f5f520' }]}>
                <Text style={[styles.evalActionText, { color: '#f5f5f5' }]}>Linked to Board</Text>
              </View>
            ) : (
              <Pressable style={[styles.evalActionBtn, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.evalActionText, { color: colors.textSecondary }]}>Attach to Board</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ───
export default function CoachRecruitingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('board');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubTabsContent}>
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === 'recruiting';
            return (
              <Pressable
                key={tab.id}
                style={[styles.hubTab, isActive && [styles.hubTabActive, { borderBottomColor: colors.text }]]}
                onPress={() => {
                  if (tab.id === 'recruiting') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.id === 'home' || tab.id === 'roster') {
                    router.back();
                  } else if (tab.route) {
                    router.replace(tab.route as any);
                  }
                }}
              >
                <ThemedText style={[styles.hubTabLabel, { color: isActive ? colors.text : colors.textTertiary }, isActive && styles.hubTabLabelActive]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} colors={colors} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'pool' && <NationalPlayerPool colors={colors} />}
        {activeTab === 'board' && <RecruitingBoardView colors={colors} />}
        {activeTab === 'logs' && <LogsView colors={colors} />}
        {activeTab === 'evals' && <SavedEvalsView colors={colors} />}
      </ScrollView>

      <TabFooter activeTab="Home" />
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: { flex: 1 },
  hubTabsContainer: { borderBottomWidth: StyleSheet.hairlineWidth },
  hubTabsContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  hubTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  hubTabActive: { borderBottomWidth: 2 },
  hubTabLabel: { fontSize: 14, fontWeight: '500' },
  hubTabLabelActive: { fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },

  // Tab bar
  tabBar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1 },

  // Sub-views shared
  subViewContainer: { flex: 1 },
  subViewTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  contextLine: { fontSize: 13, marginBottom: 12 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, paddingHorizontal: 12, height: 40, marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  // Filters
  filterRow: { marginBottom: 12, flexGrow: 0 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 6 },
  filterChipText: { fontSize: 12, fontWeight: '500' },
  filterDividerV: { width: 1, height: 20, backgroundColor: '#333', marginHorizontal: 4, alignSelf: 'center' },

  // Pool table
  poolHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4 },
  poolHeaderCell: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, paddingHorizontal: 4 },
  poolColName: { width: 160 },
  poolColPos: { width: 44, textAlign: 'center' },
  poolColHt: { width: 52, textAlign: 'center' },
  poolColClass: { width: 52, textAlign: 'center' },
  poolColSchool: { width: 140 },
  poolColLevel: { width: 80, textAlign: 'center' },
  poolColStats: { width: 160 },
  poolColActions: { width: 130 },
  poolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  poolCell: { fontSize: 13, paddingHorizontal: 4 },
  poolCellName: { fontSize: 14, fontWeight: '500', paddingHorizontal: 4 },
  poolActionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  poolActionText: { fontSize: 11, fontWeight: '600' },

  // Board
  statusTabsScroll: { marginBottom: 12, flexGrow: 0 },
  statusTab: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 2, marginRight: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusTabText: { fontSize: 13, fontWeight: '600' },
  statusTabCount: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, minWidth: 22, alignItems: 'center' },
  statusTabCountText: { fontSize: 11, fontWeight: '700' },
  boardHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4 },
  boardHeaderCell: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, paddingHorizontal: 4 },
  boardColPlayer: { width: 150 },
  boardColPri: { width: 44 },
  boardColPos: { width: 44, textAlign: 'center' },
  boardColClass: { width: 52, textAlign: 'center' },
  boardColNotes: { width: 180 },
  boardColNext: { width: 160 },
  boardColDue: { width: 64, textAlign: 'center' },
  boardColCoach: { width: 110 },
  boardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  boardCell: { fontSize: 13, paddingHorizontal: 4 },
  boardCellName: { fontSize: 14, fontWeight: '500', paddingHorizontal: 4 },
  priorityBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  priorityText: { fontSize: 13, fontWeight: '700' },

  // Detail panel
  detailOverlay: { flex: 1, justifyContent: 'flex-end' },
  detailPanel: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 40 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, paddingBottom: 8 },
  detailName: { fontSize: 20, fontWeight: '700' },
  detailMeta: { fontSize: 13, marginTop: 2 },
  detailCloseBtn: { padding: 8 },
  detailActions: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 8, marginBottom: 16 },
  detailActionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  detailActionText: { fontSize: 13, fontWeight: '600' },
  detailFieldGroup: { paddingHorizontal: Spacing.md },
  detailFieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, marginTop: 12 },
  detailFieldValue: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  detailFieldValueSub: { fontSize: 13, marginBottom: 4, lineHeight: 19 },
  detailStatusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 6 },
  priorityChip: { width: 40, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tagChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },

  // Logs
  addLogBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14 },
  addLogBtnText: { fontSize: 13, fontWeight: '600' },
  logRow: { borderRadius: BorderRadius.lg, padding: Spacing.md },
  logRowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  logDate: { fontSize: 12, fontWeight: '500' },
  logTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  logTypeText: { fontSize: 10, fontWeight: '700' },
  logOwner: { fontSize: 12, marginLeft: 'auto' },
  logPlayer: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  logOutcome: { fontSize: 13, lineHeight: 19, marginBottom: 4 },
  logNext: { fontSize: 12, fontStyle: 'italic' },

  // Add log modal
  addLogModal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 40 },
  addLogField: { borderRadius: BorderRadius.md, padding: 12, marginBottom: 12 },
  addLogSubmit: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },

  // Evaluations
  evalCard: { borderRadius: BorderRadius.lg, padding: Spacing.md },
  evalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  evalPlayerName: { fontSize: 16, fontWeight: '600' },
  evalDate: { fontSize: 12 },
  evalMeta: { fontSize: 12, marginBottom: 8 },
  evalSummary: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  evalActions: { flexDirection: 'row', gap: 8 },
  evalActionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  evalActionText: { fontSize: 12, fontWeight: '600' },

  // Empty state
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
