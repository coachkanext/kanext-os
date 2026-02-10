/**
 * Speech Recognition Hook
 * ChatGPT-style voice mode: tap to activate, full-screen overlay, tap to stop.
 * Exposes voiceState ('idle' | 'listening' | 'processing') and audioLevel (0-1).
 * Gracefully degrades if the native module isn't available (e.g. not rebuilt).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';

type SpeechModuleType = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;

let SpeechModule: SpeechModuleType | null = null;
let nativeModuleAvailable = false;

try {
  const mod = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
  if (mod && typeof mod.requestPermissionsAsync === 'function') {
    SpeechModule = mod;
    nativeModuleAvailable = true;
  }
} catch {
  // Native module not available — hook will be a no-op
}

const UNAVAILABLE_MESSAGE =
  'Speech recognition is not available. Please rebuild the app with native modules (npx expo run:ios).';

export type VoiceState = 'idle' | 'listening' | 'processing';

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
}

export function useSpeechRecognition({ onTranscript }: UseSpeechRecognitionOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // Track whether we manually requested stop (vs silence/error)
  const stoppingRef = useRef(false);

  useEffect(() => {
    if (!SpeechModule || !nativeModuleAvailable) return;

    try {
      const startSub = SpeechModule.addListener('start', () => {
        setVoiceState('listening');
      });

      const endSub = SpeechModule.addListener('end', () => {
        // When speech ends, transition to idle (processing already handled final result)
        setVoiceState((prev) => {
          // If we were processing, the result handler will set idle
          // If we get end without going through processing, just go idle
          if (prev === 'listening') return 'idle';
          if (prev === 'processing') return 'idle';
          return 'idle';
        });
        setAudioLevel(0);
        stoppingRef.current = false;
      });

      const resultSub = SpeechModule.addListener('result', (event: any) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
          onTranscriptRef.current(transcript, event.isFinal);
        }
        // When we get a final result after stopping, transition processing → idle
        if (event.isFinal && stoppingRef.current) {
          setVoiceState('idle');
          setAudioLevel(0);
          stoppingRef.current = false;
        }
      });

      const errorSub = SpeechModule.addListener('error', (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error, event.message);
        }
        setVoiceState('idle');
        setAudioLevel(0);
        stoppingRef.current = false;
      });

      const volumeSub = SpeechModule.addListener('volumechange', (event: any) => {
        // Raw value range: -2 to 10 (below 0 = inaudible)
        const raw = event.value ?? 0;
        const normalized = Math.max(0, Math.min(1, (raw + 2) / 12));
        setAudioLevel(normalized);
      });

      return () => {
        startSub.remove();
        endSub.remove();
        resultSub.remove();
        errorSub.remove();
        volumeSub.remove();
      };
    } catch (e) {
      console.warn('Speech recognition listeners failed to attach:', e);
      nativeModuleAvailable = false;
      SpeechModule = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!SpeechModule || !nativeModuleAvailable) {
      Alert.alert('Unavailable', UNAVAILABLE_MESSAGE);
      return;
    }

    try {
      const { granted } = await SpeechModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Microphone and speech recognition permissions are needed for voice input. Please enable them in Settings.',
        );
        return;
      }

      stoppingRef.current = false;
      setVoiceState('listening');

      SpeechModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      });
    } catch (e) {
      console.warn('Speech recognition failed:', e);
      nativeModuleAvailable = false;
      SpeechModule = null;
      setVoiceState('idle');
      setAudioLevel(0);
      Alert.alert('Unavailable', UNAVAILABLE_MESSAGE);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!SpeechModule || !nativeModuleAvailable) return;
    try {
      stoppingRef.current = true;
      setVoiceState('processing');
      SpeechModule.stop();
    } catch (e) {
      console.warn('Speech recognition stop failed:', e);
      setVoiceState('idle');
      setAudioLevel(0);
      stoppingRef.current = false;
    }
  }, []);

  return { voiceState, audioLevel, startListening, stopListening };
}
