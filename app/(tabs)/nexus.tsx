/**
 * Nexus Screen
 * Universal reasoning surface - the primary intelligence interface.
 * Per spec: Nexus answers "What does this mean?" - reasoning only, no state mutation.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { NexusTopBar } from '@/components/nexus/nexus-top-bar';
import { ModeSelector } from '@/components/nexus/mode-selector';
import { ChatThread } from '@/components/nexus/chat-thread';
import { InputBar } from '@/components/nexus/input-bar';
import { ConversationsPanel } from '@/components/nexus/conversations-panel';
import { ProgramContextDrawer } from '@/components/nexus/program-context-drawer';
import { RosterOverlay } from '@/components/nexus/roster-overlay';
import { RecruitingBoardOverlay } from '@/components/nexus/recruiting-board-overlay';
import { NexusProvider, useNexusContext } from '@/context/nexus-context';
import { useAppContext } from '@/context/app-context';

function NexusScreenContent() {
  const { state: appState, setMode } = useAppContext();
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
  } = useNexusContext();

  // Local UI state
  const [modeSelectorVisible, setModeSelectorVisible] = useState(false);
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);

  const handleConversationsPress = useCallback(() => {
    openConversations();
  }, [openConversations]);

  const handleModePress = useCallback(() => {
    setModeSelectorVisible(true);
  }, []);

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

  const handleAddPersonPress = useCallback(() => {
    // Placeholder - would open person picker in full implementation
    console.log('Add person to chat');
  }, []);

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
        currentMode={appState.mode}
        onConversationsPress={handleConversationsPress}
        onModePress={handleModePress}
        onContextPress={handleContextPress}
        onBoardPress={handleBoardPress}
        onAddPersonPress={handleAddPersonPress}
      />

      {/* Chat Thread / Canvas */}
      <View style={styles.canvas}>
        <ChatThread
          messages={nexusState.messages}
          isLoading={nexusState.isLoading}
        />
      </View>

      {/* Input Bar */}
      <InputBar
        value={nexusState.inputText}
        onChangeText={setInputText}
        onSend={sendMessage}
        onMicPress={handleMicPress}
        disabled={!nexusState.activeConversationId}
        placeholder={
          nexusState.activeConversationId
            ? 'Ask anything...'
            : 'Select a conversation to start'
        }
      />

      {/* Mode Selector Modal */}
      <ModeSelector
        visible={modeSelectorVisible}
        currentMode={appState.mode}
        onSelect={setMode}
        onClose={() => setModeSelectorVisible(false)}
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
      <RecruitingBoardOverlay
        visible={nexusState.panelState === 'recruiting'}
        onClose={closePanel}
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
