import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { openSidePanel } from '@/utils/global-side-panel';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CURRENT_PROMPT =
  "What's one thing you're working on building right now? Drop it below — let's hold each other accountable.";

const PROMPT_RESPONSES = [
  { id: 'pr1', name: 'Marcus Thompson', initials: 'MT', hue: 40,  content: 'Building a 6-week online fitness program. Launching in May!',                                             likes: 12, timestamp: '2h ago' },
  { id: 'pr2', name: 'Aisha Andrews',   initials: 'AA', hue: 160, content: 'My email list. Went from 0 to 340 subscribers in 3 months. Slow but steady.',                            likes: 8,  timestamp: '4h ago' },
  { id: 'pr3', name: 'Devon Williams',  initials: 'DW', hue: 280, content: 'A personal portfolio site + case studies. Trying to land my first freelance client.',                    likes: 5,  timestamp: '6h ago' },
];

const CONNECT_POSTS = [
  { id: 'cp1', tag: 'Looking For' as const, name: 'Riley Spencer',  initials: 'RS', hue: 100, content: 'An accountability partner for building my newsletter. Aiming for 1K subs by end of Q2.',          likes: 6,  timestamp: '1h ago' },
  { id: 'cp2', tag: 'Offering'    as const, name: 'Aisha Andrews',  initials: 'AA', hue: 160, content: 'Graphic design services — brand kits, social templates, thumbnails. DM me if interested.',         likes: 14, timestamp: '3h ago' },
  { id: 'cp3', tag: 'Looking For' as const, name: 'Jordan Taylor',  initials: 'JT', hue: 60,  content: 'A co-host for a weekly entrepreneurship podcast. Must be consistent.',                             likes: 3,  timestamp: '5h ago' },
  { id: 'cp4', tag: 'Offering'    as const, name: 'Noah Okafor',    initials: 'NO', hue: 200, content: "Cold email copywriting. I've helped 3 clients get meetings with Fortune 500s. Free audit DM me.", likes: 19, timestamp: '8h ago' },
  { id: 'cp5', tag: 'Looking For' as const, name: 'Devon Williams', initials: 'DW', hue: 280, content: 'A UX mentor or feedback on my portfolio. Just starting out and want to improve.',                  likes: 4,  timestamp: '1d ago' },
];

const SPOTLIGHT = {
  name: 'Marcus Thompson',
  initials: 'MT',
  hue: 40,
  handle: '@marcust',
  bio: 'Fitness coach turned content creator. Building my brand from Lagos to the world.',
  role: 'Fitness · Content Creator',
  joinedLabel: 'Member since Jan 2025',
};

const INTRO_SUGGESTION = {
  a: { name: 'Devon Williams', initials: 'DW', hue: 280 },
  b: { name: 'Riley Spencer',  initials: 'RS', hue: 100 },
  reason: 'Both building newsletters · Interested in content creation',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({ initials, hue, size = 36 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `hsl(${hue},35%,75%)`, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: '#1A1714' }}>{initials}</Text>
    </View>
  );
}

