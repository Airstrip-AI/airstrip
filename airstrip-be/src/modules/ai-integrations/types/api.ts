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
}

export class RestrictedToTeamResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class AiIntegrationKeyResp {
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
  aiProviderApiKey: string;

  @ApiProperty()
  aiProviderApiUrl: string | null;
}

export class ListAiIntegrationsResp {
  @ApiProperty({ type: [AiIntegrationKeyResp] })
  data: AiIntegrationKeyResp[];

  nextPageCursor: string | null;
}