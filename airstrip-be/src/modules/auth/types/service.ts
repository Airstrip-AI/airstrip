import { Request } from 'express';
import { UserRole } from '../../../utils/constants';

export type AuthedUser = {
  id: string;
  email: string;
  firstName: string;
  orgs: Org[];
};

export type Org = {
  id: string;
  name: string;
  role: UserRole;
};

export type AuthedRequest = Request & { user: AuthedUser };
