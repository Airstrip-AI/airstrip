import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { MessageTokenUsageDataService } from './message-token-usage-data.service';
import { ApiResponse } from '@nestjs/swagger';
import { MessageResp } from '../../utils/common';
import { SaveMessageTokenUsageDataReq } from './types/api';
import { AuthedRequest } from '../auth/types/service';

@Controller('message-token-usage-data')
export class MessageTokenUsageDataController {
  constructor(
    private readonly messageTokenUsageDataService: MessageTokenUsageDataService,
  ) {}

  @Post('save-by-client-generated-id/:clientGeneratedId')
  @ApiResponse({ status: '2XX', type: MessageResp })
  async saveUsageDataByClientGeneratedId(
    @Request() req: AuthedRequest,
    @Param('clientGeneratedId') clientGeneratedId: string,
    @Body() reqBody: SaveMessageTokenUsageDataReq,
  ): Promise<MessageResp> {
    if (!clientGeneratedId) {
      throw new BadRequestException('clientGeneratedId is required');
    }

    await this.messageTokenUsageDataService.saveUsageDataByClientGeneratedId(
      req.user,
      clientGeneratedId,
      reqBody.usage,
    );

    return {
      message: 'Usage data saved successfully',
    };
  }
}
