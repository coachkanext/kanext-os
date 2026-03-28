/**
 * ArtifactSheet — full-screen bottom sheet viewer for code/document artifacts.
 * Opens when the user taps an artifact card in the Nexus chat.
 */

import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Artifact {
  id:        string;
  language:  string;   // raw language tag from code fence, e.g. "typescript"
  title:     string;   // inferred title
  content:   string;   // the code/text
}

// ── Language metadata ─────────────────────────────────────────────────────────

const LANG_DISPLAY: Record<string, string> = {
  typescript: 'TypeScript', ts: 'TypeScript', tsx: 'TSX',
  javascript: 'JavaScript', js: 'JavaScript', jsx: 'JSX',
  python: 'Python', py: 'Python',
  json: 'JSON',
  sql: 'SQL',
  bash: 'Bash', shell: 'Shell', sh: 'Shell',
  swift: 'Swift',
  rust: 'Rust',
  go: 'Go',
  html: 'HTML',
  css: 'CSS',
  markdown: 'Markdown', md: 'Markdown',
  text: 'Text',
};

function langDisplay(raw: string): string {
  return LANG_DISPLAY[raw.toLowerCase()] ?? (raw.toUpperCase() || 'Code');
}

function langIcon(raw: string): string {
  const l = raw.toLowerCase();
  if (['typescript', 'tsx', 'javascript', 'jsx', 'ts', 'js'].includes(l)) return 'chevron.left.forwardslash.chevron.right';
  if (['python', 'py'].includes(l)) return 'chevron.left.forwardslash.chevron.right';
  if (l === 'sql') return 'tablecells';
  if (['bash', 'shell', 'sh'].includes(l)) return 'terminal';
  if (l === 'json') return 'curlybraces';
  if (['html', 'css'].includes(l)) return 'globe';
  if (['markdown', 'md'].includes(l)) return 'doc.text';
  return 'doc.text';
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ArtifactSheetProps {
  artifact:  Artifact | null;
  visible:   boolean;
  onClose:   () => void;
}

export function ArtifactSheet({ artifact, visible, onClose }: ArtifactSheetProps) {
  const C  = useColors();
  const S  = useMemo(() => makeStyles(C), [C]);

  if (!artifact) return null;

  const lineCount = artifact.content.split('\n').length;
  const display   = langDisplay(artifact.language);
  const icon      = langIcon(artifact.language);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      useModal
      backgroundColor={C.bg}
      title={artifact.title || display}
    >
      <View style={S.root}>
        {/* Meta bar */}
        <View style={[S.metaBar, { borderBottomColor: C.separator }]}>
          <View style={[S.langBadge, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name={icon as any} size={13} color={C.secondary} />
            <Text style={[S.langText, { color: C.secondary }]}>{display}</Text>
          </View>
          <Text style={[S.lineCount, { color: C.muted }]}>{lineCount} line{lineCount !== 1 ? 's' : ''}</Text>
          <Pressable
            style={[S.copyBtn, { backgroundColor: C.surfacePressed }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="doc.on.doc" size={14} color={C.secondary} />
            <Text style={[S.copyText, { color: C.secondary }]}>Copy</Text>
          </Pressable>
        </View>

        {/* Code content */}
        <ScrollView
          style={S.scrollView}
          contentContainerStyle={S.codeContent}
          horizontal={false}
          showsVerticalScrollIndicator
          bounces={false}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <Text style={[S.codeText, { color: C.label }]} selectable>
              {artifact.content}
            </Text>
          </ScrollView>
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

// ── Inline artifact card (used inside message bubble) ─────────────────────────

interface ArtifactCardProps {
  artifact: Artifact;
  onPress:  (a: Artifact) => void;
}

export function ArtifactCard({ artifact, onPress }: ArtifactCardProps) {
  const C       = useColors();
  const S       = useMemo(() => makeStyles(C), [C]);
  const display = langDisplay(artifact.language);
  const icon    = langIcon(artifact.language);
  const preview = artifact.content.split('\n')[0].slice(0, 60);
  const lines   = artifact.content.split('\n').length;

  return (
    <Pressable
      style={({ pressed }) => [
        S.card,
        { backgroundColor: C.surface, borderColor: C.separator, opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(artifact);
      }}
    >
      <View style={S.cardLeft}>
        <View style={[S.cardIconWrap, { backgroundColor: C.surfacePressed }]}>
          <IconSymbol name={icon as any} size={16} color={C.accent} />
        </View>
        <View style={S.cardBody}>
          <View style={S.cardTitleRow}>
            <Text style={[S.cardTitle, { color: C.label }]} numberOfLines={1}>
              {artifact.title || display}
            </Text>
            <Text style={[S.cardMeta, { color: C.muted }]}>{display} · {lines}L</Text>
          </View>
          <Text style={[S.cardPreview, { color: C.secondary }]} numberOfLines={1}>
            {preview}
          </Text>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    // Sheet contents
    root:        { flex: 1 },
    metaBar:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    langBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    langText:    { fontSize: 12, fontWeight: '600' },
    lineCount:   { flex: 1, fontSize: 12 },
    copyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    copyText:    { fontSize: 12, fontWeight: '500' },
    scrollView:  { flex: 1 },
    codeContent: { padding: 16, paddingBottom: 40 },
    codeText:    { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 20 },

    // Artifact card
    card:        { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginTop: 8, gap: 8 },
    cardLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardIconWrap:{ width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cardBody:    { flex: 1 },
    cardTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    cardTitle:   { fontSize: 14, fontWeight: '600', flexShrink: 1 },
    cardMeta:    { fontSize: 11 },
    cardPreview: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  });

