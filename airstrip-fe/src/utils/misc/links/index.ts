export const appPrefix = '/app';

export const Links = {
  landing: () => '/',
  login: () => '/login',
  register: () => '/register',
  requestResetPassword: () => '/request-reset-password',
  appHome: () => `${appPrefix}`,

  users: () => `${appPrefix}/users`,
  aiIntegrations: () => `${appPrefix}/ai-integrations`,
  teams: () => `${appPrefix}/teams`,
  apps: () => `${appPrefix}/apps`,

  invites: () => `${appPrefix}/invites`,
  publicInvites: () => `/invites`,
};
