import {
  Body, Controller, Delete, Get, Param,
  ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  crear(@Body() dto: CreateProyectoDto) {
    return this.proyectosService.crear(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Get()
  findTodos() {
    return this.proyectosService.findTodos();
  }

  @Get('mis-proyectos')
  findMios(@UsuarioActual() usuario: Usuario) {
    const clienteId = usuario.clientePrincipal?.id ?? usuario.id;
    return this.proyectosService.findPorCliente(clienteId);
  }

  @Roles(RolUsuario.SUBADMIN)
  @Get('mis-encargados')
  findMiosComoEncargado(@UsuarioActual() usuario: Usuario) {
    return this.proyectosService.findComoEncargado(usuario.id);
  }

  @Roles(RolUsuario.ADMIN)
  @Get('por-cliente/:clienteId')
  findPorCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.proyectosService.findPorCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.proyectosService.findOne(id, usuario);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Patch(':id')
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateProyectoDto>) {
    return this.proyectosService.actualizar(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.eliminar(id);
  }
}
