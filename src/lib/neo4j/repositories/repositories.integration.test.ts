import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { getDriver, closeDriver, verifyConnectivity } from "../driver";
import { GameContextRepository } from "./game-context.repository";
import { TechniqueActionRepository } from "./technique-action.repository";
import { TacticalPathwayRepository } from "./tactical-pathway.repository";
import { TerminalSinkRepository } from "./terminal-sink.repository";
import {
  RelativeRole,
  Sidedness,
  ActionType,
  GatewayType,
  SinkType,
} from "../../types/enums";
import type { GameContext } from "../../types/nodes";
import type { TechniqueAction } from "../../types/nodes";
import type { TerminalSink } from "../../types/nodes";

let neo4jAvailable = false;

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  neo4jAvailable = await verifyConnectivity();
});

afterAll(async () => {
  const driver = getDriver();
  const session = driver.session({
    database: process.env.NEO4J_DATABASE || "neo4j",
  });
  try {
    await session.run(`
      MATCH (n)
      WHERE n.id STARTS WITH 'test-'
      DETACH DELETE n
    `);
  } finally {
    await session.close();
  }
  await closeDriver();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function skipIfNoNeo4j() {
  if (!neo4jAvailable) {
    console.warn("Skipping: Neo4j not available");
  }
}

async function createTestGameContext(
  repo: GameContextRepository,
  overrides: Partial<GameContext> = {},
): Promise<GameContext> {
  return repo.create({
    position_name: overrides.position_name ?? `test-position-${Date.now()}`,
    relative_role: overrides.relative_role ?? RelativeRole.NEUTRAL,
    sidedness: overrides.sidedness ?? Sidedness.AMBIDEXTROUS,
    danger_level: overrides.danger_level ?? 1,
    points_value: overrides.points_value ?? 0,
  });
}

async function createTestTechnique(
  repo: TechniqueActionRepository,
): Promise<TechniqueAction> {
  return repo.create({
    action_name: `test-technique-${Date.now()}`,
    action_type: ActionType.SWEEP,
    mechanical_preconditions: [],
  });
}

async function createTestSink(
  repo: TerminalSinkRepository,
): Promise<TerminalSink> {
  return repo.create({
    sink_type: SinkType.SUBMISSION_SUCCESS,
  });
}

function itWhenNeo4j(name: string, fn: () => Promise<void>) {
  it(
    name,
    async () => {
      if (!neo4jAvailable) {
        return;
      }
      await fn();
    },
    15_000,
  );
}

// ── GameContext Repository ────────────────────────────────────────────────────

describe("GameContextRepository", () => {
  let repo: GameContextRepository;

  beforeAll(() => {
    skipIfNoNeo4j();
    repo = new GameContextRepository(getDriver());
  });

  itWhenNeo4j("creates a GameContext", async () => {
    const gc = await createTestGameContext(repo);
    expect(gc.id).toBeDefined();
    expect(gc.position_name).toContain("test-position");
    expect(gc.relative_role).toBe(RelativeRole.NEUTRAL);
    expect(gc.sidedness).toBe(Sidedness.AMBIDEXTROUS);
    expect(gc.danger_level).toBe(1);
    expect(gc.points_value).toBe(0);
  });

  itWhenNeo4j("finds a GameContext by id", async () => {
    const gc = await createTestGameContext(repo);
    const found = await repo.findById(gc.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(gc.id);
  });

  itWhenNeo4j("returns null for non-existent GameContext", async () => {
    const found = await repo.findById("test-nonexistent-id");
    expect(found).toBeNull();
  });

  itWhenNeo4j("updates a GameContext", async () => {
    const gc = await createTestGameContext(repo);
    const updated = await repo.update(gc.id, {
      position_name: "updated-position",
      danger_level: 8,
    });
    expect(updated.position_name).toBe("updated-position");
    expect(updated.danger_level).toBe(8);
  });

  itWhenNeo4j("deletes a GameContext", async () => {
    const gc = await createTestGameContext(repo);
    const deleted = await repo.delete(gc.id);
    expect(deleted).toBe(true);
    const found = await repo.findById(gc.id);
    expect(found).toBeNull();
  });

  itWhenNeo4j("returns all GameContexts", async () => {
    const all = await repo.findAll();
    expect(Array.isArray(all)).toBe(true);
  });
});

// ── TechniqueAction Repository ────────────────────────────────────────────────

describe("TechniqueActionRepository", () => {
  let repo: TechniqueActionRepository;

  beforeAll(() => {
    skipIfNoNeo4j();
    repo = new TechniqueActionRepository(getDriver());
  });

  itWhenNeo4j("creates a TechniqueAction", async () => {
    const ta = await createTestTechnique(repo);
    expect(ta.id).toBeDefined();
    expect(ta.action_name).toContain("test-technique");
    expect(ta.action_type).toBe(ActionType.SWEEP);
    expect(ta.mechanical_preconditions).toEqual([]);
  });

  itWhenNeo4j("finds a TechniqueAction by id", async () => {
    const ta = await createTestTechnique(repo);
    const found = await repo.findById(ta.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(ta.id);
  });

  itWhenNeo4j("returns null for non-existent TechniqueAction", async () => {
    const found = await repo.findById("test-nonexistent-id");
    expect(found).toBeNull();
  });

  itWhenNeo4j("updates a TechniqueAction", async () => {
    const ta = await createTestTechnique(repo);
    const updated = await repo.update(ta.id, {
      action_name: "updated-technique",
    });
    expect(updated.action_name).toBe("updated-technique");
  });

  itWhenNeo4j("deletes a TechniqueAction", async () => {
    const ta = await createTestTechnique(repo);
    const deleted = await repo.delete(ta.id);
    expect(deleted).toBe(true);
    const found = await repo.findById(ta.id);
    expect(found).toBeNull();
  });
});

// ── TerminalSink Repository ───────────────────────────────────────────────────

describe("TerminalSinkRepository", () => {
  let repo: TerminalSinkRepository;

  beforeAll(() => {
    skipIfNoNeo4j();
    repo = new TerminalSinkRepository(getDriver());
  });

  itWhenNeo4j("creates a TerminalSink", async () => {
    const ts = await createTestSink(repo);
    expect(ts.id).toBeDefined();
    expect(ts.sink_type).toBe(SinkType.SUBMISSION_SUCCESS);
  });

  itWhenNeo4j(
    "links a TechniqueAction to a TerminalSink via RESULTS_IN",
    async () => {
      const gcRepo = new GameContextRepository(getDriver());
      const taRepo = new TechniqueActionRepository(getDriver());

      const gc = await createTestGameContext(gcRepo);
      const ta = await createTestTechnique(taRepo);
      const ts = await createTestSink(repo);

      const pathwayRepo = new TacticalPathwayRepository(getDriver());
      await pathwayRepo.create({
        source_game_context_id: gc.id,
        target_technique_action_id: ta.id,
        gateway_type: GatewayType.INTENT_DRIVEN,
        trigger_condition: "test link",
        transition_probability: 0.0,
        execution_counter: 0,
      });

      const linked = await repo.linkFromTechnique(ta.id, ts.id);
      expect(linked).toBe(true);
    },
  );
});

// ── TacticalPathway Repository ────────────────────────────────────────────────

describe("TacticalPathwayRepository", () => {
  let repo: TacticalPathwayRepository;
  let gcRepo: GameContextRepository;
  let taRepo: TechniqueActionRepository;

  beforeAll(() => {
    skipIfNoNeo4j();
    const driver = getDriver();
    repo = new TacticalPathwayRepository(driver);
    gcRepo = new GameContextRepository(driver);
    taRepo = new TechniqueActionRepository(driver);
  });

  itWhenNeo4j(
    "creates a TacticalPathway from GameContext to TechniqueAction",
    async () => {
      const gc = await createTestGameContext(gcRepo);
      const ta = await createTestTechnique(taRepo);

      const tp = await repo.create({
        source_game_context_id: gc.id,
        target_technique_action_id: ta.id,
        gateway_type: GatewayType.INTENT_DRIVEN,
        trigger_condition: "opponent postures up",
        transition_probability: 0.0,
        execution_counter: 0,
      });
      expect(tp.id).toBeDefined();
      expect(tp.gateway_type).toBe(GatewayType.INTENT_DRIVEN);
      expect(tp.trigger_condition).toBe("opponent postures up");
      expect(tp.transition_probability).toBe(0.0);
      expect(tp.execution_counter).toBe(0);
    },
  );

  itWhenNeo4j("finds pathways by source GameContext", async () => {
    const gc = await createTestGameContext(gcRepo);
    const ta = await createTestTechnique(taRepo);

    await repo.create({
      source_game_context_id: gc.id,
      target_technique_action_id: ta.id,
      gateway_type: GatewayType.STIMULUS_DRIVEN,
      trigger_condition: "test source find",
      transition_probability: 0.0,
      execution_counter: 0,
    });

    const pathways = await repo.findBySource(gc.id);
    expect(pathways.length).toBeGreaterThanOrEqual(1);
    expect(pathways[0].trigger_condition).toBe("test source find");
  });
});

// ── Transitional Validation (integration) ─────────────────────────────────────

describe("TransitionalValidator — integration with repository", () => {
  let gcRepo: GameContextRepository;
  let taRepo: TechniqueActionRepository;
  let pathwayRepo: TacticalPathwayRepository;

  beforeAll(() => {
    skipIfNoNeo4j();
    const driver = getDriver();
    gcRepo = new GameContextRepository(driver);
    taRepo = new TechniqueActionRepository(driver);
    pathwayRepo = new TacticalPathwayRepository(driver);
  });

  itWhenNeo4j(
    "validates chain: O → O is permitted via linkFromTechnique",
    async () => {
      const sourceGc = await createTestGameContext(gcRepo, {
        relative_role: RelativeRole.OFFENSIVE,
        position_name: "test-source-offensive",
      });
      const targetGc = await createTestGameContext(gcRepo, {
        relative_role: RelativeRole.OFFENSIVE,
        position_name: "test-target-offensive",
      });
      const ta = await createTestTechnique(taRepo);

      await pathwayRepo.create({
        source_game_context_id: sourceGc.id,
        target_technique_action_id: ta.id,
        gateway_type: GatewayType.INTENT_DRIVEN,
        trigger_condition: "test O→O chain",
        transition_probability: 0.0,
        execution_counter: 0,
      });

      // This should succeed: O → O is rule 1
      const linked = await gcRepo.linkFromTechnique(ta.id, targetGc.id);
      expect(linked).toBe(true);
    },
  );

  itWhenNeo4j(
    "rejects chain: O → N is forbidden via linkFromTechnique",
    async () => {
      const sourceGc = await createTestGameContext(gcRepo, {
        relative_role: RelativeRole.OFFENSIVE,
        position_name: "test-source-offensive-2",
      });
      const targetGc = await createTestGameContext(gcRepo, {
        relative_role: RelativeRole.NEUTRAL,
        position_name: "test-target-neutral",
      });
      const ta = await createTestTechnique(taRepo);

      await pathwayRepo.create({
        source_game_context_id: sourceGc.id,
        target_technique_action_id: ta.id,
        gateway_type: GatewayType.INTENT_DRIVEN,
        trigger_condition: "test O→N chain (forbidden)",
        transition_probability: 0.0,
        execution_counter: 0,
      });

      // This should throw: O → N is forbidden
      await expect(
        gcRepo.linkFromTechnique(ta.id, targetGc.id),
      ).rejects.toThrow("not permitted");
    },
  );
});
