ALTER TABLE "orders" RENAME CONSTRAINT "orders_user_id_fkey" TO "orders_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "orders" RENAME CONSTRAINT "orders_product_id_fkey" TO "orders_product_id_products_id_fkey";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "orders_id_seq";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
SELECT setval('orders_id_seq'::regclass, (SELECT COALESCE(MAX(id), 1) FROM "orders"), false);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "products_id_seq";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
SELECT setval('products_id_seq'::regclass, (SELECT COALESCE(MAX(id), 1) FROM "products"), false);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "users_id_seq";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
SELECT setval('users_id_seq'::regclass, (SELECT COALESCE(MAX(id), 1) FROM "users"), false);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "name" SET DATA TYPE text USING "name"::text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET DATA TYPE text USING "first_name"::text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "department" SET DATA TYPE text USING "department"::text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET DATA TYPE text USING "last_name"::text;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_product_id_products_id_fkey", ADD CONSTRAINT "orders_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fkey", ADD CONSTRAINT "orders_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");