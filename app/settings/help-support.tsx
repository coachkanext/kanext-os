import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, KeyboardAvoidingView, Platform, LayoutAnimation,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const FAQS = [
  { q: 'How do I get started with KaNeXT?', a: 'Download the app, sign up, and choose your mode. KaNeXT will guide you through setting up your organization and inviting members.' },
  { q: 'How do KaNeXT phone numbers work?', a: 'KaNeXT assigns you a dedicated number per mode. Calls and texts are routed over WiFi. On-network calls between KaNeXT users are always free.' },
  { q: 'What is KayPay?', a: 'KayPay is the built-in payment platform. You can send/receive money, pay for services, manage a digital wallet, and order a free physical card.' },
  { q: 'How does Nexus AI work?', a: 'Nexus is your AI chief of staff. It handles scheduling, communications, research, and organizational tasks. You can chat, give voice commands, or set automations.' },
  { q: 'Can I switch between modes?', a: 'Yes. Swipe up on the home icon to open the mode switcher. Each mode has its own org, roster, and feature set.' },
];

function FAQItem({ item, C, styles }: { item: { q: string; a: string }; C: ComponentColors; styles: any }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(prev => !prev);
      }}
    >
      <View style={styles.faqRow}>
        <Text style={[styles.faqQuestion, { color: C.label }]}>{item.q}</Text>
        <IconSymbol name={open ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
      </View>
      {open && (
        <View style={styles.faqAnswer}>
          <Text style={[styles.faqAnswerText, { color: C.secondary }]}>{item.a}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function HelpSupportScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [bugDesc, setBugDesc] = useState('');
  const [bugFormOpen, setBugFormOpen] = useState(false);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionLabel, { color: C.muted }]}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {FAQS.map((faq, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
              <FAQItem item={faq} C={C} styles={styles} />
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: C.muted }]}>CONTACT</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#1A1714' }]}>
              <IconSymbol name="bubble.left" size={16} color="#FFF" />
            </View>
            <Text style={[styles.rowLabel, { color: C.label }]}>Contact Support</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: C.muted }]}>REPORT</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable
            style={styles.row}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setBugFormOpen(prev => !prev);
            }}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#FF3B30' }]}>
              <IconSymbol name="exclamationmark.triangle" size={16} color="#FFF" />
            </View>
            <Text style={[styles.rowLabel, { color: C.label }]}>Report a Bug</Text>
            <IconSymbol name={bugFormOpen ? 'chevron.up' : 'chevron.right'} size={14} color={C.muted} />
          </Pressable>
          {bugFormOpen && (
            <View style={styles.bugForm}>
              <TextInput
                style={[styles.bugInput, { color: C.label, borderColor: C.separator }]}
                placeholder="Describe the bug…"
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={4}
                value={bugDesc}
                onChangeText={setBugDesc}
              />
              <View style={styles.bugActions}>
                <Pressable style={[styles.attachBtn, { borderColor: C.divider }]}>
                  <IconSymbol name="paperclip" size={16} color={C.secondary} />
                  <Text style={[styles.attachText, { color: C.secondary }]}>Attach Screenshot</Text>
                </Pressable>
                <Pressable style={[styles.submitBtn, { opacity: bugDesc.length > 0 ? 1 : 0.4 }]}>
                  <Text style={styles.submitText}>Submit</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.7, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 6,
  },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  faqRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 14 },
  faqAnswerText: { fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  bugForm: { paddingHorizontal: 16, paddingBottom: 16 },
  bugInput: {
    borderWidth: 1, borderRadius: 10, padding: 12,
    fontSize: 14, minHeight: 90, textAlignVertical: 'top',
  },
  bugActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  attachBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 10,
  },
  attachText: { fontSize: 13, fontWeight: '500' },
  submitBtn: { backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  submitText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
});
