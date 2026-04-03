/**
 * KayStudios — Interactive Experiences Hub
 * Home: mode-scoped feed — tap to launch experience.
 * Explore: discovery rows (Trending / New / Popular This Week / Rising Creators).
 * Library: In Progress / Completed / Saved / My Courses.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, FlatList,
  StyleSheet, Animated, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import {
  getFeedContent, getExploreRows, getAllContent, filterByPill,
  STUDIOS_PILLS,
  type StudioContent, type ExperienceType,
} from '@/data/mock-kaystudios';
import {
  loadAllProgress, getSavedIds, type ProgressEntry,
} from '@/utils/studios-progress';

type KSTab = 'Home' | 'Explore' | 'Library';

const TOP_BAR_H = 52;
const PILL_ROW_H = 48;
const THUMB_W = 86;
const CARD_H = 96;

// ── Type Badge ──────────────────────────────────────────────────────────────

function TypeBadge({ type, C }: { type: ExperienceType; C: ComponentColors }) {
  const labels: Record<ExperienceType, string> = {
    trivia: 'Trivia', quiz: 'Quiz', course: 'Course',
    flashcards: 'Flashcards', simulation: 'Simulation',
    game: 'Game', training: 'Training', devotional: 'Devotional',
  };
  return (
    <View style={[styles.typeBadge, { backgroundColor: C.surfacePressed }]}>
      <Text style={[styles.typeBadgeText, { color: C.secondary }]}>{labels[type]}</Text>
    </View>
  );
}

// ── Content Card ────────────────────────────────────────────────────────────

function ContentCard({
  item, C, onPress, progress,
}: {
  item: StudioContent;
  C: ComponentColors;
  onPress: () => void;
  progress?: ProgressEntry | null;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}
    >
      <View style={[styles.cardThumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
        <Text style={styles.cardEmoji}>{item.thumbEmoji}</Text>
        {progress && !progress.completed && progress.progress > 0 && (
          <View style={styles.cardProgressBg}>
            <View style={[styles.cardProgressFill, { width: `${progress.progress * 100}%` as any, backgroundColor: C.accent }]} />
          </View>
        )}
        {progress?.completed && (
          <View style={[styles.cardCompletedBadge, { backgroundColor: C.green }]}>
            <IconSymbol name="checkmark" size={9} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.cardBrand, { color: C.secondary }]} numberOfLines={1}>
          {item.brand} · {item.brandHandle}
        </Text>
        <View style={styles.cardMeta}>
          <TypeBadge type={item.type} C={C} />
          <Text style={[styles.cardParticipants, { color: C.muted }]}>{item.participants}</Text>
          <Text style={[styles.cardRating, { color: C.muted }]}>★ {item.rating}</Text>
          {progress?.completed && progress.score != null && (
            <Text style={[styles.cardScore, { color: C.green }]}>{progress.score}%</Text>
          )}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ── Explore Card ────────────────────────────────────────────────────────────

function ExploreCard({
  item, C, onPress,
}: { item: StudioContent; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.exploreCard, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.exploreThumb, { backgroundColor: `hsl(${item.thumbHue},42%,26%)` }]}>
        <Text style={styles.exploreEmoji}>{item.thumbEmoji}</Text>
      </View>
      <Text style={[styles.exploreTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
      <TypeBadge type={item.type} C={C} />
    </Pressable>
  );
}

// ── Explore Row ─────────────────────────────────────────────────────────────

function ExploreRow({
  label, items, C, onPressItem,
}: { label: string; items: StudioContent[]; C: ComponentColors; onPressItem: (item: StudioContent) => void }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.exploreRowWrap}>
      <Text style={[styles.rowLabel, { color: C.label }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
      >
        {items.map(item => (
          <ExploreCard key={item.id} item={item} C={C} onPress={() => onPressItem(item)} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Library Section ─────────────────────────────────────────────────────────

function LibSection({
  title, items, C, onPressItem, progress, limit = 99,
}: {
  title: string; items: StudioContent[]; C: ComponentColors;
  onPressItem: (item: StudioContent) => void;
  progress?: Record<string, ProgressEntry>;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const showAll = expanded || items.length <= limit;
  const visible = showAll ? items : items.slice(0, limit);
  return (
    <View style={styles.libSection}>
      <View style={styles.libSectionHeader}>
        <Text style={[styles.rowLabel, { color: C.label }]}>{title}</Text>
        {!showAll && (
          <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
            <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
          </Pressable>
        )}
      </View>
      {visible.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          C={C}
          onPress={() => onPressItem(item)}
          progress={progress?.[item.id]}
        />
      ))}
    </View>
  );
}

// ── Achievements Section ─────────────────────────────────────────────────────

function AchievementsSection({ completedItems, C }: { completedItems: StudioContent[]; C: ComponentColors }) {
  const badges = [
    { id: 'first',  label: 'First Step',      emoji: '🎯', unlocked: completedItems.length >= 1 },
    { id: 'three',  label: 'Curious Mind',     emoji: '🧠', unlocked: completedItems.length >= 3 },
    { id: 'quiz',   label: 'Quiz Pro',          emoji: '✅', unlocked: completedItems.some(c => c.type === 'quiz') },
    { id: 'course', label: 'Course Complete',   emoji: '🎓', unlocked: completedItems.some(c => c.type === 'course' || c.type === 'training' || c.type === 'devotional') },
    { id: 'trivia', label: 'Trivia King',        emoji: '🏆', unlocked: completedItems.some(c => c.type === 'trivia') },
  ].filter(b => b.unlocked);

  return (
    <View style={[styles.libSection, { marginBottom: 0 }]}>
      <View style={styles.libSectionHeader}>
        <Text style={[styles.rowLabel, { color: C.label }]}>Achievements</Text>
      </View>
      <View style={styles.achieveStats}>
        <View style={[styles.achieveStat, { backgroundColor: C.surfacePressed }]}>
          <Text style={[styles.achieveStatNum, { color: C.label }]}>{completedItems.length}</Text>
          <Text style={[styles.achieveStatLbl, { color: C.secondary }]}>Completed</Text>
        </View>
        <View style={[styles.achieveStat, { backgroundColor: C.surfacePressed }]}>
          <Text style={[styles.achieveStatNum, { color: C.accent }]}>3</Text>
          <Text style={[styles.achieveStatLbl, { color: C.secondary }]}>Day Streak 🔥</Text>
        </View>
        <View style={[styles.achieveStat, { backgroundColor: C.surfacePressed }]}>
          <Text style={[styles.achieveStatNum, { color: C.label }]}>{badges.length}</Text>
          <Text style={[styles.achieveStatLbl, { color: C.secondary }]}>Badges</Text>
        </View>
      </View>
      {badges.length > 0 && (
        <View style={styles.badgeRow}>
          {badges.map(b => (
            <View key={b.id} style={[styles.badge, { backgroundColor: C.surfacePressed }]}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={[styles.badgeLabel, { color: C.secondary }]}>{b.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Community Member: Learn & Grow View ─────────────────────────────────────

const CHURCH_COURSES = [
  { id: 'cc1', title: 'New Member Class',      lessons: 6,  progress: 0.6, enrolled: true,  required: true  },
  { id: 'cc2', title: 'Baptism Preparation',   lessons: 4,  progress: 0,   enrolled: false, required: false },
  { id: 'cc3', title: 'Marriage Enrichment',   lessons: 8,  progress: 0,   enrolled: false, required: false },
  { id: 'cc4', title: 'Financial Freedom',     lessons: 5,  progress: 0,   enrolled: false, required: false },
  { id: 'cc5', title: 'Parenting Course',      lessons: 7,  progress: 0,   enrolled: false, required: false },
];
const DAILY_DEVOTIONAL = {
  scripture: 'Romans 8:28',
  text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
  reflection: 'Whatever you face today, God is working it out. Your situation is not a detour — it is the road. Trust the process and trust the One who holds it.',
  prayer: 'Father, help me to trust you in every season. Give me eyes to see your hand in my story. Let my faith be louder than my fear. Amen.',
  date: 'April 3, 2026',
};
const SERMON_DISCUSSION = {
  sermon: 'The Power of Grace',
  date: 'Mar 30, 2026',
  speaker: 'Dr. Oladipo Kalejaiye',
  scripture: 'Ephesians 2:8–9',
  questions: [
    'What does grace mean to you personally, beyond theology?',
    'How have you experienced God\'s unearned favor this week?',
    'What is one action you can take this week to extend grace to someone who doesn\'t deserve it?',
  ],
};
const TRIVIA_QUESTION = { q: 'How many books are in the New Testament?', options: ['22', '27', '30', '39'], correct: '27' };
const SCRIPTURE_VERSE = {
  reference: 'Psalm 23:1',
  text: 'The Lord is my shepherd; I shall not want.',
  hint: 'The ___ is my ___; I shall not ___.',
  streakDays: 4,
  totalVerses: 12,
  masteredVerses: 7,
};
const CHURCH_MEMBER_CERTS = [
  { id: 'cert1', title: 'Baptism Certificate',  emoji: '💧', date: 'Jan 12, 2026', issuer: 'ICCLA' },
];

function CommunityMemberLearnView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  type LGTab = 'My Courses' | 'Devotional' | 'Trivia' | 'Discussion' | 'Scripture' | 'Certs';
  const [lgTab, setLgTab] = React.useState<LGTab>('My Courses');
  const [lgDropOpen, setLgDropOpen] = React.useState(false);
  const [triviaAnswer, setTriviaAnswer] = React.useState<string | null>(null);
  const [enrolled, setEnrolled] = React.useState<Set<string>>(new Set(['cc1']));
  const [scriptureRevealed, setScriptureRevealed] = React.useState(false);
  const topBarH = insets.top + 52;
  const LG_TABS: LGTab[] = ['My Courses', 'Devotional', 'Trivia', 'Discussion', 'Scripture', 'Certs'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 20, backgroundColor: C.bg }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfacePressed }}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLgDropOpen(v => !v); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{lgTab}</Text>
              <IconSymbol name={lgDropOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
            </Pressable>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
        </View>
      </View>

      {/* Dropdown */}
      {lgDropOpen && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 16, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {LG_TABS.map((tab, i) => (
            <Pressable key={tab} style={{ paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: i < LG_TABS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { Haptics.selectionAsync(); setLgTab(tab); setLgDropOpen(false); }}>
              <Text style={{ fontSize: 15, color: tab === lgTab ? C.label : C.secondary, fontWeight: tab === lgTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {lgTab === 'My Courses' && (
          <View style={{ paddingHorizontal: 16 }}>
            {/* Enrolled / Required */}
            {CHURCH_COURSES.filter(c => enrolled.has(c.id)).length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>IN PROGRESS</Text>
                {CHURCH_COURSES.filter(c => enrolled.has(c.id)).map(c => (
                  <Pressable key={c.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>{c.title}</Text>
                      {c.required && (
                        <View style={{ backgroundColor: C.label + '18', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>Required</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 6 }}>
                      <View style={{ width: `${c.progress * 100}%` as any, height: 4, backgroundColor: C.label, borderRadius: 2 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{Math.round(c.progress * 100)}% complete</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{c.lessons} lessons</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
            {/* Available */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>AVAILABLE COURSES</Text>
            {CHURCH_COURSES.filter(c => !enrolled.has(c.id)).map(c => (
              <View key={c.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconSymbol name="book.closed.fill" size={28} color={C.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{c.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{c.lessons} lessons</Text>
                </View>
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEnrolled(s => new Set([...s, c.id])); }}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: C.label }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Enroll</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {lgTab === 'Devotional' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{DAILY_DEVOTIONAL.date}</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginBottom: 12 }}>{DAILY_DEVOTIONAL.scripture}</Text>
              <Text style={{ fontSize: 15, color: C.label, lineHeight: 26, fontStyle: 'italic', marginBottom: 20 }}>{'"'}{DAILY_DEVOTIONAL.text}{'"'}</Text>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginBottom: 20 }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>REFLECTION</Text>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 22, marginBottom: 20 }}>{DAILY_DEVOTIONAL.reflection}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>PRAYER</Text>
              <Text style={{ fontSize: 14, color: C.secondary, lineHeight: 22, fontStyle: 'italic' }}>{DAILY_DEVOTIONAL.prayer}</Text>
            </View>
          </View>
        )}

        {lgTab === 'Trivia' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>BIBLE TRIVIA</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, lineHeight: 24, marginBottom: 20 }}>{TRIVIA_QUESTION.q}</Text>
              {TRIVIA_QUESTION.options.map(opt => {
                const isSelected = triviaAnswer === opt;
                const isCorrect = opt === TRIVIA_QUESTION.correct;
                const showResult = triviaAnswer !== null;
                return (
                  <Pressable
                    key={opt}
                    disabled={triviaAnswer !== null}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTriviaAnswer(opt); }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      marginBottom: 10,
                      backgroundColor: showResult && isCorrect ? '#5A8A6E18' : showResult && isSelected && !isCorrect ? '#B85C5C18' : C.bg,
                      borderWidth: 1,
                      borderColor: showResult && isCorrect ? '#5A8A6E' : showResult && isSelected && !isCorrect ? '#B85C5C' : C.separator,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: showResult && isCorrect ? '#5A8A6E' : showResult && isSelected && !isCorrect ? '#B85C5C' : C.label }}>{opt}</Text>
                  </Pressable>
                );
              })}
              {triviaAnswer && (
                <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: triviaAnswer === TRIVIA_QUESTION.correct ? '#5A8A6E' : '#B85C5C' }}>
                  {triviaAnswer === TRIVIA_QUESTION.correct ? 'Correct! 🎉 The New Testament has 27 books.' : `Not quite. The correct answer is ${TRIVIA_QUESTION.correct}.`}
                </Text>
              )}
            </View>
          </View>
        )}

        {lgTab === 'Discussion' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{"THIS WEEK'S SERMON"}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.label, marginBottom: 4 }}>{SERMON_DISCUSSION.sermon}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 2 }}>{SERMON_DISCUSSION.speaker}</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{SERMON_DISCUSSION.date} · {SERMON_DISCUSSION.scripture}</Text>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginBottom: 20 }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>DISCUSSION QUESTIONS</Text>
              {SERMON_DISCUSSION.questions.map((q, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>{i + 1}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, color: C.label, lineHeight: 22, paddingTop: 2 }}>{q}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {lgTab === 'Scripture' && (
          <View style={{ paddingHorizontal: 16 }}>
            {/* Streak + progress */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{SCRIPTURE_VERSE.streakDays}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Day Streak 🔥</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{SCRIPTURE_VERSE.masteredVerses}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Mastered</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{SCRIPTURE_VERSE.totalVerses}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Total Verses</Text>
              </View>
            </View>
            {/* Current verse card */}
            <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>TODAY{"'"}S VERSE</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.label, marginBottom: 16 }}>{SCRIPTURE_VERSE.reference}</Text>
              {scriptureRevealed ? (
                <Text style={{ fontSize: 15, color: C.label, lineHeight: 26, fontStyle: 'italic', marginBottom: 20 }}>{'"'}{SCRIPTURE_VERSE.text}{'"'}</Text>
              ) : (
                <Text style={{ fontSize: 15, color: C.secondary, lineHeight: 26, fontStyle: 'italic', marginBottom: 20 }}>{SCRIPTURE_VERSE.hint}</Text>
              )}
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setScriptureRevealed(v => !v); }}
                style={{ paddingVertical: 12, borderRadius: 12, backgroundColor: C.label, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{scriptureRevealed ? 'Hide Verse' : 'Reveal Verse'}</Text>
              </Pressable>
            </View>
            {/* Practice prompt */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 6 }}>Spaced Repetition</Text>
              <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 18 }}>Come back tomorrow to review this verse and lock it into long-term memory. You have 5 verses due for review today.</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ marginTop: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: C.separator, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Start Review Session</Text>
              </Pressable>
            </View>
          </View>
        )}

        {lgTab === 'Certs' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>MY CERTIFICATES</Text>
            {CHURCH_MEMBER_CERTS.map(cert => (
              <View key={cert.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 28 }}>{cert.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>{cert.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{cert.issuer} · {cert.date}</Text>
                  </View>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.separator }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Download</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            {/* Courses working toward certs */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 10 }}>IN PROGRESS</Text>
            {CHURCH_COURSES.filter(c => enrolled.has(c.id) && c.progress < 1).map(c => (
              <View key={c.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 6 }}>{c.title}</Text>
                <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 6 }}>
                  <View style={{ width: `${c.progress * 100}%` as any, height: 4, backgroundColor: C.label, borderRadius: 2 }} />
                </View>
                <Text style={{ fontSize: 12, color: C.secondary }}>{Math.round(c.progress * 100)}% complete — finish to earn certificate</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── Business Mode: CEO Tools & Customer Resources ────────────────────────────

type BizCEOTab = 'Demos' | 'Training' | 'Certifications' | 'Analytics';

const BIZ_DEMOS = [
  { id: 'bd1', title: 'KaNeXT OS Full Platform Tour',      badge: 'Guided Walkthrough', uses: 847 },
  { id: 'bd2', title: 'Intelligence System Deep Dive',     badge: 'Guided Walkthrough', uses: 312 },
  { id: 'bd3', title: 'Education Mode Live Demo',          badge: 'Live Environment',   uses: 128 },
  { id: 'bd4', title: 'Athletics Recruiting Module',       badge: 'Self-Service',        uses: 94  },
];

const BIZ_TRAINING_MODULES = [
  { id: 'bm1', title: 'New Hire Orientation',     complete: 11, total: 11 },
  { id: 'bm2', title: 'Product Deep Dive',         complete: 8,  total: 11 },
  { id: 'bm3', title: 'Sales Pitch & Objections', complete: 6,  total: 11 },
  { id: 'bm4', title: 'Data Privacy & Security',  complete: 11, total: 11 },
];

const BIZ_TEAM_MEMBERS = [
  { name: 'Alex T.',   modules: [true,  true,  false, true ] },
  { name: 'Jordan M.', modules: [true,  true,  true,  true ] },
  { name: 'Casey R.',  modules: [true,  false, false, true ] },
  { name: 'Morgan L.', modules: [true,  true,  true,  true ] },
  { name: 'Riley D.',  modules: [false, false, false, true ] },
];

const BIZ_CERT_PROGRAMS = [
  { id: 'cp1', title: 'KaNeXT Intelligence Certified', desc: 'Learn KR, archetypes, and scouting reports.', certified: 34, inProgress: 12 },
  { id: 'cp2', title: 'KaNeXT OS Administrator',       desc: 'Full platform management and configuration.',  certified: 8,  inProgress: 5  },
];

const BIZ_KB_ARTICLES = [
  { id: 'ka1', title: 'How to set up your Hub',        category: 'Getting Started' },
  { id: 'ka2', title: 'Managing your team in KaNeXT',  category: 'Getting Started' },
  { id: 'ka3', title: 'Understanding your invoice',    category: 'Billing'         },
  { id: 'ka4', title: 'API integration guide',         category: 'Integrations'    },
];

const BIZ_ONBOARDING_STEPS = [
  { id: 'os1', label: 'Account Created',       done: true  },
  { id: 'os2', label: 'Profile Setup',          done: true  },
  { id: 'os3', label: 'First Project Created', done: true  },
  { id: 'os4', label: 'Integration Connected', done: false },
  { id: 'os5', label: 'Team Invited',          done: false },
];

const BIZ_PIPELINE_STEPS = ['Orientation', 'Product Training', 'Sales Training', 'Compliance'] as const;

function BusinessCEOToolsView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [bizCEOTab, setBizCEOTab] = React.useState<BizCEOTab>('Demos');
  const [bizCEODrop, setBizCEODrop] = React.useState(false);
  const topBarH = insets.top + 52;
  const BIZ_CEO_TABS: BizCEOTab[] = ['Demos', 'Training', 'Certifications', 'Analytics'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 20, backgroundColor: C.bg }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfacePressed }}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBizCEODrop(v => !v); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Business Tools</Text>
              <IconSymbol name={bizCEODrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
            </Pressable>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary />
        </View>
      </View>

      {/* Tab dropdown */}
      {bizCEODrop && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setBizCEODrop(false)} />
          <View style={{ position: 'absolute', top: topBarH + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 16, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
            {BIZ_CEO_TABS.map((t, idx) => (
              <Pressable key={t} style={{ paddingVertical: 13, paddingHorizontal: 20, borderBottomWidth: idx < BIZ_CEO_TABS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { setBizCEOTab(t); setBizCEODrop(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <Text style={{ fontSize: 15, fontWeight: bizCEOTab === t ? '700' : '400', color: bizCEOTab === t ? C.label : C.secondary }}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}>

        {/* ── Demos Tab ── */}
        {bizCEOTab === 'Demos' && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Product Demos</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="plus" size={16} color={C.label} />
              </Pressable>
            </View>
            {BIZ_DEMOS.map(demo => (
              <View key={demo.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1, marginRight: 8 }}>{demo.title}</Text>
                  <View style={{ backgroundColor: C.surfacePressed, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{demo.badge}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 12 }}>{demo.uses.toLocaleString()} uses</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Share</Text>
                  </Pressable>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Training Tab ── */}
        {bizCEOTab === 'Training' && (
          <View>
            <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 16 }}>ONBOARDING PIPELINE</Text>
            <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 0 }}>
                {BIZ_PIPELINE_STEPS.map((step, idx) => (
                  <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.label }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{idx + 1}</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', maxWidth: 64 }}>{step}</Text>
                    </View>
                    {idx < BIZ_PIPELINE_STEPS.length - 1 && (
                      <View style={{ width: 28, height: 2, backgroundColor: C.separator, marginBottom: 18, marginHorizontal: 4 }} />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 16 }}>MODULES</Text>
            {BIZ_TRAINING_MODULES.map(mod => {
              const pct = mod.complete / mod.total;
              return (
                <View key={mod.id} style={{ backgroundColor: C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }}>{mod.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 8 }}>{mod.complete}/{mod.total}</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ height: 4, width: `${pct * 100}%` as any, backgroundColor: C.label, borderRadius: 2 }} />
                  </View>
                </View>
              );
            })}

            <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 10, marginBottom: 10, paddingHorizontal: 16 }}>TEAM COMPLETION</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, padding: 14 }}>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <View style={{ flex: 1 }} />
                {BIZ_TRAINING_MODULES.map((mod, idx) => (
                  <View key={mod.id} style={{ width: 32, alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, color: C.secondary, textAlign: 'center' }}>M{idx + 1}</Text>
                  </View>
                ))}
              </View>
              {BIZ_TEAM_MEMBERS.map(member => (
                <View key={member.name} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ flex: 1, fontSize: 12, color: C.label }}>{member.name}</Text>
                  {member.modules.map((done, idx) => (
                    <View key={idx} style={{ width: 32, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: done ? C.green : C.separator }}>{done ? '✓' : '○'}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Certifications Tab ── */}
        {bizCEOTab === 'Certifications' && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>KaNeXT Certification Programs</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: C.surfacePressed }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Create Program</Text>
              </Pressable>
            </View>
            {BIZ_CERT_PROGRAMS.map(prog => (
              <View key={prog.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 6 }}>{prog.title}</Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12, lineHeight: 19 }}>{prog.desc}</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{prog.certified}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>Certified</Text>
                  </View>
                  <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{prog.inProgress}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>In Progress</Text>
                  </View>
                </View>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingVertical: 9, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Manage</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ── Analytics Tab ── */}
        {bizCEOTab === 'Analytics' && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 12 }}>Training & Demo Analytics</Text>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { label: 'Training Completion', value: '78%'   },
                { label: 'Demo Uses',            value: '1,381' },
                { label: 'Certs Issued',         value: '42'    },
              ].map(kpi => (
                <View key={kpi.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{kpi.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center' }}>{kpi.label}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 10 }}>Completion by Module</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, padding: 16, marginBottom: 16 }}>
              {BIZ_TRAINING_MODULES.map(mod => {
                const pct = mod.complete / mod.total;
                return (
                  <View key={mod.id} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontSize: 12, color: C.label, flex: 1 }}>{mod.title}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{Math.round(pct * 100)}%</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ height: 6, width: `${pct * 100}%` as any, backgroundColor: C.label, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, padding: 16 }}>
              <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>INSIGHT</Text>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>Platform Tour generates <Text style={{ fontWeight: '700' }}>3.2x more closes</Text> than other demos.</Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function BusinessCustomerLearnView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [kbCategory, setKbCategory] = React.useState('Getting Started');
  const topBarH = insets.top + 52;
  const KB_CATEGORIES = ['Getting Started', 'Integrations', 'Billing', 'Advanced'];
  const onboardingDone = BIZ_ONBOARDING_STEPS.filter(s => s.done).length;
  const onboardingTotal = BIZ_ONBOARDING_STEPS.length;
  const onboardingPct = onboardingDone / onboardingTotal;
  const filteredArticles = BIZ_KB_ARTICLES.filter(a => a.category === kbCategory);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 20, backgroundColor: C.bg }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Resources</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary={false} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}>

        {/* Onboarding card */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, marginHorizontal: 16, marginBottom: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>My Onboarding</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>Setup {Math.round(onboardingPct * 100)}% complete</Text>
          </View>
          <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
            <View style={{ height: 6, width: `${onboardingPct * 100}%` as any, backgroundColor: C.label, borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 8 }}>Next: Connect your first integration</Text>
          {BIZ_ONBOARDING_STEPS.map(step => (
            <View key={step.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: step.done ? C.label : C.separator, alignItems: 'center', justifyContent: 'center' }}>
                {step.done && <IconSymbol name="checkmark" size={10} color={C.bg} />}
              </View>
              <Text style={{ fontSize: 13, color: step.done ? C.label : C.secondary }}>{step.label}</Text>
            </View>
          ))}
        </View>

        {/* Knowledge Base */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 }}>KNOWLEDGE BASE</Text>
        <View style={{ marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <Text style={{ fontSize: 14, color: C.secondary }}>Search help articles...</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
          {KB_CATEGORIES.map(cat => {
            const active = cat === kbCategory;
            return (
              <Pressable key={cat} onPress={() => { setKbCategory(cat); Haptics.selectionAsync(); }} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? C.label : C.surfacePressed }}>
                <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? C.bg : C.secondary }}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {(filteredArticles.length > 0 ? filteredArticles : BIZ_KB_ARTICLES).map(article => (
          <Pressable key={article.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, flexDirection: 'row', alignItems: 'center' })}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 3 }}>{article.title}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{article.category}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))}

        {/* Certifications */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginTop: 12, marginBottom: 10 }}>CERTIFICATIONS</Text>
        {BIZ_CERT_PROGRAMS.map(prog => (
          <View key={prog.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>{prog.title}</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10, lineHeight: 18 }}>{prog.desc}</Text>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingVertical: 8, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Start</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ backgroundColor: C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 20, padding: 14 }}>
          <Text style={{ fontSize: 13, color: C.secondary }}>0 of your team members are certified yet.</Text>
        </View>

        {/* Tools */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 }}>TOOLS</Text>
        {[
          { id: 'rt1', title: 'ROI Calculator',      subtitle: 'Estimate your return on investment' },
          { id: 'rt2', title: 'Pricing Estimator',   subtitle: 'Build a custom plan estimate'       },
          { id: 'rt3', title: 'Platform Comparison', subtitle: 'See how KaNeXT stacks up'           },
        ].map(tool => (
          <Pressable key={tool.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, flexDirection: 'row', alignItems: 'center' })}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{tool.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{tool.subtitle}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))}

      </ScrollView>
    </View>
  );
}

