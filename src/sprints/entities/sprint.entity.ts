import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { TareaKanban } from '../../implementaciones/entities/tarea-kanban.entity';

export enum EstadoSprint {
  PLANIFICACION = 'planificacion',
  ACTIVO        = 'activo',
  COMPLETADO    = 'completado',
}

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  objetivo: string | null;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date | null;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date | null;

  @Column({ type: 'enum', enum: EstadoSprint, default: EstadoSprint.PLANIFICACION })
  estado: EstadoSprint;

  @ManyToOne(() => Proyecto, { nullable: false, onDelete: 'CASCADE' })
  proyecto: Proyecto;

  @OneToMany(() => TareaKanban, (t) => t.sprint)
  tareas: TareaKanban[];

  @CreateDateColumn()
  creadoEn: Date;
}
