import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe,
  Patch, Post, UseGuards,
} from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { CreateSprintDto, UpdateSprintDto } from './dto/sprint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sprints')
export class SprintsController {
  constructor(private readonly service: SprintsService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Post()
  crear(@Body() dto: CreateSprintDto) {
    return this.service.crear(dto);
  }

  @Get('proyecto/:proyectoId')
  findByProyecto(@Param('proyectoId', ParseUUIDPipe) proyectoId: string) {
    return this.service.findByProyecto(proyectoId);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.eliminar(id);
  }
}
