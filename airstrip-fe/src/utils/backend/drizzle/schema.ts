import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { UserRole } from '../client/common/types';

// Users table
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    verified: boolean('verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at'),
    verifyToken: text('verify_token').unique(),
    verifyTokenExpiresAt: timestamp('verify_token_expires_at'),
    resetPasswordToken: text('reset_password_token').unique(),
    resetPasswordTokenExpiresAt: timestamp('reset_password_token_expires_at'),
    resetPasswordTokenCreatedAt: timestamp('reset_password_token_created_at'),
  },
  (table) => ({
    lowerEmailIndex: uniqueIndex('users_lower_email_idx').on(sql`lower(email)`),
  }),
);

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Org Users table
export const orgUsers = pgTable(
  'org_users',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').$type<UserRole>().notNull(),
    joinedOrgAt: timestamp('joined_org_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.orgId] }),
  }),
);

export const orgUsersToUserRelations = relations(orgUsers, ({ one }) => ({
  user: one(users, {
    fields: [orgUsers.userId],
    references: [users.id],
  }),
}));

// Org Teams table
export const orgTeams = pgTable(
  'org_teams',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdIndex: index('org_teams_org_id_idx').on(table.orgId),
  }),
);

// Org Team Users table
export const orgTeamUsers = pgTable(
  'org_team_users',
  {
    orgTeamId: uuid('org_team_id')
      .references(() => orgTeams.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id').notNull(),
    orgId: uuid('org_id').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    joinedTeamAt: timestamp('joined_team_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgTeamId, table.userId] }),
    orgTeamUsersRelations: foreignKey({
      columns: [table.userId, table.orgId],
      foreignColumns: [orgUsers.userId, orgUsers.orgId],
    }).onDelete('cascade'),
  }),
);

export const orgTeamUsersRelations = relations(orgTeamUsers, ({ one }) => ({
  orgTeam: one(orgTeams, {
    fields: [orgTeamUsers.orgId],
    references: [orgTeams.id],
  }),
  user: one(users, {
    fields: [orgTeamUsers.userId],
    references: [users.id],
  }),
}));

// Org Invites table
export const orgInvites = pgTable(
  'org_invites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    inviterId: uuid('inviter_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    email: text('email').notNull(),
    role: text('role').$type<UserRole>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    acceptedAt: timestamp('accepted_at'),
    token: text('token').unique().notNull(),
  },
  (table) => ({
    orgEmailUnique: uniqueIndex('org_invites_org_email_unique').on(
      table.orgId,
      table.email,
    ),
  }),
);

// AI Integrations table
export const aiIntegrations = pgTable(
  'ai_integrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    restrictedToTeamId: uuid('restricted_to_team_id').references(
      // null means unrestricted
      () => orgTeams.id,
      { onDelete: 'set null' },
    ),
    name: text('name').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    aiProvider: text('ai_provider').notNull(),
    aiProviderApiKey: text('ai_provider_api_key').unique().notNull(),
    aiProviderApiUrl: text('ai_provider_api_url'),
    aiModel: text('ai_model').notNull(),
  },
  (table) => ({
    orgProviderTeamIndex: index('ai_integrations_org_provider_team_idx').on(
      table.orgId,
      table.aiProvider,
      table.restrictedToTeamId,
    ),
  }),
);

export const aiIntegrationsToOrgTeamRelations = relations(
  aiIntegrations,
  ({ one }) => ({
    restrictedToTeam: one(orgTeams, {
      fields: [aiIntegrations.restrictedToTeamId],
      references: [orgTeams.id],
    }),
  }),
);

// Apps table
export const apps = pgTable(
  'apps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    teamId: uuid('team_id').references(() => orgTeams.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    type: text('type').notNull(),
    aiProviderId: uuid('ai_provider_id').references(() => aiIntegrations.id, {
      onDelete: 'set null',
    }),
    systemPrompt: text('system_prompt'),
    introductionMessage: text('introduction_message'),
    outputJsonSchema: text('output_json_schema'),
    temperature: numeric('temperature', { precision: 2, scale: 1 })
      .default('1.0')
      .notNull(),
  },
  (table) => ({
    orgTeamProviderIndex: index('apps_org_team_provider_idx').on(
      table.orgId,
      table.teamId,
      table.aiProviderId,
    ),
  }),
);

// Chats table
export const chats = pgTable(
  'chats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    appId: uuid('app_id')
      .references(() => apps.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgAppIndex: index('chats_org_app_idx').on(table.orgId, table.appId),
    userIdIndex: index('chats_user_id_idx').on(table.userId),
  }),
);

// Chat Messages table
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chatId: uuid('chat_id')
      .references(() => chats.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').$type<UserRole>().notNull(),
    clientGeneratedId: text('client_generated_id').unique().notNull(),
    content: text('content').notNull(),
    attachments: jsonb('attachments'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    chatIdIndex: index('chat_messages_chat_id_idx').on(table.chatId),
    roleIndex: index('chat_messages_role_idx').on(table.role),
  }),
);

// This schema should represent the SQL structure you provided.

export const messageTokenUsageData = pgTable(
  'message_token_usage_data',
  {
    chatMessageId: uuid('chat_message_id').primaryKey().notNull(),
    aiProvider: text('ai_provider').notNull(),
    aiModel: text('ai_model').notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    appId: uuid('app_id').references(() => apps.id, { onDelete: 'set null' }),
    usage: jsonb('usage').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (messageTokenUsageData) => ({
    orgAppIndex: index('org_app_index').on(
      messageTokenUsageData.orgId,
      messageTokenUsageData.appId,
    ),
  }),
);
