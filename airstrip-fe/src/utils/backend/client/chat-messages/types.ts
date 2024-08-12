export class Attachment {
  name?: string;
  contentType?: string;
  url: string;
}

export class SaveChatMessageReq {
  role: string;
  clientGeneratedId: string;
  content: string;
  attachments: Attachment[] | null;
  createdAt: Date;
}

export class CreateChatWithFirstMessageReq {
  firstMessage: SaveChatMessageReq;
}

export class SaveChatMessageResp {
  id: string;
  clientGeneratedId: string;
}

export class CreateChatWithFirstMessageResp {
  chatId: string;
  firstMessage: SaveChatMessageResp;
}
