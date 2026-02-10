/**
 * Firebase data for Lincoln University Oakland basketball.
 * Source: lincolnu.firebaseio.com (canonical)
 *
 * This module provides all real team data fetched from Firebase.
 */

import type { PlayerGameStats, BoxScore } from './mock-sports';

// =============================================================================
// PLAYERS (Firebase canonical)
// =============================================================================

export interface FirebasePlayer {
  firebaseId: string;
  name: string;
  number: string;
}

export const FIREBASE_PLAYERS: FirebasePlayer[] = [
  { firebaseId: '-Odr229TQ8KdPySMyRe3', name: 'Brandon Williams', number: '1' },
  { firebaseId: '-Odr28fXZ1PAywR_ZSZM', name: 'Chris Plantey', number: '2' },
  { firebaseId: '-Odr2S7334mI1oNPr7Xe', name: 'Claude McKesey', number: '3' },
  { firebaseId: '-Odr2zkNjJGFqpjbz_0m', name: 'Samuel Manzo', number: '5' },
  { firebaseId: '-Odr2ak0NipmJ1HrVDBG', name: 'Samuel Wall', number: '6' },
  { firebaseId: '-Odr2k8iYj_HpNEavahl', name: 'Adrian Hernandez', number: '10' },
  { firebaseId: '-Odr1sH515CZXb6HY3MV', name: 'Laolu Kalejaiye', number: '11' },
  { firebaseId: '-Odr2YTtI83XmnGL4IxI', name: 'Nathan Chtelan', number: '15' },
  { firebaseId: '-Odr2n0mvKerMx2TJlha', name: 'Nicholas Bansraj', number: '20' },
  { firebaseId: '-Odr2tTMS7y7v1NcaUCI', name: 'Paul Diomande', number: '21' },
];

// =============================================================================
// FIREBASE GAME (extended Game with article/quarterScores)
// =============================================================================

export interface FirebaseArticle {
  headline: string;
  body: string;
  reporterName: string;
}

export interface FirebaseGame {
  id: string;
  opponent: string;
  date: Date;
  time: string;
  location: string;
  venue: 'home' | 'away' | 'neutral';
  status: 'upcoming' | 'live' | 'final';
  result?: {
    homeScore: number;
    awayScore: number;
    isWin: boolean;
  };
  boxScore?: BoxScore;
  quarterScores?: { lincoln: number[]; opponent: number[] };
  article?: FirebaseArticle;
  isConference: boolean;
}

// =============================================================================
// GAMES (from Firebase)
// =============================================================================

