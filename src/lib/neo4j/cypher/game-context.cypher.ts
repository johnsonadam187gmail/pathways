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
} as const;
