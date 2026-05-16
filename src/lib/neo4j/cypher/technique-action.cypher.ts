// TechniqueAction Cypher Queries
export const TECHNIQUE_ACTION = {
  CREATE: `
    CREATE (ta:TechniqueAction {
      id: $id,
      action_name: $action_name,
      action_type: $action_type,
      mechanical_preconditions: $mechanical_preconditions
    })
    RETURN ta
  `,

  FIND_BY_ID: `
    MATCH (ta:TechniqueAction {id: $id})
    RETURN ta
  `,

  FIND_ALL: `
    MATCH (ta:TechniqueAction)
    RETURN ta
    ORDER BY ta.action_name
  `,

  UPDATE: `
    MATCH (ta:TechniqueAction {id: $id})
    SET ta += $properties
    RETURN ta
  `,

  DELETE: `
    MATCH (ta:TechniqueAction {id: $id})
    DETACH DELETE ta
    RETURN count(*) AS deleted
  `,
} as const;
