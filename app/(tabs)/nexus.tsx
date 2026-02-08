/**
 * Nexus Screen
 * Universal reasoning surface - the primary intelligence interface.
 * Per spec: Nexus answers "What does this mean?" - reasoning only, no state mutation.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Keyboard, Pressable, Animated, Dimensions } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { NexusTopBar } from '@/components/nexus/nexus-top-bar';
import { ChatThread } from '@/components/nexus/chat-thread';
import { InputBar } from '@/components/nexus/input-bar';
import { ConversationsPanel } from '@/components/nexus/conversations-panel';
import { ProgramContextDrawer } from '@/components/nexus/program-context-drawer';
import { RosterOverlay } from '@/components/nexus/roster-overlay';
import { RecruitingOverlay } from '@/components/nexus/recruiting-overlay';
import { SimulationOverlay } from '@/components/nexus/simulation-overlay';
import { NexusProvider, useNexusContext } from '@/context/nexus-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.7;

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
  } = useNexusContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Local UI state
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);

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

  const { isListening, toggleListening } = useSpeechRecognition({
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
    if (!isListening) {
      preExistingTextRef.current = nexusState.inputText;
    }
    toggleListening();
  }, [nexusState.activeConversationId, nexusState.inputText, isListening, createNewConversation, toggleListening]);

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
        {/* Top Bar */}
        <NexusTopBar
          onConversationsPress={handleConversationsPress}
          onContextPress={handleContextPress}
          onBoardPress={handleBoardPress}
        />

        {/* Chat Thread / Canvas - tap to dismiss keyboard and close panel */}
        <Pressable
          style={styles.canvas}
          onPress={() => {
            Keyboard.dismiss();
            if (isPanelOpen) {
              closePanel();
            }
          }}
        >
          <ChatThread
            messages={nexusState.messages}
            isLoading={nexusState.isLoading}
            conversation={nexusState.conversations.find(c => c.id === nexusState.activeConversationId) ?? null}
          />
        </Pressable>

        {/* Input Bar */}
        <InputBar
          value={nexusState.inputText}
          onChangeText={setInputText}
          onSend={sendMessage}
          onMicPress={handleMicPress}
          isListening={isListening}
          onFocus={() => {
            // Create a new conversation if none is active
            if (!nexusState.activeConversationId) {
              createNewConversation();
            }
          }}
          placeholder="Ask Nexus"
        />
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

      {/* Avatar Drawer (opens from conversations panel) */}
      <AvatarDrawer
        visible={avatarDrawerVisible}
        onClose={() => setAvatarDrawerVisible(false)}
      />
    </ThemedView>
  );
}

export default function NexusScreen() {
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
});
