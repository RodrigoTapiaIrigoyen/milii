import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Report from '@/models/Report';

// GET: Obtener todos los reportes (admin)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir filtro
    const filter: any = {};
    if (status && ['pending', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      filter.status = status;
    }

    // Obtener reportes con información poblada
    const reports = await Report.find(filter)
      .populate('reporterId', 'email')
      .populate('reportedUserId', 'email')
      .populate('reportedProfileId', 'name category city photos status')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Contar total
    const total = await Report.countDocuments(filter);

    // Estadísticas
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        pending: stats.find(s => s._id === 'pending')?.count || 0,
        reviewing: stats.find(s => s._id === 'reviewing')?.count || 0,
        resolved: stats.find(s => s._id === 'resolved')?.count || 0,
        dismissed: stats.find(s => s._id === 'dismissed')?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return NextResponse.json(
      { error: 'Error al obtener reportes' },
      { status: 500 }
    );
  }
}
