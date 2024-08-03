import { ApiProperty } from '@nestjs/swagger';

export class MessageResp {
  @ApiProperty()
  message: string;
}
