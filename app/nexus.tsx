/**
 * Nexus Screen — Home only.
 * Landing logo + input bar + suggest cards + sidebar panel.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Keyboard,
  PanResponder,
  Pressable,
  View,
  Text,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

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
import { ConversationsPanel } from '@/components/nexus/conversations-panel';
import { NexusProvider, useNexusContext } from '@/context/nexus-context';
import { useAuth } from '@/context/auth-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAppContext, useMode } from '@/context/app-context';
import { registerGameOpsHandler } from '@/utils/global-game-ops';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const IDLE_THRESHOLD_MS = 15 * 60 * 1000;

// ── Suggest cards (home state) ──
const SUGGEST_CARDS: Record<string, { title: string; sub: string }[]> = {
  sports: [
    { title: 'Evaluate a recruit',   sub: 'Pull film, academics, and KR score'      },
    { title: 'Draft practice plan',  sub: 'Generate weekly schedule from template'  },
    { title: 'Analyze game film',    sub: 'Break down opponent tendencies'          },
    { title: 'Donor outreach',       sub: 'Draft personalized outreach messages'    },
  ],
  business: [
    { title: 'Summarize pipeline',   sub: 'Review open deals and next steps'        },
    { title: 'Draft a proposal',     sub: 'Generate a client-ready proposal'        },
    { title: 'Analyze revenue',      sub: 'Break down monthly performance'          },
    { title: 'Outreach sequence',    sub: 'Write a personalized lead cadence'       },
  ],
  education: [
    { title: 'Review student progress', sub: 'Summarize academic standing'         },
    { title: 'Draft lesson plan',       sub: 'Generate week plan from curriculum'  },
    { title: 'Admission evaluation',    sub: 'Score applicant fit and readiness'   },
    { title: 'Parent communication',    sub: 'Draft a personalized update email'   },
  ],
  community: [
    { title: 'Plan an event',        sub: 'Generate event checklist and timeline'  },
    { title: 'Draft an announcement', sub: 'Write a community-wide message'        },
    { title: 'Outreach campaign',    sub: 'Build a volunteer recruitment plan'     },
    { title: 'Summarize engagement', sub: 'Review member activity and growth'      },
  ],
  personal: [
    { title: 'Plan my week',         sub: 'Organize tasks and priorities'          },
    { title: 'Draft a message',      sub: 'Write something for any occasion'       },
    { title: 'Research a topic',     sub: 'Get a clear, concise briefing'          },
    { title: 'Set a goal',           sub: 'Build an actionable plan to hit it'     },
  ],
};

// ─────────────────────────────────────────────
// Locked state
// ─────────────────────────────────────────────
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
          <Text style={styles.lockedText}>Sign in to unlock Nexus</Text>
        </View>
      </View>
    </ThemedView>
  );
}

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────
function NexusScreenContent() {
  const {
    state: nexusState,
    createNewConversation,
    selectConversation,
    setInputText,
    sendMessage,
    closeSimulation,
    getSimulation,
    saveSimulation,
    createNewGameOps,
    openNewConversationSheet,
    closeNewConversationSheet,
    pinConversation,
    unpinConversation,
    renameConversation,
    archiveConversation,
    deleteConversation,
  } = useNexusContext();

  const { state: appState } = useAppContext();
  const mode = useMode();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  // ── Swipe to open/close sidebar ──
  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);
  const swipePanResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
      if (Math.abs(dy) > Math.abs(dx)) return false;
      if (dx > 8 && evt.nativeEvent.pageX < 44) return true;
      if (dx < -8 && sidebarOpenRef.current) return true;
      return false;
    },
    onPanResponderRelease: (_, { dx, vx }) => {
      if (dx > 50 || vx > 0.5) setSidebarOpen(true);
      else if (dx < -50 || vx < -0.5) setSidebarOpen(false);
    },
  }), []);

  // ── 15-min idle ──
  const isIdle =
    nexusState.lastInteractionAt === null ||
    Date.now() - nexusState.lastInteractionAt > IDLE_THRESHOLD_MS;

  // ── Keyboard height ──
  const footerClearance = (insets.bottom || 0) + 49 + 4;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => { show.remove(); hide.remove(); };
  }, []);
  const keyboardUp = keyboardHeight > 0;
  const inputBottomPadding = keyboardUp ? keyboardHeight : footerClearance;

  const hasText = nexusState.inputText.trim().length > 0;
  const showLanding =
    isIdle || !nexusState.activeConversationId || nexusState.messages.length === 0;

  // ── Game Ops ──
  useEffect(() => {
    registerGameOpsHandler((gameId, opponent) => createNewGameOps(gameId, opponent));
    return () => registerGameOpsHandler(null);
  }, [createNewGameOps]);

  // ── Voice ──
  const preExistingTextRef = useRef('');
  const { voiceState, audioLevel, startListening, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string) => {
      const prefix = preExistingTextRef.current;
      const sep = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      setInputText(prefix + sep + text);
    }, [setInputText]),
  });
  const handleVoiceStop = useCallback(() => stopListening(), [stopListening]);
  const handleMicPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    preExistingTextRef.current = nexusState.inputText;
    startListening();
  }, [nexusState.inputText, startListening]);
  const handleWaveformPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    preExistingTextRef.current = nexusState.inputText;
    startListening();
  }, [nexusState.inputText, startListening]);

  // ── Handlers ──
  const handleNewConversation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createNewConversation();
  }, [createNewConversation]);

  const handlePlusPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachMenuOpen((v) => !v);
  }, []);

  const handleInsertAction = useCallback((action: InsertAction) => {
    closeNewConversationSheet();
    console.log('Insert action:', action);
  }, [closeNewConversationSheet]);

  const handleSend = useCallback(() => {
    if (!nexusState.inputText.trim()) return;
    Keyboard.dismiss();
    if (!nexusState.activeConversationId) {
      createNewConversation();
      setTimeout(sendMessage, 50);
    } else if (nexusState.messages.length === 0) {
      setTimeout(sendMessage, 50);
    } else {
      sendMessage();
    }
  }, [nexusState.inputText, nexusState.activeConversationId, nexusState.messages.length, createNewConversation, sendMessage]);

  const handleSuggestionTap = useCallback((title: string) => {
    setInputText(title);
    if (!nexusState.activeConversationId) {
      createNewConversation();
      setTimeout(sendMessage, 80);
    } else {
      setTimeout(sendMessage, 50);
    }
  }, [nexusState.activeConversationId, setInputText, createNewConversation, sendMessage]);

  const handleSelectConversation = useCallback((id: string) => {
    selectConversation(id);
    setSidebarOpen(false);
  }, [selectConversation]);

  const handleAvatarPress = useCallback(() => {
    setSidebarOpen(false);
    router.navigate('/settings' as any);
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <View style={{ flex: 1, paddingTop: insets.top }} {...swipePanResponder.panHandlers}>

        {/* ── Top Bar ── */}
        <NexusPageTopBar
          view="home"
          onHamburger={() => setSidebarOpen(true)}
          onNewChat={handleNewConversation}
          onDropdownAction={(action) => console.log('dropdown:', action)}
        />

        {/* ── Canvas ── */}
        <View style={styles.canvas}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => Keyboard.dismiss()}>
            {showLanding ? (
              <NexusLanding />
            ) : (
              <ChatThread
                messages={nexusState.messages}
                isLoading={nexusState.isLoading}
                conversation={
                  nexusState.conversations.find((c) => c.id === nexusState.activeConversationId) ?? null
                }
                mode={mode}
              />
            )}
          </Pressable>
        </View>

        {/* ── Suggest Cards (landing only) ── */}
        {showLanding && !appState.organization && (
          <View style={styles.orgSuggestRow}>
            <Pressable
              style={({ pressed }) => [styles.orgSuggestCard, { borderColor: C.divider }, pressed && { opacity: 0.7 }]}
              onPress={() => handleSuggestionTap('Create an organization')}
            >
              <Text style={[styles.orgSuggestTitle, { color: C.label }]}>Create an organization</Text>
              <Text style={[styles.orgSuggestDesc, { color: C.secondary }]}>Start your team, church, or company</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.orgSuggestCard, { borderColor: C.divider }, pressed && { opacity: 0.7 }]}
              onPress={() => handleSuggestionTap('Join an organization')}
            >
              <Text style={[styles.orgSuggestTitle, { color: C.label }]}>Join an organization</Text>
              <Text style={[styles.orgSuggestDesc, { color: C.secondary }]}>Enter an invite code</Text>
            </Pressable>
          </View>
        )}
        {showLanding && appState.organization && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestRow}
            style={styles.suggestScroll}
          >
            {(SUGGEST_CARDS[mode] ?? SUGGEST_CARDS.sports).map((card) => (
              <Pressable
                key={card.title}
                style={({ pressed }) => [styles.suggestCard, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => handleSuggestionTap(card.title)}
              >
                <Text style={styles.suggestTitle}>{card.title}</Text>
                <Text style={styles.suggestSub}>{card.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Attach Menu ── */}
        {attachMenuOpen && (
          <>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setAttachMenuOpen(false)} />
            <View style={[styles.attachMenu, { bottom: inputBottomPadding + 52, backgroundColor: C.bg }]}>
              {([
                { label: 'Camera', icon: 'camera' },
                { label: 'Photos', icon: 'photo.on.rectangle' },
                { label: 'Files',  icon: 'doc' },
              ] as const).map((item) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [styles.attachMenuItem, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => setAttachMenuOpen(false)}
                >
                  <View style={[styles.attachMenuIcon, { backgroundColor: C.separator }]}>
                    <IconSymbol name={item.icon} size={20} color={C.label} />
                  </View>
                  <Text style={[styles.attachMenuLabel, { color: C.label }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ── Input Bar ── */}
        <View style={[styles.inputBarWrap, { paddingBottom: inputBottomPadding }]}>
          <View style={styles.inputBarRow}>
            <Pressable
              style={({ pressed }) => [styles.composerPlusOuter, { opacity: pressed ? 0.6 : 1 }]}
              onPress={handlePlusPress}
            >
              <IconSymbol name="plus" size={20} color={C.secondary} />
            </Pressable>

            <View style={[styles.composerBar, { borderColor: 'rgba(0,0,0,0.06)', flex: 1 }]}>
              <TextInput
                style={styles.composerInput}
                placeholder="Ask Nexus"
                placeholderTextColor={C.muted}
                value={nexusState.inputText}
                onChangeText={setInputText}
                multiline
                maxLength={4000}
                returnKeyType="default"
                blurOnSubmit={false}
                autoCapitalize="sentences"
                autoCorrect
                selectionColor={C.label}
                onFocus={() => {
                  if (!nexusState.activeConversationId) createNewConversation();
                }}
              />

              {hasText ? (
                <Pressable style={styles.composerSend} onPress={handleSend}>
                  <IconSymbol name="arrow.up" size={16} weight="semibold" color="#FFFFFF" />
                </Pressable>
              ) : (
                <View style={styles.composerActions}>
                  <Pressable style={styles.composerMic} onPress={handleMicPress}>
                    <IconSymbol name="microphone" size={20} color={C.secondary} />
                  </Pressable>
                  <Pressable style={styles.composerWaveform} onPress={handleWaveformPress}>
                    <IconSymbol name="waveform" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* ── Conversations Panel ── */}
      <ConversationsPanel
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewConversation}
        onAvatarPress={handleAvatarPress}
        conversations={nexusState.conversations}
        activeConversationId={nexusState.activeConversationId}
        onSelectConversation={handleSelectConversation}
        onPinConversation={pinConversation}
        onUnpinConversation={unpinConversation}
        onRenameConversation={renameConversation}
        onArchiveConversation={archiveConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* ── Overlays ── */}
      <SimulationOverlay
        simulation={
          nexusState.activeSimulationId ? getSimulation(nexusState.activeSimulationId) ?? null : null
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

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
export default function NexusScreen() {
  const { state: authState } = useAuth();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  if (!authState.isAuthenticated) return <NexusLockedState />;

  return (
    <NexusProvider>
      <NexusScreenContent />
    </NexusProvider>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    canvas: { flex: 1 },

    // Suggest cards
    suggestScroll: { flexGrow: 0 },
    suggestRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 6,
    },
    suggestCard: {
      minWidth: 200,
      maxWidth: 220,
      padding: 14,
      backgroundColor: C.bg,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      borderRadius: 14,
      gap: 4,
    },
    suggestTitle: { fontSize: 13, fontWeight: '500', color: C.label },
    suggestSub: { fontSize: 11, color: C.muted },

    // New-org contextual suggestion cards
    orgSuggestRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    orgSuggestCard: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    orgSuggestTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    orgSuggestDesc: {
      fontSize: 12,
    },

    // Attach menu popup
    attachMenu: {
      position: 'absolute',
      left: 16,
      borderRadius: 18,
      paddingVertical: 6,
      paddingHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 10,
      zIndex: 100,
    },
    attachMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    attachMenuIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachMenuLabel: {
      fontSize: 16,
      fontWeight: '500',
    },

    // Composer
    inputBarWrap: { paddingHorizontal: 16, paddingTop: 4 },
    inputBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    composerPlusOuter: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
    },
    composerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.bg,
      borderWidth: 1,
      borderRadius: 22,
      paddingVertical: 6,
      paddingLeft: 12,
      paddingRight: 6,
      minHeight: 44,
    },
    composerInput: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: C.label,
      maxHeight: 120,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    composerSend: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.label,
      marginRight: 2,
    },
    composerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginRight: 2,
    },
    composerMic: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    composerWaveform: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.label,
    },

    // Locked state
    lockedOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    lockedContent: { alignItems: 'center', opacity: 0.4 },
    lockedLogo: { fontSize: 48, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
    lockedText: { fontSize: 15, fontWeight: '500', color: C.muted },
  });
