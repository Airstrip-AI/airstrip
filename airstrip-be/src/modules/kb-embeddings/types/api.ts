import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateKbEmbeddingReq {
  @IsString()
  @ApiProperty()
  bucket: string;

  @IsString()
  @ApiProperty()
  embeddingApiKey: string;
}

export class CreateKbEmbeddingResp {
  @ApiProperty()
  ok: boolean;
}
