import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const CARDS = [
  { id: '1', type: 'Visa', last4: '4821', expiry: '09/27' },
  { id: '2', type: 'Mastercard', last4: '3310', expiry: '03/26' },
];

export default function LinkedCardsScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Linked Cards</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {CARDS.map((card, i) => (
            <React.Fragment key={card.id}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
              <View style={styles.row}>
                <View style={[styles.cardIcon, { backgroundColor: C.separator }]}>
                  <Text style={[styles.cardType, { color: C.label }]}>{card.type.slice(0, 2)}</Text>
                </View>
                <Text style={[styles.cardNumber, { color: C.label }]}>
                  {card.type} ••••{card.last4}
                </Text>
                <Text style={[styles.expiry, { color: C.muted }]}>{card.expiry}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Pressable style={[styles.addCardBtn, { borderColor: '#111' }]}>
          <IconSymbol name="plus" size={16} color="#111" />
          <Text style={styles.addCardText}>Add Card</Text>
        </Pressable>

        {/* Physical Card */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>PHYSICAL CARD</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.physicalCard}>
            <Text style={[styles.physicalTitle, { color: C.label }]}>Order Free Card</Text>
            <Text style={[styles.physicalSub, { color: C.muted }]}>Free shipping, arrives in 7–10 days</Text>
            <Pressable style={styles.orderBtn}>
              <Text style={styles.orderBtnText}>Order Now</Text>
            </Pressable>
          </View>
        </View>
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
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  cardIcon: {
    width: 36, height: 24, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  cardType: { fontSize: 10, fontWeight: '700' },
  cardNumber: { flex: 1, fontSize: 15, fontWeight: '500' },
  expiry: { fontSize: 13 },
  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 12, gap: 8,
    borderWidth: 1.5, borderRadius: 14, paddingVertical: 14,
  },
  addCardText: { fontSize: 15, fontWeight: '600', color: '#111' },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.7, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 6,
  },
  physicalCard: { padding: 20, alignItems: 'center' },
  physicalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  physicalSub: { fontSize: 13, marginBottom: 16, textAlign: 'center' },
  orderBtn: {
    backgroundColor: '#111', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  orderBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});
