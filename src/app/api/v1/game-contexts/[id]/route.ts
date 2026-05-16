// GameContext API — GET (by id) / PATCH / DELETE
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { GameContextRepository } from "@/lib/neo4j/repositories/game-context.repository";
import type { UpdateGameContextInput } from "@/lib/types/nodes";
import { handleApiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const driver = getDriver();
    const repo = new GameContextRepository(driver);
    const gameContext = await repo.findById(id);

    if (!gameContext) {
      return NextResponse.json(
        { error: `GameContext with id '${id}' not found`, code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(gameContext);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateGameContextInput;
    const driver = getDriver();
    const repo = new GameContextRepository(driver);
    const updated = await repo.update(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const driver = getDriver();
    const repo = new GameContextRepository(driver);
    const deleted = await repo.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: `GameContext with id '${id}' not found`, code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
