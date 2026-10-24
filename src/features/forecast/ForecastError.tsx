import { Pressable, StyleSheet, Text, View } from 'react-native';
import { uiColors } from '../../ui/visualStyle';

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
  message: { color: uiColors.faint, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4 },
  retryText: { color: uiColors.muted, fontSize: 13, textDecorationLine: 'underline' },
});
