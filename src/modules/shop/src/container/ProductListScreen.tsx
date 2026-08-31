import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useProductListStore } from '../store/productListStore';
import { useCartStore, selectCartCount } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Product } from '../types/shop';
import { ProductCard } from '../component/ProductCard';
import { ShopFilterModal } from '../component/ShopFilterModal';
import { AppHeader } from '../../../../core/ui/AppHeader';
import { SearchBar } from '../../../../core/ui/SearchBar';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { SkeletonLoader, productCardSkeleton } from '../../../../core/ui/SkeletonLoader';
import { type as fontType } from '../../../../core/theme/fonts';

interface Props {
  onProductPress: (product: Product) => void;
  onCartPress: () => void;
  onWishlistPress: () => void;
}

export function ProductListScreen({ onProductPress, onCartPress, onWishlistPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const search = useProductListStore(s => s.search);
  const setSearch = useProductListStore(s => s.setSearch);
  const clearSearch = useProductListStore(s => s.clearSearch);
  const load = useProductListStore(s => s.load);
  const total = useProductListStore(s => s.total);
  const loading = useProductListStore(s => s.loading);
  const initialLoading = useProductListStore(s => s.initialLoading);
  const error = useProductListStore(s => s.error);
  const hasMore = useProductListStore(s => s.hasMore);
  const products = useProductListStore(s => s.products);
  const filters = useProductListStore(s => s.filters);
  const cartCount = useCartStore(s => selectCartCount(s.items));
  const wishlistToggle = useWishlistStore(s => s.toggle);

  const [searchText, setSearchText] = useState(search);
  const [filterVisible, setFilterVisible] = useState(false);
  const debounced = useDebounce(searchText, 300);

  useEffect(() => {
    if (debounced !== search) setSearch(debounced);
  }, [debounced, search, setSearch]);

  useEffect(() => {
    if (search === '' && searchText !== '' && !debounced) {
      setSearchText('');
    }
  }, [search, searchText, debounced]);

  useEffect(() => {
    load(true);
  }, [search, filters, load]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading && !initialLoading) load(false);
  }, [hasMore, loading, initialLoading, load]);

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

  const activeFilterCount = useMemo(
    () =>
      (filters.categories?.length ?? 0) +
      (filters.maxPrice != null ? 1 : 0) +
      (filters.minRating != null ? 1 : 0),
    [filters],
  );

  const header = (
    <View>
      <View style={styles.searchRow}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search herbs, oils, brands…"
          accessibilityLabel="Search products"
          onClear={() => {
            setSearchText('');
            clearSearch();
          }}
          style={styles.searchFlex}
        />
        <Pressable
          onPress={() => setFilterVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters and sorting"
          style={({ pressed }) => [
            styles.filterBtn,
            {
              backgroundColor: activeFilterCount > 0 ? c.primary : c.surface,
              borderColor: activeFilterCount > 0 ? c.primary : c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilterCount > 0 ? c.textInverse : c.textSecondary },
            ]}
          >
            ⚙{activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
          </Text>
        </Pressable>
      </View>
      <View style={styles.summaryRow}>
        <Text style={[styles.summary, { color: c.textSecondary }]}>
          {initialLoading
            ? 'Loading…'
            : `${total} product${total === 1 ? '' : 's'}${
                searchText || activeFilterCount > 0 ? ' found' : ''
              }`}
        </Text>
        {searchText || activeFilterCount > 0 ? (
          <Pressable
            onPress={() => {
              setSearchText('');
              clearSearch();
              useProductListStore.getState().clearFilters();
            }}
            accessibilityRole="button"
            accessibilityLabel="Clear search and filters"
          >
            <Text style={[styles.clearAll, { color: c.accent }]}>Clear all</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={[styles.banner, { backgroundColor: `${c.danger}22` }]}>
          <Text style={{ color: c.danger, ...fontType.caption }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <AppHeader
        right={
          <>
            <Pressable
              onPress={onWishlistPress}
              accessibilityRole="button"
              accessibilityLabel="Open wishlist"
              style={[styles.iconBtn, { borderColor: c.border }]}
            >
              <Text style={{ fontSize: 16, color: c.terracotta }}>♥</Text>
            </Pressable>
            <Pressable
              onPress={onCartPress}
              accessibilityRole="button"
              accessibilityLabel={`Cart with ${cartCount} items`}
              style={[styles.iconBtn, { borderColor: c.border }]}
            >
              <Text style={{ fontSize: 16 }}>🛒</Text>
              {cartCount > 0 ? (
                <View style={[styles.cartBadge, { backgroundColor: c.accent }]}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </>
        }
      />
      {header}
      {initialLoading ? (
        <SkeletonLoader isLoading layout={productCardSkeleton(3)} style={styles.skeleton} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && !initialLoading ? (
              <Text style={[styles.footer, { color: c.textMuted }]}>Loading more…</Text>
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              title="No products found"
              message="Try a different search or clear the filters."
            />
          }
          contentContainerStyle={styles.content}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
        />
      )}
      <ShopFilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchFlex: { flex: 1 },
  filterBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginLeft: 8,
  },
  filterText: { ...fontType.label, fontSize: 14 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summary: { ...fontType.caption },
  clearAll: { ...fontType.label },
  banner: { borderRadius: 10, padding: 10, marginHorizontal: 16, marginBottom: 8 },
  iconBtn: {
    borderWidth: 1,
    borderRadius: 999,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { ...fontType.label, color: '#FFFFFF', fontSize: 10 },
  content: { padding: 12, paddingBottom: 24 },
  columns: { gap: 0 },
  footer: { textAlign: 'center', paddingVertical: 16, ...fontType.caption },
  skeleton: { paddingHorizontal: 12, paddingTop: 4 },
});

export default ProductListScreen;
