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

export enum EstadoFactura {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
  CANCELADA = 'cancelada',
}

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  numero: string;

  @Column({ type: 'text', nullable: true })
  concepto: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  moneda: string;

  @Column({ type: 'enum', enum: EstadoFactura, default: EstadoFactura.PENDIENTE })
  estado: EstadoFactura;

  @Column({ type: 'date', nullable: true })
  fechaEmision: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column({ nullable: true, length: 300 })
  urlPdf: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  cliente: Usuario;

  @ManyToOne(() => Proyecto, (p) => p.facturas, { eager: false, nullable: true, onDelete: 'SET NULL' })
  proyecto: Proyecto;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
