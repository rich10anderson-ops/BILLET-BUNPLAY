import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { BuyDto } from './dto/buy.dto';
import { SwapDto } from './dto/swap.dto';
import { TransactionType, TransactionStatus } from '@prisma/client';

type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeRates: ExchangeRatesService,
  ) {}

  // ─── GET WALLET ─────────────────────────────────────────────────────────────

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { balances: true },
    });
    if (!wallet) throw new NotFoundException('Wallet no encontrada');
    return wallet;
  }

  // ─── BUY ────────────────────────────────────────────────────────────────────

  async buy(userId: string, dto: BuyDto) {
    const wallet = await this.getWallet(userId);
    const { from, to, amountFrom } = dto;

    const sourceBalance = await this.getOrCreateBalance(wallet.id, from);
    if (Number(sourceBalance.amount) < amountFrom) {
      throw new BadRequestException(`Saldo insuficiente en ${from}`);
    }

    const { result: amountTo, rate } = await this.exchangeRates.convert(from, to, amountFrom);

    return this.prisma.$transaction(async (tx: PrismaTx) => {
      await tx.balance.update({
        where: { id: sourceBalance.id },
        data: { amount: { decrement: new Prisma.Decimal(amountFrom) } },
      });

      const destBalance = await this.getOrCreateBalanceTx(tx, wallet.id, to);
      await tx.balance.update({
        where: { id: destBalance.id },
        data: { amount: { increment: new Prisma.Decimal(amountTo) } },
      });

      return tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.BUY,
          currencyFrom: from.toUpperCase(),
          currencyTo: to.toUpperCase(),
          amountFrom: new Prisma.Decimal(amountFrom),
          amountTo: new Prisma.Decimal(amountTo),
          exchangeRate: new Prisma.Decimal(rate),
          status: TransactionStatus.COMPLETED,
          description: dto.description,
        },
      });
    });
  }

  // ─── SWAP ────────────────────────────────────────────────────────────────────

  async swap(userId: string, dto: SwapDto) {
    const wallet = await this.getWallet(userId);
    const { from, to, amount } = dto;

    if (from.toUpperCase() === to.toUpperCase()) {
      throw new BadRequestException('Las monedas deben ser distintas');
    }

    const sourceBalance = await this.getOrCreateBalance(wallet.id, from);
    if (Number(sourceBalance.amount) < amount) {
      throw new BadRequestException(`Saldo insuficiente en ${from}`);
    }

    const { result: amountTo, rate } = await this.exchangeRates.convert(from, to, amount);

    return this.prisma.$transaction(async (tx: PrismaTx) => {
      await tx.balance.update({
        where: { id: sourceBalance.id },
        data: { amount: { decrement: new Prisma.Decimal(amount) } },
      });

      const destBalance = await this.getOrCreateBalanceTx(tx, wallet.id, to);
      await tx.balance.update({
        where: { id: destBalance.id },
        data: { amount: { increment: new Prisma.Decimal(amountTo) } },
      });

      return tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.SWAP,
          currencyFrom: from.toUpperCase(),
          currencyTo: to.toUpperCase(),
          amountFrom: new Prisma.Decimal(amount),
          amountTo: new Prisma.Decimal(amountTo),
          exchangeRate: new Prisma.Decimal(rate),
          status: TransactionStatus.COMPLETED,
          description: dto.description,
        },
      });
    });
  }

  // ─── TRANSACTIONS HISTORY ───────────────────────────────────────────────────

  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.getWallet(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { walletId: wallet.id } }),
    ]);

    return { transactions, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ─── ADD BALANCE (for testing / deposits) ───────────────────────────────────

  async addBalance(userId: string, currency: string, amount: number) {
    const wallet = await this.getWallet(userId);
    const balance = await this.getOrCreateBalance(wallet.id, currency);
    return this.prisma.balance.update({
      where: { id: balance.id },
      data: { amount: { increment: new Prisma.Decimal(amount) } },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private async getOrCreateBalance(walletId: string, currency: string) {
    const upper = currency.toUpperCase();
    const existing = await this.prisma.balance.findUnique({
      where: { walletId_currencyCode: { walletId, currencyCode: upper } },
    });
    if (existing) return existing;
    return this.prisma.balance.create({
      data: { walletId, currencyCode: upper, amount: 0 },
    });
  }

  private async getOrCreateBalanceTx(tx: PrismaTx, walletId: string, currency: string) {
    const upper = currency.toUpperCase();
    const existing = await tx.balance.findUnique({
      where: { walletId_currencyCode: { walletId, currencyCode: upper } },
    });
    if (existing) return existing;
    return tx.balance.create({
      data: { walletId, currencyCode: upper, amount: 0 },
    });
  }
}
