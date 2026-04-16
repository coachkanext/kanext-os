/**
 * Phone Screen — iOS-style redesign
 * Tabs: Recents · Contacts · Voicemail
 * Dialpad FAB + full-screen overlay
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import {
  RECENT_CALLS,
  type RecentCall,
} from '@/data/mock-phone';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';


// ── Dialpad data ───────────────────────────────────────────────────────────────

const DIALPAD_ROWS = [
  [{ digit: '1', sub: '' }, { digit: '2', sub: 'ABC' }, { digit: '3', sub: 'DEF' }],
  [{ digit: '4', sub: 'GHI' }, { digit: '5', sub: 'JKL' }, { digit: '6', sub: 'MNO' }],
  [{ digit: '7', sub: 'PQRS' }, { digit: '8', sub: 'TUV' }, { digit: '9', sub: 'WXYZ' }],
  [{ digit: '*', sub: '' }, { digit: '0', sub: '+' }, { digit: '#', sub: '' }],
];

// ── Sub-components ─────────────────────────────────────────────────────────────

// Avatar circle with initials
function Avatar({
  initials,
  size,
  bg,
  textColor,
  fontSize,
  fontWeight,
}: {
  initials: string;
  size: number;
  bg: string;
  textColor: string;
  fontSize: number;
  fontWeight: '700' | '600' | '500';
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: textColor, fontSize, fontWeight }}>{initials}</Text>
    </View>
  );
}

// ── Recents Tab ────────────────────────────────────────────────────────────────

function RecentsTab({ C, missedOnly = false, isOwner = true }: { C: ReturnType<typeof useColors>; missedOnly?: boolean; isOwner?: boolean }) {
  const baseCalls = isOwner ? RECENT_CALLS : RECENT_CALLS.filter(c => c.direction === 'incoming' || c.direction === 'missed');
  const calls = missedOnly ? baseCalls.filter(c => c.direction === 'missed') : baseCalls;
  const getDirectionIcon = (direction: RecentCall['direction']) => {
    switch (direction) {
      case 'incoming': return 'arrow.down.left';
      case 'outgoing': return 'arrow.up.right';
      case 'missed':   return 'arrow.down.left';
      case 'video':    return 'video';
    }
  };

  const getDirectionColor = (direction: RecentCall['direction']) => {
    switch (direction) {
      case 'incoming': return GAIN;
      case 'outgoing': return C.secondary;
      case 'missed':   return HEAT;
      case 'video':    return C.secondary;
    }
  };

  const getDirectionLabel = (direction: RecentCall['direction']) => {
    switch (direction) {
      case 'incoming': return 'Incoming';
      case 'outgoing': return 'Outgoing';
      case 'missed':   return 'Missed';
      case 'video':    return 'Video';
    }
  };

  return (
    <View>
      {calls.map((call, index) => (
        <Pressable
          key={call.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => ({
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: C.separator,
            backgroundColor: pressed ? C.surface : 'transparent',
          })}
        >
          {/* Avatar */}
          <Avatar
            initials={call.initials}
            size={40}
            bg={C.surface}
            textColor={C.label}
            fontSize={15}
            fontWeight="700"
          />

          {/* Middle */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: call.direction === 'missed' ? HEAT : C.label,
                marginBottom: 3,
              }}
              numberOfLines={1}
            >
              {call.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <IconSymbol
                name={getDirectionIcon(call.direction) as any}
                size={11}
                color={getDirectionColor(call.direction)}
              />
              <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 3 }}>
                {getDirectionLabel(call.direction)}
              </Text>

              {call.hasVoicemail && (
                <View
                  style={{
                    marginLeft: 6,
                    backgroundColor: `${HEAT}26`,
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '800', color: HEAT }}>VM</Text>
                </View>
              )}

              {call.duration && (
                <Text style={{ fontSize: 12, color: C.secondary }}>
                  {' · '}{call.duration}
                </Text>
              )}
            </View>
          </View>

          {/* Right */}
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Text style={{ fontSize: 12, color: C.secondary }}>{call.timestamp}</Text>
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(call.name, call.username, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Call', onPress: () => {} },
                ]);
              }}
            >
              <IconSymbol name="phone.fill" size={18} color={GAIN} />
            </Pressable>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// ── Contacts Tab ───────────────────────────────────────────────────────────────

