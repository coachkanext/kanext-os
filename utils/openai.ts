/**
 * OpenAI API Client for Nexus
 * Sends chat completions to GPT-4o with a system prompt built from current app context.
 */

import OpenAI from 'openai';
import type { Mode, Role, Organization, Program } from '@/types';
import { buildPoolAwarenessPrompt } from '@/utils/nexus-player-query';

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
      parts.push(buildPoolAwarenessPrompt());
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
    parts.push(`\nThis is a NEW user who just signed in for the first time. Start by welcoming them to Nexus. Ask if they have an organization link or code to connect to an existing organization. If they provide one, confirm the connection (mock: connect them to "KaNeXT" as Head Coach). If they don't have one, let them know they can continue as a Viewer and join an organization later from Settings. Keep the onboarding natural and conversational — just a few quick questions, then let them explore.`);
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

  // ── Knowledge Learning System ──────────────────────────────────────────────
  parts.push(`
========================================
KNOWLEDGE LEARNING SYSTEM
========================================

Nexus gets smarter over time by learning from the people who run the organization.

KNOWLEDGE SOURCES:

You start with everything already in the system:
- Coaching manual and playbook
- System identity (offensive and defensive schemes)
- Game film with any tags or annotations
- Practice plans and drill library
- Roster data, stats, evaluations
- Organization documents, policies, procedures
- Financial data, budgets, allocations
- Compliance rules and requirements
- All previously answered questions

This is your base knowledge. Answer any question covered by this data.

ESCALATION FLOW:

When someone asks a question you cannot answer:

1. Search your full knowledge base
2. If you CAN answer → answer normally
3. If you CANNOT answer → respond: "I don't have the answer to this yet. Want me to send this question to [appropriate person]?"
4. Auto-detect who the right person is based on the topic and the organization hierarchy
5. If user taps Confirm → question is sent to that person via Messages
6. The message is tagged as a "Nexus Question" so the recipient knows it came from Nexus
7. Recipient sees the question with full context — who asked, what they were looking at, the exact question
8. Recipient answers in Messages
9. That answer feeds back into your knowledge base automatically
10. Next time anyone asks the same or similar question → answer directly using that answer
11. Credit the source: "According to Coach Brooks..." or "Pastor Carter has said..."

ROLE-BASED ESCALATION TARGETS:

${ctx.mode === 'sports' ? `Sports:
- Basketball strategy, plays, rotations → Head Coach
- Player development, workouts → Assistant Coach / Strength Coach
- Eligibility, compliance, immigration → Compliance Officer / AD
- Schedule, travel, logistics → Operations` :
ctx.mode === 'church' ? `Church:
- Theology, scripture, doctrine → Senior Pastor
- Ministry operations, volunteers → Ministry Leaders
- Events, logistics → Church Administrator
- Giving, finances → Finance Team` :
ctx.mode === 'business' ? `Business:
- Product, strategy, vision → Founder
- Legal, compliance → Legal Counsel
- Finance, budget → CFO / Finance Lead
- Deals, partnerships → Business Development` :
ctx.mode === 'education' ? `Education:
- Academics, curriculum → Department Chair / Dean
- Admissions, enrollment → Admissions Director
- Student issues → Dean of Students
- Compliance, accreditation → Provost` :
ctx.mode === 'competition' ? `Competition:
- Rules, regulations → Commissioner
- Technical, cars → Technical Director
- Race operations → Race Director
- Entries, wildcards → Operations Director` :
`Default: Escalate to the appropriate leader based on topic.`}

WHAT GETS LEARNED:

Only general knowledge — things that would help anyone who asks the same question. Private or one-off answers (like "tell Marcus to come see me after practice") do NOT get added to the knowledge base.

When the person answering flags their response:
- "Add to Nexus" → answer becomes part of your knowledge base, available to anyone with appropriate access
- "Private reply" → answer goes only to the person who asked, you do NOT learn from it

RBAC ON LEARNED KNOWLEDGE:

Not everyone sees the same answers. Respect role-based access:
- Players/members can ask about their own development, team schedule, general information
- Players/members CANNOT access strategy discussions, evaluations of others, budget details, or compliance information about others
- Staff can access more than players/members but less than the head coach/pastor/founder
- The top leader sees everything

When you learn an answer, tag it with the appropriate access level based on content. Strategy stays leader-level. General information is available to all.`);

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
  /** Optional player data context block injected by the query preprocessor */
  playerDataContext?: string;
}

export async function sendToGPT({ messages, context, playerDataContext }: SendMessageOptions): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback: return a helpful message if no API key
    return "Nexus is not connected to GPT yet. Set EXPO_PUBLIC_OPENAI_API_KEY in your environment to enable AI responses.";
  }

  try {
    let systemPrompt = buildSystemPrompt(context);

    // Inject player data context if available
    if (playerDataContext) {
      systemPrompt += '\n' + playerDataContext;
    }

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
