import {
  Body, Controller, Delete, Get, Param,
  ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ImplementacionesService } from './implementaciones.service';
import { CreateImplementacionDto } from './dto/create-implementacion.dto';
import { CreateTareaKanbanDto, MoverTareaDto } from './dto/create-tarea-kanban.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('implementaciones')
export class ImplementacionesController {
  constructor(private readonly service: ImplementacionesService) {}

  // ── Implementaciones ─────────────────────────────────────────────

  @Roles(RolUsuario.ADMIN)
  @Post()
  crearImplementacion(@Body() dto: CreateImplementacionDto) {
    return this.service.crearImplementacion(dto);
  }

  @Get('proyecto/:proyectoId')
  findByProyecto(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.service.findImplementacionesByProyecto(proyectoId, usuario);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.findImplementacion(id, usuario);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateImplementacionDto>) {
    return this.service.actualizarImplementacion(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.eliminarImplementacion(id);
  }

  // ── Tareas Kanban ─────────────────────────────────────────────────

  @Roles(RolUsuario.ADMIN)
  @Post('tareas')
  crearTarea(@Body() dto: CreateTareaKanbanDto) {
    return this.service.crearTarea(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch('tareas/:id/mover')
  moverTarea(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MoverTareaDto) {
    return this.service.moverTarea(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete('tareas/:id')
  eliminarTarea(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.eliminarTarea(id);
  }
}
