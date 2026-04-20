import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { FacturasModule } from './facturas/facturas.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReunionesModule } from './reuniones/reuniones.module';
import { DocumentosModule } from './documentos/documentos.module';
import { CommonModule } from './common/common.module';
import { ImplementacionesModule } from './implementaciones/implementaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (databaseUrl) {
          // Railway / produccion: usa la URL completa con SSL
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }
        // Desarrollo local: usa variables individuales
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsuariosModule,
    ProyectosModule,
    FacturasModule,
    TicketsModule,
    ReunionesModule,
    DocumentosModule,
    CommonModule,
    ImplementacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
