ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey";
--> statement-breakpoint
DELETE FROM "orders" a
USING "orders" b
WHERE a.ctid < b.ctid
  AND a."user_id" = b."user_id"
  AND a."product_id" = b."product_id";
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "id";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY("user_id","product_id");
