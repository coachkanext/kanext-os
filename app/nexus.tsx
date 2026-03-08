/**
 * Nexus Screen — Full Page
 * Program-scoped intelligence layer.
 * Conversational only — recommends, analyzes, compares, evaluates, presents.
 * Does NOT execute actions directly. All writes follow: Propose → Validate → Confirm → Commit.
 *
 * Layout: Single screen, 3 zones:
 *   Zone 1 — Top Bar (sticky): Hamburger → Sidebar, "Nexus" title, Context Chip
 *   Zone 2 — Thread Area: Active conversation with inline embeds
 *   Zone 3 — Input Bar (sticky bottom): universal input bar with plus button
 *
 * States:
 * - Locked: Not authenticated → dimmed background, no input
 * - Empty: 15+ min idle or first use → faint logo + input bar
 * - Chat: Active conversation (within 15 min) → thread + input bar
 *
 * 15 Minute Threshold:
 * - Tracks lastInteractionAt timestamp (message sent or received)
 * - If >15 min since last interaction → show empty state (logo + input)
 * - If ≤15 min → resume previous conversation
 * - Previous conversations always preserved in history
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Keyboard, Pressable, Animated, Dimensions, View, Text } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { registerHeaderLeftAction } from '@/components/global-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { ChatThread } from '@/components/nexus/chat-thread';
import { UniversalInputBar } from '@/components/ui/universal-input-bar';
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

const IDLE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes


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

  // ── 15-minute threshold logic ──
  const isIdle = (() => {
    if (nexusState.lastInteractionAt === null) return true;
    return (Date.now() - nexusState.lastInteractionAt) > IDLE_THRESHOLD_MS;
  })();

  // When idle, show empty state (no active conversation view)
  // When not idle and there's an active conversation, show it
  const showEmptyState = isIdle && !nexusState.activeConversationId;
  const showResumedConvo = !isIdle && nexusState.activeConversationId;

  // Track whether user has started typing (to fade out logo)
  const [logoFading, setLogoFading] = useState(false);

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

  // ── Input handlers ──
  const handleInputFocus = useCallback(() => {
    if (!nexusState.activeConversationId) {
      setLogoFading(true);
      // Create conversation after fade starts
      setTimeout(() => createNewConversation(), 200);
    }
  }, [nexusState.activeConversationId, createNewConversation]);

  const handleInputChange = useCallback((text: string) => {
    if (!nexusState.activeConversationId && text.length > 0 && !logoFading) {
      setLogoFading(true);
      setTimeout(() => createNewConversation(), 200);
    }
    setInputText(text);
  }, [nexusState.activeConversationId, logoFading, setInputText, createNewConversation]);

  // Determine whether to show landing or conversation
  const showLanding = !nexusState.activeConversationId;

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
            backgroundColor: '#000000',
            transform: [{ translateX: contentSlideAnim }],
          },
        ]}
      >

        {/* Landing or Chat */}
        {showLanding ? (
          <>
            <Pressable
              style={styles.canvas}
              onPress={() => {
                Keyboard.dismiss();
                if (isPanelOpen) closePanel();
              }}
            >
              <NexusLanding fadeOut={logoFading} />
            </Pressable>
            <View style={styles.inputBarWrap}>
              <UniversalInputBar
                showPlus={true}
                placeholder="Ask Nexus..."
                value={nexusState.inputText}
                onChangeText={handleInputChange}
                onSend={sendMessage}
                onAttachPress={handlePlusPress}
              />
            </View>
          </>
        ) : (
          <>
            {/* Game Ops Sub-header */}
            {isGameOps && gameOpsConfig && (
              <View style={[styles.gameOpsSubHeader, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.gameOpsSubHeaderText, { color: colors.textSecondary }]}>
                  Carroll vs {gameOpsConfig.opponent}
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
            <View style={styles.inputBarWrap}>
              <UniversalInputBar
                showPlus={true}
                placeholder="Ask Nexus..."
                value={nexusState.inputText}
                onChangeText={(text) => setInputText(text)}
                onSend={sendMessage}
                onAttachPress={handlePlusPress}
              />
            </View>
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
  const mode = useMode();

  // Show locked state if not authenticated
  if (!authState.isAuthenticated) {
    return <NexusLockedState />;
  }

  // Coming soon for unreleased modes
  if (mode === 'church' || mode === 'education' || mode === 'competition') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '800', lineHeight: 40, color: '#fff' }}>Coming Soon</Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContent: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
  },
  inputBarWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
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
});
