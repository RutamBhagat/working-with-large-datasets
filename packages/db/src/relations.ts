import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    products: r.many.products({
      from: r.users.id.through(r.orders.userId),
      to: r.products.id.through(r.orders.productId),
    }),
  },
  products: {
    users: r.many.users(),
  },
}));
