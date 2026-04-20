import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum CategoriaDocumento {
  CONTRATO = 'contrato',
  PROPUESTA = 'propuesta',
  ENTREGABLE = 'entregable',
  FACTURA = 'factura',
  OTRO = 'otro',
}

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'enum', enum: CategoriaDocumento, default: CategoriaDocumento.OTRO })
  categoria: CategoriaDocumento;

  @Column({ length: 500 })
  url: string;

  @Column({ nullable: true, length: 20 })
  tamanio: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: false, onDelete: 'CASCADE' })
  cliente: Usuario;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