// ── Education President: Academic Tools View ─────────────────────────────────

type EduAdminTab = 'Courses' | 'Training' | 'Orientation' | 'Analytics';

const EDU_ADMIN_COURSES = [
  { id: 'eac1', title: 'BUS 401: Strategic Management',  program: 'BA Business Admin', enrollment: 34, engagement: 78, status: 'active', modules: 14 },
  { id: 'eac2', title: 'MBA 520: Finance & Accounting',  program: 'MBA',               enrollment: 28, engagement: 71, status: 'active', modules: 18 },
  { id: 'eac3', title: 'MKT 350: Consumer Behavior',     program: 'BA Business Admin', enrollment: 41, engagement: 84, status: 'active', modules: 12 },
  { id: 'eac4', title: 'DBA 601: Research Methods',      program: 'DBA',               enrollment: 12, engagement: 91, status: 'active', modules: 10 },
  { id: 'eac5', title: 'BS 201: Diagnostic Imaging I',   program: 'BS DiagImaging',    enrollment: 19, engagement: 68, status: 'draft',  modules: 16 },
];

const EDU_TRAINING_MODULES = [
  { id: 'et1', title: 'Title IX Compliance Training',    emoji: '⚖️', certified: 38, total: 38, dueDate: 'Complete', type: 'Compliance'  },
  { id: 'et2', title: 'FERPA Privacy Training',          emoji: '🔒', certified: 35, total: 38, dueDate: 'Apr 30',   type: 'Compliance'  },
  { id: 'et3', title: 'Campus Safety & Emergency',       emoji: '🚨', certified: 31, total: 38, dueDate: 'May 15',   type: 'Safety'      },
  { id: 'et4', title: 'KPlay LMS Faculty Orientation',   emoji: '💻', certified: 24, total: 38, dueDate: 'Ongoing',  type: 'Technology'  },
  { id: 'et5', title: 'Accessibility & ADA Standards',   emoji: '♿', certified: 29, total: 38, dueDate: 'Jun 1',    type: 'Compliance'  },
];

