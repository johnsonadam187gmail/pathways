// TacticalPathway API — GET (by id) / PATCH / DELETE
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { TacticalPathwayRepository } from "@/lib/neo4j/repositories/tactical-pathway.repository";
import type { UpdateTacticalPathwayInput } from "@/lib/types/edges";
import { handleApiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const driver = getDriver();
    const repo = new TacticalPathwayRepository(driver);
    const pathway = await repo.findById(id);

    if (!pathway) {
      return NextResponse.json(
        {
          error: `TacticalPathway with id '${id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(pathway);
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
    const body = (await request.json()) as UpdateTacticalPathwayInput;
    const driver = getDriver();
    const repo = new TacticalPathwayRepository(driver);
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
    const repo = new TacticalPathwayRepository(driver);
    const deleted = await repo.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          error: `TacticalPathway with id '${id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
