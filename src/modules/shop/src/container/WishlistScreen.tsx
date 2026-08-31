import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Button } from '../../../../core/ui/Button';
import { toast } from '../../../../core/toast';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { getProductById } from '../services/productRepo';
import { Product } from '../types/shop';
import { ProductCard } from '../component/ProductCard';

interface Props {
  onBack: () => void;
  onProductPress: (product: Product) => void;
}

export function WishlistScreen({ onBack, onProductPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const productIds = useWishlistStore(s => s.productIds);
  const toggle = useWishlistStore(s => s.toggle);
  const addItem = useCartStore(s => s.addItem);

  const products = productIds
    .map(id => getProductById(id))
    .filter((p): p is Product => !!p);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={() => onProductPress(item)}
        onWishlistToggle={toggle}
      />
    ),
    [onProductPress, toggle],
  );

  function moveAllToCart() {
    if (!products.length) return;
    products.forEach(p => addItem(p.id, 1));
    toast.success(`${products.length} item${products.length > 1 ? 's' : ''} added to cart`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar
        title="Wishlist"
        subtitle={`${products.length} saved item${products.length === 1 ? '' : 's'}`}
        onBack={onBack}
        right={
          products.length > 0 ? (
            <Button label="Add all to cart" onPress={moveAllToCart} style={styles.smallBtn} />
          ) : undefined
        }
      />
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            icon="♥"
            title="Your wishlist is empty"
            message="Tap the heart on any product to save it here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 32 },
  columns: { gap: 0 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 36 },
});

export default WishlistScreen;
