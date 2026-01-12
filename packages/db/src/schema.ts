import {
  pgTable,
  text,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: text(),
  lastName: text(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  department: text(),
  price: integer(),
  weight: integer(),
});

export const orders = pgTable(
  "orders",
  {
    paid: boolean(),
    userId: integer().references(() => users.id),
    productId: integer().references(() => products.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })]
);
