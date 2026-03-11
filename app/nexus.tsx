/**
 * Nexus Screen — Single Page Conversation
 * Program-scoped intelligence layer. Universal — no mode filtering.
 * Conversational only — recommends, analyzes, compares, evaluates, presents.
 * Does NOT execute actions directly. All writes follow: Propose -> Validate -> Confirm -> Commit.
 *
 * Layout: Single screen, 3 zones:
 *   Zone 1 — Top Bar (sticky): "Nexus 1.0" title, "+" button
 *   Zone 2 — Thread Area: Active conversation or faint Nexus logo
 *   Zone 3 — Input Bar (sticky bottom): universal input bar with plus button
 *
 * States:
 * - Locked: Not authenticated -> dimmed background, no input
 * - Fresh: 15+ min idle or first use -> faint logo + input bar
 *          Logo stays visible when tapping input, keyboard opening, and typing.
 *          Logo fades ONLY when user sends first message.
 * - Chat: Active conversation (within 15 min) -> thread + input bar
 *
 * Side panel (swipe right): History, Spaces, Threads, Voice Settings,
 * Nexus Preferences, Settings. No pages, no dots, no swiping between pages.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, Keyboard, Pressable, View, Text, TextInput, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ModeColors } from '@/constants/theme';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { ChatThread } from '@/components/nexus/chat-thread';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NexusLanding } from '@/components/nexus/nexus-landing';
import { SimulationOverlay } from '@/components/nexus/simulation-overlay';
import { VoiceOverlay } from '@/components/nexus/voice-overlay';
import { InsertSheet, type InsertAction } from '@/components/nexus/new-conversation-sheet';
import { NexusPageTopBar } from '@/components/nexus/nexus-page-top-bar';
import { NexusProvider, useNexusContext } from '@/context/nexus-context';
import { useAuth } from '@/context/auth-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { sendToGPT } from '@/utils/openai';
import { useAppContext, useMode } from '@/context/app-context';
import { registerGameOpsHandler } from '@/utils/global-game-ops';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

import * as Haptics from 'expo-haptics';

const IDLE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes


function NexusLockedState() {
  const C = useColors();
  const mode = useMode();
  const glyphColor = ModeColors[mode].nexusGlyphDim;
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.lockedOverlay}>
        <View style={styles.lockedContent}>
          <Text style={[styles.lockedLogo, { color: glyphColor }]}>KX</Text>
          <Text style={styles.lockedText}>
            Sign in to unlock Nexus
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}

function NexusScreenContent() {
  const {
    state: nexusState,
    createNewConversation,
    setInputText,
    sendMessage,
    closeSimulation,
    getSimulation,
    saveSimulation,
    addAssistantMessage,
    createNewGameOps,
    openNewConversationSheet,
    closeNewConversationSheet,
  } = useNexusContext();

  const { state: authState, completeOnboarding } = useAuth();
  const { state: appState } = useAppContext();
  const mode = useMode();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  // ── 15-minute threshold logic ──
  const isIdle = nexusState.lastInteractionAt === null
    || (Date.now() - nexusState.lastInteractionAt) > IDLE_THRESHOLD_MS;

  // ── Keyboard height tracking ──
  const footerClearance = (insets.bottom || 12) + 49;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);
  const keyboardUp = keyboardHeight > 0;
  const inputBottomPadding = keyboardUp ? keyboardHeight : footerClearance;

  // Logo fade: only triggered when user sends first message, not on typing
  const [logoFading, setLogoFading] = useState(false);

  // ── Mic / Send crossfade ──
  const hasText = nexusState.inputText.trim().length > 0;
  const crossfade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(crossfade, {
      toValue: hasText ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [hasText]);

  // Show landing logo when:
  // - No active conversation at all, OR
  // - Active conversation but no messages yet (fresh from "+" tap), OR
  // - Idle for 15+ minutes
  const showLanding = isIdle
    || !nexusState.activeConversationId
    || nexusState.messages.length === 0;

  // Local UI state
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);
  const onboardingTriggeredRef = useRef(false);

  // Onboarding: create a conversation and inject a GPT welcome message
  useEffect(() => {
    if (!authState.isNewUser || onboardingTriggeredRef.current) return;
    onboardingTriggeredRef.current = true;
    createNewConversation();
  }, [authState.isNewUser, createNewConversation]);

  // Once the onboarding conversation is active, fetch GPT welcome
  useEffect(() => {
    if (!authState.isNewUser || !nexusState.activeConversationId) return;
    if (nexusState.messages.length > 0) return;

    const convId = nexusState.activeConversationId;

    (async () => {
      try {
        const welcomeText = await sendToGPT({
          messages: [],
          context: {
            mode: appState.mode,
            organization: appState.organization,
            operatingRole: appState.operatingRole,
            program: appState.program,
            cycleName: appState.cycle?.name ?? null,
            isOnboarding: true,
          },
        });

        addAssistantMessage(convId, welcomeText);
        await completeOnboarding();
      } catch {
        addAssistantMessage(convId, 'Welcome to Nexus. How can I help you today?');
        await completeOnboarding();
      }
    })();
  }, [authState.isNewUser, nexusState.activeConversationId, nexusState.messages.length, appState, addAssistantMessage, completeOnboarding]);

  // Track text that existed before speech recognition started
  const preExistingTextRef = useRef('');

  const { voiceState, audioLevel, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string) => {
      const prefix = preExistingTextRef.current;
      const separator = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      setInputText(prefix + separator + text);
    }, [setInputText]),
  });

  const handleVoiceStop = useCallback(() => {
    stopListening();
  }, [stopListening]);

  // ── Game Ops ──
  useEffect(() => {
    registerGameOpsHandler((gameId, opponent) => {
      createNewGameOps(gameId, opponent);
    });
    return () => registerGameOpsHandler(null);
  }, [createNewGameOps]);

  // ── Top bar "+" handler: clear current conversation, start fresh ──
  const handleNewConversation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogoFading(false);
    createNewConversation();
  }, [createNewConversation]);

  // ── Input bar "+" handler: attachment menu ──
  const handlePlusPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openNewConversationSheet();
  }, [openNewConversationSheet]);

  const handleInsertAction = useCallback((action: InsertAction) => {
    closeNewConversationSheet();
    console.log('Insert action:', action);
  }, [closeNewConversationSheet]);

  // ── Send handler: logo fades only on first message send, keyboard auto-dismisses ──
  const handleSend = useCallback(() => {
    if (!nexusState.inputText.trim()) return;

    Keyboard.dismiss();

    if (!nexusState.activeConversationId) {
      // First message ever — fade logo, create conversation, then send
      setLogoFading(true);
      createNewConversation();
      setTimeout(sendMessage, 50);
    } else if (nexusState.messages.length === 0) {
      // Conversation exists but no messages yet (e.g. after "+" tap) — fade logo
      setLogoFading(true);
      setTimeout(sendMessage, 50);
    } else {
      sendMessage();
    }
  }, [nexusState.inputText, nexusState.activeConversationId, nexusState.messages.length, createNewConversation, sendMessage]);

  // ── Input text handler: NO logo fade on typing ──
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, [setInputText]);

  return (
    <ThemedView style={styles.container}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Top Bar */}
        <NexusPageTopBar onPlusPress={handleNewConversation} />

        {/* Landing or Chat — flex: 1, fills remaining space */}
        {showLanding ? (
          <Pressable
            style={styles.canvas}
            onPress={() => Keyboard.dismiss()}
          >
            <NexusLanding fadeOut={logoFading} />
          </Pressable>
        ) : (
          <Pressable
            style={styles.canvas}
            onPress={() => Keyboard.dismiss()}
          >
            <ChatThread
              messages={nexusState.messages}
              isLoading={nexusState.isLoading}
              conversation={nexusState.conversations.find(c => c.id === nexusState.activeConversationId) ?? null}
              mode={mode}
            />
          </Pressable>
        )}

        {/* Input Bar — paddingBottom tracks keyboard height directly */}
        <View style={[styles.inputBarWrap, { paddingBottom: inputBottomPadding }]}>
          <View style={styles.inputRow}>
            {/* Separated + circle */}
            <Pressable
              style={({ pressed }) => [styles.plusCircle, pressed && { opacity: 0.6 }]}
              onPress={handlePlusPress}
            >
              <IconSymbol name="plus" size={18} color={C.label} />
            </Pressable>

            {/* Text capsule */}
            <View style={styles.capsule}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask Nexus..."
                placeholderTextColor={C.secondary}
                value={nexusState.inputText}
                onChangeText={handleInputChange}
                multiline
                maxLength={4000}
                returnKeyType="default"
                blurOnSubmit={false}
                autoCapitalize="sentences"
                autoCorrect
                selectionColor={C.label}
              />

              {/* Mic / Send crossfade */}
              <View style={styles.actionWrap}>
                <Animated.View
                  style={[styles.actionLayer, { opacity: Animated.subtract(1, crossfade) }]}
                  pointerEvents={hasText ? 'none' : 'auto'}
                >
                  <View style={styles.micBtn}>
                    <IconSymbol name="mic.fill" size={18} color={C.secondary} />
                  </View>
                </Animated.View>
                <Animated.View
                  style={[styles.actionLayer, { opacity: crossfade }]}
                  pointerEvents={hasText ? 'auto' : 'none'}
                >
                  <Pressable style={styles.sendBtn} onPress={handleSend}>
                    <IconSymbol name="arrow.up" size={16} weight="semibold" color={C.bg} />
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Overlays at screen level */}
      <SimulationOverlay
        simulation={
          nexusState.activeSimulationId
            ? getSimulation(nexusState.activeSimulationId) ?? null
            : null
        }
        visible={nexusState.panelState === 'simulation'}
        onClose={closeSimulation}
        onSave={(sim) => saveSimulation(sim)}
        onRerun={(sim) => console.log('Rerun simulation:', sim.id)}
      />

      <VoiceOverlay
        visible={voiceState !== 'idle'}
        voiceState={voiceState}
        audioLevel={audioLevel}
        onStop={handleVoiceStop}
      />

      <AvatarDrawer
        visible={avatarDrawerVisible}
        onClose={() => setAvatarDrawerVisible(false)}
      />

      <InsertSheet
        visible={nexusState.newConversationSheetOpen}
        onClose={closeNewConversationSheet}
        onSelectAction={handleInsertAction}
      />
    </ThemedView>
  );
}

export default function NexusScreen() {
  const { state: authState } = useAuth();
  const mode = useMode();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  // Show locked state if not authenticated
  if (!authState.isAuthenticated) {
    return <NexusLockedState />;
  }

  // Coming soon for unreleased modes
  if (mode === 'church' || mode === 'education' || mode === 'competition') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '800', lineHeight: 40, color: C.label }}>Coming Soon</Text>
        <Text style={{ fontSize: 15, color: C.muted, textAlign: 'center', marginTop: 8 }}>
          This mode is under development.{'\n'}Stay tuned for updates.
        </Text>
      </ThemedView>
    );
  }

  return (
    <NexusProvider>
      <NexusScreenContent />
    </NexusProvider>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  canvas: {
    flex: 1,
  },
  inputBarWrap: {
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.separator,
  },
  capsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: C.surface,
    borderRadius: 24,
    minHeight: 46,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: C.label,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  actionWrap: {
    width: 36,
    height: 36,
  },
  actionLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.label,
  },
  lockedOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedContent: {
    alignItems: 'center',
    opacity: 0.4,
  },
  lockedLogo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 15,
    fontWeight: '500',
    color: C.muted,
  },
});
