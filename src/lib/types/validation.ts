// Transitional Matrix Types & Constants
import { RelativeRole } from "./enums";

// ─── Transition Role Pair ─────────────────────────────────────────────────────
export interface TransitionPair {
  from: RelativeRole;
  to: RelativeRole;
}

// ─── Permitted Transitions ────────────────────────────────────────────────────
// Purely Offensive: positional advancement up dominance hierarchy
// Purely Defensive: guard recovery or damage mitigation
// Offensive to Defensive: attack fails/intercepted, loss of initiative
// Defensive to Offensive: counter-attack, steal initiative
// Neutral to Offensive: force dominant opening from equal start
// Neutral to Defensive: concede ground from equal start
// Escape to Reset: break out of control back to clean slate
// Pure Symmetry: grip fighting, pummeling, neutral shootouts
// Terminal Sink: definitive end of the loop (submission tap)

export const PERMITTED_TRANSITIONS: readonly TransitionPair[] = [
  // 1: O → O — Positional advancement
  { from: RelativeRole.OFFENSIVE, to: RelativeRole.OFFENSIVE },
  // 2: D → D — Guard recovery / damage mitigation
  { from: RelativeRole.DEFENSIVE, to: RelativeRole.DEFENSIVE },
  // 3: O → D — Attack fails / intercepted
  { from: RelativeRole.OFFENSIVE, to: RelativeRole.DEFENSIVE },
  // 4: D → O — Counter-attack
  { from: RelativeRole.DEFENSIVE, to: RelativeRole.OFFENSIVE },
  // 5: N → O — Force dominant opening
  { from: RelativeRole.NEUTRAL, to: RelativeRole.OFFENSIVE },
  // 6: N → D — Concede ground
  { from: RelativeRole.NEUTRAL, to: RelativeRole.DEFENSIVE },
  // 7: D → N — Escape to reset
  { from: RelativeRole.DEFENSIVE, to: RelativeRole.NEUTRAL },
  // 8a: N → N — Neutral symmetry
  { from: RelativeRole.NEUTRAL, to: RelativeRole.NEUTRAL },
  // 8b: S → S — Symmetrical danger symmetry
  {
    from: RelativeRole.SYMMETRICAL_DANGER,
    to: RelativeRole.SYMMETRICAL_DANGER,
  },
];

// ─── Validation Result ────────────────────────────────────────────────────────
export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string; rule_violated: number | null };
