import { sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { UserRole } from '../client/common/types';

export const airstrip = pgSchema('airstrip');

export const users = airstrip.table(
  'users',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    verified: boolean('verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at', {
      withTimezone: true,
    }),
    verifyToken: text('verify_token'),
    verifyTokenExpiresAt: timestamp('verify_token_expires_at', {
      withTimezone: true,
    }),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordTokenExpiresAt: timestamp('reset_password_token_expires_at', {
      withTimezone: true,
    }),
    resetPasswordTokenCreatedAt: timestamp('reset_password_token_created_at', {
      withTimezone: true,
    }),
  },
  (table) => {
    return {
      lowerIdx: uniqueIndex('users_lower_idx').using(
        'btree',
        sql`lower(email)`,
      ),
      usersVerifyTokenKey: unique('users_verify_token_key').on(
        table.verifyToken,
      ),
      usersResetPasswordTokenKey: unique('users_reset_password_token_key').on(
        table.resetPasswordToken,
      ),
    };
  },
);

export const organizations = airstrip.table('organizations', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orgTeams = airstrip.table(
  'org_teams',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    orgId: uuid('org_id').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orgIdIdx: index('org_teams_org_id_idx').using(
        'btree',
        table.orgId.asc().nullsLast(),
      ),
      orgTeamsOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'org_teams_org_id_fkey',
      }).onDelete('cascade'),
    };
  },
);

export const orgInvites = airstrip.table(
  'org_invites',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    orgId: uuid('org_id').notNull(),
    inviterId: uuid('inviter_id').notNull(),
    email: text('email').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    acceptedAt: timestamp('accepted_at', {
      withTimezone: true,
    }),
    token: text('token').notNull(),
  },
  (table) => {
    return {
      orgInvitesOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'org_invites_org_id_fkey',
      }).onDelete('cascade'),
      orgInvitesInviterIdFkey: foreignKey({
        columns: [table.inviterId],
        foreignColumns: [users.id],
        name: 'org_invites_inviter_id_fkey',
      }).onDelete('cascade'),
      orgInvitesOrgIdEmailKey: unique('org_invites_org_id_email_key').on(
        table.orgId,
        table.email,
      ),
      orgInvitesTokenKey: unique('org_invites_token_key').on(table.token),
    };
  },
);

export const aiIntegrations = airstrip.table(
  'ai_integrations',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    orgId: uuid('org_id').notNull(),
    restrictedToTeamId: uuid('restricted_to_team_id'),
    name: text('name').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    aiProvider: text('ai_provider').notNull(),
    aiProviderApiKey: text('ai_provider_api_key').notNull(),
    aiProviderApiUrl: text('ai_provider_api_url'),
  },
  (table) => {
    return {
      orgIdAiProviderRestrictedToTeamIdIdx: index(
        'ai_integrations_org_id_ai_provider_restricted_to_team_id_idx',
      ).using(
        'btree',
        table.orgId.asc().nullsLast(),
        table.aiProvider.asc().nullsLast(),
        table.restrictedToTeamId.asc().nullsLast(),
      ),
      aiIntegrationsOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'ai_integrations_org_id_fkey',
      }).onDelete('cascade'),
      aiIntegrationsRestrictedToTeamIdFkey: foreignKey({
        columns: [table.restrictedToTeamId],
        foreignColumns: [orgTeams.id],
        name: 'ai_integrations_restricted_to_team_id_fkey',
      }).onDelete('set null'),
      aiIntegrationsAiProviderApiKeyKey: unique(
        'ai_integrations_ai_provider_api_key_key',
      ).on(table.aiProviderApiKey),
    };
  },
);

export const chatMessages = airstrip.table(
  'chat_messages',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    chatId: uuid('chat_id').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    clientGeneratedId: text('client_generated_id').notNull(),
    content: text('content').notNull(),
    attachments: jsonb('attachments'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      chatIdIdx: index('chat_messages_chat_id_idx').using(
        'btree',
        table.chatId.asc().nullsLast(),
      ),
      roleIdx: index('chat_messages_role_idx').using(
        'btree',
        table.role.asc().nullsLast(),
      ),
      chatMessagesChatIdFkey: foreignKey({
        columns: [table.chatId],
        foreignColumns: [chats.id],
        name: 'chat_messages_chat_id_fkey',
      }).onDelete('cascade'),
      chatMessagesClientGeneratedIdKey: unique(
        'chat_messages_client_generated_id_key',
      ).on(table.clientGeneratedId),
    };
  },
);

