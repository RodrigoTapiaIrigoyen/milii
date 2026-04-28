import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';
import { AdminLog } from '@/models/AdminLog';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const adminId = await getUserFromRequest(req);
    if (!adminId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que es admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sin permisos' },
        { status: 403 }
      );
    }

    const { action } = await req.json();
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Ejecutar acción
    if (action === 'suspend') {
      user.status = 'suspended';
      user.isActive = false;
      await user.save();

      // Log de administración
      await AdminLog.create({
        adminId,
        action: 'suspend_user',
        targetModel: 'User',
        targetId: user._id,
        details: `Suspendido: ${user.email}`
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario suspendido'
      });
    } else if (action === 'ban') {
      user.status = 'banned';
      user.isActive = false;
      await user.save();

      // Despublicar todos sus perfiles
      await Profile.updateMany(
        { userId: user._id },
        { isPublished: false, 'status.isActive': false }
      );

      // Log de administración
      await AdminLog.create({
        adminId,
        action: 'ban_user',
        targetModel: 'User',
        targetId: user._id,
        details: `Baneado: ${user.email}`
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario baneado'
      });
    } else if (action === 'activate') {
      user.status = 'active';
      user.isActive = true;
      await user.save();

      // Log de administración
      await AdminLog.create({
        adminId,
        action: 'activate_user',
        targetModel: 'User',
        targetId: user._id,
        details: `Activado: ${user.email}`
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario activado'
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error al gestionar usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al gestionar usuario' },
      { status: 500 }
    );
  }
}
