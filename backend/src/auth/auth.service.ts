import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        wallet: { create: {} },
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Initialize default balances (COP, USD, EUR)
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: user.id },
    });
    if (wallet) {
      await this.prisma.balance.createMany({
        data: [
          { walletId: wallet.id, currencyCode: 'COP', amount: 0 },
          { walletId: wallet.id, currencyCode: 'USD', amount: 0 },
          { walletId: wallet.id, currencyCode: 'EUR', amount: 0 },
        ],
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { id, name, email } = user;
    const tokens = await this.generateTokens(id, email);
    return { user: { id, name, email }, ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.generateTokens(stored.user.id, stored.user.email);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const secret = this.configService.get<string>('jwt.secret') ?? 'fallback_secret';
    const expiresIn = this.configService.get<string>('jwt.expiresIn') ?? '15m';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = this.jwtService.sign(payload, { secret, expiresIn: expiresIn as any });

    const rawRefresh = uuidv4();
    const refreshExpiresInStr = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const days = parseInt(refreshExpiresInStr.replace('d', ''), 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: { token: rawRefresh, userId, expiresAt },
    });

    return { accessToken, refreshToken: rawRefresh };
  }
}
