import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';

type Props = {
  label: string;
};

export function LocationActionLabel({ label }: Props) {
  const [textWidth, setTextWidth] = useState(0);

  if (Platform.OS === 'web') {
    return (
      <span style={{
        color: uiColors.ink,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 15,
        fontWeight: 400,
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
      }}>
        {label}
      </span>
    );
  }

  return (
    <View style={styles.label}>
      <Text
        onLayout={({ nativeEvent }) => {
          const width = nativeEvent.layout.width;
          setTextWidth((currentWidth) => currentWidth === width ? currentWidth : width);
        }}
        style={styles.text}
      >
        {label}
      </Text>
      <View style={[styles.underline, { width: textWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  text: {
    color: uiColors.ink,
    fontSize: 15,
    fontWeight: '400',
  },
  underline: {
    backgroundColor: uiColors.ink,
    height: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
});
