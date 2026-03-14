/**
 * Nexus Screen — Canvas State Machine
 *
 * Canvas states:
 *  home          → landing logo + input bar (idle / no active conv)
 *  chat          → active conversation thread + input bar + pills row
 *  chats         → full-canvas conversation list
 *  projects      → project cards
 *  project-detail → single project detail with back arrow
 *  artifacts     → artifacts list with filter chips
 *
 * Sidebar (ConversationsPanel): absolutely positioned, zIndex 50.
 * Semi-transparent overlay (zIndex 49) dismisses it on tap.
 *
 * All existing functionality preserved:
 *  SimulationOverlay, VoiceOverlay, AvatarDrawer, InsertSheet,
 *  logo-fade-on-send, 15-min idle, mic/send crossfade, game-ops, onboarding.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Keyboard,
  Pressable,
  View,
  Text,
  TextInput,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import type { SidebarNav } from '@/components/nexus/conversations-panel';
import { ChatsCanvasView } from '@/components/nexus/chats-canvas-view';
import { ProjectsCanvasView } from '@/components/nexus/projects-canvas-view';
import { ProjectDetailCanvasView } from '@/components/nexus/project-detail-canvas-view';
import { ArtifactsCanvasView } from '@/components/nexus/artifacts-canvas-view';
import { NexusPillsRow } from '@/components/nexus/nexus-pills-row';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { NexusProvider, useNexusContext } from '@/context/nexus-context';
import { useAuth } from '@/context/auth-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { sendToGPT } from '@/utils/openai';
import { useAppContext, useMode } from '@/context/app-context';
import { registerGameOpsHandler } from '@/utils/global-game-ops';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const IDLE_THRESHOLD_MS = 15 * 60 * 1000;

type CanvasView = 'home' | 'chat' | 'chats' | 'projects' | 'project-detail' | 'artifacts';

// ── Filter chips ──
const MODE_CHIPS = ['All', 'Sports', 'Business', 'Faith', 'Education'] as const;
type ModeChip = (typeof MODE_CHIPS)[number];
const ORG_CHIPS: Record<ModeChip, string[]> = {
  All: [],
  Sports: ['Lincoln U', 'FMU', 'All Sports'],
  Business: ['BizCo', 'StartupX', 'All Business'],
  Faith: ['Riverside Church', 'All Faith'],
  Education: ['Lincoln U', 'Central Academy', 'All Education'],
};

// ── Suggest cards (home state) ──
const SUGGEST_CARDS = [
  { title: 'Evaluate a recruit',  sub: 'Pull film, academics, and KR score'     },
  { title: 'Draft practice plan', sub: 'Generate weekly schedule from template' },
  { title: 'Analyze game film',   sub: 'Break down opponent tendencies'         },
  { title: 'Donor outreach',      sub: 'Draft personalized outreach messages'   },
];

// ── Artifacts sheet mock (spec: chatArtifacts) ──
const SHEET_ARTIFACTS = [
  { id: 'sa1', icon: '📄', title: 'Williams Full Report',        meta: 'Report · 2 pages · Just now' },
  { id: 'sa2', icon: '📄', title: 'Highlight Tape Analysis',     meta: 'Document · 4 pages · 3:42 PM' },
  { id: 'sa3', icon: '🎮', title: 'Route Running Breakdown',     meta: 'Simulation · 3:43 PM' },
];

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
    addAssistantMessage,
    createNewGameOps,
    openNewConversationSheet,
    closeNewConversationSheet,
    pinConversation,
    unpinConversation,
    renameConversation,
    archiveConversation,
    deleteConversation,
  } = useNexusContext();

  const { state: authState, completeOnboarding } = useAuth();
  const { state: appState } = useAppContext();
  const mode = useMode();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  // ── Canvas state ──
  const [canvasView, setCanvasView] = useState<CanvasView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNav, setSidebarNav] = useState<SidebarNav>('chats');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStage, setFilterStage] = useState<'mode' | 'org'>('mode');
  const [selectedModeChip, setSelectedModeChip] = useState<ModeChip>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [artifactsSheetOpen, setArtifactsSheetOpen] = useState(false);
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);

  // ── 15-min idle ──
  const isIdle =
    nexusState.lastInteractionAt === null ||
    Date.now() - nexusState.lastInteractionAt > IDLE_THRESHOLD_MS;

  // ── Keyboard height ──
  const footerClearance = (insets.bottom || 0) + 72 + 8;
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

  // ── Logo fade ──
  const [logoFading, setLogoFading] = useState(false);

  // ── Send button visibility ──
  const hasText = nexusState.inputText.trim().length > 0;

  const showLanding =
    canvasView === 'home' &&
    (isIdle || !nexusState.activeConversationId || nexusState.messages.length === 0);

  // ── Onboarding ──
  const onboardingTriggeredRef = useRef(false);
  useEffect(() => {
    if (!authState.isNewUser || onboardingTriggeredRef.current) return;
    onboardingTriggeredRef.current = true;
    createNewConversation();
  }, [authState.isNewUser, createNewConversation]);

  useEffect(() => {
    if (!authState.isNewUser || !nexusState.activeConversationId || nexusState.messages.length > 0) return;
    const convId = nexusState.activeConversationId;
    (async () => {
      try {
        const text = await sendToGPT({
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
        addAssistantMessage(convId, text);
        await completeOnboarding();
      } catch {
        addAssistantMessage(convId, 'Welcome to Nexus. How can I help you today?');
        await completeOnboarding();
      }
    })();
  }, [authState.isNewUser, nexusState.activeConversationId, nexusState.messages.length, appState, addAssistantMessage, completeOnboarding]);

  // ── Game Ops ──
  useEffect(() => {
    registerGameOpsHandler((gameId, opponent) => createNewGameOps(gameId, opponent));
    return () => registerGameOpsHandler(null);
  }, [createNewGameOps]);

  const activeConversation = nexusState.conversations.find(
    (c) => c.id === nexusState.activeConversationId,
  );
  const isGameOps = activeConversation?.type === 'game-ops';
  const gameOpsConfig = activeConversation?.gameOpsConfig;

  // ── Voice ──
  const preExistingTextRef = useRef('');
  const { voiceState, audioLevel, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string) => {
      const prefix = preExistingTextRef.current;
      const sep = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      setInputText(prefix + sep + text);
    }, [setInputText]),
  });
  const handleVoiceStop = useCallback(() => stopListening(), [stopListening]);

  // ── Handlers ──
  const handleNewConversation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogoFading(false);
    createNewConversation();
    setCanvasView('home');
  }, [createNewConversation]);

  const handlePlusPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openNewConversationSheet();
  }, [openNewConversationSheet]);

  const handleInsertAction = useCallback((action: InsertAction) => {
    closeNewConversationSheet();
    console.log('Insert action:', action);
  }, [closeNewConversationSheet]);

  const handleSend = useCallback(() => {
    if (!nexusState.inputText.trim()) return;
    Keyboard.dismiss();
    if (!nexusState.activeConversationId) {
      setLogoFading(true);
      createNewConversation();
      setTimeout(sendMessage, 50);
    } else if (nexusState.messages.length === 0) {
      setLogoFading(true);
      setTimeout(sendMessage, 50);
    } else {
      sendMessage();
    }
    setCanvasView('chat');
  }, [nexusState.inputText, nexusState.activeConversationId, nexusState.messages.length, createNewConversation, sendMessage]);

  const handleSelectConversation = useCallback((id: string) => {
    selectConversation(id);
    setCanvasView('chat');
    setSidebarOpen(false);
  }, [selectConversation]);

  const handleNavSelect = useCallback((nav: SidebarNav) => {
    setSidebarNav(nav);
    setSidebarOpen(false);
    if (nav === 'chats') setCanvasView('chats');
    else if (nav === 'projects') setCanvasView('projects');
    else if (nav === 'artifacts') setCanvasView('artifacts');
  }, []);

  const handleBack = useCallback(() => {
    if (canvasView === 'chat') setCanvasView('chats');
    else if (canvasView === 'project-detail') setCanvasView('projects');
    else setCanvasView('home');
  }, [canvasView]);

  const handleAvatarPress = useCallback(() => {
    setSidebarOpen(false);
    setAvatarDrawerVisible(true);
  }, []);

  // ── Top bar derived ──
  const topBarView: 'home' | 'chat' | 'list' =
    canvasView === 'chat' ? 'chat' : canvasView === 'home' ? 'home' : 'list';

  const listTitles: Record<CanvasView, string> = {
    home: '', chat: '', chats: 'Chats', projects: 'Projects',
    'project-detail': 'Project', artifacts: 'Artifacts',
  };

  const showBack = canvasView === 'chat' || canvasView === 'project-detail';
  const showFilter = canvasView === 'chats' || canvasView === 'projects';
  const showNewChat = canvasView === 'chat';
  const showInputBar = canvasView === 'home' || canvasView === 'chat';
  const showFAB = canvasView === 'chats' || canvasView === 'projects' || canvasView === 'artifacts';

  const orgChips = filterStage === 'org' ? ORG_CHIPS[selectedModeChip] : [];

  return (
    <ThemedView style={styles.container}>
      <View style={{ flex: 1, paddingTop: insets.top }}>

        {/* ── Top Bar ── */}
        <NexusPageTopBar
          view={topBarView}
          title={listTitles[canvasView]}
          showBack={showBack}
          showFilter={showFilter}
          showNewChat={showNewChat}
          filterActive={filterOpen}
          onHamburger={() => setSidebarOpen(true)}
          onBack={handleBack}
          onNewChat={handleNewConversation}
          onFilter={() => {
            setFilterOpen((v) => !v);
            setFilterStage('mode');
            setSelectedModeChip('All');
          }}
          onDropdownAction={(action) => console.log('dropdown:', action)}
          onPlusPress={handleNewConversation}
        />

        {/* ── Filter Chips ── */}
        {filterOpen && showFilter && (
          <View style={[styles.filterBar, { borderBottomColor: C.divider }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}
            >
              {filterStage === 'mode' ? (
                MODE_CHIPS.map((chip) => {
                  const active = chip === selectedModeChip;
                  return (
                    <Pressable
                      key={chip}
                      style={[styles.chip, { backgroundColor: active ? C.label : C.surface }]}
                      onPress={() => {
                        setSelectedModeChip(chip);
                        if (chip !== 'All') setFilterStage('org');
                      }}
                    >
                      <Text style={[styles.chipText, { color: active ? C.bg : C.secondary }]}>{chip}</Text>
                    </Pressable>
                  );
                })
              ) : (
                <>
                  <Pressable
                    style={[styles.chip, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                    onPress={() => setFilterStage('mode')}
                  >
                    <IconSymbol name="chevron.left" size={12} color={C.secondary} />
                    <Text style={[styles.chipText, { color: C.secondary }]}>Back</Text>
                  </Pressable>
                  {orgChips.map((org) => (
                    <Pressable
                      key={org}
                      style={[styles.chip, { backgroundColor: C.surface }]}
                      onPress={() => { setFilterOpen(false); setFilterStage('mode'); }}
                    >
                      <Text style={[styles.chipText, { color: C.secondary }]}>{org}</Text>
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        )}

        {/* ── Pills Row (active chat) ── */}
        {canvasView === 'chat' && (
          <NexusPillsRow
            projectName={activeConversation?.workspace ?? null}
            artifactCount={3}
            onProjectPress={() => setCanvasView('project-detail')}
            onArtifactsPress={() => setArtifactsSheetOpen(true)}
          />
        )}

        {/* ── Canvas ── */}
        <View style={styles.canvas}>
          {/* HOME */}
          {canvasView === 'home' && (
            <Pressable style={StyleSheet.absoluteFill} onPress={() => Keyboard.dismiss()}>
              <NexusLanding fadeOut={logoFading} />
            </Pressable>
          )}

          {/* CHAT */}
          {canvasView === 'chat' && (
            <>
              {isGameOps && gameOpsConfig && (
                <View style={[styles.gameOpsBar, { borderBottomColor: C.divider }]}>
                  <Text style={[styles.gameOpsText, { color: C.secondary }]}>
                    FMU vs {gameOpsConfig.opponent}
                  </Text>
                </View>
              )}
              <Pressable style={StyleSheet.absoluteFill} onPress={() => Keyboard.dismiss()}>
                <ChatThread
                  messages={nexusState.messages}
                  isLoading={nexusState.isLoading}
                  conversation={
                    nexusState.conversations.find((c) => c.id === nexusState.activeConversationId) ?? null
                  }
                  mode={mode}
                />
              </Pressable>
            </>
          )}

          {/* CHATS LIST */}
          {canvasView === 'chats' && (
            <ChatsCanvasView
              conversations={nexusState.conversations}
              onSelectConversation={handleSelectConversation}
            />
          )}

          {/* PROJECTS */}
          {canvasView === 'projects' && (
            <ProjectsCanvasView
              onSelectProject={(id) => {
                setSelectedProjectId(id);
                setCanvasView('project-detail');
              }}
            />
          )}

          {/* PROJECT DETAIL */}
          {canvasView === 'project-detail' && (
            <ProjectDetailCanvasView
              projectId={selectedProjectId}
              conversations={nexusState.conversations}
              onSelectConversation={handleSelectConversation}
            />
          )}

          {/* ARTIFACTS */}
          {canvasView === 'artifacts' && <ArtifactsCanvasView />}
        </View>

        {/* ── Suggest Cards (home state only) ── */}
        {canvasView === 'home' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestRow}
            style={styles.suggestScroll}
          >
            {SUGGEST_CARDS.map((card) => (
              <Pressable
                key={card.title}
                style={({ pressed }) => [styles.suggestCard, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  setInputText(card.title);
                  if (!nexusState.activeConversationId) createNewConversation();
                  setCanvasView('chat');
                }}
              >
                <Text style={styles.suggestTitle}>{card.title}</Text>
                <Text style={styles.suggestSub}>{card.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Input Bar (home + chat only) ── */}
        {showInputBar && (
          <View style={[styles.inputBarWrap, { paddingBottom: inputBottomPadding }]}>
            <View style={[styles.composerBar, { borderColor: 'rgba(0,0,0,0.06)' }]}>
              {/* + button inside bar */}
              <Pressable
                style={({ pressed }) => [styles.composerPlus, { opacity: pressed ? 0.6 : 1 }]}
                onPress={handlePlusPress}
              >
                <IconSymbol name="plus" size={18} color={C.secondary} />
              </Pressable>

              {/* Text input */}
              <TextInput
                style={styles.composerInput}
                placeholder={canvasView === 'home' ? 'Ask Nexus anything...' : 'Ask Nexus...'}
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
                  if (!nexusState.activeConversationId) {
                    createNewConversation();
                    setCanvasView('chat');
                  }
                }}
              />

              {/* Send button — visible only when typing */}
              {hasText && (
                <Pressable style={styles.composerSend} onPress={handleSend}>
                  <IconSymbol name="arrow.up" size={16} weight="semibold" color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* ── FAB (list views) ── */}
        {showFAB && (
          <Pressable
            style={[styles.fab, { bottom: insets.bottom + 88 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              createNewConversation();
              setCanvasView('home');
            }}
          >
            <IconSymbol name="square.and.pencil" size={20} color={C.bg} />
          </Pressable>
        )}
      </View>

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
          <View style={styles.sidebarOverlay} />
        </TouchableWithoutFeedback>
      )}

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
        activeNav={sidebarNav}
        onNavSelect={handleNavSelect}
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

      {/* ── Artifacts Bottom Sheet ── */}
      <BottomSheet
        visible={artifactsSheetOpen}
        onClose={() => setArtifactsSheetOpen(false)}
        title="Artifacts"
      >
        <View>
          {SHEET_ARTIFACTS.map((a) => (
            <View key={a.id} style={[styles.sheetRow, { borderBottomColor: C.divider }]}>
              <Text style={styles.sheetIcon}>{a.icon}</Text>
              <View style={styles.sheetContent}>
                <Text style={[styles.sheetTitle, { color: C.label }]}>{a.title}</Text>
                <Text style={[styles.sheetMeta, { color: C.secondary }]}>{a.meta}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </View>
          ))}
          <Pressable
            style={[styles.downloadBtn, { backgroundColor: C.label }]}
            onPress={() => setArtifactsSheetOpen(false)}
          >
            <IconSymbol name="arrow.down.circle" size={16} color={C.bg} />
            <Text style={[styles.downloadText, { color: C.bg }]}>Download All</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
export default function NexusScreen() {
  const { state: authState } = useAuth();
  const mode = useMode();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  if (!authState.isAuthenticated) return <NexusLockedState />;

  if (mode === 'church' || mode === 'education' || mode === 'competition') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '800', lineHeight: 40, color: C.label }}>
          Coming Soon
        </Text>
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    canvas: { flex: 1 },

    // Sidebar overlay
    sidebarOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 49,
    },

    // Filter bar
    filterBar: { borderBottomWidth: StyleSheet.hairlineWidth },
    filterChipsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
    },
    chipText: { fontSize: 13, fontWeight: '600' },

    // FAB
    fab: {
      position: 'absolute',
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: C.label,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },

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

    // Composer bar (single rounded bar — spec)
    inputBarWrap: { paddingHorizontal: 16, paddingTop: 4 },
    composerBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: C.bg,
      borderWidth: 1,
      borderRadius: 22,
      paddingVertical: 6,
      paddingLeft: 6,
      paddingRight: 6,
      minHeight: 44,
    },
    composerPlus: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
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

    // Locked state
    lockedOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    lockedContent: { alignItems: 'center', opacity: 0.4 },
    lockedLogo: { fontSize: 48, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
    lockedText: { fontSize: 15, fontWeight: '500', color: C.muted },

    // Game Ops bar
    gameOpsBar: {
      paddingVertical: 8, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center',
    },
    gameOpsText: { fontSize: 14, fontWeight: '600' },

    // Artifacts sheet
    sheetRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
    },
    sheetIcon: { fontSize: 22, width: 32, textAlign: 'center' },
    sheetContent: { flex: 1, gap: 3 },
    sheetTitle: { fontSize: 15, fontWeight: '500' },
    sheetMeta: { fontSize: 12 },
    downloadBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, marginTop: 16, paddingVertical: 12, borderRadius: 10,
    },
    downloadText: { fontSize: 15, fontWeight: '600' },
  });
