/**
 * Social Creation Screen
 * Full-screen camera/creation UI — Post, Story, Reel tabs.
 * Mock camera viewfinder (no native camera module required).
 *
 * Layout layers (back → front):
 *   Viewfinder (mock dark bg, text mode bg, grid overlay, layout grid)
 *   Top bar (X / flash / settings)
 *   Left tools (Aa, Layout, Boomerang — tab-dependent)
 *   Bottom capture row (gallery / capture btn / flip)
 *   Bottom tab bar (POST / STORY / REEL)
 *
 * Effects, Timer, Speed, Music are all on the edit screen after capture.
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  View, Text, Pressable, StyleSheet, useWindowDimensions,
  TextInput, Animated, PanResponder, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ── Constants ────────────────────────────────────────────────────────────────

const CAPTURE_SIZE = 72;
const RING_SIZE = 92;
const MAX_REEL_SECONDS = 180;
const MAX_STORY_SECONDS = 60;
const TAB_BAR_HEIGHT = 52;
const TOOL_SIZE = 44;

const TEXT_BG_COLORS = [
  '#1A1A2E', '#2C2C2C', '#E94560', '#1A1714',
  '#533483', '#1A1714', '#1B4332', '#7D1D1D',
];
const TEXT_FONTS = [
  { label: 'Aa', weight: '400' as const, style: 'normal' as const },
  { label: 'Bb', weight: '700' as const, style: 'normal' as const },
  { label: 'Ci', weight: '400' as const, style: 'italic' as const },
  { label: 'Dm', weight: '600' as const, style: 'normal' as const },
];

type CreationTab = 'post' | 'story' | 'reel';
type FlashMode = 'auto' | 'on' | 'off';
type LeftTool = 'text' | 'layout' | 'boomerang' | null;

const TAB_ORDER: CreationTab[] = ['post', 'story', 'reel'];

// ── Recording progress ring ───────────────────────────────────────────────────
// Two-semicircle rotation technique: each half-circle is clipped to its side and
// rotated 0→180° around the ring's center using translate→rotate→translate.

function RecordingRing({ anim }: { anim: Animated.Value }) {
  const STROKE = 4;
  const r = RING_SIZE / 2;

  const rightRotate = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });
  const leftRotate = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, position: 'absolute' }}>
      <View style={{
        position: 'absolute', width: RING_SIZE, height: RING_SIZE,
        borderRadius: r, borderWidth: STROKE, borderColor: 'rgba(255,255,255,0.25)',
      }} />
      <View style={{ position: 'absolute', top: 0, right: 0, width: r, height: RING_SIZE, overflow: 'hidden' }}>
        <Animated.View style={{
          width: RING_SIZE, height: RING_SIZE, borderRadius: r,
          borderWidth: STROKE, borderColor: '#FF3B30',
          borderLeftColor: 'transparent', borderBottomColor: 'transparent',
          transform: [{ translateX: -r }, { rotate: rightRotate }, { translateX: r }],
        }} />
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, width: r, height: RING_SIZE, overflow: 'hidden' }}>
        <Animated.View style={{
          width: RING_SIZE, height: RING_SIZE, borderRadius: r,
          borderWidth: STROKE, borderColor: '#FF3B30',
          borderRightColor: 'transparent', borderTopColor: 'transparent',
          transform: [{ translateX: r }, { rotate: leftRotate }, { translateX: -r }],
        }} />
      </View>
    </View>
  );
}

// ── Tool button ───────────────────────────────────────────────────────────────

function ToolButton({
  active, onPress, icon, label, isAa,
}: {
  active: boolean; onPress: () => void;
  icon?: string; label?: string; isAa?: boolean;
}) {
  return (
    <Pressable style={styles.toolBtn} onPress={onPress}>
      <View style={[styles.toolBtnCircle, active && styles.toolBtnCircleActive]}>
        {isAa
          ? <Text style={[styles.toolBtnAaText, active && { color: '#000' }]}>Aa</Text>
          : icon
            ? <IconSymbol name={icon as any} size={20} color={active ? '#000' : '#fff'} />
            : null}
      </View>
      {label && <Text style={styles.toolBtnLabel}>{label}</Text>}
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SocialCreateScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const router = useRouter();
  const C = useColors();

  const [tab, setTab]             = useState<CreationTab>('post');
  const [flash, setFlash]         = useState<FlashMode>('auto');
  const [leftTool, setLeftTool]   = useState<LeftTool>(null);
  const [frontCamera, setFrontCamera] = useState(false);

  // Recording
  const [isRecording, setIsRecording]     = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingAnim    = useRef(new Animated.Value(0)).current;
  const recordingAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Text mode
  const [textValue, setTextValue]         = useState('');
  const [textColorIndex, setTextColorIndex] = useState(0);
  const [textFontIndex, setTextFontIndex]   = useState(0);

  // Layout mode
  const [layoutSelected, setLayoutSelected] = useState<string | null>(null);

  // Settings dropdown
  const [settingsOpen, setSettingsOpen]   = useState(false);
  const [gridOverlay, setGridOverlay]     = useState(false);
  const [videoQuality, setVideoQuality]   = useState<'720p' | '1080p' | '4K'>('1080p');
  const [saveToDevice, setSaveToDevice]   = useState(true);
  const [handsFree, setHandsFree]         = useState(false);

  // ── Lifecycle ──

  useEffect(() => {
    hideFooter();
    return () => showFooter();
  }, []);

  // Clear left tool when switching to reel (no layout on reel)
  useEffect(() => {
    if (tab === 'reel' && leftTool === 'layout') setLeftTool(null);
    if (tab !== 'story' && leftTool === 'boomerang') setLeftTool(null);
  }, [tab]);

  // Recording interval
  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }
    const maxSec = tab === 'reel' ? MAX_REEL_SECONDS : MAX_STORY_SECONDS;
    const id = setInterval(() => {
      setRecordingTime(t => {
        if (t >= maxSec - 1) {
          clearInterval(id);
          triggerStopRecording();
          return maxSec;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording, tab]);

  // ── Tab swipe responder ──

  const tabSwipeResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_evt, gs) =>
      leftTool === null &&
      Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
    onPanResponderRelease: (_evt, gs) => {
      const idx = TAB_ORDER.indexOf(tab);
      if (gs.dx < -60 && idx < TAB_ORDER.length - 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTab(TAB_ORDER[idx + 1]);
      } else if (gs.dx > 60 && idx > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTab(TAB_ORDER[idx - 1]);
      }
    },
  }), [tab, leftTool]);

  // ── Actions ──

  const cycleFlash = useCallback(() => {
    setFlash(f => f === 'auto' ? 'on' : f === 'on' ? 'off' : 'auto');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const flashIcon = flash === 'auto' ? 'bolt' : flash === 'on' ? 'bolt.fill' : 'bolt.slash.fill';

  const toggleLeftTool = useCallback((tool: LeftTool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLeftTool(prev => prev === tool ? null : tool);
  }, []);

  const triggerStopRecording = useCallback(() => {
    setIsRecording(false);
    recordingAnimRef.current?.stop();
    recordingAnim.setValue(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: '/(tabs)/(main)/social/edit', params: { tab } } as any);
  }, [tab, recordingAnim, router]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    const maxSec = tab === 'reel' ? MAX_REEL_SECONDS : MAX_STORY_SECONDS;
    recordingAnimRef.current = Animated.timing(recordingAnim, {
      toValue: 1,
      duration: maxSec * 1000,
      useNativeDriver: true,
    });
    recordingAnimRef.current.start();
  }, [tab, recordingAnim]);

  const handleCapture = useCallback(() => {
    if (tab === 'reel') {
      if (isRecording) triggerStopRecording();
      else startRecording();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: '/(tabs)/(main)/social/edit', params: { tab } } as any);
  }, [tab, isRecording, triggerStopRecording, startRecording, router]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Layout ──

  const BOTTOM_AREA   = TAB_BAR_HEIGHT + insets.bottom;
  const CAPTURE_BOTTOM = BOTTOM_AREA + 12;
  const PANEL_BOTTOM  = CAPTURE_BOTTOM + CAPTURE_SIZE + 18;

  const isTextMode = leftTool === 'text';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={isTextMode && Platform.OS === 'ios' ? 'padding' : undefined}
      {...tabSwipeResponder.panHandlers}
    >
      {/* ── Viewfinder ── */}
      <View style={StyleSheet.absoluteFill}>
        {isTextMode ? (
          <Pressable
            style={[StyleSheet.absoluteFill, {
              backgroundColor: TEXT_BG_COLORS[textColorIndex],
              justifyContent: 'center', alignItems: 'center',
            }]}
            onPress={() => setTextColorIndex(i => (i + 1) % TEXT_BG_COLORS.length)}
          >
            <TextInput
              style={{
                fontSize: 32,
                fontWeight: TEXT_FONTS[textFontIndex].weight,
                fontStyle: TEXT_FONTS[textFontIndex].style,
                color: '#FFFFFF',
                textAlign: 'center',
                paddingHorizontal: 24,
                minWidth: 200,
                maxWidth: screenWidth - 80,
              }}
              placeholder="Type something..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={textValue}
              onChangeText={setTextValue}
              multiline
              autoFocus
              keyboardAppearance="dark"
            />
          </Pressable>
        ) : (
          <>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0D0D0D' }]} />
            {gridOverlay && (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={{ position: 'absolute', left: screenWidth / 3, top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.22)' }} />
                <View style={{ position: 'absolute', left: (screenWidth * 2) / 3, top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.22)' }} />
                <View style={{ position: 'absolute', top: screenHeight / 3, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.22)' }} />
                <View style={{ position: 'absolute', top: (screenHeight * 2) / 3, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.22)' }} />
              </View>
            )}
            {leftTool === 'layout' && layoutSelected && (
              <View style={[StyleSheet.absoluteFill, {
                padding: 10,
                paddingBottom: BOTTOM_AREA + 110,
                paddingTop: insets.top + 70,
              }]}>
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from({
                    length: layoutSelected === '2up' ? 2
                      : layoutSelected === '3up' ? 3
                      : layoutSelected === '4up' ? 4 : 6,
                  }).map((_, i) => (
                    <Pressable
                      key={i}
                      style={{
                        width: layoutSelected === '3up' || layoutSelected === '6up' ? '31%' : '47.5%',
                        flex: layoutSelected === '2up' ? 1 : undefined,
                        aspectRatio: layoutSelected === '2up' ? undefined : 1,
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
                        borderStyle: 'dashed',
                        alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <IconSymbol name="plus" size={22} color="rgba(255,255,255,0.45)" />
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Tap to add</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* ── Top bar: X · flash · settings ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.topBarBtn} onPress={() => router.back()}>
          <IconSymbol name="xmark" size={20} color="#fff" />
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          {isRecording ? (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTimeText}>{formatTime(recordingTime)}</Text>
            </View>
          ) : (
            <Pressable onPress={cycleFlash} style={styles.topBarBtn}>
              <IconSymbol name={flashIcon} size={22} color="#fff" />
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.topBarBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSettingsOpen(v => !v);
          }}
        >
          <IconSymbol name="gearshape" size={22} color={settingsOpen ? 'rgba(255,255,255,0.5)' : '#fff'} />
        </Pressable>
      </View>

      {/* ── Font cycle button (text mode only) ── */}
      {isTextMode && (
        <Pressable
          style={[styles.fontCycleBtn, { top: insets.top + 56 }]}
          onPress={() => {
            setTextFontIndex(i => (i + 1) % TEXT_FONTS.length);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={{
            color: '#fff', fontSize: 14, fontWeight: '700',
            fontStyle: TEXT_FONTS[(textFontIndex + 1) % TEXT_FONTS.length].style,
          }}>
            {TEXT_FONTS[(textFontIndex + 1) % TEXT_FONTS.length].label}
          </Text>
        </Pressable>
      )}

      {/* ── Left tools: Aa / Layout / Boomerang ── */}
      {!isRecording && !isTextMode && (
        <View style={[styles.leftTools, { top: insets.top + 90, bottom: BOTTOM_AREA + 110 }]}>
          <ToolButton isAa active={leftTool === 'text'} onPress={() => toggleLeftTool('text')} />
          {tab !== 'reel' && (
            <ToolButton
              icon="square.grid.2x2"
              label="Layout"
              active={leftTool === 'layout'}
              onPress={() => toggleLeftTool('layout')}
            />
          )}
          {tab === 'story' && (
            <ToolButton
              icon="infinity"
              label="Boomerang"
              active={leftTool === 'boomerang'}
              onPress={() => toggleLeftTool('boomerang')}
            />
          )}
        </View>
      )}

      {/* ── Layout options panel (above capture row) ── */}
      {leftTool === 'layout' && !isRecording && (
        <View style={[styles.toolPanel, { bottom: PANEL_BOTTOM }]}>
          <View style={styles.optionRow}>
            {['2-up', '3-up', '4-up', '6-up'].map(l => {
              const key = l.replace('-', '');
              return (
                <Pressable
                  key={l}
                  style={[styles.optionPill, layoutSelected === key && styles.optionPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLayoutSelected(key);
                  }}
                >
                  <Text style={[styles.optionPillText, layoutSelected === key && { color: '#000' }]}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Bottom capture row: gallery · capture · flip ── */}
      <View style={[styles.captureRow, { bottom: CAPTURE_BOTTOM }]}>
        <Pressable style={styles.galleryBtn}>
          <View style={styles.galleryThumb}>
            <IconSymbol name="photo.on.rectangle" size={20} color="rgba(255,255,255,0.65)" />
          </View>
        </Pressable>

        <View style={styles.captureGroup}>
          {tab === 'reel' && <RecordingRing anim={recordingAnim} />}
          <Pressable
            style={[
              styles.captureBtn,
              tab === 'reel' && styles.captureBtnReel,
              isRecording && styles.captureBtnRecording,
            ]}
            onPress={handleCapture}
          >
            {isRecording ? (
              <View style={styles.stopSquare} />
            ) : tab === 'reel' ? (
              <View style={styles.reelCenter} />
            ) : null}
          </Pressable>
        </View>

        <Pressable
          style={styles.flipBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFrontCamera(f => !f);
          }}
        >
          <IconSymbol name="arrow.triangle.2.circlepath.camera" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* ── Tab bar: POST · STORY · REEL ── */}
      <View style={[styles.tabBar, { bottom: insets.bottom, paddingBottom: insets.bottom > 0 ? 0 : 10 }]}>
        {TAB_ORDER.map(t => (
          <Pressable
            key={t}
            style={styles.tabItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab(t);
            }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.toUpperCase()}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      {/* ── Settings dropdown ── */}
      {settingsOpen && (
        <>
          {/* Dismiss overlay */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSettingsOpen(false)} />
          {/* Dropdown card */}
          <View style={[styles.settingsCard, { top: insets.top + 52 }]}>
            {/* Grid overlay */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Grid Overlay</Text>
              <Switch
                value={gridOverlay}
                onValueChange={(v) => { Haptics.selectionAsync(); setGridOverlay(v); }}
                trackColor={{ true: '#fff', false: 'rgba(255,255,255,0.2)' }}
                thumbColor={gridOverlay ? '#000' : '#888'}
              />
            </View>
            <View style={styles.settingDivider} />
            {/* Video quality */}
            <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
              <Text style={styles.settingLabel}>Video Quality</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['720p', '1080p', '4K'] as const).map(q => (
                  <Pressable
                    key={q}
                    style={[styles.qualityPill, q === videoQuality && styles.qualityPillActive]}
                    onPress={() => { Haptics.selectionAsync(); setVideoQuality(q); }}
                  >
                    <Text style={[styles.qualityText, q === videoQuality && styles.qualityTextActive]}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.settingDivider} />
            {/* Save to device */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Save to Device</Text>
              <Switch
                value={saveToDevice}
                onValueChange={(v) => { Haptics.selectionAsync(); setSaveToDevice(v); }}
                trackColor={{ true: '#fff', false: 'rgba(255,255,255,0.2)' }}
                thumbColor={saveToDevice ? '#000' : '#888'}
              />
            </View>
            <View style={styles.settingDivider} />
            {/* Hands-free */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Hands-Free</Text>
              <Switch
                value={handsFree}
                onValueChange={(v) => { Haptics.selectionAsync(); setHandsFree(v); }}
                trackColor={{ true: '#fff', false: 'rgba(255,255,255,0.2)' }}
                thumbColor={handsFree ? '#000' : '#888'}
              />
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 14, paddingBottom: 10, zIndex: 20,
  },
  topBarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  recordingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  recordingDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  recordingTimeText:{ fontSize: 14, fontWeight: '600', color: '#fff' },

  // Font cycle
  fontCycleBtn: {
    position: 'absolute', right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', zIndex: 20,
  },

  // Left tools
  leftTools: {
    position: 'absolute', left: 12,
    alignItems: 'center', justifyContent: 'center', gap: 18, zIndex: 10,
  },
  toolBtn:            { alignItems: 'center', gap: 4 },
  toolBtnCircle: {
    width: TOOL_SIZE, height: TOOL_SIZE, borderRadius: TOOL_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  toolBtnCircleActive:{ backgroundColor: '#fff', borderColor: 'rgba(255,255,255,0.8)' },
  toolBtnAaText:      { fontSize: 16, fontWeight: '700', color: '#fff' },
  toolBtnLabel:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

  // Layout options panel
  toolPanel: {
    position: 'absolute', left: 0, right: 0, height: 52,
    justifyContent: 'center', zIndex: 10,
  },
  optionRow:     { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  optionPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  optionPillActive:{ backgroundColor: '#fff', borderColor: '#fff' },
  optionPillText:  { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Capture row
  captureRow: {
    position: 'absolute', left: 0, right: 0, height: CAPTURE_SIZE + 28,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 28, zIndex: 10,
  },
  galleryBtn:   { width: 54, height: 54 },
  galleryThumb: {
    width: 54, height: 54, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  captureGroup: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  captureBtn: {
    width: CAPTURE_SIZE, height: CAPTURE_SIZE,
    borderRadius: CAPTURE_SIZE / 2, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnReel:      { backgroundColor: 'transparent', borderWidth: 5, borderColor: '#fff' },
  captureBtnRecording: { borderColor: '#FF3B30' },
  reelCenter: {
    width: CAPTURE_SIZE - 20, height: CAPTURE_SIZE - 20,
    borderRadius: (CAPTURE_SIZE - 20) / 2, backgroundColor: '#FF3B30',
  },
  stopSquare: { width: 22, height: 22, borderRadius: 4, backgroundColor: '#FF3B30' },
  flipBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Tab bar
  tabBar: {
    position: 'absolute', left: 0, right: 0, height: TAB_BAR_HEIGHT,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 36, zIndex: 10,
  },
  tabItem:       { alignItems: 'center', gap: 3, paddingVertical: 6 },
  tabText:       { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabUnderline:  { height: 2.5, width: '75%', backgroundColor: '#fff', borderRadius: 1.5 },

  // Settings dropdown
  settingsCard: {
    position: 'absolute',
    right: 14,
    width: 240,
    backgroundColor: 'rgba(18,18,18,0.97)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 50,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingLabel:   { fontSize: 14, fontWeight: '500', color: '#fff' },
  settingDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)' },
  qualityPill: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  qualityPillActive: { backgroundColor: '#fff', borderColor: '#fff' },
  qualityText:       { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  qualityTextActive: { color: '#000' },
});
