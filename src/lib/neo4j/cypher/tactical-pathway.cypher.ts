// TacticalPathway Cypher Queries
export const TACTICAL_PATHWAY = {
  CREATE: `
    MATCH (source:GameContext {id: $source_id})
    MATCH (target:TechniqueAction {id: $target_id})
    CREATE (source)-[tp:TACTICAL_PATHWAY {
      id: $id,
      gateway_type: $gateway_type,
      trigger_condition: $trigger_condition,
      transition_probability: $transition_probability,
      execution_counter: $execution_counter
    }]->(target)
    RETURN tp
  `,

  FIND_BY_ID: `
    MATCH ()-[tp:TACTICAL_PATHWAY {id: $id}]->()
    RETURN tp
  `,

  FIND_ALL: `
    MATCH (source:GameContext)-[tp:TACTICAL_PATHWAY]->(target:TechniqueAction)
    RETURN tp, source, target
    ORDER BY tp.trigger_condition
  `,

  FIND_BY_SOURCE: `
    MATCH (source:GameContext {id: $source_id})-[tp:TACTICAL_PATHWAY]->(target:TechniqueAction)
    RETURN tp, source, target
  `,

  UPDATE: `
    MATCH ()-[tp:TACTICAL_PATHWAY {id: $id}]->()
    SET tp += $properties
    RETURN tp
  `,

  DELETE: `
    MATCH ()-[tp:TACTICAL_PATHWAY {id: $id}]->()
    DELETE tp
    RETURN count(*) AS deleted
  `,
} as const;
