import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, EstadoTicket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';

export class ResponderTicketDto {
  respuesta: string;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
  ) {}

  async crear(dto: CreateTicketDto, cliente: Usuario): Promise<Ticket> {
    const ticket = this.repo.create({ ...dto, cliente });
    return this.repo.save(ticket);
  }

  findTodos(): Promise<Ticket[]> {
    return this.repo.find({
      relations: ['cliente'],
      order: { creadoEn: 'DESC' },
    });
  }

  findPorCliente(clienteId: string): Promise<Ticket[]> {
    return this.repo.find({
      where: { cliente: { id: clienteId } },
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: string, usuario: Usuario): Promise<Ticket> {
    const ticket = await this.repo.findOne({ where: { id }, relations: ['cliente'] });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (usuario.rol === RolUsuario.CLIENTE && ticket.cliente.id !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }
    return ticket;
  }

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

