CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT 'f',
  verified_at TIMESTAMPTZ,
  verify_token TEXT UNIQUE,
  verify_token_expires_at TIMESTAMPTZ,
  reset_password_token TEXT UNIQUE,
  reset_password_token_expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX ON users(lower(email));

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_users (
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  role TEXT NOT NULL,
  joined_org_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, org_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE org_teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX ON org_teams(org_id);

CREATE TABLE org_team_users (
  org_team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  role TEXT NOT NULL,
  joined_team_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(org_team_id, user_id),
  FOREIGN KEY(org_team_id) REFERENCES org_teams(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id, org_id) REFERENCES org_users(user_id, org_id) ON DELETE CASCADE
);

CREATE TABLE org_invites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL,
  inviter_id uuid NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  token TEXT UNIQUE NOT NULL,
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(inviter_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (org_id, email)
);

CREATE TABLE ai_integrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL,
  restricted_to_team_id uuid, -- null means unrestricted
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ai_provider TEXT NOT NULL,
  ai_provider_api_key TEXT UNIQUE NOT NULL,
  ai_provider_api_url TEXT,
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(restricted_to_team_id) REFERENCES org_teams(id) ON DELETE SET NULL
);

CREATE INDEX ON ai_integrations(org_id, ai_provider, restricted_to_team_id);

CREATE TABLE apps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  org_id uuid NOT NULL,
  team_id uuid,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  ai_provider_id uuid,
  system_prompt TEXT,
  introduction_message TEXT,
  output_json_schema TEXT,
  ai_model TEXT,
  temperature FLOAT NOT NULL DEFAULT 1.0,
  FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(team_id) REFERENCES org_teams(id) ON DELETE SET NULL,
  FOREIGN KEY(ai_provider_id) REFERENCES ai_integrations(id) ON DELETE SET NULL
);

CREATE INDEX ON apps(org_id, team_id, ai_provider_id);