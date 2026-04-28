import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET no está configurado. Define esta variable de entorno antes de iniciar la aplicación.');
}
const secretKey = new TextEncoder().encode(jwtSecret);

const tokenName = 'placerlux-token';
const tokenExpiry = 24 * 60 * 60 * 1000; // 24 horas

// =============================================
// Crear JWT Token
// =============================================
export async function createToken(userId: string, role: string = 'user') {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);

  return token;
}

// =============================================
// Guardar token en cookie HTTP-only
// =============================================
export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(tokenName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenExpiry,
    path: '/',
  });
}

// =============================================
// Remover token de cookie
// =============================================
export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(tokenName);
}

// =============================================
// Verificar JWT Token
// =============================================
export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secretKey);
    return verified.payload as { userId: string };
  } catch (error) {
    return null;
  }
}

// =============================================
// Obtener usuario del request
// =============================================
export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(tokenName)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload?.userId || null;
}

// =============================================
// Verificar si es admin
// =============================================
export async function isAdminFromRequest(user: any): Promise<boolean> {
  return user?.role === 'admin';
}

// =============================================
// Verificar autenticación completa (usuario + datos)
// =============================================
export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get(tokenName)?.value;

  if (!token) {
    return { authenticated: false, user: null };
  }

  const payload = await verifyToken(token);
  if (!payload?.userId) {
    return { authenticated: false, user: null };
  }

  await connectDB();
  const mongoose = await import('mongoose');
  const { User } = await import('@/models/User');
  const UserModel = mongoose.default.models.User || User;
  const user = await UserModel.findById(payload.userId).select('-password');

  if (!user) {
    return { authenticated: false, user: null };
  }

  return {
    authenticated: true,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      accountType: user.accountType || 'cliente',
      status: user.status,
    },
  };
}
