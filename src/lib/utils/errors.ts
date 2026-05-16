// Application Error Classes

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with id '${id}' not found`, "NOT_FOUND", 404);
  }
}

export class TransitionValidationError extends AppError {
  public readonly ruleViolated: number | null;

  constructor(message: string, ruleViolated: number | null = null) {
    super(message, "TRANSITION_VALIDATION_ERROR", 422);
    this.ruleViolated = ruleViolated;
  }
}

export class Neo4jConnectionError extends AppError {
  constructor(originalMessage: string) {
    super(
      `Neo4j connection failed: ${originalMessage}`,
      "NEO4J_CONNECTION_ERROR",
      503,
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, "DATABASE_ERROR", 500);
  }
}
