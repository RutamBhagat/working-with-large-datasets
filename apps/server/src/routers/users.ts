import { db } from "@working-with-large-datasets/db";
import { Hono } from "hono";

export const usersRouter = new Hono();

usersRouter.get("/last-10-users", async (c) => {
  try {
    const users = await db.query.users.findMany({
      orderBy: { id: "desc" },
      limit: 10,
    });

    if (users.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({ success: true, data: users });
  } catch (error) {
    return c.json(
      {
        success: false,
        data: {
          error: error instanceof Error ? error.message : String(error),
          message: "Internal server error",
        },
      },
      500
    );
  }
});
