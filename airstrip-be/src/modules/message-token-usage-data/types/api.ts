import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, ValidateNested } from 'class-validator';

export class Usage {
  @IsPositive()
  @IsInt()
  @ApiProperty()
  promptTokens: number;

  @IsPositive()
  @IsInt()
  @ApiProperty()
  completionTokens: number;

  @IsPositive()
  @IsInt()
  @ApiProperty()
  totalTokens: number;
}

export class UsageData {
  @IsString()
  @ApiProperty()
  finishReason: string;

  @ValidateNested()
  @Type(() => Usage)
  @ApiProperty()
  usage: Usage;
}

export class SaveMessageTokenUsageDataReq {
  @ValidateNested()
  @Type(() => UsageData)
  @ApiProperty()
  usage: UsageData;
}
