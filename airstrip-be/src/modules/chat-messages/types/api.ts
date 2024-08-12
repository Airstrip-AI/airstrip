import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Attachment {
  @IsOptional()
  @IsString()
  @ApiProperty()
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  contentType?: string;

  @IsString()
  @ApiProperty()
  url: string;
}

export class SaveChatMessageReq {
  @IsString()
  @ApiProperty()
  role: string;

  @IsString()
  @ApiProperty()
  clientGeneratedId: string;

  @IsString()
  @ApiProperty()
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attachment)
  @ApiProperty()
  attachments: Attachment[] | null;

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  createdAt: Date;
}

export class CreateChatWithFirstMessageReq {
  @IsObject()
  @Type(() => SaveChatMessageReq)
  @ApiProperty({ type: SaveChatMessageReq })
  firstMessage: SaveChatMessageReq;
}

export class SaveChatMessageResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientGeneratedId: string;
}

export class CreateChatWithFirstMessageResp {
  @ApiProperty()
  chatId: string;

  @ApiProperty()
  firstMessage: SaveChatMessageResp;
}
