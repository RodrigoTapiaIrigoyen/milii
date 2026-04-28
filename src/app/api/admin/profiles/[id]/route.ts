import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { AdminLog } from '@/models/AdminLog';
import { getUserFromRequest } from '@/lib/auth';

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
    const { status, isVerified, isFeatured, isPremium } = data;

    const profile = await Profile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Actualizar campos
    const changes = [];
    if (status && status !== profile.status) {
      profile.status = status;
      changes.push(`status: ${status}`);
    }
    if (isVerified !== undefined && isVerified !== profile.isVerified) {
      profile.isVerified = isVerified;
      changes.push(`verificado: ${isVerified}`);
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
        details: `Actualizó perfil: ${changes.join(', ')}`
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
