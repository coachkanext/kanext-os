import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const kScale = useRef(new Animated.Value(1)).current;
  const kColor = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pulseK = (onDone?: () => void) => {
    kColor.setValue(0);
    Animated.sequence([
      Animated.timing(kScale, { toValue: 1.05, duration: 120, useNativeDriver: true }),
      Animated.timing(kScale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start(onDone);
    Animated.sequence([
      Animated.timing(kColor, { toValue: 1, duration: 100, useNativeDriver: false }),
      Animated.timing(kColor, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const VALID_CODE = 'KX2026';

  const handleChange = (text: string) => {
    const upper = text.toUpperCase();
    setCode(upper);
    if (upper.length >= VALID_CODE.length) {
      if (upper === VALID_CODE) {
        pulseK(() => {
          router.push('/onboarding');
        });
      } else {
        const next = failCount + 1;
        setFailCount(next);
        shakeInput();
        if (next >= 2) {
          setTimeout(() => router.push('/fomo'), 400);
        }
      }
    }
  };

  const kColorInterpolated = kColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#111111', '#1A1714'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Animated.Text
          style={[
            styles.kLogo,
            { transform: [{ scale: kScale }], color: kColorInterpolated },
          ]}
        >
          K
        </Animated.Text>

        <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
          <TextInput
            ref={inputRef}
            style={[
              styles.codeInput,
              { borderColor: focused ? '#111111' : '#E5E7EB' },
            ]}
            value={code}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            maxLength={12}
          />
        </Animated.View>
      </View>

      <Pressable
        style={[styles.loginLink, { bottom: insets.bottom + 32 }]}
        onPress={() => router.push('/onboarding')}
      >
        <Text style={styles.loginLinkText}>Log in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kLogo: {
    fontSize: 96,
    fontWeight: '900',
    color: '#111111',
    lineHeight: 100,
  },
  codeInput: {
    width: 240,
    textAlign: 'center',
    fontSize: 22,
    borderBottomWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    color: '#111111',
    marginTop: 32,
  },
  loginLink: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});
