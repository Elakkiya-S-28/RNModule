import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Button } from '../../../../core/ui/Button';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Card } from '../../../../core/ui/Card';
import { toast } from '../../../../core/toast';
import { formatCurrency } from '../../../../core/util/format';
import { useCartStore } from '../store/cartStore';
import { shopService } from '../services/shopApi';
import { getProductById } from '../services/productRepo';
import { CartItem } from '../store/cartStore';
import { Product } from '../types/shop';

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
              <Text style={{ fontSize: 22 }}>🌿</Text>
            </View>
            <View style={styles.rowBody}>
              <Text numberOfLines={2} style={[styles.name, { color: c.text }]}>
                {row.product.name}
              </Text>
              <Text style={{ color: c.primary, fontSize: 12 }}>
                {formatCurrency(row.product.price)} each
              </Text>
              <View style={styles.qtyRow}>
                <QtyBtn label="-" onPress={() => updateQuantity(row.item.productId, row.item.quantity - 1)} />
                <Text style={{ color: c.text, fontWeight: '700', minWidth: 28, textAlign: 'center' }}>
                  {row.item.quantity}
                </Text>
                <QtyBtn label="+" onPress={() => updateQuantity(row.item.productId, row.item.quantity + 1)} />
                <Pressable
                  onPress={() => removeItem(row.item.productId)}
                  style={{ marginLeft: 'auto' }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove item"
                >
                  <Text style={{ color: c.danger, fontSize: 12, fontWeight: '600' }}>Remove</Text>
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
            icon="🛒"
            title="Your cart is empty"
            message="Add some Ayurvedic products to get started."
          />
        }
        ListFooterComponent={
          rows.length > 0 ? (
            <View style={[styles.summary, { backgroundColor: c.surface, borderColor: c.border }]}>
              <SummaryLine label="Subtotal" value={formatCurrency(summary.subtotal)} />
              <SummaryLine label="Discount (10%)" value={`- ${formatCurrency(summary.discount)}`} />
              <SummaryLine label="Shipping" value={summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)} />
              <SummaryLine label="Tax (5%)" value={formatCurrency(summary.tax)} />
              <View style={styles.divider} />
              <SummaryLine label="Total" value={formatCurrency(summary.total)} strong />
              <Button
                label={placing ? 'Placing order...' : 'Place order'}
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
function QtyBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.qtyBtn, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
      accessibilityRole="button"
    >
      <Text style={{ color: c.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={styles.sumLine}>
      <Text style={[styles.sumLabel, { color: c.textSecondary, fontWeight: strong ? '700' : '400' }]}>{label}</Text>
      <Text style={[styles.sumValue, { color: c.text, fontWeight: strong ? '800' : '600', fontSize: strong ? 17 : 14 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  rowCard: { flexDirection: 'row' },
  thumb: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowBody: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  qtyBtn: { borderWidth: 1, borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  lineTotal: { marginTop: 8, fontWeight: '700' },
  summary: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 8 },
  sumLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  sumLabel: { fontSize: 14 },
  sumValue: { fontSize: 14 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 8 },
});

export default CartScreen;
