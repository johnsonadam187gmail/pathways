// GameContext Repository
import type { Driver, Session } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { GAME_CONTEXT } from "../cypher/game-context.cypher";
import type {
  GameContext,
  CreateGameContextInput,
  UpdateGameContextInput,
} from "../../types/nodes";
import { RelativeRole } from "../../types/enums";
import { TransitionalValidator } from "./transitional-validator";
import {
  NotFoundError,
  DatabaseError,
  TransitionValidationError,
} from "../../utils/errors";

interface GameContextRecord {
  id: string;
  position_name: string;
  relative_role: string;
  sidedness: string;
  danger_level: number;
  points_value: number;
}

function mapToGameContext(record: Record<string, unknown>): GameContext {
  const props = record as unknown as GameContextRecord;
  return {
    id: props.id,
    position_name: props.position_name,
    relative_role: props.relative_role as GameContext["relative_role"],
    sidedness: props.sidedness as GameContext["sidedness"],
    danger_level: props.danger_level,
    points_value: props.points_value,
  };
}

export class GameContextRepository {
  constructor(private readonly driver: Driver) {}

  private getSession(): Session {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || "neo4j",
    });
  }

  async findAll(): Promise<GameContext[]> {
    const session = this.getSession();
    try {
      const result = await session.run(GAME_CONTEXT.FIND_ALL);
      return result.records.map((r) =>
        mapToGameContext(r.get("gc").properties),
      );
    } catch (err) {
      throw new DatabaseError(
        `Failed to fetch GameContexts: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<GameContext | null> {
    const session = this.getSession();
    try {
      const result = await session.run(GAME_CONTEXT.FIND_BY_ID, { id });
      if (result.records.length === 0) return null;
      return mapToGameContext(result.records[0].get("gc").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to find GameContext: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async create(data: CreateGameContextInput): Promise<GameContext> {
    const session = this.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(GAME_CONTEXT.CREATE, {
        id,
        ...data,
      });
      return mapToGameContext(result.records[0].get("gc").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to create GameContext: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async update(id: string, data: UpdateGameContextInput): Promise<GameContext> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("GameContext", id);
    }

    const session = this.getSession();
    try {
      const result = await session.run(GAME_CONTEXT.UPDATE, {
        id,
        properties: data,
      });
      return mapToGameContext(result.records[0].get("gc").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to update GameContext: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async delete(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(GAME_CONTEXT.DELETE, { id });
      const deleted = result.records[0].get("deleted").toNumber();
      return deleted > 0;
    } catch (err) {
      throw new DatabaseError(
        `Failed to delete GameContext: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Link a TechniqueAction to this GameContext via a RESULTS_IN edge.
   * This represents a technique resulting in a new positional state.
   * Validates the full chain: source GameContext role → target GameContext role
   * using the Universal Transitional Matrix.
   */
  async linkFromTechnique(
    techniqueId: string,
    gameContextId: string,
  ): Promise<boolean> {
    const session = this.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(GAME_CONTEXT.LINK_FROM_TECHNIQUE, {
        technique_id: techniqueId,
        game_context_id: gameContextId,
        id,
      });

      if (result.records.length === 0) return false;

      const record = result.records[0];
      const sourceRoles = record.get("source_roles") as string[];

      const targetGcProps = record.get("gc").properties as Record<
        string,
        unknown
      >;
      const targetRole = targetGcProps.relative_role as string;

      const validator = new TransitionalValidator();

      for (const sourceRole of sourceRoles) {
        validator.assertValidTransition(
          sourceRole as RelativeRole,
          targetRole as RelativeRole,
        );
      }

      return true;
    } catch (err) {
      if (err instanceof TransitionValidationError) throw err;
      throw new DatabaseError(
        `Failed to link TechniqueAction to GameContext: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }
}
