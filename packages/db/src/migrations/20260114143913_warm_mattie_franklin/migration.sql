ALTER TABLE "orders" ADD COLUMN "id" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey";--> statement-breakpoint
ALTER TABLE "orders" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "product_id" DROP NOT NULL;