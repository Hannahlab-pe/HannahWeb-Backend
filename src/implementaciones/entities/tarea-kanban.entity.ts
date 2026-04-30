import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Implementacion } from './implementacion.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';

export enum ColumnaKanban {
  POR_HACER = 'por_hacer',
  EN_PROGRESO = 'en_progreso',
  EN_REVISION = 'en_revision',
  COMPLETADO = 'completado',
}

export enum PrioridadTarea {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

@Entity('tareas_kanban')
export class TareaKanban {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'enum', enum: ColumnaKanban, default: ColumnaKanban.POR_HACER })
  columna: ColumnaKanban;

  @Column({ type: 'enum', enum: PrioridadTarea, default: PrioridadTarea.MEDIA })
  prioridad: PrioridadTarea;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date | null;

  @Column({ type: 'date', nullable: true })
  fechaLimite: Date | null;

  @ManyToOne(() => Sprint, (s) => s.tareas, { nullable: true, onDelete: 'SET NULL', eager: false })
  sprint: Sprint | null;

  @ManyToOne(() => Implementacion, (impl) => impl.tareas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  implementacion: Implementacion;

  @ManyToMany(() => Usuario, { eager: false })
  @JoinTable({ name: 'tarea_responsables' })
  responsables: Usuario[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
