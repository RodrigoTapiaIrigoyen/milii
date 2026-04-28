import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PasswordReset } from '@/models/PasswordReset';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar token de recuperación
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }, // Token no expirado
    });

    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario
    user.password = hashedPassword;
    await user.save();

    // Marcar token como usado
    passwordReset.used = true;
    await passwordReset.save();

    // Invalidar todos los demás tokens de recuperación del usuario
    await PasswordReset.updateMany(
      { userId: user._id, used: false },
      { used: true }
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contraseña actualizada exitosamente' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    return NextResponse.json(
      { error: 'Error al resetear contraseña' },
      { status: 500 }
    );
  }
}
