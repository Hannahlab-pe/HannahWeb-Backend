import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { TareaKanban } from './tarea-kanban.entity';

export enum TipoImplementacion {
  AUTOMATIZACION = 'automatizacion',
  PROYECTO_WEB = 'proyecto_web',
  DISENO_3D = 'diseno_3d',
  AUDIOVISUAL = 'audiovisual',
  APP_MOVIL = 'app_movil',
  OTRO = 'otro',
}

export enum EstadoImplementacion {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  EN_REVISION = 'en_revision',
  COMPLETADO = 'completado',
  PAUSADO = 'pausado',
}

@Entity('implementaciones')
export class Implementacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'enum', enum: TipoImplementacion, default: TipoImplementacion.OTRO })
  tipo: TipoImplementacion;

  @Column({ type: 'enum', enum: EstadoImplementacion, default: EstadoImplementacion.PENDIENTE })
  estado: EstadoImplementacion;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.implementaciones, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  proyecto: Proyecto;

  @OneToMany(() => TareaKanban, (tarea) => tarea.implementacion, { cascade: true })
  tareas: TareaKanban[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
