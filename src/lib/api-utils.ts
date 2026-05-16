// API Route Utilities
import { NextResponse } from "next/server";
import { getDriver } from "./neo4j/driver";
import { GameContextRepository } from "./neo4j/repositories/game-context.repository";
import { TechniqueActionRepository } from "./neo4j/repositories/technique-action.repository";
import { TacticalPathwayRepository } from "./neo4j/repositories/tactical-pathway.repository";
import { TerminalSinkRepository } from "./neo4j/repositories/terminal-sink.repository";
import { AppError } from "./utils/errors";

export function getRepositories() {
  const driver = getDriver();
  return {
    gameContext: new GameContextRepository(driver),
    techniqueAction: new TechniqueActionRepository(driver),
    tacticalPathway: new TacticalPathwayRepository(driver),
    terminalSink: new TerminalSinkRepository(driver),
  };
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.statusCode },
    );
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("Unhandled API error:", err);
  return NextResponse.json(
    { error: message, code: "INTERNAL_SERVER_ERROR" },
    { status: 500 },
  );
}
