import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ContactType = 'Phone' | 'Email';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<ContactType>('Phone');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [contactFocused, setContactFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const contactRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const currentValue = step === 0 ? name : step === 1 ? contact : password;
  const isNextEnabled = currentValue.trim().length > 0;

  const handleNext = () => {
    if (!isNextEnabled) return;
    if (step < 2) {
      setStep(step + 1);
      setTimeout(() => {
        if (step === 0) contactRef.current?.focus();
        else if (step === 1) passwordRef.current?.focus();
      }, 50);
    } else {
      router.replace('/(tabs)/(main)');
    }
  };

  const renderDots = () => (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === step ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Your name</Text>
      <TextInput
        ref={nameRef}
        style={[
          styles.input,
          { borderColor: nameFocused ? '#111111' : '#E5E7EB' },
        ]}
        value={name}
        onChangeText={setName}
        onFocus={() => setNameFocused(true)}
        onBlur={() => setNameFocused(false)}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={handleNext}
        autoFocus
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Phone or email</Text>
      <View style={styles.pillRow}>
        {(['Phone', 'Email'] as ContactType[]).map((type) => (
          <Pressable
            key={type}
            style={[
              styles.pill,
              contactType === type ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => {
              setContactType(type);
              setContact('');
              contactRef.current?.focus();
            }}
          >
            <Text
              style={[
                styles.pillText,
                contactType === type ? styles.pillTextActive : styles.pillTextInactive,
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        ref={contactRef}
        style={[
          styles.input,
          { borderColor: contactFocused ? '#111111' : '#E5E7EB' },
        ]}
        value={contact}
        onChangeText={setContact}
        onFocus={() => setContactFocused(true)}
        onBlur={() => setContactFocused(false)}
        keyboardType={contactType === 'Phone' ? 'phone-pad' : 'email-address'}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={handleNext}
        autoFocus
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Create a password</Text>
      <View style={[styles.passwordRow, { borderColor: passwordFocused ? '#111111' : '#E5E7EB' }]}>
        <TextInput
          ref={passwordRef}
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          autoFocus
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <IconSymbol
            name={showPassword ? 'eye.slash' : 'eye'}
            size={20}
            color="#9CA3AF"
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {renderDots()}

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}

      <Pressable
        style={[
          styles.nextButton,
          { bottom: insets.bottom + 32, backgroundColor: isNextEnabled ? '#111111' : '#E5E7EB' },
        ]}
        onPress={handleNext}
        disabled={!isNextEnabled}
      >
        <Text style={[styles.nextButtonText, { color: isNextEnabled ? '#FFFFFF' : '#9CA3AF' }]}>
          {step === 2 ? 'Done' : 'Next'}
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#111111',
  },
  dotInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#111111',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  input: {
    fontSize: 22,
    borderBottomWidth: 1.5,
    paddingVertical: 10,
    color: '#111111',
    marginTop: 32,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#111111',
  },
  pillInactive: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: '#6B7280',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    marginTop: 32,
  },
  passwordInput: {
    flex: 1,
    fontSize: 22,
    paddingVertical: 10,
    color: '#111111',
  },
  eyeButton: {
    padding: 8,
  },
  nextButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
