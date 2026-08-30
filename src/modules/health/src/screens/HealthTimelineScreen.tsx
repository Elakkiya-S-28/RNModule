import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useHealthStore } from '../store/healthStore';
import { useIsOnline } from '../../../../core/api/connectivity';
import { Spinner } from '../../../../core/ui/Spinner';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { Badge } from '../../../../core/ui/Badge';
import { Avatar } from '../../../../core/ui/Avatar';
import { healthService } from '../services/healthApi';
import { HealthRecord } from '../types/health';

interface Props {
  onRecordPress: (record: HealthRecord) => void;
}

export function HealthTimelineScreen({ onRecordPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;

  const { groups, loading, error, search, setSearch, load, filters, toggleKind } = useHealthStore();
  const online = useIsOnline();
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

  const renderItem = useCallback(
    ({ item }: { item: HealthRecord }) => (
      <RecordRow record={item} onPress={() => onRecordPress(item)} />
    ),
    [onRecordPress],
  );

  const sections = groups.map(g => ({ title: g.label, data: g.records }));

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={[styles.searchWrap, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={{ color: c.textMuted }}>🔍</Text>
        <RNTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search records, provider..."
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.text }]}
          accessibilityLabel="Search health records"
        />
      </View>

      <View style={styles.filterRow}>
        {(['lab-report', 'prescription', 'consultation', 'vaccination', 'allergy'] as const).map(k => {
          const active = (filters.kinds ?? []).includes(k);
          return (
            <Pressable
              key={k}
              onPress={() => toggleKind(k)}
              style={[
                styles.kindChip,
                { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={{ color: active ? c.textInverse : c.textSecondary, fontSize: 12, fontWeight: '600' }}>
                {healthService.KIND_LABELS[k]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={r => r.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.groupLabel, { color: c.primary }]}>{section.title}</Text>
        )}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          loading ? (
            <Spinner label="Loading records..." />
          ) : (
            <EmptyState
              icon="🩺"
              title="No records found"
              message="Adjust search or filters to see your health timeline."
            />
          )
        }
        ListHeaderComponent={
          error ? (
            <View style={[styles.banner, { backgroundColor: `${c.danger}22` }]}>
              <Text style={{ color: c.danger }}>{error}</Text>
            </View>
          ) : undefined
        }
        ListFooterComponent={
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 8, fontSize: 11 }}>
            {online ? `${groups.reduce((n, g) => n + g.records.length, 0)} records` : 'Offline - showing cached records'}
          </Text>
        }
        stickySectionHeadersEnabled
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={14}
        windowSize={8}
      />
      {filterVisible ? <HealthFilterModal visible onClose={() => setFilterVisible(false)} /> : null}
    </View>
  );
}
function RecordRow({ record, onPress }: { record: HealthRecord; onPress: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const d = new Date(record.dateTs);
  const tone = record.status === 'critical' ? 'danger' : record.status === 'attention' ? 'warning' : 'success';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={record.title}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <Avatar name={record.title} size={40} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: c.text }]}>
          {record.title}
        </Text>
        <Text numberOfLines={1} style={{ color: c.textSecondary, fontSize: 12 }}>
          {healthService.KIND_LABELS[record.kind]} - {record.provider}
        </Text>
        <View style={styles.rowBottom}>
          <Text style={{ color: c.textMuted, fontSize: 11 }}>
            {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} -{' '}
            {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
          <Badge label={record.status} tone={tone} small />
        </View>
        {record.attachments.length > 0 ? (
          <Text style={{ color: c.primary, fontSize: 11, marginTop: 4 }}>
            📎 {record.attachments.length} attachment{record.attachments.length > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
function HealthFilterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const { filters, toggleTag, clearFilters } = useHealthStore();
  if (!visible) return null;
  const tags = ['routine', 'preventive', 'chronic', 'urgent', 'follow-up', 'critical', 'herbal', 'allergy'];
  return (
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <View style={[styles.modalCard, { backgroundColor: c.surface }]} onStartShouldSetResponder={() => true}>
        <Text style={[styles.modalTitle, { color: c.text }]}>Filter by tag</Text>
        <View style={styles.tagWrap}>
          {tags.map(t => {
            const active = (filters.tags ?? []).includes(t);
            return (
              <Pressable
                key={t}
                onPress={() => toggleTag(t)}
                style={[styles.tagChip, { backgroundColor: active ? c.primary : c.surfaceAlt, borderColor: active ? c.primary : c.border }]}
              >
                <Text style={{ color: active ? c.textInverse : c.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  #{t}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={clearFilters} style={styles.clearBtn}>
          <Text style={{ color: c.danger, fontSize: 14, fontWeight: '600' }}>Clear all filters</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.doneBtn}>
          <Text style={{ color: c.primary, fontSize: 15, fontWeight: '700' }}>Done</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 0, paddingBottom: 32 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  kindChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  groupLabel: { fontSize: 14, fontWeight: '800', marginTop: 8, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  banner: { borderRadius: 10, padding: 10, marginBottom: 8 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  clearBtn: { marginTop: 20 },
  doneBtn: { marginTop: 14, alignItems: 'center' },
});

export default HealthTimelineScreen;
