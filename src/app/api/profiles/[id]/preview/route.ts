import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/profiles/[id]/preview
// Solo el dueño puede ver su perfil en modo preview (sin importar approvalStatus)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await connectDB();

    const profile = await Profile.findOne({
      _id: params.id,
      userId: currentUser.userId,
    })
      .select('-userId')
      .lean();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ profile: JSON.parse(JSON.stringify(profile)) });
  } catch (error) {
    console.error('Error en preview de perfil:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
