import { StyleSheet, Text } from 'react-native';

import type { EuropeanAqiCategory } from '../../domain/airQuality/getEuropeanAqiCategory';
import { uiColors } from '../../ui/visualStyle';

export function AirQualityCategoryGuidance({ category }: { category: EuropeanAqiCategory }) {
  return (
    <>
      {category.generalAdvice === category.sensitiveAdvice ? (
        <Text style={styles.advice}>
          <Text style={styles.adviceLabel}>Everyone: </Text>{category.generalAdvice}
        </Text>
      ) : (
        <>
          <Text style={styles.advice}>
            <Text style={styles.adviceLabel}>Most people: </Text>{category.generalAdvice}
          </Text>
          <Text style={[styles.advice, styles.sensitiveAdvice]}>
            <Text style={styles.adviceLabel}>Sensitive groups: </Text>{category.sensitiveAdvice}
          </Text>
        </>
      )}
      <Text style={styles.meaning}>{category.meaning}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  advice: { color: uiColors.body, fontSize: 13, lineHeight: 19, marginTop: 5 },
  adviceLabel: { color: uiColors.ink, fontWeight: '600' },
  sensitiveAdvice: { marginTop: 4 },
  meaning: { color: uiColors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
});
