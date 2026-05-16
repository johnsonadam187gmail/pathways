// GameContext API — GET (list) / POST (create)
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { GameContextRepository } from "@/lib/neo4j/repositories/game-context.repository";
import type { CreateGameContextInput } from "@/lib/types/nodes";
import { handleApiError } from "@/lib/api-utils";

export async function GET(): Promise<NextResponse> {
  try {
    const driver = getDriver();
    const repo = new GameContextRepository(driver);
    const gameContexts = await repo.findAll();
    return NextResponse.json(gameContexts);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateGameContextInput;
    const driver = getDriver();
    const repo = new GameContextRepository(driver);
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
