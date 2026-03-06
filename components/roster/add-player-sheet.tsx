/**
 * Add Player Sheet — Bottom sheet form for adding a new player to the roster.
 * Uses the useAddPlayer() mutation to insert into Supabase.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAddPlayer } from '@/hooks/use-roster-mutations';

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const CLASS_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

interface Props {
  visible: boolean;
  onClose: () => void;
  programId: string;
  seasonId: string;
}

export function AddPlayerSheet({ visible, onClose, programId, seasonId }: Props) {
  const accent = useAccentColor();
  const addPlayer = useAddPlayer();

  const [fullName, setFullName] = useState('');
  const [jersey, setJersey] = useState('');
  const [position, setPosition] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [classYear, setClassYear] = useState('');

  const resetForm = useCallback(() => {
    setFullName('');
    setJersey('');
    setPosition('');
    setHeight('');
    setWeight('');
    setClassYear('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Enter the player\'s full name.');
      return;
    }

    try {
      await addPlayer.mutateAsync({
        fullName: fullName.trim(),
        programId,
        seasonId,
        jerseyNumber: jersey.trim() || undefined,
        position: position || undefined,
        height: height.trim() || undefined,
        weight: weight.trim() ? parseInt(weight.trim(), 10) : undefined,
        classYear: classYear || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add player.');
    }
  }, [fullName, jersey, position, height, weight, classYear, programId, seasonId, addPlayer, resetForm, onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Add Player</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Marcus Johnson"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Jersey + Position row */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Jersey #</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 23"
                placeholderTextColor="#666"
                value={jersey}
                onChangeText={setJersey}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Position</Text>
              <View style={styles.pillRow}>
                {POSITIONS.map(p => (
                  <Pressable
                    key={p}
                    style={[
                      styles.pill,
                      position === p && { backgroundColor: accent + '30', borderColor: accent },
                    ]}
                    onPress={() => {
                      setPosition(position === p ? '' : p);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[styles.pillText, position === p && { color: accent }]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Height + Weight row */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Height</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 6-3"
                placeholderTextColor="#666"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 195"
                placeholderTextColor="#666"
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          {/* Class Year */}
          <Text style={styles.label}>Class Year</Text>
          <View style={styles.pillRow}>
            {CLASS_YEARS.map(c => (
              <Pressable
                key={c}
                style={[
                  styles.pill,
                  classYear === c && { backgroundColor: accent + '30', borderColor: accent },
                ]}
                onPress={() => {
                  setClassYear(classYear === c ? '' : c);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.pillText, classYear === c && { color: accent }]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, { backgroundColor: accent }]}
            onPress={handleSubmit}
            disabled={addPlayer.isPending}
          >
            <Text style={styles.submitText}>
              {addPlayer.isPending ? 'Adding...' : 'Add to Roster'}
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1f28',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2f38',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2f38',
    backgroundColor: '#1a1f28',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
