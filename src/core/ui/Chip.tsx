import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress?: () => void;
}

/** Single selectable chip. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.primary : c.surface,
          borderColor: selected ? c.primary : c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? c.textInverse : c.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface ChipRowProps {
  options: { label: string; value: string }[];
  value?: string | string[] | null;
  onSelect: (value: string) => void;
  multi?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Horizontal scrollable row of filter chips (single or multi select). */
export function ChipRow({ options, value, onSelect, multi = false, style }: ChipRowProps) {
  const isSelected = (v: string) =>
    multi ? Array.isArray(value) && value.includes(v) : value === v;
  return (
    <View style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        {options.map(o => (
          <Chip
            key={o.value}
            label={o.label}
            selected={isSelected(o.value)}
            onPress={() => onSelect(o.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipRow: { paddingVertical: 4 },
  label: { fontSize: 13, fontWeight: '600' },
});

export default ChipRow;