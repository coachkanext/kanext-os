from __future__ import annotations
"""
Scholarship & NIL Allocation Engine
Downstream of Player KR + Team KR — recommendation-only.

Reference:
  spec: Scholarship & NIL Allocation Engine.pdf

A deterministic recommendation engine that allocates:
  - athletic scholarship % (equivalency-based)
  - NIL $ (budget-based)
to players based on:
  - player truth (KRs + confidence)
  - team needs (coverage / missing demands)
  - coach constraints (scholarship cap + NIL pool)

Rule: This engine recommends only. Coach confirms.
This engine does NOT modify any Player KR or Team KR.
"""

import math

# ═══════════════════════════════════════════════════════════════════════════
# SCHOLARSHIP EQUIVALENCY CAPS — by governing body
# ═══════════════════════════════════════════════════════════════════════════

SCHOLARSHIP_CAPS: dict[str, float] = {
    # NCAA
    "ncaa_d1_high_major": 13.0,
    "ncaa_d1_mid_major":  13.0,
    "ncaa_d1_low_major":  13.0,
    "ncaa_d2":            10.0,
    "ncaa_d3":             0.0,  # no athletic scholarships
    # NAIA
    "naia":               11.0,
    # NJCAA
    "njcaa_d1":           15.0,
    "njcaa_d2":            0.0,  # no athletic scholarships
    "njcaa_d3":            0.0,  # no athletic scholarships
    # CCCAA
    "cccaa":               0.0,  # no athletic scholarships (California CC)
    # Others
    "uscaa":               0.0,
    "nccaa_d1":            8.0,
    "nccaa_d2":            0.0,
}

# ═══════════════════════════════════════════════════════════════════════════
# PRIORITY TIERS — KR-based classification
# ═══════════════════════════════════════════════════════════════════════════

TIER_THRESHOLDS = {
    "Core":        70,   # overall_kr >= 70
    "Rotation":    58,   # overall_kr >= 58
    "Depth":       45,   # overall_kr >= 45
    "Development":  0,   # everyone else
}


def classify_tier(overall_kr: float) -> str:
    """Classify player into priority tier based on overall KR."""
    if overall_kr >= TIER_THRESHOLDS["Core"]:
        return "Core"
    elif overall_kr >= TIER_THRESHOLDS["Rotation"]:
        return "Rotation"
    elif overall_kr >= TIER_THRESHOLDS["Depth"]:
        return "Depth"
    else:
        return "Development"


# ═══════════════════════════════════════════════════════════════════════════
# NEED SCARCITY — how much does team need this player's position/archetype?
# ═══════════════════════════════════════════════════════════════════════════

# Canonical cluster demands by position
POSITION_DEMANDS: dict[str, list[str]] = {
    "PG": ["playmaking", "shooting", "on_ball_defense"],
    "CG": ["shooting", "playmaking", "on_ball_defense"],
    "W":  ["shooting", "on_ball_defense", "finishing"],
    "F":  ["finishing", "rebounding", "team_defense"],
    "B":  ["team_defense", "rebounding", "finishing"],
}


def compute_need_scarcity(
    player_clusters: dict[str, float],
    player_position: str,
    team_cluster_averages: dict[str, float],
) -> float:
    """
    Compute need scarcity score (0-100).
    High score = team badly needs what this player provides.
    """
    demands = POSITION_DEMANDS.get(player_position, ["shooting", "finishing", "on_ball_defense"])

    gaps = []
    for cluster in demands:
        team_avg = team_cluster_averages.get(cluster, 50)
        player_score = player_clusters.get(cluster, 50)
        # Gap: how much player exceeds team average in a needed area
        gap = max(0, player_score - team_avg)
        # Weight inversely by team strength (weaker areas = bigger need)
        need_weight = max(0.5, (65 - team_avg) / 30) if team_avg < 65 else 0.5
        gaps.append(gap * need_weight)

    if not gaps:
        return 50.0
    return min(100, max(0, round(sum(gaps) / len(gaps) * 2, 1)))


