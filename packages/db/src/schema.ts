import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  boolean,
  primaryKey,
  varchar,
  check,
  unique,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar({ length: 50 }),
  lastName: varchar({ length: 50 }),
});

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);
export const updateUserSchema = createUpdateSchema(users);
export const TSelectUserSchema = users.$inferSelect;
export const TInsertUserSchema = users.$inferInsert;

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }),
    department: varchar({ length: 50 }),
    price: integer().notNull(),
    weight: integer(),
  },
  (table) => [
    check("positive_price", sql`${table.price} > 0`),
    check("positive_weight", sql`${table.weight} > 0`),
    unique("unique_name_department").on(table.name, table.department),
  ]
);

export const selectProductSchema = createSelectSchema(products);
export const insertProductSchema = createInsertSchema(products);
export const updateProductSchema = createUpdateSchema(products);
export const TSelectProductSchema = products.$inferSelect;
export const TInsertProductSchema = products.$inferInsert;

export const orders = pgTable(
  "orders",
  {
    paid: boolean(),
    userId: integer().references(() => users.id),
    productId: integer().references(() => products.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })]
);

export const selectOrderSchema = createSelectSchema(orders);
export const insertOrderSchema = createInsertSchema(orders);
export const updateOrderSchema = createUpdateSchema(orders);
export const TSelectOrderSchema = orders.$inferSelect;
export const TInsertOrderSchema = orders.$inferInsert;
