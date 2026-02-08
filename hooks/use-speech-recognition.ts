/**
 * Speech Recognition Hook
 * Encapsulates expo-speech-recognition for ChatGPT-style voice input.
 */

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
}

export function useSpeechRecognition({ onTranscript }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      onTranscriptRef.current(transcript, event.isFinal);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    // no-speech is normal when user doesn't say anything — just stop silently
    if (event.error !== 'no-speech') {
      console.warn('Speech recognition error:', event.error, event.message);
    }
  });

  const toggleListening = useCallback(async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permissions Required',
        'Microphone and speech recognition permissions are needed for voice input. Please enable them in Settings.',
      );
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
    });
  }, [isListening]);

  return { isListening, toggleListening };
}
