import { IsString, IsOptional, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { PrioridadTicket } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsEnum(PrioridadTicket)
  prioridad?: PrioridadTicket;
}