def compute_fit_pct(
    player_clusters: dict[str, float],
    player_position: str,
    off_system: str | None,
    def_system: str | None,
) -> dict[str, float]:
    """
    Compute offensive, defensive, and overall fit percentages.
    Based on how well the player's cluster scores match system demands.
    """
    from impact_scores import OFF_SYSTEM_MODIFIERS, DEF_SYSTEM_MODIFIERS

    off_clusters = ["shooting", "finishing", "playmaking"]
    def_clusters = ["on_ball_defense", "team_defense", "rebounding", "physical"]

    # Offensive fit: weighted by system modifier importance
    off_mods = OFF_SYSTEM_MODIFIERS.get(off_system or "", {})
    off_scores = []
    for c in off_clusters:
        score = player_clusters.get(c, 50)
        importance = off_mods.get(c, 1.0)
        # Higher importance clusters matter more for fit
        off_scores.append(score * importance)
    off_fit = sum(off_scores) / len(off_scores) if off_scores else 50

    # Defensive fit
    def_mods = DEF_SYSTEM_MODIFIERS.get(def_system or "", {})
    def_scores = []
    for c in def_clusters:
        score = player_clusters.get(c, 50)
        importance = def_mods.get(c, 1.0)
        def_scores.append(score * importance)
    def_fit = sum(def_scores) / len(def_scores) if def_scores else 50

    overall_fit = off_fit * 0.53 + def_fit * 0.47

    return {
        "off_fit_pct": round(min(100, off_fit), 1),
        "def_fit_pct": round(min(100, def_fit), 1),
        "overall_fit_pct": round(min(100, overall_fit), 1),
    }


# ═══════════════════════════════════════════════════════════════════════════
# SCHOLARSHIP ALLOCATION
# ═══════════════════════════════════════════════════════════════════════════

# Base scholarship % by tier (before adjustments)
TIER_BASE_SCHOLARSHIP: dict[str, float] = {
    "Core":        100.0,  # Full ride base
    "Rotation":     65.0,
    "Depth":        35.0,
    "Development":  15.0,
}


def allocate_scholarships(
    players: list[dict],
    available_equivalents: float,
    level_key: str,
) -> list[dict]:
    """
    Allocate scholarship % to players.

    players: list of dicts with:
        - player_id, player_team_season_id
        - overall_kr, base_off_kr, base_def_kr
        - confidence_pct
        - primary_archetype
        - participation_pct
        - clusters: dict[str, float]
        - position: str
        - need_scarcity: float (computed upstream)

    available_equivalents: total scholarship equivalents available

    Returns list of allocation dicts.
    """
    cap = SCHOLARSHIP_CAPS.get(level_key, 0)
    if cap == 0:
        # No athletic scholarships at this level
        return [
            {
                **p,
                "tier": classify_tier(p["overall_kr"]),
                "recommended_scholarship_pct": 0.0,
                "scholarship_equivalent": 0.0,
                "justification": f"No athletic scholarships at {level_key}",
                "warnings": [],
            }
            for p in players
        ]

    effective_cap = min(available_equivalents, cap)

    # Sort by overall KR descending (deterministic)
    sorted_players = sorted(players, key=lambda p: -p["overall_kr"])

    results = []
    equivalents_used = 0.0

    for p in sorted_players:
        tier = classify_tier(p["overall_kr"])
        base_pct = TIER_BASE_SCHOLARSHIP[tier]

        # Adjust by confidence: low confidence = reduced allocation
        conf = p.get("confidence_pct", 50) / 100.0
        conf_adj = 0.7 + 0.3 * conf  # range 0.7-1.0

        # Adjust by need scarcity: high need = boost
        scarcity = p.get("need_scarcity", 50)
        need_adj = 0.85 + 0.15 * (scarcity / 100.0)  # range 0.85-1.0

        # Adjusted scholarship %
        adjusted_pct = min(100, base_pct * conf_adj * need_adj)

        # Convert to equivalents
        equiv = adjusted_pct / 100.0

        # Check remaining budget
        remaining = effective_cap - equivalents_used
        if equiv > remaining:
            equiv = max(0, remaining)
            adjusted_pct = equiv * 100.0

        equivalents_used += equiv

        # Build warnings
        warnings = []
        if p.get("confidence_pct", 50) < 40 and adjusted_pct >= 50:
            warnings.append(f"Allocation risk: confidence {p.get('confidence_pct', 50)}% < 40% threshold")
        if tier == "Development" and adjusted_pct > 25:
            warnings.append(f"Development-tier player receiving {adjusted_pct:.0f}% scholarship")

        # Justification
        justification_parts = [
            f"KR {p['overall_kr']:.1f}",
            f"tier={tier}",
            f"conf={p.get('confidence_pct', 50)}%",
        ]
        if scarcity >= 60:
            justification_parts.append(f"high need ({scarcity:.0f})")
        justification = " · ".join(justification_parts)

        results.append({
            **p,
            "tier": tier,
            "recommended_scholarship_pct": round(adjusted_pct, 1),
            "scholarship_equivalent": round(equiv, 3),
            "justification": justification,
            "warnings": warnings,
        })

    return results


