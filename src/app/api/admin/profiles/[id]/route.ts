import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { AdminLog } from '@/models/AdminLog';
import { getUserFromRequest } from '@/lib/auth';
import { createNotification } from '@/lib/shared/notifications';

// =============================================
// PUT - Actualizar estado de perfil (admin)
// =============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que es admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data = await req.json();
    const { status, isVerified, isFeatured, isPremium, action } = data;

    const profile = await Profile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Actualizar campos
    const changes: string[] = [];
    if (status && status !== profile.status) {
      profile.status = status;
      changes.push(`status: ${status}`);
    }
    if (action === 'feature') {
      if (!profile.isFeatured) {
        profile.isFeatured = true;
        changes.push('destacado: true');
      }
    }
    if (action === 'verify') {
      if (!profile.verification?.isVerified) {
        profile.verification = {
          ...profile.verification,
          isVerified: true,
          verifiedAt: new Date(),
        };
        changes.push('verification.isVerified: true');
      }

      if (!profile.isPublished) {
        profile.approvalStatus = 'approved';
        profile.approvedAt = new Date();
        profile.approvedBy = userId as any;
        profile.isPublished = true;
        profile.publishedAt = new Date();
        changes.push('approvalStatus: approved', 'isPublished: true');
      }
    }
    if (isVerified !== undefined && isVerified !== profile.verification?.isVerified) {
      profile.verification = {
        ...profile.verification,
        isVerified,
        verifiedAt: isVerified ? new Date() : undefined,
      };
      changes.push(`verification.isVerified: ${isVerified}`);
    }
    if (isFeatured !== undefined && isFeatured !== profile.isFeatured) {
      profile.isFeatured = isFeatured;
      changes.push(`destacado: ${isFeatured}`);
    }
    if (isPremium !== undefined && isPremium !== profile.isPremium) {
      profile.isPremium = isPremium;
      changes.push(`premium: ${isPremium}`);
    }

    await profile.save();

    // Crear log de administración
    if (changes.length > 0) {
      await AdminLog.create({
        adminId: userId,
        action: 'update_profile',
        targetType: 'profile',
        targetId: profile._id,
        details: `Actualizó perfil: ${changes.join(', ')}`,
      });
    }

    if (action === 'verify' && changes.length > 0 && profile.userId) {
      await createNotification({
        userId: profile.userId.toString(),
        type: 'profile_approved',
        title: 'Tu perfil ha sido aprobado',
        message: 'Hemos verificado tu perfil y ya está publicado en PlacerLux.',
        link: `/perfiles/${profile._id}`,
        metadata: { profileId: profile._id.toString() },
      });
    }

    return NextResponse.json(
      {
        message: 'Perfil actualizado exitosamente',
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en PUT /admin/profiles/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}

// =============================================
// DELETE - Eliminar perfil (admin)
// =============================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que es admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const profile = await Profile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const profileTitle = profile.title;
    await profile.deleteOne();

    // Crear log de administración
    await AdminLog.create({
      adminId: userId,
      action: 'delete_profile',
      targetType: 'profile',
      targetId: params.id,
      details: `Eliminó perfil: ${profileTitle}`
    });

    return NextResponse.json(
      { message: 'Perfil eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /admin/profiles/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar perfil' }, { status: 500 });
  }
}
