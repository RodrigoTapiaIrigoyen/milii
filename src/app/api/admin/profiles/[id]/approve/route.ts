import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { AdminLog } from '@/models/AdminLog';
import { getUserFromRequest } from '@/lib/auth';
import { createNotification } from '@/lib/shared/notifications';

// =============================================
// POST - Aprobar o rechazar un perfil (solo admin)
// Body: { action: 'approve' | 'reject', notes?: string }
// =============================================
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const adminUserId = await getUserFromRequest(req);
    if (!adminUserId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { action, notes } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Use "approve" o "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && (!notes || notes.trim().length < 10)) {
      return NextResponse.json(
        { error: 'Debes proporcionar un motivo de rechazo (mínimo 10 caracteres)' },
        { status: 400 }
      );
    }

    const profile = await Profile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    if (profile.approvalStatus !== 'pending_review') {
      return NextResponse.json(
        { error: `El perfil no está en revisión. Estado actual: ${profile.approvalStatus}` },
        { status: 409 }
      );
    }

    const profileOwnerId = profile.userId.toString();

    if (action === 'approve') {
      profile.approvalStatus = 'approved';
      profile.approvedAt = new Date();
      profile.approvedBy = adminUserId as any;
      profile.approvalNotes = notes || '';
      profile.isPublished = true;
      profile.publishedAt = new Date();

      await profile.save();

      // Notificar al usuario: aprobado
      await createNotification({
        userId: profileOwnerId,
        type: 'profile_approved',
        title: '¡Tu perfil fue aprobado!',
        message:
          'Tu perfil fue revisado y aprobado por nuestro equipo. Ya está visible para todos los usuarios.',
        link: `/perfiles/${profile._id}`,
        metadata: { profileId: profile._id.toString() },
      });

      await AdminLog.create({
        adminId: adminUserId,
        action: 'approve_profile',
        targetType: 'profile',
        targetId: profile._id,
        details: `Aprobó perfil de "${profile.name}"${notes ? `. Notas: ${notes}` : ''}`,
      });

      return NextResponse.json(
        { message: 'Perfil aprobado y publicado exitosamente', approvalStatus: 'approved' },
        { status: 200 }
      );
    }

    // action === 'reject'
    profile.approvalStatus = 'rejected';
    profile.approvalNotes = notes.trim();
    profile.isPublished = false;

    await profile.save();

    // Notificar al usuario: rechazado con motivo
    await createNotification({
      userId: profileOwnerId,
      type: 'profile_rejected',
      title: 'Tu perfil no fue aprobado',
      message: `Tu perfil fue revisado pero no cumple con nuestras políticas. Motivo: ${notes.trim()}. Puedes corregirlo y enviarlo nuevamente.`,
      link: '/dashboard/perfil',
      metadata: { profileId: profile._id.toString(), reason: notes.trim() },
    });

    await AdminLog.create({
      adminId: adminUserId,
      action: 'reject_profile',
      targetType: 'profile',
      targetId: profile._id,
      details: `Rechazó perfil de "${profile.name}". Motivo: ${notes.trim()}`,
    });

    return NextResponse.json(
      { message: 'Perfil rechazado. El usuario fue notificado.', approvalStatus: 'rejected' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /admin/profiles/[id]/approve:', error);
    return NextResponse.json({ error: 'Error al procesar la aprobación' }, { status: 500 });
  }
}
