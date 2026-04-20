import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { Documento } from './entities/documento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Documento])],
  providers: [DocumentosService],
  controllers: [DocumentosController],
  exports: [DocumentosService],
})
export class DocumentosModule {}
