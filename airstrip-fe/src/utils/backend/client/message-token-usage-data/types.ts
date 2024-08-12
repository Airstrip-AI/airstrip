export class Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class UsageData {
  finishReason: string;
  usage: Usage;
}

export class SaveMessageTokenUsageDataReq {
  usage: UsageData;
}
