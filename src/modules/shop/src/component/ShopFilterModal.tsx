import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Button } from '../../../../core/ui/Button';
import { ChipRow } from '../../../../core/ui/Chip';
import { useProductListStore } from '../store/productListStore';
import { PRODUCT_CATEGORIES } from '../services/productRepo';
import { ProductCategory, SortOption } from '../types/shop';
const CATEGORY_OPTIONS: { label: string; value: string }[] = PRODUCT_CATEGORIES.map(
  cat => ({ label: cat, value: cat }),
);
const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price low to high', value: 'price-asc' },
  { label: 'Price high to low', value: 'price-desc' },
  { label: 'Top rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
];
const PRICE_BANDS = [
  { label: 'Under ₹500', value: '500' },
  { label: 'Under ₹1000', value: '1000' },
  { label: 'Any', value: '0' },
];
interface Props {
  visible: boolean;
  onClose: () => void;
}
export function ShopFilterModal({ visible, onClose }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const { filters, sort, applyFilters, setSort, clearFilters } = useProductListStore();

  const [cats, setCats] = useState<ProductCategory[]>(filters.categories ?? []);
  const [maxPrice, setMaxPrice] = useState<number | null>(filters.maxPrice ?? null);
  const [minRating, setMinRating] = useState<number | null>(filters.minRating ?? null);
  const [localSort, setLocalSort] = useState<SortOption>(sort);

  function apply() {
    applyFilters({ categories: cats.length ? cats : undefined, maxPrice, minRating });
    setSort(localSort);
    onClose();
  }

  function reset() {
    clearFilters();
    setCats([]);
    setMaxPrice(null);
    setMinRating(null);
    setLocalSort('relevance');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text style={[styles.title, { color: c.text }]}>Filter & Sort</Text>
        <ScrollView>
          <Text style={[styles.label, { color: c.textSecondary }]}>Categories</Text>
          <ChipRow multi options={CATEGORY_OPTIONS} value={cats} onSelect={v => {
              setCats(cur => (cur.includes(v as ProductCategory) ? cur.filter(x => x !== v) : [...cur, v as ProductCategory]));
            }} />

          <Text style={[styles.label, { color: c.textSecondary }]}>Sort by</Text>
          <ChipRow options={SORT_OPTIONS} value={localSort} onSelect={v => setLocalSort(v as SortOption)} />

          <Text style={[styles.label, { color: c.textSecondary }]}>Max price</Text>
          <ChipRow options={PRICE_BANDS} value={maxPrice ? String(maxPrice) : '0'} onSelect={m => setMaxPrice(Number(m) || null)} />

          <Text style={[styles.label, { color: c.textSecondary }]}>Min rating</Text>
          <ChipRow
            options={[
              { label: '4.5+', value: '4.5' },
              { label: '4.0+', value: '4.0' },
              { label: '3.5+', value: '3.5' },
              { label: 'Any', value: '0' },
            ]}
            value={minRating ? String(minRating) : '0'}
            onSelect={m => setMinRating(Number(m) || null)}
          />
        </ScrollView>
        <View style={styles.actions}>
          <Button label="Clear" variant="ghost" onPress={reset} />
          <Button label="Apply" onPress={apply} />
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, maxHeight: '78%' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
export default ShopFilterModal;