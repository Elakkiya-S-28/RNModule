import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useIsOnline } from '../../../../core/api/connectivity';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Screen } from '../../../../core/ui/Screen';
import { SkeletonLoader, rowSkeletonLayout } from '../../../../core/ui/SkeletonLoader';
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
  const { groups, loading, error, search, setSearch, load, filters, toggleKind } =
    useHealthStore();
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
    ({ item }: { item: HealthRecord }) => (
      <HealthRecordRow record={item} onPress={() => onRecordPress(item)} />
    ),
    [onRecordPress],
  );

  const sections = groups.map(g => ({ title: g.label, data: g.records }));
  const recordCount = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <Screen padded={false}>
      <SkeletonLoader isLoading={loading} layout={rowSkeletonLayout(6)}>
        <View style={styles.searchWrap}>
          <Text style={{ color: c.textMuted }}>🔍</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search records, provider..."
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
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
                  style={{
                    color: active ? c.textInverse : c.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {healthService.KIND_LABELS[k]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {error ? (
          <View style={[styles.banner, { backgroundColor: `${c.danger}22` }]}>
            <Text style={{ color: c.danger }}>{error}</Text>
          </View>
        ) : null}
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
      </SkeletonLoader>
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
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  kindChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  groupLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  banner: { borderRadius: 10, padding: 10, marginHorizontal: 16, marginBottom: 8 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  footer: { textAlign: 'center', marginTop: 8, fontSize: 11 },
});
export default HealthTimelineScreen;