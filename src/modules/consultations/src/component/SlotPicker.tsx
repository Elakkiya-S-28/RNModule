import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { formatTime12h, toISODate } from '../../../../core/util/format';
import { Slot } from '../types/ct';

export function buildDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push(toISODate(d.getTime()));
  }
  return out;
}

interface DateStripProps {
  dates: string[];
  selected: string;
  onSelect: (iso: string) => void;
}

export function DateStrip({ dates, selected, onSelect }: DateStripProps) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip}>
      {dates.map(iso => {
        const d = new Date(`${iso}T00:00:00`);
        const active = iso === selected;
        return (
          <Pressable
            key={iso}
            onPress={() => onSelect(iso)}
            style={[
              styles.datePill,
              {
                backgroundColor: active ? c.primary : c.surface,
                borderColor: active ? c.primary : c.border,
              },
            ]}
          >
            <Text style={{ color: active ? c.textInverse : c.textMuted, fontSize: 11 }}>
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <Text
              style={{
                color: active ? c.textInverse : c.text,
                fontSize: 15,
                fontWeight: '700',
              }}
            >
              {d.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface SlotGridProps {
  slots: Slot[];
  selectedId: string | null;
  unavailable: (slot: Slot) => boolean;
  onSelect: (slot: Slot) => void;
}

export function SlotGrid({ slots, selectedId, unavailable, onSelect }: SlotGridProps) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  if (slots.length === 0) {
    return <Text style={{ color: c.textMuted, paddingVertical: 12 }}>No free slots this day.</Text>;
  }
  return (
    <View style={styles.grid}>
      {slots.map(slot => {
        const booked = unavailable(slot);
        const selected = selectedId === slot.id;
        return (
          <Pressable
            key={slot.id}
            disabled={booked}
            onPress={() => onSelect(slot)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? c.primary : booked ? c.surfaceAlt : c.surface,
                borderColor: selected ? c.primary : booked ? c.border : c.primary,
                opacity: pressed && !booked ? 0.9 : 1,
              },
            ]}
            accessibilityLabel={`Slot ${formatTime12h(
              Math.floor(slot.startMinutes / 60),
              slot.startMinutes % 60,
            )}`}
          >
            <Text
              style={{
                color: selected ? c.textInverse : booked ? c.textMuted : c.primary,
                fontWeight: '700',
                fontSize: 13,
              }}
            >
              {formatTime12h(Math.floor(slot.startMinutes / 60), slot.startMinutes % 60)}
            </Text>
            <Text style={{ color: selected ? c.textInverse : c.textMuted, fontSize: 10 }}>
              {slot.mode}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dateStrip: { marginBottom: 12 },
  datePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 58,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 78,
    alignItems: 'center',
  },
});

export default SlotGrid;