# ═══════════════════════════════════════════════════════════════════════════
# NIL ALLOCATION
# ═══════════════════════════════════════════════════════════════════════════

def allocate_nil(
    players: list[dict],
    nil_pool: float,
) -> list[dict]:
    """
    Allocate NIL $ to players from a fixed pool.

    players: list of allocation dicts (from allocate_scholarships output,
             or fresh list with overall_kr, confidence_pct, need_scarcity, tier).

    nil_pool: total NIL budget in $.

    Returns list of dicts with recommended_nil_amount added.
    """
    if nil_pool <= 0 or not players:
        return [
            {**p, "recommended_nil_amount": 0.0, "nil_justification": "No NIL pool"}
            for p in players
        ]

    # Compute NIL weight for each player: KR-based + need scarcity + confidence
    weighted = []
    for p in players:
        kr = p.get("overall_kr", 50)
        conf = p.get("confidence_pct", 50) / 100.0
        scarcity = p.get("need_scarcity", 50) / 100.0
        participation = p.get("participation_pct", 0) / 100.0

        # NIL weight formula:
        # KR contribution (50%) + scarcity (25%) + participation (15%) + confidence (10%)
        kr_w = (kr / 100.0) ** 1.5  # Exponential: top players get disproportionately more
        scarcity_w = scarcity
        part_w = min(1.0, participation * 2)  # cap at 50%+ minutes
        conf_w = conf

        weight = (
            0.50 * kr_w
            + 0.25 * scarcity_w
            + 0.15 * part_w
            + 0.10 * conf_w
        )
        weighted.append({**p, "_nil_weight": max(0.01, weight)})

    total_weight = sum(w["_nil_weight"] for w in weighted)

    results = []
    nil_used = 0.0

    for w in weighted:
        share = w["_nil_weight"] / total_weight if total_weight > 0 else 0
        amount = round(nil_pool * share, 2)

        # Respect pool cap
        remaining = nil_pool - nil_used
        amount = min(amount, remaining)
        nil_used += amount

        # NIL justification
        nil_parts = [f"KR {w['overall_kr']:.1f}"]
        if w.get("need_scarcity", 0) >= 60:
            nil_parts.append("high demand")
        if w.get("participation_pct", 0) >= 15:
            nil_parts.append(f"part={w.get('participation_pct', 0):.0f}%")
        nil_justification = " · ".join(nil_parts)

        # Warnings
        nil_warnings = list(w.get("warnings", []))
        if w.get("confidence_pct", 50) < 40 and amount > nil_pool * 0.10:
            nil_warnings.append(
                f"NIL allocation risk: ${amount:,.0f} to player with "
                f"confidence {w.get('confidence_pct', 50)}%"
            )

        result = {k: v for k, v in w.items() if not k.startswith("_")}
        result["recommended_nil_amount"] = amount
        result["nil_justification"] = nil_justification
        result["warnings"] = nil_warnings
        results.append(result)

    return results


# ═══════════════════════════════════════════════════════════════════════════
# CONSTRAINTS / WARNINGS
# ═══════════════════════════════════════════════════════════════════════════

