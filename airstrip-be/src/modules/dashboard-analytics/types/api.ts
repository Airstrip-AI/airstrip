import { ApiProperty } from '@nestjs/swagger';
import { AiProvider } from '../../ai-integrations/types/common';

class App {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

class TokenUsageData {
  @ApiProperty()
  aiProvider: AiProvider;

  @ApiProperty()
  aiModel: string;

  @ApiProperty()
  totalPromptTokens: number;

  @ApiProperty()
  totalCompletionTokens: number;
}

export class AppUsageData {
  @ApiProperty({ type: App })
  app: App;

  @ApiProperty()
  totalUserMessages: number;

  @ApiProperty()
  totalAssistantMessages: number;

  @ApiProperty({ type: [TokenUsageData] })
  tokensUsage: TokenUsageData[];
}

export class AppsUsageDataResponse {
  @ApiProperty({ type: [AppUsageData] })
  data: AppUsageData[];
}
