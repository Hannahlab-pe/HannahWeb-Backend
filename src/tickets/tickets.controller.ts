import {
  Body, Controller, Get, Param, ParseUUIDPipe,
  Patch, Post, UseGuards,
} from '@nestjs/common';
import { TicketsService, ResponderTicketDto } from './tickets.service';
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

  // Cliente crea su propio ticket
  @Roles(RolUsuario.CLIENTE, RolUsuario.ADMIN)
  @Post()
  crear(@Body() dto: CreateTicketDto, @UsuarioActual() usuario: Usuario) {
    return this.ticketsService.crear(dto, usuario);
  }

  // Admin ve todos
  @Roles(RolUsuario.ADMIN)
  @Get()
  findTodos() {
    return this.ticketsService.findTodos();
  }

  // Cliente ve solo los suyos
  @Get('mis-tickets')
  findMios(@UsuarioActual() usuario: Usuario) {
    return this.ticketsService.findPorCliente(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.ticketsService.findOne(id, usuario);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id/responder')
  responder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResponderTicketDto) {
    return this.ticketsService.responder(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id/cerrar')
  cerrar(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.cerrar(id);
  }
}
