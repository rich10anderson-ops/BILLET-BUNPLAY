import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  updateMe(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Desactivar cuenta del usuario autenticado' })
  deactivateMe(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.deactivate(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar usuarios por email (para gastos compartidos)' })
  @ApiQuery({ name: 'email', type: String })
  search(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }
}
