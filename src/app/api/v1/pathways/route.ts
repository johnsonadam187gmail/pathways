// TacticalPathway API — GET (list) / POST (create)
// TacticalPathway edges connect GameContext -> TechniqueAction
// and are validated against the Universal Transitional Matrix
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

    // Note: Full transitional validation (source GC role → target GC role) occurs
    // when linking the TechniqueAction to a result GameContext via the RESULTS_IN edge
    // in GameContextRepository.linkFromTechnique(). At pathway creation time, only
    // entity existence is verified.

    const repo = new TacticalPathwayRepository(driver);
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
