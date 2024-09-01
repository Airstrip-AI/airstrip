import { relations } from 'drizzle-orm/relations';
import {
  aiIntegrations,
  apps,
  chatMessages,
  chats,
  messageTokenUsageData,
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
  aiIntegrationss: many(aiIntegrations),
  apps: many(apps),
  orgTeamUserss: many(orgTeamUsers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  orgTeamss: many(orgTeams),
  orgInvitess: many(orgInvites),
  aiIntegrationss: many(aiIntegrations),
  apps: many(apps),
  chatss: many(chats),
  messageTokenUsageDatas: many(messageTokenUsageData),
  orgUserss: many(orgUsers),
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
  orgInvitess: many(orgInvites),
  chatss: many(chats),
  orgUserss: many(orgUsers),
}));

export const aiIntegrationsRelations = relations(
  aiIntegrations,
  ({ one, many }) => ({
    organizations: one(organizations, {
      fields: [aiIntegrations.orgId],
      references: [organizations.id],
    }),
    restrictedToTeam: one(orgTeams, {
      fields: [aiIntegrations.restrictedToTeamId],
      references: [orgTeams.id],
    }),
    apps: many(apps),
  }),
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chats: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  chatMessagess: many(chatMessages),
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
  organizations: one(organizations, {
    fields: [apps.orgId],
    references: [organizations.id],
  }),
  orgTeams: one(orgTeams, {
    fields: [apps.teamId],
    references: [orgTeams.id],
  }),
  aiIntegrations: one(aiIntegrations, {
    fields: [apps.aiProviderId],
    references: [aiIntegrations.id],
  }),
  chatss: many(chats),
  messageTokenUsageDatas: many(messageTokenUsageData),
}));

export const messageTokenUsageDataRelations = relations(
  messageTokenUsageData,
  ({ one }) => ({
    organizations: one(organizations, {
      fields: [messageTokenUsageData.orgId],
      references: [organizations.id],
    }),
    apps: one(apps, {
      fields: [messageTokenUsageData.appId],
      references: [apps.id],
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
  orgTeamUserss: many(orgTeamUsers),
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
