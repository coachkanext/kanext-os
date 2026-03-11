/**
 * Create Channel Sheet — Bottom sheet for creating a new channel.
 * Staff-only flow opened from the FAB popup menu.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

interface CreateChannelSheetProps {
  visible: boolean;
  onClose: () => void;
  accent?: string;
}

export function CreateChannelSheet({ visible, onClose, accent = '#FFFFFF' }: CreateChannelSheetProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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
            placeholderTextColor={C.muted}
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
          placeholderTextColor={C.muted}
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

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: C.muted,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.divider,
    paddingHorizontal: 12,
  },
  hashPrefix: {
    fontSize: 17,
    fontWeight: '600',
    color: C.secondary,
    marginRight: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: C.label,
    paddingVertical: 12,
  },
  descInput: {
    fontSize: 15,
    color: C.label,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.divider,
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
    color: C.label,
  },
  toggleDesc: {
    fontSize: 13,
    color: C.secondary,
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
    color: C.bg,
  },
});
