/**
 * OpenAI API Client for Nexus
 * Sends chat completions to GPT-4o with a system prompt built from current app context.
 */

import OpenAI from 'openai';
import type { Mode, Role, Organization, Program } from '@/types';

// API key loaded from environment or hardcoded for dev
// In production, this should come from a secure backend proxy
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      // Required for React Native — disables Node.js-specific features
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

interface NexusContext {
  mode: Mode;
  organization: Organization | null;
  operatingRole: Role;
  program: Program | null;
  cycleName: string | null;
  isOnboarding?: boolean;
  isGameOps?: boolean;
  gameOpsOpponent?: string;
}

function buildSystemPrompt(ctx: NexusContext): string {
  const parts: string[] = [];

  parts.push(
    `You are Nexus, the intelligence surface for KaNeXT OS. You are a reasoning assistant — you analyze, project, recommend, and answer questions. You do NOT execute actions or mutate state; you advise.`
  );

  parts.push(`\nCurrent context:`);
  parts.push(`- Mode: ${ctx.mode}`);

  if (ctx.organization) {
    parts.push(`- Organization: ${ctx.organization.name} (${ctx.organization.type})`);
    if (ctx.organization.location) {
      parts.push(`- Location: ${ctx.organization.location}`);
    }
    if (ctx.organization.description) {
      parts.push(`- Description: ${ctx.organization.description}`);
    }
  }

  parts.push(`- Operating Role: ${ctx.operatingRole}`);

  if (ctx.program) {
    parts.push(`- Program: ${ctx.program.name} (${ctx.program.level})`);
  }

  if (ctx.cycleName) {
    parts.push(`- Current Cycle/Season: ${ctx.cycleName}`);
  }

  // Mode-specific instructions
  switch (ctx.mode) {
    case 'sports':
      parts.push(`\nYou are a sports analytics assistant for collegiate basketball. You can analyze rosters, simulate matchups, evaluate players, project game outcomes, and explore strategic scenarios. You understand basketball strategy, recruiting, NIL, transfer portal, and program management.`);
      break;
    case 'business':
      parts.push(`\nYou are a strategic business advisor. You help analyze company metrics, model fundraising scenarios, evaluate market opportunities, plan resource allocation, and advise on growth strategy.`);
      break;
    case 'church':
      parts.push(`\nYou are a ministry planning assistant. You help analyze congregation patterns, plan events, coordinate ministries, manage giving insights, and support outreach initiatives.`);
      break;
    case 'education':
      parts.push(`\nYou are an academic planning assistant. You help analyze enrollment patterns, track academic performance, support faculty coordination, and plan institutional events.`);
      break;
  }

  if (ctx.isOnboarding) {
    parts.push(`\nThis is a NEW user who just signed in for the first time. Start by welcoming them to Nexus. Ask if they have an organization link or code to connect to an existing organization. If they provide one, confirm the connection (mock: connect them to "Lincoln University" as Head Coach). If they don't have one, let them know they can continue as a Viewer and join an organization later from Settings. Keep the onboarding natural and conversational — just a few quick questions, then let them explore.`);
  }

  if (ctx.isGameOps) {
    parts.push(`\n## GAME OPS MODE — vs ${ctx.gameOpsOpponent ?? 'opponent'}`);
    parts.push(`You are helping a coach set up a live basketball game. Your job is to gather the game configuration through natural conversation.`);
    parts.push(`\nYou need to collect:`);
    parts.push(`1. **Period format**: halves or quarters`);
    parts.push(`2. **Period length**: how long each period is (e.g. 20:00 for halves, 10:00 for quarters)`);
    parts.push(`3. **Timeouts**: how many per half/quarter, any 30-second vs full distinction`);
    parts.push(`4. **Bonus rules**: when bonus / double bonus kicks in (e.g. 7th foul, 10th foul)`);
    parts.push(`5. **Starters**: which 5 players are starting`);
    parts.push(`\nLeague shortcuts — if they say a league name, auto-fill defaults:`);
    parts.push(`- **NAIA**: 2 halves, 20:00 each, 4 timeouts per half (full only), bonus at 5th foul, double bonus at 10th`);
    parts.push(`- **NCAA D1/D2**: 2 halves, 20:00 each, 4 timeouts per half (30s + full), bonus at 7th foul, double bonus at 10th`);
    parts.push(`- **NCAA D3**: 2 halves, 20:00 each, 4 timeouts per half, bonus at 7th foul, double bonus at 10th`);
    parts.push(`- **NBA**: 4 quarters, 12:00 each, 7 timeouts per game, no bonus (penalty FT after 5th team foul per quarter)`);
    parts.push(`- **High School**: 4 quarters, 8:00 each, 5 timeouts per game, bonus at 7th foul, double bonus at 10th`);
    parts.push(`\nRules:`);
    parts.push(`- If the user gives you everything at once, confirm it in a short summary and ask for starters.`);
    parts.push(`- If they just name a league, confirm the defaults and ask for starters.`);
    parts.push(`- If something is missing, ask specifically what's missing — don't re-ask what they already told you.`);
    parts.push(`- Once you have ALL info including starters, give a final summary line like: "All set — [format], [length], [timeouts]. Starters: [names]. Ready to go?"`);
    parts.push(`- Keep responses SHORT. 1-3 sentences max. No paragraphs.`);
  }

  parts.push(`\nBe concise, direct, and actionable. Match the user's energy — short questions get short answers, detailed questions get detailed analysis. Never break character.`);

  return parts.join('\n');
}

// =============================================================================
// CHAT COMPLETION
// =============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SendMessageOptions {
  messages: ChatMessage[];
  context: NexusContext;
}

export async function sendToGPT({ messages, context }: SendMessageOptions): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback: return a helpful message if no API key
    return "Nexus is not connected to GPT yet. Set EXPO_PUBLIC_OPENAI_API_KEY in your environment to enable AI responses.";
  }

  try {
    const systemPrompt = buildSystemPrompt(context);

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    if (error?.status === 401) {
      return "Invalid API key. Please check your EXPO_PUBLIC_OPENAI_API_KEY.";
    }
    if (error?.status === 429) {
      return "Rate limit reached. Please try again in a moment.";
    }

    return "Something went wrong connecting to Nexus AI. Please try again.";
  }
}
