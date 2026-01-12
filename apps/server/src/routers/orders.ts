import { Hono } from "hono";

export const ordersRouter = new Hono();

ordersRouter.get("/", (c) => {
  return c.json({ message: "Hello, world!" });
});
