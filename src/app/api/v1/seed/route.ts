// Seed API — Populate Neo4j with comprehensive MAML demo data
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import type { Session } from "neo4j-driver";
import { handleApiError } from "@/lib/api-utils";
import {
  SEED_GAME_CONTEXTS,
  SEED_TECHNIQUE_ACTIONS,
  SEED_TERMINAL_SINKS,
  SEED_TACTICAL_PATHWAYS,
  SEED_RESULTS_IN,
  POSITIONS,
} from "@/lib/seed-data";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const driver = getDriver();
  const session: Session = driver.session({
    database: process.env.NEO4J_DATABASE || "neo4j",
  });

  try {
    const body = await request.json().catch(() => ({}));
    const reset = body?.reset === true;

    if (reset) {
      await session.run("MATCH (n) DETACH DELETE n");
    }

    let nodeCount = 0;
    let edgeCount = 0;

    for (const gc of SEED_GAME_CONTEXTS) {
      const pos = POSITIONS[gc.id] ?? { x: 0, y: 0 };
      await session.run(
        `MERGE (n:GameContext {id: $id})
         SET n.position_name = $position_name,
             n.relative_role = $relative_role,
             n.sidedness = $sidedness,
             n.danger_level = $danger_level,
             n.points_value = $points_value,
             n.pos_x = $pos_x,
             n.pos_y = $pos_y`,
        { ...gc, pos_x: pos.x, pos_y: pos.y },
      );
      nodeCount++;
    }

    for (const ta of SEED_TECHNIQUE_ACTIONS) {
      const pos = POSITIONS[ta.id] ?? { x: 0, y: 0 };
      await session.run(
        `MERGE (n:TechniqueAction {id: $id})
         SET n.action_name = $action_name,
             n.action_type = $action_type,
             n.mechanical_preconditions = $mechanical_preconditions,
             n.pos_x = $pos_x,
             n.pos_y = $pos_y`,
        { ...ta, pos_x: pos.x, pos_y: pos.y },
      );
      nodeCount++;
    }

    for (const ts of SEED_TERMINAL_SINKS) {
      const pos = POSITIONS[ts.id] ?? { x: 0, y: 0 };
      await session.run(
        `MERGE (n:TerminalSink {id: $id})
         SET n.sink_type = $sink_type,
             n.pos_x = $pos_x,
             n.pos_y = $pos_y`,
        { ...ts, pos_x: pos.x, pos_y: pos.y },
      );
      nodeCount++;
    }

    for (const tp of SEED_TACTICAL_PATHWAYS) {
      await session.run(
        `MATCH (source:GameContext {id: $source_id})
         MATCH (target:TechniqueAction {id: $target_id})
         MERGE (source)-[r:TACTICAL_PATHWAY {id: $id}]->(target)
         SET r.gateway_type = $gateway_type,
             r.trigger_condition = $trigger_condition,
             r.transition_probability = $transition_probability,
             r.execution_counter = $execution_counter`,
        tp,
      );
      edgeCount++;
    }

    for (const ri of SEED_RESULTS_IN) {
      await session.run(
        `MATCH (source:TechniqueAction {id: $source_id})
         MATCH (target {id: $target_id})
         MERGE (source)-[r:RESULTS_IN {id: $id}]->(target)`,
        ri,
      );
      edgeCount++;
    }

    return NextResponse.json({
      ok: true,
      message: reset
        ? "Database reset and seeded successfully"
        : "Seed data upserted successfully",
      created: { nodes: nodeCount, edges: edgeCount },
    });
  } catch (err) {
    return handleApiError(err);
  } finally {
    await session.close();
  }
}
