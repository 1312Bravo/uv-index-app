import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCloudCoverBands } from '../../domain/weather/getCloudCoverBand';
import { getUvCategoryDefinitions } from '../../domain/uv/getUvCategory';
import { InfoAccordion } from './InfoAccordion';

const uvCategories = getUvCategoryDefinitions();
const cloudCoverBands = getCloudCoverBands();

type InfoTopic = 'uv' | 'clouds';

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
        A higher number means greater potential for harm to skin and eyes, and less
        time before harm can occur. It is not a measure of temperature.
      </Text>
      <Text style={styles.supportingText}>
        These are the standard exposure categories. Protection is generally
        recommended from UV Index 3 and above.
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
      <Text style={styles.note}>
        UV Scout keeps the decimal forecast visible, then rounds to the nearest
        whole number to choose a category; .5 rounds up (for example, 2.5 is
        Moderate). This rounding is an app convention.
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 32 },
  heading: { color: '#151515', fontSize: 20, fontWeight: '600' },
  hint: { color: '#696969', fontSize: 13, marginTop: 7 },
  topics: { marginTop: 18 },
  description: { color: '#555555', fontSize: 13, lineHeight: 20, marginTop: 8 },
  supportingText: { color: '#696969', fontSize: 13, lineHeight: 19, marginTop: 14 },
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
  cloudDescription: { flex: 1, minWidth: 0 },
  sourceLink: { color: '#444444', fontSize: 13, marginTop: 12, textDecorationLine: 'underline' },
});
