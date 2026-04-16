/**
 * Phone — Contacts screen.
 * Alphabetical contact list with search. Standalone screen from sidebar.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, StyleSheet, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { PHONE_CONTACTS, type PhoneContact } from '@/data/mock-phone';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';

export default function ContactsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    if (isOwnerRef.current === isOwner) return;
    isOwnerRef.current = isOwner;
    router.navigate('/(tabs)/(main)/phone' as any);
  }, [isOwner]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const sections = useMemo(() => {
    const filtered = PHONE_CONTACTS.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const grouped: Record<string, PhoneContact[]> = {};
    filtered.forEach(c => {
      const letter = c.name[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(c);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [searchQuery]);

  const handleContactPress = (contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(contact.name, `${contact.role ?? ''} · ${contact.username}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => {} },
      { text: 'Call', onPress: () => {} },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: insets.top, backgroundColor: C.bg, opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Contacts</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, gap: 7 }}>
            <IconSymbol name="magnifyingglass" size={14} color={C.secondary} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: C.label, padding: 0 }}
              placeholder="Search contacts..."
              placeholderTextColor={C.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Alphabetical list */}
        {sections.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, color: C.secondary }}>No contacts found</Text>
          </View>
        ) : (
          sections.map(([letter, contacts]) => (
            <View key={letter}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 4, backgroundColor: C.surface }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, letterSpacing: 0.5 }}>
                  {letter}
                </Text>
              </View>
              {contacts.map(contact => (
                <Pressable
                  key={contact.id}
                  onPress={() => handleContactPress(contact)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16, paddingVertical: 11,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
                    backgroundColor: pressed ? C.surface : 'transparent',
                  })}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{contact.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }} numberOfLines={1}>{contact.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }} numberOfLines={1}>{contact.username}</Text>
                  </View>
                  {contact.online && (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GAIN }} />
                  )}
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
