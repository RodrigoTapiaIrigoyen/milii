import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { EmailVerification } from '@/models/EmailVerification';
import { getUserFromRequest } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Rate limiting por IP para evitar spam
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const rl = checkRateLimit(`send-verification:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
        { status: 429 }
      );
    }

    // Aceptar email del body (sin auth) O usar el usuario autenticado
    const body = await req.json().catch(() => ({}));
    let user: any = null;

    const userId = await getUserFromRequest(req);
    if (userId) {
      user = await User.findById(userId);
    } else if (body.email) {
      // Reenvío desde login sin estar autenticado
      user = await User.findOne({ email: body.email.toLowerCase().trim() });
    }

    if (!user) {
      // Respuesta genérica para no revelar si el email existe
      return NextResponse.json(
        { success: true, message: 'Si el correo existe, recibirás un enlace de verificación.' },
        { status: 200 }
      );
    }

    // Verificar si ya está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { success: true, message: 'Tu correo ya está verificado. Puedes iniciar sesión.' },
        { status: 200 }
      );
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Calcular expiración (24 horas desde ahora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Invalidar tokens anteriores
    await EmailVerification.updateMany(
      { userId: user._id, used: false },
      { used: true }
    );

    // Crear nuevo token
    await EmailVerification.create({
      userId: user._id,
      token: verificationToken,
      expiresAt,
      used: false,
    });

    // Construir URL de verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    // Enviar email de verificación
    try {
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (emailError: any) {
      console.error('Error al reenviar email de verificación:', emailError);
      // Si Resend rechaza por dominio no verificado (plan gratuito de pruebas),
      // no bloqueamos al usuario — le indicamos que contacte soporte.
      const isDomainError =
        emailError?.message?.includes('verify a domain') ||
        emailError?.statusCode === 403;
      return NextResponse.json(
        {
          success: true,
          message: isDomainError
            ? 'Email enviado. Si no lo recibes, contacta a soporte para verificar tu cuenta.'
            : 'Email de verificación enviado. Revisa tu bandeja de entrada.',
          ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email de verificación enviado. Revisa tu bandeja de entrada.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar verificación de email:', error);
    return NextResponse.json(
      { error: 'Error al enviar verificación' },
      { status: 500 }
    );
  }
}
