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

      // Truncate large datasets to prevent token limit issues
      const truncatedResponse = this.truncateResponseData(cortexAnalystResponse);
      
      const userContent = `User Question: ${userPrompt}

        Cortex Analyst Response:
        ${JSON.stringify(truncatedResponse, null, 2)}

        Please generate a well-formatted markdown response that answers the user's question based on the Cortex Analyst results.`;

      // Estimate token count and ensure we're within limits
      const estimatedTokens = this.estimateTokenCount(systemPrompt + userContent);
      if (estimatedTokens > 120000) {
        // Further truncate if still too large
        const furtherTruncated = this.aggressiveTruncate(truncatedResponse);
        const newUserContent = `User Question: ${userPrompt}

        Cortex Analyst Response (truncated due to size):
        ${JSON.stringify(furtherTruncated, null, 2)}

        Please generate a well-formatted markdown response based on the available data.`;
        
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: newUserContent }
          ],
          temperature: 0.5,
          max_tokens: 1500,
        });
        
        return completion.choices[0]?.message?.content || 'Unable to generate response.';
      }

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
      
      // Handle token limit errors specifically
      if (error.message && error.message.includes('maximum context length')) {
        throw new Error('Dataset too large for analysis. Please try with a more specific query.');
      }
      
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

      // Truncate large datasets for streaming as well
      const truncatedResponse = this.truncateResponseData(cortexAnalystResponse);
      
      const userContent = `User Question: ${userPrompt}

        Cortex Analyst Response:
        ${JSON.stringify(truncatedResponse, null, 2)}

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

  private estimateTokenCount(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private truncateResponseData(response: any): any {
    const truncated = { ...response };
    
    // Limit results array to prevent token overflow
    if (truncated.results && Array.isArray(truncated.results)) {
      if (truncated.results.length > 100) {
        truncated.results = truncated.results.slice(0, 100);
        truncated._truncated = `Results limited to first 100 rows (originally ${response.results.length} rows)`;
      }
      
      // Truncate individual result objects if they're too large
      truncated.results = truncated.results.map((result, index) => {
        if (index < 50) { // Only keep full data for first 50 rows
          const resultStr = JSON.stringify(result);
          if (resultStr.length > 1000) {
            // Keep only essential fields
            const truncatedResult: any = {};
            let charCount = 0;
            for (const [key, value] of Object.entries(result)) {
              const fieldStr = JSON.stringify({ [key]: value });
              if (charCount + fieldStr.length < 500) {
                truncatedResult[key] = value;
                charCount += fieldStr.length;
              } else {
                truncatedResult[key] = '[truncated]';
              }
            }
            return truncatedResult;
          }
        } else {
          // For rows beyond 50, keep only basic structure
          return Object.keys(result).reduce((acc, key, idx) => {
            if (idx < 5) acc[key] = result[key]; // Keep only first 5 fields
            return acc;
          }, {} as any);
        }
        return result;
      });
    }
    
    // Limit explanation length
    if (truncated.explanation && truncated.explanation.length > 10000) {
      truncated.explanation = truncated.explanation.substring(0, 10000) + '... [truncated]';
    }
    
    // Remove or truncate very large fields
    if (truncated.raw) {
      delete truncated.raw; // Remove raw response to save space
    }
    
    return truncated;
  }

  private aggressiveTruncate(response: any): any {
    return {
      success: response.success,
      query: response.query,
      explanation: response.explanation ? response.explanation.substring(0, 2000) + '... [truncated for analysis]' : null,
      results: response.results ? response.results.slice(0, 20) : [], // Only first 20 rows
      sql: response.sql,
      request_id: response.request_id,
      timestamp: response.timestamp,
      _note: 'Data truncated due to size constraints'
    };
  }
}