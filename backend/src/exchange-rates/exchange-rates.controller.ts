import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener tasas de cambio desde una moneda base' })
  @ApiQuery({ name: 'base', required: false, example: 'USD' })
  getRates(@Query('base') base: string = 'USD') {
    return this.exchangeRatesService.getRates(base);
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convertir un monto entre dos monedas' })
  @ApiQuery({ name: 'from', example: 'USD' })
  @ApiQuery({ name: 'to', example: 'COP' })
  @ApiQuery({ name: 'amount', example: 100 })
  convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: number,
  ) {
    return this.exchangeRatesService.convert(from, to, amount);
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Listar monedas soportadas' })
  getCurrencies() {
    return this.exchangeRatesService.getSupportedCurrencies();
  }
}
