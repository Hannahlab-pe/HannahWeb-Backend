import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Implementacion } from '../../implementaciones/entities/implementacion.entity';

export enum EstadoProyecto {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  EN_REVISION = 'en_revision',
  COMPLETADO = 'completado',
  PAUSADO = 'pausado',
  CANCELADO = 'cancelado',
}

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'enum', enum: EstadoProyecto, default: EstadoProyecto.PENDIENTE })
  estado: EstadoProyecto;

  @Column({ type: 'int', default: 0 })
  progreso: number;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaEntrega: Date;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  cliente: Usuario;

  @OneToMany(() => Implementacion, (impl) => impl.proyecto)
  implementaciones: Implementacion[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
