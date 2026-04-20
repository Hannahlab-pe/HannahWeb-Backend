import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repo: Repository<Proyecto>,
  ) {}

  async crear(dto: CreateProyectoDto): Promise<Proyecto> {
    const proyecto = this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      estado: dto.estado,
      progreso: dto.progreso ?? 0,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
      cliente: { id: dto.clienteId } as Usuario,
    });
    return this.repo.save(proyecto);
  }

  findTodos(): Promise<Proyecto[]> {
    return this.repo.find({
      relations: ['cliente'],
      order: { creadoEn: 'DESC' },
    });
  }

  findPorCliente(clienteId: string): Promise<Proyecto[]> {
    return this.repo.find({
      where: { cliente: { id: clienteId } },
      relations: ['implementaciones'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: string, usuario: Usuario): Promise<Proyecto> {
    const proyecto = await this.repo.findOne({
      where: { id },
      relations: ['cliente', 'implementaciones', 'implementaciones.tareas'],
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    if (usuario.rol === RolUsuario.CLIENTE && proyecto.cliente.id !== usuario.id) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return proyecto;
  }

  async actualizar(id: string, dto: Partial<CreateProyectoDto>): Promise<Proyecto> {
    const proyecto = await this.repo.findOne({ where: { id } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');
    Object.assign(proyecto, {
      ...(dto.nombre && { nombre: dto.nombre }),
      ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      ...(dto.estado && { estado: dto.estado }),
      ...(dto.progreso !== undefined && { progreso: dto.progreso }),
      ...(dto.fechaEntrega && { fechaEntrega: new Date(dto.fechaEntrega) }),
    });
    return this.repo.save(proyecto);
  }

  async eliminar(id: string): Promise<void> {
    const proyecto = await this.repo.findOne({ where: { id } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');
    await this.repo.remove(proyecto);
  }
}

