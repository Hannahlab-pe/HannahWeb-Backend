import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImplementacionesService } from './implementaciones.service';
import { ImplementacionesController } from './implementaciones.controller';
import { Implementacion } from './entities/implementacion.entity';
import { TareaKanban } from './entities/tarea-kanban.entity';
import { Proyecto } from '../proyectos/entities/proyecto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Implementacion, TareaKanban, Proyecto, Usuario])],
  providers: [ImplementacionesService],
  controllers: [ImplementacionesController],
  exports: [ImplementacionesService],
})
export class ImplementacionesModule {}
