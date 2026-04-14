/**
 * Templates — Reusable message templates for deal outreach and follow-ups.
 * Owner-only.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Types & Data ──────────────────────────────────────────────────────────────

type Category = 'Outreach' | 'Follow-Up' | 'Proposal' | 'Thank You' | 'Custom';
const CATEGORIES: Category[] = ['Outreach', 'Follow-Up', 'Proposal', 'Thank You', 'Custom'];
const FILTER_PILLS = ['All', ...CATEGORIES];

const MERGE_FIELDS = [
  { key: '{brand_name}' },
  { key: '{contact_name}' },
  { key: '{creator_name}' },
  { key: '{follower_count}' },
  { key: '{engagement_rate}' },
  { key: '{monthly_views}' },
  { key: '{deal_value}' },
  { key: '{rate_card_link}' },
];

interface Template {
  id: string;
  name: string;
  category: Category;
  subject: string;
  body: string;
  editedAgo: string;
}

const DEMO_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Cold Pitch - Fitness Brands',
    category: 'Outreach',
    subject: 'Partnership Opportunity with {creator_name}',
    body: "Hi {brand_name}, I'm a coach and content creator with {follower_count} followers and a {engagement_rate} engagement rate. I'd love to explore a partnership around your fitness products. My audience is highly engaged and aligned with your brand values.",
    editedAgo: 'Edited 3d ago',
  },
  {
    id: 't2',
    name: 'Follow-Up - No Response',
    category: 'Follow-Up',
    subject: 'Following up - {brand_name} Partnership',
    body: "Hi {contact_name}, I wanted to follow up on my previous message about a potential partnership with {brand_name}. I understand you're busy — just wanted to make sure this didn't get lost. Happy to send more info or jump on a quick call.",
    editedAgo: 'Edited 1w ago',
  },
  {
    id: 't3',
    name: 'Standard Proposal',
    category: 'Proposal',
    subject: 'Proposal for {brand_name} x {creator_name}',
    body: "Hi {contact_name}, thank you for your interest in working together. Based on our conversation, here's what I'm proposing for {brand_name}: a {deal_value} partnership package that includes dedicated content across my channels reaching {follower_count} followers.",
    editedAgo: 'Edited 2d ago',
  },
  {
    id: 't4',
    name: 'Post-Deal Thank You',
    category: 'Thank You',
    subject: 'Thank you - {brand_name} Partnership',
    body: "Hi {contact_name}, I wanted to say thank you for the partnership with {brand_name}. The campaign was a great experience and I'd love to continue working together in the future. I'll follow up with final performance metrics next week.",
    editedAgo: 'Edited 2w ago',
  },
  {
    id: 't5',
    name: 'Negotiation Counter',
    category: 'Custom',
    subject: 'Counter Proposal - {brand_name}',
    body: "Hi {contact_name}, I appreciate the offer from {brand_name}. After reviewing, I'd like to propose an adjusted rate of {deal_value} based on my current {follower_count} audience and {engagement_rate} engagement. I believe this reflects the value I can bring.",
    editedAgo: 'Edited 5d ago',
  },
];

// ── Template Editor (full-screen modal) ───────────────────────────────────────

function TemplateEditor({
  template,
  visible,
  onClose,
  onSave,
  C,
  insets,
}: {
  template: Template | null;
  visible: boolean;
  onClose: () => void;
  onSave: (t: Omit<Template, 'id' | 'editedAgo'>) => void;
  C: ReturnType<typeof useColors>;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Outreach');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showDipson, setShowDipson] = useState(false);
  const [dipsonPrompt, setDipsonPrompt] = useState('');

  React.useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setSubject(template.subject);
      setBody(template.body);
    } else {
      setName('');
      setCategory('Outreach');
      setSubject('');
      setBody('');
    }
    setShowDipson(false);
    setDipsonPrompt('');
  }, [template, visible]);

  const inputStyle = {
    backgroundColor: C.surface, borderRadius: 10, padding: 12,
    fontSize: 14, color: C.label, marginBottom: 16,
    borderWidth: 1, borderColor: C.separator,
  };

  const fieldLabel = (t: string) => (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{t}</Text>
  );

  const canSave = name.trim().length > 0 && body.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Editor top bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'flex-end',
          paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 10,
          borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
          backgroundColor: C.bg,
        }}>
          <Pressable onPress={onClose} style={{ paddingVertical: 6, paddingRight: 12 }}>
            <Text style={{ fontSize: 15, color: C.secondary }}>Cancel</Text>
          </Pressable>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: C.label, textAlign: 'center' }} numberOfLines={1}>
            {template ? 'Edit Template' : 'New Template'}
          </Text>
          <Pressable
            onPress={() => {
              if (!canSave) return;
              onSave({ name: name.trim(), category, subject, body });
              onClose();
            }}
            style={{ paddingVertical: 6, paddingLeft: 12 }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: canSave ? C.label : C.secondary }}>Save</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {fieldLabel('Template Name')}
            <TextInput
              style={inputStyle}
              placeholder="Template name"
              placeholderTextColor={C.secondary}
              value={name}
              onChangeText={setName}
            />

            {fieldLabel('Category')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => { setCategory(cat); Haptics.selectionAsync(); }}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                      backgroundColor: category === cat ? C.label : 'transparent',
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: category === cat ? C.label : C.separator,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: category === cat ? C.bg : C.label }}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {fieldLabel('Subject Line')}
            <TextInput
              style={inputStyle}
              placeholder="Subject line (optional)"
              placeholderTextColor={C.secondary}
              value={subject}
              onChangeText={setSubject}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              {fieldLabel('Body')}
              <Pressable
                onPress={() => setShowDipson(d => !d)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 6 }}
              >
                <IconSymbol name="sparkles" size={13} color={C.secondary} />
                <Text style={{ fontSize: 12, color: C.secondary }}>Dipson Assist</Text>
              </Pressable>
            </View>

            {showDipson && (
              <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.separator }}>
                <TextInput
                  style={{ fontSize: 14, color: C.label, minHeight: 48 }}
                  placeholder="Tell Dipson what to draft..."
                  placeholderTextColor={C.secondary}
                  value={dipsonPrompt}
                  onChangeText={setDipsonPrompt}
                  multiline
                />
                <Pressable
                  onPress={() => {
                    if (!dipsonPrompt.trim()) return;
                    setBody(`Hi {contact_name},\n\n${dipsonPrompt.trim()}\n\nBest,\n{creator_name}`);
                    setShowDipson(false);
                    setDipsonPrompt('');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                  style={({ pressed }) => ({
                    marginTop: 10, backgroundColor: C.label, borderRadius: 8,
                    paddingVertical: 9, alignItems: 'center', opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Generate Draft</Text>
                </Pressable>
              </View>
            )}

            <TextInput
              style={[inputStyle, { minHeight: 140, textAlignVertical: 'top' }]}
              placeholder="Write your template..."
              placeholderTextColor={C.secondary}
              value={body}
              onChangeText={setBody}
              multiline
            />

            {fieldLabel('Insert Merge Field')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {MERGE_FIELDS.map(field => (
                  <Pressable
                    key={field.key}
                    onPress={() => { setBody(prev => prev + field.key); Haptics.selectionAsync(); }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                      backgroundColor: pressed ? C.surface : 'transparent',
                      borderWidth: 1, borderColor: C.separator,
                    })}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{field.key}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  C,
}: {
  template: Template;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const preview = template.body.replace(/\n/g, ' ').trim();

  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => ({
        backgroundColor: pressed ? C.bg : C.surface,
        borderRadius: 12, padding: 14, marginBottom: 8,
      })}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 6 }}>{template.name}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{template.category}</Text>
        </View>
        <Text style={{ fontSize: 11, color: C.secondary }}>{template.editedAgo}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: 13, color: C.secondary }} numberOfLines={1}>{preview}</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(template.name, undefined, [
              { text: 'Edit',      onPress: onEdit },
              { text: 'Duplicate', onPress: onDuplicate },
              { text: 'Delete',    style: 'destructive', onPress: onDelete },
              { text: 'Cancel',    style: 'cancel' },
            ]);
          }}
          hitSlop={8}
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
        >
          <IconSymbol name="ellipsis" size={16} color={C.secondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TemplatesScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + 52;
  const PILL_ROW_H = 52;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:deals');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [templates, setTemplates] = useState<Template[]>(DEMO_TEMPLATES);
  const [filter, setFilter] = useState('All');
  const [editorTarget, setEditorTarget] = useState<Template | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'All') return templates;
    return templates.filter(t => t.category === filter);
  }, [templates, filter]);

  const openEditor = (template: Template | null) => {
    setEditorTarget(template);
    setEditorOpen(true);
  };

  const handleSave = (data: Omit<Template, 'id' | 'editedAgo'>) => {
    if (editorTarget) {
      setTemplates(prev => prev.map(t => t.id === editorTarget.id ? { ...t, ...data, editedAgo: 'Edited just now' } : t));
    } else {
      setTemplates(prev => [...prev, { id: `t${Date.now()}`, editedAgo: 'Edited just now', ...data }]);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDuplicate = (template: Template) => {
    const copy: Template = { ...template, id: `t${Date.now()}`, name: `${template.name} (Copy)`, editedAgo: 'Edited just now' };
    setTemplates(prev => [...prev, copy]);
    setEditorTarget(copy);
    setEditorOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (template: Template) => {
    Alert.alert(`Delete "${template.name}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          setTemplates(prev => prev.filter(t => t.id !== template.id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: insets.top,
        backgroundColor: C.bg,
        opacity,
      }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18,
              backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.separator,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Templates</Text>
            </View>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
        </View>
      </Animated.View>

      {/* Filter pills row */}
      <View style={{
        position: 'absolute', top: topBarH, left: 0, right: 0, zIndex: 9,
        backgroundColor: C.bg, paddingBottom: 10,
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingTop: 10 }}
        >
          {FILTER_PILLS.map(pill => (
            <Pressable
              key={pill}
              onPress={() => { setFilter(pill); Haptics.selectionAsync(); }}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
                backgroundColor: filter === pill ? C.label : 'transparent',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: filter === pill ? C.label : C.separator,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === pill ? C.bg : C.label }}>{pill}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH + PILL_ROW_H, paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.label }}>No templates yet</Text>
            <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>
              {'Tap + to create one.\nTemplates save time on brand outreach, follow-ups, and proposals.'}
            </Text>
          </View>
        ) : (
          filtered.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => openEditor(template)}
              onDuplicate={() => handleDuplicate(template)}
              onDelete={() => handleDelete(template)}
              C={C}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openEditor(null); }}
        style={({ pressed }) => ({
          position: 'absolute', right: 20, bottom: insets.bottom + 80,
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: C.label, alignItems: 'center', justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
        })}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>

      {/* Editor modal */}
      <TemplateEditor
        template={editorTarget}
        visible={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        C={C}
        insets={insets}
      />
    </View>
  );
}
