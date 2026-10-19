import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  message: string;
  onRetry: () => void;
};

export function ForecastError({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 16 },
  message: { color: '#A6A6A6', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4 },
  retryText: { color: '#777777', fontSize: 13, textDecorationLine: 'underline' },
});
