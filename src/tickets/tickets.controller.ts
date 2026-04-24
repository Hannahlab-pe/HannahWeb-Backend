import {
  Body, Controller, Get, Param, ParseUUIDPipe,
  Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  TicketsService, ResponderTicketDto, CambiarEstadoDto,
  AsignarTicketDto, EnviarMensajeDto,
} from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ── CRUD básico ──────────────────────────────────────────────────

  @Roles(RolUsuario.CLIENTE, RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Post()
  crear(@Body() dto: CreateTicketDto, @UsuarioActual() usuario: Usuario) {
    // El miembro crea el ticket como su cliente principal
    const clienteEfectivo = (usuario as any).clientePrincipal ?? usuario;
    return this.ticketsService.crear(dto, clienteEfectivo);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Get()
  findTodos() {
    return this.ticketsService.findTodos();
  }

  @Get('mis-tickets')
  findMios(@UsuarioActual() usuario: Usuario) {
    const clienteId = (usuario as any).clientePrincipal?.id ?? usuario.id;
    return this.ticketsService.findPorCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.ticketsService.findOne(id, usuario);
  }

  // ── Mensajes (chat) ───────────────────────────────────────────────

  @Get(':id/mensajes')
  getMensajes(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.ticketsService.getMensajes(id, usuario);
  }

  @Post(':id/mensajes')
  enviarMensaje(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnviarMensajeDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.ticketsService.enviarMensaje(id, dto, usuario);
  }

  // ── Acciones admin/subadmin ──────────────────────────────────────

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Patch(':id/estado')
  cambiarEstado(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CambiarEstadoDto) {
    return this.ticketsService.cambiarEstado(id, dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Patch(':id/asignar')
  asignar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AsignarTicketDto) {
    return this.ticketsService.asignar(id, dto);
  }

  // ── Legacy ───────────────────────────────────────────────────────

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Patch(':id/responder')
  responder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResponderTicketDto) {
    return this.ticketsService.responder(id, dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Patch(':id/cerrar')
  cerrar(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.cerrar(id);
  }
}
