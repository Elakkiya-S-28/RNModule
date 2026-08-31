import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Product } from '../types/shop';
import { Badge } from '../../../../core/ui/Badge';
import { formatCurrency } from '../../../../core/util/format';
import { type as fontType } from '../../../../core/theme/fonts';
import { useWishlistStore } from '../store/wishlistStore';
import { useToggleScale, FadeInView } from '../../../../core/util/motion';
import { AppIcon, AnimatedAppIcon } from '../../../../core/ui/AppIcon';

interface Props {
  product: Product;
  onPress?: () => void;
  onWishlistToggle?: (id: string) => void;
  entranceDelay?: number;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onPress,
  onWishlistToggle,
  entranceDelay = 0,
}: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const surfaceStyle =
    theme.mode === 'dark'
      ? { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }
      : { backgroundColor: c.surface, ...theme.shadow.card, shadowColor: c.shadowPrimary };
  const wished = useWishlistStore(s => s.productIds.includes(product.id));
  const [justToggled, setJustToggled] = useState(false);
  const heartPop = useToggleScale(justToggled);
  const outOfStock = product.stock <= 0;
  const discountPct =
    product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <FadeInView style={styles.cardWrap} delay={entranceDelay}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        style={({ pressed }) => [
          styles.card,
          surfaceStyle,
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <View style={[styles.image, { backgroundColor: c.surfaceAlt }]}>
          <AppIcon name="leaf" size={30} color="secondary" />
          {discountPct > 0 ? (
            <View style={[styles.discountBadge, { backgroundColor: c.secondary }]}>
              <Text style={styles.discountText}>{discountPct}%</Text>
            </View>
          ) : null}
          <Pressable
            onPress={() => {
              setJustToggled(true);
              onWishlistToggle?.(product.id);
            }}
            hitSlop={8}
            style={styles.wish}
            accessibilityRole="button"
            accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
                                    <AnimatedAppIcon
              name={wished ? 'heart' : 'heartOutline'}
              size={18}
              color={wished ? 'secondary' : 'textMuted'}
              style={{
                transform: [{ scale: heartPop }],
              }}
            />
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
          <View style={styles.ratingWrap}>
            <AppIcon name="star" size={12} color="accent" />
            <Text style={[styles.rating, { color: c.accent }]}>
              {product.rating.toFixed(1)}
            </Text>
          </View>
          {outOfStock ? (
            <Badge label="Out of stock" tone="danger" small />
          ) : (
            <Badge label="In stock" tone="success" small />
          )}
        </View>
      </Pressable>
    </FadeInView>
  );
});

const styles = StyleSheet.create({
  cardWrap: { flex: 1 },
  card: { flex: 1, borderRadius: 16, padding: 10, margin: 6 },
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
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { ...fontType.caption },
});

export default ProductCard;
