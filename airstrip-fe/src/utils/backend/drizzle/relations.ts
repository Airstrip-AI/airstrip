import { relations } from 'drizzle-orm/relations';
import {
  aiIntegrations,
  appKbSources,
  apps,
  chatMessages,
  chats,
  kbSources,
  organizations,
  orgInvites,
  orgTeams,
  orgTeamUsers,
  orgUsers,
  users,
} from './schema';

export const orgTeamsRelations = relations(orgTeams, ({ one, many }) => ({
  organizations: one(organizations, {
    fields: [orgTeams.orgId],
    references: [organizations.id],
  }),
  apps: many(apps),
  aiIntegrations: many(aiIntegrations),
  orgTeamUsers: many(orgTeamUsers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  orgTeams: many(orgTeams),
  orgInvites: many(orgInvites),
  apps: many(apps),
  chats: many(chats),
  aiIntegrations: many(aiIntegrations),
  orgUsers: many(orgUsers),
}));

export const orgInvitesRelations = relations(orgInvites, ({ one }) => ({
  organizations: one(organizations, {
    fields: [orgInvites.orgId],
    references: [organizations.id],
  }),
  users: one(users, {
    fields: [orgInvites.inviterId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orgInvites: many(orgInvites),
  chats: many(chats),
  orgUsers: many(orgUsers),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chats: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  chatMessages: many(chatMessages),
  organizations: one(organizations, {
    fields: [chats.orgId],
    references: [organizations.id],
  }),
  apps: one(apps, {
    fields: [chats.appId],
    references: [apps.id],
  }),
  users: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  org: one(organizations, {
    fields: [apps.orgId],
    references: [organizations.id],
  }),
  team: one(orgTeams, {
    fields: [apps.teamId],
    references: [orgTeams.id],
  }),
  aiProvider: one(aiIntegrations, {
    fields: [apps.aiProviderId],
    references: [aiIntegrations.id],
  }),
  chats: many(chats),
  kbSources: many(appKbSources),
}));

export const aiIntegrationsRelations = relations(
  aiIntegrations,
  ({ one, many }) => ({
    apps: many(apps),
    organizations: one(organizations, {
      fields: [aiIntegrations.orgId],
      references: [organizations.id],
    }),
    restrictedToTeam: one(orgTeams, {
      fields: [aiIntegrations.restrictedToTeamId],
      references: [orgTeams.id],
    }),
  }),
);

export const orgUsersRelations = relations(orgUsers, ({ one, many }) => ({
  users: one(users, {
    fields: [orgUsers.userId],
    references: [users.id],
  }),
  organizations: one(organizations, {
    fields: [orgUsers.orgId],
    references: [organizations.id],
  }),
  orgTeamUsers: many(orgTeamUsers),
}));

export const orgTeamUsersRelations = relations(orgTeamUsers, ({ one }) => ({
  orgTeams: one(orgTeams, {
    fields: [orgTeamUsers.orgTeamId],
    references: [orgTeams.id],
  }),
  orgUsers: one(orgUsers, {
    fields: [orgTeamUsers.userId],
    references: [orgUsers.userId],
  }),
}));

export const appKbSourcesRelations = relations(appKbSources, ({ one }) => ({
  app: one(apps, {
    fields: [appKbSources.appId],
    references: [apps.id],
  }),
  sourceData: one(kbSources, {
    fields: [appKbSources.kbSourceId],
    references: [kbSources.id],
  }),
}));
