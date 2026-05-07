import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  const { secret, email } = await req.json();

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { email },
    { emailVerified: true },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, email: user.email, emailVerified: user.emailVerified });
}
