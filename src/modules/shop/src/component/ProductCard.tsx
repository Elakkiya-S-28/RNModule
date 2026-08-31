import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Product } from '../types/shop';
import { Badge } from '../../../../core/ui/Badge';
import { formatCurrency } from '../../../../core/util/format';
import { type as fontType } from '../../../../core/theme/fonts';
import { useWishlistStore } from '../store/wishlistStore';

interface Props {
  product: Product;
  onPress?: () => void;
  onWishlistToggle?: (id: string) => void;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onPress,
  onWishlistToggle,
}: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const wished = useWishlistStore(s => s.productIds.includes(product.id));
  const outOfStock = product.stock <= 0;
  const discountPct =
    product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.image, { backgroundColor: c.surfaceAlt }]}>
        <Text style={{ fontSize: 30 }}>🌿</Text>
        {discountPct > 0 ? (
          <View style={[styles.discountBadge, { backgroundColor: c.terracotta }]}>
            <Text style={styles.discountText}>{discountPct}%</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => onWishlistToggle?.(product.id)}
          hitSlop={8}
          style={styles.wish}
          accessibilityRole="button"
          accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Text style={{ fontSize: 18, color: wished ? c.terracotta : c.textMuted }}>
            {wished ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
      <Text numberOfLines={2} style={[styles.name, { color: c.text }]}>
        {product.name}
      </Text>
      <Text numberOfLines={1} style={[styles.brand, { color: c.primary }]}>
        {product.brand} · {product.weight}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: c.text }]}>{formatCurrency(product.price)}</Text>
        {product.mrp > product.price ? (
          <Text style={[styles.mrp, { color: c.textMuted }]}>{formatCurrency(product.mrp)}</Text>
        ) : null}
      </View>
      <View style={styles.bottomRow}>
        <Text style={[styles.rating, { color: c.accent }]}>★ {product.rating.toFixed(1)}</Text>
        {outOfStock ? (
          <Badge label="Out of stock" tone="danger" small />
        ) : (
          <Badge label="In stock" tone="success" small />
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 10, margin: 6 },
  image: {
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  discountText: { ...fontType.label, color: '#FFFFFF', fontSize: 10 },
  wish: { position: 'absolute', top: 4, right: 4 },
  name: { ...fontType.cardTitle, fontSize: 13.5, lineHeight: 18 },
  brand: { ...fontType.caption, fontSize: 11.5, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  price: { ...fontType.price, fontSize: 15 },
  mrp: { textDecorationLine: 'line-through', fontSize: 12 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rating: { ...fontType.caption },
});

export default ProductCard;
