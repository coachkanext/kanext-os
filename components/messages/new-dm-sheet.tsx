/**
 * New DM Sheet — Compose flow for starting a new direct message.
 * Mode-aware contact list from V3 data + cross-org DM pool.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMode } from '@/context/app-context';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { getInboxThreads, getGlobalDMs } from '@/data/mock-messages-v3';
import type { InboxThreadV3 } from '@/types';

interface NewDMSheetProps {
  visible: boolean;
  onClose: () => void;
  onSend: (threadId: string) => void;
  accent: string;
}

export function NewDMSheet({ visible, onClose, onSend, accent }: NewDMSheetProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const mode = useMode();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Combine mode-specific inbox threads + cross-org DMs for contact list
  const allContacts = useMemo(() => {
    const modeThreads = getInboxThreads(mode);
    const globalDMs = getGlobalDMs();
    // Merge, dedupe by name
    const seen = new Set<string>();
    const contacts: InboxThreadV3[] = [];
    for (const t of [...modeThreads, ...globalDMs]) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        contacts.push(t);
      }
    }
    return contacts;
  }, [mode]);

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allContacts;
    return allContacts.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q),
    );
  }, [search, allContacts]);

  const selectedThread = useMemo(
    () => allContacts.find((t) => t.id === selectedId),
    [selectedId, allContacts],
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
            <Text style={styles.selectedChipText}>{selectedThread.name}</Text>
            <IconSymbol name="xmark" size={12} color={C.label} />
          </Pressable>
        ) : (
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        )}
      </View>

      {/* Contact list (when no selection) */}
      {!selectedId && (
        <FlatList
          data={filteredContacts}
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
                <Text style={styles.contactInitials}>{item.initials}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactRole}>{item.role}</Text>
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
            placeholderTextColor={C.muted}
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
              color={message.trim() ? accent : C.muted}
            />
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.secondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.label,
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
    color: C.label,
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
    color: C.label,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.label,
  },
  contactRole: {
    fontSize: 13,
    color: C.secondary,
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
    color: C.label,
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
