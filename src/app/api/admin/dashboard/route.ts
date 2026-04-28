import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { Subscription } from '@/models/Subscription';
import { Payment } from '@/models/Payment';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// GET - Panel de administración (solo admin)
// =============================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que es admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Obtener estadísticas
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const publishedProfiles = await Profile.countDocuments({ status: 'published' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const verifiedProfiles = await Profile.countDocuments({ isVerified: true });
    const pendingVerifications = await Profile.countDocuments({ 
      status: 'published', 
      isVerified: false 
    });
    const pendingApprovals = await Profile.countDocuments({ approvalStatus: 'pending_review' });

    // Calcular ingreso total
    const payments = await Payment.find({ status: 'approved' });
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Perfiles recientes
    const recentProfiles = await Profile.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'email');

    // Usuarios recientes
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password');

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          totalProfiles,
          publishedProfiles,
          activeSubscriptions,
          verifiedProfiles,
          pendingVerifications,
          pendingApprovals,
          totalRevenue,
        },
        recentProfiles,
        recentUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de administración' },
      { status: 500 }
    );
  }
}
