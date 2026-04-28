import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PasswordReset } from '@/models/PasswordReset';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: máximo 3 solicitudes de reset por IP cada hora
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const rl = checkRateLimit(`reset:${ip}`, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en una hora.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });

    // Por seguridad, siempre devolvemos el mismo mensaje aunque el usuario no exista
    // Esto previene que se pueda verificar si un email está registrado
    if (!user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu contraseña.' 
        },
        { status: 200 }
      );
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Calcular expiración (1 hora desde ahora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token en base de datos
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt,
      used: false,
    });

    // Construir URL de recuperación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Enviar email de recuperación
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailError) {
      console.error('Error al enviar email de recuperación:', emailError);
      // No fallamos el flujo — el token ya está guardado en BD
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu contraseña.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
