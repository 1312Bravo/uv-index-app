import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCloudCoverBands } from '../../domain/weather/getCloudCoverBand';
import { getPrecipitationRateGuide } from '../../domain/weather/getPrecipitationRateGuide';
import { getWindSpeedBands } from '../../domain/weather/getWindSpeedBands';
import { getUvCategoryDefinitions } from '../../domain/uv/getUvCategory';
import { InfoAccordion } from './InfoAccordion';

const uvCategories = getUvCategoryDefinitions();
const cloudCoverBands = getCloudCoverBands();
const precipitationRateGuide = getPrecipitationRateGuide();
const windSpeedBands = getWindSpeedBands();

type InfoTopic = 'uv' | 'clouds' | 'precipitation' | 'wind';

function formatUvRange(index: number): string {
  const category = uvCategories[index];
  const nextCategory = uvCategories[index + 1];
  return nextCategory
    ? `${category.minimumUvInclusive}–${nextCategory.minimumUvInclusive - 1}`
    : `${category.minimumUvInclusive}+`;
}

function formatCloudRange(minimum: number, maximum: number): string {
  return minimum === maximum ? `${minimum}%` : `${minimum}–${maximum}%`;
}

function openSource(url: string) {
  void Linking.openURL(url);
}

function SourceLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => openSource(url)}>
      <Text style={styles.sourceLink}>{label}</Text>
    </Pressable>
  );
}

