/**
 * Nexus — Claude-clone AI chat screen.
 *
 * Features:
 *   • Streaming responses via direct Anthropic API (XHR SSE)
 *   • Basketball detection → SKILL.md + File 01 + legends injected as system prompt
 *   • Claude reads the intelligence files and executes the protocol — no TS engine
 *   • Artifact extraction: code blocks parsed out of responses → inline NexusArtifactBlock
 *   • Inline markdown rendering: headings, bold, inline code, bullets
 *   • Welcome state: greeting + suggestion chips (NexusWelcome)
 *   • Sidebar: chat history + projects (NexusSidebar)
 *   • Chat persistence: AsyncStorage via nexus-chat-storage
 *   • Stop button cancels active stream
 *   • Multi-turn conversation history (last 20 messages)
 *   • "Add to Chat" attachment sheet
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NexusPageTopBar } from '@/components/nexus/nexus-page-top-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { GlassView } from '@/components/ui/glass-view';
import { ArtifactSheet, type Artifact } from '@/components/nexus/artifact-sheet';

// New UI components
import { NexusWelcome } from '@/components/nexus/nexus-welcome';
import { NexusSidebar } from '@/components/nexus/nexus-sidebar';
import { NexusArtifactBlock } from '@/components/nexus/nexus-artifact-block';

// Intelligence layer
import { classifyQuery } from '@/services/intelligence/router';
import { buildIntelligenceSystemPrompt, type SystemPromptParts } from '@/services/intelligence/nexus-intelligence';
import { MODELS, type ModelTier } from '@/services/intelligence/models';
import { POOL_TOOLS, handlePoolTool } from '@/services/intelligence/pool-tools';
import { CORPUS_TOOLS, handleCorpusTool } from '@/services/intelligence/corpus-tools';
import { APP_DATA_TOOLS, handleAppDataTool } from '@/services/intelligence/app-data-tools';
import { consumePendingEvalQuery } from '@/utils/global-nexus-state';

// Storage
import {
  saveChat, loadChat, loadAllChats, deleteChat, renameChat,
  toggleStarChat, loadAllProjects, saveProject,
  generateChatTitle, generateChatId,
  type NexusChatMeta, type NexusProject,
  type NexusMessage as StoredMessage, type NexusChat,
} from '@/services/nexus/nexus-chat-storage';
import type { NexusArtifact } from '@/services/nexus/nexus-artifact-extractor';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL     = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS  = 4096;
const MAX_HISTORY = 20;

const GENERIC_PROMPT =
  `You are Nexus, KaNeXT's intelligent AI assistant. Be concise, direct, and helpful. ` +
  `You assist coaches, athletes, and administrators with any question.`;

// ── Tool name sets + dispatcher ───────────────────────────────────────────────

const POOL_TOOL_NAMES   = new Set(POOL_TOOLS.map(t => t.name));
const CORPUS_TOOL_NAMES = new Set(CORPUS_TOOLS.map(t => t.name));
const APP_TOOL_NAMES    = new Set(APP_DATA_TOOLS.map(t => t.name));

function dispatchTool(name: string, input: Record<string, unknown>): string {
  if (POOL_TOOL_NAMES.has(name))   return handlePoolTool(name, input);
  if (CORPUS_TOOL_NAMES.has(name)) return handleCorpusTool(name, input);
  if (APP_TOOL_NAMES.has(name))    return handleAppDataTool(name, input);
  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Segment {
  type: 'text' | 'artifact';
  text?: string;
  artifact?: Artifact;
}

interface Message {
  id:         string;
  raw:        string;
  segments:   Segment[];
  isMe:       boolean;
  streaming?: boolean;
}

type ApiMessage = { role: 'user' | 'assistant'; content: string | any[] };

// SSE stream types for tool-use handling
type ContentBlock =
  | { type: 'text';     text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> };

interface StreamResult {
  stopReason: string;
  blocks:     ContentBlock[];
}

// ── Response Sanitizer ────────────────────────────────────────────────────────
// Strips XML tool-call blocks that Claude occasionally emits when it lacks data.
// These should never reach the UI regardless of whether pool injection worked.

function sanitizeResponse(text: string): string {
  // Remove complete <function_calls>...</function_calls> blocks
  let clean = text.replace(/<function_calls>[\s\S]*?<\/function_calls>/g, '');
  // Remove any incomplete block still streaming (opens but hasn't closed yet)
  clean = clean.replace(/<function_calls>[\s\S]*$/, '');
  // Collapse excess blank lines left behind
  clean = clean.replace(/\n{3,}/g, '\n\n');
  return clean;
}

// ── Artifact / Markdown Parsing ───────────────────────────────────────────────

let _artifactCounter = 0;

function parseMessage(raw: string): Segment[] {
  const artifacts: Artifact[] = [];
  const PLACEHOLDER_RE = /\uFFFE(\d+)\uFFFE/;

  const processed = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang: string, code: string) => {
    const idx = _artifactCounter++;
    const language = lang.trim() || 'text';
    const title = inferTitle(language, code.trim());
    artifacts.push({ id: `art_${idx}`, language, title, content: code.trim() });
    return `\uFFFE${idx}\uFFFE`;
  });

  const parts = processed.split(/(\uFFFE\d+\uFFFE)/);
  const segments: Segment[] = [];
  for (const part of parts) {
    const match = part.match(/\uFFFE(\d+)\uFFFE/);
    if (match) {
      const art = artifacts[parseInt(match[1], 10) - (_artifactCounter - artifacts.length)];
      if (art) segments.push({ type: 'artifact', artifact: art });
    } else if (part.trim()) {
      segments.push({ type: 'text', text: part });
    }
  }
  return segments.length ? segments : [{ type: 'text', text: raw }];
}

function inferTitle(lang: string, code: string): string {
  const firstLine = code.split('\n')[0].slice(0, 50).trim();
  const fnMatch   = firstLine.match(/(?:function|const|class|def|fn)\s+(\w+)/);
  if (fnMatch) return fnMatch[1];
  if (['sql'].includes(lang.toLowerCase())) return 'SQL Query';
  if (['json'].includes(lang.toLowerCase())) return 'JSON';
  if (['bash', 'shell', 'sh'].includes(lang.toLowerCase())) return 'Script';
  return firstLine.slice(0, 30) || lang.toUpperCase() || 'Code';
}

// ── Inline Markdown Renderer ──────────────────────────────────────────────────

function MarkdownBlock({ text, C }: { text: string; C: ComponentColors }) {
  const S = useMemo(() => makeStyles(C), [C]);
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      elements.push(
        <Text selectable key={i} style={[S.mdH3, { color: C.label }]}>{renderInline(line.slice(4), C, S)}</Text>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <Text selectable key={i} style={[S.mdH2, { color: C.label }]}>{renderInline(line.slice(3), C, S)}</Text>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <Text selectable key={i} style={[S.mdH1, { color: C.label }]}>{renderInline(line.slice(2), C, S)}</Text>
      );
    } else if (/^[-*]\s/.test(line)) {
      elements.push(
        <View key={i} style={S.mdBulletRow}>
          <Text style={[S.mdBulletDot, { color: C.secondary }]}>•</Text>
          <Text selectable style={[S.mdBody, { color: C.label, flex: 1 }]}>{renderInline(line.slice(2), C, S)}</Text>
        </View>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1] ?? '1';
      elements.push(
        <View key={i} style={S.mdBulletRow}>
          <Text style={[S.mdBulletDot, { color: C.secondary }]}>{num}.</Text>
          <Text selectable style={[S.mdBody, { color: C.label, flex: 1 }]}>{renderInline(line.replace(/^\d+\.\s/, ''), C, S)}</Text>
        </View>
      );
    } else if (/^---+$/.test(line.trim())) {
      elements.push(
        <View key={i} style={[S.mdRule, { backgroundColor: C.separator }]} />
      );
    } else if (line.trim() === '') {
      elements.push(<View key={i} style={{ height: 8 }} />);
    } else {
      elements.push(
        <Text selectable key={i} style={[S.mdBody, { color: C.label }]}>{renderInline(line, C, S)}</Text>
      );
    }
    i++;
  }
  return <View>{elements}</View>;
}

function renderInline(text: string, C: ComponentColors, S: ReturnType<typeof makeStyles>): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={idx} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <Text key={idx} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <Text key={idx} style={[S.mdInlineCode, { backgroundColor: C.surfacePressed, color: C.accent }]}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={idx}>{part}</Text>;
  });
}

// ── Message action bar ────────────────────────────────────────────────────────

function MessageActionBar({
  message,
  allMessages,
  onRetry,
  C,
}: {
  message:     { id: string; raw: string };
  allMessages: { id: string; raw: string; isMe: boolean }[];
  onRetry:     (text: string) => void;
  C:           ComponentColors;
}) {
  const [liked,      setLiked]      = useState<'up' | 'down' | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.raw);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => {
    Share.share({ message: message.raw });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTTS = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(message.raw, {
        language: 'en-US',
        onDone:   () => setIsSpeaking(false),
        onError:  () => setIsSpeaking(false),
      });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleThumb = (val: 'up' | 'down') => {
    setLiked(prev => (prev === val ? null : val));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRetry = () => {
    const myIdx   = allMessages.findIndex(m => m.id === message.id);
    const prevUser = allMessages.slice(0, myIdx).reverse().find(m => m.isMe);
    if (prevUser) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRetry(prevUser.raw);
    }
  };

  const btn = (
    icon: string,
    onPress: () => void,
    opts?: { active?: boolean; tint?: string }
  ) => (
    <Pressable
      key={icon}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, padding: 6 })}
    >
      <IconSymbol
        name={icon as any}
        size={17}
        color={opts?.active ? (opts.tint ?? C.accent) : C.muted}
      />
    </Pressable>
  );

  return (
    <View style={{ flexDirection: 'row', marginTop: 4, marginLeft: 2, gap: 2 }}>
      {btn(copied ? 'checkmark' : 'doc.on.doc',   handleCopy)}
      {btn('square.and.arrow.up',                  handleShare)}
      {btn(isSpeaking ? 'stop.circle' : 'play.circle', handleTTS, { active: isSpeaking })}
      {btn(liked === 'up'   ? 'hand.thumbsup.fill'   : 'hand.thumbsup',   () => handleThumb('up'),   { active: liked === 'up' })}
      {btn(liked === 'down' ? 'hand.thumbsdown.fill' : 'hand.thumbsdown', () => handleThumb('down'), { active: liked === 'down' })}
      {btn('arrow.clockwise', handleRetry)}
    </View>
  );
}

// ── Intent detection ──────────────────────────────────────────────────────────

function isBasketball(msg: string): boolean {
  try {
    const qt = classifyQuery(msg);
    if (qt !== 'unknown') return true;
  } catch { /* intelligence layer unavailable */ }
  return /\b(evaluat|basketball|player|roster|recruit|transfer|eval|klvn|archetype|shoot|defens|rebound|assist|turnover|season|game|coach|scholarship|draft)/i.test(msg)
      || /\b(kr|nil|pro|minutes|program)\b/i.test(msg);
}

