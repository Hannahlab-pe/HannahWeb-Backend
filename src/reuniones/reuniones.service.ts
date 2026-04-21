import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reunion } from './entities/reunion.entity';
import { CreateReunionDto } from './dto/create-reunion.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { Proyecto } from '../proyectos/entities/proyecto.entity';

@Injectable()
export class ReunionesService {
  constructor(
    @InjectRepository(Reunion)
    private readonly repo: Repository<Reunion>,
  ) {}

  async crear(dto: CreateReunionDto): Promise<Reunion> {
    const reunion = this.repo.create({
      ...dto,
      fecha: new Date(dto.fecha),
      cliente: { id: dto.clienteId } as Usuario,
      ...(dto.proyectoId && { proyecto: { id: dto.proyectoId } as Proyecto }),
    });
    return this.repo.save(reunion);
  }

  findTodas(): Promise<Reunion[]> {
    return this.repo.find({ relations: ['cliente', 'proyecto'], order: { fecha: 'ASC' } });
  }

  findPorCliente(clienteId: string): Promise<Reunion[]> {
    return this.repo.find({
      where: { cliente: { id: clienteId } },
      relations: ['proyecto'],
      order: { fecha: 'ASC' },
    });
  }

  async findOne(id: string, usuario: Usuario): Promise<Reunion> {
    const reunion = await this.repo.findOne({ where: { id }, relations: ['cliente', 'proyecto'] });
    if (!reunion) throw new NotFoundException('Reunión no encontrada');
    if (usuario.rol === RolUsuario.CLIENTE && reunion.cliente.id !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a esta reunión');
    }
    return reunion;
  }

  async eliminar(id: string): Promise<void> {
    const reunion = await this.repo.findOne({ where: { id } });
    if (!reunion) throw new NotFoundException('Reunión no encontrada');
    await this.repo.remove(reunion);
  }
}

