// RESULTS_IN Cypher Queries (TechniqueAction → GameContext | TerminalSink)
export const RESULTS_IN = {
  FIND_ALL: `
    MATCH (source:TechniqueAction)-[r:RESULTS_IN]->(target)
    RETURN r, source.id AS source_id, target.id AS target_id,
           labels(target) AS target_labels
    ORDER BY r.id
  `,

  FIND_BY_ID: `
    MATCH (source:TechniqueAction)-[r:RESULTS_IN {id: $id}]->(target)
    RETURN r, source.id AS source_id, target.id AS target_id,
           labels(target) AS target_labels
  `,

  FIND_BY_SOURCE: `
    MATCH (source:TechniqueAction {id: $source_id})-[r:RESULTS_IN]->(target)
    RETURN r, source.id AS source_id, target.id AS target_id,
           labels(target) AS target_labels
  `,

  CREATE_TO_GAME_CONTEXT: `
    MATCH (ta:TechniqueAction {id: $technique_id})
    MATCH (gc:GameContext {id: $target_id})
    OPTIONAL MATCH (sourceGc:GameContext)-[:TACTICAL_PATHWAY]->(ta)
    WITH ta, gc, collect(DISTINCT sourceGc.relative_role) AS source_roles
    CREATE (ta)-[r:RESULTS_IN {id: $id}]->(gc)
    RETURN r, gc, source_roles
  `,

  CREATE_TO_TERMINAL_SINK: `
    MATCH (ta:TechniqueAction {id: $technique_id})
    MATCH (ts:TerminalSink {id: $target_id})
    CREATE (ta)-[r:RESULTS_IN {id: $id}]->(ts)
    RETURN r
  `,

  DELETE: `
    MATCH ()-[r:RESULTS_IN {id: $id}]->()
    DELETE r
    RETURN count(*) AS deleted
  `,
} as const;
