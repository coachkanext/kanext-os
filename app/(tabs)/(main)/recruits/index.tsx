/**
 * Sports Mode — Recruits Screen
 * LU Men's Basketball | Two-sided: Coach / Recruit
 * Tabs: Board / Pool / Portal
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { setPendingEvalQuery } from '@/utils/global-nexus-state';
import { nationalPool, type NationalPlayer } from '@/data/national-pool';
import {
  RECRUITS_BOARD,
  type Recruit,
  type RecruitStage,
  type RecruitPriority,
  getStageCounts,
  stageColor,
  priorityColor,
} from '@/data/mock-sports-hub';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;

type Tab  = 'Board' | 'Pool' | 'Portal';
type Role = 'Coach' | 'Recruit';
const TABS: Tab[]   = ['Board', 'Pool', 'Portal'];

const POSITIONS    = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];
const SORT_OPTIONS = ['By PPG', 'By RPG', 'Alphabetical'];
const BOARD_STAGES: Array<RecruitStage | 'All'> = [
  'All', 'Identified', 'Evaluating', 'Offered', 'Committed', 'Signed',
];

const LEVEL_PILLS = ['All', 'D1 HM', 'D1 MM', 'D1 LM', 'D2', 'D3', 'NAIA', 'JUCO', 'USCAA'];

const LEVEL_KEY_MAP: Record<string, string | string[]> = {
  'D1 HM': 'ncaa_d1_high_major',
  'D1 MM': 'ncaa_d1_mid_major',
  'D1 LM': 'ncaa_d1_low_major',
  'D2':    'ncaa_d2',
  'D3':    'ncaa_d3',
  'NAIA':  'naia',
  'JUCO':  ['njcaa_d1', 'njcaa_d2', 'njcaa_d3'],
  'USCAA': 'uscaa',
};

const POOL_PAGE_SIZE = 50;
const DEBOUNCE_MS   = 200;

// ── Helpers ───────────────────────────────────────────────────────────────────

function contactIcon(type: Recruit['contactType']): string {
  switch (type) {
    case 'call':  return 'phone.fill';
    case 'text':  return 'message.fill';
    case 'visit': return 'location.fill';
    case 'email': return 'envelope.fill';
  }
}

function hslAvatar(hue: number): string {
  return `hsl(${hue}, 55%, 52%)`;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function hueFrom(id: string): number {
  return id.charCodeAt(0) % 360;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarCircle({
  initials,
  hue,
  size = 40,
}: {
  initials: string;
  hue: number;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hslAvatar(hue),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.35, fontWeight: '700' }}>
        {initials}
      </Text>
    </View>
  );
}

function StarRow({ stars, C }: { stars: number; C: ComponentColors }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <IconSymbol
            key={i}
            name="star.fill"
            size={11}
            color={i < stars ? '#B8942C' : C.muted}
          />
        ))}
    </View>
  );
}

function StageBadge({ stage, C }: { stage: RecruitStage; C: ComponentColors }) {
  const color = stageColor(stage);
  return (
    <View
      style={{
        backgroundColor: color + '22',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{stage}</Text>
    </View>
  );
}

function PriorityTag({
  priority,
}: {
  priority: RecruitPriority;
  C: ComponentColors;
}) {
  const color = priorityColor(priority);
  return (
    <View
      style={{
        backgroundColor: color + '18',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{priority}</Text>
    </View>
  );
}

// ── Recruit Detail Sheet ──────────────────────────────────────────────────────

const ALL_STAGES: RecruitStage[] = [
  'Identified', 'Evaluating', 'Offered', 'Verbal', 'Committed', 'Signed', 'Declined',
];

function RecruitDetailSheet({
  recruit,
  visible,
  onClose,
  C,
}: {
  recruit: Recruit | null;
  visible: boolean;
  onClose: () => void;
  C: ComponentColors;
}) {
  if (!recruit) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={recruit.name}>
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <AvatarCircle initials={recruit.initials} hue={recruit.hue} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>
              {recruit.name}
            </Text>
            <Text style={{ fontSize: 14, color: C.secondary, marginTop: 2 }}>
              {recruit.position} · {recruit.classYear} · {recruit.heightFt} · {recruit.weight} lbs
            </Text>
            <Text style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>
              {recruit.school}, {recruit.state}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <StageBadge stage={recruit.stage} C={C} />
          <PriorityTag priority={recruit.priority} C={C} />
          <StarRow stars={recruit.stars} C={C} />
        </View>
      </View>

      {/* Stage Selector */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[sheetS.secTitle, { color: C.label }]}>Pipeline Stage</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ALL_STAGES.map((st) => {
              const active = st === recruit.stage;
              const color  = stageColor(st);
              return (
                <Pressable
                  key={st}
                  onPress={() =>
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 10,
                    backgroundColor: active ? color + '28' : C.surface,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? color : C.inputBorder,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: active ? '700' : '500',
                      color: active ? color : C.secondary,
                    }}
                  >
                    {st}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* KR Card */}
      {recruit.kr !== undefined && (
        <GlassView tier={1} style={{ padding: 14, marginBottom: 16 }}>
          <Text style={[sheetS.secTitle, { color: C.label, marginBottom: 8 }]}>
            KaNeXT Rating
          </Text>
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 30, fontWeight: '900', color: '#003A63' }}>
                {recruit.kr.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 11, color: C.muted }}>Overall KR</Text>
            </View>
            {recruit.krConf !== undefined && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#3B82F6' }}>
                  {recruit.krConf}%
                </Text>
                <Text style={{ fontSize: 11, color: C.muted }}>Confidence</Text>
              </View>
            )}
            {recruit.archetype && (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>
                  {recruit.archetype}
                </Text>
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Archetype
                </Text>
              </View>
            )}
          </View>
          {recruit.systemFit !== undefined && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: C.secondary }}>System Fit</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#5A8A6E' }}>
                  {recruit.systemFit}%
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: C.separator,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${recruit.systemFit}%`,
                    height: '100%',
                    backgroundColor: '#5A8A6E',
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          )}
        </GlassView>
      )}

      {/* Academic */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[sheetS.secTitle, { color: C.label }]}>Academic</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <View
            style={[sheetS.statBox, { backgroundColor: C.surface }]}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>
              {recruit.gpa.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 10, color: C.muted }}>GPA</Text>
          </View>
          <View
            style={[sheetS.statBox, { backgroundColor: C.surface }]}
          >
            <StarRow stars={recruit.stars} C={C} />
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
              Stars (ext)
            </Text>
          </View>
        </View>
      </View>

      {/* Other Offers */}
      {recruit.offers.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[sheetS.secTitle, { color: C.label }]}>Other Offers</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 8,
            }}
          >
            {recruit.offers.map((offer) => (
              <View
                key={offer}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: C.surface,
                  borderWidth: 1,
                  borderColor: C.inputBorder,
                }}
              >
                <Text style={{ fontSize: 12, color: C.secondary }}>{offer}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Film */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[sheetS.secTitle, { color: C.label }]}>Film</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.inputBorder,
            backgroundColor: C.surface,
            marginTop: 8,
          }}
        >
          <IconSymbol
            name="film.fill"
            size={16}
            color={recruit.hasFilm ? '#3B82F6' : C.muted}
          />
          <Text
            style={{
              fontSize: 13,
              color: recruit.hasFilm ? C.label : C.muted,
              marginLeft: 8,
            }}
          >
            {recruit.hasFilm ? 'Film available' : 'No film on file'}
          </Text>
        </View>
      </View>

      {/* Communication Log */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[sheetS.secTitle, { color: C.label }]}>Last Contact</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: '#3B82F6' + '18',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol
              name={contactIcon(recruit.contactType)}
              size={14}
              color="#3B82F6"
            />
          </View>
          <Text style={{ fontSize: 13, color: C.secondary }}>
            {recruit.lastContact}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: C.muted,
              textTransform: 'capitalize',
            }}
          >
            via {recruit.contactType}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {recruit.notes.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={[sheetS.secTitle, { color: C.label }]}>Notes</Text>
          <View
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.inputBorder,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>
              {recruit.notes}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {(['Schedule Contact', 'Move Stage', 'Compare'] as const).map(
          (action) => (
            <Pressable
              key={action}
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }
              style={{
                flex: 1,
                paddingVertical: 11,
                borderRadius: 12,
                backgroundColor:
                  action === 'Schedule Contact' ? '#3B82F6' : C.surface,
                borderWidth: action !== 'Schedule Contact' ? 1 : 0,
                borderColor: C.inputBorder,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color:
                    action === 'Schedule Contact' ? '#fff' : C.label,
                }}
              >
                {action}
              </Text>
            </Pressable>
          ),
        )}
      </View>
    </BottomSheet>
  );
}

const sheetS = StyleSheet.create({
  secTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.55,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RecruitsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  // ── Core state ──
  const [activeTab, setActiveTab]       = useState<Tab>('Board');
  const [role, setRole]                 = useState<Role>('Coach');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Board state ──
  const [stageFilter, setStageFilter]         = useState<RecruitStage | 'All'>('All');
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);
  const [sheetVisible, setSheetVisible]       = useState(false);

  // ── Pool state ──
  const [poolSearch, setPoolSearch]           = useState('');
  const [debouncedQuery, setDebouncedQuery]   = useState('');
  const [poolPosFilter, setPoolPosFilter]     = useState('All');
  const [poolLevelFilter, setPoolLevelFilter] = useState('All');
  const [poolSort, setPoolSort]               = useState('By PPG');
  const [poolPage, setPoolPage]               = useState(0);

  // ── Portal state ──
  const [portalPosFilter, setPortalPosFilter] = useState('All');

  // ── Toast ──
  const [toastMsg, setToastMsg]   = useState<string | null>(null);
  const toastTimer                = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Footer reset on focus ──
  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Debounce pool search (200ms) ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(poolSearch), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [poolSearch]);

  // ── Reset page when filters change ──
  useEffect(() => { setPoolPage(0); }, [debouncedQuery, poolPosFilter, poolLevelFilter, poolSort]);

  // ── Toast auto-dismiss ──
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // ── Role cycle ──
  const cycleRole = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole((r) => (r === 'Coach' ? 'Recruit' : 'Coach'));
  }, []);

  // ── Tab select ──
  const handleTabSelect = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setDropdownOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ── Pool query ──
  const poolLevelKey = useMemo((): string | string[] | undefined => {
    if (poolLevelFilter === 'All') return undefined;
    return LEVEL_KEY_MAP[poolLevelFilter] ?? poolLevelFilter;
  }, [poolLevelFilter]);

  const poolSortBy = useMemo(() => {
    if (poolSort === 'By PPG') return 'ppg' as const;
    if (poolSort === 'By RPG') return 'rpg' as const;
    return 'name' as const;
  }, [poolSort]);

  const poolResults = useMemo(() => nationalPool.search({
    query:    debouncedQuery || undefined,
    position: poolPosFilter !== 'All' ? poolPosFilter : undefined,
    level:    poolLevelKey,
    sortBy:   poolSortBy,
    sortDir:  poolSort === 'Alphabetical' ? 'asc' : 'desc',
    limit:    POOL_PAGE_SIZE * (poolPage + 1),
  }), [debouncedQuery, poolPosFilter, poolLevelKey, poolSortBy, poolSort, poolPage]);

  const poolTotal = useMemo(() => nationalPool.count({
    query:    debouncedQuery || undefined,
    position: poolPosFilter !== 'All' ? poolPosFilter : undefined,
    level:    poolLevelKey,
  }), [debouncedQuery, poolPosFilter, poolLevelKey]);

  const hasMorePool = poolResults.length < poolTotal;

  // ── Portal query ──
  const portalResults = useMemo(() => nationalPool.search({
    hasPortalEntry: true,
    position: portalPosFilter !== 'All' ? portalPosFilter : undefined,
    sortBy: 'ppg',
    sortDir: 'desc',
  }), [portalPosFilter]);

  // ── Computed ──
  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + PILL_ROW_H + 8;

  const stageCounts = useMemo(() => getStageCounts(), []);

  const boardFiltered = useMemo(() => {
    if (stageFilter === 'All') return RECRUITS_BOARD;
    return RECRUITS_BOARD.filter((r) => r.stage === stageFilter);
  }, [stageFilter]);

  // ── Evaluate handler ──
  const handleEvaluate = useCallback((p: NationalPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const query = `evaluate ${p.fullName} from ${p.school} (${p.levelDisplay})`;
    setPendingEvalQuery(query);
    router.push('/nexus' as any);
  }, [router]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  // ── Top Bar ──
  const renderTopBar = () => (
    <View
      style={[
        s.topBarOuter,
        { paddingTop: insets.top, backgroundColor: C.bg },
      ]}
    >
      {/* Title row */}
      <View style={s.topBar}>
        {/* Left: side panel */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openSidePanel();
          }}
          hitSlop={12}
          style={s.topBarBtn}
        >
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>

        {/* Center: dropdown pill */}
        <View style={s.dropdownPillWrap}>
          <Pressable
            style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
            onPress={() => setDropdownOpen((o) => !o)}
          >
            <Text style={[s.dropdownPillText, { color: C.label }]}>
              {activeTab}
            </Text>
            <IconSymbol
              name={dropdownOpen ? 'chevron.up' : 'chevron.down'}
              size={12}
              color={C.secondary}
            />
          </Pressable>
        </View>

        {/* Right: role pill */}
        <Pressable
          onPress={cycleRole}
          style={[
            s.rolePill,
            {
              backgroundColor:
                role === 'Coach' ? '#003A63' + '18' : '#3B82F6' + '18',
            },
          ]}
        >
          <Text
            style={[
              s.rolePillText,
              { color: role === 'Coach' ? '#003A63' : '#3B82F6' },
            ]}
          >
            {role}
          </Text>
        </Pressable>
      </View>

      {/* Pill row */}
      <View
        style={[s.pillsRow, { borderTopColor: C.separator }]}
      >
        {activeTab === 'Board' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsContent}
          >
            {BOARD_STAGES.map((st) => {
              const active = st === stageFilter;
              const count =
                st === 'All'
                  ? RECRUITS_BOARD.length
                  : (stageCounts[st as RecruitStage] ?? 0);
              return (
                <Pressable
                  key={st}
                  onPress={() => {
                    setStageFilter(st);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    s.pill,
                    {
                      backgroundColor: active ? '#3B82F6' : 'transparent',
                      borderColor: active ? '#3B82F6' : C.inputBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.pillText,
                      { color: active ? '#fff' : C.secondary },
                    ]}
                  >
                    {st}
                    {count > 0 ? ` ${count}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
        {activeTab === 'Pool' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsContent}
          >
            {POSITIONS.map((pos) => {
              const active = pos === poolPosFilter;
              return (
                <Pressable
                  key={pos}
                  onPress={() => {
                    setPoolPosFilter(pos);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    s.pill,
                    {
                      backgroundColor: active ? '#3B82F6' : 'transparent',
                      borderColor: active ? '#3B82F6' : C.inputBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.pillText,
                      { color: active ? '#fff' : C.secondary },
                    ]}
                  >
                    {pos}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
        {activeTab === 'Portal' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsContent}
          >
            {POSITIONS.map((pos) => {
              const active = pos === portalPosFilter;
              return (
                <Pressable
                  key={pos}
                  onPress={() => {
                    setPortalPosFilter(pos);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    s.pill,
                    {
                      backgroundColor: active ? '#3B82F6' : 'transparent',
                      borderColor: active ? '#3B82F6' : C.inputBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.pillText,
                      { color: active ? '#fff' : C.secondary },
                    ]}
                  >
                    {pos}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );

  // ── Board Tab ──
  const renderBoard = () => {
    // Recruit role: locked
    if (role === 'Recruit') {
      return (
        <View style={s.lockedWrap}>
          <IconSymbol name="lock.fill" size={40} color={C.muted} />
          <Text style={[s.lockedTitle, { color: C.label }]}>
            Coach View Only
          </Text>
          <Text style={[s.lockedSub, { color: C.secondary }]}>
            The recruiting board is visible to coaching staff only. Switch to
            your Recruit profile to see your recruiting status.
          </Text>
          <Pressable
            onPress={cycleRole}
            style={[s.switchBtn, { backgroundColor: '#3B82F6' }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              Switch to Recruit View
            </Text>
          </Pressable>
        </View>
      );
    }

    const FUNNEL_STAGES: RecruitStage[] = [
      'Identified', 'Evaluating', 'Offered', 'Verbal', 'Committed', 'Signed', 'Declined',
    ];

    return (
      <>
        {/* Pipeline funnel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              paddingHorizontal: 16,
              paddingVertical: 4,
            }}
          >
            {FUNNEL_STAGES.map((st) => {
              const count  = stageCounts[st] ?? 0;
              const color  = stageColor(st);
              const active = stageFilter === st;
              return (
                <Pressable
                  key={st}
                  onPress={() => {
                    setStageFilter(active ? 'All' : st);
                    Haptics.selectionAsync();
                  }}
                >
                  <GlassView
                    tier={1}
                    style={[
                      s.funnelCard,
                      active && { borderColor: color, borderWidth: 2 },
                    ]}
                  >
                    <Text style={[s.funnelCount, { color }]}>{count}</Text>
                    <Text style={[s.funnelLabel, { color: C.secondary }]}>
                      {st}
                    </Text>
                  </GlassView>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Board list */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {boardFiltered.length === 0 ? (
            <View style={s.emptyState}>
              <IconSymbol name="person.2" size={32} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>
                No recruits in this stage
              </Text>
            </View>
          ) : (
            boardFiltered.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => {
                  setSelectedRecruit(r);
                  setSheetVisible(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <GlassView tier={1} style={s.recruitCard}>
                  {/* Row 1: Avatar + name block + stage */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <AvatarCircle
                      initials={r.initials}
                      hue={r.hue}
                      size={44}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Text style={[s.recruitName, { color: C.label }]}>
                          {r.name}
                        </Text>
                        <View
                          style={[
                            s.posBadge,
                            { backgroundColor: '#003A63' + '18' },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: '#003A63',
                            }}
                          >
                            {r.position}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: C.secondary,
                          marginTop: 1,
                        }}
                      >
                        {r.school}, {r.state} · {r.classYear}
                      </Text>
                      <Text style={{ fontSize: 12, color: C.muted }}>
                        {r.heightFt} · {r.weight} lbs
                      </Text>
                    </View>
                    <StageBadge stage={r.stage} C={C} />
                  </View>

                  {/* Row 2: Badges */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 10,
                      alignItems: 'center',
                    }}
                  >
                    <PriorityTag priority={r.priority} C={C} />
                    <StarRow stars={r.stars} C={C} />
                    {r.kr !== undefined && (
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '800',
                            color: '#003A63',
                          }}
                        >
                          KR {r.kr.toFixed(1)}
                        </Text>
                        {r.krConf !== undefined && (
                          <Text style={{ fontSize: 10, color: C.muted }}>
                            {r.krConf}% conf
                          </Text>
                        )}
                      </View>
                    )}
                    {r.systemFit !== undefined && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: '#5A8A6E',
                          fontWeight: '600',
                        }}
                      >
                        Fit {r.systemFit}%
                      </Text>
                    )}
                  </View>

                  {/* Row 3: Last contact */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      marginTop: 8,
                    }}
                  >
                    <IconSymbol
                      name={contactIcon(r.contactType)}
                      size={11}
                      color={C.muted}
                    />
                    <Text style={{ fontSize: 11, color: C.muted }}>
                      Last contact: {r.lastContact}
                    </Text>
                  </View>
                </GlassView>
              </Pressable>
            ))
          )}
        </View>
      </>
    );
  };

  // ── Pool Tab — Coach View ──
  const renderPoolCoach = () => (
    <>
      {/* Nexus suggestion box */}
      <GlassView
        tier={1}
        style={[
          s.nexusBox,
          { marginHorizontal: 16, marginBottom: 16 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#3B82F6' + '18',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol name="sparkles" size={17} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#3B82F6',
                marginBottom: 2,
              }}
            >
              Ask Nexus to find prospects
            </Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>
              Find a rim protector who fits our switch defense →
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </View>
      </GlassView>

      {/* Result count + search bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
          {poolTotal.toLocaleString()} players
        </Text>
        <View
          style={[
            s.searchBar,
            {
              backgroundColor: C.surface,
              borderColor: C.inputBorder,
            },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            value={poolSearch}
            onChangeText={setPoolSearch}
            placeholder="Search prospects..."
            placeholderTextColor={C.muted}
            style={{
              flex: 1,
              fontSize: 14,
              color: C.label,
              marginLeft: 8,
              paddingVertical: Platform.OS === 'ios' ? 0 : 2,
            }}
          />
          {poolSearch.length > 0 && (
            <Pressable onPress={() => setPoolSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Level filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 8 }}
      >
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
          {LEVEL_PILLS.map((lvl) => {
            const active = lvl === poolLevelFilter;
            return (
              <Pressable
                key={lvl}
                onPress={() => {
                  setPoolLevelFilter(lvl);
                  Haptics.selectionAsync();
                }}
                style={[
                  s.filterPill,
                  {
                    backgroundColor: active ? '#003A63' + '18' : C.surface,
                    borderColor: active ? '#003A63' : C.inputBorder,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: active ? '700' : '500',
                    color: active ? '#003A63' : C.secondary,
                  }}
                >
                  {lvl}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sort pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
          {SORT_OPTIONS.map((opt) => {
            const active = opt === poolSort;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  setPoolSort(opt);
                  Haptics.selectionAsync();
                }}
                style={[
                  s.filterPill,
                  {
                    backgroundColor: active ? '#3B82F6' + '18' : C.surface,
                    borderColor: active ? '#3B82F6' : C.inputBorder,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: active ? '700' : '500',
                    color: active ? '#3B82F6' : C.secondary,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Pool list */}
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {poolResults.length === 0 ? (
          <View style={s.emptyState}>
            <IconSymbol name="person.2" size={32} color={C.muted} />
            <Text style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>
              No players found
            </Text>
          </View>
        ) : (
          poolResults.map((p) => {
            const initials = initialsFrom(p.fullName);
            const hue      = hueFrom(p.id);
            return (
              <GlassView key={p.id} tier={1} style={s.poolCard}>
                {/* Row 1: Avatar + info */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <AvatarCircle initials={initials} hue={hue} size={42} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>
                        {p.fullName}
                      </Text>
                      <View style={[s.posBadge, { backgroundColor: '#003A63' + '18' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#003A63' }}>
                          {p.position}
                        </Text>
                      </View>
                      <View style={[s.posBadge, { backgroundColor: C.surfacePressed }]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>
                          {p.levelDisplay}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                      {p.school} · {p.classYear} · {p.height}
                    </Text>
                  </View>
                </View>

                {/* Row 2: Stats chips + actions */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                  }}
                >
                  {/* Stats */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[
                      { label: 'PPG', val: p.ppg },
                      { label: 'RPG', val: p.rpg },
                      { label: 'APG', val: p.apg },
                    ].map((stat) => (
                      <View key={stat.label} style={[s.statChip, { backgroundColor: C.surface }]}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>
                          {stat.val != null ? stat.val.toFixed(1) : '-'}
                        </Text>
                        <Text style={{ fontSize: 10, color: C.muted }}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action buttons */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable
                      onPress={() => handleEvaluate(p)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        backgroundColor: '#3B82F6' + '18',
                        borderWidth: 1,
                        borderColor: '#3B82F6' + '40',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6' }}>
                        Evaluate
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        showToast(`${p.fullName} added to Board`);
                      }}
                      style={[
                        s.addBoardBtn,
                        { backgroundColor: C.surface, borderColor: C.inputBorder },
                      ]}
                    >
                      <IconSymbol name="plus" size={11} color="#3B82F6" />
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#3B82F6' }}>
                        Add
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </GlassView>
            );
          })
        )}

        {/* Load more */}
        {hasMorePool && (
          <Pressable
            onPress={() => {
              setPoolPage((p) => p + 1);
              Haptics.selectionAsync();
            }}
            style={{
              paddingVertical: 14,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.inputBorder,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>
              Load more · {(poolTotal - poolResults.length).toLocaleString()} remaining
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );

  // ── Pool Tab — Recruit View ──
  const renderPoolRecruit = () => (
    <View style={{ paddingHorizontal: 16, gap: 16 }}>
      {/* Profile completion */}
      <GlassView tier={1} style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>
            My Recruiting Profile
          </Text>
          <Text
            style={{ fontSize: 13, fontWeight: '700', color: '#3B82F6' }}
          >
            70% complete
          </Text>
        </View>
        <View
          style={{
            height: 6,
            backgroundColor: C.separator,
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: '70%',
              height: '100%',
              backgroundColor: '#3B82F6',
              borderRadius: 3,
            }}
          />
        </View>

        {/* Photo + Upload */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: C.surface,
              borderWidth: 2,
              borderColor: C.inputBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol name="person.fill" size={28} color={C.muted} />
          </View>
          <Pressable
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: '#3B82F6' + '18',
              borderWidth: 1,
              borderColor: '#3B82F6' + '40',
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: '#3B82F6' }}
            >
              Upload Photo
            </Text>
          </Pressable>
        </View>

        {/* Info rows */}
        {[
          { label: 'Name',     value: 'Jordan Williams' },
          { label: 'Position', value: 'PG' },
          { label: 'Class',    value: '2026' },
          { label: 'School',   value: 'Paul VI, VA' },
          { label: 'Height',   value: "6'1\"" },
          { label: 'GPA',      value: '3.4' },
          { label: 'SAT',      value: '1180' },
        ].map((row, i, arr) => (
          <View
            key={row.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 6,
              borderBottomWidth:
                i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}
          >
            <Text style={{ fontSize: 13, color: C.muted }}>{row.label}</Text>
            <Text
              style={{ fontSize: 13, fontWeight: '600', color: C.label }}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </GlassView>

      {/* Stats */}
      <GlassView tier={1} style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: C.label,
            marginBottom: 10,
          }}
        >
          Season Stats
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'PPG', val: '16.2' },
            { label: 'RPG', val: '4.8' },
            { label: 'APG', val: '5.3' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                backgroundColor: C.surface,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '900',
                  color: C.label,
                }}
              >
                {stat.val}
              </Text>
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </GlassView>

      {/* Film */}
      <GlassView tier={1} style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: C.label }}
          >
            Film
          </Text>
          <Pressable
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#3B82F6' + '18',
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: '700', color: '#3B82F6' }}
            >
              Upload
            </Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconSymbol name="film.fill" size={16} color="#5A8A6E" />
          <Text style={{ fontSize: 13, color: C.secondary }}>
            2 clips uploaded
          </Text>
        </View>
      </GlassView>

      {/* Best-Fit Programs */}
      <GlassView tier={1} style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: C.label,
            marginBottom: 14,
          }}
        >
          Best-Fit Programs
        </Text>
        {[
          {
            school: 'Lincoln University',
            fit: 87,
            note: 'PNR Motion matches your ball-handling style',
          },
          {
            school: 'Hampton University',
            fit: 82,
            note: 'High-tempo offense, strong academics',
          },
          {
            school: 'Norfolk State',
            fit: 78,
            note: 'Guard-heavy system, MEAC contender',
          },
        ].map((prog, i, arr) => (
          <View
            key={prog.school}
            style={{ marginBottom: i < arr.length - 1 ? 14 : 0 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: C.label }}
              >
                {prog.school}
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: '#5A8A6E' }}
              >
                {prog.fit}%
              </Text>
            </View>
            <View
              style={{
                height: 5,
                backgroundColor: C.separator,
                borderRadius: 3,
                overflow: 'hidden',
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  width: `${prog.fit}%`,
                  height: '100%',
                  backgroundColor: '#5A8A6E',
                  borderRadius: 3,
                }}
              />
            </View>
            <Text style={{ fontSize: 11, color: C.muted }}>{prog.note}</Text>
          </View>
        ))}
      </GlassView>

      {/* Who Viewed */}
      <GlassView tier={1} style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: C.label,
            marginBottom: 10,
          }}
        >
          Who Viewed My Profile
        </Text>
        {[
          'Lincoln University',
          'Hampton University',
          'Howard University',
        ].map((prog, i) => (
          <View
            key={prog}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 7,
              borderBottomWidth: i < 2 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#003A63' + '18',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol
                name="building.2.fill"
                size={14}
                color="#003A63"
              />
            </View>
            <Text
              style={{ fontSize: 13, fontWeight: '500', color: C.label }}
            >
              {prog}
            </Text>
          </View>
        ))}
      </GlassView>
    </View>
  );

  // ── Portal Tab ──
  const renderPortal = () => (
    <>
      {/* Intelligence banner */}
      <View
        style={[
          s.portalBanner,
          { backgroundColor: '#003A63', marginHorizontal: 16, marginBottom: 16 },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <IconSymbol name="sparkles" size={16} color="#B8942C" />
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
            Portal Intelligence
          </Text>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.80)',
            marginBottom: 4,
          }}
        >
          {portalResults.length} portal players match your position filter
        </Text>
      </View>

      {/* Portal list */}
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {portalResults.length === 0 ? (
          <View style={s.emptyState}>
            <IconSymbol name="arrow.left.arrow.right" size={32} color={C.muted} />
            <Text style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>
              No portal players for this position
            </Text>
          </View>
        ) : (
          portalResults.map((p) => {
            const initials = initialsFrom(p.fullName);
            const hue      = hueFrom(p.id);
            return (
              <GlassView key={p.id} tier={1} style={s.portalCard}>
                {/* Row 1 */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <AvatarCircle initials={initials} hue={hue} size={46} />
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: C.label,
                        }}
                      >
                        {p.fullName}
                      </Text>
                      <View
                        style={[
                          s.posBadge,
                          { backgroundColor: '#003A63' + '18' },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: '#003A63',
                          }}
                        >
                          {p.position}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}
                    >
                      {p.school} · {p.conference}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 5,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#5A8A6E' + '20',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: '#5A8A6E',
                          }}
                        >
                          Portal
                        </Text>
                      </View>
                      {p.portalEntryDate && (
                        <Text style={{ fontSize: 11, color: C.muted }}>
                          Entered {p.portalEntryDate}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Row 2: Stats chips */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {[
                    { label: 'PPG', val: p.ppg },
                    { label: 'RPG', val: p.rpg },
                    { label: 'APG', val: p.apg },
                  ].map((stat) => (
                    <View
                      key={stat.label}
                      style={[
                        s.statChip,
                        { backgroundColor: C.surface },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: C.label,
                        }}
                      >
                        {stat.val != null ? stat.val.toFixed(1) : '-'}
                      </Text>
                      <Text style={{ fontSize: 10, color: C.muted }}>
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Row 3: Actions */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 10,
                    alignSelf: 'flex-end',
                  }}
                >
                  <Pressable
                    onPress={() => handleEvaluate(p)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: '#3B82F6' + '18',
                      borderWidth: 1,
                      borderColor: '#3B82F6' + '40',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6' }}>
                      Evaluate
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      showToast(`Added ${p.fullName} to Board`);
                    }}
                    style={[
                      s.addBoardBtn,
                      {
                        backgroundColor: C.surface,
                        borderColor: C.inputBorder,
                      },
                    ]}
                  >
                    <IconSymbol name="plus" size={11} color="#3B82F6" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: '#3B82F6',
                      }}
                    >
                      Add to Board
                    </Text>
                  </Pressable>
                </View>
              </GlassView>
            );
          })
        )}
      </View>
    </>
  );

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Fixed top bar (absolute) */}
      {renderTopBar()}

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Board'  && renderBoard()}
        {activeTab === 'Pool'   && (role === 'Recruit' ? renderPoolRecruit() : renderPoolCoach())}
        {activeTab === 'Portal' && renderPortal()}
      </ScrollView>

      {/* FAB — Board tab, Coach role only */}
      {activeTab === 'Board' && role === 'Coach' && (
        <Pressable
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
          style={[
            s.fab,
            { backgroundColor: '#3B82F6', bottom: insets.bottom + 88 },
          ]}
        >
          <IconSymbol name="plus" size={24} color="#fff" />
        </Pressable>
      )}

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setDropdownOpen(false)}
          />
          <View
            style={[
              s.dropdown,
              {
                top: insets.top + 56,
                backgroundColor: C.bg,
                borderColor: C.separator,
              },
            ]}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                style={s.dropdownOption}
                onPress={() => handleTabSelect(tab)}
              >
                <Text
                  style={[
                    s.dropdownOptionText,
                    { color: tab === activeTab ? C.label : C.secondary },
                    tab === activeTab && { fontWeight: '600' },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Toast */}
      {toastMsg && (
        <Animated.View
          style={[
            s.toast,
            { backgroundColor: C.label, bottom: insets.bottom + 96 },
          ]}
        >
          <IconSymbol
            name="checkmark.circle.fill"
            size={14}
            color="#5A8A6E"
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: C.bg,
              marginLeft: 6,
            }}
          >
            {toastMsg}
          </Text>
        </Animated.View>
      )}

      {/* Recruit detail sheet */}
      <RecruitDetailSheet
        recruit={selectedRecruit}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        C={C}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Top bar
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    topBarBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownPillWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
    rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    rolePillText: { fontSize: 11, fontWeight: '700' },

    // Pill row
    pillsRow: {
      height: PILL_ROW_H,
      borderTopWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
    },
    pillsContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
    },
    pillText: { fontSize: 12, fontWeight: '600' },

    // Dropdown
    dropdown: {
      position: 'absolute',
      left: '25%',
      right: '25%',
      borderRadius: 14,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 99,
    },
    dropdownOption: { paddingVertical: 14, paddingHorizontal: 20 },
    dropdownOptionText: { fontSize: 15 },

    // Board
    funnelCard: {
      width: 82,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    funnelCount: { fontSize: 26, fontWeight: '900' },
    funnelLabel: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
      textAlign: 'center',
    },
    recruitCard: { padding: 14 },
    recruitName: { fontSize: 15, fontWeight: '700' },
    posBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },

    // Pool
    nexusBox: { padding: 14 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
    },
    filterPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
      borderWidth: 1,
    },
    poolCard: { padding: 14 },
    addBoardBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    statChip: {
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },

    // Portal
    portalBanner: {
      padding: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    portalCard: { padding: 14 },

    // FAB
    fab: {
      position: 'absolute',
      right: 20,
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },

    // Toast
    toast: {
      position: 'absolute',
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },

    // Locked / empty
    lockedWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingTop: 60,
      gap: 12,
    },
    lockedTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
    lockedSub: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
    switchBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 8,
    },
    emptyState: { alignItems: 'center', paddingVertical: 48 },
  });
}
