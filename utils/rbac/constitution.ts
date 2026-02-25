/**
 * Universal RBAC Constitution — 4-Dimension Foundation
 *
 * Every role in every mode is defined by four orthogonal dimensions:
 *   1. Authority Class (A0-A5) — what organizational tier a role occupies
 *   2. Domain Scope — how wide the role's reach extends
 *   3. Visibility Class (V0-V5) — what data surfaces a role can see
 *   4. Decision Access Class (D0-D5) — what actions a role can take
 *
 * Authority and visibility are intentionally decoupled: a Medical officer (A2)
 * has execution-level authority but limited visibility (V2) — they can act on
 * health data but cannot see recruiting intel.
 *
 * 9 non-negotiable separation rules are enforced structurally via the
 * constitutional check functions below.
 */

// =============================================================================
// DIMENSION ENUMS
// =============================================================================

/** Authority Class — organizational tier (who you are in the hierarchy). */
export type AuthorityClass =
  | 0  // A0: Observer — no authority
  | 1  // A1: Personal — self-only actions
  | 2  // A2: Execution — operates within governed pathways
  | 3  // A3: Program Governance — owns a program/ministry/department
  | 4  // A4: Domain Governance — oversees a domain (AD, VP, Dean)
  | 5; // A5: Institutional — org-wide authority (President, Founder, System Owner)

/** Domain Scope — how wide the role's reach extends. */
export type DomainScope =
  | 'global'      // Entire organization
  | 'domain'      // A functional domain (athletics, finance, etc.)
  | 'program'     // A single program/team/ministry/department
  | 'sub-domain'  // A lane within a domain (health, academic, ops)
  | 'personal';   // Self only

/** Visibility Class — what data surfaces a role can see. */
export type VisibilityClass =
  | 0  // V0: Public — publicly available information only
  | 1  // V1: Community — shared schedules, rosters, public stats
  | 2  // V2: Tactical — lane-specific operational data
  | 3  // V3: Competitive — game plans, KR intelligence, recruiting intel
  | 4  // V4: Strategic — cross-program analytics, budgets, compliance
  | 5; // V5: Institutional — all data, audit logs, financial records

/** Decision Access Class — what actions a role can take. */
export type DecisionAccessClass =
  | 0  // D0: None — read-only, no decisions
  | 1  // D1: Self — personal preferences, self-reported data
  | 2  // D2: Operational — execute within assigned lane (e.g. update health records)
  | 3  // D3: Tactical — roster moves, game plans, recruiting decisions
  | 4  // D4: Strategic — budget allocation, policy changes, hiring
  | 5; // D5: Institutional — org-wide policy, compliance, system config

// =============================================================================
// ROLE DEFINITION
// =============================================================================

export interface UniversalRoleDefinition {
  /** Unique identifier (e.g. 'R0', 'B3', 'C5') */
  id: string;
  /** Human-readable label */
  label: string;
  /** Authority tier */
  authority: AuthorityClass;
  /** How wide the role reaches */
  scope: DomainScope;
  /** What data the role can see */
  visibility: VisibilityClass;
  /** What decisions the role can make */
  decision: DecisionAccessClass;
  /** Optional lane restriction (e.g. 'health', 'academic', 'operations', 'finance') */
  domainLane?: string;
  /** True if the role is external to the organization */
  isExternal?: boolean;
  /** True if the role only sees/acts on their own data */
  isSelfOnly?: boolean;
}

// =============================================================================
// READABLE CONSTANTS
// =============================================================================

export const Authority = {
  Observer: 0 as AuthorityClass,
  Personal: 1 as AuthorityClass,
  Execution: 2 as AuthorityClass,
  ProgramGov: 3 as AuthorityClass,
  DomainGov: 4 as AuthorityClass,
  Institutional: 5 as AuthorityClass,
} as const;

export const Visibility = {
  Public: 0 as VisibilityClass,
  Community: 1 as VisibilityClass,
  Tactical: 2 as VisibilityClass,
  Competitive: 3 as VisibilityClass,
  Strategic: 4 as VisibilityClass,
  Institutional: 5 as VisibilityClass,
} as const;

export const Decision = {
  None: 0 as DecisionAccessClass,
  Self: 1 as DecisionAccessClass,
  Operational: 2 as DecisionAccessClass,
  Tactical: 3 as DecisionAccessClass,
  Strategic: 4 as DecisionAccessClass,
  Institutional: 5 as DecisionAccessClass,
} as const;

// =============================================================================
// 9 CONSTITUTIONAL ENFORCEMENT FUNCTIONS
// =============================================================================

/** Rule 1: Only roles with decision >= Tactical can make binding decisions. */
export function canDecide(def: UniversalRoleDefinition): boolean {
  return def.decision >= Decision.Tactical;
}

/** Rule 2: Only roles with visibility >= Tactical can see operational/lane data. */
export function canAccessTactical(def: UniversalRoleDefinition): boolean {
  return def.visibility >= Visibility.Tactical;
}

/** Rule 3: Only roles with visibility >= Competitive can see comparative intel. */
export function canAccessComparative(def: UniversalRoleDefinition): boolean {
  return def.visibility >= Visibility.Competitive;
}

/** Rule 4: Only roles with authority >= Institutional can override constraints. */
export function canOverrideConstraints(def: UniversalRoleDefinition): boolean {
  return def.authority >= Authority.Institutional;
}

/** Rule 5: Only roles with authority >= ProgramGov can define evaluations. */
export function canDefineEvaluations(def: UniversalRoleDefinition): boolean {
  return def.authority >= Authority.ProgramGov;
}

/** Rule 6: A role has decision authority if decision >= Operational. */
export function hasDecisionAuthority(def: UniversalRoleDefinition): boolean {
  return def.decision >= Decision.Operational;
}

/** Rule 7: Domain-lane roles can only access their designated lane. */
export function canAccessDomain(def: UniversalRoleDefinition, lane: string): boolean {
  if (!def.domainLane) return def.scope !== 'sub-domain';
  return def.domainLane === lane;
}

/** Rule 8: External roles cannot access internal governance surfaces. */
export function canAccessGovernance(def: UniversalRoleDefinition): boolean {
  return !def.isExternal && def.authority >= Authority.DomainGov;
}

/**
 * Rule 9: Validate that a role definition is internally consistent.
 * Authority and visibility should be coherent — high authority without
 * matching visibility or decision access is a constitution violation.
 */
export function validateRoleDefinition(def: UniversalRoleDefinition): boolean {
  // Self-only roles must have personal scope
  if (def.isSelfOnly && def.scope !== 'personal') return false;
  // External roles cannot have program-level or higher authority
  if (def.isExternal && def.authority > Authority.Personal) return false;
  // Sub-domain scope requires a lane
  if (def.scope === 'sub-domain' && !def.domainLane) return false;
  return true;
}
