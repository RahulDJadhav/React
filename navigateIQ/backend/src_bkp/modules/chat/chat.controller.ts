import { Controller, Post, Body, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { ApiTags, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  @ApiResponse({ 
    status: 200, 
    description: 'Successful query response with SQL and data' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid input data' 
  })
  async ask(@Body() body: ChatDto) {
    return this.chatService.processMessage(body.message);
  }

  @Post('ask/stream')
  // @ApiExcludeEndpoint()
  async askStream(@Body() body: ChatDto, @Res() response: Response) {
    // Set SSE headers for streaming
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders();
    
    try {
      // Process with streaming
      const streamGenerator = this.chatService.processMessageStream(body.message);
      
      // Send each chunk as Server-Sent Event
      for await (const chunk of streamGenerator) {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        response.write(data);
      }
      
      // Send completion signal
      response.write('data: [DONE]\n\n');
      response.end();
    } catch (error) {
      console.error('Streaming error:', error);
      
      // Send error as SSE
      const errorData = {
        type: 'error',
        error: error.message || 'An error occurred during streaming'
      };
      response.write(`data: ${JSON.stringify(errorData)}\n\n`);
      response.write('data: [DONE]\n\n');
      response.end();
    }
  }
}
