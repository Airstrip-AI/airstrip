export const appPrefix = '/app';

export const Links = {
  landing: () => '/',
  login: () => '/login',
  register: () => '/register',
  requestResetPassword: () => '/request-reset-password',
  appHome: () => `${appPrefix}/apps`, // Make this the default page for authenticated users until we find a better home page.
  dashboard: () => `${appPrefix}/dashboard`,
  users: (tab?: 'members' | 'teams') =>
    `${appPrefix}/users${tab ? `?tab=${tab}` : ''}`,
  aiIntegrations: () => `${appPrefix}/ai-integrations`,
  teams: () => `${appPrefix}/teams`,
  apps: (appId?: string) => `${appPrefix}/apps${appId ? `/${appId}` : ''}`,
  appUserMode: (appId: string) => `${appPrefix}/apps/usermode/${appId}`,

  invites: () => `${appPrefix}/invites`,
  publicInvites: () => `/invites`,
};
