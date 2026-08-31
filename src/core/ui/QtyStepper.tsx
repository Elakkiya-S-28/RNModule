import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import { type as fontType } from '../theme/fonts';

interface Props {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}

export function QtyStepper({ quantity, min = 1, max = 99, onChange }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const atMin = quantity <= min;
  const atMax = quantity >= max;
  return (
    <View style={[styles.row, { borderColor: c.border }]}>
      <Pressable
        onPress={() => !atMin && onChange(quantity - 1)}
        disabled={atMin}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={6}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: c.surfaceAlt, opacity: atMin ? 0.4 : pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.btnText, { color: c.text }]}>−</Text>
      </Pressable>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.qty, { color: c.text, minWidth: 34, textAlign: 'center' }]}
      >
        {quantity}
      </Text>
      <Pressable
        onPress={() => !atMax && onChange(quantity + 1)}
        disabled={atMax}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={6}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: c.primary, opacity: atMax ? 0.4 : pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.btnText, { color: c.textInverse }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    alignSelf: 'flex-start',
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { ...fontType.label, fontSize: 20, lineHeight: 24 },
  qty: { ...fontType.cardTitle, fontSize: 16 },
});

export default QtyStepper;
