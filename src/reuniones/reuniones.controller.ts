import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ReunionesService } from './reuniones.service';
import { CreateReunionDto } from './dto/create-reunion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reuniones')
export class ReunionesController {
  constructor(private readonly reunionesService: ReunionesService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Post()
  crear(@Body() dto: CreateReunionDto) {
    return this.reunionesService.crear(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Get()
  findTodas() {
    return this.reunionesService.findTodas();
  }

  @Get('mis-reuniones')
  findMias(@UsuarioActual() usuario: Usuario) {
    const clienteId = (usuario as any).clientePrincipal?.id ?? usuario.id;
    return this.reunionesService.findPorCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.reunionesService.findOne(id, usuario);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.SUBADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.reunionesService.eliminar(id);
  }
}
