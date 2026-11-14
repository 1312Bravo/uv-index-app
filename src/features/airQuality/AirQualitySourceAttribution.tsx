import { StyleSheet, Text, View } from 'react-native';

import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors } from '../../ui/visualStyle';

export function AirQualitySourceAttribution() {
  return (
    <View style={styles.sourceLinks}>
      <Text style={styles.label}>Data: </Text>
      <SourceAttribution
        compact
        label="Open-Meteo"
        url="https://open-meteo.com/en/docs/air-quality-api"
      />
      <Text style={styles.separator}>·</Text>
      <SourceAttribution
        compact
        label="CAMS ENSEMBLE"
        url="https://atmosphere.copernicus.eu/"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sourceLinks: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  label: { color: uiColors.muted, fontSize: 10 },
  separator: { color: uiColors.muted, fontSize: 11, marginHorizontal: 5 },
});
