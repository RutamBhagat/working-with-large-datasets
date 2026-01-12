import { env } from "@working-with-large-datasets/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
export { count, eq } from "drizzle-orm";
import { relations } from "./relations";

export const db = drizzle(env.DATABASE_URL, {
  relations: relations,
  casing: "snake_case",
});
