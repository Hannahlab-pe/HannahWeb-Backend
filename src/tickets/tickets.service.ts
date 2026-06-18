import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Ticket, EstadoTicket } from './entities/ticket.entity';
import { MensajeTicket } from './entities/mensaje-ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { Proyecto } from '../proyectos/entities/proyecto.entity';

export class ResponderTicketDto {
  @IsString()
  respuesta: string;
}

export class CambiarEstadoDto {
  @IsEnum(EstadoTicket)
  estado: EstadoTicket;
}

export class AsignarTicketDto {
  @IsOptional()
  @IsUUID()
  usuarioId: string | null;
}

export class EnviarMensajeDto {
  @IsString()
  contenido: string;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
    @InjectRepository(MensajeTicket)
    private readonly mensajeRepo: Repository<MensajeTicket>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CreateTicketDto, cliente: Usuario): Promise<Ticket> {
    const { proyectoId, ...rest } = dto;
    let proyecto: Proyecto | null = null;
    if (proyectoId) {
      proyecto = await this.proyectoRepo.findOne({ where: { id: proyectoId } });
    }
    const ticket = this.repo.create({ ...rest, cliente, ...(proyecto ? { proyecto } : {}) });
    return this.repo.save(ticket);
  }

  findTodos(): Promise<Ticket[]> {
    const fechaLimite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.repo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.cliente', 'cliente')
      .leftJoinAndSelect('ticket.proyecto', 'proyecto')
      .leftJoinAndSelect('ticket.asignadoA', 'asignadoA')
      .where('ticket.estado != :cerrado OR ticket.actualizadoEn >= :fechaLimite', {
        cerrado: EstadoTicket.CERRADO,
        fechaLimite,
      })
      .orderBy('ticket.creadoEn', 'DESC')
      .getMany();
  }

  findPorCliente(clienteId: string): Promise<Ticket[]> {
    const fechaLimite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.repo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.proyecto', 'proyecto')
      .leftJoinAndSelect('ticket.asignadoA', 'asignadoA')
      .where('ticket.clienteId = :clienteId', { clienteId })
      .andWhere('ticket.estado != :cerrado OR ticket.actualizadoEn >= :fechaLimite', {
        cerrado: EstadoTicket.CERRADO,
        fechaLimite,
      })
      .orderBy('ticket.creadoEn', 'DESC')
      .getMany();
  }

  async findOne(id: string, usuario: Usuario): Promise<Ticket> {
    const ticket = await this.repo.findOne({
      where: { id },
      relations: ['cliente', 'proyecto', 'asignadoA'],
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (usuario.rol === RolUsuario.CLIENTE) {
      const clienteEfectivoId = (usuario as any).clientePrincipal?.id ?? usuario.id;
      if (ticket.cliente.id !== clienteEfectivoId) {
        throw new ForbiddenException('No tienes acceso a este ticket');
      }
    }
    return ticket;
  }

  // ── Mensajes ────────────────────────────────────────────────────

  async getMensajes(ticketId: string, usuario: Usuario): Promise<MensajeTicket[]> {
    const ticket = await this.repo.findOne({ where: { id: ticketId }, relations: ['cliente'] });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (usuario.rol === RolUsuario.CLIENTE) {
      const clienteEfectivoId = (usuario as any).clientePrincipal?.id ?? usuario.id;
      if (ticket.cliente.id !== clienteEfectivoId) {
        throw new ForbiddenException('No tienes acceso a este ticket');
      }
    }
    return this.mensajeRepo.find({
      where: { ticket: { id: ticketId } },
      relations: ['autor'],
      order: { creadoEn: 'ASC' },
    });
  }

  async enviarMensaje(ticketId: string, dto: EnviarMensajeDto, autor: Usuario): Promise<MensajeTicket> {
    const ticket = await this.repo.findOne({ where: { id: ticketId }, relations: ['cliente'] });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (autor.rol === RolUsuario.CLIENTE) {
      const clienteEfectivoId = (autor as any).clientePrincipal?.id ?? autor.id;
      if (ticket.cliente.id !== clienteEfectivoId) {
        throw new ForbiddenException('No tienes acceso a este ticket');
      }
    }
    // Si el ticket estaba abierto y el equipo responde, pasarlo a en_progreso
    if (autor.rol !== RolUsuario.CLIENTE && ticket.estado === EstadoTicket.ABIERTO) {
      ticket.estado = EstadoTicket.EN_PROGRESO;
      await this.repo.save(ticket);
    }
    const msg = this.mensajeRepo.create({ contenido: dto.contenido, autor, ticket });
    const saved = await this.mensajeRepo.save(msg);
    return this.mensajeRepo.findOne({ where: { id: saved.id }, relations: ['autor'] }) as Promise<MensajeTicket>;
  }

  // ── Estado y asignación ─────────────────────────────────────────

  async cambiarEstado(id: string, dto: CambiarEstadoDto): Promise<Ticket> {
    const ticket = await this.repo.findOne({ where: { id }, relations: ['cliente', 'proyecto', 'asignadoA'] });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    ticket.estado = dto.estado;
    return this.repo.save(ticket);
  }

  async asignar(id: string, dto: AsignarTicketDto): Promise<Ticket> {
    const ticket = await this.repo.findOne({ where: { id }, relations: ['cliente', 'proyecto', 'asignadoA'] });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (dto.usuarioId) {
      const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuarioId } });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      if (usuario.rol === RolUsuario.CLIENTE) {
        throw new BadRequestException('Solo puedes asignar tickets a miembros del equipo');
      }
      if (!usuario.activo) {
        throw new BadRequestException('No puedes asignar tickets a un usuario inactivo');
      }
      ticket.asignadoA = usuario;
    } else {
      ticket.asignadoA = null;
    }
    return this.repo.save(ticket);
  }

  // ── Mantener compatibilidad con endpoints legacy ─────────────────

  async responder(id: string, dto: ResponderTicketDto): Promise<Ticket> {
    const ticket = await this.repo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    ticket.respuesta = dto.respuesta;
    ticket.estado = EstadoTicket.EN_PROGRESO;
    return this.repo.save(ticket);
  }

  async cerrar(id: string): Promise<Ticket> {
    const ticket = await this.repo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    ticket.estado = EstadoTicket.RESUELTO;
    return this.repo.save(ticket);
  }
}
