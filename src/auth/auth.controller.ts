import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService, ActualizarPerfilDto, CambiarPasswordDto, ForgotPasswordDto, ResetPasswordDto } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  perfil(@UsuarioActual() usuario: Usuario) {
    return this.authService.perfil(usuario);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mi-equipo')
  miEquipo(@UsuarioActual() usuario: Usuario) {
    return this.authService.miEquipo(usuario);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('perfil')
  actualizarPerfil(@UsuarioActual() usuario: Usuario, @Body() dto: ActualizarPerfilDto) {
    return this.authService.actualizarPerfil(usuario, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cambiar-password')
  cambiarPassword(@UsuarioActual() usuario: Usuario, @Body() dto: CambiarPasswordDto) {
    return this.authService.cambiarPassword(usuario, dto);
  }
}
