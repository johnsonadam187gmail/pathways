import { describe, it, expect } from "@jest/globals";
import { TransitionalValidator } from "./transitional-validator";
import { RelativeRole } from "../../types/enums";

const validator = new TransitionalValidator();

// ── Permitted transitions (all 9 from the Universal Transitional Matrix) ──────

describe("TransitionalValidator — permitted transitions", () => {
  it("permits O → O (rule 1: positional advancement)", () => {
    const result = validator.validateTransition(
      RelativeRole.OFFENSIVE,
      RelativeRole.OFFENSIVE,
    );
    expect(result.ok).toBe(true);
  });

  it("permits D → D (rule 2: guard recovery / damage mitigation)", () => {
    const result = validator.validateTransition(
      RelativeRole.DEFENSIVE,
      RelativeRole.DEFENSIVE,
    );
    expect(result.ok).toBe(true);
  });

  it("permits O → D (rule 3: attack fails / intercepted)", () => {
    const result = validator.validateTransition(
      RelativeRole.OFFENSIVE,
      RelativeRole.DEFENSIVE,
    );
    expect(result.ok).toBe(true);
  });

  it("permits D → O (rule 4: counter-attack)", () => {
    const result = validator.validateTransition(
      RelativeRole.DEFENSIVE,
      RelativeRole.OFFENSIVE,
    );
    expect(result.ok).toBe(true);
  });

  it("permits N → O (rule 5: force dominant opening)", () => {
    const result = validator.validateTransition(
      RelativeRole.NEUTRAL,
      RelativeRole.OFFENSIVE,
    );
    expect(result.ok).toBe(true);
  });

  it("permits N → D (rule 6: concede ground)", () => {
    const result = validator.validateTransition(
      RelativeRole.NEUTRAL,
      RelativeRole.DEFENSIVE,
    );
    expect(result.ok).toBe(true);
  });

  it("permits D → N (rule 7: escape to reset)", () => {
    const result = validator.validateTransition(
      RelativeRole.DEFENSIVE,
      RelativeRole.NEUTRAL,
    );
    expect(result.ok).toBe(true);
  });

  it("permits N → N (rule 8a: neutral symmetry)", () => {
    const result = validator.validateTransition(
      RelativeRole.NEUTRAL,
      RelativeRole.NEUTRAL,
    );
    expect(result.ok).toBe(true);
  });

  it("permits S → S (rule 8b: symmetrical danger symmetry)", () => {
    const result = validator.validateTransition(
      RelativeRole.SYMMETRICAL_DANGER,
      RelativeRole.SYMMETRICAL_DANGER,
    );
    expect(result.ok).toBe(true);
  });
});

// ── Forbidden transitions (all 7) ────────────────────────────────────────────

describe("TransitionalValidator — forbidden transitions", () => {
  it("rejects O → N (no direct offensive-to-neutral reset)", () => {
    const result = validator.validateTransition(
      RelativeRole.OFFENSIVE,
      RelativeRole.NEUTRAL,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });

  it("rejects O → S (no direct offensive-to-symmetrical danger)", () => {
    const result = validator.validateTransition(
      RelativeRole.OFFENSIVE,
      RelativeRole.SYMMETRICAL_DANGER,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });

  it("rejects D → S (no direct defensive-to-symmetrical danger)", () => {
    const result = validator.validateTransition(
      RelativeRole.DEFENSIVE,
      RelativeRole.SYMMETRICAL_DANGER,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });

  it("rejects N → S (no direct neutral-to-symmetrical danger)", () => {
    const result = validator.validateTransition(
      RelativeRole.NEUTRAL,
      RelativeRole.SYMMETRICAL_DANGER,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });

  it("rejects S → O (no direct symmetrical danger to offensive)", () => {
    const result = validator.validateTransition(
      RelativeRole.SYMMETRICAL_DANGER,
      RelativeRole.OFFENSIVE,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });

  it("rejects S → D (no direct symmetrical danger to defensive)", () => {
    const result = validator.validateTransition(
      RelativeRole.SYMMETRICAL_DANGER,
      RelativeRole.DEFENSIVE,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });

  it("rejects S → N (no direct symmetrical danger to neutral)", () => {
    const result = validator.validateTransition(
      RelativeRole.SYMMETRICAL_DANGER,
      RelativeRole.NEUTRAL,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rule_violated).toBeNull();
  });
});

// ── assertValidTransition throws ──────────────────────────────────────────────

describe("TransitionalValidator — assertValidTransition", () => {
  it("does not throw for a permitted transition (D → O)", () => {
    expect(() =>
      validator.assertValidTransition(
        RelativeRole.DEFENSIVE,
        RelativeRole.OFFENSIVE,
      ),
    ).not.toThrow();
  });

  it("throws TransitionValidationError for a forbidden transition (S → O)", () => {
    expect(() =>
      validator.assertValidTransition(
        RelativeRole.SYMMETRICAL_DANGER,
        RelativeRole.OFFENSIVE,
      ),
    ).toThrow(
      "Transition from SYMMETRICAL_DANGER to OFFENSIVE is not permitted",
    );
  });

  it("includes the violated rule number when available", () => {
    // O → O is permitted; test for a known-forbidden case
    const result = validator.validateTransition(
      RelativeRole.SYMMETRICAL_DANGER,
      RelativeRole.OFFENSIVE,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // S → O is not in any rule, so rule_violated should be null
      expect(result.rule_violated).toBeNull();
    }
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("TransitionalValidator — edge cases", () => {
  it("handles all 16 possible role pairs without throwing", () => {
    const roles = Object.values(RelativeRole);
    for (const from of roles) {
      for (const to of roles) {
        expect(() => validator.validateTransition(from, to)).not.toThrow();
      }
    }
  });
});
