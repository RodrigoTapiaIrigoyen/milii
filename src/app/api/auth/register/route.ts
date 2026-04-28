import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { EmailVerification } from '@/models/EmailVerification';
import { Referral } from '@/models/Referral';
import { createToken, setAuthCookie } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { createNotification, NotificationTemplates } from '@/lib/shared/notifications';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: máximo 5 registros por IP cada hora
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const rl = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
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
    const { email, password, accountType, referralCode: refCode } = await req.json();

    // Validación básica
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Email y contraseña válidos requeridos' },
        { status: 400 }
      );
    }

    if (!accountType || !['profesional', 'cliente'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Tipo de cuenta requerido (profesional o cliente)' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no exista
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Verificar si el código de referido es válido
    let referrer: any = null;
    if (refCode) {
      referrer = await User.findOne({ referralCode: refCode.toUpperCase() });
    }

    // Generar código de referido único para el nuevo usuario
    let newReferralCode = '';
    let attempts = 0;
    do {
      newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      attempts++;
    } while (
      attempts < 10 &&
      (await User.exists({ referralCode: newReferralCode }))
    );

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      role: 'user',
      accountType,
      isActive: true,
      emailVerified: false,
      referralCode: newReferralCode,
      referredBy: referrer ? referrer._id : null,
    });
    await user.save();

    // Registrar la relación de referido si aplica
    if (referrer) {
      try {
        await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          code: refCode.toUpperCase(),
          status: 'pending',
          rewardAmount: 100,
        });
      } catch {
        // Si falla (ej. duplicado), no bloqueamos el registro
      }
    }

    // Generar token de verificación de email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

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
      await sendVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error('Error al enviar email de verificación:', emailError);
      // No fallamos el registro si el email falla — el usuario puede reenviar desde el dashboard
    }

    // Generar token JWT y guardar en cookie
    const token = await createToken(user._id.toString(), user.role || 'user');
    await setAuthCookie(token);

    // Crear notificación de bienvenida
    try {
      await createNotification({
        userId: user._id.toString(),
        ...NotificationTemplates.welcome(email.split('@')[0]),
      });
    } catch (notifError) {
      console.error('Error al crear notificación de bienvenida:', notifError);
      // No fallar el registro si falla la notificación
    }

    return NextResponse.json(
      {
        message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          accountType: user.accountType,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
