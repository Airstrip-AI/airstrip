import { getUserAuthToken, verifyAuthToken } from '@/hooks/user';
import invariant from 'invariant';

export function getValidToken(): string {
  const token = getUserAuthToken();

  invariant(
    !!token,
    'The request was not sent because no auth token was retrieved.',
  );
  invariant(verifyAuthToken(token), 'User session has expired.');

  return token;
}

export enum QueryKeys {
  USER = 'USER',
  ORG_USERS = 'ORG_USERS',
  ORG_INVITES = 'ORG_INVITES',
  USER_ORG_INVITES = 'USER_ORG_INVITES',
  USER_ORG_TEAMS = 'USER_ORG_TEAMS',
  USER_APP_PRIVILEGES = 'USER_APP_PRIVILEGES',
  ORG_TEAMS = 'ORG_TEAMS',
  ORG_TEAM_USERS = 'ORG_TEAM_USERS',
  ORG_TEAM_ORG_USERS = 'ORG_TEAM_ORG_USERS',
  AI_INTEGRATIONS = 'AI_INTEGRATIONS',
  APPS = 'APPS',
}
