import { useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getCloudCoverBands } from '../../domain/weather/getCloudCoverBand';
import { getEuropeanAqiCategoryDefinitions } from '../../domain/airQuality/getEuropeanAqiCategory';
import { getPrecipitationRateGuide } from '../../domain/weather/getPrecipitationRateGuide';
import { getWindSpeedBands } from '../../domain/weather/getWindSpeedBands';
import { getWhoGuidanceTable } from '../../domain/guidance/getWhoGuidance';
import { getUvCategoryDefinitions } from '../../domain/uv/getUvCategory';
import { uiColors, uiType } from '../../ui/visualStyle';
import { AirQualityCategoryGuidance } from '../airQuality/AirQualityCategoryGuidance';
import { InfoAccordion } from './InfoAccordion';
import { SourcesExplanation } from './SourcesExplanation';

const uvCategories = getUvCategoryDefinitions();
const europeanAqiCategories = getEuropeanAqiCategoryDefinitions();
const cloudCoverBands = getCloudCoverBands();
const precipitationRateGuide = getPrecipitationRateGuide();
const windSpeedBands = getWindSpeedBands();
const whoGuidance = getWhoGuidanceTable();

type InfoTopic = 'uv' | 'air-quality' | 'clouds' | 'precipitation' | 'wind' | 'sources';

function formatUvRange(index: number): string {
  const category = uvCategories[index];
  const nextCategory = uvCategories[index + 1];
  return nextCategory
    ? `${category.minimumUvInclusive}-${nextCategory.minimumUvInclusive - 1}`
    : `${category.minimumUvInclusive}+`;
}

function formatEuropeanAqiRange(index: number): string {
  const category = europeanAqiCategories[index];
  const nextCategory = europeanAqiCategories[index + 1];
  if (!category.minimumInclusive) return `>${category.minimum}`;
  if (!nextCategory) return `${category.minimum}+`;
  return `${category.minimum}-${nextCategory.minimum}`;
}

function formatCloudRange(minimum: number, maximum: number): string {
  return minimum === maximum ? `${minimum}%` : `${minimum}-${maximum}%`;
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
    </>
  );
}

function AirQualityExplanation() {
  return (
    <>
      <Text style={styles.description}>
        The European Air Quality Index (AQI) describes short-term, hourly air
        quality using five pollutants: PM2.5, PM10, ozone, nitrogen dioxide,
        and sulphur dioxide.
      </Text>
      <Text style={styles.description}>
        The recommendations follow EEA advice for most people and for sensitive
        groups: children and adults with respiratory problems, and adults with
        heart conditions.
      </Text>
      <View style={styles.list}>
        {europeanAqiCategories.map((category, index) => (
          <View key={category.key} style={styles.row}>
            <View style={styles.rangeColumn}>
              <Text style={styles.range}>{formatEuropeanAqiRange(index)}</Text>
              <Text style={styles.category}>{category.label}</Text>
            </View>
            <View style={styles.categoryDescription}>
              <AirQualityCategoryGuidance category={category} />
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        Values are AQI points, not pollutant concentrations. Exactly 100 is
        Very poor; Extremely poor begins above 100.
      </Text>
      <Text style={styles.note}>
        This hourly index does not describe long-term air quality or determine
        legal compliance. These are general recommendations, not individualized
        medical advice.
      </Text>
      <Text style={styles.note}>
        The AQI uses hourly pollutant estimates from the CAMS European model,
        with roughly 11 km grid spacing. The model forecast refreshes daily;
        UV Scout checks for the latest available estimate once an hour. These
        are model estimates, not readings from a nearby monitoring station.
      </Text>
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
        guide applies to one hour, not the outing total. The outing amount adds
        complete forecast hours only. Partial first and last hours are left out.
      </Text>
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
    </>
  );
}

export function InfoScreen() {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const [openTopic, setOpenTopic] = useState<InfoTopic | null>(null);

  function toggleTopic(topic: InfoTopic) {
    setOpenTopic((current) => current === topic ? null : topic);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Understanding the forecast</Text>
      <View style={[styles.topics, isWideWeb && styles.webTopics]}>
        <InfoAccordion
          title={<><Text style={styles.uvAccent}>UV</Text> Index levels</>}
          expanded={openTopic === 'uv'}
          onPress={() => toggleTopic('uv')}
        >
          <UvIndexExplanation />
        </InfoAccordion>
        <InfoAccordion
          title="Air quality"
          expanded={openTopic === 'air-quality'}
          onPress={() => toggleTopic('air-quality')}
        >
          <AirQualityExplanation />
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
        <InfoAccordion
          title="Sources"
          expanded={openTopic === 'sources'}
          onPress={() => toggleTopic('sources')}
        >
          <SourcesExplanation />
        </InfoAccordion>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  heading: { color: uiColors.ink, fontSize: uiType.sectionHeading, fontWeight: '600', textAlign: 'center' },
  uvAccent: { color: uiColors.accent },
  topics: { alignSelf: 'center', marginTop: 16, maxWidth: 360, width: '90%' },
  webTopics: { maxWidth: 900, width: '100%' },
  description: { color: uiColors.body, fontSize: uiType.body, lineHeight: 21, marginTop: 8 },
  metricHeading: { color: uiColors.body, fontSize: 13, fontWeight: '600', marginTop: 14 },
  whoBands: { marginTop: 8 },
  whoBand: { borderTopColor: uiColors.line, borderTopWidth: 1, paddingVertical: 10 },
  whoBandHeading: { alignItems: 'baseline', flexDirection: 'row', gap: 10 },
  whoRange: { color: uiColors.ink, fontSize: 13, fontWeight: '600', width: 36 },
  list: { marginTop: 8 },
  row: {
    alignItems: 'flex-start',
    borderBottomColor: uiColors.line,
    borderBottomWidth: 1,
    flexDirection: 'column',
    paddingVertical: 12,
  },
  rangeColumn: { alignItems: 'baseline', flexDirection: 'row', gap: 8 },
  range: { color: uiColors.ink, fontSize: 14, fontWeight: '600' },
  category: { color: uiColors.body, fontSize: 13, fontWeight: '600' },
  categoryDescription: { marginTop: 6, minWidth: 0 },
  note: { color: uiColors.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  cloudRow: {
    alignItems: 'flex-start',
    borderBottomColor: uiColors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 11,
  },
  cloudRange: { color: uiColors.ink, fontSize: 13, fontWeight: '600', paddingTop: 2, width: 52 },
  windRange: { color: uiColors.ink, fontSize: 12, fontWeight: '600', paddingTop: 2, width: 78 },
  cloudDescription: { flex: 1, minWidth: 0 },
});
