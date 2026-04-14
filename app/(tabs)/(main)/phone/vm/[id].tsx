/**
 * Voicemail Detail — tap a voicemail row to get here.
 * Known contact: avatar · name (tap → profile sheet) · date · audio player · transcript
 * Unknown number: number · date · audio player · Add Contact / Report Spam · transcript
 * Back button top-left. Quick-callback button top-right.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';
import { VOICEMAILS, PHONE_CONTACTS, type PhoneContact } from '@/data/mock-phone';

const TOP_BAR_H = 52;

// ── Mock audio player ─────────────────────────────────────────────────────────

function AudioPlayer({
  duration, C, styles,
}: {
  duration: string; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
}) {
  const [playing, setPlaying] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const trackWidth = useRef(200); // updated by onLayout

  const togglePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (playing) {
      animRef.current?.stop();
      setPlaying(false);
    } else {
      setPlaying(true);
      animRef.current = Animated.timing(progress, {
        toValue: 1, duration: 60000, useNativeDriver: false,
      });
      animRef.current.start(({ finished }) => {
        if (finished) setPlaying(false);
      });
    }
  }, [playing, progress]);

  const restart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animRef.current?.stop();
    progress.setValue(0);
    setPlaying(false);
  }, [progress]);

  return (
    <View style={styles.playerWrap}>
      {/* Scrubber */}
      <View
        style={styles.scrubTrack}
        onLayout={e => { trackWidth.current = e.nativeEvent.layout.width; }}
      >
        <Animated.View style={[styles.scrubFill, {
          width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
        <Animated.View style={[styles.scrubThumb, {
          left: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, trackWidth.current - 14] as [number, number],
          }),
        }]} />
      </View>

      {/* Time labels */}
      <View style={styles.scrubTimes}>
        <Text style={[styles.scrubTime, { color: C.muted }]}>0:00</Text>
        <Text style={[styles.scrubTime, { color: C.muted }]}>-{duration}</Text>
      </View>

      {/* Controls: share · restart · play/pause · speaker · trash */}
      <View style={styles.controls}>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={14}>
          <IconSymbol name="square.and.arrow.up" size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={restart} hitSlop={14}>
          <IconSymbol name="backward.end.fill" size={26} color={C.label} />
        </Pressable>
        <Pressable onPress={togglePlay} hitSlop={14}>
          <IconSymbol name={playing ? 'pause.fill' : 'play.fill'} size={36} color={C.label} />
        </Pressable>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={14}>
          <IconSymbol name="speaker.wave.2.fill" size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} hitSlop={14}>
          <IconSymbol name="trash" size={22} color={C.label} />
        </Pressable>
      </View>
    </View>
  );
}

// ── Contact profile sheet ─────────────────────────────────────────────────────

