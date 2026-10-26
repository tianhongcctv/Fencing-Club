import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required for database queries");
  }
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
