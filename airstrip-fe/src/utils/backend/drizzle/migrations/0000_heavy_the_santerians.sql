-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."flyway_schema_history" (
	"installed_rank" integer PRIMARY KEY NOT NULL,
	"version" varchar(50),
	"description" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"script" varchar(1000) NOT NULL,
	"checksum" integer,
	"installed_by" varchar(100) NOT NULL,
	"installed_on" timestamp DEFAULT now() NOT NULL,
	"execution_time" integer NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"verify_token" text,
	"verify_token_expires_at" timestamp with time zone,
	"reset_password_token" text,
	"reset_password_token_expires_at" timestamp with time zone,
	"reset_password_token_created_at" timestamp with time zone,
	CONSTRAINT "users_verify_token_key" UNIQUE("verify_token"),
	CONSTRAINT "users_reset_password_token_key" UNIQUE("reset_password_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."organizations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."org_teams" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."org_invites" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"org_id" uuid NOT NULL,
	"inviter_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"token" text NOT NULL,
	CONSTRAINT "org_invites_org_id_email_key" UNIQUE("org_id","email"),
	CONSTRAINT "org_invites_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" text NOT NULL,
	"client_generated_id" text NOT NULL,
	"content" text NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_messages_client_generated_id_key" UNIQUE("client_generated_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."apps" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"org_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"ai_provider_id" uuid,
	"system_prompt" text,
	"introduction_message" text,
	"output_json_schema" text,
	"temperature" double precision DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."chats" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"org_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."ai_integrations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"org_id" uuid NOT NULL,
	"restricted_to_team_id" uuid,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ai_provider" text NOT NULL,
	"ai_provider_api_key" text NOT NULL,
	"ai_provider_api_url" text,
	"ai_model" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."org_users" (
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"role" text NOT NULL,
	"joined_org_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_users_pkey" PRIMARY KEY("user_id","org_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airstrip"."org_team_users" (
	"org_team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"role" text NOT NULL,
	"joined_team_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_team_users_pkey" PRIMARY KEY("org_team_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_teams" ADD CONSTRAINT "org_teams_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_invites" ADD CONSTRAINT "org_invites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_invites" ADD CONSTRAINT "org_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "airstrip"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "airstrip"."chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."apps" ADD CONSTRAINT "apps_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."apps" ADD CONSTRAINT "apps_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "airstrip"."org_teams"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."apps" ADD CONSTRAINT "apps_ai_provider_id_fkey" FOREIGN KEY ("ai_provider_id") REFERENCES "airstrip"."ai_integrations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."chats" ADD CONSTRAINT "chats_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."chats" ADD CONSTRAINT "chats_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "airstrip"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "airstrip"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."ai_integrations" ADD CONSTRAINT "ai_integrations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."ai_integrations" ADD CONSTRAINT "ai_integrations_restricted_to_team_id_fkey" FOREIGN KEY ("restricted_to_team_id") REFERENCES "airstrip"."org_teams"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_users" ADD CONSTRAINT "org_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "airstrip"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_users" ADD CONSTRAINT "org_users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "airstrip"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_team_users" ADD CONSTRAINT "org_team_users_org_team_id_fkey" FOREIGN KEY ("org_team_id") REFERENCES "airstrip"."org_teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "airstrip"."org_team_users" ADD CONSTRAINT "org_team_users_user_id_org_id_fkey" FOREIGN KEY ("user_id","org_id") REFERENCES "airstrip"."org_users"("user_id","org_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flyway_schema_history_s_idx" ON "airstrip"."flyway_schema_history" USING btree ("success");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_lower_idx" ON "airstrip"."users" USING btree (lower(email));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_teams_org_id_idx" ON "airstrip"."org_teams" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_chat_id_idx" ON "airstrip"."chat_messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_role_idx" ON "airstrip"."chat_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apps_org_id_team_id_ai_provider_id_idx" ON "airstrip"."apps" USING btree ("org_id","team_id","ai_provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chats_org_id_app_id_idx" ON "airstrip"."chats" USING btree ("org_id","app_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chats_user_id_idx" ON "airstrip"."chats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_integrations_org_id_ai_provider_restricted_to_team_id_idx" ON "airstrip"."ai_integrations" USING btree ("org_id","ai_provider","restricted_to_team_id");
