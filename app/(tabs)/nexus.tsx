/**
 * Nexus Screen
 * Universal reasoning surface - the primary intelligence interface.
 * Per spec: Nexus answers "What does this mean?" - reasoning only, no state mutation.
 *
 * States:
 * - Locked: Not authenticated → dimmed background, no input
 * - Onboarding: Authenticated + new user → onboarding conversation
 * - Unlocked: Authenticated → full Nexus
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Keyboard, Pressable, Animated, Dimensions, View, Text } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { registerHeaderLeftAction } from '@/components/global-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { ChatThread } from '@/components/nexus/chat-thread';
import { InputBar } from '@/components/nexus/input-bar';
import { NexusLanding } from '@/components/nexus/nexus-landing';
import { ConversationsPanel } from '@/components/nexus/conversations-panel';
import { ProgramContextDrawer } from '@/components/nexus/program-context-drawer';
import { RosterOverlay } from '@/components/nexus/roster-overlay';
import { RecruitingOverlay } from '@/components/nexus/recruiting-overlay';
import { SimulationOverlay } from '@/components/nexus/simulation-overlay';
import { VoiceOverlay } from '@/components/nexus/voice-overlay';
import { InsertSheet, type InsertAction } from '@/components/nexus/new-conversation-sheet';
import { NexusProvider, useNexusContext } from '@/context/nexus-context';
import { useAuth } from '@/context/auth-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { sendToGPT } from '@/utils/openai';
import { useAppContext, useMode } from '@/context/app-context';
import { useRouter } from 'expo-router';
import { registerGameOpsHandler } from '@/utils/global-game-ops';
import * as Haptics from 'expo-haptics';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.7;


function NexusLockedState() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();
  const glyphColor = ModeColors[mode].nexusGlyphDim;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.lockedOverlay}>
        <View style={styles.lockedContent}>
          <Text style={[styles.lockedLogo, { color: glyphColor }]}>KX</Text>
          <Text style={[styles.lockedText, { color: colors.textTertiary }]}>
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
    openConversations,
    openContextDrawer,
    openRoster,
    openRecruitingBoard,
    closePanel,
    selectConversation,
    createNewConversation,
    createNewSim,
    setInputText,
    sendMessage,
    closeSimulation,
    getSimulation,
    saveSimulation,
    pinConversation,
    unpinConversation,
    renameConversation,
    archiveConversation,
    deleteConversation,
    addAssistantMessage,
    createNewGameOps,
    openNewConversationSheet,
    closeNewConversationSheet,
  } = useNexusContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { state: authState, completeOnboarding } = useAuth();
  const { state: appState } = useAppContext();
  const mode = useMode();

  // Local UI state
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);
  const onboardingTriggeredRef = useRef(false);

  // Onboarding: create a conversation and inject a GPT welcome message
  useEffect(() => {
    if (!authState.isNewUser || onboardingTriggeredRef.current) return;
    onboardingTriggeredRef.current = true;

    // Create a new conversation for onboarding
    createNewConversation();
  }, [authState.isNewUser, createNewConversation]);

  // Once the onboarding conversation is active, fetch GPT welcome
  useEffect(() => {
    if (!authState.isNewUser || !nexusState.activeConversationId) return;
    // Only fire once — check if we already have messages
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

  // Animation for content slide
  const contentSlideAnim = useRef(new Animated.Value(0)).current;
  const isPanelOpen = nexusState.panelState === 'conversations';

  useEffect(() => {
    Animated.timing(contentSlideAnim, {
      toValue: isPanelOpen ? PANEL_WIDTH : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isPanelOpen, contentSlideAnim]);

  const handleConversationsPress = useCallback(() => {
    openConversations();
  }, [openConversations]);

  // Register hamburger handler for GlobalHeader left slot
  useEffect(() => {
    registerHeaderLeftAction(handleConversationsPress);
    return () => registerHeaderLeftAction(null);
  }, [handleConversationsPress]);

  const handleContextPress = useCallback(() => {
    openContextDrawer();
  }, [openContextDrawer]);

  const handleBoardPress = useCallback(() => {
    // Toggle between roster and recruiting, or open roster by default
    if (nexusState.panelState === 'roster') {
      openRecruitingBoard();
    } else if (nexusState.panelState === 'recruiting') {
      openRoster();
    } else {
      openRoster();
    }
  }, [nexusState.panelState, openRoster, openRecruitingBoard]);

  const handleAvatarPress = useCallback(() => {
    // Close conversations panel first, then open avatar drawer
    closePanel();
    setAvatarDrawerVisible(true);
  }, [closePanel]);

  // Track text that existed before speech recognition started
  const preExistingTextRef = useRef('');

  const { voiceState, audioLevel, startListening, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string, isFinal: boolean) => {
      const prefix = preExistingTextRef.current;
      const separator = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      setInputText(prefix + separator + text);
    }, [setInputText]),
  });

  const handleMicPress = useCallback(() => {
    if (!nexusState.activeConversationId) {
      createNewConversation();
    }
    preExistingTextRef.current = nexusState.inputText;
    Keyboard.dismiss();
    startListening();
  }, [nexusState.activeConversationId, nexusState.inputText, createNewConversation, startListening]);

  const handleVoiceStop = useCallback(() => {
    stopListening();
  }, [stopListening]);

  // ── Game Ops ──
  const router = useRouter();

  // Register global handler for game-detail → Nexus navigation
  useEffect(() => {
    registerGameOpsHandler((gameId, opponent) => {
      createNewGameOps(gameId, opponent);
    });
    return () => registerGameOpsHandler(null);
  }, [createNewGameOps]);

  // Detect active game-ops conversation
  const activeConversation = nexusState.conversations.find(
    (c) => c.id === nexusState.activeConversationId
  );
  const isGameOps = activeConversation?.type === 'game-ops';
  const gameOpsConfig = activeConversation?.gameOpsConfig;


  // ── Insert Menu ("+") ──
  const handlePlusPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openNewConversationSheet();
  }, [openNewConversationSheet]);

  const handleInsertAction = useCallback((action: InsertAction) => {
    closeNewConversationSheet();
    // Placeholder — each action will be wired to real functionality later
    console.log('Insert action:', action);
  }, [closeNewConversationSheet]);

  // Game Ops is now conversational — user types naturally, GPT parses and asks clarifying questions.

  return (
    <ThemedView style={styles.container}>
      {/* Left Panel: Conversations */}
      <ConversationsPanel
        visible={nexusState.panelState === 'conversations'}
        onClose={closePanel}
        onNewChat={createNewConversation}
        onNewSim={createNewSim}
        onAvatarPress={handleAvatarPress}
        conversations={nexusState.conversations}
        activeConversationId={nexusState.activeConversationId}
        onSelectConversation={selectConversation}
        onPinConversation={pinConversation}
        onUnpinConversation={unpinConversation}
        onRenameConversation={renameConversation}
        onArchiveConversation={archiveConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* Main Content - slides when panel opens */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            backgroundColor: colors.background,
            transform: [{ translateX: contentSlideAnim }],
          },
        ]}
      >

        {/* Landing or Chat */}
        {!nexusState.activeConversationId ? (
          <>
            <Pressable
              style={styles.canvas}
              onPress={() => {
                Keyboard.dismiss();
                if (isPanelOpen) closePanel();
              }}
            >
              <NexusLanding mode={mode} />
            </Pressable>
            <InputBar
              value={nexusState.inputText}
              onChangeText={setInputText}
              onSend={sendMessage}
              onMicPress={handleMicPress}
              onAttachPress={handlePlusPress}
              isVoiceActive={voiceState !== 'idle'}
              onFocus={() => createNewConversation()}
              placeholder="Ask Nexus anything..."
            />
          </>
        ) : (
          <>
            {/* Game Ops Sub-header */}
            {isGameOps && gameOpsConfig && (
              <View style={[styles.gameOpsSubHeader, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.gameOpsSubHeaderText, { color: colors.textSecondary }]}>
                  KaNeXT vs {gameOpsConfig.opponent}
                </Text>
              </View>
            )}

            {/* Chat Thread / Canvas */}
            <Pressable
              style={styles.canvas}
              onPress={() => {
                Keyboard.dismiss();
                if (isPanelOpen) closePanel();
              }}
            >
              <ChatThread
                messages={nexusState.messages}
                isLoading={nexusState.isLoading}
                conversation={nexusState.conversations.find(c => c.id === nexusState.activeConversationId) ?? null}
                mode={mode}
              />
            </Pressable>

            {/* Input Bar */}
            <InputBar
              value={nexusState.inputText}
              onChangeText={setInputText}
              onSend={sendMessage}
              onMicPress={handleMicPress}
              onAttachPress={handlePlusPress}
              isVoiceActive={voiceState !== 'idle'}
              onFocus={() => {
                if (!nexusState.activeConversationId) createNewConversation();
              }}
              placeholder="Ask Nexus"
              contextPill={isGameOps ? { icon: 'basketball.fill', label: 'Game Ops' } : null}
            />
          </>
        )}
      </Animated.View>

      {/* Right Drawer: Program Context */}
      <ProgramContextDrawer
        visible={nexusState.panelState === 'context'}
        onClose={closePanel}
      />

      {/* Right Overlay: Roster */}
      <RosterOverlay
        visible={nexusState.panelState === 'roster'}
        onClose={closePanel}
      />

      {/* Right Overlay: Recruiting Board */}
      <RecruitingOverlay
        visible={nexusState.panelState === 'recruiting'}
        onClose={closePanel}
        onOpenRosterSandbox={openRoster}
      />

      {/* Simulation Overlay */}
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

      {/* Voice Mode Overlay */}
      <VoiceOverlay
        visible={voiceState !== 'idle'}
        voiceState={voiceState}
        audioLevel={audioLevel}
        onStop={handleVoiceStop}
      />

      {/* Avatar Drawer (opens from conversations panel) */}
      <AvatarDrawer
        visible={avatarDrawerVisible}
        onClose={() => setAvatarDrawerVisible(false)}
      />

      {/* Insert Sheet (plus button tap) */}
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

  // Show locked state if not authenticated
  if (!authState.isAuthenticated) {
    return <NexusLockedState />;
  }

  return (
    <NexusProvider>
      <NexusScreenContent />
    </NexusProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
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
  },
  // Game Ops
  gameOpsSubHeader: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  gameOpsSubHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gameOpsChips: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.lg,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  starterScroll: {
    maxHeight: 200,
  },
  starterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: '47%',
    flexGrow: 1,
  },
  playerChipName: {
    fontSize: 15,
    fontWeight: '600',
  },
  starterCount: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
