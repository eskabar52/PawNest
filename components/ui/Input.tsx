// components/ui/Input.tsx — Text Input Bileşeni
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { theme, shared } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.surfaceAlt,
            color: theme.textPrimary,
            borderColor: error ? shared.secondary : theme.border,
            fontFamily: 'Nunito_400Regular',
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  input: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