def compute_allocation_warnings(
    allocations: list[dict],
    available_equivalents: float,
    nil_pool: float,
    level_key: str,
    team_cluster_averages: dict[str, float] | None = None,
) -> list[str]:
    """
    Produce constraint/warning messages per spec requirements.
    """
    warnings = []

    # Total equivalents check
    total_equiv = sum(a.get("scholarship_equivalent", 0) for a in allocations)
    cap = SCHOLARSHIP_CAPS.get(level_key, 0)
    if total_equiv > min(available_equivalents, cap):
        warnings.append(
            f"Scholarship cap exceeded: {total_equiv:.2f} equivalents used "
            f"vs {min(available_equivalents, cap):.2f} available"
        )

    # NIL pool check
    total_nil = sum(a.get("recommended_nil_amount", 0) for a in allocations)
    if total_nil > nil_pool * 1.001:  # small float tolerance
        warnings.append(
            f"NIL pool exceeded: ${total_nil:,.0f} allocated vs ${nil_pool:,.0f} pool"
        )

    # Unfunded critical demands
    if team_cluster_averages:
        critical_threshold = 40  # cluster avg below this = critical need
        for cluster, avg in team_cluster_averages.items():
            if avg < critical_threshold:
                # Check if any Core/Rotation player addresses this
                addressed = False
                for a in allocations:
                    if a.get("tier") in ("Core", "Rotation"):
                        player_score = a.get("clusters", {}).get(cluster, 50)
                        if player_score >= 60:
                            addressed = True
                            break
                if not addressed:
                    warnings.append(f"Unfunded critical demand: {cluster} (team avg {avg:.0f})")

    # Low-confidence allocations
    for a in allocations:
        conf = a.get("confidence_pct", 50)
        schol = a.get("recommended_scholarship_pct", 0)
        nil_amt = a.get("recommended_nil_amount", 0)
        if conf < 40 and (schol >= 50 or nil_amt >= nil_pool * 0.08):
            warnings.append(
                f"Allocation risk: confidence {conf}% < threshold for "
                f"{a.get('primary_archetype', 'unknown')} "
                f"(schol={schol:.0f}%, NIL=${nil_amt:,.0f})"
            )

    return warnings


# ═══════════════════════════════════════════════════════════════════════════
# FULL ALLOCATION — orchestrates scholarship + NIL + warnings
# ═══════════════════════════════════════════════════════════════════════════

def run_allocation(
    players: list[dict],
    level_key: str,
    available_equivalents: float | None = None,
    nil_pool: float = 0.0,
    team_cluster_averages: dict[str, float] | None = None,
    off_system: str | None = None,
    def_system: str | None = None,
) -> dict:
    """
    Full allocation pipeline.

    players: list of dicts with:
        - player_id, player_team_season_id
        - overall_kr, base_off_kr, base_def_kr
        - confidence_pct
        - primary_archetype
        - participation_pct
        - clusters: dict[str, float]
        - position: str

    Returns:
        - allocations: list of per-player allocation dicts
        - totals: scholarship equiv used, NIL used
        - warnings: list of constraint/warning strings
    """
    # Default cap from governing body if not overridden
    if available_equivalents is None:
        available_equivalents = SCHOLARSHIP_CAPS.get(level_key, 0)

    # Compute need scarcity + fit for each player
    enriched = []
    for p in players:
        clusters = p.get("clusters", {})
        position = p.get("position", "W")

        scarcity = compute_need_scarcity(
            clusters, position, team_cluster_averages or {}
        )
        fit = compute_fit_pct(clusters, position, off_system, def_system)

        enriched.append({
            **p,
            "need_scarcity": scarcity,
            **fit,
        })

    # Scholarship allocation
    scholarship_results = allocate_scholarships(enriched, available_equivalents, level_key)

    # NIL allocation
    final_results = allocate_nil(scholarship_results, nil_pool)

    # Totals
    total_equiv = sum(a.get("scholarship_equivalent", 0) for a in final_results)
    total_nil = sum(a.get("recommended_nil_amount", 0) for a in final_results)

    # Warnings
    allocation_warnings = compute_allocation_warnings(
        final_results, available_equivalents, nil_pool,
        level_key, team_cluster_averages,
    )

    return {
        "allocations": final_results,
        "totals": {
            "scholarship_equivalents_used": round(total_equiv, 3),
            "scholarship_equivalents_available": available_equivalents,
            "scholarship_cap": SCHOLARSHIP_CAPS.get(level_key, 0),
            "nil_pool": nil_pool,
            "nil_used": round(total_nil, 2),
        },
        "warnings": allocation_warnings,
        "level_key": level_key,
    }
