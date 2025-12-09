import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({
    description: 'Natural language query for Snowflake data analysis',
    example: 'Who are our top 5 customers by total spend?',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  message: string;
}
