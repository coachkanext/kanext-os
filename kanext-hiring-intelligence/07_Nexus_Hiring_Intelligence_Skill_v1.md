# KaNeXT Hiring Intelligence - Master Skill

## HOW THIS WORKS
The Hiring Intelligence system is split across 5 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what's being asked.

**CRITICAL:** File 02 (Reference) is the largest file. NEVER load the whole thing. Search it for specific sections using the search terms below.

## ROUTING TABLE

### "Evaluate this candidate" / "What's their KR?" / "Rate [person]"

**FIRST: Determine the data tier.** If evaluating from resume + public record only (no interviews, no references, no work product review), this is V1. Most initial candidate screens are V1.

**V1 evaluations (resume + public record):**
-> Search **File 01** for "V1 EVALUATION PROTOCOL" and follow the pipeline:
  1. Set Hiring Context (role, department, level, institutional need)
  2. Phase 3 - Production Anchor (map career record against role type legend tiers)
  3. Phase 6 - Component KR scoring (CKR, LKR, FKR, GKR) with proxy confidence weighting
  4. Phase 6 adjusts within Phase 3 +/-10
  5. Final Candidate KR output
-> Search **File 02** for specific reference lookups as needed during evaluation (competency bands, role type legends, KLVN)
-> For legend interpretation: search the **Role Type Legend matching the position** (e.g., Head Coach legend for a basketball HC candidate, C-Suite legend for a CFO candidate)

**V2 evaluations (resume + interview + references):**
-> Search **File 01** for the standard pipeline steps (Master Execution Flow)
-> Search **File 02** for specific lookups during evaluation:
  - Competency scoring: search "Competency Clusters" or [cluster name]
  - System Fit: search "SYSTEM FIT"
  - Suppression detection: search "SUPPRESSION"
  - Risk flags: search "HIRING RISK FLAGS"
  - KLVN normalization: search "KLVN"
  - Coaching staff specifics: search "COACHING STAFF"

**V3 evaluations (full loop + work product + on-site + deep references):**
-> Search **File 01** for the full pipeline
-> All component KRs score at full confidence
-> Suppression detection runs with maximum data

### Role Type Legend routing (9 role types):
- C-Suite/Executive -> search File 02 for "C-SUITE LEGEND"
- Head Coach (any sport) -> search File 02 for "HEAD COACH LEGEND"
- Assistant Coach -> search File 02 for "ASSISTANT COACH LEGEND"
- Faculty (tenure-track) -> search File 02 for "TENURE-TRACK FACULTY LEGEND"
- Faculty (adjunct/instructor) -> search File 02 for "ADJUNCT FACULTY LEGEND"
- Admissions/Enrollment Staff -> search File 02 for "ADMISSIONS LEGEND"
- Campus Operations Staff -> search File 02 for "CAMPUS OPERATIONS LEGEND"
- Technology/Engineering -> search File 02 for "TECHNOLOGY LEGEND"
- Administrative/Support -> search File 02 for "ADMINISTRATIVE LEGEND"

### "Evaluate this department" / "Department KR" / "Team analysis"
-> Search **File 03** (Team Intelligence) for "Department KR" pipeline
-> Requires individual Candidate KRs or Employee KRs as input (run Mode 1 first if needed)

### "Does this person fit our culture?" / "System Fit" / "Culture assessment"
-> Search **File 02** for "SYSTEM FIT" section
-> Requires Hiring Context locked

### "What should we pay?" / "Comp analysis" / "Market rate"
-> Search **File 02** for "COMPENSATION INTELLIGENCE"
-> Requires role type, market context, and candidate KR

### "Development plan" / "What does this person need?" / "Promotion path"
-> Search **File 06** (Downstream Engines) for "Development Planning"
-> Requires employee KR as input

### "Flight risk" / "Retention" / "Will they leave?"
-> Search **File 06** (Downstream Engines) for "Retention Intelligence"
-> Requires employee KR and engagement data

### "Succession plan" / "Who replaces [person]?" / "Depth chart"
-> Search **File 06** (Downstream Engines) for "Succession Engine"
-> Requires department KR and individual KRs

### "Onboarding plan" / "30/60/90" / "New hire ramp"
-> Search **File 06** (Downstream Engines) for "Onboarding Intelligence"
-> Requires finalized Candidate KR from hiring process

### "Evaluate this coaching candidate" / "Coaching hire" / "HC search"
-> Search **File 02** for "COACHING STAFF SPECIFIC"
-> ALSO search the **sports intelligence SKILL.md** for system identity, offensive/defensive system definitions
-> Coaching hires require cross-reference: the candidate's coaching philosophy must be evaluated against the system identity KaNeXT wants to build at the target institution
-> Recruiting network value requires web search for the candidate's placement history

### "Skill gap" / "What are we missing?" / "Who do we need to hire?"
-> Search **File 03** (Team Intelligence) for "Skill Gap Analysis"
-> Requires department KR composition data

### "Org chart" / "Reporting structure" / "Headcount planning"
-> Search **File 03** (Team Intelligence) for "Organizational Intelligence"

