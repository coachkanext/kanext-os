# Dipson Technical Architecture and Permissioning

**KaNeXT LLC | Confidential**

---

## Purpose

Dipson is how users interact with KaNeXT. It is the AI interface through which every person on the platform accesses intelligence, executes actions, and operates the institutional system through natural language. This document explains how Dipson works technically: how queries are routed, how intelligence is assembled, how permissions are enforced, how the system learns, and what makes it structurally different from general-purpose AI assistants.

---

## Architecture Overview

Dipson is not a single AI model. It is a governed routing and execution layer that sits between the user and the intelligence engines, with RBAC enforced at every interaction.

The technical flow:

1. User sends a message
2. The system identifies the user's active brand, role, and authority level through the identity system
3. A query classifier determines whether the message is an intelligence question (sport-specific, institutional, domain-specific) or a general query
4. Intelligence queries are routed to a high-capability model with the relevant intelligence files assembled as system prompt (the intelligence architecture documents, legends, calibration data specific to the query's domain)
5. General queries are routed to a lighter model with product knowledge, brand context, and user RBAC as context
6. The response is generated, scoped to the user's role and authority, and delivered with full audit logging

The intelligence architecture (50+ intelligence domains across 400+ files, spanning 27+ sport-specific domains plus institutional intelligence domains) serves as the authoritative knowledge base that Dipson draws from when answering domain-specific queries. This intelligence is not static. It improves as more data is ingested: every game filmed, every player evaluated, every outcome recorded refines the system's calibration and deepens its accuracy. The more institutions on the platform, the more games processed, and the more evaluations validated against real outcomes, the better the intelligence becomes. The intelligence compounds with usage.

---

## Intelligence Routing

Not every query requires the full intelligence stack. The routing layer determines what context is needed and assembles only the relevant files.

A basketball evaluation query assembles: the basketball intelligence skill file, the player evaluation process (Engine 01), the relevant competitive-level legends (NCAA D1, NAIA, etc.), the KR calibration reference, and the KLVN normalization tables. A soccer scouting query assembles the soccer equivalents. An admissions evaluation query assembles the admissions intelligence domain files. A general question about campus life or scheduling routes to a lighter model with product knowledge only.

This routing architecture means Dipson can handle any domain the intelligence system covers without the user needing to specify which domain they are asking about. The classifier infers the domain from the query content and the user's active context (which brand, which mode, which screen they are on).

The context-awareness extends to the user's current screen. If a user is watching a game on KTV and asks "what defense are they running?" Dipson knows which game, which teams, and which players are involved. If a user is viewing a player's profile and asks "what's their development outlook?" Dipson pulls that player's data and responds with their specific evaluation. The half-screen contextual overlay (activated by double-tapping the Dipson icon) makes this interaction seamless: Dipson appears over whatever screen the user is on and responds in that context.

---

## RBAC Enforcement

Every Dipson interaction is governed by Role-Based Access Control. RBAC is not a filter applied after the response is generated. It is a constraint applied before the intelligence is assembled and during response generation.

What RBAC controls:

**What intelligence Dipson can access.** A head coach (R3) query about a player triggers the full evaluation pipeline. A fan (R11) query about the same player returns only public information (name, position, basic stats). The intelligence files loaded into the system prompt differ by role. A fan's query never assembles scouting reports, internal evaluations, or coaching intelligence.

**What actions Dipson can execute.** A head coach can ask Dipson to draft a recruiting communication, simulate a roster change, or generate a scouting report. A player (R8) can ask Dipson about their own development plan or schedule. A parent (R9) can ask about their child's upcoming games. The action space is role-bounded. Dipson will not execute an action the user's role does not authorize.

**What data Dipson can surface.** Scholarship allocation, NIL pool management, compliance data, and financial information are visible only to roles with the appropriate authority level. A player cannot see what other players are compensated. A fan cannot see internal program finances. The data access layer enforces these boundaries before any response is generated.

| Capability | R0-R1 (Leadership) | R2-R3 (Management) | R4-R5 (Staff/Player) | R8+ (External) |
|---|---|---|---|---|
| Ask questions | Yes | Yes | Yes | Yes |
| Navigate the app | Yes | Yes | Yes | Yes |
| Create tasks and requests | Yes | Yes | Yes | Limited |
| Approve or deny requests | Yes | Yes | No | No |
| High-impact actions | Yes | No | No | No |
| Cross-context intelligence search | Yes | No | No | No |
| Full scouting and evaluation | Yes | Yes | No | No |
| Personal data only | - | - | Yes | Yes |

---

## The Institutional Learning Loop

This is the capability that no general-purpose AI provides.

When Dipson cannot answer a question from the intelligence engines, institutional data, or its foundation model knowledge, it does not speculate. It escalates. The question is automatically routed to the person in the organization who is authorized to answer it, determined by RBAC. The user does not choose who receives the escalation. Dipson routes it based on the question's domain and the organizational authority structure.

The authorized person answers when they can. The answer is delivered back to the original user. Dipson absorbs the answer into institutional knowledge. The next time anyone in the organization asks the same question, Dipson knows.

A new coach asks how the team handles travel meal per diem. Dipson routes to the operations coordinator. The coordinator answers. Now Dipson knows permanently. A student asks about a campus policy that was just updated. Dipson routes to the office that owns the policy. Now every student gets the current answer immediately.

The institution gets smarter with every interaction. Knowledge compounds. When people leave the institution, the knowledge they contributed remains. The institutional intelligence survives personnel changes. This is a structural advantage that deepens with every interaction, every day, across every institution on the platform.

---

## Model-Agnostic Design

Dipson does not depend on any single AI model. It is designed to run on the best available foundation model at any given time. As AI labs compete to build better models, Dipson automatically improves.

KaNeXT does not build foundation models. It builds the governed institutional infrastructure that makes foundation models useful inside real organizations. The model is the commodity layer. The infrastructure (RBAC, intelligence engines, settlement layer, identity system, institutional data, escalation loop) is the proprietary layer.

No AI lab can replicate the RBAC architecture, the six intelligence engines, the settlement layer, the identity system, the institutional data, or the learning loop. They build the reasoning capability. KaNeXT builds the governed environment it operates in. This separation means KaNeXT benefits from every improvement in foundation model capability without being locked to any single provider.

Current implementation routes intelligence queries to Claude Sonnet (Anthropic) and general queries to Claude Haiku. These choices are performance and cost optimizations, not architectural dependencies. The routing layer can switch models without changing any user-facing behavior or intelligence architecture.

---

## Three Access Methods

**Full-screen Dipson page.** Standalone chat experience accessed by tapping the Dipson icon. Multi-turn conversations with full intelligence access based on role. Conversation history persisted. Projects and artifacts saved.

**Half-screen contextual overlay.** Activated by double-tapping the Dipson icon. Dipson appears as a bottom sheet over the current screen. Context-aware: Dipson knows what screen the user is viewing and responds accordingly. Drag up for full-screen, drag down to dismiss.

**Voice mode.** Activated by holding the Dipson icon. Full voice conversation with Dipson. Speak questions, receive spoken responses. Useful for coaching situations (hands-free game-day queries), student interactions, and accessibility.

---

## What Makes Dipson Different from General-Purpose AI

General-purpose AI assistants (ChatGPT, Gemini, etc.) have no identity awareness. They do not know who you are, what institution you belong to, or what you are authorized to see. Dipson knows all of this before you type a word.

General-purpose AI assistants have no governance. Anyone can ask anything and receive anything. Dipson constrains every response to the user's role, authority, and institutional context.

General-purpose AI assistants have no institutional memory. Every conversation starts from zero. Dipson accumulates institutional knowledge through the escalation and learning loop. The system gets smarter over time within each institution.

General-purpose AI assistants cannot execute governed actions. They can generate text about making a roster change or approving a transaction. Dipson can actually execute the roster change or route the approval, within the authority bounds of the user's role, with full audit trail.

General-purpose AI assistants do not integrate with settlement. A question about scholarship allocation in ChatGPT produces generic advice. The same question in Dipson produces the actual allocation data from KPay, the PTV analysis from the intelligence system, and the compliance status from the institutional governance layer - all scoped to the user's authority.

The six differentiators: identity-aware, RBAC-governed, institutionally learning, action-capable, settlement-integrated, and domain-intelligent across 50+ specified domains. No general-purpose AI provides any of these. Dipson provides all of them simultaneously.

---

## Disclaimer

This document describes the intended technical architecture. Actual implementation details may vary based on engineering decisions, model availability, API constraints, and institutional deployment requirements. The RBAC architecture, intelligence routing, and learning loop are specified in the product knowledge base and intelligence skill files. Production implementation will be validated through deployment at the partner institution under the Year 1 Athletics-Only Agreement and Year 2 Full IOA.
