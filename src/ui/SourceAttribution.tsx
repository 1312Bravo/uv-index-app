import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { uiColors } from './visualStyle';

type Props = {
  label: string;
  url: string;
};

export function SourceAttribution({ label, url }: Props) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={() => { void Linking.openURL(url); }} style={styles.link}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', marginTop: 8 },
  text: { color: uiColors.muted, fontSize: 11, textAlign: 'center', textDecorationLine: 'underline' },
});
