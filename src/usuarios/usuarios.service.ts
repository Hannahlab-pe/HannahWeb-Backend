import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) { }

  async crear(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existe = await this.repo.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const hash = await bcrypt.hash(dto.password, 12);
    const { clientePrincipalId, ...rest } = dto;

    let clientePrincipal: Usuario | null = null;
    if (clientePrincipalId) {
      clientePrincipal = await this.repo.findOne({ where: { id: clientePrincipalId } });
      if (!clientePrincipal) throw new NotFoundException('Cliente principal no encontrado');
    }

    const usuario = this.repo.create({
      ...rest,
      password: hash,
      ...(clientePrincipal ? { clientePrincipal } : {}),
    });
    const guardado = await this.repo.save(usuario);

    const { password: _pw, ...resultado } = guardado;
    return resultado;
  }

  findAll(): Promise<Usuario[]> {
    return this.repo.find({ order: { creadoEn: 'DESC' } });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { email } });
  }

  // ── Miembros del cliente ────────────────────────────────────────

  findMiembrosByCliente(clienteId: string): Promise<Usuario[]> {
    return this.repo.find({
      where: { clientePrincipal: { id: clienteId }, rol: RolUsuario.CLIENTE },
      order: { creadoEn: 'ASC' },
    });
  }

  async crearMiembro(
    clienteId: string,
    data: { nombre: string; email: string; password: string; telefono?: string },
  ): Promise<Omit<Usuario, 'password'>> {
    return this.crear({
      ...data,
      rol: RolUsuario.CLIENTE,
      clientePrincipalId: clienteId,
    });
  }

  async eliminarMiembro(miembroId: string): Promise<void> {
    const miembro = await this.repo.findOne({
      where: { id: miembroId },
      relations: ['clientePrincipal'],
    });
    if (!miembro || !miembro.clientePrincipal) {
      throw new NotFoundException('Miembro no encontrado');
    }
    await this.repo.remove(miembro);
  }

  async actualizarMiembro(
    miembroId: string,
    data: { nombre?: string; email?: string; password?: string; telefono?: string },
  ): Promise<Omit<Usuario, 'password'>> {
    const miembro = await this.repo.findOne({
      where: { id: miembroId },
      relations: ['clientePrincipal'],
    });
    if (!miembro || !miembro.clientePrincipal) {
      throw new NotFoundException('Miembro no encontrado');
    }

    if (data.nombre) miembro.nombre = data.nombre;
    if (data.email) {
      const existe = await this.repo.findOne({ where: { email: data.email } });
      if (existe && existe.id !== miembroId) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      miembro.email = data.email;
    }
    if (data.password) {
      miembro.password = await bcrypt.hash(data.password, 12);
    }
    if (data.telefono !== undefined) miembro.telefono = data.telefono;

    const guardado = await this.repo.save(miembro);
    const { password: _pw, ...resultado } = guardado;
    return resultado;
  }

  // ── Activar / desactivar ────────────────────────────────────────

  private async limpiarAsignacionesDeUsuario(usuarioId: string): Promise<void> {
    const ticketsAsignados = await this.ticketRepo.find({
      where: { asignadoA: { id: usuarioId } },
      relations: ['asignadoA'],
    });

    if (ticketsAsignados.length === 0) {
      return;
    }

    for (const ticket of ticketsAsignados) {
      ticket.asignadoA = null;
    }

    await this.ticketRepo.save(ticketsAsignados);
  }

  async desactivar(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.repo.save(usuario);
    await this.limpiarAsignacionesDeUsuario(id);
  }

  async updateActivo(id: string, activo: boolean): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.findOne(id);
    usuario.activo = activo;
    const guardado = await this.repo.save(usuario);
    if (!activo) {
      await this.limpiarAsignacionesDeUsuario(id);
    }
    const { password: _pw, ...resultado } = guardado;
    return resultado;
  }
}
