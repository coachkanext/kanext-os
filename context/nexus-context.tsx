/**
 * KaNeXT OS Nexus Context
 * State management for the Nexus conversation interface.
 */

import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NexusState,
  NexusPanelState,
  TargetContext,
  Conversation,
  Message,
  SimulationResult,
  SavedSimulation,
  Mode,
  ConversationType,
  PlayerEvalConfig,
  SimulationThreadConfig,
  EvalSnapshot,
  GameOpsConfig,
} from '@/types';
import { MOCK_CONVERSATIONS, getMessagesForConversation } from '@/data/mock-nexus';
import { detectSimulationIntent, generateMockSimulation } from '@/data/mock-simulations';
import { sendToGPT, type ChatMessage } from '@/utils/openai';
import { useMode, useAppContext } from './app-context';

const MAX_PINNED_CONVERSATIONS = 3;

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: NexusState = {
  activeConversationId: null,
  conversations: MOCK_CONVERSATIONS,
  messages: [],
  panelState: 'closed',
  inputText: '',
  isLoading: false,
  activeSimulationId: null,
  simulations: {},
  savedSimulations: {},
  newConversationSheetOpen: false,
  evalSnapshots: {},
  targetContext: { organizationId: 'lincoln-basketball' },
};

// =============================================================================
// ACTIONS
// =============================================================================

type NexusAction =
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_PANEL_STATE'; payload: NexusPanelState }
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'NEW_CONVERSATION'; payload: Conversation }
  | { type: 'ADD_SIMULATION'; payload: SimulationResult }
  | { type: 'SET_ACTIVE_SIMULATION'; payload: string | null }
  | { type: 'OPEN_SIMULATION'; payload: string }
  | { type: 'SAVE_SIMULATION'; payload: SavedSimulation }
  | { type: 'OPEN_NEW_CONVERSATION_SHEET' }
  | { type: 'CLOSE_NEW_CONVERSATION_SHEET' }
  | { type: 'UPDATE_CONVERSATION_CONFIG'; payload: { id: string; evalConfig?: PlayerEvalConfig; simConfig?: SimulationThreadConfig; gameOpsConfig?: GameOpsConfig } }
  | { type: 'PIN_CONVERSATION'; payload: string }
  | { type: 'UNPIN_CONVERSATION'; payload: string }
  | { type: 'ADD_EVAL_SNAPSHOT'; payload: EvalSnapshot }
  | { type: 'RENAME_CONVERSATION'; payload: { id: string; title: string } }
  | { type: 'ARCHIVE_CONVERSATION'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_TARGET_CONTEXT'; payload: TargetContext | 'all' };

function nexusReducer(state: NexusState, action: NexusAction): NexusState {
  switch (action.type) {
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADD_MESSAGE': {
      const newMessage = action.payload;
      // Update the conversation's lastMessage
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.timestamp }
          : conv
      );
      return {
        ...state,
        messages: [...state.messages, newMessage],
        conversations: updatedConversations,
      };
    }

    case 'SET_PANEL_STATE':
      return { ...state, panelState: action.payload };

    case 'SET_INPUT_TEXT':
      return { ...state, inputText: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SELECT_CONVERSATION': {
      const conversationId = action.payload;
      const messages = getMessagesForConversation(conversationId);
      return {
        ...state,
        activeConversationId: conversationId,
        messages,
        panelState: 'closed',
      };
    }

    case 'NEW_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        activeConversationId: action.payload.id,
        messages: [],
        panelState: 'closed',
      };

    case 'ADD_SIMULATION':
      return {
        ...state,
        simulations: {
          ...state.simulations,
          [action.payload.id]: action.payload,
        },
      };

    case 'SET_ACTIVE_SIMULATION':
      return {
        ...state,
        activeSimulationId: action.payload,
      };

    case 'OPEN_SIMULATION':
      return {
        ...state,
        activeSimulationId: action.payload,
        panelState: 'simulation',
      };

    case 'SAVE_SIMULATION':
      return {
        ...state,
        savedSimulations: {
          ...state.savedSimulations,
          [action.payload.id]: action.payload,
        },
      };

    case 'OPEN_NEW_CONVERSATION_SHEET':
      return { ...state, newConversationSheetOpen: true };

    case 'CLOSE_NEW_CONVERSATION_SHEET':
      return { ...state, newConversationSheetOpen: false };

    case 'UPDATE_CONVERSATION_CONFIG': {
      const { id, evalConfig, simConfig, gameOpsConfig } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === id
            ? {
                ...conv,
                ...(evalConfig !== undefined && { evalConfig }),
                ...(simConfig !== undefined && { simConfig }),
                ...(gameOpsConfig !== undefined && { gameOpsConfig }),
              }
            : conv
        ),
      };
    }

    case 'PIN_CONVERSATION': {
      const pinnedCount = state.conversations.filter((c) => c.isPinned).length;
      if (pinnedCount >= MAX_PINNED_CONVERSATIONS) {
        return state; // Already at max
      }
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload ? { ...conv, isPinned: true } : conv
        ),
      };
    }

    case 'UNPIN_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload ? { ...conv, isPinned: false } : conv
        ),
      };

    case 'ADD_EVAL_SNAPSHOT':
      return {
        ...state,
        evalSnapshots: {
          ...state.evalSnapshots,
          [action.payload.id]: action.payload,
        },
      };

    case 'RENAME_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id
            ? { ...conv, title: action.payload.title }
            : conv
        ),
      };

    case 'ARCHIVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages,
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages,
      };

    case 'SET_TARGET_CONTEXT':
      return { ...state, targetContext: action.payload };

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface NexusContextValue {
  state: NexusState;
  // Panel controls
  openConversations: () => void;
  openContextDrawer: () => void;
  openRoster: () => void;
  openRecruitingBoard: () => void;
  closePanel: () => void;
  // Conversation controls
  selectConversation: (id: string) => void;
  createNewConversation: () => void;
  // Message controls
  setInputText: (text: string) => void;
  sendMessage: () => void;
  // Simulation controls
  openSimulation: (id: string) => void;
  closeSimulation: () => void;
  getSimulation: (id: string) => SimulationResult | undefined;
  getSavedSimulation: (id: string) => SavedSimulation | undefined;
  saveSimulation: (simulation: SimulationResult, title?: string) => void;
  // New conversation sheet
  openNewConversationSheet: () => void;
  closeNewConversationSheet: () => void;
  createNewEval: () => void;
  createNewSim: () => void;
  // Conversation config
  updateConversationConfig: (id: string, evalConfig?: PlayerEvalConfig, simConfig?: SimulationThreadConfig) => void;
  // Pinning
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  // Eval snapshots
  getEvalSnapshot: (id: string) => EvalSnapshot | undefined;
  generatePlayerEval: (playerId: string, playerName: string, role: string) => void;
  // Conversation management
  renameConversation: (id: string, title: string) => void;
  archiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  // Context targeting
  setTargetContext: (target: TargetContext | 'all') => void;
  // Direct message injection (for onboarding, system messages)
  addAssistantMessage: (conversationId: string, content: string) => void;
  // Game Ops
  createNewGameOps: (gameId: string, opponent: string) => void;
  updateGameOpsStep: (conversationId: string, updates: Partial<GameOpsConfig>) => void;
  addUserMessage: (conversationId: string, content: string) => void;
}

