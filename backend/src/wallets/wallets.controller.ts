import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { BuyDto } from './dto/buy.dto';
import { SwapDto } from './dto/swap.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener wallet y balances del usuario' })
  getWallet(@CurrentUser() user: CurrentUserPayload) {
    return this.walletsService.getWallet(user.id);
  }

  @Post('buy')
  @ApiOperation({ summary: 'Comprar/convertir divisas' })
  buy(@CurrentUser() user: CurrentUserPayload, @Body() dto: BuyDto) {
    return this.walletsService.buy(user.id, dto);
  }

  @Post('swap')
  @ApiOperation({ summary: 'Intercambiar entre monedas de la wallet' })
  swap(@CurrentUser() user: CurrentUserPayload, @Body() dto: SwapDto) {
    return this.walletsService.swap(user.id, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Historial de transacciones paginado' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTransactions(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.walletsService.getTransactions(user.id, page, limit);
  }
}
