import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { choiceListLayout } from './ChoiceOption';
import { uiColors } from './visualStyle';

const MAX_HEIGHT = 200;
const TRACK_INSET = 4;
const MIN_THUMB_HEIGHT = 28;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function OptionScrollList({ children, style }: Props) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const canScroll = contentHeight > viewportHeight + 1 && viewportHeight > 0;
  const trackHeight = Math.max(0, viewportHeight - TRACK_INSET * 2);
  const thumbHeight = canScroll
    ? Math.min(trackHeight, Math.max(MIN_THUMB_HEIGHT, trackHeight * viewportHeight / contentHeight))
    : 0;
  const scrollRange = Math.max(1, contentHeight - viewportHeight);
  const thumbTop = (trackHeight - thumbHeight) * Math.min(Math.max(scrollOffset, 0), scrollRange) / scrollRange;

  return (
    <View style={[choiceListLayout, styles.container, style]}>
      <ScrollView
        contentContainerStyle={styles.content}
        nestedScrollEnabled
        onContentSizeChange={(_, height) => setContentHeight(height)}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {children}
      </ScrollView>
      {canScroll && (
        <View accessible={false} pointerEvents="none" style={styles.track}>
          <View style={[styles.thumb, { height: thumbHeight, transform: [{ translateY: thumbTop }] }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { maxHeight: MAX_HEIGHT, position: 'relative' },
  content: { paddingRight: 12 },
  scroll: { maxHeight: MAX_HEIGHT },
  track: {
    backgroundColor: uiColors.line,
    borderRadius: 2,
    bottom: TRACK_INSET,
    position: 'absolute',
    right: 3,
    top: TRACK_INSET,
    width: 3,
  },
  thumb: { backgroundColor: '#898989', borderRadius: 2, width: 3 },
});
