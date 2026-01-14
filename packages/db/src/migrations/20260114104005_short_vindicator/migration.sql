ALTER TABLE "products" ALTER COLUMN "name" SET DATA TYPE varchar(50) USING "name"::varchar(50);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "department" SET DATA TYPE varchar(50) USING "department"::varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET DATA TYPE varchar(50) USING "first_name"::varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET DATA TYPE varchar(50) USING "last_name"::varchar(50);