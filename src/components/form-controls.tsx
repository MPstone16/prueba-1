import { Pressable, StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';

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
  return (
    <TextInput
      placeholderTextColor="#263973"
      selectionColor="#117DBF"
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
    />
  );
}

export const typography = StyleSheet.create({
  heading: { color: '#263973', fontSize: 20, fontWeight: '800' },
  subheading: { color: '#263973', fontSize: 15, fontWeight: '700' },
  body: { color: '#263973', fontSize: 14, lineHeight: 21 },
  label: { color: '#263973', fontSize: 12, fontWeight: '800', marginBottom: 7 },
  caption: { color: '#263973', fontSize: 12, lineHeight: 18 },
});

const styles = StyleSheet.create({
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
  secondary: { backgroundColor: '#F2F2F2', borderColor: '#117DBF', borderWidth: 1 },
  secondaryText: { color: '#263973' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  input: {
    backgroundColor: '#F2F2F2',
    borderColor: '#117DBF',
    borderRadius: 14,
    borderWidth: 1,
    color: '#263973',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});
