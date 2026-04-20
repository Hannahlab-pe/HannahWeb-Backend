import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum PrioridadTicket {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export enum EstadoTicket {
  ABIERTO = 'abierto',
  EN_PROGRESO = 'en_progreso',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'enum', enum: PrioridadTicket, default: PrioridadTicket.MEDIA })
  prioridad: PrioridadTicket;

  @Column({ type: 'enum', enum: EstadoTicket, default: EstadoTicket.ABIERTO })
  estado: EstadoTicket;

  @Column({ type: 'text', nullable: true })
  respuesta: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  cliente: Usuario;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
