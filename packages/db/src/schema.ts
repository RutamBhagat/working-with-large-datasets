import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: text(),
  lastName: text(),
});

export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  paid: boolean(),
  userId: integer().references(() => users.id),
  productId: integer().references(() => products.id),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  department: text(),
  price: integer(),
  weight: integer(),
});
