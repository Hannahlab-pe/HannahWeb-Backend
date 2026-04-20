import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Implementacion } from './implementacion.entity';

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
  fechaLimite: Date;

  @ManyToOne(() => Implementacion, (impl) => impl.tareas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  implementacion: Implementacion;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
