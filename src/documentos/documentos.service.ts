import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly repo: Repository<Documento>,
  ) {}

  async crear(dto: CreateDocumentoDto): Promise<Documento> {
    const doc = this.repo.create({
      ...dto,
      cliente: { id: dto.clienteId } as Usuario,
    });
    return this.repo.save(doc);
  }

  findTodos(): Promise<Documento[]> {
    return this.repo.find({ relations: ['cliente'], order: { creadoEn: 'DESC' } });
  }

  findPorCliente(clienteId: string): Promise<Documento[]> {
    return this.repo.find({
      where: { cliente: { id: clienteId } },
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: string, usuario: Usuario): Promise<Documento> {
    const doc = await this.repo.findOne({ where: { id }, relations: ['cliente'] });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (usuario.rol === RolUsuario.CLIENTE && doc.cliente.id !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a este documento');
    }
    return doc;
  }

  async eliminar(id: string): Promise<void> {
    const doc = await this.repo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    await this.repo.remove(doc);
  }
}

