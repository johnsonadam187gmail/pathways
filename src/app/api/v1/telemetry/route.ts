// Telemetry Ingestion — Placeholder Endpoint
//
// FUTURE ROADMAP ITEM:
// This endpoint will accept sparring session logs to increment
// TacticalPathway execution_counter properties, enabling predictive
// analytics on transition probabilities.
//
// Expected payload shape (future):
// {
//   session_id: string,
//   timestamp: string (ISO 8601),
//   entries: Array<{
//     technique_action_id: string,
//     source_game_context_id: string,
//     result: 'SUCCESS' | 'FAILURE',
//     timestamp: string (ISO 8601),
//   }>
// }
//
// When implemented, each entry will:
// 1. MATCH the corresponding TACTICAL_PATHWAY edge
// 2. Increment execution_counter by 1
// 3. Recalculate transition_probability as success_count / total_count

import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "available",
    message:
      "Telemetry ingest endpoint ready. POST implementation is a future roadmap item.",
    docs: "See: /api/v1/telemetry for payload specification",
  });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: "Not Implemented",
      code: "NOT_IMPLEMENTED",
      message:
        "Telemetry ingestion is a future roadmap item. " +
        "This endpoint is stubbed for forward-compatible schema design.",
    },
    { status: 501 },
  );
}
