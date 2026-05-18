// ResultsIn API — GET (list) / POST (create)
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { ResultsInRepository } from "@/lib/neo4j/repositories/results-in.repository";
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
    const repo = new ResultsInRepository(driver);
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
