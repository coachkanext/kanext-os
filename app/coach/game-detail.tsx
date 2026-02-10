/**
 * Game Detail Screen
 * Single container for Pregame / Live / Report tabs.
 *
 * Default tab is context-aware:
 * - UPCOMING → Pregame
 * - LIVE → Live
 * - FINAL → Report
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabFooter } from '@/components/tab-footer';
import { useIsAuthenticated } from '@/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/core';
import { MOCK_ROSTER } from '@/data/mock-roster';
import { FIREBASE_LEADERS } from '@/data/firebase-lincoln';
import { triggerGameOps } from '@/utils/global-game-ops';

// ── Game Data ──

type GameStatus = 'upcoming' | 'live' | 'final';

interface GameData {
  opponent: string;
  date: string;
  location: string;
  status: GameStatus;
  score?: string;
  clock?: string;
  streamUrl?: string;
}

const ALL_GAMES: Record<string, GameData> = {
  '-Odr30YnjKA38ZfBZ6qB': { opponent: 'UNLV', date: 'Game 1', location: 'Away', status: 'final', score: 'L 59-123' },
  '-OgbmTnXpz994rOErPEo': { opponent: 'Loyola Marymount', date: 'Game 2', location: 'Away', status: 'final', score: 'L 54-137' },
  '-OgbzyEnODgmhH7yyXSJ': { opponent: 'Pepperdine', date: 'Game 3', location: 'Away', status: 'final', score: 'L 76-113' },
  '-OgcD9jAtLd0IFGX7lwI': { opponent: 'UC Irvine', date: 'Game 4', location: 'Away', status: 'final', score: 'L 63-130' },
  '-Ogd2OxdplE_N1hzwR_W': { opponent: 'Cal Maritime', date: 'Game 5', location: 'Away', status: 'final', score: 'L 102-108' },
  '-OgdZ7wZowES0FYO8FYE': { opponent: 'Ohlone', date: 'Game 6', location: 'Away', status: 'final', score: 'W 90-86' },
  '-OgjOc5JGIhECeCvETY6': { opponent: 'Simpson University', date: 'Game 7', location: 'Home', status: 'final', score: 'W 86-79' },
  '-Oi5tiQ8LDRW9FEUs_gf': { opponent: 'Cal Maritime', date: 'Game 8', location: 'Home', status: 'final', score: 'W 102-96' },
  '-OjE19psxjUfBfqrHZnB': { opponent: 'Cal Miramar', date: 'Game 9', location: 'Home', status: 'final', score: 'W 114-86' },
  '-OjOHCO32yY5URlwq6su': { opponent: 'Cal Miramar', date: 'Game 10', location: 'Home', status: 'final', score: 'W 93-73' },
  '-Ojn37CBTNgN9KpQQ22V': { opponent: 'Cal Prestige Tigers', date: 'Game 11', location: 'Home', status: 'final', score: 'W 127-60' },
  '-OkM7ZQIrwSjI9U37UGd': { opponent: 'Bethesda', date: 'Game 12', location: 'Home', status: 'final', score: 'W 112-88' },
  '-OitEKyFF5d9L8N0TgJR': { opponent: 'Cal State East Bay', date: 'Game 13', location: 'Away', status: 'live', score: '34-28', clock: 'Q2 4:12', streamUrl: 'https://portal.stretchinternet.com/csueastbay' },
};

type DetailTab = 'prep' | 'live' | 'report';

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'prep', label: 'Pregame' },
  { key: 'live', label: 'Live' },
  { key: 'report', label: 'Report' },
];

function defaultTab(status: GameStatus): DetailTab {
  switch (status) {
    case 'live': return 'live';
    case 'final': return 'report';
    default: return 'prep';
  }
}

// ── Scouting Notes: concise, surface-level bullets (3–5 max) ──
// Focus on opponent's top players / top threats. One sentence each.
const SCOUTING_NOTES: Record<string, string[]> = {
  'UNLV': [
    'Elite shooting team — 67% FG in last meeting.',
    'Limited Lincoln to 29% shooting in their matchup.',
    'Forced 18 turnovers with aggressive defense.',
  ],
  'Loyola Marymount': [
    'Shot 68% from the field and 92% from the line.',
    'Generated 28 assists as a team — elite ball movement.',
    'Outrebounded Lincoln 33-13.',
  ],
  'Pepperdine': [
    'Shot 61% from the field with 27 assists.',
    'Dominated the boards 41-14.',
    'Strong interior defense — limited second chances.',
  ],
  'UC Irvine': [
    'High-powered offense — 130 points in their meeting.',
    'Forced 18 Lincoln turnovers.',
    'Strong rebounding — dominated the glass.',
  ],
  'Cal Maritime': [
    'Physical team that plays at a fast tempo.',
    'Competitive games — Lincoln split the season series 1-1.',
    'Watch for their transition offense.',
  ],
  'Ohlone': [
    'Kalejaiye scored 33 in the win against them.',
    'Lincoln won the rebounding battle 30-22.',
    'They struggle against strong perimeter defense.',
  ],
  'Simpson University': [
    'Lincoln held them to 37 first-half points.',
    'Free throw shooting was key — Lincoln went 27-32.',
    'Their guards can shoot — close out hard.',
  ],
  'Cal Miramar': [
    'Lincoln dominated both meetings (114-86, 93-73).',
    'Strong Lincoln rebounding — 40+ boards both games.',
    'Vulnerable to balanced scoring attacks.',
  ],
  'Cal Prestige Tigers': [
    'Lincoln won 127-60 in their last meeting.',
    'Lincoln shot 57.5% from the field.',
    'Limited depth — fatigue is a factor.',
  ],
  'Bethesda': [
    'Lincoln won 112-88 in their meeting.',
    'Lincoln shot 46.6% and dominated the boards 43-23.',
    'Their defense struggles against interior scoring.',
  ],
  'Cal State East Bay': [
    'Upcoming game — scouting report in progress.',
    'Check back for opponent analysis.',
  ],
};

const DEFAULT_SCOUTING_NOTES = [
  'Scouting notes will be available as game day approaches.',
  'Check back for opponent analysis and top threats.',
];

// ── Keys to the Game: exactly 3, focused on OUR execution ──
const KEYS_TO_GAME: Record<string, [string, string, string]> = {
  'UNLV': ['Limit turnovers to under 12', 'Crash the offensive boards', 'Get to the free throw line'],
  'Loyola Marymount': ['Control tempo and limit possessions', 'Contest every three-point attempt', 'Attack the paint on offense'],
  'Pepperdine': ['Win the rebounding battle', 'Move the ball — 15+ assists', 'Limit fouls and stay disciplined'],
  'UC Irvine': ['Protect the ball — under 12 turnovers', 'Get stops in transition', 'Hit open threes'],
  'Cal Maritime': ['Play physical inside', 'Win the turnover battle', 'Execute in the half-court'],
  'Ohlone': ['Attack early and set the tempo', 'Get Kalejaiye going from deep', 'Rebound as a team'],
  'Simpson University': ['Get to the line and convert', 'Defend the three-point line', 'Control the boards'],
  'Cal Miramar': ['Push the pace in transition', 'Balanced scoring — 4+ in double figures', 'Dominate the paint'],
  'Cal Prestige Tigers': ['Share the ball and move without it', 'Lock in defensively from the start', 'Control the glass'],
  'Bethesda': ['Execute the game plan from start to finish', 'Win the rebounding battle', 'Limit turnovers'],
  'Cal State East Bay': ['Control the tempo', 'Execute the game plan', 'Play tough defense'],
};

const DEFAULT_KEYS: [string, string, string] = ['Control the tempo', 'Execute the game plan', 'Play tough defense'];

// Demo stat lines for final AND live games (rolling report)
const GAME_STATS: Record<string, { teamFG: string; team3P: string; teamFT: string; teamReb: string; teamTO: string }> = {
  '-Odr30YnjKA38ZfBZ6qB': { teamFG: '19-65 (29.2%)', team3P: '9-39 (23.1%)', teamFT: '12-18 (66.7%)', teamReb: '22', teamTO: '18' },
  '-OgbmTnXpz994rOErPEo': { teamFG: '18-60 (30.0%)', team3P: '7-32 (21.9%)', teamFT: '11-14 (78.6%)', teamReb: '13', teamTO: '20' },
  '-OgbzyEnODgmhH7yyXSJ': { teamFG: '28-57 (49.1%)', team3P: '14-29 (48.3%)', teamFT: '6-9 (66.7%)', teamReb: '14', teamTO: '11' },
  '-OgcD9jAtLd0IFGX7lwI': { teamFG: '21-58 (36.2%)', team3P: '11-30 (36.7%)', teamFT: '10-15 (66.7%)', teamReb: '14', teamTO: '18' },
  '-Ogd2OxdplE_N1hzwR_W': { teamFG: '32-76 (42.1%)', team3P: '15-41 (36.6%)', teamFT: '23-31 (74.2%)', teamReb: '28', teamTO: '21' },
  '-OgdZ7wZowES0FYO8FYE': { teamFG: '28-63 (44.4%)', team3P: '10-29 (34.5%)', teamFT: '24-31 (77.4%)', teamReb: '30', teamTO: '15' },
  '-OgjOc5JGIhECeCvETY6': { teamFG: '27-63 (42.9%)', team3P: '5-29 (17.2%)', teamFT: '27-32 (84.4%)', teamReb: '31', teamTO: '8' },
  '-Oi5tiQ8LDRW9FEUs_gf': { teamFG: '31-69 (44.9%)', team3P: '9-35 (25.7%)', teamFT: '31-41 (75.6%)', teamReb: '33', teamTO: '7' },
  '-OjE19psxjUfBfqrHZnB': { teamFG: '41-69 (59.4%)', team3P: '9-27 (33.3%)', teamFT: '23-36 (63.9%)', teamReb: '40', teamTO: '22' },
  '-OjOHCO32yY5URlwq6su': { teamFG: '30-64 (46.9%)', team3P: '6-23 (26.1%)', teamFT: '27-33 (81.8%)', teamReb: '41', teamTO: '12' },
  '-Ojn37CBTNgN9KpQQ22V': { teamFG: '50-87 (57.5%)', team3P: '14-35 (40.0%)', teamFT: '13-15 (86.7%)', teamReb: '56', teamTO: '18' },
  '-OkM7ZQIrwSjI9U37UGd': { teamFG: '34-73 (46.6%)', team3P: '9-27 (33.3%)', teamFT: '35-46 (76.1%)', teamReb: '43', teamTO: '8' },
};

// ── Game Flow (score at end of each period) ──
interface ScoreSnapshot { label: string; lu: number; opp: number }

const GAME_FLOW: Record<string, ScoreSnapshot[]> = {
  '-Odr30YnjKA38ZfBZ6qB': [{ label: '1Q', lu: 15, opp: 12 }, { label: '2Q', lu: 30, opp: 24 }, { label: '3Q', lu: 38, opp: 54 }, { label: '4Q', lu: 59, opp: 123 }],
  '-OgbmTnXpz994rOErPEo': [{ label: '1Q', lu: 8, opp: 54 }, { label: '2Q', lu: 16, opp: 108 }, { label: '3Q', lu: 31, opp: 138 }, { label: '4Q', lu: 54, opp: 137 }],
  '-OgbzyEnODgmhH7yyXSJ': [{ label: '1Q', lu: 16, opp: 58 }, { label: '2Q', lu: 32, opp: 116 }, { label: '3Q', lu: 54, opp: 149 }, { label: '4Q', lu: 76, opp: 113 }],
  '-OgcD9jAtLd0IFGX7lwI': [{ label: '1Q', lu: 17, opp: 34 }, { label: '2Q', lu: 34, opp: 68 }, { label: '3Q', lu: 47, opp: 98 }, { label: '4Q', lu: 63, opp: 130 }],
  '-Ogd2OxdplE_N1hzwR_W': [{ label: '1Q', lu: 24, opp: 28 }, { label: '2Q', lu: 48, opp: 56 }, { label: '3Q', lu: 73, opp: 78 }, { label: '4Q', lu: 102, opp: 108 }],
  '-OgdZ7wZowES0FYO8FYE': [{ label: '1Q', lu: 22, opp: 24 }, { label: '2Q', lu: 44, opp: 48 }, { label: '3Q', lu: 64, opp: 65 }, { label: '4Q', lu: 90, opp: 86 }],
  '-OgjOc5JGIhECeCvETY6': [{ label: '1Q', lu: 16, opp: 22 }, { label: '2Q', lu: 37, opp: 45 }, { label: '3Q', lu: 60, opp: 61 }, { label: '4Q', lu: 86, opp: 79 }],
  '-Oi5tiQ8LDRW9FEUs_gf': [{ label: '1Q', lu: 20, opp: 28 }, { label: '2Q', lu: 44, opp: 52 }, { label: '3Q', lu: 72, opp: 74 }, { label: '4Q', lu: 102, opp: 96 }],
  '-OjE19psxjUfBfqrHZnB': [{ label: '1Q', lu: 32, opp: 22 }, { label: '2Q', lu: 60, opp: 42 }, { label: '3Q', lu: 86, opp: 64 }, { label: '4Q', lu: 114, opp: 86 }],
  '-OjOHCO32yY5URlwq6su': [{ label: '1Q', lu: 22, opp: 16 }, { label: '2Q', lu: 46, opp: 36 }, { label: '3Q', lu: 70, opp: 54 }, { label: '4Q', lu: 93, opp: 73 }],
  '-Ojn37CBTNgN9KpQQ22V': [{ label: '1Q', lu: 30, opp: 14 }, { label: '2Q', lu: 64, opp: 28 }, { label: '3Q', lu: 94, opp: 44 }, { label: '4Q', lu: 127, opp: 60 }],
  '-OkM7ZQIrwSjI9U37UGd': [{ label: '1Q', lu: 24, opp: 22 }, { label: '2Q', lu: 50, opp: 44 }, { label: '3Q', lu: 80, opp: 66 }, { label: '4Q', lu: 112, opp: 88 }],
};

// ── Box Score (player stat lines) ──
interface BoxScoreLine { name: string; min: string; pts: number; reb: number; ast: number; fg: string }

const BOX_SCORE: Record<string, BoxScoreLine[]> = {
  '-Odr30YnjKA38ZfBZ6qB': [
    { name: 'Kalejaiye', min: '—', pts: 16, reb: 4, ast: 3, fg: '5-21' },
    { name: 'McKesey', min: '—', pts: 15, reb: 5, ast: 4, fg: '6-16' },
    { name: 'Williams', min: '—', pts: 11, reb: 6, ast: 0, fg: '3-9' },
    { name: 'Hernandez', min: '—', pts: 9, reb: 0, ast: 0, fg: '3-10' },
    { name: 'Manzo', min: '—', pts: 3, reb: 1, ast: 1, fg: '1-4' },
    { name: 'Diomande', min: '—', pts: 3, reb: 1, ast: 0, fg: '1-1' },
    { name: 'Chtelan', min: '—', pts: 2, reb: 2, ast: 1, fg: '0-1' },
    { name: 'Plantey', min: '—', pts: 0, reb: 0, ast: 1, fg: '0-2' },
    { name: 'Wall', min: '—', pts: 0, reb: 2, ast: 0, fg: '0-1' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-0' },
  ],
  '-OgbmTnXpz994rOErPEo': [
    { name: 'Williams', min: '—', pts: 21, reb: 4, ast: 4, fg: '6-10' },
    { name: 'Kalejaiye', min: '—', pts: 12, reb: 1, ast: 2, fg: '4-25' },
    { name: 'Chtelan', min: '—', pts: 10, reb: 1, ast: 0, fg: '4-5' },
    { name: 'McKesey', min: '—', pts: 2, reb: 4, ast: 1, fg: '1-8' },
    { name: 'Manzo', min: '—', pts: 3, reb: 0, ast: 0, fg: '1-2' },
    { name: 'Wall', min: '—', pts: 3, reb: 0, ast: 0, fg: '1-3' },
    { name: 'Diomande', min: '—', pts: 3, reb: 2, ast: 0, fg: '1-4' },
    { name: 'Plantey', min: '—', pts: 0, reb: 1, ast: 2, fg: '0-0' },
    { name: 'Hernandez', min: '—', pts: 0, reb: 0, ast: 0, fg: '0-3' },
  ],
  '-OgbzyEnODgmhH7yyXSJ': [
    { name: 'Kalejaiye', min: '—', pts: 38, reb: 3, ast: 2, fg: '13-22' },
    { name: 'Chtelan', min: '—', pts: 14, reb: 6, ast: 1, fg: '5-9' },
    { name: 'McKesey', min: '—', pts: 9, reb: 3, ast: 5, fg: '4-8' },
    { name: 'Williams', min: '—', pts: 9, reb: 1, ast: 4, fg: '4-6' },
    { name: 'Plantey', min: '—', pts: 3, reb: 1, ast: 3, fg: '1-5' },
    { name: 'Hernandez', min: '—', pts: 3, reb: 0, ast: 0, fg: '1-3' },
    { name: 'Wall', min: '—', pts: 0, reb: 0, ast: 2, fg: '0-1' },
    { name: 'Diomande', min: '—', pts: 0, reb: 0, ast: 1, fg: '0-3' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 0, ast: 0, fg: '0-0' },
  ],
  '-OgcD9jAtLd0IFGX7lwI': [
    { name: 'Kalejaiye', min: '—', pts: 19, reb: 3, ast: 3, fg: '6-17' },
    { name: 'Williams', min: '—', pts: 13, reb: 4, ast: 4, fg: '4-9' },
    { name: 'McKesey', min: '—', pts: 11, reb: 3, ast: 4, fg: '4-9' },
    { name: 'Hernandez', min: '—', pts: 6, reb: 1, ast: 0, fg: '2-5' },
    { name: 'Chtelan', min: '—', pts: 5, reb: 2, ast: 0, fg: '2-3' },
    { name: 'Plantey', min: '—', pts: 3, reb: 1, ast: 2, fg: '1-2' },
    { name: 'Wall', min: '—', pts: 3, reb: 0, ast: 0, fg: '1-5' },
    { name: 'Manzo', min: '—', pts: 3, reb: 0, ast: 1, fg: '1-5' },
    { name: 'Diomande', min: '—', pts: 0, reb: 0, ast: 0, fg: '0-3' },
  ],
  '-Ogd2OxdplE_N1hzwR_W': [
    { name: 'Kalejaiye', min: '—', pts: 32, reb: 5, ast: 3, fg: '10-24' },
    { name: 'Williams', min: '—', pts: 22, reb: 6, ast: 5, fg: '6-14' },
    { name: 'McKesey', min: '—', pts: 14, reb: 2, ast: 6, fg: '5-11' },
    { name: 'Chtelan', min: '—', pts: 12, reb: 6, ast: 1, fg: '3-6' },
    { name: 'Diomande', min: '—', pts: 8, reb: 4, ast: 2, fg: '3-6' },
    { name: 'Plantey', min: '—', pts: 5, reb: 2, ast: 2, fg: '2-4' },
    { name: 'Wall', min: '—', pts: 5, reb: 1, ast: 0, fg: '2-4' },
    { name: 'Manzo', min: '—', pts: 4, reb: 1, ast: 2, fg: '1-4' },
    { name: 'Hernandez', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-3' },
  ],
  '-OgdZ7wZowES0FYO8FYE': [
    { name: 'Kalejaiye', min: '—', pts: 33, reb: 5, ast: 3, fg: '10-23' },
    { name: 'Williams', min: '—', pts: 18, reb: 5, ast: 3, fg: '5-10' },
    { name: 'McKesey', min: '—', pts: 10, reb: 6, ast: 3, fg: '3-7' },
    { name: 'Chtelan', min: '—', pts: 8, reb: 5, ast: 2, fg: '2-5' },
    { name: 'Diomande', min: '—', pts: 7, reb: 2, ast: 1, fg: '2-4' },
    { name: 'Plantey', min: '—', pts: 6, reb: 2, ast: 3, fg: '2-5' },
    { name: 'Manzo', min: '—', pts: 5, reb: 3, ast: 1, fg: '2-4' },
    { name: 'Wall', min: '—', pts: 3, reb: 1, ast: 1, fg: '1-3' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-2' },
  ],
  '-OgjOc5JGIhECeCvETY6': [
    { name: 'Williams', min: '—', pts: 22, reb: 8, ast: 3, fg: '5-13' },
    { name: 'Kalejaiye', min: '—', pts: 18, reb: 3, ast: 2, fg: '5-14' },
    { name: 'McKesey', min: '—', pts: 15, reb: 5, ast: 5, fg: '5-10' },
    { name: 'Chtelan', min: '—', pts: 12, reb: 7, ast: 1, fg: '4-8' },
    { name: 'Diomande', min: '—', pts: 8, reb: 3, ast: 1, fg: '3-6' },
    { name: 'Plantey', min: '—', pts: 5, reb: 2, ast: 2, fg: '2-5' },
    { name: 'Manzo', min: '—', pts: 4, reb: 1, ast: 0, fg: '2-4' },
    { name: 'Wall', min: '—', pts: 2, reb: 1, ast: 1, fg: '1-2' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-1' },
  ],
  '-Oi5tiQ8LDRW9FEUs_gf': [
    { name: 'Kalejaiye', min: '—', pts: 25, reb: 6, ast: 3, fg: '8-18' },
    { name: 'Williams', min: '—', pts: 20, reb: 7, ast: 4, fg: '5-12' },
    { name: 'McKesey', min: '—', pts: 18, reb: 4, ast: 5, fg: '6-11' },
    { name: 'Chtelan', min: '—', pts: 14, reb: 6, ast: 1, fg: '4-8' },
    { name: 'Diomande', min: '—', pts: 10, reb: 5, ast: 1, fg: '3-6' },
    { name: 'Plantey', min: '—', pts: 8, reb: 2, ast: 1, fg: '3-5' },
    { name: 'Wall', min: '—', pts: 4, reb: 1, ast: 0, fg: '1-4' },
    { name: 'Manzo', min: '—', pts: 3, reb: 1, ast: 1, fg: '1-3' },
    { name: 'Hernandez', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-2' },
  ],
  '-OjE19psxjUfBfqrHZnB': [
    { name: 'Kalejaiye', min: '—', pts: 24, reb: 4, ast: 4, fg: '9-16' },
    { name: 'Williams', min: '—', pts: 22, reb: 8, ast: 5, fg: '7-12' },
    { name: 'Chtelan', min: '—', pts: 18, reb: 10, ast: 2, fg: '7-10' },
    { name: 'McKesey', min: '—', pts: 16, reb: 5, ast: 6, fg: '6-9' },
    { name: 'Diomande', min: '—', pts: 12, reb: 6, ast: 2, fg: '4-6' },
    { name: 'Plantey', min: '—', pts: 8, reb: 2, ast: 3, fg: '3-5' },
    { name: 'Wall', min: '—', pts: 6, reb: 2, ast: 1, fg: '2-4' },
    { name: 'Manzo', min: '—', pts: 5, reb: 1, ast: 1, fg: '2-4' },
    { name: 'Hernandez', min: '—', pts: 3, reb: 1, ast: 1, fg: '1-3' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-0' },
  ],
  '-OjOHCO32yY5URlwq6su': [
    { name: 'Williams', min: '—', pts: 23, reb: 5, ast: 4, fg: '7-14' },
    { name: 'McKesey', min: '—', pts: 18, reb: 7, ast: 5, fg: '6-10' },
    { name: 'Kalejaiye', min: '—', pts: 14, reb: 4, ast: 2, fg: '4-12' },
    { name: 'Chtelan', min: '—', pts: 12, reb: 8, ast: 2, fg: '4-7' },
    { name: 'Diomande', min: '—', pts: 10, reb: 8, ast: 1, fg: '3-5' },
    { name: 'Plantey', min: '—', pts: 6, reb: 3, ast: 2, fg: '2-5' },
    { name: 'Wall', min: '—', pts: 5, reb: 3, ast: 1, fg: '2-4' },
    { name: 'Manzo', min: '—', pts: 3, reb: 1, ast: 1, fg: '1-4' },
    { name: 'Hernandez', min: '—', pts: 2, reb: 1, ast: 0, fg: '1-3' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-0' },
  ],
  '-Ojn37CBTNgN9KpQQ22V': [
    { name: 'Kalejaiye', min: '—', pts: 28, reb: 3, ast: 5, fg: '11-18' },
    { name: 'Chtelan', min: '—', pts: 24, reb: 10, ast: 3, fg: '9-14' },
    { name: 'Williams', min: '—', pts: 18, reb: 9, ast: 6, fg: '6-10' },
    { name: 'McKesey', min: '—', pts: 16, reb: 6, ast: 8, fg: '6-10' },
    { name: 'Diomande', min: '—', pts: 14, reb: 10, ast: 2, fg: '5-8' },
    { name: 'Plantey', min: '—', pts: 10, reb: 5, ast: 4, fg: '4-8' },
    { name: 'Manzo', min: '—', pts: 8, reb: 4, ast: 2, fg: '3-6' },
    { name: 'Hernandez', min: '—', pts: 5, reb: 3, ast: 1, fg: '2-5' },
    { name: 'Wall', min: '—', pts: 4, reb: 4, ast: 1, fg: '2-4' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 2, ast: 0, fg: '0-4' },
  ],
  '-OkM7ZQIrwSjI9U37UGd': [
    { name: 'Kalejaiye', min: '—', pts: 25, reb: 4, ast: 3, fg: '8-15' },
    { name: 'Williams', min: '—', pts: 23, reb: 8, ast: 4, fg: '6-12' },
    { name: 'Chtelan', min: '—', pts: 20, reb: 7, ast: 2, fg: '6-10' },
    { name: 'McKesey', min: '—', pts: 16, reb: 6, ast: 3, fg: '5-10' },
    { name: 'Diomande', min: '—', pts: 10, reb: 8, ast: 1, fg: '3-6' },
    { name: 'Plantey', min: '—', pts: 8, reb: 3, ast: 2, fg: '3-6' },
    { name: 'Manzo', min: '—', pts: 5, reb: 3, ast: 1, fg: '2-5' },
    { name: 'Hernandez', min: '—', pts: 3, reb: 2, ast: 0, fg: '1-5' },
    { name: 'Wall', min: '—', pts: 2, reb: 1, ast: 0, fg: '0-3' },
    { name: 'Bansraj', min: '—', pts: 0, reb: 1, ast: 0, fg: '0-1' },
  ],
};

// ── Play-by-Play data (most recent first) ──
type PbpCategory = 'scoring' | 'foul' | 'sub' | 'timeout' | 'other';

interface PlayByPlayEvent {
  id: string;
  team: 'LU' | string;
  text: string;
  scoreAt: string; // running score at time of event
  category: PbpCategory;
}

const PLAY_BY_PLAY: Record<string, PlayByPlayEvent[]> = {
  '-OitEKyFF5d9L8N0TgJR': [
    // Most recent first — Q2 in progress, 4:12 remaining
    { id: 'pbp-28', team: 'CSEB', text: 'CSEB — Made 2PT (Paint)', scoreAt: '34-28', category: 'scoring' },
    { id: 'pbp-27', team: 'LU', text: 'Kalejaiye Made 2PT (Midrange)', scoreAt: '34-26', category: 'scoring' },
    { id: 'pbp-26', team: 'LU', text: 'McKesey Made FT (1 of 1)', scoreAt: '32-26', category: 'scoring' },
    { id: 'pbp-25', team: 'CSEB', text: 'Foul on CSEB — Shooting', scoreAt: '31-26', category: 'foul' },
    { id: 'pbp-24', team: 'CSEB', text: 'CSEB — Made 2PT (Fastbreak)', scoreAt: '31-26', category: 'scoring' },
    { id: 'pbp-23', team: 'LU', text: 'Williams Made 2PT (Layup)', scoreAt: '31-24', category: 'scoring' },
    { id: 'pbp-22', team: 'LU', text: 'SUB — Plantey in, Manzo out', scoreAt: '29-24', category: 'sub' },
    { id: 'pbp-21', team: 'CSEB', text: 'CSEB — Made 2PT (Paint)', scoreAt: '29-24', category: 'scoring' },
    { id: 'pbp-20', team: 'LU', text: 'Kalejaiye Made 3PT', scoreAt: '29-22', category: 'scoring' },
    { id: 'pbp-19', team: 'CSEB', text: 'CSEB — Made 3PT', scoreAt: '26-22', category: 'scoring' },
    { id: 'pbp-18', team: 'LU', text: 'Chtelan Made 2PT (Floater)', scoreAt: '26-19', category: 'scoring' },
    { id: 'pbp-17', team: 'LU', text: 'TIMEOUT — Lincoln', scoreAt: '24-19', category: 'timeout' },
    { id: 'pbp-16', team: 'CSEB', text: 'CSEB — Made 2PT (Layup)', scoreAt: '24-19', category: 'scoring' },
    { id: 'pbp-15', team: 'LU', text: 'McKesey Made 3PT', scoreAt: '24-17', category: 'scoring' },
    { id: 'pbp-14', team: 'CSEB', text: 'CSEB — Made FT (1 of 2)', scoreAt: '21-17', category: 'scoring' },
    { id: 'pbp-13', team: 'LU', text: 'Foul on Diomande — Shooting', scoreAt: '21-16', category: 'foul' },
    { id: 'pbp-12', team: 'LU', text: 'Williams Made 2PT (Driving)', scoreAt: '21-16', category: 'scoring' },
    // ── End of Q1 — LU 19, CSEB 16 ──
    { id: 'pbp-11', team: 'CSEB', text: 'CSEB — Made 2PT (Putback)', scoreAt: '19-16', category: 'scoring' },
    { id: 'pbp-10', team: 'LU', text: 'Kalejaiye Made 2PT (Turnaround)', scoreAt: '19-14', category: 'scoring' },
    { id: 'pbp-09', team: 'CSEB', text: 'CSEB — Made 3PT', scoreAt: '17-14', category: 'scoring' },
    { id: 'pbp-08', team: 'LU', text: 'Diomande Made 2PT (Dunk)', scoreAt: '17-11', category: 'scoring' },
    { id: 'pbp-07', team: 'CSEB', text: 'CSEB — Made 2PT (Floater)', scoreAt: '15-11', category: 'scoring' },
    { id: 'pbp-06', team: 'LU', text: 'Williams Made 3PT', scoreAt: '15-9', category: 'scoring' },
    { id: 'pbp-05', team: 'CSEB', text: 'CSEB — Made 2PT (Layup)', scoreAt: '12-9', category: 'scoring' },
    { id: 'pbp-04', team: 'LU', text: 'Chtelan Made 3PT', scoreAt: '12-7', category: 'scoring' },
    { id: 'pbp-03', team: 'CSEB', text: 'CSEB — Made FT (2 of 2)', scoreAt: '9-7', category: 'scoring' },
    { id: 'pbp-02b', team: 'LU', text: 'Foul on McKesey — Shooting', scoreAt: '9-5', category: 'foul' },
    { id: 'pbp-02', team: 'LU', text: 'McKesey Made 2PT (Midrange)', scoreAt: '9-5', category: 'scoring' },
    { id: 'pbp-01d', team: 'CSEB', text: 'TIMEOUT — CSEB', scoreAt: '7-5', category: 'timeout' },
    { id: 'pbp-01c', team: 'CSEB', text: 'CSEB — Made 3PT', scoreAt: '7-5', category: 'scoring' },
    { id: 'pbp-01b', team: 'LU', text: 'Kalejaiye Made 2PT (Layup)', scoreAt: '7-2', category: 'scoring' },
    { id: 'pbp-01a', team: 'LU', text: 'Williams Made 2PT (Driving)', scoreAt: '5-2', category: 'scoring' },
    { id: 'pbp-00b', team: 'CSEB', text: 'CSEB — Made 2PT (Layup)', scoreAt: '3-2', category: 'scoring' },
    { id: 'pbp-00a', team: 'LU', text: 'Kalejaiye Made 3PT', scoreAt: '3-0', category: 'scoring' },
  ],
};

const PBP_FILTER_OPTIONS: { key: PbpCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'foul', label: 'Fouls' },
  { key: 'sub', label: 'Subs' },
  { key: 'timeout', label: 'Timeouts' },
];

// ── Game Ops → Game Detail Data Converters ──

const LO_SCORING_PTS: Record<string, number> = {
  fg2_make: 2, fg3_make: 3, ft_make: 1,
};

function gameOpsFormatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function gameOpsPeriodLabel(period: number, format: string): string {
  if (format === 'halves') return period === 1 ? '1H' : period === 2 ? '2H' : `OT${period - 2}`;
  return period <= 4 ? `Q${period}` : `OT${period - 4}`;
}

function gameOpsEventToText(evt: any): string {
  const name = evt.playerName || '';
  switch (evt.type) {
    case 'fg2_make': return `${name} Made 2PT`;
    case 'fg2_miss': return `${name} Missed 2PT`;
    case 'fg3_make': return `${name} Made 3PT`;
    case 'fg3_miss': return `${name} Missed 3PT`;
    case 'ft_make': return `${name} Made FT`;
    case 'ft_miss': return `${name} Missed FT`;
    case 'reb_off': return `${name} Off Rebound`;
    case 'reb_def': return `${name} Def Rebound`;
    case 'ast': return `${name} Assist`;
    case 'stl': return `${name} Steal`;
    case 'blk': return `${name} Block`;
    case 'to': return `${name} Turnover`;
    case 'foul_personal': return `${name} Foul`;
    case 'foul_team': return 'Team Foul';
    case 'sub_in': return `Sub: ${name} IN`;
    case 'sub_out': return `Sub: ${name} OUT`;
    case 'timeout_us': return 'Timeout';
    case 'timeout_opp': return 'Timeout';
    default: return evt.type;
  }
}

function gameOpsEventCategory(type: string): PbpCategory {
  if (type.includes('make') || type.includes('miss')) return 'scoring';
  if (type.includes('foul')) return 'foul';
  if (type === 'sub_in' || type === 'sub_out') return 'sub';
  if (type.includes('timeout')) return 'timeout';
  return 'other';
}

function convertGameOpsToPlayByPlay(events: any[], opponentAbbr: string): PlayByPlayEvent[] {
  let luScore = 0;
  let oppScore = 0;
  const pbp: PlayByPlayEvent[] = [];
  for (const evt of events) {
    if (['period_start', 'period_end', 'game_end'].includes(evt.type)) continue;
    const pts = LO_SCORING_PTS[evt.type] ?? 0;
    if (evt.team === 'LU') luScore += pts;
    else oppScore += pts;
    pbp.push({
      id: evt.id,
      team: evt.team === 'LU' ? 'LU' : opponentAbbr,
      text: gameOpsEventToText(evt),
      scoreAt: `${luScore}-${oppScore}`,
      category: gameOpsEventCategory(evt.type),
    });
  }
  return pbp.reverse();
}

function computeGameOpsTeamStats(events: any[]) {
  let fgm = 0, fga = 0, tpm = 0, tpa = 0, ftm = 0, fta = 0, reb = 0, to = 0;
  for (const evt of events) {
    if (evt.team !== 'LU' || !evt.playerId) continue;
    switch (evt.type) {
      case 'fg2_make': fgm++; fga++; break;
      case 'fg2_miss': fga++; break;
      case 'fg3_make': fgm++; fga++; tpm++; tpa++; break;
      case 'fg3_miss': fga++; tpa++; break;
      case 'ft_make': ftm++; fta++; break;
      case 'ft_miss': fta++; break;
      case 'reb_off': case 'reb_def': reb++; break;
      case 'to': to++; break;
    }
  }
  const fgPct = fga > 0 ? ((fgm / fga) * 100).toFixed(1) : '0.0';
  const tpPct = tpa > 0 ? ((tpm / tpa) * 100).toFixed(1) : '0.0';
  const ftPct = fta > 0 ? ((ftm / fta) * 100).toFixed(1) : '0.0';
  return {
    teamFG: `${fgm}-${fga} (${fgPct}%)`,
    team3P: `${tpm}-${tpa} (${tpPct}%)`,
    teamFT: `${ftm}-${fta} (${ftPct}%)`,
    teamReb: `${reb}`,
    teamTO: `${to}`,
  };
}

function computeGameOpsPlayerStats(events: any[]) {
  const stats: Record<string, { pts: number; reb: number; ast: number; stl: number; blk: number; to: number; fgm: number; fga: number }> = {};
  for (const evt of events) {
    if (evt.team !== 'LU' || !evt.playerId) continue;
    if (!stats[evt.playerId]) {
      stats[evt.playerId] = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, fgm: 0, fga: 0 };
    }
    const s = stats[evt.playerId];
    switch (evt.type) {
      case 'fg2_make': s.pts += 2; s.fgm++; s.fga++; break;
      case 'fg2_miss': s.fga++; break;
      case 'fg3_make': s.pts += 3; s.fgm++; s.fga++; break;
      case 'fg3_miss': s.fga++; break;
      case 'ft_make': s.pts += 1; break;
      case 'reb_off': case 'reb_def': s.reb++; break;
      case 'ast': s.ast++; break;
      case 'stl': s.stl++; break;
      case 'blk': s.blk++; break;
      case 'to': s.to++; break;
    }
  }
  return stats;
}

const SEASON_LEADERS = FIREBASE_LEADERS.slice(0, 3).map((l) => {
  const lastName = l.name.split(' ').pop() || l.name;
  return { name: lastName, line: `${l.ppg} ppg, ${l.rpg} rpg, ${l.apg} apg` };
});

function computeGameOpsBoxScore(events: any[]): BoxScoreLine[] {
  const playerStats = computeGameOpsPlayerStats(events);
  return MOCK_ROSTER
    .filter((p) => playerStats[p.id])
    .sort((a, b) => (playerStats[b.id]?.pts ?? 0) - (playerStats[a.id]?.pts ?? 0))
    .map((p) => {
      const s = playerStats[p.id];
      const lastName = p.name.split(' ').pop() || p.name;
      return { name: lastName, min: '—', pts: s.pts, reb: s.reb, ast: s.ast, fg: `${s.fgm}-${s.fga}` };
    });
}

function computeGameOpsGameFlow(events: any[], periodFormat: string): ScoreSnapshot[] {
  const periodScores: Record<number, { lu: number; opp: number }> = {};
  let luScore = 0;
  let oppScore = 0;
  for (const evt of events) {
    const pts = LO_SCORING_PTS[evt.type] ?? 0;
    if (evt.team === 'LU') luScore += pts;
    else oppScore += pts;
    if (pts > 0) {
      periodScores[evt.period] = { lu: luScore, opp: oppScore };
    }
  }
  return Object.entries(periodScores)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([period, scores]) => ({
      label: gameOpsPeriodLabel(Number(period), periodFormat),
      lu: scores.lu,
      opp: scores.opp,
    }));
}

// ── Main Component ──

export default function GameDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const isAuthenticated = useIsAuthenticated();

  const game = ALL_GAMES[gameId ?? ''] ?? { opponent: 'Unknown', date: '—', location: '—', status: 'upcoming' as GameStatus };
  const [activeTab, setActiveTab] = useState<DetailTab>(() => defaultTab(game.status));

  const [pbpFilter, setPbpFilter] = useState<PbpCategory | 'all'>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showGameActions, setShowGameActions] = useState(false);

  const scoutingNotes = SCOUTING_NOTES[game.opponent] ?? DEFAULT_SCOUTING_NOTES;
  const keys = KEYS_TO_GAME[game.opponent] ?? DEFAULT_KEYS;
  const opponentAbbr = game.opponent.substring(0, 3).toUpperCase();

  // ── Live Ops data from AsyncStorage ──
  const [gameOpsData, setGameOpsData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const loadGameOps = async () => {
        try {
          const json = await AsyncStorage.getItem(`kx:gameOps:${gameId ?? ''}`);
          if (json) {
            const parsed = JSON.parse(json);
            if (parsed.phase && parsed.phase !== 'setup') {
              setGameOpsData(parsed);
            } else {
              setGameOpsData(null);
            }
          } else {
            setGameOpsData(null);
          }
        } catch {
          setGameOpsData(null);
        }
      };
      loadGameOps();
    }, [gameId])
  );

  // ── Derived data (Live Ops overrides mock when available) ──
  const hasGameOps = !!gameOpsData;
  const gameOpsEvents = hasGameOps ? (gameOpsData.events ?? []) : [];

  const mockStats = GAME_STATS[gameId ?? ''];
  const stats = hasGameOps
    ? computeGameOpsTeamStats(gameOpsEvents)
    : mockStats;

  const isWin = hasGameOps
    ? gameOpsData.luScore > gameOpsData.oppScore
    : game.score?.startsWith('W');
  const isLoss = hasGameOps
    ? gameOpsData.luScore < gameOpsData.oppScore
    : game.score?.startsWith('L');

  const pbpEvents = hasGameOps
    ? convertGameOpsToPlayByPlay(gameOpsEvents, opponentAbbr)
    : (PLAY_BY_PLAY[gameId ?? ''] ?? []);
  const filteredPbp = pbpFilter === 'all' ? pbpEvents : pbpEvents.filter((e) => e.category === pbpFilter);

  // Effective values for Live/Report display
  const effectiveLuScore = hasGameOps ? String(gameOpsData.luScore) : (game.score ? game.score.replace(/[WL]\s?/, '').split('-')[0] : '0');
  const effectiveOppScore = hasGameOps ? String(gameOpsData.oppScore) : (game.score ? game.score.replace(/[WL]\s?/, '').split('-')[1] : '0');
  const effectiveClock = hasGameOps
    ? `${gameOpsPeriodLabel(gameOpsData.period, gameOpsData.periodFormat ?? 'halves')} ${gameOpsFormatClock(gameOpsData.clockSeconds ?? 0)}`
    : game.clock;
  const effectiveIsLive = hasGameOps ? gameOpsData.phase === 'active' : game.status === 'live';
  const effectiveScoreStr = hasGameOps
    ? (gameOpsData.phase === 'locked'
        ? `${isWin ? 'W' : isLoss ? 'L' : 'T'} ${gameOpsData.luScore}-${gameOpsData.oppScore}`
        : `${gameOpsData.luScore}-${gameOpsData.oppScore}`)
    : game.score;
  const effectiveHasReport = hasGameOps || ((game.status === 'live' || game.status === 'final') && !!game.score);
  const effectiveBoxScore = hasGameOps ? computeGameOpsBoxScore(gameOpsEvents) : (BOX_SCORE[gameId ?? ''] ?? []);
  const effectiveGameFlow = hasGameOps ? computeGameOpsGameFlow(gameOpsEvents, gameOpsData?.periodFormat ?? 'halves') : (GAME_FLOW[gameId ?? ''] ?? []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Top App Bar (utility only) ── */}
      <View style={[styles.appBar, { borderBottomColor: colors.divider }]}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.appBarTitle, { color: colors.textSecondary }]}>Game</Text>
        <View style={styles.appBarRight}>
          {activeTab === 'live' && hasGameOps && (
            <Pressable
              style={({ pressed }) => [
                styles.appBarIcon,
                { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
              ]}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                await AsyncStorage.removeItem(`kx:gameOps:${gameId ?? ''}`);
                setGameOpsData(null);
                triggerGameOps(gameId ?? '', game.opponent);
                router.navigate('/(tabs)/nexus' as any);
              }}
            >
              <IconSymbol name="arrow.uturn.backward" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.appBarIcon,
              { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="sparkles" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Primary Game Header (scrolls with page) ── */}
        <View style={styles.gameHeader}>
          <View style={styles.gameTitleRow}>
            <Text style={[styles.gameTitle, { color: colors.text }]}>
              vs {game.opponent}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.appBarIcon,
                { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                triggerGameOps(gameId ?? '', game.opponent);
                router.navigate('/(tabs)/nexus' as any);
              }}
            >
              <IconSymbol name="basketball.fill" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[styles.gameMeta, { color: colors.textSecondary }]}>
            {game.date} · {game.location}
          </Text>
          {game.status === 'live' && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveText, { color: '#EF4444' }]}>
                LIVE · {game.clock}
              </Text>
            </View>
          )}
          {game.status === 'final' && game.score && (
            <Text style={[styles.scoreResult, { color: isWin ? '#f5f5f5' : '#EF4444' }]}>
              {game.score}
            </Text>
          )}
        </View>

        {/* ── Inner Game Tabs (Segmented Control) ── */}
        <View style={[styles.tabRow, { backgroundColor: colors.background }]}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabPill,
                  { backgroundColor: isActive ? colors.text : colors.backgroundSecondary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? colors.background : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ══════════ PREP TAB ══════════ */}
        {activeTab === 'prep' && (
          <View>
            {/* Game Info */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              GAME INFO
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <InfoRow label="Opponent" value={game.opponent} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <InfoRow label="Date" value={game.date} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <InfoRow label="Venue" value={game.location} colors={colors} />
            </View>

            {/* Scouting Notes — concise bullets */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              SCOUTING NOTES
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {scoutingNotes.map((note, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
                  <Text style={[styles.bulletText, { color: colors.text }]}>{note}</Text>
                </View>
              ))}
            </View>

            {/* Keys to the Game — exactly 3, focused on our execution */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              KEYS TO THE GAME
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {keys.map((key, i) => (
                <View key={i}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                  <View style={styles.keyRow}>
                    <View style={[styles.keyBadge, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.keyNumber, { color: colors.text }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════ LIVE TAB (Viewer Mode) ══════════ */}
        {activeTab === 'live' && (
          <View>
            {/* ── Live Header: Score + Clock + Period ── */}
            <View style={[styles.liveHeader, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.liveScoreRow}>
                <View style={styles.liveTeamCol}>
                  <Text style={[styles.liveTeamName, { color: colors.text }]}>LU</Text>
                  <Text style={[styles.liveScoreNum, { color: colors.text }]}>
                    {effectiveLuScore}
                  </Text>
                </View>

                <View style={styles.liveCenterCol}>
                  {effectiveIsLive ? (
                    <>
                      <View style={styles.liveIndicatorRow}>
                        <View style={styles.liveDotAnim} />
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                      </View>
                      <Text style={[styles.liveClockText, { color: colors.text }]}>{effectiveClock}</Text>
                    </>
                  ) : (hasGameOps && gameOpsData.phase === 'locked') || game.status === 'final' ? (
                    <Text style={[styles.livePeriodText, { color: colors.textTertiary }]}>FINAL</Text>
                  ) : (
                    <Text style={[styles.livePeriodText, { color: colors.textTertiary }]}>PRE-GAME</Text>
                  )}
                </View>

                <View style={styles.liveTeamCol}>
                  <Text style={[styles.liveTeamName, { color: colors.text }]}>{opponentAbbr}</Text>
                  <Text style={[styles.liveScoreNum, { color: colors.text }]}>
                    {effectiveOppScore}
                  </Text>
                </View>
              </View>

              {/* Watch Live CTA (secondary action) */}
              {game.status === 'live' && (
                game.streamUrl ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.watchLiveBtn,
                      { backgroundColor: colors.backgroundTertiary },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      if (game.streamUrl) WebBrowser.openBrowserAsync(game.streamUrl);
                    }}
                  >
                    <IconSymbol name="play.fill" size={14} color={colors.text} />
                    <Text style={[styles.watchLiveBtnText, { color: colors.text }]}>Watch Live</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.streamUnavailableBtn, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.streamUnavailableText, { color: colors.textTertiary }]}>
                      Stream Unavailable
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* ── Filters (collapsed by default) ── */}
            <Pressable
              style={styles.filterToggle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFiltersExpanded((prev) => !prev);
              }}
            >
              <Text style={[styles.filterToggleText, { color: colors.textTertiary }]}>
                {filtersExpanded ? 'Hide Filters' : 'Filter'}
                {pbpFilter !== 'all' ? ` · ${PBP_FILTER_OPTIONS.find((f) => f.key === pbpFilter)?.label}` : ''}
              </Text>
              <IconSymbol
                name={filtersExpanded ? 'chevron.up' : 'chevron.down'}
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>

            {filtersExpanded && (
              <View style={styles.filterRow}>
                {PBP_FILTER_OPTIONS.map((opt) => {
                  const isActive = pbpFilter === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      style={[
                        styles.filterChip,
                        { backgroundColor: isActive ? colors.text : colors.backgroundSecondary },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPbpFilter(opt.key);
                      }}
                    >
                      <Text style={[styles.filterChipText, { color: isActive ? colors.background : colors.textSecondary }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* ── Play-by-Play Stream ── */}
            {filteredPbp.length > 0 ? (
              <View style={[styles.pbpCard, { backgroundColor: colors.backgroundSecondary }]}>
                {filteredPbp.map((event, index) => {
                  const isLU = event.team === 'LU';
                  return (
                    <View key={event.id}>
                      {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                      <View style={styles.pbpRow}>
                        <View style={[styles.pbpTeamBadge, { backgroundColor: isLU ? colors.text + '15' : colors.backgroundTertiary }]}>
                          <Text style={[styles.pbpTeamText, { color: isLU ? colors.text : colors.textSecondary }]}>
                            {event.team === 'LU' ? 'LU' : opponentAbbr}
                          </Text>
                        </View>
                        <Text style={[styles.pbpAction, { color: colors.text }]} numberOfLines={2}>
                          {event.text}
                        </Text>
                        <Text style={[styles.pbpScore, { color: colors.textTertiary }]}>
                          {event.scoreAt}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : effectiveIsLive ? (
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    No {pbpFilter !== 'all' ? pbpFilter : ''} events yet.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.emptyState}>
                  <IconSymbol name="sportscourt.fill" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    Play-by-play available when the game is live.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ══════════ REPORT TAB (Rolling Game Report — ONE UI) ══════════ */}
        {activeTab === 'report' && (
          <View>
            {effectiveHasReport ? (
              <>
                {/* 1. Score Header */}
                <View style={[styles.resultCard, { backgroundColor: colors.backgroundSecondary }]}>
                  {effectiveIsLive ? (
                    <View style={styles.reportStatusBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.reportLiveText}>LIVE</Text>
                    </View>
                  ) : (
                    <Text style={[styles.resultOutcome, { color: isWin ? '#f5f5f5' : '#EF4444' }]}>
                      {isWin ? 'Victory' : 'Defeat'}
                    </Text>
                  )}
                  <Text style={[styles.resultScore, { color: colors.text }]}>
                    {effectiveScoreStr}
                  </Text>
                  <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                    vs {game.opponent} · {game.date} · {game.location}
                    {effectiveIsLive && effectiveClock ? ` · ${effectiveClock}` : ''}
                  </Text>
                </View>

                {/* 2. Team Stats */}
                {stats && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                      TEAM STATS
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                      <InfoRow label="FG" value={stats.teamFG} colors={colors} />
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                      <InfoRow label="3PT" value={stats.team3P} colors={colors} />
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                      <InfoRow label="FT" value={stats.teamFT} colors={colors} />
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                      <InfoRow label="Rebounds" value={stats.teamReb} colors={colors} />
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                      <InfoRow label="Turnovers" value={stats.teamTO} colors={colors} />
                    </View>
                  </>
                )}

                {/* 3. Game Flow */}
                {effectiveGameFlow.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                      GAME FLOW
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                      <GameFlowChart
                        snapshots={effectiveGameFlow}
                        colors={colors}
                      />
                    </View>
                  </>
                )}

                {/* 4. Leaders */}
                {SEASON_LEADERS.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                      LEADERS
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                      {SEASON_LEADERS.map((leader, i) => (
                        <View key={i}>
                          {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                          <View style={styles.leaderRow}>
                            <Text style={[styles.leaderName, { color: colors.text }]}>{leader.name}</Text>
                            <Text style={[styles.leaderLine, { color: colors.textSecondary }]}>{leader.line}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* 5. Box Score */}
                {effectiveBoxScore.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                      BOX SCORE
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, padding: 0 }]}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                          {/* Header */}
                          <View style={[styles.boxHeaderRow, { borderBottomColor: colors.divider }]}>
                            <Text style={[styles.boxHeaderCell, styles.boxColName, { color: colors.textTertiary }]}>PLAYER</Text>
                            <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>MIN</Text>
                            <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>PTS</Text>
                            <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>REB</Text>
                            <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>AST</Text>
                            <Text style={[styles.boxHeaderCell, styles.boxColFg, { color: colors.textTertiary }]}>FG</Text>
                          </View>
                          {/* Rows */}
                          {effectiveBoxScore.map((player, idx) => (
                            <View
                              key={player.name}
                              style={[
                                styles.boxRow,
                                idx % 2 === 1 && { backgroundColor: colors.backgroundTertiary + '40' },
                              ]}
                            >
                              <Text style={[styles.boxCell, styles.boxColName, { color: colors.text, fontWeight: '500' }]}>
                                {player.name}
                              </Text>
                              <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{player.min}</Text>
                              <Text style={[styles.boxCell, styles.boxColStat, { color: colors.text, fontWeight: '600' }]}>{player.pts}</Text>
                              <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{player.reb}</Text>
                              <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{player.ast}</Text>
                              <Text style={[styles.boxCell, styles.boxColFg, { color: colors.textSecondary }]}>{player.fg}</Text>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </>
                )}

                {/* 6. Play-by-Play */}
                {pbpEvents.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                      PLAY-BY-PLAY
                    </Text>
                    <View style={[styles.pbpCard, { backgroundColor: colors.backgroundSecondary }]}>
                      {pbpEvents.map((event, index) => {
                        const isLU = event.team === 'LU';
                        return (
                          <View key={event.id}>
                            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                            <View style={styles.pbpRow}>
                              <View style={[styles.pbpTeamBadge, { backgroundColor: isLU ? colors.text + '15' : colors.backgroundTertiary }]}>
                                <Text style={[styles.pbpTeamText, { color: isLU ? colors.text : colors.textSecondary }]}>
                                  {event.team === 'LU' ? 'LU' : opponentAbbr}
                                </Text>
                              </View>
                              <Text style={[styles.pbpAction, { color: colors.text }]} numberOfLines={2}>
                                {event.text}
                              </Text>
                              <Text style={[styles.pbpScore, { color: colors.textTertiary }]}>
                                {event.scoreAt}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* 7. Nexus Analysis */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                  NEXUS ANALYSIS
                </Text>
                <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                    {!effectiveIsLive
                      ? isWin
                        ? `Strong performance from LU with a final score of ${effectiveLuScore}-${effectiveOppScore} against ${game.opponent}. ${stats ? `Team shot ${stats.teamFG} from the field with ${stats.teamTO} turnovers.` : ''} Film priority: late-game execution and free-throw routine.`
                        : `${game.opponent} came out on top ${effectiveOppScore}-${effectiveLuScore}. ${stats ? `LU shot ${stats.teamFG} from the field with ${stats.teamTO} turnovers.` : ''} Film priority: ball security and defensive rotations.`
                      : `${effectiveClock ? `Through ${effectiveClock}` : 'In progress'}, LU ${Number(effectiveLuScore) > Number(effectiveOppScore) ? 'leads' : Number(effectiveLuScore) < Number(effectiveOppScore) ? 'trails' : 'is tied'} ${effectiveLuScore}-${effectiveOppScore}. ${stats ? `Shooting ${stats.teamFG} from the field with ${stats.teamTO} turnovers.` : ''} Key to watch: maintaining execution against ${game.opponent}.`}
                  </Text>
                </View>

                {/* Ask Nexus CTA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.nexusCard,
                    { backgroundColor: colors.backgroundSecondary, marginTop: Spacing.lg },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="sparkles" size={20} color={colors.text} />
                  <Text style={[styles.nexusText, { color: colors.text }]}>
                    Ask Nexus about this game
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                </Pressable>
              </>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.emptyState}>
                  <IconSymbol name="doc.text.fill" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    Game report available once the game begins.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Game Actions Bottom Sheet ── */}
      <Modal
        visible={showGameActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGameActions(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowGameActions(false)} />
          <View style={[styles.sheetContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Game Actions</Text>
              <Pressable onPress={() => setShowGameActions(false)}>
                <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Watch Live */}
            <Pressable
              style={[styles.sheetRow, { opacity: game.streamUrl ? 1 : 0.4 }]}
              disabled={!game.streamUrl}
              onPress={() => {
                setShowGameActions(false);
                if (game.streamUrl) WebBrowser.openBrowserAsync(game.streamUrl);
              }}
            >
              <IconSymbol name="play.fill" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Watch Live</Text>
              {!game.streamUrl && (
                <Text style={[styles.sheetRowMeta, { color: colors.textTertiary }]}>No link set</Text>
              )}
            </Pressable>

            {/* Open Report (Live) */}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                setShowGameActions(false);
                setActiveTab('report');
              }}
            >
              <IconSymbol name="tablecells" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Open Report (Live)</Text>
            </Pressable>

            {/* Share Game Link */}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGameActions(false);
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Share Game Link</Text>
            </Pressable>

            {/* Enter Game Ops */}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGameActions(false);
                router.push({ pathname: '/coach/game-ops', params: { gameId: gameId ?? '' } } as any);
              }}
            >
              <IconSymbol name="plus.circle.fill" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Enter Game Ops</Text>
            </Pressable>

            {/* Set/Update Stream Link (Coach/Admin) */}
            <View style={[styles.sheetDivider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGameActions(false);
              }}
            >
              <IconSymbol name="link" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>
                {game.streamUrl ? 'Update Stream Link' : 'Add Stream Link'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TabFooter activeTab="Home" />
    </View>
  );
}

// ── Shared Info Row ──

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ── Game Flow Chart (score margin over time) ──

function GameFlowChart({ snapshots, colors }: { snapshots: ScoreSnapshot[]; colors: typeof Colors.light }) {
  const maxScore = Math.max(...snapshots.flatMap((s) => [s.lu, s.opp]));
  const barScale = maxScore > 0 ? 100 / maxScore : 1;

  return (
    <View>
      {/* Legend */}
      <View style={styles.flowLegend}>
        <View style={styles.flowLegendItem}>
          <View style={[styles.flowLegendDot, { backgroundColor: colors.text }]} />
          <Text style={[styles.flowLegendLabel, { color: colors.textSecondary }]}>LU</Text>
        </View>
        <View style={styles.flowLegendItem}>
          <View style={[styles.flowLegendDot, { backgroundColor: colors.textTertiary }]} />
          <Text style={[styles.flowLegendLabel, { color: colors.textSecondary }]}>OPP</Text>
        </View>
      </View>

      {/* Period bars */}
      {snapshots.map((snap, i) => {
        const margin = snap.lu - snap.opp;
        return (
          <View key={i} style={styles.flowPeriodRow}>
            <Text style={[styles.flowPeriodLabel, { color: colors.textTertiary }]}>{snap.label}</Text>
            <View style={styles.flowBarContainer}>
              {/* LU bar */}
              <View style={styles.flowBarRow}>
                <View
                  style={[
                    styles.flowBar,
                    { width: `${snap.lu * barScale}%`, backgroundColor: colors.text },
                  ]}
                />
                <Text style={[styles.flowBarValue, { color: colors.text }]}>{snap.lu}</Text>
              </View>
              {/* OPP bar */}
              <View style={styles.flowBarRow}>
                <View
                  style={[
                    styles.flowBar,
                    { width: `${snap.opp * barScale}%`, backgroundColor: colors.textTertiary + '60' },
                  ]}
                />
                <Text style={[styles.flowBarValue, { color: colors.textTertiary }]}>{snap.opp}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.flowMargin,
                { color: margin > 0 ? '#f5f5f5' : margin < 0 ? '#EF4444' : colors.textTertiary },
              ]}
            >
              {margin > 0 ? `+${margin}` : margin === 0 ? 'TIE' : `${margin}`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // App bar (utility only)
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  appBarTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  appBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  appBarIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },

  // Primary game header
  gameHeader: {
    marginBottom: Spacing.md,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameTitle: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
  },
  gameMeta: {
    fontSize: 15,
    marginTop: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scoreResult: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },

  // Tab segmented control
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Cards
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // Info rows (shared)
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Scouting bullet notes
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 21,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  scoutingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
  },
  scoutingCtaText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Keys to the game
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  keyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  keyText: {
    fontSize: 15,
    flex: 1,
  },

  // Live header (Viewer Mode)
  liveHeader: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  liveScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveTeamCol: {
    flex: 1,
    alignItems: 'center',
  },
  liveTeamName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  liveScoreNum: {
    fontSize: 44,
    fontWeight: '700',
  },
  liveCenterCol: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  liveDotAnim: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#EF4444',
  },
  liveClockText: {
    fontSize: 16,
    fontWeight: '600',
  },
  livePeriodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  watchLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  watchLiveBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streamUnavailableBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  streamUnavailableText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Filters (collapsed by default)
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Play-by-play stream
  pbpCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pbpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 10,
  },
  pbpTeamBadge: {
    width: 36,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  pbpTeamText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pbpAction: {
    fontSize: 14,
    flex: 1,
  },
  pbpScore: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'right',
  },

  // Result card (Report tab)
  resultCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
    alignItems: 'center',
  },
  reportStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportLiveText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#EF4444',
  },
  resultOutcome: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultScore: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  resultMeta: {
    fontSize: 13,
    marginTop: 6,
  },

  // Leaders (Report tab)
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderLine: {
    fontSize: 14,
  },

  // Nexus card
  nexusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  nexusText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  // Game flow chart
  flowLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  flowLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flowLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  flowLegendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  flowPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  flowPeriodLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 32,
  },
  flowBarContainer: {
    flex: 1,
    gap: 3,
  },
  flowBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 14,
  },
  flowBar: {
    height: 10,
    borderRadius: 5,
    minWidth: 4,
  },
  flowBarValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  flowMargin: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },

  // Box score table
  boxHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  boxHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  boxColName: {
    width: 100,
  },
  boxColStat: {
    width: 44,
    textAlign: 'center',
  },
  boxColFg: {
    width: 56,
    textAlign: 'center',
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  boxCell: {
    fontSize: 13,
  },

  // Game Actions bottom sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  sheetRowText: {
    fontSize: 16,
    flex: 1,
  },
  sheetRowMeta: {
    fontSize: 13,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },

  // Body text
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
