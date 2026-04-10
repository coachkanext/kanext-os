/**
 * Weekly Prompt — Owner-only.
 * Create and manage weekly community prompts.
 * Followers see the active prompt on the Connect tab and respond there.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter } from '@/utils/global-footer-hide';
import { useOwnerGuard } from '@/hooks/use-owner-guard';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScheduleMode = 'now' | 'schedule';
type TierVis = 'all' | 'supporters' | 'inner_circle';

interface PastPrompt {
  id: string;
  text: string;
  datePosted: string;
  responseCount: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const ACTIVE_PROMPT_TEXT = "What's one thing you're building right now - and what's the hardest part about it?";
const ACTIVE_PROMPT_RESPONSES = 18;
const ACTIVE_PROMPT_DATE = 'Mar 31';

const PAST_PROMPTS: PastPrompt[] = [
  { id: 'p1', text: 'Share your biggest win from March',                             datePosted: 'Mar 24', responseCount: 24 },
  { id: 'p2', text: "What's one habit that changed your productivity?",              datePosted: 'Mar 17', responseCount: 31 },
  { id: 'p3', text: 'If you could learn one new skill this year, what would it be?', datePosted: 'Mar 10', responseCount: 19 },
];

const DIPSON_SUGGESTIONS = [
  "What's one skill you're working on this month?",
  'Share your biggest win from the past week',
  'If you could collaborate with anyone in this community, who and why?',
  "What's the best piece of advice you've received this year?",
  "What are you most excited about building in the next 90 days?",
];

// ─── Active Prompt Card ───────────────────────────────────────────────────────

function ActivePromptCard({ onEnd }: { onEnd: () => void }) {
  const C = useColors();

  const handleEnd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('End Prompt?', 'The current prompt will be archived and responses locked.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Prompt', style: 'destructive', onPress: onEnd },
    ]);
  };

  return (
    <View style={[ap.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
      <View style={ap.headerRow}>
        <View style={ap.labelRow}>
          <IconSymbol name="mic" size={14} color={C.secondary} />
          <Text style={[ap.sectionLabel, { color: C.secondary }]}>THIS WEEK'S PROMPT</Text>
        </View>
        <Pressable onPress={handleEnd} hitSlop={8}>
          <Text style={[ap.endLink, { color: C.heat }]}>End Prompt</Text>
        </Pressable>
      </View>

      <Text style={[ap.promptText, { color: C.label }]}>{ACTIVE_PROMPT_TEXT}</Text>

      <View style={ap.footerRow}>
        <Text style={[ap.metaText, { color: C.secondary }]}>
          {ACTIVE_PROMPT_RESPONSES} responses · Posted {ACTIVE_PROMPT_DATE}
        </Text>
        <Pressable
          style={[ap.viewBtn, { borderColor: C.label }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[ap.viewBtnText, { color: C.label }]}>View Responses</Text>
        </Pressable>
      </View>
    </View>
  );
}

const ap = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, gap: 10 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel:{ fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  endLink:     { fontSize: 13, fontWeight: '600' },
  promptText:  { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  footerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaText:    { flex: 1, fontSize: 12 },
  viewBtn:     { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  viewBtnText: { fontSize: 13, fontWeight: '600' },
});

// ─── No Active Prompt Card ────────────────────────────────────────────────────

function NoActivePromptCard() {
  const C = useColors();
  return (
    <View style={[na.card, { backgroundColor: C.surface, borderColor: C.separator, marginHorizontal: 16 }]}>
      <Text style={[na.text, { color: C.secondary }]}>No active prompt. Create one below.</Text>
    </View>
  );
}

const na = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  text: { fontSize: 14 },
});

// ─── Create New Prompt ────────────────────────────────────────────────────────

function CreatePromptSection({ fillText }: { fillText: string }) {
  const C = useColors();
  const [text, setText] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');
  const [tierVis, setTierVis] = useState<TierVis>('all');

  // Sync fill text from Dipson suggestions
  React.useEffect(() => {
    if (fillText) setText(fillText);
  }, [fillText]);

  const TIER_OPTIONS: { id: TierVis; label: string }[] = [
    { id: 'all',          label: 'All Members' },
    { id: 'supporters',   label: 'Supporters Only' },
    { id: 'inner_circle', label: 'Inner Circle Only' },
  ];

  const handlePost = () => {
    if (!text.trim()) {
      Alert.alert('Empty Prompt', 'Please enter a prompt before posting.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Prompt Posted!', 'Your community prompt is now live.');
    setText('');
  };

  return (
    <View style={{ gap: 10 }}>
      <Text style={[cr.sectionHeader, { color: C.label, marginHorizontal: 16 }]}>Create New Prompt</Text>

      <View style={[cr.inputCard, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
        <TextInput
          style={[cr.input, { color: C.label }]}
          placeholder="Ask your community something..."
          placeholderTextColor={C.secondary}
          multiline
          value={text}
          onChangeText={setText}
          maxLength={280}
        />
      </View>

      {/* Schedule toggle */}
      <View style={[cr.toggleRow, { marginHorizontal: 16 }]}>
        {(['now', 'schedule'] as ScheduleMode[]).map(mode => {
          const active = scheduleMode === mode;
          const label = mode === 'now' ? 'Post Now' : 'Schedule';
          return (
            <Pressable
              key={mode}
              onPress={() => {
                setScheduleMode(mode);
                if (mode === 'schedule') Alert.alert('Schedule', 'Date/time picker coming soon.');
              }}
              style={[
                cr.togglePill,
                active
                  ? { backgroundColor: C.label }
                  : { borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator },
              ]}
            >
              <Text style={[cr.toggleText, { color: active ? C.bg : C.label }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tier visibility */}
      <View style={[cr.tierRow, { marginHorizontal: 16 }]}>
        {TIER_OPTIONS.map(opt => {
          const active = tierVis === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setTierVis(opt.id)}
              style={[
                cr.tierPill,
                active
                  ? { backgroundColor: C.label }
                  : { borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator },
              ]}
            >
              <Text style={[cr.tierText, { color: active ? C.bg : C.label }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [cr.postBtn, { backgroundColor: C.label, marginHorizontal: 16, opacity: pressed ? 0.8 : 1 }]}
        onPress={handlePost}
      >
        <Text style={[cr.postBtnText, { color: C.bg }]}>Post Prompt</Text>
      </Pressable>
    </View>
  );
}

const cr = StyleSheet.create({
  sectionHeader: { fontSize: 17, fontWeight: '700' },
  inputCard:     { borderRadius: 14, padding: 14 },
  input:         { fontSize: 15, lineHeight: 22, minHeight: 80, textAlignVertical: 'top' },
  toggleRow:     { flexDirection: 'row', gap: 8 },
  togglePill:    { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 7 },
  toggleText:    { fontSize: 13, fontWeight: '600' },
  tierRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierPill:      { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  tierText:      { fontSize: 13, fontWeight: '600' },
  postBtn:       { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  postBtnText:   { fontSize: 15, fontWeight: '700' },
});

// ─── Dipson Suggestions ───────────────────────────────────────────────────────

function DipsonSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
  const C = useColors();
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(e => !e);
  };

  return (
    <View style={[ds.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
      <Pressable style={ds.header} onPress={toggle}>
        <View style={ds.titleRow}>
          <IconSymbol name="sparkles" size={16} color={C.label} />
          <Text style={[ds.title, { color: C.label }]}>Dipson Suggestions</Text>
        </View>
        <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
      </Pressable>

      {expanded && (
        <View style={ds.list}>
          {DIPSON_SUGGESTIONS.map((suggestion, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                ds.suggestion,
                i < DIPSON_SUGGESTIONS.length - 1 && [ds.suggestionBorder, { borderBottomColor: C.separator }],
                pressed && { backgroundColor: C.bg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(suggestion);
              }}
            >
              <Text style={[ds.suggestionText, { color: C.label }]}>{suggestion}</Text>
              <IconSymbol name="arrow.up.left" size={13} color={C.secondary} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const ds = StyleSheet.create({
  card:             { borderRadius: 14, overflow: 'hidden' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  titleRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:            { fontSize: 15, fontWeight: '600' },
  list:             { paddingBottom: 4 },
  suggestion:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  suggestionBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  suggestionText:   { flex: 1, fontSize: 14, lineHeight: 20 },
});

// ─── Past Prompts ─────────────────────────────────────────────────────────────

function PastPromptsSection() {
  const C = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text style={[pp.sectionHeader, { color: C.label, marginHorizontal: 16 }]}>Past Prompts</Text>
      <View style={[pp.list, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
        {PAST_PROMPTS.map((p, i) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [
              pp.row,
              i < PAST_PROMPTS.length - 1 && [pp.rowBorder, { borderBottomColor: C.separator }],
              pressed && { backgroundColor: C.bg },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={pp.rowMain}>
              <Text style={[pp.promptText, { color: C.label }]} numberOfLines={1}>{p.text}</Text>
              <Text style={[pp.meta, { color: C.secondary }]}>
                Posted {p.datePosted} · {p.responseCount} responses
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const pp = StyleSheet.create({
  sectionHeader: { fontSize: 17, fontWeight: '700' },
  list:          { borderRadius: 14, overflow: 'hidden' },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  rowBorder:     { borderBottomWidth: StyleSheet.hairlineWidth },
  rowMain:       { flex: 1, gap: 2 },
  promptText:    { fontSize: 14, fontWeight: '600' },
  meta:          { fontSize: 12 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WeeklyPromptScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:network');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/network');
  const [hasActivePrompt, setHasActivePrompt] = useState(true);
  const [fillText, setFillText] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  if (!isOwner) return null;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8, borderBottomColor: C.separator, backgroundColor: C.bg }]}>
        <Pressable onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>

        <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.titleText, { color: C.label }]}>Weekly Prompt</Text>
        </View>

        <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 49 + insets.bottom + 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Prompt */}
        {hasActivePrompt
          ? <ActivePromptCard onEnd={() => setHasActivePrompt(false)} />
          : <NoActivePromptCard />
        }

        <View style={[s.divider, { backgroundColor: C.separator, marginHorizontal: 16 }]} />

        <CreatePromptSection fillText={fillText} />

        <DipsonSuggestions onSelect={setFillText} />

        <View style={[s.divider, { backgroundColor: C.separator, marginHorizontal: 16 }]} />

        <PastPromptsSection />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1 },
  topBar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  titlePill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  titleText: { fontSize: 15, fontWeight: '600' },
  divider:   { height: StyleSheet.hairlineWidth },
});
