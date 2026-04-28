import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';

// PUT - Marcar todas las notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al marcar todas las notificaciones' },
      { status: 500 }
    );
  }
}
