import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    orders: r.many.orders(),
  },
  products: {
    orders: r.many.orders(),
  },
  orders: {
    user: r.one.users({
      from: r.orders.userId,
      to: r.users.id,
    }),
    product: r.one.products({
      from: r.orders.productId,
      to: r.products.id,
    }),
  },
}));
