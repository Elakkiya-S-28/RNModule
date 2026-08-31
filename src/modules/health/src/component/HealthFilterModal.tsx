import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { useHealthStore } from '../store/healthStore';

const TAG_OPTIONS = [
  'routine',
  'preventive',
  'chronic',
  'urgent',
  'follow-up',
  'critical',
  'herbal',
  'allergy',
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function HealthFilterModal({ visible, onClose }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const { filters, toggleTag, clearFilters } = useHealthStore();
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.title, { color: c.text }]}>Filter by tag</Text>
        <View style={styles.tagWrap}>
          {TAG_OPTIONS.map(t => {
            const active = (filters.tags ?? []).includes(t);
            return (
              <Pressable
                key={t}
                onPress={() => toggleTag(t)}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: active ? c.primary : c.surfaceAlt,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? c.textInverse : c.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  #{t}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={clearFilters} style={styles.clearBtn}>
          <Text style={{ color: c.danger, fontSize: 14, fontWeight: '600' }}>
            Clear all filters
          </Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.doneBtn}>
          <Text style={{ color: c.primary, fontSize: 15, fontWeight: '700' }}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  clearBtn: { marginTop: 20 },
  doneBtn: { marginTop: 14, alignItems: 'center' },
});

export default HealthFilterModal;