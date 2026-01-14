ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "unique_name_department" UNIQUE("name","department");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "positive_price" CHECK ("price" > 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "positive_weight" CHECK ("weight" > 0);