/**
 * Nexus Screen
 * Universal reasoning surface - the primary intelligence interface.
 * Per spec: Nexus answers "What does this mean?" - reasoning only, no state mutation.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Keyboard, Pressable } from 'react-native';

import { ThemedView } from '@/components/themed-view';
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
    setInputText,
    sendMessage,
    closeSimulation,
    getSimulation,
    saveSimulation,
  } = useNexusContext();

  // Local UI state
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);

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

  const handleMicPress = useCallback(() => {
    // Placeholder - would start voice input in full implementation
    console.log('Voice input');
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Top Bar */}
      <NexusTopBar
        onConversationsPress={handleConversationsPress}
        onContextPress={handleContextPress}
        onBoardPress={handleBoardPress}
      />

      {/* Chat Thread / Canvas - tap to dismiss keyboard */}
      <Pressable style={styles.canvas} onPress={Keyboard.dismiss}>
        <ChatThread
          messages={nexusState.messages}
          isLoading={nexusState.isLoading}
        />
      </Pressable>

      {/* Input Bar */}
      <InputBar
        value={nexusState.inputText}
        onChangeText={setInputText}
        onSend={sendMessage}
        onMicPress={handleMicPress}
        onFocus={() => {
          // Create a new conversation if none is active
          if (!nexusState.activeConversationId) {
            createNewConversation();
          }
        }}
        placeholder="Ask Nexus"
      />

      {/* Left Panel: Conversations */}
      <ConversationsPanel
        visible={nexusState.panelState === 'conversations'}
        onClose={closePanel}
        conversations={nexusState.conversations}
        activeConversationId={nexusState.activeConversationId}
        onConversationSelect={selectConversation}
        onNewChat={createNewConversation}
        onAvatarPress={handleAvatarPress}
      />

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
  canvas: {
    flex: 1,
  },
});
