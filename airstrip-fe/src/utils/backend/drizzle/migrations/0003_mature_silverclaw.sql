CREATE TABLE IF NOT EXISTS "airstrip"."app_knowledge_base_sources" (
	"app_id" uuid NOT NULL,
	"kb_source_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_knowledge_base_sources_pkey" PRIMARY KEY("app_id","kb_source_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."knowledge_base_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"source_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."knowledge_base_sources" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"blob_key" text NOT NULL,
	"name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"org_id" uuid NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."app_knowledge_base_sources" ADD CONSTRAINT "app_knowledge_base_sources_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "airstrip"."apps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."app_knowledge_base_sources" ADD CONSTRAINT "app_knowledge_base_sources_kb_source_id_knowledge_base_sources_id_fk" FOREIGN KEY ("kb_source_id") REFERENCES "airstrip"."knowledge_base_sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."app_knowledge_base_sources" ADD CONSTRAINT "app_kb_sources_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "airstrip"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."app_knowledge_base_sources" ADD CONSTRAINT "app_kb_sources_kb_source_id_fkey" FOREIGN KEY ("kb_source_id") REFERENCES "airstrip"."knowledge_base_sources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."knowledge_base_embeddings" ADD CONSTRAINT "kb_embeddings_source_id_kb_sources_id_fkey" FOREIGN KEY ("source_id") REFERENCES "airstrip"."knowledge_base_sources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."knowledge_base_sources" ADD CONSTRAINT "knowledge_base_sources_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kbEmbeddingsIndex" ON "airstrip"."knowledge_base_embeddings" USING hnsw ("embedding" vector_cosine_ops);