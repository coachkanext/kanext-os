/**
 * KaNeXT OS Nexus Context
 * State management for the Nexus conversation interface.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { NexusState, NexusPanelState, Conversation, Message } from '@/types';
import { MOCK_CONVERSATIONS, getMessagesForConversation } from '@/data/mock-nexus';

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
  | { type: 'NEW_CONVERSATION'; payload: Conversation };

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
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
  }, []);

  // Message controls
  const setInputText = useCallback((text: string) => {
    dispatch({ type: 'SET_INPUT_TEXT', payload: text });
  }, []);

  const sendMessage = useCallback(() => {
    if (!state.inputText.trim() || !state.activeConversationId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: state.activeConversationId,
      role: 'user',
      content: state.inputText.trim(),
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_INPUT_TEXT', payload: '' });

    // Simulate assistant response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        conversationId: state.activeConversationId!,
        role: 'assistant',
        content: getSimulatedResponse(userMessage.content),
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    }, 1000);
  }, [state.inputText, state.activeConversationId]);

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

function getSimulatedResponse(userInput: string): string {
  const input = userInput.toLowerCase();

  // Check for simulation triggers
  const simTriggers = ['sim', 'simulate', 'simulation', 'run sim'];
  if (simTriggers.some((trigger) => input.includes(trigger))) {
    return "I'd run a simulation for you, but that feature is coming soon. In the full version, I'll be able to project game outcomes, season scenarios, and roster impact analyses.";
  }

  // Check for roster-related queries
  if (input.includes('roster') || input.includes('player') || input.includes('recruit')) {
    return "I can help you analyze roster needs and player fits. Use the roster overlay (board icon) to view your current roster, or ask me about specific positions or player comparisons.";
  }

  // Check for schedule/game queries
  if (input.includes('game') || input.includes('schedule') || input.includes('matchup')) {
    return "For game and schedule information, check the Organization tab. I can help you analyze upcoming matchups or review past performance when you have specific questions.";
  }

  // Default response
  return "I'm Nexus, your reasoning assistant. I can help you think through roster decisions, analyze player fits, project outcomes, and explore strategic options. What would you like to explore?";
}
