import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();

  // Buscar usuarios seed (@ejemplo.com)
  const seedUsers = await User.find({ email: /@ejemplo\.com$/ }).select('_id email');
  const seedUserIds = seedUsers.map(u => u._id);

  // Borrar sus perfiles
  const profilesResult = await Profile.deleteMany({ userId: { $in: seedUserIds } });

  // Borrar los usuarios seed
  const usersResult = await User.deleteMany({ email: /@ejemplo\.com$/ });

  return NextResponse.json({
    deleted: {
      users: usersResult.deletedCount,
      profiles: profilesResult.deletedCount,
    },
    emails: seedUsers.map(u => u.email),
  });
}