export const FIREBASE_GAMES: FirebaseGame[] = [
  {
    id: '-Odr30YnjKA38ZfBZ6qB',
    opponent: 'UNLV',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'UNLV',
    venue: 'away',
    status: 'final',
    result: { homeScore: 123, awayScore: 59, isWin: false },
    boxScore: {
      teamStats: {
        points: 59,
        rebounds: 22,
        assists: 10,
        steals: 3,
        blocks: 0,
        turnovers: 18,
        fgPct: 29.2,
        threePct: 23.1,
        ftPct: 66.7,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 16, rebounds: 4, assists: 3, steals: 1, blocks: 0, turnovers: 3, fouls: 2, fgMade: 5, fgAttempted: 21, threeMade: 4, threeAttempted: 16, ftMade: 2, ftAttempted: 5 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 11, rebounds: 6, assists: 0, steals: 2, blocks: 0, turnovers: 1, fouls: 4, fgMade: 3, fgAttempted: 9, threeMade: 0, threeAttempted: 3, ftMade: 5, ftAttempted: 7 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 0, rebounds: 0, assists: 1, steals: 0, blocks: 0, turnovers: 0, fouls: 0, fgMade: 0, fgAttempted: 2, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 1 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 15, rebounds: 5, assists: 4, steals: 0, blocks: 0, turnovers: 7, fouls: 1, fgMade: 6, fgAttempted: 16, threeMade: 1, threeAttempted: 4, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 2, rebounds: 2, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 4, fgMade: 0, fgAttempted: 1, threeMade: 0, threeAttempted: 1, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 0, rebounds: 2, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 2, fgMade: 0, fgAttempted: 1, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 9, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 0, fgMade: 3, fgAttempted: 10, threeMade: 3, threeAttempted: 9, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2n0mvKerMx2TJlha', playerName: 'Nicholas Bansraj', playerNumber: '20', minutes: 0, points: 0, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 0, fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 3, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 4, fgMade: 1, fgAttempted: 1, threeMade: 0, threeAttempted: 0, ftMade: 1, ftAttempted: 1 },
          { playerId: '-Odr2zkNjJGFqpjbz_0m', playerName: 'Samuel Manzo', playerNumber: '5', minutes: 0, points: 3, rebounds: 1, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 0, fgMade: 1, fgAttempted: 4, threeMade: 1, threeAttempted: 4, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [15, 15, 8, 8], opponent: [12, 12, 30, 30] },
    article: {
      headline: `UNLV Doubles Down: Dominates Lincoln University 66-33 in Lopsided Victory`,
      body: `In a dominant performance, UNLV overwhelmed Lincoln University with a final score of 66-33. UNLV\'s shooting prowess was on full display as they converted 67% of their shots from the field. Meanwhile, Lincoln University struggled offensively, shooting just 33%.\n\nLaolu Kalejaiye led Lincoln University with 8 points and 3 assists, while Claude McKesey added 10 points and 3 rebounds. However, their efforts could not overcome UNLV\'s offensive efficiency. Lincoln found it difficult to keep pace, only managing 5 three-pointers on 22 attempts, for a 23% success rate.\n\nOffensive efficiency was a clear advantage for UNLV, who also dominated the boards with 19 total rebounds compared to 11 from Lincoln. Despite an equal number of fouls, Lincoln University\'s 10 turnovers compared to UNLV\'s 2 were costly. Ultimately, UNLV\'s strong all-around game left Lincoln searching for answers in a one-sided affair.`,
      reporterName: 'Taylor Johnson',
    },
    isConference: false,
  },
  {
    id: '-OgbmTnXpz994rOErPEo',
    opponent: 'Loyola Marymount University',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Loyola Marymount University',
    venue: 'away',
    status: 'final',
    result: { homeScore: 137, awayScore: 54, isWin: false },
    boxScore: {
      teamStats: {
        points: 54,
        rebounds: 13,
        assists: 9,
        steals: 4,
        blocks: 0,
        turnovers: 20,
        fgPct: 30.0,
        threePct: 21.9,
        ftPct: 78.6,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 12, rebounds: 1, assists: 2, steals: 1, blocks: 0, turnovers: 4, fouls: 3, fgMade: 4, fgAttempted: 25, threeMade: 2, threeAttempted: 19, ftMade: 2, ftAttempted: 3 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 21, rebounds: 4, assists: 4, steals: 1, blocks: 0, turnovers: 5, fouls: 1, fgMade: 6, fgAttempted: 10, threeMade: 1, threeAttempted: 2, ftMade: 8, ftAttempted: 9 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 0, rebounds: 1, assists: 2, steals: 1, blocks: 0, turnovers: 1, fouls: 2, fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 2, rebounds: 4, assists: 1, steals: 1, blocks: 0, turnovers: 5, fouls: 2, fgMade: 1, fgAttempted: 8, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 10, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 2, fgMade: 4, fgAttempted: 5, threeMade: 2, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 3, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 2, fgMade: 1, fgAttempted: 3, threeMade: 1, threeAttempted: 3, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 2, fgMade: 0, fgAttempted: 3, threeMade: 0, threeAttempted: 3, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 3, rebounds: 2, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 3, fgMade: 1, fgAttempted: 4, threeMade: 0, threeAttempted: 1, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2zkNjJGFqpjbz_0m', playerName: 'Samuel Manzo', playerNumber: '5', minutes: 0, points: 3, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 1, fgMade: 1, fgAttempted: 2, threeMade: 1, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [8, 8, 15, 15], opponent: [54, 54, 30, 30] },
    article: {
      headline: `Loyola Marymount Dominates Lincoln 137-54; Brandon Williams' 21 Can't Save Lions`,
      body: `Loyola Marymount University dominated from start to finish in a commanding 137-54 victory over Lincoln University. Displaying remarkable shooting accuracy, LMU hit 68% of their field goals, compared to just 30% by Lincoln. This offensive prowess was bolstered by their impressive 92% free-throw shooting.\n\nLincoln\'s Brandon Williams tried to keep his team competitive, scoring 21 points, with solid contributions from Nathan Chtelan\'s 10 points. However, Lincoln struggled beyond the arc, making only 22% of their three-point attempts. Loyola Marymount\'s defensive pressure forced Lincoln into 21 turnovers, contributing to the lopsided score.\n\nIn terms of team play, Loyola Marymount distributed the ball efficiently, racking up 28 assists against Lincoln\'s 9. The Lions also controlled the glass, outrebounding Lincoln 33 to 13, and converting their dominance into 11 second-chance points. This emphatic win showcases LMU\'s potential as a powerhouse team this season.`,
      reporterName: 'Dakota Brown',
    },
    isConference: false,
  },
  {
    id: '-OgbzyEnODgmhH7yyXSJ',
    opponent: 'Pepperdine',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Pepperdine',
    venue: 'away',
    status: 'final',
    result: { homeScore: 113, awayScore: 76, isWin: false },
    boxScore: {
      teamStats: {
        points: 76,
        rebounds: 14,
        assists: 18,
        steals: 7,
        blocks: 1,
        turnovers: 11,
        fgPct: 49.1,
        threePct: 48.3,
        ftPct: 66.7,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 38, rebounds: 3, assists: 2, steals: 2, blocks: 0, turnovers: 1, fouls: 3, fgMade: 13, fgAttempted: 22, threeMade: 12, threeAttempted: 19, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 9, rebounds: 1, assists: 4, steals: 1, blocks: 0, turnovers: 2, fouls: 1, fgMade: 4, fgAttempted: 6, threeMade: 0, threeAttempted: 2, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 3, rebounds: 1, assists: 3, steals: 1, blocks: 0, turnovers: 1, fouls: 0, fgMade: 1, fgAttempted: 5, threeMade: 1, threeAttempted: 5, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 9, rebounds: 3, assists: 5, steals: 2, blocks: 0, turnovers: 2, fouls: 0, fgMade: 4, fgAttempted: 8, threeMade: 0, threeAttempted: 0, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 14, rebounds: 6, assists: 1, steals: 1, blocks: 1, turnovers: 1, fouls: 4, fgMade: 5, fgAttempted: 9, threeMade: 0, threeAttempted: 0, ftMade: 4, ftAttempted: 5 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 0, rebounds: 0, assists: 2, steals: 0, blocks: 0, turnovers: 0, fouls: 1, fgMade: 0, fgAttempted: 1, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 3, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 0, fgMade: 1, fgAttempted: 3, threeMade: 1, threeAttempted: 3, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2n0mvKerMx2TJlha', playerName: 'Nicholas Bansraj', playerNumber: '20', minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 0, fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 0, rebounds: 0, assists: 1, steals: 0, blocks: 0, turnovers: 2, fouls: 3, fgMade: 0, fgAttempted: 3, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [16, 16, 22, 22], opponent: [58, 58, 33, 33] },
    article: {
      headline: `Laolu Kalejaiye's 38 Points Not Enough as Pepperdine Overpowers Lincoln 113-76`,
      body: `Pepperdine soared past Lincoln University with a commanding 113-76 victory. A sharp shooting display saw Pepperdine hit an impressive 61% from the field. Despite a dazzling performance by Lincoln\'s Laolu Kalejaiye, who poured in 38 points and 12 three-pointers, Lincoln couldn\'t keep up with Pepperdine\'s offensive onslaught.\n\nKalejaiye was the lone bright spot for Lincoln, as they struggled on the boards, managing only 14 rebounds to Pepperdine\'s 41. Lincoln was productive from beyond the arc, hitting 48%, but Pepperdine dominated inside, generated 17 second-chance points and committed just 7 turnovers. \n\nPepperdine\'s team effort was evident as they chalked up 27 assists, capitalizing on their high offensive efficiency. Lincoln\'s Nathan Chtelan added a solid 14 points with six rebounds, but the team\'s overall defensive lapses gave Pepperdine the opening to deliver this lopsided result. Despite equal fouls, Lincoln failed to utilize their free-throw attempts effectively, and the game slipped out of reach.`,
      reporterName: 'Morgan Williams',
    },
    isConference: false,
  },
  {
    id: '-OgcD9jAtLd0IFGX7lwI',
    opponent: 'UC Irvine',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'UC Irvine',
    venue: 'away',
    status: 'final',
    result: { homeScore: 130, awayScore: 63, isWin: false },
    boxScore: {
      teamStats: {
        points: 63,
        rebounds: 14,
        assists: 14,
        steals: 8,
        blocks: 1,
        turnovers: 18,
        fgPct: 36.2,
        threePct: 36.7,
        ftPct: 66.7,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 19, rebounds: 1, assists: 1, steals: 2, blocks: 0, turnovers: 3, fouls: 2, fgMade: 7, fgAttempted: 13, threeMade: 5, threeAttempted: 10, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 10, rebounds: 1, assists: 2, steals: 2, blocks: 1, turnovers: 3, fouls: 0, fgMade: 3, fgAttempted: 8, threeMade: 1, threeAttempted: 2, ftMade: 3, ftAttempted: 6 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 3, rebounds: 0, assists: 1, steals: 0, blocks: 0, turnovers: 3, fouls: 1, fgMade: 1, fgAttempted: 2, threeMade: 1, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 2, rebounds: 3, assists: 7, steals: 1, blocks: 0, turnovers: 4, fouls: 1, fgMade: 0, fgAttempted: 6, threeMade: 0, threeAttempted: 3, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 16, rebounds: 5, assists: 1, steals: 1, blocks: 0, turnovers: 0, fouls: 3, fgMade: 6, fgAttempted: 13, threeMade: 3, threeAttempted: 7, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 4, rebounds: 0, assists: 1, steals: 0, blocks: 0, turnovers: 2, fouls: 1, fgMade: 1, fgAttempted: 2, threeMade: 0, threeAttempted: 1, ftMade: 2, ftAttempted: 3 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 3, rebounds: 0, assists: 1, steals: 2, blocks: 0, turnovers: 0, fouls: 1, fgMade: 1, fgAttempted: 5, threeMade: 1, threeAttempted: 4, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2n0mvKerMx2TJlha', playerName: 'Nicholas Bansraj', playerNumber: '20', minutes: 0, points: 0, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 0, fgMade: 0, fgAttempted: 2, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 6, rebounds: 3, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 2, fgMade: 2, fgAttempted: 7, threeMade: 0, threeAttempted: 0, ftMade: 2, ftAttempted: 2 },
      ],
    },
    quarterScores: { lincoln: [16, 16, 10, 10], opponent: [64, 64, 50, 50] },
    article: {
      headline: `UC Irvine Crushes Lincoln 130-63 Despite Kalejaiye's 19-Point Effort`,
      body: `In a dominant display, UC Irvine crushed Lincoln University 130-63. The Anteaters showcased superior shooting with a remarkable 65% from the field, leaving Lincoln University\'s 36% in the dust. The disparity in performance was further highlighted by UC Irvine\'s 45 rebounds compared to Lincoln\'s 15.\n\nLincoln University\'s top scorer, Laolu Kalejaiye, put up a valiant effort with 19 points and an impressive 5-10 from beyond the arc. Nathan Chtelan added 16 points, proving to be another bright spot in an otherwise overwhelming defeat. Despite Brandon Williams contributing 10 points and two steals, Lincoln struggled to match UC Irvine\'s efficiency.\n\nOverall, UC Irvine\'s offensive efficiency soared at 160.2, nearly doubling Lincoln\'s 84.6. The Anteaters capitalized on Lincoln\'s 18 turnovers, converting them into 14 points. With UC Irvine\'s relentless pace and precision, the game was firmly in their control from start to finish.`,
      reporterName: 'Avery Jones',
    },
    isConference: false,
  },
  {
    id: '-Ogd2OxdplE_N1hzwR_W',
    opponent: 'Cal Maritime',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Cal Maritime',
    venue: 'away',
    status: 'final',
    result: { homeScore: 108, awayScore: 102, isWin: false },
    boxScore: {
      teamStats: {
        points: 102,
        rebounds: 28,
        assists: 21,
        steals: 8,
        blocks: 2,
        turnovers: 21,
        fgPct: 42.1,
        threePct: 36.6,
        ftPct: 74.2,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 26, rebounds: 2, assists: 1, steals: 0, blocks: 0, turnovers: 2, fouls: 4, fgMade: 7, fgAttempted: 16, threeMade: 6, threeAttempted: 13, ftMade: 6, ftAttempted: 6 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 24, rebounds: 6, assists: 5, steals: 1, blocks: 0, turnovers: 10, fouls: 3, fgMade: 7, fgAttempted: 14, threeMade: 1, threeAttempted: 4, ftMade: 9, ftAttempted: 13 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 6, rebounds: 1, assists: 3, steals: 1, blocks: 0, turnovers: 0, fouls: 2, fgMade: 2, fgAttempted: 2, threeMade: 2, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 14, rebounds: 7, assists: 10, steals: 1, blocks: 0, turnovers: 4, fouls: 3, fgMade: 4, fgAttempted: 15, threeMade: 0, threeAttempted: 4, ftMade: 6, ftAttempted: 7 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 10, rebounds: 4, assists: 0, steals: 0, blocks: 1, turnovers: 1, fouls: 3, fgMade: 5, fgAttempted: 8, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 1 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 11, rebounds: 2, assists: 2, steals: 2, blocks: 0, turnovers: 1, fouls: 2, fgMade: 3, fgAttempted: 6, threeMade: 3, threeAttempted: 4, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 8, rebounds: 1, assists: 0, steals: 3, blocks: 0, turnovers: 1, fouls: 4, fgMade: 3, fgAttempted: 7, threeMade: 2, threeAttempted: 6, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 0, rebounds: 4, assists: 0, steals: 0, blocks: 1, turnovers: 2, fouls: 1, fgMade: 0, fgAttempted: 2, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 2 },
          { playerId: '-Odr2zkNjJGFqpjbz_0m', playerName: 'Samuel Manzo', playerNumber: '5', minutes: 0, points: 3, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 0, fgMade: 1, fgAttempted: 6, threeMade: 1, threeAttempted: 6, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [18, 18, 36, 36], opponent: [38, 38, 14, 14] },
    article: {
      headline: `Kalejaiye and Williams Shine in Lincoln's 108-102 Thriller Loss to Cal Maritime`,
      body: `Cal Maritime narrowly edged out Lincoln University in a thrilling 108-102 victory. While Cal Maritime\'s team stats shone with a 59% field goal shooting performance, it was Lincoln University\'s standout individual performances that turned heads. Laolu Kalejaiye led the way for Lincoln with 26 points, spectacularly shooting 6-for-13 from beyond the arc.\n\nHot on Kalejaiye\'s heels, Brandon Williams added 24 points, contributing significantly with 6 rebounds and 5 assists. Claude McKesey orchestrated from the point with 14 points and a game-high 10 assists, showcasing his double-double capability. Despite their efforts, Lincoln trailed in rebounds against Cal Maritime, whose robust defense pulled down 41 boards compared to Lincoln\'s 29.\n\nLincoln\'s efficient three-point shooting at 37% kept the game competitive, but Cal Maritime outpaced them with better overall accuracy. As the final buzzer sounded, Lincoln University fans were left to lament the missed opportunities, particularly with turnovers, as they committed 21 to Cal Maritime's 18. Both teams displayed high-octane offenses, yet it was Cal Maritime\'s superior shooting that ultimately sealed the win.`,
      reporterName: 'Avery Jones',
    },
    isConference: false,
  },
  {
    id: '-OgdZ7wZowES0FYO8FYE',
    opponent: 'Ohlone',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Ohlone',
    venue: 'away',
    status: 'final',
    result: { homeScore: 86, awayScore: 90, isWin: true },
    boxScore: {
      teamStats: {
        points: 90,
        rebounds: 30,
        assists: 17,
        steals: 10,
        blocks: 4,
        turnovers: 15,
        fgPct: 44.4,
        threePct: 34.5,
        ftPct: 77.4,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 33, rebounds: 5, assists: 8, steals: 2, blocks: 0, turnovers: 1, fouls: 2, fgMade: 7, fgAttempted: 16, threeMade: 4, threeAttempted: 9, ftMade: 15, ftAttempted: 19 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 19, rebounds: 5, assists: 3, steals: 3, blocks: 2, turnovers: 4, fouls: 2, fgMade: 8, fgAttempted: 9, threeMade: 2, threeAttempted: 3, ftMade: 1, ftAttempted: 1 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 0, rebounds: 2, assists: 2, steals: 0, blocks: 0, turnovers: 0, fouls: 1, fgMade: 0, fgAttempted: 3, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 10, rebounds: 0, assists: 0, steals: 1, blocks: 0, turnovers: 2, fouls: 0, fgMade: 4, fgAttempted: 9, threeMade: 1, threeAttempted: 3, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 11, rebounds: 9, assists: 0, steals: 1, blocks: 2, turnovers: 3, fouls: 4, fgMade: 3, fgAttempted: 6, threeMade: 0, threeAttempted: 0, ftMade: 5, ftAttempted: 6 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 6, rebounds: 4, assists: 3, steals: 2, blocks: 0, turnovers: 0, fouls: 1, fgMade: 2, fgAttempted: 4, threeMade: 2, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 4, rebounds: 2, assists: 1, steals: 1, blocks: 0, turnovers: 2, fouls: 0, fgMade: 2, fgAttempted: 7, threeMade: 0, threeAttempted: 4, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2n0mvKerMx2TJlha', playerName: 'Nicholas Bansraj', playerNumber: '20', minutes: 0, points: 1, rebounds: 2, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 2, fgMade: 0, fgAttempted: 3, threeMade: 0, threeAttempted: 1, ftMade: 1, ftAttempted: 1 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 4, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 0, fgMade: 1, fgAttempted: 2, threeMade: 1, threeAttempted: 2, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2zkNjJGFqpjbz_0m', playerName: 'Samuel Manzo', playerNumber: '5', minutes: 0, points: 2, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 0, fgMade: 1, fgAttempted: 4, threeMade: 0, threeAttempted: 3, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [20, 20, 20, 20], opponent: [50, 50, 30, 30] },
    article: {
      headline: `Kalejaiye's 33-Point Explosion Lifts Lincoln University Over Ohlone in Thrilling Finish`,
      body: `In a thrilling showdown, Lincoln University edged out Ohlone with a 90-86 victory on the court. Leading the charge for Lincoln was Laolu Kalejaiye, who put up a stellar performance with 33 points, 5 rebounds, and 8 assists, showcasing his prowess from the free-throw line going 15-19. Brandon Williams provided robust support with an efficient 19 points and imposing defense that included 2 blocks and 3 steals.\n\nDespite being outmatched in three-point shooting, hitting only 24% compared to Lincoln\'s 34%, Ohlone kept the game tightly contested. Lincoln\'s efficiency at the charity stripe proved critical, shooting 77% to Ohlone\'s 75%, capitalizing on more opportunities. Lincoln\'s defense was also pivotal, registering 4 blocks to Ohlone\'s 2, helping them secure the win.\n\nBoth teams battled fiercely on the boards, although Ohlone held a significant advantage, out-rebounding Lincoln 42 to 31. However, it was Lincoln\'s ability to finish strong in key moments that sealed their victory. The game saw both teams evenly matched in several areas, including turnovers and points off turnovers, but Lincoln\'s timely shooting made the ultimate difference.`,
      reporterName: 'Jordan Smith',
    },
    isConference: false,
  },
  {
    id: '-OgjOc5JGIhECeCvETY6',
    opponent: 'Simpson University',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Simpson University',
    venue: 'home',
    status: 'final',
    result: { homeScore: 86, awayScore: 79, isWin: true },
    boxScore: {
      teamStats: {
        points: 86,
        rebounds: 31,
        assists: 15,
        steals: 7,
        blocks: 0,
        turnovers: 8,
        fgPct: 42.9,
        threePct: 17.2,
        ftPct: 84.4,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 30, rebounds: 5, assists: 3, steals: 1, blocks: 0, turnovers: 0, fouls: 2, fgMade: 6, fgAttempted: 20, threeMade: 1, threeAttempted: 12, ftMade: 17, ftAttempted: 17 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 12, rebounds: 9, assists: 3, steals: 3, blocks: 0, turnovers: 2, fouls: 4, fgMade: 4, fgAttempted: 9, threeMade: 1, threeAttempted: 4, ftMade: 3, ftAttempted: 3 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 3, rebounds: 1, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 1, fgMade: 1, fgAttempted: 2, threeMade: 1, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 15, rebounds: 3, assists: 4, steals: 0, blocks: 0, turnovers: 1, fouls: 1, fgMade: 4, fgAttempted: 11, threeMade: 0, threeAttempted: 2, ftMade: 7, ftAttempted: 12 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 14, rebounds: 6, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 4, fgMade: 7, fgAttempted: 10, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 2, rebounds: 2, assists: 0, steals: 0, blocks: 0, turnovers: 2, fouls: 5, fgMade: 1, fgAttempted: 3, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 10, rebounds: 5, assists: 4, steals: 3, blocks: 0, turnovers: 0, fouls: 4, fgMade: 4, fgAttempted: 8, threeMade: 2, threeAttempted: 6, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [35, 2, 18, 18], opponent: [42, 2, 24, 24] },
    article: {
      headline: `Simpson's Torrey and Kilbert Shine, Lead Team to 45-37 Half-Time Advantage`,
      body: `Halftime update: Simpson University heads into the locker room with a 45-37 lead over Lincoln University. The Simpson Storm have been shooting lights out, boasting a 57.0% field goal percentage compared to Lincoln\'s 43.0%. Leading the charge for Simpson, Kellen Torrey and Preston Kilbert each put up 12 points, showcasing efficient shooting.\n\nSimpson University displayed their dominance on the boards, out-rebounding Lincoln 28-21, with Nian Allen grabbing a game-high 6 rebounds. Despite having more turnovers, 12 to Lincoln\'s 6, Simpson\'s defensive pressure limited Lincoln\'s points off turnovers to just 2. Aidan Rolfs contributed significantly in playmaking for Simpson with 5 assists to his name.\n\nLincoln University found success at the free-throw line, converting 76% of their attempts. They also managed to slightly edge out Simpson on second-chance opportunities with key offensive rebounds. As the second half looms, Lincoln will need to tighten up defensively and find their rhythm from beyond the arc, where they currently hold a mere 17% conversion rate, if they intend to mount a successful comeback.`,
      reporterName: 'Dakota Brown',
    },
    isConference: false,
  },
  {
    id: '-Oi5tiQ8LDRW9FEUs_gf',
    opponent: 'Cal Maritime',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Cal Maritime',
    venue: 'home',
    status: 'final',
    result: { homeScore: 102, awayScore: 96, isWin: true },
    boxScore: {
      teamStats: {
        points: 102,
        rebounds: 33,
        assists: 16,
        steals: 13,
        blocks: 3,
        turnovers: 7,
        fgPct: 44.9,
        threePct: 25.7,
        ftPct: 75.6,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 35, rebounds: 5, assists: 2, steals: 1, blocks: 0, turnovers: 4, fouls: 4, fgMade: 9, fgAttempted: 26, threeMade: 3, threeAttempted: 17, ftMade: 14, ftAttempted: 18 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 26, rebounds: 6, assists: 7, steals: 7, blocks: 1, turnovers: 0, fouls: 2, fgMade: 8, fgAttempted: 13, threeMade: 1, threeAttempted: 5, ftMade: 9, ftAttempted: 13 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 5, rebounds: 2, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 2, fgMade: 2, fgAttempted: 2, threeMade: 1, threeAttempted: 1, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 13, rebounds: 10, assists: 3, steals: 4, blocks: 1, turnovers: 2, fouls: 3, fgMade: 6, fgAttempted: 15, threeMade: 0, threeAttempted: 3, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 8, rebounds: 8, assists: 1, steals: 0, blocks: 1, turnovers: 0, fouls: 4, fgMade: 2, fgAttempted: 2, threeMade: 0, threeAttempted: 0, ftMade: 4, ftAttempted: 4 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 4, fgMade: 0, fgAttempted: 1, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 13, rebounds: 1, assists: 1, steals: 1, blocks: 0, turnovers: 0, fouls: 2, fgMade: 4, fgAttempted: 9, threeMade: 4, threeAttempted: 9, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 2, rebounds: 1, assists: 1, steals: 0, blocks: 0, turnovers: 0, fouls: 1, fgMade: 0, fgAttempted: 1, threeMade: 0, threeAttempted: 0, ftMade: 2, ftAttempted: 2 },
      ],
    },
    quarterScores: { lincoln: [28, 12, 20, 20], opponent: [17, 0, 24, 24] },
    article: {
      headline: `Nick Stone's 26 Not Enough as Lincoln Outshoots Cal Maritime 102-96`,
      body: `Lincoln University triumphs in a high-scoring thriller, edging past Cal Maritime 102-96. Despite Cal Maritime shooting an impressive 51% from the field, Lincoln\'s gritty play and better ball security with just 7 turnovers made the difference. Lincoln also capitalized on foul opportunities, hitting a solid 76% from the line.\n\nCal Maritime\'s Nick Stone was a standout, delivering an impressive 26 points while adding 7 rebounds and 2 steals. Jordan Morency also shined with a double-double, posting 23 points and 12 rebounds. Although Cal Maritime led in total rebounds, boasting 44 to Lincoln\'s 33, the turnover battle proved crucial.\n\nLincoln\'s tenacious defense contributed heavily to their win, with 3 blocks and 10 points off turnovers. Both teams struggled to connect from beyond the arc, matching each other with 26% on three-pointers. Ultimately, Lincoln University\'s offensive efficiency and sharp free-throw shooting paved their way to victory in this closely contested matchup.`,
      reporterName: 'Jordan Smith',
    },
    isConference: false,
  },
  {
    id: '-OitEKyFF5d9L8N0TgJR',
    opponent: 'Cal State East Bay',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Cal State East Bay',
    venue: 'away',
    status: 'upcoming',
    quarterScores: { lincoln: [0, 0, 0, 0], opponent: [0, 0, 0, 0] },
    isConference: false,
  },
  {
    id: '-OjE19psxjUfBfqrHZnB',
    opponent: 'Cal Miramar',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Cal Miramar',
    venue: 'home',
    status: 'final',
    result: { homeScore: 114, awayScore: 86, isWin: true },
    boxScore: {
      teamStats: {
        points: 114,
        rebounds: 40,
        assists: 25,
        steals: 14,
        blocks: 4,
        turnovers: 22,
        fgPct: 59.4,
        threePct: 33.3,
        ftPct: 63.9,
      },
      playerStats: [
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 23, rebounds: 7, assists: 6, steals: 1, blocks: 0, turnovers: 3, fouls: 2, fgMade: 11, fgAttempted: 14, threeMade: 0, threeAttempted: 1, ftMade: 1, ftAttempted: 4 },
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 16, rebounds: 8, assists: 4, steals: 0, blocks: 0, turnovers: 1, fouls: 2, fgMade: 5, fgAttempted: 14, threeMade: 3, threeAttempted: 10, ftMade: 3, ftAttempted: 5 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 12, rebounds: 4, assists: 9, steals: 5, blocks: 1, turnovers: 5, fouls: 4, fgMade: 3, fgAttempted: 5, threeMade: 0, threeAttempted: 1, ftMade: 6, ftAttempted: 8 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 8, rebounds: 2, assists: 0, steals: 1, blocks: 0, turnovers: 1, fouls: 3, fgMade: 2, fgAttempted: 2, threeMade: 2, threeAttempted: 2, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 28, rebounds: 8, assists: 1, steals: 2, blocks: 2, turnovers: 5, fouls: 3, fgMade: 11, fgAttempted: 13, threeMade: 1, threeAttempted: 2, ftMade: 5, ftAttempted: 7 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 6, rebounds: 1, assists: 4, steals: 3, blocks: 0, turnovers: 4, fouls: 2, fgMade: 2, fgAttempted: 6, threeMade: 0, threeAttempted: 2, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 13, rebounds: 5, assists: 1, steals: 2, blocks: 1, turnovers: 2, fouls: 2, fgMade: 4, fgAttempted: 10, threeMade: 3, threeAttempted: 9, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 8, rebounds: 5, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 1, fgMade: 3, fgAttempted: 5, threeMade: 0, threeAttempted: 0, ftMade: 2, ftAttempted: 6 },
      ],
    },
    quarterScores: { lincoln: [35, 24, 31, 31], opponent: [28, 26, 21, 21] },
    article: {
      headline: `Lincoln University Dominates Cal Miramar 114-86; Javier Lopez Jr Shines with 16 PTS`,
      body: ``,
      reporterName: 'Jordan Smith',
    },
    isConference: false,
  },
  {
    id: '-OjOHCO32yY5URlwq6su',
    opponent: 'Cal Miramar',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Cal Miramar',
    venue: 'home',
    status: 'final',
    result: { homeScore: 93, awayScore: 73, isWin: true },
    boxScore: {
      teamStats: {
        points: 93,
        rebounds: 41,
        assists: 18,
        steals: 10,
        blocks: 5,
        turnovers: 12,
        fgPct: 46.9,
        threePct: 26.1,
        ftPct: 81.8,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 23, rebounds: 1, assists: 3, steals: 0, blocks: 0, turnovers: 0, fouls: 4, fgMade: 7, fgAttempted: 16, threeMade: 4, threeAttempted: 11, ftMade: 5, ftAttempted: 6 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 34, rebounds: 20, assists: 7, steals: 4, blocks: 0, turnovers: 2, fouls: 4, fgMade: 11, fgAttempted: 17, threeMade: 0, threeAttempted: 1, ftMade: 12, ftAttempted: 12 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 1, rebounds: 1, assists: 4, steals: 3, blocks: 0, turnovers: 1, fouls: 1, fgMade: 0, fgAttempted: 5, threeMade: 0, threeAttempted: 4, ftMade: 1, ftAttempted: 1 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 11, rebounds: 6, assists: 1, steals: 1, blocks: 0, turnovers: 5, fouls: 1, fgMade: 4, fgAttempted: 7, threeMade: 0, threeAttempted: 0, ftMade: 3, ftAttempted: 4 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 6, rebounds: 6, assists: 1, steals: 1, blocks: 4, turnovers: 1, fouls: 3, fgMade: 1, fgAttempted: 6, threeMade: 0, threeAttempted: 1, ftMade: 4, ftAttempted: 8 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 9, rebounds: 2, assists: 1, steals: 0, blocks: 0, turnovers: 3, fouls: 3, fgMade: 4, fgAttempted: 7, threeMade: 1, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 3, rebounds: 2, assists: 1, steals: 1, blocks: 0, turnovers: 0, fouls: 3, fgMade: 1, fgAttempted: 4, threeMade: 1, threeAttempted: 4, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 6, rebounds: 3, assists: 0, steals: 0, blocks: 1, turnovers: 0, fouls: 2, fgMade: 2, fgAttempted: 2, threeMade: 0, threeAttempted: 0, ftMade: 2, ftAttempted: 2 },
      ],
    },
    quarterScores: { lincoln: [23, 23, 9, 9], opponent: [11, 11, 6, 6] },
    article: {
      headline: `Lincoln University's Offensive Onslaught Secures 93-73 Victory Over Cal Miramar`,
      body: `Lincoln University cruised to a 93-73 victory over Cal Miramar, leveraging a superior shooting performance and dominating the boards. The victors shot 47% from the field, comfortably outpacing Cal Miramar\'s 40% shooting clip. Lincoln\'s efficiency was further highlighted by their 82% conversion rate from the free-throw line compared to their opponents' 58%.\n\nCal Miramar, despite a valiant effort, struggled to find consistent offense. Clayshaun Penn led the way for his team, scoring 17 points while pulling down 7 rebounds, but it wasn\'t enough to counter Lincoln's balanced team play. Abraham Jim-George also chipped in with 16 points and 5 rebounds for Cal Miramar, yet their combined efforts couldn\'t close the gap.\n\nLincoln excelled in rebounding, grabbing 41 total boards against Cal Miramar\'s 31, contributing to their edge in second-chance points. Cal Miramar matched Lincoln in offensive rebounds, with both teams snagging 8 each, but struggled to make those possessions count. While both teams committed 6 turnovers each, Lincoln\'s superior field goal and free throw shooting sealed the decisive victory.`,
      reporterName: 'Avery Jones',
    },
    isConference: false,
  },
  {
    id: '-Ojn37CBTNgN9KpQQ22V',
    opponent: 'Cal Prestige Tigers',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Cal Prestige Tigers',
    venue: 'home',
    status: 'final',
    result: { homeScore: 127, awayScore: 60, isWin: true },
    boxScore: {
      teamStats: {
        points: 127,
        rebounds: 56,
        assists: 32,
        steals: 13,
        blocks: 2,
        turnovers: 18,
        fgPct: 57.5,
        threePct: 40.0,
        ftPct: 86.7,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 26, rebounds: 3, assists: 6, steals: 5, blocks: 0, turnovers: 3, fouls: 0, fgMade: 8, fgAttempted: 16, threeMade: 6, threeAttempted: 14, ftMade: 4, ftAttempted: 5 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 27, rebounds: 17, assists: 2, steals: 2, blocks: 0, turnovers: 2, fouls: 3, fgMade: 10, fgAttempted: 15, threeMade: 0, threeAttempted: 1, ftMade: 7, ftAttempted: 8 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 6, rebounds: 1, assists: 1, steals: 0, blocks: 0, turnovers: 3, fouls: 4, fgMade: 2, fgAttempted: 4, threeMade: 2, threeAttempted: 4, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 6, rebounds: 10, assists: 15, steals: 2, blocks: 0, turnovers: 5, fouls: 0, fgMade: 3, fgAttempted: 8, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 12, rebounds: 7, assists: 2, steals: 0, blocks: 1, turnovers: 1, fouls: 0, fgMade: 6, fgAttempted: 11, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 21, rebounds: 7, assists: 2, steals: 1, blocks: 0, turnovers: 2, fouls: 3, fgMade: 9, fgAttempted: 13, threeMade: 3, threeAttempted: 6, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 21, rebounds: 1, assists: 3, steals: 3, blocks: 1, turnovers: 1, fouls: 1, fgMade: 8, fgAttempted: 14, threeMade: 3, threeAttempted: 8, ftMade: 2, ftAttempted: 2 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 8, rebounds: 10, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 1, fgMade: 4, fgAttempted: 6, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
      ],
    },
    quarterScores: { lincoln: [9, 9, 25, 25], opponent: [11, 11, 6, 6] },
    article: {
      headline: `Joel Contreras Shines in Tigers' 67-Point Loss to Lincoln University`,
      body: `Lincoln University crushed the Cal Prestige Tigers, dominating every facet of the game in their 127-60 rout. Shooting an impressive 57% from the field and 40% from beyond the arc, Lincoln showcased their scoring prowess without showcasing individual players\' stats. Their superior ball movement led to a staggering 32 assists while controlling the boards with 56 rebounds.\n\nOn the Tigers\' side, Joel Conteras put up a valiant effort with a team-high 23 points and 8 rebounds, followed by Jalen Roberts, who contributed 16 points and 3 rebounds. Despite these efforts, Cal Prestige shot a disappointing 32% on field goals and a mere 5% from three-point range, hampering their chances for a comeback.\n\nLincoln University\'s dominant performance was also reflected in their robust offensive efficiency of 138.4. Cal Prestige struggled to keep pace, facing a deficit in rebounds and assists, and only managed to generate 6 points off turnovers. The Tigers will need to regroup and address their offensive struggles, as reflected in their challenging night on the hardwood.`,
      reporterName: 'Taylor Johnson',
    },
    isConference: false,
  },
  {
    id: '-OkM7ZQIrwSjI9U37UGd',
    opponent: 'Bethesda',
    date: new Date('2025-01-01'),
    time: 'TBD',
    location: 'Bethesda',
    venue: 'home',
    status: 'final',
    result: { homeScore: 112, awayScore: 88, isWin: true },
    boxScore: {
      teamStats: {
        points: 112,
        rebounds: 43,
        assists: 16,
        steals: 12,
        blocks: 1,
        turnovers: 8,
        fgPct: 46.6,
        threePct: 33.3,
        ftPct: 76.1,
      },
      playerStats: [
          { playerId: '-Odr1sH515CZXb6HY3MV', playerName: 'Laolu Kalejaiye', playerNumber: '11', minutes: 0, points: 23, rebounds: 6, assists: 2, steals: 2, blocks: 0, turnovers: 1, fouls: 3, fgMade: 4, fgAttempted: 17, threeMade: 3, threeAttempted: 10, ftMade: 12, ftAttempted: 14 },
          { playerId: '-Odr229TQ8KdPySMyRe3', playerName: 'Brandon Williams', playerNumber: '1', minutes: 0, points: 36, rebounds: 12, assists: 5, steals: 1, blocks: 0, turnovers: 0, fouls: 2, fgMade: 9, fgAttempted: 13, threeMade: 1, threeAttempted: 2, ftMade: 17, ftAttempted: 22 },
          { playerId: '-Odr28fXZ1PAywR_ZSZM', playerName: 'Chris Plantey', playerNumber: '2', minutes: 0, points: 5, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 3, fouls: 3, fgMade: 2, fgAttempted: 5, threeMade: 1, threeAttempted: 4, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2S7334mI1oNPr7Xe', playerName: 'Claude McKesey', playerNumber: '3', minutes: 0, points: 16, rebounds: 10, assists: 4, steals: 2, blocks: 0, turnovers: 2, fouls: 1, fgMade: 6, fgAttempted: 11, threeMade: 0, threeAttempted: 0, ftMade: 4, ftAttempted: 6 },
          { playerId: '-Odr2YTtI83XmnGL4IxI', playerName: 'Nathan Chtelan', playerNumber: '15', minutes: 0, points: 15, rebounds: 6, assists: 0, steals: 0, blocks: 1, turnovers: 1, fouls: 3, fgMade: 6, fgAttempted: 11, threeMade: 2, threeAttempted: 3, ftMade: 1, ftAttempted: 2 },
          { playerId: '-Odr2ak0NipmJ1HrVDBG', playerName: 'Samuel Wall', playerNumber: '6', minutes: 0, points: 2, rebounds: 2, assists: 3, steals: 5, blocks: 0, turnovers: 0, fouls: 1, fgMade: 1, fgAttempted: 5, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2k8iYj_HpNEavahl', playerName: 'Adrian Hernandez', playerNumber: '10', minutes: 0, points: 10, rebounds: 2, assists: 2, steals: 2, blocks: 0, turnovers: 1, fouls: 3, fgMade: 4, fgAttempted: 8, threeMade: 2, threeAttempted: 6, ftMade: 0, ftAttempted: 0 },
          { playerId: '-Odr2tTMS7y7v1NcaUCI', playerName: 'Paul Diomande', playerNumber: '21', minutes: 0, points: 5, rebounds: 5, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 3, fgMade: 2, fgAttempted: 3, threeMade: 0, threeAttempted: 0, ftMade: 1, ftAttempted: 2 },
      ],
    },
    quarterScores: { lincoln: [16, 16, 10, 10], opponent: [14, 14, 7, 7] },
    article: {
      headline: ``,
      body: ``,
      reporterName: 'Morgan Williams',
    },
    isConference: false,
  },
];

// =============================================================================
// SEASON RECORD (computed from Firebase games)
// =============================================================================

export const FIREBASE_RECORD = {
  overall: { wins: 7, losses: 5 },
  conference: { wins: 0, losses: 0 },
  home: { wins: 6, losses: 0 },
  away: { wins: 1, losses: 5 },
  streak: 'W7',
};

// =============================================================================
// SEASON LEADERS (per-game averages computed from Firebase box scores)
// =============================================================================

export interface SeasonLeader {
  firebaseId: string;
  name: string;
  number: string;
  gamesPlayed: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
}

export const FIREBASE_LEADERS: SeasonLeader[] = [
  { firebaseId: '-Odr1sH515CZXb6HY3MV', name: 'Laolu Kalejaiye', number: '11', gamesPlayed: 12, ppg: 24.8, rpg: 3.7, apg: 3.1, spg: 1.4, bpg: 0.0, fgPct: 36.9, threePct: 33.1, ftPct: 81.6, totalPoints: 297, totalRebounds: 44, totalAssists: 37 },
  { firebaseId: '-Odr229TQ8KdPySMyRe3', name: 'Brandon Williams', number: '1', gamesPlayed: 12, ppg: 20.1, rpg: 7.6, apg: 4.2, spg: 2.7, bpg: 0.4, fgPct: 59.4, threePct: 26.7, ftPct: 77.9, totalPoints: 241, totalRebounds: 91, totalAssists: 51 },
  { firebaseId: '-Odr2YTtI83XmnGL4IxI', name: 'Nathan Chtelan', number: '15', gamesPlayed: 12, ppg: 12.2, rpg: 5.7, apg: 0.7, spg: 0.5, bpg: 1.1, fgPct: 58.9, threePct: 40.0, ftPct: 70.3, totalPoints: 146, totalRebounds: 68, totalAssists: 8 },
  { firebaseId: '-Odr2S7334mI1oNPr7Xe', name: 'Claude McKesey', number: '3', gamesPlayed: 12, ppg: 11.3, rpg: 5.7, apg: 5.0, spg: 1.3, bpg: 0.1, fgPct: 41.4, threePct: 10.0, ftPct: 65.1, totalPoints: 136, totalRebounds: 68, totalAssists: 60 },
  { firebaseId: '-Odr2k8iYj_HpNEavahl', name: 'Adrian Hernandez', number: '10', gamesPlayed: 12, ppg: 8.1, rpg: 1.6, apg: 1.2, spg: 1.5, bpg: 0.2, fgPct: 39.8, threePct: 31.0, ftPct: 83.3, totalPoints: 97, totalRebounds: 19, totalAssists: 14 },
  { firebaseId: '-Odr2ak0NipmJ1HrVDBG', name: 'Samuel Wall', number: '6', gamesPlayed: 12, ppg: 5.3, rpg: 1.8, apg: 1.5, spg: 1.1, bpg: 0.0, fgPct: 46.2, threePct: 41.7, ftPct: 85.7, totalPoints: 64, totalRebounds: 22, totalAssists: 18 },
  { firebaseId: '-Odr2tTMS7y7v1NcaUCI', name: 'Paul Diomande', number: '21', gamesPlayed: 11, ppg: 4.1, rpg: 3.2, apg: 0.3, spg: 0.0, bpg: 0.2, fgPct: 44.4, threePct: 25.0, ftPct: 57.1, totalPoints: 45, totalRebounds: 35, totalAssists: 3 },
  { firebaseId: '-Odr28fXZ1PAywR_ZSZM', name: 'Chris Plantey', number: '2', gamesPlayed: 12, ppg: 3.3, rpg: 1.0, apg: 1.6, spg: 0.6, bpg: 0.0, fgPct: 38.2, threePct: 36.7, ftPct: 75.0, totalPoints: 40, totalRebounds: 12, totalAssists: 19 },
  { firebaseId: '-Odr2zkNjJGFqpjbz_0m', name: 'Samuel Manzo', number: '5', gamesPlayed: 4, ppg: 2.8, rpg: 0.5, apg: 0.2, spg: 0.0, bpg: 0.0, fgPct: 25.0, threePct: 20.0, ftPct: 0, totalPoints: 11, totalRebounds: 2, totalAssists: 1 },
  { firebaseId: '-Odr2n0mvKerMx2TJlha', name: 'Nicholas Bansraj', number: '20', gamesPlayed: 4, ppg: 0.2, rpg: 1.0, apg: 0.0, spg: 0.0, bpg: 0.0, fgPct: 0.0, threePct: 0.0, ftPct: 100.0, totalPoints: 1, totalRebounds: 4, totalAssists: 0 },
];

// =============================================================================
// NEWS (from Firebase game articles)
// =============================================================================

export interface FirebaseNewsItem {
  gameId: string;
  opponent: string;
  headline: string;
  body: string;
  reporterName: string;
}

export const FIREBASE_NEWS: FirebaseNewsItem[] = [
  { gameId: '-OkM7ZQIrwSjI9U37UGd', opponent: 'Bethesda', headline: '', body: ``, reporterName: 'Morgan Williams' },
  { gameId: '-Ojn37CBTNgN9KpQQ22V', opponent: 'Cal Prestige Tigers', headline: `Joel Contreras Shines in Tigers' 67-Point Loss to Lincoln University`, body: `Lincoln University crushed the Cal Prestige Tigers, dominating every facet of the game in their 127-60 rout. Shooting an impressive 57% from the field and 40% from beyond the arc, Lincoln showcased their scoring prowess without showcasing individual players' stats. Their superior ball movement led to a staggering 32 assists while controlling the boards with 56 rebounds.\n\nOn the Tigers' side, Joel Conteras put up a valiant effort with a team-high 23 points and 8 rebounds, followed by Jalen Roberts, who contributed 16 points and 3 rebounds. Despite these efforts, Cal Prestige shot a disappointing 32% on field goals and a mere 5% from three-point range, hampering their chances for a comeback.\n\nLincoln University's dominant performance was also reflected in their robust offensive efficiency of 138.4. Cal Prestige struggled to keep pace, facing a deficit in rebounds and assists, and only managed to generate 6 points off turnovers. The Tigers will need to regroup and address their offensive struggles, as reflected in their challenging night on the hardwood.`, reporterName: 'Taylor Johnson' },
  { gameId: '-OjOHCO32yY5URlwq6su', opponent: 'Cal Miramar', headline: `Lincoln University's Offensive Onslaught Secures 93-73 Victory Over Cal Miramar`, body: `Lincoln University cruised to a 93-73 victory over Cal Miramar, leveraging a superior shooting performance and dominating the boards. The victors shot 47% from the field, comfortably outpacing Cal Miramar's 40% shooting clip. Lincoln's efficiency was further highlighted by their 82% conversion rate from the free-throw line compared to their opponents' 58%.\n\nCal Miramar, despite a valiant effort, struggled to find consistent offense. Clayshaun Penn led the way for his team, scoring 17 points while pulling down 7 rebounds, but it wasn't enough to counter Lincoln's balanced team play. Abraham Jim-George also chipped in with 16 points and 5 rebounds for Cal Miramar, yet their combined efforts couldn't close the gap.\n\nLincoln excelled in rebounding, grabbing 41 total boards against Cal Miramar's 31, contributing to their edge in second-chance points. Cal Miramar matched Lincoln in offensive rebounds, with both teams snagging 8 each, but struggled to make those possessions count. While both teams committed 6 turnovers each, Lincoln's superior field goal and free throw shooting sealed the decisive victory.`, reporterName: 'Avery Jones' },
  { gameId: '-OjE19psxjUfBfqrHZnB', opponent: 'Cal Miramar', headline: 'Lincoln University Dominates Cal Miramar 114-86; Javier Lopez Jr Shines with 16 PTS', body: ``, reporterName: 'Jordan Smith' },
  { gameId: '-Oi5tiQ8LDRW9FEUs_gf', opponent: 'Cal Maritime', headline: `Nick Stone's 26 Not Enough as Lincoln Outshoots Cal Maritime 102-96`, body: `Lincoln University triumphs in a high-scoring thriller, edging past Cal Maritime 102-96. Despite Cal Maritime shooting an impressive 51% from the field, Lincoln's gritty play and better ball security with just 7 turnovers made the difference. Lincoln also capitalized on foul opportunities, hitting a solid 76% from the line.\n\nCal Maritime's Nick Stone was a standout, delivering an impressive 26 points while adding 7 rebounds and 2 steals. Jordan Morency also shined with a double-double, posting 23 points and 12 rebounds. Although Cal Maritime led in total rebounds, boasting 44 to Lincoln's 33, the turnover battle proved crucial.\n\nLincoln's tenacious defense contributed heavily to their win, with 3 blocks and 10 points off turnovers. Both teams struggled to connect from beyond the arc, matching each other with 26% on three-pointers. Ultimately, Lincoln University's offensive efficiency and sharp free-throw shooting paved their way to victory in this closely contested matchup.`, reporterName: 'Jordan Smith' },
  { gameId: '-OgjOc5JGIhECeCvETY6', opponent: 'Simpson University', headline: `Simpson's Torrey and Kilbert Shine, Lead Team to 45-37 Half-Time Advantage`, body: `Halftime update: Simpson University heads into the locker room with a 45-37 lead over Lincoln University. The Simpson Storm have been shooting lights out, boasting a 57.0% field goal percentage compared to Lincoln's 43.0%. Leading the charge for Simpson, Kellen Torrey and Preston Kilbert each put up 12 points, showcasing efficient shooting.\n\nSimpson University displayed their dominance on the boards, out-rebounding Lincoln 28-21, with Nian Allen grabbing a game-high 6 rebounds. Despite having more turnovers, 12 to Lincoln's 6, Simpson's defensive pressure limited Lincoln's points off turnovers to just 2. Aidan Rolfs contributed significantly in playmaking for Simpson with 5 assists to his name.\n\nLincoln University found success at the free-throw line, converting 76% of their attempts. They also managed to slightly edge out Simpson on second-chance opportunities with key offensive rebounds. As the second half looms, Lincoln will need to tighten up defensively and find their rhythm from beyond the arc, where they currently hold a mere 17% conversion rate, if they intend to mount a successful comeback.`, reporterName: 'Dakota Brown' },
  { gameId: '-OgdZ7wZowES0FYO8FYE', opponent: 'Ohlone', headline: `Kalejaiye's 33-Point Explosion Lifts Lincoln University Over Ohlone in Thrilling Finish`, body: `In a thrilling showdown, Lincoln University edged out Ohlone with a 90-86 victory on the court. Leading the charge for Lincoln was Laolu Kalejaiye, who put up a stellar performance with 33 points, 5 rebounds, and 8 assists, showcasing his prowess from the free-throw line going 15-19. Brandon Williams provided robust support with an efficient 19 points and imposing defense that included 2 blocks and 3 steals.\n\nDespite being outmatched in three-point shooting, hitting only 24% compared to Lincoln's 34%, Ohlone kept the game tightly contested. Lincoln's efficiency at the charity stripe proved critical, shooting 77% to Ohlone's 75%, capitalizing on more opportunities. Lincoln's defense was also pivotal, registering 4 blocks to Ohlone's 2, helping them secure the win.\n\nBoth teams battled fiercely on the boards, although Ohlone held a significant advantage, out-rebounding Lincoln 42 to 31. However, it was Lincoln's ability to finish strong in key moments that sealed their victory. The game saw both teams evenly matched in several areas, including turnovers and points off turnovers, but Lincoln's timely shooting made the ultimate difference.`, reporterName: 'Jordan Smith' },
  { gameId: '-Ogd2OxdplE_N1hzwR_W', opponent: 'Cal Maritime', headline: `Kalejaiye and Williams Shine in Lincoln's 108-102 Thriller Loss to Cal Maritime`, body: `Cal Maritime narrowly edged out Lincoln University in a thrilling 108-102 victory. While Cal Maritime's team stats shone with a 59% field goal shooting performance, it was Lincoln University's standout individual performances that turned heads. Laolu Kalejaiye led the way for Lincoln with 26 points, spectacularly shooting 6-for-13 from beyond the arc.\n\nHot on Kalejaiye's heels, Brandon Williams added 24 points, contributing significantly with 6 rebounds and 5 assists. Claude McKesey orchestrated from the point with 14 points and a game-high 10 assists, showcasing his double-double capability. Despite their efforts, Lincoln trailed in rebounds against Cal Maritime, whose robust defense pulled down 41 boards compared to Lincoln's 29.\n\nLincoln's efficient three-point shooting at 37% kept the game competitive, but Cal Maritime outpaced them with better overall accuracy. As the final buzzer sounded, Lincoln University fans were left to lament the missed opportunities, particularly with turnovers, as they committed 21 to Cal Maritime's 18. Both teams displayed high-octane offenses, yet it was Cal Maritime's superior shooting that ultimately sealed the win.`, reporterName: 'Avery Jones' },
  { gameId: '-OgcD9jAtLd0IFGX7lwI', opponent: 'UC Irvine', headline: `UC Irvine Crushes Lincoln 130-63 Despite Kalejaiye's 19-Point Effort`, body: `In a dominant display, UC Irvine crushed Lincoln University 130-63. The Anteaters showcased superior shooting with a remarkable 65% from the field, leaving Lincoln University's 36% in the dust. The disparity in performance was further highlighted by UC Irvine's 45 rebounds compared to Lincoln's 15.\n\nLincoln University's top scorer, Laolu Kalejaiye, put up a valiant effort with 19 points and an impressive 5-10 from beyond the arc. Nathan Chtelan added 16 points, proving to be another bright spot in an otherwise overwhelming defeat. Despite Brandon Williams contributing 10 points and two steals, Lincoln struggled to match UC Irvine's efficiency.\n\nOverall, UC Irvine's offensive efficiency soared at 160.2, nearly doubling Lincoln's 84.6. The Anteaters capitalized on Lincoln's 18 turnovers, converting them into 14 points. With UC Irvine's relentless pace and precision, the game was firmly in their control from start to finish.`, reporterName: 'Avery Jones' },
  { gameId: '-OgbzyEnODgmhH7yyXSJ', opponent: 'Pepperdine', headline: `Laolu Kalejaiye's 38 Points Not Enough as Pepperdine Overpowers Lincoln 113-76`, body: `Pepperdine soared past Lincoln University with a commanding 113-76 victory. A sharp shooting display saw Pepperdine hit an impressive 61% from the field. Despite a dazzling performance by Lincoln's Laolu Kalejaiye, who poured in 38 points and 12 three-pointers, Lincoln couldn't keep up with Pepperdine's offensive onslaught.\n\nKalejaiye was the lone bright spot for Lincoln, as they struggled on the boards, managing only 14 rebounds to Pepperdine's 41. Lincoln was productive from beyond the arc, hitting 48%, but Pepperdine dominated inside, generated 17 second-chance points and committed just 7 turnovers. \n\nPepperdine's team effort was evident as they chalked up 27 assists, capitalizing on their high offensive efficiency. Lincoln's Nathan Chtelan added a solid 14 points with six rebounds, but the team's overall defensive lapses gave Pepperdine the opening to deliver this lopsided result. Despite equal fouls, Lincoln failed to utilize their free-throw attempts effectively, and the game slipped out of reach.`, reporterName: 'Morgan Williams' },
  { gameId: '-OgbmTnXpz994rOErPEo', opponent: 'Loyola Marymount University', headline: `Loyola Marymount Dominates Lincoln 137-54; Brandon Williams' 21 Can't Save Lions`, body: `Loyola Marymount University dominated from start to finish in a commanding 137-54 victory over Lincoln University. Displaying remarkable shooting accuracy, LMU hit 68% of their field goals, compared to just 30% by Lincoln. This offensive prowess was bolstered by their impressive 92% free-throw shooting.\n\nLincoln's Brandon Williams tried to keep his team competitive, scoring 21 points, with solid contributions from Nathan Chtelan's 10 points. However, Lincoln struggled beyond the arc, making only 22% of their three-point attempts. Loyola Marymount's defensive pressure forced Lincoln into 21 turnovers, contributing to the lopsided score.\n\nIn terms of team play, Loyola Marymount distributed the ball efficiently, racking up 28 assists against Lincoln's 9. The Lions also controlled the glass, outrebounding Lincoln 33 to 13, and converting their dominance into 11 second-chance points. This emphatic win showcases LMU's potential as a powerhouse team this season.`, reporterName: 'Dakota Brown' },
  { gameId: '-Odr30YnjKA38ZfBZ6qB', opponent: 'UNLV', headline: 'UNLV Doubles Down: Dominates Lincoln University 66-33 in Lopsided Victory', body: `In a dominant performance, UNLV overwhelmed Lincoln University with a final score of 66-33. UNLV's shooting prowess was on full display as they converted 67% of their shots from the field. Meanwhile, Lincoln University struggled offensively, shooting just 33%.\n\nLaolu Kalejaiye led Lincoln University with 8 points and 3 assists, while Claude McKesey added 10 points and 3 rebounds. However, their efforts could not overcome UNLV's offensive efficiency. Lincoln found it difficult to keep pace, only managing 5 three-pointers on 22 attempts, for a 23% success rate.\n\nOffensive efficiency was a clear advantage for UNLV, who also dominated the boards with 19 total rebounds compared to 11 from Lincoln. Despite an equal number of fouls, Lincoln University's 10 turnovers compared to UNLV's 2 were costly. Ultimately, UNLV's strong all-around game left Lincoln searching for answers in a one-sided affair.`, reporterName: 'Taylor Johnson' },
];
