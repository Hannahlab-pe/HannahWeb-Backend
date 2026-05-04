import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  crear(@Body() dto: CreateDocumentoDto) {
    return this.documentosService.crear(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Get()
  findTodos() {
    return this.documentosService.findTodos();
  }

  @Get('mis-documentos')
  findMios(@UsuarioActual() usuario: Usuario) {
    const clienteId = (usuario as any).clientePrincipal?.id ?? usuario.id;
    return this.documentosService.findPorCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.documentosService.findOne(id, usuario);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentosService.eliminar(id);
  }
}
