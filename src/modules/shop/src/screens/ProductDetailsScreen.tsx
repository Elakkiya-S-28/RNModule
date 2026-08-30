import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Badge } from '../../../../core/ui/Badge';
import { Button } from '../../../../core/ui/Button';
import { toast } from '../../../../core/toast';
import { formatCurrency } from '../../../../core/util/format';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Product } from '../types/shop';

interface Props {
  product: Product | null;
  onBack: () => void;
}

/** Module 2 — product detail with add-to-cart & wishlist. */
export function ProductDetailsScreen({ product, onBack }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const addItem = useCartStore(s => s.addItem);
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const qty = useCartStore(s => s.items.find(i => i.productId === product?.id)?.quantity ?? 0);

  const outOfStock = useMemo(() => (product ? product.stock <= 0 : true), [product]);

  if (!product) {
    return (
      <View>
        <AppBar title="Product" onBack={onBack} />
        <Text style={{ padding: 24, color: c.textSecondary }}>Product not found.</Text>
      </View>
    );
  }

  const discountPct =
    product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar title="Product details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.image, { backgroundColor: c.surfaceAlt }]}>
          <Text style={{ fontSize: 60 }}>🌿</Text>
          {discountPct > 0 ? (
            <Badge label={`${discountPct}% off`} tone="danger" style={styles.discount} />
          ) : null}
        </View>

        <Text style={[styles.name, { color: c.text }]}>{product.name}</Text>
        <Text style={[styles.brand, { color: c.primary }]}>
          {product.brand} · {product.category}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: c.text }]}>{formatCurrency(product.price)}</Text>
          {product.mrp > product.price ? (
            <Text style={[styles.mrp, { color: c.textMuted }]}>{formatCurrency(product.mrp)}</Text>
          ) : null}
        </View>
        <Text style={{ color: c.warning, fontSize: 14 }}>★ {product.rating.toFixed(1)} ({product.reviewsCount} reviews)</Text>

        <View style={styles.badgeRow}>
          {product.tags.map(t => (
            <Badge key={t} label={t} tone="info" small />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Description</Text>
        <Text style={{ color: c.textSecondary, lineHeight: 20 }}>{product.description}</Text>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Details</Text>
        <Text style={{ color: c.textSecondary }}>
          Weight: {product.weight} · {product.herbal ? 'Herbal ✓' : 'Conventional'} · Stock: {product.stock}
        </Text>

        <View style={styles.qtyRow}>
          <View style={styles.qtyControls}>
            <QtyBtn label="−" onPress={() => qty > 1 && useCartStore.getState().updateQuantity(product.id, qty - 1)} disabled={qty <= 0} />
            <Text style={{ color: c.text, fontWeight: '700', minWidth: 30, textAlign: 'center' }}>{qty}</Text>
            <QtyBtn label="+" onPress={() => useCartStore.getState().updateQuantity(product.id, qty + 1)} />
          </View>
          <Badge label={qty > 0 ? `${qty} in cart` : 'Not in cart'} tone={qty > 0 ? 'success' : 'neutral'} small />
        </View>

        <Button
          label={outOfStock ? 'Out of stock' : qty > 0 ? 'Add more to cart' : 'Add to cart'}
          disabled={outOfStock}
          onPress={() => {
            addItem(product.id, 1);
            toast.success('Added to cart');
          }}
          style={styles.addBtn}
          fullWidth
        />
        <Button
          label="♥ Wishlist"
          variant="outline"
          onPress={() => {
            toggleWishlist(product.id);
            toast.info('Wishlist updated');
          }}
          style={styles.wishBtn}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

function QtyBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Button label={label} variant="outline" onPress={onPress} disabled={disabled} style={{ minWidth: 44, paddingVertical: 8 }} />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  image: { height: 200, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  discount: { position: 'absolute', top: 12, left: 12 },
  name: { fontSize: 20, fontWeight: '700' },
  brand: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  price: { fontSize: 20, fontWeight: '800' },
  mrp: { textDecorationLine: 'line-through', fontSize: 15 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { marginTop: 24 },
  wishBtn: { marginTop: 10 },
});

export default ProductDetailsScreen;