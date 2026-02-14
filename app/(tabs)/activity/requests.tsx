/**
 * Requests Screen — Pending/Approved sections with approve/ignore/block actions.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SectionList, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RequestRow } from '@/components/messages/request-row';
import { RequestDetail } from '@/components/messages/request-detail';
import { Spacing } from '@/constants/theme';
import {
  MOCK_PENDING_REQUESTS,
  MOCK_APPROVED_REQUESTS,
} from '@/data/mock-requests';
import type { RequestItem } from '@/data/mock-requests';

export default function RequestsScreen() {
  const [pending, setPending] = useState(MOCK_PENDING_REQUESTS);
  const [approved, setApproved] = useState(MOCK_APPROVED_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const sections = [
    { title: 'Pending', data: pending },
    { title: 'Approved', data: approved },
  ].filter((s) => s.data.length > 0);

  const handleApprove = useCallback((item: RequestItem) => {
    setPending((prev) => prev.filter((r) => r.id !== item.id));
    setApproved((prev) => [{ ...item, status: 'approved' as const }, ...prev]);
    setSelectedRequest(null);
  }, []);

  const handleIgnore = useCallback((item: RequestItem) => {
    setPending((prev) => prev.filter((r) => r.id !== item.id));
    setSelectedRequest(null);
  }, []);

  const handleBlock = useCallback((item: RequestItem) => {
    Alert.alert('Block', `${item.name} has been blocked.`);
    setPending((prev) => prev.filter((r) => r.id !== item.id));
    setSelectedRequest(null);
  }, []);

  const handleReport = useCallback((item: RequestItem) => {
    Alert.alert('Report', `${item.name} has been reported.`);
    setSelectedRequest(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: RequestItem }) => (
      <RequestRow
        request={item}
        onPress={() => setSelectedRequest(item)}
        onApprove={() => handleApprove(item)}
        onIgnore={() => handleIgnore(item)}
      />
    ),
    [handleApprove, handleIgnore],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {pending.length === 0 && approved.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No pending requests</ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* Request Detail Sheet */}
      <BottomSheet
        visible={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title="Request Detail"
        useModal
      >
        {selectedRequest && (
          <RequestDetail
            request={selectedRequest}
            onApprove={() => handleApprove(selectedRequest)}
            onIgnore={() => handleIgnore(selectedRequest)}
            onBlock={() => handleBlock(selectedRequest)}
            onReport={() => handleReport(selectedRequest)}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e6e6e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});
