import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useDoctorListStore } from '../store/doctorListStore';
import { Doctor } from '../types/ct';
import { DoctorCard } from '../components/DoctorCard';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Spinner } from '../../../../core/ui/Spinner';
import { formatCompact } from '../../../../core/util/format';
import { useIsOnline } from '../../../../core/api/connectivity';

interface Props {
  onDoctorPress: (doctor: Doctor) => void;
}

/**
 * Module 1 (Consultations) — Doctor listing with search, filters, virtualised
 * infinite scroll. Uses FlatList virtualisation + memoised rows for the
 * "5,000 doctors without UI lag" requirement.
 */
export function DoctorListScreen({ onDoctorPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const online = useIsOnline();

  const {
    doctors,
    total,
    loading,
    error,
    hasMore,
    search,
    listDoctors,
    setSearch,
  } = useDoctorListStore();

  const [searchText, setSearchText] = useState(search);
  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    listDoctors(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(() => listDoctors(true), [listDoctors]);
  const onEndReached = useCallback(() => {
    if (hasMore && !loading) listDoctors(false);
  }, [hasMore, loading, listDoctors]);

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => (
      <DoctorCard doctor={item} onPress={() => onDoctorPress(item)} />
    ),
    [onDoctorPress],
  );

  const footer = useMemo(() => {
    if (!loading) return undefined;
    return <ActivityIndicator style={styles.footerLoader} color={c.primary} />;
  }, [loading, c.primary]);

  const header = useMemo(
    () => (
      <View>
        <View style={[styles.searchWrap, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={{ color: c.textMuted }}>🔍</Text>
          <RNTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search doctors, speciality, city…"
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
            accessibilityLabel="Search doctors"
          />
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summary, { color: c.textSecondary }]}>
            {loading ? 'Loading…' : `${formatCompact(total)} doctors${online ? '' : ' · offline (cached)'}`}
          </Text>
          <FilterButton onPress={() => useDoctorListStore.getState().toggleSpecialization('Ayurveda')} />
        </View>
      </View>
    ),
    [searchText, c, total, loading, online],
  );

  const listHeader = (
    <>
      {header}
      {error ? (
        <View style={[styles.banner, { backgroundColor: `${c.danger}22` }]}>
          <Text style={{ color: c.danger }}>{error}</Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={doctors}
        keyExtractor={d => d.id}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshing={false}
        onRefresh={onRefresh}
        ListHeaderComponent={listHeader}
        ListFooterComponent={footer}
        ListEmptyComponent={
          loading ? (
            <Spinner label="Loading doctors…" />
          ) : (
            <EmptyState
              title="No doctors found"
              message="Try adjusting your search or clearing filters."
            />
          )
        }
        contentContainerStyle={styles.content}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={12}
        windowSize={7}
      />
    </View>
  );
}

function FilterButton({ onPress }: { onPress: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Filter"
      style={({ pressed }) => [styles.filterBtn, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={{ color: c.textSecondary }}>⚙ Filters</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summary: { fontSize: 13 },
  filterBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  banner: { borderRadius: 10, padding: 10, marginBottom: 8 },
  footerLoader: { paddingVertical: 16 },
});

export default DoctorListScreen;