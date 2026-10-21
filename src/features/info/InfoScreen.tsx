import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCloudCoverBands } from '../../domain/weather/getCloudCoverBand';
import { getPrecipitationRateGuide } from '../../domain/weather/getPrecipitationRateGuide';
import { getWindSpeedBands } from '../../domain/weather/getWindSpeedBands';
import { getWhoGuidanceTable } from '../../domain/guidance/getWhoGuidance';
import { getUvCategoryDefinitions } from '../../domain/uv/getUvCategory';
import { uiColors, uiType } from '../../ui/visualStyle';
import { InfoAccordion } from './InfoAccordion';

const uvCategories = getUvCategoryDefinitions();
const cloudCoverBands = getCloudCoverBands();
const precipitationRateGuide = getPrecipitationRateGuide();
const windSpeedBands = getWindSpeedBands();
const whoGuidance = getWhoGuidanceTable();

type InfoTopic = 'uv' | 'clouds' | 'precipitation' | 'wind';

function formatUvRange(index: number): string {
  const category = uvCategories[index];
  const nextCategory = uvCategories[index + 1];
  return nextCategory
    ? `${category.minimumUvInclusive}-${nextCategory.minimumUvInclusive - 1}`
    : `${category.minimumUvInclusive}+`;
}

function formatCloudRange(minimum: number, maximum: number): string {
  return minimum === maximum ? `${minimum}%` : `${minimum}-${maximum}%`;
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
        The UV Index shows the strength of the sun's ultraviolet radiation. It is
        separate from temperature.
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
      <Text style={styles.metricHeading}>WHO protection guidance</Text>
      <Text style={styles.description}>
        The five categories describe UV strength. WHO's general protection advice
        uses three ranges.
      </Text>
      <View style={styles.whoBands}>
        {whoGuidance.bands.map((band) => (
          <View key={band.level} style={styles.whoBand}>
            <View style={styles.whoBandHeading}>
              <Text style={styles.whoRange}>{band.range}</Text>
              <Text style={styles.category}>{band.label}</Text>
            </View>
            {band.actions.map((action) => (
              <Text key={action} style={styles.description}>{action}</Text>
            ))}
          </View>
        ))}
      </View>
      <SourceLink
        label="WHO: The ultraviolet (UV) index"
        url="https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index"
      />
      <SourceLink
        label="WHO: Global Solar UV Index guide"
        url="https://www.who.int/publications/i/item/9241590076"
      />
    </>
  );
}

function CloudCoverExplanation() {
  return (
    <>
      <Text style={styles.description}>
        Cloud cover estimates how much of the sky is covered. It does not show
        UV levels; check the UV Index.
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
      <SourceLink
        label="WHO: UV radiation, clouds and haze"
        url="https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)"
      />
      <SourceLink
        label="Open-Meteo: Weather forecast variables"
        url="https://open-meteo.com/en/docs"
      />
    </>
  );
}

function PrecipitationExplanation() {
  return (
    <>
      <Text style={styles.metricHeading}>Chance (%)</Text>
      <Text style={styles.description}>
        Chance of more than 0.1 mm in the hour before the displayed time. A value
        at 3 PM covers 2-3 PM. It does not tell you how long precipitation will last.
      </Text>
      <Text style={styles.metricHeading}>Amount (mm)</Text>
      <Text style={styles.description}>
        Expected total for that same hour. It can include rain, showers, or snow.
        1 mm is about 1 liter of water per square meter.
      </Text>
      <Text style={styles.metricHeading}>Rain amount guide</Text>
      <Text style={styles.description}>
        Rough comparisons for rain spread across one hour. A short burst can be
        much heavier.
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
        Peak chance is for the highest single hour, not the whole outing. The rain
        guide applies to one hour, not the outing total.
      </Text>
      <SourceLink
        label="Open-Meteo: Weather forecast variables"
        url="https://open-meteo.com/en/docs"
      />
      <SourceLink
        label="WMO: Rain-intensity criteria"
        url="https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf"
      />
    </>
  );
}

function WindExplanation() {
  return (
    <>
      <Text style={styles.description}>
        Wind speed is shown in km/h. These ranges describe typical effects on land.
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
        label="U.S. National Weather Service: Beaufort wind scale"
        url="https://www.weather.gov/mfl/beaufort"
      />
      <SourceLink
        label="Open-Meteo: Weather forecast variables"
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
  section: { marginTop: 24 },
  heading: { color: uiColors.ink, fontSize: uiType.sectionHeading, fontWeight: '600', textAlign: 'center' },
  topics: { alignSelf: 'center', marginTop: 16, maxWidth: 360, width: '90%' },
  description: { color: uiColors.body, fontSize: uiType.body, lineHeight: 21, marginTop: 8 },
  metricHeading: { color: '#333333', fontSize: 13, fontWeight: '600', marginTop: 14 },
  whoBands: { marginTop: 8 },
  whoBand: { borderTopColor: '#E8E8E8', borderTopWidth: 1, paddingVertical: 10 },
  whoBandHeading: { alignItems: 'baseline', flexDirection: 'row', gap: 10 },
  whoRange: { color: '#151515', fontSize: 13, fontWeight: '600', width: 36 },
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
  categoryDescription: { color: uiColors.secondary, fontSize: uiType.body, lineHeight: 20, marginTop: 6, minWidth: 0 },
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
  sourceLink: { color: '#666666', fontSize: 12, marginTop: 12, textDecorationLine: 'underline' },
});