const EDU_ORIENTATION_STEPS = [
  { id: 'eo1', title: 'Welcome to Lincoln University',         completed: 436, total: 436 },
  { id: 'eo2', title: 'Academic Policies & Expectations',      completed: 421, total: 436 },
  { id: 'eo3', title: 'Campus Virtual Tour',                   completed: 398, total: 436 },
  { id: 'eo4', title: 'Student Services Guide',                completed: 387, total: 436 },
  { id: 'eo5', title: 'Financial Aid & Tuition Overview',      completed: 362, total: 436 },
  { id: 'eo6', title: 'LMS Platform Walkthrough',              completed: 341, total: 436 },
];

function EducationPresidentAcademicToolsView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [eduAdminTab, setEduAdminTab] = React.useState<EduAdminTab>('Courses');
  const [eduAdminDrop, setEduAdminDrop] = React.useState(false);
  const topBarH = insets.top + 52;
  const EDU_ADMIN_TABS: EduAdminTab[] = ['Courses', 'Training', 'Orientation', 'Analytics'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 20, backgroundColor: C.bg }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfacePressed }}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEduAdminDrop(v => !v); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{eduAdminTab}</Text>
              <IconSymbol name={eduAdminDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
            </Pressable>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary />
        </View>
      </View>

      {/* Dropdown */}
      {eduAdminDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 16, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {EDU_ADMIN_TABS.map((tab, i) => (
            <Pressable key={tab} style={{ paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: i < EDU_ADMIN_TABS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { Haptics.selectionAsync(); setEduAdminTab(tab); setEduAdminDrop(false); }}>
              <Text style={{ fontSize: 15, color: tab === eduAdminTab ? C.label : C.secondary, fontWeight: tab === eduAdminTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── COURSES TAB ── */}
        {eduAdminTab === 'Courses' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }}>
              <IconSymbol name="plus" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Create Course Supplement</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>ACTIVE COURSE SUPPLEMENTS</Text>
            {EDU_ADMIN_COURSES.map(course => (
              <Pressable key={course.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 10, padding: 16 })}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>{course.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: C.surfacePressed }}>
                        <Text style={{ fontSize: 11, color: C.secondary }}>{course.program}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{course.modules} modules</Text>
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: course.status === 'active' ? '#5A8A6E22' : C.surfacePressed }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: course.status === 'active' ? '#5A8A6E' : C.secondary }}>{course.status === 'active' ? 'Active' : 'Draft'}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 24 }}>
                  <View>
                    <Text style={{ fontSize: 11, color: C.muted }}>Enrollment</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{course.enrollment}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: C.muted }}>Engagement</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#5A8A6E' }}>{course.engagement}%</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── TRAINING TAB ── */}
        {eduAdminTab === 'Training' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>FACULTY & STAFF TRAINING</Text>
            {EDU_TRAINING_MODULES.map(mod => {
              const certRate = Math.round((mod.certified / mod.total) * 100);
              const isComplete = mod.dueDate === 'Complete';
              return (
                <View key={mod.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 26 }}>{mod.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>{mod.title}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: C.surfacePressed }}>
                          <Text style={{ fontSize: 11, color: C.secondary }}>{mod.type}</Text>
                        </View>
                      </View>
                      <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 4 }}>
                        <View style={{ width: `${certRate}%` as any, height: 4, backgroundColor: '#5A8A6E', borderRadius: 2 }} />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{mod.certified} of {mod.total} certified ({certRate}%)</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: isComplete ? '#5A8A6E' : '#B8943E' }}>Due: {mod.dueDate}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── ORIENTATION TAB ── */}
        {eduAdminTab === 'Orientation' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12 }}>New Student Orientation — Spring 2026</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Total Students', value: '436' },
                { label: 'Fully Complete', value: '341' },
                { label: 'Avg Completion', value: '89%' },
              ].map(stat => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>{stat.label}</Text>
                </View>
              ))}
            </View>
            {EDU_ORIENTATION_STEPS.map((step, idx) => {
              const pct = Math.round((step.completed / step.total) * 100);
              return (
                <View key={step.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 8 }}>{step.title}</Text>
                    <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 4 }}>
                      <View style={{ width: `${pct}%` as any, height: 4, backgroundColor: '#5A8A6E', borderRadius: 2 }} />
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{step.completed} of {step.total} completed</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── ANALYTICS TAB ── */}
        {eduAdminTab === 'Analytics' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 4 }}>KEY PERFORMANCE INDICATORS</Text>
            {[
              { label: 'Course Supplement Engagement', value: '79% avg',  sub: '+4% vs last semester'           },
              { label: 'Training Completion Rate',      value: '91%',      sub: '38 faculty/staff tracked'       },
              { label: 'Orientation Completion',        value: '89%',      sub: '341 of 436 students complete'   },
              { label: 'Student Content Interactions',  value: '4,892',    sub: 'this semester'                  },
            ].map(stat => (
              <View key={stat.label} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16 }}>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 4 }}>{stat.label}</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: C.label, marginBottom: 2 }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: '#5A8A6E' }}>{stat.sub}</Text>
              </View>
            ))}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 12 }}>ENGAGEMENT BY PROGRAM</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16 }}>
              {[
                { program: 'BA Business Admin', pct: 84 },
                { program: 'MBA',               pct: 91 },
                { program: 'BS DiagImaging',    pct: 68 },
                { program: 'MS IBFM',           pct: 77 },
                { program: 'DBA',               pct: 95 },
              ].map((row, i, arr) => (
                <View key={row.program} style={{ marginBottom: i < arr.length - 1 ? 14 : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{row.program}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#5A8A6E' }}>{row.pct}%</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
                    <View style={{ width: `${row.pct}%` as any, height: 4, backgroundColor: '#5A8A6E', borderRadius: 2 }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── Community Pastor: Ministry Tools View ────────────────────────────────────

type MinistryTab = 'Courses' | 'Training' | 'Content' | 'Analytics';

const PASTOR_COURSES = [
  { id: 'pc1', title: 'New Member Class',       emoji: '✝️', enrolled: 47, completion: 73, status: 'active', modules: 6 },
  { id: 'pc2', title: 'Baptism Preparation',    emoji: '💧', enrolled: 12, completion: 91, status: 'active', modules: 4 },
  { id: 'pc3', title: 'Marriage Enrichment',    emoji: '💍', enrolled: 28, completion: 58, status: 'active', modules: 8 },
  { id: 'pc4', title: 'Leadership Development', emoji: '🏆', enrolled: 15, completion: 82, status: 'active', modules: 10 },
  { id: 'pc5', title: 'Financial Freedom',      emoji: '💰', enrolled: 34, completion: 64, status: 'active', modules: 5 },
  { id: 'pc6', title: 'Parenting Course',       emoji: '👨‍👩‍👧', enrolled: 22, completion: 47, status: 'draft',  modules: 7 },
];
const VOLUNTEER_TRAINING = [
  { id: 'vt1', title: 'Usher Training',               emoji: '🚶', certified: 24, total: 28, recert: false },
  { id: 'vt2', title: "Children's Ministry Safety",   emoji: '🧒', certified: 18, total: 22, recert: true  },
  { id: 'vt3', title: 'Sound/AV Training',            emoji: '🎚️', certified: 8,  total: 10, recert: false },
  { id: 'vt4', title: 'Worship Team Protocol',        emoji: '🎵', certified: 15, total: 17, recert: false },
  { id: 'vt5', title: 'Greeter Training',             emoji: '👋', certified: 32, total: 36, recert: false },
];
const MINISTRY_CONTENT = [
  { id: 'mc1', title: 'Bible Trivia Pack',          emoji: '📖', type: 'Trivia',     plays: 847  },
  { id: 'mc2', title: 'Daily Devotional Series',    emoji: '🙏', type: 'Devotional', plays: 1243 },
  { id: 'mc3', title: 'Scripture Memory Challenge', emoji: '📝', type: 'Flashcards', plays: 612  },
  { id: 'mc4', title: 'Sermon Discussion Guide',    emoji: '💬', type: 'Discussion', plays: 389  },
];

function CommunityPastorMinistryToolsView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [ministryTab, setMinistryTab] = React.useState<MinistryTab>('Courses');
  const [ministryDrop, setMinistryDrop] = React.useState(false);
  const topBarH = insets.top + 52;
  const MINISTRY_TABS: MinistryTab[] = ['Courses', 'Training', 'Content', 'Analytics'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 20, backgroundColor: C.bg }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfacePressed }}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMinistryDrop(v => !v); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{ministryTab}</Text>
              <IconSymbol name={ministryDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
            </Pressable>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
      </View>

      {/* Dropdown */}
      {ministryDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 16, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {MINISTRY_TABS.map((tab, i) => (
            <Pressable key={tab} style={{ paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: i < MINISTRY_TABS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { Haptics.selectionAsync(); setMinistryTab(tab); setMinistryDrop(false); }}>
              <Text style={{ fontSize: 15, color: tab === ministryTab ? C.label : C.secondary, fontWeight: tab === ministryTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── COURSES TAB ── */}
        {ministryTab === 'Courses' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }}>
              <IconSymbol name="plus" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Create New Course</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>ACTIVE COURSES</Text>
            {PASTOR_COURSES.map(course => (
              <Pressable key={course.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 10, padding: 16 })}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{course.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>{course.title}</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: course.status === 'active' ? '#5A8A6E22' : C.surfacePressed }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: course.status === 'active' ? '#5A8A6E' : C.secondary }}>{course.status === 'active' ? 'Active' : 'Draft'}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{course.modules} modules</Text>
                    <View style={{ flexDirection: 'row', gap: 20 }}>
                      <View>
                        <Text style={{ fontSize: 11, color: C.muted }}>Enrolled</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{course.enrolled}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 11, color: C.muted }}>Completion</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#5A8A6E' }}>{course.completion}%</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── TRAINING TAB ── */}
        {ministryTab === 'Training' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>VOLUNTEER TRAINING MODULES</Text>
            {VOLUNTEER_TRAINING.map(mod => {
              const certRate = Math.round((mod.certified / mod.total) * 100);
              return (
                <View key={mod.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 26 }}>{mod.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }}>{mod.title}</Text>
                        {mod.recert && (
                          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#B8943E22' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#B8943E' }}>Recert Due</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 4 }}>
                        <View style={{ width: `${certRate}%` as any, height: 4, backgroundColor: '#5A8A6E', borderRadius: 2 }} />
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{mod.certified} of {mod.total} certified ({certRate}%)</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── CONTENT TAB ── */}
        {ministryTab === 'Content' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }}>
              <IconSymbol name="plus" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Create Content</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>INTERACTIVE CONTENT</Text>
            {MINISTRY_CONTENT.map(content => (
              <Pressable key={content.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 10, padding: 16 })}>
                <Text style={{ fontSize: 28 }}>{content.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{content.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: C.surfacePressed }}>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{content.type}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{content.plays.toLocaleString()} plays</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* ── ANALYTICS TAB ── */}
        {ministryTab === 'Analytics' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 4 }}>OVERVIEW</Text>
            {[
              { label: 'Total Enrollments',    value: '158',      sub: 'across all courses'          },
              { label: 'Avg Completion Rate',  value: '69%',      sub: 'across active courses'       },
              { label: 'Certified Volunteers', value: '97 / 113', sub: 'across all training tracks'  },
              { label: 'Content Plays',        value: '3,091',    sub: 'total interactions this month'},
            ].map(stat => (
              <View key={stat.label} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16 }}>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 4 }}>{stat.label}</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: C.label, marginBottom: 2 }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: '#5A8A6E' }}>{stat.sub}</Text>
              </View>
            ))}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 12 }}>QUIZ PERFORMANCE</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16 }}>
              {[
                { title: 'Bible Trivia Pack',          avg: '84%' },
                { title: 'Scripture Memory Challenge', avg: '76%' },
                { title: 'Sermon Discussion Guide',    avg: 'N/A' },
              ].map((row, i, arr) => (
                <View key={row.title} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: i < arr.length - 1 ? 12 : 0 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{row.title}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: row.avg !== 'N/A' ? '#5A8A6E' : C.secondary }}>{row.avg}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── Personal Owner Studio View ───────────────────────────────────────────────

type StudioOwnerTab = 'Courses' | 'Games' | 'Analytics';

const OWNER_COURSES_DATA = [
  { id: 'oc1', title: 'Entrepreneurship 101',        emoji: '🚀', enrollments: 847,  revenue: '$12,600', status: 'published', lessons: 12 },
  { id: 'oc2', title: 'Content Creator Playbook',    emoji: '📱', enrollments: 1243, revenue: '$18,645', status: 'published', lessons: 18 },
  { id: 'oc3', title: 'Brand Partnership Masterclass', emoji: '🤝', enrollments: 312, revenue: '$15,600', status: 'published', lessons: 8 },
  { id: 'oc4', title: 'Mindset & Productivity',      emoji: '🧠', enrollments: 0,    revenue: '$0',      status: 'draft',     lessons: 6 },
];
const OWNER_GAMES_DATA = [
  { id: 'og1', title: 'Brand Trivia Challenge',      emoji: '🎯', type: 'Trivia',      plays: 2341, completionRate: 78 },
  { id: 'og2', title: 'Creator Mindset Quiz',        emoji: '🧩', type: 'Quiz',        plays: 1876, completionRate: 92 },
  { id: 'og3', title: 'Entrepreneurship Calculator', emoji: '📊', type: 'Calculator', plays: 654,  completionRate: 61 },
];

function PersonalOwnerStudioView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [studioTab, setStudioTab] = useState<StudioOwnerTab>('Courses');
  const [studioDrop, setStudioDrop] = useState(false);
  const topBarH = insets.top + 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStudioDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{studioTab}</Text>
          <IconSymbol name={studioDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} isPrimary />
        </View>
      </View>

      {/* Dropdown */}
      {studioDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '22%', right: '22%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Courses', 'Games', 'Analytics'] as StudioOwnerTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setStudioTab(tab); setStudioDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === studioTab ? C.label : C.secondary, fontWeight: tab === studioTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>

        {/* ── COURSES TAB ── */}
        {studioTab === 'Courses' && (
          <>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }}>
              <IconSymbol name="plus" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Create New Course</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10 }}>MY COURSES</Text>
            {OWNER_COURSES_DATA.map(course => (
              <Pressable key={course.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 16 })}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                  <Text style={{ fontSize: 32 }}>{course.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, flex: 1 }}>{course.title}</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: course.status === 'published' ? '#5A8A6E22' : C.surfacePressed }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: course.status === 'published' ? '#5A8A6E' : C.secondary }}>{course.status === 'published' ? 'Live' : 'Draft'}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{course.lessons} lessons</Text>
                    <View style={{ flexDirection: 'row', gap: 20 }}>
                      <View>
                        <Text style={{ fontSize: 11, color: C.muted }}>Enrolled</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{course.enrollments.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 11, color: C.muted }}>Revenue</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{course.revenue}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {/* ── GAMES TAB ── */}
        {studioTab === 'Games' && (
          <>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }}>
              <IconSymbol name="plus" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontSize: 15, fontWeight: '700' }}>Create Interactive Content</Text>
            </Pressable>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10 }}>MY GAMES & QUIZZES</Text>
            {OWNER_GAMES_DATA.map(game => (
              <Pressable key={game.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 })}>
                <Text style={{ fontSize: 30 }}>{game.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{game.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{game.type}</Text>
                  <View style={{ flexDirection: 'row', gap: 18 }}>
                    <View>
                      <Text style={{ fontSize: 11, color: C.muted }}>Plays</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{game.plays.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: C.muted }}>Completion</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#5A8A6E' }}>{game.completionRate}%</Text>
                    </View>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </Pressable>
            ))}
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {studioTab === 'Analytics' && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 12 }}>OVERVIEW</Text>
            {[
              { label: 'Total Enrollments', value: '2,402', sub: '+184 this month' },
              { label: 'Total Revenue', value: '$46,845', sub: '+$3,200 this month' },
              { label: 'Avg Completion Rate', value: '77%', sub: 'across all courses' },
              { label: 'Avg Rating', value: '4.8 / 5.0', sub: 'from 892 reviews' },
            ].map(stat => (
              <View key={stat.label} style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 16 }}>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 4 }}>{stat.label}</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: C.label, marginBottom: 2 }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: '#5A8A6E' }}>{stat.sub}</Text>
              </View>
            ))}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginTop: 6, marginBottom: 12 }}>TOP COURSE</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 4 }}>Content Creator Playbook</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>1,243 enrolled · $18,645 revenue</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 11, color: C.muted }}>Completion</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#5A8A6E' }}>82%</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: C.muted }}>Rating</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>4.9 / 5.0</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: C.muted }}>Reviews</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>412</Text>
                </View>
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

