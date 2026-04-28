import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// GET - Listar todos los perfiles (admin)
// =============================================
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const approvalStatus = searchParams.get('approvalStatus');

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }

    const skip = (page - 1) * limit;

    // Para la cola de verificación, ordenar: VIP → priority → normal, luego por fecha
    const sortQuery: any = approvalStatus === 'pending_review'
      ? { verificationPriority: -1, submittedAt: 1 }  // -1 en string: vip > priority > normal
      : { submittedAt: -1, createdAt: -1 };

    const profiles = await Profile.find(query)
      .populate('userId', 'email')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Profile.countDocuments(query);

    return NextResponse.json(
      {
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /admin/profiles:', error);
    return NextResponse.json({ error: 'Error al obtener perfiles' }, { status: 500 });
  }
}
