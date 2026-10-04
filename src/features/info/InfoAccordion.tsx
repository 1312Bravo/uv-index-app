import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
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
  section: { borderBottomColor: '#EEEEEE', borderBottomWidth: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 12,
  },
  title: { color: '#555555', flex: 1, fontSize: 14 },
  activeTitle: { color: '#151515', fontWeight: '600' },
  indicator: { color: '#777777', fontSize: 18, marginLeft: 12 },
  content: { paddingBottom: 18 },
});
