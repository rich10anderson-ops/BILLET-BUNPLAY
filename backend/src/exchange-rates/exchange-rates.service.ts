import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface RateCache {
  rates: Record<string, number>;
  base: string;
  cachedAt: Date;
}

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private readonly cache = new Map<string, RateCache>();
  private readonly baseUrl: string;
  private readonly ttlMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get<string>('exchangeRates.baseUrl') ?? 'https://api.frankfurter.app';
    const ttlMinutes = configService.get<number>('exchangeRates.ttlMinutes') ?? 60;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  async getRates(base: string = 'USD'): Promise<Record<string, number>> {
    const cacheKey = base.toUpperCase();
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt.getTime() < this.ttlMs) {
      this.logger.debug(`[ExchangeRates] Cache hit for base: ${cacheKey}`);
      return cached.rates;
    }

    try {
      const response = await axios.get<{ rates: Record<string, number>; base: string }>(
        `${this.baseUrl}/latest`,
        { params: { from: cacheKey }, timeout: 5000 },
      );

      const rates = { ...response.data.rates, [cacheKey]: 1 };
      this.cache.set(cacheKey, { rates, base: cacheKey, cachedAt: new Date() });
      this.logger.log(`[ExchangeRates] Refreshed rates for ${cacheKey}`);
      return rates;
    } catch (error) {
      if (cached) {
        this.logger.warn(`[ExchangeRates] API failed, serving stale cache for ${cacheKey}`);
        return cached.rates;
      }
      this.logger.error(`[ExchangeRates] API failed and no cache available: ${String(error)}`);
      throw new ServiceUnavailableException('No se pudieron obtener las tasas de cambio');
    }
  }

  async convert(from: string, to: string, amount: number): Promise<{ result: number; rate: number }> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    if (fromUpper === toUpper) return { result: amount, rate: 1 };

    const rates = await this.getRates(fromUpper);
    const rate = rates[toUpper];

    if (!rate) {
      throw new ServiceUnavailableException(`No se encontró tasa para ${toUpper}`);
    }

    return { result: parseFloat((amount * rate).toFixed(6)), rate };
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const rates = await this.getRates('USD');
    return Object.keys(rates).sort();
  }
}
