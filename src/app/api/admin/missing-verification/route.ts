import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { User } from '@/models/User';
import { EmailVerification } from '@/models/EmailVerification';
import { Profile } from '@/models/Profile';

// Endpoint temporal: GET /api/admin/missing-verification
// Devuelve usuarios que no tienen `emailVerified` y/o no tienen un token
// de verificación reciente (24h). Requiere autenticación de admin.
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const admin = await User.findById(userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Encontrar usuarios que no verificaron el email
    const unverifiedUsers = await User.find({ emailVerified: false }).select('email createdAt');

    const results = [] as any[];
    const now = new Date();
    for (const u of unverifiedUsers) {
      const lastToken = await EmailVerification.findOne({ userId: u._id }).sort({ createdAt: -1 });
      const hasRecentToken = lastToken && (now.getTime() - new Date(lastToken.createdAt).getTime()) <= 24 * 60 * 60 * 1000;
      const profile = await Profile.findOne({ userId: u._id }).select('_id verification.isVerified isPublished approvalStatus');

      results.push({
        userId: u._id,
        email: u.email,
        createdAt: u.createdAt,
        lastVerificationToken: lastToken ? { createdAt: lastToken.createdAt, used: lastToken.used } : null,
        hasRecentToken,
        profile: profile ? {
          id: profile._id,
          verification: profile.verification,
          isPublished: profile.isPublished,
          approvalStatus: profile.approvalStatus,
        } : null,
      });
    }

    return NextResponse.json({ count: results.length, results }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /admin/missing-verification:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
