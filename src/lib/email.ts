import { Resend } from 'resend';

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY no está configurado en las variables de entorno.');
  }
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'PlacerLux <noreply@placerlux.lat>';
const APP_NAME = 'PlacerLux';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://placerlux.lat';

// ─────────────────────────────────────────────
// Plantilla base compartida
// ─────────────────────────────────────────────
function baseTemplate({
  previewText,
  content,
}: {
  previewText: string;
  content: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${APP_NAME}</title>
  <!--[if !mso]><!-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#080808;font-family:'Inter',Arial,sans-serif;">

  <!-- Preview text (oculto en el cuerpo, visible en bandeja de entrada) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${previewText}&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;
  </div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#080808;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- ── HEADER ─────────────────────────────── -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d0d0d 0%,#1a1208 100%);border-radius:16px 16px 0 0;border:1px solid #2a2010;border-bottom:none;padding:40px 48px 32px;">
              <!-- Logo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${APP_URL}" style="text-decoration:none;">
                      <span style="font-size:28px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;">
                        Lux<span style="color:#d4af37;">Profile</span>
                      </span>
                    </a>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f0d060);color:#0d0d0d;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:4px;">
                      PREMIUM
                    </span>
                  </td>
                </tr>
              </table>
              <!-- Línea dorada -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#d4af37,#f0d060,#d4af37,transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CUERPO ──────────────────────────────── -->
          <tr>
            <td style="background:#111111;border-left:1px solid #2a2010;border-right:1px solid #2a2010;padding:40px 48px;">
              ${content}
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────── -->
          <tr>
            <td style="background:#0d0d0d;border-radius:0 0 16px 16px;border:1px solid #2a2010;border-top:none;padding:28px 48px;">
              <!-- Separador -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#2a2010,transparent);"></td>
                </tr>
              </table>
              <!-- Links footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${APP_URL}/perfiles" style="color:#888;font-size:12px;text-decoration:none;margin:0 10px;">Explorar perfiles</a>
                    <span style="color:#444;">|</span>
                    <a href="${APP_URL}/legal/privacidad" style="color:#888;font-size:12px;text-decoration:none;margin:0 10px;">Privacidad</a>
                    <span style="color:#444;">|</span>
                    <a href="${APP_URL}/legal/terminos" style="color:#888;font-size:12px;text-decoration:none;margin:0 10px;">Términos</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#555;font-size:11px;line-height:1.6;">
                      © ${new Date().getFullYear()} ${APP_NAME} · Plataforma de perfiles profesionales verificados<br />
                      Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────
// Botón CTA reutilizable
// ─────────────────────────────────────────────
function ctaButton(href: string, label: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:32px 0 24px;">
          <a href="${href}"
             style="display:inline-block;background:linear-gradient(135deg,#c9a227,#e8c84a);color:#0a0a0a;font-size:15px;font-weight:700;letter-spacing:0.3px;text-decoration:none;padding:16px 40px;border-radius:10px;box-shadow:0 4px 20px rgba(212,175,55,0.35);">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

// ─────────────────────────────────────────────
// Bloque de URL alternativa
// ─────────────────────────────────────────────
function fallbackUrl(url: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr>
        <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px 18px;">
          <p style="margin:0 0 6px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">O copia este enlace en tu navegador</p>
          <p style="margin:0;word-break:break-all;font-size:12px;color:#d4af37;">${url}</p>
        </td>
      </tr>
    </table>`;
}

// =============================================
// Email: Verificación de cuenta al registrarse
// =============================================
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const content = `
    <!-- Ícono -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#1a1208,#2a1e08);border:1px solid #3a2e10;border-radius:50%;text-align:center;line-height:64px;font-size:28px;">
            ✦
          </div>
        </td>
      </tr>
    </table>

    <!-- Título -->
    <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:700;text-align:center;letter-spacing:-0.3px;">
      ¡Bienvenida a <span style="color:#d4af37;">PlacerLux</span>!
    </h1>
    <p style="margin:0 0 28px;color:#999;font-size:15px;line-height:1.7;text-align:center;">
      Tu cuenta ha sido creada exitosamente. Solo falta un paso:<br />
      <strong style="color:#d4af37;">verifica tu dirección de correo electrónico</strong>.
    </p>

    <!-- CTA -->
    ${ctaButton(verificationUrl, '✓ Verificar mi cuenta')}

    <!-- Descripción extra -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#161616;border:1px solid #252525;border-radius:10px;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="20" valign="top" style="padding-top:2px;">
                <span style="color:#d4af37;font-size:14px;">◆</span>
              </td>
              <td style="padding-left:10px;">
                <p style="margin:0;color:#ccc;font-size:13px;line-height:1.6;">
                  Este enlace es válido por <strong style="color:#fff;">24 horas</strong>. Después deberás solicitar uno nuevo desde tu panel.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${fallbackUrl(verificationUrl)}
  `;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `✦ Verifica tu cuenta en PlacerLux`,
    html: baseTemplate({
      previewText: '¡Ya casi! Solo verifica tu email para activar tu perfil en PlacerLux.',
      content,
    }),
  });

  if (error) {
    console.error('[Email] Error al enviar verificación:', error);
    const err = Object.assign(new Error('Error al enviar email de verificación'), {
      statusCode: (error as any).statusCode,
    });
    throw err;
  }

  return data;
}

// =============================================
// Email: Recuperación de contraseña
// =============================================
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const content = `
    <!-- Ícono -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#1a0808,#2a1010);border:1px solid #3a1010;border-radius:50%;text-align:center;line-height:64px;font-size:28px;">
            🔑
          </div>
        </td>
      </tr>
    </table>

    <!-- Título -->
    <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:700;text-align:center;letter-spacing:-0.3px;">
      Recuperar contraseña
    </h1>
    <p style="margin:0 0 28px;color:#999;font-size:15px;line-height:1.7;text-align:center;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color:#d4af37;">PlacerLux</strong>.<br />
      Haz clic en el botón para crear una nueva.
    </p>

    <!-- CTA -->
    ${ctaButton(resetUrl, '🔒 Restablecer contraseña')}

    <!-- Advertencia -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#1a1208;border:1px solid #3a2e10;border-radius:10px;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="20" valign="top" style="padding-top:2px;">
                <span style="color:#d4af37;font-size:14px;">⚠</span>
              </td>
              <td style="padding-left:10px;">
                <p style="margin:0;color:#ccc;font-size:13px;line-height:1.6;">
                  Este enlace expira en <strong style="color:#fff;">1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este correo — tu contraseña permanecerá igual.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${fallbackUrl(resetUrl)}
  `;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `🔑 Restablecer contraseña — PlacerLux`,
    html: baseTemplate({
      previewText: 'Solicitud de restablecimiento de contraseña para tu cuenta PlacerLux.',
      content,
    }),
  });

  if (error) {
    console.error('[Email] Error al enviar reset de contraseña:', error);
    const err = Object.assign(new Error('Error al enviar email de recuperación'), {
      statusCode: (error as any).statusCode,
    });
    throw err;
  }

  return data;
}
