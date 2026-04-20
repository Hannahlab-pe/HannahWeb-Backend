import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly repo: Repository<Factura>,
  ) {}

  async crear(dto: CreateFacturaDto): Promise<Factura> {
    const factura = this.repo.create({
      ...dto,
      fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : undefined,
      fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
      cliente: { id: dto.clienteId } as Usuario,
    });
    return this.repo.save(factura);
  }

  findTodas(): Promise<Factura[]> {
    return this.repo.find({ relations: ['cliente'], order: { creadoEn: 'DESC' } });
  }

  findPorCliente(clienteId: string): Promise<Factura[]> {
    return this.repo.find({
      where: { cliente: { id: clienteId } },
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: string, usuario: Usuario): Promise<Factura> {
    const factura = await this.repo.findOne({ where: { id }, relations: ['cliente'] });
    if (!factura) throw new NotFoundException('Factura no encontrada');
    if (usuario.rol === RolUsuario.CLIENTE && factura.cliente.id !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a esta factura');
    }
    return factura;
  }

  async actualizar(id: string, dto: Partial<CreateFacturaDto>): Promise<Factura> {
    const factura = await this.repo.findOne({ where: { id } });
    if (!factura) throw new NotFoundException('Factura no encontrada');
    Object.assign(factura, {
      ...(dto.estado && { estado: dto.estado }),
      ...(dto.urlPdf && { urlPdf: dto.urlPdf }),
      ...(dto.concepto && { concepto: dto.concepto }),
    });
    return this.repo.save(factura);
  }
}

