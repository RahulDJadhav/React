import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SnowflakeAnalystService } from '../snowflake-analyst/snowflake-analyst.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly snowflake: SnowflakeAnalystService,
    private readonly openai: OpenAIService
  ) {}

  async processMessage(message: string) {
    try {
      const result = await this.snowflake.ask(message);

      const cortexResponse = {
        success: true,
        query: message,
        explanation: result.explanation || null,
        results: result.results || [],
        sql: result.sql || null,
        request_id: result.request_id,
        timestamp: new Date().toISOString()
      };

      const enhancedResponse = await this.openai.enhanceResponse(cortexResponse, message);
      return enhancedResponse;
    } catch (error) {
      const message_error = error.message || 'Failed to process query';
      throw new InternalServerErrorException(message_error);
    }
  }

  async *processMessageStream(message: string): AsyncGenerator<any, void, unknown> {
    try {
      const result = await this.snowflake.ask(message);

      const cortexResponse = {
        success: true,
        query: message,
        explanation: result.explanation || null,
        results: result.results || [],
        sql: result.sql || null,
        request_id: result.request_id,
        timestamp: new Date().toISOString()
      };

      const streamGenerator = this.openai.enhanceResponseStream(cortexResponse, message);
      
      for await (const chunk of streamGenerator) {
        yield chunk;
      }
    } catch (error) {
      const message_error = error.message || 'Failed to process streaming query';
      throw new InternalServerErrorException(message_error);
    }
  }
}
