import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { TipoReunion } from '../entities/reunion.entity';
import { Type } from 'class-transformer';

export class CreateReunionDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoReunion)
  tipo?: TipoReunion;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duracionMinutos?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkMeet?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notasUrl?: string;

  @IsUUID()
  clienteId: string;
}
