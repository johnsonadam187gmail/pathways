// TechniqueAction Repository
import type { Driver, Session } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { TECHNIQUE_ACTION } from "../cypher/technique-action.cypher";
import type {
  TechniqueAction,
  CreateTechniqueActionInput,
  UpdateTechniqueActionInput,
} from "../../types/nodes";
import { NotFoundError, DatabaseError } from "../../utils/errors";

function mapToTechniqueAction(
  record: Record<string, unknown>,
): TechniqueAction {
  return {
    id: record.id as string,
    action_name: record.action_name as string,
    action_type: record.action_type as TechniqueAction["action_type"],
    mechanical_preconditions: record.mechanical_preconditions as string[],
  };
}

export class TechniqueActionRepository {
  constructor(private readonly driver: Driver) {}

  private getSession(): Session {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || "neo4j",
    });
  }

  async findAll(): Promise<TechniqueAction[]> {
    const session = this.getSession();
    try {
      const result = await session.run(TECHNIQUE_ACTION.FIND_ALL);
      return result.records.map((r) =>
        mapToTechniqueAction(r.get("ta").properties),
      );
    } catch (err) {
      throw new DatabaseError(
        `Failed to fetch TechniqueActions: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<TechniqueAction | null> {
    const session = this.getSession();
    try {
      const result = await session.run(TECHNIQUE_ACTION.FIND_BY_ID, { id });
      if (result.records.length === 0) return null;
      return mapToTechniqueAction(result.records[0].get("ta").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to find TechniqueAction: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async create(data: CreateTechniqueActionInput): Promise<TechniqueAction> {
    const session = this.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(TECHNIQUE_ACTION.CREATE, {
        id,
        ...data,
        mechanical_preconditions: data.mechanical_preconditions ?? [],
      });
      return mapToTechniqueAction(result.records[0].get("ta").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to create TechniqueAction: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async update(
    id: string,
    data: UpdateTechniqueActionInput,
  ): Promise<TechniqueAction> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("TechniqueAction", id);
    }

    const session = this.getSession();
    try {
      const result = await session.run(TECHNIQUE_ACTION.UPDATE, {
        id,
        properties: data,
      });
      return mapToTechniqueAction(result.records[0].get("ta").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to update TechniqueAction: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async delete(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(TECHNIQUE_ACTION.DELETE, { id });
      const deleted = result.records[0].get("deleted").toNumber();
      return deleted > 0;
    } catch (err) {
      throw new DatabaseError(
        `Failed to delete TechniqueAction: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }
}
