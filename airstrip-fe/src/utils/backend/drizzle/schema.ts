import type { GenericBlock } from '@/components/app-editor/blocks/types';
import {
  AiProvider,
  AppType,
  UserRole,
} from '@/utils/backend/client/common/types';
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
  vector,
} from 'drizzle-orm/pg-core';

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
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
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
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
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
    type: text('type').$type<AppType>().notNull(),
    aiProviderId: uuid('ai_provider_id'),
    systemPrompt: text('system_prompt'),
    systemPromptJson: jsonb('system_prompt_json').$type<GenericBlock[]>(),
    introductionMessage: text('introduction_message'),
    outputJsonSchema: text('output_json_schema'),
    temperature: doublePrecision('temperature').default(1).notNull(),
    memory: boolean('memory').default(false).notNull(),
    memoryQuery: text('memory_query')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
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
    aiProvider: text('ai_provider').$type<AiProvider>().notNull(),
    aiProviderApiKey: text('ai_provider_api_key').notNull(),
    aiProviderApiUrl: text('ai_provider_api_url'),
    aiModel: text('ai_model').notNull(),
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
    };
  },
);

export const orgUsers = airstrip.table(
  'org_users',
  {
    userId: uuid('user_id').notNull(),
    orgId: uuid('org_id').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    joinedOrgAt: timestamp('joined_org_at', { withTimezone: true })
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
    joinedTeamAt: timestamp('joined_team_at', { withTimezone: true })
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

export const kbSources = airstrip.table(
  'knowledge_base_sources',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    blobKey: text('blob_key').notNull(), // Key that represents blob in bucket e.g. `foo/bar/baz.pdf`
    name: text('name').notNull(),
    contentType: text('content_type').notNull(),
    size: integer('size').notNull(), // size in bytes
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    orgId: uuid('org_id').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (table) => {
    return {
      kbSourcesOrgIdFkey: foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: 'knowledge_base_sources_org_id_fkey',
      }).onDelete('cascade'),
    };
  },
);

export const kbEmbeddings = airstrip.table(
  'knowledge_base_embeddings',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    sourceId: uuid('source_id').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }), // ada-small
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      embeddingsSourceIdKbSourcesIdFkey: foreignKey({
        columns: [table.sourceId],
        foreignColumns: [kbSources.id],
        name: 'kb_embeddings_source_id_kb_sources_id_fkey',
      }).onDelete('cascade'),
      embeddingIndex: index('kbEmbeddingsIndex').using(
        'hnsw',
        table.embedding.op('vector_cosine_ops'),
      ),
    };
  },
);

export const appKbSources = airstrip.table(
  'app_knowledge_base_sources',
  {
    appId: uuid('app_id').notNull(),
    kbSourceId: uuid('kb_source_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    appKbSourcesAppIdFkey: foreignKey({
      columns: [table.appId],
      foreignColumns: [apps.id],
      name: 'app_kb_sources_app_id_fkey',
    }).onDelete('cascade'),
    appKbSourcesKbSourceIdFkey: foreignKey({
      columns: [table.kbSourceId],
      foreignColumns: [kbSources.id],
      name: 'app_kb_sources_kb_source_id_fkey',
    }).onDelete('cascade'),
    appKbSourcesPkey: primaryKey({
      columns: [table.appId, table.kbSourceId],
      name: 'app_knowledge_base_sources_pkey',
    }),
  }),
);
