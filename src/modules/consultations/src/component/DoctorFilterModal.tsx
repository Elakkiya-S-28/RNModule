import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Button } from '../../../../core/ui/Button';
import { ChipRow } from '../../../../core/ui/Chip';
import { useDoctorListStore } from '../store/doctorListStore';
import { Specialization, ConsultationMode } from '../types/ct';
const SPECIALIZATIONS: Specialization[] = [
  'General Physician', 'Cardiology', 'Pulmonology', 'Neurology', 'Dermatology',
  'Pediatrics', 'Orthopedics', 'Gastroenterology', 'Gynecology', 'ENT',
  'Ayurveda', 'Psychiatry',
];
const MODES: ConsultationMode[] = ['video', 'audio', 'chat', 'in-person'];
const FEES = [
  { label: 'Under ₹1000', value: 1000 },
  { label: 'Under ₹2000', value: 2000 },
  { label: 'Any', value: 0 },
];
const RATINGS = [
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4.0 },
  { label: '3.5+', value: 3.5 },
  { label: 'Any', value: 0 },
];
interface Props {
  visible: boolean;
  onClose: () => void;
}
export function DoctorFilterModal({ visible, onClose }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const { filters, applyFilters, clearFilters } = useDoctorListStore();

  const [specs, setSpecs] = useState<Specialization[]>(filters.specializations ?? []);
  const [mode, setMode] = useState<ConsultationMode | null>(filters.mode ?? null);
  const [maxFee, setMaxFee] = useState<number | null>(filters.maxFee ?? null);
  const [minRating, setMinRating] = useState<number | null>(filters.minRating ?? null);

  function apply() {
    applyFilters({
      specializations: specs.length ? specs : undefined,
      mode: mode ?? null,
      maxFee,
      minRating,
    });
    onClose();
  }

  function reset() {
    clearFilters();
    setSpecs([]);
    setMode(null);
    setMaxFee(null);
    setMinRating(null);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text style={[styles.title, { color: c.text }]}>Filters</Text>

        <ScrollView>
          <Text style={[styles.label, { color: c.textSecondary }]}>Specialisation</Text>
          <ChipRow
            multi
            options={SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
            value={specs}
            onSelect={s => {
              setSpecs(cur => (cur.includes(s as Specialization) ? cur.filter(x => x !== s) : [...cur, s as Specialization]));
            }}
          />

          <Text style={[styles.label, { color: c.textSecondary }]}>Consultation mode</Text>
          <ChipRow
            options={MODES.map(m => ({ label: m, value: m }))}
            value={mode}
            onSelect={m => setMode(m === mode ? null : (m as ConsultationMode))}
          />

          <Text style={[styles.label, { color: c.textSecondary }]}>Max fee</Text>
          <ChipRow
            options={FEES.map(f => ({ label: f.label, value: String(f.value) }))}
            value={maxFee ? String(maxFee) : '0'}
            onSelect={m => setMaxFee(Number(m) || null)}
          />

          <Text style={[styles.label, { color: c.textSecondary }]}>Min rating</Text>
          <ChipRow
            options={RATINGS.map(r => ({ label: r.label, value: String(r.value) }))}
            value={minRating ? String(minRating) : '0'}
            onSelect={m => setMinRating(Number(m) || null)}
          />
        </ScrollView>

        <View style={styles.actions}>
          <Button label="Clear" variant="ghost" onPress={reset} />
          <Button label="Apply filters" onPress={apply} />
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
export default DoctorFilterModal;