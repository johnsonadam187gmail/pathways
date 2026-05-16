// TerminalSink API — GET (list) / POST (create)
import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/neo4j/driver";
import { TerminalSinkRepository } from "@/lib/neo4j/repositories/terminal-sink.repository";
import type { CreateTerminalSinkInput } from "@/lib/types/nodes";
import { handleApiError } from "@/lib/api-utils";

export async function GET(): Promise<NextResponse> {
  try {
    const driver = getDriver();
    const repo = new TerminalSinkRepository(driver);
    const terminals = await repo.findAll();
    return NextResponse.json(terminals);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateTerminalSinkInput;
    const driver = getDriver();
    const repo = new TerminalSinkRepository(driver);
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
