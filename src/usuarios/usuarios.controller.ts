import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from './entities/usuario.entity';
import { MailService } from '../mail/mail.service';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

class BienvenidaDto {
  @IsString()
  @MinLength(1)
  password: string;
}

class CreateMiembroDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  crear(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: { activo?: boolean }) {
    if (body.activo !== undefined) {
      return this.usuariosService.updateActivo(id, body.activo);
    }
  }

  @Delete(':id')
  desactivar(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.desactivar(id);
  }

  @Post(':id/bienvenida')
  async enviarBienvenida(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BienvenidaDto,
  ) {
    const usuario = await this.usuariosService.findOne(id);
    await this.mailService.enviarBienvenida({
      nombre: usuario.nombre,
      email: usuario.email,
      password: dto.password,
      empresa: usuario.empresa,
    });
    return { ok: true };
  }

  // ── Miembros del cliente ────────────────────────────────────────

  @Get(':id/miembros')
  getMiembros(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.findMiembrosByCliente(id);
  }

  @Post(':id/miembros')
  crearMiembro(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMiembroDto,
  ) {
    return this.usuariosService.crearMiembro(id, dto);
  }

  @Delete(':clienteId/miembros/:miembroId')
  eliminarMiembro(
    @Param('miembroId', ParseUUIDPipe) miembroId: string,
  ) {
    return this.usuariosService.eliminarMiembro(miembroId);
  }
}
