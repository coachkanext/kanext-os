import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const TOS_TEXT = `KaNeXT OS Terms of Service

Last updated: March 2026

1. Acceptance of Terms
By accessing or using KaNeXT OS, you agree to be bound by these Terms of Service and all applicable laws and regulations.

2. Use of Service
KaNeXT OS provides communication, organization management, and productivity tools. You agree to use the service only for lawful purposes and in accordance with these Terms.

3. User Accounts
You are responsible for maintaining the confidentiality of your account credentials. You agree to notify KaNeXT immediately of any unauthorized use of your account.

4. Intellectual Property
KaNeXT OS and its original content, features, and functionality are owned by KaNeXT and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

5. Limitation of Liability
KaNeXT shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.

6. Changes to Terms
KaNeXT reserves the right to modify these terms at any time. We will notify users of significant changes via in-app notification or email.`;

const PRIVACY_TEXT = `KaNeXT OS Privacy Policy

Last updated: March 2026

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, make a payment, or contact us for support.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices and support messages.

3. Information Sharing
We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information.

4. Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing and against accidental loss.

5. Data Retention
We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time.

6. Contact Us
If you have any questions about this Privacy Policy, please contact us at privacy@kaynext.com`;

export default function TermsPrivacyScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [subPage, setSubPage] = useState<null | 'tos' | 'privacy'>(null);

  if (subPage) {
    const isTOS = subPage === 'tos';
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => setSubPage(null)}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <Text style={styles.title}>{isTOS ? 'Terms of Service' : 'Privacy Policy'}</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.docContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.docText, { color: C.label }]}>{isTOS ? TOS_TEXT : PRIVACY_TEXT}</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Terms & Privacy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable style={styles.row} onPress={() => setSubPage('tos')}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Terms of Service</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <Pressable style={styles.row} onPress={() => setSubPage('privacy')}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Privacy Policy</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>
        <Text style={[styles.footer, { color: C.muted }]}>Last updated: March 2026</Text>
      </ScrollView>
    </View>
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
  content: { paddingTop: 24 },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  footer: { fontSize: 12, textAlign: 'center', marginTop: 20 },
  docContent: { paddingHorizontal: 20, paddingTop: 16 },
  docText: { fontSize: 14, lineHeight: 22 },
});
