/**
 * NDA Screen — shown once after splash on first launch.
 * User must accept to proceed. Acceptance stored in AsyncStorage.
 */

import React from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/use-colors';

const KX_LOGO = require('@/assets/images/kx-logo.png');
export const NDA_STORAGE_KEY = 'kx:nda_accepted';

interface Props {
  onAccept: () => void;
}

export function NDAScreen({ onAccept }: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const handleAccept = async () => {
    await AsyncStorage.setItem(NDA_STORAGE_KEY, 'true');
    onAccept();
  };

  const handleDecline = () => {
    Alert.alert(
      'Agreement Required',
      'You must agree to the Non-Disclosure Agreement to access KaNeXT.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={KX_LOGO}
          style={[styles.logo, { tintColor: C.label }]}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: C.label }]}>Non-Disclosure Agreement</Text>
        <Text style={[styles.subtitle, { color: C.secondary }]}>
          Please read and accept before continuing
        </Text>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        <Text style={[styles.body, { color: C.label }]}>
          The information you are about to access is proprietary and confidential.
        </Text>

        <Text style={[styles.body, { color: C.label }]}>
          By tapping "I Agree," you acknowledge and agree to the following:
        </Text>

        {[
          'All data, intelligence, analytics, player evaluations, scouting reports, and platform materials accessed through KaNeXT are strictly confidential.',
          'You will not distribute, reproduce, publish, or share any materials, data, or intelligence accessed through this platform without the express written consent of KaNeXT LLC.',
          'You will not use any information accessed through this platform for competitive purposes or to the detriment of KaNeXT LLC or any of its affiliated organizations.',
          'Unauthorized disclosure may result in immediate termination of access and legal action pursuant to applicable law.',
          'This agreement is binding and effective for the duration of your access to the KaNeXT platform.',
        ].map((clause, i) => (
          <View key={i} style={styles.clauseRow}>
            <Text style={[styles.clauseNum, { color: C.secondary }]}>{i + 1}.</Text>
            <Text style={[styles.clauseText, { color: C.label }]}>{clause}</Text>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        <Text style={[styles.footer, { color: C.secondary }]}>
          KaNeXT LLC · All Rights Reserved
        </Text>
      </ScrollView>

      {/* Fixed bottom buttons */}
      <View style={[styles.buttons, { paddingBottom: insets.bottom + 24, backgroundColor: C.bg }]}>
        <Pressable
          style={({ pressed }) => [styles.agreeBtn, { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 }]}
          onPress={handleAccept}
        >
          <Text style={[styles.agreeBtnText, { color: C.bg }]}>I Agree</Text>
        </Pressable>
        <View style={{ height: 14 }} />
        <Pressable hitSlop={12} onPress={handleDecline}>
          <Text style={[styles.declineText, { color: C.secondary }]}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  content: {
    paddingHorizontal: 28,
  },
  logo: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 24,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  clauseRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  clauseNum: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 18,
    paddingTop: 1,
  },
  clauseText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 16,
    alignItems: 'center',
  },
  agreeBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  agreeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  declineText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
