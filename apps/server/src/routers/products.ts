import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  asc,
  db,
  desc,
  eq,
  except,
  gt,
  intersect,
  max,
  sql,
  union,
} from "@working-with-large-datasets/db";
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
  }
);

productsRouter.get(
  "/highest-price-and-highest-price-to-weight-ratio",
  async (c) => {
    try {
      const productsResult = await union(
        db
          .select({
            price: products.price,
            weight: products.weight,
            productToWeightRatio:
              sql<number>`${products.price} / ${products.weight}`.as(
                "productToWeightRatio"
              ),
          })
          .from(products)
          .orderBy(desc(products.price))
          .limit(4),
        db
          .select({
            price: products.price,
            weight: products.weight,
            productToWeightRatio:
              sql<number>`${products.price} / ${products.weight}`.as(
                "productToWeightRatio"
              ),
          })
          .from(products)
          .orderBy(desc(sql`${products.price} / ${products.weight}`))
          .limit(4)
      ).orderBy(desc(products.price), asc(products.weight));

      if (productsResult.length === 0) {
        return c.json(
          {
            success: false,
            data: { error: "No data found", message: "No data found" },
          },
          404
        );
      }
      return c.json({ success: true, data: productsResult });
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
  }
);

productsRouter.get(
  "/highest-price-and-highest-price-to-weight-ratio-sql",
  async (c) => {
    try {
      const productsResult = await db.execute<{
        price: number;
        productToWeightRatio: number;
      }>(sql`
        (SELECT price, price / weight as "productToWeightRatio"
         FROM products
         ORDER BY price DESC
         LIMIT 4)
        UNION
        (SELECT price, price / weight as "productToWeightRatio"
         FROM products
         ORDER BY price / weight DESC
         LIMIT 4)
      `);

      if (productsResult.rows.length === 0) {
        return c.json(
          {
            success: false,
            data: { error: "No data found", message: "No data found" },
          },
          404
        );
      }
      return c.json({ success: true, data: productsResult.rows });
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
  }
);

productsRouter.get(
  "/highest-price-and-highest-price-to-weight-ratio-intersect",
  async (c) => {
    try {
      const productsResult = await intersect(
        db
          .select({
            price: products.price,
            weight: products.weight,
            productToWeightRatio:
              sql<number>`${products.price} / ${products.weight}`.as(
                "productToWeightRatio"
              ),
          })
          .from(products)
          .orderBy(desc(products.price))
          .limit(4),
        db
          .select({
            price: products.price,
            weight: products.weight,
            productToWeightRatio:
              sql<number>`${products.price} / ${products.weight}`.as(
                "productToWeightRatio"
              ),
          })
          .from(products)
          .orderBy(desc(sql`${products.price} / ${products.weight}`))
          .limit(4)
      ).orderBy(desc(products.price), asc(products.weight));

      if (productsResult.length === 0) {
        return c.json(
          {
            success: false,
            data: { error: "No data found", message: "No data found" },
          },
          404
        );
      }
      return c.json({ success: true, data: productsResult });
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
  }
);

productsRouter.get(
  "/highest-price-and-highest-price-to-weight-ratio-except",
  async (c) => {
    try {
      const productsResult = await except(
        db
          .select({
            price: products.price,
            weight: products.weight,
            productToWeightRatio:
              sql<number>`${products.price} / ${products.weight}`.as(
                "productToWeightRatio"
              ),
          })
          .from(products)
          .orderBy(desc(products.price))
          .limit(4),
        db
          .select({
            price: products.price,
            weight: products.weight,
            productToWeightRatio:
              sql<number>`${products.price} / ${products.weight}`.as(
                "productToWeightRatio"
              ),
          })
          .from(products)
          .orderBy(desc(sql`${products.price} / ${products.weight}`))
          .limit(4)
      ).orderBy(desc(products.price), asc(products.weight));

      if (productsResult.length === 0) {
        return c.json(
          {
            success: false,
            data: { error: "No data found", message: "No data found" },
          },
          404
        );
      }
      return c.json({ success: true, data: productsResult });
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
  }
);

productsRouter.get(
  "/highest-price-and-highest-price-to-weight-ratio-subquery",
  async (c) => {
    try {
      const subquery = db
        .select({
          price: products.price,
          weight: products.weight,
          productToWeightRatio:
            sql<number>`${products.price} / ${products.weight}`.as(
              "productToWeightRatio"
            ),
        })
        .from(products)
        .as("subquery");

      const priceToWeightRatio = await db
        .select({
          price: subquery.price,
          weight: subquery.weight,
          productToWeightRatio: subquery.productToWeightRatio,
        })
        .from(subquery)
        .orderBy(desc(subquery.price));

      return c.json({ success: true, data: priceToWeightRatio });
    } catch (error) {
      console.error("Subquery error:", error);
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
  }
);

productsRouter.get("/subquery-1", async (c) => {
  try {
    const mostExpensiveProductInToysDepartment = db
      .select({
        maxPrice: max(products.price),
      })
      .from(products)
      .where(eq(products.department, "Toys"));

    const productResult = await db
      .select({
        name: products.name,
        price: products.price,
      })
      .from(products)
      .where(
        gt(products.price, sql`(${mostExpensiveProductInToysDepartment})`) // use the subquery as a scalar value since it returns one row and one column
      )
      .orderBy(desc(products.price));

    if (productResult.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({
      success: true,
      data: productResult,
    });
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
