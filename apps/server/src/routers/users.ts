import { Hono } from "hono";

export const usersRouter = new Hono();

usersRouter.get("/", (c) => {
  return c.json({ message: "Hello, world!" });
});
