import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';

type Props = {
  message: string | null;
  onClose: () => void;
};

export function LocationUnavailableNotice({ message, onClose }: Props) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={message !== null}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.headingRow}>
            <Text style={styles.title}>Location unavailable</Text>
            <Pressable
              accessibilityLabel="Close location notice"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    backgroundColor: uiColors.white,
    borderRadius: 14,
    maxWidth: 320,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    width: '100%',
  },
  headingRow: { alignItems: 'center', justifyContent: 'center', minHeight: 40, position: 'relative' },
  closeButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: -12,
    top: 0,
    width: 40,
  },
  closeText: { color: uiColors.secondary, fontSize: 24, lineHeight: 28 },
  title: { color: uiColors.ink, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  message: { color: uiColors.secondary, fontSize: 14, lineHeight: 21, marginTop: 4, textAlign: 'center' },
});
