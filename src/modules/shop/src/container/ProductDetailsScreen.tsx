import React, { useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Badge } from '../../../../core/ui/Badge';
import { Button } from '../../../../core/ui/Button';
import { QtyStepper } from '../../../../core/ui/QtyStepper';
import { toast } from '../../../../core/toast';
import { formatCurrency } from '../../../../core/util/format';
import { type as fontType } from '../../../../core/theme/fonts';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { usePop } from '../../../../core/util/motion';
import { AppIcon } from '../../../../core/ui/AppIcon';
import { Product } from '../types/shop';

interface Props {
  product: Product | null;
  onBack: () => void;
}

export function ProductDetailsScreen({ product, onBack }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const addItem = useCartStore(s => s.addItem);
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const inCartQty = useCartStore(
    s => (product ? s.items.find(i => i.productId === product.id)?.quantity ?? 0 : 0),
  );
  const wished = useWishlistStore(
    s => (product ? s.productIds.includes(product.id) : false),
  );
  const [selectedQty, setSelectedQty] = useState(1);
  const cartPop = usePop(inCartQty);

  const outOfStock = useMemo(() => (product ? product.stock <= 0 : true), [product]);

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <AppBar title="Product" onBack={onBack} />
        <Text style={[styles.notFound, { color: c.textSecondary }]}>Product not found.</Text>
      </View>
    );
  }

  const discountPct =
    product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    addItem(product.id, selectedQty);
    toast.success(
      `${selectedQty} × ${product.name} added to cart`,
    );
    setSelectedQty(1);
  }

  function handleToggleWishlist() {
    if (!product) return;
    toggleWishlist(product.id);
    toast.info(wished ? 'Removed from wishlist' : 'Saved to wishlist');
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar title="Product details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.image, { backgroundColor: c.surfaceAlt }]}
        >
          <AppIcon name="leaf" size={60} color="secondary" />
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
          <View style={styles.ratingWrap}>
            <AppIcon name="star" size={13} color="warning" />
            <Text style={[styles.rating, { color: c.warning }]}>
              {product.rating.toFixed(1)} ({product.reviewsCount})
            </Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          {product.tags.map(t => (
            <Badge key={t} label={t} tone="info" small />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Description</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>{product.description}</Text>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Details</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {'Weight: '}
          {product.weight} ·{' '}
          {product.herbal ? 'Herbal ' : 'Conventional'}
          {product.herbal ? (
            <AppIcon name="check" size={12} color="success" />
          ) : null}
          {' · Stock: '}
          {product.stock}
        </Text>

        <View style={styles.qtySection}>
          <View style={styles.qtyLabels}>
            <Text style={[styles.sectionTitle, { color: c.text, marginTop: 0 }]}>Quantity</Text>
                        {inCartQty > 0 ? (
              <Animated.View style={{ transform: [{ scale: cartPop }] }}>
                <Badge
                  label={`${inCartQty} already in cart`}
                  tone="success"
                  small
                />
              </Animated.View>
            ) : null}
          </View>
          <QtyStepper
            quantity={selectedQty}
            min={1}
            max={Math.max(1, Math.min(10, product.stock))}
            onChange={setSelectedQty}
          />
        </View>

        <Button
          label={
            outOfStock
              ? 'Out of stock'
              : `Add ${selectedQty} to cart · ${formatCurrency(product.price * selectedQty)}`
          }
          disabled={outOfStock}
          onPress={handleAddToCart}
          style={styles.addBtn}
          fullWidth
        />
        <Button
          label={wished ? 'Saved to wishlist' : 'Save to wishlist'}
          variant="outline"
          onPress={handleToggleWishlist}
          style={styles.wishBtn}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  image: {
    height: 200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  discount: { position: 'absolute', top: 12, left: 12 },
  name: { ...fontType.screenTitle, fontSize: 20 },
  brand: { ...fontType.bodyMedium, fontSize: 14, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  price: { ...fontType.price, fontSize: 20 },
  mrp: { textDecorationLine: 'line-through', fontSize: 15 },
  rating: { ...fontType.caption, marginLeft: 4 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sectionTitle: { ...fontType.sectionTitle, fontSize: 16, marginTop: 20, marginBottom: 6 },
  body: { ...fontType.body, lineHeight: 20 },
  qtySection: { marginTop: 20 },
  qtyLabels: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  addBtn: { marginTop: 24 },
  wishBtn: { marginTop: 10 },
  notFound: { padding: 24, ...fontType.body },
});

export default ProductDetailsScreen;
