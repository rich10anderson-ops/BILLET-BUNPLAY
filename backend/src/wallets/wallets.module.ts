import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';

@Module({
  imports: [ExchangeRatesModule],
  providers: [WalletsService],
  controllers: [WalletsController],
  exports: [WalletsService],
})
export class WalletsModule {}
