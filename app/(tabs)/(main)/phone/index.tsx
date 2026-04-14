/**
 * Phone — universal to all modes. (Section 7, KaNeXT Product Spec)
 * Centered pill dropdown: Calls | Missed | Voicemail | Contacts
 * Calls: favorites row + all recents. Missed: missed only (red). Voicemail: voicemail list.
 * Contacts: my profile card + alpha-grouped list + group filter pills.
 * Two stacked FABs (dialer + search), bottom-right above footer.
 * Long-press → iOS context menu. Tap contact → profile bottom sheet.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, SectionList, StyleSheet, TextInput, Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode, useAppContext } from '@/context/app-context';
import { useRouter } from 'expo-router';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { initiateCall } from '@/utils/global-call';
import { openProfileSheet } from '@/utils/global-profile-sheet';
import {
  RECENT_CALLS, PHONE_CONTACTS, VOICEMAILS, MY_KANEXT_NUMBERS, CONTACT_PHONES,
  type RecentCall, type PhoneContact, type Voicemail, type CallDirection,
} from '@/data/mock-phone';

type PhoneTab = 'Calls' | 'Missed' | 'Voicemail' | 'Contacts';
type ExpandedSection = 'calls' | 'voicemails' | 'contacts' | null;

type ContextMenuItem = {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type ContextMenuState = {
  visible: boolean;
  items: ContextMenuItem[];
  anchorY: number;
};

type ContactContextMenuState = ContextMenuState & { contact: PhoneContact | null };

const PHONE_TABS: PhoneTab[] = ['Calls', 'Missed', 'Voicemail', 'Contacts'];
const FOOTER_HEIGHT = 49;
const PILLS_ROW_H = 46;
const SEARCH_BAR_HEIGHT = 52;
const SECTION_MAX = 3;

const CONTACT_GROUPS: Record<string, string[]> = {
  business: ['All', 'Leadership', 'Product', 'Engineering', 'Operations'],
  sports:   ['All', 'Coaching', 'Players', 'Support', 'Staff'],
  education:['All', 'Faculty', 'Students', 'Staff', 'Alumni'],
  community:['All', 'Leadership', 'Ministry', 'Volunteers', 'Members'],
};

const FULL_ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];
const PHONE_LABEL_OPTIONS = ['Mobile', 'Home', 'Work', 'Business', 'Sports', 'Personal'];
type AddContactStep = 'menu' | 'kanext' | 'external';

// ── Helpers ───────────────────────────────────────────────────────────────────

function directionIcon(d: CallDirection): string {
  if (d === 'video') return 'video.fill';
  if (d === 'outgoing') return 'arrow.up.right';
  return 'arrow.down.left';
}

function directionLabel(d: CallDirection): string {
  if (d === 'video') return 'Video';
  if (d === 'outgoing') return 'Outgoing';
  if (d === 'missed') return 'Missed';
  return 'Incoming';
}

// ── Row / card components ─────────────────────────────────────────────────────

function FavoriteCard({
  contact, C, styles, onPress, editMode, onRemove,
}: {
  contact: PhoneContact; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  editMode?: boolean; onRemove?: () => void;
}) {
  return (
    <Pressable style={styles.favCard} onPress={editMode ? undefined : onPress}>
      <View style={[styles.favAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.favInitials}>{contact.initials}</Text>
        {contact.online && !editMode && (
          <View style={[styles.rowOnlineDot, { backgroundColor: C.green, borderColor: C.surface }]} />
        )}
        {editMode && (
          <Pressable
            style={[styles.favRemoveBtn, { backgroundColor: C.red, borderColor: C.bg }]}
            onPress={onRemove}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <IconSymbol name="minus" size={10} color="#FFF" />
          </Pressable>
        )}
      </View>
      <Text style={styles.favName} numberOfLines={1}>{contact.name.split(' ')[0]}</Text>
    </Pressable>
  );
}

function RecentRow({
  call, C, styles, onPress, onLongPress, selectMode, selected, onToggle,
}: {
  call: RecentCall; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  onLongPress?: (pageY: number) => void;
  selectMode?: boolean; selected?: boolean; onToggle?: () => void;
}) {
  const isMissed = call.direction === 'missed';
  const dirColor = isMissed ? C.red : C.secondary;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={selectMode ? onToggle : onPress}
      onLongPress={(!selectMode && onLongPress) ? (e) => onLongPress(e.nativeEvent.pageY) : undefined}
      delayLongPress={350}
    >
      {selectMode && (
        <View style={[styles.selectCircle, selected && { backgroundColor: C.accent, borderColor: C.accent }]}>
          {selected && <IconSymbol name="checkmark" size={11} color="#FFF" />}
        </View>
      )}
      <View style={[styles.rowAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.rowInitials}>{call.initials}</Text>
        {call.hasVoicemail && (
          <View style={[styles.vmBadge, { backgroundColor: C.red, borderColor: C.bg }]} />
        )}
        {call.online && (
          <View style={[styles.rowOnlineDot, { backgroundColor: C.green, borderColor: C.surface }]} />
        )}
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, isMissed && { color: C.red }]}>{call.name}</Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowHandle, { color: C.muted }]}>{call.username}</Text>
          <Text style={[styles.rowSub, { color: C.muted }]}> · </Text>
          <IconSymbol name={directionIcon(call.direction) as any} size={11} color={dirColor} />
          <Text style={[styles.rowSub, { color: dirColor }]}>
            {' '}{directionLabel(call.direction)}{call.duration ? ` · ${call.duration}` : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.rowTimestamp}>{call.timestamp}</Text>
      <Pressable
        style={styles.callBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          initiateCall({
            contactName: call.name,
            contactInitials: call.initials,
            mode: call.mode,
            type: call.direction === 'video' ? 'video' : 'audio',
          });
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconSymbol
          name={call.direction === 'video' ? 'video.fill' : 'phone.fill'}
          size={16}
          color={C.accent}
        />
      </Pressable>
    </Pressable>
  );
}

function VoicemailRow({
  vm, C, styles, onPress, onLongPress,
}: {
  vm: Voicemail; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  onLongPress?: (pageY: number) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
      onLongPress={onLongPress ? (e) => onLongPress(e.nativeEvent.pageY) : undefined}
      delayLongPress={350}
    >
      <View style={[styles.rowAvatar, { backgroundColor: C.surface }]}>
        <Text style={styles.rowInitials}>{vm.callerInitials}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{vm.callerName}</Text>
        <Text style={[styles.rowSub, { color: C.muted }]} numberOfLines={1}>{vm.transcription}</Text>
      </View>
      <View style={styles.vmMeta}>
        <Text style={styles.rowTimestamp}>{vm.timestamp}</Text>
        <Text style={[styles.vmDuration, { color: C.muted }]}>{vm.duration}</Text>
      </View>
      <Pressable
        style={styles.callBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          initiateCall({
            contactName: vm.callerName,
            contactInitials: vm.callerInitials,
            mode: vm.mode,
            type: 'audio',
          });
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconSymbol name="phone.fill" size={16} color={C.accent} />
      </Pressable>
    </Pressable>
  );
}

function ContactRow({
  contact, C, styles, onPress, onLongPress,
}: {
  contact: PhoneContact; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
  onLongPress?: (pageY: number) => void;
}) {
  // Split "First Last" → first name (normal) + last name (bold)
  const parts = contact.name.trim().split(' ');
  const lastName = parts.pop() ?? '';
  const firstName = parts.join(' ');

  return (
    <Pressable
      style={({ pressed }) => [styles.contactRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
      onLongPress={onLongPress ? (e) => onLongPress(e.nativeEvent.pageY) : undefined}
      delayLongPress={350}
    >
      <View style={[styles.contactAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.contactInitials, { color: C.label }]}>{contact.initials}</Text>
        {contact.online && (
          <View style={[styles.rowOnlineDot, { backgroundColor: C.green, borderColor: C.surface }]} />
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: C.label }]} numberOfLines={1}>
          {firstName ? `${firstName} ` : ''}
          <Text style={styles.contactNameBold}>{lastName}</Text>
        </Text>
        <Text style={[styles.contactHandle, { color: C.muted }]} numberOfLines={1}>
          {contact.username}{contact.role ? ` · ${contact.role}` : ''}{contact.org ? ` · ${contact.org}` : ''}
        </Text>
        {/* Inset separator */}
        <View style={[styles.contactSeparator, { backgroundColor: C.separator }]} />
      </View>
    </Pressable>
  );
}

