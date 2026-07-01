import { IsString, IsNumber, IsPositive, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuyDto {
  @ApiProperty({ example: 'USD', description: 'Moneda de origen (con la que pagas)' })
  @IsString()
  @Length(3, 3)
  from: string;

  @ApiProperty({ example: 'COP', description: 'Moneda de destino (que recibes)' })
  @IsString()
  @Length(3, 3)
  to: string;

  @ApiProperty({ example: 100, description: 'Monto a convertir desde la moneda origen' })
  @IsNumber()
  @IsPositive()
  amountFrom: number;

  @ApiPropertyOptional({ example: 'Compra de pesos colombianos' })
  @IsOptional()
  @IsString()
  description?: string;
}
