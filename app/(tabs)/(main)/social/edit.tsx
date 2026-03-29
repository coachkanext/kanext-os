/**
 * Social Edit Screen — Post / Story / Reel
 * Reached after capture in create.tsx.
 * tab param: 'post' | 'story' | 'reel'
 *
 * Post:  Filter strip + Adjust sliders (brightness, contrast, saturation)
 * Story: Text / Sticker / Draw / Link tools
 * Reel:  Timeline strip + Audio track + Trim handles
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, Animated, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Types ────────────────────────────────────────────────────────────────────

type EditTab = 'post' | 'story' | 'reel';

// ── Post filters ─────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'normal',   label: 'Normal',   tint: 'transparent' },
  { id: 'vivid',    label: 'Vivid',    tint: 'rgba(255,120,0,0.15)' },
  { id: 'warm',     label: 'Warm',     tint: 'rgba(255,200,80,0.18)' },
  { id: 'cool',     label: 'Cool',     tint: 'rgba(80,140,255,0.18)' },
  { id: 'fade',     label: 'Fade',     tint: 'rgba(200,200,200,0.22)' },
  { id: 'bw',       label: 'B&W',      tint: 'rgba(0,0,0,0.35)' },
  { id: 'chrome',   label: 'Chrome',   tint: 'rgba(180,220,255,0.20)' },
  { id: 'moody',    label: 'Moody',    tint: 'rgba(40,0,60,0.25)' },
];

// ── Slider row ───────────────────────────────────────────────────────────────

function SliderRow({
  label, value, onChange, C,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  C: ComponentColors;
}) {
  const { width } = useWindowDimensions();
  const TRACK_W = width - 80;
  const pan = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      startX.current = e.nativeEvent.locationX;
    },
    onPanResponderMove: (_, gs) => {
      const newVal = Math.max(0, Math.min(1, value + gs.dx / TRACK_W));
      onChange(newVal);
    },
  }), [value, onChange, TRACK_W]);

  return (
    <View style={slStyles.sliderRow}>
      <Text style={[slStyles.sliderLabel, { color: 'rgba(255,255,255,0.6)' }]}>{label}</Text>
      <View style={[slStyles.track, { width: TRACK_W }]} {...panResponder.panHandlers}>
        <View style={[slStyles.fill, { width: `${value * 100}%` }]} />
        <View style={[slStyles.thumb, { left: `${value * 100}%` as any }]} />
      </View>
      <Text style={[slStyles.sliderVal, { color: 'rgba(255,255,255,0.6)' }]}>
        {Math.round(value * 100)}
      </Text>
    </View>
  );
}

const slStyles = StyleSheet.create({
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  sliderLabel: { width: 80, fontSize: 13, fontWeight: '500' },
  sliderVal:   { width: 32, fontSize: 12, textAlign: 'right' },
  track: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    marginLeft: -9,
    top: -7.5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

// ── Post edit panel ──────────────────────────────────────────────────────────

function PostEditPanel({ C }: { C: ComponentColors }) {
  const [activeFilter, setActiveFilter] = useState('normal');
  const [showAdjust, setShowAdjust] = useState(false);
  const [brightness, setBrightness] = useState(0.5);
  const [contrast, setContrast]     = useState(0.5);
  const [saturation, setSaturation] = useState(0.5);

  return (
    <View style={peStyles.panel}>
      {/* Filter / Adjust toggle */}
      <View style={peStyles.tabRow}>
        <Pressable
          style={[peStyles.tabBtn, !showAdjust && peStyles.tabBtnActive]}
          onPress={() => setShowAdjust(false)}
        >
          <Text style={[peStyles.tabLabel, !showAdjust && peStyles.tabLabelActive]}>Filter</Text>
        </Pressable>
        <Pressable
          style={[peStyles.tabBtn, showAdjust && peStyles.tabBtnActive]}
          onPress={() => setShowAdjust(true)}
        >
          <Text style={[peStyles.tabLabel, showAdjust && peStyles.tabLabelActive]}>Adjust</Text>
        </Pressable>
      </View>

      {!showAdjust ? (
        /* Filter strip */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={peStyles.filterStrip}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.id}
              style={peStyles.filterItem}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(f.id);
              }}
            >
              <View style={[peStyles.filterThumb, activeFilter === f.id && peStyles.filterThumbActive]}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#333', borderRadius: 8 }]} />
                {f.tint !== 'transparent' && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: f.tint, borderRadius: 8 }]} />
                )}
              </View>
              <Text style={[peStyles.filterLabel, activeFilter === f.id && { color: '#fff' }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        /* Adjust sliders */
        <View style={peStyles.adjustPanel}>
          <SliderRow label="Brightness" value={brightness} onChange={setBrightness} C={C} />
          <SliderRow label="Contrast"   value={contrast}   onChange={setContrast}   C={C} />
          <SliderRow label="Saturation" value={saturation} onChange={setSaturation} C={C} />
        </View>
      )}
    </View>
  );
}

