import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { EstadoImplementacion, TipoImplementacion } from '../entities/implementacion.entity';

export class CreateImplementacionDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoImplementacion)
  tipo?: TipoImplementacion;

  @IsOptional()
  @IsEnum(EstadoImplementacion)
  estado?: EstadoImplementacion;

  @IsUUID()
  proyectoId: string;
}
