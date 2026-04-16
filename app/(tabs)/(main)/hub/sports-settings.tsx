/**
 * Sports Hub — Settings. Head Coach + Player.
 * Head Coach: program profile, film & scouting, team, notifications.
 * Player: profile and notifications.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;

type ToggleKey =
  | 'pubProgramProfile' | 'showRosterPublicly' | 'showSeasonStats'
  | 'filmLibraryAccess' | 'hideScoutingFromPlayers' | 'privatePracticeFilm'
  | 'teamDirectoryVisibility' | 'rosterChangeAlerts' | 'eligibilityAlerts'
  | 'newRecruitInquiry' | 'gameDayReminders' | 'coachKrUpdates'
  | 'showMyProfile' | 'showMyStatsPublicly'
  | 'newFilmAssignment' | 'playerKrUpdateAlerts' | 'academicAlerts' | 'coachMessages';

type ToggleRow = { icon: string; label: string; stateKey: ToggleKey };
type Section   = { header: string; rows: ToggleRow[] };

const COACH_SECTIONS: Section[] = [
  {
    header: 'PROGRAM',
    rows: [
      { icon: 'building.2.fill',             label: 'Public Program Profile',             stateKey: 'pubProgramProfile'       },
      { icon: 'person.2.fill',               label: 'Show Roster Publicly',               stateKey: 'showRosterPublicly'      },
      { icon: 'chart.bar.fill',              label: 'Show Season Stats',                  stateKey: 'showSeasonStats'         },
    ],
  },
  {
    header: 'FILM & SCOUTING',
    rows: [
      { icon: 'film.fill',                   label: 'Film Library Access',                stateKey: 'filmLibraryAccess'       },
      { icon: 'eye.slash.fill',              label: 'Hide Scouting Reports from Players', stateKey: 'hideScoutingFromPlayers' },
      { icon: 'lock.fill',                   label: 'Private Practice Film',              stateKey: 'privatePracticeFilm'     },
    ],
  },
  {
    header: 'TEAM',
    rows: [
      { icon: 'person.3.fill',               label: 'Team Directory Visibility',          stateKey: 'teamDirectoryVisibility' },
      { icon: 'bell.badge.fill',             label: 'Roster Change Alerts',               stateKey: 'rosterChangeAlerts'      },
      { icon: 'arrow.triangle.2.circlepath', label: 'Eligibility Alerts',                 stateKey: 'eligibilityAlerts'       },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'tray.and.arrow.down.fill',       label: 'New Recruit Inquiry', stateKey: 'newRecruitInquiry' },
      { icon: 'calendar.badge.exclamationmark', label: 'Game Day Reminders',  stateKey: 'gameDayReminders'  },
      { icon: 'chart.line.uptrend.xyaxis',      label: 'KR Updates',          stateKey: 'coachKrUpdates'    },
    ],
  },
];

const PLAYER_SECTIONS: Section[] = [
  {
    header: 'MY PROFILE',
    rows: [
      { icon: 'person.crop.rectangle', label: 'Show My Profile',        stateKey: 'showMyProfile'       },
      { icon: 'chart.bar.fill',        label: 'Show My Stats Publicly', stateKey: 'showMyStatsPublicly' },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'film.fill',                 label: 'New Film Assignment', stateKey: 'newFilmAssignment'    },
      { icon: 'chart.line.uptrend.xyaxis', label: 'KR Update Alerts',   stateKey: 'playerKrUpdateAlerts' },
      { icon: 'graduationcap.fill',        label: 'Academic Alerts',     stateKey: 'academicAlerts'       },
      { icon: 'bell.fill',                 label: 'Coach Messages',      stateKey: 'coachMessages'        },
    ],
  },
];

function ToggleRowItem({
  row, C, s, value, onToggle,
}: {
  row: ToggleRow;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={s.row}>
      <IconSymbol name={row.icon as any} size={22} color={C.label} />
      <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.separator, true: C.label }}
        thumbColor={C.bg}
        ios_backgroundColor={C.separator}
      />
    </View>
  );
}

export default function SportsSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];

  const [pubProgramProfile,       setPubProgramProfile]       = useState(true);
  const [showRosterPublicly,      setShowRosterPublicly]      = useState(true);
  const [showSeasonStats,         setShowSeasonStats]         = useState(true);
  const [filmLibraryAccess,       setFilmLibraryAccess]       = useState(true);
  const [hideScoutingFromPlayers, setHideScoutingFromPlayers] = useState(true);
  const [privatePracticeFilm,     setPrivatePracticeFilm]     = useState(true);
  const [teamDirectoryVisibility, setTeamDirectoryVisibility] = useState(true);
  const [rosterChangeAlerts,      setRosterChangeAlerts]      = useState(true);
  const [eligibilityAlerts,       setEligibilityAlerts]       = useState(true);
  const [newRecruitInquiry,       setNewRecruitInquiry]       = useState(true);
  const [gameDayReminders,        setGameDayReminders]        = useState(true);
  const [coachKrUpdates,          setCoachKrUpdates]          = useState(false);
  const [showMyProfile,           setShowMyProfile]           = useState(true);
  const [showMyStatsPublicly,     setShowMyStatsPublicly]     = useState(false);
  const [newFilmAssignment,       setNewFilmAssignment]       = useState(true);
  const [playerKrUpdateAlerts,    setPlayerKrUpdateAlerts]    = useState(true);
  const [academicAlerts,          setAcademicAlerts]          = useState(true);
  const [coachMessages,           setCoachMessages]           = useState(true);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubProgramProfile, showRosterPublicly, showSeasonStats,
    filmLibraryAccess, hideScoutingFromPlayers, privatePracticeFilm,
    teamDirectoryVisibility, rosterChangeAlerts, eligibilityAlerts,
    newRecruitInquiry, gameDayReminders, coachKrUpdates,
    showMyProfile, showMyStatsPublicly,
    newFilmAssignment, playerKrUpdateAlerts, academicAlerts, coachMessages,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    switch (key) {
      case 'pubProgramProfile':       setPubProgramProfile(v => !v);       break;
      case 'showRosterPublicly':      setShowRosterPublicly(v => !v);      break;
      case 'showSeasonStats':         setShowSeasonStats(v => !v);         break;
      case 'filmLibraryAccess':       setFilmLibraryAccess(v => !v);       break;
      case 'hideScoutingFromPlayers': setHideScoutingFromPlayers(v => !v); break;
      case 'privatePracticeFilm':     setPrivatePracticeFilm(v => !v);     break;
      case 'teamDirectoryVisibility': setTeamDirectoryVisibility(v => !v); break;
      case 'rosterChangeAlerts':      setRosterChangeAlerts(v => !v);      break;
      case 'eligibilityAlerts':       setEligibilityAlerts(v => !v);       break;
      case 'newRecruitInquiry':       setNewRecruitInquiry(v => !v);       break;
      case 'gameDayReminders':        setGameDayReminders(v => !v);        break;
      case 'coachKrUpdates':          setCoachKrUpdates(v => !v);          break;
      case 'showMyProfile':           setShowMyProfile(v => !v);           break;
      case 'showMyStatsPublicly':     setShowMyStatsPublicly(v => !v);     break;
      case 'newFilmAssignment':       setNewFilmAssignment(v => !v);       break;
      case 'playerKrUpdateAlerts':    setPlayerKrUpdateAlerts(v => !v);    break;
      case 'academicAlerts':          setAcademicAlerts(v => !v);          break;
      case 'coachMessages':           setCoachMessages(v => !v);           break;
    }
  }, []);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
            style={s.kBtn}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Settings</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {(isCoach ? COACH_SECTIONS : PLAYER_SECTIONS).map(section => (
          <View key={section.header} style={{ marginBottom: 28 }}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>{section.header}</Text>
            <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
              {section.rows.map((row, idx) => (
                <View key={row.stateKey}>
                  {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                  <ToggleRowItem
                    row={row}
                    C={C}
                    s={s}
                    value={toggleValues[row.stateKey]}
                    onToggle={() => handleToggle(row.stateKey)}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, marginBottom: 8 },
  sectionCard:   { borderRadius: 14, paddingHorizontal: 16 },
  row:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  rowLabel:      { flex: 1, fontSize: 15, fontWeight: '500' },
  rowSep:        { height: StyleSheet.hairlineWidth },
});
