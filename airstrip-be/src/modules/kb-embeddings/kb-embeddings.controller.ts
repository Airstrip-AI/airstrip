import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { KbEmbeddingsGuard } from './kb-embeddings.guard';
import { KbEmbeddingsService } from './kb-embeddings.service';
import { CreateKbEmbeddingReq } from './types/api';
import { CreateKbEmbeddingResp } from './types/service';

@Controller()
export class KbEmbeddingsController {
  // constructor(private readonly aiIntegrationsService: AiIntegrationsService) {}
  constructor(private readonly kbEmbeddingsService: KbEmbeddingsService) {}

  @Post('knowledge-base/:kbSourceId/embeddings')
  @UseGuards(KbEmbeddingsGuard)
  @ApiResponse({ status: '2XX', type: CreateKbEmbeddingResp })
  async createAiIntegration(
    @Param('kbSourceId', ParseUUIDPipe) kbSourceId: string,
    @Body() body: CreateKbEmbeddingReq,
  ): Promise<CreateKbEmbeddingResp> {
    return this.kbEmbeddingsService.createKbEmbedding(kbSourceId, body);
  }
}
