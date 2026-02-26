/**
 * BusinessInboxV2 — Executive communication hub for business mode.
 * 4 sections: Unread, Mentions, Escalations, Approvals
 * 3 detail sheets: DM Thread, Escalation Thread, Approval Thread
 * All actions: Propose → Validate → Confirm → Commit
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ChatComposer } from '@/components/messages/chat-composer';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getBizInboxThreads,
  getBizMentions,
  getBizEscalations,
  getBizApprovals,
  getDmMessages,
  formatTime,
  formatDueDate,
  ESCALATION_TYPE_COLORS,
  ESCALATION_STATUS_COLORS,
  APPROVAL_TYPE_COLORS,
  APPROVAL_STATUS_COLORS,
  type BizInboxThread,
  type BizMention,
  type BizEscalation,
  type BizApproval,
  type BizThreadMessage,
} from '@/data/mock-business-inbox';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface BusinessInboxV2Props {
  search?: string;
}

export function BusinessInboxV2({ search: searchProp = '' }: BusinessInboxV2Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = MODE_ACCENT.business;

  const search = searchProp;
  const [inputText, setInputText] = useState('');

  // Selected items for detail sheets
  const [selectedDm, setSelectedDm] = useState<BizInboxThread | null>(null);
  const [selectedEscalation, setSelectedEscalation] = useState<BizEscalation | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<BizApproval | null>(null);

  // Data
  const threads = useMemo(() => getBizInboxThreads(search), [search]);
  const mentions = useMemo(() => getBizMentions(search), [search]);
  const escalations = useMemo(() => getBizEscalations(search), [search]);
  const approvals = useMemo(() => getBizApprovals(search), [search]);

  const unreadThreads = useMemo(() => threads.filter((t) => t.unread), [threads]);
  const unreadCount = unreadThreads.length;

  // DM messages for thread detail
  const dmMessages = useMemo(() => {
    if (!selectedDm) return [];
    return getDmMessages(selectedDm.id);
  }, [selectedDm]);

  // Pending escalations / approvals counts
  const pendingEscalations = useMemo(
    () => escalations.filter((e) => e.status !== 'Resolved').length,
    [escalations],
  );
  const pendingApprovals = useMemo(
    () => approvals.filter((a) => a.status === 'Pending').length,
    [approvals],
  );

  const handleAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── SECTION 1: Unread ──────────────────────────────────── */}
        {unreadThreads.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>UNREAD</Text>
              <View style={[styles.countBadge, { backgroundColor: accent }]}>
                <Text style={styles.countText}>{unreadCount}</Text>
              </View>
            </View>
            {unreadThreads.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                colors={colors}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDm(thread);
                }}
              />
            ))}
          </>
        )}

        {/* ── SECTION 2: Mentions ────────────────────────────────── */}
        {mentions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MENTIONS</Text>
            </View>
            {mentions.map((mention) => (
              <MentionRow
                key={mention.id}
                mention={mention}
                colors={colors}
                accent={accent}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            ))}
          </>
        )}

        {/* ── SECTION 3: Escalations ─────────────────────────────── */}
        {escalations.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ESCALATIONS</Text>
              {pendingEscalations > 0 && (
                <View style={[styles.countBadge, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.countText}>{pendingEscalations}</Text>
                </View>
              )}
            </View>
            {escalations.map((esc) => (
              <EscalationRow
                key={esc.id}
                escalation={esc}
                colors={colors}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedEscalation(esc);
                }}
              />
            ))}
          </>
        )}

        {/* ── SECTION 4: Approvals ───────────────────────────────── */}
        {approvals.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPROVALS</Text>
              {pendingApprovals > 0 && (
                <View style={[styles.countBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.countText}>{pendingApprovals}</Text>
                </View>
              )}
            </View>
            {approvals.map((appr) => (
              <ApprovalRow
                key={appr.id}
                approval={appr}
                colors={colors}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedApproval(appr);
                }}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {unreadThreads.length === 0 && mentions.length === 0 && escalations.length === 0 && approvals.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="tray" size={28} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              No messages match your search
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* ===== DM Thread Detail Sheet ===== */}
      <BottomSheet
        visible={selectedDm !== null}
        onClose={() => {
          setSelectedDm(null);
          setInputText('');
        }}
        title={selectedDm?.name}
        useModal
      >
        {selectedDm && (
          <View style={styles.threadDetail}>
            <ThemedText style={[styles.threadRole, { color: colors.textTertiary }]}>
              {selectedDm.role}
            </ThemedText>

            <ScrollView style={styles.messagesScroll} showsVerticalScrollIndicator={false}>
              {dmMessages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} colors={colors} />
              ))}
              {dmMessages.length === 0 && (
                <ThemedText style={[styles.noMessages, { color: colors.textTertiary }]}>
                  Start a conversation
                </ThemedText>
              )}
            </ScrollView>

            <ChatComposer
              value={inputText}
              onChangeText={setInputText}
              onSend={() => setInputText('')}
            />
          </View>
        )}
      </BottomSheet>

      {/* ===== Escalation Thread Detail Sheet ===== */}
      <BottomSheet
        visible={selectedEscalation !== null}
        onClose={() => setSelectedEscalation(null)}
        title="Escalation"
        useModal
      >
        {selectedEscalation && (
          <EscalationDetail
            escalation={selectedEscalation}
            colors={colors}
            onAction={handleAction}
          />
        )}
      </BottomSheet>

      {/* ===== Approval Thread Detail Sheet ===== */}
      <BottomSheet
        visible={selectedApproval !== null}
        onClose={() => setSelectedApproval(null)}
        title="Approval"
        useModal
      >
        {selectedApproval && (
          <ApprovalDetail
            approval={selectedApproval}
            colors={colors}
            onAction={handleAction}
          />
        )}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// THREAD ROW
