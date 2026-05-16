// TerminalSink Cypher Queries
export const TERMINAL_SINK = {
  CREATE: `
    CREATE (ts:TerminalSink {
      id: $id,
      sink_type: $sink_type
    })
    RETURN ts
  `,

  FIND_BY_ID: `
    MATCH (ts:TerminalSink {id: $id})
    RETURN ts
  `,

  FIND_ALL: `
    MATCH (ts:TerminalSink)
    RETURN ts
    ORDER BY ts.sink_type
  `,

  UPDATE: `
    MATCH (ts:TerminalSink {id: $id})
    SET ts.sink_type = $sink_type
    RETURN ts
  `,

  DELETE: `
    MATCH (ts:TerminalSink {id: $id})
    DETACH DELETE ts
    RETURN count(*) AS deleted
  `,

  // Link a TechniqueAction to a TerminalSink via RESULTS_IN edge
  LINK_FROM_TECHNIQUE: `
    MATCH (ta:TechniqueAction {id: $technique_id})
    MATCH (ts:TerminalSink {id: $sink_id})
    CREATE (ta)-[r:RESULTS_IN {
      id: $id
    }]->(ts)
    RETURN r
  `,
} as const;
