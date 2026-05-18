// Neo4j Driver — Singleton instance
import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (driver) {
    return driver;
  }

  const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
  const user = process.env.NEO4J_USER || "neo4j";
  const password = process.env.NEO4J_PASSWORD || "password";

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 10,
    connectionTimeout: 30_000,
    disableLosslessIntegers: true,
    encrypted: process.env.NEO4J_ENCRYPTED === "true",
  });

  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export async function verifyConnectivity(
  timeoutMs: number = 3_000,
): Promise<boolean> {
  const d = getDriver();
  try {
    await Promise.race([
      d.verifyConnectivity(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), timeoutMs),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}