// A system content block as Anthropic expects it in the messages API.
type SystemBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };

/**
 * Builds the `system` field for the API request.
 *
 * Basketball tier — structured array with prompt caching:
 *   Block 0: SKILL_MD + TOOLS_INSTRUCTION (~2K tokens) — cache_control: ephemeral
 *   Block 1: validated profiles (Laolu/Lincoln) — no cache marker, only when matched
 *   FILE_01, legends, and reference data are fetched by Claude via corpus tools.
 *
 * General tier — plain string (Haiku, small prompt, caching not worthwhile).
 */
function buildSystemField(msg: string): string | SystemBlock[] {
  if (!isBasketball(msg)) return GENERIC_PROMPT;

  const parts: SystemPromptParts = buildIntelligenceSystemPrompt(msg);
  const blocks: SystemBlock[] = [
    { type: 'text', text: parts.staticContent, cache_control: { type: 'ephemeral' } },
  ];
  if (parts.dynamicContent) {
    blocks.push({ type: 'text', text: parts.dynamicContent });
  }
  return blocks;
}

// ── XHR Streaming ─────────────────────────────────────────────────────────────

function sseXhr(
  headers: Record<string, string>,
  bodyStr: string,
  onDelta:  (text: string) => void,
  onDone:   (result: StreamResult) => void,
  onError:  (err: Error) => void,
): XMLHttpRequest {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', API_URL);
  Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

  let processedLen = 0;
  let buf          = '';
  let stopReason   = 'end_turn';

  // Track active content blocks by SSE index (text + tool_use)
  const blockBuf: Record<number, {
    type: string; id: string; name: string; text: string; json: string;
  }> = {};

  const flush = () => {
    const chunk = xhr.responseText.slice(processedLen);
    if (!chunk) return;
    processedLen = xhr.responseText.length;

    buf += chunk;
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const evt = JSON.parse(raw);

        if (evt.type === 'content_block_start') {
          const cb = evt.content_block ?? {};
          blockBuf[evt.index] = { type: cb.type ?? 'text', id: cb.id ?? '', name: cb.name ?? '', text: '', json: '' };

        } else if (evt.type === 'content_block_delta') {
          const block = blockBuf[evt.index];
          if (!block) continue;
          if (evt.delta?.type === 'text_delta') {
            block.text += evt.delta.text ?? '';
            onDelta(evt.delta.text as string);
          } else if (evt.delta?.type === 'input_json_delta') {
            block.json += evt.delta.partial_json ?? '';
          }

        } else if (evt.type === 'message_delta') {
          if (evt.delta?.stop_reason) stopReason = evt.delta.stop_reason;
        }

      } catch { /* malformed SSE line — skip */ }
    }
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
      console.log('[Nexus] status:', xhr.status);
      if (xhr.status >= 400) return;
    }
    if (xhr.readyState === XMLHttpRequest.LOADING) flush();
    if (xhr.readyState === XMLHttpRequest.DONE) {
      flush();
      if (xhr.status >= 400) {
        console.error('[Nexus] API error:', xhr.status, xhr.responseText.slice(0, 300));
        onError(new Error(`${xhr.status} — ${xhr.responseText.slice(0, 200)}`));
      } else {
        const blocks: ContentBlock[] = Object.values(blockBuf).map(b => {
          if (b.type === 'tool_use') {
            try {
              return { type: 'tool_use' as const, id: b.id, name: b.name, input: JSON.parse(b.json || '{}') };
            } catch {
              return { type: 'tool_use' as const, id: b.id, name: b.name, input: {} };
            }
          }
          return { type: 'text' as const, text: b.text };
        });
        onDone({ stopReason, blocks });
      }
    }
  };

  xhr.onerror = () => onError(new Error('Network error'));
  xhr.send(bodyStr);
  return xhr;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NexusScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const S      = useMemo(() => makeStyles(C), [C]);

  // Chat state
  const [text,            setText]          = useState('');
  const [messages,        setMessages]      = useState<Message[]>([]);
  const [isStreaming,     setIsStreaming]    = useState(false);
  const [addSheetOpen,    setAddSheetOpen]  = useState(false);
  const [activeArtifact,  setActiveArtifact] = useState<Artifact | null>(null);
  const [artifactOpen,    setArtifactOpen]  = useState(false);

  // Sidebar + persistence state
  const [isSidebarOpen,   setIsSidebarOpen]   = useState(false);
  const [currentChatId,   _setCurrentChatId]  = useState<string | null>(null);
  const [chatIndex,       setChatIndex]        = useState<NexusChatMeta[]>([]);
  const [projects,        setProjects]         = useState<NexusProject[]>([]);
  const [activeProjectId, setActiveProjectId]  = useState<string | null>(null);

  // Refs
  const scrollRef         = useRef<ScrollView>(null);
  const abortRef          = useRef(false);
  const xhrRef            = useRef<XMLHttpRequest | null>(null);
  const handleSendRef     = useRef<((overrideText?: string) => void) | null>(null);
  const currentChatIdRef  = useRef<string | null>(null);
  const messagesRef       = useRef<Message[]>([]);
  const chatIndexRef      = useRef<NexusChatMeta[]>([]);
  const prevIsStreamingRef = useRef(false);

  // Keep refs in sync with state (no useEffect needed — runs before commit)
  messagesRef.current  = messages;
  chatIndexRef.current = chatIndex;

  // Wrapper that updates both ref and state
  const setCurrentChatId = useCallback((id: string | null) => {
    currentChatIdRef.current = id;
    _setCurrentChatId(id);
  }, []);

  const hasMessages = messages.length > 0;
  const canSend     = text.trim().length > 0 && !isStreaming;

  // ── Load chats + projects on mount ──────────────────────────────────────────

  useEffect(() => {
    Promise.all([loadAllChats(), loadAllProjects()]).then(([chats, projs]) => {
      setChatIndex(chats);
      chatIndexRef.current = chats;
      setProjects(projs);
    });
  }, []);

  // ── Auto-save after streaming completes ─────────────────────────────────────

  useEffect(() => {
    if (prevIsStreamingRef.current && !isStreaming) {
      const chatId = currentChatIdRef.current;
      if (chatId && messagesRef.current.length > 0) {
        const saveMsgs: StoredMessage[] = messagesRef.current
          .filter(m => m.raw.length > 0 && !m.streaming)
          .map(m => ({
            id:        m.id,
            role:      m.isMe ? 'user' as const : 'assistant' as const,
            content:   m.raw,
            timestamp: new Date().toISOString(),
          }));

        const firstUserMsg  = messagesRef.current.find(m => m.isMe)?.raw ?? 'Chat';
        const existingMeta  = chatIndexRef.current.find(c => c.id === chatId);

        const chat: NexusChat = {
          id:        chatId,
          title:     existingMeta?.title ?? generateChatTitle(firstUserMsg),
          messages:  saveMsgs,
          createdAt: existingMeta?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveChat(chat).then(() => {
          loadAllChats().then(chats => {
            setChatIndex(chats);
            chatIndexRef.current = chats;
          });
        });
      }
    }
    prevIsStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // ── Focus effect: abort on blur, consume pending eval on focus ───────────────

  useFocusEffect(
    useCallback(() => {
      abortRef.current = false;
      const pending = consumePendingEvalQuery();
      if (pending) {
        const t = setTimeout(() => handleSendRef.current?.(pending), 80);
        return () => {
          clearTimeout(t);
          abortRef.current = true;
          xhrRef.current?.abort();
          xhrRef.current = null;
        };
      }
      return () => {
        abortRef.current = true;
        xhrRef.current?.abort();
        xhrRef.current = null;
      };
    }, [])
  );

  const scrollToEnd = (animated = false) =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 60);

  // ── Stop streaming ───────────────────────────────────────────────────────────

  const handleStop = () => {
    abortRef.current = true;
    xhrRef.current?.abort();
    xhrRef.current = null;
    setIsStreaming(false);
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ── Send ─────────────────────────────────────────────────────────────────────

  const handleSend = async (overrideText?: string) => {
    const userText = (overrideText ?? text).trim();
    if (!userText || isStreaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Initialize chat ID on first message of a new conversation
    if (!currentChatIdRef.current) {
      const newId = generateChatId();
      currentChatIdRef.current = newId;
      _setCurrentChatId(newId);
    }

    const assistantId = `a_${Date.now()}`;
    abortRef.current  = false;

    const historyLimit = isBasketball(userText) ? 6 : MAX_HISTORY;
    const history: ApiMessage[] = messages
      .filter(m => m.raw.length > 0 && !m.streaming)
      .slice(-historyLimit)
      .map(m => ({ role: m.isMe ? 'user' : 'assistant', content: m.raw }));
    history.push({ role: 'user', content: userText });

    setText('');
    setIsStreaming(true);
    setMessages(prev => [
      ...prev,
      { id: `u_${Date.now()}`, raw: userText, segments: [{ type: 'text', text: userText }], isMe: true },
      { id: assistantId,       raw: '',        segments: [],                                  isMe: false, streaming: true },
    ]);
    scrollToEnd(true);

    const systemField = buildSystemField(userText);
    const tier: ModelTier = isBasketball(userText) ? 'BASKETBALL' : 'GENERAL';
    const model = MODELS[tier];

    console.log('[Nexus] tier:', tier, '| model:', model);

    let accumulated = '';

    // Tool-aware streaming loop — handles multi-step tool chains (max 5 iterations)
    const streamLoop = (apiMessages: ApiMessage[], iters = 5) => {
      const toolsForTier =
        tier === 'BASKETBALL'
          ? [...POOL_TOOLS, ...CORPUS_TOOLS, ...APP_DATA_TOOLS]
          : APP_DATA_TOOLS;

      const bodyObj = {
        model,
        system:     systemField,
        messages:   apiMessages,
        tools:      toolsForTier,
        max_tokens: MAX_TOKENS,
        stream:     true,
      };
      const bodyStr = JSON.stringify(bodyObj);

      xhrRef.current = sseXhr(
        {
          'Content-Type':      'application/json',
          'x-api-key':         process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'anthropic-beta':    'prompt-caching-2024-07-31',
        },
        bodyStr,
        (delta) => {
          if (abortRef.current) return;
          accumulated += delta;
          const clean = sanitizeResponse(accumulated);
          setMessages(prev => prev.map(m =>
            m.id === assistantId
              ? { ...m, raw: clean, segments: parseMessage(clean) }
              : m
          ));
          scrollToEnd();
        },
        ({ stopReason, blocks }) => {
          xhrRef.current = null;
          console.log('[Nexus] stream done | stopReason:', stopReason, '| blocks:', blocks.map(b => b.type + (b.type === 'tool_use' ? ':' + (b as any).name : '')));

          // Execute all local tool calls, batch their results, re-enter the loop
          if (stopReason === 'tool_use' && !abortRef.current && iters > 0) {
            const localTools = blocks.filter(
              b => b.type === 'tool_use' && (b as any).name !== 'web_search'
            ) as Array<ContentBlock & { type: 'tool_use' }>;

            if (localTools.length > 0) {
              const toolResults = localTools.map(tb => {
                console.log('[Nexus] tool:', tb.name, JSON.stringify(tb.input));
                return {
                  type:        'tool_result' as const,
                  tool_use_id: tb.id,
                  content:     dispatchTool(tb.name, tb.input),
                };
              });
              streamLoop([
                ...apiMessages,
                { role: 'assistant', content: blocks },
                { role: 'user',      content: toolResults },
              ], iters - 1);
              return;
            }
          }

          // Normal completion (end_turn, or web_search handled server-side)
          const clean        = sanitizeResponse(accumulated);
          const finalSegments = parseMessage(clean);
          setMessages(prev => prev.map(m =>
            m.id === assistantId
              ? { ...m, raw: clean, segments: finalSegments, streaming: false }
              : m
          ));
          setIsStreaming(false);
          scrollToEnd(true);
        },
        (err) => {
          console.error('[Nexus] stream error:', err.message);
          const msg = `Sorry, something went wrong — ${err.message}. Please try again.`;
          setMessages(prev => prev.map(m =>
            m.id === assistantId
              ? { ...m, raw: msg, segments: [{ type: 'text', text: msg }], streaming: false }
              : m
          ));
          setIsStreaming(false);
          xhrRef.current = null;
        },
      );
    };

    streamLoop(history);
  };

  handleSendRef.current = handleSend;

  // ── New Chat ─────────────────────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    abortRef.current = true;
    xhrRef.current?.abort();
    xhrRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentChatId(null);
    setMessages([]);
    setText('');
    setIsStreaming(false);
    setIsSidebarOpen(false);
    setTimeout(() => { abortRef.current = false; }, 100);
  }, [setCurrentChatId]);

  // ── Select chat from sidebar ─────────────────────────────────────────────────

  const handleSelectChat = useCallback(async (chatId: string) => {
    const chat = await loadChat(chatId);
    if (!chat) return;

    const loadedMessages: Message[] = chat.messages.map(m => ({
      id:       m.id,
      raw:      m.content,
      segments: parseMessage(m.content),
      isMe:     m.role === 'user',
    }));

    setCurrentChatId(chatId);
    setMessages(loadedMessages);
    scrollToEnd(false);
  }, [setCurrentChatId]);

  // ── Delete chat ──────────────────────────────────────────────────────────────

  const handleDeleteChat = useCallback(async (chatId: string) => {
    await deleteChat(chatId);
    if (currentChatIdRef.current === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
    const updated = await loadAllChats();
    setChatIndex(updated);
    chatIndexRef.current = updated;
  }, [setCurrentChatId]);

  // ── Star chat ────────────────────────────────────────────────────────────────

  const handleStarChat = useCallback(async (chatId: string) => {
    await toggleStarChat(chatId);
    const updated = await loadAllChats();
    setChatIndex(updated);
    chatIndexRef.current = updated;
  }, []);

  // ── Rename chat ──────────────────────────────────────────────────────────────

  const handleRenameChat = useCallback(async (chatId: string, newTitle: string) => {
    await renameChat(chatId, newTitle);
    const updated = await loadAllChats();
    setChatIndex(updated);
    chatIndexRef.current = updated;
  }, []);

  // ── Projects ─────────────────────────────────────────────────────────────────

  const handleSelectProject = useCallback((projectId: string | null) => {
    setActiveProjectId(projectId);
  }, []);

  const handleCreateProject = useCallback(async (name: string) => {
    const project: NexusProject = {
      id:        `proj_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveProject(project);
    const updated = await loadAllProjects();
    setProjects(updated);
  }, []);

  // ── Artifact open ─────────────────────────────────────────────────────────────

  const openArtifact = (a: Artifact) => {
    setActiveArtifact(a);
    setArtifactOpen(true);
  };

  // ── Render message bubble ────────────────────────────────────────────────────

  const renderMessage = (m: Message) => {
    const isUser = m.isMe;

    return (
      <View key={m.id} style={[S.bubbleRow, isUser ? S.bubbleRowRight : S.bubbleRowLeft]}>
        {!isUser && (
          <View style={[S.avatar, { backgroundColor: C.accent }]}>
            <IconSymbol name="sparkles" size={12} color="#fff" />
          </View>
        )}

        <View style={[S.bubbleOuter, isUser && { alignItems: 'flex-end' }]}>
          <View style={[
            S.bubble,
            isUser
              ? [S.bubbleUser,   { backgroundColor: C.accent }]
              : [S.bubbleAssist, { backgroundColor: C.surface }],
          ]}>
            {m.streaming && m.raw === '' ? (
              <ActivityIndicator size="small" color={C.secondary} style={{ marginVertical: 2, marginHorizontal: 4 }} />
            ) : isUser ? (
              <Text style={[S.userText]}>{m.raw}</Text>
            ) : (
              m.segments.map((seg, idx) => {
                if (seg.type === 'text' && seg.text) {
                  return (
                    <View key={idx}>
                      <MarkdownBlock text={seg.text} C={C} />
                    </View>
                  );
                }
                if (seg.type === 'artifact' && seg.artifact) {
                  return (
                    <NexusArtifactBlock
                      key={idx}
                      artifact={seg.artifact}
                      onExpand={openArtifact}
                    />
                  );
                }
                return null;
              })
            )}

            {m.streaming && m.raw.length > 0 && (
              <Text style={[S.cursor, { color: C.accent }]}>▋</Text>
            )}
          </View>

          {/* Action bar — completed assistant messages only */}
          {!isUser && !m.streaming && m.raw.length > 0 && (
            <MessageActionBar
              message={m}
              allMessages={messages}
              onRetry={handleSendRef.current!}
              C={C}
            />
          )}
        </View>
      </View>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  // Footer is position:absolute at bottom — offset root so content never slides under it
  const footerOffset = 49 + insets.bottom;
  // keyboardVerticalOffset = distance from top of screen to top of KAV
  const kbOffset = insets.top + 52;

  return (
    <View style={[S.root, { backgroundColor: C.bg, paddingBottom: footerOffset }]}>

      {/* Top bar */}
      <View style={{ paddingTop: insets.top }}>
        <NexusPageTopBar
          view={hasMessages ? 'chat' : 'home'}
          showNewChat={hasMessages}
          onHamburger={() => setIsSidebarOpen(true)}
          onNewChat={handleNewChat}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={kbOffset}
      >
        {/* Welcome state — shown when no messages */}
        {!hasMessages && (
          <NexusWelcome onSend={handleSend} />
        )}

        {/* Message list */}
        {hasMessages && (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={S.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            {messages.map(renderMessage)}
          </ScrollView>
        )}

        {/* Input bar */}
        <View style={[S.inputBar, { paddingBottom: 8 }]}>
          <Pressable
            style={[S.plusBtn, { backgroundColor: C.secondary + '22' }]}
            hitSlop={8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSheetOpen(true); }}
          >
            <IconSymbol name="plus" size={19} color={C.secondary} />
          </Pressable>

          <View style={[S.inputStrip, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
            <TextInput
              style={[S.textInput, { color: C.label }]}
              placeholder="Message Nexus"
              placeholderTextColor={C.muted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={4000}
              editable={!isStreaming}
              autoCapitalize="sentences"
            />

            {isStreaming ? (
              <Pressable style={[S.actionBtn, { backgroundColor: C.label }]} onPress={handleStop}>
                <View style={S.stopSquare} />
              </Pressable>
            ) : (
              <Pressable
                style={[S.actionBtn, { backgroundColor: canSend ? C.label : C.secondary + '44' }]}
                onPress={() => handleSend()}
                disabled={!canSend}
              >
                <IconSymbol name="arrow.up" size={16} color={canSend ? C.bg : C.secondary} />
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Add to Chat sheet */}
      <BottomSheet
        visible={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        useModal
        backgroundColor={C.bg}
        title="Add to Chat"
      >
        <View style={S.sheetContent}>
          <View style={S.tileRow}>
            {([
              { icon: 'camera.fill', label: 'Camera'  },
              { icon: 'photo.fill',  label: 'Photos'  },
              { icon: 'doc.fill',    label: 'Files'   },
            ] as const).map(({ icon, label }) => (
              <Pressable
                key={label}
                style={S.tileWrap}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSheetOpen(false); }}
              >
                <GlassView tier={1} style={S.tile}>
                  <IconSymbol name={icon as any} size={26} color={C.label} />
                  <Text style={[S.tileLabel, { color: C.label }]}>{label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </View>
          <View style={[S.comingSection, { borderTopColor: C.separator }]}>
            {([
              { icon: 'globe',                    label: 'Web Search'    },
              { icon: 'doc.text.magnifyingglass', label: 'Research'      },
              { icon: 'folder.fill',              label: 'Projects'      },
              { icon: 'building.2.fill',          label: 'Brand Context' },
              { icon: 'bolt.horizontal.fill',     label: 'Connectors'    },
            ] as const).map(({ icon, label }, i) => (
              <View key={label}>
                {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 54 }} />}
                <View style={S.comingRow}>
                  <View style={[S.comingIconWrap, { backgroundColor: C.surfacePressed }]}>
                    <IconSymbol name={icon as any} size={17} color={C.muted} />
                  </View>
                  <Text style={[S.comingLabel, { color: C.muted }]}>{label}</Text>
                  <View style={[S.soonBadge, { backgroundColor: C.surfacePressed }]}>
                    <Text style={[S.soonText, { color: C.muted }]}>Soon</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </BottomSheet>

      {/* Artifact viewer */}
      <ArtifactSheet
        artifact={activeArtifact}
        visible={artifactOpen}
        onClose={() => setArtifactOpen(false)}
      />

      {/* Sidebar overlay */}
      <NexusSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chatIndex}
        projects={projects}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onStarChat={handleStarChat}
        onNewChat={handleNewChat}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onOpenArtifact={(artifact: NexusArtifact) => openArtifact({
          id:       artifact.id,
          language: artifact.language ?? 'text',
          title:    artifact.title,
          content:  artifact.content,
        })}
        activeProjectId={activeProjectId}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    root: { flex: 1 },

    // Messages
    messageList:    { flexGrow: 1, paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },
    bubbleRow:      { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    bubbleRowLeft:  { justifyContent: 'flex-start' },
    bubbleRowRight: { justifyContent: 'flex-end', flexDirection: 'row-reverse' },
    bubbleOuter:    { flex: 1, maxWidth: '88%' },

    avatar: {
      width: 26, height: 26, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center',
      marginTop: 2, flexShrink: 0,
    },
    bubble:       { borderRadius: 18, padding: 12, minWidth: 40 },
    bubbleUser:   { borderBottomRightRadius: 4 },
    bubbleAssist: { borderBottomLeftRadius: 4 },
    userText:     { fontSize: 16, lineHeight: 23, color: '#fff' },
    cursor:       { fontSize: 14 },

    // Markdown
    mdH1:        { fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 4 },
    mdH2:        { fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 3 },
    mdH3:        { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 2 },
    mdBody:      { fontSize: 15, lineHeight: 23, marginBottom: 1 },
    mdBulletRow: { flexDirection: 'row', gap: 8, marginBottom: 3 },
    mdBulletDot: { fontSize: 15, lineHeight: 23, width: 14 },
    mdRule:      { height: StyleSheet.hairlineWidth, marginVertical: 10 },
    mdInlineCode:{ borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

    // Input
    inputBar:    { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 10, paddingTop: 8, gap: 8 },
    plusBtn:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 1 },
    inputStrip:  { flex: 1, flexDirection: 'row', alignItems: 'flex-end', borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
    textInput:   { flex: 1, fontSize: 16, lineHeight: 22, maxHeight: 120, paddingVertical: 0 },
    actionBtn:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 1 },
    stopSquare:  { width: 12, height: 12, borderRadius: 2, backgroundColor: '#fff' },

    // Add to Chat sheet
    sheetContent:   { paddingHorizontal: 16, paddingBottom: 32 },
    tileRow:        { flexDirection: 'row', gap: 12, marginBottom: 20 },
    tileWrap:       { flex: 1 },
    tile:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, borderRadius: 16 },
    tileLabel:      { fontSize: 13, fontWeight: '500' },
    comingSection:  { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4 },
    comingRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
    comingIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    comingLabel:    { flex: 1, fontSize: 15 },
    soonBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    soonText:       { fontSize: 11, fontWeight: '600' },
  });