function SectionHeader({ label, C }: { label: string; C: ReturnType<typeof useColors> }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
      {label}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ConnectScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:network');
  const isOwner = role === roleCycles[0];

  const topBarH = insets.top + 52;

  const [promptResponse, setPromptResponse] = useState('');
  const [promptPosted, setPromptPosted] = useState(false);
  const [connectTag, setConnectTag] = useState<'Looking For' | 'Offering'>('Looking For');
  const [connectFilter, setConnectFilter] = useState<'All' | 'Looking For' | 'Offering'>('All');
  const [connectText, setConnectText] = useState('');
  const [introDone, setIntroDone] = useState(false);
  const [editPromptVisible, setEditPromptVisible] = useState(false);
  const [newPrompt, setNewPrompt] = useState(CURRENT_PROMPT);
  const [activePrompt, setActivePrompt] = useState(CURRENT_PROMPT);
  const [likedPromptIds, setLikedPromptIds] = useState<Set<string>>(new Set());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    if (connectFilter === 'All') return CONNECT_POSTS;
    return CONNECT_POSTS.filter(p => p.tag === connectFilter);
  }, [connectFilter]);

  const toggleLikePrompt = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedPromptIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleLikePost = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedPostIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        height: topBarH, paddingTop: insets.top,
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: 16, paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
      }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 }]} pointerEvents="none">
          <View style={{ backgroundColor: C.label, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Connect</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. Weekly Prompt ─────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <SectionHeader label="Weekly Prompt" C={C} />

          {/* Prompt card */}
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                <IconSymbol name="mic.fill" size={16} color={C.secondary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, lineHeight: 20, flex: 1 }}>{activePrompt}</Text>
              </View>
              {isOwner && (
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNewPrompt(activePrompt); setEditPromptVisible(true); }}>
                  <Text style={{ fontSize: 12, color: C.secondary, fontWeight: '500' }}>Edit</Text>
                </Pressable>
              )}
            </View>

            {!isOwner && !promptPosted && (
              <View style={{ marginTop: 12, gap: 8 }}>
                <TextInput
                  style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, padding: 10, fontSize: 14, color: C.label, minHeight: 60, textAlignVertical: 'top' }}
                  placeholder="Share your response..."
                  placeholderTextColor={C.secondary}
                  value={promptResponse}
                  onChangeText={setPromptResponse}
                  multiline
                />
                <Pressable
                  style={{ backgroundColor: promptResponse.trim() ? C.label : C.separator, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-end' }}
                  onPress={() => { if (!promptResponse.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPromptPosted(true); }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Post</Text>
                </Pressable>
              </View>
            )}
            {!isOwner && promptPosted && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <IconSymbol name="checkmark.circle.fill" size={15} color="#5A8A6E" />
                <Text style={{ fontSize: 13, color: '#5A8A6E', fontWeight: '500' }}>Response posted!</Text>
              </View>
            )}
          </View>

          {/* Responses */}
          <View style={{ gap: 12 }}>
            {PROMPT_RESPONSES.map(r => (
              <View key={r.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Avatar initials={r.initials} hue={r.hue} size={32} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{r.name}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{r.timestamp}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }}>{r.content}</Text>
                  <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }} onPress={() => toggleLikePrompt(r.id)}>
                    <IconSymbol name={likedPromptIds.has(r.id) ? 'heart.fill' : 'heart'} size={13} color={likedPromptIds.has(r.id) ? '#B85C5C' : C.secondary} />
                    <Text style={{ fontSize: 12, color: likedPromptIds.has(r.id) ? '#B85C5C' : C.secondary }}>{likedPromptIds.has(r.id) ? r.likes + 1 : r.likes}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Text style={{ fontSize: 13, color: C.secondary, fontWeight: '500', marginTop: 10 }}>
              See all {PROMPT_RESPONSES.length + (promptPosted ? 1 : 0)} responses
            </Text>
          </Pressable>
        </View>

        {/* ── 2. Looking For / Offering ────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <SectionHeader label="Connect" C={C} />

          {/* Filter pills */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {(['All', 'Looking For', 'Offering'] as const).map(f => {
              const active = connectFilter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => { Haptics.selectionAsync(); setConnectFilter(f); }}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: active ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}
                >
                  <Text style={{ fontSize: 12, fontWeight: active ? '700' : '400', color: active ? C.bg : C.secondary }}>{f}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Composer */}
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {(['Looking For', 'Offering'] as const).map(t => {
                const active = connectTag === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setConnectTag(t); }}
                    style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, backgroundColor: active ? C.label : 'transparent', borderColor: active ? C.label : C.separator }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: active ? C.bg : C.secondary }}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, padding: 10, fontSize: 14, color: C.label, minHeight: 60, textAlignVertical: 'top' }}
              placeholder="Describe what you're looking for or offering..."
              placeholderTextColor={C.secondary}
              value={connectText}
              onChangeText={setConnectText}
              multiline
            />
            <Pressable
              style={{ backgroundColor: connectText.trim() ? C.label : C.separator, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-end', marginTop: 8 }}
              onPress={() => { if (!connectText.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setConnectText(''); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Post</Text>
            </Pressable>
          </View>

          {/* Posts */}
          {filteredPosts.map(post => {
            const tagColor = post.tag === 'Offering' ? '#5A8A6E' : '#B8943E';
            const liked = likedPostIds.has(post.id);
            return (
              <View key={post.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                  <Avatar initials={post.initials} hue={post.hue} size={36} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{post.name}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{post.timestamp}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: tagColor + '55', backgroundColor: tagColor + '18', alignSelf: 'flex-start' }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: tagColor }}>{post.tag}</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginBottom: 8 }}>{post.content}</Text>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => toggleLikePost(post.id)}>
                  <IconSymbol name={liked ? 'heart.fill' : 'heart'} size={13} color={liked ? '#B85C5C' : C.secondary} />
                  <Text style={{ fontSize: 12, color: liked ? '#B85C5C' : C.secondary }}>{liked ? post.likes + 1 : post.likes}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* ── 3. Member Spotlight ──────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <SectionHeader label="Member Spotlight" C={C} />
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
            <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
              <IconSymbol name="star.fill" size={16} color={C.ember} />
            </View>
            <View style={{ flexDirection: 'row', gap: 14, marginBottom: 10 }}>
              <Avatar initials={SPOTLIGHT.initials} hue={SPOTLIGHT.hue} size={56} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{SPOTLIGHT.name}</Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>{SPOTLIGHT.handle}</Text>
                <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }} numberOfLines={2}>{SPOTLIGHT.bio}</Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: C.separator, alignSelf: 'flex-start', marginTop: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{SPOTLIGHT.role}</Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 12 }}>{SPOTLIGHT.joinedLabel}</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Pressable
                style={{ backgroundColor: C.label, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>View Profile</Text>
              </Pressable>
              {isOwner && (
                <Pressable
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.separator }}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Text style={{ fontSize: 13, color: C.secondary }}>Change Spotlight</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* ── 4. Introductions (Owner only) ────────────────────────────── */}
        {isOwner && (
          <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
            <SectionHeader label="Introductions" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 12 }}>Suggested Introduction</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar initials={INTRO_SUGGESTION.a.initials} hue={INTRO_SUGGESTION.a.hue} size={44} />
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="plus" size={14} color={C.secondary} />
                </View>
                <Avatar initials={INTRO_SUGGESTION.b.initials} hue={INTRO_SUGGESTION.b.hue} size={44} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 4 }}>
                {INTRO_SUGGESTION.a.name} & {INTRO_SUGGESTION.b.name}
              </Text>
              <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 16, marginBottom: 14 }}>{INTRO_SUGGESTION.reason}</Text>
              {introDone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#5A8A6E" />
                  <Text style={{ fontSize: 13, color: '#5A8A6E', fontWeight: '500', flex: 1 }}>
                    Introduction sent! Devon and Riley have been connected.
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={{ backgroundColor: C.label, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20, alignSelf: 'flex-start' }}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIntroDone(true); }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>Introduce</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Edit Prompt sheet (Owner) */}
      <BottomSheet visible={editPromptVisible} onClose={() => setEditPromptVisible(false)}>
        <View style={{ padding: 20, gap: 14, paddingBottom: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Edit Weekly Prompt</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, padding: 12, fontSize: 14, color: C.label, minHeight: 80, textAlignVertical: 'top', backgroundColor: C.surface }}
            value={newPrompt}
            onChangeText={setNewPrompt}
            multiline
            autoFocus
            placeholder="Enter new prompt..."
            placeholderTextColor={C.secondary}
          />
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <Pressable
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.separator }}
              onPress={() => setEditPromptVisible(false)}
            >
              <Text style={{ fontSize: 13, color: C.secondary }}>Cancel</Text>
            </Pressable>
            <Pressable
              style={{ backgroundColor: newPrompt.trim() ? C.label : C.separator, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActivePrompt(newPrompt); setEditPromptVisible(false); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

    </View>
  );
}
