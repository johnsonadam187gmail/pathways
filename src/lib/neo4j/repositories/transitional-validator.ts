// Transitional Validation Engine
// Validates graph mutations against the Universal Transitional Matrix
import { RelativeRole } from "../../types/enums";
import {
  PERMITTED_TRANSITIONS,
  type ValidationResult,
} from "../../types/validation";
import { TransitionValidationError } from "../../utils/errors";

export class TransitionalValidator {
  /**
   * Validate a role transition against the Universal Transitional Matrix.
   * Returns ok: true if permitted, or a ValidationResult with the violated rule.
   */
  validateTransition(
    fromRole: RelativeRole,
    toRole: RelativeRole,
  ): ValidationResult {
    // Check if the transition is in the permitted list
    const permitted = PERMITTED_TRANSITIONS.find(
      (t) => t.from === fromRole && t.to === toRole,
    );

    if (permitted) {
      return { ok: true };
    }

    // Find the rule number for the violated transition
    const ruleNumber = this.findRuleNumber(fromRole, toRole);
    return {
      ok: false,
      error: `Transition from ${fromRole} to ${toRole} is not permitted by the Universal Transitional Matrix`,
      rule_violated: ruleNumber,
    };
  }

  /**
   * Validate and throw on invalid transitions. Convenience for repository methods.
   */
  assertValidTransition(fromRole: RelativeRole, toRole: RelativeRole): void {
    const result = this.validateTransition(fromRole, toRole);
    if (!result.ok) {
      throw new TransitionValidationError(result.error, result.rule_violated);
    }
  }

  private findRuleNumber(
    fromRole: RelativeRole,
    toRole: RelativeRole,
  ): number | null {
    const ruleMap: Record<string, number> = {
      [`${RelativeRole.OFFENSIVE}->${RelativeRole.OFFENSIVE}`]: 1,
      [`${RelativeRole.DEFENSIVE}->${RelativeRole.DEFENSIVE}`]: 2,
      [`${RelativeRole.OFFENSIVE}->${RelativeRole.DEFENSIVE}`]: 3,
      [`${RelativeRole.DEFENSIVE}->${RelativeRole.OFFENSIVE}`]: 4,
      [`${RelativeRole.NEUTRAL}->${RelativeRole.OFFENSIVE}`]: 5,
      [`${RelativeRole.NEUTRAL}->${RelativeRole.DEFENSIVE}`]: 6,
      [`${RelativeRole.DEFENSIVE}->${RelativeRole.NEUTRAL}`]: 7,
      [`${RelativeRole.NEUTRAL}->${RelativeRole.NEUTRAL}`]: 8,
      [`${RelativeRole.SYMMETRICAL_DANGER}->${RelativeRole.SYMMETRICAL_DANGER}`]: 8,
    };

    return ruleMap[`${fromRole}->${toRole}`] ?? null;
  }
}
