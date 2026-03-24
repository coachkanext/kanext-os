import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAuth } from '@/context/auth-context';

export default function ProfileEditScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state: authState } = useAuth();

  const sessionName = authState.session?.displayName ?? '';
  const sessionHandle = authState.session?.handle ?? '';
  const initials = sessionName.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const [fullName, setFullName] = useState(sessionName);
  const [handle, setHandle] = useState(sessionHandle);
  const [nameSelection, setNameSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const isDirty = fullName !== sessionName || handle !== sessionHandle;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <Pressable style={styles.avatarWrap}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <IconSymbol name="camera.fill" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.changePhoto}>Edit photo</Text>
        </Pressable>

        {/* Display Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>NAME</Text>
          <View style={[styles.fieldRow, { borderBottomColor: C.separator }]}>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setNameSelection({ start: fullName.length, end: fullName.length })}
              onSelectionChange={() => setNameSelection(undefined)}
              selection={nameSelection}
              placeholderTextColor={C.muted}
            />
          </View>
        </View>

        {/* Username */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>USERNAME</Text>
          <View style={[styles.fieldRow, { borderBottomColor: C.separator }]}>
            <Text style={[styles.fieldAtSign, { color: C.label }]}>@</Text>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              value={handle}
              onChangeText={(t) => setHandle(t.replace(/[^a-z0-9_]/g, '').toLowerCase())}
              onBlur={() => setHandle(sessionHandle)}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={C.muted}
              placeholder="username"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.helperText, { color: C.muted }]}>
            Username can be changed anytime. Old handle locked 30 days before release.
          </Text>
        </View>

        {/* Create Organization */}
        <View style={[styles.dividerLine, { backgroundColor: C.separator }]} />
        <Pressable
          style={({ pressed }) => [styles.createOrgRow, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/settings/create-org' as any)}
        >
          <View style={styles.createOrgIcon}>
            <IconSymbol name="plus" size={20} color={C.secondary} />
          </View>
          <View style={styles.createOrgInfo}>
            <Text style={[styles.createOrgTitle, { color: C.label }]}>Create Organization</Text>
            <Text style={[styles.createOrgSub, { color: C.muted }]}>Start a new org in any mode</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={C.muted} />
        </Pressable>
        <View style={[styles.dividerLine, { backgroundColor: C.separator }]} />
      </ScrollView>

      {/* Save button — sits above the universal footer */}
      <View style={[styles.saveWrap, { paddingBottom: insets.bottom + 49 + 12 }]}>
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
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scroll: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 24 },

  // Avatar
  avatarWrap: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.07)', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 38, fontWeight: '600', color: C.secondary },
  cameraBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#F8F7F4',
  },
  changePhoto: { marginTop: 10, fontSize: 15, fontWeight: '500', color: '#4A6D8C' },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10,
  },
  fieldAtSign: { fontSize: 17, fontWeight: '400', marginRight: 1 },
  fieldInput: { flex: 1, fontSize: 17, fontWeight: '400' },
  helperText: { fontSize: 12, marginTop: 8, lineHeight: 17 },

  // Divider
  dividerLine: { height: StyleSheet.hairlineWidth, marginBottom: 0 },

  // Create Org
  createOrgRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 14,
  },
  createOrgIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  createOrgInfo: { flex: 1, minWidth: 0 },
  createOrgTitle: { fontSize: 16, fontWeight: '600' },
  createOrgSub: { fontSize: 13, marginTop: 2 },

  // Save
  saveWrap: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: '#F8F7F4' },
  saveBtn: { backgroundColor: '#111111', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#C7C7CC' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
