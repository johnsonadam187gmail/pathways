// TechniqueAction API — GET (by id) / PATCH / DELETE
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { TechniqueActionRepository } from "@/lib/neo4j/repositories/technique-action.repository";
import type { UpdateTechniqueActionInput } from "@/lib/types/nodes";
import { handleApiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const driver = getDriver();
    const repo = new TechniqueActionRepository(driver);
    const technique = await repo.findById(id);

    if (!technique) {
      return NextResponse.json(
        {
          error: `TechniqueAction with id '${id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(technique);
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
    const body = (await request.json()) as UpdateTechniqueActionInput;
    const driver = getDriver();
    const repo = new TechniqueActionRepository(driver);
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
    const repo = new TechniqueActionRepository(driver);
    const deleted = await repo.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          error: `TechniqueAction with id '${id}' not found`,
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
