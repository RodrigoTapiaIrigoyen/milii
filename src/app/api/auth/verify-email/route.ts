import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { EmailVerification } from '@/models/EmailVerification';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Buscar token de verificación
    const emailVerification = await EmailVerification.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }, // Token no expirado
    });

    if (!emailVerification) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await User.findById(emailVerification.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no esté ya verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'El email ya está verificado' },
        { status: 400 }
      );
    }

    // Marcar email como verificado
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Marcar token como usado
    emailVerification.used = true;
    await emailVerification.save();

    // Invalidar todos los demás tokens del usuario
    await EmailVerification.updateMany(
      { userId: user._id, used: false },
      { used: true }
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email verificado exitosamente' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al verificar email:', error);
    return NextResponse.json(
      { error: 'Error al verificar email' },
      { status: 500 }
    );
  }
}
