/**
 * Edit Profile — Social profile editing.
 * Avatar tap-to-change (mock). Name + handle read-only (edit in Settings).
 * Bio editable, 160 char limit. One link URL. Brand context read-only.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';

const BIO_LIMIT = 160;
const INITIAL_BIO = "Building the operating system for communities. Let's get to work.";

export default function EditProfileScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext.mode;

  const [bio, setBio] = useState(INITIAL_BIO);
  const [link, setLink] = useState('');

  const isDirty = bio !== INITIAL_BIO || link !== '';

  const handleSave = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [router]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      Alert.alert('Discard changes?', "Your edits won't be saved.", [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }, [isDirty, router]);

  const brandLabel = mode === 'sports'    ? 'Varsity FC'
    : mode === 'business'  ? 'NovaTech Inc.'
    : mode === 'education' ? 'Lincoln Univ.'
    : mode === 'community' ? 'Grace Church'
    : 'KaNeXT';

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* Nav bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + 6, borderBottomColor: C.separator }]}>
        <Pressable style={styles.navSide} onPress={handleCancel} hitSlop={8}>
          <Text style={[styles.navCancel, { color: C.label }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: C.label }]}>Edit Profile</Text>
        <Pressable style={[styles.navSide, { alignItems: 'flex-end' }]} onPress={handleSave} hitSlop={8}>
          <Text style={[styles.navSave, { color: C.accent }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 48 }]}
      >
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <Pressable
            style={[styles.avatar, { backgroundColor: C.accent }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={styles.avatarInitials}>SK</Text>
            <View style={[styles.cameraBadge, { backgroundColor: C.label, borderColor: C.bg }]}>
              <IconSymbol name="camera.fill" size={11} color={C.bg} />
            </View>
          </Pressable>
          <Text style={[styles.changePhoto, { color: C.accent }]}>Change photo</Text>
        </View>

        {/* ── Account info (read-only) ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.secondary }]}>ACCOUNT</Text>
          <View style={[styles.card, { borderColor: C.inputBorder, backgroundColor: C.surface }]}>
            <View style={[styles.row, { borderBottomColor: C.separator }]}>
              <Text style={[styles.rowLabel, { color: C.secondary }]}>Name</Text>
              <Text style={[styles.rowValueMuted, { color: C.muted }]}>Sammy Kalejaiye</Text>
              <IconSymbol name="lock.fill" size={12} color={C.muted} />
            </View>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: C.secondary }]}>Username</Text>
              <Text style={[styles.rowValueMuted, { color: C.muted }]}>@sammyk</Text>
              <IconSymbol name="lock.fill" size={12} color={C.muted} />
            </View>
          </View>
          <Pressable
            style={styles.settingsLink}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="arrow.up.right" size={12} color={C.accent} />
            <Text style={[styles.settingsLinkText, { color: C.accent }]}>
              Edit name and username in Profile Settings
            </Text>
          </Pressable>
        </View>

        {/* ── Bio ── */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={[styles.sectionLabel, { color: C.secondary }]}>BIO</Text>
            <Text style={[
              styles.charCount,
              { color: bio.length >= BIO_LIMIT ? C.red : C.muted },
            ]}>
              {bio.length}/{BIO_LIMIT}
            </Text>
          </View>
          <TextInput
            style={[styles.bioInput, { color: C.label, borderColor: C.inputBorder, backgroundColor: C.surface }]}
            value={bio}
            onChangeText={t => setBio(t.slice(0, BIO_LIMIT))}
            placeholder="Tell people about yourself…"
            placeholderTextColor={C.muted}
            multiline
            textAlignVertical="top"
            autoCorrect
          />
        </View>

        {/* ── Link ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.secondary }]}>LINK</Text>
          <View style={[styles.linkWrap, { borderColor: C.inputBorder, backgroundColor: C.surface }]}>
            <IconSymbol name="link" size={16} color={C.muted} />
            <TextInput
              style={[styles.linkInput, { color: C.label }]}
              value={link}
              onChangeText={setLink}
              placeholder="https://yoursite.com"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
            />
            {link.length > 0 ? (
              <Pressable onPress={() => setLink('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.hint, { color: C.muted }]}>One link shown on your profile.</Text>
        </View>

        {/* ── Brand context (read-only) ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.secondary }]}>BRAND</Text>
          <View style={[styles.brandCard, { borderColor: C.inputBorder, backgroundColor: C.surface }]}>
            <View style={[styles.brandDot, { backgroundColor: C.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.brandName, { color: C.label }]}>{brandLabel}</Text>
              <Text style={[styles.brandRole, { color: C.secondary }]}>Owner</Text>
            </View>
            <IconSymbol name="lock.fill" size={12} color={C.muted} />
          </View>
          <Text style={[styles.hint, { color: C.muted }]}>Brand and role are set by your organization.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Nav
  navBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navSide: { width: 80, paddingHorizontal: 8 },
  navCancel: { fontSize: 16 },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  navSave: { fontSize: 16, fontWeight: '600' },

  // Body
  body: { paddingTop: 32, gap: 28 },

  // Avatar
  avatarSection: { alignItems: 'center', gap: 10 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: '#fff' },
  cameraBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  changePhoto: { fontSize: 14, fontWeight: '500' },

  // Sections
  section: { paddingHorizontal: 20, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 12, fontWeight: '500' },

  // Card rows (read-only)
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 15, width: 88, flexShrink: 0 },
  rowValueMuted: { flex: 1, fontSize: 15 },

  settingsLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  settingsLinkText: { fontSize: 13 },

  // Bio
  bioInput: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, lineHeight: 22, minHeight: 108,
  },

  // Link
  linkWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  linkInput: { flex: 1, fontSize: 15 },

  hint: { fontSize: 12 },

  // Brand
  brandCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 12,
  },
  brandDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  brandName: { fontSize: 15, fontWeight: '600' },
  brandRole: { fontSize: 13, marginTop: 1 },
});
