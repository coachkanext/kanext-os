/**
 * Inline Stat Table — compact table rendered inside a Nexus chat message.
 * Shows: title, headers, rows in a dark card.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StatTablePayload } from '@/types/nexus-v2';

interface Props {
  data: StatTablePayload;
}

export function InlineStatTable({ data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {data.title && (
        <Text style={[styles.title, { color: colors.textTertiary }]}>{data.title}</Text>
      )}
      {/* Header row */}
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        {data.headers.map((h, i) => (
          <Text
            key={`h-${i}`}
            style={[styles.headerCell, { color: colors.textTertiary, flex: i === 0 ? 2 : 1 }]}
            numberOfLines={1}
          >
            {h}
          </Text>
        ))}
      </View>
      {/* Data rows */}
      {data.rows.map((row, ri) => (
        <View
          key={`r-${ri}`}
          style={[styles.dataRow, ri < data.rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
        >
          {row.map((cell, ci) => (
            <Text
              key={`c-${ri}-${ci}`}
              style={[styles.dataCell, { color: colors.text, flex: ci === 0 ? 2 : 1 }]}
              numberOfLines={1}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    marginVertical: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  dataCell: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
