/**
 * Create Channel Sheet — Bottom sheet for creating a new channel.
 * Staff-only flow opened from the FAB popup menu.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  placeholder: '#52525B',
  border: '#2F3336',
};

interface CreateChannelSheetProps {
  visible: boolean;
  onClose: () => void;
  accent?: string;
}

export function CreateChannelSheet({ visible, onClose, accent = '#FFFFFF' }: CreateChannelSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: wire to backend channel creation
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsPrivate(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="New Channel" useModal>
      {/* Channel name */}
      <View style={styles.field}>
        <Text style={styles.label}>Channel Name</Text>
        <View style={styles.nameRow}>
          <Text style={styles.hashPrefix}>#</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g. general"
            placeholderTextColor={C.placeholder}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.descInput}
          placeholder="What's this channel about?"
          placeholderTextColor={C.placeholder}
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {/* Private toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>Private Channel</Text>
          <Text style={styles.toggleDesc}>Only invited members can see this channel</Text>
        </View>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: C.surface, true: accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Create button */}
      <Pressable
        style={[styles.createBtn, { backgroundColor: accent, opacity: name.trim() ? 1 : 0.4 }]}
        onPress={handleCreate}
        disabled={!name.trim()}
      >
        <Text style={styles.createBtnText}>Create</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: C.placeholder,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  hashPrefix: {
    fontSize: 17,
    fontWeight: '600',
    color: C.textSecondary,
    marginRight: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: C.textPrimary,
    paddingVertical: 12,
  },
  descInput: {
    fontSize: 15,
    color: C.textPrimary,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  toggleDesc: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
