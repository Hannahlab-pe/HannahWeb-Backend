import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint } from './entities/sprint.entity';
import { Proyecto } from '../proyectos/entities/proyecto.entity';
import { CreateSprintDto, UpdateSprintDto } from './dto/sprint.dto';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepo: Repository<Sprint>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
  ) {}

  async crear(dto: CreateSprintDto): Promise<Sprint> {
    const proyecto = await this.proyectoRepo.findOne({ where: { id: dto.proyectoId } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    const sprint = this.sprintRepo.create({
      nombre:      dto.nombre,
      objetivo:    dto.objetivo ?? null,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      fechaFin:    dto.fechaFin   ? new Date(dto.fechaFin)    : null,
      estado:      dto.estado,
      proyecto,
    });
    return this.sprintRepo.save(sprint);
  }

  findByProyecto(proyectoId: string): Promise<Sprint[]> {
    return this.sprintRepo.find({
      where: { proyecto: { id: proyectoId } },
      order: { creadoEn: 'ASC' },
    });
  }

  async actualizar(id: string, dto: UpdateSprintDto): Promise<Sprint> {
    const sprint = await this.sprintRepo.findOne({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint no encontrado');

    if (dto.nombre      !== undefined) sprint.nombre      = dto.nombre;
    if (dto.objetivo    !== undefined) sprint.objetivo    = dto.objetivo ?? null;
    if (dto.estado      !== undefined) sprint.estado      = dto.estado;
    if (dto.fechaInicio !== undefined) {
      (sprint as any).fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : null;
    }
    if (dto.fechaFin !== undefined) {
      (sprint as any).fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : null;
    }
    return this.sprintRepo.save(sprint);
  }

  async eliminar(id: string): Promise<void> {
    const sprint = await this.sprintRepo.findOne({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint no encontrado');
    await this.sprintRepo.remove(sprint);
  }
}
