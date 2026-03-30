import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JoinScreen() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [orgFocused, setOrgFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.submittedContent}>
          <Text style={styles.kLogo}>K</Text>
          <Text style={styles.inTouchText}>We'll be in touch.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
      <View style={styles.formContent}>
        <Text style={styles.kLogo}>K</Text>

        <TextInput
          style={[
            styles.input,
            { borderColor: nameFocused ? '#111111' : '#E5E7EB', marginTop: 40 },
          ]}
          value={name}
          onChangeText={setName}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          autoFocus
        />

        <TextInput
          style={[
            styles.input,
            { borderColor: orgFocused ? '#111111' : '#E5E7EB', marginTop: 24 },
          ]}
          value={organization}
          onChangeText={setOrganization}
          onFocus={() => setOrgFocused(true)}
          onBlur={() => setOrgFocused(false)}
          placeholder="School, company, team, church..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>

      <Pressable
        style={[
          styles.submitButton,
          {
            bottom: insets.bottom + 32,
            backgroundColor: canSubmit ? '#111111' : '#E5E7EB',
          },
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={[styles.submitButtonText, { color: canSubmit ? '#FFFFFF' : '#9CA3AF' }]}>
          Submit
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submittedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kLogo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#111111',
  },
  input: {
    width: '100%',
    fontSize: 20,
    borderBottomWidth: 1.5,
    paddingVertical: 10,
    color: '#111111',
  },
  inTouchText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  submitButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
