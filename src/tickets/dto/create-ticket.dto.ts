import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { PrioridadTicket, TipoTicket } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsEnum(TipoTicket)
  tipo?: TipoTicket;

  @IsOptional()
  @IsEnum(PrioridadTicket)
  prioridad?: PrioridadTicket;
}