function UvIndexExplanation() {
  return (
    <>
      <Text style={styles.description}>
        The UV Index describes the strength of ultraviolet radiation from the sun.
        It is not a measure of temperature.
      </Text>
      <Text style={styles.supportingText}>
        These are the standard categories used to describe UV Index levels.
      </Text>
      <View style={styles.list}>
        {uvCategories.map((category, index) => (
          <View key={category.key} style={styles.row}>
            <View style={styles.rangeColumn}>
              <Text style={styles.range}>{formatUvRange(index)}</Text>
              <Text style={styles.category}>{category.label}</Text>
            </View>
            <Text style={styles.categoryDescription}>{category.meaning}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.metricHeading}>WHO guidance</Text>
      <Text style={styles.description}>
        WHO recommends sun protection from UV Index 3, and extra protection from
        8. These are general guidance thresholds.
      </Text>
      <SourceLink
        label="WHO · The ultraviolet (UV) index"
        url="https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)-index"
      />
      <SourceLink
        label="WHO · Global Solar UV Index guide"
        url="https://www.who.int/publications/i/item/9241590076"
      />
    </>
  );
}

function CloudCoverExplanation() {
  return (
    <>
      <Text style={styles.description}>
        The percentage estimates how much of the sky is covered by clouds at that
        time and place. It does not mean that the same percentage of UV is blocked.
      </Text>
      <View style={styles.list}>
        {cloudCoverBands.map((band) => (
          <View key={band.key} style={styles.cloudRow}>
            <Text style={styles.cloudRange}>
              {formatCloudRange(band.minimumPercentInclusive, band.maximumPercentInclusive)}
            </Text>
            <View style={styles.cloudDescription}>
              <Text style={styles.category}>{band.label}</Text>
              <Text style={styles.description}>{band.description}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        These cloud labels are simplified descriptions, not official weather
        categories. Clouds can reduce UV, but UV can still be high under clouds;
        thin or broken clouds may have little effect or sometimes increase UV.
        Use the forecast UV Index—not cloud cover—to understand UV conditions.
      </Text>
      <SourceLink
        label="WHO · UV radiation, clouds and haze"
        url="https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)"
      />
      <SourceLink
        label="Open-Meteo · Weather forecast variables"
        url="https://open-meteo.com/en/docs"
      />
    </>
  );
}

function PrecipitationExplanation() {
  return (
    <>
      <Text style={styles.metricHeading}>Precipitation chance</Text>
      <Text style={styles.description}>
        The percentage is the forecast chance of more than 0.1 mm of precipitation
        during the hour before the displayed time. It is not the percentage of the
        hour when it will rain, or the chance of rain at any point during your whole outing.
      </Text>
      <Text style={styles.metricHeading}>Expected precipitation amount</Text>
      <Text style={styles.description}>
        The amount in millimeters is the forecast total for that preceding hour.
        It can include rain, showers, and snow; 1 mm is about 1 liter of water per
        square meter.
      </Text>
      <Text style={styles.metricHeading}>What the amount can mean for rain</Text>
      <Text style={styles.description}>
        Use these ranges as a rough guide for a single hour, only if the
        precipitation is rain. A one-hour total does not show how intense a short
        burst may be.
      </Text>
      <View style={styles.list}>
        {precipitationRateGuide.map((entry) => (
          <View key={entry.key} style={styles.row}>
            <View style={styles.rangeColumn}>
              <Text style={styles.range}>{entry.range}</Text>
              <Text style={styles.category}>{entry.label}</Text>
            </View>
            <Text style={styles.categoryDescription}>{entry.description}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        In the outing summary, the amount adds only complete forecast hours within
        your outing. “Peak hourly chance” is the highest single-hour chance in
        that period, not a combined chance for the outing. The outing total sums
        multiple hours, so do not classify it with the hourly rain guide above.
      </Text>
      <SourceLink
        label="Open-Meteo · Weather forecast variables"
        url="https://open-meteo.com/en/docs"
      />
      <SourceLink
        label="WMO · Rain-intensity criteria"
        url="https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf"
      />
    </>
  );
}

function WindExplanation() {
  return (
    <>
      <Text style={styles.description}>
        Wind speed is forecast at 10 meters above ground and shown in kilometers
        per hour. This simplified guide groups land-based Beaufort descriptions;
        actual effects vary with local surroundings.
      </Text>
      <View style={styles.list}>
        {windSpeedBands.map((band) => (
          <View key={band.key} style={styles.cloudRow}>
            <Text style={styles.windRange}>{band.range}</Text>
            <View style={styles.cloudDescription}>
              <Text style={styles.category}>{band.label}</Text>
              <Text style={styles.description}>{band.description}</Text>
            </View>
          </View>
        ))}
      </View>
      <SourceLink
        label="U.S. National Weather Service · Beaufort wind scale"
        url="https://www.weather.gov/mfl/beaufort"
      />
      <SourceLink
        label="Open-Meteo · Weather forecast variables"
        url="https://open-meteo.com/en/docs?past_days=1"
      />
    </>
  );
}

export function InfoScreen() {
  const [openTopic, setOpenTopic] = useState<InfoTopic | null>(null);

  function toggleTopic(topic: InfoTopic) {
    setOpenTopic((current) => current === topic ? null : topic);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Understanding the forecast</Text>
      <Text style={styles.hint}>Choose a topic to see what the values mean.</Text>
      <View style={styles.topics}>
        <InfoAccordion
          title="UV Index levels"
          expanded={openTopic === 'uv'}
          onPress={() => toggleTopic('uv')}
        >
          <UvIndexExplanation />
        </InfoAccordion>
        <InfoAccordion
          title="Cloud cover"
          expanded={openTopic === 'clouds'}
          onPress={() => toggleTopic('clouds')}
        >
          <CloudCoverExplanation />
        </InfoAccordion>
        <InfoAccordion
          title="Precipitation"
          expanded={openTopic === 'precipitation'}
          onPress={() => toggleTopic('precipitation')}
        >
          <PrecipitationExplanation />
        </InfoAccordion>
        <InfoAccordion
          title="Wind"
          expanded={openTopic === 'wind'}
          onPress={() => toggleTopic('wind')}
        >
          <WindExplanation />
        </InfoAccordion>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 32 },
  heading: { color: '#151515', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  hint: { color: '#696969', fontSize: 13, marginTop: 7, textAlign: 'center' },
  topics: { marginTop: 18 },
  description: { color: '#555555', fontSize: 13, lineHeight: 20, marginTop: 8 },
  supportingText: { color: '#696969', fontSize: 13, lineHeight: 19, marginTop: 14 },
  metricHeading: { color: '#333333', fontSize: 13, fontWeight: '600', marginTop: 14 },
  list: { marginTop: 8 },
  row: {
    alignItems: 'flex-start',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1,
    flexDirection: 'column',
    paddingVertical: 12,
  },
  rangeColumn: { alignItems: 'baseline', flexDirection: 'row', gap: 8 },
  range: { color: '#151515', fontSize: 14, fontWeight: '600' },
  category: { color: '#333333', fontSize: 13, fontWeight: '600' },
  categoryDescription: { color: '#696969', fontSize: 13, lineHeight: 19, marginTop: 6, minWidth: 0 },
  note: { color: '#777777', fontSize: 12, lineHeight: 18, marginTop: 12 },
  cloudRow: {
    alignItems: 'flex-start',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 11,
  },
  cloudRange: { color: '#151515', fontSize: 13, fontWeight: '600', paddingTop: 2, width: 52 },
  windRange: { color: '#151515', fontSize: 12, fontWeight: '600', paddingTop: 2, width: 78 },
  cloudDescription: { flex: 1, minWidth: 0 },
  sourceLink: { color: '#444444', fontSize: 13, marginTop: 12, textDecorationLine: 'underline' },
});
