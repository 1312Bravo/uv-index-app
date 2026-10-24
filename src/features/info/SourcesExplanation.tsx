import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';

type SourceReference = { label: string; url: string };

function SourceItem({ text, links }: { text: string; links: SourceReference[] }) {
  return (
    <View style={styles.item}>
      <Text style={styles.marker}>-</Text>
      <View style={styles.content}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.links}>
          {links.map(({ label, url }) => (
            <Pressable accessibilityRole="link" key={url} onPress={() => { void Linking.openURL(url); }}>
              <Text style={styles.link}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export function SourcesExplanation() {
  return (
    <View style={styles.list}>
      <SourceItem
        text="Open-Meteo supplies UV and weather forecasts. UV Scout calculates outing summaries and estimates selected half-hour UV values between hourly forecasts. Even Current UV is a model estimate, not a measurement at your location."
        links={[
          { label: 'Open-Meteo forecast data', url: 'https://open-meteo.com/en/docs' },
          { label: 'Data licence: CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
        ]}
      />
      <SourceItem
        text="Your device supplies coordinates if you use its location. Place search uses Open-Meteo data based on GeoNames. BigDataCloud supplies an approximate place name for a device or map location."
        links={[
          { label: 'Open-Meteo place search', url: 'https://open-meteo.com/en/docs/geocoding-api' },
          { label: 'GeoNames place data', url: 'https://www.geonames.org/' },
          { label: 'BigDataCloud place names', url: 'https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api' },
        ]}
      />
      <SourceItem
        text="The location map uses OpenStreetMap. Map attribution also appears on the map."
        links={[{ label: 'OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' }]}
      />
      <SourceItem
        text="The five UV Index levels follow WHO's scale. UV Scout rounds decimal values to show a category."
        links={[{ label: 'WHO UV Index guide', url: 'https://www.who.int/publications/i/item/9241590076' }]}
      />
      <SourceItem
        text="WHO provides general UV protection guidance. UV Scout uses it as a foundation and adds outing-specific rules based on the forecast and time outside. The resulting recommendations are UV Scout's, not WHO's."
        links={[
          { label: 'WHO UV protection levels', url: 'https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index' },
          { label: 'WHO sun protection advice', url: 'https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer' },
          { label: 'WHO on clouds and UV', url: 'https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)' },
        ]}
      />
      <SourceItem
        text="UV Scout calculates dawn, sunrise, sunset, and dusk for the selected coordinates. The sun and moon paths are illustrations, not observed positions."
        links={[
          { label: 'NOAA solar calculation reference', url: 'https://gml.noaa.gov/grad/solcalc/calcdetails.html' },
          { label: 'SunCalc calculation reference', url: 'https://github.com/mourner/suncalc' },
        ]}
      />
      <SourceItem
        text="The rain and wind guides in Info are simplified comparisons based on WMO and U.S. National Weather Service references. They do not change the forecast or UV guidance."
        links={[
          { label: 'WMO rain-intensity reference', url: 'https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf' },
          { label: 'National Weather Service wind scale', url: 'https://www.weather.gov/mfl/beaufort' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { rowGap: 12, marginTop: 6 },
  item: { alignItems: 'flex-start', flexDirection: 'row' },
  marker: { color: uiColors.body, fontSize: 13, lineHeight: 19, marginRight: 8 },
  content: { flex: 1 },
  text: { color: uiColors.body, fontSize: 13, lineHeight: 19 },
  links: { marginTop: 3, rowGap: 3 },
  link: { color: uiColors.secondary, fontSize: 12, lineHeight: 18, textDecorationLine: 'underline' },
});
