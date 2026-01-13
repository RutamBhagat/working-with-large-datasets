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
  inArray,
  avg,
  lt,
  notInArray,
} from "@working-with-large-datasets/db";
import {
  orders,
  products,
  users,
} from "@working-with-large-datasets/db/schema";

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

productsRouter.get("/subquery-2", async (c) => {
  try {
    const subquery = db
      .select({
        userId: orders.userId,
      })
      .from(orders)
      .where(eq(orders.productId, 3))
      .as("subquery");

    const userResult = await db
      .select({
        firstName: users.firstName,
      })
      .from(users)
      .innerJoin(subquery, eq(users.id, subquery.userId));

    if (userResult.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({ success: true, data: userResult });
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

productsRouter.get("/subquery-3", async (c) => {
  try {
    const subquery = db
      .select({
        id: products.id,
      })
      .from(products)
      .where(gt(sql`${products.price} / ${products.weight}`, 400));

    const orderResult = await db
      .select({
        id: sql<string>`${orders.userId} || '-' || ${orders.productId}`.as(
          "id"
        ),
      })
      .from(orders)
      .where(inArray(orders.productId, subquery))
      .orderBy(desc(orders.userId));

    if (orderResult.length === 0) {
      return c.json(
        {
          success: false,
          data: { error: "No data found", message: "No data found" },
        },
        404
      );
    }

    return c.json({ success: true, data: orderResult });
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

productsRouter.get("/subquery-4", async (c) => {
  try {
    const subquery = db
      .select({
        averageProductPrice: avg(products.price).as("averageProductPrice"),
      })
      .from(products);

    const productResult = await db
      .select({
        name: products.name,
        price: products.price,
      })
      .from(products)
      .where(gt(products.price, subquery))
      .orderBy(asc(products.price));

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
});

productsRouter.get("/subquery-5", async (c) => {
  try {
    const subquery = db
      .select({
        department: products.department,
      })
      .from(products)
      .where(lt(products.price, 100));

    const productResult = await db
      .select({
        department: products.department,
        price: products.price,
      })
      .from(products)
      .where(notInArray(products.department, subquery))
      .orderBy(asc(products.price));

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
});

productsRouter.get("/subquery-6", async (c) => {
  try {
    const subquery = db
      .select({
        maxPrice: max(products.price).as("maxPrice"),
      })
      .from(products)
      .where(eq(products.department, "Industrial"));

    const productResult = await db
      .select({
        name: products.name,
        department: products.department,
        price: products.price,
      })
      .from(products)
      .where(gt(products.price, subquery))
      .orderBy(asc(products.price));

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
});
