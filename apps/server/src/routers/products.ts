import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { asc, db, gt } from "@working-with-large-datasets/db";
import { products } from "@working-with-large-datasets/db/schema";

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

productsRouter.get(
  "/offset-and-limit",
  zValidator(
    "query",
    z.object({
      offset: z.coerce.number().default(0),
      limit: z.coerce.number().default(10),
    })
  ),
  async (c) => {
    try {
      const { offset, limit } = c.req.valid("query");

      const products = await db.query.products.findMany({
        limit,
        offset,
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
  }
);

productsRouter.get(
  "/cursor-pagination",
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().default(10),
      cursor: z.coerce.number().default(0),
    })
  ),
  async (c) => {
    try {
      const { cursor, limit } = c.req.valid("query");
      const productResult = await db
        .select()
        .from(products)
        .limit(limit)
        .where(cursor ? gt(products.id, cursor) : undefined)
        .orderBy(asc(products.id));

      if (productResult.length === 0) {
        return c.json(
          {
            success: false,
            data: { error: "No data found", message: "No data found" },
          },
          404
        );
      }
      return c.json({ success: true, data: productResult });
    } catch (error) {
      return c.json(
        { success: false, data: { error, message: "Internal server error" } },
        500
      );
    }
  }
);
