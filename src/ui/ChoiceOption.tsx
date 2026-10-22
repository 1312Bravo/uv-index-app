import { Pressable, StyleSheet, Text } from 'react-native';

import { uiColors } from './visualStyle';

type Props = {
  active: boolean;
  showDivider?: boolean;
  label: string;
  onPress: () => void;
};

export function ChoiceOption({ active, label, onPress, showDivider = false }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, showDivider && styles.optionDivider, pressed && styles.pressed]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
      {active && <Text style={styles.selectionMark}>×</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { alignSelf: 'center', maxWidth: 280, width: '82%' },
  list: { alignSelf: 'center', maxWidth: 220, paddingHorizontal: 4, width: '100%' },
  option: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 6 },
  optionDivider: { borderBottomColor: uiColors.line, borderBottomWidth: 1 },
  pressed: { opacity: 0.65 },
  label: { color: uiColors.secondary, fontSize: 14 },
  activeLabel: { color: uiColors.ink, fontWeight: '600' },
  selectionMark: { color: uiColors.ink, fontSize: 15, marginLeft: 8 },
});

export const choiceListLayout = styles.list;
export const choiceFieldLayout = styles.field;
