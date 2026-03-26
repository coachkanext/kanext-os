/**
 * CRM Contact Detail — full relationship workspace.
 * Avatar + action row → relationship summary → active deals →
 * communication log → notes → tasks → files.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import {
  PERSONAL_DEALS, PRIORITY_COLORS, STAGE_PROBABILITIES,
  type PersonalDeal, type CRMStage,
  getContactById, getDealsByContact, formatDealValue, formatDealValueFull,
  formatRelativeDate, formatCloseDate, formatActivityType, isClosingSoon,
} from '@/data/mock-personal-deals';
import {
  getContactDetail, formatCommType, formatCommLabel, formatFileType,
  type CommunicationEntry, type ContactNote, type ContactFile,
} from '@/data/mock-contact-details';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<CRMStage, string> = {
  Lead: 'rgba(45,30,18,0.30)', Contacted: '#D97757', Proposal: '#5A8A6E',
  Negotiation: '#1D9BF0', Won: '#5A8A6E', Lost: '#B85C5C',
};

function Avatar({ initials, hue, size = 36 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${hue},35%,75%)`,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: '#fff' }}>{initials}</Text>
    </View>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.5 }}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.accent }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Deal Detail Sheet (inline for contact page) ───────────────────────────────

function DealDetailSheet({
  deal, visible, onClose, C,
}: {
  deal: PersonalDeal | null;
  visible: boolean;
  onClose: () => void;
  C: ReturnType<typeof useColors>;
}) {
  if (!deal) return <BottomSheet visible={false} onClose={onClose} useModal title="Deal"><View /></BottomSheet>;
  const contact = getContactById(deal.contactId);
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={deal.title}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: STAGE_COLORS[deal.stage] + '20' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: STAGE_COLORS[deal.stage] }}>{deal.stage}</Text>
        </View>
        <Text style={{ fontSize: 11, color: C.secondary }}>{formatRelativeDate(deal.lastActivity)}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>VALUE</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>{formatDealValueFull(deal.value)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>CLOSE DATE</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{formatCloseDate(deal.expectedClose)}</Text>
        </View>
      </View>
      {deal.notes ? (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: C.label, lineHeight: 20 }}>{deal.notes}</Text>
        </View>
      ) : null}
      {deal.tasks.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>TASKS</Text>
          {deal.tasks.map(task => (
            <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 10, padding: 10, marginBottom: 6 }}>
              <IconSymbol name={task.completed ? 'checkmark.circle.fill' : 'circle'} size={18} color={task.completed ? C.green : C.muted} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: C.label }}>{task.title}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{formatCloseDate(task.dueDate)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>ACTIVITY</Text>
      {[...deal.activities].reverse().map(act => (
        <View key={act.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 16, lineHeight: 20 }}>{formatActivityType(act.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }}>{act.description}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{formatRelativeDate(act.timestamp)}</Text>
          </View>
        </View>
      ))}
    </BottomSheet>
  );
}

// ── Add Note Sheet ────────────────────────────────────────────────────────────

function AddNoteSheet({ visible, onClose, onSave, C }: {
  visible: boolean; onClose: () => void;
  onSave: (text: string) => void;
  C: ReturnType<typeof useColors>;
}) {
  const [text, setText] = useState('');
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Add Note" snapPoints={['40%', '70%']}>
      <TextInput
        style={{
          backgroundColor: C.surface, borderRadius: 10, padding: 12,
          fontSize: 14, color: C.label, minHeight: 100, textAlignVertical: 'top',
          borderWidth: 1, borderColor: C.inputBorder, marginBottom: 16,
        }}
        placeholder="e.g. Prefers email over DM. Decision maker is their CMO."
        placeholderTextColor={C.muted}
        multiline
        value={text}
        onChangeText={setText}
      />
      <Pressable
        onPress={() => { if (text.trim()) { onSave(text.trim()); setText(''); } }}
        style={({ pressed }) => ({
          backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14,
          alignItems: 'center', opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Save Note</Text>
      </Pressable>
    </BottomSheet>
  );
}

// ── Add Task Sheet ────────────────────────────────────────────────────────────

function AddTaskSheet({ visible, onClose, onSave, C }: {
  visible: boolean; onClose: () => void;
  onSave: (title: string) => void;
  C: ReturnType<typeof useColors>;
}) {
  const [title, setTitle] = useState('');
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Add Follow-up" snapPoints={['35%', '55%']}>
      <TextInput
        style={{
          backgroundColor: C.surface, borderRadius: 10, padding: 12,
          fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.inputBorder, marginBottom: 16,
        }}
        placeholder="e.g. Send revised proposal by Friday"
        placeholderTextColor={C.muted}
        value={title}
        onChangeText={setTitle}
      />
      <Pressable
        onPress={() => { if (title.trim()) { onSave(title.trim()); setTitle(''); } }}
        style={({ pressed }) => ({
          backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14,
          alignItems: 'center', opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Add Task</Text>
      </Pressable>
    </BottomSheet>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ContactDetailScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { contactId } = useLocalSearchParams<{ contactId: string }>();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const contact = getContactById(contactId);
  const detail = getContactDetail(contactId);
  const deals = useMemo(() => getDealsByContact(contactId), [contactId]);

  // Relationship stats
  const totalValue = useMemo(() => deals.reduce((s, d) => s + d.value, 0), [deals]);
  const wonCount   = useMemo(() => deals.filter(d => d.stage === 'Won').length, [deals]);
  const lostCount  = useMemo(() => deals.filter(d => d.stage === 'Lost').length, [deals]);
  const avgDeal    = useMemo(() => deals.length > 0 ? Math.round(totalValue / deals.length) : 0, [deals, totalValue]);
  const activeDeals = useMemo(() => deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost'), [deals]);
  const allTasks    = useMemo(() => deals.flatMap(d => d.tasks.map(t => ({ task: t, deal: d }))).filter(({ task }) => !task.completed), [deals]);

  const relationshipStart = useMemo(() => {
    const allActs = deals.flatMap(d => d.activities);
    if (allActs.length === 0) return 'Recently';
    const earliest = allActs.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
    return formatCloseDate(earliest.timestamp);
  }, [deals]);

  // Local state for new notes/tasks (mock — would persist to store in real app)
  const [localNotes, setLocalNotes] = useState<{ id: string; text: string; createdAt: Date }[]>([]);
  const [localTasks, setLocalTasks] = useState<{ id: string; title: string }[]>([]);
  const combinedNotes = useMemo(() => [...(detail?.notes ?? []), ...localNotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), [detail, localNotes]);

  // Sheet state
  const [selectedDeal, setSelectedDeal] = useState<PersonalDeal | null>(null);
  const [dealOpen, setDealOpen]         = useState(false);
  const [noteOpen, setNoteOpen]         = useState(false);
  const [taskOpen, setTaskOpen]         = useState(false);

  if (!contact) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <Text style={{ color: C.secondary }}>Contact not found</Text>
      </View>
    );
  }

  const comms = [...(detail?.comms ?? [])].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const files  = detail?.files ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <View style={[styles.topBar, { height: insets.top + 52, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: C.label, textAlign: 'center' }} numberOfLines={1}>
          {contact.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 52 + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero */}
        <View style={{ alignItems: 'center', paddingBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, marginBottom: 20 }}>
          <Avatar initials={contact.initials} hue={contact.avatarHue} size={80} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginTop: 12 }}>{contact.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginTop: 2 }}>{contact.company}</Text>
          {detail?.title && (
            <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{detail.title}</Text>
          )}
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{contact.handle}</Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {[
            { icon: 'phone.fill',         label: 'Call'    },
            { icon: 'video.fill',          label: 'Video'   },
            { icon: 'message.fill',        label: 'Message' },
            { icon: 'envelope.fill',       label: 'Email'   },
          ].map(action => (
            <Pressable
              key={action.label}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={({ pressed }) => ({
                flex: 1, alignItems: 'center', paddingVertical: 12,
                backgroundColor: pressed ? C.surfacePressed : C.surface,
                borderRadius: 12, borderWidth: 1, borderColor: C.inputBorder,
              })}
            >
              <IconSymbol name={action.icon as any} size={20} color={C.accent} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginTop: 4 }}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Relationship Summary */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <SectionHeader title="RELATIONSHIP" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Total Value',  value: formatDealValue(totalValue)              },
              { label: 'Won / Lost',   value: `${wonCount}W · ${lostCount}L`           },
              { label: 'Avg Deal',     value: formatDealValue(avgDeal)                 },
              { label: 'Since',        value: relationshipStart                        },
            ].map(stat => (
              <View key={stat.label} style={{ width: '47%' }}>
                <Text style={{ fontSize: 11, color: C.secondary }}>{stat.label}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginTop: 1 }}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Active Deals */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader
            title={`ACTIVE DEALS (${activeDeals.length})`}
            action="+ Add Deal"
            onAction={() => router.push({ pathname: '/(tabs)/(main)/deals/index' as any })}
          />
          {activeDeals.length === 0 ? (
            <View style={{ padding: 16, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.muted }}>No active deals</Text>
            </View>
          ) : (
            activeDeals.map(deal => (
              <Pressable
                key={deal.id}
                onPress={() => { setSelectedDeal(deal); setDealOpen(true); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: pressed ? C.surfacePressed : C.surface,
                  borderRadius: 12, padding: 12, marginBottom: 8,
                  borderWidth: 1, borderColor: C.separator,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{deal.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STAGE_COLORS[deal.stage] }} />
                    <Text style={{ fontSize: 12, color: C.secondary }}>{deal.stage}</Text>
                    <Text style={{ fontSize: 12, color: C.muted }}>· {formatRelativeDate(deal.lastActivity)}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.accent }}>{formatDealValue(deal.value)}</Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Communication Log */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title={`COMMUNICATION LOG (${comms.length})`} />
          {comms.length === 0 ? (
            <View style={{ padding: 16, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.muted }}>No communication yet</Text>
            </View>
          ) : (
            comms.map((entry, idx) => (
              <Pressable
                key={entry.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => ({
                  flexDirection: 'row', gap: 12, paddingVertical: 10,
                  borderBottomWidth: idx < comms.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                  backgroundColor: pressed ? C.surfacePressed : 'transparent',
                })}
              >
                {/* Type icon + direction */}
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: entry.direction === 'inbound' ? C.surface : C.accent + '15',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 14 }}>{formatCommType(entry.type)}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: entry.direction === 'outbound' ? C.accent : C.label }}>
                      {entry.direction === 'inbound' ? contact.name.split(' ')[0] : 'You'} · {formatCommLabel(entry.type)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }} numberOfLines={2}>{entry.preview}</Text>
                  <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{formatRelativeDate(entry.timestamp)}</Text>
                </View>
                <IconSymbol name="chevron.right" size={13} color={C.muted} />
              </Pressable>
            ))
          )}
        </View>

        {/* Notes */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="NOTES" action="+ Add Note" onAction={() => setNoteOpen(true)} />
          {combinedNotes.length === 0 ? (
            <View style={{ padding: 16, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.muted }}>No notes yet</Text>
            </View>
          ) : (
            combinedNotes.map(note => (
              <View key={note.id} style={{
                backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8,
                borderLeftWidth: 3, borderLeftColor: C.accent + '60',
              }}>
                <Text style={{ fontSize: 13, color: C.label, lineHeight: 20 }}>{note.text}</Text>
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{formatRelativeDate(note.createdAt)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Tasks / Follow-ups */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="FOLLOW-UPS" action="+ Add Task" onAction={() => setTaskOpen(true)} />
          {allTasks.length === 0 && localTasks.length === 0 ? (
            <View style={{ padding: 16, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.muted }}>No follow-ups scheduled</Text>
            </View>
          ) : (
            <>
              {allTasks.map(({ task, deal }) => (
                <View key={task.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8,
                }}>
                  <IconSymbol name="circle" size={18} color={C.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: C.label }}>{task.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Text style={{ fontSize: 11, color: C.muted }}>Due {formatCloseDate(task.dueDate)}</Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>· {deal.title}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {localTasks.map(t => (
                <View key={t.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8,
                }}>
                  <IconSymbol name="circle" size={18} color={C.muted} />
                  <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{t.title}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Files */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title={`FILES (${files.length})`} action="Upload" onAction={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          {files.length === 0 ? (
            <View style={{ padding: 16, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.muted }}>No files yet</Text>
            </View>
          ) : (
            files.map(file => (
              <Pressable
                key={file.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: pressed ? C.surfacePressed : C.surface,
                  borderRadius: 12, padding: 12, marginBottom: 8,
                })}
              >
                <Text style={{ fontSize: 22 }}>{formatFileType(file.fileType)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{file.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>{file.size}</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>·</Text>
                    <Text style={{ fontSize: 11, color: C.muted, textTransform: 'capitalize' }}>{file.source}</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>·</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>{formatRelativeDate(file.date)}</Text>
                  </View>
                </View>
                <IconSymbol name="arrow.down.circle" size={20} color={C.accent} />
              </Pressable>
            ))
          )}
        </View>

      </ScrollView>

      {/* Sheets */}
      <DealDetailSheet deal={selectedDeal} visible={dealOpen} onClose={() => setDealOpen(false)} C={C} />
      <AddNoteSheet
        visible={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSave={(text) => {
          setLocalNotes(n => [...n, { id: `ln${Date.now()}`, text, createdAt: new Date() }]);
          setNoteOpen(false);
        }}
        C={C}
      />
      <AddTaskSheet
        visible={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSave={(title) => {
          setLocalTasks(t => [...t, { id: `lt${Date.now()}`, title }]);
          setTaskOpen(false);
        }}
        C={C}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
});
