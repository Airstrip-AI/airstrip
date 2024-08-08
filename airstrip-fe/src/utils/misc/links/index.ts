export const appPrefix = '/app';

export const Links = {
  landing: () => '/',
  login: () => '/login',
  register: () => '/register',
  requestResetPassword: () => '/request-reset-password',
  appHome: () => `${appPrefix}`,

  users: (tab?: 'members' | 'teams') =>
    `${appPrefix}/users${tab ? `?tab=${tab}` : ''}`,
  aiIntegrations: () => `${appPrefix}/ai-integrations`,
  teams: () => `${appPrefix}/teams`,
  apps: (appId?: string) => `${appPrefix}/apps${appId ? `/${appId}` : ''}`,
  appUserMode: (appId: string) => `${appPrefix}/apps/usermode/${appId}`,

  invites: () => `${appPrefix}/invites`,
  publicInvites: () => `/invites`,
};
