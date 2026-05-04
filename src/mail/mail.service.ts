import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: config.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: config.get<string>('MAIL_USER'),
        pass: config.get<string>('MAIL_PASS'),
      },
    });
  }

  async enviarResetPassword(opts: { nombre: string; email: string; token: string }): Promise<void> {
    const resetUrl =
      this.config.get<string>('FRONTEND_URL', 'https://www.hannahlab.com') +
      `/login/nueva-password?token=${opts.token}`;
    const fromName  = this.config.get<string>('MAIL_FROM_NAME', 'HannahLab');
    const fromEmail = this.config.get<string>('MAIL_USER');

    const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="background:#111111;padding:28px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:800;color:#ffffff;">Hannah<span style="color:#4A8B00;">Lab</span></span>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 12px;">Recupera tu contraseña</h1>
          <p style="font-size:14px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
            Hola <strong>${opts.nombre.split(' ')[0]}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.<br/>
            Este enlace es válido por <strong>1 hora</strong>. Si no lo solicitaste, ignora este correo.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#4A8B00;border-radius:10px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                Restablecer contraseña →
              </a>
            </td></tr>
          </table>
          <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.5;">
            O copia este enlace en tu navegador:<br/>
            <a href="${resetUrl}" style="color:#4A8B00;word-break:break-all;">${resetUrl}</a>
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} HannahLab · Lima, Perú 🇵🇪</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: opts.email,
        subject: 'Recupera tu contraseña · HannahLab',
        html,
      });
      this.logger.log(`Email de reset enviado a ${opts.email}`);
    } catch (err) {
      this.logger.error(`Error enviando reset a ${opts.email}: ${err.message}`);
      throw new Error('No se pudo enviar el correo. Verifica la configuración SMTP.');
    }
  }

  async enviarBienvenida(opts: {
    nombre: string;
    email: string;
    password: string;
    empresa?: string;
  }): Promise<void> {
    const loginUrl = this.config.get<string>('FRONTEND_URL', 'https://www.hannahlab.com') + '/login';
    const fromName = this.config.get<string>('MAIL_FROM_NAME', 'HannahLab');
    const fromEmail = this.config.get<string>('MAIL_USER');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a HannahLab</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:#111111;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              Hannah<span style="color:#4A8B00;">Lab</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">
              ¡Bienvenido/a, ${opts.nombre.split(' ')[0]}! 👋
            </h1>
            <p style="font-size:14px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
              Tu cuenta en la plataforma HannahLab ha sido creada exitosamente.
              ${opts.empresa ? `Nos alegra tenerte como parte de nuestra comunidad junto a <strong style="color:#374151;">${opts.empresa}</strong>.` : 'Nos alegra tenerte como parte de nuestra comunidad.'}
            </p>

            <!-- Credenciales -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">Tus credenciales de acceso</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                    <span style="font-size:12px;color:#6b7280;font-weight:500;">Email</span><br/>
                    <span style="font-size:14px;color:#111827;font-weight:600;">${opts.email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="font-size:12px;color:#6b7280;font-weight:500;">Contraseña temporal</span><br/>
                    <span style="font-size:16px;color:#4A8B00;font-weight:700;font-family:monospace;letter-spacing:0.1em;">${opts.password}</span>
                  </td>
                </tr>
              </table>
            </div>

            <p style="font-size:13px;color:#6b7280;margin:0 0 24px;line-height:1.5;">
              Te recomendamos cambiar tu contraseña después de tu primer inicio de sesión desde la sección <strong>Perfil</strong>.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#4A8B00;border-radius:10px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                    Ingresar a la plataforma →
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.5;">
              Si tienes alguna duda escríbenos por WhatsApp al
              <a href="https://wa.me/51925223153" style="color:#4A8B00;text-decoration:none;">+51 925 223 153</a>
              o responde este correo.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="font-size:11px;color:#9ca3af;margin:0;">
              © ${new Date().getFullYear()} HannahLab · Lima, Perú 🇵🇪
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: opts.email,
        subject: `¡Bienvenido/a a HannahLab, ${opts.nombre.split(' ')[0]}! 🎉`,
        html,
      });
      this.logger.log(`Email de bienvenida enviado a ${opts.email}`);
    } catch (err) {
      this.logger.error(`Error enviando email a ${opts.email}: ${err.message}`);
      throw new Error('No se pudo enviar el correo de bienvenida. Verifica la configuración SMTP.');
    }
  }
}
