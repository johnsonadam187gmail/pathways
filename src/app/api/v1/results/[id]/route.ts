// ResultsIn API — GET (by id) / DELETE
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { ResultsInRepository } from "@/lib/neo4j/repositories/results-in.repository";
import { handleApiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const driver = getDriver();
    const repo = new ResultsInRepository(driver);
    const result = await repo.findById(id);

    if (!result) {
      return NextResponse.json(
        {
          error: `RESULTS_IN edge with id '${id}' not found`,
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
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
    const repo = new ResultsInRepository(driver);
    const deleted = await repo.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          error: `RESULTS_IN edge with id '${id}' not found`,
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
