import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
});

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  paid: boolean(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
});

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: varchar(),
  department: varchar(),
  price: integer(),
  weight: integer(),
});
