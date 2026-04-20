import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const usuario = await this.usuariosRepo.findOne({
      where: { email, activo: true },
      select: ['id', 'email', 'nombre', 'rol', 'empresa', 'telefono', 'password'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = this.jwtService.sign(payload);

    const { password: _pw, ...datosUsuario } = usuario;

    return {
      accessToken: token,
      usuario: datosUsuario,
    };
  }

  perfil(usuario: Usuario) {
    return usuario;
  }
}
