import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repo: Repository<Proyecto>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CreateProyectoDto): Promise<Proyecto> {
    const encargados =
      dto.encargadosIds && dto.encargadosIds.length > 0
        ? await this.usuariosRepo.findBy({ id: In(dto.encargadosIds) })
        : [];

    const proyecto = this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      estado: dto.estado,
      progreso: dto.progreso ?? 0,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
      cliente: { id: dto.clienteId } as Usuario,
      encargados,
    });
    return this.repo.save(proyecto);
  }

  findTodos(): Promise<Proyecto[]> {
    return this.repo.find({
      relations: ['cliente', 'encargados'],
      order: { creadoEn: 'DESC' },
    });
  }

  findPorCliente(clienteId: string): Promise<Proyecto[]> {
    return this.repo.find({
      where: { cliente: { id: clienteId } },
      relations: ['implementaciones', 'encargados'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: string, usuario: Usuario): Promise<Proyecto> {
    const proyecto = await this.repo.findOne({
      where: { id },
      relations: [
        'cliente',
        'encargados',
        'implementaciones',
        'implementaciones.tareas',
        'reuniones',
        'documentos',
        'facturas',
      ],
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    if (usuario.rol === RolUsuario.CLIENTE && proyecto.cliente.id !== usuario.id) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return proyecto;
  }

  async actualizar(id: string, dto: Partial<CreateProyectoDto>): Promise<Proyecto> {
    const proyecto = await this.repo.findOne({ where: { id }, relations: ['encargados'] });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    Object.assign(proyecto, {
      ...(dto.nombre && { nombre: dto.nombre }),
      ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      ...(dto.estado && { estado: dto.estado }),
      ...(dto.progreso !== undefined && { progreso: dto.progreso }),
      ...(dto.fechaInicio && { fechaInicio: new Date(dto.fechaInicio) }),
      ...(dto.fechaEntrega && { fechaEntrega: new Date(dto.fechaEntrega) }),
    });

    if (dto.encargadosIds !== undefined) {
      proyecto.encargados =
        dto.encargadosIds.length > 0
          ? await this.usuariosRepo.findBy({ id: In(dto.encargadosIds) })
          : [];
    }

    return this.repo.save(proyecto);
  }

  async eliminar(id: string): Promise<void> {
    const proyecto = await this.repo.findOne({ where: { id } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');
    await this.repo.remove(proyecto);
  }
}

