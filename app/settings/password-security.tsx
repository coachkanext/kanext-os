import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

function passwordStrength(p: string): { label: string; color: string; width: number } {
  if (p.length === 0) return { label: '', color: '#E5E7EB', width: 0 };
  if (p.length < 6) return { label: 'Weak', color: '#B85C5C', width: 0.25 };
  if (p.length < 10) return { label: 'Medium', color: '#B8943E', width: 0.6 };
  return { label: 'Strong', color: '#5A8A6E', width: 1 };
}

export default function PasswordSecurityScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [twoFa, setTwoFa] = useState(false);

  const strength = passwordStrength(newPw);

  const SESSIONS = [
    { device: 'iPhone 15 Pro', location: 'Miami, FL', lastActive: '2 minutes ago', isCurrent: true },
    { device: 'iPad Pro', location: 'Miami, FL', lastActive: '3 days ago', isCurrent: false },
    { device: 'MacBook Pro', location: 'Coral Gables, FL', lastActive: '1 week ago', isCurrent: false },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Password & Security</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Change Password */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>CHANGE PASSWORD</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              placeholder="Current password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={current}
              onChangeText={setCurrent}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              placeholder="New password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />
          </View>
          {newPw.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { backgroundColor: strength.color, flex: strength.width }]} />
                <View style={{ flex: 1 - strength.width }} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.fieldInput, { color: C.label }]}
              placeholder="Confirm new password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => {}}
        >
          <Text style={styles.saveBtnText}>Update Password</Text>
        </Pressable>

        {/* 2FA */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>TWO-FACTOR AUTHENTICATION</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#111' }]}>
              <IconSymbol name="lock.shield" size={16} color="#FFF" />
            </View>
            <Text style={[styles.rowLabel, { color: C.label }]}>Two-Factor Authentication</Text>
            <Switch
              value={twoFa}
              onValueChange={setTwoFa}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
              thumbColor="#FFF"
            />
          </View>
          {twoFa && (
            <>
              <View style={[styles.divider, { backgroundColor: C.separator }]} />
              <Pressable style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label }]}>View Recovery Codes</Text>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
              <View style={[styles.divider, { backgroundColor: C.separator }]} />
              <Pressable style={styles.row}>
                <Text style={[styles.disableText]}>Disable 2FA</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Sessions */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>ACTIVE SESSIONS</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {SESSIONS.map((s, i) => (
            <React.Fragment key={s.device}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={styles.sessionHeader}>
                    <Text style={[styles.sessionDevice, { color: C.label }]}>{s.device}</Text>
                    {s.isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>This device</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.sessionMeta, { color: C.muted }]}>
                    {s.location} · {s.lastActive}
                  </Text>
                </View>
                {!s.isCurrent && (
                  <Pressable style={styles.signOutBtn}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </Pressable>
                )}
              </View>
            </React.Fragment>
          ))}
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <Pressable style={[styles.row, { justifyContent: 'center' }]}>
            <Text style={styles.signOutAllText}>Sign out all other sessions</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.7, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 6,
  },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 14 },
  fieldInput: { fontSize: 15 },
  strengthRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  strengthBar: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', flexDirection: 'row', overflow: 'hidden',
  },
  strengthFill: { borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', minWidth: 48 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  disableText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#B85C5C', textAlign: 'center' },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDevice: { fontSize: 15, fontWeight: '500' },
  currentBadge: {
    backgroundColor: '#DCFCE7', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 11, fontWeight: '600', color: '#166534' },
  sessionMeta: { fontSize: 13, marginTop: 2 },
  signOutBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  signOutText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  signOutAllText: { fontSize: 15, fontWeight: '500', color: '#B85C5C' },
  saveBtn: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#111', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
