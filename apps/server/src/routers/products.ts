import { Hono } from "hono";

export const productsRouter = new Hono();

productsRouter.get("/", (c) => {
  return c.json({ message: "Hello, world!" });
});
