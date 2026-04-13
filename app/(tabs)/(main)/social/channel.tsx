/**
 * Channel Chat View — Discord-style.
 * - Footer force-hidden so input bar is visible
 * - Message grouping (consecutive same-author collapsed)
 * - Poll messages with vote bars
 * - Compose bar: text | photo | poll modes
 * - Poll creation tray
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  forceHideFooter,
  releaseForceHide,
  resetFooter,
} from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Semantic colors ────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const EMBER   = '#8B2500';

// ── Avatar colors ──────────────────────────────────────────────────────────────

const AVATAR_BG: Record<string, string> = {
  Sammy:  '#1A1714',
  Marcus: '#4A3525',
  Taylor: '#2E5B3E',
  Jordan: '#1A3A5A',
  Alex:   '#2E5B3E',
  Priya:  '#5A3A4A',
  Chris:  '#2A3A4A',
  Emma:   '#5A3A4A',
  Sam:    '#3A4A2E',
};

const avatarBg   = (name: string) => AVATAR_BG[name] ?? '#333333';
const avatarText = () => '#FFFFFF';

// ── Types ──────────────────────────────────────────────────────────────────────

type PollOption = { id: string; text: string; votes: number };

type Poll = {
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsIn: string;  // e.g. "2h left" | "Closed"
};

type Message = {
  id: string;
  author: string;
  initial: string;
  timestamp: string;
  text?: string;
  poll?: Poll;
  isOwner?: boolean;
  pinned?: boolean;
};

// ── Channel data ───────────────────────────────────────────────────────────────

const CHANNEL_MESSAGES: Record<string, Message[]> = {
  general: [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '2:14 PM',
      text: 'Welcome to #general! This is the open community space for all followers. Introduce yourselves and connect 👋',
      isOwner: true, pinned: true,
    },
    { id: '2', author: 'Marcus', initial: 'M', timestamp: '3:42 PM',
      text: 'Just hit 10K followers! Thanks for the strategy tips 🎉' },
    { id: '3', author: 'Taylor', initial: 'T', timestamp: '4:01 PM',
      text: "Congrats Marcus!! That's huge 🔥" },
    { id: '4', author: 'Jordan', initial: 'J', timestamp: '5:18 PM',
      text: '@Marcus What niche are you in? Would love to connect' },
    {
      id: 'poll1', author: 'Sammy', initial: 'S', timestamp: 'Yesterday',
      isOwner: true,
      poll: {
        question: 'What type of content do you want more of this month?',
        options: [
          { id: 'a', text: 'Brand deal breakdowns',        votes: 312 },
          { id: 'b', text: 'Content strategy deep dives',  votes: 189 },
          { id: 'c', text: 'Behind-the-scenes revenue',    votes: 234 },
          { id: 'd', text: 'Live Q&A sessions',            votes: 156 },
        ],
        totalVotes: 891,
        endsIn: 'Closed',
      },
    },
    { id: '5', author: 'Alex', initial: 'A', timestamp: 'Yesterday',
      text: "Sammy's content on brand partnerships is so good. Changed how I pitch to brands completely." },
    { id: '6', author: 'Priya', initial: 'P', timestamp: 'Yesterday',
      text: 'Same! The rate card template alone got me a $3K deal last week 🙌' },
  ],
  introductions: [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '9:00 AM',
      text: 'Welcome! Drop an introduction below — name, niche, and one goal this year.',
      isOwner: true, pinned: true,
    },
    { id: '2', author: 'Taylor', initial: 'T', timestamp: '10:22 AM',
      text: "Hey everyone! I'm a lifestyle creator from Austin. Goal this year: hit 50K and land my first brand deal." },
    { id: '3', author: 'Priya', initial: 'P', timestamp: '11:05 AM',
      text: 'Hi! Finance content creator. Goal: launch a paid newsletter by Q3.' },
    { id: '4', author: 'Marcus', initial: 'M', timestamp: '1:30 PM',
      text: 'Fitness creator, Chicago. Goal: 10K→50K and launch a coaching program.' },
    { id: '5', author: 'Jordan', initial: 'J', timestamp: '2:45 PM',
      text: 'Travel + photography creator based in NYC. Looking to connect with lifestyle brands.' },
    { id: '6', author: 'Alex', initial: 'A', timestamp: '4:00 PM',
      text: 'Educational content — personal finance for Gen Z. 8K subscribers. Goal: first paid product this year.' },
  ],
  'content-strategy': [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '8:00 AM',
      text: '📌 This week\'s focus: hook frameworks. Dropping three hook templates tomorrow.',
      isOwner: true, pinned: true,
    },
    { id: '2', author: 'Jordan', initial: 'J', timestamp: '9:15 AM',
      text: 'The B-roll technique worked insane — AVD went from 34% to 52% in two weeks.' },
    { id: '3', author: 'Jordan', initial: 'J', timestamp: '9:16 AM',
      text: 'Anyone else notice the same thing with the talking-head + B-roll split?' },
    { id: '4', author: 'Alex', initial: 'A', timestamp: '11:00 AM',
      text: 'Can we talk about thumbnail strategy? My hooks are solid but CTR is still weak.' },
    {
      id: '5', author: 'Sammy', initial: 'S', timestamp: '11:48 AM',
      text: '@Alex Thumbnail is 50% of the battle. Rule: 1 face + 1 emotion + 1 curiosity gap. Full breakdown next session.',
      isOwner: true,
    },
    {
      id: '6', author: 'Sammy', initial: 'S', timestamp: '11:49 AM',
      text: 'Also — your first 3 seconds need to answer "why should I keep watching?" Not tease it. Answer it.',
      isOwner: true,
    },
    {
      id: 'poll1', author: 'Sammy', initial: 'S', timestamp: '12:00 PM',
      isOwner: true,
      poll: {
        question: 'Biggest bottleneck in your content workflow right now?',
        options: [
          { id: 'a', text: 'Ideas / ideation',      votes: 89  },
          { id: 'b', text: 'Filming / production',  votes: 134 },
          { id: 'c', text: 'Editing',               votes: 201 },
          { id: 'd', text: 'Posting consistently',  votes: 176 },
        ],
        totalVotes: 600,
        endsIn: '4h left',
      },
    },
    { id: '7', author: 'Taylor', initial: 'T', timestamp: '12:15 PM',
      text: 'Editing for me every time. I spend 3x more time editing than filming 😭' },
    { id: '8', author: 'Marcus', initial: 'M', timestamp: '12:22 PM',
      text: 'Same. Any good editors in here open to work?' },
  ],
  'coaching-qa': [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '10:00 AM',
      text: "Q&A thread is OPEN 🎙️ Post your questions. I'll answer the top 10 today at 2pm ET.",
      isOwner: true, pinned: true,
    },
    {
      id: 'poll1', author: 'Sammy', initial: 'S', timestamp: '10:05 AM',
      isOwner: true,
      poll: {
        question: 'What\'s your biggest challenge with brand deals?',
        options: [
          { id: 'a', text: 'Finding brands to pitch',    votes: 47  },
          { id: 'b', text: 'Negotiating rates',          votes: 89  },
          { id: 'c', text: 'Creating a media kit',       votes: 31  },
          { id: 'd', text: 'Getting a response at all',  votes: 112 },
        ],
        totalVotes: 279,
        endsIn: '2h left',
      },
    },
    { id: '2', author: 'Jordan', initial: 'J', timestamp: '10:23 AM',
      text: 'How do you handle brands that lowball you? I keep getting $200 offers for posts that take 8 hours.' },
    { id: '3', author: 'Alex', initial: 'A', timestamp: '10:45 AM',
      text: "What's the best way to negotiate a long-term retainer vs one-off deals?" },
    { id: '4', author: 'Sam', initial: 'S', timestamp: '11:02 AM',
      text: 'How often should you raise your rates?' },
    { id: '5', author: 'Priya', initial: 'P', timestamp: '11:18 AM',
      text: 'When do you know you\'re ready to quit your job and go full-time creator?' },
  ],
  wins: [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '7:00 AM',
      text: '🏆 Share your wins — big or small. Every step counts.',
      isOwner: true, pinned: true,
    },
    { id: '2', author: 'Alex', initial: 'A', timestamp: '9:14 AM',
      text: 'First brand deal signed! $2K for a 60-second integration 🎉' },
    { id: '3', author: 'Alex', initial: 'A', timestamp: '9:15 AM',
      text: "Three months ago I had zero brand contacts. This community changed everything." },
    { id: '4', author: 'Priya', initial: 'P', timestamp: '10:30 AM',
      text: 'Hit 5K subscribers today. Slow grind but consistency is paying off!' },
    { id: '5', author: 'Marcus', initial: 'M', timestamp: '2:00 PM',
      text: 'Posted consistently for 30 days straight. It\'s a habit now.' },
    { id: '6', author: 'Taylor', initial: 'T', timestamp: '3:40 PM',
      text: 'Got my first DM from a brand! They want to send product. Small win but it\'s happening 🙌' },
  ],
  resources: [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '6:00 AM',
      text: '📚 All templates are pinned here — content audit, rate card, brand outreach scripts.',
      isOwner: true, pinned: true,
    },
    {
      id: '2', author: 'Sammy', initial: 'S', timestamp: '8:00 AM',
      text: 'Content audit template added. Use it every quarter to cut what\'s not working.',
      isOwner: true,
    },
    { id: '3', author: 'Jordan', initial: 'J', timestamp: '9:30 AM',
      text: 'The rate card template got me a deal in 48 hours after sending. Incredible.' },
    { id: '4', author: 'Alex', initial: 'A', timestamp: '10:00 AM',
      text: 'Can you drop the outreach email script here? The one from the subscriber post?' },
    {
      id: '5', author: 'Sammy', initial: 'S', timestamp: '10:15 AM',
      text: 'Just pinned it above. Subject line + full body + follow-up template all there.',
      isOwner: true,
    },
  ],
  'vip-lounge': [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '7:00 AM',
      text: '🔒 Inner Circle. This is where I share what I don\'t share anywhere else.',
      isOwner: true, pinned: true,
    },
    {
      id: '2', author: 'Sammy', initial: 'S', timestamp: '11:00 AM',
      text: 'Here\'s exactly how I structured the $40K annual deal — payment schedule, usage rights, revision limits.',
      isOwner: true,
    },
    { id: '3', author: 'Emma', initial: 'E', timestamp: '11:45 AM',
      text: 'This breakdown alone is worth the IC price. Thank you for this level of transparency.' },
    {
      id: 'poll1', author: 'Sammy', initial: 'S', timestamp: '12:00 PM',
      isOwner: true,
      poll: {
        question: 'What should I cover in next month\'s IC deep-dive?',
        options: [
          { id: 'a', text: 'Scaling to $50K/month',         votes: 18 },
          { id: 'b', text: 'Building a team as a creator',  votes: 12 },
          { id: 'c', text: 'Equity deals with brands',      votes: 9  },
          { id: 'd', text: 'Launching a course from 0',     votes: 8  },
        ],
        totalVotes: 47,
        endsIn: '1d left',
      },
    },
  ],
  'behind-the-scenes': [
    {
      id: '1', author: 'Sammy', initial: 'S', timestamp: '9:00 AM',
      text: '💼 Raw P&L — last month: $18.4K revenue, $6.2K costs, $12.2K net.',
      isOwner: true, pinned: true,
    },
    { id: '2', author: 'Chris', initial: 'C', timestamp: '9:30 AM',
      text: 'Seeing the actual numbers makes this so much more real.' },
    {
      id: '3', author: 'Sammy', initial: 'S', timestamp: '10:00 AM',
      text: 'Revenue breakdown: AdSense $2.1K, brand deals $11K, IC subs $3.2K, course sales $2.1K.',
      isOwner: true,
    },
    {
      id: '4', author: 'Sammy', initial: 'S', timestamp: '10:02 AM',
      text: 'Biggest cost was editor ($2K). Best ROI cost was my Notion subscription ($16). Wild.',
      isOwner: true,
    },
    { id: '5', author: 'Emma', initial: 'E', timestamp: '10:30 AM',
      text: 'That editor line hit different. Where do you find good editors for this scale?' },
  ],
};

// ── Poll Card (stateful votes) ────────────────────────────────────────────────

function PollCard({ poll, C, s }: { poll: Poll; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const [votedId, setVotedId] = useState<string | null>(null);
  const isClosed = poll.endsIn === 'Closed';
  const showBars = isClosed || votedId !== null;

  return (
    <View style={[s.pollCard, { backgroundColor: C.bg, borderColor: C.separator }]}>
      <Text style={[s.pollQuestion, { color: C.label }]}>{poll.question}</Text>

      <View style={s.pollOptions}>
        {poll.options.map(opt => {
          const pct     = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) : 0;
          const isVoted = votedId === opt.id;
          const canVote = !isClosed && votedId === null;

          return (
            <Pressable
              key={opt.id}
              style={[
                s.pollOption,
                { borderColor: isVoted ? C.label : C.separator },
                showBars && { backgroundColor: C.surface },
              ]}
              onPress={() => {
                if (!canVote) return;
                Haptics.selectionAsync();
                setVotedId(opt.id);
              }}
            >
              {/* Fill bar */}
              {showBars && (
                <View
                  style={[
                    s.pollFill,
                    {
                      width: `${Math.round(pct * 100)}%` as any,
                      backgroundColor: isVoted ? C.label : C.separator,
                    },
                  ]}
                />
              )}
              <View style={s.pollOptionRow}>
                <Text style={[s.pollOptionText, { color: C.label, fontWeight: isVoted ? '700' : '400' }]}>
                  {opt.text}
                </Text>
                {showBars && (
                  <Text style={[s.pollPct, { color: isVoted ? C.label : C.secondary, fontWeight: isVoted ? '700' : '500' }]}>
                    {Math.round(pct * 100)}%
                  </Text>
                )}
                {!showBars && (
                  <View style={[s.pollRadio, { borderColor: C.separator }]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={[s.pollMeta, { color: C.secondary }]}>
        {poll.totalVotes.toLocaleString()} votes · {poll.endsIn}
      </Text>
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ChannelScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const { channelId, channelName, access, memberCount } = useLocalSearchParams<{
    channelId: string;
    channelName: string;
    access: string;
    memberCount: string;
  }>();

  const [role, , roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];

  // Compose state
  const [inputText, setInputText]     = useState('');
  const [composeMode, setComposeMode] = useState<'text' | 'poll'>('text');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions]   = useState(['', '']);

  const scrollRef = useRef<ScrollView>(null);

  // Hide footer so input bar is visible; restore on leave
  useEffect(() => {
    forceHideFooter();
    return () => { releaseForceHide(); resetFooter(); };
  }, []);

  useFocusEffect(useCallback(() => {
    forceHideFooter();
  }, []));

  const messages = CHANNEL_MESSAGES[channelId ?? 'general'] ?? CHANNEL_MESSAGES.general;

  // Group consecutive same-author messages
  const grouped = useMemo(() =>
    messages.map((msg, idx) => {
      const prev = messages[idx - 1];
      const isGrouped =
        prev &&
        prev.author === msg.author &&
        !msg.pinned &&
        !msg.poll &&
        !prev.poll;
      return { ...msg, isGrouped: !!isGrouped };
    }),
    [messages],
  );

  // Access badge config
  const accessColor =
    access === 'Open'        ? GAIN    :
    access === 'Subscribers' ? CAUTION :
    C.label;
  const accessIcon =
    access === 'Open'        ? 'globe'     :
    access === 'Subscribers' ? 'lock.fill' :
    'star.fill';

  // Send handler
  const handleSend = () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');
  };

  // Create poll handler
  const handleCreatePoll = () => {
    const filledOptions = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim()) { Alert.alert('Add a question'); return; }
    if (filledOptions.length < 2) { Alert.alert('Add at least 2 options'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Poll created!', 'Your poll has been posted to the channel.');
    setPollQuestion('');
    setPollOptions(['', '']);
    setComposeMode('text');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* ── Top bar ── */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <View style={s.topBarInner}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={s.backBtn}>
            <IconSymbol name="chevron.left" size={22} color={C.label} />
          </Pressable>

          <View style={s.topBarCenter}>
            <Text style={[s.channelTitle, { color: C.label }]} numberOfLines={1}>
              #{channelName}
            </Text>
            <View style={[s.accessBadge, { borderColor: accessColor }]}>
              <IconSymbol name={accessIcon as any} size={9} color={accessColor} />
              <Text style={[s.accessBadgeText, { color: accessColor }]}>{access}</Text>
            </View>
          </View>

          <View style={s.topBarRight}>
            <Text style={[s.memberCount, { color: C.secondary }]}>
              {Number(memberCount ?? 0).toLocaleString()} members
            </Text>
            {isOwner && (
              <Pressable hitSlop={8} onPress={() => Alert.alert('Channel Settings')}>
                <IconSymbol name="gearshape" size={18} color={C.secondary} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollRef}
        style={s.msgList}
        contentContainerStyle={s.msgListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {grouped.map(msg => (
          <View key={msg.id}>
            {/* Pinned banner */}
            {msg.pinned && (
              <View style={[s.pinnedBar, { borderColor: C.separator, backgroundColor: C.surface }]}>
                <IconSymbol name="pin.fill" size={10} color={EMBER} />
                <Text style={[s.pinnedText, { color: EMBER }]}>PINNED</Text>
              </View>
            )}

            <Pressable
              style={[s.msgRow, msg.isGrouped && s.msgRowGrouped]}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const actions = isOwner
                  ? [
                      { text: 'Reply',  onPress: () => {} },
                      { text: 'Copy',   onPress: () => {} },
                      { text: 'Pin',    onPress: () => {} },
                      { text: 'Delete', style: 'destructive' as const, onPress: () => {} },
                    ]
                  : [
                      { text: 'Reply', onPress: () => {} },
                      { text: 'Copy',  onPress: () => {} },
                    ];
                Alert.alert(msg.author, undefined, [...actions, { text: 'Cancel', style: 'cancel' }]);
              }}
              delayLongPress={400}
            >
              {/* Avatar (only for first in group) */}
              {msg.isGrouped ? (
                <View style={s.msgAvatarSpacer} />
              ) : (
                <View style={[s.msgAvatar, { backgroundColor: avatarBg(msg.author) }]}>
                  <Text style={[s.msgAvatarText, { color: avatarText() }]}>{msg.initial}</Text>
                </View>
              )}

              <View style={s.msgBody}>
                {/* Header (only for first in group) */}
                {!msg.isGrouped && (
                  <View style={s.msgHeader}>
                    <Text style={[s.msgAuthor, { color: C.label }]}>{msg.author}</Text>
                    {msg.isOwner && (
                      <View style={[s.ownerBadge, { backgroundColor: C.label }]}>
                        <Text style={[s.ownerBadgeText, { color: C.bg }]}>Owner</Text>
                      </View>
                    )}
                    <Text style={[s.msgTime, { color: C.secondary }]}>{msg.timestamp}</Text>
                  </View>
                )}

                {/* Text */}
                {msg.text && (
                  <Text style={[s.msgText, { color: C.label }]}>{msg.text}</Text>
                )}

                {/* Poll */}
                {msg.poll && (
                  <PollCard poll={msg.poll} C={C} s={s} />
                )}
              </View>
            </Pressable>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Poll creation tray ── */}
      {composeMode === 'poll' && (
        <View style={[s.pollTray, { backgroundColor: C.surface, borderTopColor: C.separator, borderColor: C.separator }]}>
          <View style={s.pollTrayHeader}>
            <Text style={[s.pollTrayTitle, { color: C.label }]}>Create Poll</Text>
            <Pressable hitSlop={8} onPress={() => setComposeMode('text')}>
              <IconSymbol name="xmark" size={16} color={C.secondary} />
            </Pressable>
          </View>

          <TextInput
            style={[s.pollQuestionInput, { backgroundColor: C.bg, color: C.label, borderColor: C.separator }]}
            placeholder="Ask a question..."
            placeholderTextColor={C.secondary}
            value={pollQuestion}
            onChangeText={setPollQuestion}
          />

          {pollOptions.map((opt, idx) => (
            <View key={idx} style={s.pollOptionInputRow}>
              <TextInput
                style={[s.pollOptionInput, { backgroundColor: C.bg, color: C.label, borderColor: C.separator }]}
                placeholder={`Option ${idx + 1}`}
                placeholderTextColor={C.secondary}
                value={opt}
                onChangeText={v => {
                  const next = [...pollOptions];
                  next[idx] = v;
                  setPollOptions(next);
                }}
              />
              {idx > 1 && (
                <Pressable
                  hitSlop={8}
                  onPress={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                >
                  <IconSymbol name="minus.circle" size={18} color={C.secondary} />
                </Pressable>
              )}
            </View>
          ))}

          {pollOptions.length < 4 && (
            <Pressable
              style={s.pollAddOption}
              onPress={() => setPollOptions([...pollOptions, ''])}
            >
              <IconSymbol name="plus" size={14} color={C.secondary} />
              <Text style={[s.pollAddOptionText, { color: C.secondary }]}>Add option</Text>
            </Pressable>
          )}

          <Pressable
            style={[s.pollCreateBtn, { backgroundColor: C.label }]}
            onPress={handleCreatePoll}
          >
            <Text style={[s.pollCreateBtnText, { color: C.bg }]}>Post Poll</Text>
          </Pressable>
        </View>
      )}

      {/* ── Input bar ── */}
      {composeMode === 'text' && (
        <View
          style={[
            s.inputBar,
            {
              paddingBottom: insets.bottom + 8,
              backgroundColor: C.bg,
              borderTopColor: C.separator,
            },
          ]}
        >
          {/* User avatar */}
          <View style={[s.inputAvatar, { backgroundColor: '#1A1714' }]}>
            <Text style={[s.inputAvatarText]}>S</Text>
          </View>

          {/* Text input */}
          <TextInput
            style={[s.textInput, { backgroundColor: C.surface, color: C.label }]}
            placeholder={`Message #${channelName ?? 'channel'}...`}
            placeholderTextColor={C.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="default"
          />

          {/* Attachment icons — shown when input is empty */}
          {inputText.length === 0 && (
            <View style={s.inputIcons}>
              <Pressable hitSlop={8} onPress={() => Alert.alert('Photo / Video')}>
                <IconSymbol name="photo" size={20} color={C.secondary} />
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={() => { Haptics.selectionAsync(); setComposeMode('poll'); }}
              >
                <IconSymbol name="chart.bar.fill" size={20} color={C.secondary} />
              </Pressable>
            </View>
          )}

          {/* Send button — shown when text entered */}
          {inputText.length > 0 && (
            <Pressable hitSlop={8} onPress={handleSend}>
              <View style={[s.sendBtn, { backgroundColor: C.label }]}>
                <IconSymbol name="arrow.up" size={14} color={C.bg} />
              </View>
            </Pressable>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBar:      { borderBottomWidth: StyleSheet.hairlineWidth },
  topBarInner: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarCenter:{ flex: 1, alignItems: 'center', gap: 4 },
  channelTitle:{ fontSize: 16, fontWeight: '700' },
  accessBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1,
  },
  accessBadgeText: { fontSize: 10, fontWeight: '600' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberCount: { fontSize: 12 },

  // Messages
  msgList:        { flex: 1 },
  msgListContent: { paddingHorizontal: 14, paddingTop: 12 },

  pinnedBar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, marginBottom: 8,
  },
  pinnedText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },

  msgRow:        { flexDirection: 'row', gap: 10, marginBottom: 4, paddingHorizontal: 2 },
  msgRowGrouped: { marginBottom: 2 },
  msgAvatarSpacer: { width: 36, flexShrink: 0 },
  msgAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  msgAvatarText: { fontSize: 14, fontWeight: '700' },

  msgBody:   { flex: 1, paddingBottom: 2 },
  msgHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  msgAuthor: { fontSize: 14, fontWeight: '700' },
  ownerBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  ownerBadgeText: { fontSize: 10, fontWeight: '600' },
  msgTime:   { fontSize: 11, marginLeft: 2 },
  msgText:   { fontSize: 14, lineHeight: 20 },

  // Poll card
  pollCard: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 6,
  },
  pollQuestion:  { fontSize: 14, fontWeight: '700', marginBottom: 12, lineHeight: 20 },
  pollOptions:   { gap: 8, marginBottom: 10 },
  pollOption: {
    borderRadius: 9, borderWidth: 1, overflow: 'hidden',
    position: 'relative',
  },
  pollFill: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: 9 },
  pollOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  pollOptionText: { fontSize: 13, flex: 1 },
  pollPct:   { fontSize: 13, marginLeft: 8 },
  pollRadio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, marginLeft: 8 },
  pollMeta:  { fontSize: 12 },

  // Poll creation tray
  pollTray: {
    borderTopWidth: StyleSheet.hairlineWidth, borderRadius: 0,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 10,
  },
  pollTrayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pollTrayTitle:  { fontSize: 15, fontWeight: '700' },
  pollQuestionInput: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14,
  },
  pollOptionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pollOptionInput: {
    flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14,
  },
  pollAddOption:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  pollAddOptionText: { fontSize: 14 },
  pollCreateBtn:     { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  pollCreateBtnText: { fontSize: 14, fontWeight: '700' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2,
  },
  inputAvatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  textInput: {
    flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 15, maxHeight: 100,
  },
  inputIcons: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  sendBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
});
