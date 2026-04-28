import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { EmailVerification } from '@/models/EmailVerification';
import { getUserFromRequest } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'El email ya está verificado' },
        { status: 400 }
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
          error: isDomainError
            ? 'El servicio de email requiere configuración adicional. Contacta a soporte para verificar tu cuenta manualmente.'
            : 'No se pudo enviar el email. Inténtalo de nuevo en unos minutos.',
          // En dev devolvemos la URL directamente para poder probar sin email
          ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
        },
        { status: isDomainError ? 503 : 500 }
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
