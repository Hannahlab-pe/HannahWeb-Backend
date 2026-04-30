import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Implementacion } from './entities/implementacion.entity';
import { TareaKanban, ColumnaKanban } from './entities/tarea-kanban.entity';
import { CreateImplementacionDto } from './dto/create-implementacion.dto';
import { CreateTareaKanbanDto, MoverTareaDto, UpdateTareaKanbanDto } from './dto/create-tarea-kanban.dto';
import { Proyecto } from '../proyectos/entities/proyecto.entity';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { Sprint } from '../sprints/entities/sprint.entity';

@Injectable()
export class ImplementacionesService {
  constructor(
    @InjectRepository(Implementacion)
    private readonly implRepo: Repository<Implementacion>,
    @InjectRepository(TareaKanban)
    private readonly tareaRepo: Repository<TareaKanban>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sprint)
    private readonly sprintRepo: Repository<Sprint>,
  ) {}

  // ── Progreso automático ──────────────────────────────────────────

  private async recalcularProgreso(implementacionId: string): Promise<void> {
    const impl = await this.implRepo.findOne({
      where: { id: implementacionId },
      relations: ['proyecto'],
    });
    if (!impl?.proyecto) return;

    const proyectoId = impl.proyecto.id;

    // Obtener todas las implementaciones del proyecto
    const impls = await this.implRepo.find({
      where: { proyecto: { id: proyectoId } },
      select: ['id'],
    });
    const implIds = impls.map((i) => i.id);
    if (!implIds.length) return;

    const total = await this.tareaRepo.count({
      where: { implementacion: { id: In(implIds) } },
    });

    const completadas = await this.tareaRepo.count({
      where: { implementacion: { id: In(implIds) }, columna: ColumnaKanban.COMPLETADO },
    });

    const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

    await this.proyectoRepo.update(proyectoId, { progreso });
  }

  // ── Implementaciones ─────────────────────────────────────────────

  async crearImplementacion(dto: CreateImplementacionDto): Promise<Implementacion> {
    const proyecto = await this.proyectoRepo.findOne({ where: { id: dto.proyectoId } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    const impl = this.implRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      estado: dto.estado,
      proyecto,
    });
    return this.implRepo.save(impl);
  }

  async findImplementacionesByProyecto(proyectoId: string, usuario: Usuario): Promise<Implementacion[]> {
    const proyecto = await this.proyectoRepo.findOne({
      where: { id: proyectoId },
      relations: ['cliente'],
    });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    if (usuario.rol === RolUsuario.CLIENTE && proyecto.cliente.id !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return this.implRepo.find({
      where: { proyecto: { id: proyectoId } },
      relations: ['tareas', 'tareas.responsables', 'tareas.sprint'],
      order: { creadoEn: 'ASC' },
    });
  }

  async findImplementacion(id: string, usuario: Usuario): Promise<Implementacion> {
    const impl = await this.implRepo.findOne({
      where: { id },
      relations: ['proyecto', 'proyecto.cliente', 'tareas'],
    });
    if (!impl) throw new NotFoundException('Implementación no encontrada');

    if (usuario.rol === RolUsuario.CLIENTE && impl.proyecto.cliente.id !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a esta implementación');
    }

    return impl;
  }

  async actualizarImplementacion(id: string, dto: Partial<CreateImplementacionDto>): Promise<Implementacion> {
    const impl = await this.implRepo.findOne({ where: { id } });
    if (!impl) throw new NotFoundException('Implementación no encontrada');
    Object.assign(impl, {
      ...(dto.nombre && { nombre: dto.nombre }),
      ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      ...(dto.tipo && { tipo: dto.tipo }),
      ...(dto.estado && { estado: dto.estado }),
    });
    return this.implRepo.save(impl);
  }

  async eliminarImplementacion(id: string): Promise<void> {
    const impl = await this.implRepo.findOne({ where: { id } });
    if (!impl) throw new NotFoundException('Implementación no encontrada');
    await this.implRepo.remove(impl);
  }

  // ── Tareas Kanban ─────────────────────────────────────────────────

  async crearTarea(dto: CreateTareaKanbanDto): Promise<TareaKanban> {
    const impl = await this.implRepo.findOne({ where: { id: dto.implementacionId } });
    if (!impl) throw new NotFoundException('Implementación no encontrada');

    const responsables = dto.responsablesIds?.length
      ? await this.usuarioRepo.findBy({ id: In(dto.responsablesIds) })
      : [];

    const tarea = this.tareaRepo.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      columna: dto.columna,
      prioridad: dto.prioridad,
      orden: dto.orden ?? 0,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
      implementacion: impl,
      responsables,
    });
    const saved = await this.tareaRepo.save(tarea);
    await this.recalcularProgreso(dto.implementacionId);
    return this.tareaRepo.findOne({ where: { id: saved.id }, relations: ['responsables'] }) as Promise<TareaKanban>;
  }

  async actualizarTarea(id: string, dto: UpdateTareaKanbanDto): Promise<TareaKanban> {
    const tarea = await this.tareaRepo.findOne({
      where: { id },
      relations: ['responsables', 'implementacion', 'sprint'],
    });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');

    if (dto.titulo !== undefined) tarea.titulo = dto.titulo;
    if (dto.descripcion !== undefined) tarea.descripcion = dto.descripcion;
    if (dto.prioridad !== undefined) tarea.prioridad = dto.prioridad;
    if (dto.fechaInicio !== undefined) {
      (tarea as any).fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : null;
    }
    if (dto.fechaLimite !== undefined) {
      (tarea as any).fechaLimite = dto.fechaLimite ? new Date(dto.fechaLimite) : null;
    }
    if (dto.responsablesIds !== undefined) {
      tarea.responsables = dto.responsablesIds.length
        ? await this.usuarioRepo.findBy({ id: In(dto.responsablesIds) })
        : [];
    }
    if ('sprintId' in dto) {
      tarea.sprint = dto.sprintId
        ? (await this.sprintRepo.findOne({ where: { id: dto.sprintId } })) ?? null
        : null;
    }

    const saved = await this.tareaRepo.save(tarea);
    return this.tareaRepo.findOne({ where: { id: saved.id }, relations: ['responsables', 'sprint'] }) as Promise<TareaKanban>;
  }

  async moverTarea(id: string, dto: MoverTareaDto): Promise<TareaKanban> {
    const tarea = await this.tareaRepo.findOne({
      where: { id },
      relations: ['implementacion'],
    });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    tarea.columna = dto.columna;
    if (dto.orden !== undefined) tarea.orden = dto.orden;
    const saved = await this.tareaRepo.save(tarea);
    await this.recalcularProgreso(tarea.implementacion.id);
    return saved;
  }

  async eliminarTarea(id: string): Promise<void> {
    const tarea = await this.tareaRepo.findOne({
      where: { id },
      relations: ['implementacion'],
    });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    const implId = tarea.implementacion.id;
    await this.tareaRepo.remove(tarea);
    await this.recalcularProgreso(implId);
  }
}
