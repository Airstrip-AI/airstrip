CREATE TABLE chats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL,
  app_id uuid NOT NULL,
  user_id uuid,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NUll -- we may want to retain info for analytics purposes
);

CREATE INDEX ON chats(org_id, app_id);
CREATE INDEX ON chats(user_id);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id uuid NOT NULL,
  role TEXT NOT NULL,
  client_generated_id TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE INDEX ON chat_messages(chat_id);
CREATE INDEX ON chat_messages(role);

-- some denormalized data for analytics. foreign keys are not enforced on purpose.
CREATE TABLE message_token_usage_data (
  chat_message_id uuid NOT NULL PRIMARY KEY,
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  org_id uuid NOT NULL,
  app_id uuid,
  usage JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE SET NULL
);

CREATE INDEX ON message_token_usage_data(org_id, app_id);