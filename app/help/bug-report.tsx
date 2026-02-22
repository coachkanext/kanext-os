/**
 * Bug Report Screen
 * Form to report bugs via email or save locally.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';

const CATEGORIES = ['UI', 'Data', 'Crash', 'Other'];

export default function BugReportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();

  const [category, setCategory] = useState('UI');
  const [whatHappened, setWhatHappened] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1';

  const handleSubmit = () => {
    if (!whatHappened.trim()) {
      Alert.alert('Required', 'Please describe what happened.');
      return;
    }

    const diagnostics = [
      `Mode: ${state.mode}`,
      `Program: ${state.program?.name ?? 'N/A'}`,
      `Season: ${state.cycle?.name ?? 'N/A'}`,
      `Platform: ${Platform.OS}`,
      `App Version: ${appVersion} (${buildNumber})`,
    ].join('\n');

    const body = [
      `Category: ${category}`,
      '',
      'What happened:',
      whatHappened,
      '',
      'Steps to reproduce:',
      stepsToReproduce || 'Not provided',
      '',
      'Expected result:',
      expectedResult || 'Not provided',
      '',
      '---',
      'Diagnostics:',
      diagnostics,
    ].join('\n');

    const email = 'support@kanext.com';
    const subject = encodeURIComponent(`[Bug Report] ${category}`);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${encodedBody}`;

    Linking.canOpenURL(mailtoUrl).then((supported) => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Saved locally', 'Bug report saved. Email composer not available.');
      }
    });
  };

  const handleAttachScreenshot = () => {
    Alert.alert('Coming soon', 'Screenshot attachment will be available in a future update.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Report a Bug</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
          <Pressable
            style={[styles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }]}>{category}</Text>
            <IconSymbol name="chevron.down" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* What happened */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>What happened? *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            value={whatHappened}
            onChangeText={setWhatHappened}
            textAlignVertical="top"
          />
        </View>

        {/* Steps to reproduce */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Steps to reproduce</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="1. Go to...\n2. Tap on...\n3. See error"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            value={stepsToReproduce}
            onChangeText={setStepsToReproduce}
            textAlignVertical="top"
          />
        </View>

        {/* Expected result */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Expected result</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="What should have happened instead?"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            value={expectedResult}
            onChangeText={setExpectedResult}
            textAlignVertical="top"
          />
        </View>

        {/* Attach screenshot */}
        <View style={styles.field}>
          <Pressable style={[styles.attachButton, { borderColor: colors.border }]} onPress={handleAttachScreenshot}>
            <IconSymbol name="camera.fill" size={20} color={colors.textSecondary} />
            <Text style={[styles.attachText, { color: colors.textSecondary }]}>Attach Screenshot</Text>
          </Pressable>
        </View>

        {/* Submit button */}
        <View style={styles.field}>
          <Pressable
            style={[styles.submitButton, { backgroundColor: accent }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit Report</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + Spacing.md }]}>
            <Text style={[styles.pickerSheetTitle, { color: colors.text }]}>Select Category</Text>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.pickerOption, category === cat && { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, { color: colors.text }]}>{cat}</Text>
                {category === cat && <IconSymbol name="checkmark" size={18} color={accent} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  scrollView: { flex: 1, paddingHorizontal: Spacing.md },
  field: { marginTop: Spacing.lg },
  fieldLabel: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.sm },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  pickerText: { fontSize: 16 },
  textArea: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: 16, minHeight: 100 },
  attachButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderStyle: 'dashed' },
  attachText: { fontSize: 16 },
  submitButton: { padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  submitText: { fontSize: 17, fontWeight: '600', color: '#FFF' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingTop: Spacing.lg },
  pickerSheetTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.md },
  pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: Spacing.lg, marginHorizontal: Spacing.md, borderRadius: BorderRadius.md },
  pickerOptionText: { fontSize: 16 },
});
