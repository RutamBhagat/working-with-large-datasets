import { env } from "@working-with-large-datasets/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
export { sql, count, eq, gt, lt, asc, desc, and, or } from "drizzle-orm";
export { union, intersect, except } from "drizzle-orm/pg-core";
import { relations } from "./relations";

export const db = drizzle(env.DATABASE_URL, {
  relations: relations,
  casing: "snake_case",
});
