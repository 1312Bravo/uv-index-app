import { StyleSheet, Text, View } from 'react-native';

import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors } from '../../ui/visualStyle';

export function AirQualitySourceAttribution({ showOpenStreetMap = false }: {
  showOpenStreetMap?: boolean;
}) {
  return (
    <View style={styles.sourceLinks}>
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
      {showOpenStreetMap && (
        <>
          <Text style={styles.separator}>·</Text>
          <SourceAttribution
            compact
            label="© OpenStreetMap contributors"
            url="https://www.openstreetmap.org/copyright"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sourceLinks: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  separator: { color: uiColors.muted, fontSize: 11, marginHorizontal: 3 },
});
