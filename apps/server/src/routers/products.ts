import { db } from "@working-with-large-datasets/db";
import { Hono } from "hono";

export const productsRouter = new Hono();

productsRouter.get("/sort-by-price", async (c) => {
  try {
    const products = await db.query.products.findMany({
      orderBy: { price: "desc" },
    });

    if (products.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({ success: true, data: products });
  } catch (error) {
    return c.json(
      { success: false, data: { error, message: "Internal server error" } },
      500
    );
  }
});

productsRouter.get("/sort-by-price-and-weight", async (c) => {
  try {
    const products = await db.query.products.findMany({
      orderBy: { price: "asc", weight: "asc" },
    });

    if (products.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({ success: true, data: products });
  } catch (error) {
    return c.json(
      { success: false, data: { error, message: "Internal server error" } },
      500
    );
  }
});

productsRouter.get("/sort-by-name", async (c) => {
  try {
    const products = await db.query.products.findMany({
      orderBy: { name: "asc" },
    });

    if (products.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({ success: true, data: products });
  } catch (error) {
    return c.json(
      { success: false, data: { error, message: "Internal server error" } },
      500
    );
  }
});
