/**
 * Call Overlay — Full-screen audio/video call UI + minimized pill.
 * Always dark background. White icons throughout.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, PanResponder,
  TextInput, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ActiveCallBar } from '@/components/ui/active-call-bar';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  subscribeCall, subscribeHeld, subscribeDecline,
  endCall, toggleCallMinimize, toggleCallType,
  addToCall, swapCalls, mergeCalls,
  type ActiveCall,
} from '@/utils/global-call';
import { MODE_BADGE_COLORS, MODE_BADGE_LABELS, PHONE_CONTACTS } from '@/data/mock-phone';

// ── Timer ─────────────────────────────────────────────────────────────────────

function useCallTimer(startedAt: number, state: string) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (state !== 'connected') { setElapsed(0); return; }
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startedAt, state]);
  return `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
}

// ── Decline toast ─────────────────────────────────────────────────────────────

function DeclineToast({ name, onDone }: { name: string; onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  return (
    <Animated.View style={[toastStyles.wrap, { opacity, top: insets.top + 12 }]}>
      <IconSymbol name="phone.down.fill" size={13} color="#FFFFFF" />
      <Text style={toastStyles.text}>{name.split(' ')[0]} declined</Text>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  wrap: {
    position: 'absolute', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(20,20,30,0.92)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    zIndex: 99,
  },
  text: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
});

// ── Video tile ────────────────────────────────────────────────────────────────

function VideoTile({ initials, name, state }: {
  initials: string; name: string; state: 'connected' | 'ringing';
}) {
  const photoUrl = `https://i.pravatar.cc/300?u=${encodeURIComponent(name)}`;
  return (
    <View style={vtStyles.tile}>
      {state === 'connected' ? (
        <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={vtStyles.avatarWrap}>
          <View style={vtStyles.avatar}>
            <Text style={vtStyles.avatarText}>{initials}</Text>
          </View>
        </View>
      )}
      <View style={vtStyles.nameBar}>
        <Text style={vtStyles.nameTxt} numberOfLines={1}>{name.split(' ')[0]}</Text>
        {state === 'ringing' && <Text style={vtStyles.callingTxt}>Calling…</Text>}
      </View>
    </View>
  );
}

const vtStyles = StyleSheet.create({
  tile: {
    flex: 1, backgroundColor: '#111827', borderRadius: 4,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center', minHeight: 100,
  },
  avatarWrap: { alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  nameBar: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  nameTxt: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  callingTxt: { fontSize: 11, color: 'rgba(255,255,255,0.60)', marginTop: 2 },
});

// ── Minimized pill ────────────────────────────────────────────────────────────

function CallPill({ call }: { call: ActiveCall }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[pillStyles.wrap, { top: insets.top + 4 }]}>
      <ActiveCallBar
        name={call.contactName}
        onEnd={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); endCall(); }}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleCallMinimize(); }}
      />
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, zIndex: 20000 },
});

// ── Full call screen ──────────────────────────────────────────────────────────

function FullCallScreen({ call, heldCall }: { call: ActiveCall; heldCall: ActiveCall | null }) {
  const C = useColors();
  const fullStyles = useMemo(() => makeFullStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const timer = useCallTimer(call.startedAt, call.state);
  const badgeColor = MODE_BADGE_COLORS[call.mode];
  const badgeLabel = MODE_BADGE_LABELS[call.mode];

  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [declines, setDeclines] = useState<string[]>([]);

  const pipTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pipPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pipTranslate.x, dy: pipTranslate.y }],
      { useNativeDriver: false },
    ),
    onPanResponderRelease: () => { pipTranslate.extractOffset(); },
  })).current;

  const isVideo = call.type === 'video';
  const isConnected = call.state === 'connected';
  const isRinging = call.state === 'ringing';

  useEffect(() => subscribeDecline(({ contactName }) => {
    setDeclines(prev => [...prev, contactName]);
  }), []);

  const connectedParts = (call.participants ?? []).filter(p => p.state === 'connected');
  const ringingParts = (call.participants ?? []).filter(p => p.state === 'ringing');

  const allTiles = [
    { initials: call.contactInitials, name: call.contactName, state: 'connected' as const },
    ...(call.participants ?? [])
      .filter(p => p.state !== 'declined')
      .map(p => ({ initials: p.contactInitials, name: p.contactName, state: p.state as 'connected' | 'ringing' })),
  ];

  // Icon + label colors — always white on dark background
  const IC = '#FFFFFF';
  const LC = 'rgba(255,255,255,0.75)';

  // Add-person results
  const addResults = useMemo(() => {
    const q = addQuery.toLowerCase().trim();
    return PHONE_CONTACTS.filter(c =>
      c.mode === call.mode && (
        !q || c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
      ),
    ).slice(0, 6);
  }, [addQuery, call.mode]);

  return (
    <View style={[fullStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Dark video background — base layer behind tiles */}
      {isVideo && isConnected && <View style={fullStyles.videoBg} />}

      {/* Self-view PiP — draggable */}
      {isVideo && isConnected && (
        <Animated.View
          style={[fullStyles.pip, { top: insets.top + 60 }, { transform: pipTranslate.getTranslateTransform() }]}
          {...pipPan.panHandlers}
        >
          <Image source={{ uri: 'https://i.pravatar.cc/300?u=sammy-self' }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <Text style={fullStyles.pipText}>You</Text>
        </Animated.View>
      )}

      {/* Center content — always present to keep controls at bottom */}
      <View style={[fullStyles.centerContent, isVideo && isConnected && fullStyles.centerContentVideo]}>
        {isVideo && isConnected ? (
          /* ── Video tile grid ── */
          allTiles.length <= 2 ? (
            allTiles.map((t, i) => <VideoTile key={i} {...t} />)
          ) : (
            Array.from({ length: Math.ceil(allTiles.length / 2) }, (_, ri) => (
              <View key={ri} style={fullStyles.tileRow}>
                {allTiles.slice(ri * 2, ri * 2 + 2).map((t, ti) => (
                  <VideoTile key={ti} {...t} />
                ))}
              </View>
            ))
          )
        ) : (
          /* ── Audio / ringing ── */
          <>
            {connectedParts.length > 0 ? (
              <View style={fullStyles.groupAvatars}>
                <View style={[fullStyles.groupAvatarPrimary, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                  <Text style={fullStyles.groupInitialsPrimary}>{call.contactInitials}</Text>
                </View>
                {connectedParts.slice(0, 2).map((p, i) => (
                  <View key={i} style={[fullStyles.groupAvatarExtra, { backgroundColor: 'rgba(255,255,255,0.12)', left: 44 + i * 32 }]}>
                    <Text style={fullStyles.groupInitialsExtra}>{p.contactInitials}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={fullStyles.avatar}>
                <Text style={fullStyles.avatarInitials}>{call.contactInitials}</Text>
              </View>
            )}

            <Text style={fullStyles.name}>
              {connectedParts.length > 0
                ? `${call.contactName} + ${connectedParts.map(p => p.contactName.split(' ')[0]).join(', ')}`
                : call.contactName}
            </Text>

            <View style={[fullStyles.badge, { backgroundColor: badgeColor + '33' }]}>
              <Text style={[fullStyles.badgeText, { color: badgeColor }]}>
                {connectedParts.length > 0 ? 'Group' : badgeLabel} {isVideo ? 'Video' : 'Call'}
              </Text>
            </View>

            <Text style={fullStyles.status}>{isRinging ? 'Calling…' : timer}</Text>

            {ringingParts.map((p, i) => (
              <Text key={i} style={fullStyles.ringingLine}>Calling {p.contactName.split(' ')[0]}…</Text>
            ))}
          </>
        )}
      </View>

      {/* Held call banner — audio only */}
      {heldCall && !addVisible && !isVideo && (
        <View style={fullStyles.heldBanner}>
          <View style={[fullStyles.heldAvatar, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={fullStyles.heldInitials}>{heldCall.contactInitials}</Text>
          </View>
          <View style={fullStyles.heldInfo}>
            <Text style={fullStyles.heldName} numberOfLines={1}>{heldCall.contactName}</Text>
            <Text style={fullStyles.heldStatus}>On Hold</Text>
          </View>
          <Pressable
            style={[fullStyles.heldBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); swapCalls(); }}
          >
            <IconSymbol name="arrow.triangle.swap" size={14} color={IC} />
            <Text style={fullStyles.heldBtnLabel}>Swap</Text>
          </Pressable>
          <Pressable
            style={[fullStyles.heldBtn, { backgroundColor: '#4A6D8C' }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); mergeCalls(); }}
          >
            <IconSymbol name="person.2.fill" size={14} color={IC} />
            <Text style={fullStyles.heldBtnLabel}>Merge</Text>
          </Pressable>
        </View>
      )}

      {/* Bottom controls */}
      <View style={fullStyles.controls}>
        {/* Row 1: Mute · Speaker · Video */}
        <View style={fullStyles.controlRow}>
          <Pressable
            style={[fullStyles.controlBtn, muted && fullStyles.controlBtnActive]}
            onPress={() => { setMuted(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol name={muted ? 'mic.slash.fill' : 'mic.fill'} size={22} color={muted ? '#0D1117' : IC} />
            <Text style={[fullStyles.controlLabel, { color: muted ? '#0D1117' : LC }]}>Mute</Text>
          </Pressable>

          <Pressable
            style={[fullStyles.controlBtn, speaker && fullStyles.controlBtnActive]}
            onPress={() => { setSpeaker(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol name={speaker ? 'speaker.wave.3.fill' : 'speaker.fill'} size={22} color={speaker ? '#0D1117' : IC} />
            <Text style={[fullStyles.controlLabel, { color: speaker ? '#0D1117' : LC }]}>Speaker</Text>
          </Pressable>

          <Pressable
            style={[fullStyles.controlBtn, isVideo && fullStyles.controlBtnActive]}
            onPress={() => { toggleCallType(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol name={isVideo ? 'video.fill' : 'video.slash.fill'} size={22} color={isVideo ? '#0D1117' : IC} />
            <Text style={[fullStyles.controlLabel, { color: isVideo ? '#0D1117' : LC }]}>Video</Text>
          </Pressable>
        </View>

        {/* Row 2: Flip (video) · Keypad · Add */}
        <View style={fullStyles.controlRow}>
          {isVideo && (
            <Pressable style={fullStyles.controlBtn}>
              <IconSymbol name="camera.rotate.fill" size={22} color={IC} />
              <Text style={[fullStyles.controlLabel, { color: LC }]}>Flip</Text>
            </Pressable>
          )}
          <Pressable style={fullStyles.controlBtn}>
            <IconSymbol name="circle.grid.3x3.fill" size={22} color={IC} />
            <Text style={[fullStyles.controlLabel, { color: LC }]}>Keypad</Text>
          </Pressable>
          <Pressable
            style={fullStyles.controlBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddQuery(''); setAddVisible(true); }}
          >
            <IconSymbol name="person.badge.plus" size={22} color={IC} />
            <Text style={[fullStyles.controlLabel, { color: LC }]}>Add</Text>
          </Pressable>
        </View>

        {/* End + Minimize */}
        <View style={fullStyles.bottomRow}>
          <Pressable
            style={fullStyles.minimizeBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleCallMinimize(); }}
          >
            <IconSymbol name="arrow.down.right.and.arrow.up.left" size={18} color={IC} />
          </Pressable>
          <Pressable
            style={fullStyles.endBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); endCall(); }}
          >
            <IconSymbol name="phone.down.fill" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={{ width: 48 }} />
        </View>
      </View>

      {/* Add person sheet */}
      {addVisible && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddVisible(false)} />
          <View style={[fullStyles.addSheet, { paddingBottom: insets.bottom + 8 }]}>
            <View style={fullStyles.addHeader}>
              <Text style={fullStyles.addTitle}>{isVideo ? 'Add to Video' : 'Add to Call'}</Text>
              <Pressable onPress={() => setAddVisible(false)} hitSlop={12}>
                <IconSymbol name="xmark.circle.fill" size={22} color="rgba(255,255,255,0.45)" />
              </Pressable>
            </View>
            <View style={fullStyles.addSearch}>
              <IconSymbol name="magnifyingglass" size={15} color="rgba(255,255,255,0.45)" />
              <TextInput
                style={fullStyles.addInput}
                value={addQuery}
                onChangeText={setAddQuery}
                placeholder="Search contacts..."
                placeholderTextColor="rgba(255,255,255,0.40)"
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }}>
              {addResults.map(contact => (
                <Pressable
                  key={contact.id}
                  style={({ pressed }) => [fullStyles.addRow, pressed && { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    addToCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: call.type });
                    setAddVisible(false);
                  }}
                >
                  <View style={[fullStyles.addAvatar, { backgroundColor: 'rgba(255,255,255,0.10)' }]}>
                    <Text style={fullStyles.addInitials}>{contact.initials}</Text>
                    {contact.online && <View style={fullStyles.addOnlineDot} />}
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={fullStyles.addName}>{contact.name}</Text>
                    <Text style={fullStyles.addHandle}>{contact.username}</Text>
                  </View>
                  <IconSymbol
                    name={isVideo ? 'video.badge.plus' : 'phone.badge.plus'}
                    size={18}
                    color={isVideo ? '#4A9EFF' : '#5ABF7E'}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* Decline toasts */}
      {declines.map((name, i) => (
        <DeclineToast
          key={`${name}-${i}`}
          name={name}
          onDone={() => setDeclines(prev => prev.filter((_, idx) => idx !== i))}
        />
      ))}
    </View>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function CallOverlay() {
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [heldCall, setHeldCall] = useState<ActiveCall | null>(null);

  useEffect(() => {
    const u1 = subscribeCall(setCall);
    const u2 = subscribeHeld(setHeldCall);
    return () => { u1(); u2(); };
  }, []);

  if (!call) return null;
  if (call.minimized) return <CallPill call={call} />;
  return <FullCallScreen call={call} heldCall={heldCall} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeFullStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0D1117',
    zIndex: 20000,
    justifyContent: 'space-between',
  },
  videoBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: { fontSize: 16, color: 'rgba(255,255,255,0.25)' },
  pip: {
    position: 'absolute', right: 16,
    width: 100, height: 140, borderRadius: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  pipText: { position: 'absolute', bottom: 6, alignSelf: 'center', fontSize: 11, fontWeight: '600', color: '#FFFFFF' },

  centerContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40,
  },
  centerContentVideo: {
    paddingBottom: 0, justifyContent: 'flex-start', alignItems: 'stretch', gap: 2,
  },
  tileRow: { flex: 1, flexDirection: 'row', gap: 2 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },

  groupAvatars: { height: 72, width: 120, position: 'relative', marginBottom: 16 },
  groupAvatarPrimary: {
    position: 'absolute', left: 0,
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  groupInitialsPrimary: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  groupAvatarExtra: {
    position: 'absolute', top: 16,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1, borderWidth: 2, borderColor: '#0D1117',
  },
  groupInitialsExtra: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },

  name: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 6, textAlign: 'center', paddingHorizontal: 20 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  status: { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontVariant: ['tabular-nums'] },
  ringingLine: { fontSize: 13, color: 'rgba(255,255,255,0.50)', marginTop: 4 },

  // Held banner
  heldBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heldAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heldInitials: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  heldInfo: { flex: 1, minWidth: 0, gap: 1 },
  heldName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  heldStatus: { fontSize: 11, color: 'rgba(255,255,255,0.50)' },
  heldBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  heldBtnLabel: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  // Controls
  controls: { paddingHorizontal: 24, paddingBottom: 16, gap: 20 },
  controlRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  controlBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  controlBtnActive: { backgroundColor: '#FFFFFF' },
  controlLabel: { fontSize: 10, marginTop: 2 },
  bottomRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8,
  },
  minimizeBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  endBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center',
  },

  // Add sheet
  addSheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#161E2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 20,
  },
  addHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
  },
  addTitle: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  addSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.10)',
  },
  addInput: { flex: 1, fontSize: 15, color: '#FFFFFF' },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  addAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  addInitials: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  addOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 5.5,
    backgroundColor: '#5A8A6E', borderWidth: 2, borderColor: '#161E2E',
  },
  addName: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  addHandle: { fontSize: 12, color: 'rgba(255,255,255,0.50)' },
});
