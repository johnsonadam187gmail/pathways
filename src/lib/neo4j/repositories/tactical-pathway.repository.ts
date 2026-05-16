// TacticalPathway Repository
import type { Driver, Session } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { TACTICAL_PATHWAY } from "../cypher/tactical-pathway.cypher";
import type {
  TacticalPathway,
  CreateTacticalPathwayInput,
  UpdateTacticalPathwayInput,
} from "../../types/edges";
import { NotFoundError, DatabaseError } from "../../utils/errors";

function mapToTacticalPathway(
  record: Record<string, unknown>,
): TacticalPathway {
  return {
    id: record.id as string,
    gateway_type: record.gateway_type as TacticalPathway["gateway_type"],
    trigger_condition: record.trigger_condition as string,
    transition_probability: record.transition_probability as number,
    execution_counter: record.execution_counter as number,
  };
}

export class TacticalPathwayRepository {
  constructor(private readonly driver: Driver) {}

  private getSession(): Session {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || "neo4j",
    });
  }

  async findAll(): Promise<TacticalPathway[]> {
    const session = this.getSession();
    try {
      const result = await session.run(TACTICAL_PATHWAY.FIND_ALL);
      return result.records.map((r) =>
        mapToTacticalPathway(r.get("tp").properties),
      );
    } catch (err) {
      throw new DatabaseError(
        `Failed to fetch TacticalPathways: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<TacticalPathway | null> {
    const session = this.getSession();
    try {
      const result = await session.run(TACTICAL_PATHWAY.FIND_BY_ID, { id });
      if (result.records.length === 0) return null;
      return mapToTacticalPathway(result.records[0].get("tp").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to find TacticalPathway: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findBySource(sourceId: string): Promise<TacticalPathway[]> {
    const session = this.getSession();
    try {
      const result = await session.run(TACTICAL_PATHWAY.FIND_BY_SOURCE, {
        source_id: sourceId,
      });
      return result.records.map((r) =>
        mapToTacticalPathway(r.get("tp").properties),
      );
    } catch (err) {
      throw new DatabaseError(
        `Failed to find TacticalPathways by source: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async create(data: CreateTacticalPathwayInput): Promise<TacticalPathway> {
    const session = this.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(TACTICAL_PATHWAY.CREATE, {
        id,
        source_id: data.source_game_context_id,
        target_id: data.target_technique_action_id,
        gateway_type: data.gateway_type,
        trigger_condition: data.trigger_condition,
        transition_probability: data.transition_probability ?? 0.0,
        execution_counter: data.execution_counter ?? 0,
      });
      return mapToTacticalPathway(result.records[0].get("tp").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to create TacticalPathway: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async update(
    id: string,
    data: UpdateTacticalPathwayInput,
  ): Promise<TacticalPathway> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("TacticalPathway", id);
    }

    const session = this.getSession();
    try {
      const result = await session.run(TACTICAL_PATHWAY.UPDATE, {
        id,
        properties: data,
      });
      return mapToTacticalPathway(result.records[0].get("tp").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to update TacticalPathway: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async delete(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(TACTICAL_PATHWAY.DELETE, { id });
      const deleted = result.records[0].get("deleted").toNumber();
      return deleted > 0;
    } catch (err) {
      throw new DatabaseError(
        `Failed to delete TacticalPathway: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }
}
