/**
 * New DM Sheet — Compose flow for starting a new direct message.
 * Bottom sheet with recipient search, text input, and send action.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPORTS_DM_THREADS } from '@/data/mock-sports-messages';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  placeholder: '#52525B',
};

interface NewDMSheetProps {
  visible: boolean;
  onClose: () => void;
  onSend: (threadId: string) => void;
  accent: string;
}

export function NewDMSheet({ visible, onClose, onSend, accent }: NewDMSheetProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const filteredParticipants = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return SPORTS_DM_THREADS;
    return SPORTS_DM_THREADS.filter(
      (t) =>
        t.participantName.toLowerCase().includes(q) ||
        t.participantRole.toLowerCase().includes(q),
    );
  }, [search]);

  const selectedThread = useMemo(
    () => SPORTS_DM_THREADS.find((t) => t.id === selectedId),
    [selectedId],
  );

  const handleSend = () => {
    if (!selectedId || !message.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(selectedId);
    setSearch('');
    setSelectedId(null);
    setMessage('');
  };

  const handleClose = () => {
    setSearch('');
    setSelectedId(null);
    setMessage('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="New Message" useModal>
      {/* Recipient search */}
      <View style={styles.searchRow}>
        <Text style={styles.toLabel}>To:</Text>
        {selectedThread ? (
          <Pressable
            style={[styles.selectedChip, { backgroundColor: accent }]}
            onPress={() => setSelectedId(null)}
          >
            <Text style={styles.selectedChipText}>{selectedThread.participantName}</Text>
            <IconSymbol name="xmark" size={12} color={C.textPrimary} />
          </Pressable>
        ) : (
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={C.placeholder}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        )}
      </View>

      {/* Contact list (when no selection) */}
      {!selectedId && (
        <FlatList
          data={filteredParticipants}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.contactRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedId(item.id);
                setSearch('');
              }}
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitials}>{item.participantInitials}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.participantName}</Text>
                <Text style={styles.contactRole}>{item.participantRole}</Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Message input (when recipient selected) */}
      {selectedId && (
        <View style={styles.composeRow}>
          <TextInput
            style={styles.composeInput}
            placeholder="Type a message..."
            placeholderTextColor={C.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            autoFocus
          />
          <Pressable
            style={[styles.sendBtn, { opacity: message.trim() ? 1 : 0.4 }]}
            onPress={handleSend}
          >
            <IconSymbol
              name="arrow.up.circle.fill"
              size={32}
              color={message.trim() ? accent : C.placeholder}
            />
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
    paddingVertical: 4,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  contactRole: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 1,
  },
  composeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  composeInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendBtn: {
    padding: 2,
    marginBottom: 2,
  },
});
