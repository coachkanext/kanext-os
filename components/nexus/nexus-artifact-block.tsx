/**
 * NexusArtifactBlock — Inline code/JSON/SQL block rendered inside a message bubble.
 *
 * Renders up to 15 lines inline. Shows a "Copy" button.
 * Tapping "Expand" (or tapping the block when > 15 lines) opens the ArtifactSheet.
 */

import React, { useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Artifact } from '@/components/nexus/artifact-sheet';

const MAX_INLINE_LINES = 15;

// ── Language display ──────────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  typescript: 'TypeScript', ts: 'TypeScript', tsx: 'TSX',
  javascript: 'JavaScript', js: 'JavaScript',
  python: 'Python', py: 'Python',
  json: 'JSON',
  sql: 'SQL',
  bash: 'Bash', shell: 'Shell', sh: 'Shell',
  text: 'Text',
};

function langLabel(raw: string): string {
  return LANG_LABELS[raw.toLowerCase()] ?? (raw.toUpperCase() || 'Code');
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NexusArtifactBlockProps {
  artifact: Artifact;
  /** Called to open the full ArtifactSheet */
  onExpand: (artifact: Artifact) => void;
}

export function NexusArtifactBlock({ artifact, onExpand }: NexusArtifactBlockProps) {
  const C = useColors();
  const S = useMemo(() => makeStyles(C), [C]);

  const lines     = artifact.content.split('\n');
  const truncated = lines.length > MAX_INLINE_LINES;
  const visLines  = truncated ? lines.slice(0, MAX_INLINE_LINES) : lines;
  const display   = visLines.join('\n');
  const label     = langLabel(artifact.language);

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Clipboard: placeholder — copy support via expo-clipboard when available
  };

  return (
    <View style={[S.block, { backgroundColor: C.surfacePressed }]}>
      {/* Header row */}
      <View style={[S.header, { borderBottomColor: C.separator }]}>
        <Text style={[S.langLabel, { color: C.muted }]}>{label}</Text>
        <View style={S.actions}>
          <Pressable
            style={({ pressed }) => [S.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleCopy}
            hitSlop={8}
          >
            <IconSymbol name="doc.on.doc" size={13} color={C.secondary} />
            <Text style={[S.actionText, { color: C.secondary }]}>Copy</Text>
          </Pressable>
          {truncated && (
            <Pressable
              style={({ pressed }) => [S.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => onExpand(artifact)}
              hitSlop={8}
            >
              <IconSymbol name="arrow.up.left.and.arrow.down.right" size={13} color={C.accent} />
              <Text style={[S.actionText, { color: C.accent }]}>Expand</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Code text */}
      <Pressable onPress={truncated ? () => onExpand(artifact) : undefined}>
        <Text style={[S.code, { color: C.label }]} selectable>
          {display}
        </Text>
        {truncated && (
          <Text style={[S.moreHint, { color: C.muted }]}>
            +{lines.length - MAX_INLINE_LINES} more lines…
          </Text>
        )}
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    block: {
      borderRadius: 10,
      marginTop: 8,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    langLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '500',
    },
    code: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 12.5,
      lineHeight: 19,
      padding: 12,
    },
    moreHint: {
      fontSize: 12,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
  });