function ContactsTab({
  C,
  searchQuery,
  setSearchQuery,
}: {
  C: ReturnType<typeof useColors>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const sections = useMemo(() => {
    const filtered = PHONE_CONTACTS.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const grouped: Record<string, PhoneContact[]> = {};
    filtered.forEach((c) => {
      const letter = c.name[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(c);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [searchQuery]);

  const handleContactPress = (contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(contact.name, `${contact.role} · ${contact.username}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => {} },
      { text: 'Call', onPress: () => {} },
    ]);
  };

  return (
    <View>
      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.surface,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
            gap: 7,
          }}
        >
          <IconSymbol name="magnifyingglass" size={14} color={C.secondary} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: C.label,
              padding: 0,
            }}
            placeholder="Search contacts..."
            placeholderTextColor={C.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Alphabetical sections */}
      {sections.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: C.secondary }}>No contacts found</Text>
        </View>
      ) : (
        sections.map(([letter, contacts]) => (
          <View key={letter}>
            {/* Section header */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                backgroundColor: C.surface,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: C.secondary,
                  letterSpacing: 0.5,
                }}
              >
                {letter}
              </Text>
            </View>

            {/* Contacts in group */}
            {contacts.map((contact) => (
              <Pressable
                key={contact.id}
                onPress={() => handleContactPress(contact)}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: C.separator,
                  backgroundColor: pressed ? C.surface : 'transparent',
                })}
              >
                <Avatar
                  initials={contact.initials}
                  size={36}
                  bg={C.surface}
                  textColor={C.label}
                  fontSize={13}
                  fontWeight="700"
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: '600', color: C.label }}
                    numberOfLines={1}
                  >
                    {contact.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}
                    numberOfLines={1}
                  >
                    {contact.username}
                  </Text>
                </View>

                {contact.online && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: GAIN,
                    }}
                  />
                )}
              </Pressable>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

// ── Voicemail Tab ──────────────────────────────────────────────────────────────

function VoicemailTab({
  C,
  playingId,
  setPlayingId,
}: {
  C: ReturnType<typeof useColors>;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
}) {
  const handlePlay = (vm: Voicemail) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayingId(playingId === vm.id ? null : vm.id);
  };

  return (
    <View>
      {VOICEMAILS.map((vm) => {
        const isPlaying = playingId === vm.id;
        return (
          <Pressable
            key={vm.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: C.separator,
              backgroundColor: pressed ? C.surface : 'transparent',
            })}
          >
            {/* Avatar */}
            <Avatar
              initials={vm.callerInitials}
              size={40}
              bg={C.surface}
              textColor={C.label}
              fontSize={15}
              fontWeight="700"
            />

            {/* Middle */}
            <View style={{ flex: 1 }}>
              {/* Name row + duration pill */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>
                  {vm.callerName}
                </Text>
                <View
                  style={{
                    backgroundColor: C.surface,
                    borderWidth: 1,
                    borderColor: C.separator,
                    borderRadius: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>
                    {vm.duration}
                  </Text>
                </View>
              </View>

              {/* Timestamp */}
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                {vm.timestamp}
              </Text>

              {/* Transcription — collapsed or expanded */}
              {isPlaying ? (
                <>
                  <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19, marginTop: 6 }}>
                    {vm.transcription}
                  </Text>

                  {/* Fake audio scrubber */}
                  <View
                    style={{
                      height: 3,
                      backgroundColor: C.surface,
                      borderRadius: 2,
                      marginTop: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: '40%',
                        height: 3,
                        backgroundColor: C.label,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>
                    Playing...
                  </Text>
                </>
              ) : (
                <Text
                  style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {vm.transcription}
                </Text>
              )}
            </View>

            {/* Play/Pause button */}
            <Pressable
              onPress={() => handlePlay(vm)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                borderWidth: 1,
                borderColor: C.separator,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              <IconSymbol
                name={isPlaying ? 'pause.fill' : 'play.fill'}
                size={14}
                color={C.label}
              />
            </Pressable>
          </Pressable>
        );
      })}

      {VOICEMAILS.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: C.secondary }}>No voicemails</Text>
        </View>
      )}
    </View>
  );
}

// ── Dialpad Overlay ────────────────────────────────────────────────────────────

function DialpadOverlay({
  C,
  insets,
  dialNumber,
  setDialNumber,
  onClose,
}: {
  C: ReturnType<typeof useColors>;
  insets: ReturnType<typeof useSafeAreaInsets>;
  dialNumber: string;
  setDialNumber: (n: string) => void;
  onClose: () => void;
}) {
  const handleDigit = (digit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDialNumber(dialNumber + digit);
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDialNumber(dialNumber.slice(0, -1));
  };

  const handleCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Calling', dialNumber || 'No number entered', [
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: C.bg,
      }}
    >
      {/* Close button */}
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute',
          top: insets.top + 16,
          right: 20,
          zIndex: 1,
          padding: 8,
        }}
        hitSlop={8}
      >
        <IconSymbol name="xmark" size={20} color={C.label} />
      </Pressable>

      {/* Content */}
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Number display */}
        <Text
          style={{
            fontSize: 40,
            fontWeight: '200',
            color: C.label,
            letterSpacing: 4,
            textAlign: 'center',
            minHeight: 60,
            marginBottom: 24,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {dialNumber || ' '}
        </Text>

        {/* Digit rows */}
        <View style={{ width: '100%', maxWidth: 300, gap: 12 }}>
          {DIALPAD_ROWS.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}
            >
              {row.map(({ digit, sub }) => (
                <Pressable
                  key={digit}
                  onPress={() => handleDigit(digit)}
                  style={({ pressed }) => ({
                    width: 75,
                    height: 75,
                    borderRadius: 37.5,
                    backgroundColor: pressed ? C.separator : C.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  })}
                >
                  <Text style={{ fontSize: 28, fontWeight: '300', color: C.label, lineHeight: 34 }}>
                    {digit}
                  </Text>
                  {sub ? (
                    <Text
                      style={{
                        fontSize: 9,
                        color: C.secondary,
                        letterSpacing: 0.5,
                        marginTop: -2,
                      }}
                    >
                      {sub}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Bottom action row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            maxWidth: 300,
            marginTop: 20,
          }}
        >
          {/* Left spacer */}
          <View style={{ flex: 1 }} />

          {/* Call button */}
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => ({
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: pressed ? '#4A7A5E' : GAIN,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: GAIN,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            })}
          >
            <IconSymbol name="phone.fill" size={28} color="#FFFFFF" />
          </Pressable>

          {/* Backspace */}
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Pressable
              onPress={handleBackspace}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setDialNumber('');
              }}
              hitSlop={12}
            >
              <IconSymbol name="delete.left" size={22} color={C.secondary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function PhoneScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const ownerTabs = ['Recents', 'Missed'] as const;
  const subTabs = ['Received', 'Missed'] as const;
  const tabs = isOwner ? ownerTabs : subTabs;

  const [activeTab, setActiveTab] = useState<string>('Recents');
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    if (isOwnerRef.current === isOwner) return;
    isOwnerRef.current = isOwner;
    setActiveTab(isOwner ? 'Recents' : 'Received');
  }, [isOwner]);

  const [dialpadVisible, setDialpadVisible] = useState(false);
  const [dialNumber, setDialNumber] = useState('');

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, [])
  );

  const handleOpenDialpad = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDialpadVisible(true);
    hideFooter();
  };

  const handleCloseDialpad = () => {
    setDialpadVisible(false);
    showFooter();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* ── Top Bar (absolute) ── */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          backgroundColor: C.bg,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: C.separator,
          opacity,
        }}
      >
        <View
          style={{
            height: TOP_BAR_H,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {/* Left — menu */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>

          {/* Center — screen pill */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: C.surface,
                borderWidth: 1,
                borderColor: C.separator,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: C.label }}
              >
                Calls
              </Text>
            </View>
          </View>

          {/* Right — role pill */}
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── ScrollView (all content) ── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H,
          paddingBottom: 49 + insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Filter pills ── */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          {tabs.map(tab => (
            <Pressable
              key={tab}
              onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
              style={{
                paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1,
                backgroundColor: activeTab === tab ? C.activePill : C.surface,
                borderColor: activeTab === tab ? C.activePill : C.separator,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === tab ? C.activePillText : C.secondary }}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Tab content ── */}
        <RecentsTab C={C} missedOnly={activeTab === 'Missed'} isOwner={isOwner} />
      </ScrollView>

      {/* ── Dialpad FAB ── */}
      {!dialpadVisible && (
        <Pressable
          onPress={handleOpenDialpad}
          style={({ pressed }) => ({
            position: 'absolute',
            right: 20,
            bottom: 49 + insets.bottom + 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: pressed ? '#4A7A5E' : GAIN,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6,
            zIndex: 20,
          })}
        >
          <IconSymbol name="phone.fill" size={24} color="#FFFFFF" />
        </Pressable>
      )}

      {/* ── Dialpad Overlay ── */}
      {dialpadVisible && (
        <DialpadOverlay
          C={C}
          insets={insets}
          dialNumber={dialNumber}
          setDialNumber={setDialNumber}
          onClose={handleCloseDialpad}
        />
      )}
    </View>
  );
}
