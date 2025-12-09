import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.warn('OpenAI API key not configured. OpenAI features will be disabled.');
      this.openai = null;
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateMarkdownResponse(userPrompt: string, cortexAnalystResponse: any): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    try {
      const systemPrompt = `You are a helpful data analyst assistant. You will receive a user's question and the response from Cortex Analyst (a Snowflake AI tool). 
        Your task is to:
        1. Analyze the Cortex Analyst response
        2. Create a clear, well-formatted markdown response that answers the user's question
        3. Present the data in an easy-to-understand format
        4. Add insights or explanations where helpful
        5. Use tables, lists, or other markdown formatting to make the response visually appealing
        6. Address the user's specific question directly. Include tables or list only if relevant to the query.

        Guidelines:
        - Be concise and informative and crisp so that it is understood by cxo level and present actionalble information
        - give data into below format
            insights < this is the final answer, rationalise based on data> 
            interpretation <this says on what bases you derived this answer>
            Data Insights <this is actual data you can skip table format if not requird and keep plain text, don't include accountId,etc in the response> 
            Conclusion <include only if requird and data is complex>
            Recommendations <It is optional and to be included only if it can provide actionable pointers to cxo>
        
        Additionals rules to follow:
        - If there are numbers or metrics, explain what they mean in context
        - Use proper markdown formatting (headers, bold, tables, lists, etc.)
        - If the query returned no results or an error, explain this clearly to the user`;

      const userContent = `User Question: ${userPrompt}

        Cortex Analyst Response:
        ${JSON.stringify(cortexAnalystResponse, null, 2)}

        Please generate a well-formatted markdown response that answers the user's question based on the Cortex Analyst results.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to generate markdown response: ${error.message}`);
    }
  }

  async enhanceResponse(cortexResponse: any, userPrompt: string): Promise<any> {
    try {
      const markdownResponse = await this.generateMarkdownResponse(userPrompt, cortexResponse);
      
      return {
        "success": true,
        "markdown": markdownResponse,
        "technical_insights": cortexResponse.sql || null,
      };
    } catch (error) {
      console.error('Error enhancing response with OpenAI:', error);
      return {
        "success": false,
        "markdown": null,
        "technical_insights": cortexResponse.sql || null,
        "error": error.message
      };
    }
  }

  async *generateMarkdownResponseStream(userPrompt: string, cortexAnalystResponse: any): AsyncGenerator<string, void, unknown> {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    try {
      const systemPrompt = `You are a helpful data analyst assistant. You will receive a user's question and the response from Cortex Analyst (a Snowflake AI tool). 
        Your task is to:
        1. Analyze the Cortex Analyst response
        2. Create a clear, well-formatted markdown response that answers the user's question
        3. Present the data in an easy-to-understand format
        4. Add insights or explanations where helpful
        5. Use tables, lists, or other markdown formatting to make the response visually appealing
        6. Address the user's specific question directly. Include tables or list only if relevant to the query.

        Guidelines:
        - Be concise and informative and crisp so that it is understood by cxo level and present actionalble information
        - give data into below format
            insights < this is the final answer, rationalise based on data> 
            interpretation <this says on what bases you derived this answer>
            Data Insights <this is actual data you can skip table format if not requird and keep plain text, don't include accountId,etc in the response> 
            Conclusion <include only if requird and data is complex>
            Recommendations <It is optional and to be included only if it can provide actionable pointers to cxo>
        
        Additionals rules to follow:
        - If there are numbers or metrics, explain what they mean in context
        - Use proper markdown formatting (headers, bold, tables, lists, etc.)
        - If the query returned no results or an error, explain this clearly to the user`;

      const userContent = `User Question: ${userPrompt}

        Cortex Analyst Response:
        ${JSON.stringify(cortexAnalystResponse, null, 2)}

        Please generate a well-formatted markdown response that answers the user's question based on the Cortex Analyst results.`;

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('OpenAI Streaming API Error:', error);
      throw new Error(`Failed to generate streaming markdown response: ${error.message}`);
    }
  }

  async *enhanceResponseStream(cortexResponse: any, userPrompt: string): AsyncGenerator<any, void, unknown> {
    try {
      // First yield the initial response with cortex data
      yield {
        type: 'start',
        success: true,
        cortexData: cortexResponse
      };

      // Then stream the markdown content
      const streamGenerator = this.generateMarkdownResponseStream(userPrompt, cortexResponse);
      
      for await (const chunk of streamGenerator) {
        yield {
          type: 'chunk',
          content: chunk
        };
      }

      // Signal completion
      yield {
        type: 'complete'
      };
    } catch (error) {
      console.error('Error enhancing response with OpenAI streaming:', error);
      yield {
        type: 'error',
        error: error.message
      };
    }
  }
}