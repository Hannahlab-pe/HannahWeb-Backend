import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ColumnaKanban, PrioridadTarea } from '../entities/tarea-kanban.entity';
import { Type } from 'class-transformer';

export class CreateTareaKanbanDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(ColumnaKanban)
  columna?: ColumnaKanban;

  @IsOptional()
  @IsEnum(PrioridadTarea)
  prioridad?: PrioridadTarea;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orden?: number;

  @IsOptional()
  @IsDateString()
  fechaLimite?: string;

  @IsUUID()
  implementacionId: string;
}

export class MoverTareaDto {
  @IsEnum(ColumnaKanban)
  columna: ColumnaKanban;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orden?: number;
}
