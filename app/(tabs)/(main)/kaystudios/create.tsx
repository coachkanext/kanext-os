/**
 * Create — Choose a content type and kick off creation with optional Dipson assist.
 * Owner-only creation flow for KayStudios.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Content type definitions ───────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    type: 'Course',
    icon: 'book.fill',
    title: 'Course',
    desc: 'Multi-lesson structured learning with video, text, quizzes & certificates.',
  },
  {
    type: 'Quiz',
    icon: 'list.clipboard.fill',
    title: 'Quiz',
    desc: 'Standalone assessment with multiple choice, true/false, matching & more.',
  },
  {
    type: 'Challenge',
    icon: 'flag.fill',
    title: 'Challenge',
    desc: 'Time-bound activity with daily check-ins, participation tracking & milestones.',
  },
  {
    type: 'Poll',
    icon: 'chart.bar.fill',
    title: 'Poll',
    desc: 'Quick audience feedback with real-time results and analytics.',
  },
] as const;

type ContentType = typeof CONTENT_TYPES[number]['type'];

const DIPSON_PROMPTS = [
  '"Outline a 12-lesson course on brand partnerships"',
  '"Generate 20 trivia questions about basketball"',
  '"Create a 30-day challenge for content creators"',
];

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CreatePage() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + 52;

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [selectedType, setSelectedType] = useState<ContentType | null>(null);

  const styles = useMemo(() => makeStyles(C), [C]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg }]}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          style={styles.topBarLeft}
        >
          <KMenuButton />
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.topBarTitle, { color: C.label }]}>Create</Text>
        </View>

        <View style={styles.topBarRight}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
        </View>
      </View>

      {/* ── Scroll Content ──────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section title */}
        <Text style={[styles.sectionTitle, { color: C.label }]}>
          What do you want to create?
        </Text>

        {/* Type selector cards */}
        {CONTENT_TYPES.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <Pressable
              key={item.type}
              onPress={() => {
                setSelectedType(isSelected ? null : item.type);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.typeCard,
                {
                  borderColor: isSelected ? C.label : C.separator,
                  borderWidth: isSelected ? 2 : 1,
                  backgroundColor: C.bg,
                },
              ]}
            >
              {/* Icon circle */}
              <View style={[styles.iconCircle, { backgroundColor: C.surface }]}>
                <IconSymbol
                  name={item.icon as any}
                  size={26}
                  color={isSelected ? C.label : C.secondary}
                />
              </View>

              {/* Text column */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeCardTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[styles.typeCardDesc, { color: C.secondary }]}>{item.desc}</Text>
              </View>

              {/* Chevron */}
              <IconSymbol name="chevron.right" size={16} color={C.secondary} />
            </Pressable>
          );
        })}

        {/* Dipson Assist Card */}
        <View
          style={[
            styles.dipsonCard,
            { borderColor: C.separator, backgroundColor: C.bg },
          ]}
        >
          <View style={styles.dipsonHeader}>
            <IconSymbol name="sparkles" size={24} color={C.secondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.dipsonTitle, { color: C.label }]}>Dipson can help</Text>
              <Text style={[styles.dipsonSubtitle, { color: C.secondary }]}>
                Generate course outlines, quiz questions, challenge prompts & poll options.
              </Text>
            </View>
          </View>

          {/* Example prompt pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptPillsRow}
            style={{ marginTop: 10 }}
          >
            {DIPSON_PROMPTS.map((prompt, idx) => (
              <Pressable
                key={idx}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[styles.promptPill, { backgroundColor: C.surface, borderColor: C.separator }]}
              >
                <Text style={[styles.promptPillText, { color: C.secondary }]}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Get Started button */}
        {selectedType !== null ? (
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={[styles.startButton, { backgroundColor: C.label }]}
          >
            <Text style={[styles.startButtonText, { color: C.bg }]}>
              Start {selectedType}
            </Text>
          </Pressable>
        ) : (
          <View style={[styles.startButton, { backgroundColor: C.separator }]}>
            <Text style={[styles.startButtonText, { color: C.secondary }]}>
              Start
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    // Top bar
    topBar: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    topBarLeft: {
      width: 40,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    topBarTitle: {
      fontSize: 17,
      fontWeight: '700',
    },

    // Section title
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 16,
    },

    // Type selector cards
    typeCard: {
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 12,
      flexDirection: 'row',
      gap: 16,
      alignItems: 'flex-start',
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeCardTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    typeCardDesc: {
      fontSize: 13,
      marginTop: 4,
      lineHeight: 18,
    },

    // Dipson assist card
    dipsonCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    dipsonHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    dipsonTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    dipsonSubtitle: {
      fontSize: 12,
      marginTop: 2,
      lineHeight: 17,
    },
    promptPillsRow: {
      gap: 8,
      paddingRight: 4,
    },
    promptPill: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    promptPillText: {
      fontSize: 11,
    },

    // Get Started button
    startButton: {
      borderRadius: 14,
      paddingVertical: 14,
      marginHorizontal: 16,
      marginTop: 8,
      alignItems: 'center',
    },
    startButtonText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
