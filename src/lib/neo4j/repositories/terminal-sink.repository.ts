// TerminalSink Repository
import type { Driver, Session } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { TERMINAL_SINK } from "../cypher/terminal-sink.cypher";
import type {
  TerminalSink,
  CreateTerminalSinkInput,
  UpdateTerminalSinkInput,
} from "../../types/nodes";
import { NotFoundError, DatabaseError } from "../../utils/errors";

function mapToTerminalSink(record: Record<string, unknown>): TerminalSink {
  return {
    id: record.id as string,
    sink_type: record.sink_type as TerminalSink["sink_type"],
  };
}

export class TerminalSinkRepository {
  constructor(private readonly driver: Driver) {}

  private getSession(): Session {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || "neo4j",
    });
  }

  async findAll(): Promise<TerminalSink[]> {
    const session = this.getSession();
    try {
      const result = await session.run(TERMINAL_SINK.FIND_ALL);
      return result.records.map((r) =>
        mapToTerminalSink(r.get("ts").properties),
      );
    } catch (err) {
      throw new DatabaseError(
        `Failed to fetch TerminalSinks: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<TerminalSink | null> {
    const session = this.getSession();
    try {
      const result = await session.run(TERMINAL_SINK.FIND_BY_ID, { id });
      if (result.records.length === 0) return null;
      return mapToTerminalSink(result.records[0].get("ts").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to find TerminalSink: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async create(data: CreateTerminalSinkInput): Promise<TerminalSink> {
    const session = this.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(TERMINAL_SINK.CREATE, {
        id,
        sink_type: data.sink_type,
      });
      return mapToTerminalSink(result.records[0].get("ts").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to create TerminalSink: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async update(
    id: string,
    data: UpdateTerminalSinkInput,
  ): Promise<TerminalSink> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("TerminalSink", id);
    }

    const session = this.getSession();
    try {
      const result = await session.run(TERMINAL_SINK.UPDATE, {
        id,
        sink_type: data.sink_type,
      });
      return mapToTerminalSink(result.records[0].get("ts").properties);
    } catch (err) {
      throw new DatabaseError(
        `Failed to update TerminalSink: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  async delete(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(TERMINAL_SINK.DELETE, { id });
      const deleted = result.records[0].get("deleted") as number;
      return deleted > 0;
    } catch (err) {
      throw new DatabaseError(
        `Failed to delete TerminalSink: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Link a TechniqueAction to this TerminalSink via a RESULTS_IN edge.
   * This represents a technique leading to a terminal outcome (submission).
   */
  async linkFromTechnique(
    techniqueId: string,
    sinkId: string,
  ): Promise<boolean> {
    const session = this.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(TERMINAL_SINK.LINK_FROM_TECHNIQUE, {
        technique_id: techniqueId,
        sink_id: sinkId,
        id,
      });
      return result.records.length > 0;
    } catch (err) {
      throw new DatabaseError(
        `Failed to link TechniqueAction to TerminalSink: ${(err as Error).message}`,
      );
    } finally {
      await session.close();
    }
  }
}