const NexusContext = createContext<NexusContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const [state, dispatch] = useReducer(nexusReducer, defaultState);
  const mode = useMode();
  const { state: appState } = useAppContext();

  // Panel controls
  const openConversations = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'conversations' });
  }, []);

  const openContextDrawer = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'context' });
  }, []);

  const openRoster = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'roster' });
  }, []);

  const openRecruitingBoard = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'recruiting' });
  }, []);

  const closePanel = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
  }, []);

  // Conversation controls
  const selectConversation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONVERSATION', payload: id });
  }, []);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'chat',
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
  }, []);

  // New conversation sheet
  const openNewConversationSheet = useCallback(() => {
    dispatch({ type: 'OPEN_NEW_CONVERSATION_SHEET' });
  }, []);

  const closeNewConversationSheet = useCallback(() => {
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  const createNewEval = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Player Evaluation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'eval',
      evalConfig: {
        playerId: null,
        role: null,
      },
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  const createNewSim = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Game Simulation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'sim',
      simConfig: {
        scenario: null,
      },
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  // Conversation config
  const updateConversationConfig = useCallback(
    (id: string, evalConfig?: PlayerEvalConfig, simConfig?: SimulationThreadConfig) => {
      dispatch({ type: 'UPDATE_CONVERSATION_CONFIG', payload: { id, evalConfig, simConfig } });
    },
    []
  );

  // Pinning
  const pinConversation = useCallback((id: string) => {
    dispatch({ type: 'PIN_CONVERSATION', payload: id });
  }, []);

  const unpinConversation = useCallback((id: string) => {
    dispatch({ type: 'UNPIN_CONVERSATION', payload: id });
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    dispatch({ type: 'RENAME_CONVERSATION', payload: { id, title } });
  }, []);

  const archiveConversation = useCallback((id: string) => {
    dispatch({ type: 'ARCHIVE_CONVERSATION', payload: id });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  }, []);

  const setTargetContext = useCallback((target: TargetContext | 'all') => {
    dispatch({ type: 'SET_TARGET_CONTEXT', payload: target });
  }, []);

  const addAssistantMessage = useCallback((conversationId: string, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-injected`,
      conversationId,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  // Game Ops
  const createNewGameOps = useCallback(async (gameId: string, opponent: string) => {
    const convId = `conv-${Date.now()}`;
    const defaultConfig: GameOpsConfig = {
      gameId,
      opponent,
      step: 'gathering',
      periodFormat: 'halves',
      periodLength: 1200,
      starters: [],
    };

    const newConversation: Conversation = {
      id: convId,
      title: `Game Ops: vs ${opponent}`,
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'game-ops',
      gameOpsConfig: defaultConfig,
    };

    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    addAssistantMessage(
      convId,
      `Game Ops vs ${opponent} — let me know the game info.\n\nI need: halves or quarters, period length, timeouts, starters. Or just tell me the league and I'll fill in the defaults.`
    );
  }, [addAssistantMessage]);

  const updateGameOpsStep = useCallback((conversationId: string, updates: Partial<GameOpsConfig>) => {
    const conv = state.conversations.find(c => c.id === conversationId);
    if (!conv?.gameOpsConfig) return;
    dispatch({
      type: 'UPDATE_CONVERSATION_CONFIG',
      payload: {
        id: conversationId,
        gameOpsConfig: { ...conv.gameOpsConfig, ...updates },
      },
    });
  }, [state.conversations]);

  const addUserMessage = useCallback((conversationId: string, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-user`,
      conversationId,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  // Eval snapshots
  const getEvalSnapshot = useCallback(
    (id: string): EvalSnapshot | undefined => {
      return state.evalSnapshots[id];
    },
    [state.evalSnapshots]
  );

  const generatePlayerEval = useCallback(
    (playerId: string, playerName: string, role: string) => {
      if (!state.activeConversationId) return;

      // Generate mock eval snapshot
      const evalSnapshot: EvalSnapshot = {
        id: `eval-${Date.now()}`,
        generatedAt: new Date(),
        playerName,
        summary: `${playerName} demonstrates solid fundamentals and consistent effort. As a ${role.toLowerCase()}, they contribute valuable minutes with reliable production.`,
        strengths: [
          'Strong defensive positioning',
          'Consistent three-point shooting',
          'Excellent court vision',
          'High basketball IQ',
        ],
        areasForGrowth: [
          'Needs to improve free throw percentage',
          'Can be more aggressive on drives',
          'Work on finishing through contact',
        ],
        projectedImpact: Math.floor(Math.random() * 30) + 60, // 60-90
      };

      dispatch({ type: 'ADD_EVAL_SNAPSHOT', payload: evalSnapshot });

      // Create assistant message with eval
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-eval`,
        conversationId: state.activeConversationId,
        role: 'assistant',
        content: `Here's my evaluation for ${playerName}:`,
        timestamp: new Date(),
        metadata: {
          isEval: true,
          evalSnapshotId: evalSnapshot.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    },
    [state.activeConversationId]
  );

  // Message controls
  const setInputText = useCallback((text: string) => {
    dispatch({ type: 'SET_INPUT_TEXT', payload: text });
  }, []);

  // Track conversation history for GPT context
  const conversationHistoryRef = useRef<Map<string, ChatMessage[]>>(new Map());

  const sendMessage = useCallback(async () => {
    if (!state.inputText.trim() || !state.activeConversationId) return;

    const conversationId = state.activeConversationId;
    const inputText = state.inputText.trim();

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_INPUT_TEXT', payload: '' });
    dispatch({ type: 'SET_LOADING', payload: true });

    // Auto-name conversation based on first message
    const conversation = state.conversations.find((c) => c.id === conversationId);
    if (conversation && conversation.title === 'New Conversation') {
      const autoTitle = generateConversationTitle(inputText);
      dispatch({ type: 'RENAME_CONVERSATION', payload: { id: conversationId, title: autoTitle } });
    }

    // Check for simulation intent (sports mode, still uses mock sim engine)
    const simIntent = mode === 'sports' ? detectSimulationIntent(userMessage.content) : { isSimulation: false, opponent: '' };

    if (simIntent.isSimulation) {
      // Simulation still uses the mock engine for structured data
      const simulation = generateMockSimulation(
        'Lincoln University',
        simIntent.opponent || 'Opponent'
      );
      dispatch({ type: 'ADD_SIMULATION', payload: simulation });

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        conversationId,
        role: 'assistant',
        content: `Here's my simulation analysis for the matchup against ${simIntent.opponent || 'the opponent'}:`,
        timestamp: new Date(),
        metadata: {
          isSimulation: true,
          simulationId: simulation.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Build conversation history for GPT
    const history = conversationHistoryRef.current.get(conversationId) ?? [];
    history.push({ role: 'user', content: inputText });

    // Keep last 20 messages for context window
    const trimmedHistory = history.slice(-20);
    conversationHistoryRef.current.set(conversationId, trimmedHistory);

    try {
      const isGameOpsConv = conversation?.type === 'game-ops';
      const responseText = await sendToGPT({
        messages: trimmedHistory,
        context: {
          mode,
          organization: appState.organization,
          operatingRole: appState.operatingRole,
          program: appState.program,
          cycleName: appState.cycle?.name ?? null,
          isGameOps: isGameOpsConv,
          gameOpsOpponent: isGameOpsConv ? conversation?.gameOpsConfig?.opponent : undefined,
        },
      });

      // Add assistant response to history
      trimmedHistory.push({ role: 'assistant', content: responseText });
      conversationHistoryRef.current.set(conversationId, trimmedHistory);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        conversationId,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    } catch (error) {
      console.error('Failed to get GPT response:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        conversationId,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  }, [state.inputText, state.activeConversationId, state.conversations, mode, appState]);

  // Simulation controls
  const openSimulation = useCallback((id: string) => {
    dispatch({ type: 'OPEN_SIMULATION', payload: id });
  }, []);

  const closeSimulation = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SIMULATION', payload: null });
    dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
  }, []);

  const getSimulation = useCallback(
    (id: string): SimulationResult | undefined => {
      return state.simulations[id];
    },
    [state.simulations]
  );

  const getSavedSimulation = useCallback(
    (id: string): SavedSimulation | undefined => {
      return state.savedSimulations[id];
    },
    [state.savedSimulations]
  );

  const saveSimulation = useCallback(
    (simulation: SimulationResult, title?: string) => {
      if (!state.activeConversationId) return;

      const savedSim: SavedSimulation = {
        ...simulation,
        threadId: state.activeConversationId,
        savedAt: new Date(),
        title: title || simulation.matchupText,
      };

      dispatch({ type: 'SAVE_SIMULATION', payload: savedSim });

      // Add a message to the thread with the saved snapshot
      const snapshotMessage: Message = {
        id: `msg-${Date.now()}-snapshot`,
        conversationId: state.activeConversationId,
        role: 'assistant',
        content: 'Simulation saved for reference.',
        timestamp: new Date(),
        metadata: {
          isSavedSimulation: true,
          simulationId: savedSim.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: snapshotMessage });

      // Close the simulation overlay
      dispatch({ type: 'SET_ACTIVE_SIMULATION', payload: null });
      dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
    },
    [state.activeConversationId]
  );

  const value: NexusContextValue = {
    state,
    openConversations,
    openContextDrawer,
    openRoster,
    openRecruitingBoard,
    closePanel,
    selectConversation,
    createNewConversation,
    setInputText,
    sendMessage,
    openSimulation,
    closeSimulation,
    getSimulation,
    getSavedSimulation,
    saveSimulation,
    openNewConversationSheet,
    closeNewConversationSheet,
    createNewEval,
    createNewSim,
    updateConversationConfig,
    pinConversation,
    unpinConversation,
    getEvalSnapshot,
    generatePlayerEval,
    renameConversation,
    archiveConversation,
    deleteConversation,
    setTargetContext,
    addAssistantMessage,
    createNewGameOps,
    updateGameOpsStep,
    addUserMessage,
  };

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useNexusContext(): NexusContextValue {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error('useNexusContext must be used within a NexusProvider');
  }
  return context;
}

// =============================================================================
// HELPERS
// =============================================================================

// Mock response helpers removed — all responses now come from GPT-4o via utils/openai.ts

function generateConversationTitle(message: string): string {
  // Take first 40 characters and clean up
  let title = message.slice(0, 40).trim();

  // If we cut mid-word, find the last space
  if (message.length > 40) {
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.slice(0, lastSpace);
    }
    title += '...';
  }

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}

