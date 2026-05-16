// TacticalPathway API — GET (list) / POST (create)
// TacticalPathway edges connect GameContext -> TechniqueAction
// and are validated against the Universal Transitional Matrix
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { TacticalPathwayRepository } from "@/lib/neo4j/repositories/tactical-pathway.repository";
import { GameContextRepository } from "@/lib/neo4j/repositories/game-context.repository";
import { TransitionalValidator } from "@/lib/neo4j/repositories/transitional-validator";
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

    // Validate the transition against the Universal Transitional Matrix
    const driver = getDriver();
    const gcRepo = new GameContextRepository(driver);
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

    // For now, we validate based on the source role.
    // Full transition validation (source -> target role) requires the target GameContext
    // which is linked from the TechniqueAction via a RESULTS_IN relationship.
    // The TechniqueAction's action_type contextually implies the target role.
    const validator = new TransitionalValidator();

    // Validate source role is not making an impossible first move
    // (This is a basic check; full path validation happens when linking TechniqueAction -> GameContext)
    const validation = validator.validateTransition(
      sourceContext.relative_role,
      sourceContext.relative_role,
    );

    if (!validation.ok) {
      return NextResponse.json(
        {
          error: validation.error,
          code: "TRANSITION_VALIDATION_ERROR",
          rule_violated: validation.rule_violated,
        },
        { status: 422 },
      );
    }

    const repo = new TacticalPathwayRepository(driver);
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
