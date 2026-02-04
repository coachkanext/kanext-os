/**
 * KaNeXT OS Nexus Context
 * State management for the Nexus conversation interface.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { NexusState, NexusPanelState, Conversation, Message, SimulationResult, SavedSimulation, Mode } from '@/types';
import { MOCK_CONVERSATIONS, getMessagesForConversation } from '@/data/mock-nexus';
import { detectSimulationIntent, generateMockSimulation } from '@/data/mock-simulations';
import { useMode } from './app-context';

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
  | { type: 'SAVE_SIMULATION'; payload: SavedSimulation };

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
    dispatch({ type: 'SET_LOADING', payload: true });

    // Detect simulation intent (sports mode only)
    const simIntent = mode === 'sports' ? detectSimulationIntent(userMessage.content) : { isSimulation: false, opponent: '' };

    // Simulate assistant response after a delay
    setTimeout(() => {
      if (simIntent.isSimulation) {
        // Generate simulation result
        const simulation = generateMockSimulation(
          'Lincoln University',
          simIntent.opponent || 'Opponent'
        );

        // Store simulation
        dispatch({ type: 'ADD_SIMULATION', payload: simulation });

        // Create assistant message with simulation reference
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          conversationId: state.activeConversationId!,
          role: 'assistant',
          content: `Here's my simulation analysis for the matchup against ${simIntent.opponent || 'the opponent'}:`,
          timestamp: new Date(),
          metadata: {
            isSimulation: true,
            simulationId: simulation.id,
          },
        };
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      } else {
        // Regular response - mode-aware
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          conversationId: state.activeConversationId!,
          role: 'assistant',
          content: getSimulatedResponse(userMessage.content, mode),
          timestamp: new Date(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1500);
  }, [state.inputText, state.activeConversationId, mode]);

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

function getSimulatedResponse(userInput: string, mode: Mode): string {
  const input = userInput.toLowerCase();

  // Mode-specific responses
  switch (mode) {
    case 'sports':
      return getSportsResponse(input);
    case 'enterprise':
      return getEnterpriseResponse(input);
    case 'church':
      return getChurchResponse(input);
    case 'education':
      return getEducationResponse(input);
    default:
      return "I'm Nexus, your reasoning assistant. How can I help you today?";
  }
}

function getSportsResponse(input: string): string {
  // Check for simulation triggers
  const simTriggers = ['sim', 'simulate', 'simulation', 'run sim'];
  if (simTriggers.some((trigger) => input.includes(trigger))) {
    return "I can run that simulation for you. Try saying 'simulate against [team name]' and I'll generate a detailed projection with win probability, projected scores, and key factors.";
  }

  // Check for roster-related queries
  if (input.includes('roster') || input.includes('player') || input.includes('recruit')) {
    return "Looking at the current roster, Marcus Johnson leads the team with 18.5 PPG and 7.1 APG. The main needs are depth at the 4 position and perimeter defense. Want me to analyze specific players or recruiting targets?";
  }

  // Check for schedule/game queries
  if (input.includes('game') || input.includes('schedule') || input.includes('matchup')) {
    return "The next game is against Northwest Missouri at home. Based on historical matchups and current form, I project a 64% win probability with an expected margin of +6. Want me to run a full simulation?";
  }

  // Stats queries
  if (input.includes('stat') || input.includes('average') || input.includes('ppg')) {
    return "Team averages: 78.5 PPG, 38.2 RPG, 16.8 APG. The offense ranks 3rd in the conference in efficiency. Defensive rating needs improvement - currently allowing 72.1 PPG (5th in conference).";
  }

  // Default response
  return "I'm Nexus, your sports analytics assistant. I can simulate matchups, analyze roster composition, project game outcomes, and explore strategic scenarios. What would you like to explore?";
}

function getEnterpriseResponse(input: string): string {
  // Metrics queries
  if (input.includes('mrr') || input.includes('revenue') || input.includes('growth')) {
    return "Current MRR: $45K with 15% month-over-month growth. At this trajectory, you'll hit $100K MRR in approximately 6 months. The sports vertical accounts for 65% of revenue.";
  }

  // Fundraising queries
  if (input.includes('raise') || input.includes('series') || input.includes('funding') || input.includes('runway')) {
    return "With 18 months runway and current metrics, I recommend targeting Series A in Q3 2026. This allows 3 quarters of sustained growth while maintaining 12+ months runway for negotiation leverage. Key metrics to hit: $150K MRR, 25+ customers.";
  }

  // Market queries
  if (input.includes('market') || input.includes('tam') || input.includes('competition')) {
    return "The collegiate athletics technology market represents a $4.2B TAM. Your SAM focusing on D1/D2 programs is approximately $1.8B. Main competitors: Teamworks ($800M), ARMS ($200M). Your differentiation: AI-powered analytics and unified platform.";
  }

  // Hiring queries
  if (input.includes('hire') || input.includes('team') || input.includes('role')) {
    return "Priority hires for Q2: 1) Senior Full-Stack Engineer (accelerate feature velocity), 2) Customer Success Manager (support pilot programs), 3) SDR (build pipeline). Estimated burn increase: $45K/month.";
  }

  // Default response
  return "I'm Nexus, your strategic advisor. I can help analyze company metrics, model fundraising scenarios, evaluate market opportunities, and plan resource allocation. What would you like to explore?";
}

function getChurchResponse(input: string): string {
  // Service/attendance queries
  if (input.includes('attendance') || input.includes('service') || input.includes('growth')) {
    return "Sunday attendance across both campuses averages 1,850 weekly. ICCLA sees highest attendance at the 10:30 AM service (avg 650). Year-over-year growth is 8%. Small groups engagement is up 15%.";
  }

  // Event queries
  if (input.includes('event') || input.includes('calendar') || input.includes('planning')) {
    return "Upcoming key events: Youth Retreat (Feb 15-17, 45 registered), Easter Services (multiple times, expecting 3,000+ attendance), Missions Conference (March 22-24). Would you like help planning any of these?";
  }

  // Giving queries
  if (input.includes('giving') || input.includes('tithe') || input.includes('donation') || input.includes('budget')) {
    return "YTD giving: $485,000 (on track with budget). Building fund is at 75% of goal. January typically sees highest giving - consider launching new campaigns in mid-February when patterns normalize.";
  }

  // Ministry queries
  if (input.includes('ministry') || input.includes('volunteer') || input.includes('serve')) {
    return "Children's ministry needs 8 additional volunteers for the 10:30 service. Youth ministry engagement is strong with 85+ teens weekly. Prayer ministry has received 342 requests this month. Consider a volunteer recruitment push in February.";
  }

  // Default response
  return "I'm Nexus, your ministry planning assistant. I can help analyze congregation patterns, plan events, coordinate ministries, and support outreach initiatives. What would you like to explore?";
}

function getEducationResponse(input: string): string {
  // Enrollment queries
  if (input.includes('enrollment') || input.includes('student') || input.includes('registration')) {
    return "Current enrollment: 2,847 students (98% of capacity). Spring 2026 term shows strong registration with 2,650 confirmed. Waitlists exist for nursing and business programs. Retention rate improved to 78%.";
  }

  // Academic queries
  if (input.includes('academic') || input.includes('course') || input.includes('class') || input.includes('grade')) {
    return "Fall 2025 academic performance: 3.12 avg GPA (up from 3.08). Dean's List: 312 students. Academic probation: 45 students (down 12%). Science and business departments show strongest outcomes.";
  }

  // Faculty queries
  if (input.includes('faculty') || input.includes('professor') || input.includes('staff')) {
    return "Current faculty: 148 full-time, 62 adjunct. Student-to-faculty ratio: 15:1. Open positions: 3 (nursing, computer science, English). Faculty satisfaction survey shows 82% positive.";
  }

  // Calendar queries
  if (input.includes('calendar') || input.includes('schedule') || input.includes('semester')) {
    return "Spring 2026 key dates: Classes begin Jan 13, Spring Break Mar 15-22, Finals May 5-12, Commencement May 16. Registration for Summer/Fall opens March 1. Would you like details on any specific events?";
  }

  // Default response
  return "I'm Nexus, your academic planning assistant. I can help analyze enrollment patterns, track academic performance, support faculty coordination, and plan institutional events. What would you like to explore?";
}
