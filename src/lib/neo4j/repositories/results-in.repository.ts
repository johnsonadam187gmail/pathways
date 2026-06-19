// ResultsIn Repository — CRUD for RESULTS_IN edges with transitional validation
import type { Driver, Session } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { RESULTS_IN } from "../cypher/results-in.cypher";
import type { ResultsIn, CreateResultsInInput } from "../../types/edges";
import { RelativeRole } from "../../types/enums";
import { TransitionalValidator } from "./transitional-validator";
import { DatabaseError, TransitionValidationError } from "../../utils/errors";

export class ResultsInRepository {
  constructor(private readonly driver: Driver) {}

  private getSession(): Session {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || "neo4j",
    });
  }

  async findAll(): Promise<ResultsIn[]> {
    const session = this.getSession();
    try {
      const result = await session.run(RESULTS_IN.FIND_ALL);
      return result.records.map(mapRecordToResultsIn);
    } catch (err) {
      throw new DatabaseError(
        `Failed to fetch RESULTS_IN edges: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<ResultsIn | null> {
    const session = this.getSession();
    try {
      const result = await session.run(RESULTS_IN.FIND_BY_ID, { id });
      if (result.records.length === 0) return null;
      return mapRecordToResultsIn(result.records[0]);
    } catch (err) {
      throw new DatabaseError(
        `Failed to find RESULTS_IN edge: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findBySourceAndTarget(
    sourceId: string,
    targetId: string,
  ): Promise<ResultsIn | null> {
    const session = this.getSession();
    try {
      const result = await session.run(RESULTS_IN.FIND_BY_SOURCE_AND_TARGET, {
        source_id: sourceId,
        target_id: targetId,
      });
      if (result.records.length === 0) return null;
      return mapRecordToResultsIn(result.records[0]);
    } catch (err) {
      throw new DatabaseError(
        `Failed to find RESULTS_IN edge: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async create(data: CreateResultsInInput): Promise<ResultsIn> {
    const validator = new TransitionalValidator();
    const id = uuidv4();
    const session = this.getSession();

    try {
      const gcResult = await session.run(RESULTS_IN.CREATE_TO_GAME_CONTEXT, {
        technique_id: data.technique_id,
        target_id: data.target_id,
        id,
      });

      if (gcResult.records.length > 0) {
        const record = gcResult.records[0];
        const gcProps = record.get("gc")?.properties as Record<
          string,
          unknown
        > | null;

        if (gcProps) {
          const targetRole = gcProps.relative_role as string;
          const sourceRoles = record.get("source_roles") as string[];

          for (const sourceRole of sourceRoles) {
            validator.assertValidTransition(
              sourceRole as RelativeRole,
              targetRole as RelativeRole,
            );
          }

          return {
            id,
            source_id: data.technique_id,
            target_id: data.target_id,
            target_labels: ["GameContext"],
          };
        }
      }

      const tsResult = await session.run(RESULTS_IN.CREATE_TO_TERMINAL_SINK, {
        technique_id: data.technique_id,
        target_id: data.target_id,
        id,
      });

      if (tsResult.records.length === 0) {
        throw new DatabaseError(
          `Target node with id '${data.target_id}' not found or is not a valid target`,
        );
      }

      return {
        id,
        source_id: data.technique_id,
        target_id: data.target_id,
        target_labels: ["TerminalSink"],
      };
    } catch (err) {
      if (err instanceof TransitionValidationError) throw err;
      throw new DatabaseError(
        `Failed to create RESULTS_IN edge: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async delete(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(RESULTS_IN.DELETE, { id });
      const deleted = result.records[0].get("deleted") as number;
      return deleted > 0;
    } catch (err) {
      throw new DatabaseError(
        `Failed to delete RESULTS_IN edge: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRecordToResultsIn(record: any): ResultsIn {
  const r = record.get("r").properties as { id: string };
  return {
    id: r.id,
    source_id: record.get("source_id") as string,
    target_id: record.get("target_id") as string,
    target_labels: record.get("target_labels") as string[],
  };
}
