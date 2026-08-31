import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Button } from '../../../../core/ui/Button';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Card } from '../../../../core/ui/Card';
import { QtyStepper } from '../../../../core/ui/QtyStepper';
import { toast } from '../../../../core/toast';
import { formatCurrency } from '../../../../core/util/format';
import { type as fontType } from '../../../../core/theme/fonts';
import { useCartStore } from '../store/cartStore';
import { shopService } from '../services/shopApi';
import { getProductById } from '../services/productRepo';
import { CartItem } from '../store/cartStore';
import { Product } from '../types/shop';
import { AppIcon } from '../../../../core/ui/AppIcon';

interface Props {
  onBack: () => void;
}

export function CartScreen({ onBack }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const items = useCartStore(s => s.items);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const removeItem = useCartStore(s => s.removeItem);
  const clear = useCartStore(s => s.clear);
  const [placing, setPlacing] = useState(false);

  const rows = useMemo(
    () =>
      items
        .map(item => ({ item, product: getProductById(item.productId) }))
        .filter((r): r is { item: CartItem; product: Product } => !!r.product),
    [items],
  );

  const summary = useMemo(() => shopService.computeCheckoutSummary(items), [items]);

  async function checkout() {
    if (rows.length === 0) return;
    setPlacing(true);
    try {
      const { orderId } = await shopService.placeOrder();
      toast.success('Order placed (' + orderId + '). Will sync when online.');
      clear();
    } catch {
      toast.error('Checkout failed.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar title="Your cart" subtitle={`${summary.itemCount} items`} onBack={onBack} />
      <FlatList
        data={rows}
        keyExtractor={r => r.item.productId}
        contentContainerStyle={styles.content}
        renderItem={({ item: row }) => (
          <Card style={styles.rowCard}>
            <View style={[styles.thumb, { backgroundColor: c.surfaceAlt }]}>
              <AppIcon name="leaf" size={22} color="secondary" />
            </View>
            <View style={styles.rowBody}>
              <Text numberOfLines={2} style={[styles.name, { color: c.text }]}>
                {row.product.name}
              </Text>
              <Text style={[styles.each, { color: c.primary }]}>
                {formatCurrency(row.product.price)} each
              </Text>
              <View style={styles.qtyRow}>
                <QtyStepper
                  quantity={row.item.quantity}
                  min={1}
                  max={99}
                  onChange={q => updateQuantity(row.item.productId, q)}
                />
                <Pressable
                  onPress={() => removeItem(row.item.productId)}
                  style={styles.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Remove item"
                >
                  <Text style={[styles.removeText, { color: c.danger }]}>Remove</Text>
                </Pressable>
              </View>
              <Text style={[styles.lineTotal, { color: c.text }]}>
                {formatCurrency(row.product.price * row.item.quantity)}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            message="Add some Ayurvedic products to get started."
          />
        }
        ListFooterComponent={
          rows.length > 0 ? (
            <View style={[styles.summary, { backgroundColor: c.surface, borderColor: c.border }]}>
              <SummaryLine label="Subtotal" value={formatCurrency(summary.subtotal)} />
              <SummaryLine label="Discount (10%)" value={`- ${formatCurrency(summary.discount)}`} />
              <SummaryLine
                label="Shipping"
                value={summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
              />
              <SummaryLine label="Tax (5%)" value={formatCurrency(summary.tax)} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <SummaryLine label="Total" value={formatCurrency(summary.total)} strong />
              <Button
                label={placing ? 'Placing order…' : 'Place order'}
                onPress={checkout}
                loading={placing}
                disabled={placing}
                fullWidth
                style={{ marginTop: 12 }}
              />
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={styles.sumLine}>
      <Text style={[styles.sumLabel, { color: c.textSecondary, fontWeight: strong ? '700' : '400' }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.sumValue,
          { color: c.text, fontWeight: strong ? '800' : '600', fontSize: strong ? 17 : 14 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  rowCard: { flexDirection: 'row' },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: { flex: 1 },
  name: { ...fontType.cardTitle, fontSize: 14, marginBottom: 2 },
  each: { ...fontType.caption, fontSize: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  removeBtn: { marginLeft: 'auto', paddingLeft: 10, paddingVertical: 6 },
  removeText: { ...fontType.label, fontSize: 12 },
  lineTotal: { marginTop: 8, ...fontType.price },
  summary: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 8 },
  sumLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  sumLabel: { ...fontType.body, fontSize: 14 },
  sumValue: { ...fontType.bodyMedium, fontSize: 14 },
  divider: { height: 1, marginVertical: 8 },
});

export default CartScreen;
