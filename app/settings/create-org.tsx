import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

type OrgMode = 'business' | 'education' | 'sports' | 'community';

const ORG_TYPES: { key: OrgMode; label: string; subtitle: string; icon: string }[] = [
  { key: 'business',   label: 'Business',   subtitle: 'Companies, agencies, startups',   icon: 'briefcase.fill' },
  { key: 'education',  label: 'Education',  subtitle: 'Schools, universities, programs',  icon: 'graduationcap.fill' },
  { key: 'sports',     label: 'Sports',     subtitle: 'Teams, leagues, athletics',        icon: 'trophy.fill' },
  { key: 'community',  label: 'Community',  subtitle: 'Churches, nonprofits, groups',     icon: 'person.3.fill' },
];

export default function CreateOrgScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<OrgMode | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Create Organization</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 49 + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {ORG_TYPES.map((item) => {
          const active = selected === item.key;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && !active && styles.cardPressed,
              ]}
              onPress={() => setSelected(item.key)}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <IconSymbol name={item.icon as any} size={22} color={active ? C.label : C.secondary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: C.label }]}>{item.label}</Text>
                <Text style={[styles.cardSub, { color: C.secondary }]}>{item.subtitle}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Continue */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 49 + 12 }]}>
        <Pressable
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          disabled={!selected}
          onPress={() => router.back()}
        >
          <Text style={[styles.continueBtnText, !selected && styles.continueBtnTextDisabled]}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
    marginBottom: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },

  // Cards
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: 'transparent',
    paddingVertical: 18, paddingHorizontal: 16,
  },
  cardActive: {
    borderColor: C.label,
  },
  cardPressed: { opacity: 0.7 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardLabel: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, marginTop: 2 },

  // Radio
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: { borderColor: C.label },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.label,
  },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: '#F8F7F4' },
  continueBtn: {
    backgroundColor: C.label,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnDisabled: { backgroundColor: 'rgba(0,0,0,0.10)' },
  continueBtnText: { fontSize: 16, fontWeight: '600', color: C.surface },
  continueBtnTextDisabled: { color: 'rgba(0,0,0,0.30)' },
});
