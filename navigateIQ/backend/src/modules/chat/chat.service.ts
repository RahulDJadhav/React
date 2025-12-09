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
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
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
        const errorMessage = error.message || 'Failed to process query';
        
        // Check if it's a connection-related error
        const isConnectionError = this.isConnectionError(errorMessage);
        
        if (isConnectionError && retryCount < maxRetries) {
          console.log(`Connection error in message processing, retrying (${retryCount + 1}/${maxRetries})...`);
          retryCount++;
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        // If not a connection error or max retries reached, throw the error
        throw new InternalServerErrorException(errorMessage);
      }
    }
  }

  async *processMessageStream(message: string): AsyncGenerator<any, void, unknown> {
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
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
        
        return; // Success, exit retry loop
        
      } catch (error) {
        const errorMessage = error.message || 'Failed to process streaming query';
        
        // Check if it's a connection-related error
        const isConnectionError = this.isConnectionError(errorMessage);
        
        if (isConnectionError && retryCount < maxRetries) {
          console.log(`Connection error in stream processing, retrying (${retryCount + 1}/${maxRetries})...`);
          retryCount++;
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        // If not a connection error or max retries reached, throw the error
        throw new InternalServerErrorException(errorMessage);
      }
    }
  }
  
  private isConnectionError(errorMessage: string): boolean {
    if (!errorMessage) return false;
    
    const connectionErrorPatterns = [
      'terminated connection',
      'connection lost',
      'connection closed',
      'network error',
      'Unable to perform operation using terminated connection'
    ];
    
    const lowerErrorMessage = errorMessage.toLowerCase();
    return connectionErrorPatterns.some(pattern => 
      lowerErrorMessage.includes(pattern.toLowerCase())
    );
  }
}
