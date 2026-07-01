import { IsString, IsNumber, IsPositive, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SwapDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(3, 3)
  from: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  @Length(3, 3)
  to: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
