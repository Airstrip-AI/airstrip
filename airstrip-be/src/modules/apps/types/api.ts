import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { AppType } from './common';
import { AiProvider } from '../../ai-integrations/types/common';
import { UserRole } from '../../../utils/constants';

export class CreateAppReq {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsEnum(AppType)
  @ApiProperty()
  type: AppType;

  @IsOptional()
  @IsUUID()
  @ApiProperty()
  teamId: string | null;
}

export class UpdateAppReq {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsEnum(AppType)
  @ApiProperty()
  type: AppType;

  @IsOptional()
  @IsUUID()
  @ApiProperty()
  aiProviderId: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty()
  systemPrompt: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty()
  introductionMessage: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty()
  outputJsonSchema: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  temperature: number;
}

export class OrgResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class TeamResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class AiIntegrationResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  provider: AiProvider;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class AppResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: OrgResp })
  org: OrgResp;

  @ApiProperty({ type: TeamResp, required: false })
  team: TeamResp | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: AppType;

  @ApiProperty({ type: AiIntegrationResp, required: false })
  aiProvider: AiIntegrationResp | null;

  @ApiProperty()
  systemPrompt: string | null;

  @ApiProperty()
  introductionMessage: string | null;

  @ApiProperty()
  outputJsonSchema: string | null;

  @ApiProperty()
  temperature: number;
}

export class ListAppsResp {
  @ApiProperty({ type: [AppResp] })
  data: AppResp[];

  @ApiProperty()
  nextPageCursor: string | null;
}

/**
 * This does not return sensitive data like api key, hence can be returned to MEMBER level users.
 */
export class AllowedAiProviderResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  aiProvider: AiProvider;
}

export class GetAllowedAiProvidersForAppResp {
  @ApiProperty({ type: [AllowedAiProviderResp] })
  data: AllowedAiProviderResp[];
}

export class CheckUserPrivilegesForAppResp {
  @ApiProperty()
  accessLevel: UserRole | null;
}
