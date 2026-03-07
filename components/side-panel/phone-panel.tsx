/**
 * Phone Side Panel — Contacts, Favorites, Voicemail, Dial Pad,
 * My Numbers, Blocked Numbers, Call Settings.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useMode } from '@/context/app-context';
import {
  PHONE_CONTACTS,
  VOICEMAILS,
  MY_KANEXT_NUMBERS,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  getFavoriteContacts,
  type PhoneContact,
  type Voicemail,
} from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: 'rgba(255,255,255,0.08)',
};

const DIAL_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const DIAL_LETTERS: Record<string, string> = {
  '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
  '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
  '0': '+',
};

// ── Section components ──

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

// ── Contacts section ──

function ContactRow({ contact, accent }: { contact: PhoneContact; accent: string }) {
  const badgeColor = MODE_BADGE_COLORS[contact.mode];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.contactRow,
        pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        initiateCall({
          contactName: contact.name,
          contactInitials: contact.initials,
          mode: contact.mode,
          type: 'audio',
        });
      }}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactInitials}>{contact.initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
          {contact.isFavorite && (
            <IconSymbol name="star.fill" size={10} color="#F59E0B" />
          )}
        </View>
        <View style={styles.contactMeta}>
          <Text style={styles.contactUsername}>{contact.username}</Text>
          <View style={[styles.contactBadge, { backgroundColor: badgeColor + '22' }]}>
            <Text style={[styles.contactBadgeText, { color: badgeColor }]}>
              {MODE_BADGE_LABELS[contact.mode]}
            </Text>
          </View>
        </View>
      </View>
      <IconSymbol name="phone.fill" size={16} color={accent} />
    </Pressable>
  );
}

// ── Voicemail section ──

function VoicemailRow({ vm, accent }: { vm: Voicemail; accent: string }) {
  const [expanded, setExpanded] = useState(false);
  const badgeColor = MODE_BADGE_COLORS[vm.mode];

  return (
    <Pressable
      style={styles.vmRow}
      onPress={() => setExpanded((v) => !v)}
    >
      <View style={styles.vmHeader}>
        <View style={styles.vmAvatar}>
          <Text style={styles.vmInitials}>{vm.callerInitials}</Text>
        </View>
        <View style={styles.vmInfo}>
          <View style={styles.vmNameRow}>
            <Text style={styles.vmName} numberOfLines={1}>{vm.callerName}</Text>
            <View style={[styles.contactBadge, { backgroundColor: badgeColor + '22' }]}>
              <Text style={[styles.contactBadgeText, { color: badgeColor }]}>
                {MODE_BADGE_LABELS[vm.mode]}
              </Text>
            </View>
          </View>
          <Text style={styles.vmMeta}>{vm.duration} · {vm.timestamp}</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Play voicemail placeholder
          }}
        >
          <IconSymbol name="play.circle.fill" size={24} color={accent} />
        </Pressable>
      </View>
      {expanded && (
        <Text style={styles.vmTranscription}>{vm.transcription}</Text>
      )}
    </Pressable>
  );
}

// ── Dial pad section ──

function DialPadSection({ accent }: { accent: string }) {
  const [digits, setDigits] = useState('');

  return (
    <View style={styles.dialSection}>
      {/* Display */}
      <View style={styles.dialDisplay}>
        <TextInput
          style={styles.dialInput}
          value={digits}
          onChangeText={setDigits}
          placeholder="Enter number"
          placeholderTextColor={C.muted}
          keyboardType="phone-pad"
        />
        {digits.length > 0 && (
          <Pressable onPress={() => setDigits('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>

      {/* Mini dial pad */}
      {DIAL_KEYS.map((row, ri) => (
        <View key={ri} style={styles.dialRow}>
          {row.map((key) => (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.dialKey,
                pressed && { backgroundColor: 'rgba(255,255,255,0.1)' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDigits((d) => d + key);
              }}
            >
              <Text style={styles.dialKeyDigit}>{key}</Text>
              {DIAL_LETTERS[key] && (
                <Text style={styles.dialKeyLetters}>{DIAL_LETTERS[key]}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}

      {/* Call button */}
      {digits.length > 0 && (
        <Pressable
          style={[styles.dialCallBtn, { backgroundColor: '#34D399' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // External call placeholder
          }}
        >
          <IconSymbol name="phone.fill" size={20} color="#FFFFFF" />
          <Text style={styles.dialCallText}>Call</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Main panel ──

export function PhonePanel() {
  const accent = useAccentColor();
  const mode = useMode();
  const [search, setSearch] = useState('');

  const favorites = getFavoriteContacts();
  const allContacts = search.trim()
    ? PHONE_CONTACTS.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()))
    : PHONE_CONTACTS;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search */}
      <View style={styles.searchWrap}>
        <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>

      {/* Favorites */}
      {!search.trim() && favorites.length > 0 && (
        <>
          <SectionHeader title="Favorites" />
          {favorites.map((c) => (
            <ContactRow key={c.id} contact={c} accent={accent} />
          ))}
          <Divider />
        </>
      )}

      {/* Contacts */}
      <SectionHeader title="Contacts" />
      {allContacts.map((c) => (
        <ContactRow key={c.id} contact={c} accent={accent} />
      ))}
      {allContacts.length === 0 && (
        <Text style={styles.emptyText}>No contacts found</Text>
      )}

      <Divider />

      {/* Voicemail */}
      {!search.trim() && (
        <>
          <SectionHeader title="Voicemail" />
          {VOICEMAILS.length === 0 ? (
            <Text style={styles.emptyText}>No voicemails</Text>
          ) : (
            VOICEMAILS.map((vm) => (
              <VoicemailRow key={vm.id} vm={vm} accent={accent} />
            ))
          )}

          <Divider />

          {/* Dial Pad */}
          <SectionHeader title="Dial Pad" />
          <DialPadSection accent={accent} />

          <Divider />

          {/* My Numbers */}
          <SectionHeader title="My Numbers" />
          {MY_KANEXT_NUMBERS.map((num) => {
            const badgeColor = MODE_BADGE_COLORS[num.mode];
            return (
              <View key={num.mode} style={styles.numberRow}>
                <View style={[styles.contactBadge, { backgroundColor: badgeColor + '22' }]}>
                  <Text style={[styles.contactBadgeText, { color: badgeColor }]}>
                    {num.label}
                  </Text>
                </View>
                <Text style={styles.numberText}>{num.number}</Text>
              </View>
            );
          })}

          <Divider />

          {/* Settings rows */}
          <SectionHeader title="Settings" />
          {[
            { icon: 'hand.raised.fill', label: 'Blocked Numbers' },
            { icon: 'bell.fill', label: 'Ringtone per Mode' },
            { icon: 'moon.fill', label: 'Do Not Disturb' },
            { icon: 'arrow.uturn.forward', label: 'Call Forwarding' },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.settingsRow,
                pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
              ]}
            >
              <IconSymbol name={item.icon as any} size={16} color={C.secondary} />
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.label,
    padding: 0,
  },

  // Sections
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: C.muted,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Contact row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: C.secondary,
  },
  contactInfo: { flex: 1 },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
    flexShrink: 1,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactUsername: {
    fontSize: 12,
    color: C.muted,
  },
  contactBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  contactBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Voicemail
  vmRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  vmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vmAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vmInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.secondary,
  },
  vmInfo: { flex: 1 },
  vmNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vmName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
    flexShrink: 1,
  },
  vmMeta: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  vmTranscription: {
    fontSize: 13,
    color: C.secondary,
    lineHeight: 18,
    marginTop: 8,
    marginLeft: 42,
    fontStyle: 'italic',
  },

  // Dial pad
  dialSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dialDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
    marginBottom: 4,
  },
  dialInput: {
    flex: 1,
    fontSize: 16,
    color: C.label,
    padding: 0,
    letterSpacing: 1,
  },
  dialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dialKey: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialKeyDigit: {
    fontSize: 20,
    fontWeight: '400',
    color: C.label,
  },
  dialKeyLetters: {
    fontSize: 8,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 1,
    marginTop: -1,
  },
  dialCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
    gap: 8,
    marginTop: 4,
  },
  dialCallText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // My Numbers
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  numberText: {
    fontSize: 14,
    color: C.label,
    fontVariant: ['tabular-nums'],
  },

  // Settings
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: C.label,
  },
});
