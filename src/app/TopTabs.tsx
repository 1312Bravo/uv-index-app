import { Pressable, StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../ui/visualStyle';

export type AppPage = 'location' | 'outlook' | 'plan' | 'info';

type Props = {
  activePage: AppPage;
  hasLocation: boolean;
  onSelect: (page: AppPage) => void;
};

export function TopTabs({ activePage, hasLocation, onSelect }: Props) {
  return (
    <View style={styles.tabs}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: activePage === 'location' }} onPress={() => onSelect('location')} style={styles.tab}>
        <Text style={[styles.label, activePage === 'location' && styles.activeLabel]}>Location</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ disabled: !hasLocation, selected: activePage === 'outlook' }}
        disabled={!hasLocation}
        onPress={() => onSelect('outlook')}
        style={styles.tab}
      >
        <Text style={[styles.label, !hasLocation && styles.disabledLabel, activePage === 'outlook' && styles.activeLabel]}>UV Outlook</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ disabled: !hasLocation, selected: activePage === 'plan' }}
        disabled={!hasLocation}
        onPress={() => onSelect('plan')}
        style={styles.tab}
      >
        <Text style={[styles.label, !hasLocation && styles.disabledLabel, activePage === 'plan' && styles.activeLabel]}>Plan an Outing</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activePage === 'info' }}
        onPress={() => onSelect('info')}
        style={styles.tab}
      >
        <Text style={[styles.label, activePage === 'info' && styles.activeLabel]}>Info</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    alignSelf: 'stretch',
    borderBottomColor: uiColors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  label: {
    color: uiColors.ink,
    fontSize: 12,
    lineHeight: 16,
    paddingBottom: 8,
  },
  disabledLabel: {
    color: '#BBBBBB',
  },
  activeLabel: {
    borderBottomColor: uiColors.ink,
    borderBottomWidth: 2,
  },
});
