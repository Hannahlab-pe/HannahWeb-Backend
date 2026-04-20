import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async crear(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existe = await this.repo.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const hash = await bcrypt.hash(dto.password, 12);
    const usuario = this.repo.create({ ...dto, password: hash });
    const guardado = await this.repo.save(usuario);

    const { password: _pw, ...resultado } = guardado;
    return resultado;
  }

  findAll(): Promise<Usuario[]> {
    return this.repo.find({ order: { creadoEn: 'DESC' } });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { email } });
  }

  async desactivar(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.repo.save(usuario);
  }

  async updateActivo(id: string, activo: boolean): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.findOne(id);
    usuario.activo = activo;
    const guardado = await this.repo.save(usuario);
    const { password: _pw, ...resultado } = guardado;
    return resultado;
  }
}

