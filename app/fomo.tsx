import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function FomoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [countdown, setCountdown] = useState(10);
  const [showX, setShowX] = useState(false);
  const [postVideo, setPostVideo] = useState(false);
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const shakeX = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowX(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const autoEnd = setTimeout(() => {
      setPostVideo(true);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(autoEnd);
    };
  }, []);

  useEffect(() => {
    if (postVideo) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [postVideo]);

  const handleDismiss = () => {
    setPostVideo(true);
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

  const handleChange = (text: string) => {
    setCode(text);
    if (text.length >= 4) {
      if (text.startsWith('K')) {
        router.push('/onboarding');
      } else {
        const next = failCount + 1;
        setFailCount(next);
        shakeInput();
      }
    }
  };

  if (postVideo) {
    return (
      <View style={styles.postVideoContainer}>
        <View style={styles.centerContent}>
          <Text style={styles.kLogoPost}>K</Text>

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
          style={[styles.joinLink, { bottom: insets.bottom + 32 }]}
          onPress={() => router.push('/join')}
        >
          <Text style={styles.joinLinkText}>Join</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <View style={styles.videoCenterContent}>
        <Text style={styles.kLogoVideo}>K</Text>
        <Text style={styles.kanextLabel}>KANEXT</Text>
      </View>

      {showX && (
        <Pressable
          style={[styles.dismissButton, { top: insets.top + 12 }]}
          onPress={handleDismiss}
        >
          <IconSymbol name="xmark" size={16} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kLogoVideo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  kanextLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  dismissButton: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postVideoContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kLogoPost: {
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
  joinLink: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  joinLinkText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});
