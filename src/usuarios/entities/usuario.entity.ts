import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RolUsuario {
  ADMIN = 'admin',
  SUBADMIN = 'subadmin',
  CLIENTE = 'cliente',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.CLIENTE })
  rol: RolUsuario;

  @Column({ nullable: true, length: 20 })
  telefono: string;

  @Column({ nullable: true, length: 200 })
  empresa: string;

  @Column({ nullable: true, length: 15 })
  ruc: string;

  @Column({ nullable: true, length: 300 })
  direccion: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  resetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetTokenExpiresAt: Date | null;

  // ── Miembros del cliente ─────────────────────────────────────────
  @ManyToOne(() => Usuario, (u) => u.miembros, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clientePrincipalId' })
  clientePrincipal: Usuario | null;

  @OneToMany(() => Usuario, (u) => u.clientePrincipal)
  miembros: Usuario[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}