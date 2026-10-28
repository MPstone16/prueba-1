import { Pressable, StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      selectionColor={theme.backgroundSelected}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
    />
  );
}

export function useTypography() {
  const theme = useTheme();
  return StyleSheet.create({
    heading: { color: theme.text, fontSize: 20, fontWeight: '800' },
    subheading: { color: theme.text, fontSize: 15, fontWeight: '700' },
    body: { color: theme.text, fontSize: 14, lineHeight: 21 },
    label: { color: theme.text, fontSize: 12, fontWeight: '800', marginBottom: 7 },
    caption: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
  });
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  button: {
    backgroundColor: '#D92534',
    borderRadius: 15,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: { color: '#F2F2F2', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  secondary: { backgroundColor: theme.background, borderColor: '#117DBF', borderWidth: 1 },
  secondaryText: { color: theme.text },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  input: {
    backgroundColor: theme.background,
    borderColor: '#117DBF',
    borderRadius: 14,
    borderWidth: 1,
    color: theme.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});
