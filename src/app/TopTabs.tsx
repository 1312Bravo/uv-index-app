import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  label: {
    color: '#777777',
    fontSize: 11,
    paddingBottom: 7,
  },
  disabledLabel: {
    color: '#C7C7C7',
  },
  activeLabel: {
    borderBottomColor: '#151515',
    borderBottomWidth: 2,
    color: '#151515',
    fontWeight: '600',
  },
});
