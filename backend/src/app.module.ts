import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    // Config global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // Database
    PrismaModule,
    // Feature modules
    AuthModule,
    UsersModule,
    ExchangeRatesModule,
    WalletsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
