import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

export default function ProfileEditScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fullName, setFullName] = useState('Coach Williams');
  const [displayName, setDisplayName] = useState('Coach Williams');
  const [bio, setBio] = useState('');
  const isDirty = fullName !== 'Coach Williams' || displayName !== 'Coach Williams' || bio !== '';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <Pressable style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>CW</Text>
          </View>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </Pressable>

        {/* Fields */}
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: C.muted }]}>Full Name</Text>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: C.muted }]}>Display Name</Text>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: C.muted }]}>Bio</Text>
              <Text style={[styles.charCount, { color: C.muted }]}>{bio.length}/160</Text>
            </View>
            <TextInput
              style={[styles.fieldInput, styles.bioInput, { color: C.label }]}
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, 160))}
              multiline
              numberOfLines={3}
              placeholder="Tell people about yourself…"
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: C.muted }]}>Username</Text>
            <Text style={[styles.fieldInput, { color: C.muted }]}>@coachwilliams</Text>
            <Text style={[styles.helperText, { color: C.muted }]}>
              You can change your username once per year. Old name is locked for 90 days.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.saveWrap, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.saveBtn, !isDirty && styles.saveBtnDisabled]}
          onPress={isDirty ? () => router.back() : undefined}
          disabled={!isDirty}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 36, fontWeight: '700', color: C.secondary },
  changePhoto: { marginTop: 10, fontSize: 15, fontWeight: '500', color: '#007AFF' },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  field: { paddingHorizontal: 16, paddingVertical: 14 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  charCount: { fontSize: 12 },
  fieldInput: { fontSize: 15, fontWeight: '400' },
  bioInput: { minHeight: 60 },
  helperText: { fontSize: 12, marginTop: 6, lineHeight: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  saveWrap: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#F6F6F6' },
  saveBtn: {
    backgroundColor: '#111111', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#C7C7CC' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
