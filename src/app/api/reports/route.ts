import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Report from '@/models/Report';
import { Profile } from '@/models/Profile';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Verificar autenticación
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { profileId, category, reason } = await req.json();

    // Validación
    if (!profileId || !category || !reason) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (reason.length < 10 || reason.length > 1000) {
      return NextResponse.json(
        { error: 'La razón debe tener entre 10 y 1000 caracteres' },
        { status: 400 }
      );
    }

    const validCategories = ['inappropriate_content', 'fake_profile', 'spam', 'harassment', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // No permitir reportar su propio perfil
    if (profile.userId.toString() === auth.user.id) {
      return NextResponse.json(
        { error: 'No puedes reportar tu propio perfil' },
        { status: 400 }
      );
    }

    // Verificar si ya reportó este perfil recientemente (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReport = await Report.findOne({
      reporterId: auth.user.id,
      reportedProfileId: profileId,
      createdAt: { $gte: oneDayAgo },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Ya has reportado este perfil recientemente' },
        { status: 429 }
      );
    }

    // Crear reporte
    const report = await Report.create({
      reporterId: auth.user.id,
      reportedProfileId: profileId,
      reportedUserId: profile.userId,
      category,
      reason,
      status: 'pending',
    });

    // Contar cuántos reportes tiene este perfil
    const reportCount = await Report.countDocuments({
      reportedProfileId: profileId,
      status: { $in: ['pending', 'reviewing'] },
    });

    // Si el perfil tiene 3 o más reportes activos, ocultarlo automáticamente
    if (reportCount >= 3 && profile.status.isActive) {
      profile.status.isActive = false;
      profile.status.reason = 'Múltiples reportes recibidos - En revisión';
      await profile.save();
    }

    return NextResponse.json(
      {
        message: 'Reporte enviado exitosamente. Será revisado por nuestro equipo.',
        report: {
          id: report._id,
          category: report.category,
          status: report.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear reporte:', error);
    return NextResponse.json(
      { error: 'Error al procesar el reporte' },
      { status: 500 }
    );
  }
}

// Obtener reportes del usuario actual (sus reportes enviados)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const reports = await Report.find({ reporterId: auth.user.id })
      .populate('reportedProfileId', 'name category city photos')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return NextResponse.json(
      { error: 'Error al obtener reportes' },
      { status: 500 }
    );
  }
}
