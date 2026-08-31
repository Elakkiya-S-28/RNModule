import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function TextInput({ label, error, style, ...rest }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      ) : null}
      <RNTextInput
        placeholderTextColor={c.textMuted}
        accessibilityLabel={label || rest.placeholder}
        style={[
          styles.input,
          {
            color: c.text,
            backgroundColor: c.surfaceAlt,
            borderColor: error ? c.danger : c.border,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: { fontSize: 12, marginTop: 4 },
});

export default TextInput;
