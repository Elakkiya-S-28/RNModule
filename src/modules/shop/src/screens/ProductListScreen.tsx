import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useProducts, useProductListStore } from '../store/productListStore';
import { useCartStore, selectCartCount } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Product } from '../types/shop';
import { ProductCard } from '../components/ProductCard';
import { ShopFilterModal } from '../components/ShopFilterModal';
import { Spinner } from '../../../../core/ui/Spinner';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { formatCompact } from '../../../../core/util/format';

interface Props {
  onProductPress: (product: Product) => void;
  onCartPress: () => void;
}

export function ProductListScreen({ onProductPress, onCartPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;

  const { search, setSearch, load, loading, error, hasMore } = useProductListStore();
  const products = useProducts();
  const cartCount = useCartStore(s => selectCartCount(s.items));
  const wishlistToggle = useWishlistStore(s => s.toggle);
  const [searchText, setSearchText] = useState('');
  const debounced = useDebounce(searchText, 300);
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    if (debounced !== search) setSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) load(false);
  }, [hasMore, loading, load]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={() => onProductPress(item)}
        onWishlistToggle={wishlistToggle}
      />
    ),
    [onProductPress, wishlistToggle],
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <Text style={[styles.title, { color: c.text }]}>Ayurveda Shop</Text>
              <Pressable
                onPress={onCartPress}
                style={[styles.cartBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                accessibilityRole="button"
                accessibilityLabel={`Cart with ${cartCount} items`}
              >
                <Text style={{ fontSize: 17 }}>🛒</Text>
                {cartCount > 0 ? (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
            <View style={[styles.searchWrap, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={{ color: c.textMuted }}>🔍</Text>
              <RNTextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search products..."
                placeholderTextColor={c.textMuted}
                style={[styles.searchInput, { color: c.text }]}
                accessibilityLabel="Search products"
              />
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: c.textSecondary, fontSize: 13 }}>
                {loading ? 'Loading...' : `${formatCompact(useProductListStore.getState().total)} products`}
              </Text>
              <Pressable
                onPress={() => setFilterVisible(true)}
                style={[styles.filterBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                accessibilityRole="button"
                accessibilityLabel="Open filters and sorting"
              >
                <Text style={{ color: c.textSecondary }}>⚙ Filters & Sort</Text>
              </Pressable>
            </View>
            {error ? (
              <View style={[styles.banner, { backgroundColor: `${c.danger}22` }]}>
                <Text style={{ color: c.danger }}>{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ paddingVertical: 20 }} color={c.primary} />
          ) : undefined
        }
        ListEmptyComponent={
          loading ? (
            <Spinner label="Loading products..." />
          ) : (
            <EmptyState title="No products found" message="Try different search or filters." />
          )
        }
        contentContainerStyle={styles.content}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
      <ShopFilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 24 },
  columns: { gap: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  cartBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#D64545', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  filterBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  banner: { borderRadius: 10, padding: 10, marginBottom: 8 },
});

export default ProductListScreen;
