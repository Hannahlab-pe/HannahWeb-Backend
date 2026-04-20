import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReunionesService } from './reuniones.service';
import { ReunionesController } from './reuniones.controller';
import { Reunion } from './entities/reunion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reunion])],
  providers: [ReunionesService],
  controllers: [ReunionesController],
  exports: [ReunionesService],
})
export class ReunionesModule {}
