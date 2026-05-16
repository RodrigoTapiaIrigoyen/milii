import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { createNotification } from '@/lib/shared/notifications';

export async function POST(req: NextRequest) {
  const { secret, profileId, email } = await req.json();

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!profileId && !email) {
    return NextResponse.json({ error: 'Se requiere profileId o email' }, { status: 400 });
  }

  try {
    await connectDB();

    let profile = null;
    let user = null;

    if (profileId) {
      profile = await Profile.findById(profileId);
      if (profile) {
        user = await User.findById(profile.userId);
      }
    }

    if (!profile && email) {
      user = await User.findOne({ email });
      if (user) {
        profile = await Profile.findOne({ userId: user._id });
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    if (!user) {
      user = await User.findById(profile.userId);
    }

    profile.approvalStatus = 'approved';
    profile.approvedAt = new Date();
    profile.approvalNotes = 'Aprobado manualmente por admin.';
    profile.isPublished = true;
    profile.publishedAt = new Date();
    await profile.save();

    if (user) {
      await createNotification({
        userId: user._id.toString(),
        type: 'profile_approved',
        title: '¡Tu perfil fue aprobado!',
        message: 'Tu perfil ha sido aprobado manualmente y ya está visible en la plataforma.',
        link: `/perfiles/${profile._id}`,
        metadata: { profileId: profile._id.toString() },
      });
    }

    return NextResponse.json({
      message: 'Perfil aprobado y publicado exitosamente.',
      profileId: profile._id,
      isPublished: profile.isPublished,
      approvalStatus: profile.approvalStatus,
    });
  } catch (error) {
    console.error('Error en POST /admin/force-approve-profile:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
