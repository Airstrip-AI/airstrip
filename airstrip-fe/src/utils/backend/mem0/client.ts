// Ref: https://www.npmjs.com/package/mem0ai
// Refactored to TS and to use fetch instead of Axios

import { MemoryData } from './type';

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

function apiErrorHandler<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return async function (
    this: unknown,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    try {
      return await fn.apply(this, args);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw error;
      } else {
        throw new APIError(`API request failed: ${error.message}`);
      }
    }
  } as T;
}

const defaultHost = 'https://api.mem0.ai/v1';

class MemoryClient {
  private apiKey: string;
  private host: string;

  constructor(apiKey?: string, host?: string) {
    this.apiKey = apiKey || '';
    this.host = host || defaultHost;

    if (!this.apiKey) {
      throw new Error('API Key not provided. Please provide an API Key.');
    }

    // Disable running this since we're using actions, and we don't want to keep validating for every action call
    // this._validateApiKey();

    // Apply error handler to methods
    this.add = apiErrorHandler(this.add.bind(this));
    this.get = apiErrorHandler(this.get.bind(this));
    this.getAll = apiErrorHandler(this.getAll.bind(this));
    this.search = apiErrorHandler(this.search.bind(this));
    this.delete = apiErrorHandler(this.delete.bind(this));
    this.deleteAll = apiErrorHandler(this.deleteAll.bind(this));
    this.history = apiErrorHandler(this.history.bind(this));
  }

  private async _validateApiKey(): Promise<void> {
    try {
      await this.get('/memories');
    } catch (error) {
      throw new Error(
        'Invalid API Key. Please get a valid API Key from https://app.mem0.ai',
      );
    }
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(this.host + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.apiKey}`,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new APIError(`API request failed: ${errorData}`);
    }

    return response.json();
  }

  async add(
    messages: string | Array<{ role: string; content: string }>,
    options: Record<string, any> = {},
  ): Promise<any> {
    const payload = this._preparePayload(messages, options);
    return await this.request('/memories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async get(memoryId: string): Promise<any> {
    return await this.request(`/memories/${memoryId}`, {
      method: 'GET',
    });
  }

  async getAll(options: Record<string, any> = {}): Promise<any> {
    const params = this._prepareParams(options);
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/memories/?${queryString}`, {
      method: 'GET',
    });
  }

  async search(
    query: string,
    options: Record<string, any> = {},
  ): Promise<MemoryData[]> {
    const payload = { query, ...options };
    return await this.request('/memories/search', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async delete(memoryId: string): Promise<any> {
    return await this.request(`/memories/${memoryId}`, {
      method: 'DELETE',
    });
  }

  async deleteAll(options: Record<string, any> = {}): Promise<any> {
    const params = this._prepareParams(options);
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/memories/?${queryString}`, {
      method: 'DELETE',
    });
  }

  async history(memoryId: string): Promise<any> {
    return await this.request(`/memories/${memoryId}/history`, {
      method: 'GET',
    });
  }

  async users(): Promise<any> {
    return await this.request('/entities', {
      method: 'GET',
    });
  }

  private _preparePayload(
    messages: string | Array<{ role: string; content: string }>,
    options: Record<string, any>,
  ): Record<string, any> {
    const payload: Record<string, any> = {};
    if (typeof messages === 'string') {
      payload.messages = [{ role: 'user', content: messages }];
    } else if (Array.isArray(messages)) {
      payload.messages = messages;
    }
    return { ...payload, ...options };
  }

  private _prepareParams(options: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v != null),
    );
  }
}

export { APIError, apiErrorHandler, MemoryClient };
