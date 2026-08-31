import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useDoctorListStore } from '../store/doctorListStore';
import { Doctor } from '../types/ct';
import { DoctorCard } from '../component/DoctorCard';
import { DoctorFilterModal } from '../component/DoctorFilterModal';
import { AppHeader } from '../../../../core/ui/AppHeader';
import { SearchBar } from '../../../../core/ui/SearchBar';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { SkeletonLoader, listRowSkeleton } from '../../../../core/ui/SkeletonLoader';
import { formatCompact } from '../../../../core/util/format';
import { useIsOnline } from '../../../../core/api/connectivity';
import { type as fontType } from '../../../../core/theme/fonts';

interface Props {
  onDoctorPress: (doctor: Doctor) => void;
  onUpcomingPress: () => void;
}

export function DoctorListScreen({ onDoctorPress, onUpcomingPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const online = useIsOnline();

  const search = useDoctorListStore(s => s.search);
  const setSearch = useDoctorListStore(s => s.setSearch);
  const clearSearch = useDoctorListStore(s => s.clearSearch);
  const listDoctors = useDoctorListStore(s => s.listDoctors);
  const total = useDoctorListStore(s => s.total);
  const loading = useDoctorListStore(s => s.loading);
  const initialLoading = useDoctorListStore(s => s.initialLoading);
  const error = useDoctorListStore(s => s.error);
  const hasMore = useDoctorListStore(s => s.hasMore);
  const doctors = useDoctorListStore(s => s.doctors);
  const filters = useDoctorListStore(s => s.filters);

  const [searchText, setSearchText] = useState(search);
  const [filterVisible, setFilterVisible] = useState(false);
  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    if (search === '' && searchText !== '' && !debouncedSearch) {
      setSearchText('');
    }
  }, [search]);

  useEffect(() => {
    listDoctors(true);
  }, [search, filters, listDoctors]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading && !initialLoading) listDoctors(false);
  }, [hasMore, loading, initialLoading, listDoctors]);

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => (
      <DoctorCard doctor={item} onPress={() => onDoctorPress(item)} />
    ),
    [onDoctorPress],
  );

  const activeFilterCount = useMemo(
    () =>
      (filters.specializations?.length ?? 0) +
      (filters.maxFee != null ? 1 : 0) +
      (filters.minRating != null ? 1 : 0) +
      (filters.mode ? 1 : 0),
    [filters],
  );

  const header = (
    <View>
      <View style={styles.searchRow}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search doctors, speciality, city…"
          accessibilityLabel="Search doctors"
          onClear={() => {
            setSearchText('');
            clearSearch();
          }}
          style={styles.searchFlex}
        />
        <Pressable
          onPress={() => setFilterVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
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
            : `${formatCompact(total)} doctor${total === 1 ? '' : 's'}${online ? '' : ' · offline (cached)'}`}
        </Text>
        {searchText || activeFilterCount > 0 ? (
          <Pressable
            onPress={() => {
              setSearchText('');
              clearSearch();
              useDoctorListStore.getState().clearFilters();
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
          <Text style={[styles.bannerText, { color: c.danger }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <AppHeader
        right={
          <Pressable
            onPress={onUpcomingPress}
            accessibilityRole="button"
            accessibilityLabel="View upcoming consultations"
            style={[styles.upcomingBtn, { borderColor: c.border }]}
          >
            <Text style={[styles.upcomingText, { color: c.primary }]}>Upcoming</Text>
          </Pressable>
        }
      />
      {header}
      {initialLoading ? (
        <SkeletonLoader isLoading layout={listRowSkeleton(6)} style={styles.skeleton} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={d => d.id}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && !initialLoading ? (
              <Text style={[styles.footer, { color: c.textMuted }]}>Loading more…</Text>
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              title="No doctors found"
              message="Try adjusting your search or clearing filters."
            />
          }
          contentContainerStyle={styles.content}
          initialNumToRender={10}
          maxToRenderPerBatch={12}
          windowSize={7}
        />
      )}
      <DoctorFilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
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
  bannerText: { ...fontType.caption },
  upcomingBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  upcomingText: { ...fontType.label, fontSize: 13 },
  content: { padding: 16, paddingBottom: 24 },
  footer: { textAlign: 'center', paddingVertical: 16, ...fontType.caption },
  skeleton: { paddingHorizontal: 16, paddingTop: 4 },
});

export default DoctorListScreen;
