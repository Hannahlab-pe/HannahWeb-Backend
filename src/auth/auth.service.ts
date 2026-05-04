import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

export class ActualizarPerfilDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  empresa?: string;
}

export class CambiarPasswordDto {
  @IsString()
  @MinLength(1)
  passwordActual: string;

  @IsString()
  @MinLength(6)
  passwordNueva: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const usuario = await this.usuariosRepo.findOne({
      where: { email, activo: true },
      select: ['id', 'email', 'nombre', 'rol', 'empresa', 'telefono', 'password'],
      relations: ['clientePrincipal'],
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre };
    const token = this.jwtService.sign(payload);
    const { password: _pw, ...datosUsuario } = usuario;
    return { accessToken: token, usuario: datosUsuario };
  }

  perfil(usuario: Usuario) {
    return usuario;
  }

  async miEquipo(usuario: Usuario): Promise<Usuario[]> {
    if (usuario.clientePrincipal) {
      // Es sub-cliente: devolver el principal + todos los hermanos (mismo clientePrincipal)
      const principalId = usuario.clientePrincipal.id;
      const [principal, hermanos] = await Promise.all([
        this.usuariosRepo.findOne({ where: { id: principalId } }),
        this.usuariosRepo.find({
          where: { clientePrincipal: { id: principalId } },
          order: { creadoEn: 'ASC' },
        }),
      ]);
      return [principal!, ...hermanos].filter(Boolean) as Usuario[];
    } else {
      // Es cliente principal: devolver él mismo + sus sub-clientes
      const miembros = await this.usuariosRepo.find({
        where: { clientePrincipal: { id: usuario.id } },
        order: { creadoEn: 'ASC' },
      });
      return [usuario, ...miembros];
    }
  }

  async actualizarPerfil(usuario: Usuario, dto: ActualizarPerfilDto): Promise<Omit<Usuario, 'password'>> {
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.telefono !== undefined) usuario.telefono = dto.telefono;
    if (dto.empresa !== undefined) usuario.empresa = dto.empresa;
    const guardado = await this.usuariosRepo.save(usuario);
    const { password: _pw, ...resultado } = guardado;
    return resultado;
  }

  async cambiarPassword(usuario: Usuario, dto: CambiarPasswordDto): Promise<{ ok: boolean }> {
    const conPassword = await this.usuariosRepo.findOne({
      where: { id: usuario.id },
      select: ['id', 'password'],
    });
    const valido = await bcrypt.compare(dto.passwordActual, conPassword!.password);
    if (!valido) throw new BadRequestException('La contraseña actual es incorrecta');
    conPassword!.password = await bcrypt.hash(dto.passwordNueva, 12);
    await this.usuariosRepo.save(conPassword!);
    return { ok: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ ok: boolean }> {
    const usuario = await this.usuariosRepo.findOne({ where: { email: dto.email, activo: true } });
    if (!usuario) return { ok: true }; // no revelar si el email existe

    const token = crypto.randomBytes(32).toString('hex');
    await this.usuariosRepo.update(usuario.id, {
      resetToken: token,
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    });

    await this.mailService.enviarResetPassword({
      nombre: usuario.nombre,
      email: usuario.email,
      token,
    });
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ ok: boolean }> {
    const usuario = await this.usuariosRepo.findOne({
      where: { resetToken: dto.token },
      select: ['id', 'resetToken', 'resetTokenExpiresAt', 'password'],
    });

    if (!usuario || !usuario.resetTokenExpiresAt || usuario.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('El enlace es inválido o ha expirado');
    }

    await this.usuariosRepo.update(usuario.id, {
      password: await bcrypt.hash(dto.password, 12),
      resetToken: null,
      resetTokenExpiresAt: null,
    });
    return { ok: true };
  }
}
