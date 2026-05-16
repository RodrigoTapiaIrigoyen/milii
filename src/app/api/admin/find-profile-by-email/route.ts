import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { Subscription } from '@/models/Subscription';

export async function POST(req: NextRequest) {
  const { secret, email } = await req.json();

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ found: false });

    const profile = await Profile.findOne({ userId: user._id }).lean();
    const subscription = await Subscription.findOne({ userId: user._id, status: 'active', endDate: { $gt: new Date() } }).lean();

    return NextResponse.json({
      found: true,
      user: { _id: user._id, email: user.email, role: user.role, emailVerified: user.emailVerified },
      profile,
      subscription,
    });
  } catch (error) {
    console.error('Error find-profile-by-email:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
