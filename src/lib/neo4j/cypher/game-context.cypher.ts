// GameContext Cypher Queries
export const GAME_CONTEXT = {
  CREATE: `
    CREATE (gc:GameContext {
      id: $id,
      position_name: $position_name,
      relative_role: $relative_role,
      sidedness: $sidedness,
      danger_level: $danger_level,
      points_value: $points_value
    })
    RETURN gc
  `,

  FIND_BY_ID: `
    MATCH (gc:GameContext {id: $id})
    RETURN gc
  `,

  FIND_ALL: `
    MATCH (gc:GameContext)
    RETURN gc
    ORDER BY gc.position_name
  `,

  UPDATE: `
    MATCH (gc:GameContext {id: $id})
    SET gc += $properties
    RETURN gc
  `,

  DELETE: `
    MATCH (gc:GameContext {id: $id})
    DETACH DELETE gc
    RETURN count(*) AS deleted
  `,

  // Link a TechniqueAction to this GameContext via RESULTS_IN edge.
  // This represents a technique resulting in a new positional state.
  // Returns the edge, target GameContext, and all source GameContext roles for validation.
  LINK_FROM_TECHNIQUE: `
    MATCH (ta:TechniqueAction {id: $technique_id})
    MATCH (gc:GameContext {id: $game_context_id})
    MATCH (source:GameContext)-[:TACTICAL_PATHWAY]->(ta)
    WITH ta, gc, collect(DISTINCT source.relative_role) AS source_roles
    CREATE (ta)-[r:RESULTS_IN {id: $id}]->(gc)
    RETURN r, gc, source_roles
  `,
} as const;
