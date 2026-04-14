/**
 * KPlay — Personal Mode channel page.
 * Channel: Games | Courses | Quizzes | Collections tabs.
 * Owner:    upload/create, three-dot manage, analytics.
 * Follower: browse, play, purchase, track progress.
 * Community mode: redirects to community-courses.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, useWindowDimensions, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, Redirect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import {
  KPGAMES, KPCOURSES, KPQUIZZES, KPCOLLECTIONS, KPREVIEWS,
  type KPGame, type KPCourse, type KPQuiz, type KPCollection,
} from '@/data/mock-personal-kplay';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const CAUTION   = '#B8943E';
const GAIN      = '#5A8A6E';

type KPTab  = 'Games' | 'Courses' | 'Quizzes' | 'Collections';
type KPItem = KPGame | KPCourse | KPQuiz;

const KPTABS: KPTab[] = ['Games', 'Courses', 'Quizzes', 'Collections'];

// ── Type badge colors ─────────────────────────────────────────────────────────

// Type badge colors — design system only (no arbitrary hues)
const TYPE_COLORS: Record<string, string> = {
  Game:        '#1A1714', // carbon — filled in light
  Simulation:  GAIN,
  Challenge:   CAUTION,
  Course:      '#9C9790', // drift
  Quiz:        '#B85C5C', // heat
  Flashcards:  GAIN,
};

// ── Star rating helper ────────────────────────────────────────────────────────

function StarRow({ rating, count, C }: { rating: number; count: number; C: ComponentColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? CAUTION : C.separator }}>★</Text>
      ))}
      <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 2 }}>{rating.toFixed(1)} ({count})</Text>
    </View>
  );
}

// ── Access badge ──────────────────────────────────────────────────────────────

function AccessBadge({ access, price, C }: { access: string; price?: number; C: ComponentColors }) {
  if (access === 'Free') {
    return <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>Free</Text>;
  }
  if (access === 'Subscribers Only') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconSymbol name="lock.fill" size={12} color={CAUTION} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: CAUTION }}>Subscribers Only</Text>
      </View>
    );
  }
  return <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>${price?.toFixed(2)}</Text>;
}

// ── PersonalKPlayView ─────────────────────────────────────────────────────────

function PersonalKPlayView({
  C, insets, role, cycleRole, isOwner,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  isOwner: boolean;
}) {
  const { width } = useWindowDimensions();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const [activeTab, setActiveTab]         = useState<KPTab>('Games');
  const [selectedItem, setSelectedItem]   = useState<KPItem | null>(null);
  const [subscribed, setSubscribed]       = useState(false);
  const [enrolledIds, setEnrolledIds]     = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizActive, setQuizActive]       = useState(false);
  const [quizStep, setQuizStep]           = useState(0);
  const [quizAnswers, setQuizAnswers]     = useState<Record<number, number>>({});
  const [quizDone, setQuizDone]           = useState(false);
  const [descExpanded, setDescExpanded]   = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [createTitle, setCreateTitle]     = useState('');
  const [createType, setCreateType]       = useState('Game');

  // ── Quiz flow ────────────────────────────────────────────────────────────────
  if (quizActive && selectedItem && 'questions' in selectedItem) {
    const quiz = selectedItem as KPQuiz;
    if (quizDone) {
      const correct = quiz.questions.filter((q, i) => quizAnswers[i] === q.correct).length;
      const pct = Math.round((correct / quiz.questions.length) * 100);
      return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => { setQuizActive(false); setQuizDone(false); setQuizStep(0); setQuizAnswers({}); }} style={{ marginRight: 12 }}>
              <IconSymbol name="xmark" size={20} color={C.label} />
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Results</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 80, alignItems: 'center' }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: pct >= 70 ? GAIN : CAUTION, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff' }}>{pct}%</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginBottom: 8, textAlign: 'center' }}>
              {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Work!' : 'Keep Practicing'}
            </Text>
            <Text style={{ fontSize: 16, color: C.secondary, marginBottom: 24, textAlign: 'center' }}>
              {correct} of {quiz.questions.length} correct · Avg score: {quiz.avgScore}%
            </Text>
            {quiz.questions.map((q, i) => (
              <View key={i} style={{ width: '100%', backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>Q{i + 1}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 8 }}>{q.q}</Text>
                <Text style={{ fontSize: 13, color: quizAnswers[i] === q.correct ? GAIN : '#B85C5C' }}>
                  {quizAnswers[i] === q.correct ? '✓ ' : '✗ '}{q.choices[quizAnswers[i] ?? 0]}
                </Text>
                {quizAnswers[i] !== q.correct && (
                  <Text style={{ fontSize: 12, color: GAIN, marginTop: 4 }}>Correct: {q.choices[q.correct]}</Text>
                )}
              </View>
            ))}
            <Pressable
              onPress={() => { setQuizStep(0); setQuizAnswers({}); setQuizDone(false); }}
              style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Retry Quiz</Text>
            </Pressable>
          </ScrollView>
        </View>
      );
    }

    const q = quiz.questions[quizStep];
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Quiz top bar */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => { setQuizActive(false); setQuizStep(0); setQuizAnswers({}); }}>
            <IconSymbol name="xmark" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
            <View style={{ width: `${((quizStep + 1) / quiz.questions.length) * 100}%`, height: 4, backgroundColor: C.label, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 13, color: C.secondary }}>{quizStep + 1}/{quiz.questions.length}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, lineHeight: 28, marginBottom: 24 }}>{q.q}</Text>
          {q.choices.map((choice, ci) => (
            <Pressable
              key={ci}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setQuizAnswers(prev => ({ ...prev, [quizStep]: ci }));
              }}
              style={{
                backgroundColor: quizAnswers[quizStep] === ci ? C.label : C.surface,
                borderRadius: 12, padding: 16, marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 15, color: quizAnswers[quizStep] === ci ? C.bg : C.label }}>
                {String.fromCharCode(65 + ci)}. {choice}
              </Text>
            </Pressable>
          ))}
          {quizAnswers[quizStep] !== undefined && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (quizStep < quiz.questions.length - 1) {
                  setQuizStep(p => p + 1);
                } else {
                  setQuizDone(true);
                }
              }}
              style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>
                {quizStep < quiz.questions.length - 1 ? 'Next' : 'Submit'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Content detail view ──────────────────────────────────────────────────────
  if (selectedItem) {
    const isGame   = 'features' in selectedItem;
    const isCourse = 'modules' in selectedItem;
    const isQuiz   = 'questions' in selectedItem;
    const game     = isGame   ? selectedItem as KPGame   : null;
    const course   = isCourse ? selectedItem as KPCourse : null;
    const quiz     = isQuiz   ? selectedItem as KPQuiz   : null;
    const isEnrolled = isCourse && enrolledIds.has(selectedItem.id);

    const reviews = KPREVIEWS.filter(r => r.contentId === selectedItem.id);
    const access  = (selectedItem as any).access as string;
    const price   = (selectedItem as any).price as number | undefined;
    const hue     = (selectedItem as any).hue as number;

    // Course player: module/lesson list
    if (isCourse && isEnrolled && course) {
      const totalLessons = course.modules.flatMap(m => m.lessons).length;
      const doneCount    = course.modules.flatMap(m => m.lessons).filter(l => completedLessons.has(l.id)).length;
      const progress     = totalLessons > 0 ? doneCount / totalLessons : 0;
      return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => { setSelectedItem(null); setDescExpanded(false); }}>
                <IconSymbol name="chevron.left" size={20} color={C.label} />
              </Pressable>
              <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: C.label }} numberOfLines={1}>{course.title}</Text>
            </View>
            <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
              <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: GAIN, borderRadius: 2 }} />
            </View>
            <Text style={{ fontSize: 12, color: C.secondary }}>{doneCount} of {totalLessons} lessons complete</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
            {course.modules.map(mod => (
              <View key={mod.id}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, paddingVertical: 10 }}>
                  {mod.title}
                </Text>
                {mod.lessons.map(lesson => {
                  const done = completedLessons.has(lesson.id);
                  return (
                    <Pressable
                      key={lesson.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCompletedLessons(prev => {
                          const next = new Set(prev);
                          next.add(lesson.id);
                          return next;
                        });
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, gap: 12 }}
                    >
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: done ? GAIN : C.surface, alignItems: 'center', justifyContent: 'center' }}>
                        <IconSymbol name={done ? 'checkmark' : lesson.type === 'video' ? 'play.fill' : lesson.type === 'quiz' ? 'questionmark' : 'doc.text'} size={13} color={done ? '#fff' : C.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: done ? C.secondary : C.label, textDecorationLine: done ? 'line-through' : 'none' }}>{lesson.title}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{lesson.duration}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
            {progress >= 1 && (
              <View style={{ margin: 20, backgroundColor: C.surface, borderRadius: 16, padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🎓</Text>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.label, marginBottom: 4 }}>Course Complete!</Text>
                <Text style={{ fontSize: 14, color: C.secondary }}>Certificate earned</Text>
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Cover */}
        <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginTop: insets.top }}>
          <Text style={{ fontSize: 56 }}>
            {isGame ? (game!.type === 'Game' ? '🎮' : game!.type === 'Simulation' ? '🧪' : '🏆') : isCourse ? '📚' : '🧠'}
          </Text>
          {isGame && (
            <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: TYPE_COLORS[game!.type] ?? C.label, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{game!.type}</Text>
            </View>
          )}
          <Pressable
            onPress={() => { setSelectedItem(null); setDescExpanded(false); }}
            style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="xmark" size={14} color="#fff" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginBottom: 8 }}>{selectedItem.title}</Text>

            {/* Creator row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>SK</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>1,247 players</Text>
              </View>
              {!isOwner && (
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSubscribed(p => !p); }}
                  style={{ backgroundColor: subscribed ? C.surface : C.label, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: subscribed ? C.label : C.bg }}>{subscribed ? 'Subscribed' : 'Subscribe'}</Text>
                </Pressable>
              )}
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {'plays' in selectedItem && <Text style={{ fontSize: 13, color: C.secondary }}>{(selectedItem as any).plays?.toLocaleString()} plays</Text>}
              {'enrolled' in selectedItem && <Text style={{ fontSize: 13, color: C.secondary }}>{(selectedItem as any).enrolled?.toLocaleString()} enrolled</Text>}
              {'rating' in selectedItem && (selectedItem as any).rating > 0 && (
                <StarRow rating={(selectedItem as any).rating} count={(selectedItem as any).ratingCount ?? 0} C={C} />
              )}
              {'avgScore' in selectedItem && <Text style={{ fontSize: 13, color: C.secondary }}>avg {(selectedItem as any).avgScore}%</Text>}
            </View>

            {/* Price + CTA */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <AccessBadge access={access} price={price} C={C} />
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (isQuiz && quiz) { setQuizStep(0); setQuizAnswers({}); setQuizDone(false); setQuizActive(true); return; }
                  if (isCourse) { setEnrolledIds(prev => new Set([...prev, selectedItem.id])); return; }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{ flex: 1, backgroundColor: C.label, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>
                  {isOwner ? 'Preview' : access === 'Free' ? 'Play Free' : access === 'Subscribers Only' ? 'Subscribe to Play' : isCourse ? 'Enroll' : isQuiz ? 'Start Quiz' : 'Buy & Play'}
                </Text>
              </Pressable>
            </View>

            {/* Description */}
            <Pressable onPress={() => setDescExpanded(p => !p)} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }} numberOfLines={descExpanded ? undefined : 3}>
                {(selectedItem as any).description}
              </Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginTop: 4, fontWeight: '600' }}>
                {descExpanded ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>

            {/* What's included */}
            {isGame && game && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 10 }}>Features</Text>
                {game.features.map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <Text style={{ color: GAIN, fontSize: 14, marginTop: 1 }}>✓</Text>
                    <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{f}</Text>
                  </View>
                ))}
              </View>
            )}

            {isCourse && course && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 10 }}>Modules</Text>
                {course.modules.map((mod, mi) => (
                  <View key={mod.id} style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 6 }}>{mi + 1}. {mod.title}</Text>
                    {mod.lessons.map(l => (
                      <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, marginBottom: 5 }}>
                        <IconSymbol name={l.type === 'video' ? 'play.circle' : l.type === 'quiz' ? 'questionmark.circle' : 'doc.text'} size={13} color={C.secondary} />
                        <Text style={{ fontSize: 13, color: C.secondary, flex: 1 }}>{l.title}</Text>
                        <Text style={{ fontSize: 11, color: C.secondary }}>{l.duration}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {isQuiz && quiz && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 10 }}>About this Quiz</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{quiz.questionCount}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>Questions</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: CAUTION }}>{quiz.avgScore}%</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>Avg Score</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{quiz.plays >= 1000 ? `${(quiz.plays / 1000).toFixed(1)}K` : quiz.plays}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>Plays</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Reviews</Text>
                {reviews.map(r => (
                  <View key={r.id} style={{ flexDirection: 'row', marginBottom: 14 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>{r.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{r.author}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{r.date}</Text>
                        <Text style={{ fontSize: 12, color: CAUTION }}>{'★'.repeat(r.rating)}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }}>{r.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Tab content helpers ────────────────────────────────────────────────────

  const GamesTab = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {KPGAMES.map(g => (
        <Pressable
          key={g.id}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedItem(g); setDescExpanded(false); }}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 18 })}
        >
          <View style={{ aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
            <Text style={{ fontSize: 42 }}>{g.type === 'Game' ? '🎮' : g.type === 'Simulation' ? '🧪' : '🏆'}</Text>
            <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: TYPE_COLORS[g.type] ?? '#444', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{g.type}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 2 }} numberOfLines={2}>{g.title}</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>{g.subtitle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: C.secondary }}>{g.plays.toLocaleString()} plays · {'★'.repeat(Math.round(g.rating))} {g.rating}</Text>
            <AccessBadge access={g.access} price={g.price} C={C} />
          </View>
        </Pressable>
      ))}
    </View>
  );

  const CoursesTab = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {KPCOURSES.map(c => {
        const isEnrolled = enrolledIds.has(c.id);
        const totalLessons = c.modules.flatMap(m => m.lessons).length;
        const doneCount    = c.modules.flatMap(m => m.lessons).filter(l => completedLessons.has(l.id)).length;
        const progress     = isEnrolled ? doneCount / totalLessons : 0;
        return (
          <Pressable
            key={c.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedItem(c); setDescExpanded(false); }}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 18 })}
          >
            <View style={{ aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
              <Text style={{ fontSize: 42 }}>📚</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 2 }} numberOfLines={2}>{c.title}</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>{c.subtitle}</Text>
            {isEnrolled && (
              <View style={{ marginBottom: 8 }}>
                <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginBottom: 3 }}>
                  <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: GAIN, borderRadius: 2 }} />
                </View>
                <Text style={{ fontSize: 11, color: C.secondary }}>{Math.round(progress * 100)}% complete</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>{c.enrolled.toLocaleString()} enrolled · {'★'.repeat(Math.round(c.rating))} {c.rating}</Text>
              <AccessBadge access={c.access} price={c.price} C={C} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const QuizzesTab = () => {
    const colW = (width - 48) / 2;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 16, gap: 16 }}>
        {KPQUIZZES.map(q => (
          <Pressable
            key={q.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedItem(q); setDescExpanded(false); }}
            style={({ pressed }) => ({ width: colW, opacity: pressed ? 0.85 : 1 })}
          >
            <View style={{ width: colW, height: colW, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 36 }}>🧠</Text>
              {q.access === 'Subscribers Only' && (
                <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 4 }}>
                  <IconSymbol name="lock.fill" size={12} color={CAUTION} />
                </View>
              )}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 3 }} numberOfLines={2}>{q.title}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{q.questionCount} questions</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{q.plays.toLocaleString()} plays · avg {q.avgScore}%</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const CollectionsTab = () => (
    <View style={{ paddingTop: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        {KPCOLLECTIONS.map(col => (
          <Pressable key={col.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 160 }}>
            <View style={{ width: 160, height: 100, marginBottom: 8 }}>
              {col.hues.map((h, i) => (
                <View
                  key={i}
                  style={{
                    position: i === 0 ? 'relative' : 'absolute',
                    left: i * 4, top: i * 4,
                    width: 152 - i * 8, height: 92 - i * 8,
                    borderRadius: 8,
                    backgroundColor: i === 0 ? C.separator : C.surface,
                    zIndex: 4 - i,
                  }}
                />
              ))}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 2 }} numberOfLines={1}>{col.title}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{col.itemSummary}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // ── Channel page ──────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Animated top bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, opacity }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          <View style={{ flex: 1 }}>
            {isOwner ? (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
                <KMenuButton />
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>KPlay</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* Scrollable content */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Channel header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.secondary }}>SK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.label, marginBottom: 1 }}>Sammy Kalejaiye</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>@sammyk</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>1,247 players · {KPGAMES.length + KPCOURSES.length + KPQUIZZES.length} items</Text>
            </View>
          </View>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!isOwner) setSubscribed(p => !p); }}
            style={{ alignSelf: 'flex-start', borderWidth: 1.5, borderColor: C.label, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 5 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>
              {isOwner ? 'Manage Channel' : subscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </Pressable>
        </View>

        {/* Sticky tab bar */}
        <View style={{ backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {KPTABS.map(tab => (
              <Pressable
                key={tab}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
                style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: activeTab === tab ? C.label : 'transparent' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: activeTab === tab ? C.label : C.secondary }}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tab content */}
        {activeTab === 'Games'       && <GamesTab />}
        {activeTab === 'Courses'     && <CoursesTab />}
        {activeTab === 'Quizzes'     && <QuizzesTab />}
        {activeTab === 'Collections' && <CollectionsTab />}
      </ScrollView>

      {/* Owner FAB */}
      {isOwner && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setCreateVisible(true); }}
          style={{ position: 'absolute', bottom: insets.bottom + 68, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 6 }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

      {/* Create content sheet (Owner only) */}
      <BottomSheet visible={createVisible} onClose={() => setCreateVisible(false)} useModal>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, marginBottom: 16 }}>Create Content</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 8 }}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
            {['Game', 'Course', 'Quiz', 'Challenge', 'Simulation', 'Flashcards'].map(t => (
              <Pressable key={t} onPress={() => { Haptics.selectionAsync(); setCreateType(t); }} style={{ backgroundColor: createType === t ? C.label : C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: createType === t ? C.bg : C.label }}>{t}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Title</Text>
          <TextInput
            value={createTitle}
            onChangeText={setCreateTitle}
            placeholder={`${createType} title`}
            placeholderTextColor={C.secondary}
            style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, marginBottom: 20 }}
          />
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setCreateVisible(false); setCreateTitle(''); }}
            style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Create {createType}</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// ── Screen export ─────────────────────────────────────────────────────────────

export default function KayStudiosScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'personal';

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // Community mode redirects to community-courses
  if (mode === 'community') {
    return <Redirect href="/(tabs)/(main)/kaystudios/community-courses" />;
  }

  return (
    <PersonalKPlayView
      C={C}
      insets={insets}
      role={role}
      cycleRole={cycleRole}
      isOwner={isOwner}
    />
  );
}
