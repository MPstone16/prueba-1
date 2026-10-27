import { StyleSheet, View, type ViewProps } from 'react-native';

export function BentoCard({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F2F2F2',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#263973',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
});
