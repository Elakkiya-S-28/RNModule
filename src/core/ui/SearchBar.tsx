import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import { type as fontType } from '../theme/fonts';

interface Props extends TextInputProps {
  onClear?: () => void;
  clearLabel?: string;
  testID?: string;
}

export function SearchBar({ onClear, clearLabel = 'Clear', testID, style, ...rest }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const value = rest.value ?? '';
  const showClear = onClear && value.length > 0;
  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }, style]}>
      <Text style={[styles.icon, { color: c.textMuted }]}>⌕</Text>
      <TextInput
        testID={testID}
        placeholderTextColor={c.textMuted}
        style={[styles.input, { color: c.text }]}
        {...rest}
      />
      {showClear ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          style={({ pressed }) => [styles.clearBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.clearText, { color: c.primary }]}>{clearLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  icon: { fontSize: 18, marginRight: 8 },
  input: { ...fontType.body, flex: 1, paddingVertical: 12, fontSize: 15 },
  clearBtn: { marginLeft: 8, paddingVertical: 6 },
  clearText: { ...fontType.label },
});

export default SearchBar;
