import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import { type as fontType } from '../theme/fonts';
import { usePop } from '../util/motion';
import { AppIcon } from './AppIcon';

interface Props {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}

export function QtyStepper({ quantity, min = 1, max = 99, onChange }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const [bumped, setBumped] = useState(false);
  const pop = usePop(bumped);
  const atMin = quantity <= min;
  const atMax = quantity >= max;
  function change(next: number) {
    setBumped(true);
    onChange(next);
  }
  return (
    <View style={[styles.row, { borderColor: c.border }]}>
      <Pressable
        onPress={() => !atMin && change(quantity - 1)}
        disabled={atMin}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={6}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: c.surfaceAlt, opacity: atMin ? 0.4 : pressed ? 0.7 : 1 },
        ]}
      >
        <AppIcon name="remove" size={16} color="text" />
      </Pressable>
      <AnimatedQty pop={pop} quantity={quantity} />
      <Pressable
        onPress={() => !atMax && change(quantity + 1)}
        disabled={atMax}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={6}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: c.primary, opacity: atMax ? 0.4 : pressed ? 0.85 : 1 },
        ]}
      >
        <AppIcon name="add" size={16} color="textInverse" />
      </Pressable>
    </View>
  );
}

function AnimatedQty({ pop, quantity }: { pop: ReturnType<typeof usePop>; quantity: number }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
    return (
    <Animated.Text
      accessibilityLiveRegion="polite"
      style={[
        styles.qty,
        { color: c.text, minWidth: 34, textAlign: 'center', transform: [{ scale: pop }] },
      ]}
    >
      {quantity}
    </Animated.Text>
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
