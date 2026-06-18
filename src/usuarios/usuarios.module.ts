import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { MailModule } from '../mail/mail.module';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Ticket]), MailModule],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}
