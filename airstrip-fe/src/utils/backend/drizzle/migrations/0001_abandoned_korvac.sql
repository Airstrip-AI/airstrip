ALTER TABLE "airstrip"."apps" ADD COLUMN "memory" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "airstrip"."apps" ADD COLUMN "memory_query" text[] DEFAULT ARRAY[]::text[] NOT NULL;