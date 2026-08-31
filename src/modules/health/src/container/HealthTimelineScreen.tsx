import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useIsOnline } from '../../../../core/api/connectivity';
import { AppHeader } from '../../../../core/ui/AppHeader';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Screen } from '../../../../core/ui/Screen';
import { SkeletonLoader, healthCardSkeleton } from '../../../../core/ui/SkeletonLoader';
import { FadeInView, staggerDelay } from '../../../../core/util/motion';
import { useHealthStore } from '../store/healthStore';
import { healthService } from '../services/healthApi';
import { HealthRecord } from '../types/health';
import { HealthRecordRow } from '../component/HealthRecordRow';
import { HealthFilterModal } from '../component/HealthFilterModal';
const KIND_FILTERS = [
  'lab-report',
  'prescription',
  'consultation',
  'vaccination',
  'allergy',
] as const;
interface Props {
  onRecordPress: (record: HealthRecord) => void;
}
export function HealthTimelineScreen({ onRecordPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const online = useIsOnline();
  const {
    groups,
    error,
    search,
    setSearch,
    load,
    filters,
    toggleKind,
    initialLoading,
  } = useHealthStore();
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const debounced = useDebounce(searchText, 300);

  useEffect(() => {
    if (debounced !== search) setSearch(debounced);
  }, [debounced]);

  useEffect(() => {
    load(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: HealthRecord; index: number }) => (
      <HealthRecordRow
        record={item}
        entranceDelay={staggerDelay(index % 8)}
        onPress={() => onRecordPress(item)}
      />
    ),
    [onRecordPress],
  );

  const sections = groups.map(g => ({ title: g.label, data: g.records }));
  const recordCount = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <Screen padded={false}>
      <AppHeader
        insetTop={false}
        right={
          <Pressable
            onPress={() => setFilterVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
            style={({ pressed }) => [
              styles.filterBtn,
              { borderColor: c.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.filterText, { color: c.textSecondary }]}>⚙ Filter</Text>
          </Pressable>
        }
      />
      <View style={styles.searchWrap}>
        <Text style={{ color: c.textMuted }}>🔍</Text>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search records, provider..."
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.text, borderColor: c.border }]}
          accessibilityLabel="Search health records"
        />
      </View>
      <View style={styles.filterRow}>
        {KIND_FILTERS.map(k => {
          const active = (filters.kinds ?? []).includes(k);
          return (
            <Pressable
              key={k}
              onPress={() => toggleKind(k)}
              style={[
                styles.kindChip,
                {
                  backgroundColor: active ? c.primary : c.surface,
                  borderColor: active ? c.primary : c.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.kindChipText,
                  { color: active ? c.textInverse : c.textSecondary },
                ]}
              >
                {healthService.KIND_LABELS[k]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <View style={[styles.banner, { backgroundColor: `${c.danger}22` }]}>
          <Text style={[styles.bannerText, { color: c.danger }]}>{error}</Text>
        </View>
      ) : null}
      {initialLoading ? (
        <FadeInView>
          <SkeletonLoader style={styles.skeleton}>{healthCardSkeleton(6)}</SkeletonLoader>
        </FadeInView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={r => r.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.groupLabel, { color: c.primary }]}>{section.title}</Text>
          )}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            recordCount === 0 ? (
              <EmptyState
                icon="🩺"
                title="No records found"
                message="Adjust search or filters to see your health timeline."
              />
            ) : undefined
          }
          ListFooterComponent={
            <Text style={[styles.footer, { color: c.textMuted }]}>
              {online ? `${recordCount} records` : 'Offline - showing cached records'}
            </Text>
          }
          initialNumToRender={12}
          maxToRenderPerBatch={14}
          windowSize={8}
          showsVerticalScrollIndicator={false}
        />
      )}
      <HealthFilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </Screen>
  );
}
const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15, fontFamily: 'Inter' },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  kindChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  kindChipText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter SemiBold' },
  groupLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter SemiBold',
  },
  banner: { borderRadius: 10, padding: 10, marginHorizontal: 16, marginBottom: 8 },
  bannerText: { fontFamily: 'Inter Medium' },
  filterBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: { fontSize: 13, fontFamily: 'Inter Medium' },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  footer: { textAlign: 'center', marginTop: 8, fontSize: 11, fontFamily: 'Inter' },
  skeleton: { paddingHorizontal: 16, paddingTop: 8 },
});
export default HealthTimelineScreen;