function ProfileSheet({
  contact, C, styles, canEdit = false,
}: {
  contact: PhoneContact; C: ComponentColors; styles: ReturnType<typeof makeStyles>; canEdit?: boolean;
}) {
  const [isFav, setIsFav] = useState(contact.isFavorite ?? false);
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [personalPhones, setPersonalPhones] = useState<Array<{ label: string; number: string }>>([]);
  const [addingPhone, setAddingPhone] = useState(false);
  const [newPhoneNum, setNewPhoneNum] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('Mobile');

  const email = `${contact.username.replace('@', '')}@kanext.com`;

  const systemPhones = useMemo(() => {
    if (CONTACT_PHONES[contact.username]) return CONTACT_PHONES[contact.username];
    let h = 0;
    for (let i = 0; i < contact.username.length; i++) {
      h = Math.imul(31, h) + contact.username.charCodeAt(i) | 0;
    }
    h = Math.abs(h);
    const area = 200 + (h % 800);
    const mid  = String(100 + (h % 900)).padStart(3, '0');
    const last = String(1000 + ((h >> 4) % 9000)).padStart(4, '0');
    const modeLabel = contact.mode.charAt(0).toUpperCase() + contact.mode.slice(1);
    return [{ label: `${modeLabel} · ${contact.org}`, number: `+1 (${area}) ${mid}-${last}` }];
  }, [contact.username, contact.mode, contact.org]);

  const actions = [
    { icon: 'phone.fill',    label: 'Call',    color: C.green,  type: 'audio' as const },
    { icon: 'video.fill',    label: 'Video',   color: C.accent, type: 'video' as const },
    { icon: 'message.fill',  label: 'Message', color: C.accent, type: null },
    { icon: 'envelope.fill', label: 'Email',   color: C.accent, type: null },
  ] as const;

  const quickActions = [
    { icon: 'message.fill',        label: 'Send Message',        onPress: () => {},                                                                   destructive: false },
    { icon: 'square.and.arrow.up', label: 'Share Contact',       onPress: () => {},                                                                   destructive: false },
    { icon: isFav ? 'star.fill' : 'star', label: isFav ? 'Remove from Favorites' : 'Add to Favorites',
      onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsFav(v => !v); }, destructive: false },
    { icon: 'minus.circle.fill',   label: 'Block Contact',       onPress: () => {},                                                                   destructive: true  },
  ];

  return (
    <View style={styles.profileSheet}>
      {/* Edit / Done — RBAC gated */}
      <View style={styles.profileEditRow}>
        <Pressable
          style={[styles.profileEditBtn, !canEdit && { opacity: 0.35 }]}
          disabled={!canEdit}
          onPress={() => {
            if (!canEdit) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (editMode) { setEditMode(false); setAddingPhone(false); }
            else { setEditMode(true); }
          }}
        >
          <Text style={[styles.profileEditLabel, { color: C.accent }]}>{editMode ? 'Done' : 'Edit'}</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={styles.profileHero}>
        <View style={[styles.profileAvatar, { backgroundColor: C.surface }]}>
          <Text style={styles.profileInitials}>{contact.initials}</Text>
          {contact.online && (
            <View style={[styles.profileOnlineDot, { backgroundColor: C.green, borderColor: C.bg }]} />
          )}
        </View>
        {editMode ? (
          <View style={styles.profileLockedNameRow}>
            <Text style={[styles.profileName, { color: C.muted }]}>{contact.name}</Text>
            <IconSymbol name="lock.fill" size={12} color={C.muted} />
          </View>
        ) : (
          <Text style={styles.profileName}>{contact.name}</Text>
        )}
        <Text style={[styles.profileHandle, { color: C.secondary }]}>{contact.username}</Text>
        {(contact.role || contact.org) && (
          <Text style={[styles.profileRole, { color: C.muted }]}>
            {[contact.role, contact.org].filter(Boolean).join(' · ')}
          </Text>
        )}
      </View>

      {/* Action buttons — hidden in edit mode */}
      {!editMode && (
        <View style={styles.profileActions}>
          {actions.map(({ icon, label, color, type }) => (
            <Pressable
              key={label}
              style={styles.profileActionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (type) initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type });
              }}
            >
              <View style={[styles.profileActionIcon, { backgroundColor: color + '22' }]}>
                <IconSymbol name={icon} size={22} color={color} />
              </View>
              <Text style={[styles.profileActionLabel, { color: C.secondary }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Contact info card */}
      <View style={[styles.profileInfoCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
        {/* System phones — locked in edit mode */}
        {systemPhones.map((ph, i) => (
          <React.Fragment key={ph.number}>
            {editMode ? (
              <View style={[styles.profileInfoRow, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name="phone" size={16} color={C.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileInfoText, { color: C.muted }]}>{ph.number}</Text>
                  <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{ph.label}</Text>
                </View>
                <IconSymbol name="lock.fill" size={12} color={C.muted} />
              </View>
            ) : (
              <Pressable
                style={styles.profileInfoRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: 'audio' });
                }}
              >
                <IconSymbol name="phone" size={16} color={C.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileInfoText, { color: C.label }]}>{ph.number}</Text>
                  <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{ph.label}</Text>
                </View>
              </Pressable>
            )}
            {i < systemPhones.length - 1 && <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />}
          </React.Fragment>
        ))}

        {/* Personal phones — editable, deletable */}
        {personalPhones.map((ph, i) => (
          <React.Fragment key={i}>
            <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />
            <View style={styles.profileInfoRow}>
              <IconSymbol name="phone" size={16} color={C.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileInfoText, { color: C.label }]}>{ph.number}</Text>
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
            <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />
            {addingPhone ? (
              <View style={styles.editPhoneForm}>
                <TextInput
                  style={[styles.editPhoneInput, { color: C.label, borderColor: C.separator }]}
                  value={newPhoneNum}
                  onChangeText={setNewPhoneNum}
                  placeholder="Phone number"
                  placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  autoFocus
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.editPhoneModes}>
                    {PHONE_LABEL_OPTIONS.map(lbl => (
                      <Pressable
                        key={lbl}
                        onPress={() => setNewPhoneLabel(lbl)}
                        style={[styles.editPhoneModePill, { backgroundColor: newPhoneLabel === lbl ? C.accent : C.surfacePressed }]}
                      >
                        <Text style={{ fontSize: 13, color: newPhoneLabel === lbl ? '#fff' : C.label }}>{lbl}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                <View style={styles.editPhoneActions}>
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
                style={styles.profileInfoRow}
                onPress={() => { setAddingPhone(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <IconSymbol name="plus.circle.fill" size={16} color={C.accent} />
                <Text style={[styles.profileInfoText, { color: C.accent }]}>Add Phone</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Email — locked in edit mode */}
        <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />
        {editMode ? (
          <View style={[styles.profileInfoRow, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="envelope" size={16} color={C.muted} />
            <Text style={[styles.profileInfoText, { color: C.muted }]} numberOfLines={1}>{email}</Text>
            <IconSymbol name="lock.fill" size={12} color={C.muted} />
          </View>
        ) : (
          <View style={styles.profileInfoRow}>
            <IconSymbol name="envelope" size={16} color={C.secondary} />
            <Text style={[styles.profileInfoText, { color: C.label }]} numberOfLines={1}>{email}</Text>
          </View>
        )}

        {/* Username */}
        <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />
        {editMode ? (
          <View style={[styles.profileInfoRow, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="at" size={16} color={C.muted} />
            <Text style={[styles.profileInfoText, { color: C.muted }]} numberOfLines={1}>{contact.username.replace('@', '')}</Text>
            <IconSymbol name="lock.fill" size={12} color={C.muted} />
          </View>
        ) : (
          <View style={styles.profileInfoRow}>
            <IconSymbol name="at" size={16} color={C.secondary} />
            <Text style={[styles.profileInfoText, { color: C.label }]} numberOfLines={1}>{contact.username.replace('@', '')}</Text>
          </View>
        )}
      </View>

      {/* Notes — edit mode only */}
      {editMode && (
        <View style={[styles.profileInfoCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <View style={[styles.profileInfoRow, { alignItems: 'flex-start', paddingVertical: 12 }]}>
            <IconSymbol name="note.text" size={16} color={C.secondary} style={{ marginTop: 2 }} />
            <TextInput
              style={[styles.profileInfoText, { color: C.label, minHeight: 56, textAlignVertical: 'top' }]}
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
        <View style={[styles.profileQuickActions, { backgroundColor: C.surface, borderColor: C.separator }]}>
          {quickActions.map((action, i) => (
            <React.Fragment key={action.label}>
              <Pressable
                style={({ pressed }) => [styles.profileQuickRow, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={action.onPress}
              >
                <IconSymbol name={action.icon as any} size={18} color={action.destructive ? C.red : C.label} />
                <Text style={[styles.profileQuickLabel, { color: action.destructive ? C.red : C.label }]}>
                  {action.label}
                </Text>
              </Pressable>
              {i < quickActions.length - 1 && <View style={[styles.profileQuickDivider, { backgroundColor: C.separator }]} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Add Contact Sheet ─────────────────────────────────────────────────────────

function AddContactSheet({
  C, styles, onClose,
}: {
  C: ComponentColors; styles: ReturnType<typeof makeStyles>; onClose: () => void;
}) {
  const [step, setStep] = useState<AddContactStep>('menu');
  const [kanextQuery, setKanextQuery] = useState('');
  const [extName, setExtName] = useState('');
  const [extPhone, setExtPhone] = useState('');
  const [extEmail, setExtEmail] = useState('');
  const [extNotes, setExtNotes] = useState('');

  const kanextResults = useMemo(() => {
    const q = kanextQuery.toLowerCase().trim();
    if (!q) return [];
    return PHONE_CONTACTS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [kanextQuery]);

  if (step === 'menu') {
    return (
      <View style={styles.addContactSheet}>
        <View style={styles.addContactHeader}>
          <Text style={[styles.addContactTitle, { color: C.label }]}>Add Contact</Text>
        </View>
        {[
          { icon: 'person.badge.plus', label: 'Add KaNeXT Member', next: 'kanext' as AddContactStep },
          { icon: 'person.crop.circle', label: 'Add External Contact', next: 'external' as AddContactStep },
        ].map(({ icon, label, next }) => (
          <Pressable
            key={label}
            style={({ pressed }) => [styles.addContactOption, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(next); }}
          >
            <View style={[styles.addContactIconWrap, { backgroundColor: C.surface }]}>
              <IconSymbol name={icon as any} size={22} color={C.accent} />
            </View>
            <Text style={[styles.addContactOptionLabel, { color: C.label }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (step === 'kanext') {
    return (
      <View style={styles.addContactSheet}>
        <View style={styles.addContactHeader}>
          <Pressable onPress={() => setStep('menu')} hitSlop={12}>
            <IconSymbol name="chevron.left" size={18} color={C.accent} />
          </Pressable>
          <Text style={[styles.addContactTitle, { color: C.label }]}>Add KaNeXT Member</Text>
          <View style={{ width: 18 }} />
        </View>
        <View style={[styles.addContactSearch, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: C.label }}
            value={kanextQuery}
            onChangeText={setKanextQuery}
            placeholder="Search by name or @handle"
            placeholderTextColor={C.muted}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {kanextResults.map(contact => (
          <Pressable
            key={contact.id}
            style={({ pressed }) => [styles.addContactResult, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
          >
            <View style={[styles.contactAvatar, { backgroundColor: C.surface }]}>
              <Text style={[styles.contactInitials, { color: C.label }]}>{contact.initials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={[styles.addContactOptionLabel, { color: C.label }]}>{contact.name}</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>
                {contact.username}{contact.role ? ` · ${contact.role}` : ''}
              </Text>
            </View>
            <IconSymbol name="plus.circle.fill" size={22} color={C.accent} />
          </Pressable>
        ))}
      </View>
    );
  }

  // External contact form
  return (
    <View style={styles.addContactSheet}>
      <View style={styles.addContactHeader}>
        <Pressable onPress={() => setStep('menu')} hitSlop={12}>
          <IconSymbol name="chevron.left" size={18} color={C.accent} />
        </Pressable>
        <Text style={[styles.addContactTitle, { color: C.label }]}>Add External Contact</Text>
        <View style={{ width: 18 }} />
      </View>
      <View style={[styles.profileInfoCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
        {([
          { placeholder: 'Name*', value: extName, onChange: setExtName, kbType: 'default' as const, cap: 'words' as const },
          { placeholder: 'Phone', value: extPhone, onChange: setExtPhone, kbType: 'phone-pad' as const, cap: 'none' as const },
          { placeholder: 'Email', value: extEmail, onChange: setExtEmail, kbType: 'email-address' as const, cap: 'none' as const },
        ] as const).map(({ placeholder, value, onChange, kbType, cap }, i) => (
          <React.Fragment key={placeholder}>
            {i > 0 && <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />}
            <View style={styles.profileInfoRow}>
              <TextInput
                style={[styles.profileInfoText, { color: C.label }]}
                value={value}
                onChangeText={onChange as (t: string) => void}
                placeholder={placeholder}
                placeholderTextColor={C.muted}
                keyboardType={kbType}
                autoCapitalize={cap}
                autoCorrect={false}
              />
            </View>
          </React.Fragment>
        ))}
        <View style={[styles.profileInfoDivider, { backgroundColor: C.separator }]} />
        <View style={[styles.profileInfoRow, { alignItems: 'flex-start', paddingVertical: 12 }]}>
          <TextInput
            style={[styles.profileInfoText, { color: C.label, minHeight: 56, textAlignVertical: 'top' }]}
            value={extNotes}
            onChangeText={setExtNotes}
            placeholder="Notes"
            placeholderTextColor={C.muted}
            multiline
          />
        </View>
      </View>
      <Pressable
        style={[styles.addContactSaveBtn, { backgroundColor: extName.trim() ? C.accent : C.surfacePressed }]}
        disabled={!extName.trim()}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
      >
        <Text style={{ color: extName.trim() ? '#FFFFFF' : C.muted, fontSize: 16, fontWeight: '600' }}>Save</Text>
      </Pressable>
    </View>
  );
}

// ── Top match scoring ────────────────────────────────────────────────────────

type TopMatchKind =
  | { kind: 'contact'; data: PhoneContact }
  | { kind: 'call'; data: RecentCall }
  | { kind: 'voicemail'; data: Voicemail };

function nameScore(name: string, q: string): number {
  const n = name.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 50;
  if (n.includes(q)) return 10;
  return 0;
}

function getTopMatch(
  query: string,
  calls: RecentCall[],
  contacts: PhoneContact[],
  voicemails: Voicemail[],
): TopMatchKind | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestScore = 0;
  let best: TopMatchKind | null = null;

  for (const c of contacts) {
    const ns = nameScore(c.name, q);
    if (!ns) continue;
    const freq = calls.filter(r => r.username === c.username).length;
    const score = ns + freq * 5 + (c.isFavorite ? 20 : 0);
    if (score > bestScore) { bestScore = score; best = { kind: 'contact', data: c }; }
  }
  for (const c of calls) {
    const ns = nameScore(c.name, q);
    if (!ns) continue;
    if (ns > bestScore) { bestScore = ns; best = { kind: 'call', data: c }; }
  }
  for (const v of voicemails) {
    const ns = nameScore(v.callerName, q);
    if (!ns) continue;
    if (ns > bestScore) { bestScore = ns; best = { kind: 'voicemail', data: v }; }
  }
  return best;
}

// ── Top match card ────────────────────────────────────────────────────────────

function TopMatchCard({
  match, C, styles, onPress,
}: {
  match: TopMatchKind; C: ComponentColors;
  styles: ReturnType<typeof makeStyles>; onPress: () => void;
}) {
  let initials: string, name: string, subtitle: string, actionIcon: string, actionColor: string;
  let actionBg: string;

  if (match.kind === 'contact') {
    initials = match.data.initials;
    name = match.data.name;
    subtitle = [match.data.role, match.data.org].filter(Boolean).join(' · ');
    actionIcon = 'phone.fill'; actionColor = C.accent; actionBg = C.surfacePressed;
  } else if (match.kind === 'call') {
    initials = match.data.initials;
    name = match.data.name;
    subtitle = `${directionLabel(match.data.direction)} · ${match.data.timestamp}`;
    actionIcon = match.data.direction === 'video' ? 'video.fill' : 'phone.fill';
    actionColor = C.accent; actionBg = C.surfacePressed;
  } else {
    initials = match.data.callerInitials;
    name = match.data.callerName;
    subtitle = match.data.transcription;
    actionIcon = 'play.fill'; actionColor = '#FFFFFF'; actionBg = C.accent;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.topCard, { backgroundColor: C.surface }, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={[styles.topCardAvatar, { backgroundColor: C.bg }]}>
        <Text style={styles.topCardInitials}>{initials}</Text>
      </View>
      <View style={styles.topCardInfo}>
        <Text style={[styles.topCardName, { color: C.label }]}>{name}</Text>
        <Text style={[styles.topCardSub, { color: C.secondary }]} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Pressable
        style={[styles.callBtn, { backgroundColor: actionBg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (match.kind === 'contact') {
            initiateCall({ contactName: match.data.name, contactInitials: match.data.initials, mode: match.data.mode, type: 'audio' });
          } else if (match.kind === 'call') {
            initiateCall({ contactName: match.data.name, contactInitials: match.data.initials, mode: match.data.mode, type: match.data.direction === 'video' ? 'video' : 'audio' });
          } else {
            initiateCall({ contactName: match.data.callerName, contactInitials: match.data.callerInitials, mode: match.data.mode, type: 'audio' });
          }
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconSymbol name={actionIcon as any} size={16} color={actionColor} />
      </Pressable>
    </Pressable>
  );
}

// ── Search results overlay ────────────────────────────────────────────────────

function SearchResults({
  query, C, styles, expandedSection, setExpandedSection, onOpenContact, onOpenFromCall, bottomPad,
  calls, contacts, voicemails, onCallLongPress, onVmLongPress,
}: {
  query: string; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
  expandedSection: ExpandedSection; setExpandedSection: (s: ExpandedSection) => void;
  onOpenContact: (c: PhoneContact) => void; onOpenFromCall: (c: RecentCall) => void;
  bottomPad: number;
  calls: RecentCall[]; contacts: PhoneContact[]; voicemails: Voicemail[];
  onCallLongPress?: (call: RecentCall, pageY: number) => void;
  onVmLongPress?: (vm: Voicemail, pageY: number) => void;
}) {
  const q = query.toLowerCase().trim();

  const topMatch = useMemo(() => getTopMatch(query, calls, contacts, voicemails), [query, calls, contacts, voicemails]);

  const matchingCalls = useMemo(() => {
    if (!q) return [];
    return calls.filter(c =>
      c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q),
    );
  }, [q, calls]);

  const matchingVMs = useMemo(() => {
    if (!q) return [];
    return voicemails.filter(v =>
      v.callerName.toLowerCase().includes(q) || v.transcription.toLowerCase().includes(q),
    );
  }, [q, voicemails]);

  const matchingContacts = useMemo(() => {
    if (!q) return [];
    return contacts
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.org.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const last = (n: string) => n.split(' ').pop() ?? n;
        return last(a.name).localeCompare(last(b.name));
      });
  }, [q, contacts]);

  if (!q) {
    return (
      <View style={styles.searchEmpty}>
        <IconSymbol name="magnifyingglass" size={32} color={C.muted} />
        <Text style={[styles.searchEmptyText, { color: C.muted }]}>
          Search calls, voicemails, contacts
        </Text>
      </View>
    );
  }

  if (!matchingCalls.length && !matchingVMs.length && !matchingContacts.length) {
    return (
      <View style={styles.searchEmpty}>
        <Text style={[styles.searchEmptyText, { color: C.muted }]}>No results for "{query}"</Text>
      </View>
    );
  }

  const callsExp = expandedSection === 'calls';
  const vmsExp = expandedSection === 'voicemails';
  const contactsExp = expandedSection === 'contacts';

  const openTopMatch = () => {
    if (!topMatch) return;
    if (topMatch.kind === 'contact') onOpenContact(topMatch.data);
    else if (topMatch.kind === 'call') onOpenFromCall(topMatch.data);
    else {
      const c = contacts.find(p => p.username === topMatch.data.callerUsername);
      if (c) onOpenContact(c);
    }
  };

  return (
    <ScrollView
      style={styles.searchScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: bottomPad }}
    >
      {/* Top match — unlabelled */}
      {topMatch && (
        <TopMatchCard match={topMatch} C={C} styles={styles} onPress={openTopMatch} />
      )}

      {/* Calls */}
      {matchingCalls.length > 0 && (
        <View>
          <View style={styles.searchSectionHeader}>
            <Text style={styles.sectionLabel}>Calls</Text>
            {matchingCalls.length > SECTION_MAX && !callsExp && (
              <Pressable
                onPress={() => setExpandedSection('calls')}
                style={styles.seeAllBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </Pressable>
            )}
          </View>
          {(callsExp ? matchingCalls : matchingCalls.slice(0, SECTION_MAX)).map(call => (
            <RecentRow
              key={call.id} call={call} C={C} styles={styles}
              onPress={() => onOpenFromCall(call)}
              onLongPress={onCallLongPress ? (py) => onCallLongPress(call, py) : undefined}
            />
          ))}
        </View>
      )}

      {/* Voicemail */}
      {matchingVMs.length > 0 && (
        <View>
          <View style={styles.searchSectionHeader}>
            <Text style={styles.sectionLabel}>Voicemail</Text>
            {matchingVMs.length > SECTION_MAX && !vmsExp && (
              <Pressable
                onPress={() => setExpandedSection('voicemails')}
                style={styles.seeAllBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </Pressable>
            )}
          </View>
          {(vmsExp ? matchingVMs : matchingVMs.slice(0, SECTION_MAX)).map(vm => (
            <VoicemailRow
              key={vm.id} vm={vm} C={C} styles={styles}
              onPress={() => {
                const c = contacts.find(p => p.username === vm.callerUsername);
                if (c) onOpenContact(c);
              }}
              onLongPress={onVmLongPress ? (py) => onVmLongPress(vm, py) : undefined}
            />
          ))}
        </View>
      )}

      {/* Contacts */}
      {matchingContacts.length > 0 && (
        <View>
          <View style={styles.searchSectionHeader}>
            <Text style={styles.sectionLabel}>Contacts</Text>
            {matchingContacts.length > SECTION_MAX && !contactsExp && (
              <Pressable
                onPress={() => setExpandedSection('contacts')}
                style={styles.seeAllBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </Pressable>
            )}
          </View>
          {(contactsExp ? matchingContacts : matchingContacts.slice(0, SECTION_MAX)).map(c => (
            <ContactRow key={c.id} contact={c} C={C} styles={styles} onPress={() => onOpenContact(c)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── My profile card (top of contacts list) ────────────────────────────────────

function MyProfileCard({
  role, mode, C, styles, onPress,
}: {
  role: string; mode: ReturnType<typeof useMode>;
  C: ComponentColors; styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  const myNumber = MY_KANEXT_NUMBERS.find(n => n.mode === mode);
  return (
    <Pressable
      style={({ pressed }) => [styles.myCard, { backgroundColor: C.surface }, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={[styles.myAvatar, { backgroundColor: C.accent }]}>
        <Text style={styles.myAvatarInitials}>SK</Text>
        <View style={[styles.onlineDot, { backgroundColor: C.green, borderColor: C.surface }]} />
      </View>
      <View style={styles.myInfo}>
        <Text style={[styles.myName, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[styles.myMeta, { color: C.secondary }]} numberOfLines={1}>
          {role || 'Owner'}{myNumber ? `  ·  ${myNumber.number}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Context menu overlay ──────────────────────────────────────────────────────

const CTX_ITEM_H = 50;
const CTX_PREVIEW_H = 72;
const CTX_WIDTH = 248;

function ContactPreview({
  contact, C, styles,
}: {
  contact: PhoneContact; C: ComponentColors; styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.ctxPreview}>
      <View style={[styles.ctxPreviewAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.ctxPreviewInitials, { color: C.label }]}>{contact.initials}</Text>
      </View>
      <View style={styles.ctxPreviewInfo}>
        <Text style={[styles.ctxPreviewName, { color: C.label }]} numberOfLines={1}>{contact.name}</Text>
        <Text style={[styles.ctxPreviewSub, { color: C.secondary }]} numberOfLines={1}>
          {[contact.role, contact.org].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );
}

function ContextMenuOverlay({
  ctxMenu, onClose, C, styles, preview,
}: {
  ctxMenu: ContextMenuState; onClose: () => void;
  C: ComponentColors; styles: ReturnType<typeof makeStyles>;
  preview?: React.ReactNode;
}) {
  const { height: screenH } = useWindowDimensions();
  if (!ctxMenu.visible) return null;

  const previewH = preview ? CTX_PREVIEW_H : 0;
  const menuH = ctxMenu.items.length * CTX_ITEM_H + previewH;
  const showAbove = ctxMenu.anchorY > screenH * 0.55;
  const rawTop = showAbove ? ctxMenu.anchorY - menuH - 12 : ctxMenu.anchorY + 12;
  const menuTop = Math.max(60, Math.min(rawTop, screenH - menuH - 16));

  return (
    <>
      <Pressable style={[StyleSheet.absoluteFill, styles.ctxBackdrop]} onPress={onClose} />
      <View style={[styles.ctxShadow, { top: menuTop, width: CTX_WIDTH }]}>
        <View style={[styles.ctxInner, { backgroundColor: C.bg, borderColor: C.separator }]}>
          {preview && (
            <>
              {preview}
              <View style={[styles.ctxDivider, { backgroundColor: C.separator, marginLeft: 0 }]} />
            </>
          )}
          {ctxMenu.items.map((item, i) => (
            <React.Fragment key={item.label}>
              <Pressable
                style={({ pressed }) => [
                  styles.ctxItem,
                  pressed && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => { onClose(); item.onPress(); }}
              >
                <IconSymbol
                  name={item.icon as any}
                  size={18}
                  color={item.destructive ? C.red : C.label}
                />
                <Text style={[styles.ctxLabel, { color: item.destructive ? C.red : C.label }]}>
                  {item.label}
                </Text>
              </Pressable>
              {i < ctxMenu.items.length - 1 && (
                <View style={[styles.ctxDivider, { backgroundColor: C.separator }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PhoneScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const mode = useMode();
  const router = useRouter();
  const { state } = useAppContext();
  const activeRole = state.activeContext.derived_role_badge ?? 'Owner';

  const [tab, setTab] = useState<PhoneTab>('Calls');
  const [tabDropdownVisible, setTabDropdownVisible] = useState(false);
  const [editDropdownVisible, setEditDropdownVisible] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({ visible: false, items: [], anchorY: 0 });
  const [contactCtxMenu, setContactCtxMenu] = useState<ContactContextMenuState>({ visible: false, items: [], anchorY: 0, contact: null });
  const [addContactSheetVisible, setAddContactSheetVisible] = useState(false);
  const [myProfileSheetVisible, setMyProfileSheetVisible] = useState(false);
  const [editFavoritesMode, setEditFavoritesMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedCallIds, setSelectedCallIds] = useState<Set<string>>(new Set());
  const [removedFavIds, setRemovedFavIds] = useState<Set<string>>(new Set());
  const [deletedCallIds, setDeletedCallIds] = useState<Set<string>>(new Set());
  const [contactFilter, setContactFilter] = useState<string>('All');
  const [contactFilterPillsVisible, setContactFilterPillsVisible] = useState(false);
  const contactPillsRevealAnim = useRef(new Animated.Value(0)).current;

  const ownContact = useMemo<PhoneContact>(() => ({
    id: 'me',
    name: 'Sammy Kalejaiye',
    username: '@sk',
    initials: 'SK',
    role: activeRole,
    org: 'KaNeXT',
    mode,
    isFavorite: false,
    online: true,
  }), [activeRole, mode]);

  // Fade animations
  const mainOpacity = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  // Org-scoped data — re-derives whenever the active mode changes
  const orgCalls = useMemo(
    () => RECENT_CALLS.filter(c => c.mode === mode),
    [mode],
  );
  const orgContacts = useMemo(() => {
    const lastName = (n: string) => n.split(' ').pop() ?? n;
    return [...PHONE_CONTACTS.filter(c => c.mode === mode)]
      .sort((a, b) => lastName(a.name).localeCompare(lastName(b.name)));
  }, [mode]);
  const orgVoicemails = useMemo(
    () => VOICEMAILS.filter(v => v.mode === mode),
    [mode],
  );
  const favorites = useMemo(() => orgContacts.filter(c => c.isFavorite), [orgContacts]);
  const displayFavorites = useMemo(() => favorites.filter(f => !removedFavIds.has(f.id)), [favorites, removedFavIds]);

  const missedCalls = useMemo(() => orgCalls.filter(c => c.direction === 'missed' && !deletedCallIds.has(c.id)), [orgCalls, deletedCallIds]);
  const canvasCalls = useMemo(() => {
    if (tab === 'Missed') return missedCalls;
    return orgCalls.filter(c => !deletedCallIds.has(c.id));
  }, [tab, missedCalls, orgCalls, deletedCallIds]);

  const toggleContactFilterPills = useCallback(() => {
    setContactFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(contactPillsRevealAnim, {
        toValue: next ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      return next;
    });
  }, [contactPillsRevealAnim]);

  // Reset edit/select state when mode changes
  React.useEffect(() => {
    setEditFavoritesMode(false);
    setSelectMode(false);
    setSelectedCallIds(new Set());
    setRemovedFavIds(new Set());
    setDeletedCallIds(new Set());
    setContactFilter('All');
    setContactFilterPillsVisible(false);
    contactPillsRevealAnim.setValue(0);
  }, [mode, contactPillsRevealAnim]);

  const fabBottom = insets.bottom + FOOTER_HEIGHT + 16;
  const searchBarBottom = insets.bottom + FOOTER_HEIGHT;
  const headerHeight = insets.top + 14 + 50; // approx header block height
  const { opacity, onScroll: onScrollHeader } = useScrollHeader(headerHeight);

  // ── Contacts: grouped sections + alphabet index ─────────────────────────────
  const contactGroupPills = useMemo(() => {
    return CONTACT_GROUPS[mode] ?? CONTACT_GROUPS['business'];
  }, [mode]);

  const filteredOrgContacts = useMemo(() => {
    if (contactFilter === 'All') return orgContacts;
    return orgContacts.filter(c => c.group === contactFilter);
  }, [orgContacts, contactFilter]);

  const contactSections = useMemo(() => {
    const groups: Record<string, PhoneContact[]> = {};
    for (const c of filteredOrgContacts) {
      const raw = ((c.name.split(' ').pop() ?? c.name)[0] ?? '#').toUpperCase();
      const letter = /^[0-9]/.test(raw) ? '#' : raw;
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    }
    return Object.keys(groups)
      .sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b))
      .map(title => ({ title, data: groups[title] }));
  }, [filteredOrgContacts]);

  const sectionListRef = useRef<SectionList<PhoneContact>>(null);
  const lastScrollYRef = useRef(0);
  const handleScroll = useCallback((e: any) => {
    onScrollHeader(e);
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - lastScrollYRef.current;
    lastScrollYRef.current = y;
    if (dy > 5) hideFooter();
    else if (dy < -5) showFooter();
  }, []);

  const scrollToLetter = useCallback((letter: string) => {
    if (contactSections.length === 0) return;
    let sectionIndex: number;
    if (letter === '#') {
      sectionIndex = contactSections.findIndex(s => s.title === '#');
    } else {
      sectionIndex = contactSections.findIndex(s => s.title !== '#' && s.title >= letter);
      if (sectionIndex === -1) {
        const lastNonHash = [...contactSections].reverse().findIndex(s => s.title !== '#');
        sectionIndex = lastNonHash !== -1 ? contactSections.length - 1 - lastNonHash : -1;
      }
    }
    if (sectionIndex === -1) return;
    sectionListRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, viewOffset: 0, animated: false });
  }, [contactSections]);

  const openContact = useCallback((contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openProfileSheet({
      name: contact.name,
      handle: contact.username,
      role: contact.role,
      brand: contact.org,
      initials: contact.initials,
      mode: contact.mode,
    });
  }, []);

  const openFromCall = useCallback((call: RecentCall) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const found = orgContacts.find(c => c.username === call.username);
    openProfileSheet({
      name: found?.name ?? call.name,
      handle: found?.username ?? call.username,
      role: found?.role ?? '',
      brand: found?.org ?? '',
      initials: found?.initials ?? call.initials,
      mode: found?.mode ?? call.mode,
    });
  }, [orgContacts]);

  const activateSearch = useCallback(() => {
    setSearchActive(true);
    setExpandedSection(null);
    Animated.parallel([
      Animated.timing(mainOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [mainOpacity, resultsOpacity]);

  const deactivateSearch = useCallback(() => {
    Animated.parallel([
      Animated.timing(mainOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setSearchActive(false);
      setSearchQuery('');
    });
  }, [mainOpacity, resultsOpacity]);

  const closeCtxMenu = useCallback(() => setCtxMenu(s => ({ ...s, visible: false })), []);

  const openCallCtxMenu = useCallback((call: RecentCall, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isKnown = orgContacts.some(c => c.username === call.username);
    const items: ContextMenuItem[] = [
      { icon: 'phone.fill',    label: 'Call',    onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
      { icon: 'message.fill',  label: 'Message', onPress: () => {} },
      { icon: 'video.fill',    label: 'Video',   onPress: () => {} },
      ...(isKnown ? [] : [
        { icon: 'person.badge.plus',           label: 'Add to Existing Contact', onPress: () => {} },
        { icon: 'person.crop.circle.badge.plus', label: 'Create New Contact',    onPress: () => {} },
      ]),
      { icon: 'trash.fill', label: 'Delete', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), destructive: true },
    ];
    setCtxMenu({ visible: true, items, anchorY });
  }, [orgContacts]);

  const openVmCtxMenu = useCallback((vm: Voicemail, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isKnown = orgContacts.some(c => c.username === vm.callerUsername);
    const items: ContextMenuItem[] = [
      { icon: 'phone.fill',   label: 'Call',    onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
      { icon: 'message.fill', label: 'Message', onPress: () => {} },
      { icon: 'video.fill',   label: 'Video',   onPress: () => {} },
      ...(isKnown ? [] : [
        { icon: 'person.badge.plus',           label: 'Add to Existing Contact', onPress: () => {} },
        { icon: 'person.crop.circle.badge.plus', label: 'Create New Contact',    onPress: () => {} },
      ]),
      { icon: 'trash.fill', label: 'Delete', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), destructive: true },
    ];
    setCtxMenu({ visible: true, items, anchorY });
  }, [orgContacts]);

  const closeContactCtxMenu = useCallback(() => setContactCtxMenu(s => ({ ...s, visible: false })), []);

  const openContactCtxMenu = useCallback((contact: PhoneContact, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const items: ContextMenuItem[] = [
      { icon: 'message.fill',        label: 'Message',        onPress: () => {} },
      { icon: 'phone.fill',          label: 'Call',           onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
      { icon: 'video.fill',          label: 'Video',          onPress: () => {} },
      { icon: 'doc.on.doc',          label: 'Copy',           onPress: () => {} },
      { icon: 'square.and.arrow.up', label: 'Share',          onPress: () => {} },
      { icon: 'trash.fill',          label: 'Delete Contact', onPress: () => {}, destructive: true },
    ];
    setContactCtxMenu({ visible: true, items, anchorY, contact });
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>

      {/* ── Main content — fades out when searching ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: mainOpacity }]}
        pointerEvents={searchActive ? 'none' : 'auto'}
      >
        {/* Header */}
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg }, { paddingTop: insets.top + 14, opacity }]}>
        <View style={styles.header}>
          {/* Left */}
          {editFavoritesMode ? (
            <Pressable
              style={styles.headerTextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditFavoritesMode(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editBtnText, { color: C.accent }]}>Done</Text>
            </Pressable>
          ) : selectMode ? (
            <Pressable
              style={styles.headerTextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectMode(false);
                setSelectedCallIds(new Set());
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editBtnText, { color: C.accent }]}>Cancel</Text>
            </Pressable>
          ) : (tab === 'Calls' || tab === 'Missed') ? (
            <Pressable
              style={styles.filterBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditDropdownVisible(v => !v);
                setTabDropdownVisible(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editBtnText, { color: C.accent }]}>Edit</Text>
            </Pressable>
          ) : tab === 'Contacts' ? (
            <Pressable
              style={styles.filterBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAddContactSheetVisible(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[styles.circleBtn, { backgroundColor: C.surface }]}>
                <IconSymbol name="plus" size={18} color={C.accent} />
              </View>
            </Pressable>
          ) : (
            <View style={styles.filterBtn} />
          )}

          {/* Centered tab pill — disabled in edit/select modes */}
          <Pressable
            style={[styles.statePill, { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              if (editFavoritesMode || selectMode) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTabDropdownVisible(v => !v);
              setEditDropdownVisible(false);
            }}
          >
            <Text style={[styles.statePillText, { color: C.label }]}>
              {selectMode ? `${selectedCallIds.size} Selected` : tab}
            </Text>
            {!selectMode && !editFavoritesMode && (
              <IconSymbol name="chevron.down" size={11} color={C.label} />
            )}
          </Pressable>

          {/* Right — Contacts has group filter, other views have no filter icon */}
          {tab === 'Contacts' && !editFavoritesMode && !selectMode ? (
            <Pressable
              style={styles.filterBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleContactFilterPills();
                setTabDropdownVisible(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconSymbol
                name={contactFilterPillsVisible || contactFilter !== 'All' ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={contactFilterPillsVisible || contactFilter !== 'All' ? C.accent : C.label}
              />
            </Pressable>
          ) : (
            <View style={styles.filterBtn} />
          )}
        </View>
        </Animated.View>

        {/* Group filter pills — Contacts view only, slides in */}
        {tab === 'Contacts' && (
          <Animated.View style={{
            height: contactPillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_ROW_H] }),
            opacity: contactPillsRevealAnim,
            overflow: 'hidden',
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsRow}
              style={styles.pillsScroll}
            >
              {contactGroupPills.map(pill => {
                const isActive = contactFilter === pill;
                return (
                  <Pressable
                    key={pill}
                    style={[
                      styles.pill,
                      isActive
                        ? { backgroundColor: C.label }
                        : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.separator },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (isActive) {
                        toggleContactFilterPills();
                        setContactFilter('All');
                      } else {
                        setContactFilter(pill);
                      }
                    }}
                  >
                    <Text style={[styles.pillText, { color: isActive ? C.bg : C.secondary }]}>
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Scrollable body */}
        {tab === 'Contacts' ? (
          <SectionList
            ref={sectionListRef}
            style={styles.scroll}
            sections={contactSections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactRow
                contact={item} C={C} styles={styles}
                onPress={() => openContact(item)}
                onLongPress={(py) => openContactCtxMenu(item, py)}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={[styles.sectionLetterHeader, { backgroundColor: C.bg }]}>
                <Text style={[styles.sectionLetter, { color: C.secondary }]}>{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled
            ListHeaderComponent={
              <MyProfileCard
                role={activeRole} mode={mode} C={C} styles={styles}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMyProfileSheetVisible(true);
                }}
              />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No contacts</Text>}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + FOOTER_HEIGHT + 150 }}
            onScrollToIndexFailed={() => {}}
          />
        ) : (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + FOOTER_HEIGHT + 150 }}
          >
            {(displayFavorites.length > 0 || editFavoritesMode) && tab === 'Calls' && !selectMode && (
              <View style={[styles.section, styles.favsSection]}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.favsContent, editFavoritesMode && { paddingTop: 10 }]}
                >
                  {displayFavorites.map(fav => (
                    <FavoriteCard
                      key={fav.id} contact={fav} C={C} styles={styles}
                      onPress={() => openContact(fav)}
                      editMode={editFavoritesMode}
                      onRemove={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRemovedFavIds(s => { const n = new Set(s); n.add(fav.id); return n; });
                      }}
                    />
                  ))}
                  {editFavoritesMode && displayFavorites.length === 0 && (
                    <Text style={[styles.emptyText, { marginLeft: 16 }]}>No favorites</Text>
                  )}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              {tab === 'Voicemail' ? (
                <>
                  {orgVoicemails.length === 0
                    ? <Text style={styles.emptyText}>No voicemails</Text>
                    : orgVoicemails.map(vm => (
                      <VoicemailRow
                        key={vm.id} vm={vm} C={C} styles={styles}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/(tabs)/(main)/phone/vm/${vm.id}` as any);
                        }}
                        onLongPress={(py) => openVmCtxMenu(vm, py)}
                      />
                    ))
                  }
                </>
              ) : (
                <>
                  {canvasCalls.length === 0
                    ? <Text style={styles.emptyText}>No calls</Text>
                    : canvasCalls.map(call => (
                      <RecentRow
                        key={call.id} call={call} C={C} styles={styles}
                        onPress={() => openFromCall(call)}
                        onLongPress={(py) => openCallCtxMenu(call, py)}
                        selectMode={selectMode}
                        selected={selectedCallIds.has(call.id)}
                        onToggle={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedCallIds(s => {
                            const n = new Set(s);
                            if (n.has(call.id)) n.delete(call.id); else n.add(call.id);
                            return n;
                          });
                        }}
                      />
                    ))
                  }
                </>
              )}
            </View>
          </ScrollView>
        )}

        {/* Alphabet index — Contacts view only */}
        {tab === 'Contacts' && (
          <View
            style={[styles.alphabetIndex, { top: headerHeight, bottom: insets.bottom + FOOTER_HEIGHT + 4 }]}
          >
            {FULL_ALPHABET.map(letter => (
              <Pressable
                key={letter}
                onPress={() => {
                  scrollToLetter(letter);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                hitSlop={{ top: 2, bottom: 2, left: 8, right: 8 }}
              >
                <Text style={[styles.alphabetLetter, { color: C.accent }]}>{letter}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* FAB stack — hidden in select mode */}
        {!selectMode && (
          <View style={[styles.fabStack, { bottom: fabBottom }]}>
            <Pressable
              style={[styles.fab, { backgroundColor: C.green }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(tabs)/(main)/phone/dialpad' as any);
              }}
            >
              <IconSymbol name="circle.grid.3x3.fill" size={26} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.fab, { backgroundColor: C.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                activateSearch();
              }}
            >
              <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {/* Select action bar */}
        {selectMode && (
          <View style={[styles.selectBar, { bottom: insets.bottom + FOOTER_HEIGHT, backgroundColor: C.bg, borderTopColor: C.separator }]}>
            <Pressable
              style={[styles.selectDeleteBtn, { backgroundColor: selectedCallIds.size > 0 ? C.red : C.surface }]}
              onPress={() => {
                if (selectedCallIds.size === 0) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setDeletedCallIds(s => { const n = new Set(s); selectedCallIds.forEach(id => n.add(id)); return n; });
                setSelectedCallIds(new Set());
                setSelectMode(false);
              }}
            >
              <Text style={[styles.selectDeleteText, { color: selectedCallIds.size > 0 ? '#FFF' : C.muted }]}>
                {selectedCallIds.size > 0 ? `Delete (${selectedCallIds.size})` : 'Delete'}
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.View>

      {/* ── Search results overlay — fades in when searching ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: resultsOpacity, backgroundColor: C.bg }]}
        pointerEvents={searchActive ? 'auto' : 'none'}
      >
        <View style={{ height: headerHeight }} />
        <SearchResults
          query={searchQuery}
          C={C}
          styles={styles}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          onOpenContact={openContact}
          onOpenFromCall={openFromCall}
          bottomPad={insets.bottom + FOOTER_HEIGHT + SEARCH_BAR_HEIGHT + 8}
          calls={orgCalls}
          contacts={orgContacts}
          voicemails={orgVoicemails}
          onCallLongPress={openCallCtxMenu}
          onVmLongPress={openVmCtxMenu}
        />
      </Animated.View>

      {/* ── Search bar — slides up above footer when searching ── */}
      {searchActive && (
        <View style={[
          styles.searchBar,
          { bottom: searchBarBottom, backgroundColor: C.bg, borderTopColor: C.separator },
        ]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={[styles.searchBarInput, { color: C.label }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor={C.muted}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Pressable
            onPress={deactivateSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.cancelBtn, { color: C.accent }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* ── Tab dropdown (Calls / Missed / Voicemail / Contacts) ── */}
      {tabDropdownVisible && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTabDropdownVisible(false)} />
          <View style={[
            styles.tabDropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator },
          ]}>
            {PHONE_TABS.map(t => (
              <Pressable
                key={t}
                style={({ pressed }) => [styles.tabDropdownOption, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (t !== tab) {
                    setTab(t);
                  }
                  setTabDropdownVisible(false);
                }}
              >
                <Text style={[
                  styles.tabDropdownText,
                  { color: tab === t ? C.label : C.secondary },
                  tab === t && { fontWeight: '600' },
                ]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Edit dropdown (Edit Favorites / Select) ── */}
      {editDropdownVisible && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditDropdownVisible(false)} />
          <View style={[
            styles.editDropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator },
          ]}>
            {[
              {
                icon: 'star.fill',
                label: 'Edit Favorites',
                onPress: () => {
                  setEditFavoritesMode(true);
                  setSelectMode(false);
                  setSelectedCallIds(new Set());
                  setEditDropdownVisible(false);
                },
              },
              {
                icon: 'checkmark.circle',
                label: 'Select',
                onPress: () => {
                  setSelectMode(true);
                  setEditFavoritesMode(false);
                  setSelectedCallIds(new Set());
                  setEditDropdownVisible(false);
                },
              },
            ].map(({ icon, label, onPress }, i) => (
              <Pressable
                key={label}
                style={({ pressed }) => [
                  styles.dropdownOption,
                  pressed && { backgroundColor: C.surfacePressed },
                  i === 0 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPress();
                }}
              >
                <IconSymbol name={icon as any} size={16} color={C.label} />
                <Text style={[styles.dropdownOptionText, { color: C.label }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Profile sheet — now handled by global ProfileSheet in _layout.tsx ── */}

      {/* ── My profile sheet ── */}
      <BottomSheet
        visible={myProfileSheetVisible}
        onClose={() => setMyProfileSheetVisible(false)}
        useModal
        backgroundColor={C.bg}
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
      >
        <ProfileSheet contact={ownContact} C={C} styles={styles} canEdit={true} />
      </BottomSheet>

      {/* ── Add Contact sheet ── */}
      <BottomSheet
        visible={addContactSheetVisible}
        onClose={() => setAddContactSheetVisible(false)}
        useModal
        backgroundColor={C.bg}
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
      >
        <AddContactSheet C={C} styles={styles} onClose={() => setAddContactSheetVisible(false)} />
      </BottomSheet>

      {/* ── Context menu (calls/voicemails) ── */}
      <ContextMenuOverlay ctxMenu={ctxMenu} onClose={closeCtxMenu} C={C} styles={styles} />

      {/* ── Context menu (contacts) ── */}
      <ContextMenuOverlay
        ctxMenu={contactCtxMenu}
        onClose={closeContactCtxMenu}
        C={C}
        styles={styles}
        preview={contactCtxMenu.contact
          ? <ContactPreview contact={contactCtxMenu.contact} C={C} styles={styles} />
          : undefined
        }
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statePillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBtn: {
    height: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '400',
  },

  // Sub-filter pills
  pillsScroll: { flexGrow: 0 },
  pillsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Edit dropdown (left-aligned)
  editDropdown: {
    position: 'absolute',
    left: 16,
    minWidth: 200,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },

  // Tab dropdown (centered below pill)
  tabDropdown: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%' as any,
    marginLeft: -90,
    minWidth: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  tabDropdownOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  tabDropdownText: {
    fontSize: 17,
    textAlign: 'center',
  },

  // Scroll
  scroll: { flex: 1 },

  // Sections
  section: { marginBottom: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },

  // Favorites
  favsSection: { marginBottom: 20 },
  favsContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  favCard: { width: 68, alignItems: 'center', gap: 6 },
  favAvatar: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  favInitials: { fontSize: 20, fontWeight: '700', color: C.label },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7, borderWidth: 2,
  },
  favName: { fontSize: 12, fontWeight: '500', color: C.secondary, textAlign: 'center' },

  // Shared row
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11, gap: 12,
  },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', flexShrink: 0,
  },
  rowInitials: { fontSize: 15, fontWeight: '700', color: C.label },
  vmBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 12, height: 12, borderRadius: 6, borderWidth: 2,
  },
  rowInfo: { flex: 1, minWidth: 0, gap: 2 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },
  rowHandle: { fontSize: 12, fontWeight: '400' },
  rowMeta: { flexDirection: 'row', alignItems: 'center' },
  rowSub: { fontSize: 12 },
  rowTimestamp: { fontSize: 13, color: C.muted, flexShrink: 0 },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfacePressed,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  vmMeta: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  vmDuration: { fontSize: 12 },

  // Empty
  emptyText: {
    textAlign: 'center', fontSize: 15, color: C.muted,
    paddingVertical: 40, paddingHorizontal: 20,
  },

  // FAB stack
  fabStack: {
    position: 'absolute',
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  // Favorites edit mode — remove badge
  favRemoveBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  // Select mode
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.separator,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  selectDeleteBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  selectDeleteText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Search bar (above footer)
  searchBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 0,
  },

  // Top match card
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  topCardAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  topCardInitials: { fontSize: 17, fontWeight: '700' },
  topCardInfo: { flex: 1, minWidth: 0, gap: 3 },
  topCardName: { fontSize: 16, fontWeight: '600' },
  topCardSub: { fontSize: 13 },

  // Search results
  searchScroll: { flex: 1 },
  searchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  searchEmptyText: { fontSize: 15, textAlign: 'center' },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  seeAllBtn: { marginLeft: 'auto' as any },
  seeAll: { fontSize: 13, fontWeight: '500' },

  // Online dot (shared for row avatars — 44px recents/contacts, 58px favorites)
  rowOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 13, height: 13, borderRadius: 6.5, borderWidth: 2,
  },

  // Profile sheet
  profileSheet: {},
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
    position: 'relative', marginBottom: 6,
  },
  profileInitials: { fontSize: 28, fontWeight: '700', color: C.label },
  profileOnlineDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 18, height: 18, borderRadius: 9, borderWidth: 3,
  },
  profileName: { fontSize: 22, fontWeight: '700', color: C.label, textAlign: 'center' },
  profileHandle: { fontSize: 14, fontWeight: '400' },
  profileRole: { fontSize: 13, textAlign: 'center' },
  profileActions: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  profileActionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  profileActionIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  profileActionLabel: { fontSize: 12, fontWeight: '500' },

  // Contact info card
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

  // Quick actions
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

  // Contacts section headers + alphabet
  sectionLetterHeader: {
    paddingLeft: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLetter: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // iOS-style contact row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    height: 64,
  },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative',
  },
  contactInitials: { fontSize: 15, fontWeight: '700' },
  contactInfo: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 16,
    position: 'relative',
  },
  contactName: { fontSize: 17, fontWeight: '400' },
  contactNameBold: { fontWeight: '700' },
  contactHandle: { fontSize: 12, marginTop: 1 },
  contactSeparator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  alphabetIndex: {
    position: 'absolute',
    right: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  alphabetLetter: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    paddingHorizontal: 5,
  },

  // My profile card (top of Contacts)
  myCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  myAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', flexShrink: 0,
  },
  myAvatarInitials: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  myInfo: { flex: 1, minWidth: 0, gap: 3 },
  myName: { fontSize: 16, fontWeight: '600' },
  myMeta: { fontSize: 13 },

  // Context menu preview card
  ctxPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    height: CTX_PREVIEW_H,
  },
  ctxPreviewAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ctxPreviewInitials: { fontSize: 15, fontWeight: '700' },
  ctxPreviewInfo: { flex: 1, minWidth: 0, gap: 2 },
  ctxPreviewName: { fontSize: 15, fontWeight: '600' },
  ctxPreviewSub: { fontSize: 13 },

  // Context menu
  ctxBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 5000,
  },
  ctxShadow: {
    position: 'absolute',
    right: 16,
    zIndex: 5001,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
  },
  ctxInner: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  ctxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CTX_ITEM_H,
    paddingHorizontal: 16,
    gap: 14,
  },
  ctxLabel: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  ctxDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },

  // Profile edit mode
  profileLockedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editPhoneForm: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  editPhoneInput: {
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  editPhoneModes: {
    flexDirection: 'row',
    gap: 6,
  },
  editPhoneModePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editPhoneActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },

  // Add contact sheet
  addContactSheet: {
    paddingBottom: 24,
  },
  addContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  addContactTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addContactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addContactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContactOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  addContactSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addContactResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  addContactSaveBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
});
