import {
  Column, CreateDateColumn, Entity,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Ticket } from './ticket.entity';

@Entity('ticket_mensajes')
export class MensajeTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenido: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  autor: Usuario;

  @ManyToOne(() => Ticket, (t) => t.mensajes, { nullable: false, onDelete: 'CASCADE' })
  ticket: Ticket;

  @CreateDateColumn()
  creadoEn: Date;
}
