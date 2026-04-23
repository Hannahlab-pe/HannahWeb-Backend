import {
  Column, CreateDateColumn, Entity,
  ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { MensajeTicket } from './mensaje-ticket.entity';

export enum TipoTicket {
  COMENTARIO = 'comentario',
  APORTE = 'aporte',
  INCIDENCIA = 'incidencia',
  BUG = 'bug',
}

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

  @Column({ type: 'enum', enum: TipoTicket, default: TipoTicket.COMENTARIO })
  tipo: TipoTicket;

  @Column({ type: 'enum', enum: PrioridadTicket, default: PrioridadTicket.MEDIA })
  prioridad: PrioridadTicket;

  @Column({ type: 'enum', enum: EstadoTicket, default: EstadoTicket.ABIERTO })
  estado: EstadoTicket;

  @Column({ type: 'text', nullable: true })
  respuesta: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  cliente: Usuario;

  @ManyToOne(() => Proyecto, { eager: false, nullable: true, onDelete: 'SET NULL' })
  proyecto: Proyecto;

  @ManyToOne(() => Usuario, { eager: false, nullable: true, onDelete: 'SET NULL' })
  asignadoA: Usuario | null;

  @OneToMany(() => MensajeTicket, (m) => m.ticket)
  mensajes: MensajeTicket[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
