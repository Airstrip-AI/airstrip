import { BE_API_HOST, BROWSER_BE_API_HOST } from '@/constants';

export async function makeGetRequest<T>({
  endpoint,
  authToken,
}: {
  endpoint: string;
  authToken?: string;
}): Promise<T> {
  const res = await fetch(new URL(endpoint, getBackendUrl()).href, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...addAuthHeaderIfPresent(authToken),
    },
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  return (await res.json()) as T;
}

export async function makePostRequest<T, U>({
  endpoint,
  authToken,
  body,
}: {
  endpoint: string;
  authToken?: string;
  body: T;
}): Promise<U> {
  const res = await fetch(new URL(endpoint, getBackendUrl()).href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...addAuthHeaderIfPresent(authToken),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  return (await res.json()) as U;
}

export async function makePutRequest<T, U>({
  endpoint,
  authToken,
  body,
}: {
  endpoint: string;
  authToken?: string;
  body: T;
}): Promise<U> {
  const res = await fetch(new URL(endpoint, getBackendUrl()).href, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...addAuthHeaderIfPresent(authToken),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  return (await res.json()) as U;
}

export async function makeDeleteRequest<T>({
  endpoint,
  authToken,
}: {
  endpoint: string;
  authToken?: string;
}): Promise<T> {
  const res = await fetch(new URL(endpoint, getBackendUrl()).href, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...addAuthHeaderIfPresent(authToken),
    },
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  return (await res.json()) as T;
}

export function getBackendUrl(): string {
  if (!BE_API_HOST) {
    throw new Error('API URL not set');
  }

  // BE APIs can be called from browser or routes/server actions
  // On docker environment, the url pointing to BE service is different on each environment
  // e.g. 'http://be' for docker, 'http://localhost' for browser
  if (typeof window !== 'undefined') {
    return BROWSER_BE_API_HOST || BE_API_HOST;
  }

  return BE_API_HOST;
}

async function constructError(res: Response): Promise<Error> {
  if (res.status >= 500) {
    return new Error('An internal server error occurred. Please try again.');
  } else {
    const resJson = await res.json();
    return new Error(resJson?.message || 'No error message provided.');
  }
}

function addAuthHeaderIfPresent(authToken?: string):
  | {
      Authorization: string;
    }
  | {} {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}
