import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';
import { LocationActionLabel } from './LocationActionLabel';

type Props = {
  coordinates: string;
  defaultName: string;
  visible: boolean;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export function SaveLocationDialog({ coordinates, defaultName, onCancel, onSave, visible }: Props) {
  const [name, setName] = useState(defaultName);
  const [selection, setSelection] = useState({ start: defaultName.length, end: defaultName.length });

  useEffect(() => {
    if (!visible) return;
    setName(defaultName);
    setSelection({ start: defaultName.length, end: defaultName.length });
  }, [defaultName, visible]);

  function save() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave(trimmedName);
  }

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <Text style={styles.title}>Save location</Text>
          <Text style={styles.coordinates}>{coordinates}</Text>
          <Text style={styles.renameLabel}>Rename</Text>
          <TextInput
            accessibilityLabel="Saved location name"
            autoCapitalize="words"
            maxLength={60}
            onChangeText={(value) => {
              setName(value);
              setSelection({ start: value.length, end: value.length });
            }}
            onFocus={() => setSelection({ start: name.length, end: name.length })}
            onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
            onSubmitEditing={save}
            placeholder="Location name"
            cursorColor={uiColors.faint}
            returnKeyType="done"
            selectionColor={uiColors.muted}
            selection={selection}
            style={[styles.input, Platform.OS === 'web' && styles.webInput]}
            underlineColorAndroid="transparent"
            value={name}
          />
          <View style={styles.divider} />
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <LocationActionLabel label="Cancel" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !name.trim() }}
              disabled={!name.trim()}
              onPress={save}
              style={({ pressed }) => [
                styles.actionButton,
                !name.trim() && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <LocationActionLabel label="Save" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    backgroundColor: '#F6F4F1',
    borderColor: uiColors.line,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: 320,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: '100%',
  },
  title: {
    color: uiColors.ink,
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  coordinates: {
    color: uiColors.muted,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  renameLabel: {
    alignSelf: 'center',
    color: uiColors.faint,
    fontSize: 11,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: uiColors.ink,
    fontSize: 15,
    marginTop: 2,
    minHeight: 44,
    paddingHorizontal: 4,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  webInput: { outlineColor: 'transparent', outlineStyle: 'solid', outlineWidth: 0 },
  divider: {
    alignSelf: 'center',
    backgroundColor: uiColors.line,
    height: 1,
    marginTop: 4,
    width: 48,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 84,
    marginHorizontal: 8,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
});
