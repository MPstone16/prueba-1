import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function BentoCard({ style, ...props }: ViewProps) {
  const theme = useTheme();
  return <View style={[createStyles(theme).card, style]} {...props} />;
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    backgroundColor: theme.backgroundElement,
    borderColor: theme.background,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
});
