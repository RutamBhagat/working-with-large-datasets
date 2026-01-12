import { env } from "@working-with-large-datasets/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { ordersRouter } from "./routers/orders";
import { productsRouter } from "./routers/products";
import { usersRouter } from "./routers/users";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
);

app.get("/", (c) => {
  return c.text("OK");
});

import { serve } from "@hono/node-server";

app.route("/user", usersRouter);
app.route("/product", productsRouter);
app.route("/order", ordersRouter);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