// =============================================================================

function ThreadRow({
  thread,
  colors,
  onPress,
}: {
  thread: BizInboxThread;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>
          {thread.initials}
        </ThemedText>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <ThemedText
            style={[styles.rowName, { color: colors.text }, thread.unread && styles.rowNameUnread]}
            numberOfLines={1}
          >
            {thread.name}
          </ThemedText>
          <ThemedText style={[styles.rowTime, { color: colors.textTertiary }]}>
            {formatTime(thread.timestamp)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.rowRole, { color: colors.textTertiary }]} numberOfLines={1}>
          {thread.role}
        </ThemedText>
        <ThemedText style={[styles.rowPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {thread.preview}
        </ThemedText>
      </View>
      {thread.unread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

// =============================================================================
// MENTION ROW
// =============================================================================

function MentionRow({
  mention,
  colors,
  accent,
  onPress,
}: {
  mention: BizMention;
  colors: typeof Colors.light;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.mentionIcon, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="at" size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <Text style={[styles.mentionRoom, { color: accent }]} numberOfLines={1}>
            {mention.roomName}
          </Text>
          <Text style={[styles.rowTime, { color: colors.textTertiary }]}>
            {formatTime(mention.timestamp)}
          </Text>
        </View>
        <Text style={[styles.mentionSender, { color: colors.textTertiary }]} numberOfLines={1}>
          {mention.senderName}
        </Text>
        <Text style={[styles.rowPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {mention.preview}
        </Text>
      </View>
    </Pressable>
  );
}

// =============================================================================
// ESCALATION ROW
// =============================================================================

function EscalationRow({
  escalation,
  colors,
  onPress,
}: {
  escalation: BizEscalation;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const typeColor = ESCALATION_TYPE_COLORS[escalation.escalationType];
  const statusColor = ESCALATION_STATUS_COLORS[escalation.status];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>
          {escalation.requesterInitials}
        </ThemedText>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <ThemedText style={[styles.rowName, styles.rowNameUnread, { color: colors.text }]} numberOfLines={1}>
            {escalation.requesterName}
          </ThemedText>
          <ThemedText style={[styles.rowTime, { color: colors.textTertiary }]}>
            {formatTime(escalation.timestamp)}
          </ThemedText>
        </View>

        {/* Type + Status pills */}
        <View style={styles.pillRow}>
          <View style={[styles.typePill, { backgroundColor: typeColor + '15' }]}>
            <ThemedText style={[styles.pillText, { color: typeColor }]}>{escalation.escalationType}</ThemedText>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.pillText, { color: statusColor }]}>{escalation.status}</ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.rowPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {escalation.preview}
        </ThemedText>

        {escalation.linkedContextLabel && (
          <View style={[styles.linkedBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="link" size={8} color={colors.textTertiary} />
            <ThemedText style={[styles.linkedText, { color: colors.textSecondary }]}>
              {escalation.linkedContextLabel}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// APPROVAL ROW
// =============================================================================

function ApprovalRow({
  approval,
  colors,
  onPress,
}: {
  approval: BizApproval;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const typeColor = APPROVAL_TYPE_COLORS[approval.objectType];
  const statusColor = APPROVAL_STATUS_COLORS[approval.status];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: typeColor + '1A' }]}>
        <IconSymbol
          name={
            approval.objectType === 'Deal' ? 'doc.text.fill' :
            approval.objectType === 'Payment' ? 'banknote.fill' :
            approval.objectType === 'Policy' ? 'shield.fill' :
            approval.objectType === 'Hire' ? 'person.fill' :
            'doc.fill'
          }
          size={18}
          color={typeColor}
        />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <ThemedText style={[styles.rowName, styles.rowNameUnread, { color: colors.text }]} numberOfLines={1}>
            {approval.title}
          </ThemedText>
        </View>

        {/* Type + Status pills */}
        <View style={styles.pillRow}>
          <View style={[styles.typePill, { backgroundColor: typeColor + '15' }]}>
            <ThemedText style={[styles.pillText, { color: typeColor }]}>{approval.objectType}</ThemedText>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.pillText, { color: statusColor }]}>{approval.status}</ThemedText>
          </View>
        </View>

        {/* Meta row */}
        <View style={styles.approvalMeta}>
          <ThemedText style={[styles.approvalDept, { color: colors.textTertiary }]}>
            {approval.department}
          </ThemedText>
          {approval.amount && (
            <ThemedText style={[styles.approvalAmount, { color: colors.text }]}>
              {approval.amount}
            </ThemedText>
          )}
        </View>

        <View style={styles.approvalMeta}>
          <ThemedText style={[styles.approvalBy, { color: colors.textTertiary }]}>
            {approval.requestedBy}
          </ThemedText>
          <ThemedText style={[styles.approvalDue, { color: colors.textTertiary }]}>
            Due {formatDueDate(approval.dueDate)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

// =============================================================================
// MESSAGE BUBBLE
// =============================================================================

function MessageBubble({ msg, colors }: { msg: BizThreadMessage; colors: typeof Colors.light }) {
  return (
    <View style={[styles.bubbleRow, { justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }]}>
      {!msg.isMe && (
        <View style={[styles.msgAvatar, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[styles.msgAvatarText, { color: colors.textTertiary }]}>
            {msg.initials}
          </ThemedText>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          msg.isMe
            ? styles.myBubble
            : [styles.otherBubble, { backgroundColor: colors.backgroundTertiary }],
        ]}
      >
        {!msg.isMe && (
          <ThemedText style={[styles.msgSender, { color: colors.textTertiary }]}>
            {msg.sender} · {msg.role}
          </ThemedText>
        )}
        <ThemedText style={[styles.msgContent, { color: msg.isMe ? '#000' : colors.text }]}>
          {msg.content}
        </ThemedText>
        <ThemedText
          style={[styles.msgTime, { color: msg.isMe ? 'rgba(0,0,0,0.5)' : colors.textTertiary }]}
        >
          {formatTime(msg.timestamp)}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// ESCALATION DETAIL
// =============================================================================

function EscalationDetail({
  escalation,
  colors,
  onAction,
}: {
  escalation: BizEscalation;
  colors: typeof Colors.light;
  onAction: () => void;
}) {
  const typeColor = ESCALATION_TYPE_COLORS[escalation.escalationType];
  const statusColor = ESCALATION_STATUS_COLORS[escalation.status];

  return (
    <View style={styles.detailContainer}>
      {/* Top block: Linked Object Summary */}
      <View style={[styles.detailTopBlock, { backgroundColor: colors.backgroundSecondary }]}>
        {escalation.linkedObjectSummary && (
          <ThemedText style={[styles.detailSummary, { color: colors.text }]}>
            {escalation.linkedObjectSummary}
          </ThemedText>
        )}
        <View style={styles.detailMetaGrid}>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Authority Required</ThemedText>
            <ThemedText style={[styles.detailMetaValue, { color: colors.text }]}>{escalation.authorityRequired}</ThemedText>
          </View>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Type</ThemedText>
            <View style={[styles.typePill, { backgroundColor: typeColor + '15' }]}>
              <ThemedText style={[styles.pillText, { color: typeColor }]}>{escalation.escalationType}</ThemedText>
            </View>
          </View>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Status</ThemedText>
            <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[styles.pillText, { color: statusColor }]}>{escalation.status}</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Thread messages */}
      <ScrollView style={styles.detailMessages} showsVerticalScrollIndicator={false}>
        {escalation.threadMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} colors={colors} />
        ))}
      </ScrollView>

      {/* Action buttons (if not resolved) */}
      {escalation.status !== 'Resolved' && (
        <View style={styles.actionBar}>
          <ThemedText style={[styles.actionNote, { color: colors.textTertiary }]}>
            Propose → Validate → Confirm → Commit
          </ThemedText>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, { backgroundColor: '#22C55E' }]} onPress={onAction}>
              <ThemedText style={styles.actionBtnText}>Approve</ThemedText>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={onAction}>
              <ThemedText style={styles.actionBtnText}>Reject</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary }]}
              onPress={onAction}
            >
              <ThemedText style={[styles.actionBtnTextAlt, { color: colors.text }]}>Request Info</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// APPROVAL DETAIL
// =============================================================================

function ApprovalDetail({
  approval,
  colors,
  onAction,
}: {
  approval: BizApproval;
  colors: typeof Colors.light;
  onAction: () => void;
}) {
  const typeColor = APPROVAL_TYPE_COLORS[approval.objectType];
  const statusColor = APPROVAL_STATUS_COLORS[approval.status];

  return (
    <View style={styles.detailContainer}>
      {/* Top block: Object Summary */}
      <View style={[styles.detailTopBlock, { backgroundColor: colors.backgroundSecondary }]}>
        <ThemedText style={[styles.detailSummary, { color: colors.text }]}>
          {approval.objectSummary}
        </ThemedText>
        <View style={styles.detailMetaGrid}>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Authority Required</ThemedText>
            <ThemedText style={[styles.detailMetaValue, { color: colors.text }]}>{approval.authorityRequired}</ThemedText>
          </View>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Validation</ThemedText>
            <ThemedText style={[styles.detailMetaValue, { color: '#22C55E' }]}>{approval.validationStatus}</ThemedText>
          </View>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Type</ThemedText>
            <View style={[styles.typePill, { backgroundColor: typeColor + '15' }]}>
              <ThemedText style={[styles.pillText, { color: typeColor }]}>{approval.objectType}</ThemedText>
            </View>
          </View>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Status</ThemedText>
            <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[styles.pillText, { color: statusColor }]}>{approval.status}</ThemedText>
            </View>
          </View>
          {approval.amount && (
            <View style={styles.detailMetaRow}>
              <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
              <ThemedText style={[styles.detailMetaValue, { color: colors.text }]}>{approval.amount}</ThemedText>
            </View>
          )}
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Due Date</ThemedText>
            <ThemedText style={[styles.detailMetaValue, { color: colors.text }]}>{formatDueDate(approval.dueDate)}</ThemedText>
          </View>
          <View style={styles.detailMetaRow}>
            <ThemedText style={[styles.detailMetaLabel, { color: colors.textTertiary }]}>Requested By</ThemedText>
            <ThemedText style={[styles.detailMetaValue, { color: colors.text }]}>{approval.requestedBy}</ThemedText>
          </View>
        </View>
      </View>

      {/* Thread messages */}
      <ScrollView style={styles.detailMessages} showsVerticalScrollIndicator={false}>
        {approval.threadMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} colors={colors} />
        ))}
      </ScrollView>

      {/* Action buttons (if pending) */}
      {approval.status === 'Pending' && (
        <View style={styles.actionBar}>
          <ThemedText style={[styles.actionNote, { color: colors.textTertiary }]}>
            Propose → Validate → Confirm → Commit
          </ThemedText>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, { backgroundColor: '#22C55E' }]} onPress={onAction}>
              <ThemedText style={styles.actionBtnText}>Approve</ThemedText>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={onAction}>
              <ThemedText style={styles.actionBtnText}>Reject</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary }]}
              onPress={onAction}
            >
              <ThemedText style={[styles.actionBtnTextAlt, { color: colors.text }]}>Clarification</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Generic row
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  rowNameUnread: {
    fontWeight: '700',
  },
  rowTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  rowRole: {
    fontSize: 12,
    marginTop: 1,
  },
  rowPreview: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 3,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1D9BF0',
    marginTop: 4,
  },

  // Mention
  mentionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentionRoom: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  mentionSender: {
    fontSize: 12,
    marginTop: 1,
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Linked badge
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginTop: 4,
  },
  linkedText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Approval meta
  approvalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  approvalDept: {
    fontSize: 12,
  },
  approvalAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  approvalBy: {
    fontSize: 11,
  },
  approvalDue: {
    fontSize: 11,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },

  // Thread detail
  threadDetail: {
    flex: 1,
  },
  threadRole: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  messagesScroll: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  noMessages: {
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 40,
  },

  // Message bubbles
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  msgSender: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  msgContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Detail sheets
  detailContainer: {
    flex: 1,
  },
  detailTopBlock: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.md,
    gap: 10,
  },
  detailSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailMetaGrid: {
    gap: 6,
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailMetaLabel: {
    fontSize: 12,
  },
  detailMetaValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailMessages: {
    flex: 1,
    marginBottom: Spacing.sm,
  },

  // Action bar
  actionBar: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  actionNote: {
    fontSize: 11,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionBtnTextAlt: {
    fontSize: 14,
    fontWeight: '600',
  },
});