export const apps = airstrip.table(
  'apps',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    orgId: uuid('org_id').notNull(),
    teamId: uuid('team_id'),
    name: text('name').notNull(),
    description: text('description').notNull(),
    type: text('type').notNull(),
    aiProviderId: uuid('ai_provider_id'),
    systemPrompt: text('system_prompt'),
    introductionMessage: text('introduction_message'),
    outputJsonSchema: text('output_json_schema'),
    aiModel: text('ai_model'),
    temperature: doublePrecision('temperature').default(1).notNull(),
  },
  (table) => {
    return {
      orgIdTeamIdAiProviderIdIdx: index(
        'apps_org_id_team_id_ai_provider_id_idx',
      ).using(
        'btree',
        table.orgId.asc().nullsLast(),
        table.teamId.asc().nullsLast(),
        table.aiProviderId.asc().nullsLast(),
      ),
      appsOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'apps_org_id_fkey',
      }).onDelete('cascade'),
      appsTeamIdFkey: foreignKey({
        columns: [table.teamId],
        foreignColumns: [orgTeams.id],
        name: 'apps_team_id_fkey',
      }).onDelete('set null'),
      appsAiProviderIdFkey: foreignKey({
        columns: [table.aiProviderId],
        foreignColumns: [aiIntegrations.id],
        name: 'apps_ai_provider_id_fkey',
      }).onDelete('set null'),
    };
  },
);

export const chats = airstrip.table(
  'chats',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    orgId: uuid('org_id').notNull(),
    appId: uuid('app_id').notNull(),
    userId: uuid('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orgIdAppIdIdx: index('chats_org_id_app_id_idx').using(
        'btree',
        table.orgId.asc().nullsLast(),
        table.appId.asc().nullsLast(),
      ),
      userIdIdx: index('chats_user_id_idx').using(
        'btree',
        table.userId.asc().nullsLast(),
      ),
      chatsOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'chats_org_id_fkey',
      }).onDelete('cascade'),
      chatsAppIdFkey: foreignKey({
        columns: [table.appId],
        foreignColumns: [apps.id],
        name: 'chats_app_id_fkey',
      }).onDelete('cascade'),
      chatsUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: 'chats_user_id_fkey',
      }).onDelete('set null'),
    };
  },
);

export const messageTokenUsageData = airstrip.table(
  'message_token_usage_data',
  {
    chatMessageId: uuid('chat_message_id').primaryKey().notNull(),
    aiProvider: text('ai_provider').notNull(),
    aiModel: text('ai_model').notNull(),
    orgId: uuid('org_id').notNull(),
    appId: uuid('app_id'),
    usage: jsonb('usage').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orgIdAppIdIdx: index('message_token_usage_data_org_id_app_id_idx').using(
        'btree',
        table.orgId.asc().nullsLast(),
        table.appId.asc().nullsLast(),
      ),
      messageTokenUsageDataOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'message_token_usage_data_org_id_fkey',
      }).onDelete('cascade'),
      messageTokenUsageDataAppIdFkey: foreignKey({
        columns: [table.appId],
        foreignColumns: [apps.id],
        name: 'message_token_usage_data_app_id_fkey',
      }).onDelete('set null'),
    };
  },
);

export const orgUsers = airstrip.table(
  'org_users',
  {
    userId: uuid('user_id').notNull(),
    orgId: uuid('org_id').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    joinedOrgAt: timestamp('joined_org_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orgUsersUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: 'org_users_user_id_fkey',
      }).onDelete('cascade'),
      orgUsersOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'org_users_org_id_fkey',
      }).onDelete('cascade'),
      orgUsersPkey: primaryKey({
        columns: [table.userId, table.orgId],
        name: 'org_users_pkey',
      }),
    };
  },
);

export const orgTeamUsers = airstrip.table(
  'org_team_users',
  {
    orgTeamId: uuid('org_team_id').notNull(),
    userId: uuid('user_id').notNull(),
    orgId: uuid('org_id').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    joinedTeamAt: timestamp('joined_team_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orgTeamUsersOrgTeamIdFkey: foreignKey({
        columns: [table.orgTeamId],
        foreignColumns: [orgTeams.id],
        name: 'org_team_users_org_team_id_fkey',
      }).onDelete('cascade'),
      orgTeamUsersUserIdOrgIdFkey: foreignKey({
        columns: [table.userId, table.orgId],
        foreignColumns: [orgUsers.userId, orgUsers.orgId],
        name: 'org_team_users_user_id_org_id_fkey',
      }).onDelete('cascade'),
      orgTeamUsersPkey: primaryKey({
        columns: [table.orgTeamId, table.userId],
        name: 'org_team_users_pkey',
      }),
    };
  },
);

// ===== Start: Remnant of flyway table =====
// This is to prevent migration from dropping flyway history table
// We can remove this if no longer needed.
export const flywaySchemaHistoryInAirstrip = airstrip.table(
  'flyway_schema_history',
  {
    installedRank: integer('installed_rank').primaryKey().notNull(),
    version: varchar('version', { length: 50 }),
    description: varchar('description', { length: 200 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    script: varchar('script', { length: 1000 }).notNull(),
    checksum: integer('checksum'),
    installedBy: varchar('installed_by', { length: 100 }).notNull(),
    installedOn: timestamp('installed_on', { mode: 'string' })
      .defaultNow()
      .notNull(),
    executionTime: integer('execution_time').notNull(),
    success: boolean('success').notNull(),
  },
  (table) => {
    return {
      sIdx: index('flyway_schema_history_s_idx').using(
        'btree',
        table.success.asc().nullsLast(),
      ),
    };
  },
);
// ===== End: Remnant of flyway table =====
