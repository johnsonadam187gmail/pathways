// TechniqueAction API — GET (list) / POST (create)
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { TechniqueActionRepository } from "@/lib/neo4j/repositories/technique-action.repository";
import type { CreateTechniqueActionInput } from "@/lib/types/nodes";
import { handleApiError } from "@/lib/api-utils";

export async function GET(): Promise<NextResponse> {
  try {
    const driver = getDriver();
    const repo = new TechniqueActionRepository(driver);
    const techniques = await repo.findAll();
    return NextResponse.json(techniques);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateTechniqueActionInput;
    const driver = getDriver();
    const repo = new TechniqueActionRepository(driver);
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
