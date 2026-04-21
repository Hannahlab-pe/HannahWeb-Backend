import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';

export enum TipoReunion {
  KICKOFF = 'kickoff',
  SEGUIMIENTO = 'seguimiento',
  REVISION = 'revision',
  ENTREGA = 'entrega',
  OTRO = 'otro',
}

@Entity('reuniones')
export class Reunion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'enum', enum: TipoReunion, default: TipoReunion.SEGUIMIENTO })
  tipo: TipoReunion;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'int', nullable: true })
  duracionMinutos: number;

  @Column({ nullable: true, length: 500 })
  linkMeet: string;

  @Column({ nullable: true, length: 300 })
  notasUrl: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  cliente: Usuario;

  @ManyToOne(() => Proyecto, (p) => p.reuniones, { eager: false, nullable: true, onDelete: 'SET NULL' })
  proyecto: Proyecto;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
