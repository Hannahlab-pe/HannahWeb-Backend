import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  crear(@Body() dto: CreateFacturaDto) {
    return this.facturasService.crear(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Get()
  findTodas() {
    return this.facturasService.findTodas();
  }

  @Get('mis-facturas')
  findMias(@UsuarioActual() usuario: Usuario) {
    return this.facturasService.findPorCliente(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: Usuario) {
    return this.facturasService.findOne(id, usuario);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateFacturaDto>) {
    return this.facturasService.actualizar(id, dto);
  }
}
