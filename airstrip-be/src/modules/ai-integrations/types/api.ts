import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AiProvider } from './common';

export class CreateAiIntegrationReq {
  @IsOptional()
  @IsUUID()
  @ApiProperty()
  restrictedToTeamId: string | null;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsEnum(AiProvider)
  @ApiProperty()
  aiProvider: AiProvider;

  @IsString()
  @ApiProperty()
  aiProviderApiKey: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  aiProviderApiUrl: string | null;

  @IsString()
  @ApiProperty()
  aiModel: string;
}

export class UpdateAiIntegrationReq {
  @IsOptional()
  @IsUUID()
  @ApiProperty()
  restrictedToTeamId: string | null;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsEnum(AiProvider)
  @ApiProperty()
  aiProvider: AiProvider;

  @IsString()
  @ApiProperty()
  aiProviderApiKey: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  aiProviderApiUrl: string | null;

  @IsString()
  @ApiProperty()
  aiModel: string;
}

export class RestrictedToTeamResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class AiIntegrationResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  orgId: string;

  @ApiProperty({ type: RestrictedToTeamResp, required: false })
  restrictedToTeam: RestrictedToTeamResp | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  aiProvider: AiProvider;

  @ApiProperty()
  aiProviderApiUrl: string | null;

  @ApiProperty()
  aiModel: string;
}

export class AiIntegrationWithApiKeyResp extends AiIntegrationResp {
  @ApiProperty()
  aiProviderApiKey: string;
}

export class ListAiIntegrationsResp {
  @ApiProperty({ type: [AiIntegrationResp] })
  data: AiIntegrationResp[];

  nextPageCursor: string | null;
}

export class GetAllAiIntegrationsAccessibleByTeamResp {
  @ApiProperty({ type: [AiIntegrationResp] })
  data: AiIntegrationResp[];
}
