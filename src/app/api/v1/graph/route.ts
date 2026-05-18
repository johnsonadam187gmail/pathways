// Graph API — GET full graph (all nodes + all edges for canvas rendering)
import { NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import type { Session } from "neo4j-driver";
import { handleApiError } from "@/lib/api-utils";

export type GraphApiResponse = {
  gameContexts: Record<string, unknown>[];
  techniqueActions: Record<string, unknown>[];
  terminalSinks: Record<string, unknown>[];
  tacticalPathways: Record<string, unknown>[];
  resultsInEdges: Record<string, unknown>[];
};

export async function GET(): Promise<NextResponse> {
  const driver = getDriver();
  const session: Session = driver.session({
    database: process.env.NEO4J_DATABASE || "neo4j",
  });

  try {
    const gcResult = await session.run(`
      MATCH (gc:GameContext)
      RETURN gc
      ORDER BY gc.position_name
    `);

    const taResult = await session.run(`
      MATCH (ta:TechniqueAction)
      RETURN ta
      ORDER BY ta.action_name
    `);

    const tsResult = await session.run(`
      MATCH (ts:TerminalSink)
      RETURN ts
      ORDER BY ts.sink_type
    `);

    const tpResult = await session.run(`
      MATCH (source:GameContext)-[tp:TACTICAL_PATHWAY]->(target:TechniqueAction)
      RETURN tp, source.id AS source_id, target.id AS target_id
      ORDER BY tp.trigger_condition
    `);

    const riResult = await session.run(`
      MATCH (source:TechniqueAction)-[r:RESULTS_IN]->(target)
      RETURN r, source.id AS source_id, target.id AS target_id,
             labels(target) AS target_labels
      ORDER BY r.id
    `);

    const gameContexts = gcResult.records.map((r) =>
      flattenProperties(r.get("gc")),
    );
    const techniqueActions = taResult.records.map((r) =>
      flattenProperties(r.get("ta")),
    );
    const terminalSinks = tsResult.records.map((r) =>
      flattenProperties(r.get("ts")),
    );
    const tacticalPathways = tpResult.records.map((r) => ({
      ...flattenProperties(r.get("tp")),
      source_id: r.get("source_id"),
      target_id: r.get("target_id"),
    }));
    const resultsInEdges = riResult.records.map((r) => ({
      ...flattenProperties(r.get("r")),
      source_id: r.get("source_id"),
      target_id: r.get("target_id"),
      target_labels: r.get("target_labels"),
    }));

    const response: GraphApiResponse = {
      gameContexts,
      techniqueActions,
      terminalSinks,
      tacticalPathways,
      resultsInEdges,
    };

    return NextResponse.json(response);
  } catch (err) {
    return handleApiError(err);
  } finally {
    await session.close();
  }
}

function flattenProperties(obj: unknown): Record<string, unknown> {
  if (
    obj &&
    typeof obj === "object" &&
    "properties" in (obj as Record<string, unknown>)
  ) {
    return (obj as Record<string, unknown>).properties as Record<
      string,
      unknown
    >;
  }
  return obj as Record<string, unknown>;
}
