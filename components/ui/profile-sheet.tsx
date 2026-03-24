/**
 * Universal Profile Bottom Sheet.
 * Triggered via openProfileSheet() from anywhere in the app.
 * Mounted once in app/_layout.tsx.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { initiateCall } from '@/utils/global-call';
import {
  subscribeProfileSheet,
  closeProfileSheet,
  type ProfileSheetInfo,
} from '@/utils/global-profile-sheet';

const PHONE_LABEL_OPTIONS = ['Mobile', 'Home', 'Work', 'Business', 'Sports', 'Personal'];

function generatePhone(handle: string): string {
  let h = 0;
  for (let i = 0; i < handle.length; i++) {
    h = Math.imul(31, h) + handle.charCodeAt(i) | 0;
  }
  h = Math.abs(h);
  const area = 200 + (h % 800);
  const mid  = String(100 + (h % 900)).padStart(3, '0');
  const last = String(1000 + ((h >> 4) % 9000)).padStart(4, '0');
  return `+1 (${area}) ${mid}-${last}`;
}

export function ProfileSheet() {
  const C = useColors();
  const router = useRouter();
  const [info, setInfo] = useState<ProfileSheetInfo | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [notes, setNotes] = useState('');
  const [personalPhones, setPersonalPhones] = useState<Array<{ label: string; number: string }>>([]);
  const [addingPhone, setAddingPhone] = useState(false);
  const [newPhoneNum, setNewPhoneNum] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('Mobile');

  useEffect(() => subscribeProfileSheet((newInfo) => {
    setInfo(newInfo);
    if (!newInfo) {
      setEditMode(false);
      setAddingPhone(false);
      setNewPhoneNum('');
      setPersonalPhones([]);
      setNotes('');
    }
  }), []);

  const close = () => closeProfileSheet();

  const systemPhones = useMemo(() => {
    if (!info) return [];
    const modeLabel = info.mode ? info.mode.charAt(0).toUpperCase() + info.mode.slice(1) : '';
    const label = [modeLabel, info.brand].filter(Boolean).join(' · ') || 'KaNeXT';
    if (info.phone) return [{ label, number: info.phone }];
    const handle = info.handle ?? info.name;
    return [{ label, number: generatePhone(handle) }];
  }, [info]);

  const email = useMemo(() => {
    if (!info) return '';
    if (info.email) return info.email;
    const handle = (info.handle ?? info.name).replace('@', '').toLowerCase().replace(/\s/g, '');
    return `${handle}@kanext.com`;
  }, [info]);

  const quickActions = useMemo(() => [
    {
      icon: 'message.fill',
      label: 'Send Message',
      onPress: () => {
        if (!info) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        close();
        const handle = info.handle ?? info.name.toLowerCase().replace(/\s/g, '');
        router.push({
          pathname: '/(tabs)/(main)/messages/[threadId]',
          params: { threadId: `dm-${handle}`, type: 'dm', title: info.name, username: info.handle ?? '' },
        });
      },
      destructive: false,
    },
    {
      icon: 'square.and.arrow.up',
      label: 'Share Contact',
      onPress: () => {
        if (!info) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Share.share({
          title: info.name,
          message: `${info.name}${info.handle ? ' · ' + info.handle : ''}${info.phone ? '\n' + info.phone : ''}${info.email ? '\n' + info.email : ''}`,
        });
      },
      destructive: false,
    },
    {
      icon: isFav ? 'star.fill' : 'star',
      label: isFav ? 'Remove from Favorites' : 'Add to Favorites',
      onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsFav(v => !v); },
      destructive: false,
    },
    {
      icon: 'minus.circle.fill',
      label: 'Block Contact',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
          'Block Contact',
          `Block ${info?.name}? They won't be able to message you.`,
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: close }],
        );
      },
      destructive: true,
    },
  ], [info, isFav]);

  return (
    <BottomSheet visible={!!info} onClose={close} useModal backgroundColor={C.bg}>
      {info && (
        <View>
          {/* Edit / Done */}
          <View style={ps.profileEditRow}>
            <Pressable
              style={ps.profileEditBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (editMode) { setEditMode(false); setAddingPhone(false); }
                else { setEditMode(true); }
              }}
            >
              <Text style={[ps.profileEditLabel, { color: C.accent }]}>{editMode ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={ps.profileHero}>
            <View style={[ps.profileAvatar, { backgroundColor: C.surface }]}>
              <Text style={[ps.profileInitials, { color: C.label }]}>{info.initials}</Text>
            </View>
            {editMode ? (
              <View style={ps.profileLockedNameRow}>
                <Text style={[ps.profileName, { color: C.muted }]}>{info.name}</Text>
                <IconSymbol name="lock.fill" size={12} color={C.muted} />
              </View>
            ) : (
              <Text style={[ps.profileName, { color: C.label }]}>{info.name}</Text>
            )}
            {info.handle && (
              <Text style={[ps.profileHandle, { color: C.secondary }]}>{info.handle}</Text>
            )}
            {(info.role || info.brand) && (
              <Text style={[ps.profileRole, { color: C.muted }]}>
                {[info.role, info.brand].filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>

          {/* Action buttons — hidden in edit mode */}
          {!editMode && (
            <View style={ps.profileActions}>
              {([
                { icon: 'phone.fill',    label: 'Call',    color: C.green,  type: 'audio' as const },
                { icon: 'video.fill',    label: 'Video',   color: C.accent, type: 'video' as const },
                { icon: 'message.fill',  label: 'Message', color: C.accent, type: null },
                { icon: 'envelope.fill', label: 'Email',   color: C.accent, type: null },
              ] as const).map(({ icon, label, color, type }) => (
                <Pressable
                  key={label}
                  style={ps.profileActionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (type) {
                      close();
                      initiateCall({ contactName: info.name, contactInitials: info.initials, mode: info.mode ?? 'business', type });
                    }
                  }}
                >
                  <View style={[ps.profileActionIcon, { backgroundColor: color + '22' }]}>
                    <IconSymbol name={icon} size={22} color={color} />
                  </View>
                  <Text style={[ps.profileActionLabel, { color: C.secondary }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Contact info card */}
          <View style={[ps.profileInfoCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
            {/* System phones — locked in edit mode */}
            {systemPhones.map((ph, i) => (
              <React.Fragment key={ph.number}>
                {editMode ? (
                  <View style={[ps.profileInfoRow, { backgroundColor: C.surfacePressed }]}>
                    <IconSymbol name="phone" size={16} color={C.muted} />
                    <View style={{ flex: 1 }}>
                      <Text style={[ps.profileInfoText, { color: C.muted }]}>{ph.number}</Text>
                      <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{ph.label}</Text>
                    </View>
                    <IconSymbol name="lock.fill" size={12} color={C.muted} />
                  </View>
                ) : (
                  <Pressable
                    style={ps.profileInfoRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      close();
                      initiateCall({ contactName: info.name, contactInitials: info.initials, mode: info.mode ?? 'business', type: 'audio' });
                    }}
                  >
                    <IconSymbol name="phone" size={16} color={C.secondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[ps.profileInfoText, { color: C.label }]}>{ph.number}</Text>
                      <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{ph.label}</Text>
                    </View>
                  </Pressable>
                )}
                {i < systemPhones.length - 1 && <View style={[ps.profileInfoDivider, { backgroundColor: C.separator }]} />}
              </React.Fragment>
            ))}

            {/* Personal phones — editable, deletable */}
            {personalPhones.map((ph, i) => (
              <React.Fragment key={i}>
                <View style={[ps.profileInfoDivider, { backgroundColor: C.separator }]} />
                <View style={ps.profileInfoRow}>
                  <IconSymbol name="phone" size={16} color={C.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[ps.profileInfoText, { color: C.label }]}>{ph.number}</Text>
                    <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{ph.label}</Text>
                  </View>
                  {editMode && (
                    <Pressable onPress={() => setPersonalPhones(prev => prev.filter((_, idx) => idx !== i))} hitSlop={12}>
                      <IconSymbol name="minus.circle.fill" size={18} color={C.red} />
                    </Pressable>
                  )}
                </View>
              </React.Fragment>
            ))}

            {/* Add phone (edit mode) */}
            {editMode && (
              <>
                <View style={[ps.profileInfoDivider, { backgroundColor: C.separator }]} />
                {addingPhone ? (
                  <View style={ps.editPhoneForm}>
                    <TextInput
                      style={[ps.editPhoneInput, { color: C.label, borderColor: C.separator }]}
                      value={newPhoneNum}
                      onChangeText={setNewPhoneNum}
                      placeholder="Phone number"
                      placeholderTextColor={C.muted}
                      keyboardType="phone-pad"
                      autoFocus
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={ps.editPhoneModes}>
                        {PHONE_LABEL_OPTIONS.map(lbl => (
                          <Pressable
                            key={lbl}
                            onPress={() => setNewPhoneLabel(lbl)}
                            style={[ps.editPhoneModePill, { backgroundColor: newPhoneLabel === lbl ? C.accent : C.surfacePressed }]}
                          >
                            <Text style={{ fontSize: 13, color: newPhoneLabel === lbl ? '#fff' : C.label }}>{lbl}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                    <View style={ps.editPhoneActions}>
                      <Pressable onPress={() => { setAddingPhone(false); setNewPhoneNum(''); }} hitSlop={8}>
                        <Text style={{ color: C.secondary, fontSize: 15 }}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (!newPhoneNum.trim()) return;
                          setPersonalPhones(prev => [...prev, { label: newPhoneLabel, number: newPhoneNum.trim() }]);
                          setNewPhoneNum(''); setAddingPhone(false);
                        }}
                        hitSlop={8}
                      >
                        <Text style={{ color: C.accent, fontSize: 15, fontWeight: '600' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={ps.profileInfoRow}
                    onPress={() => { setAddingPhone(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <IconSymbol name="plus.circle.fill" size={16} color={C.accent} />
                    <Text style={[ps.profileInfoText, { color: C.accent }]}>Add Phone</Text>
                  </Pressable>
                )}
              </>
            )}

            {/* Email */}
            <View style={[ps.profileInfoDivider, { backgroundColor: C.separator }]} />
            {editMode ? (
              <View style={[ps.profileInfoRow, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name="envelope" size={16} color={C.muted} />
                <Text style={[ps.profileInfoText, { color: C.muted }]} numberOfLines={1}>{email}</Text>
                <IconSymbol name="lock.fill" size={12} color={C.muted} />
              </View>
            ) : (
              <View style={ps.profileInfoRow}>
                <IconSymbol name="envelope" size={16} color={C.secondary} />
                <Text style={[ps.profileInfoText, { color: C.label }]} numberOfLines={1}>{email}</Text>
              </View>
            )}

            {/* Username */}
            {info.handle && (
              <>
                <View style={[ps.profileInfoDivider, { backgroundColor: C.separator }]} />
                {editMode ? (
                  <View style={[ps.profileInfoRow, { backgroundColor: C.surfacePressed }]}>
                    <IconSymbol name="at" size={16} color={C.muted} />
                    <Text style={[ps.profileInfoText, { color: C.muted }]} numberOfLines={1}>{info.handle.replace('@', '')}</Text>
                    <IconSymbol name="lock.fill" size={12} color={C.muted} />
                  </View>
                ) : (
                  <View style={ps.profileInfoRow}>
                    <IconSymbol name="at" size={16} color={C.secondary} />
                    <Text style={[ps.profileInfoText, { color: C.label }]} numberOfLines={1}>{info.handle.replace('@', '')}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Notes — edit mode only */}
          {editMode && (
            <View style={[ps.profileInfoCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <View style={[ps.profileInfoRow, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                <IconSymbol name="note.text" size={16} color={C.secondary} style={{ marginTop: 2 }} />
                <TextInput
                  style={[ps.profileInfoText, { color: C.label, minHeight: 56, textAlignVertical: 'top' }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Notes"
                  placeholderTextColor={C.muted}
                  multiline
                />
              </View>
            </View>
          )}

          {/* Quick actions — hidden in edit mode */}
          {!editMode && (
            <View style={[ps.profileQuickActions, { backgroundColor: C.surface, borderColor: C.separator }]}>
              {quickActions.map((action, i) => (
                <React.Fragment key={action.label}>
                  <Pressable
                    style={({ pressed }) => [ps.profileQuickRow, pressed && { backgroundColor: C.surfacePressed }]}
                    onPress={action.onPress}
                  >
                    <IconSymbol name={action.icon as any} size={18} color={action.destructive ? C.red : C.label} />
                    <Text style={[ps.profileQuickLabel, { color: action.destructive ? C.red : C.label }]}>
                      {action.label}
                    </Text>
                  </Pressable>
                  {i < quickActions.length - 1 && <View style={[ps.profileQuickDivider, { backgroundColor: C.separator }]} />}
                </React.Fragment>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </View>
      )}
    </BottomSheet>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const ps = StyleSheet.create({
  profileEditRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  profileEditBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  profileEditLabel: { fontSize: 16, fontWeight: '500' },

  profileHero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 3,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  profileInitials: { fontSize: 28, fontWeight: '700' },
  profileLockedNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileName: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  profileHandle: { fontSize: 14, fontWeight: '400' },
  profileRole: { fontSize: 13, textAlign: 'center' },

  profileActions: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  profileActionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  profileActionIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  profileActionLabel: { fontSize: 12, fontWeight: '500' },

  profileInfoCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  profileInfoText: { flex: 1, fontSize: 15 },
  profileInfoDivider: { height: StyleSheet.hairlineWidth, marginLeft: 44 },

  profileQuickActions: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  profileQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    height: 50,
  },
  profileQuickLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
  profileQuickDivider: { height: StyleSheet.hairlineWidth, marginLeft: 48 },

  editPhoneForm: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  editPhoneInput: {
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editPhoneModes: { flexDirection: 'row', gap: 8 },
  editPhoneModePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editPhoneActions: { flexDirection: 'row', justifyContent: 'space-between' },
});
