/**
 * Competition Store Bottom Sheet
 *
 * 2x2 product grid -> cart -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { COMP_STORE_PRODUCTS, buildCompCommerceChain } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompStoreSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.qty, 0), [cart]);

  const handleClose = useCallback(() => {
    setStage('browse');
    setCart([]);
    setChain(null);
    onClose();
  }, [onClose]);

  const addToCart = useCallback((product: typeof COMP_STORE_PRODUCTS[number]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartCount === 0) return;
    setStage('confirm');
  }, [cartCount]);

  const handleConfirm = useCallback(() => {
    const desc = cart.map((c) => `${c.name} x${c.qty}`).join(', ');
    const result = buildCompCommerceChain('Merchandise Purchase', cartTotal, desc, 'RMS');
    setChain(result);
    setStage('receipt');
  }, [cart, cartTotal]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  const cartFooter = cartCount > 0 ? (
    <View style={styles.footerContainer}>
      <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>
          Checkout {'\u00B7'} {cartCount} item{cartCount > 1 ? 's' : ''} {'\u00B7'} ${cartTotal.toFixed(2)}
        </Text>
      </Pressable>
    </View>
  ) : undefined;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="K-1 Racing Store" footer={cartFooter} useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          <View style={styles.productGrid}>
            {COMP_STORE_PRODUCTS.map((product) => (
              <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${product.price.toFixed(2)}</Text>
                <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
            {cart.map((item) => (
              <View key={item.productId} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>{item.name} x{item.qty}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            {cart.map((item) => (
              <View key={item.productId} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>{item.name} x{item.qty}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  productCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  productName: { fontSize: 14, fontWeight: '800', letterSpacing: -0.5 },
  productPrice: { fontSize: 13, fontWeight: '800', letterSpacing: -0.3 },
  addButton: { backgroundColor: '#FF5555', paddingVertical: 8, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  footerContainer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  checkoutButton: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  confirmCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500', letterSpacing: 0.2 },
  confirmValue: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  amountText: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 6 },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cancelButton: { borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  chainCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1, letterSpacing: 0.2 },
});