// ── Personal Subscriber View ─────────────────────────────────────────────────

const SUB_COURSES = [
  { id: 'sub-c1', title: 'Content Creation 101', progress: 0.6,  enrolled: true,  lessons: 8,  price: 'Free'  },
  { id: 'sub-c2', title: 'Grow Your Audience',   progress: 0.2,  enrolled: true,  lessons: 12, price: '$49'   },
  { id: 'sub-c3', title: 'Personal Branding',    progress: 0,    enrolled: false, lessons: 10, price: '$29'   },
  { id: 'sub-c4', title: 'Monetize Your Brand',  progress: 0,    enrolled: false, lessons: 14, price: '$79'   },
];
const SUB_GAMES = [
  { id: 'sg1', title: 'Brand Strategy Quiz',    type: 'Quiz',     plays: '2.1K', emoji: '🧠' },
  { id: 'sg2', title: 'Content Creator Challenge', type: 'Challenge', plays: '847', emoji: '🏆' },
];
const SUB_CERTS = [
  { id: 'cert1', title: 'Content Creator Fundamentals', date: 'Mar 15, 2026', emoji: '🎓' },
];

function PersonalSubscriberView({
  C, insets, cycleRole, role,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  cycleRole: () => void;
  role: string;
}) {
  const topBarH = insets.top + 52;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Learn & Play</Text>
        </View>
        <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} isPrimary={false} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* MY COURSES */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingHorizontal: 16 }}>MY COURSES</Text>
        {SUB_COURSES.filter(c => c.enrolled).map(course => (
          <Pressable key={course.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14 })}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 4 }}>{course.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>{course.lessons} lessons</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>·</Text>
              <Text style={{ fontSize: 12, color: C.gain }}>{Math.round(course.progress * 100)}% complete</Text>
            </View>
            <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
              <View style={{ width: `${course.progress * 100}%`, height: 4, backgroundColor: C.label, borderRadius: 2 }} />
            </View>
          </Pressable>
        ))}

        {/* AVAILABLE COURSES */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingHorizontal: 16 }}>AVAILABLE COURSES</Text>
        {SUB_COURSES.filter(c => !c.enrolled).map(course => (
          <Pressable key={course.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14 })}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{course.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{course.lessons} lessons</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.label, borderRadius: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>{course.price}</Text>
            </View>
          </Pressable>
        ))}

        {/* GAMES & CHALLENGES */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingHorizontal: 16 }}>GAMES & CHALLENGES</Text>
        {SUB_GAMES.map(game => (
          <Pressable key={game.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14 })}>
            <Text style={{ fontSize: 28 }}>{game.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{game.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{game.type} · {game.plays} plays</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))}

        {/* CERTIFICATES EARNED */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingHorizontal: 16 }}>CERTIFICATES EARNED</Text>
        {SUB_CERTS.map(cert => (
          <View key={cert.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14 }}>
            <Text style={{ fontSize: 28 }}>{cert.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{cert.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Earned {cert.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Demo seed data (shown until real AsyncStorage progress loads) ────────────

const DEMO_PROGRESS: Record<string, ProgressEntry> = {
  'ks-biz-course-1':  { progress: 0.45, completed: false, lastPlayed: '2026-03-20T10:00:00Z', currentIndex: 2 },
  'ks-edu-course-1':  { progress: 0.70, completed: false, lastPlayed: '2026-03-22T14:00:00Z', currentIndex: 3 },
  'ks-sp-training-1': { progress: 0.30, completed: false, lastPlayed: '2026-03-18T09:00:00Z', currentIndex: 1 },
  'ks-sp-trivia-1':   { progress: 1, completed: true, score: 80,  lastPlayed: '2026-03-15T16:00:00Z' },
  'ks-com-flash-1':   { progress: 1, completed: true, score: 100, lastPlayed: '2026-03-10T11:00:00Z' },
  'ks-biz-trivia-1':  { progress: 1, completed: true, score: 90,  lastPlayed: '2026-03-05T15:00:00Z' },
};
const DEMO_SAVED_IDS = ['ks-edu-lab-1', 'ks-biz-sim-1', 'ks-edu-trivia-1'];

// ── KayStudios role keys per mode ──────────────────────────────────────────
const KAYSTUDIOS_ROLE_KEYS: Record<string, string> = {
  sports:    'sports:kaystudios',
  education: 'education:kaystudios',
  community: 'community',
  business:  'business',
  personal:  'personal:kaystudios',
};

// Admin creator tools per mode
const KAYSTUDIOS_ADMIN_TOOLS: Record<string, { header: string; tools: string[] }> = {
  sports:    { header: 'Coaching Tools',          tools: ['Tactical Draw Tool', 'Opponent Scouting', 'Team IQ Assessment', 'Film Breakdown', 'Play Designer'] },
  education: { header: 'Course Builder',           tools: ['Create Course', 'Build Assessment', 'Grade Submissions', 'Student Progress', 'Publish Content'] },
  community: { header: 'Content Creator',          tools: ['New Member Course', 'Volunteer Training', 'Devotional Creator', 'Trivia Builder', 'Manage Library'] },
  business:  { header: 'Training Builder',         tools: ['Product Demo Builder', 'Certification Creator', 'Sales Training', 'Onboarding Flow', 'ROI Calculator'] },
  personal:  { header: 'My Studio',               tools: ['Create Experience', 'Manage Library', 'Analytics', 'Share'] },
};

// ── Live KPlay Data ──────────────────────────────────────────────────────────

const LIVE_KPLAY_CONTENT: Record<string, { featured: Array<{ id: string; emoji: string; title: string; desc: string; price: string; action: string }>; leaderboard: Array<{ rank: number; name: string; score: string }> }> = {
  personal: {
    featured: [
      { id: '1', emoji: '🧠', title: 'Creator Growth Masterclass', desc: '12 lessons on building an audience and monetizing your knowledge.', price: '$49', action: 'Enroll' },
      { id: '2', emoji: '📊', title: 'Analytics for Creators', desc: 'Free introductory course. Learn to read your numbers.', price: 'Free', action: 'Start' },
      { id: '3', emoji: '🏆', title: 'Creator Leaderboard', desc: 'Compete with other creators. Top 10 get featured this month.', price: 'Free', action: 'Join' },
    ],
    leaderboard: [
      { rank: 1, name: 'Sammy K.', score: '9,842 pts' },
      { rank: 2, name: 'Jordan M.', score: '8,210 pts' },
      { rank: 3, name: 'Alexis T.', score: '7,654 pts' },
    ],
  },
  business: {
    featured: [
      { id: '1', emoji: '🚀', title: 'KaNeXT Product Walkthrough', desc: 'Interactive tour of all 9 tiles. Self-paced.', price: 'Free', action: 'Start' },
      { id: '2', emoji: '📈', title: 'ROI Calculator', desc: 'See the projected ROI of KaNeXT for your organization.', price: 'Free', action: 'Calculate' },
      { id: '3', emoji: '🏢', title: 'Enterprise Readiness Quiz', desc: 'Is your organization ready for the OS? Find out.', price: 'Free', action: 'Take Quiz' },
    ],
    leaderboard: [
      { rank: 1, name: 'Lincoln University', score: '12,480 pts' },
      { rank: 2, name: 'Fresno State', score: '11,200 pts' },
      { rank: 3, name: 'TechCorp Inc.', score: '9,870 pts' },
    ],
  },
  education: {
    featured: [
      { id: '1', emoji: '🗺', title: 'Virtual Campus Tour', desc: "Explore Lincoln University's Oakland campus interactively.", price: 'Free', action: 'Explore' },
      { id: '2', emoji: '🎓', title: 'Program Explorer', desc: 'Find the right degree for your goals.', price: 'Free', action: 'Explore' },
      { id: '3', emoji: '✅', title: '"Is Lincoln Right For Me?" Quiz', desc: '5-minute quiz to help you decide.', price: 'Free', action: 'Take Quiz' },
    ],
    leaderboard: [
      { rank: 1, name: 'Jordan S.', score: '4,210 pts' },
      { rank: 2, name: 'Marcus D.', score: '3,870 pts' },
      { rank: 3, name: 'Aisha P.', score: '3,540 pts' },
    ],
  },
  community: {
    featured: [
      { id: '1', emoji: '✝️', title: '"New Here?" Welcome Course', desc: 'Learn what ICCLA believes and how to get connected.', price: 'Free', action: 'Start' },
      { id: '2', emoji: '📖', title: 'Daily Devotional', desc: 'A new devotional every morning. Start your day with purpose.', price: 'Free', action: "Read Today's" },
      { id: '3', emoji: '🏆', title: 'Bible Trivia Challenge', desc: 'How well do you know the Word? Compete with the community.', price: 'Free', action: 'Play' },
    ],
    leaderboard: [
      { rank: 1, name: 'Ruth A.', score: '6,340 pts' },
      { rank: 2, name: 'Emmanuel O.', score: '5,780 pts' },
      { rank: 3, name: 'Grace M.', score: '5,100 pts' },
    ],
  },
  sports: {
    featured: [
      { id: '1', emoji: '🏀', title: 'College Basketball GM', desc: 'Build your dream roster using real KR data from 37K players.', price: 'Free', action: 'Play' },
      { id: '2', emoji: '🎯', title: "Pick'em: GAAC Championship", desc: 'Predict the bracket. Top picker wins merch.', price: 'Free', action: 'Make Picks' },
      { id: '3', emoji: '❓', title: 'LU Basketball Trivia', desc: 'How well do you know the Oaklanders?', price: 'Free', action: 'Play' },
      { id: '4', emoji: '🏆', title: 'Fantasy Basketball (KR-Powered)', desc: 'Draft real players from the KaNeXT pool. KR scores your lineup.', price: 'Free', action: 'Join League' },
    ],
    leaderboard: [
      { rank: 1, name: 'Coach_Fan_23', score: '18,420 pts' },
      { rank: 2, name: 'OaklandLoyalist', score: '17,100 pts' },
      { rank: 3, name: 'HoopsDad_LU', score: '15,670 pts' },
    ],
  },
};

function LiveKplayView({ mode, C, insets }: { mode: string; C: any; insets: any }) {
  const content = LIVE_KPLAY_CONTENT[mode] ?? LIVE_KPLAY_CONTENT.personal;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8 }}>KPlay</Text>
        {/* Featured */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Featured</Text>
        {content.featured.map(item => (
          <View key={item.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 17 }}>{item.desc}</Text>
              </View>
            </View>
            <Pressable style={{ backgroundColor: C.label, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>{item.action}{item.price !== 'Free' ? ` · ${item.price}` : ''}</Text>
            </Pressable>
          </View>
        ))}
        {/* Leaderboard */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Leaderboard</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden' }}>
          {content.leaderboard.map((entry, i) => (
            <View key={entry.rank} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: C.separator, gap: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.secondary, width: 20 }}>{entry.rank}</Text>
              <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{entry.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>{entry.score}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── KayStudios Screen ───────────────────────────────────────────────────────

export default function KayStudiosScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'business';

  const dataMode = useDataMode();

  const roleKey = KAYSTUDIOS_ROLE_KEYS[mode] ?? 'business';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdmin = role === roleCycles[0];
  const accent  = MODE_ACCENTS[mode] ?? C.accent;

  const [activeTab, setActiveTab] = useState<KSTab>('Home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [allProgress, setAllProgress] = useState<Record<string, ProgressEntry>>(DEMO_PROGRESS);
  const [savedIds, setSavedIds] = useState<string[]>(DEMO_SAVED_IDS);
  const [eduStudentTab, setEduStudentTab] = useState<'My Courses' | 'Orientation' | 'Study Tools' | 'Career'>('My Courses');
  const [eduStudentDrop, setEduStudentDrop] = useState(false);

  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Swipe-right to open side panel
  const swipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          gs.dx > 25 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dx > 60) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openSidePanel();
          }
        },
      }),
    [],
  );

  const topBarH = insets.top + TOP_BAR_H;
  const contentTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0);

  const pills = STUDIOS_PILLS;
  const feedContent = useMemo(() => getFeedContent(), []);
  const exploreRows = useMemo(() => getExploreRows(), []);
  const allContent = useMemo(() => getAllContent(), []);

  const loadLibraryData = useCallback(async () => {
    const [prog, saves] = await Promise.all([loadAllProgress(), getSavedIds()]);
    setAllProgress(prog);
    setSavedIds(saves);
  }, []);

  useEffect(() => { loadLibraryData(); }, [loadLibraryData]);

  useEffect(() => {
    if (activeTab === 'Library') loadLibraryData();
  }, [activeTab, loadLibraryData]);

  // Library derived lists
  const inProgressItems = useMemo(() =>
    allContent.filter(c => { const p = allProgress[c.id]; return p && p.progress > 0 && !p.completed; }),
    [allContent, allProgress]);
  const completedItems = useMemo(() =>
    allContent.filter(c => allProgress[c.id]?.completed),
    [allContent, allProgress]);
  const savedItems = useMemo(() =>
    allContent.filter(c => savedIds.includes(c.id)),
    [allContent, savedIds]);
  const myCourses = useMemo(() =>
    allContent.filter(c => c.type === 'course'),
    [allContent]);
  const recommendedItems = useMemo(() =>
    allContent
      .filter(c => !allProgress[c.id] && !savedIds.includes(c.id) && c.type !== 'course')
      .slice(0, 5),
    [allContent, allProgress, savedIds]);

  const filteredFeed = useMemo(() => filterByPill(feedContent, selectedPill), [feedContent, selectedPill]);
  const filteredExploreRows = useMemo(() =>
    exploreRows.map(row => ({ ...row, items: filterByPill(row.items, selectedPill) }))
      .filter(row => row.items.length > 0),
    [exploreRows, selectedPill]);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const toggleFilterPills = useCallback(() => {
    setFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const handleTabSelect = useCallback((tab: KSTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdownOpen(false);
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
    setSelectedPill('All');
  }, [pillsRevealAnim]);

  const launchExperience = useCallback((item: StudioContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/experience' as any,
      params: { contentId: item.id },
    });
  }, [router]);

  const navigateToDetail = useCallback((item: StudioContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/detail' as any,
      params: { contentId: item.id },
    });
  }, [router]);

  // ── Live mode: public KPlay view ────────────────────────────────────────────
  if (dataMode === 'live') return <LiveKplayView mode={mode} C={C} insets={insets} />;

  // ── Business CEO: Business Tools early return ──────────────────────────────
  if (mode === 'business' && isAdmin) {
    return (
      <BusinessCEOToolsView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Business Customer: Resources early return ─────────────────────────────
  if (mode === 'business' && !isAdmin) {
    return (
      <BusinessCustomerLearnView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Education President: Academic Tools ─────────────────────────────────────
  if (mode === 'education' && isAdmin) {
    return (
      <EducationPresidentAcademicToolsView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Education Student early return ──────────────────────────────────────────
  if (mode === 'education' && !isAdmin) {
    const EDU_COURSES = [
      { id: 'ec1', code: 'BUS 401', title: 'Strategic Management',    progress: 0.68, lessons: 10, nextLesson: 'Competitive Dynamics' },
      { id: 'ec2', code: 'MKT 350', title: 'Consumer Behavior',       progress: 0.42, lessons: 12, nextLesson: 'Decision-Making Models' },
      { id: 'ec3', code: 'MBA 520', title: 'Finance & Accounting',    progress: 0.55, lessons: 14, nextLesson: 'Cash Flow Analysis' },
      { id: 'ec4', code: 'MBA 510', title: 'Organizational Behavior', progress: 0.30, lessons: 11, nextLesson: 'Leadership Styles' },
    ];
    const EDU_TOOLS = [
      { id: 'et1', icon: 'doc.text.fill',          label: 'Flashcards',    subtitle: 'BUS 401 · 120 cards' },
      { id: 'et2', icon: 'list.bullet.clipboard',  label: 'Practice Exams', subtitle: 'MBA 520 · 3 sets available' },
      { id: 'et3', icon: 'magnifyingglass',         label: 'Case Studies',  subtitle: '8 assigned this semester' },
    ];
    const EDU_ACADEMIC_SKILLS = [
      { id: 'as1', label: 'Time Management Workshop', type: 'Interactive', duration: '45 min' },
      { id: 'as2', label: 'Research Methods Guide',   type: 'Reference',   duration: '30 min' },
      { id: 'as3', label: 'Study Techniques Toolkit', type: 'Interactive', duration: '25 min' },
    ];
    const EDU_STUDENT_TABS: ('My Courses' | 'Orientation' | 'Study Tools' | 'Career')[] = ['My Courses', 'Orientation', 'Study Tools', 'Career'];
    const topBarH2 = insets.top + TOP_BAR_H;
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Top Bar */}
        <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 20, backgroundColor: C.bg }}>
          <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
            <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfacePressed }}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEduStudentDrop(v => !v); }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{eduStudentTab}</Text>
                <IconSymbol name={eduStudentDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
              </Pressable>
            </View>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>

        {/* Dropdown */}
        {eduStudentDrop && (
          <View style={{ position: 'absolute', top: topBarH2 + 4, left: '18%', right: '18%', backgroundColor: C.surface, borderRadius: 16, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
            {EDU_STUDENT_TABS.map((tab, i) => (
              <Pressable key={tab} style={{ paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: i < EDU_STUDENT_TABS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }} onPress={() => { Haptics.selectionAsync(); setEduStudentTab(tab); setEduStudentDrop(false); }}>
                <Text style={{ fontSize: 15, color: tab === eduStudentTab ? C.label : C.secondary, fontWeight: tab === eduStudentTab ? '600' : '400' }}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView contentContainerStyle={{ paddingTop: topBarH2 + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

          {/* ── MY COURSES TAB ── */}
          {eduStudentTab === 'My Courses' && (
            <View>
              {/* Orientation Banner */}
              <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 8, backgroundColor: C.surface, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: C.label }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>New Student Orientation</Text>
                  <View style={{ backgroundColor: C.label + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>Required</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>Complete all modules before May 1, 2026</Text>
                <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, marginBottom: 4 }}>
                  <View style={{ width: '65%', height: 6, backgroundColor: C.label, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 12, color: C.secondary }}>65% complete · 4 modules remaining</Text>
              </View>

              {/* Course Supplements */}
              <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 8, paddingHorizontal: 16 }}>MY COURSE SUPPLEMENTS</Text>
              {EDU_COURSES.map(course => (
                <Pressable
                  key={course.id}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14 })}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary }}>{course.code}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{Math.round(course.progress * 100)}%</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 6 }}>{course.title}</Text>
                  <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 6 }}>
                    <View style={{ width: `${course.progress * 100}%`, height: 4, backgroundColor: C.label, borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: 12, color: C.muted }}>Next: {course.nextLesson} · {course.lessons} lessons total</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── ORIENTATION TAB ── */}
          {eduStudentTab === 'Orientation' && (
            <View style={{ paddingHorizontal: 16 }}>
              {/* Required Banner */}
              <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: C.label, marginBottom: 16, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>New Student Orientation</Text>
                  <View style={{ backgroundColor: C.label + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>Required</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>Required — Complete before May 1, 2026</Text>
                <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, marginBottom: 4 }}>
                  <View style={{ width: '65%', height: 6, backgroundColor: C.label, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 12, color: C.secondary }}>65% complete</Text>
              </View>

              {/* Orientation Modules */}
              {[
                { id: 'om1', title: 'Academic Policies & Expectations', status: 'completed' as const,  pct: 100 },
                { id: 'om2', title: 'Campus Virtual Tour',              status: 'explore'   as const,  pct: 0   },
                { id: 'om3', title: 'Student Services Guide',           status: 'partial'   as const,  pct: 50  },
                { id: 'om4', title: 'LMS Platform Walkthrough',         status: 'notstarted' as const, pct: 0   },
              ].map(mod => (
                <Pressable key={mod.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 10, padding: 16 })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 8 }}>{mod.title}</Text>
                      {mod.status === 'completed' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#5A8A6E', alignItems: 'center', justifyContent: 'center' }}>
                            <IconSymbol name="checkmark" size={10} color="#fff" />
                          </View>
                          <Text style={{ fontSize: 12, color: '#5A8A6E', fontWeight: '600' }}>Completed</Text>
                        </View>
                      )}
                      {mod.status === 'explore' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <IconSymbol name="play.fill" size={12} color={C.secondary} />
                          <Text style={{ fontSize: 12, color: C.secondary }}>Tap to explore</Text>
                        </View>
                      )}
                      {mod.status === 'partial' && (
                        <View>
                          <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 4 }}>
                            <View style={{ width: '50%', height: 4, backgroundColor: C.label, borderRadius: 2 }} />
                          </View>
                          <Text style={{ fontSize: 12, color: C.secondary }}>50% complete</Text>
                        </View>
                      )}
                      {mod.status === 'notstarted' && (
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: C.surfacePressed, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 11, color: C.secondary }}>Not started</Text>
                        </View>
                      )}
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── STUDY TOOLS TAB ── */}
          {eduStudentTab === 'Study Tools' && (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 8 }}>STUDY TOOLS</Text>
              {EDU_TOOLS.map(tool => (
                <Pressable
                  key={tool.id}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginBottom: 8, padding: 14 })}
                >
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: C.label + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={tool.icon as any} size={20} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{tool.label}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{tool.subtitle}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                </Pressable>
              ))}

              <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 8 }}>ACADEMIC SKILLS</Text>
              {EDU_ACADEMIC_SKILLS.map(skill => (
                <Pressable
                  key={skill.id}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginBottom: 8, padding: 14 })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 6 }}>{skill.label}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: C.surfacePressed, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: C.secondary }}>{skill.type}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: C.muted, alignSelf: 'center' }}>{skill.duration}</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                </Pressable>
              ))}
            </View>
          )}

          {/* ── CAREER TAB ── */}
          {eduStudentTab === 'Career' && (
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>CAREER READINESS</Text>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginBottom: 8, padding: 14 })}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>Business Career Simulator</Text>
                <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 18, marginBottom: 10 }}>Practice interviews, case presentations, and salary negotiations with AI-powered feedback.</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.label + '15', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>Simulation</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.label + '15', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>Not Started</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 12, marginBottom: 8, padding: 14 })}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>Resume Builder</Text>
                <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 18, marginBottom: 10 }}>Build a professional resume tailored to your Lincoln University MBA program and target industry.</Text>
                <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 4 }}>
                  <View style={{ width: '30%', height: 4, backgroundColor: C.label, borderRadius: 2 }} />
                </View>
                <Text style={{ fontSize: 12, color: C.secondary }}>30% complete</Text>
              </Pressable>
            </View>
          )}

        </ScrollView>
      </View>
    );
  }

  // ── Community Pastor: Ministry Tools early return ───────────────────────────
  if (mode === 'community' && isAdmin) {
    return (
      <CommunityPastorMinistryToolsView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Community Member: Learn & Grow early return ──────────────────────────────
  if (mode === 'community' && !isAdmin) {
    return (
      <CommunityMemberLearnView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Personal Owner: Studio (Courses / Games / Analytics) ───────────────────
  if (mode === 'personal' && isAdmin) {
    return (
      <PersonalOwnerStudioView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Personal Subscriber early return ────────────────────────────────────────
  if (mode === 'personal' && !isAdmin) {
    return (
      <PersonalSubscriberView
        C={C}
        insets={insets}
        cycleRole={cycleRole}
        role={role}
      />
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]} {...swipePanResponder.panHandlers}>

      {/* ── Home View ── */}
      {activeTab === 'Home' && (
        <FlatList
          data={filteredFeed}
          keyExtractor={item => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop + 8, paddingBottom: 120 }}
          ListHeaderComponent={
            isAdmin ? (
              <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: accent + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: accent + '30' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <IconSymbol name="plus.rectangle.fill.on.rectangle.fill" size={16} color={accent} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: accent }}>{KAYSTUDIOS_ADMIN_TOOLS[mode]?.header ?? 'Creator Tools'}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                  {(KAYSTUDIOS_ADMIN_TOOLS[mode]?.tools ?? []).map(tool => (
                    <Pressable
                      key={tool}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: accent }}>{tool}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>
                  {mode === 'sports' ? 'Your Learning & Development' :
                   mode === 'education' ? 'Courses & Study Tools' :
                   mode === 'community' ? 'Grow & Engage' :
                   mode === 'business' ? 'Onboarding & Certifications' : 'Discover Experiences'}
                </Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>
                  {mode === 'sports' ? 'Required IQ courses, life skills & fan games' :
                   mode === 'education' ? 'Take courses, study games & career simulators' :
                   mode === 'community' ? 'New member courses, volunteer training & trivia' :
                   mode === 'business' ? 'Product demos, ROI calculators & onboarding flows' : 'Interactive experiences built for you'}
                </Text>
              </View>
            )
          }
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: C.separator }]} />}
          renderItem={({ item }) => (
            <ContentCard
              item={item}
              C={C}
              onPress={() => launchExperience(item)}
              progress={allProgress[item.id]}
            />
          )}
          ListEmptyComponent={
            <View style={[styles.empty, { marginTop: 80 }]}>
              <Text style={styles.emptyIcon}>🎮</Text>
              <Text style={[styles.emptyText, { color: C.secondary }]}>No experiences in this category</Text>
            </View>
          }
        />
      )}

      {/* ── Explore View ── */}
      {activeTab === 'Explore' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop + 8, paddingBottom: 120 }}
        >
          {filteredExploreRows.map(row => (
            <ExploreRow
              key={row.label}
              label={row.label}
              items={row.items}
              C={C}
              onPressItem={navigateToDetail}
            />
          ))}
          {filteredExploreRows.length === 0 && (
            <View style={[styles.empty, { marginTop: 80 }]}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyText, { color: C.secondary }]}>Nothing in this category</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Library View ── */}
      {activeTab === 'Library' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop + 8, paddingBottom: 120 }}
        >
          <LibSection title="In Progress" items={inProgressItems} C={C} onPressItem={launchExperience} progress={allProgress} limit={3} />
          <LibSection title="Completed" items={completedItems} C={C} onPressItem={navigateToDetail} progress={allProgress} limit={3} />
          <LibSection title="Saved" items={savedItems} C={C} onPressItem={navigateToDetail} progress={allProgress} limit={3} />
          <LibSection title="My Courses" items={myCourses} C={C} onPressItem={launchExperience} progress={allProgress} />
          <LibSection title="Recommended For You" items={recommendedItems} C={C} onPressItem={navigateToDetail} progress={allProgress} limit={4} />
          {(inProgressItems.length > 0 || completedItems.length > 0) && (
            <AchievementsSection completedItems={completedItems} C={C} />
          )}
          {!inProgressItems.length && !completedItems.length && !savedItems.length && !myCourses.length && (
            <View style={[styles.empty, { marginTop: 100 }]}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={[styles.emptyTitle, { color: C.secondary }]}>Your library is empty</Text>
              <Text style={[styles.emptySubtitle, { color: C.muted }]}>
                Start an experience to track your progress here
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Fixed Top Bar ── */}
      <View style={[styles.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.topBarSide}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
          >
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={styles.dropdownPillWrap}>
            <Pressable
              style={[styles.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdownOpen(v => !v); }}
            >
              <Text style={[styles.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>
          <View style={[styles.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 8, width: 'auto' as any }]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor={accent}
              isPrimary={isAdmin}
            />
            <Pressable onPress={toggleFilterPills} hitSlop={12}>
              <IconSymbol
                name={filterPillsVisible || selectedPill !== 'All'
                  ? 'line.3.horizontal.decrease.circle.fill'
                  : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={filterPillsVisible || selectedPill !== 'All' ? C.accent : C.label}
              />
            </Pressable>
          </View>
        </View>

        <Animated.View style={{
          height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
          opacity: pillsRevealAnim,
          overflow: 'hidden',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContent}
            style={[styles.pillsRow, { borderTopColor: C.separator }]}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[styles.pill, active ? { backgroundColor: C.activePill } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[styles.pillText, { color: active ? C.activePillText : C.secondary }, active && { fontWeight: '600' }]}>
                    {pill}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Dropdown ── */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[styles.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(['Home', 'Explore', 'Library'] as KSTab[]).map(tab => (
              <Pressable key={tab} style={styles.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[
                  styles.dropdownOptionText,
                  { color: tab === activeTab ? C.label : C.secondary },
                  tab === activeTab && { fontWeight: '600' },
                ]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Search FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.accent }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(tabs)/(main)/kaystudios/search' as any);
        }}
      >
        <IconSymbol name="magnifyingglass" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 48, justifyContent: 'center' },
  wordmark: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption: { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionText: { fontSize: 15 },

  pillsRow: { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13 },

  // Content card
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 14,
  },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  cardThumb: {
    width: THUMB_W, height: CARD_H, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0, position: 'relative',
  },
  cardEmoji: { fontSize: 32 },
  cardProgressBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  cardProgressFill: { height: 3, borderRadius: 1.5 },
  cardCompletedBadge: {
    position: 'absolute', top: 6, right: 6, width: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  cardBrand: { fontSize: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  cardParticipants: { fontSize: 11 },
  cardRating: { fontSize: 11 },
  cardScore: { fontSize: 11, fontWeight: '600' },

  // Explore card
  exploreCard: { width: 140 },
  exploreThumb: { width: 140, height: 100, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  exploreEmoji: { fontSize: 36 },
  exploreTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 6 },

  exploreRowWrap: { marginBottom: 24 },
  rowLabel: { fontSize: 16, fontWeight: '700', paddingLeft: 16, paddingBottom: 10 },

  libSection: { marginBottom: 24 },
  libSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  seeAll: { fontSize: 13, fontWeight: '600' },

  achieveStats: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  achieveStat: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 2 },
  achieveStatNum: { fontSize: 22, fontWeight: '800' },
  achieveStatLbl: { fontSize: 11 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeEmoji: { fontSize: 15 },
  badgeLabel: { fontSize: 12, fontWeight: '600' },

  fab: {
    position: 'absolute', right: 24, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
  },

  empty: { alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 15 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 19 },
});
