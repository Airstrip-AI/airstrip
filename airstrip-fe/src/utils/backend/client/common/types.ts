export class MessageResp {
  message: string;
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum AiProvider {
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE',
  MISTRAL = 'MISTRAL',
  GOOGLE = 'GOOGLE',
  COHERE = 'COHERE',
  ANTHROPIC = 'ANTHROPIC',
}

export enum AppType {
  CHAT = 'CHAT',
  TOOL = 'TOOL',
}
