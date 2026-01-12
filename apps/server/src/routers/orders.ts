import { Hono } from "hono";
import { count, db, eq } from "@working-with-large-datasets/db";
import { orders, users } from "@working-with-large-datasets/db/schema";

export const ordersRouter = new Hono();

ordersRouter.get("/paid-and-unpaid", async (c) => {
  try {
    const paidAndUnpaid = await db
      .select({
        paid: orders.paid,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.paid);
    return c.json({ success: true, data: paidAndUnpaid });
  } catch (error) {
    return c.json(
      {
        success: false,
        data: { error, message: "Internal server error" },
      },
      500
    );
  }
});

ordersRouter.get("/user-paid-and-unpaid", async (c) => {
  try {
    const userPaidAndUnpaid = await db
      .select({
        firstname: users.firstName,
        lastname: users.lastName,
        paid: orders.paid,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id));

    if (userPaidAndUnpaid.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }
    return c.json({ success: true, data: userPaidAndUnpaid });
  } catch (error) {
    return c.json(
      { success: false, data: { error, message: "Internal server error" } },
      500
    );
  }
});
