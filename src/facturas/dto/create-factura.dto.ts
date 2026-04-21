import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { EstadoFactura } from '../entities/factura.entity';
import { Type } from 'class-transformer';

export class CreateFacturaDto {
  @IsString()
  @MaxLength(50)
  numero: string;

  @IsOptional()
  @IsString()
  concepto?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monto: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  moneda?: string;

  @IsOptional()
  @IsEnum(EstadoFactura)
  estado?: EstadoFactura;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  urlPdf?: string;

  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsUUID()
  proyectoId?: string;
}

  @IsUUID()
  clienteId: string;
}
