/**
 * KayStudios — Experience Screen
 * Renders the correct interactive experience based on content type.
 * Trivia: 15-second timer, scored.
 * Quiz: no timer, per-question feedback, scored.
 * Course/Training/Devotional: slide-by-slide with progress.
 * Flashcards: flip animation (opacity fade), known/unknown tracking.
 * Simulation: scenario-based decision making, scored.
 * Progress persists to AsyncStorage.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { getContentById, getLaunchLabel, type StudioContent } from '@/data/mock-kaystudios';
import { saveProgress, getProgress } from '@/utils/studios-progress';

// ── Shared ─────────────────────────────────────────────────────────────────

function ExperienceTopBar({ title, C, onBack }: { title: string; C: ComponentColors; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <IconSymbol name="chevron.left" size={18} color={C.label} />
      </Pressable>
      <Text style={[styles.topBarTitle, { color: C.label }]} numberOfLines={1}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

function ProgressBar({ value, C }: { value: number; C: ComponentColors }) {
  return (
    <View style={[styles.progressBg, { backgroundColor: C.surfacePressed }]}>
      <View style={[styles.progressFill, { width: `${Math.min(value, 1) * 100}%`, backgroundColor: C.accent }]} />
    </View>
  );
}

// ── TRIVIA GAME ────────────────────────────────────────────────────────────

function TriviaGame({ content, C, onDone }: { content: StudioContent; C: ComponentColors; onDone: () => void }) {
  const questions = content.questions ?? [];
  const [phase, setPhase] = useState<'idle' | 'playing' | 'reviewing' | 'done'>('idle');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const q = questions[qIndex];

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) handleSelect(-1);
  }, [timeLeft, phase]);

  const handleSelect = useCallback((idx: number) => {
    if (phase !== 'playing') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(idx);
    setPhase('reviewing');
    if (idx === q.a) setScore(s => s + 1);
    setAnswers(prev => [...prev, idx]);
  }, [phase, q]);

  const handleNext = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (qIndex + 1 >= questions.length) {
      const pct = Math.round(((score + (selected === q.a ? 1 : 0)) / questions.length) * 100);
      await saveProgress(content.id, {
        progress: 1,
        completed: true,
        score: pct,
        currentIndex: questions.length,
      });
      setPhase('done');
    } else {
      setQIndex(p => p + 1);
      setSelected(null);
      setTimeLeft(15);
      setPhase('playing');
    }
  }, [qIndex, questions.length, score, selected, q, content.id]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('playing');
    setTimeLeft(15);
  };

  const handleRestart = () => {
    setQIndex(0); setScore(0); setSelected(null);
    setTimeLeft(15); setAnswers([]); setPhase('playing');
  };

  // ── Idle ──
  if (phase === 'idle') {
    return (
      <View style={styles.center}>
        <Text style={[styles.idleEmoji]}>{content.thumbEmoji}</Text>
        <Text style={[styles.idleTitle, { color: C.label }]}>{content.title}</Text>
        <Text style={[styles.idleDesc, { color: C.secondary }]}>{questions.length} questions · 15 seconds each</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label }]} onPress={handleStart}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>▶  Play</Text>
        </Pressable>
      </View>
    );
  }

  // ── Done ──
  if (phase === 'done') {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const gradeColor = pct >= 70 ? C.green : pct >= 50 ? C.accent : C.red;
    return (
      <View style={styles.center}>
        <Text style={[styles.doneGrade, { color: gradeColor }]}>{grade}</Text>
        <Text style={[styles.doneScore, { color: C.label }]}>{finalScore} / {questions.length}</Text>
        <Text style={[styles.donePct, { color: C.secondary }]}>{pct}% correct</Text>
        <View style={styles.doneBtns}>
          <Pressable style={[styles.secondaryBtn, { borderColor: C.separator }]} onPress={handleRestart}>
            <Text style={[styles.secondaryBtnText, { color: C.label }]}>Play Again</Text>
          </Pressable>
          <Pressable style={[styles.launchBtn, { backgroundColor: C.label }]} onPress={onDone}>
            <Text style={[styles.launchBtnText, { color: C.bg }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Playing / Reviewing ──
  const timerColor = timeLeft <= 5 ? C.red : timeLeft <= 10 ? C.accent : C.label;
  return (
    <View style={styles.gameContainer}>
      <ProgressBar value={(qIndex) / questions.length} C={C} />
      <View style={styles.gameHeader}>
        <Text style={[styles.qCounter, { color: C.secondary }]}>{qIndex + 1} / {questions.length}</Text>
        {phase === 'playing' && (
          <View style={[styles.timerBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
        )}
        {phase === 'reviewing' && (
          <View style={[styles.timerBadge, { backgroundColor: selected === q.a ? `${C.green}22` : `${C.red}22` }]}>
            <Text style={[styles.timerText, { color: selected === q.a ? C.green : C.red }]}>
              {selected === q.a ? '✓ Correct' : '✗ Wrong'}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.qText, { color: C.label }]}>{q.q}</Text>

      <View style={styles.opts}>
        {q.opts.map((opt, i) => {
          let bg = C.surface;
          let border = C.separator;
          let textColor = C.label;
          if (phase === 'reviewing') {
            if (i === q.a) { bg = `${C.green}22`; border = C.green; textColor = C.green; }
            else if (i === selected && selected !== q.a) { bg = `${C.red}22`; border = C.red; textColor = C.red; }
          } else if (selected === i) { bg = C.surfacePressed; border = C.label; }
          return (
            <Pressable
              key={i}
              style={[styles.opt, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(i)}
              disabled={phase === 'reviewing'}
            >
              <Text style={[styles.optLabel, { color: textColor }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {phase === 'reviewing' && q.e && (
        <View style={[styles.explanationBox, { backgroundColor: C.surface }]}>
          <Text style={[styles.explanationText, { color: C.secondary }]}>{q.e}</Text>
        </View>
      )}

      {phase === 'reviewing' && (
        <Pressable style={[styles.nextBtn, { backgroundColor: C.label }]} onPress={handleNext}>
          <Text style={[styles.nextBtnText, { color: C.bg }]}>
            {qIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ── QUIZ GAME (no timer, per-Q feedback) ─────────────────────────────────

function QuizGame({ content, C, onDone }: { content: StudioContent; C: ComponentColors; onDone: () => void }) {
  const questions = content.questions ?? [];
  const [phase, setPhase] = useState<'idle' | 'answering' | 'reviewing' | 'done'>('idle');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[qIndex];

  const handleSubmit = useCallback(async () => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitted(true);
    if (selected === q.a) setScore(s => s + 1);
    setPhase('reviewing');
    const idx = qIndex + 1;
    await saveProgress(content.id, {
      progress: idx / questions.length,
      completed: idx >= questions.length,
      currentIndex: idx,
    });
  }, [selected, q, qIndex, questions.length, content.id]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (qIndex + 1 >= questions.length) {
      setPhase('done');
    } else {
      setQIndex(p => p + 1);
      setSelected(null);
      setSubmitted(false);
      setPhase('answering');
    }
  }, [qIndex, questions.length]);

  if (phase === 'idle') {
    return (
      <View style={styles.center}>
        <Text style={styles.idleEmoji}>{content.thumbEmoji}</Text>
        <Text style={[styles.idleTitle, { color: C.label }]}>{content.title}</Text>
        <Text style={[styles.idleDesc, { color: C.secondary }]}>{questions.length} questions · no time limit</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label }]} onPress={() => setPhase('answering')}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>Begin</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'done') {
    const pct = Math.round((score / questions.length) * 100);
    const gradeColor = pct >= 70 ? C.green : pct >= 50 ? C.accent : C.red;
    return (
      <View style={styles.center}>
        <Text style={[styles.doneScore, { color: C.label }]}>{score} / {questions.length}</Text>
        <Text style={[styles.donePct, { color: gradeColor }]}>{pct}% correct</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label, marginTop: 24 }]} onPress={onDone}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <ProgressBar value={qIndex / questions.length} C={C} />
      <Text style={[styles.qCounter, { color: C.secondary, marginTop: 12 }]}>{qIndex + 1} / {questions.length}</Text>
      <Text style={[styles.qText, { color: C.label }]}>{q.q}</Text>
      <View style={styles.opts}>
        {q.opts.map((opt, i) => {
          let bg = C.surface;
          let border = submitted ? (i === q.a ? C.green : i === selected ? C.red : C.separator) : (selected === i ? C.label : C.separator);
          let textColor = submitted ? (i === q.a ? C.green : i === selected ? C.red : C.secondary) : (selected === i ? C.label : C.secondary);
          if (submitted && i === q.a) bg = `${C.green}18`;
          else if (submitted && i === selected && selected !== q.a) bg = `${C.red}18`;
          return (
            <Pressable key={i} style={[styles.opt, { backgroundColor: bg, borderColor: border }]}
              onPress={() => !submitted && setSelected(i)} disabled={submitted}>
              <Text style={[styles.optLabel, { color: textColor }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
      {submitted && q.e && (
        <View style={[styles.explanationBox, { backgroundColor: C.surface }]}>
          <Text style={[styles.explanationText, { color: C.secondary }]}>{q.e}</Text>
        </View>
      )}
      {!submitted ? (
        <Pressable
          style={[styles.nextBtn, { backgroundColor: selected !== null ? C.label : C.surfacePressed }]}
          onPress={handleSubmit}
          disabled={selected === null}
        >
          <Text style={[styles.nextBtnText, { color: selected !== null ? C.bg : C.muted }]}>Submit</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.nextBtn, { backgroundColor: C.label }]} onPress={handleNext}>
          <Text style={[styles.nextBtnText, { color: C.bg }]}>
            {qIndex + 1 >= questions.length ? 'See Results' : 'Next'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ── COURSE VIEWER ─────────────────────────────────────────────────────────

function CourseViewer({ content, C, onDone, initialIndex = 0 }: {
  content: StudioContent; C: ComponentColors; onDone: () => void; initialIndex?: number;
}) {
  const slides = content.slides ?? [];
  const [slideIndex, setSlideIndex] = useState(initialIndex);
  const [completed, setCompleted] = useState(initialIndex >= slides.length);
  const slide = slides[slideIndex];

  const handleNext = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = slideIndex + 1;
    if (next >= slides.length) {
      await saveProgress(content.id, { progress: 1, completed: true, currentIndex: slides.length });
      setCompleted(true);
    } else {
      await saveProgress(content.id, { progress: next / slides.length, completed: false, currentIndex: next });
      setSlideIndex(next);
    }
  }, [slideIndex, slides.length, content.id]);

  const handlePrev = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (slideIndex > 0) setSlideIndex(p => p - 1);
  }, [slideIndex]);

  if (completed) {
    return (
      <View style={styles.center}>
        <Text style={styles.idleEmoji}>🎉</Text>
        <Text style={[styles.idleTitle, { color: C.label }]}>Course Complete!</Text>
        <Text style={[styles.idleDesc, { color: C.secondary }]}>You've finished all {slides.length} sections.</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label, marginTop: 24 }]} onPress={onDone}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>Done</Text>
        </Pressable>
      </View>
    );
  }

  if (!slide) return null;

  return (
    <ScrollView style={styles.courseScroll} contentContainerStyle={styles.courseContent} showsVerticalScrollIndicator={false}>
      <ProgressBar value={(slideIndex + 1) / slides.length} C={C} />
      <Text style={[styles.slideProgress, { color: C.muted }]}>{slideIndex + 1} of {slides.length}</Text>
      <Text style={styles.slideEmoji}>{slide.emoji}</Text>
      <Text style={[styles.slideTitle, { color: C.label }]}>{slide.title}</Text>
      <Text style={[styles.slideBody, { color: C.secondary }]}>{slide.body}</Text>
      {slide.points && (
        <View style={[styles.pointsList, { backgroundColor: C.surface }]}>
          {slide.points.map((pt, i) => (
            <View key={i} style={styles.pointRow}>
              <View style={[styles.pointDot, { backgroundColor: C.accent }]} />
              <Text style={[styles.pointText, { color: C.label }]}>{pt}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.slideNav}>
        <Pressable
          style={[styles.slideNavBtn, slideIndex === 0 && { opacity: 0.3 }, { borderColor: C.separator }]}
          onPress={handlePrev}
          disabled={slideIndex === 0}
        >
          <IconSymbol name="chevron.left" size={16} color={C.label} />
          <Text style={[styles.slideNavText, { color: C.label }]}>Back</Text>
        </Pressable>
        <Pressable style={[styles.launchBtn, { flex: 1, marginLeft: 12 }]} onPress={handleNext}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>
            {slideIndex + 1 >= slides.length ? 'Complete Course ✓' : 'Next →'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ── FLASHCARDS ─────────────────────────────────────────────────────────────

function FlashcardsViewer({ content, C, onDone, initialIndex = 0 }: {
  content: StudioContent; C: ComponentColors; onDone: () => void; initialIndex?: number;
}) {
  const origCards = content.cards ?? [];
  const [deck, setDeck] = useState(origCards.slice(initialIndex));
  const [deckIndex, setDeckIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(origCards.length === 0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const card = deck[deckIndex];

  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setFlipped(v => !v));
  }, [flipped, flipAnim]);

  const advance = useCallback(async (wasKnown: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newKnown = known + (wasKnown ? 1 : 0);
    const nextIndex = deckIndex + 1;
    let newDeck = deck;
    if (!wasKnown) {
      // Add to end of deck to review again
      newDeck = [...deck, card];
      setDeck(newDeck);
    }
    if (nextIndex >= newDeck.length || nextIndex >= origCards.length + 2) {
      await saveProgress(content.id, { progress: 1, completed: true, currentIndex: origCards.length });
      setKnown(newKnown);
      setDone(true);
    } else {
      await saveProgress(content.id, {
        progress: nextIndex / origCards.length,
        completed: false,
        currentIndex: nextIndex,
      });
      setKnown(newKnown);
      flipAnim.setValue(0);
      setFlipped(false);
      setDeckIndex(nextIndex);
    }
  }, [deckIndex, deck, card, known, origCards.length, content.id, flipAnim]);

  if (done) {
    return (
      <View style={styles.center}>
        <Text style={styles.idleEmoji}>⭐</Text>
        <Text style={[styles.idleTitle, { color: C.label }]}>Deck Complete!</Text>
        <Text style={[styles.donePct, { color: C.green }]}>{known} / {origCards.length} known</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label, marginTop: 24 }]} onPress={onDone}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>Done</Text>
        </Pressable>
      </View>
    );
  }

  if (!card) return null;

  return (
    <View style={styles.flashContainer}>
      <ProgressBar value={Math.min(deckIndex / origCards.length, 1)} C={C} />
      <Text style={[styles.flashCounter, { color: C.muted }]}>
        {Math.min(deckIndex + 1, origCards.length)} / {origCards.length}  ·  {known} known
      </Text>

      <Pressable style={[styles.flashCard, { backgroundColor: C.surface }]} onPress={handleFlip} activeOpacity={0.95}>
        <Animated.View style={[styles.flashSide, { opacity: frontOpacity }]}>
          <Text style={[styles.flashSideLabel, { color: C.muted }]}>FRONT — tap to flip</Text>
          <Text style={[styles.flashFrontText, { color: C.label }]}>{card.front}</Text>
        </Animated.View>
        <Animated.View style={[styles.flashSide, { opacity: backOpacity, position: 'absolute' }]}>
          <Text style={[styles.flashSideLabel, { color: C.accent }]}>BACK — answer</Text>
          <Text style={[styles.flashBackText, { color: C.label }]}>{card.back}</Text>
        </Animated.View>
      </Pressable>

      {flipped && (
        <View style={styles.flashBtns}>
          <Pressable
            style={[styles.flashBtn, { backgroundColor: `${C.red}18`, borderColor: C.red }]}
            onPress={() => advance(false)}
          >
            <Text style={[styles.flashBtnText, { color: C.red }]}>↺  Review Again</Text>
          </Pressable>
          <Pressable
            style={[styles.flashBtn, { backgroundColor: `${C.green}18`, borderColor: C.green }]}
            onPress={() => advance(true)}
          >
            <Text style={[styles.flashBtnText, { color: C.green }]}>✓  Got It</Text>
          </Pressable>
        </View>
      )}
      {!flipped && (
        <Pressable style={[styles.launchBtn, { backgroundColor: C.surfacePressed, marginTop: 16 }]} onPress={handleFlip}>
          <Text style={[styles.launchBtnText, { color: C.label }]}>Tap card to reveal</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── SIMULATION ────────────────────────────────────────────────────────────

function SimulationGame({ content, C, onDone }: { content: StudioContent; C: ComponentColors; onDone: () => void }) {
  const scenarios = content.scenarios ?? [];
  const [phase, setPhase] = useState<'idle' | 'deciding' | 'outcome' | 'done'>('idle');
  const [sIndex, setSIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const scenario = scenarios[sIndex];

  const handleSelect = useCallback(async (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(idx);
    setPhase('outcome');
    const isCorrect = idx === scenario.best;
    if (isCorrect) setScore(s => s + 1);
    await saveProgress(content.id, {
      progress: (sIndex + 1) / scenarios.length,
      completed: sIndex + 1 >= scenarios.length,
      currentIndex: sIndex + 1,
    });
  }, [scenario, sIndex, scenarios.length, content.id]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sIndex + 1 >= scenarios.length) {
      setPhase('done');
    } else {
      setSIndex(p => p + 1);
      setSelected(null);
      setPhase('deciding');
    }
  }, [sIndex, scenarios.length]);

  if (phase === 'idle') {
    return (
      <View style={styles.center}>
        <Text style={styles.idleEmoji}>{content.thumbEmoji}</Text>
        <Text style={[styles.idleTitle, { color: C.label }]}>{content.title}</Text>
        <Text style={[styles.idleDesc, { color: C.secondary }]}>{scenarios.length} scenarios · real decisions</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label }]} onPress={() => setPhase('deciding')}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>Start Simulation</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'done') {
    const pct = Math.round((score / scenarios.length) * 100);
    return (
      <View style={styles.center}>
        <Text style={[styles.doneScore, { color: C.label }]}>{score} / {scenarios.length} optimal</Text>
        <Text style={[styles.donePct, { color: pct >= 60 ? C.green : C.accent }]}>{pct}% strong decisions</Text>
        <Pressable style={[styles.launchBtn, { backgroundColor: C.label, marginTop: 24 }]} onPress={onDone}>
          <Text style={[styles.launchBtnText, { color: C.bg }]}>Done</Text>
        </Pressable>
      </View>
    );
  }

  if (!scenario) return null;

  return (
    <ScrollView style={styles.simScroll} contentContainerStyle={styles.simContent} showsVerticalScrollIndicator={false}>
      <ProgressBar value={sIndex / scenarios.length} C={C} />
      <Text style={[styles.qCounter, { color: C.secondary, marginTop: 12 }]}>Scenario {sIndex + 1} of {scenarios.length}</Text>
      <View style={[styles.situationBox, { backgroundColor: C.surface }]}>
        <Text style={[styles.situationText, { color: C.label }]}>{scenario.situation}</Text>
      </View>
      <View style={styles.opts}>
        {scenario.options.map((opt, i) => {
          const revealed = phase === 'outcome';
          let bg = C.surface;
          let border = C.separator;
          let textColor = C.secondary;
          if (revealed) {
            if (i === scenario.best) { bg = `${C.green}18`; border = C.green; textColor = C.green; }
            else if (i === selected && selected !== scenario.best) { bg = `${C.red}18`; border = C.red; textColor = C.red; }
          } else if (selected === i) { border = C.label; textColor = C.label; }
          return (
            <Pressable key={i} style={[styles.opt, { backgroundColor: bg, borderColor: border }]}
              onPress={() => !revealed && handleSelect(i)} disabled={revealed}>
              <Text style={[styles.optLabel, { color: textColor }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
      {phase === 'outcome' && (
        <View style={[styles.explanationBox, { backgroundColor: C.surface }]}>
          <Text style={[styles.explanationLabel, { color: C.accent }]}>
            {selected === scenario.best ? '✓ Optimal decision' : '✗ Better answer exists'}
          </Text>
          <Text style={[styles.explanationText, { color: C.secondary }]}>{scenario.outcome}</Text>
        </View>
      )}
      {phase === 'outcome' && (
        <Pressable style={[styles.nextBtn, { backgroundColor: C.label }]} onPress={handleNext}>
          <Text style={[styles.nextBtnText, { color: C.bg }]}>
            {sIndex + 1 >= scenarios.length ? 'See Results' : 'Next Scenario'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ── GENERIC PLACEHOLDER ────────────────────────────────────────────────────

function GenericExperience({ content, C, onDone }: { content: StudioContent; C: ComponentColors; onDone: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.idleEmoji}>{content.thumbEmoji}</Text>
      <Text style={[styles.idleTitle, { color: C.label }]}>{content.title}</Text>
      <Text style={[styles.idleDesc, { color: C.secondary }]}>Full experience coming soon.</Text>
      <Pressable style={[styles.launchBtn, { backgroundColor: C.label, marginTop: 24 }]} onPress={onDone}>
        <Text style={[styles.launchBtnText, { color: C.bg }]}>Go Back</Text>
      </Pressable>
    </View>
  );
}

// ── ROUTER ────────────────────────────────────────────────────────────────

export default function ExperienceScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  const content = useMemo(() => getContentById(contentId ?? ''), [contentId]);

  // Load saved progress for resume
  useEffect(() => {
    if (!content) return;
    getProgress(content.id).then(p => {
      if (p && !p.completed && p.currentIndex != null) {
        setInitialIndex(p.currentIndex);
      }
      setLoaded(true);
    });
  }, [content]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  if (!content) {
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        <ExperienceTopBar title="Experience" C={C} onBack={handleDone} />
        <View style={styles.center}>
          <Text style={[styles.idleDesc, { color: C.secondary }]}>Content not found.</Text>
        </View>
      </View>
    );
  }

  if (!loaded) return <View style={[styles.screen, { backgroundColor: C.bg }]} />;

  const renderExperience = () => {
    switch (content.type) {
      case 'trivia':
        return <TriviaGame content={content} C={C} onDone={handleDone} />;
      case 'quiz':
        return <QuizGame content={content} C={C} onDone={handleDone} />;
      case 'course':
      case 'training':
      case 'devotional':
        return <CourseViewer content={content} C={C} onDone={handleDone} initialIndex={initialIndex} />;
      case 'flashcards':
        return <FlashcardsViewer content={content} C={C} onDone={handleDone} initialIndex={initialIndex} />;
      case 'simulation':
        return <SimulationGame content={content} C={C} onDone={handleDone} />;
      default:
        return <GenericExperience content={content} C={C} onDone={handleDone} />;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: C.bg, paddingBottom: insets.bottom + 8 }]}>
      <ExperienceTopBar title={content.title} C={C} onBack={handleDone} />
      <View style={styles.experienceBody}>
        {renderExperience()}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center', marginHorizontal: 8 },
  experienceBody: { flex: 1 },

  // Shared
  progressBg: { height: 4, borderRadius: 2, marginHorizontal: 20, marginTop: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  idleEmoji: { fontSize: 64, marginBottom: 16 },
  idleTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  idleDesc: { fontSize: 14, textAlign: 'center', marginBottom: 32 },
  launchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#111111', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28,
  },
  launchBtnText: { fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  doneBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },

  // Trivia / Quiz
  gameContainer: { flex: 1, padding: 20 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 20 },
  qCounter: { fontSize: 13, fontWeight: '600' },
  timerBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  timerText: { fontSize: 13, fontWeight: '700' },
  qText: { fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 24 },
  opts: { gap: 10 },
  opt: {
    borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
  },
  optLabel: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  explanationBox: { borderRadius: 12, padding: 14, marginTop: 16 },
  explanationLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 5 },
  explanationText: { fontSize: 13, lineHeight: 19 },
  nextBtn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
  doneGrade: { fontSize: 80, fontWeight: '900' },
  doneScore: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  donePct: { fontSize: 16, marginTop: 6 },

  // Course
  courseScroll: { flex: 1 },
  courseContent: { padding: 20, paddingBottom: 40 },
  slideProgress: { fontSize: 12, textAlign: 'right', marginTop: 8, marginBottom: 16 },
  slideEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  slideTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
  slideBody: { fontSize: 15, lineHeight: 23, marginBottom: 20 },
  pointsList: { borderRadius: 12, padding: 14, gap: 10, marginBottom: 24 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 6, flexShrink: 0 },
  pointText: { flex: 1, fontSize: 14, lineHeight: 20 },
  slideNav: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  slideNavBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
  },
  slideNavText: { fontSize: 14, fontWeight: '600' },

  // Flashcards
  flashContainer: { flex: 1, padding: 20 },
  flashCounter: { fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  flashCard: {
    borderRadius: 20, padding: 28, minHeight: 200,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 4,
  },
  flashSide: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  flashSideLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
  flashFrontText: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  flashBackText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
  flashBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  flashBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  flashBtnText: { fontSize: 15, fontWeight: '700' },

  // Simulation
  simScroll: { flex: 1 },
  simContent: { padding: 20, paddingBottom: 40 },
  situationBox: { borderRadius: 14, padding: 16, marginTop: 12, marginBottom: 20 },
  situationText: { fontSize: 15, lineHeight: 23, fontWeight: '500' },
});
