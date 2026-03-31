/**
 * Film/Recruiting Toggle — segmented control in the header area.
 * Switches between Film and Recruiting mode for video content.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import type { VideoMode } from '@/components/media/content-tab-row';

interface FilmRecruitingToggleProps {
  mode: VideoMode;
  onModeChange: (mode: VideoMode) => void;
}

export function FilmRecruitingToggle({ mode, onModeChange }: FilmRecruitingToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.segment, mode === 'film' && styles.activeSegment]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onModeChange('film');
        }}
      >
        <ThemedText style={[styles.label, mode === 'film' && styles.activeLabel]}>
          Film
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.segment, mode === 'recruiting' && styles.activeSegment]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onModeChange('recruiting');
        }}
      >
        <ThemedText style={[styles.label, mode === 'recruiting' && styles.activeLabel]}>
          Recruiting
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#0B0F14',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C9790',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
