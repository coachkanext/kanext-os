/**
 * Store Bottom Sheet
 *
 * 2×2 product grid → add to cart → checkout → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { STORE_PRODUCTS, buildCommerceChain, type CartItem, type PaymentChain } from '@/data/commerce-data';
type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function StoreSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleClose = useCallback(() => {
    setStage('browse');
    setCart([]);
    setSelectedSizes({});
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSizeSelect = useCallback((productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    const product = STORE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const size = product.sizes ? (selectedSizes[productId] || product.sizes[0]) : 'One Size';

    setCart(prev => {
      const existing = prev.find(c => c.productId === productId && c.size === size);
      if (existing) {
        return prev.map(c =>
          c.productId === productId && c.size === size
            ? { ...c, qty: c.qty + 1 }
            : c,
        );
      }
      return [...prev, { productId, name: product.name, price: product.price, size, qty: 1 }];
    });
  }, [selectedSizes]);

  const handleCheckout = useCallback(() => {
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    const desc = cart.map(c => `${c.name} (${c.size})${c.qty > 1 ? ` ×${c.qty}` : ''}`).join(', ');
    const result = buildCommerceChain('Merchandise Purchase', cartTotal, desc, 'MRC');
    setChain(result);
    setStage('receipt');
  }, [cart, cartTotal]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  const cartFooter = stage === 'browse' && cartCount > 0 ? (
    <Pressable style={styles.cartFooterBtn} onPress={handleCheckout}>
      <Text style={styles.cartFooterText}>
        Checkout · {cartCount} item{cartCount > 1 ? 's' : ''} · ${cartTotal.toFixed(2)}
      </Text>
    </Pressable>
  ) : undefined;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Team Store" footer={cartFooter} useModal>
      {stage === 'browse' && (
        <View style={styles.grid}>
          {STORE_PRODUCTS.map(product => {
            const activeSize = product.sizes
              ? (selectedSizes[product.id] || product.sizes[0])
              : 'One Size';
            return (
              <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${product.price.toFixed(2)}</Text>

                {/* Size selector */}
                <View style={styles.sizeRow}>
                  {product.sizes ? product.sizes.map(size => (
                    <Pressable
                      key={size}
                      style={[
                        styles.sizePill,
                        { borderColor: colors.border },
                        activeSize === size && styles.sizePillActive,
                      ]}
                      onPress={() => handleSizeSelect(product.id, size)}
                    >
                      <Text style={[
                        styles.sizePillText,
                        { color: colors.textSecondary },
                        activeSize === size && styles.sizePillTextActive,
                      ]}>
                        {size}
                      </Text>
                    </Pressable>
                  )) : (
                    <Text style={[styles.oneSizeText, { color: colors.textTertiary }]}>One Size</Text>
                  )}
                </View>

                <Pressable
                  style={styles.addBtn}
                  onPress={() => handleAddToCart(product.id)}
                >
                  <Text style={styles.addBtnText}>Add to Cart</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
            {cart.map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  {item.name} · {item.size}{item.qty > 1 ? ` ×${item.qty}` : ''}
                </Text>
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
            {cart.map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  {item.name} · {item.size}{item.qty > 1 ? ` ×${item.qty}` : ''}
                </Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
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
  container: {
    gap: 14,
  },

  // Product grid (2x2)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // Size selector
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  sizePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sizePillActive: {
    backgroundColor: accent,
    borderColor: accent,
  },
  sizePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sizePillTextActive: {
    color: '#fff',
  },
  oneSizeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Add to cart
  addBtn: {
    backgroundColor: accent,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Cart footer
  cartFooterBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartFooterText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Confirm / Receipt shared
  confirmCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.1,
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // CTA / Cancel
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cancelButton: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Payment chain
  chainCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