const peStyles = StyleSheet.create({
  panel: { paddingBottom: 8 },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 12,
  },
  tabBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive:   { borderBottomColor: '#fff' },
  tabLabel:       { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.45)' },
  tabLabelActive: { color: '#fff' },
  filterStrip:    { paddingHorizontal: 16, gap: 12 },
  filterItem:     { alignItems: 'center', gap: 6 },
  filterThumb: {
    width: 64, height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterThumbActive: { borderColor: '#fff' },
  filterLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  adjustPanel: { paddingHorizontal: 20 },
});

// ── Story edit panel ─────────────────────────────────────────────────────────

function StoryEditPanel({ C }: { C: ComponentColors }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: 'text',    icon: 'textformat', label: 'Text' },
    { id: 'sticker', icon: 'face.smiling', label: 'Sticker' },
    { id: 'draw',    icon: 'pencil.tip', label: 'Draw' },
    { id: 'link',    icon: 'link', label: 'Link' },
    { id: 'music',   icon: 'music.note', label: 'Music' },
    { id: 'poll',    icon: 'chart.bar', label: 'Poll' },
  ] as const;

  return (
    <View style={seStyles.panel}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={seStyles.toolStrip}
      >
        {tools.map((t) => (
          <Pressable
            key={t.id}
            style={[seStyles.toolItem, activeTool === t.id && seStyles.toolItemActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTool(t.id === activeTool ? null : t.id);
            }}
          >
            <IconSymbol
              name={t.icon as any}
              size={22}
              color={activeTool === t.id ? '#000' : '#fff'}
            />
            <Text style={[seStyles.toolLabel, activeTool === t.id && { color: '#000' }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeTool === 'draw' && (
        <View style={seStyles.drawHint}>
          <Text style={seStyles.drawHintText}>Draw on your story above</Text>
          <View style={seStyles.colorRow}>
            {['#fff', '#ff3b30', '#ff9500', '#34c759', '#007aff', '#af52de', '#000'].map((col) => (
              <Pressable
                key={col}
                style={[seStyles.colorDot, { backgroundColor: col }]}
                onPress={() => Haptics.selectionAsync()}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const seStyles = StyleSheet.create({
  panel:         { paddingBottom: 8 },
  toolStrip:     { paddingHorizontal: 16, gap: 10, paddingVertical: 8 },
  toolItem: {
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toolItemActive: { backgroundColor: '#fff' },
  toolLabel:      { fontSize: 11, color: '#fff', fontWeight: '600' },
  drawHint: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  drawHintText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  colorRow:     { flexDirection: 'row', gap: 10 },
  colorDot:     { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
});

// ── Reel edit panel ──────────────────────────────────────────────────────────

function ReelEditPanel({ C }: { C: ComponentColors }) {
  const [activeClip, setActiveClip] = useState(0);
  const clips = [0, 1, 2, 3, 4]; // mock timeline segments

  return (
    <View style={reStyles.panel}>
      {/* Timeline strip */}
      <Text style={reStyles.sectionLabel}>Timeline</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={reStyles.timeline}
      >
        {clips.map((c, i) => (
          <Pressable
            key={c}
            style={[reStyles.clip, activeClip === i && reStyles.clipActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveClip(i);
            }}
          >
            <View style={[reStyles.clipThumb, { backgroundColor: `hsl(${c * 40},40%,25%)` }]} />
            <Text style={reStyles.clipLabel}>{i + 1}s</Text>
          </Pressable>
        ))}
        {/* Add clip */}
        <Pressable style={reStyles.addClip} onPress={() => Haptics.selectionAsync()}>
          <IconSymbol name="plus.circle" size={20} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </ScrollView>

      {/* Audio track */}
      <Text style={[reStyles.sectionLabel, { marginTop: 16 }]}>Audio</Text>
      <View style={reStyles.audioRow}>
        <View style={reStyles.audioTrack}>
          <View style={reStyles.audioFill} />
          <View style={[reStyles.audioHandle, { left: 0 }]} />
          <View style={[reStyles.audioHandle, { right: 0, left: undefined }]} />
        </View>
        <Pressable style={reStyles.audioMute} onPress={() => Haptics.selectionAsync()}>
          <IconSymbol name="speaker.wave.2" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
    </View>
  );
}

const reStyles = StyleSheet.create({
  panel:       { paddingHorizontal: 16, paddingBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  timeline:    { gap: 8, paddingVertical: 4 },
  clip: {
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  clipActive:  { borderColor: '#fff' },
  clipThumb:   { width: 52, height: 52, borderRadius: 6 },
  clipLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  addClip: {
    width: 52, height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioTrack: {
    flex: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  audioFill: {
    position: 'absolute',
    left: '15%',
    right: '25%',
    top: 0, bottom: 0,
    backgroundColor: 'rgba(217,119,87,0.5)',
  },
  audioHandle: {
    position: 'absolute',
    width: 14, height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  audioMute: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SocialEditScreen() {
  const { tab = 'post' } = useLocalSearchParams<{ tab: string }>();
  const editTab = (tab as EditTab) ?? 'post';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Active tint filter (post only)
  const activeFilter = FILTERS[0];

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/(main)/social/publish',
      params: { tab },
    } as any);
  }, [router, tab]);

  const tabLabel = editTab === 'post' ? 'Edit Photo'
    : editTab === 'story' ? 'Edit Story'
    : 'Edit Reel';

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{tabLabel}</Text>
        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextLabel}>Next</Text>
          <IconSymbol name="chevron.right" size={16} color="#fff" />
        </Pressable>
      </View>

      {/* Media preview */}
      <View style={[styles.preview, { width: screenWidth, height: screenWidth }]}>
        {/* Mock preview — solid dark gradient */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A1A1A' }]} />
        {/* Simulated filter tint */}
        {activeFilter && activeFilter.tint !== 'transparent' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: activeFilter.tint }]} />
        )}

        {/* Story: overlay tool indicator */}
        {editTab === 'story' && (
          <View style={styles.storyCanvas}>
            <Text style={styles.storyPlaceholder}>Story preview</Text>
          </View>
        )}
        {/* Reel: play indicator */}
        {editTab === 'reel' && (
          <View style={styles.reelPlayRow}>
            <IconSymbol name="play.fill" size={36} color="rgba(255,255,255,0.5)" />
          </View>
        )}
      </View>

      {/* Bottom edit panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        {editTab === 'post'  && <PostEditPanel  C={C} />}
        {editTab === 'story' && <StoryEditPanel C={C} />}
        {editTab === 'reel'  && <ReelEditPanel  C={C} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40, height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  nextLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  preview: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyPlaceholder: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 16,
  },
  reelPlayRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 16,
  },
});
