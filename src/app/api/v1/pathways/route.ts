// TacticalPathway API — GET (list) / POST (create)
// TacticalPathway edges connect GameContext -> TechniqueAction
// Full transitional validation (GC role -> GC role) occurs at RESULTS_IN creation,
// since the pathway only goes GC->TA and the matrix governs GC->GC transitions.
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { TacticalPathwayRepository } from "@/lib/neo4j/repositories/tactical-pathway.repository";
import { GameContextRepository } from "@/lib/neo4j/repositories/game-context.repository";
import { TechniqueActionRepository } from "@/lib/neo4j/repositories/technique-action.repository";
import type { CreateTacticalPathwayInput } from "@/lib/types/edges";
import { handleApiError } from "@/lib/api-utils";

export async function GET(): Promise<NextResponse> {
  try {
    const driver = getDriver();
    const repo = new TacticalPathwayRepository(driver);
    const pathways = await repo.findAll();
    return NextResponse.json(pathways);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateTacticalPathwayInput;

    const driver = getDriver();
    const gcRepo = new GameContextRepository(driver);
    const taRepo = new TechniqueActionRepository(driver);

    const sourceContext = await gcRepo.findById(body.source_game_context_id);
    if (!sourceContext) {
      return NextResponse.json(
        {
          error: `Source GameContext with id '${body.source_game_context_id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const targetTechnique = await taRepo.findById(
      body.target_technique_action_id,
    );
    if (!targetTechnique) {
      return NextResponse.json(
        {
          error: `Target TechniqueAction with id '${body.target_technique_action_id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const repo = new TacticalPathwayRepository(driver);

    const existing = await repo.findBySourceAndTarget(
      body.source_game_context_id,
      body.target_technique_action_id,
    );
    if (existing) {
      return NextResponse.json(
        {
          error: `A TacticalPathway already exists between GameContext '${body.source_game_context_id}' and TechniqueAction '${body.target_technique_action_id}'`,
          code: "CONFLICT",
          existing_id: existing.id,
        },
        { status: 409 },
      );
    }

    // Transitional validation note:
    // The Universal Transitional Matrix governs GameContext -> GameContext transitions.
    // A TACTICAL_PATHWAY edge goes GameContext -> TechniqueAction (attempting a technique),
    // which is always valid from any positional role. The matrix is enforced when the
    // TechniqueAction RESULTS_IN edge connects to a target GameContext or TerminalSink.
    // See: ResultsInRepository.create()

    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
