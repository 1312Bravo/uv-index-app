import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { uiColors } from './visualStyle';

type Props = {
  label: string;
  url: string;
  compact?: boolean;
};

export function SourceAttribution({ label, url, compact = false }: Props) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={() => { void Linking.openURL(url); }} style={[styles.link, compact && styles.compactLink]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', marginTop: 8 },
  compactLink: { marginTop: 0 },
  text: { color: uiColors.muted, fontSize: 11, textAlign: 'center', textDecorationLine: 'underline' },
});
