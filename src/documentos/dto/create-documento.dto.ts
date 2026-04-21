import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CategoriaDocumento } from '../entities/documento.entity';

export class CreateDocumentoDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsEnum(CategoriaDocumento)
  categoria?: CategoriaDocumento;

  @IsString()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tamanio?: string;

  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsUUID()
  proyectoId?: string;
}