function ProfileSheet({
  contact, C, styles,
}: {
  contact: PhoneContact; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
}) {
  const actions = [
    { icon: 'phone.fill', label: 'Call', color: C.green },
    { icon: 'video.fill', label: 'Video', color: C.accent },
    { icon: 'message.fill', label: 'Message', color: C.accent },
  ] as const;

  return (
    <View style={styles.profileSheet}>
      <View style={[styles.profileAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.profileInitials}>{contact.initials}</Text>
        {contact.online && (
          <View style={[styles.profileOnlineDot, { backgroundColor: C.green, borderColor: C.bg }]} />
        )}
      </View>
      <Text style={styles.profileName}>{contact.name}</Text>
      {(contact.role || contact.org) ? (
        <Text style={[styles.profileRole, { color: C.secondary }]}>
          {[contact.role, contact.org].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      <View style={styles.profileActions}>
        {actions.map(({ icon, label, color }) => (
          <Pressable
            key={label}
            style={styles.profileActionBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <View style={[styles.profileActionIcon, { backgroundColor: color + '22' }]}>
              <IconSymbol name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.profileActionLabel, { color: C.secondary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function VoicemailDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const mode = useMode();

  const [profileSheetVisible, setProfileSheetVisible] = useState(false);

  const vm = VOICEMAILS.find(v => v.id === id);
  const contact = vm
    ? PHONE_CONTACTS.find(c => c.username === vm.callerUsername && c.mode === mode) ?? null
    : null;
  const isKnown = !!contact;

  if (!vm) {
    return (
      <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top + 8 }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: C.surfacePressed }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[styles.emptyText, { color: C.muted }]}>Voicemail not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Top bar: back ← ···title··· callback → */}
      <Animated.View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: C.bg, opacity }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: C.surfacePressed }]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>

        <Pressable
          style={[styles.callbackBtn, { backgroundColor: C.green }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="phone.fill" size={18} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: insets.bottom + 40 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {isKnown && (
            <View style={[styles.heroAvatar, { backgroundColor: C.surface }]}>
              <Text style={[styles.heroInitials, { color: C.label }]}>{vm.callerInitials}</Text>
            </View>
          )}

          <Pressable
            style={styles.heroNameRow}
            onPress={isKnown ? () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setProfileSheetVisible(true);
            } : undefined}
          >
            <Text style={[styles.heroName, { color: C.label }]}>{vm.callerName}</Text>
          </Pressable>

          <Text style={[styles.heroSub, { color: C.secondary }]}>
            {isKnown ? 'mobile' : 'Unknown'} · {vm.timestamp}
          </Text>
        </View>

        {/* Audio player */}
        <AudioPlayer duration={vm.duration} C={C} styles={styles} />

        {/* Unknown only: Add Contact + Report Spam */}
        {!isKnown && (
          <View style={styles.unknownActions}>
            <Pressable
              style={[styles.unknownBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="person.badge.plus" size={16} color={C.accent} />
              <Text style={[styles.unknownBtnText, { color: C.accent }]}>Add Contact</Text>
            </Pressable>
            <Pressable
              style={[styles.unknownBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="exclamationmark.bubble" size={16} color={C.red} />
              <Text style={[styles.unknownBtnText, { color: C.red }]}>Report Spam</Text>
            </Pressable>
          </View>
        )}

        {/* Transcript */}
        <View style={styles.transcriptWrap}>
          <Text style={[styles.transcriptLabel, { color: C.muted }]}>Transcript</Text>
          <Text style={[styles.transcriptText, { color: C.label }]}>{vm.transcription}</Text>
        </View>
      </ScrollView>

      {/* Profile sheet — known contacts only */}
      {contact && (
        <BottomSheet
          visible={profileSheetVisible}
          onClose={() => setProfileSheetVisible(false)}
          useModal
          backgroundColor={C.bg}
        >
          <ProfileSheet contact={contact} C={C} styles={styles} />
        </BottomSheet>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  callbackBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
    gap: 6,
  },
  heroAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  heroInitials: { fontSize: 28, fontWeight: '700' },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroName: { fontSize: 22, fontWeight: '700' },
  heroSub: { fontSize: 14 },

  // Audio player
  playerWrap: { paddingHorizontal: 28, paddingBottom: 28 },
  scrubTrack: {
    height: 4, backgroundColor: C.separator,
    borderRadius: 2, marginBottom: 10,
    position: 'relative', overflow: 'visible',
  },
  scrubFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: C.label, borderRadius: 2,
  },
  scrubThumb: {
    position: 'absolute', top: -5,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: C.label,
  },
  scrubTimes: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 24,
  },
  scrubTime: { fontSize: 13 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  // Unknown actions
  unknownActions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  unknownBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 13, borderRadius: 14,
  },
  unknownBtnText: { fontSize: 15, fontWeight: '500' },

  // Transcript
  transcriptWrap: { paddingHorizontal: 24 },
  transcriptLabel: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  transcriptText: { fontSize: 15, lineHeight: 23 },

  // Profile sheet
  profileSheet: {
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 14,
  },
  profileInitials: { fontSize: 28, fontWeight: '700', color: C.label },
  profileOnlineDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 18, height: 18, borderRadius: 9, borderWidth: 3,
  },
  profileName: {
    fontSize: 22, fontWeight: '700', color: C.label,
    marginBottom: 4, textAlign: 'center',
  },
  profileRole: { fontSize: 14, marginBottom: 28, textAlign: 'center' },
  profileActions: { flexDirection: 'row', gap: 20 },
  profileActionBtn: { alignItems: 'center', gap: 8 },
  profileActionIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  profileActionLabel: { fontSize: 12, fontWeight: '500' },

  // Fallback
  emptyText: { textAlign: 'center', fontSize: 15, paddingTop: 60 },
});