### "Compare these candidates" / "Who should we hire?" / "Rank the finalists"
-> Search **File 04** (Comparison Engine) for "COMPARISON FRAMEWORK"
-> Requires finalized Candidate KRs for all finalists (run Mode 1 first if needed)
-> For coaching hires: also search File 04 for "COACHING HIRE COMPARISON" (recruiting network complementarity, pipeline coherence impact)
-> For batch hiring (multiple roles simultaneously): search File 04 for "BATCH COMPARISON MODE"

### "Which candidate gives us the best team?" / "Optimal assignment" / "Draft optimization"
-> Search **File 04** (Comparison Engine) for "SCENARIO MODELING"
-> Multiple roles + candidate pool: search for "Multiple Roles, Candidate Pool"
-> Hire now vs wait: search for "Hire Now vs Wait"
-> Promote internal vs hire external: search for "Succession Promotion vs External Hire"

### "Interview plan" / "What should we ask?" / "Interview structure"
-> Search **File 05** (Interview Ops) for "PRE-SCREEN PACKET" (generates tailored interview questions based on V1 evaluation gaps)
-> Search **File 05** for "INTERVIEW EXECUTION" for the structured interview protocol

### "Debrief" / "Score the interview" / "Should we advance this candidate?"
-> Search **File 05** (Interview Ops) for "DEBRIEF PHASE"
-> Requires interviewer scorecards submitted independently

### "Make an offer" / "Offer structure" / "Compensation package"
-> Search **File 05** (Interview Ops) for "OFFER STAGE"
-> Cross-reference with **File 02** Compensation Intelligence (Section 8) and Deal Structure Templates (Section 9)

### "Hiring pipeline" / "Time to fill" / "Hiring metrics"
-> Search **File 05** (Interview Ops) for "HIRING PIPELINE ANALYTICS"

## UNIVERSAL RULES (Apply to EVERY response)

1. **Deterministic:** Same inputs produce same outputs. No randomness.
2. **No fabrication:** Missing data = UNSCORED. Never guess a candidate's competency, history, or character. If references were not checked, reference-dependent traits are UNSCORED.
3. **Confidence always shown:** Every output includes confidence %.
4. **Downstream never modifies upstream:** Development planning, retention monitoring, succession planning - they consume Candidate KR and Employee KR but NEVER change them.
5. **KLVN normalizes INPUTS, not OUTPUTS:** Lambda adjusts career achievement context during competency scoring. A candidate from a Fortune 500 company and a candidate from a 10-person startup have their achievements normalized to compare fairly. The final Candidate KR is ONE universal number.
6. **KR is universal:** DO NOT report separate KR numbers for different role contexts. One candidate = one KR = multiple role type legend interpretations.
7. **Legends are display-only:** They interpret KR. They don't produce KR.
8. **Suppression detection is mandatory:** KaNeXT's entire thesis is that environment suppresses talent. Every candidate evaluation MUST assess whether their record was suppressed by a bad organization, limited role, insufficient resources, or systemic bias. A suppressed candidate with a KR of 72 and evidence of environment suppression may project to 80-85 in the right setting.
9. **Web search for current data:** Always search for current employment, publications, coaching records, and public professional information when evaluating real candidates. The knowledge files contain the SYSTEM - web search provides the DATA about specific people.
10. **Coaching staff cross-reference is mandatory:** Any coaching hire at any sport must be evaluated against the sports intelligence system's definitions of offensive and defensive system identity. A basketball HC candidate who runs Princeton offense must be assessed against the Princeton system demand profile. This is non-negotiable.
11. **No em dashes in any output.** Use regular dashes or rewrite sentences.

## MODE SUMMARY

| Mode | Purpose | Primary File |
|---|---|---|
| 1 | Candidate Evaluation | File 01 + File 02 |
| 2 | Team Composition Analysis | File 03 |
| 3 | System Fit Assessment | File 02 |
| 4 | Compensation Intelligence | File 02 |
| 5 | Candidate Comparison | File 04 |
| 6 | Interview and Hiring Ops | File 05 |
| 7 | Development Planning | File 06 |
| 8 | Retention Intelligence | File 06 |
| 9 | Succession Planning | File 06 |
| 10 | Coaching Staff Intelligence | File 02 + Sports Intelligence SKILL.md |

## FILE INVENTORY

| # | File | Contents |
|---|------|----------|
| 01 | Hiring Eval Process | Pipeline steps, Hiring Context, Suppression Detection, Confidence Gate |
| 02 | Hiring Eval Reference | Competency Clusters, Role Type Legends, KLVN, System Fit, Coaching Staff Module, Compensation, Risk Flags, Deal Structures |
| 03 | Hiring Team Intelligence | Department KR pipeline, Skill Gap Analysis, Succession Depth Chart, Compensation Equity, Org Intelligence |
| 04 | Hiring Comparison Engine | Head-to-head finalist comparison, 6-dimension ranking, scenario modeling, batch mode, coaching-specific comparison, interaction tables |
| 05 | Interview and Hiring Ops | Pre-Screen protocol, structured interview execution, scoring rubrics, debrief process, offer construction, close/onboard handoff, pipeline analytics, confidence gates |
| 06 | Hiring Downstream Engines | Onboarding Intelligence, Performance Monitoring, Development Planning, Retention Engine, Succession Engine |
