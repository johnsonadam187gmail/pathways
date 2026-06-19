// ResultsIn API — GET (list) / POST (create)
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { ResultsInRepository } from "@/lib/neo4j/repositories/results-in.repository";
import { TechniqueActionRepository } from "@/lib/neo4j/repositories/technique-action.repository";
import { GameContextRepository } from "@/lib/neo4j/repositories/game-context.repository";
import { TerminalSinkRepository } from "@/lib/neo4j/repositories/terminal-sink.repository";
import type { CreateResultsInInput } from "@/lib/types/edges";
import { handleApiError } from "@/lib/api-utils";

export async function GET(): Promise<NextResponse> {
  try {
    const driver = getDriver();
    const repo = new ResultsInRepository(driver);
    const results = await repo.findAll();
    return NextResponse.json(results);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateResultsInInput;

    const driver = getDriver();
    const taRepo = new TechniqueActionRepository(driver);
    const gcRepo = new GameContextRepository(driver);
    const tsRepo = new TerminalSinkRepository(driver);

    const sourceTechnique = await taRepo.findById(body.technique_id);
    if (!sourceTechnique) {
      return NextResponse.json(
        {
          error: `Source TechniqueAction with id '${body.technique_id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const targetGc = await gcRepo.findById(body.target_id);
    const targetTs = await tsRepo.findById(body.target_id);
    if (!targetGc && !targetTs) {
      return NextResponse.json(
        {
          error: `Target node with id '${body.target_id}' not found or is not a valid target`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const repo = new ResultsInRepository(driver);

    const existing = await repo.findBySourceAndTarget(
      body.technique_id,
      body.target_id,
    );
    if (existing) {
      return NextResponse.json(
        {
          error: `A RESULTS_IN edge already exists between TechniqueAction '${body.technique_id}' and target '${body.target_id}'`,
          code: "CONFLICT",
          existing_id: existing.id,
        },
        { status: 409 },
      );
    }

    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
