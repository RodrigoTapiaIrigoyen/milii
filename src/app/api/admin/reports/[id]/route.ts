import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Report from '@/models/Report';
import { Profile } from '@/models/Profile';
import Sanction from '@/models/Sanction';
import { createNotification } from '@/lib/shared/notifications';

interface Params {
  params: {
    id: string;
  };
}

// PUT: Actualizar estado de un reporte y tomar acción
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { status, action, actionTaken, banProfile, banDays } = await req.json();

    // Validación
    if (!status || !['reviewing', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar reporte
    report.status = status;
    report.actionTaken = actionTaken || action;
    report.reviewedBy = auth.user.id;
    report.reviewedAt = new Date();
    await report.save();

    // Si se resolvió y se decidió banear el perfil
    if (status === 'resolved' && banProfile) {
      const profile = await Profile.findById(report.reportedProfileId);
      if (profile) {
        // Desactivar perfil
        profile.status.isActive = false;
        profile.status.reason = actionTaken || 'Perfil suspendido por violación de políticas';
        await profile.save();

        // Crear sanción
        const banUntil = banDays
          ? new Date(Date.now() + banDays * 24 * 60 * 60 * 1000)
          : undefined;

        await Sanction.create({
          userId: report.reportedUserId,
          type: banDays ? 'temporary_ban' : 'warning',
          reason: actionTaken || 'Múltiples reportes confirmados',
          duration: banDays ? `${banDays} días` : undefined,
          expiresAt: banUntil,
        });

        // Notificar al usuario afectado
        try {
          await createNotification({
            userId: report.reportedUserId.toString(),
            type: 'general',
            title: '⚠️ Acción Moderativa',
            message: `Tu perfil ha sido desactivado. Razón: ${actionTaken || 'Violación de políticas'}`,
            link: '/dashboard/perfil',
          });
        } catch (notifError) {
          console.error('Error al notificar usuario sancionado:', notifError);
        }
      }
    }

    // Si se desestimó, reactivar el perfil si estaba oculto por múltiples reportes
    if (status === 'dismissed') {
      const profile = await Profile.findById(report.reportedProfileId);
      if (profile && !profile.status.isActive && profile.status.reason?.includes('Múltiples reportes')) {
        const pendingReports = await Report.countDocuments({
          reportedProfileId: report.reportedProfileId,
          status: { $in: ['pending', 'reviewing'] },
        });

        // Si ya no hay reportes pendientes, reactivar
        if (pendingReports === 0) {
          profile.status.isActive = true;
          profile.status.reason = undefined;
          await profile.save();

          // Notificar reactivación
          try {
            await createNotification({
              userId: report.reportedUserId.toString(),
              type: 'general',
              title: '✅ Perfil Reactivado',
              message: 'Tu perfil ha sido reactivado después de revisar los reportes.',
              link: '/dashboard/perfil',
            });
          } catch (notifError) {
            console.error('Error al notificar reactivación:', notifError);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Reporte actualizado exitosamente',
      report,
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reporte' },
      { status: 500 }
    );
  }
}

// GET: Obtener detalles de un reporte específico
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { id } = params;
    const report = await Report.findById(id)
      .populate('reporterId', 'email')
      .populate('reportedUserId', 'email')
      .populate('reportedProfileId')
      .populate('reviewedBy', 'email');

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // Obtener otros reportes del mismo perfil
    const relatedReports = await Report.find({
      reportedProfileId: report.reportedProfileId,
      _id: { $ne: report._id },
    })
      .populate('reporterId', 'email')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      report,
      relatedReports,
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    return NextResponse.json(
      { error: 'Error al obtener reporte' },
      { status: 500 }
    );
  }
}
