import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';

type Props = {
  title: ReactNode;
  expanded: boolean;
  onPress: () => void;
  children: ReactNode;
};

export function InfoAccordion({ title, expanded, onPress, children }: Props) {
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={styles.header}
      >
        <Text style={[styles.title, expanded && styles.activeTitle]}>{title}</Text>
        <Text style={styles.indicator}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomColor: uiColors.line, borderBottomWidth: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingVertical: 9,
  },
  title: { color: uiColors.body, flex: 1, fontSize: 15 },
  activeTitle: { color: uiColors.ink, fontWeight: '600' },
  indicator: { color: uiColors.muted, fontSize: 18, marginLeft: 12 },
  content: { paddingBottom: 14, paddingHorizontal: 4 },
});
